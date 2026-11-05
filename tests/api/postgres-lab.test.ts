import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {labFixture} from '../helpers/lab.js';
import {stagingModel} from '../../apps/server/modernization/staging.js';

test('Laboratorio modernizado: BFF y persistencia PostgreSQL real; proveedor de identidad doble local',async t=>{
 const f=await labFixture();
 const get=async(url:string,session:{sid:string;csrf:string}=f.r)=>f.server.inject({url:'/api/v2/'+url,headers:f.headers(session)});
 const send=async(method:'POST'|'PATCH',url:string,payload:object,version?:string,key=randomUUID(),session=f.a)=>f.server.inject({method,url:'/api/v2/'+url,
  headers:{...f.headers(session),'idempotency-key':key,...(version?{'if-match':`"v${version}"`}:{})},payload:{motivo:'Ensayo SQL transaccional',confirmado:true,...payload}});
 const ok=(r:Awaited<ReturnType<typeof send>>)=>{assert(r.statusCode<300,r.body);return r.json();};
 let equipment='',person='',v='';
 try {
  const type=await f.ref('TIPOS_EQUIPO',1),condition=await f.ref('ESTADOS_EQUIPO',1),model=await f.ref('MODELOS',1);
  const org={delegacionRef:await f.ref('DELEGACIONES',1),departamentoRef:await f.ref('DEPARTAMENTOS',1),areaRef:null};
  const body={codigoOperativo:'SQL-REAL-01',tipoRef:type,modeloRef:model,condicionRef:condition,numeroSerie:'Ñ'.repeat(100),observacion:'Texto íntegro '.repeat(80),inventarioServiu:'S'.repeat(80)};
  await t.test('lecturas reales, filtros/cursor ligado y proyección pública',async()=>{
   const first=ok(await get('equipos?limit=2'));assert.equal(first.items.length,2);assert(first.nextCursor);
   const second=ok(await get('equipos?limit=2&cursor='+first.nextCursor));assert.equal(second.items.length,2);assert.notEqual(first.items[0].ref,second.items[0].ref);
   assert.equal((await get('equipos?limit=2&q=otro&cursor='+first.nextCursor)).statusCode,400);
   assert.equal(ok(await get('equipos?q=LAB-001')).items.length,1);
   assert.equal(ok(await get('catalogos/modelos?marcaRef='+await f.ref('MARCAS',1))).items.length,1);
   assert.equal(ok(await get('organizacion?grupo=departamentos')).items.length,2);
   const publicPerson=ok(await get('funcionarios/'+await f.ref('FUNCIONARIOS',1)));
   assert(!('documento' in publicPerson));assert(!('correo' in publicPerson));
   assert.equal((await get('funcionarios/'+publicPerson.ref+'/edicion')).statusCode,403);
   assert.equal(ok(await get('funcionarios/'+publicPerson.ref+'/edicion',f.a)).documento,'LAB-ADMIN');
  });
  await t.test('alta persistente de funcionario y equipo Unicode sin truncar',async()=>{
   person=ok(await send('POST','funcionarios',{documentoTipo:'ID',documento:'DOC-PRIVADO-TEST',nombre:'María de ensayo',cargo:'Analista',correo:'privado@example.invalid',organizacion:org})).ref;
   const key=randomUUID(),response=ok(await send('POST','equipos',body,undefined,key));equipment=response.ref;v=response.version;
   const replay=ok(await send('POST','equipos',body,undefined,key));assert.deepEqual(replay,response);
   assert.equal((await send('POST','equipos',{...body,codigoOperativo:'DIFERENTE'},undefined,key)).statusCode,409);
   const detail=ok(await get('equipos/'+equipment));assert.equal(detail.numeroSerie,body.numeroSerie);assert.equal(detail.observacion,body.observacion);
   const raw=(await f.root.query('select e."EQUI_NUMERO_SERIE",s.serie_original from laboratorio_ti."EQUIPOS" e join laboratorio_ti.equipo_soporte s on s.equipo_id=e."EQUI_ID" join laboratorio_ti.referencias r on r.tabla=$1 and r.id=e."EQUI_ID" where r.ref=$2',['EQUIPOS',equipment])).rows[0];
   assert.equal(raw.EQUI_NUMERO_SERIE,null);assert.equal(raw.serie_original,body.numeroSerie);
  });
  await t.test('lectura, MFA y origen/CSRF no autorizan escrituras',async()=>{
   assert.equal((await send('POST','equipos',{...body,codigoOperativo:'DENEGADO'},undefined,randomUUID(),f.r)).statusCode,403);
   assert.equal((await send('POST','equipos',{...body,codigoOperativo:'DENEGADO'},undefined,randomUUID(),f.partial)).statusCode,401);
   const response=await f.server.inject({method:'PATCH',url:'/api/v2/equipos/'+equipment,headers:{...f.headers(f.a),origin:'https://otro.invalid','if-match':'"v1"'},payload:{...body,confirmado:true,motivo:'CSRF'}});assert.equal(response.statusCode,403);
  });
  await t.test('versión obligatoria, conflicto y repetición estable después de cambios',async()=>{
   const {condicionRef,...attributes}=body;
   assert.equal((await send('PATCH','equipos/'+equipment,attributes)).statusCode,428);
   assert.equal((await send('PATCH','equipos/'+equipment,attributes,'999')).statusCode,412);
   const key=randomUUID(),response=ok(await send('PATCH','equipos/'+equipment,attributes,v,key));v=response.version;
   assert.deepEqual(ok(await send('PATCH','equipos/'+equipment,attributes,'1',key)),response);
  });
  await t.test('técnica, componentes, duplicados y rollback del comando',async()=>{
   const response=ok(await send('PATCH','equipos/'+equipment+'/tecnica',{subtipo:'computador',nombreRed:'SQL-RED-01',esNotebook:false,piezasAgregar:[{familiaRef:await f.ref('FAMILIAS_COMPONENTE',1),capacidadGb:16}]},v));v=response.version;
   const detail=ok(await get('equipos/'+equipment));assert.equal(detail.tecnica.piezas.length,1);assert.equal(detail.tecnica.piezas[0].capacidadGb,16);
   assert.equal((await send('PATCH','equipos/'+equipment+'/tecnica',{subtipo:'monitor',pulgadas:24},v)).statusCode,422);
   assert.equal(ok(await get('equipos/'+equipment)).version,v);
   for(const [id,technical] of [[3,{subtipo:'monitor',pulgadas:27.5}],[4,{subtipo:'impresora',claseRef:await f.ref('CLASES_IMPRESORA',1),duplex:false,insumosAgregar:[{rubroRef:await f.ref('RUBROS_INSUMO',1),codigo:'TN-REAL'}]}],[5,{subtipo:'switch',cantidadPuertos:48}]] as const){
    const ref=await f.ref('EQUIPOS',id);ok(await send('PATCH','equipos/'+ref+'/tecnica',technical,'1'));assert.equal(ok(await get('equipos/'+ref)).tecnica.subtipo,technical.subtipo);
   }
  });
  await t.test('asignación y traslado concurrente mantienen custodia única e historia UTC',async()=>{
   v=ok(await send('POST','equipos/'+equipment+'/movimientos',{tipo:'asignacion',destinoRef:person},v)).version;
   const next=await f.ref('FUNCIONARIOS',3);
   const results=await Promise.all([send('POST','equipos/'+equipment+'/movimientos',{tipo:'traslado',origenEsperadoRef:person,destinoRef:next},v),send('POST','equipos/'+equipment+'/movimientos',{tipo:'devolucion',origenEsperadoRef:person},v)]);
   assert.deepEqual(results.map(x=>x.statusCode).sort(),[200,412]);
   v=ok(await get('equipos/'+equipment)).version;
   const history=ok(await get('equipos/'+equipment+'/historia'));assert.equal(history.movimientos.length,2);
   for(const assignment of history.asignaciones){assert.equal(assignment.precisionTemporal,'instante');assert.equal(assignment.fechaOrigen,null);assert(assignment.inicio);}
   assert(history.asignaciones.filter((x:any)=>x.vigente).length<=1);
  });
  await t.test('mantención y pertenencia persisten con versiones',async()=>{
   v=ok(await send('POST','equipos/'+equipment+'/mantenciones',{actividadRef:await f.ref('ACTIVIDADES_MANTENCION',1),fecha:'2026-11-02',observacion:'Mantenimiento SQL'},v)).version;
   assert.equal(ok(await get('equipos/'+equipment+'/mantenciones')).items[0].fecha,'2026-11-02');
   const personVersion=ok(await get('funcionarios/'+person)).version;
   ok(await send('POST','funcionarios/'+person+'/pertenencias',{organizacion:{...org,departamentoRef:await f.ref('DEPARTAMENTOS',2)}},personVersion));
   assert.equal(ok(await get('funcionarios/'+person)).organizacion.departamentoRef,await f.ref('DEPARTAMENTOS',2));
  });
  await t.test('sin destinatario todo revierte, no se anuncia aviso ficticio',async()=>{
   // Inyección de fallo local por el propietario; nunca forma parte de migraciones/despliegue.
   await f.root.query('alter table inventario.configuracion_avisos disable trigger maestro_integridad;delete from inventario.configuracion_avisos;alter table inventario.configuracion_avisos enable trigger maestro_integridad');
   const before=(await f.root.query('select count(*)::int n from inventario.comandos')).rows[0].n;
   assert.equal((await send('POST','equipos/'+equipment+'/mantenciones',{actividadRef:await f.ref('ACTIVIDADES_MANTENCION',1),fecha:'2026-11-02'},v)).statusCode,503);
   assert.equal(ok(await get('equipos/'+equipment)).version,v);assert.equal((await f.root.query('select count(*)::int n from inventario.comandos')).rows[0].n,before);
   await f.root.query("insert into inventario.configuracion_avisos(destinatario) values('laboratorio@example.invalid')");
  });
  await t.test('reglas productivas pendientes permanecen bloqueadas sin efectos',async()=>{
   assert.equal((await send('POST','equipos/'+equipment+'/movimientos',{tipo:'baja'},v)).statusCode,503);
   assert.equal(ok(await get('equipos/'+equipment)).version,v);
   const response=await f.server.inject({method:'PUT',url:'/api/v2/usuarios/'+randomUUID()+'/perfiles',headers:{...f.headers(f.a),'if-match':'"v1"'},payload:{perfilRefs:[randomUUID()],motivo:'Prueba',confirmado:true}});assert.equal(response.statusCode,503);
  });
  await t.test('mínimo privilegio, RLS, actor desactivado y auditoría sin datos privados',async()=>{
   await assert.rejects(f.business.query('select * from laboratorio_ti."USUARIOS"'),/permission denied/);
   await assert.rejects(f.business.query('insert into laboratorio_ti.equipo_soporte values(999,$1)', ['FORGED']),/permission denied/);
   const roles=(await f.root.query("select rolname,rolcanlogin,rolsuper,rolbypassrls from pg_roles where rolname like 'inventario_modelo_%'")).rows;assert.equal(roles.length,2);assert(roles.every(r=>!r.rolcanlogin&&!r.rolsuper&&!r.rolbypassrls));
   const policies=(await f.root.query("select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='laboratorio_ti' and c.relkind='r' and (not c.relrowsecurity or not c.relforcerowsecurity)")).rows[0].n;assert.equal(policies,0);
   await f.root.query('update laboratorio_ti."USUARIOS" set "USUA_ACTIVO"=false where "USUA_ID"=2');assert.equal((await get('equipos')).statusCode,403);
   await f.root.query('update laboratorio_ti."USUARIOS" set "USUA_ACTIVO"=true where "USUA_ID"=2');
   const audit=(await f.root.query('select "AUDI_VALOR_ANTERIOR","AUDI_VALOR_NUEVO" from laboratorio_ti."AUDITORIA"')).rows;assert(audit.length>5);assert(!JSON.stringify(audit).includes('DOC-PRIVADO-TEST'));assert(!JSON.stringify(audit).includes('privado@example.invalid'));
   const counts=(await f.root.query("select (select count(*) from inventario.comandos where operacion like 'C03-%')::int comandos,(select count(*) from inventario.outbox o join inventario.auditoria a on a.id=o.auditoria_id where a.accion like 'C03-%' and o.estado='pendiente')::int avisos")).rows[0];assert.equal(counts.comandos,counts.avisos);
   await assert.rejects(f.security.run(f.a.sid,'inventario.modificar',db=>db.query('select laboratorio_ti.aplicar($1,$2,$3,$4,$5)', ['C03-03',null,randomUUID(),null,{...body,motivo:'Sin confirmación'}]),f.a.csrf),/INVALID_REQUEST/);
   await assert.rejects(f.root.query('update laboratorio_ti.movimientos set motivo=$1',['alteración']),/IMMUTABLE_HISTORY/);
  });
 }finally{await f.close();}
});
test('activación de laboratorio exige proyecto/entorno/delivery correctos; modo normal permanece cerrado',()=>{
 assert.equal(stagingModel({}),undefined);
 assert.throws(()=>stagingModel({MODERNIZATION_BACKEND:'postgres-lab'}),/INVALID_STAGING/);
 const env={MODERNIZATION_BACKEND:'postgres-lab',APP_ENV:'staging',SUPABASE_PROJECT_REF:'yhsfotxhaptinjtmrinn',SUPABASE_URL:'https://yhsfotxhaptinjtmrinn.supabase.co',NOTIFICATION_DELIVERY_ENABLED:'false'};
 assert(stagingModel(env));assert.throws(()=>stagingModel({...env,NOTIFICATION_DELIVERY_ENABLED:'true'}),/DELIVERY/);
});

