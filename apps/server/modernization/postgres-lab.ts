import type { PoolClient } from 'pg';
import { AuthError } from '../auth/service.js';
import { modelBinding, modelCursor, readModelCursor } from './cursor.js';
import type { ModelBackend, ModelContext, ModelRequest } from './ports.js';

const reads=new Set(['C03-01','C03-02','C03-04','C03-08','C03-09','C03-11','C03-13','C03-14','C03-18']);
const writes=['C03-03','C03-05','C03-06','C03-07','C03-10','C03-12','C03-15','C03-16'];
const errors:Record<string,number>={FORBIDDEN:403,NOT_FOUND:404,INVALID_REQUEST:400,BUSINESS_RULE:422,
 VERSION_REQUIRED:428,VERSION_MISMATCH:412,IDEMPOTENCY_MISMATCH:409,NOTIFICATION_NOT_CONFIGURED:503,MODEL_OPERATION_NOT_READY:503};
type Row={id:string;data:unknown};
/** Repositorio PostgreSQL de laboratorio. Usa exclusivamente el cliente transaccional de Authorization.
 * No sustituye al repositorio SQL Server ni importa datos/simulaciones del navegador.
 */
export class PostgresLabModelBackend implements ModelBackend {
 readonly engine='postgres' as const;
 readonly operations:ReadonlySet<string>=new Set([...reads,...writes]);
 async executeAtomic(context:ModelContext,request:ModelRequest,transaction:unknown):Promise<unknown> {
  const db=transaction as PoolClient;
  if(!db||typeof db.query!=='function')throw new Error('MODEL_TRANSACTION_REQUIRED');
  if(!this.operations.has(request.operation))throw new AuthError(503,'MODEL_OPERATION_NOT_READY');
  try {
   if(!reads.has(request.operation))return (await db.query('select laboratorio_ti.aplicar($1,$2,$3,$4,$5) result',
    [request.operation,request.params.ref??null,context.idempotencyKey??null,context.expectedVersion??null,request.body])).rows[0].result;
   const consult=async(family:string|null,position:string,limit:number)=>(await db.query('select laboratorio_ti.consultar($1,$2,$3,$4,$5,$6) result',
    [request.operation,request.params.ref??null,family,request.query,position,limit])).rows[0].result;
   if(['C03-04','C03-13','C03-14'].includes(request.operation))return await consult(null,'0',1);
   const page=async(family:string|null,filters:Record<string,unknown>,cursor:unknown,limit:number)=>{
    const binding=modelBinding([request.operation,request.params.ref??'',family??''].join(':'),filters);
    const position=typeof cursor==='string'?readModelCursor(cursor,binding):'0';
    if(!/^(0|[1-9][0-9]{0,18})$/.test(position))throw new AuthError(400,'INVALID_CURSOR');
    const rows:Row[]=await consult(family,position,limit+1);
    const more=rows.length>limit;if(more)rows.pop();
    return {items:rows.map(row=>row.data),nextCursor:more?modelCursor(binding,rows.at(-1)!.id):null};
   };
   if(request.operation==='C03-08') {
    const names=['asignaciones','movimientos','anotaciones'] as const;
    const filters=Object.fromEntries(Object.entries(request.query).filter(([key])=>!key.endsWith('Cursor')));
    // Un cliente pg mantiene las consultas en la misma transacción; secuencia explícita y sin otros pools.
    const sections:{items:unknown[];nextCursor:string|null}[]=[];
    for(const name of names)sections.push(await page(name,filters,request.query[name+'Cursor'],50));
    return {asignaciones:sections[0].items,movimientos:sections[1].items,anotaciones:sections[2].items,
     vigente:await consult('vigente','0',1),next:Object.fromEntries(names.map((name,i)=>[name,sections[i].nextCursor])),timezone:'UTC'};
   }
   const family=request.operation==='C03-01'?request.params.catalogo:request.operation==='C03-18'?String(request.query.grupo??'delegaciones'):null;
   const result=await page(family,request.query,request.query.cursor,Number(request.query.limit??50));
   return {...result,generatedAt:new Date().toISOString(),timezone:'UTC'};
  }catch(error) {
   if(error instanceof AuthError)throw error;
   const e=error as {message?:string;code?:string};
   if(e.message&&errors[e.message])throw new AuthError(errors[e.message],e.message);
   if(e.code==='23505')throw new AuthError(409,'DUPLICATE_IDENTIFIER');
   if(['23503','23502','23514','22001','22003','22007','22008','22P02'].includes(e.code??''))throw new AuthError(422,'BUSINESS_RULE');
   // No serializar SQL, parámetros, nombres privados ni errores del proveedor.
   throw new AuthError(503,'MODEL_DATABASE_UNAVAILABLE');
  }
 }
}
