# Registro de decisiones y riesgos

**Fecha:** 2026-10-31
**Fase:** 1 — COMPLETADA; análisis y recomendaciones aprobados el 2026-10-31.

## Estado vigente de decisiones

D-14 ratifica el paquete de [CIERRE_FASE1.md](CIERRE_FASE1.md), con UTC y respaldo semanal. A-01 a A-11 resueltos en su alcance de análisis; P-01/P-02/P-04 ratificados. La política de conservación no fue informada: su validación y plazo quedan como seguimiento F1-SEG-01 antes de datos reales, sin declarar cumplimiento legal. F1-SEG-02/F1-SEG-03 mantienen presupuesto y operación en fases futuras. Los antecedentes D-01 a D-13 se conservan; fases 2–15 sin autorización.

## Decisiones confirmadas por el usuario
| ID | Decisión / evidencia | Consecuencia |
|---|---|---|
| D-01 | Sistema web de inventario computacional con historial fechado, para organización con funcionarios y unidades. | El alcance se documenta en VISION.md y REQUISITOS.md. |
| D-02 | Dos roles: administrador y lectura; sin autorregistro público. | Solo el administrador modifica y gestiona cuentas. |
| D-03 | Bajas lógicas, historial sin edición/borrado y auditoría de cambios. | Mantener referencias y distinguir movimientos de auditoría. |
| D-04 | Serie y código únicos; una sola asignación vigente por bien. | Las restricciones requieren validación persistente y concurrente. |
| D-05 | Último administrador activo protegido; impedir cambio del propio rol y confirmar acciones críticas. | Reglas obligatorias más allá de la interfaz. |
| D-06 | Correo configurable y exportaciones Excel/PDF. | Incluidos en el MVP; detalles operativos pendientes. |
| D-07 | RLS en Supabase y objetivo futuro de migrar a SQL Server, evitando acoplar la lógica empresarial. | Orientación solicitada; arquitectura, autenticación y adaptación de permisos se justifican en Fase 3. No se instalaron herramientas ni eligió stack frontend. |
| D-08 | «Autorizo la fase 0 pero crealo en nuevo chat»; luego «actualiza en github». | Se guarda documentación y continuidad en GitHub. No se ha creado otro chat; la actualización solicitada se realiza en este. Fases posteriores no autorizadas. |
| D-09 | Tras autorización de Fase 2, usar visual-system-designer, datos ficticios, revisión en computador/iPad/iPhone y Playwright si está disponible. | Fase 2 pendiente; no avanzar a Fase 3 sin aprobación expresa. |
| D-10 | En esta sesión: únicamente Fase 0, preservar trabajo existente, sin código ni publicación; después el usuario informa que actualizó GitHub y pide revisar nuevamente. | Recuperar y complementar los documentos actualizados localmente; no hacer push, PR, despliegue ni iniciar otra fase. La cita histórica de D-08 no amplía esta autorización. |
| D-11 | Posteriormente el usuario indica: «todos los cambios del este proyecto inventarioTI2 deben actualizarse en github y aprueba esta fase». | Fase 0 COMPLETADA y aprobada; mantener todos los cambios autorizados del proyecto sincronizados en GitHub. Sustituye la restricción de entrega local de D-10, sin autorizar nuevas fases ni despliegues. Regla permanente registrada en AGENTS.md. |
| D-12 | Autorización del 2026-10-30: «En nuevo chat inicia fase 1 inventarioTI2», registrada en `c45e96e`/`fa323a7`; el 2026-10-31 el usuario pide iniciar únicamente Fase 1, conservar pendientes y actualizar GitHub. | Ejecutar análisis documental de Fase 1 sin volver a pedir autorización; entrega EN_REVISION, sin aceptación de cierre, código, Fase 2 ni despliegue. |
| D-13 | El 2026-10-31 el usuario responde: «Chile somos 250 funcionarios calcula aprox cuántos bienes pueden ser por funcionarios». | Chile y 250 funcionarios confirmados; se autoriza estimar bienes. Estimación documentada: 900–1.500, referencia 1.200; no son existencias medidas ni aprobación de otros parámetros. |
| D-14 | El usuario responde a la solicitud de aprobación del paquete: «Apruebo las conversiones, respaldo 1 vez a  la semana, zona horaria UTC y respaldo 1 vez a la semana». | Recomendaciones aceptadas con UTC y un respaldo por semana. RPO ajustado por coherencia a 7 días (168 h), RTO 8 h y conservación de copias 30 días. Cierre documental de Fase 1; sin implementación, Fase 2 ni declaración de política legal de retención. |

