import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { PoolClient } from 'pg';
import { fixture, admin, reader } from '../helpers/reports.js';
import type { ModelBackend, ModelContext, ModelRequest } from '../../apps/server/modernization/ports.js';
import { contract } from '../../apps/server/modernization/contract.js';
import { AuthError } from '../../apps/server/auth/service.js';
import { app } from '../../apps/server/app.js';
import { postgresInventory } from '../../apps/server/inventory/postgres.js';
import { Inventory } from '../../apps/server/inventory/service.js';

const ref='20000000-0000-4000-8000-000000000001';
const organization={delegacionRef:ref,departamentoRef:ref,areaRef:null};
const evidence={motivo:'Prueba sintética',confirmado:true};
const equipment={ref,codigoOperativo:'TI-01',tipoRef:ref,modeloRef:null,condicionRef:null,situacionRef:null,custodioRef:null,version:'1'};
const employee={ref,nombre:'Ángela Sintética',cargo:'Analista',organizacion:organization,activo:true,version:'1'};
const page=(items:unknown[])=>({items,nextCursor:null,generatedAt:'2026-11-03T00:00:00.123Z',timezone:'UTC'});
const payloads:Record<string,object>={
 'C03-03':{...evidence,codigoOperativo:'TI-01',tipoRef:ref,modeloRef:ref,condicionRef:ref,motivoSinSerie:'Sin serie verificable'},
 'C03-05':{...evidence,codigoOperativo:'TI-01',tipoRef:ref,modeloRef:ref,numeroSerie:'SERIE'},
 'C03-06':{...evidence,subtipo:'computador',nombreRed:'EQUIPO-01',esNotebook:true},
 'C03-07':{...evidence,tipo:'traslado',origenEsperadoRef:ref,destinoRef:reader},
 'C03-10':{...evidence,actividadRef:ref,fecha:'2026-10-01',observacion:null},
 'C03-12':{...evidence,documentoTipo:'ID',documento:'ID-SINTETICO',nombre:'Ángela',cargo:'Analista',organizacion:organization},
 'C03-15':{...evidence,documentoTipo:'ID',documento:'ID-SINTETICO',nombre:'Ángela',cargo:'Analista'},
 'C03-16':{...evidence,organizacion:organization},
 'C03-17':{...evidence,perfilRefs:[ref]},
};
const results:Record<string,unknown>={
 CatalogoPage:page([{ref,nombre:'Marca sintética'}]),EquipoPage:page([equipment]),
 ComandoResultado:{ref,version:'1',aviso:'pendiente'},EquipoDetalle:{...equipment,tecnica:null},
 Historia:{asignaciones:[],movimientos:[],anotaciones:[],vigente:null,next:{asignaciones:null,movimientos:null,anotaciones:null},timezone:'UTC'},
 MantencionPage:page([{ref,equipoRef:ref,actividadRef:ref,fecha:'2026-10-01',observacion:null,registradoEn:'2026-11-03T00:00:00Z'}]),
 FuncionarioPage:page([employee]),FuncionarioPublico:employee,
 FuncionarioEdicion:{...employee,documentoTipo:'ID',documento:'ID-SINTETICO',correo:null},
};

