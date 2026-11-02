"""Búsqueda heurística sin imprimir valores: árbol actual e historial Git alcanzable.
No sustituye un producto de detección de secretos ni garantiza ausencia de secretos.
"""
import json
import re
import subprocess
from pathlib import Path

rules = {
    'private-key': rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
    'github-token': rb'\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b',
    'provider-secret': rb'\b(?:sk_live_[A-Za-z0-9]{24,}|sk-proj-[A-Za-z0-9_-]{40,}|re_[A-Za-z0-9]{32,})\b',
    'aws-access-key': rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
    'signed-jwt': rb'\beyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{30,}\b',
}
compiled = {k: re.compile(v) for k, v in rules.items()}
findings = []

def inspect(data, location):
    if b'\0' in data[:8000]:
        return
    for name, pattern in compiled.items():
        if pattern.search(data):
            findings.append({'location': location, 'rule': name})

# Solo objetos locales alcanzables: ninguna llamada a cuentas/secretos externos.
objects = subprocess.check_output(['git', 'rev-list', '--objects', '--all']).splitlines()
blobs = 0
process = subprocess.Popen(['git', 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
for entry in objects:
    oid = entry.split(b' ', 1)[0]
    process.stdin.write(oid + b'\n')
    process.stdin.flush()
    header = process.stdout.readline().split()
    size = int(header[2])
    data = process.stdout.read(size)
    process.stdout.read(1)
    if header[1] == b'blob':
        blobs += 1
        inspect(data, 'git-blob:' + oid.decode())
process.stdin.close()
assert process.wait() == 0
paths = set(subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z']).decode().split('\0'))
files = 0
for path in sorted(p for p in paths if p and Path(p).is_file()):
    files += 1
    inspect(Path(path).read_bytes(), 'worktree:' + path)
result = {'method': 'heurística de cinco familias de patrones; sin análisis de entropía ni detección universal', 'reachable_commits': int(subprocess.check_output(['git', 'rev-list', '--all', '--count'])), 'history_blobs': blobs, 'worktree_files': files, 'rules': list(rules), 'findings': findings}
Path('docs/evidencias/fase13/secretos.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
assert not findings, 'Revisar coincidencias por ubicación; no imprimir valores'
