"""Verifica esta entrega EN_REVISION. No adaptar a un cierre posterior reescribiendo evidencia."""
from pathlib import Path
import json
import re
import subprocess
import yaml

root=Path(__file__).resolve().parents[3]
def git(*args):
    return subprocess.check_output(['git',*args],cwd=root,text=True)

phase=(root/'FASES.md').read_text()
assert '**Fase actual:** 14 — Despliegue, operación y continuidad; EN_REVISION' in phase
assert '**Última fase completada:** 13.' in phase
assert 'CA14-06 PENDIENTE' in phase
assert '| 15 | Documentación, capacitación y evolución | Manuales, soporte y roadmap | PENDIENTE | NO OTORGADA |' in phase
assert '## D-37 — Aceptación de Fase 13' in (root/'docs/DECISIONES.md').read_text()
assert not git('diff','8d66e72','--','supabase/migrations','package-lock.json')
previous=[p for p in (root/'docs/evidencias').iterdir() if p.is_dir() and p.name!='fase14']
assert not git('diff','8d66e72','--',*[str(p.relative_to(root)) for p in previous]),'Evidencia aceptada modificada'
for file,total in [('regresion.txt',119),('regresion-ui.txt',39),('operacion.txt',4)]:
    s=(root/'docs/evidencias/fase14'/file).read_text()
    assert re.search(rf'ℹ tests {total}\b',s) and re.search(rf'ℹ pass {total}\b',s)
    for field in ['fail','cancelled','skipped']:
        assert re.search(rf'ℹ {field} 0\b',s)
r=json.loads((root/'docs/evidencias/fase14/recuperacion.json').read_text())
assert r['status']=='PASS' and r['tableCount']==19 and 0<r['elapsedMs']<r['rtoTargetMs']
assert all(r[k]=='NOT_EXECUTED' for k in ['managedIdentity','externalUploadRetention','productionRollback'])
assert json.loads((root/'docs/evidencias/fase14/audit.json').read_text())['metadata']['vulnerabilities']['total']==0
assert not json.loads((root/'docs/evidencias/fase14/secretos.json').read_text())['findings']
workflow=(root/'.github/workflows/verify.yml').read_text()
w=yaml.load(workflow,Loader=yaml.BaseLoader)
assert set(w['on'])=={'push','pull_request'}
assert w['permissions']=={'contents':'read'} and set(w['jobs'])=={'verify'}
assert w['jobs']['verify']['env']['NOTIFICATION_DELIVERY_ENABLED']=='false'
assert not re.search(r'\$\{\{\s*secrets[.\[]|id-token:|pull_request_target|environment:|start:notifications|deploy',workflow,re.I)
for step in w['jobs']['verify']['steps']:
    if 'uses' in step:
        assert re.search(r'@[a-f0-9]{40}$',step['uses'])
paths=['README.md','FASES.md','ESTADO_PROYECTO.md','CHANGELOG.md','docs/DESPLIEGUE.md','docs/RUNBOOK_OPERACION.md','docs/CHECKLIST_LIBERACION.md','docs/PRUEBAS.md','docs/DECISIONES.md','docs/SEGURIDAD.md','docs/TRAZABILIDAD.md','specs/README.md']
links=0
for path in paths:
    p=root/path
    for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        if '://' in link or link.startswith('#'):
            continue
        assert (p.parent/link.split('#')[0]).exists(),(path,link)
        links+=1
subprocess.run(['git','diff','--check'],cwd=root,check=True)
print(f'PASS: estado/alcance/aceptación, CI solo lectura sin deploy, evidencia 119/39/4 y restore 19 tablas; {len(previous)} directorios históricos/migraciones/lockfile intactos; {links} enlaces locales.')
