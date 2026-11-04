import type { FastifyInstance } from 'fastify';
import { Ajv } from 'ajv';
import addFormatsModule from 'ajv-formats';
import { AuthError } from '../auth/service.js';
import { requirePermission, type Permission } from '../security/policy.js';
import { contract } from './contract.js';
import { modelReadSchemas } from './read-contract.js';
import type { ModelBackend, ModelAccess, ModelContext, ModelRequest } from './ports.js';

type Schema = Record<string, any>;
const addFormats=addFormatsModule as unknown as (ajv: Ajv)=>void;
const root='urn:inventario:modelo-v2';
function refs(value: unknown): any {
  if(Array.isArray(value))return value.map(refs);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='$ref'&&typeof v==='string'?v.replace('#/schemas/',root+'#/definitions/'):refs(v)]));
  return value;
}
const problem = () => new AuthError(400,'INVALID_REQUEST');
function version(value: unknown): string {
  if(typeof value!=='string'||!/^"v[1-9][0-9]{0,18}"$/.test(value))throw problem();
  const result=value.slice(2,-1);if(BigInt(result)>9223372036854775807n)throw problem();return result;
}
function semantic(operation: string, body: Record<string,unknown> | undefined, query: Record<string,unknown>) {
  if(typeof query.desde==='string'&&typeof query.hasta==='string'&&query.desde>query.hasta)throw problem();
  if(!body)return;
  if(typeof body.motivo!=='string'||!body.motivo.trim())throw problem();
  if(['C03-03','C03-05'].includes(operation)) {
    if(typeof body.codigoOperativo!=='string'||!body.codigoOperativo.trim())throw problem();
    if((body.numeroSerie===null||body.numeroSerie===undefined) && (typeof body.motivoSinSerie!=='string'||!body.motivoSinSerie.trim()))throw new AuthError(422,'BUSINESS_RULE');
  }
  if(operation==='C03-17'&&Array.isArray(body.perfilRefs)&&new Set(body.perfilRefs.map(ref=>String(ref).toLowerCase())).size!==body.perfilRefs.length)throw new AuthError(422,'BUSINESS_RULE');
  if(operation==='C03-07') {
    const type=body.tipo;
    const destination=['asignacion','traslado'].includes(String(type));
    const origin=['devolucion','traslado'].includes(String(type));
    if(destination!==('destinoRef' in body)||origin!==('origenEsperadoRef' in body)||
       (type==='condicion')!==('condicionRef' in body)||
       (type==='traslado'&&String(body.destinoRef).toLowerCase()===String(body.origenEsperadoRef).toLowerCase()))throw new AuthError(422,'BUSINESS_RULE');
  }
}

/** Registro explícito por inyección. main no activa v2 ni instala un adaptador ficticio. */
export function modernizationRoutes(server: FastifyInstance, access: ModelAccess, backend: ModelBackend,
  sid: (request:any)=>string, csrf:(request:any)=>string) {
  if(access.engine!==backend.engine)throw new Error('MIXED_MODEL_TRANSACTION_NOT_ALLOWED');
  const ajv=new Ajv({strict:false,allErrors:true,coerceTypes:false,removeAdditional:false,useDefaults:false});
  addFormats(ajv);
  const definitions=refs(modelReadSchemas(contract.schemas));
  const schema={$id:root,definitions};ajv.addSchema(schema);server.addSchema(schema);
  const known=new Set(contract.operaciones.map(x=>x.id));
  for(const id of backend.operations)if(!known.has(id as any))throw new Error('Unknown model operation capability');
  for(const original of contract.operaciones) {
    const operation=original as unknown as {id:string;method:'GET'|'POST'|'PATCH'|'PUT';path:string;
      permission:Permission;requestSchema:string|null;responseSchema:string;headers_obligatorios:string[];
      pathParameters?:Schema;querySchema?:Schema;responseHeaders?:Record<string,string>;response_success:number};
    const output=ajv.compile({$ref:root+'#/definitions/'+operation.responseSchema});
    const write=operation.method!=='GET';
    const headers:Schema={type:'object',properties:{'idempotency-key':{type:'string',format:'uuid'},'if-match':{type:'string',maxLength:24}}};
    if(write)headers.required=['idempotency-key','x-csrf-token'];
    server.route({method:operation.method,url:operation.path,
      schema:{headers,params:{type:'object',additionalProperties:false,properties:refs(operation.pathParameters??{}),required:Object.keys(operation.pathParameters??{})},
        querystring:refs(operation.querySchema??{type:'object',additionalProperties:false,properties:{}}),
        ...(operation.requestSchema?{body:{$ref:root+'#/definitions/'+operation.requestSchema}}:{})},
      preValidation:async(request)=>{
        const query=request.query as Record<string,unknown>;
        if(query&&typeof query.limit==='string'&&/^[0-9]{1,3}$/.test(query.limit))query.limit=Number(query.limit);
      },
      handler:async(request,response)=>{
        const params=request.params as Record<string,string>, query=request.query as Record<string,unknown>;
        const body=request.body as Record<string,unknown>|undefined;
        const result=await access.run(sid(request),operation.permission,async(actor,transaction)=>{
          requirePermission(actor.role,operation.permission);
          const context:ModelContext={...actor,permission:operation.permission};
          if(write) {
            context.idempotencyKey=String(request.headers['idempotency-key']).toLowerCase();
            if(operation.headers_obligatorios.includes('If-Match')&&request.headers['if-match']===undefined)throw new AuthError(428,'VERSION_REQUIRED');
            if(request.headers['if-match']!==undefined)context.expectedVersion=version(request.headers['if-match']);
          }
          semantic(operation.id,body,query);
          if(!backend.operations.has(operation.id))throw new AuthError(503,'MODEL_OPERATION_NOT_READY');
          const data:ModelRequest={operation:operation.id,params,query,body};
          const result=await backend.executeAtomic(Object.freeze(context),data,transaction);
          // No se limpian silenciosamente secretos/columnas inesperados: falla antes de serializar.
          if(!output(result))throw new AuthError(503,'INVALID_MODEL_RESPONSE');
          if(operation.responseHeaders?.ETag) {
            const item=result as {version?:unknown};
            if(typeof item.version!=='string')throw new AuthError(503,'INVALID_MODEL_RESPONSE');
            try{version('"v'+item.version+'"');}catch{throw new AuthError(503,'INVALID_MODEL_RESPONSE');}

          }
          return result;
        },write?csrf(request):undefined);
        // La respuesta solo se envía después del commit de autorización/repositorio.
        if(operation.responseHeaders?.ETag)response.header('etag','"v'+(result as {version:string}).version+'"');
        return response.code(operation.response_success).send(result);
      }
    });
  }
}
