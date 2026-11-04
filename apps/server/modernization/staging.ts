import { readFileSync } from 'node:fs';
import { PostgresLabModelBackend } from './postgres-lab.js';
const project='yhsfotxhaptinjtmrinn';
/** Activación opt-in del laboratorio autorizado; no habilita SQL Server ni afecta Pages. */
export function stagingModel(env:NodeJS.ProcessEnv) {
 if(!env.MODERNIZATION_BACKEND)return undefined;
 if(env.MODERNIZATION_BACKEND!=='postgres-lab'||env.APP_ENV!=='staging'||env.SUPABASE_PROJECT_REF!==project||
  env.SUPABASE_URL!==`https://${project}.supabase.co`)throw new Error('INVALID_STAGING_MODEL_CONFIGURATION');
 if(env.NOTIFICATION_DELIVERY_ENABLED!=='false')throw new Error('STAGING_DELIVERY_MUST_BE_DISABLED');
 return new PostgresLabModelBackend();
}
export function databaseConnection(value:string,env:NodeJS.ProcessEnv) {
 if(env.MODERNIZATION_BACKEND!=='postgres-lab')return {connectionString:value};
 if(!env.DB_SSL_CA_FILE)throw new Error('STAGING_DATABASE_CA_REQUIRED');
 const url=new URL(value);
 if(!['postgres:','postgresql:'].includes(url.protocol))throw new Error('INVALID_DATABASE_PROTOCOL');
 const direct=url.hostname===`db.${project}.supabase.co`;
 const session=/^aws-[0-9]+-sa-east-1\.pooler\.supabase\.com$/.test(url.hostname)&&decodeURIComponent(url.username).endsWith('.'+project)&&(!url.port||url.port==='5432');
 if(!direct&&!session)throw new Error('STAGING_DATABASE_PROJECT_MISMATCH');
 // pg puede sustituir ssl mediante parámetros URL. Evitar degradación y verificar siempre la CA.
 for(const key of ['sslmode','sslrootcert','sslcert','sslkey','ssl'])url.searchParams.delete(key);
 return {connectionString:url.toString(),ssl:{ca:readFileSync(env.DB_SSL_CA_FILE,'utf8'),rejectUnauthorized:true}};
}
