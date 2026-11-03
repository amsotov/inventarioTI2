#!/usr/bin/env python3
"""Verifica candidatos Fase 5 sin conexiones ni ejecución SQL.

Biblioteca estándar por defecto. --analizar-sintaxis usa SQLFluff 3.5.0
en el Python invocante (venv externo). El parser no es SQL Server.
"""
from pathlib import Path
from collections import Counter
import argparse
import csv
import hashlib
import importlib.metadata
import io
import json
import re
import runpy
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
DOC = 'docs/migracion/'
MIG = 'migrations/sqlserver/'
BASE = '9f84fcd836550654770bd7ed4191f9edaffe2528'
BOOK_HASH = 'a07ec95b68c35eae358def30ae3723485c202b562d04db465b566801307cef5e'
SQL_NAMES = ['0001_nucleo_diccionario.candidate.sql',
             '0002_checks_propuestos.candidate.sql',
             '0003_indices_fk.candidate.sql', '900_catalogo_esperado.candidate.sql']


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def source_columns():
    book = ROOT / 'docs/modelo-datos/04_DICCIONARIO_DATOS.xlsx'
    require(digest(book.read_bytes()) == BOOK_HASH, 'Fuente Excel alterada')
    reader = runpy.run_path(str(ROOT / DOC / 'verificar_fase1.py'))['worksheets']
    sheet = reader(book)['DICCIONARIO_DATOS']
    result = []
    for n, row in enumerate(sheet[1:], 2):
        field, table, kind, length, pk, fk, ref, null, extra = row[:9]
        kind = kind.upper()
        typ = kind + '(' + length + ')' if kind in ('VARCHAR', 'DECIMAL') else kind
        result.append(dict(tabla=table, campo=field, tipo=typ,
                           permite_null=null == 'SÍ', identity='IDENTITY' in extra,
                           default=extra.split('DEFAULT ', 1)[1] if 'DEFAULT ' in extra else '',
                           fila_excel=n, pk=pk == 'SÍ', fk=fk == 'SÍ', referencia=ref,
                           uq='UNIQUE' in extra, check='CHECK' in extra))
    require(len(result) == 117 and len({x['tabla'] for x in result}) == 30, 'Cobertura Excel')
    return result


