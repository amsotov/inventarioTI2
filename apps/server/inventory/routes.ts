import type { FastifyInstance } from 'fastify';
import { Inventory,resources,type Resource,type Filters } from './service.js';
const uuid={type:'string',pattern:'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'};
const text={type:'string',minLength:1,maxLength:2000,pattern:'\\S'};
const day={type:'string',format:'date'};
export function inventoryRoutes(server:FastifyInstance,inventory:Inventory,sid:(req:any)=>string,csrf:(req:any)=>string){
 const query={type:'object',additionalProperties:false,properties:{limit:{type:'integer',minimum:1,maximum:100},cursor:{type:'string',maxLength:1024},q:{type:'string',minLength:1,maxLength:200},desde:day,hasta:day,condicion:{enum:['bueno','regular','malo']},tipo:{type:'string',maxLength:100},situacion:{enum:['activo','baja']},unidad_id:uuid,bien_id:uuid}};
 // Solo coacción en querystring; el cuerpo mantiene tipos estrictos del servidor.
 for(const resource of Object.keys(resources) as Resource[]){
  server.get<{Querystring:Filters}>(`/api/v1/${resource}`,{schema:{querystring:query}},req=>inventory.list(sid(req),resource,req.query));
  server.get<{Params:{ref:string}}>(`/api/v1/${resource}/:ref`,{schema:{params:{type:'object',required:['ref'],properties:{ref:resource==='movimientos'?{type:'string',pattern:'^[0-9]{1,19}$'}:uuid}}}},async(req,res)=>{
   const row=await inventory.detail(sid(req),resource,req.params.ref);if(row.version)res.header('etag',`"v${row.version}"`);return row;
  });
 }
 const props={codigo:text,serie:{anyOf:[text,{type:'null'}]},motivo_sin_serie:{anyOf:[text,{type:'null'}]},tipo:text,marca:text,modelo:text,adquisicion:{anyOf:[day,{type:'null'}]},observaciones:{anyOf:[{type:'string',maxLength:2000},{type:'null'}]},motivo:text};
 const headers={type:'object',required:['idempotency-key'],properties:{'idempotency-key':uuid,'if-match':{type:'string',maxLength:20}}};
 server.post<{Body:Record<string,unknown>}>('/api/v1/bienes',{schema:{headers,body:{type:'object',additionalProperties:false,required:['codigo','tipo','marca','modelo','condicion','motivo'],properties:{...props,condicion:{enum:['bueno','regular','malo']}}}}},async(req,res)=>{
  const result=await inventory.save(sid(req),csrf(req),null,String(req.headers['idempotency-key']),undefined,req.body);res.code(201).header('etag',`"v${result.version}"`);return result;
 });
 server.patch<{Params:{ref:string};Body:Record<string,unknown>}>('/api/v1/bienes/:ref',{schema:{headers,params:{type:'object',required:['ref'],properties:{ref:uuid}},body:{type:'object',additionalProperties:false,required:['codigo','tipo','marca','modelo','motivo'],properties:props}}},async(req,res)=>{
  const result=await inventory.save(sid(req),csrf(req),req.params.ref,String(req.headers['idempotency-key']),req.headers['if-match'],req.body);res.header('etag',`"v${result.version}"`);return result;
 });
}
