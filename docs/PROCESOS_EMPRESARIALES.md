# Procesos empresariales — Fase 10

Entrega 2026-11-02 · COMPLETADA por aceptación expresa D-31; CA10-06 CUMPLIDO. Base limpia recuperada por avance directo a `22d93c4`. Codex implementa y verifica; el usuario acepta. Fase 11 autorizada para un nuevo chat, ejecución pendiente; fases 12–15 sin autorización; sin despliegue.

## Plan y alcance ejecutado

Plan presentado antes de implementar: funcionarios e identidad RUT/ID, pertenencias/unidades, asignación/devolución/traslado, condición, bajas/reactivación y correcciones inmutables. Insumos: requisitos D-14, diseño D-15, arquitectura D-17, datos D-19, autenticación D-21, seguridad D-23, API D-25, frontend D-27 y panel D-29. Se aplican guías cloud, Supabase y PostgreSQL; Spec Kit no instalado ni utilizado.

Archivos: `apps/server/processes/routes.ts`, `apps/web/src/processes.tsx`, composición en app/main, migración aditiva `20261101152945_procesos_empresariales.sql`, pruebas `tests/api/processes.test.ts` y `tests/ui/processes.test.ts`. Se preservan migraciones, prototipo y evidencia aceptados. La migración fue creada con CLI Supabase, aplicada únicamente a PostgreSQL efímero sintético.

- Alta/edición administrativa de funcionarios: documento RUT validado módulo 11 o ID institucional, forma canónica y unicidad también entre inactivos; nombre/cargo/unidad obligatorios, correo opcional válido. La edición mantiene persona e historia y exige motivo. No crea cuentas ni fusiona identidades. El ID institucional no debe usarse como otra presentación de un RUT.
- Pertenencia inicial y cambios de unidad con instantánea y fecha automática; unidad activa para nuevas pertenencias, rechazo de cambio sin efecto. Conserva bienes y no inventa traslados entre custodios. Renombrar unidad no reescribe evidencia histórica.
- Asignación solo a funcionario activo, bien activo bueno/regular sin custodia. Devolución requiere origen esperado vigente; admite malo y conserva condición. Traslado a funcionario activo distinto, bien activo bueno/regular; cierre y apertura comparten exactamente el instante del mismo movimiento.
- Condición independiente de custodia y situación. Pasar a malo conserva responsable; no devuelve ni da de baja. Bajas bloqueadas con custodia/bienes vigentes; reactivaciones administrativas auditadas sin restaurar custodias ni cambiar condición. Rechazo de estados idénticos.
- Historia de custodias, pertenencias, movimientos y anotaciones por ficha, con fechas UTC y referencias. Las anotaciones son inmutables; una compensación es un movimiento ordinario admisible con `corrige_id` del mismo bien. No revierte automáticamente custodias posteriores ni reescribe fechas/originales. No se aceptan actor, fecha efectiva, unidad histórica o estado arbitrarios del cliente.

## Contrato ejecutable

Todas las rutas bajo `/api/v1`. Consultas compartidas requieren sesión vigente; edición/operaciones requieren administrador con MFA, Origin y CSRF. Escrituras con `Idempotency-Key` UUID, `motivo` no vacío y `confirmado:true`; existentes además `If-Match: "vN"`. Éxito `{ref,version,aviso:"pendiente"}`, ETag; alta funcionario 201, demás 200. Anotación usa versión del bien del movimiento original. No envía correo.

| Método / ruta | Cuerpo específico / resultado |
|---|---|
| POST `/funcionarios` | documento_tipo RUT/ID, documento, nombre, cargo, unidad_id UUID, correo opcional/null |
| PATCH `/funcionarios/{uuid}` | Representación completa de documento_tipo/documento/nombre/cargo, correo opcional/null. Unidad y activo prohibidos; omitir correo lo limpia. |
| GET `/funcionarios/{uuid}/edicion` | Solo administrador; documento/correo y atributos/versiones para editar. Consultas compartidas conservan proyección sin esos datos. |
| POST `/funcionarios/{uuid}/pertenencias` | unidad_id UUID |
| POST `/funcionarios/{uuid}/estado` | activo booleano |
| POST `/bienes/{uuid}/movimientos` | tipo asignacion/devolucion/traslado/condicion/baja/reactivacion; destino UUID solo asignacion/traslado, origenEsperado UUID obligatorio devolucion/traslado, condicion solo cambio de condición. corrige_id entero positivo como string opcional. |
| POST `/movimientos/{id}/anotaciones` | texto de corrección, motivo y confirmación; versión esperada del bien |
| GET `/bienes/{uuid}/historia`, `/funcionarios/{uuid}/historia` | custodias, movimientos, pertenencias, anotaciones, vigentes y next por colección; zona UTC |

Historia: cada colección devuelve hasta 100 filas ordenadas por su ID (movimientos conservan orden de registro), más cursor `next`. Continuar con query `custodias=UUID`, `movimientos=ID`, `pertenencias=ID`, `anotaciones=ID` según colección; cursores de enteros son strings. No hay total ni instantánea entre páginas. `vigentes` consulta custodia actual por separado, sin depender de la página histórica. No es un reporte agregado ni una exportación.

