"""Control documental/alcance Fase 4; ejecutar desde cualquier directorio."""
from pathlib import Path
import re
import subprocess

ROOT=Path(__file__).resolve().parents[3]
BASE='1fe5859'
ALLOWED={
 '.gitignore','FASES.md','ESTADO_PROYECTO.md','README.md','CHANGELOG.md',
 'docs/BASE_DATOS.md','docs/DICCIONARIO_DATOS.md','docs/PRUEBAS.md',
 'docs/DECISIONES.md','docs/TRAZABILIDAD.md','specs/README.md',
 'supabase/migrations/20261031053433_modelo_inicial.sql',
 'db/seed_prueba.sql','db/consultas.sql','tests/datos/verificar.py',
 'docs/evidencias/fase4/resultados.txt','docs/evidencias/fase4/documentos.txt',
 'docs/evidencias/fase4/fuentes.txt','docs/evidencias/fase4/verificar_documentos.py'
}
def git(*args):
 return subprocess.check_output(['git',*args],cwd=ROOT).decode()

basefiles=git('ls-tree','-r','--name-only',BASE).splitlines()
for name in basefiles:
 if name not in ALLOWED:
  old=subprocess.check_output(['git','show',f'{BASE}:{name}'],cwd=ROOT)
  assert (ROOT/name).read_bytes()==old,name
print('PASS: archivos ajenos al alcance, arquitectura aceptada, prototipo y evidencia previa intactos.')
changes=set(git('diff',BASE,'--name-only').splitlines())|set(git('ls-files','--others','--exclude-standard').splitlines())
assert changes<=ALLOWED,changes-ALLOWED
print('PASS: cambios solo dentro del alcance de Fase 4.')
phases=(ROOT/'FASES.md').read_text()
for n in range(5,16):
 pattern=rf'^\| {n} \|.*$'
 assert re.findall(pattern,phases,re.M)==re.findall(pattern,git('show',f'{BASE}:FASES.md'),re.M),n
assert '| 4 | Modelado y persistencia de datos | Modelo ER, restricciones y migraciones | EN_REVISION |' in phases
assert '**Última fase completada:** 3.' in phases
print('PASS: Fase 4 EN_REVISION, última completada 3; filas de Fases 5–15 conservadas.')
links=0
for p in ROOT.rglob('*.md'):
 if '.git' in p.parts:continue
 for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text()):
  if '://' in target or target.startswith(('#','mailto:')):continue
  assert (p.parent/target.split('#')[0]).exists(),(p,target)
  links+=1
print(f'PASS: {links} enlaces locales Markdown válidos.')
model=(ROOT/'docs/BASE_DATOS.md').read_text()
dictionary=(ROOT/'docs/DICCIONARIO_DATOS.md').read_text()
sql=(ROOT/'supabase/migrations/20261031053433_modelo_inicial.sql').read_text()
tables=re.findall(r'create table (\w+) \((.*?)\n\);',sql,re.S)
assert len(tables)==13
for table,body in tables:
 assert f'| {table} |' in dictionary,table
 for col in re.findall(r'^ (\w+) (?:uuid|text|boolean|bigint|integer|date|timestamptz|jsonb)',body,re.M):
  row=next(x for x in dictionary.splitlines() if x.startswith(f'| {table} |'))
  assert col in row,(table,col)
for n in range(1,7):assert f'CA4-{n:02d}' in model
for item in ['F1-SEG-01','F1-SEG-02','F1-SEG-03','UTC','168 h','8 h','30 días']:
 assert item in model,item
assert not re.search(r'^\s*(drop|truncate|delete\s+from)\b',sql,re.I|re.M)
assert 'RESULTADO: 46 comprobaciones aprobadas.' in (ROOT/'docs/evidencias/fase4/resultados.txt').read_text()
print('PASS: diccionario cubre 13 tablas/columnas; CA4 y seguimientos conservados; migración aditiva.')
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
print('PASS: git diff --check. Límite: revisión documental; evidencia de PostgreSQL en resultados.txt.')
