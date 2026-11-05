# GitHub Pages conectado a inventarioTI2 — MTEST-A07

Solicitud: «Puedes conectarlo con sistema real y supabase desde GitHub Pages». Se conserva el proyecto **inventarioTI2 con datos de prueba**, las cuentas y los permisos existentes. Esta autorización permite actualizar la publicación mediante PR/CI; no certifica operación empresarial ni SQL Server 2016.

## Uso y despliegue

- Entrada conectada: https://amsotov.github.io/inventarioTI2/
- Demo anterior conservada: https://amsotov.github.io/inventarioTI2/demo/
- API: `https://yhsfotxhaptinjtmrinn.supabase.co/functions/v1/inventarioti2-pages-api`.
- **Publicado y verificado el 2026-11-05 UTC:** backend versión2 ACTIVE; PR5 integrado en main como `fc82ca3cd04717bdc11d8a1da12b583ea2c7ef47`. Pages41938254064 success. Manifiesto público `INTERFAZ_CONECTADA_SUPABASE_PRUEBAS`, SHA correcto y39 archivos verificados por hash.

Pages aloja React y los archivos estáticos. La API de Supabase ejecuta los mismos servicios Fastify/AuthService/Authorization/Inventory/PostgresLabModelBackend/Reports contra la base PostgreSQL existente; no se reemplaza el BFF por acceso directo a tablas. La demo conserva sus simulaciones exclusivamente bajo `/demo/`. Los bienes legacy y equipos modernizados siguen separados; esta publicación no realiza su migración.

Introduce el correo habilitado en Pages, solicita el enlace una sola vez, autoriza el último mensaje y vuelve a **la misma ventana de Pages**. Supabase sigue retornando al callback del sitio privado ya configurado; ese navegador necesita acceso como propietario a dicho sitio. No se cambian las URLs de Auth ni se consume la cuota SMTP con ensayos del agente. El mensaje de retorno puede mencionar el visor de Codex; el intento se reclama en la ventana donde se solicitó. La sesión del visor anterior no se transfiere a Pages: cada navegador/contexto inicia su intento.

## Fronteras de seguridad

1. `runtime.ts` reutiliza la inicialización existente, descifra el sobre AES-GCM únicamente con la clave automática del servidor y comprueba proyecto/deploymentId/origen/roles/TLS. El paquete de despliegue contiene el sobre cifrado fuera del repositorio; no incluye conexión operadora. La clave de servidor nunca se entrega al cliente.
2. `inventarioti2-pages-api` es una función separada. `verify_jwt=false` permite solicitar correo antes del login; las consultas/escrituras siguen requiriendo la sesión opaca y verificación de correo del BFF. No se considera CORS una autenticación. Función privada de Sites14 y Site8 permanecen intactos y solo propietario.
3. CORS admite exactamente `https://amsotov.github.io`, credenciales y los headers de JSON/CSRF/versión/idempotencia. Preflight de otro origen, métodos o headers no admitidos falla. Las llamadas sin Origin se rechazan. La lista se aplica al origen completo: otros repositorios del mismo usuario comparten ese origen de GitHub Pages y deben administrarse con igual confianza.
4. Tras validar Origin, el adaptador lo traduce al origen canónico ya esperado por el BFF y conserva el token CSRF. Solo reenvía las dos cookies propias y headers permitidos; ignora credenciales/configuración aportadas por el cliente. Cargas limitadas a8192 bytes antes de inicializar la base. Las rutas legacy de contraseña/MFA/autorizar no se exponen en la entrada Pages.
5. Cookies de sesión/intento: HttpOnly, Secure, SameSite=None y Partitioned; no se guardan tokens en localStorage ni se publican en la URL. La sesión se crea solo después de PKCE/getUser/correo confirmado y se reclama una sola vez desde el intento original. Usar navegador con cookies particionadas admitidas; navegadores que bloqueen este mecanismo necesitan otra solución de dominio/backend.
6. ETag exacto se expone por `X-Inventario-Resource-ETag` para evitar su transformación por el gateway. Se conservan If-Match, idempotencia, autorización transaccional y RLS FORCE. Exportaciones utilizan el mismo transporte con credenciales y respuesta binaria, sin URLs privadas en el bundle.
7. Ningún cambio DDL/semilla/ACL/Auth settings. Registro general Supabase pendiente de cierre para producción: `create_user=false` y búsqueda de cuenta de aplicación habilitada impiden que un signup externo obtenga permisos aquí. Roles, perfiles/bajas pendientes, SMTP, límites globales de rate del laboratorio y SQLServer siguen sin certificación productiva. Worker de negocio apagado.

