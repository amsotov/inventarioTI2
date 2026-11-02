# Contratos de integración — Fase 3

**Estado:** ACEPTADO como diseño por D-17 · 2026-10-31. Diseño de interfaces para [arquitectura](ARQUITECTURA.md), sin endpoints implementados. Reglas de negocio normativas: [CIERRE_FASE1](CIERRE_FASE1.md); no se amplía su alcance. Especificación ejecutable/OpenAPI y validadores concretos corresponden a Fase 7.

## Convenciones

API JSON UTF-8, mismo origen, prefijo `/api/v1`. Referencias opacas no documentales; RUT/ID nunca en ruta. Cookie de sesión opaca; toda mutación protegida valida CSRF y origen. Límite de cuerpo propuesto 64 KiB para comandos JSON, sin cargas de archivos. Rechazar campos desconocidos, tipos incorrectos, rangos invertidos y cambios no admitidos. Identificadores, normalización, condición/situación, motivos, fechas y transiciones conforme A-01 a A-06. Texto libre se guarda como texto, nunca HTML ejecutable. No existe borrado físico de historia o auditoría por API.

Respuestas de consulta `200`; creación `201`; aceptación de trabajo externo `202` con referencia/estado; cierre de sesión `204`. Error uniforme `application/problem+json` con `type`, `title`, `status`, `code`, `requestId` y errores por campo cuando proceda; sin SQL, stack, existencia de cuenta en recuperación ni secretos. Códigos: `400 INVALID_REQUEST`, `401 SESSION_REQUIRED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 STATE_CONFLICT`, `409 DUPLICATE_IDENTIFIER`, `409 IDEMPOTENCY_MISMATCH`, `412 VERSION_MISMATCH`, `422 BUSINESS_RULE`, `422 EXPORT_LIMIT`, `428 VERSION_REQUIRED`, `429 RATE_LIMITED`, `503 DEPENDENCY_UNAVAILABLE`. `requestId` generado o saneado en servidor, no es autorización. Recursos no visibles pueden responder 404 de forma consistente sin revelar contenido; administración prohibida responde 403.

Paginación de lista: `limit` por defecto 50, máximo 100; `cursor` opaco validado y vinculado a filtros/orden. Respuesta `{items, nextCursor, generatedAt, timezone:"UTC", dateField}`. Orden estable con referencia como desempate; filtros no conceden acceso. Un cursor no conserva una instantánea entre peticiones: cambios concurrentes pueden alterar páginas; la exportación usa una instantánea propia consistente. La búsqueda devuelve `bienes` y `funcionarios` con cursores separados. Una ficha incluye versión y ETag; no expone datos administrativos a lectura.

Filtros permitidos según recurso: `q`, `condicion`, `tipo`, `unidad`, `custodia`, `estado`, `desde`, `hasta`. `desde/hasta` son días `YYYY-MM-DD` UTC y selección inclusiva por día mediante fin exclusivo del día siguiente. Lista de bienes usa adquisición; funcionarios alta; asignaciones vigentes inicio; movimientos fecha efectiva; auditoría registro. No aceptar `dateField` arbitrario que altere el significado de un reporte. Unidad de movimientos coincide con origen o destino históricos; unidad de inventario es actual. La ausencia de adquisición se excluye solo con rango activo.

## Catálogo de interfaces

«Ambos» exige cuenta activa y sesión vigente; administrador también MFA válido. Consultas ordinarias y exportaciones mantienen campos autorizados por A-10/A-11.

