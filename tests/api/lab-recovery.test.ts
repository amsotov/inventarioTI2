import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {Pool} from 'pg';
import {labFixture} from '../helpers/lab.js';
import {hash} from '../../apps/server/auth/crypto.js';

test('respaldo del laboratorio: restaura 59 tablas y ACL en otra base del mismo clúster sintético; revoca sesiones',async()=>{
 const f=await labFixture();let restored:Pool|undefined,runtime:Pool|undefined;
 try {
  const saved=await f.server.inject({method:'POST',url:'/api/v2/equipos',headers:f.headers(f.a),payload:{codigoOperativo:'RESPALDO-MODERNO',tipoRef:await f.ref('TIPOS_EQUIPO',1),modeloRef:null,condicionRef:await f.ref('ESTADOS_EQUIPO',1),numeroSerie:null,motivoSinSerie:'Sintético',motivo:'Respaldo SQL',confirmado:true}});assert.equal(saved.statusCode,201,saved.body);
  const tables=(await f.root.query("select schemaname,tablename from pg_tables where schemaname in ('inventario','seguridad','acceso','laboratorio_ti') order by schemaname,tablename")).rows;
  assert.equal(tables.length,59);
  const digest=async(db:Pool,table:{schemaname:string;tablename:string})=>{
   const quote=(name:string)=>'"'+name.replaceAll('"','""')+'"';
   return (await db.query(`select md5(coalesce(string_agg(row_to_json(t)::text,E'\n' order by row_to_json(t)::text),'')) digest from ${quote(table.schemaname)}.${quote(table.tablename)} t`)).rows[0].digest;
  };
  const before=[];for(const table of tables)before.push(await digest(f.root,table));
  const functions="select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) args,pg_get_userbyid(p.proowner) owner,p.prosecdef,p.proconfig,p.proacl::text acl from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='laboratorio_ti' order by 1,2,3";
  const policies="select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='laboratorio_ti' order by 1,2,3";
  const dump=execFileSync('docker',['exec',f.containerName,'pg_dump','-U','postgres','-d','postgres','-Fc'],{maxBuffer:16*1024*1024});
  await f.root.query("create database inventario_rescate");
  execFileSync('docker',['exec','-i',f.containerName,'pg_restore','-U','postgres','-d','inventario_rescate','--exit-on-error','--single-transaction'],{input:dump,stdio:['pipe','pipe','pipe']});
  restored=new Pool({...f.root.options,password:f.root.options.password,database:'inventario_rescate'});runtime=new Pool({...f.business.options,password:f.business.options.password,database:'inventario_rescate'});
  for(let i=0;i<tables.length;i++)assert.equal(await digest(restored,tables[i]),before[i],tables[i].tablename);
  assert.deepEqual((await restored.query(functions)).rows,(await f.root.query(functions)).rows);
  assert.deepEqual((await restored.query(policies)).rows,(await f.root.query(policies)).rows);
  // Cercar sesiones restauradas antes de cualquier acceso: no reusar cookies del snapshot.
  await restored.query("update acceso.sesiones set datos=jsonb_set(datos,'{revoked}','true'::jsonb)");
  const client=await runtime.connect();
  try {
   await client.query('begin');await client.query("select set_config('inventario.sesion',$1,true)",[hash(f.a.sid)]);
   await assert.rejects(client.query('select laboratorio_ti.consultar($1,null,null,$2,0,10)',['C03-02',{}]),/FORBIDDEN/);
   await client.query('rollback');
  }finally{client.release();}
  assert.equal((await restored.query("select count(*)::int n from inventario.outbox where proposito='modelo_v2' and estado='pendiente'")).rows[0].n,1);
 }finally{await Promise.all([restored?.end(),runtime?.end()]);await f.close();}
});
