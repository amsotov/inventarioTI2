// Gateway privado existente; el adaptador de Pages usa otra entrada.
import {Buffer} from 'node:buffer';
import {createHash,timingSafeEqual} from 'node:crypto';
import {initialize} from './runtime.ts';
import deployment from './deployment.json' with {type:'json'};
let initialized:Promise<any>|undefined;
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
