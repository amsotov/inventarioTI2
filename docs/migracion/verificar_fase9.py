#!/usr/bin/env python3
"""Verifica preparación F9 offline: integridad, matrices, enlaces y NO_GO.

No ejecuta SQL, suites de aplicación ni operaciones de despliegue. Las pruebas
dinámicas F8 se conservan como evidencia histórica. Salida 3 al evaluar liberación.
"""
from pathlib import Path
import argparse
import csv
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
EV = 'docs/migracion/evidencias/fase9/'
BASE = 'e224d6f3a15d09899eba2c6a908548eef73014e8'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read(path):
    return (ROOT / path).read_text()


def value(path):
    return json.loads(read(path))


def sha(data):
    return hashlib.sha256(data).hexdigest()


def matrix(path):
    return list(csv.DictReader(read(path).splitlines()))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evaluar-liberacion', action='store_true')
    args = parser.parse_args()
    lineage = value(EV + 'linaje.json')
    require(lineage['base_git'] == BASE and lineage['autorizacion'] == 'M9-A01', 'Base/autorización')
    for group in ('sha256_preservados', 'sha256_entrega'):
        for path, expected in lineage[group].items():
            require(sha((ROOT / path).read_bytes()) == expected, 'Archivo alterado: ' + path)
    require(not lineage['archivos_eliminados'] and not lineage['produccion_modificada'], 'Alcance documental')
    for path in lineage['sha256_entrega']:
        require(path.endswith(('.md', '.csv', '.json')) or path == 'docs/migracion/verificar_fase9.py', 'Archivo no documental: ' + path)
    for path in lineage['sha256_preservados']:
        if path.startswith(('apps/', 'tests/', 'supabase/', '.github/', 'ops/')) or path in ('package.json', 'package-lock.json'):
            require(path not in lineage['sha256_entrega'], 'Cambio de código o infraestructura')
    for path, links in lineage['enlaces_nuevos'].items():
        for target in links:
            file = target.split('#')[0]
            resolved = (ROOT / path).parent / file if file else ROOT / path
            require(resolved.exists(), 'Enlace local roto: ' + path + ' -> ' + target)
            if '#migración-fase-9--' in target:
                headings = re.findall(r'^#+ (.+)$', resolved.read_text(), re.M)
                slugs = [re.sub(r'[^\w\- ]', '', h.lower()).replace(' ', '-') for h in headings]
                require(target.split('#')[1] in slugs, 'Ancla de guía inexistente')
    plan = value('docs/migracion/09_MANIFIESTO_PREPARACION.json')
    require(plan['base_git'] == BASE and plan['autorizacion']['id'] == 'M9-A01'
            and plan['estado_documental'] == 'EN_REVISION' and plan['decision_liberacion'] == 'NO_GO', 'Estado documental')
    for key in ('deployment_ready', 'artefacto_construido', 'mutaciones_remotas', 'sql_ejecutado',
                'merge_main', 'despliegue_ejecutado', 'fase_posterior_definida', 'consultas_proyecto_supabase_f9'):
        require(plan[key] is False, 'Operación no autorizada: ' + key)
    require(plan['ci_remoto_f9'] == 'NO_EJECUTADA' and not plan['evidencia_funcional_heredada']['repetida_en_f9'], 'No inventar ejecuciones')
    require(plan['composicion_actual']['inventory_backend'] == 'postgres'
            and not plan['composicion_actual']['v2_en_main'], 'Composición de aplicación')
    runtime = value('package.json')
    require(runtime['engines']['node'] == plan['runtime']['node'] == '>=24 <25', 'Runtime declarado')
    require('node-version: "20"' in read('.github/workflows/deploy-demo.yml')
            and "node-version: '24.19.0'" in read('.github/workflows/verify.yml'), 'M9-R01 debe seguir explícita')
    pending = matrix('docs/migracion/09_PENDIENTES.csv')
    gates = matrix('docs/migracion/09_PUERTAS_LIBERACION.csv')
    compat = matrix('docs/migracion/09_COMPATIBILIDADES.csv')
    require(len(pending) == 18 and len(gates) == 12 and len(compat) == 16, 'Conteos de matrices')
    for rows in (pending, gates, compat):
        require(len({x['id'] for x in rows}) == len(rows) and all(all(x.values()) for x in rows), 'IDs únicos/celdas completas')
        for row in rows:
            for path in row['evidencia'].split(';'):
                require((ROOT / path).is_file(), 'Referencia de evidencia rota: ' + path)
    ids = {x['id'] for x in pending}
    require(all(p in ids for row in gates for p in row['pendientes'].split(';')), 'Puerta sin pendiente trazable')
    require(next(x for x in pending if x['origen'] == 'M8-R01')['estado'] == 'ABIERTA'
            and next(x for x in pending if x['origen'] == 'M9-R01')['estado'] == 'ABIERTA', 'No cerrar hallazgos por aceptación')
    require(next(x for x in gates if x['id'] == 'G09-10')['estado'] == 'NO_AUTORIZADA', 'Promoción no autorizada')
    require(next(x for x in gates if x['id'] == 'G09-12')['estado'] == 'PENDIENTE', 'Aceptación F9 no presumida')
    sql = value('migrations/sqlserver/manifest.json')
    require(sql['version_candidata'] == '0.6.0-review.4' and sql['fase9'] == 'EN_REVISION_DOCUMENTAL_LIBERACION_BLOQUEADA'
            and sql['autorizacion_fase9']['id'] == 'M9-A01' and sql['entorno_autorizado'] is None
            and sql['datos_migrados'] == 0, 'Metadata SQL sin activación')
    require(sql['archivos_sql'] == plan['destino']['archivos_sql'] and len(sql['archivos_sql']) == 4, 'Cuatro candidatos SQL')
    require(sha(json.dumps(sql['columnas'], ensure_ascii=False, sort_keys=True).encode())
            == plan['destino']['columna_sha256_base'] == lineage['columnas_base_sha256'], 'Modelo físico intacto')
    for item in sql['archivos_sql']:
        data = (ROOT / item['path']).read_bytes()
        require(sha(data) == item['sha256'], 'Payload SQL modificado')
        require(re.sub(r'--[^\n]*', '', data.decode()).strip().startswith(';THROW 51050,'), 'Barrera SQL')
    f8 = value('docs/migracion/evidencias/fase8/pruebas.json')
    require(f8['total_casos_node'] == 280 and not f8['deployment_ready'] and f8['hallazgos_abiertos'] == ['M8-R01'], 'Evidencia histórica F8')
    inherited = value(EV + 'base_f8_verificacion.json')
    require(inherited['estado_verificacion_documental'] == 'APROBADA' and inherited['casos_node'] == 280, 'Verificación de base aceptada')
    require(value(EV + 'base_f8_liberacion.json')['deployment_ready'] is False, 'Liberación histórica bloqueada')
    tests = value(EV + 'pruebas.json')
    require(tests['base_git'] == BASE and tests['casos_node_nuevos'] == 0 and tests['casos_node_historicos_f8'] == 280
            and tests['base_f8_liberacion_exit'] == 3 and not tests['deployment_ready'], 'Clasificación de verificaciones')
    secrets = value(EV + 'secretos.json')
    require(secrets['findings'] == [] and len(secrets['rules']) == 5, 'Heurística de entrega')
    result = {'estado_verificacion_documental': 'APROBADA', 'base_git': BASE,
              'fase9': 'EN_REVISION_DOCUMENTAL', 'decision_liberacion': 'NO_GO', 'deployment_ready': False,
              'archivos_preservados': len(lineage['sha256_preservados']), 'archivos_entrega': len(lineage['sha256_entrega']),
              'compatibilidades': len(compat), 'pendientes': len(pending), 'puertas': len(gates),
              'hallazgos_abiertos': ['M8-R01', 'M9-R01'], 'casos_node_nuevos': 0, 'casos_node_historicos_f8': 280,
              'operaciones_remotas_ejecutadas': False, 'fase_posterior_definida': False,
              'nota': 'Control offline de preparación; no repite integración ni habilita promoción.'}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 3 if args.evaluar_liberacion else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, KeyError, OSError, TypeError, IndexError) as error:
        print('FALLIDA: ' + str(error), file=sys.stderr)
        sys.exit(1)
