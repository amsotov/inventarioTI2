import {createHash,createHmac,pbkdf2Sync,randomBytes} from 'node:crypto';
import type {PoolClient} from 'pg';
type TrialAccount={authId:string;employeeRef:string;email:string;role:'administrador'|'lectura'};
function verifier(password:string) {
 if(!/^[A-Za-z0-9_-]{32,128}$/.test(password))throw Error('INVALID_TRIAL_DATABASE_PASSWORD');
 const salt=randomBytes(16),key=pbkdf2Sync(password,salt,4096,32,'sha256');
 const client=createHmac('sha256',key).update('Client Key').digest();
 return 'SCRAM-SHA-256$4096:'+salt.toString('base64')+'$'+createHash('sha256').update(client).digest('base64')+':'+createHmac('sha256',key).update('Server Key').digest('base64');
}
/** Herramienta del operador; nunca importarla en el BFF. Solo laboratorio nuevo y vínculo por UUID explícito.
 * El llamador verifica previamente los dos usuarios confirmados por la Admin API de Supabase.
 * No crea usuarios Auth, invita, envía correo, altera permisos de rol ni conserva contraseñas externas.
 */
export async function bindTrialAccounts(db:PoolClient,accounts:readonly TrialAccount[],passwords:{auth:string;runtime:string}) {
 if(accounts.length!==2||accounts.filter(a=>a.role==='administrador').length!==1||accounts.filter(a=>a.role==='lectura').length!==1||
  new Set(accounts.map(a=>a.authId)).size!==2||new Set(accounts.map(a=>a.employeeRef)).size!==2||passwords.auth===passwords.runtime)throw Error('INVALID_TRIAL_ACCOUNT_BINDING');
 const scram=[verifier(passwords.auth),verifier(passwords.runtime)];
 await db.query('begin');
 try {
  await db.query('lock table inventario.cuentas,laboratorio_ti.usuario_auth,laboratorio_ti."USUARIOS" in exclusive mode');
  const counts=(await db.query('select (select count(*) from inventario.cuentas)::int cuentas,(select count(*) from laboratorio_ti.usuario_auth)::int vinculos,(select count(*) from laboratorio_ti."USUARIOS")::int usuarios')).rows[0];
  if(counts.cuentas||counts.vinculos||counts.usuarios)throw Error('TRIAL_BOOTSTRAP_ALREADY_USED');
  const roles=(await db.query("select r.rolname,r.rolsuper,r.rolbypassrls,r.rolcreaterole,r.rolcreatedb,exists(select 1 from pg_auth_members m where m.member=r.oid) memberships,exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relowner=r.oid and n.nspname in ('inventario','seguridad','acceso','laboratorio_ti')) owner from pg_roles r where r.rolname in ('inventario_auth','inventario_runtime')")).rows;
  if(roles.length!==2||roles.some(r=>r.rolsuper||r.rolbypassrls||r.rolcreaterole||r.rolcreatedb||r.memberships||r.owner))throw Error('UNSAFE_TRIAL_DATABASE_ROLE');
  for(const account of accounts){
   const employee=(await db.query('select f."FUNC_ID" id from laboratorio_ti."FUNCIONARIOS" f join laboratorio_ti.referencias r on r.tabla=$1 and r.id=f."FUNC_ID" where r.ref=$2 and f."FUNC_ACTIVO" for share',['FUNCIONARIOS',account.employeeRef])).rows[0];
   if(!employee)throw Error('TRIAL_EMPLOYEE_NOT_FOUND');
   await db.query("insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,$2,$3,$4,'activa',true)",[account.authId,account.role==='administrador'?'Administración de ensayo':'Lectura de ensayo',account.email,account.role]);
   const user=(await db.query('insert into laboratorio_ti."USUARIOS"("USUA_FUNCIONARIO_ID","USUA_CLAVE_HASH") values($1,null) returning "USUA_ID" id',[employee.id])).rows[0];
   await db.query('insert into laboratorio_ti.usuario_auth(cuenta_id,usuario_id) values($1,$2)',[account.authId,user.id]);
  }
  // Nombres estáticos y verificadores SCRAM aleatorios; ninguna contraseña plana en SQL ni credencial en la salida.
  await db.query("alter role inventario_auth login password '"+scram[0]+"'");
  await db.query("alter role inventario_runtime login password '"+scram[1]+"'");
  await db.query('commit');
 }catch(error){await db.query('rollback');throw error;}
}
