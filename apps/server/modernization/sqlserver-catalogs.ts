import { AuthError } from '../auth/service.js';
import { requirePermission } from '../security/policy.js';
import { modelBinding, modelCursor, readModelCursor } from './cursor.js';
import type { ModelBackend, ModelContext, ModelRequest } from './ports.js';

type Catalog = {table:string;id:string;name:string;brand?:string};
const catalogs=new Map<string,Catalog>([
 ['tipos-equipo',{table:'TIPOS_EQUIPO',id:'TIPO_ID',name:'TIPO_NOMBRE'}],
 ['marcas',{table:'MARCAS',id:'MARC_ID',name:'MARC_NOMBRE'}],
 ['modelos',{table:'MODELOS',id:'MODE_ID',name:'MODE_NOMBRE',brand:'MODE_MARCA_ID'}],
 ['origenes',{table:'ORIGENES_EQUIPO',id:'ORIG_ID',name:'ORIG_NOMBRE'}],
 ['estados',{table:'ESTADOS_EQUIPO',id:'ESTA_ID',name:'ESTA_NOMBRE'}],
 ['situaciones',{table:'SITUACIONES',id:'SITU_ID',name:'SITU_NOMBRE'}],
 ['sistemas-operativos',{table:'SISTEMAS_OPERATIVOS',id:'SIST_ID',name:'SIST_NOMBRE'}],
 ['clases-impresora',{table:'CLASES_IMPRESORA',id:'CLAS_ID',name:'CLAS_NOMBRE'}],
 ['familias-componente',{table:'FAMILIAS_COMPONENTE',id:'FAMI_ID',name:'FAMI_NOMBRE'}],
 ['rubros-insumo',{table:'RUBROS_INSUMO',id:'RUBR_ID',name:'RUBR_NOMBRE'}],
 ['modalidades-asignacion',{table:'MODALIDADES_ASIGNACION',id:'MODA_ID',name:'MODA_NOMBRE'}],
 ['actividades-mantencion',{table:'ACTIVIDADES_MANTENCION',id:'ACTI_ID',name:'ACTI_NOMBRE'}]
]);
const organization=new Map<string,Catalog>([
 ['regiones',{table:'REGIONES',id:'REGI_ID',name:'REGI_NOMBRE'}],
 ['delegaciones',{table:'DELEGACIONES',id:'DELE_ID',name:'DELE_NOMBRE'}],
 ['departamentos',{table:'DEPARTAMENTOS',id:'DEPA_ID',name:'DEPA_NOMBRE'}],
 ['areas',{table:'AREAS',id:'AREA_ID',name:'AREA_NOMBRE'}]
]);
export type SqlReadParameter = {name:string;type:'int'|'nvarchar';value:number|string;length?:number};
export interface SqlReadExecutor {rows<T>(statement:string,parameters:readonly SqlReadParameter[]):Promise<T[]>}
export interface PublicReferenceStore {
  publicRef(entity:string,coreId:number):Promise<string|undefined>;
  coreId(entity:string,publicRef:string):Promise<number|undefined>;
}
/** Objeto de composición confiable, recibido dentro de la transacción autorizada. */
export class SqlCatalogTransaction {
 constructor(readonly sql:SqlReadExecutor,readonly refs:PublicReferenceStore){}
}
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const validId=(v:unknown):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>0&&v<=2147483647;
const unavailable=()=>new AuthError(503,'MODEL_REFERENCE_NOT_READY');

