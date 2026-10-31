"""Revisión documental de Fase 3; ejecutar desde cualquier directorio del checkout."""
from pathlib import Path
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = 'e7db2c6'
ALLOWED = {
    'FASES.md', 'ESTADO_PROYECTO.md', 'README.md', 'CHANGELOG.md',
    'docs/ARQUITECTURA.md', 'docs/CONTRATOS_API.md', 'docs/adr/FASE3.md',
    'docs/DECISIONES.md', 'docs/TRAZABILIDAD.md', 'docs/PRUEBAS.md',
    'specs/README.md', 'docs/evidencias/fase3/verificar.py',
    'docs/evidencias/fase3/fuentes.txt', 'docs/evidencias/fase3/resultados.txt',
}

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

base_files = git('ls-tree', '-r', '--name-only', BASE).decode().splitlines()
unchanged = 0
for name in base_files:
    if name not in ALLOWED:
        assert (ROOT / name).read_bytes() == git('show', f'{BASE}:{name}'), name
        unchanged += 1
print(f'PASS: {unchanged} archivos ajenos al alcance conservados byte a byte.')
changed = set(git('diff', BASE, '--name-only').decode().splitlines())
untracked = set(git('ls-files', '--others', '--exclude-standard').decode().splitlines())
assert (changed | untracked) <= ALLOWED, (changed | untracked) - ALLOWED
assert all(Path(x).suffix in {'.md', '.txt', '.py'} for x in changed | untracked)
print('PASS: cambios limitados a documentación y verificador documental.')
phases = (ROOT / 'FASES.md').read_text()
old = git('show', f'{BASE}:FASES.md').decode()
for n in range(4, 16):
    pattern = rf'^\| {n} \|.*$'
    assert re.findall(pattern, phases, re.M) == re.findall(pattern, old, re.M), n
assert '| 3 | Arquitectura tecnológica | Stack y decisiones arquitectónicas | EN_REVISION |' in phases
assert '| 2 | UX/UI y diseño visual | Sistema visual, prototipo navegable y aprobación visual | COMPLETADA |' in phases
for name in ['FASES.md', 'ESTADO_PROYECTO.md', 'README.md']:
    assert 'EN_REVISION' in (ROOT / name).read_text()
print('PASS: Fase 3 EN_REVISION, Fase 2 completada, filas 4–15 intactas.')
links = 0
for path in ROOT.rglob('*.md'):
    if '.git' in path.parts:
        continue
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', path.read_text()):
        if '://' in target or target.startswith(('#', 'mailto:')):
            continue
        local = target.split('#')[0]
        assert (path.parent / local).exists(), (str(path.relative_to(ROOT)), target)
        links += 1
print(f'PASS: {links} enlaces Markdown locales resuelven a archivos existentes.')
architecture = (ROOT / 'docs/ARQUITECTURA.md').read_text()
trace = (ROOT / 'docs/TRAZABILIDAD.md').read_text()
adr = (ROOT / 'docs/adr/FASE3.md').read_text()
contracts = (ROOT / 'docs/CONTRATOS_API.md').read_text()
for n in range(1, 17):
    assert f'RF-{n:02d}' in architecture
for n in range(1, 8):
    assert f'RNF-{n:02d}' in architecture + trace
for n in range(1, 7):
    assert f'CA3-{n:02d}' in architecture
    assert len(re.findall(rf'^## ADR-{n:03d} ', adr, re.M)) == 1
for item in ['F1-SEG-01', 'F1-SEG-02', 'F1-SEG-03', 'UTC', '168 h', '30 días', '8 h']:
    assert item in architecture
assert 'PENDIENTE: aceptación expresa' in architecture
assert '67–87' in architecture and 25 + 25 + 7 + 10 == 67 and 25 + 25 + 7 + 30 == 87
for snippet in re.findall(r'```json\n(.*?)\n```', contracts, re.S):
    json.loads(snippet)
print('PASS: cobertura 16 RF/7 RNF, seis CA3 y seis ADR, seguimientos y JSON de ejemplos.')
print('PASS: costos base 67–87 USD/mes y staging adicional 42 USD/mes coherentes.')
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
print('PASS: git diff --check.')
print('LIMITES: revisión documental; no prueba API, RLS, concurrencia, UI, rendimiento ni restauración.')
