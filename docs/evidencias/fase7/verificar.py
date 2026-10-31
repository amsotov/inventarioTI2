"""Revisión de alcance y preservación contra la base aceptada D-23."""
from pathlib import Path
import subprocess,re,json
root=Path(__file__).resolve().parents[3]
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True)
phases=(root/'FASES.md').read_text()
assert '**Fase actual:** 7 — EN_REVISION' in phases
assert '| 7 | Backend y API | Servicios, reglas empresariales y contratos | EN_REVISION |' in phases
previous=git('show','0fead7b:FASES.md')
for n in range(8,16):
 row=lambda s:next(l for l in s.splitlines() if l.startswith(f'| {n} |'))
 assert row(phases)==row(previous),n
print('OK: Fase 7 EN_REVISION; filas 8–15 intactas/sin autorización.')
protected=['prototipo','db','tests/auth','tests/security','tests/datos','package-lock.json']
protected += [str(p.relative_to(root)) for p in (root/'supabase/migrations').glob('*.sql') if 'backend_api' not in p.name]
protected += ['docs/evidencias/fase'+str(n) for n in range(2,7)]
subprocess.run(['git','diff','--exit-code','0fead7b','--',*protected],cwd=root,check=True)
print('OK: código y evidencia aceptados, migraciones, prototipo y lockfile preservados.')
files=set(git('diff','--name-only','0fead7b').splitlines()+git('ls-files','--others','--exclude-standard').splitlines())
for name in files:
 if not name.endswith('.md'):continue
 p=root/name
 for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if re.match(r'^[a-z]+:',link) or link.startswith('#'):continue
  assert (p.parent/link.split('#')[0]).exists(),(name,link)
spec=json.loads((root/'docs/openapi-fase7.json').read_text())
assert spec['openapi']=='3.1.0' and len(spec['paths'])==8
backend=(root/'docs/BACKEND_API.md').read_text()
for n in range(1,7):assert f'CA7-0{n}' in backend
for n in range(1,4):assert f'F1-SEG-0{n}' in backend
print('OK: enlaces, OpenAPI y criterios CA7/seguimientos documentados.')
subprocess.run(['git','diff','--check'],cwd=root,check=True)
print('OK: git diff --check.')