/** Doble de persistencia v2: prueba frontera HTTP, no implementa ni simula garantías de dominio. */
class ContractBackend implements ModelBackend {
 readonly engine='postgres' as const;
 readonly operations=new Set<string>(contract.operaciones.map(op=>op.id));
 calls:{context:ModelContext;request:ModelRequest;transaction:PoolClient}[]=[];
 mode:'normal'|'secret'|'badVersion'|'rollback'|'invalidAfterWrite'='normal';
 async executeAtomic(context:ModelContext,request:ModelRequest,transaction:unknown) {
  const db=transaction as PoolClient;
  assert(Object.isFrozen(context));
  assert.equal((await db.query('select current_user as role')).rows[0].role,'inventario_runtime');
  assert.equal((await db.query('select actor_id from seguridad.principal()')).rows[0].actor_id,context.actorId);
  this.calls.push({context,request,transaction:db});
  if(this.mode==='rollback'||this.mode==='invalidAfterWrite') {
   await db.query('insert into seguridad.eventos(actor_id,permiso,permitido) values($1,$2,true)',[context.actorId,context.permission]);
   if(this.mode==='rollback')throw new AuthError(409,'BUSINESS_CONFLICT');
  }
  const response=structuredClone(results[contract.operaciones.find(op=>op.id===request.operation)!.responseSchema]) as Record<string,unknown>;
  if(this.mode==='secret'||this.mode==='invalidAfterWrite')response.USUA_CLAVE_HASH='SENSITIVE-NEVER-RETURN';
  if(this.mode==='badVersion')response.version='9223372036854775808';
  return response;
 }
}