| Método y recurso | Acceso | Entrada / salida y efecto |
|---|---|---|
| GET `/resumen` | Ambos | Métricas actuales autorizadas, instante de cálculo UTC |
| GET `/funcionarios`, GET `/funcionarios/{ref}` | Ambos | Filtros; ficha con pertenencia actual, bienes actuales/anteriores y cronología |
| POST `/funcionarios` | Administrador | Tipo/documento, nombre, cargo, unidad, correo opcional; devuelve ref/versión |
| PATCH `/funcionarios/{ref}` | Administrador | Campos editables y motivo; cambio de identidad auditado sin fusionar personas |
| POST `/funcionarios/{ref}/pertenencias` | Administrador | Unidad destino y motivo; conserva bienes e historia de unidad |
| POST `/funcionarios/{ref}/estado` | Administrador | Activo/inactivo y motivo; baja bloqueada con bienes |
| GET `/unidades`, POST `/unidades`, PATCH `/unidades/{ref}` | Ambos / Administrador / Administrador | Catálogo mínimo; nombre/estado, motivo en cambios; sin borrar referencias |
| GET `/bienes`, GET `/bienes/{ref}` | Ambos | Filtros; ficha con custodia e historial, condición y situación separadas |
| POST `/bienes`, PATCH `/bienes/{ref}` | Administrador | Tipo/marca/modelo/código, serie opcional y motivo ausencia, adquisición/observaciones; PATCH solo atributos, no custodia/condición/estado |
| POST `/bienes/{ref}/movimientos` | Administrador | Tipo asignacion/devolucion/traslado/condicion/baja/reactivacion; destino o condición solo cuando aplica; origen esperado, motivo, confirmación |
| GET `/movimientos` | Ambos | Fecha efectiva, origen/destino/unidades históricas, referencia de corrección |
| POST `/movimientos/{ref}/anotaciones` | Administrador | Texto/motivo de corrección, ref original; añade evidencia sin editar original; compensación usa nuevo movimiento ordinario |
| GET `/buscar` | Ambos | `q` y filtros por conjunto; bienes y funcionarios separados con proyección autorizada |
| GET `/cuentas`, POST `/cuentas/invitaciones` | Administrador | Listado sin secretos; nombre/correo/rol para crear operación de invitación pendiente |
| POST `/cuentas/{ref}/acciones` | Administrador | Cambiar rol/activar/desactivar/forzar contraseña/reenviar invitación, motivo/confirmación; propia cuenta protegida y último administrador |
| GET `/operaciones-identidad/{ref}` | Administrador | Estado de conciliación pendiente/completada/fallida, sin tokens o error crudo del proveedor |
| GET `/auditoria` | Administrador | Filtros por fecha registro, actor, entidad/bien/funcionario/acción; evidencia anterior/nueva minimizada |
| GET y PATCH `/configuracion/notificaciones` | Administrador | Destinatario vigente, versión; cambio con motivo y confirmación; evento nuevo/anterior según A-07 |
| GET `/avisos` | Administrador | Estado, correlación, propósito y último error saneado |
| POST `/avisos/{ref}/acciones` | Administrador | Cancelar pendiente/reintentar fallo/registrar conciliación; motivo y confirmación; incierto no dispara reenvío ciego |
| POST `/exportaciones` | Ambos, auditoría solo administrador | Tipo, formato xlsx/pdf y filtros; `202 {ref,estado:"pendiente"}` |
| GET `/exportaciones/{ref}` | Solicitante autorizado | Estado pendiente/procesando/listo/fallido/caducado, conteo y error saneado |
| GET `/exportaciones/{ref}/archivo` | Solicitante con permiso vigente | Archivo privado descargado por BFF; nueva validación de sesión/rol, sin caché pública |

Exportaciones: tipos inventario/por-funcionario/movimientos/por-condicion/auditoria/busqueda; columnas, orden y subtotales fijos A-11. Búsqueda XLSX separa conjuntos en hojas, PDF en secciones. El total combinado se usa contra el límite; nunca truncar ni exportar solo página visible. Trabajo conserva filtros normalizados, solicitante, fecha y campo temporal, y cuenta sobre instantánea usada para generar. Si cambia autorización, se cancela/deniega antes de generar o descargar. `EXPORT_LIMIT` se informa en estado fallido si el exceso se detectó en worker; vacío genera archivo válido. Propuesta técnica de caducidad 1 h, no política de retención de registros.

## Identidad y sesión

