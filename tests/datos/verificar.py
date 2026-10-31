"""Pruebas reales PostgreSQL, stdlib + Docker. Solo crea recursos sintéticos propios.
Ejecutar: python3 tests/datos/verificar.py
Sin DSN, proyectos Supabase remotos, puertos publicados ni credenciales.
"""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[2]
IMAGE = 'postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f'
NAME = 'inventarioti2-fase4-test-' + uuid.uuid4().hex[:10]
ACTOR = '00000000-0000-4000-8000-000000000010'
F1 = '00000000-0000-4000-8000-000000000101'
F2 = '00000000-0000-4000-8000-000000000102'
B1 = '00000000-0000-4000-8000-000000000201'
B2 = '00000000-0000-4000-8000-000000000202'
U1 = '00000000-0000-4000-8000-000000000001'
U2 = '00000000-0000-4000-8000-000000000002'
COUNT = 0

def run(args, data=None, check=True):
    return subprocess.run(args, input=data, capture_output=True, check=check)

def sql(query, database='prueba', ok=True):
    p = run(['docker','exec','-i',NAME,'psql','-X','-qAt','-v','ON_ERROR_STOP=1',
             '-U','postgres','-d',database], ('set timezone=\'UTC\'; set search_path=inventario,pg_catalog;\n'+query).encode(), check=False)
    if ok and p.returncode:
        raise AssertionError(p.stderr.decode())
    return p

def expect(name, query, error):
    global COUNT
    p=sql(query,ok=False)
    assert p.returncode and error in p.stderr.decode(), (name,p.stdout.decode(),p.stderr.decode())
    COUNT+=1
    print('PASS:',name,flush=True)

def assertq(name, query, value):
    global COUNT
    p=sql(query)
    assert p.stdout.decode().strip()==value, (name,p.stdout.decode())
    COUNT+=1
    print('PASS:',name,flush=True)

def command(key=None):
    key=key or str(uuid.uuid4())
    return f"insert into comandos(id,actor_id,operacion,recurso,clave,huella,resultado) values ('{key}','{ACTOR}','prueba','bien','{key}',repeat('a',64),'{{}}');",key

def opening(bien,person,sleep=False):
    cmd,key=command()
    return f"""begin; {cmd}
    insert into movimientos(bien_id,tipo,destino_id,actor_id,comando_id,motivo,efectiva_en)
    values ('{bien}','asignacion','{person}','{ACTOR}','{key}','Prueba sintética','2000-01-01Z') returning id \\gset
    insert into custodias(bien_id,funcionario_id,inicio_en,apertura_id)
    values ('{bien}','{person}',clock_timestamp(),:id);
    {"select pg_sleep(0.4);" if sleep else ""}
    commit;"""

def migrate():
    sql('''create schema if not exists migraciones;
    revoke all on schema migraciones from public;
    create table if not exists migraciones.versiones(nombre text primary key, sha256 text not null);
    alter table migraciones.versiones enable row level security;''')
    for path in sorted((ROOT/'supabase/migrations').glob('*.sql')):
        sha=hashlib.sha256(path.read_bytes()).hexdigest()
        old=sql(f"select sha256 from migraciones.versiones where nombre='{path.name}'").stdout.decode().strip()
        if old:
            assert old==sha, 'No reescribir migraciones aplicadas'
            continue
        text=path.read_text()
        assert text.rstrip().endswith('commit;')
        text=text.rstrip()[:-7]+f"insert into migraciones.versiones values ('{path.name}','{sha}');\ncommit;"
        sql(text)

