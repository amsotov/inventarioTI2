/// <reference path="../../apps/web/src/env.d.ts" />
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modelReadSchemas,equipmentReadFields} from '../../apps/server/modernization/read-contract.js';
import {completeEquipment,prepareCommand,loadDirectory,historicalStart,instant,equipmentEditFields,type Equipment} from '../../apps/web/src/model-data.js';
const ref='20000000-0000-4000-8000-000000000001',other='20000000-0000-4000-8000-000000000002';
const equipment:Equipment={ref,codigoOperativo:'TI-01',tipoRef:ref,modeloRef:ref,condicionRef:ref,situacionRef:null,custodioRef:other,version:'1',origenRef:null,numeroSerie:'SERIE',motivoSinSerie:null,inventarioServiu:null,inventarioMinvu:'MIN-01',adquisicion:'2020-02-29',observacion:'Texto íntegro'};
function form(values:Record<string,string>={}) {const data=new FormData();for(const [k,v] of Object.entries({motivo:'Motivo sintético',confirmacion:'on',...values}))data.set(k,v);return data;}
test('M7-C01: extensión de lectura aditiva, siete atributos y precondición de edición completa',()=>{
 const source=JSON.parse(readFileSync('docs/migracion/03_CONTRATOS_PROPUESTOS.json','utf8')).schemas;
 const amended=modelReadSchemas(source);
 assert.deepEqual(source.EquipoDetalle.required,amended.EquipoDetalle.required);
 assert.deepEqual(equipmentEditFields,equipmentReadFields);assert.equal(equipmentReadFields.length,7);
 for(const key of equipmentReadFields)assert.deepEqual(amended.EquipoDetalle.properties[key],source.EquipoAtributos.properties[key]);
 const partial={...equipment};delete partial.observacion;assert.equal(completeEquipment(partial),false);assert.equal(completeEquipment(equipment),true);
 assert.throws(()=>prepareCommand('equipo-edicion',form(),partial),/ficha completa/);
});
test('M7: payload de atributos explícito, sin marca duplicada ni actor/fechas/versión del formulario',()=>{
 const cmd=prepareCommand('equipo-edicion',form({codigoOperativo:'TI-01',tipoRef:ref,modeloRef:ref,numeroSerie:'SERIE',inventarioMinvu:'MIN-01',adquisicion:'2020-02-29',observacion:'Texto íntegro',marcaFiltro:other,actorId:other,version:'999',situacionRef:other}),equipment);
 assert.equal(cmd.path,'equipos/'+ref);assert.equal(cmd.method,'PATCH');assert.equal(cmd.body.observacion,'Texto íntegro');
 assert.equal(cmd.body.adquisicion,'2020-02-29');for(const key of ['marcaFiltro','actorId','version','situacionRef','efectivaEn'])assert(!Object.hasOwn(cmd.body,key));
 assert.throws(()=>prepareCommand('equipo-alta',form({codigoOperativo:'SIN-SERIE',tipoRef:ref,condicionRef:ref})),/ausencia de serie/);
});
test('M7: traspaso toma origen de la ficha y exige destino diferente, motivo y confirmación',()=>{
 const cmd=prepareCommand('movimiento',form({tipo:'traslado',destinoRef:ref,origenEsperadoRef:ref}),equipment);
 assert.equal(cmd.body.origenEsperadoRef,other);assert.equal(cmd.body.destinoRef,ref);
 assert.throws(()=>prepareCommand('movimiento',form({tipo:'traslado',destinoRef:other}),equipment),/diferente/);
 assert.throws(()=>prepareCommand('movimiento',form({tipo:'baja',confirmacion:''}),equipment),/confirma/);
});
test('M7: precisión decimal, booleanos, componentes nuevos y subtipo existente',()=>{
 const base=form({subtipo:'computador',nombreRed:'EQUIPO',velocidadGhz:'3.25'});
 const cmd=prepareCommand('tecnica',base,equipment,[{familiaRef:ref,capacidadGb:16,actor:'forged'}]);
 assert.equal(cmd.body.velocidadGhz,3.25);assert.equal(cmd.body.esNotebook,false);assert.deepEqual(cmd.body.piezasAgregar,[{familiaRef:ref,capacidadGb:16}]);
 for(const value of ['1e2','100.00','3.125','-1']){base.set('velocidadGhz',value);assert.throws(()=>prepareCommand('tecnica',base,equipment));}
 assert.throws(()=>prepareCommand('tecnica',form({subtipo:'switch',cantidadPuertos:'12'}),{...equipment,tecnica:{subtipo:'monitor'}}),/subtipo existente/);
 const printer=prepareCommand('tecnica',form({subtipo:'impresora',duplex:'',anchoCarro:''}),equipment);assert.equal(printer.body.duplex,null);assert.equal(printer.body.anchoCarro,null);
});
test('M7: catálogo completo por páginas, referencias sin duplicación y cursor repetido falla cerrado',async()=>{
 const paths:string[]=[];
 const data=await loadDirectory(['modelos','modelos'],undefined,async(path:string)=>{paths.push(path);return {body:{items:[paths.length===1?{ref,nombre:'Modelo 1',marcaRef:other}:{ref:other,nombre:'Modelo 2',marcaRef:ref}],nextCursor:paths.length===1?'c-next':null,generatedAt:'2026-11-03T00:00:00Z',timezone:'UTC'},etag:null};});
 assert.equal(data.modelos.length,2);assert.equal(paths.length,2);assert(paths[1].includes('cursor=c-next'));
 await assert.rejects(loadDirectory(['modelos'],undefined,async()=>({body:{items:[],nextCursor:'repetido',timezone:'UTC'},etag:null})),e=>Boolean((e as any).code==='MODEL_REFERENCE_NOT_READY'));
 await assert.rejects(loadDirectory(['__proto__'],undefined,async()=>{throw Error('No debe llamarse');}));
});
test('M7: DATE histórico no se transforma en medianoche y el instante conserva siete decimales',()=>{
 assert.equal(historicalStart({inicio:null,fechaOrigen:'2020-02-29',precisionTemporal:'dia'}),'2020-02-29 · solo día, sin hora conocida');
 assert.equal(historicalStart({inicio:null,fechaOrigen:null,precisionTemporal:'desconocida'}),'Fecha de inicio desconocida');
 assert.equal(instant('2026-11-03T08:15:20.1234567Z'),'2026-11-03 08:15:20.1234567 UTC');
 assert.equal(instant('2026-11-03T05:15:20.1234567-03:00'),'2026-11-03 08:15:20.1234567 UTC');
 assert.equal(instant('2020-02-29'),'Fecha no disponible');
});
