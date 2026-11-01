# Autenticación — Fase 5

2026-10-31. Fase 5 COMPLETADA: entrega y cierre aceptados por D-21. Fase 6 autorizada para un nuevo chat; ejecución pendiente. La implementación fue realizada bajo D-19 y la solicitud de iniciar únicamente Fase 5. Arquitectura y persistencia aceptadas en [ARQUITECTURA](ARQUITECTURA.md) y [BASE_DATOS](BASE_DATOS.md); reglas D-14/A-08 sin rebajas.

## Plan y resultado implementado

BFF Fastify/TypeScript, puertos de identidad/persistencia y adaptadores Supabase Auth/PostgreSQL. Solo endpoints de identidad de [CONTRATOS_API](CONTRATOS_API.md), más `POST /api/v1/sesion/actividad` para actividad explícita con CSRF. No API empresarial, panel de cuentas, integración de pantallas de inventario, RBAC empresarial ni cambios al prototipo. React/Vite sigue reservado a su implementación futura.

- Contraseñas verificadas y almacenadas por Supabase Auth; ninguna tabla propia guarda contraseñas. No autorregistro, primer administrador, credenciales ni cuenta predeterminados. El puerto interno `issue(email,'invite')` opera exclusivamente sobre una cuenta pendiente ya existente; no tiene endpoint público. La administración futura deberá autorizarlo antes de invocarlo.
- Cookie `__Host-inventario`, aleatoria de 256 bits, Secure/HttpOnly/SameSite=Strict/Path=/; solo SHA-256 en DB. Sesiones y CSRF se generan en servidor; rotación tras MFA. Tokens del proveedor cifrados AES-256-GCM con nonce aleatorio y clave externa de 32 bytes; sin localStorage ni JWT del navegador. Clave ausente/inválida impide arranque; rotación de clave necesitará procedimiento y recifrado/revocación, no sustituirla sin plan.
- Cada consulta de sesión comprueba cuenta, estado y versión actuales, identidad del proveedor, revocación y reloj. 30 min de inactividad y 8 h absoluto, límites exclusivos exactos. GET/polling no renueva actividad; solo POST explícito con CSRF. Sesión administrativa parcial vence a los 10 min y no supera la comprobación de actividad autenticada hasta verificar TOTP/AAL2. Enrolar no basta; si ya existe un factor verificado, añadir otro exige AAL2. GET de sesión lista solo IDs/tipos de factores verificados para permitir el desafío, sin sus secretos. MFA de lectura disponible mediante los mismos endpoints. No recuperación autoservicio ni eliminación de factor verificado.
- Invitación 24 h y recuperación 30 min: token propio de 256 bits, huella almacenada, secreto del proveedor cifrado, supersesión de enlaces pendientes previos y consumo único bajo bloqueo transaccional. El plazo local limita el proveedor; el proyecto Auth deberá permitir al menos 24 h para el enlace de invitación. La pantalla `/acceso` recibe el token en fragmento, borra URL inmediatamente y solo consume con POST confirmado. GET y escáneres no consumen. Sin secretos en rutas de API, logs o respuestas de errores.
- Cambio de contraseña: persiste `processing`, bloquea credencial anterior, incrementa versión y revoca sesiones antes del efecto externo. Tras éxito obliga a nueva autenticación; una invitación de lectura activa la cuenta, una administrativa permanece pendiente hasta verificar MFA. Cuenta inactiva nunca se reactiva por recuperación. La siguiente operación falla para sesiones antiguas aunque tengan JWT válido.
- Generación de enlace también deja intención durable antes de llamar al proveedor. Timeout, caída tras efecto externo o resultado desconocido se conserva en `processing`/`uncertain`, sin repetirlo ciegamente. No hay transacción distribuida. Nuevas solicitudes quedan bloqueadas mientras una operación incierta requiere conciliación. Una caída entre pasos no se convierte en éxito ficticio.
- Recuperación pública siempre `202` genérico para cuenta existente, inexistente, inactiva o fallo externo. Sin garantía de tiempo constante frente a un observador de red: el proveedor se consulta durante la solicitud; endurecer tiempos/cola de generación antes de exposición pública. Limitación persistente por IP (30/min) y correo o sesión MFA (10/15 min), válida entre instancias. Cuerpo 8 KiB, campos extra rechazados, sin coerción; contraseña nueva 12–128 caracteres. Origin exacto en mutaciones y CSRF de sesión; no CORS abierto ni confianza en X-Forwarded-For.
- Correo de identidad al titular: sobre cifrado en `acceso.entregas`; `dispatchOne` reclama una sola entrega con SKIP LOCKED, descarta intenciones vencidas/supersedidas y llama al puerto `AuthMailer`. No hay proveedor SMTP/API ni envío configurado. Cierre local confirmado antes del cierre externo; si falla se registra tarea cifrada de conciliación. Un proceso muerto puede dejar `procesando`, que requiere revisión antes de cualquier reenvío. Esto no implementa notificaciones empresariales de Fase 12.

## Persistencia y ejecución

Nueva [migración aditiva](../supabase/migrations/20261031055416_autenticacion.sql), generada con `npx --yes supabase@2.122.0 migration new autenticacion`. Migración Fase 4 preservada literalmente. Añade `cuentas.credencial_lista` (false por defecto) y esquema privado `acceso`: sesiones, intenciones, entregas y límites, con FK/índices, RLS y sin concesiones públicas. Datos de sesión/intención internos en JSONB; validación de ciclo de vida en aplicación. Sin borrado automático ni plazos de conservación inventados. No exponer el esquema a Data API ni conceder acceso anon/authenticated.

