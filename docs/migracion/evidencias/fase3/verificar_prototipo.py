#!/usr/bin/env python3
"""Ensayo de la maqueta documental; solo servidor HTTP local de archivos y Chromium."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
import threading
import json
from playwright.sync_api import sync_playwright

DOC=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
PROTO=DOC/'prototipo-fase3'
ROUTES=['resumen','equipos','equipo/demo-01','equipo/nuevo','funcionarios','asignaciones','mantenciones','administracion','seguridad','auditoria','reportes']

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*_args):pass

def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(PROTO)))
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    origin=f'http://127.0.0.1:{server.server_port}'
    checks=[];screens=[];errors=[];external=[];api=[];console=[]
    def check(name,condition):
        checks.append({'nombre':name,'resultado':'APROBADA' if condition else 'FALLIDA'})
        assert condition,name
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
            for width,height in [(1440,1000),(768,1024),(390,844)]:
                page=browser.new_page(viewport={'width':width,'height':height},timezone_id='America/Santiago',locale='es-CL')
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.on('console',lambda msg:console.append(msg.text) if msg.type=='error' else None)
                def record(req):
                    if req.url.startswith(('http:','https:')) and not req.url.startswith(origin+'/'):external.append(req.url)
                    if '/api/' in req.url:api.append(req.url)
                page.on('request',record)
                page.goto(origin+'/#resumen')
                for role in ['administrador','lectura']:
                    page.select_option('#rol',role)
                    for route in ROUTES:
                        page.evaluate('(route)=>{location.hash=route}',route)
                        page.wait_for_function('(route)=>location.hash==="#"+route',arg=route)
                        page.locator('h1').wait_for()
                        restricted=role=='lectura' and route in ['equipo/nuevo','administracion','auditoria']
                        if restricted:check(f'{width}/{role}/{route}: permiso',page.locator('h1').inner_text()=='Acceso restringido')
                        else:check(f'{width}/{role}/{route}: vista',page.locator('h1').inner_text() not in ['Acceso restringido','Vista no encontrada'])
                        check(f'{width}/{role}/{route}: sin desborde global',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                        check(f'{width}/{role}/{route}: encabezado único',page.locator('h1').count()==1)
                        check(f'{width}/{role}/{route}: etiquetas',page.evaluate('Array.from(document.querySelectorAll("input,select,textarea")).every(x=>x.closest("label")||x.labels?.length)'))
                        check(f'{width}/{role}/{route}: tablas con encabezado',page.evaluate('Array.from(document.querySelectorAll("table")).every(t=>t.querySelector("caption")&&t.querySelectorAll("th[scope=col]").length)'))
                        capture=(width,role,route) in [(1440,'administrador','equipos'),(1440,'administrador','equipo/nuevo'),(1440,'administrador','auditoria'),(768,'administrador','mantenciones'),(768,'lectura','reportes'),(390,'administrador','asignaciones'),(390,'lectura','equipo/demo-01'),(390,'lectura','administracion')]
                        if capture:
                            filename=f'{width}-{role}-{route.replace("/","-")}.png'
                            page.screenshot(path=str(OUT/filename),full_page=True)
                            screens.append({'archivo':filename,'ancho':width,'alto_viewport':height,'rol':role,'ruta':route})
                    page.evaluate('location.hash="equipos"')
                    page.locator('#filters').wait_for()
                    check(f'{width}/{role}: alta según rol',page.get_by_role('link',name='Nuevo equipo',exact=True).count()==(1 if role=='administrador' else 0))
                    page.locator('[name=q]').fill('SIN-COINCIDENCIAS')
                    page.locator('#filters button').click()
                    check(f'{width}/{role}: filtro vacío',page.get_by_role('heading',name='No hay equipos con esos filtros').is_visible())
                    for state,text in [('carga','Cargando la muestra'),('vacio','Sin resultados'),('error','No se pudo completar la consulta'),('permiso','Acceso restringido')]:
                        page.select_option('#escenario',state)
                        check(f'{width}/{role}: estado {state}',page.locator('h1').inner_text()==text)
                    page.select_option('#escenario','normal')
                    page.evaluate('location.hash="reportes"')
                    page.locator('#report-form').wait_for()
                    has_audit=page.locator('[name=reporte] option',has_text='Auditoría').count()
                    check(f'{width}/{role}: auditoría en selector',has_audit==(1 if role=='administrador' else 0))
                page.select_option('#rol','administrador')
                page.evaluate('location.hash="equipo/nuevo"');page.locator('#equipment-form').wait_for()
                page.locator('[name=codigo]').fill('DEMO-NUEVO')
                page.locator('[name=nombreRed]').fill('EQUIPO-DEMO')
                page.locator('[name=motivo]').fill('Revisión de muestra')
                page.locator('[name=confirmado]').check()
                page.locator('#equipment-form button[type=submit],#equipment-form .actions button').first.click()
                check(f'{width}: motivo sin serie obligatorio',page.locator('#notice').inner_text().startswith('Indica el motivo'))
                check(f'{width}: datos conservados tras validación',page.locator('[name=codigo]').input_value()=='DEMO-NUEVO')
                page.locator('[name=motivoSerie]').fill('Sin serie en la muestra')
                page.locator('#equipment-form .actions button').click()
                check(f'{width}: validación simulada', 'No se creó ningún equipo' in page.locator('#notice').inner_text())
                page.locator('[data-action=pieza]').click()
                check(f'{width}: piezas como filas',page.locator('.piece').count()==2)
                for typ,field in [('Monitor','pulgadas'),('Impresora','clase'),('Switch','puertos')]:
                    page.locator('#equipment-form [name=tipo]').select_option(typ)
                    check(f'{width}: subtipo {typ}',page.locator(f'[name={field}]').count()==1)
                page.locator('#equipment-form [name=tipo]').select_option('Periférico')
                check(f'{width}: periférico sin subtipo ficticio','solo datos comunes' in page.locator('#subtype').inner_text())
                page.locator('[name=marca]').select_option('Marca Demo B')
                check(f'{width}: modelo filtrado por marca',all(t.endswith('B') for t in page.locator('[name=modelo] option').all_text_contents()))
                page.evaluate('location.hash="asignaciones"');page.locator('#assignment-form').wait_for()
                page.locator('[name=destino]').select_option('Persona Demo Alfa');page.locator('[name=motivo]').fill('Muestra');page.locator('[name=confirmado]').check();page.locator('#assignment-form button').first.click()
                check(f'{width}: traspaso a sí mismo rechazado','destino debe ser distinto' in page.locator('#notice').inner_text())
                page.locator('[name=accion]').select_option('Baja');page.locator('#assignment-form button').first.click()
                check(f'{width}: baja con custodia bloqueada','custodia vigente' in page.locator('#notice').inner_text())
                page.locator('[name=accion]').select_option('Traspaso');page.locator('[name=destino]').select_option('Persona Demo Beta');page.locator('#assignment-form button').first.click()
                check(f'{width}: revisión de traslado sin escritura','No se registró un movimiento' in page.locator('#notice').inner_text())
                page.evaluate('location.hash="reportes"');page.locator('#report-form').wait_for()
                page.locator('[name=desde]').fill('2026-11-03');page.locator('[name=hasta]').fill('2026-11-01');page.locator('#report-form button').click()
                check(f'{width}: rango inválido','rango de fechas está invertido' in page.locator('#notice').inner_text())
                page.locator('[name=desde]').fill('');page.locator('[name=hasta]').fill('');page.locator('[name=reporte]').select_option('Búsqueda combinada');page.locator('#report-form button').click()
                check(f'{width}: búsqueda muestra ambos conjuntos',page.locator('#report-results table').count()==2)
                page.locator('[data-action=pdf]').click();check(f'{width}: exportación marcada simulada','No se genera ni descarga' in page.locator('#notice').inner_text())
                page.locator('.skip').focus();page.keyboard.press('Enter')
                check(f'{width}: salto conserva ruta y enfoca contenido',page.evaluate('location.hash==="#reportes"&&document.activeElement.id==="contenido"'))
                check(f'{width}: sin almacenamiento persistente',page.evaluate('localStorage.length===0&&sessionStorage.length===0'))
                check(f'{width}: cabecera de revisión no tapa sidebar',page.evaluate('innerWidth<701||document.querySelector("aside").getBoundingClientRect().top>=document.querySelector(".review-bar").getBoundingClientRect().bottom-1'))
                page.close()
            check('Sin errores JavaScript',not errors);check('Sin errores de consola',not console);check('Sin solicitudes externas',not external);check('Sin llamadas API',not api)
            browser.close()
        result={'estado':'APROBADA_EN_ALCANCE_MAQUETA','motor':'Chromium /usr/bin/chromium','viewports':[1440,768,390],'zona_navegador':'America/Santiago','locale':'es-CL','rutas':ROUTES,'roles':['administrador','lectura'],'comprobaciones':len(checks),'fallidas':sum(x['resultado']=='FALLIDA' for x in checks),'capturas':screens,'errores_js':errors,'errores_consola':console,'solicitudes_externas':external,'llamadas_api':api,'checks':checks,'limites':['Maqueta documental; no aplicación React integrada','Roles, validaciones y acciones solo simulados','Sin SQL, API, identidad real, correo, exportación ni persistencia','Sin Safari, hardware, lector de pantalla o certificación WCAG','Sin aprobación visual del usuario ni Fase 4']}
        (OUT/'navegador.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({k:result[k] for k in ['estado','comprobaciones','fallidas','viewports']},ensure_ascii=False))
    finally:server.shutdown();server.server_close()

if __name__=='__main__':main()
