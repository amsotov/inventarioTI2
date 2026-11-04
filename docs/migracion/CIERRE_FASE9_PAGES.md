# Aceptación documental Fase 9 y consulta de GitHub Pages

**M9-A02:** «Apruebo fase 9 quiero ver la publicación GitHub Pages». Entrega aceptada:2376a580926dadb1af363f94d3ff74f05f377d34. F9 COMPLETADA_DOCUMENTAL; la migración del modelo de destino sigue NO_GO por los pendientes consignados. No hay fase10 definida ni aceptación de operación productiva. Los estados EN_REVISION anteriores describen las entregas previas a esta aceptación y se conservan como historia.

**Abrir demo:** https://amsotov.github.io/inventarioTI2/

Comprobación de lectura actual: HTTP200, título Inventario TI, pantalla Bienes, Modo demo visible, sin errores JavaScript en Chromium. [Evidencia](evidencias/cierre_fase9/pages.json). La consulta inicial de una ruta de listado de workflows no estaba soportada por el conector; el listado general y el run concreto sí se pudieron consultar. No se cambió configuración de Pages ni se ejecutó despliegue alguno.

Último despliegue observado: [41648235275](https://github.com/amsotov/inventarioTI2/actions/runs/41648235275), completed/success, commit511b99d64c97ff1917f279e78490f377a3f5239a de main. Las ramas F1–F9 no están integradas ni publicadas en Pages. No se debe presentar esta demo como sistema modernizado conectado a Supabase/SQLServer: los datos son ficticios, se mantienen en memoria y se reinician al recargar. No requiere credenciales.

El verificador documental F9 se ejecutó APROBADA sobre la exportación del commit aceptado antes de anotar esta aceptación. Código, SQL físicos, workflows, dependencias y evidencia F1–F9 se preservan. Las anotaciones solo actualizan continuidad/aceptación y registro de lectura. Los hashes F9 siguen correspondiendo al commit2376a58 y se validan allí, sin reescribirlos para este cierre.

Aclaración necesaria sobre M9-R01: README y DEMO documentaban que el build estático Node20.20.2 funcionaba y que Node24 se requiere para el servidor. El run observado confirma publicación correcta de main. La diferencia de runtime puede seguir revisándose al preparar un futuro paquete, pero no es evidencia de fallo de Pages ni exige modificar el workflow para consultar la demo. Esta aclaración no elimina los bloqueos de SQLServer, soporte/repositorios, identidades/perfiles, datos operacionales o M8-R01.

La instrucción permanente de guardar cambios en GitHub se aplica a este registro: rama documental propia, sin main, merge o nuevo deploy. La evidencia pública describe portada/disponibilidad, no un ensayo funcional completo ni una certificación de backend. No se repiten pruebas Node de aplicación para estas anotaciones documentales.
