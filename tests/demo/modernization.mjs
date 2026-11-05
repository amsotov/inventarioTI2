import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';

let server;
let url=process.env.DEMO_URL;
if(!url){
 const subdir=process.env.DEMO_TEST_SUBDIR||'';
 if(!['','demo'].includes(subdir))throw Error('INVALID_DEMO_SUBDIR');
 const root=resolve('dist/web',subdir),prefix='/inventarioTI2/'+(subdir?subdir+'/':'');
 server=createServer(async(req,res)=>{
  try{
   const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(req.method!=='GET'||!path.startsWith(prefix)){res.writeHead(404).end();return;}
   const file=resolve(root,path.slice(prefix.length)+(path.endsWith('/')?'index.html':''));
   if(!file.startsWith(root+sep)){res.writeHead(404).end();return;}
   const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
   const data=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file)]??'application/octet-stream'}).end(data);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port+prefix;
}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
const page=await browser.newPage(),unexpected=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{const u=new URL(r.url());if(u.origin!==new URL(url).origin||/^\/api\//.test(u.pathname))unexpected.push(r.url());});
const table=name=>page.getByRole('table',{name,exact:true});
const go=async hash=>{await page.evaluate(hash=>{location.hash='#'+hash;},hash);};
const save=async()=>{await page.getByLabel('Motivo de la operación',{exact:false}).fill('Recorrido ficticio de modernización');await page.getByLabel('Confirmo esta operación',{exact:true}).check();await page.getByRole('button',{name:'Guardar operación',exact:true}).click();};
try{
 const response=await page.goto(url);assert.equal(response.status(),200);
 await expect(page.getByRole('heading',{name:'Equipos y relaciones',exact:true})).toBeVisible();
 await expect(page.getByText('Modernización interactiva · sin conexión a bases de datos.',{exact:true})).toBeVisible();
 await expect(table('Equipos del nuevo modelo')).toContainText('MOD-DEMO-001');
 await expect(page.getByRole('heading',{name:'Bienes',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Página siguiente',exact:true}).click();await expect(table('Equipos del nuevo modelo')).toContainText('MOD-DEMO-029');
 await page.getByLabel('Buscar',{exact:true}).fill('MOD-DEMO-002');await page.getByRole('button',{name:'Aplicar filtros',exact:true}).click();await expect(table('Equipos del nuevo modelo')).toContainText('MOD-DEMO-002');
 await expect(table('Equipos del nuevo modelo').locator('tbody tr')).toHaveCount(1);
 await page.getByRole('button',{name:'Limpiar filtros',exact:true}).click();await expect(table('Equipos del nuevo modelo')).toContainText('MOD-DEMO-001');
 const details=[];for(const [code,subtype] of [['MOD-DEMO-002','monitor'],['MOD-DEMO-003','impresora'],['MOD-DEMO-004','switch']])details.push([await page.getByRole('link',{name:code,exact:true}).getAttribute('href'),subtype]);
 for(const [href,subtype] of details){await go(href.slice(1));await expect(page.getByRole('heading',{name:'Información técnica · '+subtype,exact:true})).toBeVisible();}
 await go('modelo/equipos');await page.getByRole('link',{name:'MOD-DEMO-001',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Información técnica · computador',exact:true})).toBeVisible();await expect(table('Piezas registradas')).toContainText('512');
 await page.getByRole('link',{name:'Historia y custodia',exact:true}).click();await expect(table('Asignaciones históricas')).toContainText('2024-06-03 · solo día, sin hora conocida');
 await page.getByRole('link',{name:'Mantenciones',exact:true}).click();await expect(table('Actividades de mantención')).toContainText('Limpieza preventiva');
 await page.getByRole('link',{name:'Catálogos y organización',exact:true}).click();await page.getByLabel('Catálogo',{exact:true}).selectOption('modelos');await expect(table('Modelos')).toContainText('Marca Demo Norte');
 await page.getByLabel('Catálogo',{exact:true}).selectOption('delegaciones');await expect(table('Delegaciones')).toContainText('Delegación Demo Sur');
 await page.getByRole('link',{name:'Funcionarios y pertenencias',exact:true}).click();await page.getByRole('link',{name:'Nuevo funcionario',exact:true}).click();
 for(const [label,value] of [['Documento','DEMO-MODERNO-PRUEBA'],['Nombre completo','Persona Demo Nueva'],['Cargo','Analista de prueba']])await page.getByRole('textbox',{name:new RegExp('^'+label)}).fill(value);
 await page.getByLabel('Delegación',{exact:true}).selectOption({label:'Delegación Demo Norte'});await page.getByLabel('Departamento',{exact:true}).selectOption({label:'Tecnologías'});await page.getByLabel('Área',{exact:true}).selectOption({label:'Soporte'});await save();
 await expect(page.getByRole('heading',{name:'Ficha de Persona Demo Nueva',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Cambiar pertenencia',exact:true}).click();await page.getByLabel('Delegación',{exact:true}).selectOption({label:'Delegación Demo Sur'});await page.getByLabel('Departamento',{exact:true}).selectOption({label:'Administración'});await page.getByLabel('Área',{exact:true}).selectOption({label:'Operaciones'});await save();
 await expect(page.locator('.model-panel dl').first()).toContainText('Delegación Demo Sur');
 await page.getByRole('link',{name:'Equipos del nuevo modelo',exact:true}).click();await page.getByRole('link',{name:'Nuevo equipo',exact:true}).click();
 await page.getByLabel('Código operativo',{exact:false}).fill('DEMO-MODERNO-NUEVO');await page.getByLabel('Tipo de equipo',{exact:true}).selectOption({label:'Notebook'});await page.getByLabel('Marca para buscar modelo',{exact:true}).selectOption({label:'Marca Demo Norte'});await page.getByLabel('Modelo',{exact:true}).selectOption({label:'Portátil Demo'});await page.getByLabel('Condición inicial',{exact:true}).selectOption({label:'Bueno'});await page.getByLabel('Número de serie',{exact:true}).fill('SERIE-FICTICIA-NUEVA');await save();
 await expect(page.getByRole('heading',{name:'Ficha de DEMO-MODERNO-NUEVO',exact:true})).toBeVisible();const created=new URL(page.url()).hash.split('/').at(-1);assert.match(created,/^[0-9a-f-]{36}$/);
 await page.getByRole('link',{name:'Completar técnica',exact:true}).click();await page.getByLabel('Subtipo técnico',{exact:true}).selectOption('computador');await page.getByLabel('Nombre de red',{exact:false}).fill('DEMO-NUEVO-PC');await page.getByLabel('Es notebook',{exact:true}).check();await page.getByRole('button',{name:'Agregar componente',exact:true}).click();await page.getByLabel('Familia del componente 1',{exact:true}).selectOption({label:'Memoria RAM'});await page.getByLabel('Capacidad en GB 1',{exact:false}).fill('32');await save();
 await expect(table('Piezas registradas')).toContainText('32');
 await page.getByRole('link',{name:'Editar atributos',exact:true}).click();await page.getByLabel('Código operativo',{exact:false}).fill('DEMO-MODERNO-EDITADO');await page.getByLabel('Observación',{exact:true}).fill('<img src=x onerror=window.demo_xss=1>');await save();await expect(page.getByRole('heading',{name:'Ficha de DEMO-MODERNO-EDITADO',exact:true})).toBeVisible();assert.equal(await page.locator('.model-panel img').count(),0);assert.equal(await page.evaluate(()=>window.demo_xss),undefined);
 await page.getByRole('link',{name:'Registrar movimiento',exact:true}).click();await page.getByLabel('Funcionario de destino',{exact:true}).selectOption({label:'Persona Demo Nueva'});await save();await expect(page.locator('.model-panel dl').first()).toContainText('Persona Demo Nueva');
 await page.getByRole('link',{name:'Registrar movimiento',exact:true}).click();await page.getByLabel('Tipo de movimiento',{exact:true}).selectOption('traslado');await page.getByLabel('Funcionario de destino',{exact:true}).selectOption({label:'Persona Demo Beta'});await save();await expect(page.locator('.model-panel dl').first()).toContainText('Persona Demo Beta');
 await page.getByRole('link',{name:'Historia y custodia',exact:true}).click();await expect(table('Asignaciones históricas').locator('tbody tr')).toHaveCount(2);await expect(table('Movimientos registrados')).toContainText('traslado');
 await page.getByRole('link',{name:'Registrar mantención',exact:true}).click();await page.getByLabel('Actividad de mantención',{exact:true}).selectOption({label:'Revisión técnica'});await page.getByLabel('Fecha de la actividad',{exact:false}).fill('2026-11-03');await page.getByLabel('Observación de mantención',{exact:true}).fill('Mantenimiento ficticio');await save();await page.getByRole('link',{name:'Mantenciones',exact:true}).click();await expect(table('Actividades de mantención')).toContainText('Mantenimiento ficticio');
 await expect(page.locator('.success[role=status]')).toContainText('No se envió ningún correo');
 await page.getByLabel('Rol demo',{exact:true}).selectOption('lectura');await expect(page.getByRole('link',{name:'Registrar mantención',exact:true})).toHaveCount(0);await go('modelo/equipos/nuevo');await expect(page.getByRole('heading',{name:'Acceso restringido',exact:true})).toBeVisible();
 await page.reload();await go('modelo/equipos');await expect(table('Equipos del nuevo modelo')).toContainText('MOD-DEMO-001');await expect(page.getByLabel('Rol demo',{exact:true})).toHaveValue('administrador');await page.getByLabel('Buscar',{exact:true}).fill('DEMO-MODERNO-EDITADO');await page.getByRole('button',{name:'Aplicar filtros',exact:true}).click();await expect(table('Equipos del nuevo modelo')).toContainText('Sin registros para esta selección.');
 await page.getByRole('button',{name:'Limpiar filtros',exact:true}).click();
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Overflow global '+width);}
 assert.deepEqual(unexpected,[],'Sin llamadas API o externas');assert.deepEqual(errors,[],'Sin errores JavaScript');
 console.log('PASS: portada moderna, paginación/filtros, fichas/componentes, catálogos, alta/edición, pertenencia, asignación/traspaso/historia, mantenciones, rol lectura, reset, responsive, cero APIs/externos/errores. '+url);
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