def verify_model(columns, overrides=None):
    overrides = overrides or {}

    def read(path):
        return overrides.get(path, (ROOT / path).read_text(encoding='utf-8'))

    def csvrows(path):
        return list(csv.DictReader(io.StringIO(read(DOC + path))))

    scripts = {name: read(MIG + name) for name in SQL_NAMES}
    for name, sql in scripts.items():
        code = re.sub(r'--[^\n]*', '', sql).strip()
        require(re.match(r"^;THROW 51050, N'[^']+', 1;", code), 'Barrera incondicional: ' + name)
        require("IF ISNULL(TRY_CONVERT(INT, SERVERPROPERTY('ProductMajorVersion')), 0) <> 13" in code,
                'Guardia motor real 2016/13.x: ' + name)
        require('IF ISNULL((SELECT compatibility_level FROM sys.databases WHERE database_id = DB_ID()), 0) <> 130' in code,
                'Guardia compatibility_level 130: ' + name)
        require('IF DB_ID() <= 4' in code, 'Guardia bases de sistema: ' + name)
        require(not re.search(r'\b(?:STRING_AGG|TRIM|TRANSLATE|CONCAT_WS|DATETRUNC|GREATEST|LEAST|JSON_OBJECT|JSON_ARRAY)\s*\(|\bIS\s+(?:NOT\s+)?DISTINCT\s+FROM\b|\b\w+_UTF8\b', code, re.I),
                'Construcción posterior a SQL Server 2016: ' + name)
        require(not re.search(r'^\s*(?:GO|USE)\b', code, re.M | re.I), 'Batch/destino no permitido')
        require(not re.search(r'\b(?:DROP|TRUNCATE|DELETE|UPDATE|MERGE|GRANT|REVOKE|DENY|NOCHECK)\b',
                              re.sub(r'ON DELETE NO ACTION ON UPDATE NO ACTION', '', code), re.I),
                'Operación no permitida: ' + name)
        if name.startswith('000'):
            require('SET XACT_ABORT ON;' in code and 'BEGIN TRANSACTION;' in code and
                    'COMMIT TRANSACTION;' in code and 'BEGIN CATCH' in code and
                    'IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;' in code and
                    "@LockOwner = N'Transaction'" in code and 'sys.sp_getapplock' in code,
                    'Transacción/bloqueo incompletos: ' + name)
            require(not re.search(r'\b(?:INSERT|EXECUTE|CREATE\s+(?:LOGIN|USER|DATABASE|TRIGGER|PROCEDURE))\b', code, re.I),
                    'Fuera de DDL candidato: ' + name)

    sql = scripts[SQL_NAMES[0]]
    blocks = re.findall(r'CREATE TABLE \[dbo\]\.\[(\w+)\] \(\n(.*?)\n    \);', sql, re.S)
    require(len(blocks) == 30 and len({x[0] for x in blocks}) == 30, 'Cobertura tablas DDL')
    actual, actual_pk, actual_uq = {}, {}, set()
    for table, block in blocks:
        for line in block.splitlines():
            line = line.strip().removesuffix(',')
            if line.startswith('['):
                match = re.fullmatch(r'\[(\w+)\] ([A-Z][A-Z0-9]*(?:\([A-Z0-9]+(?:,[0-9]+)?\))?)( IDENTITY\(1,1\))? (NULL|NOT NULL)(?: CONSTRAINT \[(DF_\w+)\] DEFAULT \((.+)\))?', line)
                require(match, 'Declaración no reconocida: ' + line)
                field, typ, identity, null, default_name, default = match.groups()
                key = (table, field)
                require(key not in actual, 'Campo duplicado')
                require(not default_name or default_name == 'DF_' + table + '_' + field, 'Nombre default')
                actual[key] = (typ, null == 'NULL', bool(identity), default or '')
            elif ' PRIMARY KEY ' in line:
                match = re.fullmatch(r'CONSTRAINT \[PK_' + table + r'\] PRIMARY KEY \((.+)\)', line)
                require(match and table not in actual_pk, 'PK inválida')
                actual_pk[table] = re.findall(r'\[(\w+)\]', match.group(1))
            elif ' UNIQUE ' in line:
                match = re.fullmatch(r'CONSTRAINT \[UQ_' + table + r'_(\w+)\] UNIQUE \(\[(\w+)\]\)', line)
                require(match and match[1] == match[2], 'UQ inválida')
                actual_uq.add((table, match[1]))
            else:
                raise ValueError('Contenido inesperado en CREATE TABLE: ' + line)
    expected = {(r['tabla'], r['campo']): (r['tipo'], r['permite_null'], r['identity'], r['default']) for r in columns}
    require(actual == expected, 'Tipo/NULL/identity/default/columnas difieren del Excel')
    pk = {}
    for r in columns:
        if r['pk']:
            pk.setdefault(r['tabla'], []).append(r['campo'])
    require(actual_pk == pk and sum(map(len, actual_pk.values())) == 31, 'PK/orden compuesto difiere')
    require(actual_uq == {(r['tabla'], r['campo']) for r in columns if r['uq']} and len(actual_uq) == 18, 'UQ difiere')
    fks = re.findall(r'ALTER TABLE \[dbo\]\.\[(\w+)\] WITH CHECK ADD CONSTRAINT \[(FK_\w+)\] FOREIGN KEY \(\[(\w+)\]\) REFERENCES \[dbo\]\.\[(\w+)\] \(\[(\w+)\]\) ON DELETE NO ACTION ON UPDATE NO ACTION;', sql)
    require(len(fks) == 30 and len({x[1] for x in fks}) == 30, 'Número/acciones/confianza FK')
    require({(t, c, p + '.' + pc) for t, name, c, p, pc in fks} ==
            {(r['tabla'], r['campo'], r['referencia']) for r in columns if r['fk']}, 'Referencia FK difiere')
    for t, name, c, p, pc in fks:
        require(name == 'FK_' + t + '_' + c, 'Nombre FK')
        require(actual[(t, c)][0] == actual[(p, pc)][0], 'Tipos FK incompatibles')
    require('IF EXISTS (SELECT 1 FROM sys.tables WHERE is_ms_shipped = 0)' in sql, 'Guardia destino vacío')
    require(not re.search(r'CHECK\s*\(', sql), 'No inventar CHECK en baseline')

    checkrows = csvrows('05_CHECKS_PROPUESTOS.csv')
    require(len(checkrows) == 9 and len({r['id'] for r in checkrows}) == 9, 'Cobertura CHECK')
    require({(r['tabla'], r['campo']) for r in checkrows} ==
            {(r['tabla'], r['campo']) for r in columns if r['check']}, 'CHECK no coincide con campos del Excel')
    check_sql = scripts[SQL_NAMES[1]]
    actual_checks = re.findall(r'ALTER TABLE \[dbo\]\.\[(\w+)\] WITH CHECK ADD CONSTRAINT \[(CK_\w+)\] CHECK \((.*)\);', check_sql)
    require(len(actual_checks) == 9, 'Número CHECK/confianza')
    require(set(actual_checks) == {(r['tabla'], r['nombre'], r['expresion']) for r in checkrows}, 'Expresión CHECK SQL/CSV difiere')
    require(all(r['estado'] == 'PROPUESTA_NO_APROBADA' and 'M1-D14' in r['decisiones'] for r in checkrows), 'CHECK no aprobado no se convierte en aprobado')

    indexrows = csvrows('05_INDICES_PROPUESTOS.csv')
    expected_indexes = {(r['tabla'], r['campo']) for r in columns if r['fk'] and
                        pk[r['tabla']][0] != r['campo'] and not r['uq']}
    require(len(indexrows) == 24 and {(r['tabla'], r['campo']) for r in indexrows} == expected_indexes, 'Índices redundantes/cobertura')
    actual_indexes = re.findall(r'CREATE INDEX \[(IX_\w+)\] ON \[dbo\]\.\[(\w+)\] \(\[(\w+)\]\);', scripts[SQL_NAMES[2]])
    require(len(actual_indexes) == 24 and set(actual_indexes) ==
            {(r['nombre'], r['tabla'], r['campo']) for r in indexrows}, 'DDL índices difiere')
    require(all(r['estado'] == 'PROPUESTA_RENDIMIENTO_NO_MEDIDO' for r in indexrows), 'Índices no medidos')

    catalog = scripts[SQL_NAMES[3]]
    metadata_rows = re.findall(r"\(N'(\w+)', N'(\w+)', N'(\w+)', (-?\d+), (\d+), (\d+), ([01]), ([01])\)", catalog)
    expected_metadata = set()
    for r in columns:
        typ = r['tipo'].split('(')[0].lower()
        storage = {'int': (4, 10, 0), 'bigint': (8, 19, 0), 'smallint': (2, 5, 0),
                   'tinyint': (1, 3, 0), 'bit': (1, 1, 0), 'date': (3, 10, 0),
                   'datetime2': (8, 27, 7)}
        if typ == 'varchar':
            size = r['tipo'].split('(')[1][:-1]
            size, precision, scale = (-1 if size == 'MAX' else int(size)), 0, 0
        elif typ == 'decimal':
            precision, scale = map(int, r['tipo'].split('(')[1][:-1].split(','))
            size = 5  # Ambas precisiones del diccionario son 4; almacenamiento SQL Server 1–9 = 5 bytes.
        else:
            size, precision, scale = storage[typ]
        expected_metadata.add((r['tabla'], r['campo'], typ, str(size), str(precision), str(scale), str(int(r['permite_null'])), str(int(r['identity']))))
    require(len(metadata_rows) == 117 and set(metadata_rows) == expected_metadata, 'Catálogo esperado difiere del Excel')
    metadata_keys = re.findall(r"\(N'(\w+)', '(PK|UQ)', N'(\w+)', (\d+)\)", catalog)
    expected_keys = {(table, 'PK', field, str(n)) for table, names in pk.items() for n, field in enumerate(names, 1)}
    expected_keys |= {(table, 'UQ', field, '1') for table, field in actual_uq}
    require(len(metadata_keys) == 49 and set(metadata_keys) == expected_keys, 'Catálogo esperado de claves difiere')
    metadata_fks = re.findall(r"\(N'(\w+)', N'(\w+)', N'(\w+)', N'(\w+)'\)", catalog)
    require(len(metadata_fks) == 30 and set(metadata_fks) == {(r['tabla'], r['campo'], *r['referencia'].split('.')) for r in columns if r['fk']}, 'Catálogo esperado FK difiere')

    manifest = json.loads(read(MIG + 'manifest.json'))
    provision = json.loads(read(DOC + 'evidencias/fase5/provision_supabase_creado.json'))
    project = provision['nuevo']
    require(provision['decision'] == 'M5-A04' and provision['estado'] == 'PROVISIONADO_VACIO_VERIFICADO'
            and provision['anterior']['name'] == 'inventarioTI' and provision['anterior']['status'] == 'INACTIVE'
            and project['name'] == 'inventarioTI2' and project['status'] == 'ACTIVE_HEALTHY'
            and project['organization_name'] == 'sovicl' and project['region'] == 'sa-east-1'
            and isinstance(project['project_ref'], str) and re.fullmatch(r'[a-z]{20}', project['project_ref'])
            and project['project_ref'] != provision['anterior']['project_ref']
            and project['tablas_aplicacion'] == 0 and provision['plan_organizacion'] == 'free'
            and provision['pruebas_funcionales'] == 'NO_EJECUTADAS_ESQUEMA_APLICACION_NO_INSTALADO', 'Provisión metadata/alcance incorrectos')
    require(manifest['base_git'] == BASE and manifest['estado'] == 'CANDIDATO_EN_REVISION_APLICACION_BLOQUEADA' and
            manifest['entorno_autorizado'] is None and manifest['decisiones_aprobadas'] == [] and
            manifest['datos_migrados'] == 0 and manifest['fase6'] == 'NO_AUTORIZADA', 'Manifiesto no es autorización')
    require(manifest['destino'] == {'producto': 'SQL Server', 'version': '2016', 'product_major_version': 13,
                                  'compatibility_level': 130, 'edicion': None, 'collation': None, 'confirmacion': 'M5-A02'},
            'Destino 2016/130 confirmado; edición/collation siguen pendientes')
    require(manifest['pruebas_iniciales'] == {'proveedor': 'Supabase', 'motor': 'PostgreSQL',
                'proyecto_nombre': 'inventarioTI2', 'project_ref': project['project_ref'], 'solo_datos_sinteticos': True,
                'estado': 'BASELINE_EXISTENTE_SQL_VALIDADA'}, 'Proyecto de pruebas incorrecto/ref no corresponde a evidencia')
    baseline = json.loads(read(DOC + 'evidencias/fase5/ensayo_supabase/resultados.json'))
    pg_manifest = json.loads(read('migrations/supabase-pruebas/manifest.json'))
    require(baseline['project_ref'] == project['project_ref'] == pg_manifest['project_ref'] and
            baseline['alcance'].startswith('Baseline del sistema existente PostgreSQL') and baseline['sql_server'] == 'NO_EJECUTADO', 'No confundir baseline PG con destino SQL Server')
    catalog = baseline['catalogo']
    require(catalog['tablas'] == 19 and catalog['columnas'] == 155 and len(catalog['roles']) == 7 and
            all(catalog[k] == 0 for k in ('tablas_sin_rls', 'roles_inseguros', 'accesos_esquema_navegador', 'funciones_execute_public')) and
            all(not any(r[k] for k in ('login', 'bypassrls', 'createrole', 'createdb', 'superuser', 'conserva_create')) for r in catalog['roles']), 'Catálogo/ACL PostgreSQL no conforme')
    require(baseline['ensayo'] == {'resultado': 'APROBADO', 'casos_sql': 20, 'unidades': 2, 'funcionarios': 3,
            'bienes': 6, 'cuentas': 0, 'sesiones': 0, 'comandos': 0, 'auditoria': 0, 'outbox': 0}, 'Resultado/rollback de ensayo PG')
    require(len(pg_manifest['ddl']) == len(baseline['migraciones_aplicadas']) == 10 and
            sum(bool(x.get('source')) for x in pg_manifest['ddl']) == 8, 'Diez migraciones PG, ocho fuentes existentes')
    native = {x['name']: x['version'] for x in baseline['migraciones_aplicadas']}
    for entry in pg_manifest['ddl']:
        require(entry['remote_version'] == native[entry['name']] and entry['sha256'] == digest(read(entry['adapted']).encode()), 'Hash/versión DDL PG')
        if entry.get('source'):
            require(entry['source_sha256'] == digest(read(entry['source']).encode()), 'Fuente original PG alterada')
    for entry in [pg_manifest['seed'], pg_manifest['test']]:
        require(entry['sha256'] == digest(read(entry['path']).encode()), 'Hash seed/ensayo PG')
    expected_columns = [{k: v for k, v in r.items() if k in ('tabla', 'campo', 'tipo', 'permite_null', 'identity', 'default', 'fila_excel')} for r in columns]
    key = lambda r: (r['tabla'], r['campo'])
    require(sorted(manifest['columnas'], key=key) == sorted(expected_columns, key=key), 'Manifiesto de columnas difiere del Excel')
    require(len(manifest['archivos_sql']) == 4 and {r['path'] for r in manifest['archivos_sql']} == {MIG + s for s in SQL_NAMES}, 'Manifiesto de SQL')
    for entry in manifest['archivos_sql']:
        require(entry['sha256'] == digest(read(entry['path']).encode()) and entry['estado'] == 'CANDIDATO_BLOQUEADO_NO_EJECUTADO', 'Hash/estado de candidato')

    old = csvrows('02_ESQUEMA_ACTUAL.csv')
    support = csvrows('05_SOPORTE_ACTUAL.csv')
    coverage = csvrows('05_PRESERVACION_CAMPOS.csv')
    require(len(support) == 19 and {r['tabla_actual'] for r in support} == {r['tabla'] for r in old}, 'Soporte de 19 tablas')
    require(all(r['estado'] == 'DISENO_PENDIENTE_SIN_DDL' and int(r['campos']) == sum(x['tabla'] == r['tabla_actual'] for x in old) for r in support), 'Estado/conteo soporte')
    require(len(coverage) == 155 and {(r['tabla_actual'], r['campo_actual'], r['tipo_actual']) for r in coverage} ==
            {(r['tabla'], r['campo'], r['tipo_actual']) for r in old}, 'Preservación de 155 campos')
    require(all(r['estado'] == 'PRESERVAR_NO_MIGRADO' for r in coverage), 'Campos no migrados')
    cases = csvrows('05_CASOS_SQLSERVER.csv')
    require(len(cases) == 30 and len({r['id'] for r in cases}) == 30 and
            all(r['estado'] == 'NO_EJECUTADA_ENTORNO_NO_AUTORIZADO' for r in cases), 'Casos futuros no ejecutados')
    return {'tablas': 30, 'columnas': len(actual), 'pk': len(pk), 'componentes_pk': 31,
            'fk': len(fks), 'uq': len(actual_uq), 'identity': sum(r['identity'] for r in columns),
            'defaults': sum(bool(r['default']) for r in columns), 'checks_propuestos': len(checkrows),
            'indices_fk_propuestos': len(indexrows), 'tablas_soporte_sqlserver_sin_ddl': len(support),
            'campos_actuales_preservar': len(coverage), 'casos_sqlserver_no_ejecutados': len(cases),
            'casos_sql_postgresql_ejecutados': 20, 'migraciones_baseline_postgresql': 10}


