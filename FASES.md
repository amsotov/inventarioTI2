# FASES.md — Plan y control de avance

**Proyecto:** Inventario y control de bienes computacionales (inventarioTI2)
**Modo:** GUIADO (aprobación expresa antes de cada fase)
**Fase actual:** 0 — COMPLETADA (entregables aprobados por el usuario el 2026-10-30)

> La Fase 0 está completada y aprobada por el usuario. El sistema aún no está implementado. Las fases siguientes conservan su estado pendiente y requieren autorización independiente. Todos los cambios autorizados del proyecto deben sincronizarse con GitHub.

| Fase | Etapa | Entregable orientativo | Estado | Aprobación |
|---|---|---|---|---|
| 0 | Diagnóstico y planificación | Visión, requisitos iniciales, MVP, riesgos y decisiones | COMPLETADA | Ejecución y entregables APROBADOS por el usuario el 2026-10-30 |
| 1 | Análisis empresarial y requisitos | Actores, procesos, historias y criterios | PENDIENTE | NO OTORGADA |
| 2 | UX/UI y diseño visual | Sistema visual, prototipo navegable y aprobación visual | PENDIENTE | NO OTORGADA |
| 3 | Arquitectura tecnológica | Stack y decisiones arquitectónicas | PENDIENTE | NO OTORGADA |
| 4 | Modelado y persistencia de datos | Modelo ER, restricciones y migraciones | PENDIENTE | NO OTORGADA |
| 5 | Autenticación | Inicio de sesión, recuperación y sesiones | PENDIENTE | NO OTORGADA |
| 6 | Autorización, privacidad y seguridad | RBAC/ABAC según caso, controles y auditoría | PENDIENTE | NO OTORGADA |
| 7 | Backend y API | Servicios, reglas empresariales y contratos | PENDIENTE | NO OTORGADA |
| 8 | Frontend funcional | Pantallas e integración con API | PENDIENTE | NO OTORGADA |
| 9 | Panel de administración | Usuarios, permisos, catálogos y parámetros | PENDIENTE | NO OTORGADA |
| 10 | Procesos y módulos empresariales | Casos de uso, estados y movimientos | PENDIENTE | NO OTORGADA |
| 11 | Indicadores, reportes y exportación | Dashboards, filtros, Excel/PDF | PENDIENTE | NO OTORGADA |
| 12 | Notificaciones y automatización | Eventos, alertas y tareas | PENDIENTE | NO OTORGADA |
| 13 | QA, rendimiento y seguridad | Pruebas, regresión y accesibilidad | PENDIENTE | NO OTORGADA |
| 14 | Despliegue, operación y continuidad | CI/CD, respaldo, restauración y monitoreo | PENDIENTE | NO OTORGADA |
| 15 | Documentación, capacitación y evolución | Manuales, soporte y roadmap | PENDIENTE | NO OTORGADA |

## Registro de aprobación y ejecución

| Fecha | Fase | Alcance autorizado | Aprobó | Evidencia / enlace |
|---|---|---|---|---|
| 2026-10-30 | 0 | Diagnóstico y planificación; actualización documental en GitHub | Usuario | Chat: «Autorizo la fase 0 pero crealo en nuevo chat»; luego «actualiza en github». No se creó otro chat. |
| 2026-10-30 | 0 | En esta sesión, únicamente diagnóstico y planificación en cinco documentos; preservar trabajo; sin código ni publicación | Usuario | Solicitud inicial de esta sesión; autorización de ejecución, sin aceptación de cierre |
| 2026-10-30 | 0 | Revisar nuevamente los documentos actualizados por el usuario en GitHub | Usuario | Commit recibido `ea60377`; se preserva el registro anterior como antecedente, sin realizar push ni publicación desde esta sesión |
| 2026-10-30 | 0 | Aceptación y cierre de Fase 0; mantener todos los cambios del proyecto actualizados en GitHub | Usuario | «todos los cambios del este proyecto inventarioTI2 deben actualizarse en github y aprueba esta fase»; autoriza sincronización al repositorio, sin autorizar Fase 1 ni despliegue |
| 2026-10-30 | 1–15 | Ninguna ejecución autorizada en esta sesión | NO OTORGADA | Cada fase requiere autorización expresa independiente |

