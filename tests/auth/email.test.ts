import{test}from'node:test';import assert from'node:assert/strict';import{randomBytes}from'node:crypto';
import{AuthService,AuthError}from'../../apps/server/auth/service.js';import{Vault,hash}from'../../apps/server/auth/crypto.js';import type{Account,Session,Intent,Store,Provider,Identity,Database}from'../../apps/server/auth/ports.js';import{app}from'../../apps/server/app.js';
function fixture(){
 const account:Account={id:'20000000-0000-4000-8000-000000000001',correo:'owner@example.invalid',proveedor_ref:'20000000-0000-4000-8000-000000000002',rol:'administrador',estado:'activa',version_autorizacion:'1',credencial_lista:true};
 const sessions=new Map<string,Session>(),intents=new Map<string,Intent>();let sends=0;const identity:Identity={access_token:'provider-token',refresh_token:'refresh-token',userId:account.proveedor_ref!,aal:'aal1',email:account.correo,emailConfirmed:true};
 const store={account:async(key:string)=>key===account.id||key.toLowerCase()===account.correo?{...account}:undefined,saveAccount:async(a:Account)=>{Object.assign(account,a);},session:async(k:string)=>sessions.get(k),saveSession:async(k:string,v:Session)=>{sessions.set(k,structuredClone(v));},revoke:async()=>{},intent:async(k:string)=>intents.get(k),saveIntent:async(k:string,i:Intent)=>{intents.set(k,i);},rate:async()=>true} as unknown as Store;
 const db:Database={transaction:async fn=>fn(store)};const provider={sendEmailLink:async()=>{sends++;},exchangeEmailLink:async()=>({...identity}),sendEmailOtp:async()=>{sends++;},verifyEmailOtp:async(_e:string,c:string)=>{if(c!=='123456')throw Error('Rejected');return {...identity};},validate:async()=>({...identity}),factors:async()=>{throw Error('MFA must not run');},logout:async()=>{}} as unknown as Provider;
 const vault=new Vault(randomBytes(32).toString('base64')),auth=new AuthService(db,provider,vault,'https://app.example.invalid',undefined,'email-otp');return{auth,account,identity,sessions,provider,db,vault,sends:()=>sends};
}
test('Correo: solo un OTP verificado del UUID y correo vinculados abre sesión administrativa AAL1',async()=>{
 const f=fixture();await f.auth.requestEmailOtp(f.account.correo);assert.equal(f.sends(),1);assert.equal(f.sessions.size,0);
 const s=await f.auth.loginEmailOtp(f.account.correo,'123456');assert.equal(s.mfaRequired,false);const saved=f.sessions.get(hash(s.sid))!;assert.equal(saved.mfa,false);assert.equal(saved.method,'email-otp');assert.equal(saved.emailVerified,true);assert(!saved.vault.includes('provider-token'));
 assert.equal((await f.auth.status(s.sid)).authenticationMethod,'email-otp');assert.equal(await f.auth.withPrincipal(s.sid,s.csrf,async a=>a.rol),'administrador');await assert.rejects(f.auth.activity(s.sid,'wrong'),(e:AuthError)=>e.status===403);
});
test('Correo: contraseña, MFA anterior y OTP incorrecto no permiten entrar',async()=>{
 const f=fixture();await assert.rejects(f.auth.login(f.account.correo,'anything'),(e:AuthError)=>e.code==='EMAIL_VERIFICATION_REQUIRED');await assert.rejects(f.auth.enroll('old','csrf'),(e:AuthError)=>e.code==='MFA_DISABLED');await assert.rejects(f.auth.loginEmailOtp(f.account.correo,'000000'),(e:AuthError)=>e.code==='EMAIL_CODE_INVALID');assert.equal(f.sessions.size,0);
 const s=await f.auth.loginEmailOtp(f.account.correo,'123456');delete f.sessions.get(hash(s.sid))!.method;await assert.rejects(f.auth.status(s.sid),(e:AuthError)=>e.status===401);
});
test('Correo: confirmación operadora, otro correo o UUID y cuenta inactiva no sustituyen el OTP',async()=>{
 for(const mismatch of ['email','id','confirmed','disabled'] as const){const f=fixture();if(mismatch==='email')f.identity.email='other@example.invalid';if(mismatch==='id')f.identity.userId='20000000-0000-4000-8000-000000000003';if(mismatch==='confirmed')f.identity.emailConfirmed=false;if(mismatch==='disabled')f.account.estado='inactiva';await assert.rejects(f.auth.loginEmailOtp(f.account.correo,'123456'));assert.equal(f.sessions.size,0);}
});
test('Correo: revocación o cambio de versión durante validación falla cerrado',async()=>{
 const f=fixture();f.provider.verifyEmailOtp=async()=>{f.account.version_autorizacion='2';return{...f.identity};};await assert.rejects(f.auth.loginEmailOtp(f.account.correo,'123456'));assert.equal(f.sessions.size,0);
});
test('Correo: direcciones no habilitadas no se registran ni reciben mensajes',async()=>{
 const f=fixture();await f.auth.requestEmailOtp('unknown@example.invalid');assert.equal(f.sends(),0);await assert.rejects(f.auth.loginEmailOtp('unknown@example.invalid','123456'));assert.equal(f.sessions.size,0);
});
test('Correo: API conserva Origin, valida código y emite cookie segura sin tokens del proveedor',async()=>{
 const f=fixture(),server=app(f.auth,'https://app.example.invalid');try{
 const denied=await server.inject({method:'POST',url:'/api/v1/sesion/correo/solicitar',payload:{email:f.account.correo}});assert.equal(denied.statusCode,403);
 const send=await server.inject({method:'POST',url:'/api/v1/sesion/correo/solicitar',headers:{origin:'https://app.example.invalid'},payload:{email:f.account.correo}});assert.equal(send.statusCode,202);assert.equal(f.sends(),1);
 const invalid=await server.inject({method:'POST',url:'/api/v1/sesion/correo/verificar',headers:{origin:'https://app.example.invalid'},payload:{email:f.account.correo,code:'bad'}});assert.equal(invalid.statusCode,400);
 const verified=await server.inject({method:'POST',url:'/api/v1/sesion/correo/verificar',headers:{origin:'https://app.example.invalid'},payload:{email:f.account.correo,code:'123456'}});assert.equal(verified.statusCode,200);assert.equal(verified.json().mfaRequired,false);assert(!verified.body.includes('provider-token'));assert.match(String(verified.headers['set-cookie']),/HttpOnly; Secure; SameSite=Strict/);
 }finally{await server.close();}
});

