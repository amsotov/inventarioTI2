import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium,type Page} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {fixture} from '../helpers/reports.js';
import {ModelContractDouble,modelRef} from '../helpers/model.js';
import {app} from '../../apps/server/app.js';
import {Inventory} from '../../apps/server/inventory/service.js';
import {postgresInventory} from '../../apps/server/inventory/postgres.js';

test('M7: interfaz React → BFF/Auth/RLS PostgreSQL; repositorio de destino DOBLE',async t=>{
 const origin='http://localhost:4317',backend=new ModelContractDouble(),x=await fixture(origin,resolve('dist/web'),{modernization:backend});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({timezoneId:'America/Santiago'}),page=await context.newPage();page.setDefaultTimeout(10000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.stack??e.message));
 const evidence=resolve('docs/migracion/evidencias/fase7');mkdirSync(evidence,{recursive:true});
 const screenshots:Record<string,unknown>[]=[],audits:unknown[]=[];
 const ready=(p:Page,caption:string)=>p.getByRole('region',{name:caption,exact:true}).waitFor();
 const go=async(hash:string)=>{await page.goto(origin+'/#'+hash);await page.getByText('Cargando equipos y relaciones…',{exact:true}).waitFor({state:'hidden'});};
 const fillConfirmation=async(reason='Ensayo sintético de interfaz')=>{await page.getByLabel('Motivo de la operación',{exact:false}).fill(reason);await page.getByLabel('Confirmo esta operación',{exact:true}).check();};
 const login=async(email:string)=>{await page.getByLabel('Correo',{exact:true}).fill(email);await page.getByLabel('Contraseña',{exact:true}).fill('synthetic');await page.getByRole('button',{name:'Iniciar sesión',exact:true}).click();};
 let created='',createdPerson='';
 const step=async(name:string,work:()=>Promise<void>)=>{let failure:unknown;await t.test(name,async()=>{try{await work();}catch(error){failure=error;mkdirSync('work/fase7',{recursive:true});await page.screenshot({path:'work/fase7/fallo.png',fullPage:true}).catch(()=>{});throw error;}});if(failure)throw failure;};
 try {
  await x.server.listen({host:'127.0.0.1',port:4317});await page.goto(origin);
  await login('reader@example.invalid');
  await step('lectura: relaciones legibles, paginación, filtros y reinicio de cursor',async()=>{
   let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
   await page.route('**/api/v2/equipos?*',async route=>{await gate;await route.continue();});
   await page.getByRole('link',{name:'Equipos y relaciones',exact:true}).click();await page.getByText('Cargando equipos y relaciones…',{exact:true}).waitFor();assert.equal(await page.locator('.model-panel tbody tr').count(),0);release();await ready(page,'Equipos del nuevo modelo');await page.unroute('**/api/v2/equipos?*');
   assert.equal(await page.locator('.model-panel tbody tr').count(),25);
   assert.match(await page.locator('.model-panel').innerText(),/Marca|Modelo Norte/);
   assert.equal(await page.getByRole('link',{name:'Nuevo equipo',exact:true}).count(),0);
   await page.getByRole('button',{name:'Página siguiente',exact:true}).click();await page.getByText('MODELO-031',{exact:true}).waitFor();
   assert.equal(await page.locator('.model-panel tbody tr').count(),6);
   await page.getByLabel('Buscar',{exact:true}).fill('MODELO-001');await page.getByRole('button',{name:'Aplicar filtros',exact:true}).click();
   await page.getByText('MODELO-001',{exact:true}).waitFor();assert.equal(await page.locator('.model-panel tbody tr').count(),1);
   const last=backend.calls.filter(c=>c.request.operation==='C03-02').at(-1)!;assert.equal(last.request.query.cursor,undefined);assert.equal(last.request.query.q,'MODELO-001');
   await page.getByLabel('Buscar',{exact:true}).fill('no-existe');await page.getByRole('button',{name:'Aplicar filtros',exact:true}).click();await page.getByText('Sin registros para esta selección.',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Limpiar filtros',exact:true}).click();await page.getByText('MODELO-001',{exact:true}).waitFor();
   await page.getByLabel('Desde (día UTC)',{exact:true}).fill('2026-11-03');await page.getByLabel('Hasta (día UTC, inclusive)',{exact:true}).fill('2026-01-01');await page.getByRole('button',{name:'Aplicar filtros',exact:true}).click();
   await page.getByRole('alert').filter({hasText:'La fecha inicial'}).waitFor();assert.equal(await page.getByLabel('Desde (día UTC)',{exact:true}).inputValue(),'2026-11-03');
  });
  await step('lectura: escrituras directas y edición privada denegadas por servidor, sin DTO personales',async()=>{
   await go('modelo/equipos/nuevo');await page.getByRole('heading',{name:'Acceso restringido',exact:true}).waitFor();
   await go('modelo/funcionarios/'+modelRef(101)+'/editar');await page.getByRole('heading',{name:'Acceso restringido',exact:true}).waitFor();
   assert(!backend.calls.some(c=>c.request.operation==='C03-14'));
   const response=await x.server.inject({method:'POST',url:'/api/v2/equipos',headers:x.headers(x.r),payload:{codigoOperativo:'FORGED',tipoRef:modelRef(3),modeloRef:null,condicionRef:modelRef(9),motivoSinSerie:'Sintética',motivo:'Prueba',confirmado:true}});assert.equal(response.statusCode,403);
   const privateRead=await x.server.inject({url:'/api/v2/funcionarios/'+modelRef(101)+'/edicion',headers:x.headers(x.r)});assert.equal(privateRead.statusCode,403);
   await go('modelo/funcionarios');await ready(page,'Funcionarios del nuevo modelo');assert(!/ID-PRIVADO|privado0@/.test(await page.locator('main').innerText()));
   await page.getByRole('link',{name:'Ángela Sintética',exact:true}).click();await page.getByRole('link',{name:'Consultar equipos del funcionario',exact:true}).click();await ready(page,'Equipos del nuevo modelo');
   assert.equal(backend.calls.filter(c=>c.request.operation==='C03-02').at(-1)!.request.query.funcionarioRef,modelRef(101));
  });
  await step('historia: DATE sin hora, instantes UTC completos, colecciones paginadas y texto escapado',async()=>{
   await go('modelo/equipos/'+modelRef(2000));await page.getByRole('heading',{name:'Información técnica · computador',exact:true}).waitFor();
   assert.match(await page.locator('main').innerText(),/<img src=x/);assert.equal(await page.locator('.model-panel img').count(),0);
   await page.getByRole('link',{name:'Historia y custodia',exact:true}).click();await ready(page,'Asignaciones históricas');
   assert.match(await page.locator('.model-panel').innerText(),/2020-02-29 · solo día, sin hora conocida/);
   assert.match(await page.locator('.model-panel').innerText(),/10:15:20.1234567 UTC/);assert.equal(await page.locator('.model-panel b').count(),0);
   await page.getByRole('button',{name:'Siguiente: movimientos',exact:true}).click();await page.getByRole('region',{name:'Movimientos registrados',exact:true}).getByText('Sin registros para esta selección.').waitFor();
   const last=backend.calls.filter(c=>c.request.operation==='C03-08').at(-1)!.request.query;assert.equal(last.movimientosCursor,'mov-next');assert.equal(last.asignacionesCursor,undefined);
   await page.getByRole('button',{name:'Anterior: movimientos',exact:true}).click();await page.getByText('Movimiento sintético',{exact:true}).waitFor();
  });
  await step('mantenciones y catálogos organizativos conservan fecha declarada y nombres entre páginas',async()=>{
   await page.getByRole('link',{name:'Mantenciones',exact:true}).click();await ready(page,'Actividades de mantención');assert.match(await page.locator('main').innerText(),/2026-10-01/);
   await go('modelo/catalogos/modelos');await ready(page,'Modelos');await page.getByRole('cell',{name:'Marca Norte',exact:true}).waitFor();
   await page.getByRole('button',{name:'Página siguiente',exact:true}).click();await page.getByRole('cell',{name:'Marca Sur',exact:true}).waitFor();
   await page.getByLabel('Catálogo',{exact:true}).selectOption('delegaciones');await ready(page,'Delegaciones');assert.match(await page.locator('main').innerText(),/Delegación Norte/);
  });
  await step('reportes existentes conservan su origen y datos reales PostgreSQL del fixture',async()=>{
   await page.getByRole('link',{name:'Reportes del inventario actual',exact:true}).click();await page.getByText('Total filtrado: 32',{exact:false}).waitFor();
   assert.equal(await page.getByLabel('Tipo de reporte',{exact:true}).locator('option[value=auditoria]').count(),0);
  });
  await step('administrador exige MFA antes de cargar los nuevos formularios',async()=>{
   await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await login('admin@example.invalid');
   await page.getByRole('heading',{name:'Verificación de administrador',exact:true}).waitFor();
   await page.evaluate(()=>location.hash='#modelo/equipos/nuevo');assert.equal(await page.getByRole('heading',{name:'Nuevo equipo',exact:true}).count(),0);
   await page.getByRole('button',{name:'Configurar autenticador',exact:true}).click();await page.getByLabel('Código de seis dígitos',{exact:true}).fill('123456');await page.getByRole('button',{name:'Verificar',exact:true}).click();
   await page.getByRole('heading',{name:'Nuevo equipo',exact:true}).waitFor();
  });
  await step('alta: marca filtra modelos, limpia selección y no viaja duplicada al comando',async()=>{
   await page.getByLabel('Código operativo',{exact:false}).fill('UI-NUEVO');
   await page.getByLabel('Tipo de equipo',{exact:false}).selectOption(modelRef(3));
   await page.getByLabel('Marca para buscar modelo',{exact:true}).selectOption(modelRef(1));await page.getByLabel('Modelo',{exact:true}).selectOption(modelRef(7));
   await page.getByLabel('Marca para buscar modelo',{exact:true}).selectOption(modelRef(2));assert.equal(await page.getByLabel('Modelo',{exact:true}).inputValue(),'');
   assert.equal(await page.getByLabel('Modelo',{exact:true}).locator('option[value="'+modelRef(7)+'"]').count(),0);
   await page.getByLabel('Marca para buscar modelo',{exact:true}).selectOption(modelRef(1));await page.getByLabel('Modelo',{exact:true}).selectOption(modelRef(7));
   await page.getByLabel('Condición inicial',{exact:false}).selectOption(modelRef(9));await page.getByLabel('Motivo si no tiene serie',{exact:true}).fill('Sin serie verificable');
   await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de UI-NUEVO',exact:true}).waitFor();
   created=backend.writes.at(-1)!.body.codigoOperativo==='UI-NUEVO'?backend.equipment.at(-1)!.ref:'';assert(created);
   assert(!Object.hasOwn(backend.writes.at(-1)!.body,'marcaFiltro'));assert.equal(backend.writes.at(-1)!.expectedVersion,undefined);
   assert.match(await page.locator('.success').innerText(),/aviso quedó pendiente/);
  });
  await step('técnica: componentes por filas y booleanos/números tipados, después del alta común',async()=>{
   await page.getByRole('link',{name:'Completar técnica',exact:true}).click();await page.getByLabel('Subtipo técnico',{exact:false}).selectOption('computador');
   await page.getByLabel('Nombre de red',{exact:false}).fill('UI-RED');await page.getByLabel('Es notebook',{exact:true}).check();
   await page.getByLabel('Sistema operativo',{exact:true}).selectOption(modelRef(25));await page.getByLabel('Velocidad (GHz)',{exact:true}).fill('3.25');
   await page.getByRole('button',{name:'Agregar componente',exact:true}).click();await page.getByLabel('Familia del componente 1',{exact:false}).selectOption(modelRef(27));await page.getByLabel('Capacidad en GB 1',{exact:false}).fill('16');
   await page.getByRole('button',{name:'Agregar componente',exact:true}).click();await page.getByLabel('Familia del componente 2',{exact:false}).selectOption(modelRef(28));await page.getByLabel('Capacidad en GB 2',{exact:false}).fill('512');
   await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await ready(page,'Piezas registradas');
   const cmd=backend.writes.at(-1)!;assert.equal(cmd.operation,'C03-06');assert.equal(cmd.expectedVersion,'1');assert.equal(cmd.body.esNotebook,true);assert.equal(cmd.body.velocidadGhz,3.25);
   assert.deepEqual(cmd.body.piezasAgregar,[{familiaRef:modelRef(27),capacidadGb:16},{familiaRef:modelRef(28),capacidadGb:512}]);
  });
  await step('monitor, impresora y switch conservan su subtipo y usan valores tipados',async()=>{
   for(const [index,type] of [[2001,'monitor'],[2002,'impresora'],[2003,'switch']] as const) {
    await go('modelo/equipos/'+modelRef(index)+'/tecnica');await page.getByLabel('Subtipo técnico',{exact:true}).waitFor();
    assert.equal(await page.getByLabel('Subtipo técnico',{exact:true}).inputValue(),type);assert.equal(await page.getByLabel('Subtipo técnico',{exact:true}).locator('option').count(),2);
    if(type==='monitor')await page.getByLabel('Tamaño (pulgadas)',{exact:true}).fill('27.5');
    if(type==='switch')await page.getByLabel('Cantidad de puertos',{exact:false}).fill('48');
    if(type==='impresora'){
     await page.getByLabel('Dúplex',{exact:true}).selectOption('no');await page.getByRole('button',{name:'Agregar insumo',exact:true}).click();await page.getByLabel('Rubro del insumo 1',{exact:false}).selectOption(modelRef(29));await page.getByLabel('Código del insumo 1',{exact:false}).fill('TN-UI');
    }
    await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/equipos\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Información técnica · '+type,exact:true}).waitFor();
    const body=backend.writes.at(-1)!.body;if(type==='monitor')assert.equal(body.pulgadas,27.5);if(type==='switch')assert.equal(body.cantidadPuertos,48);if(type==='impresora'){assert.equal(body.duplex,false);assert.deepEqual(body.insumosAgregar,[{rubroRef:modelRef(29),codigo:'TN-UI'}]);assert.equal(backend.equipment.find(row=>row.ref===modelRef(index))!.tecnica!.insumos.length,2);}
   }
   await go('modelo/equipos/'+created);await page.getByRole('heading',{name:'Ficha de UI-NUEVO',exact:true}).waitFor();
  });
  await step('conflicto 412 conserva campos, exige recarga explícita y nueva versión',async()=>{
   await page.getByRole('link',{name:'Editar atributos',exact:true}).click();await page.getByLabel('Código operativo',{exact:false}).fill('UI-EDITADO');await fillConfirmation();backend.nextConflict=true;
   await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.getByRole('button',{name:'Recargar datos y revisar',exact:true}).waitFor();
   assert.equal(await page.getByLabel('Código operativo',{exact:false}).inputValue(),'UI-EDITADO');assert(await page.getByRole('button',{name:'Guardar operación',exact:true}).isDisabled());
   await page.getByRole('button',{name:'Recargar datos y revisar',exact:true}).click();await page.getByLabel('Código operativo',{exact:false}).waitFor();
   assert.equal(await page.getByLabel('Código operativo',{exact:false}).inputValue(),'UI-NUEVO');
   await page.getByLabel('Código operativo',{exact:false}).fill('UI-EDITADO');await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de UI-EDITADO',exact:true}).waitFor();assert.equal(backend.writes.at(-1)!.expectedVersion,'3');
  });
  await step('respuesta perdida: misma clave/carga/versión, navegación bloqueada y un resultado del doble',async()=>{
   await page.getByRole('link',{name:'Registrar movimiento',exact:true}).click();await page.getByLabel('Funcionario de destino',{exact:false}).selectOption(modelRef(101));await fillConfirmation();
   let lost=true;const requests:{key:string;version:string;body:string}[]=[];
   await page.route('**/api/v2/equipos/'+created+'/movimientos',async route=>{
    requests.push({key:route.request().headers()['idempotency-key'],version:route.request().headers()['if-match'],body:route.request().postData()!});
    if(lost){lost=false;await route.fetch();await route.abort('failed');}else await route.continue();
   });
   await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.getByRole('heading',{name:'Resultado pendiente de confirmar',exact:true}).waitFor();
   await page.getByRole('link',{name:'Resumen',exact:true}).click();assert(page.url().endsWith('/movimiento'));
   await page.evaluate(()=>location.hash='#reportes');await page.waitForFunction(()=>location.hash.endsWith('/movimiento'));
   await page.getByRole('button',{name:'Reintentar misma operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de UI-EDITADO',exact:true}).waitFor();
   assert.equal(requests.length,2);assert.deepEqual(requests[0],requests[1]);assert.equal(backend.writes.filter(row=>row.operation==='C03-07').length,1);
   await page.unroute('**/api/v2/equipos/'+created+'/movimientos');
   await page.getByRole('link',{name:'Registrar movimiento',exact:true}).click();await page.getByLabel('Funcionario de destino',{exact:false}).selectOption(modelRef(102));await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de UI-EDITADO',exact:true}).waitFor();
   assert.equal(backend.writes.at(-1)!.body.origenEsperadoRef,modelRef(101));assert.equal(backend.writes.at(-1)!.body.destinoRef,modelRef(102));
  });
  await step('mantención conserva fecha de actividad y registro UTC separados',async()=>{
   await page.getByRole('link',{name:'Registrar mantención',exact:true}).click();await page.getByLabel('Actividad de mantención',{exact:false}).selectOption(modelRef(31));await page.getByLabel('Fecha de la actividad',{exact:false}).fill('2026-10-02');await page.getByLabel('Observación de mantención',{exact:true}).fill('Limpieza sintética');await fillConfirmation();
   await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de UI-EDITADO',exact:true}).waitFor();await page.getByRole('link',{name:'Mantenciones',exact:true}).click();await ready(page,'Actividades de mantención');
   assert.match(await page.locator('.model-panel').innerText(),/2026-10-02/);assert.match(await page.locator('.model-panel').innerText(),/10:15:20.1234567 UTC/);
  });
  await step('funcionario, edición privada y pertenencia no alteran la custodia del equipo',async()=>{
   await go('modelo/funcionarios/nuevo');
   await page.getByLabel('Documento *',{exact:true}).fill('ID-UI');await page.getByLabel('Nombre completo',{exact:false}).fill('Persona UI');await page.getByLabel('Cargo',{exact:false}).fill('Analista UI');await page.getByLabel('Correo',{exact:true}).fill('persona-ui@example.invalid');
   await page.getByLabel('Delegación',{exact:false}).selectOption(modelRef(20));await page.getByLabel('Departamento',{exact:false}).selectOption(modelRef(21));await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de Persona UI',exact:true}).waitFor();createdPerson=backend.people.at(-1)!.ref;
   assert(!/persona-ui@|ID-UI/.test(await page.locator('.model-panel').innerText()));
   await page.getByRole('link',{name:'Editar funcionario',exact:true}).click();await page.getByLabel('Correo',{exact:true}).waitFor();assert.equal(await page.getByLabel('Correo',{exact:true}).inputValue(),'persona-ui@example.invalid');
   await page.getByLabel('Cargo',{exact:false}).fill('Cargo actualizado');await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de Persona UI',exact:true}).waitFor();
   const owner=backend.equipment.find(row=>row.ref===created)!.custodioRef;await page.getByRole('link',{name:'Cambiar pertenencia',exact:true}).click();await page.getByLabel('Delegación',{exact:false}).selectOption(modelRef(40));await fillConfirmation();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de Persona UI',exact:true}).waitFor();assert.equal(backend.equipment.find(row=>row.ref===created)!.custodioRef,owner);
   assert.equal(backend.writes.at(-1)!.operation,'C03-16');assert(!Object.hasOwn(backend.writes.at(-1)!.body,'custodioRef'));
  });
  await step('operación sin capacidad conserva datos, desbloquea navegación y no muestra éxito',async()=>{
   await go('modelo/equipos/'+created+'/editar');await page.getByLabel('Código operativo',{exact:false}).fill('CONSERVAR-BORRADOR');await fillConfirmation();backend.nextUnavailable=true;
   await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.getByRole('alert').filter({hasText:'todavía no está habilitada'}).waitFor();assert.equal(await page.getByLabel('Código operativo',{exact:false}).inputValue(),'CONSERVAR-BORRADOR');assert.equal(await page.getByRole('heading',{name:'Resultado pendiente de confirmar',exact:true}).count(),0);assert.equal(await page.locator('.model-panel .success').count(),0);
   await page.getByRole('link',{name:'Equipos del nuevo modelo',exact:true}).click();await ready(page,'Equipos del nuevo modelo');
  });
  await step('ficha parcial no habilita edición que borraría atributos desconocidos',async()=>{
   backend.omitEditFields=true;await go('modelo/equipos/'+created);await page.waitForURL(/#modelo\/(?:equipos|funcionarios)\/[0-9a-f-]+$/);await page.getByRole('heading',{name:'Ficha de UI-EDITADO',exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:'Editar atributos',exact:true}).count(),0);
   await go('modelo/equipos/'+created+'/editar');await page.getByText('La edición de atributos todavía no está disponible para esta ficha.',{exact:true}).waitFor();assert(await page.getByRole('button',{name:'Guardar operación',exact:true}).isDisabled());backend.omitEditFields=false;
  });
  await step('vista no habilitada en BFF predeterminado ofrece volver al inventario actual',async()=>{
   const legacy=app(x.auth,'http://localhost:4318',new Inventory(postgresInventory(x.security)),resolve('dist/web'),x.security);
   const c=await browser.newContext();const p=await c.newPage();
   try{await legacy.listen({host:'127.0.0.1',port:4318});await p.goto('http://localhost:4318/#modelo/equipos');await p.getByLabel('Correo',{exact:true}).fill('reader@example.invalid');await p.getByLabel('Contraseña',{exact:true}).fill('synthetic');await p.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await p.getByRole('alert').filter({hasText:'Este módulo todavía no está habilitado'}).waitFor();await p.getByRole('link',{name:'Continuar en el inventario actual',exact:true}).click();await p.getByRole('heading',{name:'Bienes',exact:true}).waitFor();}
   finally{await c.close();await legacy.close();}
  });
  await step('computador/tablet/móvil, ambos roles, foco/teclado, capturas y axe',async()=>{
   const rcontext=await browser.newContext({timezoneId:'America/Santiago'});const rpage=await rcontext.newPage();rpage.on('pageerror',e=>errors.push(e.stack??e.message));await rpage.goto(origin);await rpage.getByLabel('Correo',{exact:true}).fill('reader@example.invalid');await rpage.getByLabel('Contraseña',{exact:true}).fill('synthetic');await rpage.getByRole('button',{name:'Iniciar sesión',exact:true}).click();await rpage.getByRole('button',{name:'Cerrar sesión',exact:true}).waitFor();
   try{
    for(const [role,p] of [['administrador',page],['lectura',rpage]] as const)for(const width of [1440,768,390]) {
     await p.setViewportSize({width,height:900});const hash=width===1440?'modelo/equipos':width===768?(role==='administrador'?'modelo/equipos/'+modelRef(2002)+'/tecnica':'modelo/equipos/'+modelRef(2000)+'/historia'):(role==='administrador'?'modelo/funcionarios/nuevo':'modelo/equipos/'+modelRef(2000)+'/historia');
     await p.goto(origin+'/#'+hash);await p.locator('.model-panel .card').first().waitFor();await p.getByText('Cargando equipos y relaciones…',{exact:true}).waitFor({state:'hidden'});
     assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),role+' '+width+' sin desborde global');
     await p.getByRole('link',{name:'Saltar al contenido',exact:true}).focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#contenido').evaluate(e=>e===document.activeElement),true);
     const regions=p.getByRole('region');if(await regions.count()){const table=p.locator('.model-panel .table').first();if(await table.count()){await table.focus();await p.keyboard.press('ArrowRight');}}
     await p.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);document.querySelectorAll('.model-panel .table').forEach(el=>el.scrollLeft=0);});
     const filename=width+'-'+role+'.png',path=resolve(evidence,filename);await p.screenshot({path,fullPage:true});screenshots.push({role,width,height:900,hash,path:'docs/migracion/evidencias/fase7/'+filename,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')});
    }
    for(const [role,auditPage] of [['lectura',rpage],['administrador',page]] as const) {
     await auditPage.route('**/assets/axe-audit.js',route=>route.fulfill({contentType:'application/javascript',body:readFileSync('node_modules/axe-core/axe.min.js','utf8')}));await auditPage.addScriptTag({url:origin+'/assets/axe-audit.js'});
     const result=await auditPage.evaluate(async()=>{const axe=(window as any).axe;const result=await axe.run(document.querySelector('.model-panel'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {violations:result.violations.map((v:any)=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),passes:result.passes.length};});
     audits.push({scope:'panel modelo, '+role+' móvil; WCAG2A/AA/2.1AA automático',...result});assert.deepEqual(result.violations,[]);
    }
   }finally{await rcontext.close();}
  });
  assert.deepEqual(errors,[]);
  writeFileSync(resolve(evidence,'navegador.json'),JSON.stringify({resultado:'APROBADA',alcance:'React real + BFF/Auth/RLS/HTTP PostgreSQL local; persistencia v2 DOBLE, no SQL Server ni Supabase Auth gestionado',viewport:'emulación Chromium; no dispositivos físicos/Safari/lector de pantalla',screenshots,audits,errores_javascript:errors,comandos_del_doble:backend.writes.length,operaciones_v2_observadas:[...new Set(backend.calls.map(c=>c.request.operation))].sort(),nuevo_equipo:created,nuevo_funcionario:createdPerson},null,2)+'\n');
 }finally{await context.close();await browser.close();await x.close();}
});
