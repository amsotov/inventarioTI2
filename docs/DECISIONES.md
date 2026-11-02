# Registro de decisiones y riesgos

**Fecha:** 2026-10-31
**Fase:** 2 — COMPLETADA; revisión visual aprobada. Fase 3 autorizada para un nuevo chat.

## Estado vigente de decisiones

D-14 ratifica el paquete de [CIERRE_FASE1.md](CIERRE_FASE1.md), con UTC y respaldo semanal. A-01 a A-11 resueltos en su alcance de análisis; P-01/P-02/P-04 ratificados. La política de conservación no fue informada: su validación y plazo quedan como seguimiento F1-SEG-01 antes de datos reales, sin declarar cumplimiento legal. F1-SEG-02/F1-SEG-03 mantienen presupuesto y operación en fases futuras. Los antecedentes D-01 a D-14 se conservan. D-15 cierra Fase 2 y autoriza Fase 3 para un nuevo chat; ejecución pendiente, fases 4–15 sin autorización.

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

## Continuidad de diseño — Fase 2

Autorización registrada en FASES y ratificada en esta conversación. El usuario incorporó visual-system-designer en [SKILL.md](../SKILL.md), integrado desde main y aplicado. Sistema visual propuesto y prototipo efímero documentados en [UX_UI.md](UX_UI.md), EN_REVISION. HTML/CSS/JS es soporte de demostración, sin elegir stack definitivo. D-14 y F1-SEG-01/02/03 intactos; ninguna decisión técnica de Fase 3 ni despliegue. Los antecedentes de fases no autorizadas se leen según su fecha y las autorizaciones posteriores.


## D-15 — Aprobación visual y continuidad autorizada

Fecha: 2026-10-31. Evidencia literal del usuario: «apruebo la revisión visual" para que cierre la fase y pase a la Fase 3 en nuevo chat».

Decisión: aceptar revisión visual y cierre de Fase 2 (entrega `88d54f6`), sin cambios visuales adicionales solicitados. Fase 2 COMPLETADA; Fase 3 — arquitectura tecnológica AUTORIZADA para iniciar en un nuevo chat, ejecución PENDIENTE. Esta aprobación no acredita funcionalidades reales del mock ni autoriza fases 4–15, despliegue, gastos o producción. Se mantienen D-14 y F1-SEG-01/02/03. La continuidad EN_REVISION del apartado anterior corresponde a la entrega previa a esta aprobación.


## D-16 — Ejecución y entrega de arquitectura de Fase 3

2026-10-31: solicitud actual ratifica la autorización D-15, ordena desarrollar arquitectura y actualizar GitHub, sin Fase 4 ni despliegues. Se entrega Fase 3 EN_REVISION: [arquitectura](ARQUITECTURA.md), [contratos](CONTRATOS_API.md) y [ADR-001 a ADR-006](adr/FASE3.md). Las ADR son propuestas técnicas para revisión, no decisiones de compra aceptadas por el usuario. D-07/D-14/D-15 y RF/RNF se conservan. La evaluación de costos no cierra F1-SEG-02; propuesta de respaldo no cierra F1-SEG-03. F1-SEG-01 obligatorio antes de datos reales. Aceptación/cierre de Fase 3 pendientes y Fase 4 no autorizada.


## D-17 — Aceptación arquitectónica y continuidad de Fase 4

2026-10-31. Evidencia literal: «Apruebo y inicia fase 4 en un chat nuevo». Acepta entrega `703002c` de arquitectura, contratos y ADR-001 a ADR-006, cumple CA3-06 y cierra Fase 3 COMPLETADA. Autoriza Fase 4 — modelado y persistencia únicamente en un nuevo chat; ejecución PENDIENTE hasta iniciarlo. No requiere reiterar autorización. No aprueba presupuesto, gasto, provisión remota, cambios productivos, despliegue ni fases 5–15. F1-SEG-01/02/03 conservan sus pendientes; aceptación de diseño no acredita controles implementados. Este registro prevalece sobre el estado histórico EN_REVISION de D-16.


## D-18 — Ejecución y entrega de persistencia de Fase 4

