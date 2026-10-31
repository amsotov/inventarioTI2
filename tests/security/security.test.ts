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
test('Fase 6: roles operativos reales, RLS y seguridad (identidad doble)',async t=>{
 const name='inventario-security-'+randomUUID(),password=randomBytes(24).toString('hex');
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
  const count=async(c:any,table:string)=>(await c.query('select count(*)::int n from '+table)).rows[0].n;
  await t.test('matriz cerrada, ambos roles y permisos desconocidos',()=>{
   for(const p of permissions){assert(allowed('administrador',p));assert.equal(allowed('lectura',p),['inventario.consultar','historial.consultar','reportes.exportar'].includes(p));}
   assert(!allowed('administrador','historial.borrar'));assert(!allowed('superadmin','inventario.consultar'));
  });
  await t.test('identidades SQL mínimas y arranque rechaza propietario',async()=>{
   await assertDatabaseRole(authPool!,'inventario_auth');await assertDatabaseRole(business!,'inventario_runtime');await assert.rejects(assertDatabaseRole(root!,'inventario_auth'));
   await assert.rejects(authPool!.query('select * from inventario.bienes'));await assert.rejects(authPool!.query("update inventario.cuentas set rol='administrador' where id=$1",[reader]));
   await assert.rejects(business!.query('select * from acceso.sesiones'));
  });
  await t.test('sin contexto no hay filas; GUC de rol/actor falsificado no autoriza',async()=>{
   await business!.query("select set_config('inventario.rol','administrador',false),set_config('inventario.actor',$1,false)",[admin]);
   assert.equal(await count(business,'inventario.unidades'),0);assert.equal(await count(business,'inventario.cuentas'),0);
   assert.equal((await business!.query('select * from seguridad.principal()')).rowCount,0);
  });
  await t.test('lector consulta inventario compartido; cuentas/config/auditoría ocultas',async()=>{
   await security.run(r.sid,'inventario.consultar',async c=>{
    assert.equal(await count(c,'inventario.unidades'),1);
    for(const table of ['cuentas','auditoria','configuracion_avisos'])assert.equal(await count(c,'inventario.'+table),0);
   });
   assert.equal(await count(business,'inventario.unidades'),0);
  });
  await t.test('lectura no administra ni exporta auditoría; denegación durable sin callback',async()=>{
   for(const permission of ['cuentas.administrar','auditoria.consultar','auditoria.exportar','inventario.modificar'] as const){let called=false;await assert.rejects(security.run(r.sid,permission,async()=>{called=true;}),{code:'FORBIDDEN'});assert(!called);}
   assert.equal((await root!.query('select count(*)::int n from seguridad.eventos where not permitido')).rows[0].n,4);
  });
  await t.test('administrador con MFA consulta cuentas; sesión parcial denegada',async()=>{
   await assert.rejects(security.run(partial.sid,'cuentas.administrar',async()=>{}));
   await security.run(a.sid,'cuentas.administrar',async c=>assert.equal(await count(c,'inventario.cuentas'),2),a.csrf);
  });
  await t.test('escritura genérica cerrada incluso administrador; bitácora inmutable',async()=>{
   await assert.rejects(security.run(a.sid,'inventario.modificar',async c=>{await c.query("insert into inventario.unidades(nombre) values('No')");},a.csrf));
   for(const q of ['delete from seguridad.eventos','update seguridad.eventos set permitido=true','truncate seguridad.eventos','delete from inventario.auditoria','truncate inventario.movimientos'])await assert.rejects(business!.query(q));
   await assert.rejects(root!.query('update seguridad.eventos set permitido=true'));
   await assert.rejects(security.run(r.sid,'inventario.consultar',async c=>{await c.query("insert into seguridad.eventos(actor_id,permiso,permitido) values($1,'inventario.consultar',true)",[admin]);}));
  });
  await t.test('pool limpio tras rollback y contexto inyectado no es SQL',async()=>{
   assert.equal(await count(business,'inventario.unidades'),0);
   await business!.query("select set_config('inventario.sesion',$1,false)",["' OR 1=1 --"]);
   assert.equal(await count(business,'inventario.unidades'),0);
   await business!.query("select set_config('inventario.sesion','',false)");
  });
  await t.test('RLS rechaza huella revocada, expirada, versión/estado/credencial/MFA inválidos',async()=>{
   const check=async(sid:string)=>{await business!.query('begin');try{await business!.query("select set_config('inventario.sesion',$1,true)",[hash(sid)]);assert.equal(await count(business,'inventario.unidades'),0);}finally{await business!.query('rollback');}};
   for(const change of [{revoked:true},{created:Date.now()-28800000},{activity:Date.now()-1800000},{version:'999'}]){
    await root!.query('update acceso.sesiones set datos=datos || $2::jsonb where huella=$1',[hash(r.sid),JSON.stringify(change)]);await check(r.sid);
    await root!.query('update acceso.sesiones set datos=datos || $2::jsonb where huella=$1',[hash(r.sid),JSON.stringify({revoked:false,created:Date.now(),activity:Date.now(),version:'1'})]);
   }
   await root!.query("update inventario.cuentas set estado='inactiva' where id=$1",[reader]);await check(r.sid);await assert.rejects(security.run(r.sid,'inventario.consultar',async()=>{}));
   await root!.query("update inventario.cuentas set estado='activa',credencial_lista=false where id=$1",[reader]);await check(r.sid);await assert.rejects(security.run(r.sid,'inventario.consultar',async()=>{}));
   await root!.query('update inventario.cuentas set credencial_lista=true where id=$1',[reader]);
   await root!.query("update acceso.sesiones set datos=jsonb_set(datos,'{mfa}','false') where huella=$1",[hash(a.sid)]);await check(a.sid);
   await root!.query("update acceso.sesiones set datos=jsonb_set(datos,'{mfa}','true') where huella=$1",[hash(a.sid)]);
  });
  await t.test('operación en curso mantiene lock frente a revocación; siguiente petición denegada',async()=>{
   let revoked=false;let revoke:Promise<unknown>|undefined;
   await security.run(r.sid,'inventario.consultar',async c=>{
    revoke=root!.query('update inventario.cuentas set version_autorizacion=version_autorizacion+1 where id=$1',[reader]).then(()=>{revoked=true;});
    await new Promise(resolve=>setTimeout(resolve,70));assert(!revoked);
    assert.equal(await count(c,'inventario.unidades'),1);
   });
   await revoke;assert(revoked);await assert.rejects(security.run(r.sid,'inventario.consultar',async()=>{}));
   await root!.query('update inventario.cuentas set version_autorizacion=1 where id=$1',[reader]);
  });
  await t.test('mutación administrativa exige CSRF incluso si el llamador lo omite',async()=>{
   let called=false;await assert.rejects(security.run(a.sid,'cuentas.administrar',async()=>{called=true;}),{code:'FORBIDDEN'});assert(!called);
   await assert.rejects(security.run(a.sid,'cuentas.administrar',async()=>{},'wrong'),{code:'FORBIDDEN'});
  });
  await t.test('fallo de proveedor cierra acceso; sin sesión ni SID falsificado',async()=>{
   provider.fail=true;await assert.rejects(security.run(r.sid,'inventario.consultar',async()=>{}),{code:'DEPENDENCY_UNAVAILABLE'});provider.fail=false;
   for(const sid of ['',"' OR 1=1 --",'fake'])await assert.rejects(security.run(sid,'inventario.consultar',async()=>{}));
  });
  await t.test('anon/authenticated sin acceso privado ni ejecución de lookup',async()=>{
   for(const role of ['anon','authenticated']){const c=await root!.connect();try{await c.query('set role '+role);await assert.rejects(c.query('select * from inventario.cuentas'));await assert.rejects(c.query('select * from seguridad.principal()'));}finally{await c.query('reset role');c.release();}}
  });
  await t.test('privacidad por proyección positiva sin documento/correo/campos nuevos',()=>{
   const projected=publicEmployee({id:reader,nombre:'Sintético',cargo:'Prueba',unidad_id:'u',activo:true,documento:'PRIVATE',correo:'PRIVATE',secret:'PRIVATE'});
   assert(!JSON.stringify(projected).includes('PRIVATE'));
  });
  await t.test('cabeceras, XSS, CSRF/Origin, inyección, payload y errores sin secretos',async()=>{
   const server=app(auth,'https://inventario.test');
   try{
    const page=await server.inject('/acceso?token=%3Cscript%3Ealert(1)%3C/script%3E');assert(!page.body.includes('alert(1)'));assert.match(page.headers['content-security-policy'] as string,/frame-ancestors 'none'/);assert.equal(page.headers['cache-control'],'no-store');
    assert.equal((await server.inject({method:'POST',url:'/api/v1/sesion',headers:{origin:'https://evil.test'},payload:{}})).statusCode,403);
    const cookie='__Host-inventario='+r.sid;
    assert.equal((await server.inject({method:'POST',url:'/api/v1/sesion/actividad',headers:{origin:'https://inventario.test',cookie,'x-csrf-token':'wrong'},payload:{}})).statusCode,403);
    assert.equal((await server.inject({method:'POST',url:'/api/v1/sesion',headers:{origin:'https://inventario.test'},payload:{email:'reader@example.invalid',password:'x'.repeat(9000)}})).statusCode,413);
    const error=await server.inject({url:'/api/v1/sesion',headers:{cookie:'__Host-inventario=\' OR 1=1 --'}});assert.equal(error.statusCode,401);assert(!error.body.includes('select'));
   }finally{await server.close();}
  });
 }finally{await business?.end();await authPool?.end();await root?.end();docker('rm','-f','-v',name);}
});
