# inventarioTI2 — Inventario y control de bienes computacionales

## Ciclo vigente de modernización — 2026-11-03

**Migración FASES 0–4: COMPLETADAS por aprobación del usuario. FASE 5: EN_REVISION (aplicación/ensayos SQL Server BLOQUEADOS). FASE 6: NO AUTORIZADA.**

Autorización M5-A01: «apruebo fase 4 inicia fase 5», acepta entrega `9f84fcd`. [Candidato SQL Server](docs/migracion/05_ESQUEMA_SQLSERVER.md): 30 tablas/117 campos, 9 CHECK y 24 índices propuestos, barrera incondicional contra aplicación. DDL SQL Server verificado estática/sintácticamente, sin aplicarlo. M5-A05 instala y ensaya baseline existente en Supabase con datos sintéticos; fuentes de aplicación intactas, sin merge o despliegue.

M5-A02 confirma destino SQL Server 2016/13.x, compatibility_level 130 y pruebas iniciales en Supabase/PostgreSQL inventarioTI2. M5-A04 autoriza pausar inventarioTI y resuelve el cupo: inventarioTI INACTIVE; inventarioTI2 creado en sovicl/São Paulo, ACTIVE_HEALTHY, ref yhsfotxhaptinjtmrinn, PostgreSQL 17.11/UTC. M5-A05 ya instaló baseline 19 tablas/155 columnas, 2 unidades/3 funcionarios/6 bienes sintéticos y verificó 20 casos SQL con rollback; [validación y límites](docs/migracion/VALIDACION_SUPABASE.md). Sin HTTP/Auth real/UI ni validación del modelo SQL Server. Pendientes: decisiones M1-D aplicables, edición/SP/CU/collation/entorno SQL Server autorizado, soporte de 19 tablas/155 campos y ensayos de integridad/restore/rollback. Excel operacional ausente; sin perfilado real. Condiciones F1-SEG-01/02/03 conservadas. GitHub en rama dedicada; numeración de migración separada del desarrollo histórico (última completada 13, Fase 14 EN_REVISION, Fase 15 no autorizada). La aprobación de planificación no resuelve alternativas ni habilita producción.

Estado vigente (2026-11-02): **Fases 0–13 COMPLETADAS y aceptadas**, última D-37. **Fase 14 EN_REVISION** bajo D-37/D-38: [plan de despliegue y continuidad](docs/DESPLIEGUE.md), [runbook](docs/RUNBOOK_OPERACION.md), [checklist](docs/CHECKLIST_LIBERACION.md), CI sin deploy, salud/logs y ensayo de copia cifrada/restauración local. Resultados/límites en [PRUEBAS](docs/PRUEBAS.md). CA14-06 pendiente; F1-SEG-01/02/03 e integraciones gestionadas conservan bloqueos. Fase 15 sin autorización; correo real deshabilitado y **sin despliegue a producción**. Consultar [FASES](FASES.md) y [ESTADO](ESTADO_PROYECTO.md). Estados anteriores son antecedentes históricos.

La [revisión de pendientes de Fase 1](docs/CIERRE_FASE1.md) contiene las resoluciones aprobadas: UTC y respaldo semanal (RPO objetivo 7 días, RTO 8 h; copias 30 días). Validación legal de retención antes de datos reales, en F1-SEG-01. Chile y 250 funcionarios confirmados; bienes estimados 900–1.500, referencia 1.200.

Las instrucciones de la plantilla original se conservan a continuación como referencia.

Conjunto reutilizable de instrucciones y documentos para iniciar **un repositorio de proyecto nuevo**, usando un **modo guiado**: cada fase necesita aprobación expresa antes de comenzar.

## Uso rápido

1. Descarga y descomprime el ZIP.
2. Copia **el contenido de esta carpeta** a la raíz de tu repositorio (no copies la carpeta contenedora).
3. Si ya existen `AGENTS.md`, `README.md` u otros archivos, **fusiónalos con cuidado; no los sobreescribas**. Esta plantilla está orientada a proyectos nuevos.
4. Haz commit y envía los archivos a GitHub usando tu flujo habitual.
5. Abre el repositorio en Codex Cloud y envía:

   `Lee AGENTS.md y PROMPT_MAESTRO.md. Trabaja en modo GUIADO. Si el proyecto aún no está definido, haz la pregunta inicial. Prepara la propuesta de Fase 0 y solicita mi aprobación antes de comenzar a implementarla.`

