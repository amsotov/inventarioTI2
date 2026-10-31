import { hash, token, Vault } from './crypto.js';
import type { Account, Database, Provider, Store, Session, Tokens } from './ports.js';
export class AuthError extends Error { constructor(readonly status: number, readonly code: string) { super(code); } }
const reject = () => { throw new AuthError(401,'SESSION_REQUIRED'); };
export class AuthService {
  constructor(readonly db: Database, private provider: Provider, private vault: Vault, private origin: string, private now = () => Date.now()) {}
  async rate(ip: string, email = '') {
    const ok = await this.db.transaction(async s => {
      const window=Math.floor(this.now()/60000);
      const a=await s.rate(hash('ip:'+ip),window,30);
      const b=email ? await s.rate(hash('mail:'+email.toLowerCase()),Math.floor(window/15),10) : true;
      return a && b;
    });
    if(!ok) throw new AuthError(429,'RATE_LIMITED');
  }
  async login(email: string, password: string) {
    let identity;
    try { identity=await this.provider.login(email,password); } catch { return reject(); }
    return this.db.transaction(async s => {
      const a=await s.account(email);
      if(!a || a.estado==='inactiva' || !a.credencial_lista || a.proveedor_ref!==identity.userId) return reject();
      const sid=token(), csrf=token(), now=this.now();
      // Toda contraseña inicia en AAL1; MFA se verifica en esta nueva sesión.
      const session: Session={accountId:a.id,version:a.version_autorizacion,created:now,activity:now,mfa:false,csrf,vault:this.vault.seal(identity),revoked:false};
      await s.saveSession(hash(sid),session);
      return {sid,csrf,mfaRequired:a.rol==='administrador'};
    });
  }
  private async current(s: Store, sid: string, csrf?: string, full=true) {
    const session=await s.session(hash(sid)), now=this.now();
    if(!session || session.revoked || now-session.created>=8*3600000 || now-session.activity>=1800000) return reject();
    if(csrf!==undefined && csrf!==session.csrf) throw new AuthError(403,'FORBIDDEN');
    const a=await s.account(session.accountId);
    if(!a || !a.credencial_lista || a.estado==='inactiva' || a.version_autorizacion!==session.version || (full && a.estado!=='activa')) return reject();
    if(a.rol==='administrador' && !session.mfa && now-session.created>=600000) return reject();
    if(full && a.rol==='administrador' && !session.mfa) throw new AuthError(403,'MFA_REQUIRED');
    let identity;
    try {identity=await this.provider.validate(this.vault.open<Tokens>(session.vault));} catch {throw new AuthError(503,'DEPENDENCY_UNAVAILABLE');}
    if(identity.userId!==a.proveedor_ref || (session.mfa && identity.aal!=='aal2')) return reject();
    session.vault=this.vault.seal(identity);
    await s.saveSession(hash(sid),session);
    return {session,a};
  }
  // Mantiene locks de sesión/cuenta hasta terminar la operación protegida.
  // Valida proveedor vigente, estado, versión, expiración y MFA en cada uso.
  async withPrincipal<T>(sid: string, csrf: string | undefined, fn: (account: Account) => Promise<T>): Promise<T> {
    return this.db.transaction(async s => {
      const {a}=await this.current(s,sid,csrf);
      return fn(a);
    });
  }
  async status(sid: string) {
    return this.db.transaction(async s => {
      const {session,a}=await this.current(s,sid,undefined,false);
      return {factors:await this.provider.factors(this.vault.open(session.vault)),rol:a.rol,estado:a.estado,mfaRequired:a.rol==='administrador'&&!session.mfa,csrf:session.csrf,expiresAt:new Date(session.created+8*3600000).toISOString(),idleExpiresAt:new Date(session.activity+1800000).toISOString()};
    });
  }
  async activity(sid: string, csrf: string) {
    return this.db.transaction(async s => {const {session}=await this.current(s,sid,csrf);session.activity=this.now();await s.saveSession(hash(sid),session);});
  }
  async enroll(sid: string, csrf: string) {
    return this.db.transaction(async s => {const {session}=await this.current(s,sid,csrf,false);return this.provider.enroll(this.vault.open(session.vault));});
  }
  async verify(sid: string, csrf: string, factor: string, code: string) {
    return this.db.transaction(async s => {
      const {session,a}=await this.current(s,sid,csrf,false);
      const identity=await this.provider.verify(this.vault.open(session.vault),factor,code);
      if(identity.userId!==a.proveedor_ref || identity.aal!=='aal2') return reject();
      if(a.estado==='pendiente') {a.estado='activa';await s.saveAccount(a);}
      session.mfa=true;session.vault=this.vault.seal(identity);session.csrf=token();
      const rotated=token();session.revoked=true;await s.saveSession(hash(sid),session);
      session.revoked=false;await s.saveSession(hash(rotated),session);
      return {sid:rotated,csrf:session.csrf};
    });
  }
  async logout(sid: string, csrf: string) {
    const tokens=await this.db.transaction(async s => {
      const session=await s.session(hash(sid));
      if(!session) return;
      if(session.csrf!==csrf) throw new AuthError(403,'FORBIDDEN');
      session.revoked=true;await s.saveSession(hash(sid),session);return {value:this.vault.open<Tokens>(session.vault),id:session.accountId};
    });
    // Cierre local confirmado antes de la dependencia; conservar tarea de conciliación si falla.
    if(tokens) {try {await this.provider.logout(tokens.value);} catch {await this.db.transaction(s=>s.delivery(tokens.id,this.vault.seal({kind:'logout',tokens:tokens.value})));}}
  }
  // Puerto interno para futura gestión de cuentas; sin endpoint público de invitaciones.
  async issue(email: string, kind: 'invite' | 'recovery') {
    const raw=token(), key=hash(raw);
    const job=await this.db.transaction(async s => {
      const a=await s.account(email);
      if(!a || a.estado==='inactiva' || (kind==='invite' && a.estado!=='pendiente') || (kind==='recovery' && (a.estado!=='activa' || !a.credencial_lista)) || await s.busy(a.id)) return;
      await s.supersede(a.id);
      const i={accountId:a.id,kind,expires:this.now()+(kind==='invite'?86400000:1800000),state:'processing' as const,vault:''};
      await s.saveIntent(key,i);
      return {a,i};
    });
    if(!job) return;
    let link: {userId:string;hash:string}|undefined;
    try {link=await this.provider.link(job.a.correo,kind);if(job.a.proveedor_ref && job.a.proveedor_ref!==link.userId) link=undefined;} catch { /* operación externa incierta, no repetir automáticamente */ }
    await this.db.transaction(async s => {
      const a=await s.account(job.a.id),i=await s.intent(key);
      if(!a || !i) throw new Error('Missing identity intent');
      if(!link || a.estado==='inactiva') {i.state='uncertain';await s.saveIntent(key,i);return;}
      a.proveedor_ref=link.userId;await s.saveAccount(a);
      i.state='pending';i.vault=this.vault.seal(link);await s.saveIntent(key,i);
      await s.delivery(a.id,this.vault.seal({kind:'mail',to:a.correo,url:this.origin+'/acceso#token='+raw,intent:key}));
    });
  }

