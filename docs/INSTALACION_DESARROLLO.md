# Instalación local y onboarding de desarrollo

2026-11-02 · Fase 15 EN_REVISION. El objetivo es comprender el código y reproducir su verificación con datos sintéticos. No hay cuenta inicial, credenciales utilizables ni arranque operativo de un solo comando. [Estado vigente](../ESTADO_PROYECTO.md) · [Criterios CA15](FASE15.md).

## Preparar el checkout

Requisitos: Git, Node **24.x** (`>=24 <25`), npm compatible con el lockfile y Python 3 para verificaciones auxiliares. Las suites integradas requieren Docker local accesible, imágenes fijadas y puertos loopback libres; UI requiere Chromium. PDF extremo a extremo requiere `pdftotext` de `poppler-utils`. No apuntar las suites a una DB existente.

Para una copia nueva:

```sh
git clone --branch phase14/ci-prerequisites-and-pages-guard --single-branch https://github.com/amsotov/inventarioTI2.git
cd inventarioTI2
git status --short
git rev-parse HEAD
node --version
npm --version
```

Comparar HEAD con el [PR #1](https://github.com/amsotov/inventarioTI2/pull/1), leer [AGENTS](../AGENTS.md), [PROMPT_MAESTRO](../PROMPT_MAESTRO.md), [FASES](../FASES.md) y ESTADO. Si ya hay checkout, revisar cambios y recuperar la rama sin reset ni sobreescritura; no reutilizar main como única fuente. No hacer push/merge a main: Pages publica main:/docs. Una rama de documentación no autoriza cambiar esa configuración.

## Verificación local sin credenciales de proveedor

Desde la raíz, en orden:

```sh
npm ci
npm run build
docker info --format '{{.ServerVersion}}'
command -v chromium
command -v pdftotext
node --import tsx --test --test-concurrency=1 tests/ui/frontend.test.ts
```

`npm ci` usa las versiones exactas del lockfile. `build` compila TypeScript de servidor/UI y produce `dist/web`; no despliega. El aviso de Vite sobre outDir fuera de `apps/web` es esperado por la estructura actual; un exit distinto de cero sí es fallo. El último comando abre Chromium sin ventana, crea PostgreSQL sintético, aplica **todas** las migraciones en orden y prueba acceso, MFA doble, lectura, edición, conflicto y reintento. El fixture arranca y detiene su BFF; no deja una aplicación interactiva en servicio. Las cuentas `.invalid` y el MFA de ese test son dobles exclusivos del ensayo, no accesos para `npm start`.

Con Chromium en otra ruta, anteponer `CHROMIUM_PATH=/ruta/absoluta/chromium` al comando UI. Las suites fijan por defecto `/usr/bin/chromium`; instalar el navegador de Playwright no cambia esa ruta automáticamente. Si se usa el navegador administrado por Playwright, obtener su ruta con `node --input-type=module -e "import {chromium} from '@playwright/test'; console.log(chromium.executablePath())"` y usarla como CHROMIUM_PATH. La instalación `npx --no-install playwright install --with-deps chromium` puede requerir permisos del sistema. No rebajar TLS ni quitar el proxy del entorno para descargar.

Las imágenes fijadas por digest en las fuentes incluyen PostgreSQL 17 y GoTrue local para `npm test`. Si el registro no está disponible, registrar el bloqueo; no sustituir por `latest`. Los tests crean/retiran solo recursos propios y usan puertos locales; la suite UI usa también puertos fijos: ejecutarla secuencialmente, sin otra suite/servidor en esos puertos. En entornos cloud comprobar primero que Docker sea el daemon local previsto según las instrucciones del entorno.

Comprobación ampliada, pertinente al código cambiado en futuras tareas:

```sh
npm test
npm run test:ops
npm run test:ui
npm audit --audit-level=high
```

No son pasos nuevos certificados por esta documentación: consultar [PRUEBAS](PRUEBAS.md#fase-15--documentación-capacitación-y-evolución) para lo ejecutado aquí. Algunas suites escriben evidencia en `docs/evidencias/fase8`, `fase13` o `fase14`; usar un checkout desechable y conservar salidas nuevas bajo `work/`, sin reemplazar evidencia aceptada. `tests/qa/secrets.py` también escribe en Fase 13. Ningún test valida por sí solo Supabase/Resend gestionados ni datos reales.

## Prototipo visual interactivo

Para explorar navegación sin servicios:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo
```

Abrir `http://127.0.0.1:4174/` localmente; Ctrl+C detiene el servidor. El selector de rol y los datos son simulados y efímeros; recargar reinicia. No acredita seguridad, persistencia, exportación ni correo. `npm run dev:web` es Vite visual sin proxy/API integrada, por lo que tampoco sustituye una instancia funcional del BFF.

## Arranque configurado: procedimiento, NO EJECUTADO aquí

`npm start` ejecuta [main.ts](../apps/server/main.ts). Exige DB/identidad, HTTPS y configuración externa; Node no carga `.env` por ese script. Inyectar variables mediante el gestor del proceso o un archivo local protegido fuera de Git, nunca valores reales en comandos compartidos, terminal grabada o frontend. El archivo [.env.example](../.env.example) contiene solo nombres y valores no secretos de control.

| Variable | Contrato y precaución |
|---|---|
| APP_ORIGIN | Origen HTTPS exacto sin path ni barra final; UI/BFF bajo el mismo origen |
| DATABASE_URL | DSN privado autenticado exactamente como `inventario_auth`; pool de acceso, sin propiedad/BYPASSRLS/membresías |
| BUSINESS_DATABASE_URL | DSN separado con identidad exacta `inventario_runtime`; negocio bajo autorización/contexto SQL LOCAL |
| SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY | Identidad configurada en servidor; secret key jamás en navegador/Git/logs |
| AUTH_ENCRYPTION_KEY | 32 bytes aleatorios codificados base64; custodia externa; no reemplazar sin plan de rotación/recifrado o revocación |
| HOST / PORT | `127.0.0.1` / `3000` predeterminados; `0.0.0.0` solo con ingress privado aprobado y acceso directo bloqueado |
| NOTIFICATION_DELIVERY_ENABLED | Mantener `false`; arrancar web no inicia worker |
| NOTIFICATION_DATABASE_URL / RESEND_API_KEY / NOTIFICATION_FROM | Solo worker separado y futura integración autorizada; no necesarios para build/ensayo sintético |

Para una instancia aislada configurada y **expresamente autorizada**:

1. Seleccionar destino/secretos/identidad de pruebas y resolver sus dependencias. No usar recursos productivos ni contratar por inferencia.
2. Inventariar destino, roles, ledger y compatibilidad; aplicar únicamente migraciones pendientes revisadas de [supabase/migrations](../supabase/migrations) en orden de nombre, con identidad de migración y errores fatales. En checkout vacío son ocho migraciones al 2026-11-02. No usar seed/fixture para provisionar un servicio gestionado ni `db reset`/`--clean`. Mantener esquemas privados, RLS y concesiones mínimas: no abrir Data API para facilitar el acceso.
3. Provisionar identidad y primera cuenta administrativa mediante procedimiento específico aprobado: la UI no crea el primer administrador ni existe cuenta por defecto. Verificar vínculo de identidad, MFA, sesiones, registro público deshabilitado y enlaces permitidos según [AUTENTICACION](AUTENTICACION.md) y [SEGURIDAD](SEGURIDAD.md). Correo de identidad requiere integración propia; el worker empresarial no la reemplaza.
4. Inyectar configuración y ejecutar build, después `npm start` detrás de terminación TLS del mismo origen. Este proceso no instala TLS ni carga archivos env solo. Mantener worker apagado. No activar `npm run start:notifications` ni envíos como paso de onboarding.
5. Verificar `/health/live`, `/health/ready` y smoke autenticado de ambos roles/MFA/CSRF/RLS/descarga privada. Salud 200 no acredita readiness de Auth ni permisos completos. Usar [checklist](CHECKLIST_LIBERACION.md) para cualquier promoción; aquí no se ha hecho una.
6. Detener con SIGINT/SIGTERM y conservar evidencia saneada. No borrar recursos ni datos ajenos. Copias/restauración/rollback: [runbook](RUNBOOK_OPERACION.md).

## Mapa para comprender y cambiar el proyecto

| Ruta | Responsabilidad y fuente |
|---|---|
| `apps/web/src` | UI React, cliente HTTP, panel, procesos, reportes y seguimiento de avisos; [FRONTEND](FRONTEND.md) |
| `apps/server/app.ts`, `main.ts`, `web.ts` | Composición BFF, políticas HTTP y archivos públicos permitidos |
| `apps/server/auth`, `security` | Sesiones, cifrado, adaptador Auth, permisos vigentes y pools/contexto LOCAL; [SEGURIDAD](SEGURIDAD.md) |
| `apps/server/inventory`, `admin`, `processes` | Servicios y rutas; [BACKEND_API](BACKEND_API.md), [ADMINISTRACION](ADMINISTRACION.md), [PROCESOS](PROCESOS_EMPRESARIALES.md) |
| `apps/server/reports`, `notifications` | Selección/exportación privada, outbox/worker independiente; [REPORTES](REPORTES.md), [NOTIFICACIONES](NOTIFICACIONES.md) |
| `supabase/migrations`, `db` | Migraciones inmutables y semillas/consultas sintéticas; [BASE_DATOS](BASE_DATOS.md) |
| `tests`, `ops` | Pruebas aisladas y ensayo de continuidad; [PRUEBAS](PRUEBAS.md), [RUNBOOK](RUNBOOK_OPERACION.md) |
| `.github/workflows/verify.yml` | CI de verificación sin deploy; no controla Pages legacy externo |

OpenAPI Fase 7 documenta su superficie histórica; contratos posteriores viven en documentación del módulo y rutas ejecutables. No asumir que describe toda la API actual. Spec Kit no instalado; no inventar comandos ni instalarlo por esta fase.

Antes de cambiar: revisar estado/autoridad y RF/HU/CR; reproducir el problema con datos sintéticos; cambio pequeño con prueba pertinente y documentación; diff sin secretos; commit en rama segura y comprobar SHA remoto. Preservar historia/auditoría/idempotencia y migraciones aceptadas. Una mejora del [roadmap](ROADMAP.md) no queda autorizada solo por estar listada.

## Comprobación de onboarding

La reproducción técnica de esta entrega usa worktree separado sin `node_modules` ni `dist` iniciales. Resultado/comandos en PRUEBAS. No hubo una persona desarrolladora nueva evaluando el material. Para esa validación futura registrar commit, versiones, pasos realizados sin ayuda, bloqueos/correcciones, tiempo observado y aceptación de la persona revisora; no marcarla hecha por una lectura automática.
