import {createHash} from 'node:crypto';
import {AuthError} from '../../apps/server/auth/service.js';
import {contract} from '../../apps/server/modernization/contract.js';
import type {ModelBackend,ModelContext,ModelRequest} from '../../apps/server/modernization/ports.js';
import type {Equipment,Employee,Item} from '../../apps/web/src/model-data.js';
export const modelRef=(n:number)=>'20000000-0000-4000-8000-'+String(n).padStart(12,'0');
const organization={delegacionRef:modelRef(20),departamentoRef:modelRef(21),areaRef:modelRef(22)};
const now='2026-11-03T10:15:20.1234567Z';
/** Persistencia DOBLE exclusiva del ensayo visual. No es adaptador de aplicación ni prueba SQL Server.
 * Las transacciones/RLS/Auth/validación HTTP sí se ejercitan en el BFF PostgreSQL del fixture.
 */
export class ModelContractDouble implements ModelBackend {
 readonly engine='postgres' as const;
 readonly operations=new Set<string>(contract.operaciones.filter(op=>op.id!=='C03-17').map(op=>op.id));
 readonly directory:Record<string,Item[]>={
  'tipos-equipo':[[3,'Computador'],[4,'Monitor'],[5,'Impresora'],[6,'Switch']].map(([id,nombre])=>({ref:modelRef(Number(id)),nombre:String(nombre)})),
  marcas:[{ref:modelRef(1),nombre:'Marca Norte'},{ref:modelRef(2),nombre:'Marca Sur'}],
  modelos:[{ref:modelRef(7),nombre:'Modelo Norte',marcaRef:modelRef(1)},{ref:modelRef(8),nombre:'Modelo Sur',marcaRef:modelRef(2)}],
  estados:[{ref:modelRef(9),nombre:'Bueno'},{ref:modelRef(10),nombre:'Malo'}],situaciones:[{ref:modelRef(11),nombre:'Activo'},{ref:modelRef(12),nombre:'Reserva'}],
  origenes:[{ref:modelRef(24),nombre:'Compra'}], 'sistemas-operativos':[{ref:modelRef(25),nombre:'Sistema sintético'}],
  'clases-impresora':[{ref:modelRef(26),nombre:'Láser'}], 'familias-componente':[{ref:modelRef(27),nombre:'Memoria RAM'},{ref:modelRef(28),nombre:'Almacenamiento'}],
  'rubros-insumo':[{ref:modelRef(29),nombre:'Tóner'}], 'modalidades-asignacion':[{ref:modelRef(30),nombre:'Individual'}], 'actividades-mantencion':[{ref:modelRef(31),nombre:'Limpieza preventiva'}],
  regiones:[{ref:modelRef(23),nombre:'Región sintética'}],delegaciones:[{ref:modelRef(20),nombre:'Delegación Norte'},{ref:modelRef(40),nombre:'Delegación Sur'}],
  departamentos:[{ref:modelRef(21),nombre:'Tecnologías'}],areas:[{ref:modelRef(22),nombre:'Soporte'}]
 };
 readonly people:Employee[]=Array.from({length:3},(_,i)=>({ref:modelRef(101+i),nombre:['Ángela Sintética','Bruno Sintético','Camila Sintética'][i],cargo:'Analista',activo:true,version:'1',organizacion:{...organization},documentoTipo:'ID',documento:'ID-PRIVADO-'+i,correo:'privado'+i+'@example.invalid'}));
 readonly equipment:Equipment[]=Array.from({length:31},(_,i)=>({ref:modelRef(2000+i),codigoOperativo:'MODELO-'+String(i+1).padStart(3,'0'),tipoRef:modelRef(3+(i%4)),modeloRef:modelRef(7),condicionRef:modelRef(9),situacionRef:modelRef(11),custodioRef:i===0?modelRef(101):null,version:'1',origenRef:modelRef(24),numeroSerie:'SERIE-'+i,motivoSinSerie:null,inventarioServiu:'SERV-'+i,inventarioMinvu:'MIN-'+i,adquisicion:i===0?'2020-02-29':null,observacion:'Observación sintética',tecnica:i%4===0?{subtipo:'computador',nombreRed:'RED-'+i,esNotebook:false,sistemaOperativoRef:modelRef(25),procesador:'<img src=x onerror=window.xss=1>',velocidadGhz:3.2,piezas:[{familiaRef:modelRef(27),capacidadGb:8}]}:i%4===1?{subtipo:'monitor',pulgadas:24}:i%4===2?{subtipo:'impresora',claseRef:modelRef(26),duplex:true,anchoCarro:30,insumos:[{rubroRef:modelRef(29),codigo:'TN-01'}]}:{subtipo:'switch',cantidadPuertos:24}}));
 readonly calls:{context:ModelContext;request:ModelRequest}[]=[];
 readonly writes:{key:string;operation:string;body:Record<string,unknown>;expectedVersion:string|undefined}[]=[];
 readonly maintenance:{ref:string;equipoRef:string;actividadRef:string;fecha:string;observacion:string|null;registradoEn:string}[]=[{ref:modelRef(5000),equipoRef:modelRef(2000),actividadRef:modelRef(31),fecha:'2026-10-01',observacion:'Sin datos privados',registradoEn:now}];
 private results=new Map<string,{fingerprint:string;result:unknown}>();
 nextConflict=false;nextUnavailable=false;omitEditFields=false;
 private page(items:any[],request:ModelRequest) {
  const query=request.query, binding=createHash('sha256').update(JSON.stringify(Object.entries(query).filter(([key])=>key!=='cursor'&&key!=='limit').sort())).digest('hex');
  let index=0;if(query.cursor){const cursor=JSON.parse(Buffer.from(String(query.cursor),'base64url').toString());if(cursor.binding!==binding)throw new AuthError(400,'INVALID_CURSOR');index=cursor.index;}
  const limit=request.operation==='C03-01'?1:Number(query.limit??25),visible=items.slice(index,index+limit);
  return {items:structuredClone(visible),nextCursor:index+limit<items.length?Buffer.from(JSON.stringify({index:index+limit,binding})).toString('base64url'):null,generatedAt:now,timezone:'UTC'};
 }
 private publicPerson(person:Employee) {const {documentoTipo,documento,correo,...publicFields}=person;return structuredClone(publicFields);}
 async executeAtomic(context:ModelContext,request:ModelRequest,_transaction:unknown) {
  this.calls.push({context:{...context},request:structuredClone(request)});
  const operation=request.operation,body=request.body??{},record=this.equipment.find(row=>row.ref===request.params.ref),person=this.people.find(row=>row.ref===request.params.ref);
  if(this.nextUnavailable&&request.body){this.nextUnavailable=false;throw new AuthError(503,'MODEL_OPERATION_NOT_READY');}
  if(operation==='C03-01')return this.page((this.directory[request.params.catalogo]??[]).filter(row=>(!request.query.q||row.nombre.toLowerCase().includes(String(request.query.q).toLowerCase()))&&(!request.query.marcaRef||row.marcaRef===request.query.marcaRef)),request);
  if(operation==='C03-18')return this.page(this.directory[String(request.query.grupo??'regiones')]??[],request);
  if(operation==='C03-02')return this.page(this.equipment.filter(row=>{
   const q=request.query;return (!q.q||row.codigoOperativo.toLowerCase().includes(String(q.q).toLowerCase()))&&['tipoRef','condicionRef','situacionRef'].every(key=>!q[key]||(row as any)[key]===q[key])&&(!q.funcionarioRef||row.custodioRef===q.funcionarioRef)&&(!q.custodia||(q.custodia==='asignado')===!!row.custodioRef);
  }).map(({tecnica,origenRef,numeroSerie,motivoSinSerie,inventarioServiu,inventarioMinvu,adquisicion,observacion,...publicFields})=>publicFields),request);
  if(operation==='C03-11')return this.page(this.people.filter(row=>(!request.query.q||row.nombre.toLowerCase().includes(String(request.query.q).toLowerCase()))).map(row=>this.publicPerson(row)),request);
  if(operation==='C03-04') {if(!record)throw new AuthError(404,'NOT_FOUND');const result=structuredClone(record);if(this.omitEditFields)delete result.observacion;return result;}
  if(operation==='C03-13'||operation==='C03-14'){if(!person)throw new AuthError(404,'NOT_FOUND');return operation==='C03-14'?structuredClone(person):this.publicPerson(person);}
  if(operation==='C03-09'){if(!record)throw new AuthError(404,'NOT_FOUND');return this.page(this.maintenance.filter(row=>row.equipoRef===record.ref),request);}
  if(operation==='C03-08') {
   if(!record)throw new AuthError(404,'NOT_FOUND');
   const current={ref:modelRef(4000),equipoRef:record.ref,funcionarioRef:modelRef(101),inicio:null,fin:null,fechaOrigen:'2020-02-29',precisionTemporal:'dia',traspasoDeRef:null,vigente:true};
   return {asignaciones:request.query.asignacionesCursor?[]:[current],movimientos:request.query.movimientosCursor?[]:[{ref:'1',equipoRef:record.ref,tipo:'asignacion',origenRef:null,destinoRef:modelRef(101),efectivaEn:now,registradaEn:now,motivo:'Movimiento sintético'}],anotaciones:[{ref:'1',movimientoRef:'1',texto:'Anotación <b>literal</b>',registradaEn:now}],vigente:current,next:{asignaciones:request.query.asignacionesCursor?null:'asig-next',movimientos:request.query.movimientosCursor?null:'mov-next',anotaciones:null},timezone:'UTC'};
  }
  // Respuestas de contrato en memoria: NO prueban atomicidad, integridad o persistencia de dominio.
  const key=context.actorId+':'+context.idempotencyKey, fingerprint=JSON.stringify(request),previous=this.results.get(key);
  if(previous){if(previous.fingerprint!==fingerprint)throw new AuthError(409,'IDEMPOTENCY_MISMATCH');return structuredClone(previous.result);}
  if(this.nextConflict){this.nextConflict=false;if(record)record.version=String(BigInt(record.version)+1n);throw new AuthError(412,'VERSION_MISMATCH');}
  if(context.expectedVersion&&context.expectedVersion!==(record??person)?.version)throw new AuthError(412,'VERSION_MISMATCH');
  let target:Equipment|Employee|undefined=record??person;
  if(operation==='C03-03'){target={ref:modelRef(2100+this.equipment.length),...body,situacionRef:modelRef(11),custodioRef:null,tecnica:null,version:'1'} as Equipment;delete (target as any).motivo;delete (target as any).confirmado;this.equipment.push(target as Equipment);}
  else if(operation==='C03-12'){target={ref:modelRef(150+this.people.length),...body,activo:true,version:'1'} as Employee;delete (target as any).motivo;delete (target as any).confirmado;this.people.push(target as Employee);}
  else {
   if(!target)throw new AuthError(404,'NOT_FOUND');
   if(operation==='C03-05'||operation==='C03-15')for(const [k,v] of Object.entries(body))if(!['motivo','confirmado'].includes(k))(target as any)[k]=v;
   if(operation==='C03-06'&&record){const {motivo,confirmado,piezasAgregar,insumosAgregar,...attributes}=body;record.tecnica={...record.tecnica,...attributes,...(piezasAgregar?{piezas:[...(record.tecnica?.piezas??[]),...piezasAgregar as any[]]}:{}),...(insumosAgregar?{insumos:[...(record.tecnica?.insumos??[]),...insumosAgregar as any[]]}:{})};}
   if(operation==='C03-07'&&record){if(body.tipo==='asignacion'||body.tipo==='traslado')record.custodioRef=String(body.destinoRef);if(body.tipo==='devolucion')record.custodioRef=null;if(body.tipo==='condicion')record.condicionRef=String(body.condicionRef);}
   if(operation==='C03-10'&&record)this.maintenance.push({ref:modelRef(5001+this.maintenance.length),equipoRef:record.ref,actividadRef:String(body.actividadRef),fecha:String(body.fecha),observacion:body.observacion as string|null,registradoEn:now});
   if(operation==='C03-16'&&person)person.organizacion=body.organizacion as Employee['organizacion'];
   target.version=String(BigInt(target.version)+1n);
  }
  const result={ref:target.ref,version:target.version,aviso:'pendiente'};
  this.writes.push({key:context.idempotencyKey!,operation,body:structuredClone(body),expectedVersion:context.expectedVersion});this.results.set(key,{fingerprint,result});return structuredClone(result);
 }
}