6. Cuando definas el proyecto, reemplaza los marcadores `POR DEFINIR` de la documentación con hechos validados.
7. Mantén `ESTADO_PROYECTO.md` actualizado para continuar en nuevos chats.

## Estructura

- `PROMPT_MAESTRO.md`: metodología completa por 16 fases.
- `AGENTS.md`: instrucciones persistentes para Codex.
- `FASES.md`: fases, estados y registro de aprobaciones.
- `ESTADO_PROYECTO.md`: memoria de ejecución comprobable.
- `docs/`: requisitos, UX, arquitectura, datos, seguridad, pruebas, despliegue y manuales.
- `specs/`: especificaciones de funcionalidades; opcionalmente Spec Kit.
- `.gitignore`: patrones iniciales para evitar secretos y artefactos locales.

## Advertencias

- Descomprimir no configura por sí solo Codex Cloud, GitHub ni Spec Kit; requiere repositorio y entorno apropiados.
- Una instrucción en Markdown **no garantiza** que un agente no ejecute cambios no autorizados: revisa los permisos y propuestas de acciones.
- No subas claves de acceso ni datos sensibles al repositorio.
- Las carpetas `docs/` y `specs/` ya contienen plantillas para conservarse en Git.

## Revisar el prototipo de Fase 2

El skill [visual-system-designer](SKILL.md) fue incorporado por el usuario y aplicado. Guía, mapa de pantallas, decisiones, límites y aceptación registrada en [UX/UI](docs/UX_UI.md); resultados y capturas en [pruebas](docs/PRUEBAS.md).

Desde la raíz del repositorio, ejecuta:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo
```

Abre `http://127.0.0.1:4174/` en la misma máquina. Para revisarlo en tu equipo, descarga/clona el repositorio y ejecuta allí el mismo servidor local. No hay enlace público ni despliegue.

Recorrido sugerido: Resumen → Bienes → filtros → ficha de bien → registrar movimiento con motivo y confirmación → ficha del custodio → historial. Prueba también lectura en el selector de rol, reportes y los estados de carga/error en Acceso demo.

La demo usa datos sintéticos y cambios solo en memoria; recargar reinicia todo. No introduzcas datos reales. Las vistas de exportación y acceso son simulaciones; no hay backend, persistencia, seguridad efectiva ni envío de correos.

Pruebas UI: `PLAYWRIGHT_MODULE=/ruta/a/playwright CHROMIUM_PATH=/ruta/a/chromium PROTOTYPE_URL=http://127.0.0.1:4174 node tests/prototipo.cjs`. Playwright/Chromium deben estar instalados; no son dependencias de ejecución del prototipo. Las rutas concretas usadas están en docs/PRUEBAS.md.

## Arquitectura y continuidad

Fase 3 completada y aceptada por D-17: [arquitectura, costos y riesgos](docs/ARQUITECTURA.md), [contratos](docs/CONTRATOS_API.md), [ADR](docs/adr/FASE3.md). Selección técnica aceptada como diseño: React/TypeScript, API Node modular y PostgreSQL/Supabase; no hay implementación de servicios ni infraestructura contratada.

Verificación documental reproducible: `python3 docs/evidencias/fase3/verificar.py`; resultados y límites en [PRUEBAS](docs/PRUEBAS.md). Prototipo y evidencia visual conservados. El verificador conserva el estado de la entrega original; la revisión de este cierre está en PRUEBAS. Fase 4 aceptada por D-19; ver modelo y pruebas a continuación. Sin despliegue.

## Persistencia de Fase 4

[Modelo ER y reglas](docs/BASE_DATOS.md), [diccionario](docs/DICCIONARIO_DATOS.md), [migración](supabase/migrations/20261031053433_modelo_inicial.sql), [datos sintéticos](db/seed_prueba.sql) y [consultas](db/consultas.sql). Esquema privado con acceso cerrado; sin Auth, API ni worker funcional. El prototipo conserva sus datos efímeros y todavía no se conecta a esta persistencia.

Requiere Python 3 y Docker para ejecutar la suite aislada:

