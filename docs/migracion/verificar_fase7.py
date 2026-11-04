#!/usr/bin/env python3
"""Verifica linaje y evidencia F7 sin red, bases de datos ni ejecución SQL.

Los ensayos de navegador se ejecutan aparte: este script comprueba sus archivos,
no sustituye una repetición de UI ni una integración de SQL Server.
"""
from pathlib import Path
import argparse
import ast
import csv
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
DOC = 'docs/migracion/'
EV = DOC + 'evidencias/fase7/'
BASE = '1d7fac011780651f2b21516265b76ab58d631747'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return (ROOT / path).read_text()


def value(path):
    return json.loads(read(path))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evaluar-integracion', action='store_true')
    args = parser.parse_args()
    lineage = value(EV + 'linaje.json')
    require(lineage['base_git'] == BASE and lineage['autorizacion'] == 'M7-A01', 'Base/autorización')
    for group in ('sha256_preservados', 'sha256_entrega'):
        for path, digest in lineage[group].items():
            require(sha((ROOT / path).read_bytes()) == digest, 'Archivo alterado: ' + path)
    # El CSS anterior se conserva como prefijo idéntico; el ajuste nuevo está acotado al panel.
    style = (ROOT / 'apps/web/src/style.css').read_bytes()
    require(sha(style[:lineage['css_base_bytes']]) == lineage['css_base_sha256'], 'Estilo base alterado')
    route = read('apps/server/modernization/routes.ts')
    original = route.replace("import { modelReadSchemas } from './read-contract.js';\n", '').replace('refs(modelReadSchemas(contract.schemas))', 'refs(contract.schemas)')
    require(sha(original.encode()) == lineage['routes_f6_sha256'], 'Cambio de backend fuera de extensión de lectura')
    fields = ast.literal_eval(re.search(r'equipmentReadFields = (\[.*?\]) as const', read('apps/server/modernization/read-contract.ts'))[1])
    require(fields == ['origenRef', 'numeroSerie', 'motivoSinSerie', 'inventarioServiu', 'inventarioMinvu', 'adquisicion', 'observacion'], 'Siete atributos de lectura')
    manifest = value('migrations/sqlserver/manifest.json')
    require(manifest['version_candidata'] == '0.6.0-review.2' and manifest['fase7'] == 'EN_REVISION_INTERFAZ'
            and manifest['fase8'] == 'NO_AUTORIZADA' and manifest['entorno_autorizado'] is None
            and manifest['datos_migrados'] == 0 and manifest['autorizacion_fase7']['id'] == 'M7-A01', 'Metadata/activación de SQL Server')
    require(sha(json.dumps(manifest['columnas'], ensure_ascii=False, sort_keys=True).encode()) == lineage['columnas_f6_sha256'], 'No hay nuevas enmiendas de columnas en F7')
    for item in manifest['archivos_sql']:
        data = (ROOT / item['path']).read_bytes()
        require(sha(data) == item['sha256'], 'Payload SQL distinto de F6')
        code = re.sub(r'--[^\n]*', '', data.decode()).strip()
        require(code.startswith(';THROW 51050,'), 'Barrera SQL retirada')
    matrix = list(csv.DictReader(read(DOC + '07_COBERTURA_VISUAL.csv').splitlines()))
    source = list(csv.DictReader(read(DOC + '03_PANTALLAS.csv').splitlines()))
    require(len(matrix) == 11 and {r['vista_f3'] for r in matrix} == {r['id'] for r in source}, 'Cobertura once vistas')
    tests = value(EV + 'pruebas.json')
    require(tests['base_git'] == BASE and tests['fase8'] == 'NO_AUTORIZADA'
            and not tests['mutaciones_remotas'] and not tests['sql_server_ejecutado'] and not tests['backend_doble_en_main'], 'Límites de prueba')
    counts = {}
    for case in tests['ejecutadas']:
        require(case['estado'] == 'APROBADA', 'Resultado ejecutado no aprobado')
        if 'log' in case:
            log = read(case['log'])
            require(sha(log.encode()) == case['sha256'], 'Log no corresponde a resultado')
            if case['casos'] is not None:
                require(re.search(r'ℹ tests ' + str(case['casos']) + r'\b', log) and re.search(r'ℹ fail 0\b', log), 'Conteo de suite')
                counts[case['comando']] = case['casos']
        if case['comando'].startswith('npm audit'):
            require(value(case['evidencia'])['metadata']['vulnerabilities']['total'] == 0, 'Auditoría de dependencias')
    require(counts == {'npm test': 158, 'npm run test:ops': 4, 'npm run test:ui': 57}, 'Conteos finales')
    browser = value(EV + 'navegador.json')
    require(browser['resultado'] == 'APROBADA' and not browser['errores_javascript'], 'Errores JS o navegador no aprobado')
    require(len(browser['screenshots']) == 6 and {(x['role'], x['width']) for x in browser['screenshots']} ==
            {(role, width) for role in ['administrador', 'lectura'] for width in [1440, 768, 390]}, 'Roles/tamaños de capturas')
    for picture in browser['screenshots']:
        data = (ROOT / picture['path']).read_bytes()
        require(data.startswith(b'\x89PNG\r\n\x1a\n') and sha(data) == picture['sha256'], 'Captura no corresponde al ensayo')
    require(len(browser['audits']) == 2 and all(not x['violations'] for x in browser['audits']), 'Alcance/resultado axe')
    require(set(browser['operaciones_v2_observadas']) == {'C03-' + str(n).zfill(2) for n in range(1, 19) if n != 17}, '17 contratos observados')
    print(json.dumps({'fase': 7, 'base_git': BASE, 'estado': 'EN_REVISION_VISUAL', 'vistas_trazadas': len(matrix),
        'contratos_ui_observados': 17, 'casos_node': sum(counts.values()), 'capturas': 6, 'auditorias_axe': 2,
        'archivos_preservados': len(lineage['sha256_preservados']), 'artefactos_entrega': len(lineage['sha256_entrega']),
        'integracion_sqlserver': 'BLOQUEADA', 'fase8': 'NO_AUTORIZADA'}, ensure_ascii=False, indent=2))
    return 3 if args.evaluar_integracion else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, KeyError, AssertionError) as error:
        print('VERIFICACION_FASE7_FALLIDA: ' + str(error), file=sys.stderr)
        sys.exit(1)
