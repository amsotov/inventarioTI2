import type { PoolClient } from 'pg';
import { createHash } from 'node:crypto';
import { AuthError } from '../auth/service.js';
import type { Authorization } from '../security/postgres.js';
export const resources = {
 bienes:{columns:'id,codigo,serie,motivo_sin_serie,tipo,marca,modelo,condicion,situacion,adquisicion,observaciones,version',date:'adquisicion',search:'codigo',filters:['condicion','tipo','situacion']},
 funcionarios:{columns:'id,nombre,cargo,unidad_id,activo,version',date:'alta_en',search:'nombre',filters:['unidad_id']},
 unidades:{columns:'id,nombre,activa,version',date:null,search:'nombre',filters:[]},
 movimientos:{columns:'id,bien_id,tipo,origen_id,destino_id,unidad_origen_id,unidad_destino_id,unidad_origen_nombre,unidad_destino_nombre,condicion_anterior,condicion_nueva,corrige_id,efectiva_en,registrada_en',date:'efectiva_en',search:null,filters:['tipo','bien_id']}
} as const;
export type Resource=keyof typeof resources;
export type Filters={limit?:number;cursor?:string;q?:string;desde?:string;hasta?:string;condicion?:string;tipo?:string;situacion?:string;unidad_id?:string;bien_id?:string};
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
export function selection(resource:Resource,f:Filters) {
 const {columns,date,search,filters}=resources[resource];
 if((f.desde||f.hasta)&&!date || (f.desde&&f.hasta&&f.desde>f.hasta))throw new AuthError(400,'INVALID_REQUEST');
 const normalized=Object.fromEntries(Object.entries(f).filter(([k])=>k!=='cursor'&&k!=='limit').sort(([a],[b])=>a.localeCompare(b)));
 const binding=digest(JSON.stringify([resource,normalized]));
 const values:unknown[]=[];const terms:string[]=[];
 const add=(sql:string,v:unknown)=>{values.push(v);terms.push(sql.replace('?',`$${values.length}`));};
 if(f.q){if(!search)throw new AuthError(400,'INVALID_REQUEST');add(`strpos(lower(${search}),lower(?))>0`,f.q);}
 for(const key of ['condicion','tipo','situacion','unidad_id','bien_id'] as const)if(f[key]!==undefined){if(!(filters as readonly string[]).includes(key))throw new AuthError(400,'INVALID_REQUEST');add(`${key}=?`,f[key]);}
 if(date&&f.desde)add(`${date}>=?::date`,f.desde);
 if(date&&f.hasta)add(`${date}<?::date + interval '1 day'`,f.hasta);
 if(f.cursor){try{const c=JSON.parse(Buffer.from(f.cursor,'base64url').toString());if(c.binding!==binding||typeof c.id!=='string'|| !(resource==='movimientos'?/^[0-9]{1,19}$/:/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).test(c.id) || (resource==='movimientos' && BigInt(c.id)>9223372036854775807n))throw Error();add('id>?',c.id);}catch{throw new AuthError(400,'INVALID_CURSOR');}}
 values.push((f.limit??50)+1);
 return {sql:`select ${columns} from inventario.${resource}${terms.length?' where '+terms.join(' and '):''} order by id limit $${values.length}`,values,binding,date};
}
const errors:Record<string,number>={NOT_FOUND:404,VERSION_REQUIRED:428,VERSION_MISMATCH:412,IDEMPOTENCY_MISMATCH:409,FORBIDDEN:403,INVALID_REQUEST:400,BUSINESS_RULE:422,NOTIFICATION_NOT_CONFIGURED:503};
export class Inventory {
 constructor(private security:Authorization){}
 list(sid:string,resource:Resource,f:Filters){
  const plan=selection(resource,f);
  return this.security.run(sid,resource==='movimientos'?'historial.consultar':'inventario.consultar',async db=>{
   const rows=(await db.query(plan.sql,plan.values)).rows,more=rows.length>(f.limit??50);if(more)rows.pop();
   return {items:rows,nextCursor:more?Buffer.from(JSON.stringify({binding:plan.binding,id:String(rows.at(-1).id)})).toString('base64url'):null,generatedAt:new Date().toISOString(),timezone:'UTC',dateField:plan.date};
  });
 }
 detail(sid:string,resource:Resource,id:string){return this.security.run(sid,resource==='movimientos'?'historial.consultar':'inventario.consultar',async db=>{
  const row=(await db.query(`select ${resources[resource].columns} from inventario.${resource} where id=$1`,[id])).rows[0];if(!row)throw new AuthError(404,'NOT_FOUND');return row;
 });}
 async save(sid:string,csrf:string,id:string|null,key:string,version:string|undefined,body:Record<string,unknown>){
  let expected:string|null=null;
  if(version!==undefined){if(!/^"v[1-9][0-9]{0,14}"$/.test(version))throw new AuthError(400,'INVALID_REQUEST');expected=version.slice(2,-1);}
  try{return await this.security.run(sid,'inventario.modificar',async(db:PoolClient)=>(await db.query('select inventario.guardar_bien($1,$2,$3,$4) result',[id,key,expected,body])).rows[0].result,csrf);}
  catch(e){const err=e as {message:string;code?:string};if(errors[err.message])throw new AuthError(errors[err.message],err.message);
   if(err.code==='23505')throw new AuthError(409,'DUPLICATE_IDENTIFIER');
   if(['23514','22007','22008','23502'].includes(err.code??''))throw new AuthError(422,'BUSINESS_RULE');throw e;}
 }
}
