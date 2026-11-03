import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Inventory } from '../../apps/server/inventory/service.js';
import { InventoryFailure, type InventoryGateway, type InventoryRepository } from '../../apps/server/inventory/ports.js';
import { inventoryDriver } from '../../apps/server/inventory/configuration.js';
import { modelBinding,modelCursor,readModelCursor } from '../../apps/server/modernization/cursor.js';
import { compareTarget,inspectTarget,fitsTargetText,type TargetColumn } from '../../apps/server/modernization/sqlserver2016.js';
import { SqlServerCatalogBackend,SqlCatalogTransaction,type SqlReadParameter } from '../../apps/server/modernization/sqlserver-catalogs.js';
import Fastify from 'fastify';
import { modernizationRoutes } from '../../apps/server/modernization/routes.js';

test('M6: servicio de inventario por puerto preserva alcance, versión y errores',async()=>{
 const calls:unknown[]=[];
 const repo:InventoryRepository={list:async()=>({items:[],nextCursor:null,generatedAt:'2026-11-03T00:00:00Z',timezone:'UTC',dateField:null}),detail:async()=>{throw new InventoryFailure('NOT_FOUND',404);},save:async(...args)=>{calls.push(args);return {ref:randomUUID(),version:1,aviso:'pendiente'};}};
 const gateway:InventoryGateway={validateList:()=>{},run:async(sid,permission,fn,csrf)=>{calls.push({sid,permission,csrf});return fn(repo);}};
 const inventory=new Inventory(gateway);
 await inventory.list('session','movimientos',{});assert.deepEqual(calls[0],{sid:'session',permission:'historial.consultar',csrf:undefined});
 await inventory.save('session','csrf',null,'key','"v123"',{motivo:'Prueba'});
 assert.deepEqual(calls[1],{sid:'session',permission:'inventario.modificar',csrf:'csrf'});
 assert.deepEqual(calls[2],[null,'key','123',{motivo:'Prueba'}]);
 await assert.rejects(inventory.save('s','c',null,'k','*',{}),e=>Boolean((e as any).status===400));
 await assert.rejects(inventory.detail('s','bienes',randomUUID()),e=>Boolean((e as any).status===404));
});

test('M6: selección de motor sin fallback ni activación SQL Server por accidente',()=>{
 assert.equal(inventoryDriver(undefined),'postgres');assert.equal(inventoryDriver('postgres'),'postgres');
 assert.throws(()=>inventoryDriver('sqlserver2016'),/SQLSERVER_MODEL_NOT_READY/);
 for(const input of ['','sqlserver','mssql','POSTGRES'])assert.throws(()=>inventoryDriver(input),/UNKNOWN_INVENTORY_DRIVER/);
});

test('M6: nunca envía éxito ni ETag antes de finalizar la transacción',async()=>{
 const server=Fastify();
 server.setErrorHandler((_err,_request,response)=>response.code(503).send({code:'DEPENDENCY_UNAVAILABLE'}));
 const actorId=randomUUID(),ref=randomUUID();
 modernizationRoutes(server,{engine:'postgres',run:async(_sid,_permission,work)=>{
  await work({actorId,role:'administrador',authorizationVersion:'1'},{});
  throw new Error('Synthetic commit failure');
 }},{engine:'postgres',operations:new Set(['C03-13']),executeAtomic:async()=>({ref,nombre:'Sintético',cargo:'Analista',organizacion:{delegacionRef:ref,departamentoRef:ref,areaRef:null},activo:true,version:'1'})},()=>'',()=> '');
 try {
  const response=await server.inject('/api/v2/funcionarios/'+ref);
  assert.equal(response.statusCode,503);assert.equal(response.headers.etag,undefined);
  assert(!response.body.includes('Sintético'));
 }finally{await server.close();}
});

test('M6: cursores ligados a filtros/recurso y claves públicas/bigint válidas',()=>{
 const ref=randomUUID(),binding=modelBinding('C03-01:MARCAS',{q:'á',limit:10});
 assert.equal(binding,modelBinding('C03-01:MARCAS',{limit:100,q:'á'}));
 const cursor=modelCursor(binding,ref);assert.equal(readModelCursor(cursor,binding),ref);
 assert.equal(readModelCursor(modelCursor(binding,'9223372036854775807'),binding),'9223372036854775807');
 for(const altered of [modelBinding('C03-01:MODELOS',{q:'á'}),modelBinding('C03-01:MARCAS',{q:'otro'})])assert.throws(()=>readModelCursor(cursor,altered));
 for(const invalid of ['',cursor+'=',Buffer.from(JSON.stringify({v:1,binding,ref,actor:'forjado'})).toString('base64url'),Buffer.from(JSON.stringify({v:1,binding,ref:'9223372036854775808'})).toString('base64url')])assert.throws(()=>readModelCursor(invalid,binding));
});

