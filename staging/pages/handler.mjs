// Frontera de Pages. La autenticación y la autorización siguen en el BFF existente.
import{Buffer}from'node:buffer';
export const PAGES_ORIGIN='https://amsotov.github.io';
const methods=['GET','POST','PUT','PATCH','DELETE'];
const allowedHeaders=['content-type','x-csrf-token','idempotency-key','if-match'];
const cookiePattern=/^__Host-inventario(?:-correo)?=[A-Za-z0-9_-]{43}$/;
export function pagesHandler({initialize,envelope,appOrigin,waitUntil=()=>{}}){
 return async request=>{
  const headers=new Headers({'cache-control':'no-store','vary':'Origin','x-content-type-options':'nosniff'});
  const reply=(body,status)=>new Response(JSON.stringify(body),{status,headers:new Headers([...headers,['content-type','application/json']])});
  if(request.headers.get('origin')!==PAGES_ORIGIN)return reply({code:'FORBIDDEN'},403);
  headers.set('access-control-allow-origin',PAGES_ORIGIN);headers.set('access-control-allow-credentials','true');
  headers.set('access-control-expose-headers','ETag, X-Inventario-Resource-ETag, Content-Disposition');
  const url=new URL(request.url),path=url.pathname.replace(/^\/(?:functions\/v1\/)?inventarioti2-pages-api(?=\/|$)/,'');
  if(!/^\/api\/v[12]\//.test(path)||path.includes('..'))return reply({code:'NOT_FOUND'},404);
  if(path.startsWith('/api/v1/acceso/')||path.startsWith('/api/v1/sesion/')&&!['/api/v1/sesion/correo/solicitar','/api/v1/sesion/correo/estado','/api/v1/sesion/actividad','/api/v1/sesion/salir'].includes(path))return reply({code:'FORBIDDEN'},403);
  if(request.method==='OPTIONS'){
   const requested=(request.headers.get('access-control-request-headers')||'').toLowerCase().split(',').map(v=>v.trim()).filter(Boolean);
   if(!methods.includes(request.headers.get('access-control-request-method'))||requested.some(v=>!allowedHeaders.includes(v)))return reply({code:'FORBIDDEN'},403);
   headers.set('access-control-allow-methods',methods.join(', '));headers.set('access-control-allow-headers',allowedHeaders.join(', '));headers.set('access-control-max-age','600');
   return new Response(null,{status:204,headers});
  }
  if(!methods.includes(request.method))return reply({code:'METHOD_NOT_ALLOWED'},405);
  if(Number(request.headers.get('content-length'))>8192)return reply({code:'PAYLOAD_TOO_LARGE'},413);
  let payload;
  if(!['GET','HEAD'].includes(request.method)){
   const reader=request.body?.getReader(),chunks=[];let size=0;
   if(reader)for(;;){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>8192){await reader.cancel();return reply({code:'PAYLOAD_TOO_LARGE'},413);}chunks.push(next.value);}
   payload=new Uint8Array(size);let offset=0;for(const chunk of chunks){payload.set(chunk,offset);offset+=chunk.length;}
  }
  try{
   const {server,reports}=await initialize(envelope);
   // Origin se traduce únicamente tras validar el origen externo exacto; CSRF se conserva.
   const input={origin:appOrigin};for(const name of ['accept',...allowedHeaders]){const value=request.headers.get(name);if(value)input[name]=value;}
   const cookie=request.headers.get('cookie')?.split(';').map(v=>v.trim()).filter(v=>cookiePattern.test(v)).join('; ');if(cookie)input.cookie=cookie;
   const result=await server.inject({method:request.method,url:path+url.search,headers:input,payload:payload?Buffer.from(payload):undefined});
   waitUntil(reports.whenIdle());
   for(const name of ['content-type','content-disposition','etag'])if(result.headers[name])headers.set(name,String(result.headers[name]));
   if(result.headers.etag)headers.set('x-inventario-resource-etag',String(result.headers.etag));
   const cookies=result.headers['set-cookie'];for(const value of cookies?(Array.isArray(cookies)?cookies:[cookies]):[]){if(/^__Host-inventario(?:-correo)?=/.test(value))headers.append('set-cookie',value.replace(/;\s*SameSite=Strict/i,'; SameSite=None')+'; Partitioned');}
   return new Response(result.statusCode===204?null:new Uint8Array(result.rawPayload),{status:result.statusCode,headers});
  }catch{return reply({code:'DEPENDENCY_UNAVAILABLE'},503);}
 };
}
