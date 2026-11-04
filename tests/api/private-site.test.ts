import {test} from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const origin='https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site';
const source=readFileSync('scripts/staging/site/worker.mjs','utf8').replace("import {ASSETS} from './assets.mjs';",'const ASSETS={};');
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
test('El acceso de ensayo utiliza el login existente y solo devuelve la cookie de aplicación',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(input:any,init:any)=>{assert.equal(new URL(input).pathname,'/functions/v1/inventarioti2-prueba-runtime/api/v1/sesion');assert.deepEqual(JSON.parse(init.body),{email:env.INVENTARIO_ADMIN_EMAIL,password:env.INVENTARIO_ADMIN_PASSWORD});return new Response('{"mfaRequired":true}',{headers:[['content-type','application/json'],['set-cookie','other=drop'],['set-cookie','__Host-inventario='+'c'.repeat(43)+'; Secure; HttpOnly; Path=/; SameSite=Strict']]});};
 try{const r=await worker.fetch(new Request(origin+'/prueba/entrar',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{"role":"admin"}'}),env);assert.equal(r.status,200);assert.deepEqual(await r.json(),{mfaRequired:true});assert.equal(r.headers.getSetCookie().length,1);assert(!r.headers.get('set-cookie')?.includes('other='));}finally{globalThis.fetch=original;}
});

test('La versión fuerte del BFF sobrevive al gateway sin inventar ni debilitar el If-Match',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('{"version":"7"}',{headers:{'content-type':'application/json',etag:'W/"v7"','x-inventario-resource-etag':'"v7"'}});
 try{const r=await worker.fetch(new Request(origin+'/api/v2/equipos/20000000-0000-4000-8000-000000000001'),env);assert.equal(r.headers.get('etag'),'"v7"');assert.match(r.headers.get('cache-control'),/no-transform/);assert.equal(r.headers.get('x-inventario-resource-etag'),null);assert.deepEqual(await r.json(),{version:'7'});}finally{globalThis.fetch=original;}
});
