#!/usr/bin/env bash
# Run on the Linux machine where the browser will connect (or native WSL2 Docker).
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.."
for command_name in node npm docker openssl; do
  command -v "$command_name" >/dev/null || { echo "Falta $command_name. Revisa docs/ACCESO_VISTA_PREVIA.md." >&2; exit 1; }
done
node -e 'if(process.versions.node.split(".")[0]!=="24"){console.error("Se requiere Node 24.");process.exit(1)}'
docker_os=$(env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock info --format '{{.OperatingSystem}}')
if [[ "$docker_os" == *"Docker Desktop"* ]]; then
  echo "Este controlador usa el puente de un Docker Engine Linux nativo. Docker Desktop no está validado: utiliza Docker Engine dentro de la misma distribución WSL2/VM Linux." >&2
  exit 1
fi
if [[ "${1:-}" == "--comprobar" ]]; then
  echo "Prerrequisitos Linux disponibles. El acceso del navegador debe comprobarse desde ese mismo equipo."
  exit 0
fi
npm ci
npm run build
node ops/local/control.mjs start
echo "Abre https://localhost:8443/ en el equipo que ejecuta este servidor."
echo "Credenciales sintéticas: node ops/local/control.mjs credentials"
echo "Certificado/acceso: docs/ACCESO_VISTA_PREVIA.md"
