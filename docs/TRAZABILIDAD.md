# Matriz de trazabilidad — Fase 1

**Fecha:** 2026-10-31 · **Estado:** EN_REVISION.

Fuentes: [REQUISITOS.md](REQUISITOS.md), [ANALISIS_EMPRESARIAL.md](ANALISIS_EMPRESARIAL.md) y [HISTORIAS_USUARIO.md](HISTORIAS_USUARIO.md). Módulos y valor conservados de [VISION.md](VISION.md). CA-Hxx-n son criterios para pruebas futuras, no evidencia de ejecución. El sufijo «todos» refiere a todos los criterios de la historia indicada. Los pendientes no se consideran resueltos por esta cobertura.

## Requisitos funcionales y valor de los módulos

| RF | Módulo y razón de negocio | Proceso / actores | Reglas | Historia / criterios verificables | Pendientes |
|---|---|---|---|---|---|
| RF-01 | M01: identificar responsables y pertenencia | PR-01; ACT-01/ACT-03 | RN-02/RN-07/RN-11 | HU-01; CA-H01-1 a CA-H01-4 | A-01/A-03/A-05 |
| RF-02 | M02: identificar equipos y evitar duplicados | PR-02; ACT-01 | RN-03/RN-18 | HU-02; CA-H02-1 a CA-H02-4 | A-02/P-02 |
| RF-03 | M03: custodia única por bien | PR-03/CU-01; ACT-01/ACT-03 | RN-04/RN-15/RN-16 | HU-03; CA-H03-1 a CA-H03-3 | A-03/A-04/A-06 |
| RF-04 | M03: reconstruir devoluciones, traslados, condición y baja | PR-03/CU-02 a CU-05; ACT-01/ACT-03 | RN-05/RN-07/RN-16/RN-18 | HU-04; CA-H04-1 a CA-H04-5 | A-03/A-04/A-05/A-06/P-02 |
| RF-05 | M03: conservar evidencia original | PR-03/CU-06; ACT-01/ACT-02 | RN-06 | HU-05; CA-H05-1 y CA-H05-2 | A-04 |
| RF-06 | M04: localizar bien y custodio con historia | PR-04; ACT-01/ACT-02 | RN-01/RN-04/RN-06 | HU-06; CA-H06-1 a CA-H06-3 | A-05/A-06 |
| RF-07 | M04: acotar resultados reproducibles | PR-04; ACT-01/ACT-02 | RN-14/RN-16 | HU-07; CA-H07-1 a CA-H07-3 | A-05/A-06 |
| RF-08 | M05: proteger escritura y permitir consulta | PR-05 y transversal; ACT-01/ACT-02 | RN-01/RN-15 | HU-08; CA-H08-1 a CA-H08-3 | P-01 solo en auditoría |
| RF-09 | M05: controlar altas y vigencia de cuentas | PR-05; ACT-01 | RN-08/RN-09/RN-11 | HU-09; CA-H09-1 a CA-H09-3 | A-08 |
| RF-10 | M05: recuperar acceso sin divulgar credenciales | PR-05; titular ACT-01/ACT-02 | RN-10 | HU-10; CA-H10-1 y CA-H10-2 | A-08 |
| RF-11 | M05: mantener administración activa | PR-05; ACT-01 | RN-09/RN-15 | HU-11; CA-H11-1 a CA-H11-3 | A-08 |
| RF-12 | M06: atribuir y proteger evidencia de cambios | PR-06; ACT-01 | RN-06/RN-11 | HU-12; CA-H12-1 y CA-H12-2 | A-10/P-01 |
| RF-13 | M06: investigar cambios concretos | PR-06; ACT-01; ACT-02 condicionado | RN-11/RN-17 | HU-13; CA-H13-1 y CA-H13-2 | P-01/A-06/A-10 |
| RF-14 | M06: dirigir avisos sin cambiar código | PR-06; ACT-01/ACT-04 | RN-12 | HU-14; CA-H14-1 y CA-H14-2 | A-07/A-10 |
| RF-15 | M06: seguimiento automático de cambios | PR-06; ACT-04, origen ACT-01 | RN-13/RN-19 | HU-15; CA-H15-1 a CA-H15-3 | A-07/A-10/P-04 |
| RF-16 | M07: revisión y distribución de información autorizada | PR-07; ACT-01/ACT-02 | RN-14/RN-17 | HU-16; CA-H16-1 a CA-H16-3 | A-05/A-06/A-09/A-10/A-11/P-01 |

## Requisitos no funcionales y escenarios transversales

CA-Nxx son criterios documentales de comportamiento esperado. No fijan tecnología adicional, política jurídica ni umbrales no acordados. Su verificación se planifica aquí; requiere autorización de la fase ejecutora.

