import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { Postgres } from '../../apps/server/auth/postgres.js';
import { Vault, hash } from '../../apps/server/auth/crypto.js';
import { AuthService } from '../../apps/server/auth/service.js';
import { dispatchOne } from '../../apps/server/auth/delivery.js';
import { app } from '../../apps/server/app.js';
import type { Provider, Tokens, Identity } from '../../apps/server/auth/ports.js';
const image='postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f';
class FakeProvider implements Provider {
  fail=false; failLink=false; failLogout=false; failMfa=false; calls=0;
  async login(email:string,password:string):Promise<Identity> {if(password!=='synthetic-password') throw Error();return {userId:email.startsWith('admin')?'00000000-0000-4000-8000-000000000002':'00000000-0000-4000-8000-000000000001',access_token:'fake-access',refresh_token:'fake-refresh',aal:'aal1'};}
  async validate(t:Tokens):Promise<Identity>{return { ...t,userId:t.access_token.includes('admin')?'00000000-0000-4000-8000-000000000002':'00000000-0000-4000-8000-000000000001',aal:t.access_token.includes('aal2')?'aal2':'aal1'};}
  async factors(){return [{id:'factor',factorType:'totp'}];}
  async enroll(){return {id:'factor',qr:'synthetic-qr',secret:'synthetic-secret'};}
  async verify(){if(this.failMfa)throw Error();return {userId:'00000000-0000-4000-8000-000000000002',access_token:'admin-aal2',refresh_token:'fake-refresh',aal:'aal2' as const};}
  async link(email:string){if(this.failLink)throw Error();return {userId:email.startsWith('admin')?'00000000-0000-4000-8000-000000000002':'00000000-0000-4000-8000-000000000001',hash:email};}
  async complete(providerHash:string){this.calls++;if(this.fail)throw Error('synthetic-provider-secret');return providerHash.startsWith('admin')?'00000000-0000-4000-8000-000000000002':'00000000-0000-4000-8000-000000000001';}
  async logout(){if(this.failLogout)throw Error();}
}
test('Fase 5: PostgreSQL real aislado, proveedor DOBLE (no Supabase real)',async t=>{
  const name='inventario-auth-test-'+randomUUID();const password=randomBytes(24).toString('hex');
  const docker=(...args:string[])=>execFileSync('docker',args,{encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
  docker('run','-d','--name',name,'-e','POSTGRES_PASSWORD='+password,'-p','127.0.0.1::5432',image);
  let pool:Pool|undefined;
  try{
    const port=docker('port',name,'5432/tcp').split(':').at(-1);
    pool=new Pool({host:'127.0.0.1',port:Number(port),user:'postgres',password,database:'postgres',max:8});
    let ready=false;for(let n=0;n<100;n++){try{await pool.query('select 1');ready=true;break;}catch{await new Promise(r=>setTimeout(r,200));}}assert(ready);
    for(const f of readdirSync('supabase/migrations').sort())await pool.query(readFileSync('supabase/migrations/'+f,'utf8'));
    const db=new Postgres(pool), provider=new FakeProvider(),vault=new Vault(randomBytes(32).toString('base64'));let now=Date.parse('2026-10-31T00:00:00Z');
    // Mantiene identificación por token del doble, incluida la cuenta administrativa.
    const original=provider.login.bind(provider);provider.login=async(email,p)=>{const i=await original(email,p);if(email.startsWith('admin')) i.access_token='admin-aal1';return i;};
    const auth=new AuthService(db,provider,vault,'https://inventario.test',()=>now);
    const origin='https://inventario.test',server=app(auth,origin);
    const id='10000000-0000-4000-8000-000000000001',admin='10000000-0000-4000-8000-000000000002';
    const reset=async()=>{now=Date.parse('2026-10-31T00:00:00Z');provider.fail=false;provider.failLink=false;provider.failLogout=false;provider.failMfa=false;await pool!.query('truncate acceso.sesiones,acceso.intenciones,acceso.entregas,acceso.limites');await pool!.query(`update inventario.cuentas set estado='activa',credencial_lista=true,version_autorizacion=1`);};
    await pool.query(`insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,'00000000-0000-4000-8000-000000000001','Prueba','lectura@example.invalid','lectura','activa',true),($2,'00000000-0000-4000-8000-000000000002','Admin','admin@example.invalid','administrador','activa',true)`,[id,admin]);
    const login=()=>auth.login('lectura@example.invalid','synthetic-password');
    const latest=async()=>{const r=await pool!.query('select sobre from acceso.entregas order by creado_en desc limit 1');return new URL(vault.open<{url:string}>(r.rows[0].sobre).url).hash.slice(7);};
    await t.test('cookie segura, secreto fuera de respuesta, campos desconocidos y Origin',async()=>{
      const r=await server.inject({method:'POST',url:'/api/v1/sesion',headers:{origin},payload:{email:'lectura@example.invalid',password:'synthetic-password'}});
      assert.equal(r.statusCode,200);assert.match(r.headers['set-cookie'] as string,/HttpOnly; Secure; SameSite=Strict/);assert(!r.body.includes('fake-access'));
      const cookie=(r.headers['set-cookie'] as string).split(';')[0];
      assert.equal((await server.inject({url:'/api/v1/sesion',headers:{cookie}})).statusCode,200);
      assert.equal((await server.inject({method:'POST',url:'/api/v1/sesion',payload:{email:'x',password:'y'}})).statusCode,403);
      assert.equal((await server.inject({method:'POST',url:'/api/v1/sesion',headers:{origin},payload:{email:'x@y.cl',password:'y',rol:'administrador'}})).statusCode,400);
      assert.equal((await server.inject({method:'POST',url:'/api/v1/sesion/actividad',headers:{origin,cookie},payload:{}})).statusCode,403);
    });
    await t.test('inactividad exacta 30 min; polling no renueva; actividad explícita sí',async()=>{await reset();const s=await login();now+=29*60000;await auth.status(s.sid);await auth.activity(s.sid,s.csrf);now+=29*60000;await auth.status(s.sid);now+=60000;await assert.rejects(auth.status(s.sid));});
    await t.test('absoluto 8 h incluso con actividad',async()=>{await reset();const s=await login();for(let n=0;n<23;n++){now+=20*60000;await auth.activity(s.sid,s.csrf);}now+=20*60000;await assert.rejects(auth.status(s.sid));});
    await t.test('revocación por estado y versión vigente en siguiente petición',async()=>{await reset();const s=await login();await pool!.query('update inventario.cuentas set version_autorizacion=2 where id=$1',[id]);await assert.rejects(auth.status(s.sid));await reset();const z=await login();await pool!.query("update inventario.cuentas set estado='inactiva' where id=$1",[id]);await assert.rejects(auth.status(z.sid));await assert.rejects(login());});
    await t.test('MFA obligatorio; error de código; rotación; parcial 10 min',async()=>{await reset();const s=await auth.login('admin@example.invalid','synthetic-password');await assert.rejects(auth.activity(s.sid,s.csrf));await auth.enroll(s.sid,s.csrf);provider.failMfa=true;await assert.rejects(auth.verify(s.sid,s.csrf,'factor','000000'));provider.failMfa=false;const v=await auth.verify(s.sid,s.csrf,'factor','123456');await assert.rejects(auth.status(s.sid));await auth.activity(v.sid,v.csrf);assert.equal((await auth.status(v.sid)).mfaRequired,false);const partial=await auth.login('admin@example.invalid','synthetic-password');now+=600000;await assert.rejects(auth.status(partial.sid));});
    await t.test('logout local persiste aunque falle proveedor; conciliación durable',async()=>{await reset();const s=await login();provider.failLogout=true;await auth.logout(s.sid,s.csrf);await assert.rejects(auth.status(s.sid));assert.equal((await pool!.query('select count(*) from acceso.entregas')).rows[0].count,'1');});
    await t.test('reenvío invalida enlace anterior y recuperación expira exactamente a 30 min',async()=>{await reset();await auth.issue('lectura@example.invalid','recovery');const old=await latest();now+=1;await auth.issue('lectura@example.invalid','recovery');const raw=await latest();await assert.rejects(auth.complete(old,'new-password-synthetic'));now+=1800000;await assert.rejects(auth.complete(raw,'new-password-synthetic'));});
    await t.test('consumo concurrente único y revocación de sesiones previas',async()=>{await reset();const s=await login();await auth.issue('lectura@example.invalid','recovery');const raw=await latest();const calls=provider.calls;const r=await Promise.allSettled([auth.complete(raw,'new-password-synthetic'),auth.complete(raw,'new-password-synthetic')]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.equal(provider.calls,calls+1);await assert.rejects(auth.status(s.sid));await assert.rejects(auth.complete(raw,'new-password-synthetic'));});
    await t.test('fallo externo deja uncertain sin reejecución y bloquea credencial previa',async()=>{await reset();await auth.issue('lectura@example.invalid','recovery');const raw=await latest();provider.fail=true;await assert.rejects(auth.complete(raw,'new-password-synthetic'));await assert.rejects(login());assert.equal((await pool!.query("select datos->>'state' as state from acceso.intenciones")).rows[0].state,'uncertain');await assert.rejects(auth.complete(raw,'new-password-synthetic'));});
    await t.test('invitación pendiente, 24 h, activación lectura, cuenta desactivada no revive',async()=>{await reset();await pool!.query("update inventario.cuentas set estado='pendiente',credencial_lista=false where id=$1",[id]);await assert.rejects(login());await auth.issue('lectura@example.invalid','invite');let raw=await latest();now+=86400000;await assert.rejects(auth.complete(raw,'new-password-synthetic'));await auth.issue('lectura@example.invalid','invite');raw=await latest();await auth.complete(raw,'new-password-synthetic');assert.equal((await auth.status((await login()).sid)).estado,'activa');await auth.issue('lectura@example.invalid','recovery');raw=await latest();await pool!.query("update inventario.cuentas set estado='inactiva' where id=$1",[id]);await assert.rejects(auth.complete(raw,'new-password-synthetic'));});
    await t.test('recuperación pública genérica; rate limit durable entre instancias',async()=>{await reset();const req=(email:string)=>server.inject({method:'POST',url:'/api/v1/acceso/recuperar',headers:{origin},payload:{email}});const a=await req('missing@example.invalid'),b=await req('lectura@example.invalid');assert.equal(a.statusCode,202);assert.equal(a.body,b.body);for(let n=0;n<9;n++)await auth.rate('other','target@example.invalid');const other=new AuthService(db,provider,vault,origin,()=>now);await other.rate('other','target@example.invalid');await assert.rejects(auth.rate('other','target@example.invalid'));});
    await t.test('cifrado autenticado y persistencia entre instancias; GET enlace no consume',async()=>{await reset();const s=await login();const other=new AuthService(new Postgres(pool!),provider,vault,origin,()=>now);await other.status(s.sid);const row=(await pool!.query('select datos from acceso.sesiones where huella=$1',[hash(s.sid)])).rows[0].datos;assert(!JSON.stringify(row).includes('fake-access'));assert.throws(()=>new Vault(randomBytes(32).toString('base64')).open(row.vault));await auth.issue('lectura@example.invalid','recovery');const r=await server.inject('/acceso');assert.equal(r.statusCode,200);assert.equal((await pool!.query("select datos->>'state' as state from acceso.intenciones")).rows[0].state,'pending');});
    await t.test('invitación administrativa no activa hasta MFA verificado',async()=>{await reset();await pool!.query("update inventario.cuentas set estado='pendiente',credencial_lista=false where id=$1",[admin]);await auth.issue('admin@example.invalid','invite');await auth.complete(await latest(),'new-password-synthetic');const s=await auth.login('admin@example.invalid','synthetic-password');assert.equal((await auth.status(s.sid)).estado,'pendiente');await assert.rejects(auth.activity(s.sid,s.csrf));const v=await auth.verify(s.sid,s.csrf,'factor','123456');assert.equal((await auth.status(v.sid)).estado,'activa');});
    await t.test('generación externa fallida conserva intención incierta durable',async()=>{await reset();provider.failLink=true;await auth.issue('lectura@example.invalid','recovery');assert.equal((await pool!.query("select datos->>'state' as state from acceso.intenciones")).rows[0].state,'uncertain');assert.equal((await pool!.query('select count(*) from acceso.entregas')).rows[0].count,'0');});
    await t.test('entrega reclamada una vez y fallo de transporte incierto sin reenvío',async()=>{await reset();now=Date.now();await auth.issue('lectura@example.invalid','recovery');let calls=0;const mail={send:async()=>{calls++;throw Error('synthetic transport timeout');}};await Promise.all([dispatchOne(pool!,vault,provider,mail),dispatchOne(pool!,vault,provider,mail)]);assert.equal(calls,1);assert.equal((await pool!.query('select estado from acceso.entregas')).rows[0].estado,'incierta');assert.equal(await dispatchOne(pool!,vault,provider,mail),false);});
    await t.test('tablas nuevas cerradas a PUBLIC y RLS activo',async()=>{const rows=(await pool!.query("select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='acceso' and c.relkind='r'")).rows;assert.equal(rows.length,4);assert(rows.every(r=>r.relrowsecurity));});
    await server.close();
  }finally{await pool?.end();docker('rm','-f','-v',name);}
});
