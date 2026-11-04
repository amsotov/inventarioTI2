// Simulación exclusiva del navegador. Sin HTTP, SDK, storage o repositorio de servidor.
import {ApiError} from './errors';
import {demoRole} from './demoData';
import type {Equipment,Employee,Organization,Item} from './model-data';
type Row=Record<string,any>;
const ref=(n:number)=>'30000000-0000-4000-8000-'+String(n).padStart(12,'0');
const now=()=>new Date().toISOString();
const reject=(status:number,code='BUSINESS_RULE'):never=>{throw new ApiError(status,code);};
const directory:Record<string,Item[]>={
 'tipos-equipo':[[1,'Notebook'],[2,'Monitor'],[3,'Impresora'],[4,'Switch'],[5,'Periférico']].map(([n,nombre])=>({ref:ref(Number(n)),nombre:String(nombre)})),
 marcas:[{ref:ref(10),nombre:'Marca Demo Norte'},{ref:ref(11),nombre:'Marca Demo Sur'}],
 modelos:[{ref:ref(20),nombre:'Portátil Demo',marcaRef:ref(10)},{ref:ref(21),nombre:'Pantalla Demo',marcaRef:ref(11)},{ref:ref(22),nombre:'Impresora Demo',marcaRef:ref(10)},{ref:ref(23),nombre:'Switch Demo',marcaRef:ref(11)}],
 estados:[{ref:ref(30),nombre:'Bueno'},{ref:ref(31),nombre:'Regular'},{ref:ref(32),nombre:'Malo'}],
 situaciones:[{ref:ref(40),nombre:'Activo'},{ref:ref(41),nombre:'Reserva'},{ref:ref(42),nombre:'No activo'},{ref:ref(43),nombre:'En proceso de baja'}],
 origenes:[{ref:ref(50),nombre:'Compra de muestra'},{ref:ref(51),nombre:'Donación de muestra'}],
 'sistemas-operativos':[{ref:ref(60),nombre:'Sistema Demo'}],
 'clases-impresora':[{ref:ref(70),nombre:'Láser'},{ref:ref(71),nombre:'Inyección de tinta'}],
 'familias-componente':[{ref:ref(80),nombre:'Memoria RAM'},{ref:ref(81),nombre:'Disco SSD'}],
 'rubros-insumo':[{ref:ref(90),nombre:'Tóner'},{ref:ref(91),nombre:'Tinta'}],
 'modalidades-asignacion':[{ref:ref(100),nombre:'Individual de muestra'}],
 'actividades-mantencion':[{ref:ref(110),nombre:'Limpieza preventiva'},{ref:ref(111),nombre:'Revisión técnica'}],
 regiones:[{ref:ref(120),nombre:'Región de demostración'}],
 delegaciones:[{ref:ref(130),nombre:'Delegación Demo Norte'},{ref:ref(131),nombre:'Delegación Demo Sur'}],
 departamentos:[{ref:ref(140),nombre:'Tecnologías'},{ref:ref(141),nombre:'Administración'}],
 areas:[{ref:ref(150),nombre:'Soporte'},{ref:ref(151),nombre:'Operaciones'}]
};
const org:Organization={delegacionRef:ref(130),departamentoRef:ref(140),areaRef:ref(150)};
const people:Employee[]=['Persona Demo Alfa','Persona Demo Beta','Persona Demo Gamma'].map((nombre,i)=>({ref:ref(200+i),nombre,cargo:['Analista TI','Técnico de soporte','Administrativo'][i],activo:true,version:'1',organizacion:{...org,...(i===2?{delegacionRef:ref(131),departamentoRef:ref(141),areaRef:ref(151)}:{})},documentoTipo:'ID',documento:'DEMO-ID-'+i,correo:'demo'+i+'@example.invalid'}));
const equipment:Equipment[]=Array.from({length:29},(_,i)=>({ref:ref(1000+i),codigoOperativo:'MOD-DEMO-'+String(i+1).padStart(3,'0'),tipoRef:ref(1+i%4),modeloRef:ref(20+i%4),condicionRef:ref(i===6?31:30),situacionRef:ref(i===5?41:40),custodioRef:i<3?people[i].ref:null,version:'1',origenRef:ref(50),numeroSerie:'SERIE-DEMO-'+(i+1),motivoSinSerie:null,inventarioServiu:'DEMO-SERV-'+(i+1),inventarioMinvu:'DEMO-MINVU-'+(i+1),adquisicion:'2024-06-03',observacion:'Equipo ficticio para recorrer la interfaz modernizada.',tecnica:i%4===0?{subtipo:'computador',nombreRed:'DEMO-PC-'+(i+1),esNotebook:true,sistemaOperativoRef:ref(60),procesador:'Procesador de demostración',velocidadGhz:3.2,direccionMac:null,guid:null,piezas:[{familiaRef:ref(80),capacidadGb:16},{familiaRef:ref(81),capacidadGb:512}]}:i%4===1?{subtipo:'monitor',pulgadas:24}:i%4===2?{subtipo:'impresora',claseRef:ref(70),duplex:true,anchoCarro:21,insumos:[{rubroRef:ref(90),codigo:'TONER-DEMO'}]}:{subtipo:'switch',cantidadPuertos:24}}));
const assignments:Row[]=equipment.filter(e=>e.custodioRef).map((e,i)=>({ref:ref(2000+i),equipoRef:e.ref,funcionarioRef:e.custodioRef,inicio:null,fin:null,fechaOrigen:'2024-06-03',precisionTemporal:'dia',traspasoDeRef:null,vigente:true}));
const movements:Row[]=[],notes:Row[]=[],memberships:Row[]=[];
const maintenance:Row[]=[{ref:ref(3000),equipoRef:equipment[0].ref,actividadRef:ref(110),fecha:'2026-10-01',observacion:'Limpieza de muestra.',registradoEn:'2026-10-01T10:00:00Z'}];
const dates=new Map([...equipment,...people].map(e=>[e.ref,'2026-10-01T10:00:00Z']));
const replay=new Map<string,{fingerprint:string;body:Row}>();
const catalog=(family:string,value:unknown,required=false)=>{
 if(value===null&&!required)return null;
 if(typeof value!=='string'||!directory[family]?.some(row=>row.ref===value))reject(422);
 return value as string;
};
function organization(value:unknown):Organization {
 const o=value as Row;if(!o||typeof o!=='object')return reject(422);
 return {delegacionRef:catalog('delegaciones',o.delegacionRef,true)!,departamentoRef:catalog('departamentos',o.departamentoRef,true)!,areaRef:catalog('areas',o.areaRef)};
}
const person=(p:Employee)=>{const {documentoTipo,documento,correo,...publicFields}=p;return publicFields;};
const answer=(body:any)=>({body:structuredClone(body),etag:body?.version?'"v'+body.version+'"':null});
function page(rows:Row[],q:URLSearchParams,family:string) {
 const binding=JSON.stringify([...q].filter(([k])=>!['cursor','limit'].includes(k)).sort()),limit=Number(q.get('limit')??25);let offset=0;
 if(!Number.isInteger(limit)||limit<1||limit>100)reject(400,'INVALID_REQUEST');
 if(q.has('cursor')){try{const c=JSON.parse(decodeURIComponent(atob(q.get('cursor')!)));if(c.family!==family||c.binding!==binding||!Number.isInteger(c.offset)||c.offset<0)throw Error();offset=c.offset;}catch{return reject(400,'INVALID_CURSOR');}}
 return {items:rows.slice(offset,offset+limit),nextCursor:offset+limit<rows.length?btoa(encodeURIComponent(JSON.stringify({family,binding,offset:offset+limit}))):null,generatedAt:now(),timezone:'UTC'};
}
function matches(row:Row,q:URLSearchParams) {
 const term=q.get('q')?.toLocaleLowerCase();
 if(term&&![row.codigoOperativo,row.nombre,row.numeroSerie,row.inventarioServiu,row.inventarioMinvu].some(v=>typeof v==='string'&&v.toLocaleLowerCase().includes(term)))return false;
 for(const key of ['tipoRef','condicionRef','situacionRef','marcaRef'])if(q.has(key)&&row[key]!==q.get(key))return false;
 if(q.has('funcionarioRef')&&row.custodioRef!==q.get('funcionarioRef'))return false;
 if(q.has('custodia')&&(q.get('custodia')==='asignado')!==!!row.custodioRef)return false;
 const o=row.organizacion??people.find(p=>p.ref===row.custodioRef)?.organizacion;
 for(const key of ['delegacionRef','departamentoRef','areaRef'])if(q.has(key)&&o?.[key]!==q.get(key))return false;
 const day=dates.get(row.ref)?.slice(0,10);return (!q.has('desde')||!!day&&day>=q.get('desde')!)&&(!q.has('hasta')||!!day&&day<=q.get('hasta')!);
}
const pick=(body:Row,keys:string[])=>Object.fromEntries(keys.map(key=>[key,body[key]]));
const requiredText=(value:unknown)=>typeof value==='string'&&value.trim().length>0;