test('migración con operador gestionado sin SUPERUSER: ACL, propietarios y RPC privado',async()=>{
 const f=await labFixture(undefined,undefined,{managedOperator:true});
 try {
  assert.equal((await f.root.query('select rolsuper from pg_roles where rolname=current_user')).rows[0].rolsuper,false);
  const functions=(await f.root.query("select p.oid::regprocedure::text firma,has_function_privilege('anon',p.oid,'EXECUTE') anon,has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='laboratorio_ti'")).rows;
  assert(functions.length>10);assert(functions.every(x=>!x.anon&&!x.authenticated));
  assert.equal((await f.root.query("select has_schema_privilege('inventario_contexto','laboratorio_ti','CREATE') a,has_schema_privilege('inventario_modelo_lector','laboratorio_ti','CREATE') b,has_schema_privilege('inventario_modelo_servicio','laboratorio_ti','CREATE') c")).rows[0].a,false);
  assert.deepEqual((await f.business.query('select laboratorio_ti.diagnostico() result')).rows[0].result,{adminBound:true,readerBound:true});
  const response=await f.server.inject({method:'POST',url:'/api/v2/equipos',headers:f.headers(f.a),payload:{codigoOperativo:'GESTIONADO',tipoRef:await f.ref('TIPOS_EQUIPO',1),modeloRef:null,condicionRef:await f.ref('ESTADOS_EQUIPO',1),numeroSerie:null,motivoSinSerie:'Sintético',motivo:'Migrador restringido',confirmado:true}});
  assert.equal(response.statusCode,201,response.body);
 }finally{await f.close();}
});