| RNF | Criterio futuro / escenario | Cobertura y dependencias | Fases futuras de verificación |
|---|---|---|---|
| RNF-01 | CA-N01: dadas cuentas administrador/lectura y acceso directo, al solicitar cada acción, autorizar según rol real fuera de interfaz y comprobar RLS solicitada; lectura nunca escribe | HU-08/CA-H08-2; HU-13/CA-H13-2; RN-01/RN-15; P-01 | 5/6/7 y consolidación 13; sin implementar políticas en Fase 1 |
| RNF-02 | CA-N02: dadas altas duplicadas, asignaciones concurrentes y desactivaciones/degradaciones simultáneas, ninguna ejecución deja duplicados, doble custodia, cero administradores o estados parciales | HU-02/CA-H02-2; HU-03/CA-H03-2; HU-04/CA-H04-2; HU-11/CA-H11-1; RN-03/RN-04/RN-09/RN-15 | 4/7/9/10/13; A-02/A-04 |
| RNF-03 | CA-N03: dados registro tardío, fechas de borde y cambios de unidad, al consultar historia/exportar, diferenciar fecha efectiva/registro y obtener cronología/cortes aprobados sin inferir zona horaria | HU-03/HU-04/HU-07/HU-16; RN-16; A-04/A-05/A-06 | 4/7/10/11/13; condicionado en política temporal |
| RNF-04 | CA-N04: dados datos personales y secretos sintéticos, al consultar/exportar/notificar/auditar, solo exponer campos autorizados y nunca contraseñas/tokens; comprobar acceso y retención conforme política validada | HU-08/HU-12/HU-13/HU-15/HU-16; RN-11; A-10/P-01 | 6/11/12/13; retención/jurisdicción pendientes, no cumplimiento legal declarado |
| RNF-05 | CA-N05: dados recorridos críticos y prototipo autorizado, al navegar con teclado y revisar computador/iPad/iPhone, documentar responsive, errores, accesibilidad objetivo WCAG 2.2 AA, hallazgos y límites de emulación | HU-01/HU-03/HU-06/HU-07/HU-09/HU-16; modelos/navegadores por confirmar; D-09/R-06 | 2 para revisión visual, 8/13 para aplicación; sin prototipo ni pruebas ejecutadas |
| RNF-06 | CA-N06: dado el objetivo futuro SQL Server, al revisar alternativas, documentar separación de reglas/adaptadores, dependencias específicas y cambios necesarios; no prometer portabilidad sin cambios | Todos los módulos; D-07/R-04; A-09 para restricciones | 3 y revisión posterior; no elegir stack ni ejecutar migración |
| RNF-07 | CA-N07: dados volumen, concurrencia, percentiles, disponibilidad, respaldo, RPO/RTO y política de correo aprobados, al medir/restaurar/simular fallos en entorno de prueba, comparar con umbrales acordados y registrar evidencia | HU-06/HU-15/HU-16; A-07/A-09/A-10/A-11/P-04 | 3 para metas/diseño, 11/12/13/14 para ejecución; condicionado, sin cifras inventadas |

## Trazabilidad de decisiones y riesgos

- D-01 a D-06: cubiertas por RF-01 a RF-16 y RN-01 a RN-16. D-07: CA-N01/CA-N06. D-08/D-10/D-11: antecedentes y autorización de GitHub; D-09: CA-N05. Nueva autorización de Fase 1: D-12 en DECISIONES.
- P-01/P-02/P-04: RN-17/RN-18/RN-19 y escenarios condicionados. P-03: orden del MVP conservado.
- A-01 a A-11: preguntas, responsables y evidencia de cierre en ANALISIS_EMPRESARIAL; las columnas anteriores muestran criterios afectados. No hay decisión abierta omitida ni cerrada automáticamente.
- R-01: CA-N03/HU-05; R-02: CA-N02; R-03: CA-N01; R-04: CA-N06; R-05: HU-15/CA-N04/CA-N07; R-06: CA-N05; R-07: continuidad documental sin instalar Spec Kit.

## Estado de cobertura

16/16 RF tienen historia y criterios; 7/7 RNF tienen escenarios transversales; 7/7 módulos conservan valor empresarial. Esta es cobertura documental, no cobertura de pruebas ejecutadas. CA1-01 a CA1-06 están en HISTORIAS_USUARIO; la revisión del usuario y las decisiones necesarias siguen pendientes. No se ha iniciado ninguna fase 2–15.

## Desarrollo de pendientes — revisión posterior

La [propuesta de resolución](CIERRE_FASE1.md) complementa el análisis con resultados concretos; los criterios anteriores conservan sus IDs y estado de aceptación. CR-01 a CR-20 son escenarios propuestos, no pruebas ejecutadas ni reglas ratificadas.

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

D-13 confirma Chile y 250 funcionarios y autoriza el cálculo aproximado de bienes. Referencia: 4 × 250 + 20 % = 1.200; rango estimado 900–1.500; capacidad objetivo propuesta 3.000. Falta ratificar recomendaciones y completar localidad/zona y política de conservación. El volumen estimado no se confunde con datos medidos y no implica 250 cuentas de acceso.