def negative_checks(columns):
    core = (ROOT / MIG / SQL_NAMES[0]).read_text()
    checks = (ROOT / MIG / SQL_NAMES[1]).read_text()
    indexes = (ROOT / MIG / SQL_NAMES[2]).read_text()
    manifest = json.loads((ROOT / MIG / 'manifest.json').read_text())
    scenarios = [
        ('tipo_alterado', MIG + SQL_NAMES[0], core.replace('[EQUI_ID] INT IDENTITY', '[EQUI_ID] BIGINT IDENTITY', 1)),
        ('pk_compuesta_incompleta', MIG + SQL_NAMES[0], core.replace('PRIMARY KEY ([AUTO_USUARIO_ID], [AUTO_PERFIL_ID])', 'PRIMARY KEY ([AUTO_USUARIO_ID])', 1)),
        ('fk_padre_incorrecto', MIG + SQL_NAMES[0], core.replace('REFERENCES [dbo].[REGIONES] ([REGI_ID])', 'REFERENCES [dbo].[REGIONES] ([REGI_NOMBRE])', 1)),
        ('default_cambiado_sin_enmienda', MIG + SQL_NAMES[0], core.replace('DEFAULT (SYSDATETIME())', 'DEFAULT (SYSUTCDATETIME())', 1)),
        ('sin_barrera', MIG + SQL_NAMES[0], re.sub(r";THROW 51050, N'[^']+', 1;", '', core, count=1)),
        ('fk_no_confiable', MIG + SQL_NAMES[0], core.replace('WITH CHECK ADD CONSTRAINT [FK_', 'WITH NOCHECK ADD CONSTRAINT [FK_', 1)),
        ('check_distinto_de_propuesta', MIG + SQL_NAMES[1], checks.replace('[PIEZ_CAPACIDAD_GB] > 0', '[PIEZ_CAPACIDAD_GB] >= 0', 1)),
        ('indice_de_campo_incorrecto', MIG + SQL_NAMES[2], indexes.replace('([ASIG_EQUIPO_ID]);', '([ASIG_ID]);', 1)),
        ('operacion_destructiva', MIG + SQL_NAMES[0], core + '\nDROP TABLE [dbo].[EQUIPOS];\n'),
        ('check_presentado_aprobado', DOC + '05_CHECKS_PROPUESTOS.csv', (ROOT / DOC / '05_CHECKS_PROPUESTOS.csv').read_text().replace('PROPUESTA_NO_APROBADA', 'APROBADA', 1)),
        ('cobertura_actual_incompleta', DOC + '05_PRESERVACION_CAMPOS.csv', '\n'.join((ROOT / DOC / '05_PRESERVACION_CAMPOS.csv').read_text().splitlines()[:-1]) + '\n'),
        ('entorno_inventado', MIG + 'manifest.json', json.dumps(dict(manifest, entorno_autorizado='supuesto'))),
        ('catalogo_falso', MIG + SQL_NAMES[3], (ROOT / MIG / SQL_NAMES[3]).read_text().replace("N'EQUI_ID', N'int', 4, 10, 0, 0, 1", "N'EQUI_ID', N'int', 4, 10, 0, 1, 1", 1)),
        ('sin_guardia_motor_real', MIG + SQL_NAMES[0], core.replace("IF ISNULL(TRY_CONVERT(INT, SERVERPROPERTY('ProductMajorVersion')), 0) <> 13", 'IF 1 = 0', 1)),
        ('compatibilidad_150', MIG + SQL_NAMES[0], core.replace('0) <> 130', '0) <> 150', 1)),
        ('funcion_posterior_2016', MIG + SQL_NAMES[0], core + "\nSELECT STRING_AGG([TIPO_NOMBRE], ',') FROM [dbo].[TIPOS_EQUIPO];\n"),
        ('collation_utf8_no_disponible', MIG + SQL_NAMES[0], core + "\nSELECT 'texto' COLLATE Latin1_General_100_CI_AS_SC_UTF8;\n"),
        ('motor_posterior_como_sustituto', MIG + 'manifest.json', json.dumps(dict(manifest, destino=dict(manifest['destino'], product_major_version=16)))),
        ('proyecto_supabase_distinto', MIG + 'manifest.json', json.dumps(dict(manifest, pruebas_iniciales=dict(manifest['pruebas_iniciales'], proyecto_nombre='inventarioTI')))),
        ('referencia_supabase_distinta', MIG + 'manifest.json', json.dumps(dict(manifest, pruebas_iniciales=dict(manifest['pruebas_iniciales'], project_ref='referencia-incorrecta')))),
    ]
    result = []
    for name, path, value in scenarios:
        require(value != (ROOT / path).read_text(), 'Mutación no cambia contenido: ' + name)
        override = {path: value}
        # Actualizar checksum de la copia para probar la semántica, no solo su hash.
        if path.endswith('.sql'):
            changed = json.loads(json.dumps(manifest))
            for entry in changed['archivos_sql']:
                if entry['path'] == path:
                    entry['sha256'] = digest(value.encode())
            override[MIG + 'manifest.json'] = json.dumps(changed)
        try:
            verify_model(columns, override)
        except ValueError as error:
            result.append({'caso': name, 'resultado': 'RECHAZADO_CORRECTAMENTE', 'control': str(error)})
        else:
            raise ValueError('Mutación no detectada: ' + name)
    return result