export async function demoModelApi(path:string,options:RequestInit={}) {
 if(import.meta.env.VITE_DEMO_MODE!=='true')return reject(503,'MODEL_NOT_AVAILABLE');
 if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
 const url=new URL(path,'https://demo.invalid/'),q=url.searchParams,[family,id,op]=url.pathname.slice(1).split('/'),method=options.method??'GET';
 if(url.origin!=='https://demo.invalid'||url.pathname.slice(1).split('/').length>3)return reject(400,'INVALID_REQUEST');
 const e=equipment.find(e=>e.ref===id),p=people.find(p=>p.ref===id),target=e??p;
 if(method==='GET') {
  if(family==='catalogos'||family==='organizacion'){const key=family==='catalogos'?id:q.get('grupo')??'regiones';if(!directory[key])return reject(404,'NOT_FOUND');return answer(page(directory[key].filter(row=>!q.get('q')||row.nombre.toLocaleLowerCase().includes(q.get('q')!.toLocaleLowerCase())).filter(row=>!q.get('marcaRef')||row.marcaRef===q.get('marcaRef')),q,key));}
  if(family==='equipos'&&!id)return answer(page(equipment.filter(row=>matches(row,q)).map(({tecnica,...row})=>row),q,family));
  if(family==='funcionarios'&&!id)return answer(page(people.filter(row=>matches(row,q)).map(person),q,family));
  if(family==='funcionarios'&&p){if(op==='edicion'&&demoRole()!=='administrador')return reject(403,'FORBIDDEN');if(op&&op!=='edicion')return reject(404,'NOT_FOUND');return answer(op==='edicion'?p:person(p));}
  if(family==='equipos'&&e){
   if(!op)return answer(e);
   if(op==='mantenciones')return answer(page(maintenance.filter(row=>row.equipoRef===id),q,'mantenciones'));
   if(op==='historia'){const a=assignments.filter(row=>row.equipoRef===id);return answer({asignaciones:a,movimientos:movements.filter(row=>row.equipoRef===id),anotaciones:notes.filter(row=>row.equipoRef===id).map(({equipoRef,...row})=>row),vigente:a.find(row=>row.vigente)??null,next:{asignaciones:null,movimientos:null,anotaciones:null},timezone:'UTC'});}
  }
  return reject(404,'NOT_FOUND');
 }
 if(demoRole()!=='administrador')return reject(403,'FORBIDDEN');
 if(!['POST','PATCH'].includes(method))return reject(405,'INVALID_REQUEST');
 let body:Row;try{body=JSON.parse(String(options.body));}catch{return reject(400,'INVALID_REQUEST');}
 if(!body||!requiredText(body.motivo)||body.confirmado!==true)return reject(422);
 const headers=new Headers(options.headers),key=headers.get('Idempotency-Key');if(!key)return reject(400,'INVALID_REQUEST');
 const fingerprint=JSON.stringify([path,method,body,headers.get('If-Match')]),previous=replay.get(key);
 if(previous){if(previous.fingerprint!==fingerprint)return reject(409,'IDEMPOTENCY_MISMATCH');return answer(previous.body);}
 const creating=!id&&method==='POST'&&['equipos','funcionarios'].includes(family);
 if(!creating){if(!target)return reject(404,'NOT_FOUND');if(!headers.has('If-Match'))return reject(428,'VERSION_REQUIRED');if(headers.get('If-Match')!=='"v'+target.version+'"')return reject(412,'VERSION_MISMATCH');}
 let changed:Equipment|Employee|undefined=target;
 if(family==='equipos'&&!op&&(creating||method==='PATCH')) {
  if(!requiredText(body.codigoOperativo)||!body.numeroSerie&&!requiredText(body.motivoSinSerie))return reject(422);
  if(equipment.some(row=>row.ref!==id&&row.codigoOperativo.toLocaleLowerCase()===String(body.codigoOperativo).toLocaleLowerCase()))return reject(409,'CONFLICT');
  const type=catalog('tipos-equipo',body.tipoRef,true)!,model=catalog('modelos',body.modeloRef),origin=catalog('origenes',body.origenRef);
  if(e?.tecnica&&type!==e.tipoRef)return reject(422);
  const fields={...pick(body,['codigoOperativo','numeroSerie','motivoSinSerie','inventarioServiu','inventarioMinvu','adquisicion','observacion']),tipoRef:type,modeloRef:model,origenRef:origin};
  if(creating){changed={...fields,ref:crypto.randomUUID(),condicionRef:catalog('estados',body.condicionRef,true),situacionRef:ref(40),custodioRef:null,tecnica:null,version:'1'} as Equipment;equipment.push(changed as Equipment);dates.set(changed.ref,now());}else Object.assign(e!,fields);
 }else if(family==='funcionarios'&&!op&&(creating||method==='PATCH')) {
  if(!['ID','RUT'].includes(body.documentoTipo)||!['documento','nombre','cargo'].every(k=>requiredText(body[k])))return reject(422);
  if(people.some(row=>row.ref!==id&&row.documentoTipo===body.documentoTipo&&row.documento===body.documento))return reject(409,'CONFLICT');
  const fields=pick(body,['documentoTipo','documento','nombre','cargo','correo']);
  if(creating){changed={...fields,ref:crypto.randomUUID(),organizacion:organization(body.organizacion),activo:true,version:'1'} as Employee;people.push(changed as Employee);dates.set(changed.ref,now());}else Object.assign(p!,fields);
 }else if(family==='funcionarios'&&p&&op==='pertenencias'&&method==='POST') {
  const next=organization(body.organizacion);memberships.push({funcionarioRef:p.ref,anterior:{...p.organizacion},nueva:{...next},registradaEn:now(),motivo:body.motivo});p.organizacion=next;
 }else if(family==='equipos'&&e&&op==='tecnica'&&method==='PATCH') {
  const subtypes:Record<string,string>={[ref(1)]:'computador',[ref(2)]:'monitor',[ref(3)]:'impresora',[ref(4)]:'switch'};
  if(subtypes[e.tipoRef]!==body.subtipo||e.tecnica&&e.tecnica.subtipo!==body.subtipo)return reject(422);
  let fields:Row;
  if(body.subtipo==='computador'){
   if(!requiredText(body.nombreRed))return reject(422);catalog('sistemas-operativos',body.sistemaOperativoRef);
   const additions=body.piezasAgregar??[];if(!Array.isArray(additions))return reject(422);for(const row of additions){catalog('familias-componente',row.familiaRef,true);if(!Number.isInteger(row.capacidadGb)||row.capacidadGb<1)return reject(422);}
   fields={...pick(body,['subtipo','nombreRed','esNotebook','sistemaOperativoRef','procesador','velocidadGhz','direccionMac','guid']),piezas:[...(e.tecnica?.piezas??[]),...additions.map(row=>pick(row,['familiaRef','capacidadGb']))]};
  }else if(body.subtipo==='impresora'){
   catalog('clases-impresora',body.claseRef);const additions=body.insumosAgregar??[];if(!Array.isArray(additions))return reject(422);for(const row of additions){catalog('rubros-insumo',row.rubroRef,true);if(!requiredText(row.codigo))return reject(422);}
   fields={...pick(body,['subtipo','claseRef','duplex','anchoCarro']),insumos:[...(e.tecnica?.insumos??[]),...additions.map(row=>pick(row,['rubroRef','codigo']))]};
  }else if(body.subtipo==='monitor'){if(body.pulgadas!==null&&(!(body.pulgadas>0)||body.pulgadas>999.9))return reject(422);fields=pick(body,['subtipo','pulgadas']);}
  else {if(!Number.isInteger(body.cantidadPuertos)||body.cantidadPuertos<1||body.cantidadPuertos>32767)return reject(422);fields=pick(body,['subtipo','cantidadPuertos']);}
  e.tecnica=fields;
 }else if(family==='equipos'&&e&&op==='mantenciones'&&method==='POST') {
  catalog('actividades-mantencion',body.actividadRef,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(body.fecha)||Number.isNaN(Date.parse(body.fecha))||new Date(body.fecha).toISOString().slice(0,10)!==body.fecha)return reject(422);
  maintenance.push({ref:crypto.randomUUID(),equipoRef:e.ref,actividadRef:body.actividadRef,fecha:body.fecha,observacion:body.observacion,registradoEn:now()});
 }else if(family==='equipos'&&e&&op==='movimientos'&&method==='POST') {
  const kind=body.tipo;if(!['asignacion','devolucion','traslado','condicion'].includes(kind)||body.corrigeRef)return reject(503,'MODEL_OPERATION_NOT_READY');
  const origin=e.custodioRef,destination=['asignacion','traslado'].includes(kind)?people.find(row=>row.ref===body.destinoRef):undefined;
  if(kind==='asignacion'&&origin||['devolucion','traslado'].includes(kind)&&(!origin||origin!==body.origenEsperadoRef)||['asignacion','traslado'].includes(kind)&&(!destination?.activo||destination.ref.toLowerCase()===origin?.toLowerCase()||e.condicionRef===ref(32)||e.situacionRef!==ref(40)))return reject(422);
  if(kind==='condicion')catalog('estados',body.condicionRef,true);
  const timestamp=now(),movementRef=crypto.randomUUID();
  if(kind!=='condicion'){
   const current=assignments.find(row=>row.equipoRef===e.ref&&row.vigente);if(current){current.vigente=false;current.fin=timestamp;}
   e.custodioRef=destination?.ref??null;
   if(destination)assignments.push({ref:crypto.randomUUID(),equipoRef:e.ref,funcionarioRef:destination.ref,inicio:timestamp,fin:null,fechaOrigen:null,precisionTemporal:'instante',traspasoDeRef:current?.ref??null,vigente:true});
  }else e.condicionRef=body.condicionRef;
  movements.push({ref:movementRef,equipoRef:e.ref,tipo:kind,origenRef:origin,destinoRef:destination?.ref??null,efectivaEn:timestamp,registradaEn:timestamp,motivo:body.motivo});
 }else return reject(503,'MODEL_OPERATION_NOT_READY');
 if(!changed)return reject(404,'NOT_FOUND');if(!creating)changed.version=String(BigInt(changed.version)+1n);
 const result={ref:changed.ref,version:changed.version,aviso:'pendiente'};replay.set(key,{fingerprint,body:result});return answer(result);
}
