# Notificaciones y automatización — Fase 12

2026-11-02 · COMPLETADA por aceptación expresa D-35. Base de ejecución `c348e873231cc6aaccf33d8c39d61f60943359e6`; entrega aceptada `377be1ac61a077606a4fa06b4986353c4a4fff0f`. Fase 13 autorizada para un nuevo chat, ejecución pendiente. Sin despliegue ni envío real.

## Plan y alcance ejecutado

Plan presentado antes de implementar: inspeccionar el catálogo A-07/A-08/A-10 y el outbox existente; incorporar puerto/adaptador de correo y consumidor independiente; seguimiento/acciones administrativas con permisos vigentes; ensayar minimización, destinatario, fallos, reintentos, concurrencia y UI; documentar y sincronizar GitHub. No se instala Spec Kit: `.specify` no existe y no se simulan comandos.

Se conservan las migraciones y entregas aceptadas. La nueva migración `20261102135006_notificaciones_automatizacion.sql` amplía el outbox y sus funciones privadas; fue creada con Supabase CLI 2.122.0. Solo se aplica en bases sintéticas efímeras durante pruebas, nunca en una instancia remota. No agrega vencimientos, aprobaciones, informes programados ni eventos sin regla empresarial aceptada.

## Catálogo implementado

| Propósito | Eventos existentes que consume | Destino y mensaje |
|---|---|---|
| `cambio_bien` | Alta/edición de atributos de bien | Encargado fijado al confirmar; entidad/referencia, acción, campos cambiados por nombre, actor por referencia de cuenta y registro UTC |
| `proceso_empresarial` | Alta/edición/estado/pertenencia de funcionario; asignación/devolución/traslado/condición/baja/reactivación/anotación de bien | Mismo criterio; fecha efectiva UTC cuando existe movimiento/pertenencia asociado |
| `cambio_cuenta` | Crear/editar cuenta, rol, estado y forzar credencial | Referencia de cuenta, acción, actor y registro; sin enlace o secreto de identidad |
| `activacion_avisos` | Alta/cambio del destinatario | Confirmación mínima al nuevo destinatario, sin dirección anterior ni detalle empresarial |
| `sustitucion_avisos` | Sustitución del destinatario anterior | Aviso mínimo al anterior, sin revelar la nueva dirección |

Los valores de RUT/ID personal, correo personal, nombres de personas, observaciones, motivos y cualquier texto libre de atributos no salen en los mensajes. La proyección positiva contiene solo referencias técnicas, nombres predefinidos de campos, acciones del catálogo y fechas del servidor. Mencionar que cambió el campo `correo` o `documento` no incluye su valor. El actor se identifica mediante la referencia de cuenta; sus detalles requieren acceso autorizado. No hay columnas arbitrarias ni lectura genérica de auditoría desde el worker. El enlace lleva al origen HTTPS autenticado configurado, sin tokens ni parámetros personales. Mensajes de texto plano; no se interpreta HTML ni se cargan URLs suministradas por usuarios.

Invitación, recuperación y segundo factor continúan en el canal de identidad del titular, separado de `inventario.outbox`; no se copian al encargado. Los trabajos de exportación Fase 11 también conservan su mecanismo independiente. Lecturas, búsquedas, exportaciones, rechazos y acciones de seguimiento no generan nuevos avisos. Un propósito fuera del catálogo se detiene como `fallido/CATALOG_REJECTED`, visible al administrador y sin llamada externa.

## Consumo y estados

El proceso empresarial sigue confirmando estado, historia, auditoría, outbox y resultado idempotente en una transacción local. El worker trabaja después del commit; el fallo de correo nunca revierte ni repite el cambio empresarial. La restricción única `(auditoria_id,destinatario,proposito)` y la idempotencia empresarial conservan un aviso lógico. Evento, propósito, destinatario y fecha original permanecen inmutables. Cambiar encargado afecta solo eventos futuros.

`reclamar_aviso()` utiliza `FOR UPDATE SKIP LOCKED`, orden estable por fecha/UUID y token de reclamación. Cada reclamación incrementa intentos totales, ciclo y versión, con arrendamiento de 60 segundos. El proceso independiente consulta cada segundo, un trabajo a la vez; pueden ejecutarse varios con la misma identidad limitada. El objetivo inicial ≤1 minuto requiere dimensionamiento/operación futuros: no se acredita bajo carga.

