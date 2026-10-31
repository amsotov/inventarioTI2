import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { Pool } from 'pg';
import { SupabaseProvider } from '../../apps/server/auth/supabase.js';
const pgImage='postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f';
const authImage='supabase/gotrue:v2.197.0@sha256:1736a63078f5922b198c4cbe50f80ab9a2d3b54fe8b7b6cfb2e9dc5dbbc12c6b';
const docker=(...args:string[])=>execFileSync('docker',args,{encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
function jwt(role:string,secret:string){const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');const payload=encode({alg:'HS256',typ:'JWT'})+'.'+encode({role,iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600});return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');}
function totp(secret:string){const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of secret.replace(/=+$/,''))bits+=alphabet.indexOf(c.toUpperCase()).toString(2).padStart(5,'0');const key=Buffer.from(bits.match(/.{8}/g)!.map(b=>parseInt(b,2)));const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const d=createHmac('sha1',key).update(counter).digest();return ((d.readUInt32BE(d[19]&15)&0x7fffffff)%1000000).toString().padStart(6,'0');}
test('adaptador real: GoTrue local, sin proyecto gestionado ni correo externo',async()=>{
 const suffix=randomUUID(),network='auth-net-'+suffix,pg='auth-db-'+suffix,auth='auth-provider-'+suffix;
 const password=randomBytes(24).toString('hex'),secret=randomBytes(48).toString('hex');
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
 }catch(e){
   const logs=spawnSync('docker',['logs',auth],{encoding:'utf8'});
   for(const line of (logs.stdout+logs.stderr).split('\n')){try{const row=JSON.parse(line);if(row.level==='error'||row.level==='fatal')console.error(String(row.error??row.msg).replaceAll(password,'[redacted]').replaceAll(secret,'[redacted]').slice(0,500));}catch{}}
   throw e;
 }finally{await new Promise<void>(r=>gateway?gateway.close(()=>r()):r());await pool?.end();try{docker('rm','-f','-v',auth);}catch{}try{docker('rm','-f','-v',pg);}catch{}docker('network','rm',network);}
});