Fecha de registro/revisión: **2026-10-30**. D-01 a D-09 se conservan del commit del usuario `ea60377feb246ede15fef00d386bd022a3deaa94`; D-10 registra las instrucciones iniciales y D-11 la aprobación y autorización posterior del usuario. El cierre de Fase 0 proviene de D-11, sin iniciar ni autorizar Fase 1.

Las alternativas tecnológicas todavía no están elegidas: D-07 conserva la orientación Supabase/RLS y portabilidad futura a SQL Server. Su justificación, costos, adaptación de autenticación/permisos y límites corresponden a una Fase 3 expresamente autorizada. No se promete equivalencia entre motores ni se decide aquí un stack frontend, hosting o proveedor de correo.

## Propuestas ratificadas y antecedentes
| ID | Propuesta | Razón / alternativas |
|---|---|---|
| P-01 | RATIFICADA por D-14. Restringir consulta y exportación de auditoría al administrador. | La matriz del usuario concede auditoría al administrador y consulta de inventario/historial a lectura; ratificación completada por D-14 frente a la frase «ver todo». |
| P-02 | RATIFICADA por D-14. Separar condición física de situación administrativa. | Bueno/regular/malo no indica si el bien está asignado o dado de baja. |
| P-03 | Orden del backlog y límites de VISION.md aceptados como planificación inicial de Fase 0. | Aprobado por el usuario el 2026-10-30; mantener todos los módulos del MVP. El detalle podrá refinarse en una Fase 1 autorizada. |
| P-04 | RATIFICADA por D-14. No perder una operación válida si falla el correo; registrar fallo y permitir reintento controlado. | Requisito aceptado; mecanismo a definir en Fase 3. No se promete entrega inmediata ni exactamente una vez. |

## Resolución de temas de Fase 1
| ID | Tema por resolver | Momento / responsable |
|---|---|---|
| A-01 | Formato y obligatoriedad de RUT/ID, validación de RUT y unicidad; soporte de identificadores alternativos. | RESUELTA en análisis por D-14; CR-01/CR-02 |
| A-02 | Obligatoriedad y normalización de serie/código, espacios, mayúsculas y bienes heredados sin serie. | RESUELTA en análisis por D-14; CR-03 |
| A-03 | Qué hacer con bienes al dar de baja a un funcionario o bien; prohibiciones de asignar a inactivos y reactivación. | RESUELTA en análisis por D-14; CR-04 a CR-06 |
| A-04 | Retroactividad, corrección mediante movimientos compensatorios, solapamientos y diferencia entre fecha efectiva y registro. | RESUELTA en análisis por D-14; CR-08 a CR-10 |
| A-05 | Unidad del funcionario frente a ubicación/unidad del bien; traslado entre unidades e historial de pertenencia. | RESUELTA en análisis por D-14; CR-07/CR-11 |
| A-06 | Significado de rango de fechas en cada búsqueda/reporte, extremos inclusivos, zona horaria empresarial y corte histórico. | RESUELTA en análisis por D-14; CR-12; UTC confirmada |
| A-07 | Eventos de correo (incluidas cuentas/configuración), anterior/nuevo destinatario, contenido, reintentos y visibilidad de fallos. | RESUELTA en análisis por D-14; CR-13/CR-14 |
| A-08 | Primera cuenta administradora, invitación inicial, expiración, recuperación, MFA y revocación de sesiones de desactivados. | RESUELTA en análisis por D-14; CR-15/CR-16 |
| A-09 | Volumen de bienes/funcionarios/usuarios, concurrencia, tiempos objetivo, hosting, presupuesto, respaldo y recuperación. | RESUELTA en análisis por D-14; CR-17; respaldo semanal/RPO 7 días; F1-SEG-02/F1-SEG-03 |
| A-10 | Retención y acceso a datos personales, correos/exportaciones y auditoría; jurisdicción y normativa aplicable. | RESUELTA en análisis por D-14; CR-18; política legal no informada, seguimiento F1-SEG-01 antes de datos reales |
| A-11 | Columnas, presentación, límites y permisos definitivos de reportes. | RESUELTA en análisis por D-14; CR-19/CR-20 |

