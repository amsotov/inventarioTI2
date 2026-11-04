import { ApiError } from './errors.js';
export type ModelRead=(path:string,options?:RequestInit,csrf?:string)=>Promise<{body:any;etag:string|null}>;
export type Ref=string;
export type Item={ref:Ref;nombre:string;marcaRef?:Ref|null};
export type Page<T>={items:T[];nextCursor:string|null;generatedAt:string;timezone:'UTC'};
export type Employee={ref:Ref;nombre:string;cargo:string;activo:boolean;version:string;organizacion:Organization;documentoTipo?:string;documento?:string;correo?:string|null};
export type Organization={delegacionRef:Ref;departamentoRef:Ref;areaRef:Ref|null};
export type Equipment={ref:Ref;codigoOperativo:string;tipoRef:Ref;modeloRef:Ref|null;condicionRef:Ref|null;situacionRef:Ref|null;custodioRef:Ref|null;version:string;tecnica?:Record<string,any>|null;
 origenRef?:Ref|null;numeroSerie?:string|null;motivoSinSerie?:string|null;inventarioServiu?:string|null;inventarioMinvu?:string|null;adquisicion?:string|null;observacion?:string|null};
export const catalogTitles:Record<string,string>={
 'tipos-equipo':'Tipos de equipo',marcas:'Marcas',modelos:'Modelos',origenes:'Orígenes',estados:'Condiciones',situaciones:'Situaciones',
 'sistemas-operativos':'Sistemas operativos','clases-impresora':'Clases de impresora','familias-componente':'Familias de componente',
 'rubros-insumo':'Rubros de insumo','modalidades-asignacion':'Modalidades de asignación','actividades-mantencion':'Actividades de mantención',
 regiones:'Regiones',delegaciones:'Delegaciones',departamentos:'Departamentos',areas:'Áreas',funcionarios:'Funcionarios'
};
export type Directory=Record<string,Item[]>;
export const equipmentEditFields=['origenRef','numeroSerie','motivoSinSerie','inventarioServiu','inventarioMinvu','adquisicion','observacion'] as const;
export const completeEquipment=(e:Equipment|undefined):e is Equipment=>!!e&&equipmentEditFields.every(key=>Object.hasOwn(e,key));
export const uuid=(value:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function lookup(directory:Directory,family:string,ref:string|null|undefined) {
 if(!ref)return 'No indicado';
 return directory[family]?.find(row=>row.ref===ref)?.nombre??'Referencia sin nombre disponible';
}
export const catalogPath=(family:string)=>['regiones','delegaciones','departamentos','areas'].includes(family)?'organizacion?grupo='+family:family==='funcionarios'?'funcionarios':'catalogos/'+family;
/** Un selector no omite páginas. Falla si el proveedor repite cursores o excede el límite defensivo. */
export async function loadDirectory(families:readonly string[],signal:AbortSignal|undefined,read:ModelRead):Promise<Directory> {
 const entries=await Promise.all([...new Set(families)].map(async family=>{
  if(!Object.hasOwn(catalogTitles,family))throw new ApiError(400,'INVALID_REQUEST');
  const items:Item[]=[],seen=new Set<string>(),refs=new Set<string>();let cursor:string|null=null;
  for(let page=0;page<50;page++) {
   const path=catalogPath(family),q=new URLSearchParams({limit:'100',...(cursor?{cursor}:{})});
   const result=await read(path+(path.includes('?')?'&':'?')+q,{signal});
   const data=result.body as Page<Item>;
   if(!data||!Array.isArray(data.items)||data.timezone!=='UTC'||!(data.nextCursor===null||typeof data.nextCursor==='string'))throw new ApiError(503,'MODEL_REFERENCE_NOT_READY');
   for(const row of data.items){if(!uuid(row.ref)||typeof row.nombre!=='string'||refs.has(row.ref))throw new ApiError(503,'MODEL_REFERENCE_NOT_READY');refs.add(row.ref);items.push({ref:row.ref,nombre:row.nombre,...(row.marcaRef?{marcaRef:row.marcaRef}:{})});}
   if(data.nextCursor===null)return [family,items] as const;
   if(seen.has(data.nextCursor))throw new ApiError(503,'MODEL_REFERENCE_NOT_READY');
   seen.add(data.nextCursor);cursor=data.nextCursor;
  }
  throw new ApiError(503,'MODEL_REFERENCE_NOT_READY');
 }));
 return Object.fromEntries(entries);
}
export function instant(value:string|null|undefined) {
 if(!value)return 'Hora no disponible';
 const match=/^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)(\.\d+)?(Z|[+-]\d\d:\d\d)$/.exec(value);
 if(!match)return 'Fecha no disponible';
 const date=new Date(match[1]+match[3]);if(Number.isNaN(date.valueOf()))return 'Fecha no disponible';
 const seconds=date.toISOString().slice(0,19).replace('T',' ');
 return seconds+(match[2]??'')+' UTC';
}
export function historicalStart(row:{inicio:string|null;fechaOrigen:string|null;precisionTemporal:string}) {
 if(row.precisionTemporal==='instante')return instant(row.inicio);
 if(row.precisionTemporal==='dia'&&row.fechaOrigen)return row.fechaOrigen+' · solo día, sin hora conocida';
 return 'Fecha de inicio desconocida';
}
export type Operation='equipo-alta'|'equipo-edicion'|'tecnica'|'movimiento'|'mantencion'|'funcionario-alta'|'funcionario-edicion'|'pertenencia';
const optional=(data:FormData,key:string)=>String(data.get(key)??'')||null;
const value=(data:FormData,key:string)=>String(data.get(key)??'');
const reference=(data:FormData,key:string,required=false)=>{const v=optional(data,key);if(required&&!v||v&&!uuid(v))throw Error('Selecciona una referencia válida para '+key+'.');return v;};
function decimal(data:FormData,key:string,scale:number,max:number) {
 const raw=value(data,key);if(!raw)return null;
 if(!new RegExp('^[0-9]+(?:\\.[0-9]{1,'+scale+'})?$').test(raw)||Number(raw)<=0||Number(raw)>max)throw Error('Revisa el valor de '+key+'.');
 return Number(raw);
}
export function prepareCommand(operation:Operation,data:FormData,record?:Equipment|Employee,parts:Record<string,unknown>[]=[]):{path:string;method:string;body:Record<string,unknown>} {
 const motivo=value(data,'motivo').trim();if(!motivo||data.get('confirmacion')!=='on')throw Error('Indica el motivo y confirma la operación.');
 const body:Record<string,unknown>={motivo,confirmado:true};
 const ref=record?.ref;if(operation!=='equipo-alta'&&operation!=='funcionario-alta'&&(!ref||!uuid(ref)))throw Error('Recarga la ficha antes de continuar.');
 let path='',method='POST';
 if(operation==='equipo-alta'||operation==='equipo-edicion') {
  if(operation==='equipo-edicion'&&!completeEquipment(record as Equipment))throw Error('No está disponible la ficha completa para editar atributos.');
  const codigo=value(data,'codigoOperativo').trim();if(!codigo)throw Error('Indica el código operativo.');
  Object.assign(body,{codigoOperativo:codigo,tipoRef:reference(data,'tipoRef',true),modeloRef:reference(data,'modeloRef'),origenRef:reference(data,'origenRef')});
  for(const key of equipmentEditFields.filter(k=>k!=='origenRef'))body[key]=optional(data,key);
  if(!body.numeroSerie&&!(typeof body.motivoSinSerie==='string'&&body.motivoSinSerie.trim()))throw Error('Indica el motivo de la ausencia de serie.');
  if(operation==='equipo-alta')body.condicionRef=reference(data,'condicionRef',true);
  path='equipos'+(ref?'/'+ref:'');if(operation==='equipo-edicion')method='PATCH';
 } else if(operation==='funcionario-alta'||operation==='funcionario-edicion') {
  for(const key of ['documentoTipo','documento','nombre','cargo'])body[key]=value(data,key);
  body.correo=optional(data,'correo');
  if(operation==='funcionario-alta')body.organizacion={delegacionRef:reference(data,'delegacionRef',true),departamentoRef:reference(data,'departamentoRef',true),areaRef:reference(data,'areaRef')};
  path='funcionarios'+(ref?'/'+ref:'');if(operation==='funcionario-edicion')method='PATCH';
 } else if(operation==='pertenencia') {
  body.organizacion={delegacionRef:reference(data,'delegacionRef',true),departamentoRef:reference(data,'departamentoRef',true),areaRef:reference(data,'areaRef')};path='funcionarios/'+ref+'/pertenencias';
 } else if(operation==='movimiento') {
  const type=value(data,'tipo');if(!['asignacion','devolucion','traslado','condicion','baja','reactivacion'].includes(type))throw Error('Selecciona un movimiento válido.');
  body.tipo=type;
  if(['asignacion','traslado'].includes(type))body.destinoRef=reference(data,'destinoRef',true);
  if(['devolucion','traslado'].includes(type)) {body.origenEsperadoRef=(record as Equipment).custodioRef;if(!body.origenEsperadoRef)throw Error('El equipo no tiene un custodio de origen.');}
  if(type==='traslado'&&String(body.destinoRef).toLowerCase()===String(body.origenEsperadoRef).toLowerCase())throw Error('Selecciona un custodio diferente al actual.');
  if(type==='condicion')body.condicionRef=reference(data,'condicionRef',true);
  if(value(data,'corrigeRef'))body.corrigeRef=value(data,'corrigeRef');
  path='equipos/'+ref+'/movimientos';
 } else if(operation==='mantencion') {
  Object.assign(body,{actividadRef:reference(data,'actividadRef',true),fecha:value(data,'fecha'),observacion:optional(data,'observacion')});path='equipos/'+ref+'/mantenciones';
 } else if(operation==='tecnica') {
  const subtype=value(data,'subtipo');body.subtipo=subtype;const previous=(record as Equipment).tecnica;
  if(previous&&previous.subtipo!==subtype)throw Error('El subtipo existente no puede cambiarse desde esta operación.');
  if(subtype==='computador') {
   Object.assign(body,{nombreRed:value(data,'nombreRed'),esNotebook:data.get('esNotebook')==='on',sistemaOperativoRef:reference(data,'sistemaOperativoRef'),procesador:optional(data,'procesador'),velocidadGhz:decimal(data,'velocidadGhz',2,99.99),direccionMac:optional(data,'direccionMac'),guid:optional(data,'guid')});
   if(parts.length)body.piezasAgregar=parts.map(row=>({familiaRef:row.familiaRef,capacidadGb:row.capacidadGb}));
  } else if(subtype==='monitor')body.pulgadas=decimal(data,'pulgadas',1,999.9);
  else if(subtype==='impresora') {
   Object.assign(body,{claseRef:reference(data,'claseRef'),duplex:value(data,'duplex')===''?null:value(data,'duplex')==='si',anchoCarro:decimal(data,'anchoCarro',1,999.9)});
   if(parts.length)body.insumosAgregar=parts.map(row=>({rubroRef:row.rubroRef,codigo:row.codigo}));
  }else if(subtype==='switch') {
   const n=value(data,'cantidadPuertos');if(!/^[0-9]+$/.test(n)||Number(n)<1||Number(n)>32767)throw Error('Indica una cantidad válida de puertos.');body.cantidadPuertos=Number(n);
  }else throw Error('Selecciona un subtipo técnico.');
  path='equipos/'+ref+'/tecnica';method='PATCH';
 }
 return {path,method,body};
}
