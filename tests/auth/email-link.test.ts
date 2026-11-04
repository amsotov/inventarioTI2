import{test}from'node:test';import assert from'node:assert/strict';import{randomBytes}from'node:crypto';import{AuthService,AuthError}from'../../apps/server/auth/service.js';import{Vault,hash}from'../../apps/server/auth/crypto.js';import type{Account,Session,Intent,Store,Provider,Database,Identity}from'../../apps/server/auth/ports.js';import{app}from'../../apps/server/app.js';
import{emailFixture as fixture}from'../helpers/email-link.js';

test('Enlace: el clic autoriza y solo el intento del visor original reclama una sesión sin MFA',async()=>{
 const f=fixture(),request=await f.auth.email.request(f.account.correo);assert.equal(f.sessions.size,0);assert.equal((await f.auth.email.claim(request.flow)).status,'pending');assert.equal(new URL(f.sent()!.url).pathname,'/auth/callback');assert.equal(new URL(f.sent()!.url).searchParams.get('flow'),request.flow);assert(!f.intents.get(hash(request.flow))!.vault.includes(f.sent()!.verifier));
 await f.auth.email.authorize(request.flow,'valid-auth-code-1234567890');assert.equal(f.sessions.size,0);const session=await f.auth.email.claim(request.flow);assert.equal(session.status,'authenticated');if(session.status!=='authenticated')throw Error();assert.equal((await f.auth.status(session.sid)).mfaRequired,false);assert.equal(f.sessions.get(hash(session.sid))!.emailVerified,true);assert.equal(f.sessions.get(hash(session.sid))!.mfa,false);assert.equal(f.intents.get(hash(request.flow))!.vault,'');assert.equal(f.exchanges(),1);
 await f.auth.email.authorize(request.flow,'valid-auth-code-1234567890');assert.equal(f.exchanges(),1);await assert.rejects(f.auth.email.claim(request.flow));assert.equal(f.sessions.size,1);
});
test('Enlace: otro intento, PKCE/código inválido, caducidad y MFA antiguo no abren sesión',async()=>{
 const f=fixture(),r=await f.auth.email.request(f.account.correo);await assert.rejects(f.auth.email.claim('a'.repeat(43)));await assert.rejects(f.auth.email.authorize(r.flow,'wrong'));assert.equal(f.intents.get(hash(r.flow))!.state,'uncertain');assert.equal(f.sessions.size,0);
 const second=await f.auth.email.request(f.account.correo);f.advance(3600001);await assert.rejects(f.auth.email.authorize(second.flow,'valid-auth-code-1234567890'));assert.equal(f.sessions.size,0);await assert.rejects(f.auth.login(f.account.correo,'old password'));
});
test('Enlace: desactivar cuenta o cambiar versión antes de la autorización o reclamación revoca el acceso',async()=>{
 for(const phase of ['authorize','claim']as const){const f=fixture(),r=await f.auth.email.request(f.account.correo);if(phase==='claim')await f.auth.email.authorize(r.flow,'valid-auth-code-1234567890');f.account.version_autorizacion='2';await assert.rejects(phase==='claim'?f.auth.email.claim(r.flow):f.auth.email.authorize(r.flow,'valid-auth-code-1234567890'));assert.equal(f.sessions.size,0);}
});
test('Enlace: no hay alta automática ni sesión para correo no habilitado, identidad distinta o no confirmada',async()=>{
 const unknown=fixture();const r=await unknown.auth.email.request('unknown@example.invalid');assert.equal(unknown.sent(),undefined);await assert.rejects(unknown.auth.email.claim(r.flow));
 for(const bad of ['user','email','confirmed']as const){const f=fixture(),r=await f.auth.email.request(f.account.correo);if(bad==='user')f.identity.userId='20000000-0000-4000-8000-000000000003';if(bad==='email')f.identity.email='other@example.invalid';if(bad==='confirmed')f.identity.emailConfirmed=false;await assert.rejects(f.auth.email.authorize(r.flow,'valid-auth-code-1234567890'));assert.equal(f.sessions.size,0);}
});
test('Enlace: un fallo de commit no entrega sesión y el intento autorizado se puede reclamar después',async()=>{
 const f=fixture(),r=await f.auth.email.request(f.account.correo);await f.auth.email.authorize(r.flow,'valid-auth-code-1234567890');f.failNextCommit();await assert.rejects(f.auth.email.claim(r.flow));assert.equal(f.sessions.size,0);assert.equal(f.intents.get(hash(r.flow))!.state,'completed');assert.equal((await f.auth.email.claim(r.flow)).status,'authenticated');assert.equal(f.sessions.size,1);
});
test('Enlace: solo una reclamación concurrente consume la autorización',async()=>{
 const f=fixture(),r=await f.auth.email.request(f.account.correo);await f.auth.email.authorize(r.flow,'valid-auth-code-1234567890');const result=await Promise.allSettled([f.auth.email.claim(r.flow),f.auth.email.claim(r.flow)]);assert.equal(result.filter(v=>v.status==='fulfilled').length,1);assert.equal(f.sessions.size,1);
});
test('Enlace: la recuperación de contraseña no consume un intento email-login',async()=>{
 const f=fixture(),r=await f.auth.email.request(f.account.correo);await assert.rejects(f.auth.complete(r.flow,'new password'));assert.equal(f.intents.get(hash(r.flow))!.state,'pending');assert.equal(f.sessions.size,0);
});
test('Enlace: API liga cookie al visor, callback sin efectos GET, Origin y sesión tras commit',async()=>{
 const f=fixture(),server=app(f.auth,'https://app.example.invalid'),origin='https://app.example.invalid';try{
 const sent=await server.inject({method:'POST',url:'/api/v1/sesion/correo/solicitar',headers:{origin},payload:{email:f.account.correo}});assert.equal(sent.statusCode,202);const cookie=String(sent.headers['set-cookie']).split(';')[0];assert(cookie.startsWith('__Host-inventario-correo='));const flow=cookie.split('=')[1];assert(!sent.body.includes(flow));assert.equal(f.sessions.size,0);
 const get=await server.inject('/auth/callback?flow='+flow+'&code=valid-auth-code-1234567890');assert.equal(get.statusCode,200);assert.equal(f.exchanges(),0);assert(!get.body.includes(flow));
 const bad=await server.inject({method:'POST',url:'/api/v1/sesion/correo/autorizar',headers:{origin:'https://evil.invalid'},payload:{flow,code:'valid-auth-code-1234567890'}});assert.equal(bad.statusCode,403);
 const approved=await server.inject({method:'POST',url:'/api/v1/sesion/correo/autorizar',headers:{origin},payload:{flow,code:'valid-auth-code-1234567890'}});assert.equal(approved.statusCode,204);assert.equal(f.sessions.size,0);
 const claim=await server.inject({method:'POST',url:'/api/v1/sesion/correo/estado',headers:{origin,cookie},payload:{}});assert.equal(claim.statusCode,200);assert.equal(claim.json().status,'authenticated');assert(Array.isArray(claim.headers['set-cookie']));assert(!claim.body.includes('verified-provider-token'));assert.equal(f.sessions.size,1);
 }finally{await server.close();}
});
