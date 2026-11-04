import React from 'react';
import {historicalStart,instant,lookup,type Directory} from './model-data';
export type HistoryKind='asignaciones'|'movimientos'|'anotaciones';
export function ModelTable({caption,headers,rows}:{caption:string;headers:string[];rows:React.ReactNode[][]}) {
 return <div className="table" role="region" aria-label={caption} tabIndex={0}><table><caption>{caption}</caption><thead><tr>{headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
  {rows.length?rows.map((cells,n)=><tr key={n}>{cells.map((cell,i)=><td key={i}>{cell}</td>)}</tr>):<tr><td colSpan={headers.length}>Sin registros para esta selección.</td></tr>}
 </tbody></table></div>;
}
export function ModelHistory({data,directory,cursors,onPage}:{data:any;directory:Directory;cursors:Record<HistoryKind,(string|null)[]>;onPage:(kind:HistoryKind,next:string|null,back?:boolean)=>void}) {
 const paging=(kind:HistoryKind)=><div className="pagination" aria-label={'Paginación de '+kind}>
  <button disabled={cursors[kind].length===1} onClick={()=>onPage(kind,null,true)}>Anterior: {kind}</button>
  <span>Página {cursors[kind].length}</span><button disabled={!data.next[kind]} onClick={()=>onPage(kind,data.next[kind])}>Siguiente: {kind}</button>
 </div>;
 return <section className="card"><h2>Historia del equipo</h2><p>Fechas operativas en UTC. Un día histórico sin hora se conserva como día; las fechas desconocidas siguen indicadas.</p>
  <h3>Custodia vigente</h3><p>{data.vigente?lookup(directory,'funcionarios',data.vigente.funcionarioRef)+' · '+historicalStart(data.vigente):'Sin custodia vigente.'}</p>
  <ModelTable caption="Asignaciones históricas" headers={['Funcionario','Inicio','Fin','Fecha de origen','Vigente']} rows={data.asignaciones.map((row:any)=>[lookup(directory,'funcionarios',row.funcionarioRef),historicalStart(row),row.fin?instant(row.fin):'Sin fin conocido',row.fechaOrigen??'No indicada',row.vigente?'Sí':'No'])}/>
  {paging('asignaciones')}
  <ModelTable caption="Movimientos registrados" headers={['Referencia','Tipo','Origen','Destino','Fecha efectiva (UTC)','Registrado (UTC)','Motivo']} rows={data.movimientos.map((row:any)=>[row.ref,row.tipo,lookup(directory,'funcionarios',row.origenRef),lookup(directory,'funcionarios',row.destinoRef),instant(row.efectivaEn),instant(row.registradaEn),row.motivo])}/>
  {paging('movimientos')}
  <ModelTable caption="Anotaciones inmutables" headers={['Movimiento','Texto','Registro (UTC)']} rows={data.anotaciones.map((row:any)=>[row.movimientoRef,row.texto,instant(row.registradaEn)])}/>
  {paging('anotaciones')}
 </section>;
}
export function TechnicalDetail({data,directory}:{data:Record<string,any>|null|undefined;directory:Directory}) {
 if(!data)return <section className="card"><h2>Información técnica</h2><p>Sin ficha técnica registrada.</p></section>;
 const fields:Record<string,[string,string?]>={nombreRed:['Nombre de red'],esNotebook:['Es notebook'],sistemaOperativoRef:['Sistema operativo','sistemas-operativos'],procesador:['Procesador'],velocidadGhz:['Velocidad (GHz)'],direccionMac:['Dirección MAC'],guid:['GUID'],pulgadas:['Tamaño (pulgadas)'],claseRef:['Clase','clases-impresora'],duplex:['Dúplex'],anchoCarro:['Ancho del carro'],cantidadPuertos:['Puertos']};
 return <section className="card"><h2>Información técnica · {data.subtipo}</h2><dl>{Object.entries(fields).filter(([key])=>key in data).map(([key,[label,family]])=><div key={key}><dt>{label}</dt><dd>{family?lookup(directory,family,data[key]):data[key]===null?'No indicado':typeof data[key]==='boolean'?(data[key]?'Sí':'No'):String(data[key])}</dd></div>)}</dl>
  {data.piezas&&<ModelTable caption="Piezas registradas" headers={['Familia','Capacidad (GB)']} rows={data.piezas.map((row:any)=>[lookup(directory,'familias-componente',row.familiaRef),row.capacidadGb])}/>}
  {data.insumos&&<ModelTable caption="Insumos registrados" headers={['Rubro','Código']} rows={data.insumos.map((row:any)=>[lookup(directory,'rubros-insumo',row.rubroRef),row.codigo])}/>}
 </section>;
}
