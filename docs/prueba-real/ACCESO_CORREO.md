# Acceso por enlace de correo y visor — MTEST-A03/A04

El usuario pidió desactivar MFA, identificó expresamente su correo administrador y precisó: «solo habilita que cuando llegue el correo la sesion queda habilitada al presionar la autorizacion por correo». También autorizó el visor integrado de Codex. Se implementa ese comportamiento en el laboratorio existente, sin otra fase ni liberación productiva. El correo real permanece en Auth/cuenta y configuración privada, fuera de GitHub.

Acceso: https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site/

## Flujo publicado y bloqueo actual

La pantalla pide el correo y ofrece **Enviar enlace de autorización**. No pide contraseña, TOTP ni copiar códigos/enlaces. El clic del correo retorna a `/auth/callback`, valida con Supabase y autoriza el intento original. El visor consulta el estado y recibe su sesión automáticamente, incluso si el correo se abrió en otro navegador. El navegador del correo debe poder acceder al sitio privado con la cuenta propietaria de ChatGPT; la audiencia no se amplía.

**Falta configurar la redirección en Supabase Auth.** Dos comprobaciones independientes mostraron fallback `http://localhost:3000/`: Admin API generateLink sobre la cuenta lectora sintética sin envío y GET público con token diagnóstico inválido (HTTP303, sin sesión ni consumo de tokens reales). La autorización del usuario no cambia la capacidad del conector: las herramientas disponibles no exponen actualización de Auth/URL Configuration ni acceso al panel autenticado.

