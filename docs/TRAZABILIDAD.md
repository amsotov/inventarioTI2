# Matriz de trazabilidad — Fase 1

**Fecha:** 2026-10-31 · **Estado:** COMPLETADA.

Fuentes: [REQUISITOS.md](REQUISITOS.md), [ANALISIS_EMPRESARIAL.md](ANALISIS_EMPRESARIAL.md) y [HISTORIAS_USUARIO.md](HISTORIAS_USUARIO.md). Módulos y valor conservados de [VISION.md](VISION.md). CA-Hxx-n son criterios para pruebas futuras, no evidencia de ejecución. El sufijo «todos» refiere a todos los criterios de la historia indicada. A/P resueltos en su alcance de Fase 1 por D-14, sin confundir aceptación con ejecución funcional. Seguimientos F1-SEG-01/02/03 en CIERRE_FASE1.

## Requisitos funcionales y valor de los módulos

| RF | Módulo y razón de negocio | Proceso / actores | Reglas | Historia / criterios verificables | Decisiones aplicables |
|---|---|---|---|---|---|
| RF-01 | M01: identificar responsables y pertenencia | PR-01; ACT-01/ACT-03 | RN-02/RN-07/RN-11 | HU-01; CA-H01-1 a CA-H01-4 | A-01/A-03/A-05 |
| RF-02 | M02: identificar equipos y evitar duplicados | PR-02; ACT-01 | RN-03/RN-18 | HU-02; CA-H02-1 a CA-H02-4 | A-02/P-02 |
| RF-03 | M03: custodia única por bien | PR-03/CU-01; ACT-01/ACT-03 | RN-04/RN-15/RN-16 | HU-03; CA-H03-1 a CA-H03-3 | A-03/A-04/A-06 |
| RF-04 | M03: reconstruir devoluciones, traslados, condición y baja | PR-03/CU-02 a CU-05; ACT-01/ACT-03 | RN-05/RN-07/RN-16/RN-18 | HU-04; CA-H04-1 a CA-H04-5 | A-03/A-04/A-05/A-06/P-02 |
| RF-05 | M03: conservar evidencia original | PR-03/CU-06; ACT-01/ACT-02 | RN-06 | HU-05; CA-H05-1 y CA-H05-2 | A-04 |
| RF-06 | M04: localizar bien y custodio con historia | PR-04; ACT-01/ACT-02 | RN-01/RN-04/RN-06 | HU-06; CA-H06-1 a CA-H06-3 | A-05/A-06 |
| RF-07 | M04: acotar resultados reproducibles | PR-04; ACT-01/ACT-02 | RN-14/RN-16 | HU-07; CA-H07-1 a CA-H07-3 | A-05/A-06 |
| RF-08 | M05: proteger escritura y permitir consulta | PR-05 y transversal; ACT-01/ACT-02 | RN-01/RN-15 | HU-08; CA-H08-1 a CA-H08-3 | P-01 ratificada en auditoría |
| RF-09 | M05: controlar altas y vigencia de cuentas | PR-05; ACT-01 | RN-08/RN-09/RN-11 | HU-09; CA-H09-1 a CA-H09-3 | A-08 |
| RF-10 | M05: recuperar acceso sin divulgar credenciales | PR-05; titular ACT-01/ACT-02 | RN-10 | HU-10; CA-H10-1 y CA-H10-2 | A-08 |
| RF-11 | M05: mantener administración activa | PR-05; ACT-01 | RN-09/RN-15 | HU-11; CA-H11-1 a CA-H11-3 | A-08 |
| RF-12 | M06: atribuir y proteger evidencia de cambios | PR-06; ACT-01 | RN-06/RN-11 | HU-12; CA-H12-1 y CA-H12-2 | A-10/P-01 |
| RF-13 | M06: investigar cambios concretos | PR-06; ACT-01; ACT-02 sin auditoría | RN-11/RN-17 | HU-13; CA-H13-1 y CA-H13-2 | P-01/A-06/A-10 |
| RF-14 | M06: dirigir avisos sin cambiar código | PR-06; ACT-01/ACT-04 | RN-12 | HU-14; CA-H14-1 y CA-H14-2 | A-07/A-10 |
| RF-15 | M06: seguimiento automático de cambios | PR-06; ACT-04, origen ACT-01 | RN-13/RN-19 | HU-15; CA-H15-1 a CA-H15-3 | A-07/A-10/P-04 |
| RF-16 | M07: revisión y distribución de información autorizada | PR-07; ACT-01/ACT-02 | RN-14/RN-17 | HU-16; CA-H16-1 a CA-H16-3 | A-05/A-06/A-09/A-10/A-11/P-01 |

