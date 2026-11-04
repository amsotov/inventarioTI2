export type Tokens = { access_token: string; refresh_token: string };
export type Identity = Tokens & { userId: string; aal: 'aal1' | 'aal2'; email?: string; emailConfirmed?: boolean };
export interface Provider {
  sendEmailLink?(email:string,verifier:string,redirectTo:string):Promise<void>;
  exchangeEmailLink?(code:string,verifier:string):Promise<Identity>;
  sendEmailOtp?(email: string): Promise<void>;
  verifyEmailOtp?(email: string, code: string): Promise<Identity>;
  login(email: string, password: string): Promise<Identity>;
  validate(tokens: Tokens): Promise<Identity>;
  factors(tokens: Tokens): Promise<{id: string; factorType: string}[]>;
  enroll(tokens: Tokens): Promise<{ id: string; qr: string; secret: string }>;
  verify(tokens: Tokens, factor: string, code: string): Promise<Identity>;
  link(email: string, kind: 'invite' | 'recovery'): Promise<{ userId: string; hash: string }>;
  complete(hash: string, kind: 'invite' | 'recovery', password: string, expectedUserId: string): Promise<string>;
  logout(tokens: Tokens): Promise<void>;
}
export type Account = { id: string; correo: string; proveedor_ref: string | null; rol: 'administrador' | 'lectura'; estado: string; version_autorizacion: string; credencial_lista: boolean };
export type Session = { accountId: string; version: string; created: number; activity: number; mfa: boolean; method?: 'email-otp'; emailVerified?: boolean; csrf: string; vault: string; revoked: boolean };
export type Intent = { accountId: string; kind: 'invite' | 'recovery' | 'email-login'; expires: number; state: 'pending' | 'processing' | 'completed' | 'uncertain' | 'superseded' | 'consumed'; vault: string };
export interface Store {
  account(emailOrId: string): Promise<Account | undefined>;
  saveAccount(account: Account): Promise<void>;
  session(hash: string): Promise<Session | undefined>;
  saveSession(hash: string, session: Session): Promise<void>;
  revoke(accountId: string): Promise<void>;
  intent(hash: string): Promise<Intent | undefined>;
  saveIntent(hash: string, intent: Intent): Promise<void>;
  busy(accountId: string): Promise<boolean>;
  supersede(accountId: string): Promise<void>;
  delivery(accountId: string, envelope: string): Promise<void>;
  rate(key: string, window: number, limit: number): Promise<boolean>;
}
export interface Database { transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> }