def syntax_check():
    require(importlib.metadata.version('sqlfluff') == '3.5.0', 'Parser requiere SQLFluff 3.5.0')
    results = []
    for name in SQL_NAMES:
        process = subprocess.run([sys.executable, '-m', 'sqlfluff', 'parse', '--dialect', 'tsql', '--format', 'json', '--ignore-local-config', str(ROOT / MIG / name)], capture_output=True, text=True, timeout=90)
        require(process.returncode == 0, 'Parser rechaza ' + name + ': ' + process.stderr[:500])
        parsed = json.loads(process.stdout)
        require(parsed and parsed[0].get('segments') and 'unparsable' not in json.dumps(parsed).lower(), 'SQL omitido/no parseado: ' + name)
        results.append({'archivo': MIG + name, 'resultado': 'PARSEADO_SIN_ERRORES'})
    with tempfile.TemporaryDirectory(prefix='fase5-sintaxis-') as temp:
        path = Path(temp) / 'invalido.sql'
        path.write_text('CREATE TABLE [dbo].[Rota] ([id] INT NOT NULL;\n')
        bad = subprocess.run([sys.executable, '-m', 'sqlfluff', 'parse', '--dialect', 'tsql', '--format', 'json', '--ignore-local-config', str(path)], capture_output=True, text=True, timeout=90)
        require(bad.returncode != 0, 'Parser no detecta SQL inválido')
    return {'herramienta': 'SQLFluff', 'version': '3.5.0', 'dialecto': 'tsql',
            'limite': 'Parser estático; no compilación/ejecución SQL Server',
            'archivos': results, 'negativa_sql_invalido': 'RECHAZADO_CORRECTAMENTE'}