## Requisitos no funcionales y escenarios transversales

CA-Nxx son criterios documentales de comportamiento esperado. No fijan tecnología adicional, política jurídica ni umbrales no acordados. Su verificación se planifica aquí; requiere autorización de la fase ejecutora.

| RNF | Criterio futuro / escenario | Cobertura y dependencias | Fases futuras de verificación |
|---|---|---|---|
| RNF-01 | CA-N01: dadas cuentas administrador/lectura y acceso directo, al solicitar cada acción, autorizar según rol real fuera de interfaz y comprobar RLS solicitada; lectura nunca escribe | HU-08/CA-H08-2; HU-13/CA-H13-2; RN-01/RN-15; P-01 | 5/6/7 y consolidación 13; sin implementar políticas en Fase 1 |
| RNF-02 | CA-N02: dadas altas duplicadas, asignaciones concurrentes y desactivaciones/degradaciones simultáneas, ninguna ejecución deja duplicados, doble custodia, cero administradores o estados parciales | HU-02/CA-H02-2; HU-03/CA-H03-2; HU-04/CA-H04-2; HU-11/CA-H11-1; RN-03/RN-04/RN-09/RN-15 | 4/7/9/10/13; A-02/A-04 |
| RNF-03 | CA-N03: dados registro tardío, fechas de borde y cambios de unidad, al consultar historia/exportar, diferenciar fecha efectiva/registro y obtener cronología/cortes aprobados sin inferir zona horaria | HU-03/HU-04/HU-07/HU-16; RN-16; A-04/A-05/A-06 | 4/7/10/11/13; UTC y política temporal aprobadas |
| RNF-04 | CA-N04: dados datos personales y secretos sintéticos, al consultar/exportar/notificar/auditar, solo exponer campos autorizados y nunca contraseñas/tokens; comprobar acceso y retención conforme política validada | HU-08/HU-12/HU-13/HU-15/HU-16; RN-11; A-10/P-01 | 6/11/12/13; Chile confirmado; seguimiento F1-SEG-01 antes de datos reales, sin cumplimiento legal declarado |
| RNF-05 | CA-N05: dados recorridos críticos y prototipo autorizado, al navegar con teclado y revisar computador/iPad/iPhone, documentar responsive, errores, accesibilidad objetivo WCAG 2.2 AA, hallazgos y límites de emulación | HU-01/HU-03/HU-06/HU-07/HU-09/HU-16; modelos/navegadores por confirmar; D-09/R-06 | 2 para revisión visual, 8/13 para aplicación; sin prototipo ni pruebas ejecutadas |
| RNF-06 | CA-N06: dado el objetivo futuro SQL Server, al revisar alternativas, documentar separación de reglas/adaptadores, dependencias específicas y cambios necesarios; no prometer portabilidad sin cambios | Todos los módulos; D-07/R-04; A-09 para restricciones | 3 y revisión posterior; no elegir stack ni ejecutar migración |
| RNF-07 | CA-N07: dados volumen, concurrencia, percentiles, disponibilidad, respaldo, RPO/RTO y política de correo aprobados, al medir/restaurar/simular fallos en entorno de prueba, comparar con umbrales acordados y registrar evidencia | HU-06/HU-15/HU-16; A-07/A-09/A-10/A-11/P-04 | 3 para metas/diseño, 11/12/13/14 para ejecución; metas aprobadas, sin resultados medidos |

