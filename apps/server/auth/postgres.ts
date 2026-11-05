import { Pool, type PoolClient } from 'pg';
import type { Account, Database, Intent, Session, Store } from './ports.js';
class PgStore implements Store {
  constructor(private c: PoolClient) {}
  async account(key: string): Promise<Account | undefined> {
    return (await this.c.query('select * from inventario.cuentas where id::text=$1 or lower(correo)=lower($1) for no key update', [key])).rows[0];
  }
  async saveAccount(a: Account) {
    await this.c.query('update inventario.cuentas set proveedor_ref=$2, estado=$3, version_autorizacion=$4, credencial_lista=$5 where id=$1', [a.id,a.proveedor_ref,a.estado,a.version_autorizacion,a.credencial_lista]);
  }
  async session(key: string): Promise<Session | undefined> { return (await this.c.query('select datos from acceso.sesiones where huella=$1 for update',[key])).rows[0]?.datos; }
  async saveSession(key: string, s: Session) { await this.c.query('insert into acceso.sesiones(huella,cuenta_id,datos) values($1,$2,$3) on conflict(huella) do update set datos=excluded.datos',[key,s.accountId,s]); }
  async revoke(id: string) { await this.c.query(`update acceso.sesiones set datos=jsonb_set(datos,'{revoked}','true') where cuenta_id=$1`,[id]); }
  async intent(key: string): Promise<Intent | undefined> { return (await this.c.query('select datos from acceso.intenciones where huella=$1 for update',[key])).rows[0]?.datos; }
  async saveIntent(key: string, i: Intent) { await this.c.query('insert into acceso.intenciones(huella,cuenta_id,datos) values($1,$2,$3) on conflict(huella) do update set datos=excluded.datos',[key,i.accountId,i]); }
  async busy(id: string) { return (await this.c.query("select 1 from acceso.intenciones where cuenta_id=$1 and datos->>'state' in ('processing','uncertain') and coalesce(datos->>'kind','')<>'email-login' limit 1",[id])).rowCount !== 0; }
  async supersede(id: string) { await this.c.query(`update acceso.intenciones set datos=jsonb_set(datos,'{state}','"superseded"') where cuenta_id=$1 and datos->>'state'='pending' and coalesce(datos->>'kind','')<>'email-login'`,[id]); }
  async delivery(id: string, envelope: string) { await this.c.query('insert into acceso.entregas(cuenta_id,sobre) values($1,$2)',[id,envelope]); }
  async rate(key: string, window: number, limit: number) {
    const r = await this.c.query(`insert into acceso.limites(huella,ventana,intentos) values($1,$2,1) on conflict(huella) do update set ventana=$2,intentos=case when acceso.limites.ventana=$2 then acceso.limites.intentos+1 else 1 end returning intentos`,[key,window]);
    return r.rows[0].intentos <= limit;
  }
}
export class Postgres implements Database {
  constructor(readonly pool: Pool) {}
  async transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> {
    const c = await this.pool.connect();
    try {
      await c.query('begin');
      // Serializa solo autenticación; permite consumo/reenvío/revocación atómicos en varias instancias.
      await c.query('select pg_advisory_xact_lock(5102026)');
      const result = await fn(new PgStore(c));
      await c.query('commit');
      return result;
    } catch(e) { await c.query('rollback'); throw e; } finally { c.release(); }
  }
}
