import {Pool} from 'pg';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fixture,admin,reader} from './reports.js';
import {PostgresLabModelBackend} from '../../apps/server/modernization/postgres-lab.js';
export async function labFixture(origin?:string,webRoot?:string,options:{managedOperator?:boolean}={}) {
 const f=await fixture(origin,webRoot,{modernization:new PostgresLabModelBackend()});
 let root=f.root,managed:Pool|undefined;
 const close=async()=>{await managed?.end();await f.close();};
 try {
  if(options.managedOperator){
   // Operador local separado: hereda propiedad de objetos, sin heredar SUPERUSER ni SET al superusuario.
   const password=randomBytes(24).toString('hex');
   await f.root.query("create role lab_operador login nosuperuser nocreatedb createrole bypassrls inherit password '"+password+"'");
   await f.root.query('grant postgres to lab_operador with inherit true,set false;grant inventario_contexto to lab_operador with inherit false,set true');
   managed=new Pool({...f.root.options,user:'lab_operador',password});root=managed;
  }
  // Estos ensayos preservan la configuración MFA anterior. La política nueva de correo
  // se aplica y verifica aparte en provider.test.ts con GoTrue, SMTP local y PG reales.
  await root.query(readFileSync('staging/supabase/migrations/20261104111238_modernizacion_laboratorio.sql','utf8'));
  await root.query(readFileSync('staging/supabase/seed.sql','utf8'));
  await root.query('insert into laboratorio_ti."USUARIOS"("USUA_FUNCIONARIO_ID") values(1),(2)');
  await root.query('insert into laboratorio_ti.usuario_auth values($1,1),($2,2)',[admin,reader]);
  const ref=async(table:string,id:number)=>(await root.query('select ref from laboratorio_ti.referencias where tabla=$1 and id=$2',[table,id])).rows[0].ref as string;
  return {...f,root,ref,close};
 }catch(error){await close();throw error;}
}
