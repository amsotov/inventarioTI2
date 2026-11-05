import {authenticationMethod} from './dist/apps/server/auth/configuration.js';
import {readFileSync} from 'node:fs';
import {Pool} from 'pg';
import {createClient} from '@supabase/supabase-js';
import {assertDatabaseRole} from './dist/apps/server/security/postgres.js';
import {stagingModel,databaseConnection} from './dist/apps/server/modernization/staging.js';
// Este archivo se copia a la raíz del paquete. Solo lee; no imprime URLs, claves ni correos.
const required=name=>{if(!process.env[name])throw Error('MISSING_'+name);return process.env[name];};
const pools=[];
try {
 if(!stagingModel(process.env))throw Error('STAGING_REQUIRED');
 if(authenticationMethod(process.env)!=='email-otp')throw Error('EMAIL_AUTH_REQUIRED');
 const origin=required('APP_ORIGIN');if(new URL(origin).origin!==origin||!origin.startsWith('https://'))throw Error('HTTPS_ORIGIN_REQUIRED');
 if(Buffer.from(required('AUTH_ENCRYPTION_KEY'),'base64').length!==32)throw Error('INVALID_ENCRYPTION_KEY');
 readFileSync(required('DB_SSL_CA_FILE'));
 for(const [name,role] of [['DATABASE_URL','inventario_auth'],['BUSINESS_DATABASE_URL','inventario_runtime']]){
  const pool=new Pool({...databaseConnection(required(name),process.env),max:1,connectionTimeoutMillis:5000,statement_timeout:15000});pools.push(pool);await assertDatabaseRole(pool,role);
 }
 if((await pools[1].query('select laboratorio_ti.version() v')).rows[0].v!=='postgres-lab-v1')throw Error('MIGRATION_REQUIRED');
 const mapping=(await pools[1].query('select laboratorio_ti.diagnostico() result')).rows[0].result;
 if(!mapping.adminBound||!mapping.readerBound)throw Error('TEST_ACCOUNT_MAPPING_REQUIRED');
 const provider=createClient(required('SUPABASE_URL'),required('SUPABASE_SECRET_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
 // Supabase Admin API: verificación, sin crear ni enviar invitaciones.
 const {data,error}=await provider.auth.admin.listUsers({page:1,perPage:1000});if(error)throw Error('AUTH_SERVER_KEY_INVALID');
 if(data.users.length===0)throw Error('TEST_ACCOUNTS_REQUIRED');
 const settings=await fetch(required('SUPABASE_URL')+'/auth/v1/settings',{headers:{apikey:required('SUPABASE_PUBLISHABLE_KEY')}});
 if(!settings.ok||(await settings.json()).disable_signup!==true)throw Error('PUBLIC_SIGNUP_MUST_BE_DISABLED');
 // Falta de vínculo cuenta–USUARIO–FUNCIONARIO produce denegación; comprobar con migrador en activación.
 console.log(JSON.stringify({preflight:'ok',databaseRoles:'least-privilege',tls:'verified',auth:'reachable',signup:'closed',delivery:false}));
}catch(error){
 const code=error instanceof Error&&/^[A-Z][A-Z0-9_]+$/.test(error.message)?error.message:'PREFLIGHT_FAILED';
 console.error(JSON.stringify({preflight:'blocked',code}));process.exitCode=1;
}finally{await Promise.all(pools.map(pool=>pool.end()));}