function catalogSnapshot():TargetColumn[] {
 // Fixture independiente del generador TS: lee los 117 valores del SQL de catálogo para revisión.
 const sql=readFileSync('migrations/sqlserver/900_catalogo_esperado.candidate.sql','utf8');
 return [...sql.matchAll(/\(N'(\w+)', N'(\w+)', N'(\w+)', (-?\d+), (\d+), (\d+), ([01]), ([01])\)/g)].map(m=>({schema_name:'dbo',table_name:m[1],column_name:m[2],column_type:m[3],max_length:Number(m[4]),precision_value:Number(m[5]),scale_value:Number(m[6]),nullable:Number(m[7]),identity_value:Number(m[8]),default_value:['FUNC_ACTIVO','USUA_ACTIVO'].includes(m[2])?'((1))':['USUA_FECHA_CREACION','AUTO_FECHA_OTORGADO','AUDI_FECHA_HORA'].includes(m[2])?'(SYSUTCDATETIME())':null}));
}
test('M6: sonda de 117 columnas enmendadas; núcleo compatible no habilita escrituras',async()=>{
 const columns=catalogSnapshot();assert.equal(columns.length,117);
 const good=compareTarget({major:13,compatibility:130,columns});assert.equal(good.coreCompatible,true);assert.equal(good.activationReady,false);
 assert.equal(compareTarget({major:16,compatibility:130,columns}).coreCompatible,false);
 assert.equal(compareTarget({major:13,compatibility:150,columns}).coreCompatible,false);
 for(const change of [
  (c:TargetColumn[])=>{c.pop();},
  (c:TargetColumn[])=>{c.push({...c[0]});},
  (c:TargetColumn[])=>{c.find(x=>x.column_name==='FUNC_NOMBRE_COMPLETO')!.column_type='varchar';},
  (c:TargetColumn[])=>{c.find(x=>x.column_name==='USUA_CLAVE_HASH')!.nullable=0;},
  (c:TargetColumn[])=>{c.find(x=>x.column_name==='AUDI_FECHA_HORA')!.default_value='SYSDATETIME()';},
  (c:TargetColumn[])=>{c.find(x=>x.column_name==='ASIG_FECHA_INICIO')!.column_type='datetime2';}
 ]){const mutated=structuredClone(columns);change(mutated);assert.equal(compareTarget({major:13,compatibility:130,columns:mutated}).coreCompatible,false);}
 let count=0;
 const report=await inspectTarget({read:async<T>(sql:string)=>{assert.match(sql,/^SELECT/i);assert.doesNotMatch(sql,/\b(CREATE|ALTER|DROP|GRANT|REVOKE|UPDATE|INSERT|DELETE)\b/i);return (++count===1?[{major:13,compatibility:130}]:columns) as T[];}});
 assert.equal(count,2);assert.equal(report.coreCompatible,true);assert.equal(report.activationReady,false);
});

test('M6: Unicode se mide en unidades UTF-16 sin truncado y campos técnicos ASCII',()=>{
 assert.equal(fitsTargetText('COMPUTADORES','COMP_NOMBRE_RED','á'.repeat(50)),true);
 assert.equal(fitsTargetText('COMPUTADORES','COMP_NOMBRE_RED','💻'.repeat(26)),false);
 assert.equal(fitsTargetText('COMPUTADORES','COMP_NOMBRE_RED','💻'.repeat(25)),true);
 assert.equal(fitsTargetText('COMPUTADORES','COMP_DIRECCION_MAC','AA:BB:CC:DD:EE:FF'),true);
 assert.equal(fitsTargetText('COMPUTADORES','COMP_DIRECCION_MAC','é'),false);
 assert.equal(fitsTargetText('USUARIOS','USUA_CLAVE_HASH',null),true);
 assert.equal(fitsTargetText('FUNCIONARIOS','FUNC_NOMBRE_COMPLETO',null),false);
 assert.equal(fitsTargetText('COMPUTADORES','COMP_VELOCIDAD_GHZ',null),false);
});

test('M6: lectura de catálogos SQL Server parametrizada y sin inventar UUID',async()=>{
 const actor=randomUUID(),refs=new Map([[1,randomUUID()],[2,randomUUID()],[3,randomUUID()]]),captured:{sql:string;parameters:readonly SqlReadParameter[]}[]=[];
 const session=new SqlCatalogTransaction({rows:async<T>(sql:string,parameters:readonly import('../../apps/server/modernization/sqlserver-catalogs.js').SqlReadParameter[])=>{captured.push({sql,parameters});const after=Number(parameters.find(p=>p.name==='after')!.value);return [1,2,3].filter(id=>id>after).map(id=>({core_id:id,nombre:'Marca '+id})).slice(0,Number(parameters[0].value)) as T[];}},
  {publicRef:async(_entity,id)=>refs.get(id),coreId:async(_entity,ref)=>[...refs].find(([,value])=>value===ref)?.[0]});
 const backend=new SqlServerCatalogBackend(()=>new Date('2026-11-03T00:00:00Z'));
 const ctx={actorId:actor,role:'lectura' as const,authorizationVersion:'1',permission:'inventario.consultar' as const};
 const request={operation:'C03-01',params:{catalogo:'marcas'},query:{limit:2,q:"x' OR 1=1--"},body:undefined};
 const page=await backend.executeAtomic(ctx,request,session);assert.equal(page.items.length,2);assert(page.nextCursor);
 assert(!captured[0].sql.includes("OR 1=1"));assert(captured[0].parameters.some(p=>p.name==='search'&&p.value===request.query.q));
 assert.deepEqual(Object.keys(page.items[0]).sort(),['nombre','ref']);assert.equal(page.items[0].ref,refs.get(1));
 const next=await backend.executeAtomic(ctx,{...request,query:{...request.query,cursor:page.nextCursor}},session);assert.equal(next.items[0].ref,refs.get(3));
 await assert.rejects(backend.executeAtomic(ctx,{...request,params:{catalogo:'__proto__'}},session));
 await assert.rejects(backend.executeAtomic(ctx,{...request,query:{...request.query,marcaRef:randomUUID()}},session));
 const missing=new SqlCatalogTransaction(session.sql,{publicRef:async()=>undefined,coreId:async()=>undefined});
 await assert.rejects(backend.executeAtomic(ctx,request,missing),e=>Boolean((e as any).code==='MODEL_REFERENCE_NOT_READY'));
 await assert.rejects(backend.executeAtomic(ctx,request,{}),e=>Boolean((e as any).code==='MODEL_TRANSACTION_NOT_READY'));
});