try:
    run(['docker','run','-d','--name',NAME,'--network','none',
         '-e','POSTGRES_HOST_AUTH_METHOD=trust','-e','POSTGRES_DB=prueba',IMAGE])
    for _ in range(60):
        if run(['docker','exec',NAME,'pg_isready','-h','127.0.0.1','-U','postgres'],check=False).returncode==0:
            break
        time.sleep(0.5)
    else: raise RuntimeError('PostgreSQL no estuvo listo en 30 s')
    print('Motor:',sql('select version()').stdout.decode().strip(),flush=True)
    migrate(); migrate()
    assertq('migración versionada aplicada una vez','select count(*) from migraciones.versiones','1')
    sql((ROOT/'db/seed_prueba.sql').read_text())
    assertq('RUT normalizado y módulo 11',f"select documento_normalizado from funcionarios where id='{F2}'",'123456785')
    expect('rechaza RUT inválido',f"insert into funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('RUT','12.345.678-9','X','X','{U1}')",'check constraint')
    expect('ID normalizado único',f"insert into funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('ID','demo-001','X','X','{U1}')",'unique constraint')
    sql(f"update funcionarios set activo=false where id='{F1}'")
    expect('identidad única incluso inactiva',f"insert into funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('ID','DEMO-001','X','X','{U1}')",'unique constraint')
    sql(f"update funcionarios set activo=true where id='{F1}'; update bienes set situacion='baja' where id='{B1}'")
    expect('código único incluso en baja',"insert into bienes(codigo,serie,tipo,marca,modelo,condicion) values(' demo-001 ','X','X','X','X','bueno')",'unique constraint')
    expect('serie normalizada única',"insert into bienes(codigo,serie,tipo,marca,modelo,condicion) values('NUEVO',' serie-demo-001 ','X','X','X','bueno')",'unique constraint')
    expect('ausencia de serie exige motivo',"insert into bienes(codigo,tipo,marca,modelo,condicion) values('NUEVO','X','X','X','bueno')",'check constraint')
    expect('baja impide asignación',opening(B1,F1),'CUSTODIA_NO_ADMISIBLE')
    sql(f"update bienes set situacion='activo',condicion='malo' where id='{B1}'")
    expect('malo impide asignación',opening(B1,F1),'CUSTODIA_NO_ADMISIBLE')
    sql(f"update bienes set condicion='bueno' where id='{B1}'; update funcionarios set activo=false where id='{F1}'")
    expect('funcionario inactivo impide asignación',opening(B1,F1),'CUSTODIA_NO_ADMISIBLE')
    sql(f"update funcionarios set activo=true where id='{F1}'")
    # Dos transacciones realmente simultáneas contra un mismo bien.
    with concurrent.futures.ThreadPoolExecutor(2) as pool:
        results=list(pool.map(lambda f:sql(opening(B1,f,True),ok=False),[F1,F2]))
    assert sorted(p.returncode==0 for p in results)==[False,True], [p.stderr.decode() for p in results]
    COUNT+=1; print('PASS: doble asignación concurrente, exactamente un commit',flush=True)
    assertq('una custodia vigente',f"select count(*) from custodias where bien_id='{B1}' and fin_en is null",'1')
    assertq('fecha efectiva del servidor, no retroactiva',"select bool_and(efectiva_en > '2026-01-01Z') from movimientos",'t')
    custodian=sql(f"select funcionario_id from custodias where bien_id='{B1}' and fin_en is null").stdout.decode().strip()
    expect('baja de bien asignado rechazada',f"update bienes set situacion='baja' where id='{B1}'",'BIEN_CON_CUSTODIA')
    expect('baja de custodio rechazada',f"update funcionarios set activo=false where id='{custodian}'",'FUNCIONARIO_CON_BIENES')
    sql(f"update bienes set condicion='malo' where id='{B1}'")
    assertq('cambiar a malo conserva custodio',f"select count(*) from custodias where bien_id='{B1}' and fin_en is null",'1')
    expect('historia no editable','update movimientos set motivo=\'Alterado\'','EVIDENCIA_INMUTABLE')
    expect('historia no borrable','delete from movimientos','EVIDENCIA_INMUTABLE')
    expect('historia no truncable','truncate movimientos cascade','EVIDENCIA_INMUTABLE')
    expect('maestros exigen baja lógica',f"delete from bienes where id='{B2}'",'BAJA_LOGICA_REQUERIDA')
    cmd,key=command()
    sql(f"""begin; {cmd}
    insert into movimientos(bien_id,tipo,origen_id,actor_id,comando_id,motivo)
    values('{B1}','devolucion','{custodian}','{ACTOR}','{key}','Devolución sintética') returning id \\gset
    update custodias set fin_en=clock_timestamp(),cierre_id=:id where bien_id='{B1}' and fin_en is null;
    commit;""")
    assertq('devolución de bien malo permitida',f"select count(*) from custodias where bien_id='{B1}' and fin_en is null",'0')
    expect('intervalo cerrado no reescribible',"update custodias set fin_en=fin_en+interval '1 day'",'CUSTODIA_SOLO_CIERRE')
    # Unidad actual deriva del funcionario; las instantáneas no se alteran por renombrar.
    old=sql('select unidad_destino_nombre from movimientos where tipo=\'asignacion\'').stdout
    sql("update unidades set nombre=nombre||' renombrada'")
    assert sql('select unidad_destino_nombre from movimientos where tipo=\'asignacion\'').stdout==old
    COUNT+=1; print('PASS: renombrar unidad conserva instantánea histórica',flush=True)
    sql(f"update unidades set activa=false where id='{U2}'")
    expect('unidad inactiva rechaza nueva pertenencia',f"insert into funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('ID','NUEVO','X','X','{U2}')",'UNIDAD_INACTIVA')
    # Traslado: cerrar y abrir en el mismo instante, una única transacción.
    sql(f"update bienes set condicion='bueno' where id='{B1}'; update unidades set activa=true where id='{U2}'")
    sql(opening(B1,F1))
    cmd,transfer=command()
    sql(f"""begin; {cmd}
    insert into movimientos(bien_id,tipo,origen_id,destino_id,actor_id,comando_id,motivo)
    values('{B1}','traslado','{F1}','{F2}','{ACTOR}','{transfer}','Traslado sintético') returning id \\gset
    update custodias set fin_en=clock_timestamp(),cierre_id=:id where bien_id='{B1}' and fin_en is null;
    insert into custodias(bien_id,funcionario_id,inicio_en,apertura_id) values('{B1}','{F2}',clock_timestamp(),:id);
    commit;""")
    assertq('traslado conserva intervalos contiguos',f"select c.fin_en=n.inicio_en from custodias c join custodias n on c.cierre_id=n.apertura_id where n.bien_id='{B1}'",'t')
    sql(f"update funcionarios set unidad_id='{U1}' where id='{F2}'")
    assertq('cambio de unidad conserva custodia',f"select f.unidad_id from custodias c join funcionarios f on f.id=c.funcionario_id where c.bien_id='{B1}' and c.fin_en is null",U1)
    assertq('traslado conserva unidad histórica previa',f"select unidad_destino_id from movimientos where comando_id='{transfer}'",U2)
    cmd,annotation=command()
    sql(f"""{cmd} insert into anotaciones(movimiento_id,actor_id,comando_id,texto,motivo)
    select id,'{ACTOR}','{annotation}','Corrección sintética','Aclaración' from movimientos where comando_id='{transfer}';""")
    expect('anotación correctiva inmutable',"delete from anotaciones",'EVIDENCIA_INMUTABLE')
    # Competencia entre baja de funcionario y nueva asignación: no puede quedar inactivo con bienes.
    with concurrent.futures.ThreadPoolExecutor(2) as pool:
        futures=[pool.submit(sql,opening(B2,F1,True),ok=False),
                 pool.submit(sql,f"begin; update funcionarios set activo=false where id='{F1}'; commit;",ok=False)]
        results=[f.result() for f in futures]
    assert sorted(p.returncode==0 for p in results)==[False,True], [p.stderr.decode() for p in results]
    COUNT+=1; print('PASS: baja y asignación concurrentes preservan invariancia',flush=True)
    assertq('ningún inactivo con custodia',"select count(*) from custodias c join funcionarios f on f.id=c.funcionario_id where c.fin_en is null and not f.activo",'0')
    # FK real, independiente del control de unidad activa.
    expect('FK de actor rechaza referencia inexistente',f"insert into comandos(actor_id,operacion,recurso,clave,huella,resultado) values('{uuid.uuid4()}','prueba','x','{uuid.uuid4()}',repeat('b',64),'{{}}')",'foreign key constraint')
    # Bundle atómico con auditoría, outbox y resultado durable. El servicio futuro lo coordina.
    cmd,key=command()
    bundle=f"""{cmd}
    update bienes set observaciones='Transacción sintética' where id='{B2}';
    insert into auditoria(actor_id,comando_id,entidad,entidad_ref,accion,motivo)
    values('{ACTOR}','{key}','bien','{B2}','edicion','Prueba') returning id \\gset
    insert into outbox(auditoria_id,destinatario,proposito) values(:id,'encargado@example.invalid','cambio');"""
    sql('begin;'+bundle+'rollback;')
    assertq('rollback conjunto sin evidencia ni outbox',f"select (select count(*) from comandos where id='{key}')+(select count(*) from auditoria)+(select count(*) from outbox)",'0')
    sql('begin;'+bundle+'commit;')
    expect('idempotencia persistente no duplica',cmd,'unique constraint')
    expect('resultado idempotente inmutable',f"update comandos set resultado='{{\"otro\":1}}' where id='{key}'",'EVIDENCIA_INMUTABLE')
    expect('auditoría inmutable',"update auditoria set motivo='Cambio'",'EVIDENCIA_INMUTABLE')
    expect('destinatario fijado al confirmar',"update outbox set destinatario='otro@example.invalid'",'DESTINATARIO_EVENTO_INMUTABLE')
    expect('aviso lógico único',"insert into outbox(auditoria_id,destinatario,proposito) select auditoria_id,destinatario,proposito from outbox",'unique constraint')
    expect('FK rechaza entidad inexistente',f"insert into funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('ID','HUERFANO','X','X','{uuid.uuid4()}')",'UNIDAD_INACTIVA')
    assertq('13 tablas con RLS sin políticas',"select count(*) from pg_class where relnamespace='inventario'::regnamespace and relkind='r' and relrowsecurity",'13')
    assertq('ninguna función SECURITY DEFINER',"select count(*) from pg_proc where pronamespace='inventario'::regnamespace and prosecdef",'0')
    # Rol sintético solo de test para verificar el cierre por defecto, no roles de producción.
    sql('create role prueba_sin_acceso nologin;')
    expect('acceso directo denegado por defecto','set role prueba_sin_acceso; select * from inventario.bienes','permission denied')
    sql((ROOT/'db/consultas.sql').read_text())
    COUNT+=1; print('PASS: consultas clave ejecutadas',flush=True)
    assertq('FK indexadas por primera columna',"""select count(*) from pg_constraint c where c.contype='f'
    and c.connamespace='inventario'::regnamespace and not exists(select 1 from pg_index i
    where i.indrelid=c.conrelid and i.indkey[0]=c.conkey[1])""",'0')
    assertq('rango UTC incluye inicio y excluye día posterior',"""select count(*) from
    (values (timestamptz '2026-10-31 00:00:00+00'),(timestamptz '2026-10-31 23:59:59.999999+00'),
    (timestamptz '2026-11-01 00:00:00+00')) v(fecha)
    where fecha >= timestamptz '2026-10-31 00:00:00+00' and fecha < timestamptz '2026-11-01 00:00:00+00'""",'2')
    # Backup lógico/restauración completa de este esquema sintético en otra DB nueva.
    dump=run(['docker','exec',NAME,'pg_dump','-U','postgres','-d','prueba','-Fc','--no-owner','--no-acl']).stdout
    sql('create database restaurada;')
    run(['docker','exec','-i',NAME,'pg_restore','-U','postgres','-d','restaurada','--exit-on-error','--no-owner','--no-acl'],dump)
    # Comparar contenido de todas las tablas (incluyendo timestamps, ledger y secuencias).
    tables=sql("select tablename from pg_tables where schemaname in ('inventario','migraciones') order by schemaname,tablename").stdout.decode().splitlines()
    for table in tables:
        schema='migraciones' if table=='versiones' else 'inventario'
        query=f"select coalesce(jsonb_agg(x order by x::text),'[]'::jsonb) from (select to_jsonb(t) as x from {schema}.{table} t) q"
        assert sql(query).stdout==sql(query,'restaurada').stdout,table
    expect_result=sql("select count(*) from custodias where fin_en is not null",'restaurada').stdout
    assert int(expect_result.strip())>=1
    restored=sql("update inventario.movimientos set motivo='Alteración'",'restaurada',ok=False)
    assert restored.returncode and b'EVIDENCIA_INMUTABLE' in restored.stderr
    seq="select last_value from inventario.movimientos_id_seq"
    assert sql(seq).stdout==sql(seq,'restaurada').stdout
    COUNT+=1; print(f'PASS: pg_dump/pg_restore, {len(tables)} tablas idénticas, secuencia y triggers restaurados',flush=True)
    print(f'RESULTADO: {COUNT} comprobaciones aprobadas. Sin Auth, API, proveedor de correo ni despliegue.',flush=True)
finally:
    # Únicamente contenedor/volúmenes sintéticos creados por esta ejecución.
    run(['docker','rm','-fv',NAME],check=False)