## Trazabilidad de decisiones y riesgos

- D-01 a D-06: cubiertas por RF-01 a RF-16 y RN-01 a RN-16. D-07: CA-N01/CA-N06. D-08/D-10/D-11: antecedentes y autorización de GitHub; D-09: CA-N05. Nueva autorización de Fase 1: D-12 en DECISIONES.
- P-01/P-02/P-04 ratificados por D-14: RN-17/RN-18/RN-19 y escenarios concretados en CIERRE_FASE1. P-03: orden del MVP conservado.
- A-01 a A-11: preguntas, responsables y evidencia de cierre en ANALISIS_EMPRESARIAL; las columnas anteriores muestran criterios afectados. D-14 registra su resolución empresarial; el seguimiento legal/operativo se conserva explícito.
- R-01: CA-N03/HU-05; R-02: CA-N02; R-03: CA-N01; R-04: CA-N06; R-05: HU-15/CA-N04/CA-N07; R-06: CA-N05; R-07: continuidad documental sin instalar Spec Kit.

## Estado de cobertura

16/16 RF tienen historia y criterios; 7/7 RNF tienen escenarios transversales; 7/7 módulos conservan valor empresarial. Esta es cobertura documental, no cobertura de pruebas ejecutadas. CA1-01 a CA1-06 están en HISTORIAS_USUARIO; aceptación del usuario registrada en D-14; pruebas funcionales futuras no ejecutadas. No se ha iniciado ninguna fase 2–15.

## Resoluciones de pendientes — cierre aprobado

La [resolución aprobada](CIERRE_FASE1.md) complementa el análisis con resultados concretos; los criterios conservan sus IDs. CR-01 a CR-20 aceptados como especificación, sin pruebas ejecutadas. D-14 establece UTC, respaldo semanal, RPO objetivo 7 días y RTO 8 h; no hay garantía de 24 h de RPO con esa frecuencia.

| Pendiente | Casos concretos | Historias / calidad |
|---|---|---|
| A-01 | CR-01/CR-02 | HU-01; RNF-02/RNF-04 |
| A-02 | CR-03 | HU-02; RNF-02 |
| A-03 | CR-04/CR-05/CR-06 | HU-01/HU-03/HU-04; RNF-02 |
| A-04 | CR-08/CR-09/CR-10 | HU-03/HU-04/HU-05; RNF-02/RNF-03 |
| A-05 | CR-07/CR-11 | HU-01/HU-06/HU-07; RNF-03 |
| A-06 | CR-12 | HU-07/HU-13/HU-16; RNF-03 |
| A-07 | CR-13/CR-14 | HU-14/HU-15; RNF-04/RNF-07 |
| A-08 | CR-15/CR-16 | HU-08/HU-09/HU-10/HU-11; RNF-01/RNF-02 |
| A-09 | CR-17/CR-20 | HU-06/HU-15/HU-16; RNF-07 |
| A-10 | CR-14/CR-18 | HU-08/HU-12/HU-13/HU-15/HU-16; RNF-04 |
| A-11 | CR-19/CR-20 | HU-07/HU-16; RNF-04/RNF-07 |
| P-01 | CR-18 | HU-08/HU-13/HU-16; RNF-01/RNF-04 |
| P-02 | CR-05/CR-06 | HU-02/HU-04; RNF-02 |
| P-04 | CR-13/CR-14 | HU-15; RNF-07 |

