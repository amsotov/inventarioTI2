# Matriz de QA — Fase 13

2026-11-02. Alcance D-35/D-36. Las rutas de prueba se refieren a suites ejecutables desde la raíz. La regresión final y su recuento están en [PRUEBAS](PRUEBAS.md#fase-13--qa-rendimiento-y-seguridad). `EJECUTADO local` acredita el comportamiento sintético observado; las integraciones y condiciones excluidas se enumeran abajo.

| RF / HU / aceptación de historia | CR | Verificación ejecutada local y archivo |
|---|---|---|
| RF-01 / HU-01 / CA-H01-1–4 | CR-01/02/04/07 | Identificación RUT/ID, duplicados, edición, pertenencia, estado e historia: `tests/api/processes.test.ts`, `tests/ui/processes.test.ts` |
| RF-02 / HU-02 / CA-H02-1–4 | CR-03/05 | Unicidad código/serie, ausencia con motivo, concurrencia/rollback y representación: `tests/api/api.test.ts`, `tests/api/processes.test.ts`, `tests/ui/frontend.test.ts` |
| RF-03 / HU-03 / CA-H03-1–3 | CR-05/08/10 | Custodia única, doble asignación, versión/replay y traslados contiguos: `tests/api/processes.test.ts` |
| RF-04 / HU-04 / CA-H04-1–5 | CR-04/05/06/08/10 | Devolución, traslado, condición, baja/reactivación, origen y fechas inválidas: `tests/api/processes.test.ts`, `tests/ui/processes.test.ts` |
| RF-05 / HU-05 / CA-H05-1–2 | CR-09/10 | Historia/anotación/compensación inmutables y paginadas: `tests/api/processes.test.ts`, `tests/security/security.test.ts` |
| RF-06 / HU-06 / CA-H06-1–3 | CR-11 | Claves completas de bienes/funcionarios (RUT original/canónico), fichas/historia, sin coincidencias e inyección literal: `tests/api/qa.test.ts`, `tests/api/processes.test.ts`, `tests/ui/reports.test.ts` |
| RF-07 / HU-07 / CA-H07-1–3 | CR-07/11/12/19 | Filtros combinados, unidad actual/histórica, bordes UTC y exportación completa: `tests/api/reports.test.ts`, `tests/ui/reports.test.ts` |
| RF-08 / HU-08 / CA-H08-1–3 | CR-16/18 | Denegaciones de lectura, sesión/MFA/CSRF/Origin/RLS; acceso administrativo directo restringido: `tests/security/*.test.ts`, `tests/api/*.test.ts`, `tests/ui/admin.test.ts` |
| RF-09 / HU-09 / CA-H09-1–3 | CR-15/16 | Cuentas/roles/estado/invitaciones, revocación, 30 min/8 h y MFA: `tests/auth/*.test.ts`, `tests/api/admin.test.ts`, `tests/ui/admin.test.ts`; correo/identidad gestionados NO EJECUTADOS |
| RF-10 / HU-10 / CA-H10-1–2 | CR-15 | Enlaces de un uso/30 min, supersesión y no reactivación: `tests/auth/auth.test.ts`, `tests/auth/provider.test.ts`; GoTrue local y dobles, entrega externa NO EJECUTADA |
| RF-11 / HU-11 / CA-H11-1–3 | CR-16 | Último administrador concurrente, propio rol/autodesactivación, confirmación/motivo y cancelación: `tests/api/admin.test.ts`, `tests/ui/admin.test.ts` |
| RF-12 / HU-12 / CA-H12-1–2 | CR-10/18 | Actor/estado/auditoría/outbox/comando atómicos, rollback e inmutabilidad: `tests/api/api.test.ts`, `tests/api/admin.test.ts`, `tests/api/processes.test.ts`, `tests/api/notifications.test.ts` |
| RF-13 / HU-13 / CA-H13-1–2 | CR-12/18/19 | Auditoría administrativa, filtros/fechas/proyección, permisos revocados: `tests/api/reports.test.ts`, `tests/ui/reports.test.ts` |
| RF-14 / HU-14 / CA-H14-1–2 | CR-13/14 | Destino fijado, cambio de encargado/activación/sustitución y permisos: `tests/api/admin.test.ts`, `tests/api/notifications.test.ts` |
| RF-15 / HU-15 / CA-H15-1–3 | CR-13/14/17 | Catálogo/minimización, exclusión, reintentos 1/5/15, caída/incierto/conciliación y negocio conservado: `tests/api/notifications.test.ts`, `tests/ui/notifications.test.ts`; primer intento medido con MailPort doble: `tests/qa/performance.ts`. Resend/entrega física NO EJECUTADOS |
| RF-16 / HU-16 / CA-H16-1–3 | CR-18/19/20 | Cinco reportes/buscador, XLSX/PDF completos/vacíos/límites/exceso, fórmulas, propietario/TTL/revocación: `tests/api/reports.test.ts`, `tests/api/qa.test.ts`, `tests/ui/reports.test.ts`; tiempos límite: `tests/qa/performance.ts` |

| RNF / CA transversal | Resultado y límites |
|---|---|
| RNF-01 / CA-N01 | EJECUTADO local: matriz cerrada, principal vigente, pools/LOCAL/RLS, MFA y revocación. Catálogo completo de 19 tablas privadas y funciones/roles: `tests/security/qa.test.ts`. Supabase gestionado/advisors NO EJECUTADOS |
| RNF-02 / CA-N02 | EJECUTADO local: unicidad, custodias/carreras SQL, último administrador, rollback/replay. Carga agrega exactamente 200 movimientos/auditorías/comandos/avisos; ningún estado parcial observado |
| RNF-03 / CA-N03 | EJECUTADO local: UTC, fecha efectiva frente a registro, días inclusivos y unidad histórica. Navegador configurado en Santiago |
| RNF-04 / CA-N04 | EJECUTADO local: proyecciones, avisos/archivos privados, secretos saneados; auditoría npm y búsqueda heurística de cinco familias de patrones en 35 commits/494 blobs alcanzables. Validación legal/retención F1-SEG-01 PENDIENTE; no se declara cumplimiento integral |
| RNF-05 / CA-N05 | EJECUTADO parcial: axe-core 4.14.0, teclado/foco/error/tabla, contraste CSS suplementario y tamaños 1440/820/390, ambos roles. `tests/qa/accessibility.ts`. Safari, dispositivos físicos, lector de pantalla y conformidad WCAG completa NO EJECUTADOS |
| RNF-06 / CA-N06 | REVISADO como diseño aceptado ADR-002; adaptadores existentes conservados. Migración/ejecución sobre SQL Server NO EJECUTADA; no se afirma portabilidad sin cambios |
| RNF-07 / CA-N07 y CR-17 | EJECUTADO parcial: muestra/carga/percentiles/exportación/aviso A-09, en loopback con dobles inmediatos. Disponibilidad mensual 99,5 %, respaldo/restauración semanal, RPO/RTO y continuidad productiva NO EJECUTADOS; fuera de esta fase, F1-SEG-03 conservado |

Los criterios CA13-01–06 de [QA_FASE13](QA_FASE13.md) consolidan esta matriz. Los criterios de cierre de Fases 0–12 ya aceptados no se reabren ni se sustituyen por resultados locales nuevos. CA13-06 CUMPLIDO por aceptación expresa D-37 el 2026-11-02; Fase 13 COMPLETADA con los límites y estados parciales de esta matriz conservados. Fase 14 autorizada para iniciar en un nuevo chat, ejecución pendiente; Fase 15 sin autorización. Sin despliegue en este cierre.
