import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { Pool } from 'pg';
import { fixture, IdentityDouble } from '../helpers/reports.js';
import { open, seal } from '../../ops/continuity.js';
import { assertDatabaseRole, Authorization } from '../../apps/server/security/postgres.js';
import { AuthService } from '../../apps/server/auth/service.js';
import { Postgres } from '../../apps/server/auth/postgres.js';
import { Vault } from '../../apps/server/auth/crypto.js';
import { Inventory } from '../../apps/server/inventory/service.js';
import { app } from '../../apps/server/app.js';

const docker=(args:string[],input?:Buffer|string)=>execFileSync('docker',args,{input,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});
const hash=(data:Buffer|string)=>createHash('sha256').update(data).digest('hex');
const catalog=`select n.nspname,c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity,
 pg_get_userbyid(c.relowner) owner,c.relacl::text acl
 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname in ('inventario','acceso','seguridad') and c.relkind in ('r','S') order by 1,2`;
const functions=`select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) args,
 pg_get_userbyid(p.proowner) owner,p.prosecdef,p.proconfig,p.proacl::text acl,pg_get_functiondef(p.oid) definition
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('inventario','acceso','seguridad') order by 1,2,3`;
const rolesCatalog=`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil,rolconfig
 from pg_roles where rolname not like 'pg_%' and rolname<>'postgres' order by rolname`;
const memberships=`select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,admin_option,inherit_option,set_option
 from pg_auth_members where pg_get_userbyid(member) not like 'pg_%' order by 1,2`;
const policies=`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies
 where schemaname in ('inventario','acceso','seguridad') order by 1,2,3`;
const sequences=`select schemaname,sequencename,last_value from pg_sequences
 where schemaname in ('inventario','acceso','seguridad') order by 1,2`;

