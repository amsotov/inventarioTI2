import{emailCallbackHtml,emailCallbackJs}from'../../apps/server/auth/email-callback.js';
import {test} from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const origin='https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site';
const source=readFileSync('scripts/staging/site/worker.mjs','utf8').replace("import {ASSETS} from './assets.mjs';",'const ASSETS={};').replace("import {emailCallbackHtml,emailCallbackJs} from './email-callback.mjs';",'const emailCallbackHtml='+JSON.stringify(emailCallbackHtml)+';const emailCallbackJs='+JSON.stringify(emailCallbackJs)+';');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
const env={INVENTARIO_GATEWAY_TOKEN:'private-gateway',INVENTARIO_RUNTIME_ENVELOPE:'sealed-config',INVENTARIO_ADMIN_EMAIL:'trial@example.invalid',INVENTARIO_ADMIN_PASSWORD:'private-password'};
test('El ingreso privado mantiene mismo origen y aísla cookies y credenciales de plataforma',async()=>{
 const original=globalThis.fetch;let called=false;
 globalThis.fetch=async(input:any,init:any)=>{called=true;assert.equal(new URL(input).origin,'https://yhsfotxhaptinjtmrinn.supabase.co');assert.equal(new URL(input).searchParams.get('forceFunctionRegion'),'sa-east-1');assert.equal(init.headers.get('authorization'),'Bearer private-gateway');assert.equal(init.headers.get('x-inventario-runtime'),'sealed-config');assert.equal(init.headers.get('OAI-Sites-Authorization'),null);assert.equal(init.headers.get('cookie'),'__Host-inventario='+'a'.repeat(43));return new Response('{}',{headers:{'content-type':'application/json','set-cookie':'__Host-inventario='+'b'.repeat(43)+'; Path=/; Secure; HttpOnly; SameSite=Strict'}});};
 try{const r=await worker.fetch(new Request(origin+'/api/v2/equipos',{headers:{cookie:'platform=private; __Host-inventario='+'a'.repeat(43),'OAI-Sites-Authorization':'never-forward'}}),env);assert.equal(r.status,200);assert(called);assert(r.headers.get('set-cookie')?.startsWith('__Host-inventario='));}finally{globalThis.fetch=original;}
});
test('El portal rechaza orígenes ajenos y nunca incluye las contraseñas en HTML',async()=>{
 const denied=await worker.fetch(new Request(origin+'/prueba/entrar',{method:'POST',headers:{origin:'https://otro.invalid'},body:'{"role":"admin"}'}),env);assert.equal(denied.status,403);
 const page=await worker.fetch(new Request(origin+'/prueba'),env);const html=await page.text();assert.equal(page.status,200);assert(!html.includes(env.INVENTARIO_ADMIN_PASSWORD));assert(!html.includes(env.INVENTARIO_GATEWAY_TOKEN));assert.match(page.headers.get('content-security-policy'),/script-src 'self'/);
});
test('El portal exige verificación de correo y cierra el atajo de contraseña del ensayo anterior',async()=>{
 const r=await worker.fetch(new Request(origin+'/prueba/entrar',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{"role":"admin"}'}),env);assert.equal(r.status,410);assert.equal((await r.json()).code,'EMAIL_VERIFICATION_REQUIRED');
 const p=await worker.fetch(new Request(origin+'/prueba'),env);const html=await p.text();assert.match(html,/Verifica tu correo/);assert(!html.includes('data-role='));
});

test('La versión fuerte del BFF sobrevive al gateway sin inventar ni debilitar el If-Match',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('{"version":"7"}',{headers:{'content-type':'application/json',etag:'W/"v7"','x-inventario-resource-etag':'"v7"'}});
 try{const r=await worker.fetch(new Request(origin+'/api/v2/equipos/20000000-0000-4000-8000-000000000001'),env);assert.equal(r.headers.get('etag'),'"v7"');assert.match(r.headers.get('cache-control'),/no-transform/);assert.equal(r.headers.get('x-inventario-resource-etag'),null);assert.deepEqual(await r.json(),{version:'7'});}finally{globalThis.fetch=original;}
});

test('El visor de Codex tiene padres autorizados y cookie particionada sin quitar Origin/CSRF',async()=>{
 const html=await worker.fetch(new Request(origin+'/'),env);const portal=await worker.fetch(new Request(origin+'/prueba'),env);assert.equal(portal.headers.get('x-frame-options'),null);const policy=portal.headers.get('content-security-policy')!;assert.match(policy,/frame-ancestors 'self' https:\/\/chatgpt.com/);assert.match(policy,/https:\/\/codex.openai.com/);assert(!policy.includes('frame-ancestors *'));
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('{}',{headers:[['set-cookie','__Host-inventario='+'d'.repeat(43)+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800'],['content-security-policy',"default-src 'none'; frame-ancestors 'none'"],['x-frame-options','DENY']]});
 try{const response=await worker.fetch(new Request(origin+'/api/v1/sesion'),env);const cookie=response.headers.get('set-cookie')!;assert.match(cookie,/HttpOnly; Secure; SameSite=None/);assert.match(cookie,/Partitioned/);assert.equal(response.headers.get('x-frame-options'),null);assert.match(response.headers.get('content-security-policy')!,/https:\/\/chatgpt.com/);}finally{globalThis.fetch=original;}
 const denied=await worker.fetch(new Request(origin+'/api/v1/sesion/correo/verificar',{method:'POST',headers:{origin:'https://evil.invalid'},body:'{}'}),env);assert.equal(denied.status,403);
});

test('El visor conserva las dos cookies propias del flujo de correo y descarta las de la plataforma',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async(_url:any,init:any)=>{assert.equal(init.headers.get('cookie'),'__Host-inventario='+'a'.repeat(43)+'; __Host-inventario-correo='+'b'.repeat(43));return new Response('{}',{headers:[['set-cookie','__Host-inventario='+'c'.repeat(43)+'; Path=/; HttpOnly; Secure; SameSite=Strict'],['set-cookie','__Host-inventario-correo=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'],['set-cookie','platform=drop']]});};
 try{const r=await worker.fetch(new Request(origin+'/api/v1/sesion/correo/estado',{method:'POST',headers:{origin,cookie:'platform=secret; __Host-inventario='+'a'.repeat(43)+'; __Host-inventario-correo='+'b'.repeat(43)},body:'{}'}),env);assert.equal(r.headers.getSetCookie().length,2);assert(r.headers.getSetCookie().every((v:string)=>v.includes('SameSite=None')&&v.includes('Partitioned')));}finally{globalThis.fetch=original;}
});

test('El retorno del correo se sirve localmente con scripts propios, sin heredar sandbox de Supabase',async()=>{
 const previous=globalThis.fetch;let upstream=false;globalThis.fetch=async()=>{upstream=true;return new Response('blocked',{headers:{'content-security-policy':"default-src 'none'; sandbox"}});};
 try{const page=await worker.fetch(new Request(origin+'/auth/callback?flow=diagnostic&code=diagnostic'),env);assert.equal(page.status,200);assert.match(page.headers.get('content-type')! ,/text\/html/);assert.match(page.headers.get('content-security-policy')!,/script-src 'self'/);assert(!page.headers.get('content-security-policy')!.includes('sandbox'));assert.match(await page.text(),/auth\/callback.js/);const script=await worker.fetch(new Request(origin+'/auth/callback.js'),env);assert.match(script.headers.get('content-type')!,/application\/javascript/);assert.match(await script.text(),/sesion\/correo\/autorizar/);assert.equal(upstream,false);}finally{globalThis.fetch=previous;}
});
