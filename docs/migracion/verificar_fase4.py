#!/usr/bin/env python3
"""Verifica cobertura documental del plan ETL; no ejecuta transformaciones ni SQL.

Biblioteca estándar. Lee únicamente fuentes versionadas, CSV/JSON e informes;
no abre conexiones, evalúa fórmulas ni ejecuta scripts SQL/ETL/de aplicación.
"""
from pathlib import Path
from collections import Counter
import csv
import hashlib
import json
import re
import runpy

ROOT=Path(__file__).resolve().parents[2]
DOC=ROOT/'docs/migracion'
EVIDENCE=DOC/'evidencias/fase4'
BASE='59b58d912010e7e6a0bd56d1ceef71264d5ad05e'

def readcsv(name):
    with (DOC/name).open(newline='',encoding='utf-8') as f:return list(csv.DictReader(f))

def values(text):return {x for x in text.split(';') if x}

def verify():
    manifest=json.loads((EVIDENCE/'fuentes.json').read_text())
    assert manifest['base_git']==BASE
    assert manifest['fuente_operacional_disponible'] is False
    assert all(manifest[k] is False for k in ['perfilado_real_ejecutado','sql_ejecutado','etl_ejecutado'])
    book=ROOT/'docs/modelo-datos/04_DICCIONARIO_DATOS.xlsx'
    digest=hashlib.sha256(book.read_bytes()).hexdigest()
    assert digest==manifest['fuente_diccionario_sha256']=='a07ec95b68c35eae358def30ae3723485c202b562d04db465b566801307cef5e'
    sheets=runpy.run_path(str(DOC/'verificar_fase1.py'))['worksheets'](book)
    assert len(sheets['MAPEO_EXCEL'])-1==57 and len(sheets['CALIDAD_DATOS'])-1==13
    target={r['tabla']+'.'+r['campo'] for r in readcsv('01_MATRIZ_CAMPOS.csv')}
    assert len(target)==117 and len(readcsv('02_ESQUEMA_ACTUAL.csv'))==155
    rules=readcsv('04_REGLAS_TRANSFORMACION.csv');exceptions=readcsv('04_CATALOGO_EXCEPCIONES.csv')
    tests=readcsv('04_PRUEBAS_RECONCILIACION.csv');gates=readcsv('04_PUERTAS_CONTROL.csv');load=readcsv('04_ORDEN_CARGA.csv')
    assert len(rules)==57 and {r['id'] for r in rules}=={f'ETL-{i:02}' for i in range(1,58)}
    exception_ids={f'EX-{i:02}' for i in range(1,21)};decision_ids={f'M1-D{i:02}' for i in range(1,17)}
    assert len(exceptions)==20 and {r['id'] for r in exceptions}==exception_ids
    assert {x for r in exceptions for x in values(r['decisiones'])}==decision_ids
    for row,original in zip(rules,sheets['MAPEO_EXCEL'][1:]):
        number=int(row['fila_mapeo_excel'])
        assert number==int(row['id'].split('-')[1])+1
        assert row['hoja_origen']==original[0] and row['columnas_origen']==original[1]
        assert values(row['campos_destino_exactos'])<=target
        assert row['campos_destino_exactos'] or number in [33,49]
        assert values(row['excepciones'])<=exception_ids and row['excepciones']
        assert values(row['decisiones'])<=decision_ids and row['decisiones']
        assert row['tratamiento_propuesto'] and row['estado']=='PLAN_DOCUMENTAL_NO_EJECUTADO'
    quality=[r for r in exceptions if r['fila_calidad_excel']]
    assert len(quality)==13 and {int(r['fila_calidad_excel']) for r in quality}==set(range(2,15))
    for row in quality:
        original=sheets['CALIDAD_DATOS'][int(row['fila_calidad_excel'])-1]
        assert row['severidad_fuente']==original[0]
        assert row['estado']=='DOCUMENTADA_NO_PERFILADA'
        assert row['tratamiento'] and row['condicion_cierre'] and row['responsable_propuesto']
    assert all(r['estado']=='DOCUMENTADA_NO_PERFILADA' for r in exceptions)
    assert len(tests)==36 and {r['id'] for r in tests}=={f'REC-{i:02}' for i in range(1,37)}
    assert {x for r in tests for x in values(r['excepciones'])}==exception_ids
    for row in tests:
        assert values(row['excepciones'])<=exception_ids and row['resultado_exigido'] and row['escenario_futuro']
        assert row['estado_ejecucion']=='NO_EJECUTADA_PLANIFICADA'
    assert len(gates)==12 and {r['id'] for r in gates}=={f'G04-{i:02}' for i in range(1,13)}
    assert not any(r['estado_actual'] in ['APROBADA','ABIERTA','GO','EJECUTADA'] for r in gates)
    assert next(r for r in gates if r['id']=='G04-11')['estado_actual']=='NO_AUTORIZADA_FASE_5'
    assert next(r for r in gates if r['id']=='G04-12')['estado_actual']=='NO_AUTORIZADA_PRODUCCION'
    tables={k.split('.')[0] for k in target};assert len(load)==30 and {r['tabla_destino'] for r in load}==tables
    position={r['tabla_destino']:int(r['orden_propuesto']) for r in load}
    assert set(position.values())==set(range(1,31))
    for rel in readcsv('01_RELACIONES.csv'):
        parent=rel['referencia'].split('.')[0];child=rel['tabla_hija']
        if parent!=child:assert position[parent]<position[child],(parent,child)
        else:assert 'ciclos' in next(r for r in load if r['tabla_destino']==child)['tratamiento_auto_fk']
    for row in load:
        actual={r['referencia'].split('.')[0] for r in readcsv('01_RELACIONES.csv') if r['tabla_hija']==row['tabla_destino'] and r['referencia'].split('.')[0]!=row['tabla_destino']}
        assert values(row['padres_previamente_resueltos'])==actual
        assert row['estado']=='ORDEN_DOCUMENTAL_NO_CARGADO'
    # Preservación de fuentes y de la maqueta/capturas ya aceptadas, sin reejecutar esos ensayos.
    old_sources=json.loads((DOC/'evidencias/fase2/fuentes.json').read_text())['sha256']
    for file,expected in old_sources.items():assert hashlib.sha256((ROOT/file).read_bytes()).hexdigest()==expected,file
    old_design=json.loads((DOC/'evidencias/fase3/verificacion.json').read_text())['sha256_artefactos']
    for file,expected in old_design.items():assert hashlib.sha256((ROOT/file).read_bytes()).hexdigest()==expected,file
    docs={name:(DOC/name).read_text() for name in ['04_PLAN_ETL.md','04_EXCEPCIONES_DATOS.md','04_RECONCILIACION_ROLLBACK.md']}
    for text in docs.values():assert 'EN_REVISION' in text and 'Fase 5 NO AUTORIZADA' in text
    text=docs['04_PLAN_ETL.md']
    for anchor in ['APP_POSTGRES','EXCEL_LEGADO','staging','snapshot','Idempotency-Key','168 h','RTO ≤8 h','F1-SEG-01/02/03','No SQL','rotación']:
        assert anchor in text,anchor
    for path in (DOC/'04_PLAN_ETL.md',DOC/'04_EXCEPCIONES_DATOS.md',DOC/'04_RECONCILIACION_ROLLBACK.md'):
        for m in re.finditer(r'\[[^\]\n]+\]\(([^)\n]+)\)',path.read_text()):
            target_path=m.group(1).split('#')[0]
            destination=path.parent/target_path
            assert not target_path or '://' in target_path or destination==EVIDENCE/'verificacion.json' or destination.exists(),target_path
    artifacts=['04_REGLAS_TRANSFORMACION.csv','04_CATALOGO_EXCEPCIONES.csv','04_ORDEN_CARGA.csv','04_PRUEBAS_RECONCILIACION.csv','04_PUERTAS_CONTROL.csv','04_PLAN_ETL.md','04_EXCEPCIONES_DATOS.md','04_RECONCILIACION_ROLLBACK.md']
    return {'fase':'MIGRACION_4','estado_verificacion':'APROBADA_EN_ALCANCE_DOCUMENTAL','estado_fase':'EN_REVISION','base_git':BASE,
        'conteos':{'reglas_mapeo_excel':57,'hallazgos_calidad_fuente':13,'controles_excepcion':20,'escenarios_reconciliacion_planificados':36,'puertas_control':12,'tablas_en_orden_propuesto':30,'decisiones_condicionadas_trazadas':16,'campos_actuales_referenciados':155,'campos_destino_referenciados':117,'fuentes_codigo_modelo_preservadas':len(old_sources),'artefactos_diseno_previos_preservados':len(old_design)},
        'sha256_artefactos':{name:hashlib.sha256((DOC/name).read_bytes()).hexdigest() for name in artifacts},
        'estados_datos':{'origen_operacional':'NO_DISPONIBLE_EN_REPOSITORIO','excepciones_reales':'NO_PERFILADAS','pruebas_reconciliacion':'NO_EJECUTADAS_PLANIFICADAS','sql_etl_backup_restore':'NO_EJECUTADOS'},
        'comprobaciones':['Correspondencia de las 57 filas fuente, sin copiar notas sensibles','Cobertura uno a uno de los 13 hallazgos y su severidad original','Referencias a campos/excepciones/decisiones y guion completo','Orden de carga respeta todas las FK entre tablas y explicita auto-FK','Puertas no se declaran abiertas/aprobadas por documento','Hashes de fuentes y diseño previo conservados'],
        'limites':['Verificación del plan, no motor ETL ni calidad real','No SQL, conexiones a DB, extracción/carga, backup/restore o servicios reales','Guion de 36 casos no ejecutado ni presentado como PASS','Fase 5 no autorizada; producción y datos requieren permiso propio']}

if __name__=='__main__':
    result=verify();record=EVIDENCE/'verificacion.json'
    if record.exists():assert json.loads(record.read_text())==result,'Evidencia archivada difiere del plan actual'
    print(json.dumps(result,ensure_ascii=False,indent=2))