```sh
docker pull postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f
python3 tests/datos/verificar.py
python3 docs/evidencias/fase4/verificar_documentos.py
```

La suite crea y elimina exclusivamente sus recursos sintéticos, sin red ni puertos publicados. No acepta una base remota. Resultados y limitaciones en [PRUEBAS](docs/PRUEBAS.md). Fase 4 COMPLETADA por D-19. Fase 5 autorizada para un nuevo chat, ejecución pendiente; no se implementa aquí ni se despliega.

Los verificadores de Fase 3/4 conservan las condiciones de su entrega original; no verifican los cierres aprobados posteriores. La verificación documental de este cierre se registra en PRUEBAS.


## Inicio de Fase 5 en un nuevo chat

No puedo abrir automáticamente otro chat. Abre uno con inventarioTI2 y escribe:

> Inicia únicamente la Fase 5 de inventarioTI2, ya autorizada por D-19 en FASES.md y ESTADO_PROYECTO.md. Lee las instrucciones, la arquitectura y la persistencia aceptadas; presenta el plan y desarrolla autenticación con pruebas en un entorno aislado. Conserva los seguimientos y actualiza GitHub. No inicies Fase 6 ni despliegues.


## Autenticación — entrega de Fase 5

[Implementación, ejecución, criterios y pendientes](docs/AUTENTICACION.md). Node 24: `npm ci`, `npm run build`, `npm test` (requiere Docker e imágenes de prueba). Variables de servidor en [.env.example](.env.example), sin secretos ni cuentas de ejemplo utilizables. Sin despliegue; Fase 6 autorizada para un nuevo chat por D-21. El prototipo sigue siendo una referencia visual sintética, no una sesión real.


## Continuidad aprobada — Fase 6 en nuevo chat

Usuario acepta Fase 5 y autoriza iniciar únicamente Fase 6 en un nuevo chat (D-21). Recuperar main y seguir el punto de arranque al final de [FASES.md](FASES.md), sin volver a pedir esa autorización. Esta actualización solo registra el cierre; no inicia Fase 6 ni crea el chat. Los [pendientes operativos de autenticación](docs/AUTENTICACION.md) permanecen documentados; sin despliegue ni autorización de Fase 7.


## Entrega de Fase 6

Ver [SEGURIDAD](docs/SEGURIDAD.md) y [PRUEBAS](docs/PRUEBAS.md). `npm ci`, `npm run build`, `npm test` (Docker local requerido, datos sintéticos). `DATABASE_URL` ahora exige identidad SQL `inventario_auth` sin membresías ni privilegios de propietario. No se aprovisionan logins reales. Puerto de negocio separado listo para integración futura; ninguna API empresarial nueva ni despliegue.


Punto vigente — D-23: para continuar, abrir un nuevo chat e indicar «Inicia únicamente la Fase 7, ya autorizada en FASES.md y ESTADO_PROYECTO.md. Desarrolla Backend y API y actualiza GitHub. No inicies Fase 8 ni despliegues». El cierre actual solo registra continuidad; no inicia backend empresarial.


## Entrega de Fase 7 — 2026-10-31

Fase 7 EN_REVISION: [backend/API](docs/BACKEND_API.md) y [OpenAPI](docs/openapi-fase7.json). Para arrancar, se requiere BUSINESS_DATABASE_URL con identidad exacta inventario_runtime, separado de DATABASE_URL (inventario_auth). Aplicar migraciones solo en entorno autorizado; no hay credenciales predeterminadas. npm ci, npm run build y npm test (Docker local para pruebas sintéticas). Fases 8–15 no iniciadas; sin despliegue.


## Cierre de Fase 7 — 2026-11-01

Entrega aceptada por D-25. Fase 8 autorizada para un nuevo chat; no iniciada en esta tarea. Consultar continuidad vigente en FASES y ESTADO; los estados EN_REVISION anteriores son antecedentes.


## Frontend funcional — Fase 8 COMPLETADA (D-27)

React/Vite y BFF bajo el mismo origen: acceso/MFA, consultas/fichas/filtros/paginación y alta/edición de atributos de bienes. `npm run build` compila servidor y UI; `npm run test:ui` verifica navegador/BFF/PostgreSQL sintéticos (Docker y Chromium). Configuración, ejecución y límites en [FRONTEND](docs/FRONTEND.md). Fase 9 autorizada para un nuevo chat, ejecución pendiente; sin despliegue.


