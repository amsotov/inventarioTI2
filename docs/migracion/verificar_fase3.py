#!/usr/bin/env python3
"""Comprueba diseño/contratos de Fase 3; no ejecuta aplicación, SQL ni solicitudes API.

Requiere Python 3 y jsonschema para validar los ejemplos de contratos propuestos.
El ensayo de navegador se ejecuta por separado con Playwright/Chromium.
"""
from pathlib import Path
from collections import Counter
import csv
import copy
import hashlib
import json
import re
import runpy
from jsonschema import Draft202012Validator, FormatChecker

ROOT=Path(__file__).resolve().parents[2]
DOC=ROOT/'docs/migracion'
EVIDENCE=DOC/'evidencias/fase3'

def readcsv(name):
    with (DOC/name).open(newline='',encoding='utf-8') as f:return list(csv.DictReader(f))

def verify():
    prior=runpy.run_path(str(DOC/'verificar_fase2.py'))['verify']()
    assert prior==json.loads((DOC/'evidencias/fase2/verificacion.json').read_text())
    base=readcsv('02_INVENTARIO_API.csv');compat=readcsv('03_COMPATIBILIDAD_API.csv')
    assert len(base)==len(compat)==49
    assert {(r['id'],r['metodo'],r['ruta'],r['contrato_conservar'],r['fuente']) for r in base}=={(r['id_base'],r['metodo'],r['ruta_actual'],r['contrato_actual'],r['fuente']) for r in compat}
    assert all(r['decision_contrato'].startswith('CONSERVAR') and r['estado']=='PROPUESTA_NO_IMPLEMENTADA' for r in compat)
    views=readcsv('03_PANTALLAS.csv');assert len(views)==11
    assert len({r['id'] for r in views})==11 and len({r['fragmento_maqueta'] for r in views})==11
    view_ids={r['id'] for r in views};decisions={f'M1-D{i:02}' for i in range(1,17)}
    requirements={f'RF-{i:02}' for i in range(1,17)}
    assert {i for r in views for i in r['requisitos'].split(';')}==requirements
    for r in views:assert set(r['decisiones'].split(';'))<=decisions
    fields=readcsv('03_CAMPOS_UI_API.csv');target=readcsv('01_MATRIZ_CAMPOS.csv')
    target_keys={r['tabla']+'.'+r['campo'] for r in target}
    assert len(fields)==117 and {r['tabla']+'.'+r['campo'] for r in fields}==target_keys
    for r in fields:
        assert set(r['vistas_propuestas'].split(';'))<=view_ids
        assert set(r['decisiones'].split(';'))<=decisions
    sensitive={r['campo']:r for r in fields if r['campo'] in ['USUA_CLAVE_HASH','FUNC_CLAVE_IMPRESION']}
    assert all(r['exposicion_propuesta'].startswith('EXCLUIDO') for r in sensitive.values())
    contracts=json.loads((DOC/'03_CONTRATOS_PROPUESTOS.json').read_text())
    assert contracts['estado']=='PROPUESTO_NO_IMPLEMENTADO'
    ops=contracts['operaciones'];assert len(ops)==18 and len({(o['method'],o['path']) for o in ops})==18
    permissions=set(re.findall(r"'([a-z]+\.[a-z]+)'",(ROOT/'apps/server/security/policy.ts').read_text()))
    schemas=contracts['schemas']
    def walk(value):
        if isinstance(value,dict):
            if '$ref' in value:assert value['$ref'].startswith('#/schemas/') and value['$ref'].split('/')[-1] in schemas
            for v in value.values():walk(v)
        elif isinstance(value,list):
            for v in value:walk(v)
    for name,schema in schemas.items():Draft202012Validator.check_schema(schema);walk(schema)
    for o in ops:
        assert o['path'].startswith('/api/v2/') and o['estado']=='PROPUESTO_NO_IMPLEMENTADO'
        assert o['permission'] in permissions and set(o['pantallas'])<=view_ids and set(o['campos_modelo'])<=target_keys
        assert set(o['decisiones'])<=decisions
        assert o['responseSchema'] in schemas and o['errorSchema']=='Problem'
        if o['method']!='GET':
            assert o['requestSchema'] in schemas
            assert {'Origin','X-CSRF-Token','Idempotency-Key'}<=set(o['headers_obligatorios'])
            if o['method'] in ['PATCH','PUT'] or '/movimientos' in o['path'] or '/mantenciones' in o['path'] or '/pertenencias' in o['path']:assert 'If-Match' in o['headers_obligatorios']
        else:assert 'querySchema' in o and not o['headers_obligatorios']
    def errors(name,data):
        wrapper={'$schema':contracts['$schema'],'$ref':'#/schemas/'+name,'schemas':schemas}
        return list(Draft202012Validator(wrapper,format_checker=FormatChecker()).iter_errors(data))
    for sample in contracts['ejemplos_sinteticos']:assert not errors(sample['schema'],sample['data']),sample['schema']
    examples={r['schema']:r['data'] for r in contracts['ejemplos_sinteticos']}
    negatives=[]
    def reject(label,name,data):
        assert errors(name,data),label
        negatives.append(label)
    v=copy.deepcopy(examples['EquipoAlta']);v['actor']='cliente';reject('Actor arbitrario rechazado','EquipoAlta',v)
    v=copy.deepcopy(examples['EquipoAlta']);v.pop('confirmado');reject('Confirmación obligatoria en nuevo contrato','EquipoAlta',v)
    v=copy.deepcopy(examples['EquipoAlta']);v['tipoRef']='123';reject('Referencia pública no es INT','EquipoAlta',v)
    v=copy.deepcopy(examples['EquipoAlta']);v['USUA_CLAVE_HASH']='OMITIR';reject('Hash fuera de payload de equipo','EquipoAlta',v)
    v=copy.deepcopy(examples['FuncionarioPublico']);v['FUNC_CLAVE_IMPRESION']='OMITIR';reject('Código sensible fuera de proyección pública','FuncionarioPublico',v)
    v=copy.deepcopy(examples['MantencionAlta']);v['fecha']='2026-02-30';reject('Fecha civil inexistente rechazada','MantencionAlta',v)
    v=copy.deepcopy(examples['Tecnica']);v['piezasAgregar'][0]['capacidadGb']=-1;reject('Capacidad inválida en propuesta','Tecnica',v)
    v=copy.deepcopy(examples['Perfiles']);v['perfilRefs']=[];reject('Conjunto vacío de perfiles rechazado','Perfiles',v)
    v=copy.deepcopy(examples['Perfiles']);v['perfilRefs']*=2;reject('Perfil duplicado rechazado','Perfiles',v)
    v=copy.deepcopy(examples['EquipoAlta']);v['codigoOperativo']='X'*2000;assert not errors('EquipoAlta',v),'Longitud heredada debe preservarse'
    v['codigoOperativo']='X'*2001;reject('Límite del contrato actual conservado','EquipoAlta',v)
    proto=DOC/'prototipo-fase3';js=(proto/'propuesta.js').read_text();html=(proto/'index.html').read_text()
    assert (proto/'base.css').read_bytes()==(ROOT/'apps/web/src/style.css').read_bytes()
    assert not re.search(r'\b(fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage)',js)
    assert "connect-src 'none'" in html and 'Sin conexión a la aplicación' in html
    assert 'USUA_CLAVE_HASH' not in js and 'FUNC_CLAVE_IMPRESION' not in js
    browser=json.loads((EVIDENCE/'navegador.json').read_text())
    assert browser['estado']=='APROBADA_EN_ALCANCE_MAQUETA' and browser['fallidas']==0
    assert len(browser['checks'])==browser['comprobaciones'] and all(c['resultado']=='APROBADA' for c in browser['checks'])
    assert set(browser['rutas'])=={r['fragmento_maqueta'] for r in views}
    assert browser['viewports']==[1440,768,390] and len(browser['capturas'])==8
    assert not browser['llamadas_api'] and not browser['solicitudes_externas'] and not browser['errores_js'] and not browser['errores_consola']
    for screen in browser['capturas']:assert (EVIDENCE/screen['archivo']).read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
    relevant=[proto/'index.html',proto/'base.css',proto/'propuesta.css',proto/'propuesta.js',DOC/'03_CONTRATOS_PROPUESTOS.json',EVIDENCE/'navegador.json',EVIDENCE/'verificar_prototipo.py']+[EVIDENCE/x['archivo'] for x in browser['capturas']]
    hashes={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in relevant}
    for name in ['03_IMPACTO_FRONTEND_API.md','03_DISENO_VISUAL.md']:
        text=(DOC/name).read_text();assert 'EN_REVISION' in text and 'NO AUTORIZADA' in text
    return {'fase':'MIGRACION_3','estado_verificacion':'APROBADA_EN_ALCANCE_DISENO','estado_fase':'EN_REVISION','base_git':'b29d60cd1fe0acfa02a77e3d69c1a8becedd7052',
        'conteos':{'vistas':11,'rutas_existentes_conservadas':49,'rutas_v1':45,'contratos_v2_propuestos':18,'campos_modelo_con_exposicion':117,'schemas_json':len(schemas),'ejemplos_positivos':len(contracts['ejemplos_sinteticos']),'casos_negativos':len(negatives),'comprobaciones_maqueta':browser['comprobaciones'],'capturas':8},
        'dependencias_ensayo':['Python jsonschema / Draft 2020-12 y formatos','Python Playwright / Chromium instalado para ensayo separado'],
        'casos_negativos_aprobados':negatives,'sha256_artefactos':hashes,
        'limites':['Solo diseño/documentación y maqueta aislada','No implementa endpoints ni permisos reales','No SQL, BD, ETL, aplicación React ni servicios gestionados','Reglas dependientes de datos y decisiones M1-D no resueltas por esquemas JSON','No certifica WCAG/Safari/hardware','Aceptación visual/contractual pendiente; Fase 4 no autorizada']}

if __name__=='__main__':
    result=verify();record=EVIDENCE/'verificacion.json'
    if record.exists():assert json.loads(record.read_text())==result,'La evidencia archivada difiere del resultado actual'
    print(json.dumps(result,ensure_ascii=False,indent=2))
