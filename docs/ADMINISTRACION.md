# Panel de administración — Fase 9

2026-11-01 · Entrega EN_REVISION bajo D-27/D-28, base limpia `3dc4df2`. Codex implementa/verifica; el usuario conserva la aceptación CA9-06. Última fase completada: 8. Fases 10–15 PENDIENTE / NO OTORGADA; sin despliegue.

## Plan, alcance y archivos

Plan presentado antes de implementar: inspeccionar servicios aceptados, añadir operaciones administrativas privadas, integrar panel con diseño D-15, proteger propio registro/último administrador, verificar HTTP/SQL/concurrencia/navegador, documentar y sincronizar GitHub. Dependencias: requisitos D-14, arquitectura D-17, persistencia D-19, autenticación D-21, seguridad D-23, backend D-25 y frontend D-27. Se aplicaron las guías cloud, Supabase y PostgreSQL. Spec Kit no instalado ni utilizado.

Código en `apps/server/admin/routes.ts`, `apps/web/src/admin.tsx`, composición app/main y navegación; ajuste interno de emisión administrativa en AuthService. Migración aditiva generada mediante CLI Supabase 2.122.0: `20261101020230_panel_administracion.sql`. Pruebas nuevas en `tests/api/admin.test.ts` y `tests/ui/admin.test.ts`. Se conservan migraciones, prototipo y evidencias aceptadas.

- Cuentas: alta pendiente con nombre/correo/rol; edición de nombre, rol y estado, desactivación/reactivación y exigencia de nueva contraseña. Correo e identidad externa no editables; cuentas separadas de funcionarios. Dos roles fijos: administrador y lectura; no existe editor de permisos ni autorregistro. Todos los cambios invalidan sesiones anteriores por versión de autorización.
- Propio registro completo protegido en servidor/SQL, restricción deliberadamente más estricta que solo propio rol/autodesactivación: evita además el bloqueo de la cuenta propia desde dos pools. No se permite quitar o bloquear al último administrador activo con credencial disponible. Mutex transaccional, revalidación de principal tras adquirirlo y conteo vigente protegen frente a peticiones SQL concurrentes sin depender del lock global de Auth.
- Catálogo de unidades: alta, cambio de nombre, desactivación/reactivación lógica; unicidad canónica y referencias históricas conservadas. Tipos/condición/situación y roles mantienen los valores acordados, sin editor genérico ni nuevos procesos empresariales.
- Parámetro editable: destinatario del encargado. Primera configuración permitida; posteriores cambios exigen versión. Cambiar a la misma dirección se rechaza. Outbox fija destino al confirmar: activación al nuevo y sustitución al anterior, sin incluir la nueva dirección en la fila del aviso anterior. No se modifica el destino de avisos existentes. Plantillas/envío de Fase 12 siguen pendientes; ningún correo fue enviado.
- UTC, sesión 30 min/8 h y objetivos de respaldo semanal se muestran como políticas acordadas, sin ofrecer controles operativos inexistentes. No se inventan otros parámetros.

## Contrato ejecutable

| Método / ruta bajo `/api/v1/admin` | Comportamiento |
|---|---|
| GET `/cuentas`, `/unidades`, `/avisos` | Solo administrador con MFA. Proyección positiva sin proveedor/secretos. Listas de 50 y `nextCursor`; `?cursor=UUID` para cuentas/unidades; avisos singleton. Sin instantánea ni totales inventados. |
| POST `/cuentas` | nombre, correo, rol; crea pendiente sin credencial/identidad externa predeterminadas. |
| PATCH `/cuentas/{uuid}` | representación de nombre, rol y estado; `forzar` booleano opcional bloquea credencial hasta completar recuperación. No cambiar correo. |
| POST `/unidades`, PATCH `/unidades/{uuid}` | nombre; edición también exige activa booleano. |
| POST `/avisos` | destinatario; crear o sustituir configuración singleton. |
| POST `/cuentas/{uuid}/enlace` | `confirmado:true`; solicita invitación 24 h si pendiente, recuperación 30 min si activa. No admite inactiva. 202 no acredita correo enviado. Rate limiting y manejo durable de incertidumbre heredados. |

