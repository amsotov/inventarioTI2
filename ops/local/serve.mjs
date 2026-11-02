import { createServer } from 'node:https';
import { request } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { root, directory, load } from './control.mjs';

const state=load();
// Existing BFF executable, unchanged. Generated local credentials only.
const env={...process.env,APP_ORIGIN:state.origin,HOST:'127.0.0.1',PORT:String(state.bffPort),DATABASE_URL:`postgres://inventario_auth:${state.authPassword}@${state.dbHost}:${state.dbPort}/postgres`,BUSINESS_DATABASE_URL:`postgres://inventario_runtime:${state.runtimePassword}@${state.dbHost}:${state.dbPort}/postgres`,SUPABASE_URL:state.origin,SUPABASE_PUBLISHABLE_KEY:state.anonKey,SUPABASE_SECRET_KEY:state.serviceKey,AUTH_ENCRYPTION_KEY:state.vault,NOTIFICATION_DELIVERY_ENABLED:'false',NODE_EXTRA_CA_CERTS:resolve(directory,'ca.crt')};
delete env.NOTIFICATION_DATABASE_URL;delete env.RESEND_API_KEY;delete env.NOTIFICATION_FROM;
const bff=spawn(process.execPath,[resolve(root,'dist/apps/server/main.js')],{cwd:root,env,stdio:['ignore','inherit','inherit']});
const server=createServer({key:readFileSync(resolve(directory,'server.key')),cert:readFileSync(resolve(directory,'server.crt')),minVersion:'TLSv1.2'},(req,res)=>{
  if(req.headers.host!=='localhost:'+state.tlsPort){res.writeHead(421);res.end();return;}
  const auth=req.url==='/auth/v1'||req.url.startsWith('/auth/v1/');
  const headers={...req.headers};delete headers['x-forwarded-for'];delete headers['x-forwarded-host'];delete headers['x-forwarded-proto'];
  const upstream=request({hostname:auth?state.authHost:'127.0.0.1',port:auth?state.authPort:state.bffPort,path:auth?(req.url.slice('/auth/v1'.length)||'/'):req.url,method:req.method,headers},reply=>{res.writeHead(reply.statusCode,reply.headers);reply.pipe(res);});
  upstream.setTimeout(20000,()=>upstream.destroy());
  upstream.on('error',()=>{if(!res.headersSent)res.writeHead(503,{'content-type':'application/json','cache-control':'no-store'});res.end('{"status":"unavailable"}');});
  req.on('aborted',()=>upstream.destroy());req.pipe(upstream);
});
server.headersTimeout=15000;server.requestTimeout=30000;
server.listen(state.tlsPort,'127.0.0.1',()=>console.log('LOCAL_SYNTHETIC_TLS_READY'));
let stopping=false;
function close(){if(stopping)return;stopping=true;server.close();server.closeAllConnections();bff.kill('SIGTERM');setTimeout(()=>process.exit(0),3000).unref();}
bff.on('exit',()=>{if(!stopping){server.close();process.exitCode=1;}});
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,close);
server.on('error',()=>{bff.kill('SIGTERM');process.exitCode=1;});