2026-10-31. Solicitud actual ratifica D-17 e indica desarrollar únicamente modelado/persistencia y actualizar GitHub, sin Fase 5 ni despliegues. Implementación local EN_REVISION en [BASE_DATOS](BASE_DATOS.md): modelo normalizado, snapshots históricos deliberados, custodias por intervalos con cierre único, migración aditiva sin extensiones y acceso privado cerrado por defecto. No se crean políticas de autorización ni flujos Auth por dependencia. Cuenta es referencia de actor; comandos/outbox soportan atomicidad de futuros servicios, sin replay HTTP ni correo implementados. CA4-06 pendiente de aceptación expresa; F1-SEG-01/02/03 sin cerrar por inferencia. Este registro no altera la arquitectura ni autoriza fases 5–15.


## D-19 — Aceptación de Fase 4 y continuidad de Fase 5

2026-10-31. Evidencia literal: «Apruebo fase 4 y inicia fase 5 inventarioTI2 en nuevo chat». Acepta entrega `65609df9f7868555d985d381c4dcf24c97d06235`, cumple CA4-06 y cierra Fase 4 COMPLETADA. Autoriza únicamente Fase 5 — autenticación para iniciar en un nuevo chat, ejecución PENDIENTE. No implica implementación aquí, creación automática del chat ni aprobación de fases 6–15, permisos empresariales, producción, despliegue o gastos. F1-SEG-01/02/03 y límites de las pruebas permanecen vigentes. Este registro actualiza el antecedente EN_REVISION de D-18 sin reescribir evidencias.


## D-20 — Ejecución de autenticación, sin cierre presumido

2026-10-31: el usuario ratifica iniciar únicamente Fase 5 bajo D-19 y actualizar GitHub, sin Fase 6 ni despliegue. Se implementa el diseño BFF/Supabase aceptado, con verificación local y pendientes explícitos en [AUTENTICACION](AUTENTICACION.md). No es aprobación del usuario a la entrega ni cambio de D-14/D-17/D-19; F1-SEG-01/02/03 intactos.


## D-21 — Aceptación de Fase 5 y continuidad de Fase 6

2026-10-31. Evidencia literal: «Apruebo fase 5 y en nuevo chat inicia fase 6». Acepta entrega `6ab7229f2a89ca08fbd2f274377aa146386bc165`, cumple CA5-06 y cierra Fase 5 COMPLETADA con pendientes operativos explícitos. Autoriza únicamente Fase 6 — autorización, privacidad y seguridad para iniciar en un nuevo chat, ejecución PENDIENTE. No implica ejecución aquí, creación automática de conversación, permisos remotos/productivos, datos reales, gastos, despliegue ni fases 7–15. Conserva F1-SEG-01/02/03 y límites de las pruebas. Este registro actualiza el antecedente EN_REVISION de D-20 sin reescribir evidencias.


## Continuidad de Fase 6 — 2026-10-31

D-22 — Implementación de Fase 6 bajo D-21: dos roles e inventario compartido; separar roles SQL Auth/runtime/contexto, usar huella de sesión validada y contexto LOCAL, sin DML empresarial genérico hasta sus casos de uso. Entrega EN_REVISION, aceptación pendiente; sin Fase 7 ni despliegue.


## D-23 — Aceptación de Fase 6 y continuidad de Fase 7

2026-10-31. Evidencia literal: «Aprobado fase 6. Inicia fase 7 en nuevo chat». Acepta entrega `336232a9b1add5c6605f396a90795e419022756c`, cumple CA6-06 y cierra Fase 6 COMPLETADA. Autoriza únicamente Fase 7 — Backend y API para iniciar en un nuevo chat, ejecución PENDIENTE. No implica ejecución aquí, creación automática de conversación ni aprobación de fases 8–15, despliegue, producción, datos reales, gastos o permisos reales. Conserva límites de las pruebas locales y F1-SEG-01/02/03. Actualiza el antecedente EN_REVISION de D-22 sin reescribir evidencia.


## D-24 — Ejecución limitada de Fase 7

