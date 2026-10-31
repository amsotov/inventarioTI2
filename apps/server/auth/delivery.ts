import type { Pool } from 'pg';
import type { Provider, Tokens } from './ports.js';
import { Vault } from './crypto.js';
export interface AuthMailer { send(to: string, url: string, correlation: string): Promise<void> }
// Solo correo de identidad al titular. Sin motor de avisos empresariales ni reintento ciego.
export async function dispatchOne(pool: Pool, vault: Vault, provider: Provider, mail: AuthMailer) {
  const c=await pool.connect();
  let job: {id:string;sobre:string}|undefined;
  try {
    await c.query('begin');
    job=(await c.query("select id,sobre from acceso.entregas where estado='pendiente' order by creado_en,id for update skip locked limit 1")).rows[0];
    if(job) await c.query("update acceso.entregas set estado='procesando' where id=$1",[job.id]);
    await c.query('commit');
  } catch(e) {await c.query('rollback');throw e;} finally {c.release();}
  if(!job) return false;
  let state='completada';
  try {
    const payload=vault.open<{kind:string;to:string;url:string;tokens:Tokens;intent:string}>(job.sobre);
    if(payload.kind==='mail') {
      const result=await pool.query("select i.datos,c.estado from acceso.intenciones i join inventario.cuentas c on c.id=i.cuenta_id where i.huella=$1",[payload.intent]);
      const row=result.rows[0];
      if(row && row.estado!=='inactiva' && row.datos.state==='pending' && Date.now()<row.datos.expires) await mail.send(payload.to,payload.url,job.id);
    }
    else if(payload.kind==='logout') await provider.logout(payload.tokens);
    else throw Error('Unknown identity job');
  } catch {state='incierta';}
  await pool.query('update acceso.entregas set estado=$2 where id=$1',[job.id,state]);
  return true;
}