D-13 confirma Chile y 250 funcionarios y autoriza el cálculo aproximado de bienes. Referencia: 4 × 250 + 20 % = 1.200; rango estimado 900–1.500; capacidad objetivo aprobada 3.000. UTC confirmada por D-14; retención legal en seguimiento F1-SEG-01 antes de datos reales. El volumen estimado no se confunde con datos medidos y no implica 250 cuentas de acceso.

CA-N07 y CR-17 deben verificar una copia semanal, intervalo máximo de 7 días entre copias exitosas, conservación de copias 30 días, RPO ≤ 7 días (168 h) y RTO ≤ 8 h. Día/hora UTC, alertas y restauración en F1-SEG-03; no hay tareas programadas ni respaldos configurados en Fase 1.

## Evidencia visual de Fase 2

Mapa de pantallas y cobertura HU-01 a HU-16 en [UX_UI.md](UX_UI.md); recorridos y resultados ejecutados en [PRUEBAS.md](PRUEBAS.md). La evidencia amplía CA-N05 a nivel de prototipo. Los CR y CA de integridad, persistencia, concurrencia, permisos, correo y exportación reales siguen pendientes de sus fases; no se consideran satisfechos por simularlos en UI. Fase 2 EN_REVISION, sin aceptación visual.

### Cierre visual posterior

D-15 acepta la revisión visual de la entrega; Fase 2 COMPLETADA. La evidencia anterior conserva sus límites. Fase 3 AUTORIZADA para iniciar en un nuevo chat, ejecución pendiente; fases 4–15 no autorizadas. Este registro prevalece sobre las menciones históricas de revisión pendiente.


## Extensión arquitectónica — Fase 3 EN_REVISION

La tabla de módulos en [ARQUITECTURA](ARQUITECTURA.md) vincula RF-01 a RF-16/HU-01 a HU-16 a componentes; [CONTRATOS_API](CONTRATOS_API.md) define consultas, comandos y escenarios futuros. RNF-01: ADR-003/RLS; RNF-02: ADR-004/unidad de trabajo; RNF-03: UTC y contratos de fechas; RNF-04: minimización, fronteras privadas y F1-SEG-01; RNF-05: preservar UX_UI aceptado y verificar frontend/hardware después; RNF-06: ADR-002/adaptación SQL Server; RNF-07: ADR-006/costos y continuidad. CA3-01 a CA3-05 revisados documentalmente, CA3-06 pendiente. Ningún enlace a arquitectura acredita implementación ni pruebas de esos requisitos.


## Persistencia de Fase 4 — EN_REVISION

| Requisito / contrato | Persistencia y prueba local | Límite de verificación |
|---|---|---|
| RF-01/RF-02, A-01/A-02 | Funcionarios/unidades/bienes, RUT/canónicos/unique/FK y bajas; pruebas negativas | Sin formularios ni API |
| RF-03/RF-04/RF-05, CR-04 a CR-11 | Custodias/intervalos/movimientos/anotaciones, snapshots históricos, carreras y cierre único | Orquestación completa por caso de uso pendiente de Fases 7/10 |
| RF-06/RF-07, A-06 | Índices/consultas de inventario/adquisición/movimientos, UTC y unidad actual | Sin búsqueda/API/reportes funcionales ni carga objetivo |
| RF-08 a RF-11 | Cuenta separada de funcionario y referencia de actor, sin contraseñas | Autenticación/sesiones/MFA/último administrador no implementados; Fases 5/6/9 |
| RF-12/RF-13, RNF-02/RNF-03 | Auditoría append-only, consultas por registro/entidad, rechazo de mutaciones | Proyecciones autorizadas y permisos por sesión pendientes |
| RF-14/RF-15, ADR-004 | Outbox único por evento/destinatario/propósito, destinatario inmutable, intentos append-only | Sin worker, proveedor, reintentos o conciliación reales |
| RF-16, ADR-005 | Modelo e índices compatibles con consultas de referencia A-11 | Exportaciones y cinco reportes funcionales pendientes de Fase 11 |
| RNF-01/RNF-04 | Esquema privado, RLS cerrada sin políticas, rol sintético sin acceso | No acredita RBAC/RLS funcional, Supabase Auth ni privacidad legal |
| RNF-05/RNF-06/RNF-07 | Prueba de restauración local, documentación SQL Server y estados de aviso | Sin operación productiva, adaptación SQL Server ni entrega de correo |