| Estado/resultado | Comportamiento |
|---|---|
| `pendiente` con fecha futura | No se reclama antes de `siguiente_en` |
| `procesando` | Exclusivo mediante token; una finalización repetida/tardía no cambia estado |
| Transitorio confirmado | Intento inicial y hasta tres reintentos a 1, 5 y 15 minutos desde el fallo anterior; después `fallido/RETRIES_EXHAUSTED` |
| Permanente | `fallido/PROVIDER_PERMANENT`, sin reintento automático |
| Timeout, excepción, respuesta ambigua o arrendamiento vencido | `incierto`, sin repetición automática; incluye caída después de posible envío o antes de guardar aceptación |
| `aceptado` | Proveedor aceptó el mensaje; no acredita entrega física ni lectura |
| `entregado` | Conciliación administrativa respaldada por evidencia; no se infiere de aceptación |
| `cancelado` | Conserva evento, destino e historial; no se despacha |

La expiración de arrendamientos se recupera al siguiente ciclo del worker, hasta 50 por ciclo, anexando intento incierto. Un proceso caído antes de llamar al proveedor también queda conservadoramente incierto: sin evidencia no puede saberse dónde cayó. Si falla la escritura final, no se vuelve a enviar desde el `catch`; se recupera por el arrendamiento. Los intentos son append-only y cada número es único por aviso. No se promete entrega física exactamente una vez.

## Adaptador y activación

`MailPort` separa el consumidor del proveedor. `ResendMail` usa la API HTTPS de Resend con texto plano, un destinatario, timeout de 15 segundos, redirecciones rechazadas y `Idempotency-Key: aviso-{uuid}` estable. Respuesta válida con ID → aceptado; 429 → rechazo transitorio; 400/401/403/404/405/413/422 → permanente; 408/409/5xx, transporte o respuesta inválida → incierto de forma conservadora. No se guardan cuerpos ni errores crudos; solo códigos fijos y referencia validada del proveedor.

La documentación de Resend indica deduplicación de claves durante 24 h. Eso no permite reenviar ciegamente un resultado incierto, tampoco después de vencer esa ventana. Un reintento manual mantiene correlación y contenido; la deduplicación del proveedor puede devolver la aceptación anterior. El registro propio es durable; la garantía del proveedor tiene límite temporal. No hay webhook público ni conciliación automática afirmados: el administrador verifica evidencia en el proveedor por un canal autorizado y registra su resultado. La integración externa real sigue pendiente.

`npm start` solo arranca la web/API y **no envía avisos**. Ejecutable separado: `npm run start:notifications`, bloqueado salvo `NOTIFICATION_DELIVERY_ENABLED=true` y configuración externa completa. Variables vacías en `.env.example`: `NOTIFICATION_DATABASE_URL`, `RESEND_API_KEY`, `NOTIFICATION_FROM`, más `APP_ORIGIN`. Node 24 no carga `.env` automáticamente; donde exista proxy de sesión debe conservarse su configuración/CA y habilitar soporte de proxy de Node según el entorno (`NODE_USE_ENV_PROXY=1`). No se incluyen credenciales ni remitente utilizable.

El rol exacto del worker es `inventario_worker`, sin propiedad, membresías, DDL ni BYPASSRLS; solo ejecuta reclamar/finalizar. La migración crea roles sin login y no aprovisiona contraseñas. `inventario_avisos` es un propietario técnico sin login de funciones privadas, con permisos mínimos y políticas específicas; no es dueño de tablas ni un administrador de aplicación. Se conserva separación Auth/negocio y contexto SQL LOCAL. No se conceden accesos a `PUBLIC`, `anon` o `authenticated`.

Antes de activar en un entorno operativo se necesita autorización concreta de envío, buzones/dominio/remitente de prueba, proveedor/costo/tratamiento de datos y credenciales. Verificar dominio/SPF/DKIM/DMARC, supresión/rebotes y capacidades reales del proveedor corresponde a esa integración autorizada. Nada de ello se configura por esta entrega. No arrancar el worker sobre pendientes reales por inferencia.

## API y administración

Solo administrador activo con MFA y sesión/versión vigentes. GET usa permiso administrativo de consulta; POST exige además Origin, CSRF, motivo, confirmación, Idempotency-Key y If-Match. RLS vuelve a comprobar al principal actual. No cambia la protección de cuenta propia/último administrador.

