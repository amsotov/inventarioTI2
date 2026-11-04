import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {resolve} from 'node:path';
import {mkdirSync,writeFileSync} from 'node:fs';
import {labFixture} from '../helpers/lab.js';

test('Prueba conectada local: interfaz modernizada → BFF → PostgreSQL real, sin transporte demo',async t=>{
 const origin='http://localhost:4327',f=await labFixture(origin,resolve('dist/web'));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({timezoneId:'America/Santiago'}),page=await context.newPage();page.setDefaultTimeout(12000);
 const errors:string[]=[],requests:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.url().includes('/api/v2/'))requests.push(request.method()+' '+new URL(request.url()).pathname);});
 const go=async(hash:string)=>page.goto(origin+'/#'+hash);
 const confirm=async()=>{await page.getByLabel('Motivo de la operación',{exact:false}).fill('Ensayo de navegador con persistencia SQL');await page.getByLabel('Confirmo esta operación',{exact:true}).check();};
 const save=async()=>{await page.getByRole('button',{name:'Guardar operación',exact:true}).click();await page.waitForURL(/#modelo\/(equipos|funcionarios)\/[0-9a-f-]+$/);};
 let created='',person='';
 try {
  await f.server.listen({host:'127.0.0.1',port:4327});
  await context.addCookies([{name:'__Host-inventario',value:f.a.sid,url:origin.replace('http:','https:')+'/',secure:true,httpOnly:true,sameSite:'Strict'}]);
  if(process.env.STAGING_ENTRY_EXPECTED==='true'){await page.goto(origin);await page.getByRole('region',{name:'Equipos del nuevo modelo',exact:true}).waitFor();assert.equal(await page.locator('.model-panel tbody tr').count(),6);assert.equal(await page.getByText('Modo demo',{exact:false}).count(),0);}
  await t.test('catálogos, alta, recarga de página y edición conservan datos SQL',async()=>{
   await go('modelo/equipos/nuevo');await page.getByLabel('Código operativo',{exact:false}).fill('NAVEGADOR-SQL');
   await page.getByLabel('Tipo de equipo',{exact:false}).selectOption(await f.ref('TIPOS_EQUIPO',2));
   await page.getByLabel('Marca para buscar modelo',{exact:true}).selectOption(await f.ref('MARCAS',1));await page.getByLabel('Modelo',{exact:true}).selectOption(await f.ref('MODELOS',1));
   await page.getByLabel('Condición inicial',{exact:false}).selectOption(await f.ref('ESTADOS_EQUIPO',1));
   await page.getByLabel('Motivo si no tiene serie',{exact:true}).fill('Sin serie sintética');await confirm();await save();
   await page.getByRole('heading',{name:'Ficha de NAVEGADOR-SQL',exact:true}).waitFor();created=page.url().split('/').at(-1)!;
   await page.reload();await page.getByRole('heading',{name:'Ficha de NAVEGADOR-SQL',exact:true}).waitFor();
   assert.equal((await f.root.query("select count(*)::int n from laboratorio_ti.equipo_soporte where codigo_operativo='NAVEGADOR-SQL'")).rows[0].n,1);
   await page.getByRole('link',{name:'Editar atributos',exact:true}).click();await page.getByLabel('Código operativo',{exact:false}).fill('NAVEGADOR-SQL-EDITADO');await confirm();await save();
   await page.getByRole('heading',{name:'Ficha de NAVEGADOR-SQL-EDITADO',exact:true}).waitFor();
  });
  await t.test('técnica y componentes permanecen tras recarga',async()=>{
   await page.getByRole('link',{name:'Completar técnica',exact:true}).click();await page.getByLabel('Subtipo técnico',{exact:false}).selectOption('computador');
   await page.getByLabel('Nombre de red',{exact:false}).fill('NB-SQL-BROWSER');await page.getByLabel('Es notebook',{exact:true}).check();
   await page.getByRole('button',{name:'Agregar componente',exact:true}).click();await page.getByLabel('Familia del componente 1',{exact:false}).selectOption(await f.ref('FAMILIAS_COMPONENTE',1));await page.getByLabel('Capacidad en GB 1',{exact:false}).fill('32');
   await confirm();await save();await page.getByRole('region',{name:'Piezas registradas',exact:true}).waitFor();await page.reload();await page.getByText('NB-SQL-BROWSER',{exact:true}).waitFor();
   assert.equal((await f.root.query('select count(*)::int n from laboratorio_ti."PIEZAS_COMPUTADOR"')).rows[0].n,1);
  });
  await t.test('movimiento y mantención producen historia SQL visible',async()=>{
   await page.getByRole('link',{name:'Registrar movimiento',exact:true}).click();await page.getByLabel('Funcionario de destino',{exact:false}).selectOption(await f.ref('FUNCIONARIOS',3));await confirm();await save();
   await page.getByRole('link',{name:'Registrar mantención',exact:true}).click();await page.getByLabel('Actividad de mantención',{exact:true}).selectOption(await f.ref('ACTIVIDADES_MANTENCION',1));await page.getByLabel('Fecha de la actividad *',{exact:true}).fill('2026-11-02');await confirm();await save();
   await page.getByRole('link',{name:'Mantenciones',exact:true}).click();await page.getByRole('region',{name:'Actividades de mantención',exact:true}).waitFor();assert.match(await page.locator('.model-panel').innerText(),/2026-11-02/);
   await page.getByRole('link',{name:'Historia y custodia',exact:true}).click();await page.reload();await page.getByRole('region',{name:'Asignaciones históricas',exact:true}).waitFor();assert.match(await page.locator('.model-panel').innerText(),/Custodio sintético/);
   assert.equal((await f.root.query('select count(*)::int n from laboratorio_ti.movimientos')).rows[0].n,1);
  });
  await t.test('alta, edición privada y cambio de pertenencia de funcionario',async()=>{
   await go('modelo/funcionarios/nuevo');await page.getByLabel('Documento *',{exact:true}).fill('ID-BROWSER-SQL');await page.getByLabel('Nombre completo',{exact:false}).fill('Persona SQL Browser');await page.getByLabel('Cargo',{exact:false}).fill('Analista');
   await page.getByLabel('Delegación',{exact:false}).selectOption(await f.ref('DELEGACIONES',1));await page.getByLabel('Departamento',{exact:false}).selectOption(await f.ref('DEPARTAMENTOS',1));await confirm();await save();
   await page.getByRole('heading',{name:'Ficha de Persona SQL Browser',exact:true}).waitFor();person=page.url().split('/').at(-1)!;
   assert(!/ID-BROWSER-SQL/.test(await page.locator('.model-panel').innerText()));
   await page.getByRole('link',{name:'Editar funcionario',exact:true}).click();await page.getByLabel('Cargo',{exact:false}).fill('Analista actualizado');await confirm();await save();
   await page.getByRole('link',{name:'Cambiar pertenencia',exact:true}).click();await page.getByLabel('Departamento',{exact:false}).selectOption(await f.ref('DEPARTAMENTOS',2));await confirm();await save();
   await page.reload();await page.getByText('Analista actualizado',{exact:true}).waitFor();assert.match(await page.locator('.model-panel').innerText(),/Operaciones de prueba/);
  });
  await t.test('lector ve cambios persistentes y no accede a formularios privados',async()=>{
   const reader=await browser.newContext();const p=await reader.newPage();
   try {
    await reader.addCookies([{name:'__Host-inventario',value:f.r.sid,url:origin.replace('http:','https:')+'/',secure:true,httpOnly:true,sameSite:'Strict'}]);await p.goto(origin+'/#modelo/equipos/'+created);await p.getByRole('heading',{name:'Ficha de NAVEGADOR-SQL-EDITADO',exact:true}).waitFor();
    assert.equal(await p.getByRole('link',{name:'Editar atributos',exact:true}).count(),0);
    await p.goto(origin+'/#modelo/funcionarios/'+person+'/editar');await p.getByRole('heading',{name:'Acceso restringido',exact:true}).waitFor();
   }finally{await reader.close();}
   assert.deepEqual(errors,[]);assert(requests.some(x=>x.startsWith('POST /api/v2/equipos')));assert(requests.some(x=>x.startsWith('PATCH /api/v2/funcionarios')));
  });
  mkdirSync('work/prueba-real',{recursive:true});writeFileSync('work/prueba-real/browser.json',JSON.stringify({scope:'local-browser-real-postgres',identity:'local-test-double; GoTrue covered separately',demo:false,checks:['create-reload-edit','technical-components','movement-maintenance-history','employee-private-organization','reader-permissions'],apiRequests:requests.length,pageErrors:errors.length},null,2)+'\n');
 }finally{await browser.close();await f.close();}
});
