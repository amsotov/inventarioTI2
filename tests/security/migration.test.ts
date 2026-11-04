import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from '../helpers/reports.js';
import {ModelContractDouble,modelRef} from '../helpers/model.js';
import {prepareCommand,type Equipment} from '../../apps/web/src/model-data.js';
import {contract} from '../../apps/server/modernization/contract.js';
import {mkdirSync,writeFileSync} from 'node:fs';
import Fastify from 'fastify';
import {operations} from '../../apps/server/operations.js';
const ref='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

test('M8-F01: traspaso a la misma identidad UUID con distinto caso se rechaza antes del backend',async()=>{
 const backend=new ModelContractDouble(),x=await fixture(undefined,undefined,{modernization:backend});
 try{
  backend.equipment[0].custodioRef=ref;
  const before=backend.calls.length;
  const response=await x.server.inject({method:'POST',url:'/api/v2/equipos/'+modelRef(2000)+'/movimientos',headers:{...x.headers(x.a),'if-match':'"v1"'},payload:{tipo:'traslado',origenEsperadoRef:ref,destinoRef:ref.toUpperCase(),motivo:'Ensayo UUID',confirmado:true}});
  assert.equal(response.statusCode,422,response.body);assert.equal(backend.calls.length,before);
 }finally{await x.close();}
});

test('M8-F01: el formulario tampoco confunde el caso textual con otra identidad UUID',()=>{
 const data=new FormData();for(const [k,v] of Object.entries({tipo:'traslado',destinoRef:ref.toUpperCase(),motivo:'Prueba',confirmacion:'on'}))data.set(k,v);
 const equipment={ref:modelRef(2000),custodioRef:ref} as Equipment;
 assert.throws(()=>prepareCommand('movimiento',data,equipment),/diferente/);
});

test('M8-F02: JSON mal formado se rechaza como petición inválida antes de invocar persistencia',async()=>{
 const backend=new ModelContractDouble(),x=await fixture(undefined,undefined,{modernization:backend});
 try {
  const before=backend.calls.length;
  const response=await x.server.inject({method:'POST',url:'/api/v2/equipos',headers:{...x.headers(x.a),'content-type':'application/json'},payload:'{"motivo":'});
  assert.equal(response.statusCode,400,response.body);assert.equal(response.json().code,'INVALID_REQUEST');assert.equal(backend.calls.length,before);
 }finally{await x.close();}
});

