"""Revisión documental/preservación de Fase 5; no sustituye pruebas funcionales."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
root=Path(__file__).resolve().parents[3]
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
base='3b7e43a'
protected=['AGENTS.md','PROMPT_MAESTRO.md','docs/SEGURIDAD.md','docs/DESPLIEGUE.md','supabase/migrations/20261031053433_modelo_inicial.sql']
for prefix in ['prototipo/','tests/datos/','tests/prototipo.cjs','db/','docs/evidencias/fase2/','docs/evidencias/fase3/','docs/evidencias/fase4/']:
    protected+=git('ls-tree','-r','--name-only',base,'--',prefix).decode().splitlines()
for path in protected:
    assert hashlib.sha256((root/path).read_bytes()).digest()==hashlib.sha256(git('show',base+':'+path)).digest(),path
print('PASS: instrucciones, prototipo, datos, seguridad/despliegue y evidencias previas preservados:',len(protected))
old=git('show',base+':FASES.md').decode();new=(root/'FASES.md').read_text()
for n in range(6,16):
    line=next(x for x in old.splitlines() if x.startswith(f'| {n} |'))
    assert line in new,n
assert '| 5 | Autenticación | Inicio de sesión, recuperación y sesiones | EN_REVISION |' in new
assert '**Última fase completada:** 4.' in new
print('PASS: Fase 5 EN_REVISION; última completada 4; filas 6–15 intactas')
p=json.loads((root/'package.json').read_text());lock=json.loads((root/'package-lock.json').read_text())
for group in ['dependencies','devDependencies']:
    for name,version in p[group].items():
        assert re.fullmatch(r'\d+\.\d+\.\d+',version),(name,version)
        assert lock['packages']['node_modules/'+name]['version']==version,name
print('PASS: dependencias exactas y lockfile coherentes')
paths=['README.md','FASES.md','ESTADO_PROYECTO.md','docs/AUTENTICACION.md','docs/PRUEBAS.md','docs/BASE_DATOS.md','docs/CONTRATOS_API.md','docs/DECISIONES.md','docs/TRAZABILIDAD.md','specs/README.md']
links=0
for path in paths:
    for link in re.findall(r'\]\(([^\s)]+)\)',(root/path).read_text()):
        if '://' in link or link.startswith('#'):continue
        destination=link.split('#')[0]
        assert (root/path).parent.joinpath(destination).exists(),(path,link)
        links+=1
print('PASS: enlaces locales válidos:',links)
subprocess.run(['git','diff','--check'],cwd=root,check=True)
print('PASS: git diff --check')
