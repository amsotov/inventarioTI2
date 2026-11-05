import {Pool} from 'pg';
import {createClient} from '@supabase/supabase-js';
import {bindTrialAccounts} from '../../dist/ops/staging-bootstrap.js';
import {stagingModel,databaseConnection} from '../../dist/apps/server/modernization/staging.js';
const required=name=>{if(!process.env[name])throw Error('MISSING_'+name);return process.env[name];};
let pool;
try {
 if(!stagingModel(process.env))throw Error('STAGING_REQUIRED');
 const provider=createClient(required('SUPABASE_URL'),required('SUPABASE_SECRET_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
 const all=await provider.auth.admin.listUsers({page:1,perPage:3});
 if(all.error||all.data.users.length!==2)throw Error('EXACTLY_TWO_TEST_AUTH_USERS_REQUIRED');
 const accounts=[];
 for(const [label,role] of [['ADMIN','administrador'],['READER','lectura']]){
  const id=required('STAGING_'+label+'_AUTH_ID');
  const {data,error}=await provider.auth.admin.getUserById(id);
  if(error||!data.user?.email||!data.user.email_confirmed_at||data.user.is_anonymous||data.user.banned_until&&new Date(data.user.banned_until)>new Date())throw Error('CONFIRMED_TEST_USER_REQUIRED');
  accounts.push({authId:id,employeeRef:required('STAGING_'+label+'_FUNCIONARIO_REF'),email:data.user.email,role});
 }
 pool=new Pool({...databaseConnection(required('STAGING_MIGRATOR_DATABASE_URL'),process.env),max:1,connectionTimeoutMillis:5000,statement_timeout:15000});
 if((await pool.query('select laboratorio_ti.version() v')).rows[0].v!=='postgres-lab-v1')throw Error('MIGRATION_REQUIRED');
 const client=await pool.connect();
 try{await bindTrialAccounts(client,accounts,{auth:required('STAGING_AUTH_DB_PASSWORD'),runtime:required('STAGING_RUNTIME_DB_PASSWORD')});}finally{client.release();}
 console.log(JSON.stringify({bootstrap:'complete',accounts:2,mapping:'explicit-uuid',databaseRoles:['inventario_auth','inventario_runtime'],worker:'unchanged',externalPasswordsStored:false}));
}catch(error){
 const code=error instanceof Error&&/^[A-Z][A-Z0-9_]+$/.test(error.message)?error.message:'BOOTSTRAP_FAILED';
 console.error(JSON.stringify({bootstrap:'blocked',code}));process.exitCode=1;
}finally{await pool?.end();}