[Modelo y CA4](BASE_DATOS.md), [diccionario](DICCIONARIO_DATOS.md), [resultados](evidencias/fase4/resultados.txt). No se cambia ningún criterio de aceptación empresarial para ajustarlo a estas pruebas parciales.


## Evidencia incremental de Fase 5

RF-09/RF-10 y A-08/CR-15/CR-16 (solo identidad/sesiones/MFA): implementación y pruebas en [AUTENTICACION](AUTENTICACION.md). RF-08/RF-11, propio rol/último administrador, permisos empresariales y panel no se declaran implementados. Fase 5 EN_REVISION; integración operativa pendiente.


## Continuidad de Fase 6 — 2026-10-31

Fase 6: RF-08/RNF-01 → policy.ts, Authorization y RLS; RF-09/11 → acceso de administración restringido, operaciones/panel pendientes; RF-12/13 → auditoría privada y eventos técnicos append-only (escrituras empresariales pendientes); RNF-04 → publicEmployee y bitácora sin secretos. Evidencia: tests/security y PRUEBAS. Detalle y límites en SEGURIDAD.


## Entrega de Fase 7 — 2026-10-31

Fase 7 implementa base RF-02/HU-02 (alta/edición de atributos), RF-06/07 consultas parciales y RF-12/15 evidencia/outbox sin envío. Flujos RF-03/04/05, UI, panel, reportes y worker siguen en sus fases. Ver [BACKEND_API](BACKEND_API.md).


## Incremento de Fase 8

HU-02/06/07: consultas, fichas, filtros y atributos de bienes con API disponible; HU-10: acceso/MFA/sesión. CA8 y límites en [FRONTEND](FRONTEND.md). Administración (9), movimientos de escritura (10), reportes (11) y automatizaciones (12) no implementados por este incremento.


## Incremento de Fase 9 — 2026-11-01

Fase 9 EN_REVISION: RF-08/09/11 y HU-08/09/11 → cuentas, roles, propio registro/último administrador y revocación; RF-12/14 y HU-12/14 → auditoría atómica y destinatario/outbox pendiente; A-03/A-05 → catálogo de unidades. CR-15/16/18 con pruebas HTTP/SQL negativas/concurrentes; invitación/recuperación 24 h/30 min con identidad doble. RF-15 envío permanece Fase 12, no acreditado. Ver [ADMINISTRACION](ADMINISTRACION.md).


## Incremento de Fase 11 — RF-06/07/13/16, HU-06/07/13/16

CA11-01 → métricas actuales reproducibles, RF-13/HU-13; CA11-02 → cinco reportes/buscador con filtros, columnas, orden, totales y subtotales A-11, RF-06/07/16 y HU-06/07/16. CA11-03 → Excel/PDF completo, vacío y límites CR-19/20; CA11-04 → permisos/privacidad CR-18 y fechas/unidades CR-11/12, instantánea/idempotencia/revocación. CA11-05 → API/SQL/navegador/build y evidencia; CA11-06 pendiente de aceptación propia. Implementación y resultados en [REPORTES](REPORTES.md) y [PRUEBAS](PRUEBAS.md). RF-15/envío empresarial permanece Fase 12, sin iniciar.


## Fase 12 — RF-14/RF-15, HU-14/HU-15, CR-13/CR-14 y A-07/A-08/A-10

