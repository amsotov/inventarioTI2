// Adaptador del backend existente. No abre sockets HTTP ni usa la conexión operadora.
import {Buffer} from 'node:buffer';
import process from 'node:process';
import {createHash,createDecipheriv,timingSafeEqual} from 'node:crypto';
import {Pool} from 'pg';
import {gunzipSync} from 'node:zlib';
import {fontGzip} from './font.js';
import {app} from './server/app.js';
import {AuthService} from './server/auth/service.js';
import {Postgres} from './server/auth/postgres.js';
import {Vault} from './server/auth/crypto.js';
import {SupabaseProvider} from './server/auth/supabase.js';
import {Authorization,assertDatabaseRole} from './server/security/postgres.js';
import {Inventory} from './server/inventory/service.js';
import {postgresInventory} from './server/inventory/postgres.js';
import {PostgresLabModelBackend} from './server/modernization/postgres-lab.js';
import {Reports} from './server/reports/service.js';
import {render} from './server/reports/renderer.mjs';
import deployment from './deployment.json' with {type:'json'};
globalThis.Buffer??=Buffer;globalThis.process??=process;
const PROJECT='yhsfotxhaptinjtmrinn';
let initialized:Promise<any>|undefined;
function configuration(envelope:string,serverKey:string){
 const e=JSON.parse(envelope);if(e.v!==1)throw Error('INVALID_ENVELOPE');
 const key=createHash('sha256').update('inventarioTI2:private-runtime:v1\0'+serverKey).digest();
 const d=createDecipheriv('aes-256-gcm',key,Buffer.from(e.iv,'base64url'));d.setAuthTag(Buffer.from(e.tag,'base64url'));
 const c=JSON.parse(Buffer.concat([d.update(Buffer.from(e.data,'base64url')),d.final()]).toString());
 if(c.v!==1||c.project!==PROJECT||c.deploymentId!==deployment.deploymentId||c.origin!==deployment.origin)throw Error('INVALID_DEPLOYMENT');
 for(const [value,role] of [[c.authUrl,'inventario_auth'],[c.businessUrl,'inventario_runtime']]){
  const u=new URL(value);if(!['postgres:','postgresql:'].includes(u.protocol)||u.hostname!==`db.${PROJECT}.supabase.co`||decodeURIComponent(u.username)!==role)throw Error('INVALID_DATABASE');
  for(const k of ['sslmode','sslrootcert','sslcert','sslkey','ssl'])u.searchParams.delete(k);
 }
 return c;
}
async function initialize(envelope:string){
 const serverKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
 if(!serverKey)throw Error('AUTH_BINDING_REQUIRED');
 const c=configuration(envelope,serverKey);
 const connect=(connectionString:string)=>new Pool({connectionString,ssl:{rejectUnauthorized:true},max:2,connectionTimeoutMillis:5000,statement_timeout:15000,idleTimeoutMillis:10000});
 const authPool=connect(c.authUrl),business=connect(c.businessUrl);
 await assertDatabaseRole(authPool,'inventario_auth');await assertDatabaseRole(business,'inventario_runtime');
 if((await business.query('select laboratorio_ti.version() v')).rows[0].v!=='postgres-lab-v1')throw Error('WRONG_DATABASE');
 const publicKey=Deno.env.get('SUPABASE_ANON_KEY')||JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}').default;
 const provider=new SupabaseProvider(`https://${PROJECT}.supabase.co`,publicKey,serverKey);
 const sendEmailLink=provider.sendEmailLink.bind(provider);
 provider.sendEmailLink=async(...args)=>{if(!deployment.emailRedirectReady)throw Error('EMAIL_REDIRECT_REQUIRED');return sendEmailLink(...args);};
 const auth=new AuthService(new Postgres(authPool),provider,new Vault(c.encryptionKey),c.origin,undefined,'email-otp');
 const security=new Authorization(auth,business);
 // Mismo renderer y selección v1; sin Worker threads (no disponibles en Edge).
 const reports=new Reports(security,async(report,format)=>Buffer.from(await render({report,format,font:format==='pdf'?gunzipSync(Buffer.from(fontGzip,'base64')):undefined})));
 const server=app(auth,c.origin,new Inventory(postgresInventory(security)),undefined,security,new PostgresLabModelBackend(),reports);
 await server.ready();return {server,reports};
}
Deno.serve(async req=>{
 const denied=()=>Response.json({code:'FORBIDDEN'},{status:403,headers:{'cache-control':'no-store'}});
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'')??'';
 if(!timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(deployment.gatewayHash,'hex')))return denied();
 const envelope=req.headers.get('x-inventario-runtime');if(!envelope||envelope.length>12000)return denied();
 const u=new URL(req.url);u.searchParams.delete('forceFunctionRegion');const path=u.pathname.replace(/^\/inventarioti2-prueba-runtime(?=\/|$)/,'');
 if(!/^\/(api\/v[12]\/|acceso(?:\.js)?$|auth\/callback(?:\.js)?$)/.test(path))return new Response(null,{status:404});
 try{
  initialized??=initialize(envelope).catch(e=>{initialized=undefined;throw e});const {server,reports}=await initialized;
  const headers:Record<string,string>={};for(const name of ['accept','content-type','origin','cookie','x-csrf-token','idempotency-key','if-match']){const v=req.headers.get(name);if(v)headers[name]=v;}
  const payload=['GET','HEAD'].includes(req.method)?undefined:Buffer.from(await req.arrayBuffer());
  if(payload&&payload.length>8192)return Response.json({code:'PAYLOAD_TOO_LARGE'},{status:413});
  const result=await server.inject({method:req.method as any,url:path+u.search,headers,payload});
  // No envía sesiones/plataforma ni datos sensibles a logs.
  EdgeRuntime.waitUntil(reports.whenIdle());
  const out=new Headers();for(const [k,v] of Object.entries(result.headers)){if(v!==undefined&&!['connection','content-length','transfer-encoding'].includes(k))for(const item of Array.isArray(v)?v:[v])out.append(k,String(item));}
  if(typeof result.headers.etag==='string')out.set('x-inventario-resource-etag',result.headers.etag);
  return new Response([204,304].includes(result.statusCode)?null:new Uint8Array(result.rawPayload),{status:result.statusCode,headers:out});
 }catch(e){console.error(JSON.stringify({code:'EDGE_DEPENDENCY_UNAVAILABLE',name:e?.name}));return Response.json({code:'DEPENDENCY_UNAVAILABLE'},{status:503,headers:{'cache-control':'no-store'}});}
});