Punto vigente — Fase 9 COMPLETADA por D-29: [panel administrativo](docs/ADMINISTRACION.md), [manual del panel](docs/MANUAL_ADMIN.md) y [pruebas](docs/PRUEBAS.md). Última completada 9; Fase 10 autorizada para un nuevo chat, ejecución pendiente. Sin despliegue.


## Cierre de Fase 9 — 2026-11-01

Entrega aceptada por D-29. Fase 10 autorizada para un nuevo chat; seguir el plan de continuidad al final de [FASES](FASES.md). Esta tarea solo registra el cierre y no abre automáticamente otra conversación. Fases 11–15 sin autorización; sin despliegue. Los estados anteriores son antecedentes históricos.


## Cierre de Fase 10 — 2026-11-02

Entrega aceptada por D-31. Fase 11 autorizada para un nuevo chat; seguir el plan de continuidad al final de [FASES](FASES.md). Esta tarea solo registra el cierre y no abre automáticamente otra conversación. Fases 12–15 sin autorización; sin despliegue. Los estados anteriores son antecedentes históricos.


## Cierre de Fase 11 — 2026-11-02

Entrega aceptada por D-33. Fase 12 autorizada para un nuevo chat; seguir el plan de continuidad al final de [FASES](FASES.md). Esta tarea solo registra cierre/continuidad y no abre automáticamente una conversación. En el nuevo chat indica:

> Inicia únicamente la Fase 12 de inventarioTI2, ya autorizada por D-33 en FASES.md y ESTADO_PROYECTO.md. Presenta el plan de notificaciones y automatización, conserva los límites y actualiza GitHub. No inicies Fase 13 ni despliegues.

Fases 13–15 sin autorización. Sin implementación/envíos de Fase 12 ni despliegues en este cierre.


## Entrega de Fase 12 — 2026-11-02

[Catálogo, configuración, estados, API, verificación y pendientes](docs/NOTIFICACIONES.md). Administración → Seguimiento de avisos permite consultar intentos y registrar cancelación/reintento/conciliación con evidencia. `npm start` no envía avisos; el worker separado `npm run start:notifications` está deshabilitado por defecto y requiere configuración y autorización de envío propias. Ensayos sin llamadas a Resend ni mensajes reales. Fase 12 EN_REVISION; no iniciar Fase 13 ni desplegar.


## Cierre de Fase 12 — 2026-11-02

Entrega aceptada por D-35. Fase 13 autorizada para un nuevo chat; seguir el punto de continuidad al final de [FASES](FASES.md). Esta tarea solo registra cierre/continuidad; no crea automáticamente otra conversación. En el nuevo chat indica:

> Inicia únicamente la Fase 13 de inventarioTI2, ya autorizada por D-35 en FASES.md y ESTADO_PROYECTO.md. Presenta el plan de QA, rendimiento y seguridad, conserva los límites y actualiza GitHub. No inicies Fase 14 ni despliegues.

Fases 14–15 sin autorización. Sin ejecución de Fase 13, activación/envíos reales ni despliegues en este cierre.


## Cierre de Fase 13 — 2026-11-02

Entrega aceptada por D-37. Fase 14 autorizada para iniciar en un nuevo chat; seguir el punto de continuidad al final de [FASES](FASES.md). Este cierre solo registra aceptación/continuidad y no crea automáticamente otra conversación. Abre un nuevo chat con inventarioTI2 e indica:

> Inicia únicamente la Fase 14 de inventarioTI2, ya autorizada por D-37. Presenta el plan de despliegue, operación y continuidad, conserva los límites y actualiza GitHub. No inicies Fase 15 ni despliegues a producción.

Fase 15 sin autorización. Sin implementación de Fase 14, activación/envíos reales ni despliegues en este cierre. Los límites de QA y F1-SEG-01/02/03 se conservan.


## Entrega de Fase 14 — EN_REVISION