## Riesgos y dependencias
| ID | Riesgo / dependencia | Tratamiento propuesto |
|---|---|---|
| R-01 | Historia inconsistente por retroactividad o edición directa. | Acordar reglas temporales antes de modelar; conservar evidencia de correcciones. |
| R-02 | Doble asignación o pérdida del último administrador por concurrencia. | Restricciones y operaciones atómicas; pruebas concurrentes posteriores. |
| R-03 | Confundir permisos visuales con seguridad efectiva. | Validación en servidor/RLS y pruebas negativas. |
| R-04 | Acoplamiento a Supabase dificulta migración SQL Server. | Adaptadores y reglas separadas; no asumir equivalencia entre motores o autenticación. |
| R-05 | Correos fallidos, duplicados o con datos personales excesivos. | Catálogo de eventos, minimización, trazabilidad y reintentos controlados por acordar. |
| R-06 | La ruta .agents/skills/visual-system-designer/SKILL.md está citada, pero no existe en el árbol remoto inspeccionado. | Incorporar o facilitar el skill antes de la Fase 2; no sustituirlo sin informar. Playwright se comprobará en esa fase. |
| R-07 | No hay aplicación ni dependencias; Spec Kit no está presente en el árbol inspeccionado. | No instalar por inferencia; metodología documental actual suficiente para Fase 0. |

## Fuente y aprobación — antecedente de Fase 0
Requisitos y autorizaciones conservados en los documentos del commit actualizado por el usuario `ea60377feb246ede15fef00d386bd022a3deaa94`, recibido tras su indicación de revisar GitHub nuevamente. El mensaje posterior de D-11, del 2026-10-30, aprueba los entregables y el cierre de Fase 0 y la sincronización con GitHub. P-03 queda aceptada como planificación inicial; P-01, P-02, P-04 y A-01 a A-11 continúan como asuntos de detalle sin resolución implícita. Esa frase describía el cierre de Fase 0; D-12 autorizó después Fase 1. Fases 2 y 3 siguen sin autorización.

## Prioridad de riesgos, responsables y seguimiento

- **R-01, R-02 y R-03 — Alta:** integridad temporal, concurrencia y permisos pueden invalidar el control del inventario. Responsables propuestos: usuario/analista para reglas y responsables técnicos/QA por designar para controles y pruebas posteriores. Reducir el riesgo exige reglas aceptadas y evidencia de escenarios negativos y concurrentes.
- **R-04 — Alta:** la portabilidad solicitada afecta arquitectura e identidad. Responsable técnico por designar; comparar alternativas y registrar límites en Fase 3, sin prometer una migración sin cambios.
- **R-05 — Alta:** privacidad y confiabilidad del correo. Usuario define eventos, contenido y destinatario en A-07/A-10; el diseño técnico debe justificar tratamiento de fallos y verificarlo con datos ficticios. No enviar mensajes reales en Fase 0.
- **R-06 — Media:** ausencia confirmada del skill en la ruta y catálogos inspeccionados; disponibilidad de Playwright no comprobada. Codex debe volver a detectarlos al autorizar Fase 2, usar el skill si está disponible y declarar evidencia y limitaciones. No se instaló ni sustituyó en esta sesión.
- **R-07 — Dependencia confirmada:** no hay aplicación ni manifiestos; la ausencia de Spec Kit no bloquea este trabajo documental. No instalarlo por inferencia; cualquier integración futura necesita autorización.

La prioridad es una valoración inicial para revisar. La probabilidad de fallos operativos aún no se ha medido; no se declaran riesgos resueltos por escribir esta documentación. Los responsables futuros son roles sugeridos, sin asignación de personas ni instrucciones enviadas a terceros.

## Evidencia de cierre y límites

D-14 es evidencia de ratificación y cierre del paquete; su alcance vigente está en CIERRE_FASE1. Se mantiene la numeración original de RF/RNF/A/P/R y el historial de Git. La aceptación del análisis no acredita pruebas funcionales ni resuelve riesgos de implementación R-01 a R-07. La política de retención no se inventa: F1-SEG-01 permanece como condición antes de datos reales. Una futura modificación de reglas o de los objetivos aprobados requiere registrar nueva decisión y actualizar sus criterios, sin iniciar otra fase por inferencia.
