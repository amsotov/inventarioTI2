#!/usr/bin/env python3
"""Comprueba evidencia/linaje F8 offline; no ejecuta SQL ni consultas remotas.

--evaluar-liberacion conserva salida 3 con hallazgos o integración bloqueada.
Las pruebas dinámicas se ejecutan aparte; sus registros se cotejan por hash.
"""
from pathlib import Path
import argparse
import csv
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
EV = 'docs/migracion/evidencias/fase8/'
BASE = 'daea7d203e971c0810a8e2dc0bb04f160a5ccd8a'


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
    parser.add_argument('--evaluar-liberacion', action='store_true')
    args = parser.parse_args()
    lineage = value(EV + 'linaje.json')
    require(lineage['base_git'] == BASE and lineage['autorizacion'] == 'M8-A01', 'Base/autorización')
    for group in ('sha256_preservados', 'sha256_entrega'):
        for path, digest in lineage[group].items():
            require(sha((ROOT / path).read_bytes()) == digest, 'Archivo alterado: ' + path)
    require(set(lineage['produccion_modificada']) == {
        'apps/server/app.ts', 'apps/server/modernization/routes.ts', 'apps/web/src/model-data.ts'
    }, 'Alcance productivo')
    manifest = value('migrations/sqlserver/manifest.json')
    require(manifest['version_candidata'] == '0.6.0-review.3'
            and manifest['fase8'] == 'EN_REVISION_CON_BLOQUEOS'
            and manifest['fase9'] == 'NO_AUTORIZADA'
            and manifest['entorno_autorizado'] is None and manifest['datos_migrados'] == 0,
            'SQL Server no debe activarse')
    require(sha(json.dumps(manifest['columnas'], ensure_ascii=False, sort_keys=True).encode())
            == lineage['columnas_base_sha256'], 'Columnas originales de F6')
    require(len(manifest['archivos_sql']) == 4, 'Cuatro SQL candidatos')
    for item in manifest['archivos_sql']:
        data = (ROOT / item['path']).read_bytes()
        require(sha(data) == item['sha256'], 'Payload SQL modificado')
        code = re.sub(r'--[^\n]*', '', data.decode()).strip()
        require(code.startswith(';THROW 51050,'), 'THROW de bloqueo retirado')
    tests = value(EV + 'pruebas.json')
    require(tests['base_git'] == BASE and tests['autorizacion']['id'] == 'M8-A01'
            and tests['fase9'] == 'NO_AUTORIZADA' and not tests['deployment_ready']
            and not tests['sql_server_ejecutado'] and not tests['mutaciones_remotas']
            and not tests['backend_doble_en_main'], 'Límites de ejecución')
    counts = {}
    for item in tests['ejecutadas']:
        require(item['estado'] == 'APROBADA', 'Suite final sin aprobación')
        data = (ROOT / item['log']).read_bytes()
        require(sha(data) == item['sha256'], 'Log distinto: ' + item['log'])
        if item['casos_node'] is not None:
            text = data.decode()
            require(re.search(r'ℹ tests (\d+)', text)[1] == str(item['casos_node']), 'Conteo Node')
            for key in ('fail', 'cancelled', 'skipped', 'todo'):
                require(re.search(r'ℹ ' + key + r' (\d+)', text)[1] == '0', 'Suite incompleta')
            counts[item['comando']] = item['casos_node']
    require(counts == {'npm test': 219, 'npm run test:ui': 57, 'npm run test:ops': 4}
            and sum(counts.values()) == tests['total_casos_node'] == 280, 'Casos sin duplicar')
    http = value(EV + 'matriz_http.json')
    require(len(http['results']) == http['aprobadas'] == 56 and http['fallidas'] == 0, 'Matriz HTTP')
    require(all(x['actual'] == x['expected'] and x['estado'] == 'APROBADA' for x in http['results']), 'Caso HTTP')
    matrix = list(csv.DictReader(read('docs/migracion/08_MATRIZ_PRUEBAS.csv').splitlines()))
    states = {s: sum(x['estado'] == s for x in matrix) for s in ('APROBADA', 'FALLIDA', 'BLOQUEADA', 'NO EJECUTADA')}
    require(states == tests['matriz_estados'] == {'APROBADA': 17, 'FALLIDA': 1, 'BLOQUEADA': 5, 'NO EJECUTADA': 4}, 'Estados de pruebas')
    require(next(x for x in matrix if x['id'] == 'M8-T18')['estado'] == 'FALLIDA', 'No ocultar M8-R01')
    require(len(list(csv.DictReader(read('docs/migracion/05_CASOS_SQLSERVER.csv').splitlines()))) == 30, 'Casos SQL Server')
    initial = value(EV + 'supabase.json')
    require(initial['project'] == 'inventarioTI2' and initial['ref'] == 'yhsfotxhaptinjtmrinn'
            and initial['security_advisors']['lints'] == [], 'Proyecto/asesores')
    data = initial['initial']
    for key, expected in {'application_tables': 19, 'application_columns': 155, 'without_rls': 0,
                          'browser_schema_usage': 0, 'private_public_execute': 0}.items():
        require(data[key] == expected, 'Catálogo remoto ' + key)
    final = value(EV + 'supabase_final.json')['audit']
    require(final['seed'] == {'units': 2, 'people': 3, 'equipment': 6, 'accounts': 0,
                              'auth_users': 0, 'sessions': 0, 'commands': 0, 'outbox': 0}, 'Semilla final')
    for before, after in {'units': 'units', 'people': 'people', 'equipment': 'equipment', 'auth_users': 'auth_users',
                          'app_accounts': 'accounts', 'app_sessions': 'sessions', 'business_commands': 'commands', 'outbox': 'outbox'}.items():
        require(data[before] == final['seed'][after], 'Cambio remoto no autorizado')
    require(len(final['roles']) == 7 and all(not v for role in final['roles']
            for k, v in role.items() if k != 'name'), 'Roles remotos cerrados')
    require(final['definer_functions'] == 6 and final['definers_without_fixed_path'] == 0, 'Funciones privilegiadas')
    public = value(EV + 'http_supabase.json')
    require(not public['mutations'] and [x['status'] for x in public['results']] == [200, 401, 406, 406], 'GET remotos')
    require(public['results'][0]['settings']['disable_signup'] is False, 'Observación Auth')
    proposal = value('docs/migracion/08_CONFIGURACION_AUTH_PROPUESTA.json')
    require(not proposal['applied'] and proposal['expected_public_settings']['disable_signup'] is True
            and proposal['project_ref'] == initial['ref'], 'Propuesta pendiente')
    audit = value(EV + 'npm-audit.json')
    require(audit['metadata']['vulnerabilities']['total'] == 0, 'npm audit')
    secrets = value(EV + 'secretos.json')
    require(secrets['findings'] == [] and len(secrets['rules']) == 5, 'Heurística secretos')
    browser = value(EV + 'navegador.json')
    require(browser['resultado'] == 'APROBADA' and browser['errores_javascript'] == []
            and len(browser['audits']) == 2 and all(x['violations'] == [] for x in browser['audits']), 'UI/axe')
    recovery = value(EV + 'recuperacion_postgres.json')
    require(recovery['status'] == 'PASS' and recovery['managedIdentity'] == 'NOT_EXECUTED', 'Recuperación local')
    load = value(EV + 'rendimiento_postgres.json')
    require(load['base'] == BASE and load['read']['count'] == 1000 and load['write']['count'] == 200
            and load['read']['statuses'] == {'200': 1000} and load['write']['statuses'] == {'200': 200}, 'Carga local')
    for key in ('movimientos', 'auditorias', 'comandos', 'avisos'):
        require(load['after'][key] - load['before'][key] == 200, 'Atomicidad medida ' + key)
    require({x['format']: x['rows'] for x in load['exports']} == {'xlsx': 10000, 'pdf': 2000}, 'Exportaciones')
    result = {'estado_verificacion_documental': 'APROBADA', 'fase8': 'EN_REVISION_CON_BLOQUEOS',
              'base_git': BASE, 'casos_node': 280, 'matriz_http': 56,
              'archivos_preservados': len(lineage['sha256_preservados']),
              'archivos_entrega': len(lineage['sha256_entrega']), 'estados_matriz': states,
              'hallazgos_abiertos': ['M8-R01'], 'deployment_ready': False,
              'sql_server': 'BLOQUEADA', 'fase9': 'NO_AUTORIZADA',
              'nota': 'Verificación offline de evidencia; no repite ensayos ni consulta Auth remoto.'}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 3 if args.evaluar_liberacion else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, KeyError, OSError, TypeError, IndexError) as error:
        print('FALLIDA: ' + str(error), file=sys.stderr)
        sys.exit(1)