Plan, runbook y checklist enlazados al inicio. `npm run test:ops` reproduce el ensayo aislado de copia cifrada/restauración y las verificaciones de salud/logs/edad de copia; requiere Docker local, nunca DSN real. El workflow GitHub solo verifica. `npm start` conserva worker apagado y exige configuración externa; /health/live y /health/ready no sustituyen el smoke autenticado. Pendientes gestionados y aceptación CA14-06 explícitos. Producción no desplegada; Fase 15 sin iniciar.

## Demo React y GitHub Pages

**Demo publicada:** https://amsotov.github.io/inventarioTI2/ · datos ficticios, sin login. Publicación y recorrido de navegador verificados el 2026-11-03; [evidencia y límites](docs/DEMO.md#publicación-verificada--2026-11-03).

Esta demo es la aplicación React actual (`apps/web`); el prototipo histórico de `prototipo/` se conserva como referencia. No requiere credenciales, servidor, Supabase ni servicios externos.

```sh
npm ci
npm run demo
# Abrir la URL que imprime Vite (normalmente http://127.0.0.1:5173/).
```

`npm run demo` activa `VITE_DEMO_MODE=true` de forma compatible con Windows, macOS y Linux. También puedes definir esa variable al compilar. Entra directamente como **Administrador demo**; el selector del banner **Modo demo** permite pasar a solo lectura. Altas, edición, eliminación, asignaciones, devoluciones, traslados, cambios de unidad e historial usan exclusivamente datos sintéticos en memoria. Recargar reinicia todos los cambios y el rol. Los correos generan un mensaje visible, nunca un envío real. Excel y PDF se generan y descargan localmente con los datos filtrados de la demo; no son archivos privados alojados en servidor.

La navegación existente ya usa fragmentos (`#bienes`, `#funcionarios`, `#reportes`); no utiliza React Router y no necesita HashRouter. Recargar una ficha conserva la ruta, pero reinicia los datos: una referencia creada durante la sesión anterior deja de existir.

Para compilar como Pages (variables de entorno; ejemplo de shell POSIX):

```sh
VITE_DEMO_MODE=true VITE_BASE_PATH=/inventarioTI2/ npm run build
npx vite preview apps/web --config vite.config.js --outDir ../../dist/web --base /inventarioTI2/
```

Abre `http://localhost:4173/inventarioTI2/`. El resultado público es **`dist/web`**, no todo `dist` (que también contiene el servidor). `vite.config.js` lee `VITE_BASE_PATH`, con `/` por defecto; Vite ajusta los assets y los imports dinámicos a esa base. No hay imágenes, fuentes ni recursos remotos en la UI actual. Para futuros recursos de `public/`, utiliza `import.meta.env.BASE_URL`; para recursos de `src/`, utiliza imports de Vite.

En GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**. El workflow [deploy-demo.yml](.github/workflows/deploy-demo.yml) compila con Node 20 y publica solo `dist/web` al hacer push a `main` o al ejecutarlo manualmente desde Actions. La URL prevista es `https://amsotov.github.io/inventarioTI2/`. Revisa que el nombre del repositorio coincida con `VITE_BASE_PATH`. El entorno `github-pages` puede requerir aprobación según las reglas del repositorio. Crear el PR no activa Pages ni publica el sitio; después de integrarlo en `main`, el workflow hará la publicación si Pages está configurado.

El servidor normal mantiene su requisito **Node 24**, autenticación y API; `npm run build` sin `VITE_DEMO_MODE=true` conserva ese modo. El build estático de Pages se ha comprobado con Node 20.20.2; `npm ci` en Node 20 emite avisos de engines del servidor y sus dependencias, que no se ejecutan en la demo. No uses Node 20 para operar el servidor normal. Las variables VITE son públicas y se fijan al compilar: nunca incluyas secretos ni uses una compilación demo para operar datos reales.

Prueba de navegador de la demo, con `npm run demo` activo en otra terminal:

```sh
# Chromium instalado; ruta ajustable con CHROMIUM_PATH.
npm run test:demo
# Contra el build estático servido bajo la base:
DEMO_URL=http://localhost:4173/inventarioTI2/ npm run test:demo
```

El ensayo comprueba CRUD de bienes/funcionarios, asignación/traslado/historia, roles, descargas XLSX/PDF con contenido y recarga por hash, y falla ante solicitudes a API/servicios externos. No requiere Docker. El modo normal conserva sus suites `npm test` y `npm run test:ui`, con PostgreSQL sintético/Docker.
