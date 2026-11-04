# Adaptador de prueba privado para Supabase Edge

Reutiliza Fastify.inject, AuthService, SupabaseProvider, Authorization, Inventory y PostgresLabModelBackend del servidor existente. No arranca HTTP Node, usa pools SQL de inventario_auth/runtime con TLS verificado y conserva las comprobaciones de rol, MFA, CSRF, Origin, idempotencia, RLS y transacción.

`index.ts` es fuente para Deno; no se incorpora al arranque Node ni al demo. Compilar primero con `npm run build`; `node scripts/staging/edge-package.mjs <metadata-publica.json> <salida.json>` empaqueta los JS y las versiones exactas del lock. Los metadatos contienen deploymentId, origin y gatewayHash SHA256, nunca el token. La fuente DejaVu se comprime/integra como módulo con su licencia para PDF; el renderer normal conserva Worker threads y ruta local de fuente. Reports.whenIdle permite EdgeRuntime.waitUntil sin activar el worker de notificaciones.

El único gateway aceptado posee un token aleatorio de 256 bits guardado como secreto en Sites. La configuración SQL de mínimo privilegio y Vault viaja como sobre AES-256-GCM; su clave se deriva de la clave automática del servidor Supabase y no sale de ese servidor. Se verifica versión, proyecto, origen, deploymentId, nombres de rol y hostname antes de abrir los pools. La clave de servidor se usa únicamente dentro de Supabase para Auth y descifrar el sobre. No devolverla por endpoints ni copiarla en secretos del frontend.

El aprovisionamiento inicial temporal reutilizó `bindTrialAccounts`, verificando dos usuarios sintéticos confirmados por Admin API y su vínculo explícito a funcionarios semilla. No envió invitaciones. El endpoint operante no contiene bootstrap, conexión postgres operadora ni ejecución SQL arbitraria. No repetir la migración, semilla ni bootstrap.

El proxy de Sites debe permanecer **solo propietario**: `/prueba` ofrece login de las dos cuentas sintéticas, por lo que nunca debe habilitarse audiencia pública. Inyecta las credenciales solo en servidor contra el login existente; no omite MFA. No es patrón de acceso productivo. Auth remoto aún permite signup: permanece el bloqueo M8-R01 para liberación pública; el preflight Docker no se relaja. El ensayo privado depende también del control de audiencia de Sites.

La invocación fija `x-region` y `forceFunctionRegion=sa-east-1`, como el SDK de Supabase; el adaptador elimina ese parámetro de transporte antes de validar el contrato de aplicación. Los selectores web limitan a dos las solicitudes simultáneas, conservando todas las páginas y validaciones. No hay cache compartida de sesiones/datos ni relajación de locks de autorización.

El gateway de Supabase transforma ETag en débil al comprimir. El BFF publica además su ETag exacto en una cabecera interna; el proxy valida su formato, la retira y restituye ETag con Cache-Control no-transform. No se deriva una versión del cuerpo ni se aceptan If-Match débiles. Prueba de regresión incluida.
