import type{PoolClient}from'pg';import type{SupabaseClient}from'@supabase/supabase-js';
/** Operación expresa del ensayo: mismo UUID/rol/funcionario, nuevo correo y sesiones anteriores cerradas. */
export async function configureEmailAccount(db:PoolClient,provider:SupabaseClient,input:{authId:string;email:string;expectedEmail:string;deploymentId:string}) {
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)||input.email.endsWith('.invalid'))throw Error('REAL_EMAIL_REQUIRED');
 await db.query('begin');
 try{
  await db.query('select pg_advisory_xact_lock(5102026)');
  if((await db.query('select laboratorio_ti.version() v')).rows[0].v!=='postgres-lab-v1')throw Error('WRONG_DATABASE');
  const account=(await db.query('select id,correo,rol,proveedor_ref,estado from inventario.cuentas where id=$1 for update',[input.authId])).rows[0];
  if(!account||account.proveedor_ref!==input.authId||account.rol!=='administrador'||account.estado!=='activa'||![input.expectedEmail,input.email].includes(account.correo.toLowerCase()))throw Error('UNEXPECTED_ACCOUNT');
  const existing=await provider.auth.admin.getUserById(input.authId);
  if(existing.error||existing.data.user.app_metadata?.trial_deployment!==input.deploymentId||![input.expectedEmail,input.email].includes(existing.data.user.email?.toLowerCase()??''))throw Error('UNEXPECTED_PROVIDER_ACCOUNT');
  if(existing.data.user.email?.toLowerCase()!==input.email){
   const changed=await provider.auth.admin.updateUserById(input.authId,{email:input.email,email_confirm:false});
   if(changed.error||changed.data.user.email?.toLowerCase()!==input.email)throw Error('EMAIL_UPDATE_FAILED');
  }
  const factors=await provider.auth.admin.mfa.listFactors({userId:input.authId});if(factors.error)throw Error('MFA_LIST_FAILED');
  for(const f of factors.data.factors){const removed=await provider.auth.admin.mfa.deleteFactor({userId:input.authId,id:f.id});if(removed.error)throw Error('MFA_REMOVE_FAILED');}
  await db.query('update inventario.cuentas set correo=$2,version_autorizacion=version_autorizacion+1 where id=$1',[input.authId,input.email]);
  await db.query("update acceso.sesiones set datos=jsonb_set(datos,'{revoked}','true') where cuenta_id=$1",[input.authId]);
  await db.query('commit');return {updated:true,priorSessionsRevoked:true,mfaRemoved:factors.data.factors.length};
 }catch(e){await db.query('rollback');throw e;}
}
