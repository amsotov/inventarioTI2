import {hash,token,Vault} from './crypto.js';
import{AuthError}from'./error.js';
import type{Account,Database,Provider,Identity,Intent}from'./ports.js';
type Proof={email:string;providerRef:string;version:string;verifier?:string;identity?:Identity};
const eligible=(a:Account|undefined)=>!!a?.proveedor_ref&&((a.estado==='activa'&&a.credencial_lista)||a.estado==='pendiente');
/** El correo autoriza el intento; solo el navegador que lo inició reclama la sesión. */
export class EmailLink {
 constructor(private db:Database,private provider:Provider,private vault:Vault,private origin:string,private now:()=>number,private enabled:boolean){}
 private check(){if(!this.enabled||!this.provider.sendEmailLink||!this.provider.exchangeEmailLink)throw new AuthError(404,'EMAIL_AUTH_DISABLED');}
 async request(email:string){
  this.check();const flow=token(),verifier=token();
  const account=await this.db.transaction(async s=>{const a=await s.account(email);if(!eligible(a))return;
   await s.saveIntent(hash(flow),{accountId:a!.id,kind:'email-login',expires:this.now()+3600000,state:'pending',vault:this.vault.seal({email,providerRef:a!.proveedor_ref,version:a!.version_autorizacion,verifier})});return a;});
  if(account){try{await this.provider.sendEmailLink!(email,verifier,this.origin+'/auth/callback?flow='+flow);}catch(e){
   await this.db.transaction(async s=>{const i=await s.intent(hash(flow));if(i){i.state='superseded';i.vault='';await s.saveIntent(hash(flow),i);}});
   throw new AuthError(e instanceof Error&&e.message==='EMAIL_DELIVERY_RATE_LIMITED'?429:503,e instanceof Error&&e.message==='EMAIL_DELIVERY_RATE_LIMITED'?'EMAIL_RATE_LIMITED':e instanceof Error&&e.message==='EMAIL_REDIRECT_REQUIRED'?'EMAIL_REDIRECT_REQUIRED':'EMAIL_DELIVERY_UNAVAILABLE');
  }}
  return {flow};
 }
 async authorize(flow:string,code:string){
  this.check();const key=hash(flow);const job=await this.db.transaction(async s=>{
   const i=await s.intent(key);if(!i||i.kind!=='email-login'||this.now()>=i.expires)throw new AuthError(401,'EMAIL_LINK_EXPIRED');
   if(i.state==='completed'||i.state==='consumed')return null;
   if(i.state!=='pending')throw new AuthError(409,'EMAIL_LINK_UNCERTAIN');
   const p=this.vault.open<Proof>(i.vault),a=await s.account(i.accountId);
   if(!eligible(a)||a!.proveedor_ref!==p.providerRef||a!.correo.toLowerCase()!==p.email||a!.version_autorizacion!==p.version)throw new AuthError(401,'SESSION_REQUIRED');
   i.state='processing';await s.saveIntent(key,i);return {intent:i,proof:p};
  });if(!job)return;
  let identity:Identity;
  try{identity=await this.provider.exchangeEmailLink!(code,job.proof.verifier!);}catch{
   await this.db.transaction(async s=>{const i=await s.intent(key);if(i?.state==='processing'){i.state='uncertain';i.vault='';await s.saveIntent(key,i);}});throw new AuthError(401,'EMAIL_LINK_EXPIRED');
  }
  try{await this.db.transaction(async s=>{
   const i=await s.intent(key),a=await s.account(job.intent.accountId),p=job.proof;
   if(!i||i.state!=='processing'||this.now()>=i.expires||!eligible(a)||a!.proveedor_ref!==identity.userId||identity.userId!==p.providerRef||!identity.emailConfirmed||identity.email?.toLowerCase()!==p.email||a!.correo.toLowerCase()!==p.email||a!.version_autorizacion!==p.version)throw new AuthError(401,'SESSION_REQUIRED');
   i.state='completed';i.vault=this.vault.seal({email:p.email,providerRef:p.providerRef,version:p.version,identity});await s.saveIntent(key,i);
  });}catch(e){await this.db.transaction(async s=>{const i=await s.intent(key);if(i?.state==='processing'){i.state='uncertain';i.vault='';await s.saveIntent(key,i);}});throw e;}
 }
 async claim(flow:string){
  this.check();if(!/^[A-Za-z0-9_-]{43}$/.test(flow))throw new AuthError(401,'SESSION_REQUIRED');
  return this.db.transaction(async s=>{
   const key=hash(flow),i=await s.intent(key);if(!i||i.kind!=='email-login'||this.now()>=i.expires)throw new AuthError(401,'EMAIL_LINK_EXPIRED');
   if(i.state==='pending'||i.state==='processing')return {status:'pending' as const};
   if(i.state!=='completed')throw new AuthError(401,'EMAIL_LINK_EXPIRED');
   const p=this.vault.open<Proof>(i.vault);let identity:Identity;
   try{identity=await this.provider.validate(p.identity!);}catch{throw new AuthError(503,'DEPENDENCY_UNAVAILABLE');}
   const a=await s.account(i.accountId);
   if(!eligible(a)||a!.proveedor_ref!==p.providerRef||identity.userId!==p.providerRef||a!.correo.toLowerCase()!==p.email||!identity.emailConfirmed||identity.email?.toLowerCase()!==p.email||a!.version_autorizacion!==p.version)throw new AuthError(401,'SESSION_REQUIRED');
   if(a!.estado==='pendiente'){a!.estado='activa';a!.credencial_lista=true;await s.saveAccount(a!);}
   const sid=token(),csrf=token(),now=this.now();await s.saveSession(hash(sid),{accountId:a!.id,version:a!.version_autorizacion,created:now,activity:now,mfa:false,method:'email-otp',emailVerified:true,csrf,vault:this.vault.seal(identity),revoked:false});
   i.state='consumed';i.vault='';await s.saveIntent(key,i);return {status:'authenticated' as const,sid,csrf};
  });
 }
}