## Archivos y verificación

- Transporte: `apps/web/src/transport.ts`, `api.ts`, `reports.tsx`; solo endpoint público permitido por compilación. El modo normal conserva rutas del mismo origen.
- Backend: `staging/pages/{index.ts,handler.mjs}`, inicialización compartida `staging/edge/runtime.ts`, empaquetador privado `scripts/staging/pages-package.mjs`. Su salida debe permanecer fuera de Git; no guardar sealed-runtime.json en fuentes.
- Publicación: workflow `deploy-demo.yml`, `scripts/build-pages-connected.mjs`, demo conservada y manifiesto con hashes. El workflow verifica demo y entrada conectada contra el backend antes de subir el artefacto. Publicar solo dist/web.
- `npx tsc --noEmit` y `npx tsc -p apps/web/tsconfig.json`: aprobados.
-18 pruebas dirigidas: origen/preflight/carga, no filtración, headers/cookies, proxy previo y PKCE/consumo atómico: aprobadas. Ensayos con proveedor/persistencia dobles identificados como tales.
- Chromium entre dos orígenes: clic simulado desde otro navegador activa la sesión original y persiste al recargar, sin transferir sesión al navegador del correo. Playwright intercepta las respuestas; los atributos CHIPS se comprueban además contra el servidor real, no a partir de esta intercepción.
- Chromium contra la API real: acceso por correo, CORS de GET/POST, rechazo401 sin sesión/inventario y cookie HttpOnly/Secure/SameSite=None/Partitioned con topLevelSite correcto. Solicitud a dirección `.invalid` inexistente devuelve respuesta genérica sin enviar correo ni crear sesión.
- Demo modernizada: recorrido completo aprobado, sin API/externos/errores. Evidencia nueva en [evidencias/pages](evidencias/pages/). CI completa anterior ce65adc/41900727140 aprobada; exigir también CI del nuevo SHA. No ejecutar Docker completo local por límite VFS, sin borrar volúmenes.

La activación real de la cuenta del destinatario y las escrituras desde su Pages quedan pendientes hasta que complete el correo. Una prueba sin sesión o con dobles no acredita ese paso.

## Retorno

Si falla la publicación, conservar diagnóstico/artefactos y restaurar el workflow estático anterior mediante commit revisable. Se puede volver a usar el sitio privado existente sin cambiar datos. No revertir SQL, credenciales, usuarios o sesiones por un rollback del frontend. No desactivar autenticación/CORS/CSRF para resolver un problema del navegador.

## Resultado remoto verificado

[PR5](https://github.com/amsotov/inventarioTI2/pull/5) integrado tras [CI41937672563](https://github.com/amsotov/inventarioTI2/actions/runs/41937672563) success:261 pruebas Node,4 ops,65 UI,330 total; cero vulnerabilidades y heurística de secretos aprobada. Árbol del merge coincide con `d5cd5d9` revisado. [Pages41938254064](https://github.com/amsotov/inventarioTI2/actions/runs/41938254064) y [CI postmerge41938253784](https://github.com/amsotov/inventarioTI2/actions/runs/41938253784) success.

La comprobación pública revisó el SHA de manifest y39 archivos por hash, además de Chromium sin intercepción contra Pages real: portada de acceso por correo, sin selector demo/contraseña; CORS funcional y consulta de equipos sin sesión rechazada401, sin errores JS. API rechaza origen ajeno403. La sesión real del destinatario desde Pages no se simuló y queda pendiente.

[Comprobante público](evidencias/pages/publicacion-verificada.json), [navegador publicado](evidencias/pages/navegador-publicado.log), [CI](evidencias/pages/ci.json) y [seguridad remota](evidencias/pages/seguridad-remota.json). Lectura agregada confirma7 equipos/3 funcionarios/6 bienes legacy/2 cuentas,40 tablas con RLS FORCE y ningún factor MFA; no se cargaron datos ni se crearon cuentas/sesiones reales en esta tarea. Advisor conserva únicamente la advertencia previa de protección de contraseñas filtradas deshabilitada. El conteo de una sesión no revocada no prueba vigencia ni sesión en Pages.

Estos comprobantes posteriores al despliegue se archivan en la rama de pruebas; no se modifica la publicación solo para registrar el resultado de su propia ejecución.