test('isolated encrypted backup restores data, permissions and denial of old sessions without dispatch', {timeout:180000}, async()=>{
  // No DSN/target arguments: both source and destination are generated disposable containers.
  const started=performance.now(), x=await fixture(), target='inventario-recovery-'+randomUUID();
  const password=randomBytes(24).toString('hex'), key=randomBytes(32);
  let created=false, targetRoot:Pool|undefined, authPool:Pool|undefined, business:Pool|undefined, worker:Pool|undefined;
  let server:ReturnType<typeof app>|undefined;
  const checks:string[]=[];
  try {
    // Include identity deliveries and an in-flight external side effect in the snapshot.
    await x.auth.issue('reader@example.invalid','recovery');
    assert((await x.workerPool.query('select inventario.reclamar_aviso() job')).rows[0].job);
    const snapshot=(await x.root.query('select clock_timestamp() at')).rows[0].at.toISOString();
    const tables=(await x.root.query(catalog)).rows;
    const before:Record<string,string>={};
    assert.equal(tables.filter(v=>v.relkind==='r').length,19);
    for(const table of tables.filter(v=>v.relkind==='r')) {
      const name=`"${table.nspname}"."${table.relname}"`;
      before[name]=(await x.root.query(`select md5(coalesce(string_agg(row_to_json(t)::text,E'\n' order by row_to_json(t)::text),'')) digest from ${name} t`)).rows[0].digest;
    }
    const dump=docker(['exec',x.containerName,'pg_dump','-U','postgres','-d','postgres','-Fc']);
    // Local fixture only. Exclude the destination's existing bootstrap role. No passwords exported.
    const roles=docker(['exec',x.containerName,'pg_dumpall','-U','postgres','--roles-only','--no-role-passwords']).toString()
      .replace(/^CREATE ROLE postgres;\r?\n/gm,'').replace(/^ALTER ROLE postgres .*;\r?\n/gm,'');
    assert(!/PASSWORD '/.test(roles));
    const migrations=readdirSync('supabase/migrations').sort().map(path=>({path,sha256:hash(readFileSync('supabase/migrations/'+path))}));
    const manifest={format:'IT2-LOCAL-REHEARSAL-1',snapshot,commit:execFileSync('git',['rev-parse','HEAD']).toString().trim(),migrations,
      dumpSha256:hash(dump),rolesSha256:hash(roles),identity:'double; no managed Auth backup',configuration:'names only; secrets held separately',
      requiredSecrets:['AUTH_ENCRYPTION_KEY','database role passwords','managed identity keys'],retentionDays:30};
    const encrypted=seal(Buffer.from(JSON.stringify({manifest,roles,dump:dump.toString('base64')})),key);
    // Never retain keys beside the archive. Only synthetic data in this ignored work directory.
    const privateDir='work/fase14/private';
    mkdirSync(privateDir,{recursive:true,mode:0o700});chmodSync(privateDir,0o700);
    writeFileSync(privateDir+'/rehearsal.enc',encrypted,{mode:0o600});
    const recovered=JSON.parse(open(readFileSync(privateDir+'/rehearsal.enc'),key).toString());
    const restoredDump=Buffer.from(recovered.dump,'base64');
    assert.equal(hash(restoredDump),recovered.manifest.dumpSha256);
    assert.equal(hash(recovered.roles),recovered.manifest.rolesSha256);
    checks.push('AES-256-GCM roundtrip and manifest hashes; no credential values in manifest');
    await x.root.query("insert into inventario.unidades(nombre) values('AFTER-SNAPSHOT')");

    docker(['run','-d','--name',target,'-e','POSTGRES_PASSWORD='+password,'-p','127.0.0.1::5432',
      'postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f']);created=true;
    const port=Number(docker(['port',target,'5432/tcp']).toString().trim().split(':').at(-1));
    const cfg={host:'127.0.0.1',port,password,database:'postgres',max:3,connectionTimeoutMillis:2000,statement_timeout:15000};
    targetRoot=new Pool({...cfg,user:'postgres'});
    for(let n=0;;n++) {try{await targetRoot.query('select 1');break;}catch(e){if(n>=99)throw e;await new Promise(r=>setTimeout(r,100));}}
    docker(['exec','-i',target,'psql','-U','postgres','-v','ON_ERROR_STOP=1'],recovered.roles);
    docker(['exec','-i',target,'pg_restore','-U','postgres','-d','postgres','--exit-on-error','--single-transaction'],restoredDump);
    assert.deepEqual((await targetRoot.query(catalog)).rows,tables);
    assert.deepEqual((await targetRoot.query(functions)).rows,(await x.root.query(functions)).rows);
    for(const query of [rolesCatalog,memberships,policies,sequences])
      assert.deepEqual((await targetRoot.query(query)).rows,(await x.root.query(query)).rows);
    assert.equal(Object.keys(before).length,19,'Every private table must have a row digest');
    for(const [name,digest] of Object.entries(before))
      assert.equal((await targetRoot.query(`select md5(coalesce(string_agg(row_to_json(t)::text,E'\n' order by row_to_json(t)::text),'')) digest from ${name} t`)).rows[0].digest,digest,name);
    assert.equal((await targetRoot.query("select count(*) n from inventario.unidades where nombre='AFTER-SNAPSHOT'")).rows[0].n,'0');
    checks.push('all private table row hashes, schema RLS/FORCE/ACL/owners and function definitions/ACL match snapshot; later write absent');
    assert.equal((await targetRoot.query("select count(*) n from pg_authid where rolname like 'inventario%' and rolpassword is not null")).rows[0].n,'0');
    await targetRoot.query(readFileSync('ops/recovery-isolation.sql','utf8'));
    await targetRoot.query(`alter role inventario_auth password '${password}';alter role inventario_runtime password '${password}';alter role inventario_worker password '${password}'`);
    authPool=new Pool({...cfg,user:'inventario_auth'});business=new Pool({...cfg,user:'inventario_runtime'});worker=new Pool({...cfg,user:'inventario_worker'});
    await assertDatabaseRole(authPool,'inventario_auth');await assertDatabaseRole(business,'inventario_runtime');await assertDatabaseRole(worker,'inventario_worker');
    await assert.rejects(()=>worker!.query('select * from inventario.cuentas'),e=>(e as {code:string}).code==='42501');
    assert.equal((await worker.query('select inventario.reclamar_aviso() job')).rows[0].job,null);
    assert.equal((await targetRoot.query("select count(*) n from inventario.outbox where estado in ('pendiente','procesando')")).rows[0].n,'0');
    assert.equal((await targetRoot.query("select count(*) n from acceso.intenciones where datos->>'state'='pending'")).rows[0].n,'0');
    assert.equal((await targetRoot.query("select count(*) n from acceso.entregas where estado in ('pendiente','procesando')")).rows[0].n,'0');
    checks.push('SQL identities remain least privileged; role passwords reissued; old identity deliveries blocked; outbox quarantined; worker cannot claim');
    const auth=new AuthService(new Postgres(authPool),new IdentityDouble(),new Vault(randomBytes(32).toString('base64')),'https://inventario.test');
    const security=new Authorization(auth,business);
    server=app(auth,'https://inventario.test',new Inventory(security),undefined,security);
    assert.equal((await server.inject({url:'/api/v1/sesion',headers:x.headers(x.r)})).statusCode,401);
    const login=await auth.login('reader@example.invalid','synthetic');
    assert.equal((await server.inject({url:'/api/v1/bienes',headers:x.headers(login)})).statusCode,200);
    assert.equal((await server.inject({url:'/api/v1/admin/cuentas',headers:x.headers(login)})).statusCode,403);
    checks.push('old session 401; fresh login can read restored inventory; reader denied administrative accounts');
    // Failed DDL is atomic in an isolated target. No migration history is rewritten.
    await assert.rejects(()=>targetRoot!.query('begin;create table public.failed_rehearsal(id int);select 1/0;commit;'));
    await targetRoot.query('rollback');
    assert.equal((await targetRoot.query("select to_regclass('public.failed_rehearsal') present")).rows[0].present,null);
    checks.push('failed transactional migration rolls back entirely');
    const elapsedMs=Math.round(performance.now()-started);
    assert(elapsedMs<8*3600000);
    const result={status:'PASS',scope:'synthetic local PostgreSQL 17; identity double; no managed recovery or production RTO claim',snapshot,
      elapsedMs,rtoTargetMs:8*3600000,tableCount:Object.keys(before).length,checks,managedIdentity:'NOT_EXECUTED',externalUploadRetention:'NOT_EXECUTED',productionRollback:'NOT_EXECUTED'};
    mkdirSync('docs/evidencias/fase14',{recursive:true});
    writeFileSync('docs/evidencias/fase14/recuperacion.json',JSON.stringify(result,null,2)+'\n');
  } finally {
    await server?.close();
    await Promise.all([targetRoot?.end(),authPool?.end(),business?.end(),worker?.end()]);
    if(created)docker(['rm','-f','-v',target]);
    await x.close();
  }
});