| Método y recurso | Contrato de diseño |
|---|---|
| POST `/sesion` | Credenciales al servidor por TLS; sesión parcial solo para enrolar/verificar MFA cuando aplica; ningún acceso de negocio sin completar |
| POST `/sesion/mfa/enrolar`, POST `/sesion/mfa/verificar` | Identidad ya validada; enrolamiento no sustituye verificación; secretos/códigos sin logs |
| GET `/sesion` | Estado/rol vigente, capacidades y tiempos de sesión, sin tokens; no renueva actividad por polling |
| POST `/sesion/salir` | Revoca sesión local y coordina cierre del proveedor; `204` sin acceso posterior |
| POST `/acceso/recuperar` | Respuesta genérica `202` con limitación de tasa; nuevo enlace invalida anteriores; cuenta inactiva no se reactiva |
| POST `/acceso/completar` | Intención de invitación o recuperación, token un uso y nueva credencial; expiración propia 24 h/30 min; consumo atómico local y conciliación externa |

Sesiones: inactividad 30 min y absoluto 8 h, nueva autenticación al vencer. El servidor calcula los plazos y nunca los acepta del cliente. Tokens/enlaces no viajan en rutas de API ni registros; recepción de enlace en pantalla dedicada debe limpiar URL y evitar filtración por referrer. Flujos de recuperación/MFA y acciones externas requieren máquina de estados y pruebas de capacidades en Fase 5; esta tabla no afirma que los endpoints nativos de Supabase satisfagan esos requisitos sin adaptación.

## Comandos, conflictos e idempotencia

Todo comando empresarial exige `Idempotency-Key` opaca de alta entropía y actor autenticado, cuerpo canónico y resultado durable. Cambios sobre recurso existente exigen `If-Match` de la versión observada; alta nueva no requiere ETag. Alcance de clave: actor + operación/recurso; guardar huella del payload normalizado, estado, respuesta y referencias. Misma clave/payload devuelve resultado conocido; clave/payload diferente devuelve 409. Una repetición idéntica confirmada se resuelve tras autorizar al actor y antes de comprobar la versión vieja: debe recuperar el resultado original sin nuevo movimiento, auditoría ni aviso. No reexponer datos a una cuenta que perdió permisos.

Claves de comandos confirmados no se purgan por un TTL arbitrario en el MVP; su retención queda ligada a política F1-SEG-01. No reutilizar claves. Cuando la primera petición aún está procesando, devolver conflicto reintentable/estado conocido, nunca ejecutar en paralelo la misma operación. Un rollback no produce cambio ni éxito durable; un timeout de respuesta tras commit se resuelve consultando/reintentando con la misma clave. Reintentar conflictos empresariales requiere refrescar ficha, nueva decisión y nueva clave, no un bucle automático.

Ejemplo sintético de contrato, no petición ejecutada:

```http
POST /api/v1/bienes/B-DEMO-01/movimientos
Content-Type: application/json
Idempotency-Key: 6a8711d9-27b0-4402-bd45-cba83b03018e
If-Match: "v7"
X-CSRF-Token: <token-efimero>

{"tipo":"traslado","origenEsperado":"F-DEMO-01","destino":"F-DEMO-02","motivo":"Cambio de custodio","confirmado":true}
```

```json
{"ref":"M-DEMO-01","bienRef":"B-DEMO-01","version":8,"fechaEfectiva":"2026-10-31T12:00:00Z","fechaRegistro":"2026-10-31T12:00:00Z","aviso":"pendiente"}
```

```json
{"type":"about:blank","title":"El recurso cambió; actualiza la ficha","status":412,"code":"VERSION_MISMATCH","requestId":"REQ-DEMO-01"}
```

Servidor comprueba versión, origen, condición, situación, destino activo/diferente, reglas de transición y unicidad bajo transacción. Devuelve ref/versión/fechas y aviso pendiente al confirmar; el estado de correo no altera éxito de movimiento. No acepta `actor`, fecha efectiva, unidad histórica o rol como autoridad del cuerpo. Cambios simultáneos de último administrador se serializan sobre la invariancia del conjunto, no solo la versión de dos cuentas distintas.

## Contratos internos y fallos externos