Node 24, dependencias exactas y lockfile. Desde raíz:

```sh
npm ci
npm run build
npm test
```

Pruebas crean y eliminan exclusivamente contenedores/volúmenes/redes únicos de prueba. PostgreSQL y Auth locales, puertos efímeros solo en loopback y datos `.invalid`. No usan DSN ni credenciales del usuario. Ver fuentes, resultados y límites en [PRUEBAS](PRUEBAS.md).

Para arrancar una instancia de prueba autorizada: aplicar ambas migraciones a una DB vacía aislada, configurar externamente las variables de [.env.example](../.env.example) y ejecutar `npm start`. Node no carga `.env` automáticamente. Origen HTTPS obligatorio, servidor escucha en 127.0.0.1; TLS debe terminar en el mismo origen delante del proceso. No se ha configurado ese servicio ni un despliegue. Ninguna clave, contraseña o correo de persona se incluye en el ejemplo.

## Pendientes que bloquean aceptación operativa

- Proyecto Supabase gestionado de pruebas no configurado ni modificado: verificar claves publicable/secreta, correo, expiración OTP ≥24 h, desactivar registro público, URL permitidas, refresh y restricciones del plan. El contrato local impone recuperación 30 min. No atribuir al ensayo GoTrue la configuración de un proyecto remoto.
- Conectar un `AuthMailer` transaccional aprobado y comprobar entrega solo a buzones de prueba designados. La cola cifrada por sí sola no envía correos. Sin scheduler ni envío real en esta tarea.
- Privilegios SQL definitivos pendientes de Fase 6: la suite usa dueño sintético para probar persistencia. El BFF operativo necesitará rol sin propiedad/BYPASSRLS, políticas de identidad y columnas mínimas; no usar dueño ni service_role para negocio. No se abrieron permisos para hacer funcionar una demo. Toda tabla sigue cerrada por defecto para los roles ordinarios.
- Conciliación operativa de `processing`/`uncertain` y entregas `procesando`/`incierta`: verificar efecto en Auth con correlación, mantener cuenta bloqueada si no hay certeza, revocar sesiones y documentar resolución antes de emitir otra intención. No marcar completada ni reintentar por intuición. Recuperar MFA exige identidad verificada fuera de banda y autorización específica; no implementado como bypass.
- Integración UI de inicio/MFA/recuperación con diseño aprobado, revisión de accesibilidad y E2E de navegador pendientes; aquí existe BFF y pantalla dedicada de completar enlace. Sin modificación del prototipo.
- F1-SEG-01 retención legal antes de datos reales; F1-SEG-02 presupuesto sin aprobar; F1-SEG-03 operación de respaldo sin configurar. UTC, copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.

## Criterios y revisión

| ID | Criterio | Estado |
|---|---|---|
| CA5-01 | Acceso/salida, cookie opaca, cuenta vigente, sin secretos expuestos | Implementado y verificado localmente |
| CA5-02 | 30 min/8 h, revocación y polling con reloj controlado | Verificado con PostgreSQL real y doble de proveedor |
| CA5-03 | MFA administrativo, sesión parcial y rotación | Implementado; pruebas locales, ver PRUEBAS |
| CA5-04 | Invitación/recuperación, consumo único, expiración/reenvío y fallos | Implementado; entrega de correo e integración gestionada pendientes |
| CA5-05 | Build, pruebas, revisión de dependencias y documentación/GitHub | Evidencia en PRUEBAS y salida versionada |
| CA5-06 | Aceptación expresa y cierre | CUMPLIDO por D-21: usuario acepta la entrega y autoriza Fase 6 en un nuevo chat |


## Aceptación y límites conservados — D-21

El usuario indica «Apruebo fase 5 y en nuevo chat inicia fase 6», aceptando la entrega `6ab7229f2a89ca08fbd2f274377aa146386bc165`. Fase 5 COMPLETADA; la aceptación no acredita correo real, proyecto gestionado, UI completa ni privilegios operativos. Los pendientes anteriores siguen vigentes para su fase/puesta en marcha autorizada. No se rebajan contratos ni se repiten pruebas en este cierre documental. No se ejecuta Fase 6 aquí ni se despliega.


## Continuidad de Fase 6 — 2026-10-31

Integración de Fase 6: withPrincipal valida credencial disponible, cuenta/sesión/proveedor vigente y mantiene locks para autorización. El bloqueo de cuenta pasa a FOR NO KEY UPDATE para permitir FK de bitácora desde pool separado. main rechaza identidades SQL privilegiadas; DATABASE_URL exige inventario_auth. Ver SEGURIDAD. La aceptación D-21 y evidencias originales de Fase 5 conservan su alcance.


## Incremento de Fase 9 — 2026-11-01

Fase 9 habilita emisión administrativa de invitación/recuperación tras autorización y confirmación. El parámetro interno administrative permite recuperación de cuenta activa con credencial bloqueada por forzado; no cambia la restricción de la ruta pública. Alta pendiente y enlace externo son operaciones separadas; 202 no acredita envío. Integración gestionada continúa pendiente. Ver [ADMINISTRACION](ADMINISTRACION.md).
