import{createHash}from'node:crypto';
import { createClient, type Session as SupaSession } from '@supabase/supabase-js';
import type { Identity, Provider, Tokens } from './ports.js';
/** Acepta el código o enlace nativo del proyecto; no sigue redirecciones del correo. */
export function emailVerification(url:string,email:string,value:string) {
 if(/^[0-9]{6,10}$/.test(value))return {email,token:value,type:'email' as const};
 const link=new URL(value),project=new URL(url);
 if(link.origin!==project.origin||link.protocol!=='https:'||link.pathname!=='/auth/v1/verify'||!['email','magiclink','signup'].includes(link.searchParams.get('type')??''))throw Error('EMAIL_CODE_INVALID');
 const token=link.searchParams.get('token_hash')??link.searchParams.get('token');
 if(!token||!/^[A-Za-z0-9_-]{32,256}$/.test(token))throw Error('EMAIL_CODE_INVALID');
 return {token_hash:token,type:'email' as const};
}
export class SupabaseProvider implements Provider {
  constructor(private url: string, private key: string, private adminKey: string) {}
  private client(admin = false) {
    return createClient(this.url, admin ? this.adminKey : this.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (url, init) => fetch(url, {...init, signal: AbortSignal.timeout(10000)}) } });
  }
  private identity(s: SupaSession | null): Identity {
    if (!s) throw new Error('No provider session');
    // Token recibido directamente del proveedor por TLS; no se acepta JWT del navegador.
    const claims = JSON.parse(Buffer.from(s.access_token.split('.')[1], 'base64url').toString());
    return {access_token:s.access_token,refresh_token:s.refresh_token,userId:s.user.id,aal:claims.aal === 'aal2' ? 'aal2' : 'aal1',email:s.user.email,emailConfirmed:!!s.user.email_confirmed_at};
  }
  private async scoped(t: Tokens) {
    const c = this.client();
    const {data,error} = await c.auth.setSession(t);
    if (error || !data.session) throw new Error('Provider session invalid');
    return {c,session:data.session};
  }
  async login(email: string, password: string) {
    const {data,error} = await this.client().auth.signInWithPassword({email,password});
    if (error) throw new Error('Login rejected');
    return this.identity(data.session);
  }
  async validate(t: Tokens) {
    const {c,session} = await this.scoped(t);
    const {data,error} = await c.auth.getUser();
    if (error || data.user?.id !== session.user.id) throw new Error('Identity rejected');
    return this.identity({...session,user:data.user});
  }
  async sendEmailLink(email:string,verifier:string,redirectTo:string){
    const response=await fetch(this.url+'/auth/v1/otp?redirect_to='+encodeURIComponent(redirectTo),{method:'POST',headers:{apikey:this.key,'content-type':'application/json'},body:JSON.stringify({email,create_user:false,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'s256'}),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error(response.status===429?'EMAIL_DELIVERY_RATE_LIMITED':'EMAIL_DELIVERY_UNAVAILABLE');
  }
  async exchangeEmailLink(code:string,verifier:string){
    const response=await fetch(this.url+'/auth/v1/token?grant_type=pkce',{method:'POST',headers:{apikey:this.key,'content-type':'application/json'},body:JSON.stringify({auth_code:code,code_verifier:verifier}),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error('EMAIL_LINK_EXPIRED');const session=await response.json() as SupaSession;
    const checked=await this.client().auth.getUser(session.access_token);if(checked.error||!checked.data.user?.email_confirmed_at)throw Error('EMAIL_LINK_EXPIRED');return this.identity({...session,user:checked.data.user});
  }
  async sendEmailOtp(email: string) {
    const {error}=await this.client().auth.signInWithOtp({email,options:{shouldCreateUser:false}});
    if(error)throw new Error(error.status===429?'EMAIL_DELIVERY_RATE_LIMITED':'EMAIL_DELIVERY_UNAVAILABLE');
  }
  async verifyEmailOtp(email: string, code: string) {
    const {data,error}=await this.client().auth.verifyOtp(emailVerification(this.url,email,code));
    if(error||!data.session)throw new Error('EMAIL_CODE_INVALID');
    const checked=await this.client().auth.getUser(data.session.access_token);
    if(checked.error||!checked.data.user?.email_confirmed_at||checked.data.user.email?.toLowerCase()!==email.toLowerCase())throw new Error('EMAIL_CODE_INVALID');
    return this.identity({...data.session,user:checked.data.user});
  }
  async factors(t: Tokens) {
    const {c}=await this.scoped(t);
    const {data,error}=await c.auth.mfa.listFactors();
    if(error) throw new Error('MFA unavailable');
    return data.all.filter(f=>f.status==='verified' && f.factor_type==='totp').map(f=>({id:f.id,factorType:f.factor_type}));
  }
  async enroll(t: Tokens) {
    const {c,session} = await this.scoped(t);
    // Reutiliza factor TOTP pendiente; no crea factores ilimitados por reintento.
    const listed = await c.auth.mfa.listFactors();
    if (listed.error) throw new Error('MFA unavailable');
    if(listed.data.all.some(f=>f.status==='verified') && this.identity(session).aal!=='aal2') throw new Error('Existing MFA verification required');
    for (const f of listed.data.all.filter(f => f.status === 'unverified')) {
      const result = await c.auth.mfa.unenroll({factorId:f.id});
      if (result.error) throw new Error('MFA enrollment unavailable');
    }
    const {data,error} = await c.auth.mfa.enroll({factorType:'totp',friendlyName:'Inventario TI'});
    if (error) throw new Error('MFA enrollment rejected');
    return {id:data.id,qr:data.totp.qr_code,secret:data.totp.secret};
  }
  async verify(t: Tokens, factor: string, code: string) {
    const {c} = await this.scoped(t);
    const {data,error} = await c.auth.mfa.challengeAndVerify({factorId:factor,code});
    if (error) throw new Error('MFA rejected');
    const user = await c.auth.getUser(data.access_token);
    if (user.error || !user.data.user) throw new Error('MFA identity invalid');
    return this.identity({...data,user:user.data.user} as SupaSession);
  }
  async link(email: string, kind: 'invite' | 'recovery') {
    const {data,error} = await this.client(true).auth.admin.generateLink({type:kind,email});
    if (error || !data.properties.hashed_token) throw new Error('Link unavailable: '+error?.code+' '+error?.status);
    return {userId:data.user.id,hash:data.properties.hashed_token};
  }
  async complete(hash: string, kind: 'invite' | 'recovery', password: string, expectedUserId: string) {
    const c = this.client();
    const {data,error} = await c.auth.verifyOtp({token_hash:hash,type:kind});
    if (error || !data.user || !data.session || data.user.id!==expectedUserId) throw new Error('Link rejected');
    // Un enlace verificado permite restablecer SOLO contraseña, incluso si el usuario
    // conserva MFA. No se elimina ni recupera el factor; el próximo login exige AAL2.
    // user.id procede de verifyOtp, nunca del cuerpo de la petición.
    const updated = await this.client(true).auth.admin.updateUserById(data.user.id,{password});
    if (updated.error) throw new Error('Password update uncertain: '+updated.error.code+' '+updated.error.status);
    const closed=await c.auth.signOut({scope:'global'});
    if(closed.error) throw new Error('Provider revocation uncertain');
    return data.user.id;
  }
  async logout(t: Tokens) { const {c} = await this.scoped(t); const r=await c.auth.signOut({scope:'local'}); if(r.error) throw new Error('Logout pending'); }
}
