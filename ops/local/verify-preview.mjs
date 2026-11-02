// Verifies an authorized public HTTPS preview using real local GoTrue/PostgreSQL.
// Run with NODE_USE_ENV_PROXY=1 and an assigned HTTPS Tunnelmole origin argument.
// Writes only synthetic aggregates; all credentials and TOTP secrets stay in work/.
import assert from 'node:assert/strict';
import { createHmac, randomUUID, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { Pool } from 'pg';
import { load, directory, root, docker, owned } from './control.mjs';

import { previewOrigin } from './preview-gateway.mjs';
const state={...load(),origin:previewOrigin(process.argv[2]).origin},checks=[];
const record=(name)=>checks.push({name,result:'PASS'});
function totp(secret){
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';
  for(const c of secret.replace(/=+$/,''))bits+=alphabet.indexOf(c.toUpperCase()).toString(2).padStart(5,'0');
  const key=Buffer.from(bits.match(/.{8}/g).map(b=>parseInt(b,2))),counter=Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));
  const d=createHmac('sha1',key).update(counter).digest();
  return ((d.readUInt32BE(d[19]&15)&0x7fffffff)%1000000).toString().padStart(6,'0');
}
async function api(path,session,body,headers={}){
  const response=await fetch(state.origin+path,{method:body===undefined?'GET':'POST',headers:{...(session?{cookie:session.cookie,'x-csrf-token':session.csrf}:{}),...(body===undefined?{}:{origin:state.origin,'content-type':'application/json'}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
  return response;
}
async function login(user){
  const response=await api('/api/v1/sesion',null,{email:user.email,password:user.password});assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);
  return {...await response.json(),cookie:cookie.split(';')[0]};
}
async function run(){
  assert.equal((await api('/health/live')).status,200);assert.equal((await api('/health/ready')).status,200);record('Public HTTPS via managed proxy; live and ready 200');
  assert.equal((await api('/api/v1/bienes')).status,401);record('Inventory without session denied');
  const noOrigin=await fetch(state.origin+'/api/v1/sesion',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(noOrigin.status,403);record('Mutation without approved Origin denied');
  const reader=await login(state.users.find(u=>u.email==='smoke-lectura@example.invalid'));
  assert.equal(reader.mfaRequired,false);
  const list=await api('/api/v1/bienes',reader);assert.equal(list.status,200);assert((await list.json()).items.length>=3);
  assert.equal((await api('/api/v1/admin/cuentas',reader)).status,403);record('Public reader login, inventory read and admin denial with real local identity');
  let admin=await login(state.users.find(u=>u.email==='smoke-admin@example.invalid'));
  assert.equal(admin.mfaRequired,true);assert.equal((await api('/api/v1/bienes',admin)).status,403);record('Administrator without MFA denied');
  const factorPath=resolve(directory,'smoke-factor.json');let factor;
  if(existsSync(factorPath))factor=JSON.parse(readFileSync(factorPath,'utf8'));
  else{const response=await api('/api/v1/sesion/mfa/enrolar',admin,{});assert.equal(response.status,200);factor=await response.json();writeFileSync(factorPath,JSON.stringify(factor),{mode:0o600});chmodSync(factorPath,0o600);}
  const verified=await api('/api/v1/sesion/mfa/verificar',admin,{factor:factor.id,code:totp(factor.secret)});assert.equal(verified.status,200);
  admin={csrf:(await verified.json()).csrf,cookie:verified.headers.get('set-cookie').split(';')[0]};
  assert.equal((await api('/api/v1/admin/cuentas',admin)).status,200);record('Real GoTrue TOTP MFA, cookie rotation and admin access');
  const data={codigo:'LOCAL-SMOKE-'+randomUUID(),tipo:'Computador',marca:'Sintética',modelo:'Prueba local',condicion:'bueno',motivo_sin_serie:'Ensayo sintético',motivo:'Verificar servidor local'};
  const key=randomUUID(),headers={'idempotency-key':key};
  assert.equal((await api('/api/v1/bienes',reader,data,headers)).status,403);
  assert.equal((await api('/api/v1/bienes',admin,data,{...headers,'x-csrf-token':'invalid'})).status,403);
  const created=await api('/api/v1/bienes',admin,data,headers);assert.equal(created.status,201);const item=await created.json();
  const replay=await api('/api/v1/bienes',admin,data,headers);assert.equal(replay.status,201);assert.equal((await replay.json()).ref,item.ref);record('Reader write and invalid CSRF denied; admin write and exact replay without duplication');
  const selection={tipo:'inventario',formato:'xlsx',filtros:{}};
  const exp=await api('/api/v1/exportaciones',reader,selection,{'idempotency-key':randomUUID()});assert.equal(exp.status,202);const job=await exp.json();
  let ready=false;for(let i=0;i<100;i++){const status=await api('/api/v1/exportaciones/'+job.ref,reader);assert.equal(status.status,200);if((await status.json()).estado==='listo'){ready=true;break;}await new Promise(r=>setTimeout(r,100));}assert(ready,'Export did not become ready');
  const download=await api('/api/v1/exportaciones/'+job.ref+'/archivo',reader);assert.equal(download.status,200);assert((await download.arrayBuffer()).byteLength>100);
  assert.equal((await api('/api/v1/exportaciones/'+job.ref+'/archivo',admin)).status,404);record('Filtered private XLSX generated and downloaded; another account denied');
  const pool=new Pool({host:state.dbHost,port:state.dbPort,user:'postgres',password:state.dbPassword,database:'postgres'});
  try{
    assert.equal((await pool.query('select count(*)::int n from inventario.bienes where codigo=$1',[data.codigo])).rows[0].n,1);
    const outbox=(await pool.query('select count(*)::int n from inventario.outbox')).rows[0].n;
    assert(outbox>0);const sent=(await pool.query("select count(*)::int n from inventario.outbox where estado in ('aceptado','entregado')")).rows[0].n;assert.equal(sent,0);
    record('SQL persistence and queued notifications; zero accepted/delivered notices');
  }finally{await pool.end();}
  for(const name of [state.db,state.authDb,state.auth]){owned(state,name);assert.equal(docker('port',name),'');}
  assert.equal(docker('network','inspect','--format','{{.Internal}}',state.network),'true');record('Containers in internal network with no published DB/Auth ports');
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY}});
  try{
    const page=await browser.newPage();page.setDefaultTimeout(60000);const user=state.users.find(u=>u.email==='smoke-lectura@example.invalid');
    await page.goto(state.origin,{waitUntil:"domcontentloaded",timeout:60000});await page.getByLabel('Correo',{exact:true}).fill(user.email);await page.getByLabel('Contraseña',{exact:true}).fill(user.password);await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();
    await page.getByRole('button',{name:'Cerrar sesión',exact:true}).waitFor();
    await page.getByRole('link',{name:'Bienes',exact:true}).click();await page.getByText('LOCAL-1',{exact:true}).waitFor();
    assert.equal(await page.getByRole('link',{name:'Administración',exact:true}).count(),0);
    await page.screenshot({path:resolve(directory,'public-lectura.png'),fullPage:true});
    await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await page.getByRole('button',{name:'Iniciar sesión',exact:true}).waitFor();record('Public Chromium via proxy, TLS verification enabled: real reader login, inventory and logout');
  }finally{await browser.close();}
  for(const session of[reader,admin])assert.equal((await api('/api/v1/sesion/salir',session,{})).status,204);
  assert.equal((await api('/api/v1/bienes',reader)).status,401);record('Logout revokes local session');
  const report={date:new Date().toISOString(),scope:'public HTTPS via managed proxy and Chromium Linux; user Windows observation is separate',origin:state.origin,repositoryHead:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),localScripts:Object.fromEntries(['control.mjs','serve.mjs','verify-preview.mjs','preview-gateway.mjs','preview-tunnel.mjs'].map(file=>[file,createHash('sha256').update(readFileSync(resolve(root,'ops/local',file))).digest('hex')])),checks,frontendSourceSha256:createHash('sha256').update(readFileSync(resolve(root,'apps/web/src/main.tsx'))).digest('hex'),mailEnabled:false,managedIntegrations:false,production:false};
  writeFileSync(resolve(directory,'public-verification.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify(report,null,2));
}
run().catch(error=>{console.error('Local verification failed: '+(error.code??error.name)+'; no credentials printed.');process.exitCode=1;});