| Ruta bajo `/api/v1` | Contrato |
|---|---|
| GET `/avisos?estado=&cursor=` | Estado cerrado opcional; cursor UUID y orden estable por UUID; máximo 50, `nextCursor`; destino original, propósito, fechas, estado, contadores, versión, referencia/código saneado |
| GET `/avisos/{uuid}` | Detalle y todos los intentos ordenados; sin contenido de auditoría ni token de reclamación |
| POST `/avisos/{uuid}/acciones` | `accion`, `motivo`, `confirmado:true`; versión y clave obligatorias; respuesta con ref/estado/versión y ETag |

Acciones:

- `cancelar`: pendiente o fallido, sin borrar evidencia. No cancela en vuelo ni declara ausencia de envío de un incierto.
- `reintentar`: solo fallido; reinicia el ciclo de hasta cuatro intentos manteniendo totales, destinatario y correlación. Catálogo rechazado no es reintentable.
- `conciliar`: solo incierto o aceptado, con `evidencia` obligatoria. Incierto admite aceptado/entregado/no_enviado/permanente; aceptado admite entregado/permanente. `no_enviado` pasa a fallido y requiere otro acto explícito para reintentar. Evidencia/motivo son administrativos, sin secretos y sin correo nuevo.

Las acciones se serializan por fila y clave; el replay devuelve el mismo resultado antes de comprobar versión. Distinto cuerpo/versión con la misma clave →409; versión obsoleta →412; versión ausente →428; transición no permitida →422. Comando/estado/auditoría se confirman juntos. No se edita un destinatario existente ni se genera otro aviso para estas acciones.

Interfaz: Administración → Seguimiento de avisos. Filtro, paginación, detalle/intentos/UTC, recarga, estados carga/vacío/error, motivo/confirmación y conciliación. Ante respuesta perdida conserva cuerpo/versión/clave y ofrece recuperar el resultado; bloquea otras operaciones/navegación hasta resolver. Fechas del producto siguen UTC aunque el navegador use Santiago.

## Verificación y criterios

Reproducir desde la raíz con Node 24, Docker local y Chromium: `npm ci`, `npm run build`, `npm test`, `npm run test:ui`. Los ensayos usan PostgreSQL real efímero, identidad doble y correo doble/HTTP sustituido; nunca llaman a Resend ni crean cuentas/datos reales. Evidencias y recuentos finales en [PRUEBAS](PRUEBAS.md).

| Criterio | Resultado |
|---|---|
| CA12-01 | Catálogo A-07, proyección positiva y destino fijado; cambio de encargado sin redirección ni fuga al anterior |
| CA12-02 | Exclusión/token/arrendamiento, intentos append-only, reintentos 1/5/15, permanente/agote/incierto y caída sin duplicación automática |
| CA12-03 | Fallo externo conserva negocio; cancelación/reintento/conciliación con evidencia, versión, replay y auditoría atómicos |
| CA12-04 | Roles SQL mínimos/RLS, principal/MFA vigentes, Origin/CSRF y denegaciones; UI sin destinatarios para lectura |
| CA12-05 | Build/regresión y recorridos de navegador, teclado/responsive, dependencias/documentación/GitHub verificables en PRUEBAS |
| CA12-06 | CUMPLIDO por aceptación expresa D-35 del usuario el 2026-11-02 |

Pendientes conservados: integración Resend real y buzones autorizados; identidad/Supabase gestionados, advisors sin stack local, autenticación de dominio/rebotes, hardware/Safari/accesibilidad completa, carga objetivo, operación/supervisión y continuidad productiva. No se presume residencia en Chile ni cumplimiento legal. F1-SEG-01/02/03 abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Fase 13 no iniciada; sin despliegue.


## Cierre aprobado — 2026-11-02

D-35 acepta la entrega `377be1ac61a077606a4fa06b4986353c4a4fff0f` mediante «Apruebo fase 12 y inicia en nuevo chat fase 13». Fase 12 COMPLETADA y CA12-06 CUMPLIDO. Se conservan resultados/evidencias, destinatario inmutable, minimización, reintentos/conciliación y todos los pendientes anteriores. No acredita envío real, integración gestionada, carga objetivo ni continuidad productiva. Fase 13 autorizada para iniciar en un nuevo chat; no se ejecuta en este cierre. Continuidad en [FASES](../FASES.md) y [ESTADO](../ESTADO_PROYECTO.md).
