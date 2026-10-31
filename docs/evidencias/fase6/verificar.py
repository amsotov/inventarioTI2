"""Revisión documental y preservación de alcance frente a la base aceptada."""
from pathlib import Path
import re
import subprocess

root=Path(__file__).resolve().parents[3]
def git(*args):
    return subprocess.check_output(['git',*args],cwd=root,text=True)
base='9845b10'
phases=(root/'FASES.md').read_text()
assert '**Fase actual:** 6 — EN_REVISION' in phases
assert '| 6 | Autorización, privacidad y seguridad | RBAC/ABAC según caso, controles y auditoría | EN_REVISION |' in phases
original=git('show',base+':FASES.md')
for n in range(7,16):
    row=lambda text: next(line for line in text.splitlines() if line.startswith(f'| {n} |'))
    assert row(phases)==row(original),n
print('OK: Fase 6 EN_REVISION; filas 7–15 intactas/sin autorización.')
protected=['supabase/migrations/20261031053433_modelo_inicial.sql','supabase/migrations/20261031055416_autenticacion.sql','tests/auth','tests/datos','prototipo','db','docs/evidencias/fase2','docs/evidencias/fase3','docs/evidencias/fase4','docs/evidencias/fase5','package-lock.json']
subprocess.run(['git','diff','--exit-code',base,'--',*protected],cwd=root,check=True)
print('OK: migraciones aceptadas, tests y evidencias anteriores, prototipo, datos y lockfile preservados.')
files=git('diff','--name-only',base).splitlines()
for name in files:
    if not name.endswith('.md'): continue
    p=root/name
    for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        if re.match(r'^[a-z]+:',link) or link.startswith('#'): continue
        target=link.split('#')[0]
        assert (p.parent/target).exists(),(name,target)
security=(root/'docs/SEGURIDAD.md').read_text()
for n in range(1,7): assert f'CA6-0{n}' in security
for follow in ['F1-SEG-01','F1-SEG-02','F1-SEG-03']: assert follow in security
print('OK: enlaces locales modificados, criterios CA6 y seguimientos de legal/presupuesto/respaldo.')
subprocess.run(['git','diff','--check'],cwd=root,check=True)
print('OK: git diff --check.')
