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

La entrega original dejó el PR #2 preparado; posteriormente el usuario autorizó expresamente su integración y publicación. El primer CI remoto detectó `pdftotext` ausente (seis pruebas PDF fallidas); se incorpora `poppler-utils` a la preparación del runner y se repite CI antes de integrar. Publicación/validación pública en curso. Las pruebas locales no acreditan Supabase/Auth/correo gestionados, hardware/Safari ni continuidad productiva.


## Preparación de publicación — 2026-11-03

La API de configuración de Pages devolvió HTTP 403 con la credencial externa del entorno; Pages conservaba `build_type=legacy`, rama main `/docs`. El workflow selecciona ahora `build_type=workflow` mediante el token propio de Actions y el permiso `pages: write` que ya estaba declarado, antes de configurar y desplegar Pages. No se amplían permisos de la integración externa ni se usan secretos nuevos. Si la política del repositorio también deniega esa operación al workflow, será necesario seleccionar GitHub Actions en Settings > Pages desde una sesión administradora.