/** Dos lecturas concretas del modelo dbo, con parámetros. Sin controlador TDS, asignación de UUID o DML implícitos. */
export class SqlServerCatalogBackend implements ModelBackend {
 readonly engine='sqlserver2016' as const;
 readonly operations=new Set(['C03-01','C03-18']);
 constructor(private now:()=>Date=()=>new Date()){}
 async executeAtomic(context:ModelContext,request:ModelRequest,transaction:unknown) {
  requirePermission(context.role,'inventario.consultar');
  if(context.permission!=='inventario.consultar'||!uuid(context.actorId))throw new AuthError(403,'FORBIDDEN');
  if(!(transaction instanceof SqlCatalogTransaction))throw new AuthError(503,'MODEL_TRANSACTION_NOT_READY');
  let catalog:Catalog|undefined;
  if(request.operation==='C03-01')catalog=catalogs.get(request.params.catalogo);
  else if(request.operation==='C03-18')catalog=organization.get(String(request.query.grupo??'regiones'));
  else throw new AuthError(503,'MODEL_OPERATION_NOT_READY');
  if(!catalog)throw new AuthError(400,'INVALID_REQUEST');
  const {sql,refs}=transaction,query=request.query;
  const limit=query.limit??50;
  if(typeof limit!=='number'||!Number.isInteger(limit)||limit<1||limit>100||
     (query.q!==undefined&&(typeof query.q!=='string'||query.q.length>200))||
     (query.marcaRef!==undefined&&(!catalog.brand||!uuid(query.marcaRef))))throw new AuthError(400,'INVALID_REQUEST');
  const binding=modelBinding(request.operation+':'+catalog.table,query);
  let after=0;
  if(query.cursor!==undefined) {
   if(typeof query.cursor!=='string')throw new AuthError(400,'INVALID_CURSOR');
   const ref=readModelCursor(query.cursor,binding);
   if(!uuid(ref))throw new AuthError(400,'INVALID_CURSOR');
   const resolved=await refs.coreId(catalog.table,ref);
   if(!validId(resolved))throw new AuthError(400,'INVALID_CURSOR');after=resolved;
  }
  const parameters:SqlReadParameter[]=[{name:'take',type:'int',value:limit+1},{name:'after',type:'int',value:after}];
  const where=[`[${catalog.id}] > @after`];
  if(query.q!==undefined){where.push(`CHARINDEX(LOWER(@search),LOWER([${catalog.name}])) > 0`);parameters.push({name:'search',type:'nvarchar',length:200,value:query.q as string});}
  if(query.marcaRef!==undefined) {
   const brand=await refs.coreId('MARCAS',query.marcaRef as string);
   if(!validId(brand))throw new AuthError(404,'NOT_FOUND');
   where.push(`[${catalog.brand}] = @brand`);parameters.push({name:'brand',type:'int',value:brand});
  }
  const statement=`SELECT TOP (@take) [${catalog.id}] AS core_id, [${catalog.name}] AS nombre${catalog.brand?`, [${catalog.brand}] AS brand_id`:''} FROM [dbo].[${catalog.table}] WHERE ${where.join(' AND ')} ORDER BY [${catalog.id}];`;
  const rows=await sql.rows<{core_id:number;nombre:string;brand_id?:number}>(statement,parameters);
  if(rows.length>limit+1)throw new AuthError(503,'INVALID_MODEL_RESPONSE');
  const more=rows.length>limit,visible=rows.slice(0,limit),items=[];
  let prior=after;
  for(const row of visible) {
   if(!validId(row.core_id)||row.core_id<=prior||typeof row.nombre!=='string')throw new AuthError(503,'INVALID_MODEL_RESPONSE');
   prior=row.core_id;
   const ref=await refs.publicRef(catalog.table,row.core_id);if(!uuid(ref))throw unavailable();
   const item:{ref:string;nombre:string;marcaRef?:string}={ref,nombre:row.nombre};
   if(catalog.brand) {
    if(!validId(row.brand_id))throw unavailable();
    const brand=await refs.publicRef('MARCAS',row.brand_id);if(!uuid(brand))throw unavailable();item.marcaRef=brand;
   }
   items.push(item);
  }
  return {items,nextCursor:more?modelCursor(binding,items.at(-1)!.ref):null,generatedAt:this.now().toISOString(),timezone:'UTC'};
 }
}
