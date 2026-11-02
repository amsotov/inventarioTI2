"""Verifica la entrega original EN_REVISION, sin modificar evidencia histórica.
No reescribir para adaptarlo a cierres posteriores.
"""
from pathlib import Path
import json
import re
import subprocess

BASE='da1236e'
root=Path(__file__).resolve().parents[3]

def git(*args):
    return subprocess.check_output(['git',*args],cwd=root,text=True)

assert '13 — QA, rendimiento y seguridad; EN_REVISION' in (root/'FASES.md').read_text()
assert 'CA13-06 PENDIENTE' in (root/'FASES.md').read_text()
assert '| 14 | Despliegue, operación y continuidad | CI/CD, respaldo, restauración y monitoreo | PENDIENTE | NO OTORGADA |' in (root/'FASES.md').read_text()
assert '| 15 | Documentación, capacitación y evolución | Manuales, soporte y roadmap | PENDIENTE | NO OTORGADA |' in (root/'FASES.md').read_text()
assert not git('diff',BASE,'--','supabase/migrations')
previous=[p for p in (root/'docs/evidencias').iterdir() if p.is_dir() and p.name!='fase13']
assert not git('diff',BASE,'--',*[str(p.relative_to(root)) for p in previous]), 'Evidencia aceptada alterada'

for name,expected in [('regresion.txt',119),('regresion-ui.txt',39)]:
    text=(root/'docs/evidencias/fase13'/name).read_text()
    assert re.search(rf'ℹ tests {expected}\b',text)
    assert re.search(rf'ℹ pass {expected}\b',text)
    for field in ['fail','cancelled','skipped']:
        assert re.search(rf'ℹ {field} 0\b',text)
perf=json.loads((root/'docs/evidencias/fase13/rendimiento.json').read_text())
assert len(perf['samples'])==1200
assert perf['read']['p95']<=2000 and perf['write']['p95']<=3000
assert perf['read']['statuses']=={'200':1000} and perf['write']['statuses']=={'200':200}
assert [e['rows'] for e in perf['exports']]==[10000,2000]
assert all(e['ms']<=60000 for e in perf['exports'])
assert perf['notices']['max']<=60000 and perf['notices']['statuses']=={'200':203}
a11y=json.loads((root/'docs/evidencias/fase13/accesibilidad.json').read_text())
assert len(a11y['results'])==35 and not a11y['errors']
assert all(not s['violations'] for s in a11y['results'])
assert len(a11y['checks'])==79 and all(c['passed'] for c in a11y['checks'])
assert json.loads((root/'docs/evidencias/fase13/audit.json').read_text())['metadata']['vulnerabilities']['total']==0
assert not json.loads((root/'docs/evidencias/fase13/secretos.json').read_text())['findings']

paths=['README.md','FASES.md','ESTADO_PROYECTO.md','CHANGELOG.md','docs/QA_FASE13.md','docs/MATRIZ_QA_FASE13.md','docs/PRUEBAS.md','docs/SEGURIDAD.md','docs/TRAZABILIDAD.md','docs/REPORTES.md','docs/MANUAL_USUARIO.md','docs/DECISIONES.md','specs/README.md']
links=0
for path in paths:
    p=root/path
    for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        if '://' in link or link.startswith('#'):
            continue
        target=link.split('#')[0]
        assert (p.parent/target).exists(),(path,link)
        links+=1
subprocess.run(['git','diff','--check'],cwd=root,check=True)
print(f'PASS: fase/aceptación/límites; {len(previous)} directorios históricos y migraciones intactos; evidencia 119/39/35/79 consistente; {links} enlaces locales; diff limpio.')
