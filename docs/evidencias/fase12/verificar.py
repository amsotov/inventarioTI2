"""Verificación documental de la entrega Fase 12; ejecutar desde raíz."""
from pathlib import Path
import re
import subprocess

root = Path.cwd()
fases = Path('FASES.md').read_text()
estado = Path('ESTADO_PROYECTO.md').read_text()
doc = Path('docs/NOTIFICACIONES.md').read_text()
assert '**Fase actual:** 12 — EN_REVISION' in fases
assert '**Última fase completada:** 11.' in fases
assert '**Fase:** 12 — EN_REVISION' in estado
for phase in (13, 14, 15):
    line = next(line for line in fases.splitlines() if line.startswith(f'| {phase} |'))
    assert '| PENDIENTE | NO OTORGADA |' in line, line
assert 'CA12-06 | PENDIENTE' in doc
assert 'NOTIFICATION_DELIVERY_ENABLED=false' in Path('.env.example').read_text()
assert not Path('.specify').exists()
assert not subprocess.check_output(['git', 'diff', '--name-only', '--',
    'supabase/migrations/202610*', 'supabase/migrations/202611011*',
    'supabase/migrations/20261102120248*', 'docs/evidencias/fase8',
    'docs/evidencias/fase9', 'docs/evidencias/fase10', 'docs/evidencias/fase11',
    'package-lock.json']).strip(), 'Entrega aceptada/dependencias alteradas'
paths = ['README.md', 'FASES.md', 'ESTADO_PROYECTO.md', 'docs/NOTIFICACIONES.md',
    'docs/PRUEBAS.md', 'docs/DECISIONES.md', 'specs/README.md']
count = 0
for name in paths:
    source = Path(name)
    for href in re.findall(r'\]\(([^)]+)\)', source.read_text()):
        if re.match(r'^(https?:|mailto:|#)', href):
            continue
        target = source.parent / href.split('#')[0]
        assert target.exists(), f'{name}: {href}'
        count += 1
print(f'OK: Fase 12 EN_REVISION, última completada 11; Fases 13–15 no autorizadas.')
print(f'OK: {count} enlaces locales; CA12-06 pendiente; correo real deshabilitado.')
print('OK: migraciones/evidencias aceptadas y lockfile conservados; Spec Kit ausente.')
