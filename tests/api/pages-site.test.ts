import{test}from'node:test';import assert from'node:assert/strict';
import{readFileSync}from'node:fs';
const{pagesHandler,PAGES_ORIGIN}=await import('data:text/javascript;base64,'+Buffer.from(readFileSync('staging/pages/handler.mjs')).toString('base64'));
const base='https://yhsfotxhaptinjtmrinn.supabase.co/functions/v1/inventarioti2-pages-api';
test('Pages: CORS exacto, preflight cerrado y rechazo antes de abrir la base',async()=>{
 let opened=0;const handle=pagesHandler({initialize:async()=>{opened++;throw Error('must not initialize');},envelope:'sealed',appOrigin:'https://private.invalid'});
 for(const origin of ['', 'null','https://evil.invalid','https://amsotov.github.io.evil.invalid']){const r=await handle(new Request(base+'/api/v2/equipos',{headers:{origin}}));assert.equal(r.status,403);assert.equal(r.headers.get('access-control-allow-origin'),null);}
 const options=(method:string,headers:string)=>new Request(base+'/api/v2/equipos',{method:'OPTIONS',headers:{origin:PAGES_ORIGIN,'access-control-request-method':method,'access-control-request-headers':headers}});
 const ok=await handle(options('PATCH','content-type, x-csrf-token, if-match, idempotency-key'));assert.equal(ok.status,204);assert.equal(ok.headers.get('access-control-allow-origin'),PAGES_ORIGIN);assert.equal(ok.headers.get('access-control-allow-credentials'),'true');
 assert.equal((await handle(options('TRACE',''))).status,403);assert.equal((await handle(options('GET','authorization'))).status,403);assert.equal(opened,0);
 for(const path of ['/auth/callback','/api/v1/sesion/login','/api/v1/sesion/mfa/enrolar','/api/v1/sesion/correo/autorizar','/api/v1/acceso/completar'])assert([403,404].includes((await handle(new Request(base+path,{headers:{origin:PAGES_ORIGIN}}))).status));
 assert.equal(opened,0);
});
test('Pages: conserva CSRF/versión, aísla cookies y configura cookies seguras particionadas',async()=>{
 let input:any;const handle=pagesHandler({envelope:'sealed-only',appOrigin:'https://private.invalid',initialize:async(envelope:string)=>{assert.equal(envelope,'sealed-only');return{server:{inject:async(value:any)=>{input=value;return{statusCode:200,rawPayload:Buffer.from('{"ok":true}'),headers:{'content-type':'application/json',etag:'"v3"','set-cookie':['__Host-inventario='+'s'.repeat(43)+'; Path=/; HttpOnly; Secure; SameSite=Strict','__Host-inventario-correo=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0','platform=forbidden']}}}},reports:{whenIdle:async()=>{}}};}});
 const r=await handle(new Request(base+'/api/v2/equipos',{method:'PATCH',headers:{origin:PAGES_ORIGIN,'content-type':'application/json','x-csrf-token':'original-csrf','if-match':'"v2"','idempotency-key':'stable-key',authorization:'never-forward','x-inventario-runtime':'untrusted','cookie':'platform=secret; __Host-inventario='+'s'.repeat(43)+'; __Host-inventario-correo='+'f'.repeat(43)},body:'{}'}));
 assert(Buffer.isBuffer(input.payload));assert.equal(input.payload.toString(),'{}');assert.equal(input.headers.origin,'https://private.invalid');assert.equal(input.headers['x-csrf-token'],'original-csrf');assert.equal(input.headers['if-match'],'"v2"');assert.equal(input.headers['idempotency-key'],'stable-key');assert.equal(input.headers.authorization,undefined);assert.equal(input.headers['x-inventario-runtime'],undefined);assert(!input.headers.cookie.includes('platform'));assert.equal(r.headers.get('x-inventario-resource-etag'),'"v3"');assert.equal(r.headers.getSetCookie().length,2);assert(r.headers.getSetCookie().every((v:string)=>v.includes('HttpOnly')&&v.includes('Secure')&&v.includes('SameSite=None')&&v.includes('Partitioned')));assert.equal(await r.text(),'{"ok":true}');
});
test('Pages: limita carga y entrega errores de dependencia con CORS, sin secretos',async()=>{
 let opened=0;const handle=pagesHandler({initialize:async()=>{opened++;throw Error('database-password-must-not-leak');},envelope:'secret-envelope',appOrigin:'https://private.invalid'});
 const large=await handle(new Request(base+'/api/v2/equipos',{method:'POST',headers:{origin:PAGES_ORIGIN},body:'x'.repeat(8193)}));assert.equal(large.status,413);assert.equal(opened,0);
 const r=await handle(new Request(base+'/api/v1/sesion',{headers:{origin:PAGES_ORIGIN}}));assert.equal(r.status,503);assert.equal(r.headers.get('access-control-allow-origin'),PAGES_ORIGIN);assert(!JSON.stringify(await r.json()).includes('password'));
});