## Criterios para cerrar cada fase
- [ ] Alcance y entregables revisados.
- [ ] Criterios de aceptación comprobados.
- [ ] Pruebas o revisiones ejecutadas registradas con su resultado.
- [ ] Riesgos, supuestos y bloqueos documentados.
- [ ] `ESTADO_PROYECTO.md` y documentos pertinentes actualizados.
- [ ] Aprobación solicitada para la fase siguiente (no presumida).

**Estados válidos:** PENDIENTE · EN_PROGRESO · BLOQUEADA · EN_REVISION · COMPLETADA.

## Entrega de Fase 0
- Objetivo: centralizar inventario y trazabilidad de asignaciones por fecha.
- Responsable de preparación: Codex; revisión y aprobación: usuario.
- Dependencias: requisitos suministrados por el usuario; sin servicios externos para esta entrega documental.
- Entregables: docs/VISION.md, docs/REQUISITOS.md, docs/DECISIONES.md, FASES.md y ESTADO_PROYECTO.md.
- Verificación: `git diff --check` y revisión de cobertura y consistencia documental registradas en ESTADO_PROYECTO.md.
- Cierre: aceptación expresa del usuario el 2026-10-30. Alcance, prioridades y entrega documental aprobados; A-01 a A-11 y las interpretaciones señaladas permanecen como asuntos de detalle para sus fases, sin resolverse por inferencia.

## Puertas de aprobación siguientes
- Fase 1: solo después de revisar Fase 0 y autorizar expresamente el análisis detallado.
- Fase 2: solo con autorización expresa; usar visual-system-designer si está disponible, prototipo navegable con datos ficticios y revisión en computador, iPad e iPhone; verificar con Playwright si está disponible e informar limitaciones. El skill no está incluido en el árbol inspeccionado; volver a comprobar su disponibilidad al autorizar la fase.
- Fase 3: requiere nueva aprobación expresa después de la revisión visual; no está autorizada.
- La actualización en GitHub no autoriza publicar el entorno, desplegar ni realizar cambios productivos.

## Plan y criterios de aceptación de Fase 0

Actividades autorizadas: lectura e inspección; revisión de la actualización de GitHub; preservación de los requisitos y decisiones recibidos; complemento de visión, módulos, prioridades, riesgos y criterios; verificación documental y entrega para revisión. No se implementa código, prototipo, arquitectura, base de datos, RLS, correo ni reportes.

Dependencias: fuente empresarial actualizada disponible en `ea60377`; instrucciones permanentes leídas y conservadas. Responsable de documentación/verificación: Codex. Responsable de validar alcance, prioridades y cierre: usuario. Riesgos para esta planificación: resolver P/A por inferencia o retirar módulos solicitados; mitigación: conservar alcance y numeración, y distinguir propuestas de decisiones confirmadas.

CA0-01 a CA0-06 están en [docs/REQUISITOS.md](docs/REQUISITOS.md). Las revisiones ejecutadas y sus límites están en [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md). **CA0-06 cumplido: usuario aprueba la entrega y el cierre de Fase 0 el 2026-10-30.** Se requiere autorización separada para iniciar Fase 1.

### Evidencia de cierre de Fase 0

- [x] Visión, alcance, MVP completo y prioridades documentados y aceptados.
- [x] Criterios CA0-01 a CA0-06 comprobados mediante revisión documental y aprobación del usuario.
- [x] Verificaciones registradas, distinguiendo revisión documental de pruebas de aplicación no ejecutadas.
- [x] Riesgos, interpretaciones y decisiones detalladas pendientes conservados.
- [x] Documentos de continuidad actualizados y sincronización con GitHub autorizada de forma permanente en `AGENTS.md`.
- [x] Fases 1–15 continúan PENDIENTE / NO OTORGADA; Fase 1 requiere nueva autorización expresa.

