import React,{useEffect,useRef,useState} from 'react';
import {DEMO_MODE} from './demoMode';
import {ApiError,message,modelApi} from './api';
import {ModelForm,ReferenceSelect} from './model-form';
import {ModelHistory,ModelTable,TechnicalDetail,type HistoryKind} from './model-history';
import {endModelCommand,hasPendingModelCommand} from './model-guard';
import {catalogPath,catalogTitles,completeEquipment,instant,loadDirectory,lookup,uuid,type Directory,type Equipment,type Employee,type Operation} from './model-data';
export {protectModelNavigation} from './model-guard';
type Props={view:string;csrf:string;canWrite:boolean;onExpired:()=>void};
type Data={body:any;record:Equipment|Employee|undefined;etag:string|null;directory:Directory};
const baseFamilies=['tipos-equipo','marcas','modelos','estados','situaciones','funcionarios'];
const technicalFamilies=['sistemas-operativos','clases-impresora','familias-componente','rubros-insumo'];
const initialHistory=():Record<HistoryKind,(string|null)[]>=>({asignaciones:[null],movimientos:[null],anotaciones:[null]});

export function ModelWorkspace(props:Props) {
 const container=useRef<HTMLElement>(null),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{
  const guard=(event:MouseEvent)=>{
   if(hasPendingModelCommand()&&((event.target as Element).closest('a')||(event.target as Element).closest('button')&&!container.current?.contains(event.target as Node))) {
    event.preventDefault();event.stopPropagation();setError('Resuelve la operación pendiente antes de navegar.');
   }
  };
  const warn=(event:BeforeUnloadEvent)=>{if(hasPendingModelCommand())event.preventDefault();};
  document.addEventListener('click',guard,true);window.addEventListener('beforeunload',warn);
  return ()=>{document.removeEventListener('click',guard,true);window.removeEventListener('beforeunload',warn);endModelCommand();};
 },[]);
 useEffect(()=>setError(''),[props.view]);
 return <section className="model-panel" ref={container}>
  <nav aria-label="Equipos y relaciones">
   <a href="#modelo/equipos" aria-current={props.view.startsWith('modelo/equipos')?'page':undefined}>Equipos del nuevo modelo</a>
   <a href="#modelo/funcionarios" aria-current={props.view.startsWith('modelo/funcionarios')?'page':undefined}>Funcionarios y pertenencias</a>
   <a href="#modelo/catalogos" aria-current={props.view.startsWith('modelo/catalogos')?'page':undefined}>Catálogos y organización</a>
   <a href="#reportes">Reportes del inventario actual</a>
  </nav>
  {error&&<p role="alert" className="error">{error}</p>}
  {notice&&<p role="status" className="success">{notice}</p>}
  <ModelView key={props.view} {...props} onStart={()=>setNotice('')} onSaved={(family,ref)=>{setNotice(DEMO_MODE?'Cambio simulado en esta pestaña. No se envió ningún correo.':'Operación registrada. El aviso quedó pendiente de envío.');location.hash='#modelo/'+family+'/'+ref;}}/>
 </section>;
}

