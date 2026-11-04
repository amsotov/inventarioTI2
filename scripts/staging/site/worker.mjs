const ORIGIN='https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site';
const UPSTREAM='https://yhsfotxhaptinjtmrinn.supabase.co/functions/v1/inventarioti2-prueba-runtime';
// ASSETS se genera del paquete conectado, nunca del demo.
import {ASSETS} from './assets.mjs';
const security={'cache-control':'no-store','referrer-policy':'no-referrer','x-content-type-options':'nosniff','x-frame-options':'DENY','permissions-policy':'camera=(), microphone=(), geolocation=()','strict-transport-security':'max-age=31536000','content-security-policy':"default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
const html=`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prueba conectada · inventarioTI2</title><link rel="stylesheet" href="/prueba/style.css"><main><p>inventarioTI2 · Acceso privado</p><h1>Prueba conectada</h1><p>Interfaz modernizada con datos sintéticos persistidos en Supabase.</p><button data-role="reader">Entrar en modo lectura</button><button data-role="admin">Entrar como administrador</button><p>El administrador debe completar MFA con su autenticador. Los reportes anteriores conservan su conjunto de datos independiente.</p><p role="status"></p><a href="/">Abrir sesión existente</a></main><script src="/prueba/entry.js"></script></html>`;
const js=`document.querySelectorAll('button').forEach(b=>b.onclick=async()=>{document.querySelectorAll('button').forEach(v=>v.disabled=true);try{const r=await fetch('/prueba/entrar',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({role:b.dataset.role})});if(!r.ok)throw Error();location.href='/';}catch{document.querySelector('[role=status]').textContent='No se pudo iniciar la sesión. Vuelve a intentarlo.';document.querySelectorAll('button').forEach(v=>v.disabled=false)}});`;
const css='body{font:17px system-ui;background:#f2f7f7;color:#20323c;margin:0}main{max-width:600px;margin:8vh auto;padding:32px;background:white;border-radius:14px}h1{color:#08766b}button{font:inherit;display:block;margin:16px 0;padding:12px 20px;border:0;border-radius:6px;background:#08766b;color:white;cursor:pointer}button:disabled{opacity:.5}a{color:#08766b}';
const response=(body,type,status=200)=>new Response(body,{status,headers:{...security,'content-type':type}});
async function proxy(request,env,url,login){
 const headers=new Headers({authorization:'Bearer '+env.INVENTARIO_GATEWAY_TOKEN,'x-inventario-runtime':env.INVENTARIO_RUNTIME_ENVELOPE});
 // La puerta privada de Sites autoriza al propietario antes de ejecutar este Worker.
 // Sus cookies y cabeceras de plataforma NUNCA se envían a Supabase.
 for(const name of ['accept','content-type','origin','x-csrf-token','idempotency-key','if-match']){const value=request.headers.get(name);if(value)headers.set(name,value);}
 const cookie=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>/^__Host-inventario=[A-Za-z0-9_-]{43}$/.test(s));if(cookie)headers.set('cookie',cookie);
 let body=login||request.method==='GET'||request.method==='HEAD'?undefined:await request.arrayBuffer();
 if(body&&body.byteLength>8192)return response('{"code":"PAYLOAD_TOO_LARGE"}','application/json',413);
 if(login){headers.set('content-type','application/json');body=JSON.stringify({email:login==='admin'?env.INVENTARIO_ADMIN_EMAIL:env.INVENTARIO_READER_EMAIL,password:login==='admin'?env.INVENTARIO_ADMIN_PASSWORD:env.INVENTARIO_READER_PASSWORD});}
 const target=new URL(UPSTREAM+url);target.searchParams.set('forceFunctionRegion','sa-east-1');headers.set('x-region','sa-east-1');
 const upstream=await fetch(target,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(45000)});
 const out=new Headers(upstream.headers);out.delete('set-cookie');for(const value of upstream.headers.getSetCookie()){if(value.startsWith('__Host-inventario='))out.append('set-cookie',value);}for(const key of ['access-control-allow-origin','access-control-allow-credentials','server','x-powered-by','content-length'])out.delete(key);
 const resourceETag=out.get('x-inventario-resource-etag');out.delete('x-inventario-resource-etag');
 if(resourceETag){if(!/^"v[1-9][0-9]{0,18}"$/.test(resourceETag))throw Error('Invalid resource ETag');out.set('etag',resourceETag);out.set('cache-control','no-store, no-transform');out.delete('content-encoding');const text=await upstream.text();return new Response(text,{status:upstream.status,headers:out});}
 if(url==='/acceso')out.set('content-type','text/html; charset=utf-8');
 return new Response(upstream.body,{status:upstream.status,headers:out});
}
export default {async fetch(request,env){
 const u=new URL(request.url);
 if(u.origin!==ORIGIN)return response('Origen no permitido','text/plain',403);
 if(request.method!=='GET'&&request.method!=='HEAD'&&request.headers.get('origin')!==ORIGIN)return response('{"code":"FORBIDDEN"}','application/json',403);
 try{
 if(u.pathname==='/prueba'||u.pathname==='/prueba/')return response(html,'text/html; charset=utf-8');
 if(u.pathname==='/prueba/entry.js')return response(js,'application/javascript');
 if(u.pathname==='/prueba/style.css')return response(css,'text/css');
 if(u.pathname==='/prueba/entrar'){
  if(request.method!=='POST')return response('','text/plain',405);
  const text=await request.text();if(text.length>128)return response('','text/plain',400);
  const b=JSON.parse(text);if(!['reader','admin'].includes(b.role))return response('','text/plain',400);
  return proxy(request,env,'/api/v1/sesion',b.role);
 }
 if(/^\/api\/v[12]\//.test(u.pathname)||['/acceso','/acceso.js'].includes(u.pathname))return proxy(request,env,u.pathname+u.search);
 if(!['GET','HEAD'].includes(request.method))return response('','text/plain',405);
 const asset=ASSETS[u.pathname==='/'?'/index.html':u.pathname];if(!asset)return response('No encontrado','text/plain',404);
 const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));return response(request.method==='HEAD'?null:bytes,asset.type);
 }catch{return response('{"code":"DEPENDENCY_UNAVAILABLE"}','application/json',503);}
}};
