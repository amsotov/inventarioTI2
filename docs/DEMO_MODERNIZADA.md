# Corrección de la demo modernizada — MPUB-FIX01

El usuario señaló «No está actualizado el demo». La comprobación pública confirmó título Inventario TI y encabezado Bienes. La versión anterior322aa13 sí había sido desplegada, pero solo incorporaba un enlace a revisión/prototipo/capturas: no satisfacía que la demo mostrara la modernización implementada. Se reconoce y corrige ese defecto funcional, sin atribuirlo a caché ni pedir autorización ya otorgada para publicar.

## Cambio visible

La URL principal sin hash abre **Equipos y relaciones**. El menú ofrece ese módulo primero; las vistas originales siguen disponibles bajo «Inventario anterior · muestra independiente». El banner identifica Modernización interactiva, datos ficticios en memoria, sin conexión a DB. El prototipo y la galería quedan como material secundario. Las mismas vistas React F7 muestran equipos, técnica/componentes/insumos, catálogos/organización, funcionarios/pertenencias, historia/custodia y mantenciones.

`demoModel.ts` es un módulo de navegador independiente de los dobles de backend. Se carga mediante import dinámico solo con VITE_DEMO_MODE=true. Incluye muestras con UUID, catálogos referenciados, 29equipos y tres personas ficticias. La UI puede crear/editar, completar técnica, simular asignación/devolución/traspaso/condición, consultar historia y registrar mantenciones. Los cambios viven en la pestaña y se descartan al recargar. Los informes actuales conservan sus datos de demostración propios, claramente separados; no se mezclan cifras de ambos modelos.

La simulación comprueba referencias/versiones/replay y mantiene las filas de historia durante las acciones de muestra. No se presenta como prueba de transacciones SQL, autorización real, auditoría durable o notificación. Las confirmaciones dicen cambio simulado/no se envió correo. Baja final/reactivación y compensaciones sin política ratificada continúan como operación no habilitada; no se define una regla empresarial por publicar una demo.

## Conservación y límites

La aplicación normal sigue con su ruta inicial Bienes, transporte HTTP v2, sesiones/permisos/CSRF existentes y composición PostgreSQL. No se modifican apps/server, SQL, fuentes/modelos o evidencia histórica. No se incorpora ModelContractDouble al producto, no se inventa un backend conectado, no se usa localStorage, fetch o SDK en demoModel y no se cambia Supabase/Auth/worker. Los datos sensibles reales no se introducen en la demo. La liberación empresarial del destino sigue bloqueada.

## Verificación y despliegue

Prueba nueva `node tests/demo/modernization.mjs`: con DEMO_URL ausente sirve el artefacto local en loopback efímero; con DEMO_URL prueba la publicación real. Verifica portada moderna desde la URL principal, paginación y filtros, cuatro fichas técnicas disponibles, catálogos, alta/edición de persona y equipo, componentes, pertenencia, asignación/traspaso e historia, mantención, rol lectura, reinicio y responsive. También exige cero llamadas API/externas y cero errores JS. Se integra como puerta del workflow Pages antes de subir/deplegar, tras instalar Chromium.

Se repite el ensayo anterior `DEMO_PUBLICATION_CHECK=true DEMO_URL=... npm run test:demo` para conservar CRUD, movimientos, roles, PDF/Excel, galería y prototipo. El build normal se comprueba separado: la semilla y demoModel no deben quedar en sus assets. El manifiesto público declara interactive_model_demo=true y entry=modelo/equipos, sin conexión a DB ni modelo de destino habilitado. [Evidencia local](evidencias/demo-modernizado/pruebas-locales.json).

La primera ejecución del nuevo ensayo detectó un selector ambiguo de prueba (dos dl en la ficha técnica); se acotó a la ficha y se repitió completo. No se presenta ese intento como fallo del producto ni como resultado aprobado. La publicación se integra mediante PR y CI del SHA concreto; después se verifican Actions, SHA/hashes públicos y el recorrido de navegador en la URL principal. Los resultados de publicación se registran aparte, sin reescribir evidencia previa.
