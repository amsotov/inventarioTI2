"""Verificación documental y de alcance; no sustituye pruebas funcionales."""
from pathlib import Path
import re
import subprocess
root = Path(__file__).resolve().parents[3]
def git(*args):
    return subprocess.check_output(['git', *args], cwd=root, text=True)
phase=(root/'FASES.md').read_text()
state=(root/'ESTADO_PROYECTO.md').read_text()
assert '**Fase actual:** 9 — EN_REVISION' in phase
assert '**Última fase completada:** 8.' in phase
assert '**Fase:** 9 — EN_REVISION' in state
baseline=git('show', '3dc4df2:FASES.md')
for n in range(10,16):
    row=next(x for x in phase.splitlines() if x.startswith(f'| {n} |'))
    original=next(x for x in baseline.splitlines() if x.startswith(f'| {n} |'))
    assert row==original and 'PENDIENTE' in row and 'NO OTORGADA' in row
for path in git('ls-tree','-r','--name-only','3dc4df2','supabase/migrations','prototipo','docs/evidencias').splitlines():
    assert (root/path).read_bytes()==subprocess.check_output(['git','show',f'3dc4df2:{path}'],cwd=root),path
files=['FASES.md','ESTADO_PROYECTO.md','docs/ADMINISTRACION.md','docs/MANUAL_ADMIN.md','docs/PRUEBAS.md','README.md','docs/TRAZABILIDAD.md','docs/SEGURIDAD.md']
for name in files:
    text=(root/name).read_text()
    for dest in re.findall(r'\]\(([^)]+)\)',text):
        if '://' in dest or dest.startswith('#'): continue
        assert ((root/name).parent/dest.split('#')[0]).exists(),(name,dest)
assert 'CA9-06 | PENDIENTE' in (root/'docs/ADMINISTRACION.md').read_text()
subprocess.run(['git','diff','--check'],cwd=root,check=True)
print('OK: Fase 9 EN_REVISION, última completada 8; filas 10–15 intactas.')
print('OK: migraciones/prototipo/evidencias aceptadas preservadas literalmente.')
print('OK: enlaces locales de continuidad, CA9-06 pendiente y git diff --check.')