2026-10-31. Usuario ratifica D-23: «Inicia únicamente la Fase 7 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 8 ni despliegues». Se ejecuta backend/API según [BACKEND_API](BACKEND_API.md), con verificación sintética y actualización GitHub. Entrega EN_REVISION, sin atribuir aceptación del usuario. Los contratos del MVP se habilitan por fases; movimientos/panel/reportes/automatizaciones continúan pendientes de sus autorizaciones. No cambia D-14, privacidad ni continuidad. Fases 8–15 no autorizadas.


## D-25 — Aceptación de Fase 7 y continuidad de Fase 8

2026-11-01. Evidencia literal: «Apruebo fase 7 y en un nuevo chat inicia fase 8». Acepta entrega `6035e125617a2c8d6e366df49940b8d720f8d535`, cumple CA7-06 y cierra Fase 7 COMPLETADA con sus límites explícitos. Autoriza únicamente Fase 8 — Frontend funcional para iniciar en un nuevo chat, ejecución PENDIENTE. No implica ejecución aquí, creación automática de conversación ni aprobación de fases 9–15, despliegue, producción, datos reales, gastos o permisos reales. Conserva evidencia local y F1-SEG-01/02/03. Actualiza el antecedente EN_REVISION de D-24 sin reescribir evidencias.


## D-26 — Ejecución de Fase 8 (2026-11-01)

El usuario ratifica D-25: «Inicia únicamente la Fase 8 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 9 ni despliegues». Implementación y verificación limitadas a frontend sobre servicios disponibles, entrega EN_REVISION en FRONTEND.md. No acepta anticipadamente CA8-06 ni autoriza Fase 9, gasto o despliegue.


## D-27 — Aceptación de Fase 8 y continuidad de Fase 9

2026-11-01. Evidencia literal: «Apruebo fase 8 y en un nuevo chat inicia fase 9». Acepta la entrega `570e90d10819999e96e17a4f88dfd30c8e1f5224`, cumple CA8-06 y cierra Fase 8 COMPLETADA con sus límites explícitos. Autoriza únicamente Fase 9 — Panel de administración para iniciar en un nuevo chat, ejecución PENDIENTE. No implica ejecución aquí, creación automática de conversación ni aprobación de fases 10–15, despliegue, producción, datos reales, gastos o permisos reales. Conserva evidencia local y F1-SEG-01/02/03. Actualiza el antecedente EN_REVISION de D-26 sin reescribir evidencias.


## D-28 — Ejecución de Fase 9 (2026-11-01)

El usuario ratifica D-27: «Inicia únicamente la Fase 9 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 10 ni despliegues». Se ejecuta únicamente panel de administración y sus interfaces/persistencia necesarias. Entrega EN_REVISION en ADMINISTRACION.md; CA9-06 pendiente. No atribuye aceptación anticipada, permisos remotos, datos reales, gasto o despliegue. Restricción técnica: propio registro completo protegido para conservar separación de pools y locks, además de prohibir propio rol/autodesactivación. Catálogos/parámetros se limitan a unidades y destinatario acordados, sin inventar configuración empresarial.


## D-29 — Aceptación de Fase 9 y continuidad de Fase 10

2026-11-01. Evidencia literal: «Apruebo fase 9 y en un nuevo chat inicia fase 10». Acepta la entrega `fff63ac3f8afd6c471ef1649dd83ab5332d0f36c`, cumple CA9-06 y cierra Fase 9 COMPLETADA con sus límites explícitos. Autoriza únicamente Fase 10 — Procesos y módulos empresariales para iniciar en un nuevo chat, ejecución PENDIENTE. No implica implementación aquí, creación automática de conversación ni aprobación de fases 11–15, despliegue, producción, datos reales, gastos o permisos remotos. Conserva evidencia y F1-SEG-01/02/03. Los estados EN_REVISION de D-28 se mantienen como antecedentes de entrega.


## D-30 — Ejecución de Fase 10 (2026-11-02)

El usuario ratifica D-29: «Inicia únicamente la Fase 10 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 11 ni despliegues» y posteriormente «continua». Se implementan exclusivamente procesos empresariales con interfaces/persistencia necesarias; entrega EN_REVISION en PROCESOS_EMPRESARIALES.md. CA10-06 pendiente de aceptación propia. No autoriza Fase 11, datos reales, permisos remotos, gastos ni despliegue. Mutex conservador serializa comandos de procesos; rendimiento objetivo sigue sin acreditarse.
