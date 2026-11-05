import {authenticationMethod} from './auth/configuration.js';
import { stagingModel, databaseConnection } from './modernization/staging.js';
import { inventoryDriver } from './inventory/configuration.js';
import { postgresInventory } from './inventory/postgres.js';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { assertDatabaseRole } from './security/postgres.js';
import { Authorization } from './security/postgres.js';
import { Inventory } from './inventory/service.js';
import { app } from './app.js';
import { Postgres } from './auth/postgres.js';
import { SupabaseProvider } from './auth/supabase.js';
import { Vault } from './auth/crypto.js';
import { AuthService } from './auth/service.js';
import { operations } from './operations.js';
function required(name: string) { const v=process.env[name];if(!v) throw new Error('Missing '+name);return v; }
inventoryDriver(process.env.INVENTORY_BACKEND);
const modernization=stagingModel(process.env);
const origin=required('APP_ORIGIN');
if(new URL(origin).origin!==origin || !origin.startsWith('https://')) throw new Error('APP_ORIGIN requires HTTPS origin');
const pool=new Pool({...databaseConnection(required('DATABASE_URL'),process.env),max:5,connectionTimeoutMillis:5000,statement_timeout:15000});
await assertDatabaseRole(pool,'inventario_auth');
const auth=new AuthService(new Postgres(pool),new SupabaseProvider(required('SUPABASE_URL'),required('SUPABASE_PUBLISHABLE_KEY'),required('SUPABASE_SECRET_KEY')),new Vault(required('AUTH_ENCRYPTION_KEY')),origin,undefined,authenticationMethod(process.env));
const business=new Pool({...databaseConnection(required('BUSINESS_DATABASE_URL'),process.env),max:5,connectionTimeoutMillis:5000,statement_timeout:15000});
await assertDatabaseRole(business,'inventario_runtime');
if(modernization)await business.query("select laboratorio_ti.version()");
const security=new Authorization(auth,business);
const server=app(auth,origin,new Inventory(postgresInventory(security)),fileURLToPath(new URL('../../web/',import.meta.url)),security,modernization);
operations(server,async()=>{
  await Promise.all([assertDatabaseRole(pool,'inventario_auth'),assertDatabaseRole(business,'inventario_runtime')]);
  if(modernization)await business.query("select laboratorio_ti.version()");
},line=>process.stdout.write(line));
// Loopback remains the default. A managed private ingress can explicitly bind all interfaces.
const host=process.env.HOST??'127.0.0.1';
if(!['127.0.0.1','0.0.0.0'].includes(host)) throw new Error('Invalid HOST');
await server.listen({host,port:Number(process.env.PORT??3000)});
for(const signal of ['SIGTERM','SIGINT']) process.once(signal,async()=>{await server.close();await pool.end();await business.end();});