test('M6: contratos v2 con HTTP/Auth/RLS/transacción PostgreSQL y persistencia doble',async t=>{
 const backend=new ContractBackend(),f=await fixture(undefined,undefined,{modernization:backend});
 const url=(id:string)=>contract.operaciones.find(op=>op.id===id)!.path.replace(':ref',ref).replace(':catalogo','marcas');
 const request=(id:string,overrides:Record<string,unknown>={})=>{
  const op=contract.operaciones.find(op=>op.id===id)!;
  return f.server.inject({method:op.method,url:url(id),headers:{...f.headers(f.a),...((op.headers_obligatorios as readonly string[]).includes('If-Match')?{'if-match':'"v1"'}:{})},...(payloads[id]?{payload:payloads[id]}:{}),...overrides} as any);
 };
 try {
  await t.test('contrato ejecutable conserva exactamente las 18 operaciones y 27 schemas de F3',()=>{
   const source=JSON.parse(readFileSync('docs/migracion/03_CONTRATOS_PROPUESTOS.json','utf8'));
   assert.deepEqual(contract,{operaciones:source.operaciones,schemas:source.schemas});
  });
  for(const op of contract.operaciones)await t.test(op.id+' '+op.method+' '+op.path,async()=>{
   const response=await request(op.id);assert.equal(response.statusCode,op.response_success,response.body);
   assert.deepEqual(response.json(),results[op.responseSchema]);
   assert.equal(response.headers['cache-control'],'no-store');
   assert.equal(response.headers.etag,'ETag' in op.responseHeaders?'"v1"':undefined);
   const last=backend.calls.at(-1)!;assert.equal(last.context.actorId,admin);assert.equal(last.context.permission,op.permission);
   if(op.method!=='GET')assert.match(last.context.idempotencyKey!,/^[0-9a-f-]{36}$/);
   assert.equal(last.context.expectedVersion,(op.headers_obligatorios as readonly string[]).includes('If-Match')?'1':undefined);
  });
  await t.test('sin sesión, lectura, MFA parcial, CSRF y origen: no llega al repositorio',async()=>{
   const before=backend.calls.length;
   assert.equal((await request('C03-02',{headers:{}})).statusCode,401);
   for(const id of ['C03-03','C03-14','C03-17'])assert.equal((await request(id,{headers:{...f.headers(f.r),'if-match':'"v1"'}})).statusCode,403);
   assert.equal((await request('C03-03',{headers:f.headers(f.partial)})).statusCode,401);
   assert.equal((await request('C03-03',{headers:{...f.headers(f.a),'x-csrf-token':'forged'}})).statusCode,403);
   assert.equal((await request('C03-03',{headers:{...f.headers(f.a),origin:'https://evil.invalid'}})).statusCode,403);
   assert.equal(backend.calls.length,before);
   const denied=await f.root.query('select count(*)::int n from seguridad.eventos where actor_id=$1 and not permitido',[reader]);
   assert(denied.rows[0].n>=3);
  });
  await t.test('schemas cerrados y headers: no acepta actor, hashes, sobreasignación o versiones inválidas',async()=>{
   const before=backend.calls.length;
   for(const payload of [{...payloads['C03-03'],actorId:admin},{...payloads['C03-03'],USUA_CLAVE_HASH:'forged'}, {...payloads['C03-03'],confirmado:false}])
    assert.equal((await request('C03-03',{payload})).statusCode,400);
   for(const query of ['actorId='+admin,'limit=101','limit=1.2','desde=2026-11-03&hasta=2026-01-01','desde=2026-02-30'])
    assert.equal((await request('C03-02',{url:url('C03-02')+'?'+query})).statusCode,400,query);
   for(const value of ['*','"v0"','"v01"','"v9223372036854775808"','W/"v1"'])
    assert.equal((await request('C03-05',{headers:{...f.headers(f.a),'if-match':value}})).statusCode,400,value);
   assert.equal((await request('C03-05',{headers:f.headers(f.a)})).statusCode,428);
   assert.equal((await request('C03-03',{headers:{...f.headers(f.a),'idempotency-key':'forged'}})).statusCode,400);
   assert.equal(backend.calls.length,before);
  });
  await t.test('reglas de entrada de serie, motivo y combinación de movimiento',async()=>{
   for(const [id,payload,status] of [
    ['C03-03',{...payloads['C03-03'],motivoSinSerie:null},422],
    ['C03-03',{...payloads['C03-03'],motivo:'   '},400],
    ['C03-07',{...payloads['C03-07'],destinoRef:ref},422],
    ['C03-07',{...evidence,tipo:'asignacion'},422],
    ['C03-07',{...evidence,tipo:'baja',destinoRef:ref},422],
   ] as const)assert.equal((await request(id,{payload})).statusCode,status);
   const response=await request('C03-02',{url:url('C03-02')+'?limit=2'});assert.equal(response.statusCode,200,response.body);
   assert.equal(backend.calls.at(-1)!.request.query.limit,2);
  });
  await t.test('fallos del repositorio o de proyección revierten SQL y no filtran secretos',async()=>{
   const count=async()=>Number((await f.root.query('select count(*) n from seguridad.eventos')).rows[0].n);
   for(const mode of ['rollback','invalidAfterWrite'] as const) {
    const before=await count();backend.mode=mode;
    const response=await request('C03-03');assert.equal(response.statusCode,mode==='rollback'?409:503,response.body);
    assert(!response.body.includes('SENSITIVE'));assert.equal(await count(),before);
   }
   backend.mode='secret';const response=await request('C03-13');assert.equal(response.statusCode,503);assert(!response.body.includes('SENSITIVE'));
   backend.mode='badVersion';assert.equal((await request('C03-13')).statusCode,503);
   backend.mode='normal';
  });
  await t.test('capacidad ausente devuelve 503 después de autenticar y autorizar',async()=>{
   backend.operations.delete('C03-17');const before=backend.calls.length;
   const response=await request('C03-17');assert.equal(response.statusCode,503);assert.equal(response.json().code,'MODEL_OPERATION_NOT_READY');
   assert.equal((await request('C03-17',{headers:{...f.headers(f.r),'if-match':'"v1"'}})).statusCode,403);
   assert.equal(backend.calls.length,before);
  });
  await t.test('v1 predeterminada funciona y v2 requiere inyección; no mezcla transacciones de motores',async()=>{
   const legacy=app(f.auth,'https://inventario.test',new Inventory(postgresInventory(f.security)),undefined,f.security);
   try {
    assert.equal((await legacy.inject({url:'/api/v1/bienes',headers:f.headers(f.r)})).statusCode,200);
    assert.equal((await legacy.inject({url:'/api/v2/equipos',headers:f.headers(f.r)})).statusCode,404);
   }finally{await legacy.close();}
   assert.throws(()=>app(f.auth,'https://inventario.test',undefined,undefined,f.security,{...backend,engine:'sqlserver2016',executeAtomic:async()=>null}),/MIXED_MODEL_TRANSACTION_NOT_ALLOWED/);
  });
 }finally{await f.close();}
});
