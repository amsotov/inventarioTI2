import { Pool, type PoolClient } from 'pg';
import { AuthService, AuthError } from '../auth/service.js';
import { hash } from '../auth/crypto.js';
import { allowed, type Permission } from './policy.js';
// Puerto interno: ningún SQL, permiso, contexto o callback proviene del cliente HTTP.
export class Authorization {
  constructor(private auth: AuthService, private pool: Pool) {}
  async run<T>(sid: string, permission: Permission, fn: (db: PoolClient) => Promise<T>, csrf?: string, snapshot = false): Promise<T> {
    await assertDatabaseRole(this.pool,'inventario_runtime');
    return this.auth.withPrincipal(sid,csrf,async account=>{
      const c=await this.pool.connect();

      try {
        await c.query(snapshot ? 'begin isolation level repeatable read' : 'begin');
        await c.query("set local timezone = 'UTC'");
        await c.query("select set_config('inventario.sesion',$1,true)",[hash(sid)]);
        const current=(await c.query('select * from seguridad.principal()')).rows[0];
        if(!current || current.actor_id!==account.id || current.rol!==account.rol) throw new AuthError(401,'SESSION_REQUIRED');
        const permitted=allowed(current.rol,permission);
        await c.query('insert into seguridad.eventos(actor_id,permiso,permitido) values($1,$2,$3)',[current.actor_id,permission,permitted]);
        if(!permitted) {await c.query('commit');throw new AuthError(403,'FORBIDDEN');}
        if(['inventario.modificar','cuentas.administrar','configuracion.administrar'].includes(permission) && csrf===undefined) throw new AuthError(403,'FORBIDDEN');
        const result=await fn(c);
        await c.query('commit');return result;
      } catch(e) {await c.query('rollback');throw e;} finally {c.release();}
    });
  }
}

// Ejecutar al arrancar cada proceso. Rechaza propietario, superusuario y membresías amplias.
export async function assertDatabaseRole(pool: Pool, expected: 'inventario_auth' | 'inventario_runtime' | 'inventario_worker') {
  const r=(await pool.query(`select current_user as name, r.rolsuper,r.rolbypassrls,r.rolcreaterole,r.rolcreatedb,
    exists(select 1 from pg_auth_members m where m.member=r.oid) as memberships,
    exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relowner=r.oid and n.nspname in ('inventario','acceso','seguridad')) as owner
    from pg_roles r where r.rolname=current_user`)).rows[0];
  if(!r || r.name!==expected || r.rolsuper || r.rolbypassrls || r.rolcreaterole || r.rolcreatedb || r.memberships || r.owner) throw new Error('Unsafe database role');
}