JSON estricto sin propiedades desconocidas; cuerpo máximo 8192 bytes, textos hasta 2000 caracteres; correo HTTP máximo 320. 400 entrada inválida, 401 sesión, 403 permiso/MFA/CSRF, 404 referencia inexistente, 409 identificador/clave incompatible, 412 versión obsoleta, 422 regla empresarial, 428 versión requerida, 503 dependencia/configuración. Errores saneados y requestId, sin SQL ni datos internos.

## Transacciones y seguridad

Función privada `inventario.procesar`, search_path fijo, EXECUTE público revocado, propietario `inventario_servicio` NOLOGIN sin propiedad de tablas ni BYPASSRLS. RLS vuelve a exigir principal administrativo vigente; runtime mantiene denegación de DML directo. Grants limitados a tablas/columnas usadas por procesos y triggers. UPDATE(nombre) de unidades se requiere para FOR SHARE de validación/instantáneas; ningún comando habilita modificar unidades por esta función. No grants a anon/authenticated ni nuevas credenciales reales.

Se conserva Authorization, pools separados y contexto SQL LOCAL; sin Auth ni correo dentro del callback empresarial. Lock por actor/operación/recurso/clave, seguido de mutex transaccional de procesos y locks de bien, funcionarios ordenados y unidades. El mutex es una decisión conservadora de esta entrega; serializa comandos de Fase 10 y no acredita rendimiento objetivo. Estado + historia + auditoría anterior/nuevo + aviso pendiente con destinatario fijado + resultado durable se confirman juntos o se revierten. No hay resultados de éxito parciales.

Replay tras autorización recupera resultado original antes de comprobar versión vieja; huella JSONB del cuerpo. Otra carga con la misma clave produce 409. Versiones del bien avanzan en cualquier movimiento/anotación; las del funcionario en sus cambios. Restricciones existentes conservan unicidad, intervalos y evidencia inmutable. Fallo del outbox o falta de destinatario revierte todo. Los avisos permanecen pendientes: su procesamiento/envío corresponde a Fase 12.

Interfaz conserva diseño existente: formularios etiquetados, motivo/confirmación, cancelación sin persistir, historial, errores y paginación. Destinos se identifican por referencia de funcionario, visible en listado/ficha; unidades se seleccionan del catálogo paginado. Ante 412/428 se debe recargar y revisar; no sobreescribe. Ante pérdida de respuesta/5xx conserva comando, versión y clave en memoria para reintento exacto explícito; bloquea navegación por enlaces/otras acciones durante incertidumbre y advierte al recargar. No persiste comandos/secretos en localStorage; tras abandonar página/sesión se debe conciliar antes de repetir con otra clave.

## Criterios y límites

| Criterio | Evidencia |
|---|---|
| CA10-01 | Identidad, edición, pertenencias, bajas/reactivación de funcionarios y separación de cuentas; HTTP/SQL |
| CA10-02 | Asignación, devolución, traslado, condición y estado con reglas A-01 a A-06/P-02 |
| CA10-03 | Historia paginada, instantáneas, intervalos y anotaciones/compensación sin reescribir original |
| CA10-04 | Versiones, replay, denegaciones, carreras SQL independientes y rollback sin evidencia parcial |
| CA10-05 | Build, regresión, navegador con datos sintéticos, responsive y teclado; PRUEBAS/evidencias/fase10 |
| CA10-06 | CUMPLIDO por aceptación expresa D-31 el 2026-11-02 |

No probado: Supabase gestionado, advisors operativos, identidad/MFA gestionados, correo externo, dispositivos físicos/Safari, conformidad WCAG completa, carga objetivo, continuidad/producción. Advisors local sin stack en 54322 conserva error; no se presenta como superado ni se inicia infraestructura adicional. Changelog y documentación RLS consultados. Ensayos con PostgreSQL real y proveedor de identidad doble.

F1-SEG-01 (retención legal antes de datos reales), F1-SEG-02 (presupuesto), F1-SEG-03 (respaldo operativo) abiertos. UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Sin reportes/exportaciones, worker/envío, otras fases, datos/cuentas reales, permisos remotos, gastos o despliegues. Siguiente paso: iniciar únicamente Fase 11 en un nuevo chat, ya autorizada por D-31; no se ejecuta en este cierre.


## Cierre aprobado — 2026-11-02

D-31 acepta la entrega `888f8a2dda2a851db291209299c24eb7eb6be381` mediante «apruebo fase 10 y inicia en nuevo chat fase 11». Fase 10 COMPLETADA y CA10-06 CUMPLIDO. La aprobación conserva la evidencia y los límites operativos; no acredita Supabase gestionado, correo externo, carga objetivo ni continuidad productiva. Fase 11 autorizada para iniciar en un nuevo chat, sin implementación ni despliegue en este cierre.
