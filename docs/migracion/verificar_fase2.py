#!/usr/bin/env python3
"""Verificador documental de Fase 2, sin SQL ni conexiones."""
"""Lectura estática limitada a las ocho migraciones actuales; no ejecuta SQL."""
from pathlib import Path
import re


def split_parts(text):
    parts, start, depth, quoted, i = [], 0, 0, False, 0
    while i < len(text):
        c = text[i]
        if c == "'":
            if quoted and i + 1 < len(text) and text[i + 1] == "'":
                i += 2
                continue
            quoted = not quoted
        elif not quoted:
            if c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
            elif c == ',' and depth == 0:
                parts.append(text[start:i]);start = i + 1
        i += 1
    parts.append(text[start:])
    return parts


def schema(root):
    rows = []
    for path in sorted((Path(root) / 'supabase/migrations').glob('*.sql')):
        original = path.read_text()
        text = re.sub(r'--[^\n]*', lambda m: ' ' * len(m.group()), original)
        for m in re.finditer(r'create table\s+([\w.]+)\s*\(', text, re.I):
            table = m.group(1)
            if '.' not in table:table = 'inventario.' + table
            start = m.end();i = start;depth = 1;quoted = False
            while depth:
                c = text[i]
                if c == "'":
                    if quoted and i + 1 < len(text) and text[i + 1] == "'":i += 2;continue
                    quoted = not quoted
                elif not quoted:
                    if c == '(':depth += 1
                    elif c == ')':depth -= 1
                i += 1
            for part in split_parts(text[start:i-1]):
                part = part.strip()
                cm = re.match(r'(\w+)\s+(\w+)', part)
                if not cm or cm.group(1).lower() in {'unique','check','foreign','primary','constraint'}:continue
                field = cm.group(1)
                offset = text.index(part, start, i)
                rows.append({'tabla':table,'campo':field,'tipo_actual':cm.group(2).lower(),'declaracion':part,'fuente':str(path.relative_to(root)),'linea':str(original.count('\n',0,offset)+1)})
        for m in re.finditer(r'alter table\s+([\w.]+)\s+add column\s+(\w+)\s+([^;]+);', text, re.I):
            table, field, declaration = m.groups()
            if '.' not in table:table='inventario.'+table
            rows.append({'tabla':table,'campo':field,'tipo_actual':declaration.split()[0].lower(),'declaracion':field+' '+declaration,'fuente':str(path.relative_to(root)),'linea':str(original.count('\n',0,m.start())+1)})
    assert len({(r['tabla'],r['campo']) for r in rows}) == len(rows)
    return rows

import csv
import hashlib
import json
from collections import Counter
import runpy

ROOT=Path(__file__).resolve().parents[2]
DOC=ROOT/'docs/migracion'
EVIDENCE=DOC/'evidencias/fase2'

def csvread(name):
    with (DOC/name).open(newline='',encoding='utf-8') as f:return list(csv.DictReader(f))

def items(value):return [x for x in value.split(';') if x]

def test_refs(value):
    for p in json.loads(value):
        text=(ROOT/p['archivo']).read_text()
        if p['titulo'].startswith('SCRIPT_'):
            assert p['archivo'] in ['tests/qa/accessibility.ts','tests/qa/performance.ts'] and p['linea']==1
        else:
            found={m.group(2):text.count('\n',0,m.start())+1 for m in re.finditer(r'(?:t\.)?test\(\s*([\"\x27])(.+?)\1',text)}
            assert found.get(p['titulo'])==p['linea'],p