def scriptdom_check(dotnet, dll):
    process = subprocess.run([dotnet, dll, *[str(ROOT / MIG / n) for n in SQL_NAMES]],
                             capture_output=True, text=True, timeout=60)
    require(process.returncode == 0, 'ScriptDom130 falló: ' + process.stderr[:500])
    report = json.loads(process.stdout)
    require(report['parser'] == 'TSql130Parser' and report['version_paquete'] == '161.9142.1'
            and report['compatibility_level'] == 130, 'Parser específico 130 requerido')
    require(len(report['autopruebas']) == 3 and all(x['correcto'] for x in report['autopruebas']), 'Autopruebas ScriptDom130')
    require(len(report['archivos']) == 4, 'Cobertura ScriptDom130')
    seen = set()
    for item in report['archivos']:
        path = Path(item['archivo'])
        relative = str(path.relative_to(ROOT))
        require(relative in {MIG + n for n in SQL_NAMES} and not item['errores'] and
                item['sha256'] == digest(path.read_bytes()), 'ScriptDom errores/hash/cobertura')
        item['archivo'] = relative
        seen.add(relative)
    require(len(seen) == 4, 'ScriptDom130 archivos repetidos')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--analizar-sintaxis', action='store_true')
    parser.add_argument('--evaluar-aplicacion', action='store_true')
    parser.add_argument('--dotnet-bin', help='Binario dotnet externo para ScriptDom130, junto con --scriptdom-dll')
    parser.add_argument('--scriptdom-dll', help='DLL del verificador estático; no abre conexiones SQL')
    args = parser.parse_args()
    require(bool(args.dotnet_bin) == bool(args.scriptdom_dll), 'Indicar juntos --dotnet-bin y --scriptdom-dll')
    columns = source_columns()
    counts = verify_model(columns)
    negatives = negative_checks(columns)
    manifests = [DOC + 'evidencias/fase2/fuentes.json', DOC + 'evidencias/fase3/verificacion.json', DOC + 'evidencias/fase4/verificacion.json']
    preserved = []
    for name in manifests:
        value = json.loads((ROOT / name).read_text())
        hashes = value.get('sha256', value.get('sha256_artefactos'))
        for path, expected in hashes.items():
            if not path.startswith(('docs/', 'apps/', '.github/', 'supabase/', 'tests/', 'ops/')) and name.endswith('fase4/verificacion.json'):
                path = DOC + path
            require(digest((ROOT / path).read_bytes()) == expected, 'Fuente previa alterada: ' + path)
        preserved.append({'manifiesto': name, 'archivos': len(hashes)})
    artifacts = [ROOT / MIG / name for name in SQL_NAMES] + [ROOT / MIG / 'manifest.json', ROOT / MIG / 'README.md', Path(__file__)]
    artifacts += sorted((ROOT / DOC).glob('05_*'))
    artifacts.append(ROOT / DOC / 'evidencias/fase5/fuentes.json')
    artifacts += sorted((ROOT / DOC / 'herramientas/scriptdom130').glob('*'))
    artifacts += sorted((ROOT / DOC / 'evidencias/fase5/revision1').glob('*.json'))
    artifacts += sorted((ROOT / DOC / 'evidencias/fase5/revision2').glob('*.json'))
    artifacts += [ROOT / DOC / 'evidencias/fase5/provision_supabase_creado.json', ROOT / DOC / 'PROVISION_SUPABASE.md']
    artifacts += sorted((ROOT / DOC / 'evidencias/fase5/revision3').glob('*.json'))
    artifacts += [ROOT / DOC / 'evidencias/fase5/ensayo_supabase/resultados.json', ROOT / DOC / 'VALIDACION_SUPABASE.md']
    artifacts += sorted((ROOT / 'migrations/supabase-pruebas').glob('*'))
    hashes = {str(p.relative_to(ROOT)): digest(p.read_bytes()) for p in artifacts}
    previous = ROOT / DOC / 'evidencias/fase5/verificacion.json'
    if previous.exists():
        saved = json.loads(previous.read_text())
        require(saved['sha256_artefactos'] == hashes and saved['conteos'] == counts, 'Evidencia Fase 5 no corresponde a archivos actuales')
    report = {'fase': 'MIGRACION_5', 'estado': 'EN_REVISION_APLICACION_BLOQUEADA', 'base_git': BASE,
              'continuacion_git_base': 'cdd0f0398026384a2ff4aca20353017e0c6c5f91',
              'verificacion_estatica': 'APROBADA_EN_ALCANCE_ESTATICO', 'conteos': counts,
              'incidencias_corregidas': ['Verificador aceptaba solo letras en tipos; se amplió para DATETIME2 y se repitió con éxito'],
              'fuentes_preservadas': preserved, 'sha256_artefactos': hashes,
              'negativas': negatives, 'sintaxis': syntax_check() if args.analizar_sintaxis else 'NO_REPETIDA_EN_ESTA_INVOCACION',
              'destino_confirmado': {'version': 'SQL Server 2016', 'product_major_version': 13, 'compatibility_level': 130},
              'supabase_provision': 'PROYECTO_CREADO_VERIFICACION_METADATA_PREVIA_NO_REPETIDA_POR_ESTE_SCRIPT',
              'supabase_funcionalidad': 'EVIDENCIA_20_CASOS_SQL_VALIDADA_NO_REPETIDA; HTTP_AUTH_UI_NO_EJECUTADOS',
              'sintaxis_sql2016': scriptdom_check(args.dotnet_bin, args.scriptdom_dll) if args.dotnet_bin and args.scriptdom_dll else 'NO_REPETIDA_EN_ESTA_INVOCACION',
              'motor_sqlserver': 'NO_EJECUTADO_SIN_ENTORNO_AUTORIZADO',
              'etl_reconciliacion_restore_operacional': 'NO_EJECUTADOS',
              'rollback_postgresql': 'ENSAYO_TRANSACCIONAL_VERIFICADO_NO_RESTAURACION',
              'aplicacion_fuentes': 'SIN_CAMBIOS',
              'fase6': 'NO_AUTORIZADA',
              'bloqueos': json.loads((ROOT / MIG / 'manifest.json').read_text())['bloqueos']}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 3 if args.evaluar_aplicacion else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, KeyError, AssertionError, subprocess.TimeoutExpired) as error:
        print('VERIFICACION_FASE5_FALLIDA: ' + str(error), file=sys.stderr)
        sys.exit(1)
