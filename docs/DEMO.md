# Demo React — verificación y límites

2026-11-02. Incremento autorizado a Fase 14; EN_REVISION, sin modificar aceptación de fases ni publicar producción. Instrucciones de ejecución/publicación: [README](../README.md#demo-react-y-github-pages).

La frontera demo está en `api.ts` y la descarga de `reports.tsx`; el flag exacto `true` selecciona `demoData`. El resto de la UI utiliza los mismos contratos. Ninguna llamada demo cae al cliente HTTP por falta de una ruta: devuelve error local. No se importa el SDK de Supabase ni código del servidor en el navegador. Los datos se aíslan por pestaña y se descartan al recargar. Eliminación física solo aparece en demo; el modo normal mantiene bajas y controles reales. Los roles son demostrativos, no un mecanismo de seguridad productiva.

La exportación captura el conjunto filtrado al solicitarse y produce XLSX/PDF en el navegador; conserva caracteres latinos y no evalúa celdas como fórmulas. jsPDF se carga bajo demanda, sin utilizar su conversor HTML o recursos remotos. Las referencias de exportaciones son efímeras; los textos de privacidad/caducidad del flujo normal no representan garantías de la demo. Solo contiene datos sintéticos.

Prueba reproducible: arrancar `npm run demo`, ejecutar `npm run test:demo`. Para la compilación estática, compilar con las variables documentadas, servir `dist/web` en `/inventarioTI2/` y ejecutar `DEMO_URL=... npm run test:demo`. Chromium disponible en `/usr/bin/chromium`, ajustable por `CHROMIUM_PATH`. No requiere servicios externos ni Docker para la demo.

## Resultados

- `npm ci`: correcto; Node 24.19.0. `npm audit --audit-level=high`: cero vulnerabilidades.
- `npm run build` normal: correcto; 22 módulos, sin módulos de demo ni bibliotecas de exportación de navegador en el artefacto normal.
- Node 20.20.2: `npm ci` y build con `VITE_DEMO_MODE=true VITE_BASE_PATH=/inventarioTI2/`: correctos. Avisos de engines del servidor previstos; no se ejecuta servidor/Supabase bajo Node 20. Requisito operativo Node 24 intacto.
- `npm run demo` y `npm run test:demo`: correctos en Chromium, loopback. Alta/edición/eliminación de bien y funcionario, asignación/traslado/cambio de unidad, historia, rol lectura, correo simulado, descarga XLSX/PDF, edición temporal y filtros reflejados en los archivos, recarga que restaura los datos iniciales. Cero solicitudes API/externas y cero errores de navegador.
- Build demo estático servido bajo `/inventarioTI2/`: mismo recorrido `DEMO_URL=http://127.0.0.1:4173/inventarioTI2/ npm run test:demo`, correcto. Imports dinámicos y descargas funcionan con base; recarga por hash sin 404.
- `npm test`: 119/119 correctas (API, autorización y seguridad), PostgreSQL/identidad/correo sintéticos.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:ui`: 39/39 correctas del modo normal. Capturas/artefactos históricos regenerados por las suites se restauraron para conservar la evidencia aceptada.
- `git diff --check`: correcto.

Incidencias de preparación corregidas: adaptación de la firma v4 de write-excel-file y tipos TS; selectores estrictos del ensayo; caché Vite inválida tras `npm ci` durante prueba Node 20 (reinicio del servidor); primer intento de suite normal contra artefacto demo interrumpido y repetido completo contra build normal. No se presentan esos intentos como resultados satisfactorios.

No se repiten carga, axe ni continuidad/copia/restauración: no se modifican esos componentes. Las regresiones anteriores prueban los flujos normales con dobles; no acreditan servicios gestionados.

## Límites de entrega

La entrega original dejó el PR #2 preparado; posteriormente el usuario autorizó expresamente su integración y publicación. El primer CI remoto detectó `pdftotext` ausente (seis pruebas PDF fallidas); se incorpora `poppler-utils` a la preparación del runner y se repite CI antes de integrar. PR #2 integrado en main como `3917d9240aae0615a2cbddd8ac30d4e1f8cc3886`. CI [41549745378](https://github.com/amsotov/inventarioTI2/actions/runs/41549745378) completo y correcto. Las pruebas locales no acreditan Supabase/Auth/correo gestionados, hardware/Safari ni continuidad productiva.


## Preparación de publicación — 2026-11-03

La API de configuración de Pages devolvió HTTP 403 con la credencial externa del entorno; Pages conservaba `build_type=legacy`, rama main `/docs`. Se intentó seleccionar `build_type=workflow` mediante el token propio de Actions y el permiso `pages: write` que ya estaba declarado, antes de configurar y desplegar Pages; ese intento también fue denegado, como se registra a continuación. No se amplían permisos de la integración externa ni se usan secretos nuevos. Si la política del repositorio también deniega esa operación al workflow, será necesario seleccionar GitHub Actions en Settings > Pages desde una sesión administradora.


## Integración y bloqueo de configuración — 2026-11-03

PR #2 integrado tras CI correcto (build, 119 pruebas API/seguridad, operación, 39 pruebas UI, auditoría, escáner y árbol). El [primer despliegue](https://github.com/amsotov/inventarioTI2/actions/runs/41550155339) compila correctamente en Node 20, pero el token de Actions también recibe HTTP 403 al intentar cambiar la configuración de Pages. No se publicó esa compilación.

Se sustituye el cambio automático por una comprobación de solo lectura de `build_type=workflow`, con instrucciones claras si la fuente sigue siendo legacy. El mantenedor debe seleccionar **GitHub Actions** en [Settings > Pages](https://github.com/amsotov/inventarioTI2/settings/pages). Después basta ejecutar o reintentar `Deploy demo to GitHub Pages`; no hacen falta cambios de código ni nuevos secretos. En ese punto aún no se había verificado la demo pública. URL de destino: https://amsotov.github.io/inventarioTI2/.


## Publicación verificada — 2026-11-03

**Demo pública: https://amsotov.github.io/inventarioTI2/**

El usuario seleccionó GitHub Actions como fuente de Pages; la API confirmó `build_type=workflow`. Se reejecutaron los jobs fallidos del [despliegue 41550326656](https://github.com/amsotov/inventarioTI2/actions/runs/41550326656), commit `79913ae97939abccf2580793ac99a9d4290d0504`: build y deploy correctos, estado Pages `built` y despliegue `succeed`. El PR #2 está integrado. La documentación final posterior no modifica el código de la aplicación.

Comprobación HTTP de la URL pública: **200**. Primer intento inmediatamente después del despliegue devolvió 404 mientras Pages propagaba la publicación; repetido tras propagación, correcto.

`DEMO_URL=https://amsotov.github.io/inventarioTI2/ npm run test:demo`: **PASS**, Chromium real contra Pages. Verificados banner/entrada sin login; CRUD de equipos/funcionarios; asignación/traslado/cambio de unidad e historia; alternancia administrador/lectura; correo simulado; contenido de XLSX/PDF con edición temporal y filtros; rutas hash y reinicio de datos al recargar; cero solicitudes a APIs/servicios externos y cero errores de navegador. Las escrituras solo afectaron la memoria de esa pestaña; no hay backend de demo.

Configuración, publicación y verificación pública de esta demo completadas. Se mantienen los límites de pruebas/operación reales descritos arriba. No se cierra CA14-06 ni Fase 14 ni se inicia Fase 15 por publicar esta demostración sintética.

## Consulta de publicación tras aceptación Fase 9

M9-A02: usuario aprueba F9 documental y solicita ver Pages. Portada comprobada en https://amsotov.github.io/inventarioTI2/ con HTTP200, Chromium y banner Modo demo visible, sin errores JavaScript. Workflow41648235275 completado/success para main511b99d. No se lanzó otro workflow ni se promovieron ramas de migración. [Registro y evidencia](migracion/CIERRE_FASE9_PAGES.md).

Aclaración de M9-R01: esta documentación y README ya incluían build estático demo Node20.20.2 satisfactorio; Node24 sigue siendo el requisito del servidor normal. La diferencia de runtimes merece revisión en un futuro paquete, pero no demuestra fallo ni impide abrir la demo existente. Las ramas de modernización conservan sus bloqueos y no están desplegadas aquí.

## Publicación de modernización — MPUB-A01

Usuario «Publica los cambios de modernización» autoriza integrar y publicar Pages. [Plan y validación](PUBLICACION_MODERNIZACION.md). El build vigente usa Node24.19.0 y agrega acceso a modernizacion/, con prototipo F3 y capturas F7. Son revisión visual con datos ficticios; el modo demo no activa la API v2 ni conecta SQLServer. VITE_PAGES_PREVIEW=true selecciona el acceso de publicación y scripts/build-pages.mjs copia únicamente las fuentes visuales aprobadas a dist/web. El estado real del deploy se verifica en Actions/publicacion.json, sin inferirlo del build local.
