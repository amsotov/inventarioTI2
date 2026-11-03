import type { PoolClient } from 'pg';
import { createHash } from 'node:crypto';
import { AuthError } from '../auth/service.js';
import type { Authorization } from '../security/postgres.js';
import { InventoryFailure, type InventoryGateway, type InventoryRepository, type InventoryCommand, type InventoryPage, type Filters, type Resource } from './ports.js';
export const resources = {
 bienes:{columns:'id,codigo,serie,motivo_sin_serie,tipo,marca,modelo,condicion,situacion,adquisicion,observaciones,version',date:'adquisicion',search:'codigo',filters:['condicion','tipo','situacion']},
 funcionarios:{columns:'id,nombre,cargo,unidad_id,activo,version',date:'alta_en',search:'nombre',filters:['unidad_id']},
 unidades:{columns:'id,nombre,activa,version',date:null,search:'nombre',filters:[]},
 movimientos:{columns:'id,bien_id,tipo,origen_id,destino_id,unidad_origen_id,unidad_destino_id,unidad_origen_nombre,unidad_destino_nombre,condicion_anterior,condicion_nueva,corrige_id,efectiva_en,registrada_en',date:'efectiva_en',search:null,filters:['tipo','bien_id']}
} as const;
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

const errors: Record<string, number> = {NOT_FOUND:404,VERSION_REQUIRED:428,VERSION_MISMATCH:412,IDEMPOTENCY_MISMATCH:409,FORBIDDEN:403,INVALID_REQUEST:400,BUSINESS_RULE:422,NOTIFICATION_NOT_CONFIGURED:503};
export class PostgresInventoryRepository implements InventoryRepository {
 constructor(private db: PoolClient) {}
 async list(resource: Resource, filters: Filters): Promise<InventoryPage> {
  const plan=selection(resource,filters);
  const rows=(await this.db.query(plan.sql,plan.values)).rows;
  const more=rows.length>(filters.limit??50); if(more)rows.pop();
  return {items:rows,nextCursor:more?Buffer.from(JSON.stringify({binding:plan.binding,id:String(rows.at(-1).id)})).toString('base64url'):null,generatedAt:new Date().toISOString(),timezone:'UTC',dateField:plan.date};
 }
 async detail(resource: Resource, ref: string) {
  const row=(await this.db.query(`select ${resources[resource].columns} from inventario.${resource} where id=$1`,[ref])).rows[0];
  if(!row)throw new InventoryFailure('NOT_FOUND',404);return row;
 }
 async save(ref: string|null,key: string,expected: string|null,body: Record<string,unknown>): Promise<InventoryCommand> {
  try {return (await this.db.query('select inventario.guardar_bien($1,$2,$3,$4) result',[ref,key,expected,body])).rows[0].result;}
  catch(error) {
   const e=error as {message:string;code?:string};
   if(errors[e.message])throw new InventoryFailure(e.message,errors[e.message]);
   if(e.code==='23505')throw new InventoryFailure('DUPLICATE_IDENTIFIER',409);
   if(['23514','22007','22008','23502'].includes(e.code??''))throw new InventoryFailure('BUSINESS_RULE',422);
   throw error;
  }
 }
}
export function postgresInventory(security: Authorization): InventoryGateway {
 return {validateList: (resource,filters)=>{selection(resource,filters);},
  run: (sid,permission,work,csrf)=>security.run(sid,permission,db=>work(new PostgresInventoryRepository(db)),csrf)};
}