test('M8: matriz adversarial de las 18 rutas, permisos vigentes, privacidad y parsing',async t=>{
 const backend=new ModelContractDouble(),x=await fixture(undefined,undefined,{modernization:backend});
 const pending=await x.auth.login('admin@example.invalid','synthetic');
 const evidence={motivo:'Ensayo sintético de seguridad',confirmado:true};
 const org={delegacionRef:modelRef(20),departamentoRef:modelRef(21),areaRef:null};
 const employee={...evidence,documentoTipo:'ID',documento:'ID-SINTETICO',nombre:'Persona sintética',cargo:'Analista'};
 const payloads:Record<string,object>={
  'C03-03':{...evidence,codigoOperativo:'SEC-01',tipoRef:modelRef(3),modeloRef:modelRef(7),condicionRef:modelRef(9),numeroSerie:'SERIE-SINTETICA'},
  'C03-05':{...evidence,codigoOperativo:'SEC-01',tipoRef:modelRef(3),modeloRef:modelRef(7),numeroSerie:'SERIE-SINTETICA'},
  'C03-06':{...evidence,subtipo:'monitor',pulgadas:24},
  'C03-07':{...evidence,tipo:'traslado',origenEsperadoRef:modelRef(101),destinoRef:modelRef(102)},
  'C03-10':{...evidence,actividadRef:modelRef(31),fecha:'2026-11-03',observacion:null},
  'C03-12':{...employee,organizacion:org},'C03-15':employee,'C03-16':{...evidence,organizacion:org},'C03-17':{...evidence,perfilRefs:[modelRef(1)]}
 };
 const results:{id:string;expected:number;actual:number;estado:string}[]=[];
 const url=(op:typeof contract.operaciones[number])=>op.path.replace(':catalogo','marcas').replace(':ref',modelRef(op.path.includes('/funcionarios/')?101:2000));
 const request=(id:string,session=x.a,changes:Record<string,unknown>={})=>{
  const op=contract.operaciones.find(op=>op.id===id)!;
  return x.server.inject({method:op.method,url:url(op),headers:{...x.headers(session),...((op.headers_obligatorios as readonly string[]).includes('If-Match')?{'if-match':'"v1"'}:{})},...(payloads[id]?{payload:payloads[id]}:{}),...changes} as any);
 };
 let failures=0;
 const check=async(id:string,expected:number,run:()=>Promise<{statusCode:number;body:string}>)=>t.test(id,async()=>{
  const response=await run();results.push({id,expected,actual:response.statusCode,estado:response.statusCode===expected?'APROBADA':'FALLIDA'});
  if(response.statusCode!==expected)failures++;
  assert.equal(response.statusCode,expected,response.body);
 });
 try {
  const before=backend.calls.length;
  for(const op of contract.operaciones) {
   await check(op.id+' sin sesión',401,()=>request(op.id,x.a,{headers:{...x.headers(x.a),cookie:'','if-match':'"v1"'}}));
   await check(op.id+' administrador sin MFA',403,()=>request(op.id,pending));
   if(op.method!=='GET'||op.id==='C03-14')await check(op.id+' lectura sin permiso',403,()=>request(op.id,x.r));
  }
  // Ninguna denegación alcanza el repositorio; el evento usa el actor validado.
  assert.equal(backend.calls.length,before);
  const denied=(await x.root.query('select count(*)::int n from seguridad.eventos where actor_id=$1 and not permitido',['10000000-0000-4000-8000-000000000001'])).rows[0].n;assert(denied>=10);
  await check('CSRF incorrecto',403,()=>request('C03-03',x.a,{headers:{...x.headers(x.a),'x-csrf-token':'forged'}}));
  await check('Origin no autorizado',403,()=>request('C03-03',x.a,{headers:{...x.headers(x.a),origin:'https://otro.example.invalid'}}));
  await check('actor y secreto sobreasignados',400,()=>request('C03-03',x.a,{payload:{...payloads['C03-03'],actorId:ref,USUA_CLAVE_HASH:'CANARY-NEVER-RETURN'}}));
  for(const member of ['__proto__','constructor']){
   const payload=JSON.stringify(payloads['C03-03']).slice(0,-1)+',"'+member+'":{"prototype":{"rol":"administrador"}}}';
   await check('JSON poisoning '+member,400,()=>request('C03-03',x.a,{headers:{...x.headers(x.a),'content-type':'application/json'},payload}));
  }
  assert.equal(({} as any).rol,undefined);
  await check('payload excedido',413,()=>request('C03-03',x.a,{payload:{...payloads['C03-03'],motivo:'X'.repeat(9000)}}));
  await check('media type no admitido',415,()=>request('C03-03',x.a,{headers:{...x.headers(x.a),'content-type':'application/xml'},payload:'<data>CANARY-NEVER-RETURN</data>'}));
  await check('UUID lógico repetido en perfiles',422,()=>request('C03-17',x.a,{payload:{...evidence,perfilRefs:[ref,ref.toUpperCase()]}}));
  await check('capacidad de perfiles no implementada',503,()=>request('C03-17'));
  const queries=["x' OR 1=1--",'%; DROP TABLE inventario.bienes;--'];
  for(const q of queries){const response=await x.server.inject({url:'/api/v1/bienes?q='+encodeURIComponent(q),headers:x.headers(x.r)});assert.equal(response.statusCode,200);assert.equal(response.json().items.length,0);}
  assert.equal((await x.root.query('select count(*)::int n from inventario.bienes')).rows[0].n,32);
  const original=backend.executeAtomic.bind(backend);
  for(const [id,field] of [['C03-04','USUA_CLAVE_HASH'],['C03-13','documento'],['C03-14','FUNC_CLAVE_IMPRESION']] as const){
   backend.executeAtomic=async(ctx,req,transaction)=>({...await original(ctx,req,transaction) as Record<string,unknown>,[field]:'CANARY-NEVER-RETURN'});
   const response=await request(id);assert.equal(response.statusCode,503);assert.equal(response.json().code,'INVALID_MODEL_RESPONSE');assert(!response.body.includes('CANARY'));
  }
  backend.executeAtomic=original;
  // Revocar la autorización local impide consultas/reintentos con una cookie todavía presente.
  await x.root.query('update inventario.cuentas set version_autorizacion=version_autorizacion+1 where id=$1',['10000000-0000-4000-8000-000000000001']);
  await check('versión de autorización revocada',401,()=>request('C03-02',x.r));
  assert.equal(failures,0);
  const output='docs/migracion/evidencias/fase8';mkdirSync(output,{recursive:true});writeFileSync(output+'/matriz_http.json',JSON.stringify({scope:'BFF/Auth/RLS PostgreSQL reales; repositorio v2 DOBLE, no integridad SQL Server',results,aprobadas:results.length,fallidas:failures,extra_assertions:['Evento técnico de denegación','Sin prototype pollution','SQL q parametrizado v1 conserva tablas','Tres proyecciones secretas/privadas rechazadas','Revocación local vigente']},null,2)+'\n');
 }finally{await x.close();}
});

test('M8: identidad de correlación y rutas de logs no proceden de datos del cliente',async()=>{
 const server=Fastify(),lines:string[]=[];operations(server,async()=>{},line=>lines.push(line));server.get('/resource/:ref',async()=>({ok:true}));
 try{await server.inject({url:'/resource/PRIVATE-ROW?q=PRIVATE-QUERY',headers:{'request-id':'PRIVATE-REQUEST-ID','x-request-id':'PRIVATE-OTHER',authorization:'PRIVATE-TOKEN',cookie:'PRIVATE-COOKIE'}});assert.equal(lines.length,1);assert(!lines.join('').includes('PRIVATE'));assert.equal(JSON.parse(lines[0]).route,'/resource/:ref');}
 finally{await server.close();}
});
