import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes,randomUUID } from 'node:crypto';
import { readFileSync,readdirSync } from 'node:fs';
import { Pool } from 'pg';
import { Postgres } from '../../apps/server/auth/postgres.js';
import { AuthService } from '../../apps/server/auth/service.js';
import { Vault,hash } from '../../apps/server/auth/crypto.js';
import { Authorization,assertDatabaseRole } from '../../apps/server/security/postgres.js';
import { allowed,permissions,publicEmployee } from '../../apps/server/security/policy.js';
import { Inventory } from '../../apps/server/inventory/service.js';
import { app } from '../../apps/server/app.js';
import type { Provider,Tokens } from '../../apps/server/auth/ports.js';
const reader='10000000-0000-4000-8000-000000000001',admin='10000000-0000-4000-8000-000000000002';
class IdentityDouble implements Provider {
  fail=false;
  async login(email:string){return {userId:email.startsWith('admin')?admin:reader,access_token:email.startsWith('admin')?'admin':'reader',refresh_token:'synthetic',aal:'aal1' as const};}
  async validate(t:Tokens){if(this.fail)throw Error('secret-provider-detail');return {...t,userId:t.access_token.startsWith('admin')?admin:reader,aal:t.access_token==='admin2'?'aal2' as const:'aal1' as const};}
  async verify(){return {userId:admin,access_token:'admin2',refresh_token:'synthetic',aal:'aal2' as const};}
  async factors(){return [];}
  async enroll(){return {id:'factor',qr:'qr',secret:'secret'};}
  async link(){return {userId:reader,hash:'synthetic'};}
  async complete(){return reader;}
  async logout(){}
}
test('Fase 7: composición HTTP/Auth/RLS/PostgreSQL (identidad doble)',async t=>{
 const name='inventario-api-'+randomUUID(),password=randomBytes(24).toString('hex');
 const docker=(...args:string[])=>execFileSync('docker',args,{encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
 docker('run','-d','--name',name,'-e','POSTGRES_PASSWORD='+password,'-p','127.0.0.1::5432','postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f');
 let root:Pool|undefined,authPool:Pool|undefined,business:Pool|undefined;
 try {
  const cfg={host:'127.0.0.1',port:Number(docker('port',name,'5432/tcp').split(':').at(-1)),password,database:'postgres',max:1,statement_timeout:5000,connectionTimeoutMillis:5000};
  root=new Pool({...cfg,user:'postgres'});
  let ready=false;for(let i=0;i<100;i++){try{await root.query('select 1');ready=true;break;}catch{await new Promise(r=>setTimeout(r,200));}}assert(ready);
  await root.query('create role anon; create role authenticated;');
  for(const file of readdirSync('supabase/migrations').sort())await root.query(readFileSync('supabase/migrations/'+file,'utf8'));
  // Credenciales exclusivamente efímeras del ensayo, nunca generadas por la migración.
  await root.query(`alter role inventario_auth login password '${password}'; alter role inventario_runtime login password '${password}'`);
  authPool=new Pool({...cfg,user:'inventario_auth'});business=new Pool({...cfg,user:'inventario_runtime'});
  await root.query(`insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,'Lectura','reader@example.invalid','lectura','activa',true),($2,$2,'Admin','admin@example.invalid','administrador','activa',true)`,[reader,admin]);
  await root.query("insert into inventario.unidades(nombre) values ('Unidad sintética')");
  const provider=new IdentityDouble(),auth=new AuthService(new Postgres(authPool),provider,new Vault(randomBytes(32).toString('base64')),'https://inventario.test');
  const security=new Authorization(auth,business),r=await auth.login('reader@example.invalid','synthetic'),partial=await auth.login('admin@example.invalid','synthetic');
  const a=await auth.verify(partial.sid,partial.csrf,'factor','123456');
  const server=app(auth,'https://inventario.test',new Inventory(security));
  const headers=(session=a)=>({cookie:'__Host-inventario='+session.sid,origin:'https://inventario.test','x-csrf-token':session.csrf,'idempotency-key':randomUUID()});
  const body={codigo:' DEMO-01 ',serie:null,motivo_sin_serie:'Sin serie verificable',tipo:'Notebook',marca:'Marca',modelo:'Modelo',condicion:'bueno',motivo:'Alta sintética',adquisicion:'2026-10-31'};
  const post=(h=headers(),payload:object=body)=>server.inject({method:'POST',url:'/api/v1/bienes',headers:h,payload});
  try{
   await t.test('sin sesión, lectura, CSRF y Origin denegados',async()=>{
    assert.equal((await server.inject('/api/v1/bienes')).statusCode,401);
    assert.equal((await post(headers(r))).statusCode,403);
    assert.equal((await post({...headers(),'x-csrf-token':'incorrecto'})).statusCode,403);
    assert.equal((await post({...headers(),origin:'https://evil.test'})).statusCode,403);
   });
   await t.test('validación estricta y errores sin detalles SQL',async()=>{
    for(const payload of [{...body,actor:admin},{...body,codigo:32},{...body,adquisicion:'2026-02-30'},{...body,condicion:'desconocido'}])assert.equal((await post(headers(),payload)).statusCode,400);
    const response=await post(headers(),{...body,motivo_sin_serie:null});assert.equal(response.statusCode,422);assert(!response.body.includes('select'));
   });
   await t.test('fallo de configuración revierte bien/comando/auditoría/outbox',async()=>{
    const res=await post();assert.equal(res.statusCode,503,res.body);assert.equal(res.json().code,'NOTIFICATION_NOT_CONFIGURED');
    for(const table of ['bienes','comandos','auditoria','outbox'])assert.equal((await root!.query('select count(*)::int n from inventario.'+table)).rows[0].n,0);
    await root!.query("insert into inventario.configuracion_avisos(destinatario) values('encargado@example.invalid')");
   });
   let ref='';
   await t.test('alta/replay tras respuesta perdida y conflicto de payload',async()=>{
    const h=headers(),first=await post(h);assert.equal(first.statusCode,201,first.body);ref=first.json().ref;assert.equal(first.headers.etag,'"v1"');
    assert.deepEqual((await post(h)).json(),first.json());
    assert.equal((await post(h,{...body,modelo:'Otro'})).statusCode,409);
    for(const table of ['bienes','comandos','auditoria','outbox'])assert.equal((await root!.query('select count(*)::int n from inventario.'+table)).rows[0].n,1);
    const out=(await root!.query('select * from inventario.outbox')).rows[0];assert.equal(out.destinatario,'encargado@example.invalid');assert.equal(out.estado,'pendiente');
   });
   await t.test('unicidad canónica y falta de serie inválida',async()=>{
    assert.equal((await post(headers(),{...body,codigo:'demo-01'})).statusCode,409);
   });
   await t.test('edición: versión requerida, obsoleta y replay antes de versión',async()=>{
    const {condicion,...edit}=body;const h=headers();
    const patch=(head:Record<string,string>,payload:object=edit)=>server.inject({method:'PATCH',url:'/api/v1/bienes/'+ref,headers:head,payload});
    assert.equal((await patch(h)).statusCode,428);
    assert.equal((await patch({...h,'if-match':'"v2"'})).statusCode,412);
    const ok=await patch({...h,'if-match':'"v1"'});assert.equal(ok.statusCode,200,ok.body);assert.equal(ok.json().version,2);
    assert.deepEqual((await patch({...h,'if-match':'"v1"'})).json(),ok.json());
    assert.equal((await patch({...headers(),'if-match':'"v2"'},body)).statusCode,400);
   });
   await t.test('dos actualizaciones concurrentes: una gana, otra 412',async()=>{
    const {condicion,...edit}=body;
    const run=()=>server.inject({method:'PATCH',url:'/api/v1/bienes/'+ref,headers:{...headers(),'if-match':'"v2"'},payload:edit});
    assert.deepEqual((await Promise.all([run(),run()])).map(x=>x.statusCode).sort(),[200,412]);
   });
   await t.test('repetición concurrente no duplica efectos',async()=>{
    const h=headers(),payload={...body,codigo:'DEMO-02'};
    const all=await Promise.all([post(h,payload),post(h,payload)]);assert(all.every(x=>x.statusCode===201));assert.deepEqual(all[0].json(),all[1].json());
    assert.equal((await root!.query('select count(*)::int n from inventario.bienes')).rows[0].n,2);
   });
   await t.test('consultas, ETag, filtros UTC y cursor ligado a filtros',async()=>{
    const h=headers(r),first=await server.inject({url:'/api/v1/bienes?limit=1',headers:h});assert.equal(first.statusCode,200,first.body);assert.equal(first.json().items.length,1);assert(first.json().nextCursor);
    const cursor=first.json().nextCursor;
    const invalid=JSON.parse(Buffer.from(cursor,'base64url').toString());invalid.id='-'.repeat(36);
    assert.equal((await server.inject({url:'/api/v1/bienes?cursor='+Buffer.from(JSON.stringify(invalid)).toString('base64url'),headers:h})).statusCode,400);
    const second=await server.inject({url:'/api/v1/bienes?limit=1&cursor='+cursor,headers:h});assert.equal(second.json().items.length,1);assert.notEqual(first.json().items[0].id,second.json().items[0].id);
    assert.equal((await server.inject({url:'/api/v1/bienes?limit=1&q=other&cursor='+cursor,headers:h})).statusCode,400);
    for(const url of ['/api/v1/bienes?limit=101','/api/v1/bienes?desde=2026-11-01&hasta=2026-10-01','/api/v1/bienes?actor=forged','/api/v1/bienes?cursor=broken'])assert.equal((await server.inject({url,headers:h})).statusCode,400);
    assert.equal((await server.inject({url:'/api/v1/bienes?desde=2026-10-31&hasta=2026-10-31',headers:h})).json().items.length,2);
    assert.equal((await server.inject({url:'/api/v1/bienes?q=%27%20OR%201%3D1--',headers:h})).json().items.length,0);
    const detail=await server.inject({url:'/api/v1/bienes/'+ref,headers:h});assert.equal(detail.headers.etag,'"v3"');
    assert.equal((await server.inject({url:'/api/v1/bienes/'+randomUUID(),headers:h})).statusCode,404);
   });
   await t.test('dos conexiones SQL reales compiten por versión sin locks de Auth',async()=>{
    const parallel=new Pool({...cfg,user:'inventario_runtime',max:2});
    const {condicion,...edit}=body;
    const run=async()=>{const c=await parallel.connect();try{
     await c.query('begin');await c.query("select set_config('inventario.sesion',$1,true)",[hash(a.sid)]);
     const result=await c.query('select inventario.guardar_bien($1,$2,3,$3) result',[ref,randomUUID(),edit]);
     await c.query('commit');return result.rows[0].result.version;
    }catch(e){await c.query('rollback');return (e as Error).message;}finally{c.release();}};
    try{const results=await Promise.all([run(),run()]);assert(results.includes(4));assert(results.includes('VERSION_MISMATCH'));}finally{await parallel.end();}
   });
   await t.test('fallo final del outbox revierte toda la evidencia',async()=>{
    const tables=['bienes','comandos','auditoria','outbox'];
    const counts=async()=>Promise.all(tables.map(async table=>(await root!.query('select count(*)::int n from inventario.'+table)).rows[0].n));
    const before=await counts();
    await root!.query("create function inventario.fallo_sintetico() returns trigger language plpgsql as $$ begin raise exception 'FALLO_SINTETICO'; end $$; create trigger fallo_sintetico before insert on inventario.outbox for each row execute function inventario.fallo_sintetico()");
    const h=headers(),payload={...body,codigo:'ROLLBACK-DEMO'};
    try{assert.equal((await post(h,payload)).statusCode,503);assert.deepEqual(await counts(),before);}
    finally{await root!.query('drop trigger fallo_sintetico on inventario.outbox; drop function inventario.fallo_sintetico()');}
    assert.equal((await post(h,payload)).statusCode,201);
   });
   await t.test('proyección positiva de funcionarios',async()=>{
    await root!.query("insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,correo,unidad_id) select 'ID','PRIVATE-ID','Persona','Cargo','private@example.invalid',id from inventario.unidades limit 1");
    const response=await server.inject({url:'/api/v1/funcionarios',headers:headers(r)});assert.equal(response.statusCode,200);assert(!response.body.includes('PRIVATE'));assert(!response.body.includes('private@'));assert(!response.body.includes('documento'));
   });
   await t.test('runtime no obtiene DML; función deniega sin sesión y para lectura',async()=>{
    await assert.rejects(business!.query("insert into inventario.bienes(codigo) values('bypass')"));
    await assert.rejects(business!.query('select inventario.guardar_bien(null,$1,null,$2)',[randomUUID(),body]));
    await assert.rejects(security.run(r.sid,'inventario.consultar',db=>db.query('select inventario.guardar_bien(null,$1,null,$2)',[randomUUID(),body])));
   });
   await t.test('revocación vigente impide replay y lectura',async()=>{
    await root!.query('update inventario.cuentas set version_autorizacion=version_autorizacion+1 where id=$1',[reader]);
    assert.equal((await server.inject({url:'/api/v1/bienes',headers:headers(r)})).statusCode,401);
   });
  }finally{await server.close();}
 }finally{await business?.end();await authPool?.end();await root?.end();docker('rm','-f','-v',name);}
});
