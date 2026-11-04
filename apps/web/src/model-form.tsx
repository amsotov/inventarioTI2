import React,{useEffect,useRef,useState} from 'react';
import {Field} from './fields';
import {ApiError,message,modelApi} from './api';
import {beginModelCommand,endModelCommand} from './model-guard';
import {completeEquipment,prepareCommand,uuid,type Directory,type Equipment,type Employee,type Item,type Operation} from './model-data';

export function ReferenceSelect({name,label,options,value,required=false,onChange,locked=false,emptyLabel}:{name:string;label:string;options:Item[];value?:string|null;required?:boolean;locked?:boolean;emptyLabel?:string;onChange?:(value:string)=>void}) {
 const [selected,setSelected]=useState(value??''),[filter,setFilter]=useState('');
 const chosen=onChange?value??'':selected;
 const visible=options.filter(row=>row.ref===chosen||row.nombre.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
 return <div className="model-reference">
  {options.length>15&&<label>Buscar en {label.toLowerCase()}<input type="search" value={filter} onChange={e=>setFilter(e.target.value)} maxLength={200}/></label>}
  <label>{label}{required?' *':''}<select aria-label={label} name={name} required={required} disabled={locked} value={chosen} onChange={e=>{setSelected(e.target.value);onChange?.(e.target.value);}}>
   <option value="">{emptyLabel??(required?'Selecciona una opción':'No indicado')}</option>
   {chosen&&!options.some(row=>row.ref===chosen)&&<option value={chosen}>Valor actual sin nombre disponible</option>}
   {visible.map(row=><option key={row.ref} value={row.ref}>{row.nombre}</option>)}
  </select></label>{locked&&<input type="hidden" name={name} value={chosen}/>}
 </div>;
}
const labels:Record<Operation,string>={ 'equipo-alta':'Nuevo equipo','equipo-edicion':'Editar atributos del equipo',tecnica:'Información técnica',movimiento:'Registrar movimiento',mantencion:'Registrar mantención','funcionario-alta':'Nuevo funcionario','funcionario-edicion':'Editar funcionario',pertenencia:'Cambiar pertenencia'};
type Props={operation:Operation;record?:Equipment|Employee;etag:string|null;directory:Directory;csrf:string;onSaved:(ref:string)=>void;onExpired:()=>void;onReload:()=>void;onStart:()=>void};
type Pending={path:string;method:string;body:string;key:string;etag:string|null};
export function ModelForm({operation,record,etag,directory,csrf,onSaved,onExpired,onReload,onStart}:Props) {
 const equipment=record as Equipment|undefined,employee=record as Employee|undefined,tech=equipment?.tecnica;
 const model=directory.modelos?.find(row=>row.ref===equipment?.modeloRef);
 const [brand,setBrand]=useState(model?.marcaRef??''),[modelRef,setModelRef]=useState(equipment?.modeloRef??''),[type,setType]=useState(tech?.subtipo??'');
 const [movement,setMovement]=useState(equipment?.custodioRef?'traslado':'asignacion');
 const [parts,setParts]=useState<string[]>([]),[busy,setBusy]=useState(false),[uncertain,setUncertain]=useState(false),[conflict,setConflict]=useState(false),[error,setError]=useState('');
 const pending=useRef<Pending|null>(null),active=useRef(true),focus=useRef<HTMLDivElement>(null);
 useEffect(()=>{active.current=true;return ()=>{active.current=false;endModelCommand();};},[]);
 useEffect(()=>{if(error)focus.current?.focus();},[error]);
 const newRecord=operation==='equipo-alta'||operation==='funcionario-alta';
 const safeVersion=etag!==null&&/^"v[1-9][0-9]{0,18}"$/.test(etag)&&BigInt(etag.slice(2,-1))<=9223372036854775807n;
 const incomplete=operation==='equipo-edicion'&&!completeEquipment(equipment!);
 async function send() {
  const command=pending.current;if(!command)return;
  setBusy(true);setError('');
  try {
   const result=await modelApi(command.path,{method:command.method,body:command.body,headers:{'Idempotency-Key':command.key,...(command.etag?{'If-Match':command.etag}:{})}},csrf);
   if(!active.current)return;
   if(!result.body||!uuid(result.body.ref)||typeof result.body.version!=='string'||result.body.aviso!=='pendiente')throw new ApiError(503,'INVALID_MODEL_RESPONSE');
   pending.current=null;endModelCommand();setUncertain(false);onSaved(result.body.ref);
  }catch(e) {
   if(!active.current)return;
   setError(message(e));
   const definitive=e instanceof ApiError&&(e.status<500||['MODEL_OPERATION_NOT_READY','MODEL_NOT_AVAILABLE','MODEL_REFERENCE_NOT_READY'].includes(e.code));
   if(definitive){pending.current=null;endModelCommand();setUncertain(false);if(e.status===412||e.status===428)setConflict(true);if(e.status===401)onExpired();}
   else setUncertain(true);
  }finally{if(active.current)setBusy(false);}
 }
 function submit(event:React.FormEvent<HTMLFormElement>) {
  event.preventDefault();if(pending.current||busy||conflict||incomplete||!newRecord&&!safeVersion)return;
  setError('');
  try {
   const data=new FormData(event.currentTarget);
   const rows=parts.map((_,n)=>type==='computador'?{familiaRef:String(data.get('familia-'+n)),capacidadGb:Number(data.get('capacidad-'+n))}:{rubroRef:String(data.get('rubro-'+n)),codigo:String(data.get('insumo-'+n))});
   for(const row of rows)if(type==='computador'&&(!uuid(String(row.familiaRef))||!Number.isInteger(row.capacidadGb)||Number(row.capacidadGb)<1||Number(row.capacidadGb)>2147483647)||type==='impresora'&&(!uuid(String(row.rubroRef))||!String(row.codigo).trim()))throw Error('Completa todas las filas de componentes o insumos.');
   const command=prepareCommand(operation,data,record,rows);
   pending.current={...command,body:JSON.stringify(command.body),key:crypto.randomUUID(),etag:newRecord?null:etag};
   onStart();beginModelCommand();void send();
  }catch(e){setError(e instanceof ApiError?message(e):(e as Error).message);}
 }
 const select=(name:string,label:string,family:string,value?:string|null,required=false)=>
  <ReferenceSelect key={name} name={name} label={label} options={directory[family]??[]} value={value} required={required}/>;
 const field=(name:string,label:string,value:unknown='',required=false,maxLength=2000,type='text')=>
  <Field key={name} name={name} label={label} value={value==null?'':String(value)} required={required} maxLength={maxLength} type={type}/>;
 const number=(name:string,label:string,value:unknown,max:number,step:string,required=false)=><label key={name}>{label}{required?' *':''}<input name={name} type="number" min={step} max={max} step={step} defaultValue={value==null?'':String(value)} required={required}/></label>;
 const organization=(employee?.organizacion??{}) as Employee['organizacion'];
 return <section className="card model-form">
  <h2>{labels[operation]}</h2>
  {error&&<div className="error" role="alert" tabIndex={-1} ref={focus}>{error}</div>}
  {incomplete&&<p role="status">La edición de atributos todavía no está disponible para esta ficha.</p>}
  {!newRecord&&!safeVersion&&<p role="status">No se recibió una versión válida. Recarga la ficha antes de guardar.</p>}
  {conflict&&<div className="error"><p>Los campos se conservan. Revisa tus cambios antes de recargar; la recarga sustituirá el formulario por los datos actuales.</p><button onClick={onReload}>Recargar datos y revisar</button></div>}
  {uncertain&&<div className="error" role="status"><h3>Resultado pendiente de confirmar</h3><p>Conservamos esta operación. Reinténtala para confirmar su resultado antes de navegar.</p><button disabled={busy} onClick={()=>void send()}>Reintentar misma operación</button></div>}
  <form onSubmit={submit}>
   <fieldset disabled={busy||uncertain||conflict||incomplete||!newRecord&&!safeVersion}>
    <legend>Datos de la operación · campos con * obligatorios</legend>
    {(operation==='equipo-alta'||operation==='equipo-edicion')&&<>
     <div className="grid">
      {field('codigoOperativo','Código operativo',equipment?.codigoOperativo,true)}
      <ReferenceSelect name="tipoRef" label="Tipo de equipo" options={directory['tipos-equipo']??[]} value={equipment?.tipoRef} required locked={operation==='equipo-edicion'&&!!tech}/>
      <ReferenceSelect name="marcaFiltro" label="Marca para buscar modelo" emptyLabel="Todas las marcas" options={directory.marcas??[]} value={brand} onChange={value=>{setBrand(value);setModelRef('');}}/>
      <ReferenceSelect name="modeloRef" label="Modelo" options={(directory.modelos??[]).filter(row=>!brand||row.marcaRef===brand)} value={modelRef} onChange={setModelRef}/>
      {select('origenRef','Origen','origenes',equipment?.origenRef)}
      {operation==='equipo-alta'&&select('condicionRef','Condición inicial','estados',null,true)}
      {field('numeroSerie','Número de serie',equipment?.numeroSerie)}
      {field('motivoSinSerie','Motivo si no tiene serie',equipment?.motivoSinSerie)}
      {field('inventarioServiu','Inventario SERVIU',equipment?.inventarioServiu)}
      {field('inventarioMinvu','Inventario MINVU',equipment?.inventarioMinvu)}
      {field('adquisicion','Fecha de adquisición',equipment?.adquisicion,false,2000,'date')}
     </div>
     <label>Observación<textarea name="observacion" maxLength={2000} defaultValue={equipment?.observacion??''}/></label>
     {operation==='equipo-alta'&&<p>Tras registrar el equipo podrás completar su información técnica. No incluyas contraseñas ni códigos privados en las observaciones.</p>}
    </>}
    {(operation==='funcionario-alta'||operation==='funcionario-edicion')&&<div className="grid">
     <label>Tipo de documento *<select aria-label="Tipo de documento" name="documentoTipo" defaultValue={employee?.documentoTipo??'ID'}><option value="ID">ID</option><option value="RUT">RUT</option></select></label>
     {field('documento','Documento',employee?.documento,true)}
     {field('nombre','Nombre completo',employee?.nombre,true)}
     {field('cargo','Cargo',employee?.cargo,true)}
     {field('correo','Correo',employee?.correo,false,320,'email')}
    </div>}
    {(operation==='funcionario-alta'||operation==='pertenencia')&&<div className="grid">
     {select('delegacionRef','Delegación','delegaciones',organization.delegacionRef,true)}
     {select('departamentoRef','Departamento','departamentos',organization.departamentoRef,true)}
     {select('areaRef','Área','areas',organization.areaRef)}
    </div>}
    {operation==='pertenencia'&&<p>El cambio de pertenencia conserva la historia del funcionario y la custodia de sus equipos.</p>}
    {operation==='movimiento'&&<div className="grid">
     <label>Tipo de movimiento *<select aria-label="Tipo de movimiento" name="tipo" value={movement} onChange={e=>setMovement(e.target.value)}>
      {[['asignacion','Asignación'],['devolucion','Devolución'],['traslado','Traspaso'],['condicion','Cambio de condición'],['baja','Baja'],['reactivacion','Reactivación']].map(([value,label])=><option key={value} value={value}>{label}</option>)}
     </select></label>
     {['asignacion','traslado'].includes(movement)&&select('destinoRef','Funcionario de destino','funcionarios',null,true)}
     {movement==='condicion'&&select('condicionRef','Nueva condición','estados',null,true)}
     {field('corrigeRef','Movimiento que compensa (opcional)')}
    </div>}
    {operation==='mantencion'&&<div className="grid">
     {select('actividadRef','Actividad de mantención','actividades-mantencion',null,true)}
     {field('fecha','Fecha de la actividad','',true,2000,'date')}
     {field('observacion','Observación de mantención','',false,300)}
    </div>}
    {operation==='tecnica'&&<>
     <label>Subtipo técnico *<select aria-label="Subtipo técnico" name="subtipo" value={type} onChange={e=>{setType(e.target.value);setParts([]);}} required>
      <option value="">Selecciona un subtipo</option>
      {[['computador','Computador'],['monitor','Monitor'],['impresora','Impresora'],['switch','Switch']].filter(([value])=>!tech||tech.subtipo===value).map(([value,label])=><option key={value} value={value}>{label}</option>)}
     </select></label>
     <p>Los periféricos simples pueden conservarse sin ficha técnica. Los componentes existentes se mantienen; aquí puedes agregar nuevas filas.</p>
     {type==='computador'&&<div className="grid">
      {field('nombreRed','Nombre de red',tech?.nombreRed,true,50)}
      <label className="confirmation"><input name="esNotebook" type="checkbox" defaultChecked={tech?.esNotebook===true}/>Es notebook</label>
      {select('sistemaOperativoRef','Sistema operativo','sistemas-operativos',tech?.sistemaOperativoRef)}
      {field('procesador','Procesador',tech?.procesador,false,100)}
      {number('velocidadGhz','Velocidad (GHz)',tech?.velocidadGhz,99.99,'0.01')}
      {field('direccionMac','Dirección MAC',tech?.direccionMac,false,17)}
      {field('guid','GUID',tech?.guid,false,36)}
     </div>}
     {type==='monitor'&&number('pulgadas','Tamaño (pulgadas)',tech?.pulgadas,999.9,'0.1')}
     {type==='impresora'&&<div className="grid">
      {select('claseRef','Clase de impresora','clases-impresora',tech?.claseRef)}
      <label>Dúplex<select aria-label="Dúplex" name="duplex" defaultValue={tech?.duplex===true?'si':tech?.duplex===false?'no':''}><option value="">No indicado</option><option value="si">Sí</option><option value="no">No</option></select></label>
      {number('anchoCarro','Ancho del carro',tech?.anchoCarro,999.9,'0.1')}
     </div>}
     {type==='switch'&&number('cantidadPuertos','Cantidad de puertos',tech?.cantidadPuertos,32767,'1',true)}
     {(type==='computador'||type==='impresora')&&<section aria-label="Filas nuevas">
      {parts.map((key,index)=><fieldset className="model-part" key={key}><legend>{type==='computador'?'Componente':'Insumo'} {index+1}</legend><div className="grid">
       {type==='computador'?<>{select('familia-'+index,'Familia del componente '+(index+1),'familias-componente',null,true)}{number('capacidad-'+index,'Capacidad en GB '+(index+1),null,2147483647,'1',true)}</>:<>{select('rubro-'+index,'Rubro del insumo '+(index+1),'rubros-insumo',null,true)}{field('insumo-'+index,'Código del insumo '+(index+1),'',true,30)}</>}
      </div><button type="button" onClick={()=>setParts(rows=>rows.filter(x=>x!==key))}>Quitar fila {index+1}</button></fieldset>)}
      <button type="button" onClick={()=>setParts(rows=>[...rows,crypto.randomUUID()])}>{type==='computador'?'Agregar componente':'Agregar insumo'}</button>
     </section>}
    </>}
    {field('motivo','Motivo de la operación','',true)}
    <label className="confirmation"><input name="confirmacion" type="checkbox" required/>Confirmo esta operación</label>
    <button disabled={busy}>{busy?'Guardando…':'Guardar operación'}</button>
   </fieldset>
  </form>
 </section>;
}