def verify():
    manifest=json.loads((EVIDENCE/'fuentes.json').read_text())
    assert manifest['base_git']=='9dbaa2fe3955e75f237caf873ef2ca44346241c2'
    for file,digest in manifest['sha256'].items():
        assert hashlib.sha256((ROOT/file).read_bytes()).hexdigest()==digest,('Fuente modificada',file)
    observed=schema(ROOT)
    archived=csvread('02_ESQUEMA_ACTUAL.csv')
    assert observed==archived,'Cambió extracción de declaraciones actuales'
    current={r['tabla']+'.'+r['campo'] for r in observed}
    assert len(current)==155 and len({r['tabla'] for r in observed})==19
    for row in observed:
        assert row['campo'] in (ROOT/row['fuente']).read_text().splitlines()[int(row['linea'])-1]
    target={r['tabla']+'.'+r['campo'] for r in csvread('01_MATRIZ_CAMPOS.csv')}
    assert len(target)==117
    # El verificador original de Fase 1 conserva el estado de su entrega histórica.
    first=runpy.run_path(str(DOC/'verificar_fase1.py'))['verify']()
    assert json.loads((DOC/'evidencias/fase1/verificacion.json').read_text())==first
    origins=csvread('02_MAPEO_ACTUAL.csv');destination=csvread('02_MAPEO_DESTINO.csv')
    assert len(origins)==155 and {r['tabla_actual']+'.'+r['campo_actual'] for r in origins}==current
    assert len(destination)==117 and {r['tabla_destino']+'.'+r['campo_destino'] for r in destination}==target
    assert len({r['tabla_destino'] for r in destination})==30
    for row in origins:
        assert set(items(row['destinos_candidatos']))<=target
        key=row['tabla_actual']+'.'+row['campo_actual']
        assert set(items(row['destinos_candidatos']))=={r['tabla_destino']+'.'+r['campo_destino'] for r in destination if key in items(r['origenes_actuales'])}
        assert row['tratamiento'] and row['clasificacion'] in ['CONSERVAR','ADAPTAR']
    for row in destination:
        assert set(items(row['origenes_actuales']))<=current
        assert row['clasificacion'] in ['ADAPTAR','PENDIENTE','NUEVO_NECESARIO']
        assert row['estado']=='PROPUESTA_DOCUMENTAL_NO_EJECUTADA'
        assert row['regla_correspondencia']
    decisions={f'M1-D{i:02}' for i in range(1,17)}
    for row in origins+destination:
        assert set(items(row['decisiones']))<=decisions and row['decisiones']

    trace=csvread('02_TRAZABILIDAD.csv')
    rf={f'RF-{n:02}' for n in range(1,17)};rnf={f'RNF-{n:02}' for n in range(1,8)}
    assert len(trace)==23 and {r['requisito'] for r in trace}==rf|rnf
    historical=(ROOT/'docs/REQUISITOS.md').read_text()
    business=(ROOT/'docs/ANALISIS_EMPRESARIAL.md').read_text()
    stories=(ROOT/'docs/HISTORIAS_USUARIO.md').read_text()
    rule_set={f'RN-{n:02}' for n in range(1,20)}
    for rule in rule_set:assert '| '+rule+' |' in business
    assert {x for r in trace for x in items(r['reglas'])}==rule_set
    assert {r['historias'] for r in trace if r['requisito'] in rf}=={f'HU-{n:02}' for n in range(1,17)}
    apis=csvread('02_INVENTARIO_API.csv');api_ids={a['id'] for a in apis}
    for row in trace:
        assert '| '+row['requisito']+' |' in historical
        assert set(items(row['campos_actuales']))<=current
        assert set(items(row['campos_destino']))<=target
        assert set(items(row['reglas']))<=rule_set
        assert set(items(row['decisiones']))<=decisions
        assert row['estado_pruebas']=='REFERENCIADAS_NO_REEJECUTADAS_F2' and row['brecha']
        if row['requisito'] in rf:
            assert '## '+row['historias'] in stories
            assert set(items(row['apis']))<=api_ids and row['apis']
            assert set(items(row['apis']))=={a['id'] for a in apis if row['requisito'] in items(a['requisitos'])}
            assert row['campos_actuales'] and row['campos_destino']
        for file in items(row['backend'])+items(row['componentes_ui']):assert (ROOT/file).is_file(),file
        file,line=row['fuente_requisito'].rsplit(':',1)
        assert '| '+row['requisito']+' |' in (ROOT/file).read_text().splitlines()[int(line)-1]
        test_refs(row['pruebas'])
    assert len(apis)==49 and len({(r['metodo'],r['ruta']) for r in apis})==49
    permissions=set(re.findall(r"'([a-z]+\.[a-z]+)'",(ROOT/'apps/server/security/policy.ts').read_text()))
    technical={'PUBLICO','ESTADO_SESION','SESION_CSRF','SEGUN_TIPO_REPORTE','SEGUN_TIPO_EXPORTACION','AUDITORIA_SI_APLICA','SALUD_PUBLICA'}
    for row in apis:
        file,line=row['fuente'].rsplit(':',1);text=(ROOT/file).read_text()
        assert row['ancla'] in text.splitlines()[int(line)-1],row['id']
        assert set(items(row['permiso']))<=permissions|technical
        assert set(items(row['requisitos']))<=rf|rnf
        assert row['estado']=='IMPLEMENTADO_EN_CODIGO_NO_REEJECUTADO_F2'
    # Cada ruta literal del código está inventariada; las familias dinámicas se contrastan por separado.
    route_sources=['apps/server/app.ts','apps/server/processes/routes.ts','apps/server/reports/routes.ts','apps/server/notifications/routes.ts','apps/server/operations.ts']
    paths={a['ruta'] for a in apis}
    for file in route_sources:
        text=(ROOT/file).read_text()
        for route in re.findall(r'''["'](/(?:api/v1/[^"']+|health/[^"']+|acceso(?:\.js)?))["']''',text):
            if route in ['/api/v1/','/api/v1/'+" + path"]:continue
            assert route in paths,('Ruta literal omitida',route)
    for resource in ['bienes','funcionarios','unidades','movimientos']:
        assert {('GET','/api/v1/'+resource),('GET','/api/v1/'+resource+'/:ref')}<={(a['metodo'],a['ruta']) for a in apis}
    cr=csvread('02_CRITERIOS_REGRESION.csv');crids={f'CR-{n:02}' for n in range(1,21)}
    assert len(cr)==20 and {r['criterio'] for r in cr}==crids
    assert {x for r in trace for x in items(r['criterios_cr'])}==crids
    for row in cr:
        assert row['resultado_aprobado'] and set(items(row['requisitos']))<=rf and row['requisitos']
        assert row['estado']=='NO_REEJECUTADO_EN_FASE2';test_refs(row['pruebas'])
        for rid in items(row['requisitos']):assert row['criterio'] in items(next(r for r in trace if r['requisito']==rid)['criterios_cr'])
    ui=csvread('02_INVENTARIO_UI.csv');assert len(ui)==12
    assert len([r for r in ui if r['clasificacion']=='NUEVO_NECESARIO'])==1
    for row in ui:assert (ROOT/row['archivo']).is_file() and set(items(row['requisitos']))<=rf|rnf
    for name in ['02_MATRIZ_TRAZABILIDAD.md','02_MAPEO_ESQUEMAS.md','02_LINEA_BASE_FUNCIONAL.md']:
        s=(DOC/name).read_text()
        assert 'EN_REVISION' in s and 'NO AUTORIZADA' in s
    return {'fase':'MIGRACION_2','estado_verificacion':'APROBADA_EN_ALCANCE_DOCUMENTAL','estado_fase':'EN_REVISION','base_git':manifest['base_git'],
        'conteos':{'requisitos_funcionales':16,'requisitos_no_funcionales':7,'historias':16,'reglas':19,'criterios_cr':20,'tablas_actuales':19,'campos_actuales':155,'tablas_destino':30,'campos_destino':117,'rutas_metodo_expandidas':49,'rutas_api_v1':sum(a['ruta'].startswith('/api/v1/') for a in apis),'entradas_ui_incluye_historico_demo_y_futuro':12,'fuentes_preservadas':len(manifest['sha256'])},
        'clasificacion_campos_destino':dict(Counter(r['clasificacion'] for r in destination)),
        'comprobaciones':['Cobertura RF/RNF/RN/HU/CR y fuente de cada requisito','155 columnas declaradas y ADD COLUMN leídos sin ejecución SQL','Mapeo bidireccional completo de campos y destinos válidos','Rutas/métodos/permisos/anclas y familias dinámicas','Pantallas, componentes y títulos/líneas de pruebas existentes','Hashes de fuentes y evidencia original de Fase 1 conservados'],
        'limites':['Solo inspección estática y verificación documental','No acredita ejecución de código ni despliegue','Pruebas funcionales referenciadas, no reejecutadas','Sin SQL, ETL, datos reales, build, navegador o servicios externos','Mappings propuestos; no implementa decisiones de esquema','Fase 3 no autorizada']}

if __name__=='__main__':
    result=verify();record=EVIDENCE/'verificacion.json'
    if record.exists():assert json.loads(record.read_text())==result,'Evidencia archivada difiere del resultado actual'
    print(json.dumps(result,ensure_ascii=False,indent=2))
