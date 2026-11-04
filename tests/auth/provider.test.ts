import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { Pool } from 'pg';
import { readFileSync,readdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '../../apps/server/auth/service.js';
import { Vault,hash } from '../../apps/server/auth/crypto.js';
import type { Tokens } from '../../apps/server/auth/ports.js';
import { Postgres } from '../../apps/server/auth/postgres.js';
import { Authorization } from '../../apps/server/security/postgres.js';
import { Inventory } from '../../apps/server/inventory/service.js';
import { postgresInventory } from '../../apps/server/inventory/postgres.js';
import { app } from '../../apps/server/app.js';
import { SupabaseProvider } from '../../apps/server/auth/supabase.js';
const pgImage='postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f';
const authImage='supabase/gotrue:v2.197.0@sha256:1736a63078f5922b198c4cbe50f80ab9a2d3b54fe8b7b6cfb2e9dc5dbbc12c6b';
const docker=(...args:string[])=>execFileSync('docker',args,{encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
function jwt(role:string,secret:string){const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');const payload=encode({alg:'HS256',typ:'JWT'})+'.'+encode({role,iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600});return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');}
function totp(secret:string){const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of secret.replace(/=+$/,''))bits+=alphabet.indexOf(c.toUpperCase()).toString(2).padStart(5,'0');const key=Buffer.from(bits.match(/.{8}/g)!.map(b=>parseInt(b,2)));const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const d=createHmac('sha1',key).update(counter).digest();return ((d.readUInt32BE(d[19]&15)&0x7fffffff)%1000000).toString().padStart(6,'0');}
test('adaptador real: GoTrue local, sin proyecto gestionado ni correo externo',async()=>{
 const suffix=randomUUID(),network='auth-net-'+suffix,pg='auth-db-'+suffix,auth='auth-provider-'+suffix;
 const password=randomBytes(24).toString('hex'),secret=randomBytes(48).toString('hex');
 let authPool:Pool|undefined,businessPool:Pool|undefined,application:ReturnType<typeof app>|undefined;
 let pool:Pool|undefined;let gateway:ReturnType<typeof createServer>|undefined;
 docker('network','create',network);
 try{
  docker('run','-d','--name',pg,'--network',network,'-e','POSTGRES_PASSWORD='+password,'-p','127.0.0.1::5432',pgImage);
  const pgPort=Number(docker('port',pg,'5432/tcp').split(':').at(-1));pool=new Pool({host:'127.0.0.1',port:pgPort,user:'postgres',password,database:'postgres'});
  let ready=false;for(let n=0;n<100;n++){try{await pool.query('select 1');ready=true;break;}catch{await new Promise(r=>setTimeout(r,200));}}assert(ready);await pool.query('create schema auth');await pool.query('alter role postgres set search_path=auth,public');
  const env:Record<string,string>={GOTRUE_API_HOST:'0.0.0.0',PORT:'9999',GOTRUE_API_PORT:'9999',API_EXTERNAL_URL:'http://localhost:9999',GOTRUE_DB_DRIVER:'postgres',GOTRUE_DB_DATABASE_URL:`postgres://postgres:${password}@${pg}:5432/postgres?sslmode=disable`,GOTRUE_SITE_URL:'https://inventario.test',GOTRUE_DISABLE_SIGNUP:'true',GOTRUE_JWT_SECRET:secret,GOTRUE_JWT_EXP:'3600',GOTRUE_JWT_ADMIN_ROLES:'service_role',GOTRUE_JWT_AUD:'authenticated',GOTRUE_EXTERNAL_EMAIL_ENABLED:'true',GOTRUE_MAILER_AUTOCONFIRM:'true',GOTRUE_MAILER_OTP_EXP:'86400',GOTRUE_MFA_ENABLED:'true',GOTRUE_MFA_TOTP_ENROLL_ENABLED:'true',GOTRUE_MFA_TOTP_VERIFY_ENABLED:'true'};
  docker('run','-d','--name',auth,'--network',network,...Object.entries(env).flatMap(([k,v])=>['-e',k+'='+v]),'-p','127.0.0.1::9999',authImage);
  const port=docker('port',auth,'9999/tcp').split(':').at(-1),upstream='http://127.0.0.1:'+port;
  ready=false;for(let n=0;n<100;n++){try{const r=await fetch(upstream+'/health');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}
  if(!ready) {const logResult=spawnSync('docker',['logs',auth],{encoding:'utf8'});const logs=logResult.stdout+logResult.stderr;throw new Error('GoTrue not ready: '+logs.slice(-2000).replaceAll(password,'[redacted]').replaceAll(secret,'[redacted]'));}
  gateway=createServer(async(req,res)=>{try{const chunks:Buffer[]=[];for await(const c of req)chunks.push(Buffer.from(c));const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v&&k!=='host'&&k!=='content-length')headers.set(k,Array.isArray(v)?v.join(','):v);const r=await fetch(upstream+req.url!.replace(/^\/auth\/v1/,''),{method:req.method,headers,body:chunks.length?Buffer.concat(chunks):undefined});res.writeHead(r.status,{'content-type':'application/json'});res.end(await r.text());}catch{res.writeHead(502);res.end('{}');}});
  await new Promise<void>(r=>gateway!.listen(0,'127.0.0.1',r));const address=gateway.address();assert(address&&typeof address!=='string');const url='http://127.0.0.1:'+address.port;
  const provider=new SupabaseProvider(url,jwt('anon',secret),jwt('service_role',secret));
  const link=await provider.link('invited@example.invalid','invite');assert(link.userId);assert(link.hash);
  assert.equal(await provider.complete(link.hash,'invite','synthetic-password-1234',link.userId),link.userId);
  await assert.rejects(provider.complete(link.hash,'invite','synthetic-password-other',link.userId));
  const login=await provider.login('invited@example.invalid','synthetic-password-1234');assert.equal(login.userId,link.userId);assert.equal(login.aal,'aal1');
  assert.equal((await provider.validate(login)).userId,link.userId);
  const factor=await provider.enroll(login);assert(factor.secret);assert(factor.qr);
  const verified=await provider.verify(login,factor.id,totp(factor.secret));assert.equal(verified.aal,'aal2');assert.equal((await provider.validate(verified)).aal,'aal2');
  await assert.rejects(provider.verify(login,factor.id,'000000'));
  const recovery=await provider.link('invited@example.invalid','recovery');
  // Recuperar contraseña conserva el segundo factor; nunca lo recupera ni elimina.
  await provider.complete(recovery.hash,'recovery','synthetic-password-new-1234',link.userId);
  await assert.rejects(provider.login('invited@example.invalid','synthetic-password-1234'));
  const next=await provider.login('invited@example.invalid','synthetic-password-new-1234');assert.equal(next.aal,'aal1');assert((await provider.factors(next)).some(f=>f.id===factor.id));await assert.rejects(provider.enroll(next));
  const userResponse=await fetch(upstream+'/user',{headers:{Authorization:'Bearer '+next.access_token}});const user=await userResponse.json() as {factors:{id:string;status:string}[]};assert(user.factors.some(f=>f.id===factor.id && f.status==='verified'));
  await provider.logout(next);
  await assert.rejects(provider.validate(next),'Un cierre externo no debe dejar utilizable la identidad anterior');
  // M8: composición del BFF con SDK/GoTrue/MFA y PostgreSQL reales, sin proveedor doble.
  // El mismo PostgreSQL de este fixture aloja auth y la app en esquemas separados; no es Supabase gestionado.
  const privileged=await provider.link('admin-local@example.invalid','invite');
  const adminPassword='synthetic-admin-password-1234';
  await provider.complete(privileged.hash,'invite',adminPassword,privileged.userId);
  await pool.query('create role anon;create role authenticated');
  for(const file of readdirSync('supabase/migrations').sort())await pool.query(readFileSync('supabase/migrations/'+file,'utf8'));
  await pool.query(`alter role inventario_auth login password '${password}';alter role inventario_runtime login password '${password}'`);
  await pool.query(`insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,'Lector local','invited@example.invalid','lectura','activa',true),($2,$2,'Admin local','admin-local@example.invalid','administrador','activa',true)`,[link.userId,privileged.userId]);
  await pool.query("insert into inventario.configuracion_avisos(destinatario) values('encargado@example.invalid')");
  // Un usuario puede editar user_metadata; no puede editar los permisos SQL de la aplicación.
  const forged=await provider.login('invited@example.invalid','synthetic-password-new-1234');
  const editable=createClient(url,jwt('anon',secret),{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  assert.equal((await editable.auth.setSession(forged)).error,null);
  assert.equal((await editable.auth.updateUser({data:{rol:'administrador',role:'service_role'}})).error,null);
  authPool=new Pool({host:'127.0.0.1',port:pgPort,user:'inventario_auth',password,database:'postgres',max:2});
  businessPool=new Pool({host:'127.0.0.1',port:pgPort,user:'inventario_runtime',password,database:'postgres',max:2});
  const vault=new Vault(randomBytes(32).toString('base64')),authService=new AuthService(new Postgres(authPool),provider,vault,'https://inventario.test');
  const security=new Authorization(authService,businessPool);application=app(authService,'https://inventario.test',new Inventory(postgresInventory(security)),undefined,security);
  const origin={'origin':'https://inventario.test'};
  const credentials=async(email:string,pass:string)=>{
   const response=await application!.inject({method:'POST',url:'/api/v1/sesion',headers:origin,payload:{email,password:pass}});
   assert.equal(response.statusCode,200,response.body);const cookies=String(response.headers['set-cookie']);
   assert.match(cookies,/HttpOnly/);assert.match(cookies,/Secure/);assert.match(cookies,/SameSite=Strict/);
   assert(!/access_token|refresh_token|password/.test(response.body));
   return {cookie:cookies.split(';')[0],csrf:response.json().csrf,mfa:response.json().mfaRequired};
  };
  const readerSession=await credentials('invited@example.invalid','synthetic-password-new-1234');assert.equal(readerSession.mfa,false);
  const readerStatus=await application.inject({url:'/api/v1/sesion',headers:{cookie:readerSession.cookie}});assert.equal(readerStatus.statusCode,200);assert.equal(readerStatus.json().rol,'lectura');
  const item={codigo:'GOTRUE-01',serie:'SDK-SINTETICA',tipo:'Notebook',marca:'Marca',modelo:'Modelo',condicion:'bueno',motivo:'Ensayo BFF real'};
  const save=(cookie:string,csrf:string)=>application!.inject({method:'POST',url:'/api/v1/bienes',headers:{...origin,cookie,'x-csrf-token':csrf,'idempotency-key':randomUUID()},payload:item});
  assert.equal((await save(readerSession.cookie,readerSession.csrf)).statusCode,403);
  const pending=await credentials('admin-local@example.invalid',adminPassword);assert.equal(pending.mfa,true);
  assert.equal((await application.inject({url:'/api/v1/bienes',headers:{cookie:pending.cookie}})).statusCode,403);
  const enrolled=await application.inject({method:'POST',url:'/api/v1/sesion/mfa/enrolar',headers:{...origin,cookie:pending.cookie,'x-csrf-token':pending.csrf},payload:{}});
  assert.equal(enrolled.statusCode,200,enrolled.body);
  const factorData=enrolled.json();const elevated=await application.inject({method:'POST',url:'/api/v1/sesion/mfa/verificar',headers:{...origin,cookie:pending.cookie,'x-csrf-token':pending.csrf},payload:{factor:factorData.id,code:totp(factorData.secret)}});
  assert.equal(elevated.statusCode,200,elevated.body);assert(!/access_token|refresh_token/.test(elevated.body));
  const cookie=String(elevated.headers['set-cookie']).split(';')[0],csrf=elevated.json().csrf;
  assert.notEqual(cookie,pending.cookie);assert.notEqual(csrf,pending.csrf);
  assert.equal((await application.inject({url:'/api/v1/bienes',headers:{cookie:pending.cookie}})).statusCode,401);
  assert.equal((await save(cookie,'forged')).statusCode,403);
  const created=await save(cookie,csrf);assert.equal(created.statusCode,201,created.body);
  const proof=(await pool.query('select (select count(*) from inventario.comandos)::int commands,(select count(*) from inventario.auditoria)::int audit,(select count(*) from inventario.outbox)::int outbox')).rows[0];assert.deepEqual(proof,{commands:1,audit:1,outbox:1});
  const readerRows=await application.inject({url:'/api/v1/bienes',headers:{cookie:readerSession.cookie}});assert.equal(readerRows.statusCode,200);assert.equal(readerRows.json().items.length,1);
  const sid=cookie.slice('__Host-inventario='.length),sessionRow=(await pool.query('select datos from acceso.sesiones where huella=$1',[hash(sid)])).rows[0].datos;
  await provider.logout(vault.open<Tokens>(sessionRow.vault));
  const revoked=await application.inject({url:'/api/v1/bienes',headers:{cookie}});assert.equal(revoked.statusCode,503);assert(!revoked.body.includes('GOTRUE-01'));
  const closed=await application.inject({method:'POST',url:'/api/v1/sesion/salir',headers:{...origin,cookie,'x-csrf-token':csrf},payload:{}});assert.equal(closed.statusCode,204);
  assert.equal((await application.inject({url:'/api/v1/bienes',headers:{cookie}})).statusCode,401);
  await provider.logout(forged);

 }catch(e){
   const logs=spawnSync('docker',['logs',auth],{encoding:'utf8'});
   for(const line of (logs.stdout+logs.stderr).split('\n')){try{const row=JSON.parse(line);if(row.level==='error'||row.level==='fatal')console.error(String(row.error??row.msg).replaceAll(password,'[redacted]').replaceAll(secret,'[redacted]').slice(0,500));}catch{}}
   throw e;
 }finally{await application?.close();await Promise.all([authPool?.end(),businessPool?.end()]);await new Promise<void>(r=>gateway?gateway.close(()=>r()):r());await pool?.end();try{docker('rm','-f','-v',auth);}catch{}try{docker('rm','-f','-v',pg);}catch{}docker('network','rm',network);}
});