Cada escritura de estado exige Origin/CSRF, `Idempotency-Key` UUID, `motivo` no vacío y `confirmado:true`. Edición exige `If-Match: "vN"`; avisos también al sustituir. Respuestas 201/200 `{ref,version}` y ETag. JSON estricto y campos desconocidos rechazados, cuerpo máximo 8192 bytes; textos hasta 2000. Correo hasta 320 en HTTP. 400 validación, 401 sesión/revocación, 403 permiso/MFA/CSRF, 404 referencia, 409 duplicado/reutilización incompatible, 412 versión obsoleta, 422 regla propia/último administrador/credencial, 428 falta versión y 503 dependencia/configuración. Errores sin SQL ni secretos.

Función privada `inventario.administrar` con propietario NOLOGIN sin propiedad de tablas/BYPASSRLS, search_path fijo, EXECUTE revocado a PUBLIC y políticas RLS administrativas. Runtime solo puede ejecutar la función; no recibe DML directo. Estado + comando + auditoría + avisos pendientes se confirman juntos. Replay de misma clave/cuerpo/versión devuelve resultado original; cambiar cualquiera produce conflicto. Sin encargado configurado se revierte la operación; el panel permite configurarlo primero. Para unidades se genera auditoría sin inventar avisos no incluidos en A-07.

La invitación/recuperación es un efecto externo separado: alta/forzado no envía automáticamente enlaces. El operador usa el botón de enlace tras el cambio confirmado. Auth libera la transacción de autorización antes de entrar de nuevo en Auth y antes del proveedor. Fallos de identidad dejan intención incierta durable según Fase 5; nunca se presenta atomicidad entre proveedor y PostgreSQL ni se reintenta ciegamente un resultado incierto. Los enlaces no se devuelven al administrador. Forzar conserva estado activo pero bloquea credencial; solo la ruta administrativa permite solicitar recuperación en ese estado. La ruta pública conserva su restricción. Primera cuenta real fuera de alcance.

UI conserva comando/clave/versión en memoria ante 5xx o pérdida de respuesta y ofrece reintento explícito idéntico; impide otras escrituras y navegación por enlaces hasta resolver. Advierte al recargar/cerrar. 412 conserva formulario y exige recargar/revisar. Cancelar no guarda. Sin persistir secretos ni comandos en localStorage. Abandonar la sesión/página requiere conciliación antes de repetir una operación nueva.

## Criterios y límites

| Criterio | Evidencia |
|---|---|
| CA9-01 | Panel real de cuentas/dos roles, catálogo unidades y destinatario; permisos efectivos en servidor/SQL. |
| CA9-02 | Protección propia, MFA y último administrador; concurrencia real con conexiones SQL independientes. |
| CA9-03 | Versiones, replay, unicidad, auditoría/outbox atómicos y rollback ante fallo. |
| CA9-04 | Invitación/forzado con expiraciones 24 h/30 min e identidad doble; sesiones revocadas en próxima petición. |
| CA9-05 | Build, regresión, HTTP/PostgreSQL y navegador responsive/teclado; resultados y límites en PRUEBAS. |
| CA9-06 | PENDIENTE de revisión y aceptación expresa del usuario. |

No se acredita Supabase gestionado, advisors gestionados, correo externo, dispositivos físicos/Safari, conformidad WCAG completa, carga de producción ni continuidad operativa. El ensayo usa Docker/PostgreSQL real y roles mínimos con identidad doble; ningún dato/cuenta/permiso remoto real. La consulta de advisors local no encuentra stack Supabase en 54322: se conserva el error, sin declararla superada ni iniciar servicios ajenos al ensayo. Changelog/RLS vigentes consultados; no se usan Data API/JWT/metadatos editables para autorizar.

F1-SEG-01 (retención legal antes de datos reales), F1-SEG-02 (presupuesto) y F1-SEG-03 (respaldo operativo) siguen abiertos. UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Próximo paso: revisar esta entrega; Fase 10 requiere autorización independiente y no se inicia.
