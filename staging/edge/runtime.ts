// Adaptador del backend existente. No abre sockets HTTP ni usa la conexión operadora.
import {Buffer} from 'node:buffer';
import process from 'node:process';
import {createHash,createDecipheriv} from 'node:crypto';
import {Pool} from 'pg';
import {gunzipSync} from 'node:zlib';
import {fontGzip} from './font.js';
import {app} from './server/app.js';
import {AuthService} from './server/auth/service.js';
import {Postgres} from './server/auth/postgres.js';
import {Vault} from './server/auth/crypto.js';
import {SupabaseProvider} from './server/auth/supabase.js';
import {Authorization,assertDatabaseRole} from './server/security/postgres.js';
import {Inventory} from './server/inventory/service.js';
import {postgresInventory} from './server/inventory/postgres.js';
import {PostgresLabModelBackend} from './server/modernization/postgres-lab.js';
import {Reports} from './server/reports/service.js';
import {render} from './server/reports/renderer.mjs';
import deployment from './deployment.json' with {type:'json'};
globalThis.Buffer??=Buffer;globalThis.process??=process;
const PROJECT='yhsfotxhaptinjtmrinn';
function configuration(envelope:string,serverKey:string){
 const e=JSON.parse(envelope);if(e.v!==1)throw Error('INVALID_ENVELOPE');
 const key=createHash('sha256').update('inventarioTI2:private-runtime:v1\0'+serverKey).digest();
 const d=createDecipheriv('aes-256-gcm',key,Buffer.from(e.iv,'base64url'));d.setAuthTag(Buffer.from(e.tag,'base64url'));
 const c=JSON.parse(Buffer.concat([d.update(Buffer.from(e.data,'base64url')),d.final()]).toString());
 if(c.v!==1||c.project!==PROJECT||c.deploymentId!==deployment.deploymentId||c.origin!==deployment.origin)throw Error('INVALID_DEPLOYMENT');
 for(const [value,role] of [[c.authUrl,'inventario_auth'],[c.businessUrl,'inventario_runtime']]){
  const u=new URL(value);if(!['postgres:','postgresql:'].includes(u.protocol)||u.hostname!==`db.${PROJECT}.supabase.co`||decodeURIComponent(u.username)!==role)throw Error('INVALID_DATABASE');
  for(const k of ['sslmode','sslrootcert','sslcert','sslkey','ssl'])u.searchParams.delete(k);
 }
 return c;
}
export async function initialize(envelope:string){
 const serverKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
 if(!serverKey)throw Error('AUTH_BINDING_REQUIRED');
 const c=configuration(envelope,serverKey);
 const connect=(connectionString:string)=>new Pool({connectionString,ssl:{rejectUnauthorized:true},max:2,connectionTimeoutMillis:5000,statement_timeout:15000,idleTimeoutMillis:10000});
 const authPool=connect(c.authUrl),business=connect(c.businessUrl);
 await assertDatabaseRole(authPool,'inventario_auth');await assertDatabaseRole(business,'inventario_runtime');
 if((await business.query('select laboratorio_ti.version() v')).rows[0].v!=='postgres-lab-v1')throw Error('WRONG_DATABASE');
 const publicKey=Deno.env.get('SUPABASE_ANON_KEY')||JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}').default;
 const provider=new SupabaseProvider(`https://${PROJECT}.supabase.co`,publicKey,serverKey);
 const sendEmailLink=provider.sendEmailLink.bind(provider);
 provider.sendEmailLink=async(...args)=>{if(!deployment.emailRedirectReady)throw Error('EMAIL_REDIRECT_REQUIRED');return sendEmailLink(...args);};
 const auth=new AuthService(new Postgres(authPool),provider,new Vault(c.encryptionKey),c.origin,undefined,'email-otp');
 const security=new Authorization(auth,business);
 // Mismo renderer y selección v1; sin Worker threads (no disponibles en Edge).
 const reports=new Reports(security,async(report,format)=>Buffer.from(await render({report,format,font:format==='pdf'?gunzipSync(Buffer.from(fontGzip,'base64')):undefined})));
 const server=app(auth,c.origin,new Inventory(postgresInventory(security)),undefined,security,new PostgresLabModelBackend(),reports);
 await server.ready();return {server,reports};
}