## Dependencias, responsables y aceptación por fase

Toda fase requiere su propia autorización y la aceptación de los insumos previos. Los siguientes roles futuros son sugeridos, sin personas asignadas; el usuario conserva la aprobación. Esta tabla es planificación, no trabajo iniciado. Los criterios se concretarán al autorizar cada fase.

| Fase | Dependencias principales | Responsable / rol sugerido | Criterio de aceptación orientativo |
|---|---|---|---|
| 0 | Instrucciones y fuente empresarial actualizada | Codex y usuario | CA0-01 a CA0-06; alcance completo, prioridades e interpretaciones revisados |
| 1 | Visión y MVP aceptados | Analista, usuario e inventario | Procesos, actores, excepciones e historias trazables; resolver reglas necesarias de A-01 a A-11 |
| 2 | Requisitos y recorridos aceptados | UX/UI, QA y usuario | Prototipo ficticio navegable, revisión de computador/iPad/iPhone, evidencia y aceptación visual expresa |
| 3 | Requisitos, restricciones y revisión visual aceptados | Arquitectura y usuario | Alternativas justificadas, costos y riesgos; RLS/Supabase y portabilidad a SQL Server considerados sin promesas no verificadas |
| 4 | Identidad, cardinalidad, fechas y arquitectura acordadas | Datos y QA | Modelo y restricciones verifican unicidad, asignación vigente e integridad; migraciones y restauración de prueba |
| 5 | Identidad, cuentas, arquitectura y datos | Desarrollo, seguridad y QA | Acceso, recuperación, invitación y sesiones probados según reglas acordadas, sin exponer credenciales |
| 6 | Matriz de roles y permisos, autenticación | Seguridad y QA | Autorización efectiva y RLS verificadas; pruebas negativas de lectura, administración y auditoría |
| 7 | Reglas, datos, identidad y permisos | Backend y QA | Operaciones críticas coherentes, validación en servidor y concurrencia probadas |
| 8 | Prototipo aprobado y API disponible | Frontend y QA | Recorridos reales, responsive y errores verificables; permisos efectivos fuera de interfaz |
| 9 | Cuentas, permisos y configuración acordados | Desarrollo y QA | Gestión de cuentas, propio rol y último administrador protegidos, también concurrentemente |
| 10 | Reglas de movimientos y fechas aceptadas | Desarrollo, inventario y QA | Asignaciones, bajas y movimientos preservan situación actual e historial inmutable |
| 11 | Datos, filtros, fechas y permisos acordados | Reportes y QA | Cinco reportes y buscador exportan Excel/PDF con datos reproducibles y acceso autorizado |
| 12 | Eventos, destinatario y tratamiento de fallos acordados | Desarrollo y QA | Correos configurables, auditoría de configuración y fallos/reintentos probados sin filtración |
| 13 | Incremento funcional y metas acordadas | QA y seguridad | Evidencia E2E, accesibilidad, rendimiento, integridad y seguridad; defectos y criterios de salida evaluados |
| 14 | QA aceptado, operación y ambiente de prueba acordados | Operaciones, seguridad y QA | Respaldo/restauración, rollback y monitoreo probados fuera de producción; ninguna publicación sin permiso específico |
| 15 | Sistema entregado y operación documentada | Documentación y usuario | Manuales, capacitación, soporte y evolución permiten comprender y operar lo entregado |

Las verificaciones se realizan desde cada cambio autorizado; Fase 13 consolida QA. No se posterga seguridad o auditoría hasta completar otros módulos ni se inicia otra fase por una dependencia técnica.

En Fase 2 se registrarán ruta/comando de preview local, capturas, recorridos, cobertura de Playwright o revisión manual y límites de emulación. Documentar aceptación visual en `docs/UX_UI.md`; no avanzar a Fase 3 sin nueva aprobación expresa. El plan detallado de esa verificación está en [docs/REQUISITOS.md](docs/REQUISITOS.md).