  async complete(raw: string, password: string) {
    // Reclamar y bloquear acceso ANTES de un efecto externo no transaccional.
    const job=await this.db.transaction(async s => {
      const i=await s.intent(hash(raw));
      if(!i || i.state!=='pending' || this.now()>=i.expires) return reject();
      const a=await s.account(i.accountId);
      if(!a || a.estado==='inactiva') return reject();
      i.state='processing';await s.saveIntent(hash(raw),i);
      a.credencial_lista=false;a.version_autorizacion=String(BigInt(a.version_autorizacion)+1n);await s.saveAccount(a);await s.revoke(a.id);
      return {i,a};
    });
    let success=false;
    try {const link=this.vault.open<{hash:string}>(job.i.vault);const id=await this.provider.complete(link.hash,job.i.kind,password,job.a.proveedor_ref!);success=id===job.a.proveedor_ref;} catch { /* no reintento ciego */ }
    await this.db.transaction(async s => {
      const i=await s.intent(hash(raw)), a=await s.account(job.a.id);
      if(!i || !a) throw new Error('Missing identity operation');
      i.state=success?'completed':'uncertain';await s.saveIntent(hash(raw),i);
      if(success && a.estado!=='inactiva' && a.version_autorizacion===job.a.version_autorizacion) {a.credencial_lista=true;if(a.rol==='lectura') a.estado='activa';await s.saveAccount(a);}
    });
    if(!success) throw new AuthError(503,'DEPENDENCY_UNAVAILABLE');
  }
}
