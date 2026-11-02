// Local synthetic test stack. Never accepts a remote DSN or provider credential.
import { execFileSync, spawn } from 'node:child_process';
import { createHmac, randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync, openSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { Pool } from 'pg';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const directory = resolve(root, 'work/local-inventarioti2');
export const statePath = resolve(directory, 'state.json');
export const pgImage = 'postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f';
export const authImage = 'supabase/gotrue:v2.197.0@sha256:1736a63078f5922b198c4cbe50f80ab9a2d3b54fe8b7b6cfb2e9dc5dbbc12c6b';
const dockerEnv = { ...process.env };
for (const key of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH']) delete dockerEnv[key];
export function docker(...args) {
  try { return execFileSync('docker', ['--host=unix:///var/run/docker.sock', ...args], { env: dockerEnv, encoding:'utf8', stdio:['pipe','pipe','pipe'] }).trim(); }
  catch { throw Error('Local Docker operation failed; no credentials are printed. Check daemon/images and private state.'); }
}
export function save(state) { writeFileSync(statePath, JSON.stringify(state,null,2)+'\n', { mode:0o600 }); chmodSync(statePath,0o600); }
export function load() {
  const state=JSON.parse(readFileSync(statePath,'utf8'));
  if(state.kind!=='inventarioTI2-local-synthetic-v1' || state.directory!==directory) throw Error('Invalid local state');
  return state;
}
export function owned(state, name) {
  const label=docker('container','inspect','--format','{{index .Config.Labels "inventarioTI2.local"}}',name);
  if(label!==state.id) throw Error('Resource ownership mismatch; refusing operation');
}
function privateEnv(file, entries) {
  writeFileSync(resolve(directory,file), Object.entries(entries).map(([k,v])=>k+'='+v).join('\n')+'\n',{mode:0o600});
}
function jwt(role,secret) {
  const encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
  const value=encode({alg:'HS256',typ:'JWT'})+'.'+encode({role,iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+86400*7});
  return value+'.'+createHmac('sha256',secret).update(value).digest('base64url');
}
async function portFree(port) {
  const server=createServer();
  await new Promise((yes,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',yes);});
  const result=server.address().port;
  await new Promise(yes=>server.close(yes));return result;
}
async function readyPool(pool) {
  for(let i=0;i<100;i++){try{await pool.query('select 1');return;}catch{}await new Promise(r=>setTimeout(r,200));}
  throw Error('Local PostgreSQL did not become ready');
}
async function authReady(url) {
  for(let i=0;i<100;i++){try{if((await fetch(url+'/health',{signal:AbortSignal.timeout(1000)})).ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}
  throw Error('Local GoTrue did not become ready');
}
function certificate() {
  const run=(...args)=>execFileSync('openssl',args,{cwd:directory,stdio:['ignore','pipe','pipe']});
  run('req','-x509','-newkey','rsa:2048','-noenc','-keyout','ca.key','-out','ca.crt','-days','7','-subj','/CN=inventarioTI2 LOCAL TEST CA');
  run('req','-newkey','rsa:2048','-noenc','-keyout','server.key','-out','server.csr','-subj','/CN=localhost');
  writeFileSync(resolve(directory,'tls.ext'),'subjectAltName=DNS:localhost,IP:127.0.0.1\nbasicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n');
  run('x509','-req','-in','server.csr','-CA','ca.crt','-CAkey','ca.key','-CAcreateserial','-out','server.crt','-days','7','-extfile','tls.ext');
  for(const file of ['ca.key','server.key'])chmodSync(resolve(directory,file),0o600);
}
async function initialize() {
  if(!existsSync(resolve(root,'dist/apps/server/main.js')))throw Error('Run npm ci and npm run build first');
  await portFree(8443);
  mkdirSync(directory,{recursive:true,mode:0o700});chmodSync(directory,0o700);
  certificate();
  const id=randomUUID(), prefix='it2-local-'+id;
  const secret=randomBytes(48).toString('hex');
  const state={kind:'inventarioTI2-local-synthetic-v1',id,directory,origin:'https://localhost:8443',tlsPort:8443,bffPort:await portFree(0),createdAt:new Date().toISOString(),initialized:false,
    network:prefix+'-net',db:prefix+'-db',authDb:prefix+'-authdb',auth:prefix+'-auth',
    dbPassword:randomBytes(24).toString('hex'),authDbPassword:randomBytes(24).toString('hex'),authPassword:randomBytes(24).toString('hex'),runtimePassword:randomBytes(24).toString('hex'),vault:randomBytes(32).toString('base64'),anonKey:jwt('anon',secret),serviceKey:jwt('service_role',secret),
    users:['admin','lectura','smoke-admin','smoke-lectura'].map(name=>({email:name+'@example.invalid',role:name.includes('admin')?'administrador':'lectura',password:randomBytes(24).toString('base64url')}))};
  save(state);
  docker('network','create','--internal','--label','inventarioTI2.local='+id,state.network);
  for(const [name,password]of[[state.db,state.dbPassword],[state.authDb,state.authDbPassword]]){
    const volume=name+'-data';docker('volume','create','--label','inventarioTI2.local='+id,volume);
    privateEnv(name+'.env',{POSTGRES_PASSWORD:password});
    docker('run','-d','--name',name,'--label','inventarioTI2.local='+id,'--network',state.network,'--env-file',resolve(directory,name+'.env'),'-v',volume+':/var/lib/postgresql/data',pgImage);
  }
  state.dbHost=docker('inspect','--format','{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',state.db);state.dbPort=5432;
  state.authDbHost=docker('inspect','--format','{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',state.authDb);state.authDbPort=5432;save(state);
  const appPool=new Pool({host:state.dbHost,port:state.dbPort,user:'postgres',password:state.dbPassword,database:'postgres',connectionTimeoutMillis:1000});
  const authPool=new Pool({host:state.authDbHost,port:state.authDbPort,user:'postgres',password:state.authDbPassword,database:'postgres',connectionTimeoutMillis:1000});
  try{
    await readyPool(appPool);await readyPool(authPool);
    await authPool.query('create schema auth; alter role postgres set search_path=auth,public');
    const {readdirSync}=await import('node:fs');
    await appPool.query('create role anon;create role authenticated;');
    state.migrations=[];
    for(const file of readdirSync(resolve(root,'supabase/migrations')).sort()){
      const sql=readFileSync(resolve(root,'supabase/migrations',file));await appPool.query(sql.toString());
      state.migrations.push({file,sha256:createHash('sha256').update(sql).digest('hex')});
    }
    // Only generated passwords; values never enter shell arguments or repository.
    await appPool.query(`alter role inventario_auth login password '${state.authPassword}';alter role inventario_runtime login password '${state.runtimePassword}'`);
    privateEnv('auth.env',{GOTRUE_API_HOST:'0.0.0.0',PORT:'9999',GOTRUE_API_PORT:'9999',API_EXTERNAL_URL:state.origin+'/auth/v1',GOTRUE_DB_DRIVER:'postgres',GOTRUE_DB_DATABASE_URL:`postgres://postgres:${state.authDbPassword}@${state.authDb}:5432/postgres?sslmode=disable`,GOTRUE_SITE_URL:state.origin,GOTRUE_DISABLE_SIGNUP:'true',GOTRUE_JWT_SECRET:secret,GOTRUE_JWT_EXP:'3600',GOTRUE_JWT_ADMIN_ROLES:'service_role',GOTRUE_JWT_AUD:'authenticated',GOTRUE_EXTERNAL_EMAIL_ENABLED:'true',GOTRUE_MAILER_AUTOCONFIRM:'true',GOTRUE_MAILER_OTP_EXP:'86400',GOTRUE_MFA_ENABLED:'true',GOTRUE_MFA_TOTP_ENROLL_ENABLED:'true',GOTRUE_MFA_TOTP_VERIFY_ENABLED:'true',GOTRUE_SMTP_HOST:'127.0.0.1',GOTRUE_SMTP_PORT:'1025',GOTRUE_SMTP_ADMIN_EMAIL:'no-send@example.invalid'});
    docker('run','-d','--name',state.auth,'--label','inventarioTI2.local='+id,'--network',state.network,'--env-file',resolve(directory,'auth.env'),authImage);
    state.authHost=docker('inspect','--format','{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',state.auth);state.authPort=9999;save(state);
    await authReady('http://'+state.authHost+':'+state.authPort);
    for(const user of state.users){
      const response=await fetch('http://'+state.authHost+':'+state.authPort+'/admin/users',{method:'POST',headers:{authorization:'Bearer '+state.serviceKey,'content-type':'application/json'},body:JSON.stringify({email:user.email,password:user.password,email_confirm:true})});
      if(!response.ok)throw Error('Synthetic identity bootstrap failed');
      user.id=(await response.json()).id;
      await appPool.query("insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,$2,$3,$4,'activa',true)",[user.id,'Prueba local '+user.email.split('@')[0],user.email,user.role]);
    }
    await appPool.query("insert into inventario.configuracion_avisos(destinatario) values('encargado@example.invalid')");
    const units=(await appPool.query("insert into inventario.unidades(nombre) values('Unidad sintética A'),('Unidad sintética B') returning id")).rows;
    for(let i=0;i<2;i++)await appPool.query("insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('ID',$1,$2,'Cargo de prueba',$3)",['LOCAL-'+(i+1),'Funcionario sintético '+(i+1),units[i].id]);
    for(let i=0;i<3;i++)await appPool.query("insert into inventario.bienes(codigo,serie,tipo,marca,modelo,condicion) values($1,$2,'Computador','Marca ficticia','Modelo local',$3)",['LOCAL-'+(i+1),'LOCAL-SERIE-'+(i+1),['bueno','regular','malo'][i]]);
    state.initialized=true;save(state);return state;
  }finally{await appPool.end();await authPool.end();}
}
function alive(state){
  if(!state.pid)return false;
  try{return readFileSync('/proc/'+state.pid+'/cmdline','utf8').includes(resolve(root,'ops/local/serve.mjs'));}catch{return false;}
}
async function start(){
  const state=existsSync(statePath)?load():await initialize();
  if(!state.initialized)throw Error('Incomplete bootstrap preserved. Inspect private local state; no automatic reset or deletion.');
  if(alive(state)){console.log('Local test service already running: '+state.origin);return;}
  await portFree(state.tlsPort);await portFree(state.bffPort);
  for(const name of[state.db,state.authDb]){owned(state,name);docker('start',name);}
  state.dbHost=docker('inspect','--format','{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',state.db);state.authDbHost=docker('inspect','--format','{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',state.authDb);
  for(const [host,password]of[[state.dbHost,state.dbPassword],[state.authDbHost,state.authDbPassword]]){const pool=new Pool({host,port:5432,user:'postgres',password,database:'postgres',connectionTimeoutMillis:1000});try{await readyPool(pool);}finally{await pool.end();}}
  owned(state,state.auth);docker('start',state.auth);state.authHost=docker('inspect','--format','{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',state.auth);
  await authReady('http://'+state.authHost+':'+state.authPort);save(state);
  const log=openSync(resolve(directory,'service.log'),'a',0o600);
  const child=spawn(process.execPath,[resolve(root,'ops/local/serve.mjs')],{cwd:root,detached:true,stdio:['ignore',log,log],env:{...process.env,NODE_EXTRA_CA_CERTS:resolve(directory,'ca.crt')}});child.unref();state.pid=child.pid;save(state);
  // Probe via a new Node process so NODE_EXTRA_CA_CERTS is read at startup.
  for(let i=0;i<60;i++){
    try{execFileSync(process.execPath,['--input-type=module','-e',`const r=await fetch(${JSON.stringify(state.origin+'/health/ready')});if(!r.ok)process.exit(1)`],{env:{...process.env,NODE_EXTRA_CA_CERTS:resolve(directory,'ca.crt')},stdio:'pipe',timeout:2000});console.log('Local synthetic service ready: '+state.origin);return;}catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  throw Error('Local service did not become ready; see private service.log');
}
async function stop(){
  const state=load();if(alive(state)){
    process.kill(state.pid,'SIGTERM');
    for(let i=0;i<40&&alive(state);i++)await new Promise(r=>setTimeout(r,100));
    if(alive(state))throw Error('Service is still stopping; containers preserved');
  }
  for(const name of[state.auth,state.authDb,state.db]){owned(state,name);docker('stop',name);}
  state.pid=null;save(state);console.log('Local test service stopped; data, accounts and keys preserved.');
}
export async function main(command){
  if(command==='start')return start();
  if(command==='stop')return stop();
  if(command==='status'){const state=load();console.log(JSON.stringify({origin:state.origin,processRunning:alive(state),syntheticOnly:true,mailEnabled:false},null,2));return;}
  if(command==='credentials'){const state=load();console.log(JSON.stringify(state.users.filter(u=>!u.email.startsWith('smoke-')).map(({email,password,role})=>({email,password,role})),null,2));return;}
  throw Error('Use: node ops/local/control.mjs start|status|stop|credentials');
}
if(process.argv[1]===fileURLToPath(import.meta.url))main(process.argv[2]).catch(()=>{console.error('Local operation failed. Check prerequisites/private work/local-inventarioti2 state; no secrets printed and no data reset.');process.exitCode=1;});