En [Supabase → URL Configuration](https://supabase.com/dashboard/project/yhsfotxhaptinjtmrinn/auth/url-configuration) es necesario guardar:

- Site URL: `https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site`
- Redirect URLs: `https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site/auth/callback**`

Tras comprobar que Supabase acepta el callback, establecer `emailRedirectReady=true` en metadatos públicos de despliegue y volver a empaquetar/desplegar el mismo BFF. Actualmente está **false**: `EMAIL_REDIRECT_REQUIRED` evita enviar enlaces que regresarían a localhost. No retirar esta barrera sin comprobar el destino. El permiso de modificación ya está otorgado; falta la configuración técnica, no otra aprobación.

Supabase también devolvió `over_email_send_rate_limit` (HTTP429) en un reenvío posterior a la solicitud aceptada. No se reintenta automáticamente. El SMTP predeterminado admite solo destinatarios autorizados del equipo y pocos envíos por hora; para superar esa limitación se requiere configurar SMTP en el panel. No se capturan códigos del destinatario, se generan sesiones de prueba como prueba real ni se afirma recepción/validación real antes de su acción.

## Seguridad y persistencia

- Mismo UUID administrador, rol, estado y vínculo USUARIO–FUNCIONARIO. Cambiado el correo sintético por el proporcionado, sin confirmar manualmente la propiedad del nuevo correo. Retirado el factor TOTP por petición expresa.
- Sesiones previas revocadas y versiones incrementadas. Las sesiones nuevas llevan `method=email-otp`, `emailVerified=true`, `mfa=false`; no se simula AAL2. La política SQL exige esa prueba de correo además de cuenta activa, UUID, versión, revocación y vencimientos.
- Supabase PKCE S256: secreto de canje cifrado con Vault en `acceso.intenciones`, ligado a cuenta/UUID/correo/versión. El callback intercambia el código y comprueba getUser/correo confirmado. GET solo sirve la pantalla; JS borra parámetros de la URL antes del POST de autorización.
- El callback no entrega una sesión al navegador del correo. Solo el visor que posee la cookie HttpOnly del intento puede reclamar una sesión; consumo del intento y creación de sesión ocurren en una transacción. Revocación, caducidad, replays, cuenta distinta y códigos inválidos fallan cerrados. Una invitación vinculada puede activarse después de verificar su correo, preservando el rol asignado.
- `seguridad.principal()` exige `method`/`emailVerified`; RLS/ACL, locks, CSRF/Origin, contratos e idempotencia conservados. Los intentos de correo se separan de la recuperación/invitación para que no bloqueen esos flujos. El worker de negocio continúa apagado.
- Solo el proxy privado de Sites permite marcos de `'self'`, `https://chatgpt.com`, `https://*.chatgpt.com`, `https://chat.openai.com`, `https://codex.openai.com`; retira DENY en esas respuestas. No permite cualquier padre ni dominios de Sites de terceros. Cookies propias de sesión/intento: HttpOnly/Secure, SameSite=None y Partitioned para el visor. Se conservan Origin/CSRF y CSP de scripts/estilos/conexiones. El servidor general conserva su protección original.
- Eliminadas las cuatro variables de passwords/emails automáticos de hosting; `/prueba/entrar` devuelve410. Permanecen gateway privado y configuración cifrada. `AUTHENTICATION_METHOD=email-otp` y compilación `VITE_EMAIL_AUTH=true` explícitas para el laboratorio. No se modifica main ni Pages.

## Publicación y evidencia

- Supabase inventarioTI2 `yhsfotxhaptinjtmrinn`, BFF `inventarioti2-prueba-runtime`, versión **13**, hash `ddc5db9183442243c36aeb86145254bced014b9563971e2e36b8c11523ee14d6`. Endpoint temporal de configuración/diagnóstico retirado. Callback preparado y envío bloqueado por redirección pendiente.
- Site `appgprj_6aeb3ddf26808191bcaf65a58f2dd261`, solo propietario; fuente `1751200f25cfa4ed0d9906342a63e8ba13beb907`, versión **7**, despliegue `appgdep_6aeb7e26e274819187dbef7c914f3549`, succeeded, revisión de entorno2.
- Migración local CLI2.79.0 `20261104181614_autenticacion_correo.sql`, aplicada como `20261104181907 autenticacion_correo`. Primer intento sin SET ROLE rechazado y no aplicado. Corrección usa membresía SET existente, CREATE temporal revocado y propietario NOLOGIN inventario_contexto conservado. Sin recreación de tablas, semilla ni migración anterior.
- **37 pruebas dirigidas**: identidad/correo/UUID, cookies y CSRF, PKCE, expiración, cambios de permisos, sesión tras commit, única reclamación concurrente, aislamiento de recuperación y proxy del visor. Dobles explícitos de proveedor/persistencia, solo en tests.
- **Chromium local 1/1:** desde dos contextos distintos, un clic del correo simulado autoriza y activa automáticamente la sesión del visor original; persiste al recargar, sin MFA ni copiar códigos. Compilación conectada específica en carpeta temporal; sin cambios del bundle general de CI.
- Chromium contra publicación: marco de origen ChatGPT muestra acceso y padre ajeno bloqueado. No representa ejecución en el dispositivo Codex particular del usuario.
- PostgreSQL remoto: cuatro aserciones con rollback (MFA antiguo/correo no verificado/sesión revocada rechazados, correo verificado admitido). Estado remoto: 7 equipos, 3 funcionarios, 6 bienes legacy, 2 cuentas/Auth, cero factores MFA, cero RLS no forzada. No son pruebas de verificación del correo real.
- Una solicitud real de correo anterior fue aceptada HTTP202; dos enlaces posteriores rechazados como `otp_expired`, y un reenvío limitado HTTP429. La interfaz anterior de pegar código se conserva únicamente como evidencia histórica, no como comportamiento final.
- Suite completa local y prueba de recuperación Docker: no aprobadas por falta de espacio VFS. Se retiró solo la imagen de ensayo descargable, sin borrar volúmenes, fuentes ni evidencias. Usar CI del PR para la regresión completa. Advisor mantiene la advertencia de protección de contraseñas filtradas deshabilitada; registro público y SQL Server2016/130 siguen pendientes para liberación pública.

Evidencias sin secretos en `evidencias/correo/`. El correo real, verificadores, tokens y URLs SQL no se incluyen.
