"""Continuidad de fase, enlaces y preservación de entregas aceptadas."""
from pathlib import Path
import re,subprocess
root=Path(__file__).resolve().parents[3]
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True)
s=(root/'FASES.md').read_text();previous=git('show','1297549:FASES.md')
assert '**Fase actual:** 8 — EN_REVISION' in s
for n in range(9,16):
 row=lambda text: next(l for l in text.splitlines() if l.startswith(f'| {n} |'))
 assert row(s)==row(previous),n
protected=['prototipo','db','supabase/migrations','tests/auth','tests/security','tests/api','tests/datos']+['docs/evidencias/fase'+str(n) for n in range(2,8)]
subprocess.run(['git','diff','--exit-code','1297549','--',*protected],cwd=root,check=True)
print('OK: Fase 8 EN_REVISION; filas 9–15, prototipo, migraciones y evidencia histórica preservados.')
files=set(git('diff','--name-only','1297549').splitlines()+git('ls-files','--others','--exclude-standard').splitlines())
for name in files:
 if not name.endswith('.md'):continue
 p=root/name
 for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if re.match(r'^[a-z]+:',link) or link.startswith('#'):continue
  assert (p.parent/link.split('#')[0]).exists(),(name,link)
frontend=(root/'docs/FRONTEND.md').read_text()
for n in range(1,7):assert f'CA8-0{n}' in frontend
for n in range(1,4):assert f'F1-SEG-0{n}' in frontend
subprocess.run(['git','diff','--check'],cwd=root,check=True)
print('OK: enlaces, criterios CA8, seguimientos y git diff --check.')
