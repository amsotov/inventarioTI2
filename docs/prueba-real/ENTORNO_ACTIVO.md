# Ensayo conectado privado — 2026-11-04

> Estado vigente MTEST-A03: [acceso por correo sin MFA](ACCESO_CORREO.md). Las referencias de MFA/acceso automático que siguen documentan la publicación anterior.

Autorización vigente: «te autorizo a realizar los cambios para ver el entorno virtual funcionado»; continuación «retoma». Se publica únicamente el laboratorio sintético, sin iniciar otra fase ni liberar SQL Server.

Acceso: https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site/prueba

El hosting Sites exige acceso del propietario con su cuenta de ChatGPT. El portal ofrece **Entrar en modo lectura** y **Entrar como administrador**, sin distribuir contraseñas. La interfaz conserva su autenticación y el administrador debe completar/configurar TOTP con su autenticador. No cambiar la audiencia: el acceso automático de ensayo es exclusivo de este sitio privado.

## Publicación

- Site `appgprj_6aeb3ddf26808191bcaf65a58f2dd261`, fuente publicada `8a0a7b4ff850b4db21489cb7520dd5c92749c4d1`, versión 4, despliegue `appgdep_6aeb5b5ed3c08191aa835db0ed73748d`, succeeded, revisión de secretos 1.
- Backend `inventarioti2-prueba-runtime`, versión 8 activa, Supabase inventarioTI2 `yhsfotxhaptinjtmrinn`. Reutiliza el servidor compilado por inyección; gateway privado adicional, sesiones HttpOnly/Secure/SameSite=Strict, CSRF, Origin, MFA, locks y RLS existentes.
- Dos cuentas Auth sintéticas confirmadas y vinculadas expresamente al funcionario correspondiente; USUA_CLAVE_HASH NULL. Solo inventario_auth/runtime LOGIN, sin privilegios de propietario/superusuario/bypass ni membresías amplias.
- Configuración mínima cifrada AES-GCM en secreto de servidor Sites; clave de descifrado y clave Auth de servidor permanecen en el entorno automático de Supabase. Contraseñas/semillas TOTP/tokens/URLs SQL fuera de Git y del chat.
- No migración/semilla repetida, correos ni worker; inventarioTI anterior sigue pausado. Pages continúa separado. No se modifican los SQL Server ni sus barreras THROW.

## Comprobaciones

Autenticación remota de lector/administrador; MFA_REQUIRED antes del segundo factor y TOTP real verificado; catálogos, funcionarios y organización; alta del equipo sintético ENSAYO-REMOTO-20261104 con reintento idempotente que devuelve el mismo UUID y lectura persistente. El listado pasa de 6 a 7 por esa única alta autorizada.

Chromium sobre el sitio privado: listado completo, siete equipos, catálogos y filtros, sesión conservada tras recarga, cero errores JavaScript. Reportes legacy separados: XLSX de 3895 bytes y PDF de 13165 bytes, HTTP200 y firmas PK/%PDF válidas. Son datos legacy, no un reporte inventado del modelo nuevo.

La edición desde Chromium cambió el código a ENSAYO-REMOTO-20261104-UI y sobrevivió a la recarga. Se cerró la sesión administrativa del ensayo y se retiró exclusivamente el factor TOTP creado por esta prueba: el propietario puede configurar el suyo. El endpoint temporal de limpieza fue reemplazado por el BFF definitivo. El smoke final verificó MFA obligatorio sin factores heredados, roles de lectura, siete equipos persistentes, ETag fuerte, rechazo del backend sin gateway (403) y acceso anónimo al hosting rechazado/redirigido.

Pruebas locales dirigidas: 18/18 (contratos/datos UI, concurrencia de selectores y aislamiento del proxy). Compilación TypeScript y paquete conectado correctos; comprobación de secretos sin hallazgos. La suite completa local no terminó correctamente por falta de disco en Docker; no equivale a regresión funcional ni a suite completa aprobada. Se liberaron exclusivamente imágenes de ensayo y dependencias descargables, sin borrar volúmenes, fuentes ni evidencias históricas. CI de código fd106f5: ejecución 41866531321 observada en cola, todavía no aprobada. Se archivan [comprobantes sin secretos](evidencias/activo/deployment.json).

## Límites vigentes

Laboratorio privado con datos sintéticos, no liberación pública/productiva. Registro público Supabase Auth aún abierto (M8-R01), preflight público conservado. Perfiles modernos C03-17, bajas finales/reactivaciones/compensaciones y SQL Server 2016/130 siguen bloqueados según las matrices aceptadas. El advisor actual advierte que la protección de contraseñas filtradas de Auth está deshabilitada; no se modifica ni se oculta esta observación. El runtime Edge tiene límites de memoria/CPU/vida de petición; no se certifican carga, SLA ni RTO productivos. La validación de proveedor y locks se conservan en cada petición; las pantallas pueden tardar al cargar múltiples catálogos.

Para mantenimiento, usar la misma identidad Site, rama pruebas/entorno-real-supabase y PR #5. No publicar secretos, renovar o crear proyectos por inferencia. La imagen Docker previamente verificada ya no está en la caché local; el Dockerfile y las evidencias originales se conservan.