function ModelView({view,csrf,canWrite,onExpired,onSaved,onStart}:Props&{onStart:()=>void;onSaved:(family:string,ref:string)=>void}) {
 const [route,search='']=view.split('?');
 const [,family='equipos',id,section]=route.split('/');
 const [data,setData]=useState<Data|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 const [filters,setFilters]=useState<Record<string,string>>(()=>Object.fromEntries([...new URLSearchParams(search)].filter(([key])=>['q','tipoRef','condicionRef','situacionRef','funcionarioRef','custodia','delegacionRef','departamentoRef','areaRef','marcaRef','desde','hasta'].includes(key)))),[filterError,setFilterError]=useState(''),[filterEpoch,setFilterEpoch]=useState(0),[cursors,setCursors]=useState<(string|null)[]>([null]),[historyCursors,setHistoryCursors]=useState(initialHistory);
 const heading=useRef<HTMLHeadingElement>(null),alert=useRef<HTMLDivElement>(null);
 const catalog=id??'tipos-equipo';
 const operation:Operation|undefined=family==='equipos'?id==='nuevo'?'equipo-alta':section==='editar'?'equipo-edicion':section==='tecnica'?'tecnica':section==='movimiento'?'movimiento':section==='mantencion-nueva'?'mantencion':undefined:
  family==='funcionarios'?id==='nuevo'?'funcionario-alta':section==='editar'?'funcionario-edicion':section==='pertenencia'?'pertenencia':undefined:undefined;
 const restricted=!!operation&&!canWrite;
 const valid=['equipos','funcionarios','catalogos'].includes(family)&&
  (family==='catalogos'?Object.hasOwn(catalogTitles,catalog)&&catalog!=='funcionarios':(!id||id==='nuevo'||uuid(id))&&(!section||!!operation||family==='equipos'&&['historia','mantenciones'].includes(section)))&&route.split('/').length<=4&&(!section||!!id&&uuid(id));
 const query=new URLSearchParams({...filters,limit:'25',...(cursors.at(-1)?{cursor:cursors.at(-1)!}:{})}).toString();
 const historyQuery=new URLSearchParams(Object.fromEntries(Object.entries(historyCursors).filter(([,stack])=>stack.at(-1)).map(([key,stack])=>[key+'Cursor',stack.at(-1)!]))).toString();
 useEffect(()=>{heading.current?.focus();},[]);
 useEffect(()=>{if(error)alert.current?.focus();},[error]);
 useEffect(()=>{
  if(!valid||restricted){setLoading(false);return;}
  const abort=new AbortController();let active=true;
  setLoading(true);setData(null);setError('');
  void (async()=>{
   let body:any=null,record:Equipment|Employee|undefined,etag:string|null=null;
   if(family==='catalogos') {
    const path=catalogPath(catalog);body=(await modelApi(path+(path.includes('?')?'&':'?')+query,{signal:abort.signal})).body;
   }else if(!id)body=(await modelApi(family+'?'+query,{signal:abort.signal})).body;
   else if(id!=='nuevo') {
    const result=await modelApi(family+'/'+id+(operation==='funcionario-edicion'?'/edicion':''),{signal:abort.signal});record=result.body;etag=result.etag;
    if(family==='equipos'&&section==='historia')body=(await modelApi('equipos/'+id+'/historia'+(historyQuery?'?'+historyQuery:''),{signal:abort.signal})).body;
    else if(family==='equipos'&&section==='mantenciones')body=(await modelApi('equipos/'+id+'/mantenciones?'+query,{signal:abort.signal})).body;
   }
   const families=family==='equipos'?[...baseFamilies,...(!id?['delegaciones','departamentos','areas']:[]),...(id?technicalFamilies:[]),...(operation==='equipo-alta'||operation==='equipo-edicion'?['origenes']:[]),...(section==='mantenciones'||operation==='mantencion'?['actividades-mantencion']:[])]:family==='funcionarios'?['delegaciones','departamentos','areas']:catalog==='modelos'?['marcas']:[];
   const directory=await loadDirectory(families,abort.signal,modelApi);
   if(active)setData({body,record,etag,directory});
  })().catch(e=>{if(active){setError(message(e));if(e instanceof ApiError&&e.status===401)onExpired();}}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;abort.abort();};
 },[view,query,historyQuery,revision,canWrite]);
 const reload=()=>setRevision(n=>n+1);
 const refName=(name:string,value:string|null|undefined)=>lookup(data?.directory??{},name,value);
 const filterSelect=(name:string,label:string,family:string)=> <ReferenceSelect name={name} label={label} emptyLabel="Todos" options={data?.directory[family]??[]} value={filters[name]??''}/>;
 const paging=()=> <div className="pagination"><button disabled={cursors.length===1} onClick={()=>setCursors(rows=>rows.slice(0,-1))}>Página anterior</button><span>Página {cursors.length}</span><button disabled={!data?.body?.nextCursor} onClick={()=>setCursors(rows=>[...rows,data!.body.nextCursor])}>Página siguiente</button></div>;
 const isList=!id&&family!=='catalogos'||family==='catalogos';
 const equipment=data?.record as Equipment|undefined,employee=data?.record as Employee|undefined;
 return <>
  <div className="title"><div><h1 ref={heading} tabIndex={-1}>{family==='equipos'?'Equipos y relaciones':family==='funcionarios'?'Funcionarios y pertenencias':'Catálogos y organización'}</h1><p>Consulta del nuevo modelo · fechas operativas en UTC</p></div>
   {canWrite&&isList&&family!=='catalogos'&&<a className="button" href={'#modelo/'+family+'/nuevo'}>{family==='equipos'?'Nuevo equipo':'Nuevo funcionario'}</a>}
  </div>
  {restricted?<section className="card"><h2>Acceso restringido</h2><p>No tienes permiso para esta operación.</p><a href={'#modelo/'+family}>Volver al listado</a></section>:!valid?<section className="card"><h2>Vista no disponible</h2><a href="#modelo/equipos">Volver a equipos</a></section>:loading?<p role="status">Cargando equipos y relaciones…</p>:error?<div className="error" role="alert" tabIndex={-1} ref={alert}><p>{error}</p><button onClick={reload}>Volver a consultar</button> <a href="#bienes">Continuar en el inventario actual</a></div>:data&&<>
   {family==='catalogos'&&<section className="card"><label>Catálogo<select aria-label="Catálogo" value={catalog} onChange={e=>location.hash='#modelo/catalogos/'+e.target.value}>{Object.entries(catalogTitles).filter(([key])=>key!=='funcionarios').map(([key,title])=><option key={key} value={key}>{title}</option>)}</select></label></section>}
   {isList&&<>
    <section className="card"><form className="filters" key={family+catalog+JSON.stringify(filters)+filterEpoch} onSubmit={e=>{e.preventDefault();const next=Object.fromEntries([...new FormData(e.currentTarget)].map(([k,v])=>[k,String(v)]).filter(([,v])=>v));if(next.desde&&next.hasta&&next.desde>next.hasta){setFilterError('La fecha inicial debe ser anterior o igual a la final.');return;}setFilterError('');setFilters(next);setCursors([null]);}}>
     {!(family==='catalogos'&&['regiones','delegaciones','departamentos','areas'].includes(catalog))&&<label>Buscar<input type="search" name="q" defaultValue={filters.q??''} maxLength={200}/></label>}
     {family==='equipos'&&<>{filterSelect('tipoRef','Tipo de equipo','tipos-equipo')}{filterSelect('condicionRef','Condición','estados')}{filterSelect('situacionRef','Situación','situaciones')}{filterSelect('funcionarioRef','Custodio','funcionarios')}<label>Custodia<select aria-label="Custodia" name="custodia" defaultValue={filters.custodia??''}><option value="">Todas</option><option value="asignado">Asignado</option><option value="sin-asignar">Sin asignar</option></select></label></>}
     {family==='equipos'&&<>{filterSelect('delegacionRef','Delegación del custodio','delegaciones')}{filterSelect('departamentoRef','Departamento del custodio','departamentos')}{filterSelect('areaRef','Área del custodio','areas')}</>}
     {family==='catalogos'&&catalog==='modelos'&&filterSelect('marcaRef','Marca','marcas')}
     {family==='funcionarios'&&<>{filterSelect('delegacionRef','Delegación','delegaciones')}{filterSelect('departamentoRef','Departamento','departamentos')}{filterSelect('areaRef','Área','areas')}</>}
     {family!=='catalogos'&&<><label>Desde (día UTC)<input name="desde" type="date" defaultValue={filters.desde??''}/></label><label>Hasta (día UTC, inclusive)<input name="hasta" type="date" defaultValue={filters.hasta??''}/></label></>}
     <button>Aplicar filtros</button><button type="button" onClick={()=>{setFilters({});setFilterEpoch(n=>n+1);setFilterError('');setCursors([null]);}}>Limpiar filtros</button>
    </form>{filterError&&<p className="error" role="alert">{filterError}</p>}</section>
    <section className="card">
     {family==='equipos'?<ModelTable caption="Equipos del nuevo modelo" headers={['Código operativo','Tipo','Modelo','Condición','Situación','Custodio']} rows={data.body.items.map((row:Equipment)=>[<a href={'#modelo/equipos/'+row.ref}>{row.codigoOperativo}</a>,refName('tipos-equipo',row.tipoRef),refName('modelos',row.modeloRef),refName('estados',row.condicionRef),refName('situaciones',row.situacionRef),refName('funcionarios',row.custodioRef)])}/>:
      family==='funcionarios'?<ModelTable caption="Funcionarios del nuevo modelo" headers={['Nombre','Cargo','Delegación','Departamento','Área','Activo']} rows={data.body.items.map((row:Employee)=>[<a href={'#modelo/funcionarios/'+row.ref}>{row.nombre}</a>,row.cargo,refName('delegaciones',row.organizacion.delegacionRef),refName('departamentos',row.organizacion.departamentoRef),refName('areas',row.organizacion.areaRef),row.activo?'Sí':'No'])}/>:
      <ModelTable caption={catalogTitles[catalog]} headers={['Nombre',...(catalog==='modelos'?['Marca']:[])]} rows={data.body.items.map((row:any)=>[row.nombre,...(catalog==='modelos'?[refName('marcas',row.marcaRef)]:[])])}/>}
     {paging()}<p>Consulta generada: {instant(data.body.generatedAt)}. Los filtros no reconstruyen un corte histórico.</p>
    </section>
   </>}
   {data.record&&<>
    <div className="actions"><a href={'#modelo/'+family}>Volver al listado</a><button onClick={reload}>Actualizar ficha</button></div>
    {family==='equipos'?<>
     <section className="card"><h2>Ficha de {equipment!.codigoOperativo}</h2><dl>
      {Object.entries({Tipo:refName('tipos-equipo',equipment!.tipoRef),Marca:refName('marcas',data.directory.modelos?.find(row=>row.ref===equipment!.modeloRef)?.marcaRef),Modelo:refName('modelos',equipment!.modeloRef),Condición:refName('estados',equipment!.condicionRef),Situación:refName('situaciones',equipment!.situacionRef),Custodio:refName('funcionarios',equipment!.custodioRef),'Número de serie':equipment!.numeroSerie??'No indicado','Inventario SERVIU':equipment!.inventarioServiu??'No indicado','Inventario MINVU':equipment!.inventarioMinvu??'No indicado','Fecha de adquisición':equipment!.adquisicion??'No indicada'}).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
     </dl>{equipment!.observacion&&<p>{equipment!.observacion}</p>}</section>
     <nav aria-label="Ficha del equipo">
      <a href={'#modelo/equipos/'+id}>Detalle técnico</a><a href={'#modelo/equipos/'+id+'/historia'}>Historia y custodia</a><a href={'#modelo/equipos/'+id+'/mantenciones'}>Mantenciones</a>
      {canWrite&&<>{completeEquipment(equipment!)&&<a href={'#modelo/equipos/'+id+'/editar'}>Editar atributos</a>}<a href={'#modelo/equipos/'+id+'/tecnica'}>Completar técnica</a><a href={'#modelo/equipos/'+id+'/movimiento'}>Registrar movimiento</a><a href={'#modelo/equipos/'+id+'/mantencion-nueva'}>Registrar mantención</a></>}
     </nav>
     {!section&&<TechnicalDetail data={equipment!.tecnica} directory={data.directory}/>}
     {section==='historia'&&<ModelHistory data={data.body} directory={data.directory} cursors={historyCursors} onPage={(kind,next,back)=>setHistoryCursors(old=>({...old,[kind]:back?old[kind].slice(0,-1):[...old[kind],next]}))}/>}
     {section==='mantenciones'&&<section className="card"><h2>Mantenciones del equipo</h2><ModelTable caption="Actividades de mantención" headers={['Actividad','Fecha de actividad','Observación','Registro (UTC)']} rows={data.body.items.map((row:any)=>[refName('actividades-mantencion',row.actividadRef),row.fecha,row.observacion??'No indicada',instant(row.registradoEn)])}/>{paging()}</section>}
    </>:<>
     <section className="card"><h2>Ficha de {employee!.nombre}</h2><dl>{Object.entries({Cargo:employee!.cargo,Delegación:refName('delegaciones',employee!.organizacion.delegacionRef),Departamento:refName('departamentos',employee!.organizacion.departamentoRef),Área:refName('areas',employee!.organizacion.areaRef),Activo:employee!.activo?'Sí':'No'}).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>El funcionario y su cuenta de acceso se gestionan por separado.</p></section>
     <div className="actions"><a href={'#modelo/equipos?funcionarioRef='+employee!.ref}>Consultar equipos del funcionario</a>{canWrite&&<><a href={'#modelo/funcionarios/'+id+'/editar'}>Editar funcionario</a><a href={'#modelo/funcionarios/'+id+'/pertenencia'}>Cambiar pertenencia</a></>}</div>
    </>}
   </>}
   {operation&&<ModelForm key={view+revision} operation={operation} record={data.record} etag={data.etag} directory={data.directory} csrf={csrf} onStart={onStart} onExpired={onExpired} onReload={reload} onSaved={ref=>onSaved(family,ref)}/>}
  </>}
 </>;
}