- `UnitOfWork.run(context, operation)`: una conexión/transacción, contexto RLS local, commit de estado + evidencia + outbox + resultado idempotente; rollback conjunto. No llamadas a correo/Auth dentro de la transacción SQL.
- Repositorios por módulo: consultas tipadas y comandos de estado esperado; solo adaptador conoce SQL. Identidad de actor procede de sesión verificada del servidor; no propagar DTO de petición sin validación.
- `IdentityProvider`: autenticar/verificar MFA/invitar/recuperar/revocar, con correlación y clasificación de fallos; operación persistente coordina intentos y conciliación. Evitar activar localmente una identidad cuya verificación externa falló.
- `NotificationProvider.send(logicalRef, recipient, template, minimalData)`: aceptado con ID, rechazado permanente/transitorio o incierto. Idempotencia del proveedor solo cuando esté documentada; lógica propia no garantiza ausencia de duplicación física ante fallos de red.
- Worker: adquisición exclusiva temporal, arrendamiento/recuperación tras caída, actualización condicional por intento. Si pudo haberse enviado antes de caer, pasar a incierto antes de permitir nuevo intento. Reintentos a 1/5/15 min; evento/destinatario/propósito no cambian.
- `ExportRenderer` recibe selección autorizada consistente y límites; `PrivateFiles` entrega solo al servidor, con caducidad. Evitar reabrir consulta sin instantánea que cambie conteos/contenido.

## Verificación futura obligatoria

Fases 4/7/10: doble asignación concurrente, identificador repetido incluso inactivo, origen/versiones desactualizadas, rollback sin auditoría parcial, timeout tras commit y repetición idéntica. Fases 5/6/9: JWT válido tras revocación, lectura directa a DB/API, fuga de contexto del pool, MFA, recuperación/reenlace y dos bajas de administradores. Fases 11/12: filtros idénticos, límites exactos/superados, fórmula en XLSX, permiso revocado antes de descargar, caída del worker tras enviar, incierto/conciliación y cambio de destinatario. Son contratos para pruebas futuras, no resultados ejecutados.


## Implementación parcial de Fase 5

Solo los endpoints de identidad están implementados en apps/server; se añade POST /sesion/actividad (cuerpo vacío, Origin y CSRF) para actividad explícita. GET /sesion no renueva actividad y devuelve rol/estado/MFA/plazos/CSRF, sin capacidades empresariales aún. No hay endpoint público de invitación ni contratos empresariales ejecutables. Detalle y pendientes en [AUTENTICACION](AUTENTICACION.md).


## Continuidad de Fase 6 — 2026-10-31

Fase 6 no agrega endpoints empresariales. Los futuros servicios deben usar Authorization.run con permiso estático, pool inventario_runtime y CSRF para mutaciones; nunca el pool Auth. main exige inventario_auth. Respuestas 413/415 conservan estado y códigos genéricos, CSP/cabeceras globales reforzadas. Exportaciones ordinarias deberán aplicar proyección positiva sin documento personal/correo. Ver SEGURIDAD.


## Entrega de Fase 7 — 2026-10-31

La superficie empresarial realmente implementada de Fase 7 está en [BACKEND_API](BACKEND_API.md) y [OpenAPI](openapi-fase7.json). El catálogo precedente conserva el diseño global; no equivale a endpoints habilitados. Listas/fichas de cuatro recursos y alta/edición de atributos de bienes implementados; límites y semántica de PATCH documentados.


## Incremento de Fase 9 — 2026-11-01

Fase 9 añade exclusivamente `/api/v1/admin/cuentas`, `/unidades`, `/avisos` y emisión explícita de enlace. Contrato, cuerpos, versiones/idempotencia y límites en [ADMINISTRACION](ADMINISTRACION.md). OpenAPI de Fase 7 conserva su superficie histórica; no es inventario global de nuevas rutas.


## Incremento de Fase 10 — 2026-11-02

Funcionarios, pertenencias, custodia, estados e historia/correcciones implementados con migración aditiva y UI/API. Contrato ejecutable, archivos, criterios y límites en [PROCESOS_EMPRESARIALES](PROCESOS_EMPRESARIALES.md). Los límites de entregas anteriores son antecedentes; OpenAPI Fase 7 conserva su superficie histórica. Fase 10 EN_REVISION; fases 11–15 sin autorización, sin despliegue.
