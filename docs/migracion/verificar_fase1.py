#!/usr/bin/env python3
"""Verificación documental de Fase 1: solo lectura, biblioteca estándar, sin SQL."""
from pathlib import Path
from collections import Counter
import csv
import hashlib
import json
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'docs/migracion'
EVIDENCE = DOC / 'evidencias/fase1'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
SOURCE_BLOBS = {
    '02_ER_MODELO_ENTIDAD_RELACION.png': '74edf8e6e1f3463b648777aa6da1e5d25c3745ad',
    '03_DER_DIAGRAMA_ENTIDAD_RELACION.png': 'b5e74bd53a4acca2ced7a1b0bf3aa594ef210708',
    '04_DICCIONARIO_DATOS.xlsx': '8e5f1a74951deafaa1220b4694ba5689d868c8b6',
}


def worksheets(path):
    """Lee valores OOXML existentes; no evalúa fórmulas ni ejecuta macros."""
    with zipfile.ZipFile(path) as z:
        shared = []
        if 'xl/sharedStrings.xml' in z.namelist():
            shared = [''.join(e.itertext()) for e in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS)]
        rels = {e.attrib['Id']: e.attrib['Target'] for e in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        result = {}
        for sheet in ET.fromstring(z.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS):
            rid = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
            target = rels[rid]
            target = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/' + target)
            values = []
            for row in ET.fromstring(z.read(target)).findall('m:sheetData/m:row', NS):
                cells = {}
                for cell in row.findall('m:c', NS):
                    if cell.find('m:f', NS) is not None:
                        raise AssertionError('Fórmula no evaluable en fuente documental')
                    col = re.match(r'[A-Z]+', cell.attrib['r']).group()
                    index = 0
                    for char in col:
                        index = index * 26 + ord(char) - 64
                    raw = cell.findtext('m:v', default='', namespaces=NS)
                    kind = cell.attrib.get('t')
                    if kind == 's':
                        value = shared[int(raw)]
                    elif kind == 'inlineStr':
                        inline = cell.find('m:is', NS)
                        value = ''.join(inline.itertext()) if inline is not None else ''
                    else:
                        value = raw
                    cells[index - 1] = value
                if cells:
                    values.append([cells.get(i, '') for i in range(max(cells) + 1)])
            result[sheet.attrib['name']] = values
        return result


def read_csv(path):
    with path.open(encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def verify():
    hashes = {}
    for name, blob in SOURCE_BLOBS.items():
        data = (ROOT / 'docs/modelo-datos' / name).read_bytes()
        observed = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        assert observed == blob, f'Cambió fuente original: {name}'
        hashes[name] = {'git_blob': observed, 'sha256': hashlib.sha256(data).hexdigest()}
    sheets = worksheets(ROOT / 'docs/modelo-datos/04_DICCIONARIO_DATOS.xlsx')
    assert {k: len(v) - 1 for k, v in sheets.items()} == {'DICCIONARIO_DATOS': 117, 'TABLAS': 30, 'MAPEO_EXCEL': 57, 'CALIDAD_DATOS': 13}
    rows = [dict(zip(sheets['DICCIONARIO_DATOS'][0], r)) for r in sheets['DICCIONARIO_DATOS'][1:]]
    counts = Counter(r['Tabla'] for r in rows)
    keys = {(r['Tabla'], r['Nombre del campo']): r for r in rows}
    assert len(keys) == 117 and len(counts) == 30
    for r in sheets['TABLAS'][1:]:
        assert counts[r[0]] == int(r[3])
        assert all(field.startswith(r[1]) for table, field in keys if table == r[0])
    pk = {t: [r['Nombre del campo'] for r in rows if r['Tabla'] == t and r['Es PK'] == 'SÍ'] for t in counts}
    assert all(len(v) == (2 if t == 'AUTORIZACIONES' else 1) for t, v in pk.items())
    assert pk['AUTORIZACIONES'] == ['AUTO_USUARIO_ID', 'AUTO_PERFIL_ID']
    fk_rows = [r for r in rows if r['Es FK'] == 'SÍ']
    assert len(fk_rows) == 30
    for r in fk_rows:
        table, field = r['Referencia (tabla.campo)'].split('.')
        target = keys[(table, field)]
        assert target['Tipo de dato'] == r['Tipo de dato'] == 'INT'
        assert pk[table] == [field] or 'UNIQUE' in target.get('Restricciones adicionales', '')
    assert sum('IDENTITY' in r.get('Restricciones adicionales', '') for r in rows) == 25
    assert all(r['Permite NULL'] == 'NO' for r in rows if r['Es PK'] == 'SÍ')

    der = read_csv(EVIDENCE / 'der_transcrito.csv')
    der_keys = {(r['tabla'], r['campo']): r for r in der}
    assert len(der) == 117 and set(der_keys) == set(keys)
    temporal = []
    for key, r in keys.items():
        o = der_keys[key]
        assert o['null_der'] == r['Permite NULL'], key
        assert o['pk_der'] == r['Es PK'] and o['fk_der'] == r['Es FK'], key
        assert o['uq_der'] == ('SÍ' if 'UNIQUE' in r.get('Restricciones adicionales', '') else 'NO'), key
        typ = r['Tipo de dato']
        if typ == 'DATETIME2':
            assert o['tipo_der'] == {'USUA_FECHA_CREACION': 'DATETIME2(0)', 'AUTO_FECHA_OTORGADO': 'DATETIME2(0)', 'AUDI_FECHA_HORA': 'DATETIME2(3)'}[key[1]]
            assert r['Longitud / precisión'] == '6-8'
            temporal.append('.'.join(key))
        else:
            expected = typ + ('(' + r['Longitud / precisión'] + ')' if typ in ('VARCHAR', 'DECIMAL') else '')
            assert o['tipo_der'] == expected, (key, expected, o['tipo_der'])
    assert len(temporal) == 3

    er = json.loads((EVIDENCE / 'er_claves_transcritas.json').read_text())
    expected_er = {(r['Tabla'], r['Nombre del campo']) for r in rows if r['Es PK'] == 'SÍ' or r['Es FK'] == 'SÍ'}
    assert {(t, f) for t, fields in er.items() for f in fields} == expected_er
    assert len(expected_er) == 55
    edges = json.loads((EVIDENCE / 'aristas_transcritas.json').read_text())
    assert edges == {r['Tabla'] + '.' + r['Nombre del campo']: r['Referencia (tabla.campo)'] for r in fk_rows}

    matrix = read_csv(DOC / '01_MATRIZ_CAMPOS.csv')
    assert len(matrix) == 117 and {(r['tabla'], r['campo']) for r in matrix} == set(keys)
    for i, m in enumerate(matrix, 2):
        r = keys[(m['tabla'], m['campo'])]
        assert int(m['fila_excel']) == i
        for col, source in [('pk', 'Es PK'), ('fk', 'Es FK'), ('referencia', 'Referencia (tabla.campo)'), ('permite_null', 'Permite NULL'), ('restricciones', 'Restricciones adicionales'), ('longitud_precision_original', 'Longitud / precisión')]:
            assert m[col] == r.get(source, ''), (m['campo'], col)
        o = der_keys[(m['tabla'], m['campo'])]
        assert m['tipo_der'] == o['tipo_der'] and m['null_der'] == o['null_der']
        assert m['pk_der'] == o['pk_der'] and m['fk_der'] == o['fk_der'] and m['uq_der'] == o['uq_der']
        typ = r['Tipo de dato']
        expected = typ + ('(' + r['Longitud / precisión'] + ')' if typ in ('VARCHAR', 'DECIMAL') else '')
        assert m['tipo_diccionario'] == expected
        assert m['comparacion_tipo'] == ('PRECISION_PENDIENTE' if typ == 'DATETIME2' else 'COINCIDE')
        assert m['comparacion_claves_null'] == 'COINCIDE'
        assert m['campo_en_er'] == ('SÍ' if (m['tabla'], m['campo']) in expected_er else 'NO_APLICA_ATRIBUTO_NO_CLAVE')

    rels = read_csv(DOC / '01_RELACIONES.csv')
    assert len(rels) == 30
    assert {r['tabla_hija'] + '.' + r['campo_fk']: r['referencia'] for r in rels} == edges
    for r in rels:
        source = keys[(r['tabla_hija'], r['campo_fk'])]
        assert r['padre_por_hija'] == ('0..1' if source['Permite NULL'] == 'SÍ' else '1')
        assert r['hijas_por_padre_permitidas_por_claves'] == ('0..1' if source['Es PK'] == 'SÍ' or 'UNIQUE' in source.get('Restricciones adicionales', '') else '0..N')

    checks = [r['Nombre del campo'] for r in rows if 'CHECK' in r.get('Restricciones adicionales', '')]
    assert len(checks) == 9
    validation = (DOC / '01_VALIDACION_MODELO.md').read_text()
    decisions = (DOC / '01_DECISIONES_PENDIENTES.md').read_text()
    assert len(re.findall(r'^\| H\d{2} \|', validation, re.M)) == 15
    assert re.findall(r'^## (M1-D\d{2}) —', decisions, re.M) == [f'M1-D{i:02}' for i in range(1, 17)]
    for m in matrix:
        assert all(h in {f'H{i:02}' for i in range(1, 16)} for h in m['hallazgos'].split(';') if h)
    assert 'Fase 2 permanece NO AUTORIZADA' in validation
    artifacts = ['der_transcrito.csv', 'er_claves_transcritas.json', 'aristas_transcritas.json']
    hashes_artifacts = {name: hashlib.sha256((EVIDENCE / name).read_bytes()).hexdigest() for name in artifacts}
    return {
        'fase': 'MIGRACION_1', 'estado_verificacion': 'APROBADA_EN_ALCANCE_DOCUMENTAL',
        'estado_fase': 'EN_REVISION', 'base_git': '511b99d64c97ff1917f279e78490f377a3f5239a',
        'fuentes': hashes, 'transcripciones_sha256': hashes_artifacts,
        'conteos': {'tablas': 30, 'campos': 117, 'componentes_pk': 31, 'fk': 30, 'claves_er': 55, 'tipos_completos_coincidentes': 114, 'precisiones_datetime2_pendientes': 3, 'checks_sin_expresion_completa': 9, 'identity_declarados': 25, 'uq_explicitos': 18, 'reglas_mapeo_excel': 57, 'hallazgos_calidad_fuente': 13, 'hallazgos_fase1': 15, 'decisiones_propuestas_pendientes': 16},
        'precision_pendiente': temporal, 'checks_pendientes': checks,
        'verificaciones': ['Fuentes originales por hash Git y SHA-256', 'Conteos, prefijos y PK/FK candidatas', '117 campos vs transcripción manual DER', '55 claves y 30 aristas vs transcripción visual ER/DER', 'Integridad de matriz y relaciones', 'Cobertura de hallazgos y decisiones'],
        'limites': ['No interpreta imágenes automáticamente', 'No compara con base desplegada ni DDL destino', 'No perfila datos operacionales', 'No ejecuta SQL ni abre conexiones', 'No ejecuta pruebas de aplicación ni build', 'No aprueba decisiones ni habilita Fase 2'],
    }


if __name__ == '__main__':
    result = verify()
    recorded = EVIDENCE / 'verificacion.json'
    if recorded.exists():
        assert json.loads(recorded.read_text()) == result, 'La evidencia archivada difiere de la comprobación actual'
    print(json.dumps(result, ensure_ascii=False, indent=2))
