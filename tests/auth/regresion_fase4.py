"""Ejecuta sin modificar la suite histórica sobre su único modelo aceptado.
La suite original exige exactamente una migración. La composición de las dos
migraciones actuales se verifica en auth.test.ts, no con esta regresión histórica.
"""
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[2]
with tempfile.TemporaryDirectory(prefix='inventario-fase4-regresion-') as directory:
    target = Path(directory)
    shutil.copytree(root / 'tests/datos', target / 'tests/datos')
    shutil.copytree(root / 'db', target / 'db')
    (target / 'supabase/migrations').mkdir(parents=True)
    shutil.copy2(root / 'supabase/migrations/20261031053433_modelo_inicial.sql', target / 'supabase/migrations')
    print('Regresión histórica: suite y migración Fase 4 intactas, en copia temporal.', flush=True)
    subprocess.run(['python3', str(target / 'tests/datos/verificar.py')], cwd=target, check=True)