Catálogo, minimización, destino fijado, proceso conservado, reintentos/agote/permanente/incierto y conciliación → `apps/server/notifications/*`, migración aditiva Fase 12, `tests/api/notifications.test.ts`. Seguimiento/acciones administrativas, filtros, replay y responsive/teclado → `apps/web/src/notifications.tsx`, `tests/ui/notifications.test.ts`. Permisos vigentes/SQL/Origin/CSRF/auditoría y rollback verificados con datos sintéticos; no entrega física ni integración gestionada inferidas. Criterios CA12-01 a CA12-06 y límites en [NOTIFICACIONES](NOTIFICACIONES.md); Fase 12 EN_REVISION y CA12-06 pendiente.


## Consolidación de QA — Fase 13 (D-35/D-36)

La [matriz ejecutada RF-01–16/HU-01–16/CR-01–20/CA-N01–07](MATRIZ_QA_FASE13.md) vincula suites y límites; [QA_FASE13](QA_FASE13.md) establece CA13-01–06 y [PRUEBAS](PRUEBAS.md#fase-13--qa-rendimiento-y-seguridad) conserva resultados finales/fallos iniciales. RNF-04 legal, RNF-05 accesibilidad completa/hardware y RNF-07 disponibilidad/continuidad siguen parciales; no se infiere cumplimiento integral por pasar pruebas sintéticas. Fase 13 EN_REVISION, CA13-06 pendiente. Fases 14–15 sin autorización; sin despliegue.


## Aceptación de QA y continuidad — D-37

Fase 13 COMPLETADA por aceptación expresa el 2026-11-02 de `16f7bf0a4d7a088eae444488874daefc19c35630`; CA13-06 CUMPLIDO. [Matriz](MATRIZ_QA_FASE13.md), resultados y límites parciales conservados; RNF-04 legal, RNF-05 accesibilidad integral/hardware y RNF-07 disponibilidad/continuidad no se convierten en cumplimiento total por aceptación. Fase 14 autorizada únicamente para iniciar en un nuevo chat, ejecución pendiente; Fase 15 sin autorización, producción requiere aprobación independiente. Sin ejecución de Fase 14 ni despliegue en este cierre.


## Fase 14 — operación/continuidad

| Fuente | Entrega | Evidencia / límite |
|---|---|---|
| D-14/A-09/CR-17/RNF-07 y F1-SEG-03 | DESPLIEGUE/RUNBOOK: UTC/semanal/máximo 168 h/RPO 168 h/RTO 8 h/30 días, copia/restauración | tests/ops; recuperacion.json de 19 tablas, umbrales/corrupción; producción/Auth/externo/30 días pendientes |
| RNF-01/02/04, CR-14/16/18 | Roles/RLS/ACL y sesión/enlace inválidos tras restore, outbox incierta; logs sin PII | tests/ops y regresión API/seguridad/UI; F1-SEG-01 abierto |
| D-17/D-37/D-38 y F1-SEG-02 | Ambientes/secretos, Verify only, promoción/migración/rollback controlados | Workflow sin deploy y checklist NO-GO; presupuesto/destino/permisos gestionados pendientes |

[Plan y CA14-01–06](DESPLIEGUE.md), [pruebas](PRUEBAS.md#fase-14--operación-y-continuidad). Fase 14 EN_REVISION; CA14-06 PENDIENTE, Fase 15 sin autorización.


## Migración Fase 2 — matriz vigente de impacto

[02_MATRIZ_TRAZABILIDAD](migracion/02_MATRIZ_TRAZABILIDAD.md) relaciona los 16 RF y 7 RNF con RN/HU/CR, campos actuales/destino, API, servicios, pantallas y títulos de pruebas. [02_MAPEO_ESQUEMAS](migracion/02_MAPEO_ESQUEMAS.md) cubre 155 campos actuales y 117 objetivo. La cobertura es documental, sin pruebas funcionales reejecutadas ni SQL. Fase 1 aceptada por M2-A01, Fase 2 EN_REVISION y Fase 3 no autorizada. La trazabilidad histórica anterior se conserva.
