# Registro de decisiones y riesgos

**Fecha:** 2026-10-30
**Fase:** 0 — EN_REVISION

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

## Propuestas e interpretaciones por ratificar
| ID | Propuesta | Razón / alternativas |
|---|---|---|
| P-01 | Restringir consulta y exportación de auditoría al administrador. | La matriz del usuario concede auditoría al administrador y consulta de inventario/historial a lectura; ratificar frente a la frase «ver todo». |
| P-02 | Separar condición física de situación administrativa. | Bueno/regular/malo no indica si el bien está asignado o dado de baja. |
| P-03 | Orden del backlog y límites propuestos en VISION.md. | Validar prioridades sin retirar módulos solicitados del MVP. |
| P-04 | No perder una operación válida si falla el correo; registrar fallo y permitir reintento controlado. | Propuesta de confiabilidad; mecanismo a definir en Fase 3. No se promete entrega inmediata ni exactamente una vez. |

## Decisiones abiertas
| ID | Tema por resolver | Momento / responsable |
|---|---|---|
| A-01 | Formato y obligatoriedad de RUT/ID, validación de RUT y unicidad; soporte de identificadores alternativos. | Fase 1 / usuario y analista. |
| A-02 | Obligatoriedad y normalización de serie/código, espacios, mayúsculas y bienes heredados sin serie. | Fase 1 / usuario y analista. |
| A-03 | Qué hacer con bienes al dar de baja a un funcionario o bien; prohibiciones de asignar a inactivos y reactivación. | Fase 1 / usuario. |
| A-04 | Retroactividad, corrección mediante movimientos compensatorios, solapamientos y diferencia entre fecha efectiva y registro. | Fase 1 / usuario y analista. |
| A-05 | Unidad del funcionario frente a ubicación/unidad del bien; traslado entre unidades e historial de pertenencia. | Fase 1 / usuario. |
| A-06 | Significado de rango de fechas en cada búsqueda/reporte, extremos inclusivos, zona horaria empresarial y corte histórico. | Fase 1 / usuario. |
| A-07 | Eventos de correo (incluidas cuentas/configuración), anterior/nuevo destinatario, contenido, reintentos y visibilidad de fallos. | Fase 1 / usuario; solución técnica en Fase 3. |
| A-08 | Primera cuenta administradora, invitación inicial, expiración, recuperación, MFA y revocación de sesiones de desactivados. | Requisitos en Fase 1; diseño técnico en Fases 3/5/6. |
| A-09 | Volumen de bienes/funcionarios/usuarios, concurrencia, tiempos objetivo, hosting, presupuesto, respaldo y recuperación. | Fases 1/3 / usuario y responsable técnico. |
| A-10 | Retención y acceso a datos personales, correos/exportaciones y auditoría; jurisdicción y normativa aplicable. | Fases 1/6 / organización. |
| A-11 | Columnas, presentación, límites y permisos definitivos de reportes. | Fase 1 / usuario; UX en Fase 2. |

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

## Fuente y aprobación
Requisitos y autorizaciones expresados por el usuario en esta conversación el 2026-10-30. Las propuestas y decisiones abiertas no se consideran aprobadas por el solo hecho de guardarlas. La Fase 0 queda EN_REVISION; no hay autorización para Fases 1, 2 o 3.
