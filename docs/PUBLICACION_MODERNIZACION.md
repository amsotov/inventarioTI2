# Publicación estática de los cambios de modernización

**MPUB-A01:** usuario «Publica los cambios de modernización». Base de trabajo261088799b2a342d76dbb37fe47b8978739d61e6, descendiente de main511b99d64c97ff1917f279e78490f377a3f5239a. Autoriza PR/integración a main y publicación de Pages. Es una operación de publicación solicitada, no una fase10. F9 ya aceptada como documentación; sus pendientes de integración se conservan.

## Resultado preparado y alcance visible

La compilación incluye todos los cambios de fuente aprobados de las fases de modernización. En la demo se agrega **Modernización · vista previa**, que abre `/inventarioTI2/modernizacion/`: acceso al prototipo F3 y seis capturas auténticas de la interfaz React F7. La propuesta y las capturas se distinguen de operaciones reales. Pages no ejecuta el BFF ni SQLServer; la frontera v2 continúa cerrada en modo demo y su repositorio incompleto no se registra en main. No se inventan datos de un backend activo, reglas empresariales o éxito de escrituras.

El prototipo original y las imágenes de aceptación se copian sin cambios. scripts/build-pages.mjs valida hashes PNG, exige VITE_DEMO_MODE y VITE_PAGES_PREVIEW true y arma solo dist/web. Genera publicacion.json con SHA de origen de Actions, hashes del paquete y límites de integración. No publica dist/apps/server, .env, tests, SQL, diccionario o credenciales. El acceso adicional solo se activa en el build Pages, conservando modo normal y demo de desarrollo.

El workflow de Pages usa Node24.19.0, con checkout/setup-node fijados a los mismos SHA que el CI aceptado. VITE_BASE_PATH=/inventarioTI2/ conserva rutas/imports. No se cambia configuración de Pages ni permisos declarados. La diferencia histórica Node20/24 queda alineada para el paquete nuevo; su build demo previo funcionaba y no se presenta como defecto demostrado.

## Verificación y promoción

Build normal y build Pages aprobados localmente. Ensayo Chromium sobre paquete servido en su base real: CRUD de bienes/funcionarios, asignación/traslado/historia, roles, simulación de correo, contenido Excel/PDF, recarga por hash y cero llamadas API/externas; además acceso a revisión, seis imágenes cargadas y prototipo navegable. Archivo de prueba existente ampliado con DEMO_PUBLICATION_CHECK=true; sin ese flag conserva el recorrido de desarrollo. [Evidencia local](evidencias/publicacion-modernizacion/pruebas_locales.json).

Preparar PR a main y exigir CI Verify del SHA exacto antes de integrar. CI repite build, backend/seguridad, recuperación, UI, audit y heurística con fixtures locales; no toca Supabase. Integración autorizada sin force push; el workflow de main construye el artefacto final y Pages lo publica. No afirmar éxito remoto por éxito local. Comprobar el run, URL pública, publicacion.json.source_sha y recorrido de navegador sobre la publicación efectiva. El resultado operativo se observa en Actions y el manifiesto público; esta guía registra preparación previa al deploy.

## Límites y retorno

Sigue NO_GO para operación empresarial del modelo de destino: soporte/repositorios/escrituras, instancia SQLServer2016/130, reglas/collation, cuenta-funcionario/perfiles, fuentes operacionales y M8-R01 sin evidencia de corrección. Pages no requiere secretos, usuarios Auth, worker o conexión DB. No cambiar esos recursos por la publicación estática.

El sitio anterior procede de main511b99d. Si el artefacto nuevo falla, conservar run/errores, detener promoción y reparar o restaurar una versión estática anterior mediante commit/deploy trazable. No usar force push ni tocar datos. La integración histórica de fuente se conserva; el rollback de archivos estáticos no revierte DB. Esta autorización permite completar/reintentar la publicación solicitada, sin inferir permisos de operaciones ajenas.
