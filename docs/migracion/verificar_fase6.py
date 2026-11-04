#!/usr/bin/env python3
"""Verificación estática de F6. No conecta, ejecuta SQL ni activa adaptadores.

La evidencia F5 corresponde al commit aceptado; su verificador conserva las
precondiciones históricas. F6 autoriza cambios de código y dos enmiendas explícitas.
"""
from pathlib import Path
from collections import Counter
import argparse
import hashlib
import json
import re
import runpy
import sys

ROOT = Path(__file__).resolve().parents[2]
DOC = 'docs/migracion/'
EV = DOC + 'evidencias/fase6/'
MIG = 'migrations/sqlserver/'
BASE = '27cae1fde225ce10aebef7b89db65da2fd8c1aed'


def require(value, message):
    if not value:
        raise ValueError(message)


def sha(value):
    return hashlib.sha256(value).hexdigest()


def structure(sql, catalog=False):
    pattern = (r"^\s*\(N'\w+', N'\w+', N'\w+', -?\d+, \d+, \d+, [01], [01]\),?\s*$"
               if catalog else r'^\s*\[\w+\] [A-Z].*$')
    return re.sub(pattern, '<COLUMN>', sql, flags=re.M)


def check_model(overrides=None):
    overrides = overrides or {}

    def read(path):
        return overrides[path] if path in overrides else (ROOT / path).read_text()

    def value(path):
        return json.loads(read(path))

    manifest = value(MIG + 'manifest.json')
    amendments = value(EV + 'enmiendas.json')
    original = runpy.run_path(str(ROOT / DOC / 'verificar_fase5.py'))['source_columns']()
    keys = ('tabla', 'campo', 'tipo', 'permite_null', 'identity', 'default', 'fila_excel')
    before = {(r['tabla'], r['campo']): {k: r[k] for k in keys} for r in original}
    expected = {}
    ascii_fields = {'USUA_CLAVE_HASH', 'FUNC_CLAVE_IMPRESION', 'EQUI_DIRECCION_IP', 'COMP_DIRECCION_MAC', 'COMP_GUID'}
    for key, old in before.items():
        row = dict(old)
        if row['tipo'].startswith('VARCHAR') and row['campo'] not in ascii_fields:
            row['tipo'] = 'N' + row['tipo']
        if row['tipo'] == 'DATETIME2':
            row.update(tipo='DATETIME2(7)', default='SYSUTCDATETIME()')
        if row['campo'] == 'USUA_CLAVE_HASH':
            row['permite_null'] = True
        expected[key] = row
    require(len(expected) == 117 and len({t for t, _ in expected}) == 30, 'Cobertura 30/117')
    require(Counter(r['tipo'].split('(')[0] for r in expected.values())['NVARCHAR'] == 38, 'Enmienda Unicode')
    actual = {(r['tabla'], r['campo']): r for r in manifest['columnas']}
    require(len(manifest['columnas']) == 117 and actual == expected, 'Modelo no corresponde a Excel + enmiendas aprobadas')
    changed = {key for key in expected if expected[key] != before[key]}
    rows = amendments['columnas_modificadas']
    require(len(rows) == len(changed) == 42 and {(r['tabla'], r['campo']) for r in rows} == changed, 'Cobertura de 42 enmiendas')
    require(all(r['anterior'] == before[(r['tabla'], r['campo'])] and r['nuevo'] == expected[(r['tabla'], r['campo'])] for r in rows), 'Procedencia de enmiendas')
    require(amendments['base_git'] == BASE and amendments['respuestas_usuario'] == {
        'M6-A02': 'Sí, conservar Auth y soporte existentes', 'M6-A03': 'Sí, preservar Unicode e instantes UTC'}, 'Aprobaciones literales')
    require(manifest['continuacion_git_base'] == BASE and manifest['version_candidata'] == '0.6.0-review.1'
            and manifest['entorno_autorizado'] is None and manifest['datos_migrados'] == 0
            and manifest['fase7'] == 'NO_AUTORIZADA' and manifest['esquema_soporte'] == 'PROPUESTA_NO_IMPLEMENTADA', 'Alcance/activación SQL Server')
    structure_hashes = value(EV + 'linaje.json')['estructuras_sql_sha256']
    sql_files = manifest['archivos_sql']
    require(len(sql_files) == 4, 'Cuatro candidatos')
    for item in sql_files:
        sql = read(item['path'])
        code = re.sub(r'--[^\n]*', '', sql).strip()
        require(re.match(r"^;THROW 51050, N'[^']+', 1;", code), 'Barrera incondicional')
        require("SERVERPROPERTY('ProductMajorVersion')), 0) <> 13" in code and
                'database_id = DB_ID()), 0) <> 130' in code and 'IF DB_ID() <= 4' in code, 'Guardias 2016/130/base de sistema')
        require(item['sha256'] == sha(sql.encode()) and item['estado'] == 'CANDIDATO_BLOQUEADO_NO_EJECUTADO', 'Hash de SQL')
        if item['path'] in structure_hashes:
            require(sha(structure(sql, '900_' in item['path']).encode()) == structure_hashes[item['path']], 'Estructura SQL fuera de enmiendas')
    core = read(MIG + '0001_nucleo_diccionario.candidate.sql')
    actual_columns = {}
    for table, block in re.findall(r'CREATE TABLE \[dbo\]\.\[(\w+)\] \(\n(.*?)\n    \);', core, re.S):
        for line in block.splitlines():
            if not line.strip().startswith('['):
                continue
            match = re.fullmatch(r'\s*\[(\w+)\] ([A-Z][A-Z0-9]*(?:\([A-Z0-9]+(?:,[0-9]+)?\))?)( IDENTITY\(1,1\))? (NULL|NOT NULL)(?: CONSTRAINT \[DF_\w+\] DEFAULT \((.+)\))?,?', line)
            require(match, 'Declaración de columna')
            field, kind, identity, null, default = match.groups()
            require((table, field) not in actual_columns, 'Columna duplicada')
            actual_columns[(table, field)] = (kind, null == 'NULL', bool(identity), default or '')
    require(actual_columns == {k: (v['tipo'], v['permite_null'], v['identity'], v['default']) for k, v in expected.items()}, 'Columnas SQL/enmiendas')
    target = re.search(r'export const targetColumns = (.*) as const;', read('apps/server/modernization/target-model.ts'), re.S)
    require(target and json.loads(target[1]) == manifest['columnas'], 'Metadatos TypeScript desactualizados')
    source = value(DOC + '03_CONTRATOS_PROPUESTOS.json')
    executable = re.search(r'export const contract = (.*) as const;', read('apps/server/modernization/contract.ts'), re.S)
    require(executable and json.loads(executable[1]) == {k: source[k] for k in ('operaciones', 'schemas')}, 'Contratos F3 alterados')
    require(len(source['operaciones']) == 18 and len(source['schemas']) == 27, '18 contratos/27 schemas')
    require("case 'sqlserver2016'" not in read('apps/server/main.ts') and 'inventoryDriver(process.env.INVENTORY_BACKEND)' in read('apps/server/main.ts'), 'Composición predeterminada')
    require('SQLSERVER_MODEL_NOT_READY' in read('apps/server/inventory/configuration.ts'), 'SQL Server debe seguir cerrado')
    return {'tablas': 30, 'columnas': 117, 'enmiendas': 42, 'columnas_unicode': 38,
            'contratos_http': 18, 'schemas': 27, 'lecturas_repositorio_destino': 2,
            'escrituras_repositorio_destino': 0, 'sql_server_integracion': 'NO_EJECUTADA'}


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('--evaluar-aplicacion', action='store_true')
    options = args.parse_args()
    lineage = json.loads((ROOT / EV / 'linaje.json').read_text())
    require(lineage['base_git'] == BASE, 'Base aceptada')
    for path, expected in lineage['sha256_preservados'].items():
        require(sha((ROOT / path).read_bytes()) == expected, 'Fuente/evidencia histórica alterada: ' + path)
    for path, expected in lineage['sha256_entrega'].items():
        require(sha((ROOT / path).read_bytes()) == expected, 'Artefacto F6 alterado: ' + path)
    counts = check_model()
    for path, needle, replacement in [
        (MIG + '0001_nucleo_diccionario.candidate.sql', 'NVARCHAR(40)', 'VARCHAR(40)'),
        (MIG + '0001_nucleo_diccionario.candidate.sql', 'SYSUTCDATETIME()', 'SYSDATETIME()'),
        (MIG + '0001_nucleo_diccionario.candidate.sql', '[USUA_CLAVE_HASH] VARCHAR(255) NULL', '[USUA_CLAVE_HASH] VARCHAR(255) NOT NULL'),
        (MIG + '0001_nucleo_diccionario.candidate.sql', '[ASIG_FECHA_INICIO] DATE', '[ASIG_FECHA_INICIO] DATETIME2(7)'),
        (MIG + '0001_nucleo_diccionario.candidate.sql', ';THROW 51050,', ';THROW 51051,'),
        (MIG + 'manifest.json', 'NO_AUTORIZADA', 'AUTORIZADA'),
        ('apps/server/modernization/contract.ts', 'codigoOperativo', 'codigoForjado'),
    ]:
        original = (ROOT / path).read_text()
        require(needle in original, 'Autoprueba no aplicable: ' + needle)
        try:
            modified = original.replace(needle, replacement, 1)
            overrides = {path: modified}
            if path.endswith('.sql'):
                # Probar invariantes aunque alguien actualice el hash del archivo alterado.
                manifest_path = MIG + 'manifest.json'
                metadata = json.loads((ROOT / manifest_path).read_text())
                for item in metadata['archivos_sql']:
                    if item['path'] == path:
                        item['sha256'] = sha(modified.encode())
                overrides[manifest_path] = json.dumps(metadata)
            check_model(overrides)
        except ValueError:
            continue
        raise ValueError('Mutación no detectada: ' + needle)
    print(json.dumps({'fase': 6, 'base_git': BASE, 'estado': 'EN_PROGRESO_INTEGRACION_DESTINO_BLOQUEADA',
        'conteos': counts, 'archivos_preservados': len(lineage['sha256_preservados']),
        'artefactos_entrega': len(lineage['sha256_entrega']), 'negativas': 7,
        'aplicacion_sqlserver': 'BLOQUEADA', 'fase7': 'NO_AUTORIZADA'}, ensure_ascii=False, indent=2))
    return 3 if options.evaluar_aplicacion else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, KeyError, AssertionError) as error:
        print('VERIFICACION_FASE6_FALLIDA: ' + str(error), file=sys.stderr)
        sys.exit(1)