test('Correo: enlaces nativos solo del proyecto, sin seguir redirect_to ni aceptar tokens de otro origen',async()=>{
 const {emailVerification}=await import('../../apps/server/auth/supabase.js');const origin='https://project.supabase.co',token='a'.repeat(64);
 assert.deepEqual(emailVerification(origin,'owner@example.invalid','123456'),{email:'owner@example.invalid',token:'123456',type:'email'});
 assert.deepEqual(emailVerification(origin,'owner@example.invalid',origin+'/auth/v1/verify?type=magiclink&token='+token+'&redirect_to=https://evil.invalid'),{token_hash:token,type:'email'});
 for(const link of ['https://evil.invalid/auth/v1/verify?type=email&token='+token,origin+'/else?type=email&token='+token,origin+'/auth/v1/verify?type=recovery&token='+token,origin+'/auth/v1/verify?type=email&token=bad'])assert.throws(()=>emailVerification(origin,'owner@example.invalid',link));
});
test('Correo: activación expresa limitada al laboratorio autorizado',async()=>{
 const{authenticationMethod}=await import('../../apps/server/auth/configuration.js');assert.equal(authenticationMethod({}),'mfa');assert.throws(()=>authenticationMethod({AUTHENTICATION_METHOD:'email-otp'}));assert.equal(authenticationMethod({AUTHENTICATION_METHOD:'email-otp',APP_ENV:'staging',SUPABASE_PROJECT_REF:'yhsfotxhaptinjtmrinn',SUPABASE_URL:'https://yhsfotxhaptinjtmrinn.supabase.co'}),'email-otp');
});

 test('Correo: una invitación vinculada solo se activa después de comprobar el correo',async()=>{
 const f=fixture();f.account.estado='pendiente';f.account.credencial_lista=false;await f.auth.requestEmailOtp(f.account.correo);assert.equal(f.sends(),1);await assert.rejects(f.auth.loginEmailOtp(f.account.correo,'000000'));assert.equal(f.account.estado,'pendiente');const session=await f.auth.loginEmailOtp(f.account.correo,'123456');assert.equal(f.account.estado,'activa');assert.equal(f.account.credencial_lista,true);assert.equal((await f.auth.status(session.sid)).mfaRequired,false);
});
