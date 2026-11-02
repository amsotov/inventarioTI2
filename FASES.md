# FASES.md — Plan y control de avance

**Proyecto:** Inventario y control de bienes computacionales (inventarioTI2)
**Modo:** GUIADO (aprobación expresa antes de cada fase)
**Fase actual:** 12 — COMPLETADA; entrega y cierre aprobados por D-35.
**Última fase completada:** 12.
**Próxima fase:** 13 — AUTORIZADA para iniciar en un nuevo chat; ejecución PENDIENTE. **Fases 14–15:** PENDIENTE / NO OTORGADA.

> La Fase 0 está completada y aprobada por el usuario. La Fase 1 fue autorizada posteriormente y su análisis documental se ejecutó en esta nueva conversación; está COMPLETADA por aprobación D-14, con seguimientos futuros explícitos y sin implementación. La Fase 2 está completada por aprobación visual expresa D-15. Fase 3 completada por D-17; Fase 4 completada por D-19; Fase 5 completada por D-21; Fase 6 completada por D-23; Fase 7 completada por D-25; Fase 8 completada por D-27; Fase 9 completada por D-29; Fase 10 completada por D-31; Fase 11 completada por D-33; Fase 12 completada por D-35; Fase 13 autorizada para un nuevo chat, ejecución pendiente; fases 14–15 sin autorización. Todos los cambios autorizados del proyecto deben sincronizarse con GitHub.

| Fase | Etapa | Entregable orientativo | Estado | Aprobación |
|---|---|---|---|---|
| 0 | Diagnóstico y planificación | Visión, requisitos iniciales, MVP, riesgos y decisiones | COMPLETADA | Ejecución y entregables APROBADOS por el usuario el 2026-10-30 |
| 1 | Análisis empresarial y requisitos | Actores, procesos, historias, criterios y trazabilidad | COMPLETADA | Entrega y resoluciones APROBADAS por usuario el 2026-10-31; UTC y respaldo semanal |
| 2 | UX/UI y diseño visual | Sistema visual, prototipo navegable y aprobación visual | COMPLETADA | Revisión visual y cierre APROBADOS el 2026-10-31; D-15 |
| 3 | Arquitectura tecnológica | Stack y decisiones arquitectónicas | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-10-31; D-17 |
| 4 | Modelado y persistencia de datos | Modelo ER, restricciones y migraciones | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-10-31; D-19 |
| 5 | Autenticación | Inicio de sesión, recuperación y sesiones | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-10-31; D-21 |
| 6 | Autorización, privacidad y seguridad | RBAC/ABAC según caso, controles y auditoría | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-10-31; D-23 |
| 7 | Backend y API | Servicios, reglas empresariales y contratos | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-11-01; D-25 |
| 8 | Frontend funcional | Pantallas e integración con API | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-11-01; D-27 |
| 9 | Panel de administración | Usuarios, permisos, catálogos y parámetros | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-11-01; D-29 |
| 10 | Procesos y módulos empresariales | Casos de uso, estados y movimientos | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-11-02; D-31 |
| 11 | Indicadores, reportes y exportación | Dashboards, filtros, Excel/PDF | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-11-02; D-33 |
| 12 | Notificaciones y automatización | Catálogo, outbox, reintentos y seguimiento | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-11-02; D-35 |
| 13 | QA, rendimiento y seguridad | Pruebas, regresión y accesibilidad | PENDIENTE | AUTORIZADA para un nuevo chat por D-35; ejecución no iniciada |
| 14 | Despliegue, operación y continuidad | CI/CD, respaldo, restauración y monitoreo | PENDIENTE | NO OTORGADA |
| 15 | Documentación, capacitación y evolución | Manuales, soporte y roadmap | PENDIENTE | NO OTORGADA |

## Registro de aprobación y ejecución

| Fecha | Fase | Alcance autorizado | Aprobó | Evidencia / enlace |
|---|---|---|---|---|
| 2026-10-30 | 0 | Diagnóstico y planificación; actualización documental en GitHub | Usuario | Chat: «Autorizo la fase 0 pero crealo en nuevo chat»; luego «actualiza en github». No se creó otro chat. |
| 2026-10-30 | 0 | En esta sesión, únicamente diagnóstico y planificación en cinco documentos; preservar trabajo; sin código ni publicación | Usuario | Solicitud inicial de esta sesión; autorización de ejecución, sin aceptación de cierre |
| 2026-10-30 | 0 | Revisar nuevamente los documentos actualizados por el usuario en GitHub | Usuario | Commit recibido `ea60377`; se preserva el registro anterior como antecedente, sin realizar push ni publicación desde esta sesión |
| 2026-10-30 | 0 | Aceptación y cierre de Fase 0; mantener todos los cambios del proyecto actualizados en GitHub | Usuario | «todos los cambios del este proyecto inventarioTI2 deben actualizarse en github y aprueba esta fase»; autoriza sincronización al repositorio, sin autorizar Fase 1 ni despliegue |
| 2026-10-30 | 1–15 | Al cerrar Fase 0, antes de la instrucción posterior, ninguna ejecución estaba autorizada | NO OTORGADA en ese momento | Antecedente histórico; ver autorización posterior de Fase 1 |
| 2026-10-30 | 1 | Autorizar análisis empresarial y requisitos para iniciarse en un nuevo chat | Usuario | «En nuevo chat inicia fase 1 inventarioTI2»; autorización registrada, conversación nueva aún no abierta ni trabajo de Fase 1 ejecutado |
| 2026-10-31 | 1 | Ejecutar únicamente análisis documental, conservar pendientes y sincronizar GitHub; sin código ni Fase 2 | Usuario | Solicitud de esta conversación; entrega EN_REVISION, aceptación y cierre aún no otorgados |
| 2026-10-31 | 1 | Aceptar paquete de recomendaciones con UTC y respaldo una vez por semana; cerrar análisis | Usuario | «Apruebo las conversiones, respaldo 1 vez a  la semana, zona horaria UTC y respaldo 1 vez a la semana»; D-14; no autoriza Fase 2 ni configuración operativa |
| 2026-10-31 | 2 | Iniciar UX/UI y prototipo con datos ficticios en un nuevo chat | Usuario | «En nuevo chat inicia fase 2 inventarioTI2»; ejecución pendiente para esa conversación, sin autorizar Fase 3 ni despliegue |
| 2026-10-31 | 2 | Aceptar revisión visual y cerrar Fase 2; autorizar Fase 3 para un nuevo chat | Usuario | D-15; aprobación expresa en esta conversación; arquitectura no iniciada |
| 2026-10-31 | 3 | Ejecutar únicamente arquitectura, leer cierre visual y sincronizar GitHub; sin Fase 4 ni despliegue | Usuario | Solicitud de esta conversación y D-15; entrega EN_REVISION, D-16 |
| 2026-10-31 | 3 / 4 | Aceptar arquitectura y cierre de Fase 3; autorizar Fase 4 en un chat nuevo | Usuario | «Apruebo y inicia fase 4 en un chat nuevo»; D-17. Sin gasto, despliegue ni fases 5–15 |
| 2026-11-02 | 11 / 12 | Aceptar entrega/cierre de Fase 11; autorizar únicamente Fase 12 para un nuevo chat | Usuario | D-33: «Apruebo fase 11, inicia en nuevo chat fase 12»; no se ejecuta Fase 12 en este cierre |
| 2026-11-02 | 12 | Ejecutar únicamente notificaciones/automatización y sincronizar GitHub; sin Fase 13 ni despliegue | Usuario | Solicitud vigente y D-34, ratifica D-33; entrega EN_REVISION |
| 2026-11-02 | 12 / 13 | Aceptar entrega/cierre de Fase 12; autorizar únicamente Fase 13 para un nuevo chat | Usuario | D-35: «Apruebo fase 12 y inicia en nuevo chat fase 13»; no se ejecuta Fase 13 en este cierre |

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
- Fase 1: autorización expresa ya otorgada para iniciarse en un nuevo chat. Leer la documentación vigente y presentar el plan antes de ejecutar el análisis; no volver a pedir la misma autorización.
- Fase 2: solo con autorización expresa; usar visual-system-designer si está disponible, prototipo navegable con datos ficticios y revisión en computador, iPad e iPhone; verificar con Playwright si está disponible e informar limitaciones. El skill no está incluido en el árbol inspeccionado; volver a comprobar su disponibilidad al autorizar la fase.
- Fase 3: requiere nueva aprobación expresa después de la revisión visual; no está autorizada.
- La actualización en GitHub no autoriza publicar el entorno, desplegar ni realizar cambios productivos.

## Plan y criterios de aceptación de Fase 0

Actividades autorizadas: lectura e inspección; revisión de la actualización de GitHub; preservación de los requisitos y decisiones recibidos; complemento de visión, módulos, prioridades, riesgos y criterios; verificación documental y entrega para revisión. No se implementa código, prototipo, arquitectura, base de datos, RLS, correo ni reportes.

Dependencias: fuente empresarial actualizada disponible en `ea60377`; instrucciones permanentes leídas y conservadas. Responsable de documentación/verificación: Codex. Responsable de validar alcance, prioridades y cierre: usuario. Riesgos para esta planificación: resolver P/A por inferencia o retirar módulos solicitados; mitigación: conservar alcance y numeración, y distinguir propuestas de decisiones confirmadas.

CA0-01 a CA0-06 están en [docs/REQUISITOS.md](docs/REQUISITOS.md). Las revisiones ejecutadas y sus límites están en [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md). **CA0-06 cumplido: usuario aprueba la entrega y el cierre de Fase 0 el 2026-10-30.** La autorización separada de Fase 1 fue otorgada después para iniciar su ejecución en un nuevo chat.

### Evidencia de cierre de Fase 0

- [x] Visión, alcance, MVP completo y prioridades documentados y aceptados.
- [x] Criterios CA0-01 a CA0-06 comprobados mediante revisión documental y aprobación del usuario.
- [x] Verificaciones registradas, distinguiendo revisión documental de pruebas de aplicación no ejecutadas.
- [x] Riesgos, interpretaciones y decisiones detalladas pendientes conservados.
- [x] Documentos de continuidad actualizados y sincronización con GitHub autorizada de forma permanente en `AGENTS.md`.
- [x] Al cerrar Fase 0, las fases 1–15 quedaron PENDIENTE / NO OTORGADA. Después se autorizó Fase 1 para un nuevo chat; las fases 2–15 continúan sin autorización.

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

## Continuidad autorizada en un nuevo chat — antecedente del 2026-10-30

El usuario indicó «En nuevo chat inicia fase 1 inventarioTI2». Fecha de registro: 2026-10-30 (America/Santiago). Esta instrucción autoriza únicamente Fase 1 — análisis empresarial y requisitos. En aquel registro su estado permanecía PENDIENTE hasta comenzar el trabajo en la nueva conversación; no se marca EN_PROGRESO ni COMPLETADA por preparar este registro.

Punto de inicio para el nuevo chat:

1. Abrir el repositorio `amsotov/inventarioTI2` y recuperar `main` vigente. Leer `AGENTS.md`, `PROMPT_MAESTRO.md`, `FASES.md`, `ESTADO_PROYECTO.md` y los documentos de visión, requisitos y decisiones.
2. Presentar y ejecutar el plan de Fase 1: catálogo de actores, mapa de procesos, reglas y excepciones, historias de usuario con criterios de aceptación y trazabilidad de RF-01 a RF-16 y RNF-01 a RNF-07.
3. Desarrollar A-01 a A-11 y ratificar P-01, P-02 y P-04 con las aclaraciones mínimas agrupadas; mantener explícito lo que siga sin resolver, sin inventar reglas. Preservar el alcance y numeración aprobados.
4. Actualizar fases, estado y documentos vinculados; verificar su coherencia y mantener todos los cambios en GitHub. No implementar código ni comenzar Fase 2 o Fase 3.

La preparación de continuidad no crea automáticamente un chat. Las herramientas de esta conversación no permiten abrir uno nuevo. Este registro posterior prevalece sobre las menciones históricas de Fase 1 sin autorización conservadas en los entregables de Fase 0.


## Ejecución y entrega inicial de Fase 1 — antecedente del 2026-10-31

Autorización ratificada en esta nueva conversación: «Inicia únicamente la Fase 1, ya autorizada en FASES.md y ESTADO_PROYECTO.md». Se recuperaron por avance directo `c45e96e` y `fa323a7` antes de editar; este registro actualiza el antecedente de continuidad anterior.

- Alcance/plan: analizar actores, procesos normales y excepciones, reglas, historias, criterios y trazabilidad; preservar numeración, pendientes y trabajo remoto. Plan presentado antes de redactar.
- Responsable de preparación/verificación: Codex; validación de negocio y cierre: usuario. Dependencias: Fase 0 aceptada y documentación vigente de `main`.
- Entregables: [análisis empresarial](docs/ANALISIS_EMPRESARIAL.md), [historias y criterios CA1-01 a CA1-06](docs/HISTORIAS_USUARIO.md), [trazabilidad](docs/TRAZABILIDAD.md); actualización de requisitos, decisiones, pruebas y continuidad.
- Resultado: 5 actores, 7 procesos, 6 casos de uso críticos, 19 reglas (16 confirmadas y 3 interpretaciones), 16 historias y 7 escenarios RNF. Los 7 módulos tienen valor y criterios verificables; cobertura documental completa de 16 RF y 7 RNF.
- Riesgos: A-01 a A-11 y P-01/P-02/P-04 siguen abiertos; los criterios afectados están condicionados y no se consideran aprobados. No se inventan políticas temporales, de bajas, correo, privacidad ni umbrales.
- Verificación: revisión documental y controles de enlaces, IDs, cobertura y diferencias; evidencia en docs/PRUEBAS.md y ESTADO_PROYECTO.md. No hay pruebas funcionales ejecutadas.
- Estado: EN_REVISION. CA1-06 pendiente de aceptación expresa y reglas necesarias. No marcar COMPLETADA por entregar documentos ni por subirlos a GitHub.
- Siguiente paso: revisar el análisis y resolver/ratificar pendientes; autorización de Fase 2 NO OTORGADA. Sin código, prototipo, instalación, arquitectura ni despliegue.

## Revisión de pendientes de Fase 1 — antecedente previo a la aprobación

Instrucción adicional: «Revisa y termina los pendientes de la fase 1». Se completa el trabajo preparatorio con [CIERRE_FASE1.md](docs/CIERRE_FASE1.md): alternativas, recomendaciones, contratos de reportes, parámetros de acceso/correo/servicio y 20 casos de aceptación complementarios. Los 14 pendientes A/P tienen una propuesta verificable; no se declaran aprobados por solicitar su desarrollo.

El usuario confirma Chile y 250 funcionarios y solicita calcular bienes (D-13). Se documenta estimación de 900–1.500 bienes, referencia 1.200, con supuestos; capacidad objetivo propuesta 3.000. La localidad/zona y la política de conservación aún no se han proporcionado. La propuesta ofrece America/Santiago condicionada a la localidad, no la registra como confirmada.

CA1-01 a CA1-05 cuentan con desarrollo y revisión documental; CA1-06 requiere ratificación de recomendaciones y resolución o aplazamiento explícito de los datos pendientes con sus límites. Estado de Fase 1: EN_REVISION, sin aprobación ficticia de cierre. No se inicia Fase 2 ni se modifica su estado. Responsable de ratificación: usuario; política de conservación: organización. La sincronización con GitHub continúa autorizada.

## Cierre aprobado de Fase 1 — estado vigente

D-14 acepta el paquete documentado y sus alternativas seleccionadas, con UTC y un respaldo semanal. [CIERRE_FASE1.md](docs/CIERRE_FASE1.md) versión 2 es la base vigente y actualiza el estado EN_REVISION de los antecedentes anteriores.

- [x] CA1-01: actores y responsabilidades diferenciados y aceptados.
- [x] CA1-02: siete módulos con valor, procesos, excepciones y reglas verificables.
- [x] CA1-03: 16 RF/7 RNF, 16 historias/47 criterios y 20 casos complementarios; aceptación de especificación, sin pruebas funcionales.
- [x] CA1-04: A-01 a A-11 resueltos para análisis, P-01/P-02/P-04 ratificados; F1-SEG-01/02/03 conservados como obligaciones futuras.
- [x] CA1-05: revisión documental y continuidad actualizadas; sincronización con GitHub se confirma tras comparar SHA local/remoto al entregar.
- [x] CA1-06: aceptación expresa del usuario registrada en D-14 el 2026-10-31.

UTC se usa en consultas, fichas, movimientos, auditoría y exportaciones. Respaldo semanal implica RPO objetivo de 7 días (168 h), sustituyendo 24 h de la propuesta diaria anterior; RTO 8 h y copias durante 30 días. La validación legal del plazo de registros personales no se confunde con conservación de copias: F1-SEG-01 en Fase 6 antes de datos reales. Presupuesto en Fase 3; día/hora UTC, alertas y configuración/pruebas de copias en Fases 3/14. Ninguna de esas tareas se declara implementada.

Fase 1 COMPLETADA. Siguiente fase propuesta: 2 — UX/UI, que requiere autorización independiente antes de iniciar. Fases 2–15 permanecen PENDIENTE / NO OTORGADA; sin código, prototipo, despliegue ni producción.

## Continuidad autorizada para Fase 2 — nuevo chat

El usuario indica «En nuevo chat inicia fase 2 inventarioTI2». Fase 2 AUTORIZADA; ejecución PENDIENTE hasta comenzar en esa conversación. Fase 1 sigue COMPLETADA; no se inicia diseño ni prototipo por registrar esta autorización. Este registro posterior actualiza las menciones históricas de Fase 2 sin autorización.

Punto de inicio:

1. Recuperar main de `amsotov/inventarioTI2`; leer AGENTS.md, PROMPT_MAESTRO.md, FASES.md, ESTADO_PROYECTO.md y los requisitos, análisis, historias, trazabilidad y CIERRE_FASE1 aceptados. No volver a pedir autorización para Fase 2.
2. Presentar el plan de UX/UI y comprobar disponibilidad del skill `.agents/skills/visual-system-designer/SKILL.md`; usarlo según AGENTS. La ruta no existe en el árbol previamente inspeccionado: volver a buscar su disponibilidad e informar si falta, sin afirmar que se usó ni instalar/sustituir por inferencia.
3. Diseñar navegación, formularios, búsqueda/filtros, fichas, movimientos e historia, cuentas, auditoría, configuración y cinco reportes; prototipo navegable solo con datos sintéticos y simulaciones identificadas. Conservar roles, UTC y reglas aprobadas; no implementar backend, datos reales, arquitectura definitiva ni respaldos por inferencia.
4. Facilitar preview local comprobado; revisar computador/iPad/iPhone, teclado, estados de carga/vacío/error/éxito y responsive. Usar Playwright si está disponible, registrar evidencia y límites; no confundir emulación con hardware real ni afirmar pruebas no ejecutadas.
5. Documentar resultado y aceptación visual en docs/UX_UI.md; mantener F1-SEG-01/02/03, revisar diferencias y sincronizar todos los cambios en GitHub. Fase 3 requiere autorización independiente después de la revisión visual. No publicar sitio ni desplegar.

Esta conversación solo registra autorización y continuidad. No hay herramienta disponible para abrir automáticamente otro chat: el usuario debe abrirlo con el repositorio y la instrucción de inicio. No se crea prototipo ni se comprueba navegador en esta preparación documental.


## Entrega de Fase 2 — antecedente previo al cierre del 2026-10-31

Solicitud de esta conversación: «Inicia únicamente la Fase 2 de inventarioTI2, ya autorizada en FASES.md y ESTADO_PROYECTO.md». Se recuperaron `fa844ec` y posteriormente `d6a14c5` (skill agregado por el usuario), sin reescribir historial ni sobrescribir su trabajo. Los registros anteriores de ejecución pendiente son antecedentes.

Plan presentado antes de implementar: mapa de pantallas por rol, sistema visual, prototipo de memoria, recorridos y verificación responsive/teclado; documentación y sincronización GitHub. Responsable de diseño/verificación: Codex; aceptación visual: usuario. Dependencia: Fase 1 completada con D-14. Skill leído y aplicado: [SKILL.md](SKILL.md), ubicación real en raíz, actualizada en AGENTS.

| Criterio | Resultado |
|---|---|
| CA2-01 · Mapa de navegación, componentes, sistema visual y formularios | Entregados en docs/UX_UI.md y prototipo/ |
| CA2-02 · Datos ficticios y acciones identificadas como simulación | Muestra efímera, dominio example.invalid; sin servicios externos |
| CA2-03 · Consulta, filtros, fichas, movimientos, administración y reportes | Recorridos y excepciones representados; límites de vistas/exportación documentados |
| CA2-04 · Responsive y teclado, estados vacío/carga/error/éxito/permiso | Evidencia y resultados reales en docs/PRUEBAS.md; emulación no equivale a dispositivos reales |
| CA2-05 · Preview local, capturas y pasos reproducibles | prototipo/index.html, instrucciones en README y docs/UX_UI; capturas en docs/evidencias/fase2 |
| CA2-06 · Usuario acepta visualmente | CUMPLIDO el 2026-10-31 por D-15; Fase 2 COMPLETADA |

Se conservan F1-SEG-01/02/03. No se implementaron backend, persistencia, autenticación, APIs, correo, exportaciones reales ni respaldos. HTML/CSS/JS son soporte del prototipo, sin arquitectura definitiva. No hubo despliegue. Siguiente acción: revisar diseño, recoger cambios y registrar aceptación visual. Cualquier inicio de Fase 3 requiere autorización independiente.


## Cierre aprobado de Fase 2 y continuidad de Fase 3 — estado vigente

Fecha: 2026-10-31. Evidencia del usuario: «apruebo la revisión visual" para que cierre la fase y pase a la Fase 3 en nuevo chat». D-15 acepta la revisión visual y el cierre de la entrega `88d54f6`; autoriza Fase 3 únicamente para iniciarla en un nuevo chat. Este registro actualiza las menciones históricas de aceptación pendiente y Fase 3 no autorizada.

CA2-01 a CA2-05 conservan la evidencia de UX/UI y verificación de la entrega; CA2-06 queda satisfecho por aceptación expresa. Fase 2 COMPLETADA. Se conservan las 21 verificaciones UI, las capturas y sus límites: aprobación del prototipo, sin acreditar funcionalidades reales de fases futuras. No se modifica código ni se repiten pruebas de UI por este cierre documental.

Inicio en el nuevo chat:

1. Recuperar main de `amsotov/inventarioTI2`; leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos, D-14/D-15, CIERRE_FASE1, UX_UI y evidencia de pruebas. No volver a pedir la autorización de Fase 3 ya otorgada.
2. Presentar y ejecutar únicamente el plan de Fase 3 — arquitectura tecnológica: alternativas y justificación del stack, componentes, contratos y ADR según requisitos y diseño aceptados. La preparación de este punto de continuidad no elige ni implementa esas decisiones.
3. Conservar D-07 (orientación RLS/Supabase y futura adaptación a SQL Server), UTC y respaldo semanal/RPO 7 días/RTO 8 h/copias 30 días; mantener F1-SEG-01/02/03. Presupuesto y diseño operativo siguen pendientes de sus fases, sin gastos ni contrataciones autorizadas por este cierre.
4. Documentar resultados y verificación, sincronizar GitHub y entregar Fase 3 para revisión. Fases 4–15 no autorizadas; sin despliegue ni producción.

Esta sesión cierra y prepara continuidad; no inicia arquitectura ni abre automáticamente un chat nuevo.


## Ejecución vigente de Fase 3 — 2026-10-31

Solicitud: «Inicia únicamente la Fase 3, ya autorizada en FASES.md y ESTADO_PROYECTO.md. Lee las instrucciones y el cierre visual, desarrolla la arquitectura y actualiza GitHub. No inicies Fase 4 ni despliegues». D-16 registra ejecución, sin atribuir aprobación de la entrega.

Plan presentado antes de redactar: alternativas/stack, módulos/diagrama, contratos/ADR, costos/entornos, integridad/RLS/SQL Server y continuidad; verificación y sincronización. Base `e7db2c6`, recuperada por avance directo, árbol inicial limpio. Responsable de preparación/verificación: Codex; aceptación y presupuesto: usuario. Dependencias: D-14, D-15, requisitos y prototipo aceptados.

Entregables: [arquitectura](docs/ARQUITECTURA.md), [contratos](docs/CONTRATOS_API.md), [seis ADR](docs/adr/FASE3.md). CA3-01 a CA3-05 documentados/revisados; CA3-06 pendiente de aceptación expresa. Verificación y limitaciones en [pruebas](docs/PRUEBAS.md). Fase 3 EN_REVISION; última completada 2. La selección técnica está propuesta para revisión; no equivale a contratar ni a implementar.

F1-SEG-01 sigue obligatorio antes de datos reales. F1-SEG-02 evaluado mediante escenario 67–87 USD/mes base, presupuesto no informado ni gasto aprobado. F1-SEG-03 desarrollado como propuesta semanal externa cifrada, horario domingo 02:00 UTC sujeto a aprobación operativa; mantiene RPO 7 días/RTO 8 h/copias 30 días. Ningún seguimiento se declara cerrado por documentarlo.

Sin modelo ER, SQL, migraciones, implementación de identidad/RLS/backend, nuevas dependencias, cambios al prototipo o despliegues. Fases 4–15 PENDIENTE / NO OTORGADA, filas conservadas. Siguiente acción: revisar/aceptar Fase 3; Fase 4 requiere autorización independiente. No iniciar por dependencia técnica.


## Cierre aprobado de Fase 3 y continuidad autorizada de Fase 4 — vigente

2026-10-31. Evidencia: «Apruebo y inicia fase 4 en un chat nuevo». D-17 acepta la arquitectura, contratos y seis ADR de `703002c`; CA3-06 CUMPLIDO y Fase 3 COMPLETADA. Los controles CA3-01 a CA3-05 conservan evidencia documental y sus limitaciones: no hay aplicación, RLS o restauración reales por aprobar un diseño.

Fase 4 AUTORIZADA para iniciarse en un nuevo chat, ejecución PENDIENTE. No volver a pedir esta autorización. Esta sesión solo registra cierre/continuidad y sincroniza GitHub. No puede abrir automáticamente una conversación.

Punto de inicio de Fase 4:

1. Recuperar main; leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, D-14 a D-17, requisitos/cierre empresarial, UX_UI, ARQUITECTURA, CONTRATOS_API y ADR aceptadas. Presentar el plan antes de ejecutar.
2. Ejecutar únicamente modelado y persistencia: modelo conceptual/lógico/físico, ER, diccionario, restricciones, índices, migraciones versionadas y datos sintéticos, con pruebas de integridad/concurrencia y restauración en entorno local/de prueba aislado. Conservar identidad cuenta/funcionario separada, unicidad aun tras baja, custodia vigente única, UTC, historia/auditoría inmutables y atomicidad/idempotencia/outbox.
3. Inspeccionar herramientas reales antes de usarlas y seguir la guía Supabase vigente. No instalar Spec Kit sin autorización ni inventar comandos. No usar un proyecto remoto real por inferencia; sin datos reales, operaciones destructivas, gastos o producción. Si una dependencia no está disponible, documentar el bloqueo y avanzar la parte independiente sin declarar pruebas inexistentes.
4. Preservar RLS/SQL Server como requisitos de diseño y límites de fase: implementar autenticación, autorización o backend funcional corresponde a fases 5/6/7 con autorización propia. No iniciarlas para completar una dependencia.
5. Mantener F1-SEG-01 antes de datos reales; F1-SEG-02 presupuesto sin aprobar y F1-SEG-03 operación sin configurar. UTC, copia semanal/RPO 168 h/RTO 8 h/30 días intactos. Aprobación arquitectónica no contrata proveedores ni confirma horario/operador de respaldo.
6. Registrar pruebas ejecutadas/no ejecutadas, riesgos y pendientes; actualizar documentación y GitHub, comprobar SHA remoto y entregar Fase 4 para revisión. Fases 5–15 sin autorización; sin despliegue.


## Ejecución de Fase 4 — entrega vigente, 2026-10-31

Usuario ratifica D-17: «Inicia únicamente la Fase 4, ya autorizada en FASES.md y ESTADO_PROYECTO.md. Lee las instrucciones y la arquitectura aceptada, desarrolla el modelado y la persistencia, y actualiza GitHub. No inicies Fase 5 ni despliegues».

Plan presentado y ejecutado: ER/modelos/diccionario, esquema privado con restricciones/índices, migración versionada y seed sintético; pruebas reales locales de integridad, concurrencia, transacciones y restauración; revisión documental y sincronización. Base recuperada por avance directo: `1fe5859`, árbol inicial limpio. Codex prepara/verifica; usuario revisa/acepta. Dependencias D-14/D-17 y contratos respetados.

Entregables y CA4-01 a CA4-06 en [BASE_DATOS](docs/BASE_DATOS.md), [diccionario](docs/DICCIONARIO_DATOS.md), supabase/migrations, db y tests/datos; evidencia en [PRUEBAS](docs/PRUEBAS.md). Fase 4 EN_REVISION, CA4-06 pendiente. Última completada 3; filas 5–15 sin cambios. No implementar Auth, permisos funcionales, API o worker para cerrar esta fase.

F1-SEG-01/02/03 permanecen abiertos. UTC, copia semanal, máximo 168 h/RPO 168 h, RTO 8 h y copias 30 días conservados. Prueba de dump/restauración sintética no equivale a continuidad Supabase productiva. Siguiente paso: revisión y aceptación de esta entrega; Fase 5 requiere autorización independiente, no otorgada.


## Cierre aprobado de Fase 4 y continuidad autorizada de Fase 5 — vigente

2026-10-31. Evidencia literal: «Apruebo fase 4 y inicia fase 5 inventarioTI2 en nuevo chat». D-19 acepta la entrega `65609df9f7868555d985d381c4dcf24c97d06235`: CA4-06 CUMPLIDO, Fase 4 COMPLETADA. Se conserva la evidencia de 46 comprobaciones PostgreSQL y revisión documental, con sus límites. La aprobación no acredita integración Supabase/Auth ni permisos funcionales o recuperación productiva.

Fase 5 AUTORIZADA para iniciar únicamente en un nuevo chat; ejecución PENDIENTE, sin volver a pedir esta autorización. Aquí solo se registra cierre/continuidad y se sincroniza GitHub. No se puede abrir automáticamente una conversación. Fases 6–15 sin autorización; sin despliegue, producción o gastos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, D-14/D-17/D-19, CIERRE_FASE1, ARQUITECTURA, CONTRATOS_API, ADR, BASE_DATOS, DICCIONARIO_DATOS, migraciones y pruebas aceptadas. Presentar plan de Fase 5 antes de implementar.
2. Desarrollar solo autenticación según contratos aceptados: acceso/salida, invitación 24 h y recuperación 30 min de un uso con invalidación anterior; MFA administrativo obligatorio; sesión opaca del BFF, inactividad 30 min/duración absoluta 8 h y revocación efectiva en siguiente petición. Sin autorregistro ni administrador/contraseña predeterminados. Cuentas y funcionarios permanecen separados.
3. Verificar capacidades vigentes de Supabase y herramientas reales; fijar versiones/lockfiles si se incorporan dependencias; trabajar con datos sintéticos y entorno aislado. No modificar un proyecto remoto real, crear primer administrador real, enviar correos a terceros ni asumir credenciales/proveedores/gastos. Si falta una integración, avanzar lo independiente y registrar el bloqueo sin atribuir pruebas reales a dobles de prueba.
4. Conservar la migración aceptada: cualquier cambio de persistencia necesario para autenticación debe ser una migración nueva, aditiva y verificable. No abrir acceso empresarial genérico ni implementar las políticas completas de Fase 6, API empresarial de Fase 7 o panel de Fase 9 por dependencia. Probar los controles de autenticación que sí forman parte de Fase 5, secretos fuera de Git y respuestas sin filtración.
5. Mantener F1-SEG-01 antes de datos reales; F1-SEG-02 presupuesto y F1-SEG-03 operación sin resolver. UTC, copia semanal/máximo 168 h/RPO 168 h, RTO 8 h y copias 30 días intactos. No configurar despliegues.
6. Registrar pruebas ejecutadas/no ejecutadas de sesión, expiración, revocación, MFA y enlaces; actualizar fases/estado/documentación y GitHub, verificar SHA remoto y entregar para revisión. No marcar COMPLETADA por solo implementar ni iniciar Fase 6 sin autorización independiente.


## Entrega de Fase 5 — punto vigente 2026-10-31

Autorización ratificada: «Inicia únicamente la Fase 5, ya autorizada en FASES.md y ESTADO_PROYECTO.md. Lee las instrucciones, la arquitectura y la persistencia aceptadas, desarrolla autenticación y actualiza GitHub. No inicies Fase 6 ni despliegues».

Base actualizada por avance directo a `3b7e43a`, sin cambios locales iniciales. Plan presentado: BFF de identidad, puertos/adaptadores, migración aditiva, pruebas sintéticas de sesiones/MFA/enlaces/fallos, documentación y sincronización GitHub. Codex prepara/verifica; usuario conserva aceptación. Entregables, CA5-01 a CA5-06 y bloqueos en [AUTENTICACION](docs/AUTENTICACION.md); evidencia en [PRUEBAS](docs/PRUEBAS.md).

Fase 5 EN_REVISION, no COMPLETADA: la implementación local no acredita proyecto gestionado, envío real de correo ni privilegios operativos. No se implementaron permisos empresariales, backend de inventario, panel o despliegue. Fases 6–15 mantienen PENDIENTE / NO OTORGADA. Siguiente acción: revisar entrega y pendientes de integración de Fase 5; no autorizar ni iniciar Fase 6 por inferencia. F1-SEG-01/02/03 siguen abiertos; UTC y continuidad semanal/168 h/8 h/30 días intactos.


## Cierre aprobado de Fase 5 y arranque autorizado de Fase 6 — vigente

2026-10-31. Evidencia literal: «Apruebo fase 5 y en nuevo chat inicia fase 6». D-21 acepta la entrega `6ab7229f2a89ca08fbd2f274377aa146386bc165`, cumple CA5-06 y cierra Fase 5 COMPLETADA con sus límites operativos documentados. La aprobación no convierte pendientes de integración, correo, UI o privilegios en controles operativos verificados. Se conservan las 18 pruebas de autenticación y 46 comprobaciones históricas con su alcance original.

Fase 6 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. En esta tarea solo se registra el cierre/continuidad y se sincroniza GitHub. No se abre automáticamente una conversación ni se implementa Fase 6 aquí. Fases 7–15 sin autorización; sin despliegue, producción, gastos ni cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre empresarial D-14, arquitectura/ADR/contratos aceptados D-17, persistencia D-19 y autenticación D-21, incluido código, migraciones y pruebas reales. No pedir nuevamente autorización de Fase 6.
2. Presentar plan limitado a autorización, privacidad y seguridad: modelo de amenazas, matriz de permisos administrador/lectura, ámbitos de inventario compartido y datos personales, controles y auditoría, con trazabilidad y pruebas negativas. No resolver conservación legal por inferencia: F1-SEG-01 sigue obligatorio antes de datos reales.
3. Desarrollar en entorno sintético aislado los privilegios SQL mínimos sin propiedad/BYPASSRLS, contexto de actor/sesión verificado y local a cada transacción, políticas RLS y controles servidor. Rol/estado/versión/MFA deben comprobarse vigentes; nunca confiar en user_metadata, rol del cliente o JWT antiguo. No exponer tablas privadas ni usar claves administrativas de Auth para negocio. Conservar historia/auditoría inmutables y probar denegaciones y aislamiento del pool.
4. Revisar los controles de autenticación existentes y sus pendientes sin atribuir integración operativa a las pruebas locales. Probar accesos entre roles, revocación, MFA, lectura/administración/auditoría, CSRF/Origin, inyección, XSS e IDOR/BOLA según superficie realmente existente. Añadir únicamente las interfaces necesarias de seguridad; no implementar por dependencia la API empresarial de Fase 7, frontend de Fase 8 o panel de Fase 9.
5. Preservar migraciones aceptadas; cambios necesarios en migraciones nuevas aditivas y verificables. No modificar proyectos remotos, permisos reales, primer administrador, buzones, datos reales ni producción sin autorización específica. Sin gastos ni despliegue. F1-SEG-02 presupuesto y F1-SEG-03 operación de respaldo siguen abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.
6. Actualizar docs/SEGURIDAD.md y documentos vinculados, registrar pruebas ejecutadas/no ejecutadas y riesgos, sincronizar GitHub y comprobar SHA remoto. Entregar Fase 6 para revisión propia; no marcar cierre por solo implementar ni iniciar Fase 7 sin autorización independiente.


## Ejecución y entrega de Fase 6 — vigente, 2026-10-31

Solicitud: «Inicia únicamente la Fase 6, ya autorizada en FASES.md y ESTADO_PROYECTO.md. Desarrolla autorización, privacidad y seguridad, y actualiza GitHub. No inicies Fase 7 ni despliegues».

Base limpia recuperada por avance directo a `9845b10`. Plan presentado antes de implementar: matriz de dos roles/inventario compartido, amenazas, privilegios SQL mínimos, contexto transaccional, RLS, privacidad/auditoría, endurecimiento HTTP y pruebas negativas aisladas. Codex implementa y verifica; usuario conserva aceptación.

Entregables/criterios CA6-01 a CA6-06 en [SEGURIDAD](docs/SEGURIDAD.md); código apps/server/security, nueva migración aditiva, tests/security y evidencia en [PRUEBAS](docs/PRUEBAS.md). Fase 6 EN_REVISION; CA6-06 pendiente, última completada 5. Filas 7–15 permanecen PENDIENTE / NO OTORGADA. Ningún endpoint empresarial nuevo, cuenta real, permiso remoto, gasto o despliegue.

La provisión de logins SQL reales y verificación de proyecto Supabase gestionado siguen pendientes operativos. Escritura empresarial genérica cerrada; su futura apertura exige los servicios atómicos y controles de sus fases autorizadas. F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días preservados. Siguiente acción: revisión y aceptación expresa de Fase 6; no iniciar Fase 7.


## Cierre aprobado de Fase 6 y arranque autorizado de Fase 7 — vigente

2026-10-31. Evidencia literal: «Aprobado fase 6. Inicia fase 7 en nuevo chat». D-23 acepta la entrega `336232a9b1add5c6605f396a90795e419022756c`, cumple CA6-06 y cierra Fase 6 COMPLETADA. Se conservan las 34 pruebas y sus límites: verificación local, sin proyecto Supabase gestionado ni logins SQL reales aprovisionados.

Fase 7 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Aquí solo se registra cierre/continuidad y se sincroniza GitHub; no se abre automáticamente una conversación ni se implementa backend empresarial. Fases 8–15 sin autorización; sin despliegue, producción, datos reales, gastos ni cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14, arquitectura/ADR/contratos D-17, persistencia D-19, autenticación D-21 y seguridad D-23, con código/migraciones/pruebas y pendientes. No volver a pedir autorización de Fase 7.
2. Presentar el plan de Backend y API antes de implementar: servicios por dominio, contratos, validación servidor, consultas/filtros/paginación, reglas, errores, transacciones, control de concurrencia e idempotencia dentro de Fase 7. Delimitar módulos empresariales específicos de Fase 10; no iniciar frontend, panel, reportes/exportadores, automatizaciones ni otras fases por dependencia.
3. Integrar autorización con sesión vigente y pool empresarial separado sin propiedad/BYPASSRLS. Respetar contexto LOCAL, MFA, matriz de dos roles e inventario compartido. No reutilizar pool Auth ni claves administrativas para negocio. El callback no reingresa en Auth ni confirma su propia transacción. Diseñar cualquier privilegio necesario de forma mínima en una migración nueva, en entorno sintético local; no abrir DML genérico sin servicios que preserven reglas.
4. Toda escritura empresarial habilitada debe validar en servidor y coordinar estado/historia/auditoría/outbox/resultado idempotente en una transacción, con versión esperada y pruebas de rollback, concurrencia, replay y denegaciones. No declarar API completa por contar con contratos o puertos. Preservar migraciones/evidencias aceptadas; probar la composición real y documentar límites.
5. No aprovisionar cuentas o permisos reales ni resolver retención legal por inferencia. F1-SEG-01/02/03 siguen abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Sin instalación de Spec Kit, gastos o despliegue sin autorización propia.
6. Actualizar documentación, FASES/ESTADO y GitHub; verificar SHA remoto y entregar Fase 7 para revisión propia. La aprobación de Fase 6 no acepta por adelantado entregables de Fase 7 ni autoriza Fase 8.


## Entrega de Fase 7 — vigente 2026-10-31

Solicitud: «Inicia únicamente la Fase 7 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 8 ni despliegues». D-24 ratifica ejecución D-23, sin aceptación anticipada. Base limpia recuperada por avance directo a `0fead7b`.

Plan presentado y ejecutado: servicios/contrato OpenAPI, consultas autorizadas y proyección positiva, filtros/paginación/ETag, alta y edición de atributos de bienes, transacción estado/comando/auditoría/outbox, idempotencia/versiones, pruebas HTTP/SQL y documentación. Entregables, CA7-01 a CA7-06 y límites en [BACKEND_API](docs/BACKEND_API.md); evidencia en [PRUEBAS](docs/PRUEBAS.md). Codex implementa/verifica; usuario conserva aceptación. Fase 7 EN_REVISION, última completada 6; no declarar API global del MVP completa.

Solo migración nueva aditiva y entorno sintético local. Runtime sin DML directo; función privada acotada con RLS, sesión vigente y pool separado. Funcionalidad futura de movimientos, panel, exportaciones y automatizaciones conserva sus puertas de aprobación. Prototipo y migraciones/evidencia aceptadas preservados; sin frontend funcional ni despliegue.

F1-SEG-01/02/03 continúan abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Supabase gestionado, logins reales, correo externo y continuidad operativa no verificados en esta fase. Siguiente paso: revisión y aceptación propia de la Fase 7; Fases 8–15 PENDIENTE / NO OTORGADA.


## Cierre aprobado de Fase 7 y arranque autorizado de Fase 8 — vigente

2026-11-01. Evidencia literal: «Apruebo fase 7 y en un nuevo chat inicia fase 8». D-25 acepta la entrega `6035e125617a2c8d6e366df49940b8d720f8d535`, cumple CA7-06 y cierra Fase 7 COMPLETADA. Se conservan las 49 pruebas y 46 comprobaciones históricas con sus límites; la aprobación no acredita Supabase gestionado, logins reales, correo externo ni operación productiva, ni convierte la API global del MVP en completa.

Fase 8 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Aquí solo se registra cierre/continuidad y se sincroniza GitHub. No se abre automáticamente una conversación ni se implementa frontend en esta tarea. Fases 9–15 sin autorización; sin despliegue, producción, datos reales, gastos ni cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14, UX_UI/prototipo y aceptación visual D-15, arquitectura/ADR D-17, persistencia D-19, autenticación D-21, seguridad D-23 y BACKEND_API/OpenAPI D-25 con código/pruebas y límites. No volver a pedir autorización de Fase 8.
2. Presentar el plan limitado a frontend funcional: integrar el diseño aceptado con la API realmente disponible, navegación, acceso/sesión/MFA, consultas/fichas, filtros y paginación, alta/edición de atributos de bienes según permisos. Mantener las restricciones de PATCH y distinguir superficies aún no implementadas; no fingir persistencia ni rellenar servicios ausentes con simulaciones presentadas como reales.
3. Conservar seguridad en servidor y mínimo privilegio; cookie opaca HttpOnly/Secure/SameSite, Origin/CSRF, sin tokens de proveedor ni secretos en navegador/localStorage. Tratar 401/403, validación, conflictos 409/412/428, expiración y reintentos con clave idempotente; no sobrescribir cambios concurrentes ni reenviar ciegamente comandos.
4. Verificar fidelidad visual, responsive en computador/iPad/iPhone, teclado/accesibilidad y estados carga/vacío/error/éxito/permiso, más recorridos UI/API con datos sintéticos en entorno local aislado. Inspeccionar herramientas reales y registrar limitaciones; emulación no equivale a dispositivos reales. No modificar el prototipo/evidencia aceptados por inferencia.
5. No implementar panel administrativo (9), nuevos procesos empresariales de movimientos (10), reportes/exportadores (11) o envío/automatización del outbox (12) por dependencia. Si falta backend necesario, documentar el bloqueo y avanzar lo independiente dentro de Fase 8, sin abrir otra fase ni proyectos remotos. Sin Spec Kit, gastos o despliegues sin autorización propia.
6. Preservar F1-SEG-01/02/03, UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días. Registrar pruebas ejecutadas/no ejecutadas, pendientes y criterios; actualizar documentación y GitHub, verificar SHA remoto y entregar Fase 8 para su propia revisión. No marcar COMPLETADA ni iniciar Fase 9 sin aceptación/autorización independiente.


## Entrega de Fase 8 — punto vigente 2026-11-01

Solicitud: «Inicia únicamente la Fase 8 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 9 ni despliegues». D-26 registra ejecución dentro de D-25, sin aceptación anticipada. Base limpia actualizada por avance directo a `1297549`.

Plan presentado y ejecutado: React/Vite según diseño D-15, acceso/sesión/MFA, consultas/fichas/filtros/paginación, alta/edición de atributos sobre API real, seguridad y errores/versiones/idempotencia, pruebas locales sintéticas UI/BFF/PostgreSQL y documentación/GitHub. Codex prepara/verifica; usuario acepta. Alcance, CA8-01 a CA8-06 y límites en [FRONTEND](docs/FRONTEND.md); evidencia en [PRUEBAS](docs/PRUEBAS.md).

Fase 8 EN_REVISION; CA8-06 pendiente, última completada 7. Fases 9–15 conservan PENDIENTE / NO OTORGADA. Sin panel administrativo, nuevos procesos empresariales, reportes, automatización, proyectos/datos reales, gastos o despliegue. F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días preservados. Siguiente paso: revisar/aceptar Fase 8; Fase 9 requiere autorización independiente.


## Cierre aprobado de Fase 8 y continuidad autorizada de Fase 9 — vigente

2026-11-01. Evidencia literal: «Apruebo fase 8 y en un nuevo chat inicia fase 9». D-27 acepta la entrega `570e90d10819999e96e17a4f88dfd30c8e1f5224`, cumple CA8-06 y cierra Fase 8 COMPLETADA. Se conservan las 49 pruebas de regresión, las 9 pruebas UI, capturas y auditoría con sus límites: identidad externa doble, sin Supabase gestionado, correo externo, dispositivos físicos ni operación productiva acreditados.

Fase 9 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Esta sesión solo registra cierre y continuidad y sincroniza GitHub. No se abre automáticamente una conversación ni se implementa el panel aquí. Fases 10–15 PENDIENTE / NO OTORGADA; sin despliegue, producción, datos reales, gastos o cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14, diseño D-15, arquitectura/ADR D-17, persistencia D-19, autenticación D-21, seguridad D-23, BACKEND_API/OpenAPI D-25 y FRONTEND D-27, con código/pruebas y límites. No volver a pedir la autorización de Fase 9 ya otorgada.
2. Presentar el plan limitado a panel de administración: cuentas/usuarios, roles/permisos, catálogos y parámetros según requisitos aceptados. Inspeccionar servicios disponibles; integrar las interfaces servidor y persistencia estrictamente necesarias dentro de esta fase, sin presentar simulaciones como funciones reales ni abrir otras fases por dependencia.
3. Proteger cuenta propia y último administrador activo, también concurrentemente. Mantener separación cuenta/funcionario, dos roles e inventario compartido, MFA administrativo, sesión/rol/estado/versión vigentes, Origin/CSRF y revocación efectiva en siguiente petición. Validar permisos en servidor y SQL, sin confiar en controles de UI, claims antiguos ni metadatos editables por cliente.
4. Conservar contexto SQL LOCAL y pools separados, privilegios mínimos/RLS, historia y auditoría inmutables. Cambios necesarios de persistencia mediante migraciones nuevas aditivas y verificables; probar permisos negativos, escalamiento, concurrencia, rollback y versiones/idempotencia cuando corresponda. Invitaciones solo con identidad y entrega dobles en entorno sintético; sin enviar mensajes reales ni aprovisionar cuentas/permisos remotos por inferencia.
5. Mantener diseño aprobado y verificar formularios, carga/vacío/error/éxito/permiso, teclado y responsive computador/iPad/iPhone, más recorridos UI/API sintéticos. La administración de parámetros no autoriza procesar/enviar outbox, implementar nuevos movimientos de negocio, reportes/exportadores o automatizaciones de fases 10–12.
6. Preservar F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días. Sin Spec Kit, gastos, datos reales, despliegues ni producción sin autorización propia. Registrar pruebas ejecutadas/no ejecutadas, riesgos y criterios; actualizar documentación y GitHub, comprobar SHA remoto y entregar Fase 9 para aceptación propia. No marcar COMPLETADA ni iniciar Fase 10 sin aprobación independiente.


## Entrega de Fase 9 — vigente, 2026-11-01

Solicitud: «Inicia únicamente la Fase 9 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 10 ni despliegues». D-28 ratifica D-27. Base inicial limpia actualizada por avance directo a `3dc4df2`. Plan presentado antes de implementar: cuentas/dos roles, catálogo unidades, destinatario, protección propia/último administrador, transacciones/versiones/idempotencia, integración UI y pruebas sintéticas SQL/HTTP/navegador; documentación y GitHub. Codex prepara/verifica; usuario revisa/acepta.

Entregables, archivos, criterios CA9-01 a CA9-06 y riesgos en [ADMINISTRACION](docs/ADMINISTRACION.md); operación del panel en [MANUAL_ADMIN](docs/MANUAL_ADMIN.md), evidencia y límites en [PRUEBAS](docs/PRUEBAS.md). Migración nueva aditiva, sin modificar las aceptadas. Cuentas locales pendientes separadas de identidad externa; invitación/recuperación explícitas, sin envío real. Persistencia, roles mínimos/RLS, propias cuentas, revocación, concurrencia, replay y rollback verificados en entorno sintético.

Fase 9 EN_REVISION; CA9-06 pendiente de aceptación propia. Última completada 8. Fases 10–15 conservan PENDIENTE / NO OTORGADA. No nuevos movimientos, reportes/exportadores, worker/envío outbox, permisos remotos, datos/cuentas reales, gastos o despliegues. Advisors local sin stack disponible; no se acredita Supabase gestionado ni operación productiva. F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.

GitHub: revisar diferencias, commit/push normales a main con autoría noreply y verificar SHA remoto antes de confirmar. Siguiente paso: revisión y aceptación de Fase 9; no iniciar Fase 10 por inferencia.


## Cierre aprobado de Fase 9 y continuidad autorizada de Fase 10 — vigente

2026-11-01. Evidencia literal: «Apruebo fase 9 y en un nuevo chat inicia fase 10». D-29 acepta la entrega `fff63ac3f8afd6c471ef1649dd83ab5332d0f36c`, cumple CA9-06 y cierra Fase 9 COMPLETADA. Se conservan las 61 pruebas de regresión, las 11 pruebas de navegador, capturas y auditoría con sus límites: ensayos sintéticos/identidad doble, sin Supabase gestionado/advisors locales operativos, correo externo, dispositivos físicos ni continuidad productiva acreditados.

Fase 10 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Esta tarea solo registra cierre y continuidad y sincroniza GitHub. No se abre automáticamente una conversación ni se implementan procesos empresariales aquí. Fases 11–15 PENDIENTE / NO OTORGADA; sin despliegue, producción, datos reales, gastos o cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14, UX_UI D-15, arquitectura/ADR D-17, datos D-19, autenticación D-21, seguridad D-23, BACKEND_API/OpenAPI D-25, FRONTEND D-27 y ADMINISTRACION D-29, con código, migraciones, pruebas y límites aceptados. No volver a pedir autorización de Fase 10.
2. Presentar plan limitado a procesos y módulos empresariales acordados: gestión de funcionarios e identidad RUT/ID, pertenencias/unidades, asignación, devolución, traslado, condición, bajas/reactivación e historia/correcciones inmutables. Inspeccionar primero lo disponible, conservar atributos de bienes y panel existentes e integrar únicamente servicios/persistencia/UI necesarios de Fase 10. No confundir documentación de contratos con implementación completa.
3. Mantener cuentas separadas de funcionarios, dos roles e inventario compartido, MFA administrativo, sesión/rol/estado/versión vigentes, Origin/CSRF, contexto SQL LOCAL, pools separados, privilegios mínimos/RLS y propia cuenta/último administrador protegidos. No reingresar en Auth desde callbacks empresariales ni usar credenciales de identidad para negocio.
4. Preservar unicidad incluso después de baja, custodia vigente única, historial/auditoría inmutables y reglas aceptadas A-01 a A-06/P-02. Validar identidad, elegibilidad, condición y custodia en servidor/SQL; cambios de unidad conservan instantáneas históricas y no inventan traslados de custodio. Aplicar fechas UTC y restricciones temporales aceptadas; corregir mediante anotación/compensación vinculada, sin reescribir originales. No inventar reglas pendientes.
5. Coordinar estado/historia/auditoría/outbox/resultado idempotente en una transacción con versión esperada y locks ordenados conforme al diseño existente. Cambios de persistencia mediante migraciones nuevas aditivas, sin modificar las aceptadas ni abrir DML genérico. Probar integridad, concurrencia, rollback, replay y denegaciones con datos sintéticos, más recorridos UI/API, confirmación/motivo, cancelación y errores/responsive según el diseño aprobado.
6. No implementar indicadores/reportes/exportadores (11), procesamiento/envío outbox o automatizaciones (12), ni otras fases por dependencia. Mantener los límites de identidad/correo gestionados y advisors pendientes; no crear cuentas reales, modificar permisos remotos, gastar, instalar Spec Kit ni desplegar por inferencia.
7. Conservar F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días. Registrar verificaciones ejecutadas/no ejecutadas, criterios, riesgos y bloqueos; actualizar documentación y GitHub, verificar SHA remoto y entregar Fase 10 para aceptación propia. No marcar COMPLETADA ni iniciar Fase 11 sin autorización independiente.


## Entrega de Fase 10 — vigente, 2026-11-02

Solicitud: «Inicia únicamente la Fase 10 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 11 ni despliegues», continuada por «continua». D-30 ratifica D-29; base limpia actualizada por avance directo a `22d93c4`. Plan presentado antes de implementar: funcionarios RUT/ID, pertenencias, custodia/movimientos, condición/estados, historia y correcciones, controles transaccionales, UI, pruebas y documentación/GitHub.

Entregables, archivos, criterios CA10-01 a CA10-06 y límites en [PROCESOS_EMPRESARIALES](docs/PROCESOS_EMPRESARIALES.md); evidencia en [PRUEBAS](docs/PRUEBAS.md). Migración aditiva, SQL privado con roles mínimos/RLS, versiones/idempotencia, historia/auditoría/outbox atómicos. Pruebas sintéticas con PostgreSQL real e identidad doble; no datos ni cuentas reales. Codex prepara/verifica; usuario conserva aceptación propia.

Fase 10 EN_REVISION, CA10-06 pendiente; última completada 9. Fases 11–15 PENDIENTE / NO OTORGADA. Sin reportes/exportaciones, procesamiento/envío outbox, permisos remotos, gasto, producción o despliegue. Advisors local sin stack disponible; no acredita Supabase gestionado, correo externo, dispositivos físicos ni continuidad operativa. F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.

Siguiente paso: revisión y aceptación de Fase 10. No iniciar Fase 11 por inferencia. Sincronización mediante commit/push normales, autoría noreply y verificación de SHA remoto antes de entregar.


## Cierre aprobado de Fase 10 y continuidad autorizada de Fase 11 — vigente

2026-11-02. Evidencia literal: «apruebo fase 10 y inicia en nuevo chat fase 11». D-31 acepta la entrega `888f8a2dda2a851db291209299c24eb7eb6be381`, cumple CA10-06 y cierra Fase 10 COMPLETADA. Se conservan las 70 pruebas de regresión, 24 de navegador y 4 revalidadas tras el ajuste final, con capturas y límites: PostgreSQL sintético e identidad doble; sin Supabase gestionado/advisors operativos, correo externo, dispositivos físicos, carga objetivo ni continuidad productiva acreditados.

Fase 11 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Esta tarea solo registra cierre y continuidad y sincroniza GitHub. No se abre automáticamente otra conversación ni se implementan indicadores, reportes o exportaciones aquí. Fases 12–15 PENDIENTE / NO OTORGADA; sin despliegue, producción, datos reales, gastos o cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14 (A-06/A-10/A-11 y CR-11/12/18/19/20), UX_UI D-15, arquitectura/ADR D-17, datos D-19, autenticación D-21, seguridad D-23, BACKEND_API/OpenAPI D-25, FRONTEND D-27, ADMINISTRACION D-29 y PROCESOS_EMPRESARIALES D-31, con código, migraciones, pruebas y límites. No volver a pedir autorización de Fase 11.
2. Presentar plan limitado a indicadores, reportes y exportación: métricas actuales con definiciones verificables, filtros y buscador combinado, cinco reportes y resultados de búsqueda en Excel/PDF según A-11. Inspeccionar contratos realmente disponibles e integrar únicamente servicios/persistencia/UI necesarios para esta fase. No presentar contratos documentales ni mocks como implementación real.
3. Conservar cuenta/sesión/rol/MFA vigentes, Origin/CSRF, pools separados/contexto SQL LOCAL y privilegios mínimos/RLS. Inventario e historia compartidos; auditoría y su exportación solo administrador. Proyecciones positivas sin RUT/ID ni correo personal en reportes ordinarios, sin observaciones libres de bienes por defecto ni secretos en auditoría. No permitir columnas arbitrarias ni usar JWT/metadatos obsoletos para autorizar.
4. Aplicar UTC y campo temporal A-06, días inclusivos mediante intervalo hasta día posterior excluido; rechazar rangos invertidos. Unidad/custodio actuales en inventario, unidades históricas de origen/destino en movimientos. Inventario general y condición son fotografías actuales, no reconstrucción agregada a fecha pasada. No inventar métricas, totales ni datos para cubrir APIs ausentes.
5. Mantener idéntica selección autorizada, filtros normalizados, columnas, orden estable, conteos y subtotales entre pantalla/Excel/PDF. Exportar todo el conjunto filtrado, nunca solo página visible. Límites 10.000 filas XLSX y 2.000 PDF; sumar conjuntos del buscador, permitir límite exacto y rechazar exceso sin truncar. Vacío válido con cabeceras/metadatos/total cero; fórmulas como texto en Excel, PDF sin ejecutar contenido ni cargar URLs arbitrarias.
6. Aislar generación de archivos, conservar selección consistente entre conteo y contenido, y vincular trabajo/archivo privado al solicitante con validación de permiso vigente al generar/descargar. Manejar estados, errores, caducidad técnica y reintentos sin duplicar trabajos ni exponer enlaces públicos. Cualquier procesamiento de exportaciones pertenece solo a Fase 11; no implementar procesamiento/envío de outbox ni automatizaciones de Fase 12 por dependencia. Revisar versiones/licencias y fijar dependencias/lockfile antes de usar generadores.
7. Verificar cifras con datos fuente sintéticos, filtros/fechas/unidades, permisos negativos y revocados, paginación frente a exportación completa, límites exactos/superados/vacíos, inyección de fórmulas, privacidad de archivos y concurrencia/cambios durante generación. Probar UI/API y responsive/teclado según diseño aceptado; documentar mediciones y límites sin acreditar rendimiento por inferencia.
8. Preservar evidencia/migraciones aceptadas y F1-SEG-01/02/03; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días. Sin Spec Kit, cuentas/datos reales, permisos remotos, gastos, producción o despliegues por inferencia. Actualizar documentación y GitHub, verificar SHA remoto y entregar Fase 11 para aceptación propia. No marcar COMPLETADA ni iniciar Fase 12 sin autorización independiente.


## Ejecución de Fase 11 — entrega inicial (D-32)

2026-11-02. Solicitud ratificada: «Inicia únicamente la Fase 11 de inventarioTI2, ya autorizada. Actualiza GitHub. No inicies Fase 12 ni despliegues». Base remota recuperada por avance directo `92a6dec`; árbol inicialmente limpio. Responsable: Codex; revisión/cierre: usuario. Plan presentado y ejecutado dentro de indicadores, cinco reportes/buscador y exportación privada; documentación detallada en [REPORTES](docs/REPORTES.md).

- CA11-01 a CA11-05 verificados en el alcance sintético: indicadores desde fuente; columnas/orden/conteos/subtotales/filtros compartidos; UTC/unidades históricas; proyección positiva; XLSX/PDF completos, vacíos, límites exactos y excesos; trabajo durable por solicitante, reintentos, instantánea y revocación.
- Verificación: build correcto, 85/85 pruebas API/seguridad, 32/32 navegador; revalidación adicional de 8/8 de Fase 11 tras ajustar anchura de tablas/capturas. Auditoría npm: 0 vulnerabilidades. Evidencia y mediciones locales en PRUEBAS/evidencias/fase11.
- Se corrigió una transición del panel para no presentar filas de la pestaña anterior mientras carga; pruebas históricas ajustadas para localizar el formulario nuevo y no asumir qué referencia cae en primera página. Evidencia aceptada de fases previas conservada.
- Límites: PostgreSQL local y proveedor de identidad doble; no Supabase gestionado/advisors operativos (54322 sin stack), dispositivos físicos/Safari, carga objetivo, correo ni continuidad productiva acreditados. F1-SEG-01/02/03 abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.
- CA11-06 PENDIENTE de aceptación expresa. Fase 11 EN_REVISION, no COMPLETADA. No se solicita ni inicia Fase 12 por inferencia. Fases 12–15 PENDIENTE / NO OTORGADA; sin despliegue, producción, datos reales, gastos o permisos remotos.

Sincronización de esta entrega mediante commit/push normales a main, autoría noreply y comparación del SHA remoto al entregar.


## Cierre aprobado de Fase 11 y continuidad autorizada de Fase 12 — vigente

2026-11-02. Evidencia literal: «Apruebo fase 11, inicia en nuevo chat fase 12». D-33 acepta la entrega `c94a366be22e6eae917711c52e695ea842c27187`, cumple CA11-06 y cierra Fase 11 COMPLETADA. Se conservan 85 pruebas de API/seguridad, 32 de navegador y 8 revalidadas tras el ajuste final, con capturas y límites: PostgreSQL sintético e identidad doble; sin Supabase gestionado/advisors operativos, correo externo, hardware/Safari, carga objetivo ni continuidad productiva acreditados.

Fase 12 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Esta tarea solo registra cierre y continuidad y sincroniza GitHub. No se crea automáticamente una conversación ni se implementan/envían notificaciones aquí. Fases 13–15 PENDIENTE / NO OTORGADA; sin despliegue, producción, datos reales, gastos o cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14 (A-07/A-08/A-10, P-04, CR-13/14), UX_UI D-15, arquitectura/contratos/ADR D-17, datos D-19, acceso D-21, seguridad D-23, API D-25, frontend D-27, administración D-29, procesos D-31 y reportes D-33. Inspeccionar código/migraciones/pruebas y limitaciones reales. No volver a pedir autorización de Fase 12.
2. Presentar un plan limitado a notificaciones/automatización empresarial aprobadas: catálogo A-07, plantillas minimizadas, puerto/adaptador de correo, consumo de outbox, estados/intentos/conciliación y operaciones administrativas necesarias. No inventar alertas de vencimientos, informes programados u otros eventos sin regla empresarial aceptada.
3. Preservar transacción local de estado/historia/auditoría/outbox/idempotencia. Fallar el correo no revierte ni repite el proceso empresarial. No confundir outbox empresarial con entregas de identidad ni con trabajos de exportación Fase 11. El procesamiento externo queda fuera de la transacción empresarial.
4. Mantener destinatario fijado al confirmar y unicidad de aviso lógico por evento/destinatario/propósito. Cambio de encargado no redirige pendientes ni reintentos. Confirmación mínima al nuevo; sustitución al anterior sin revelar nueva dirección. Invitación/recuperación/MFA solo al titular. Lectura/búsqueda/exportación/rechazos no generan avisos al encargado.
5. Reclamar trabajos de forma exclusiva y recuperable; primer intento y tres reintentos transitorios a 1/5/15 min desde fallo anterior. Permanente: detener. Resultado incierto o caída después de posible envío: conciliar antes de repetir; no prometer entrega física exactamente una vez. Cancelación/reintento manual/conciliación solo administración vigente con motivo, confirmación, concurrencia, idempotencia y auditoría; errores saneados.
6. Aplicar A-10: mensajes sin RUT/ID personal, correo personal, secretos/tokens ni texto libre de observaciones/motivos; enlaces solo a contenido autenticado. Mantener sesión/rol/MFA vigentes, Origin/CSRF, pools separados/contexto SQL LOCAL/RLS, mínimo privilegio y protección de cuenta propia/último administrador. No exponer destinatarios o errores de proveedor a lectura.
7. Verificar con datos sintéticos/proveedor doble: catálogo/minimización, destino fijado, cambio de encargado, duplicados/replay, exclusión entre workers, caída/arrendamiento, retrasos/reintentos, permanente/agote/incierto, fallo de correo con proceso conservado y permisos revocados. Integrar UI/API de seguimiento sin presentar mocks como envío real. Contrastar capacidades/documentación del proveedor y mantener credenciales fuera del repositorio; envío real, destinatarios reales, dominio, costos y servicios externos requieren autorización concreta si no consta. No despachar pendientes reales por inferencia.
8. Conservar F1-SEG-01/02/03, UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días, entregas y evidencias aceptadas. Documentar pruebas ejecutadas/no ejecutadas, riesgos y bloqueos; actualizar GitHub y verificar SHA remoto. Entregar Fase 12 para aceptación propia; no marcar COMPLETADA ni iniciar Fases 13–15 o desplegar sin autorización independiente.


## Ejecución de Fase 12 — entrega inicial (D-34)

2026-11-02. Solicitud: «Inicia únicamente la Fase 12 de inventarioTI2, ya autorizada por D-33. Actualiza GitHub. No inicies Fase 13 ni despliegues». Base main `c348e873231cc6aaccf33d8c39d61f60943359e6`, árbol inicialmente limpio en rama de entorno work. Plan presentado antes de implementar. Codex ejecuta/verifica; usuario conserva revisión/aceptación propia.

Alcance, archivos, catálogo, máquina de estados, API/UI, puerto/adaptador Resend deshabilitado y CA12-01 a CA12-06 en [NOTIFICACIONES](docs/NOTIFICACIONES.md). Proceso independiente sin envíos al arrancar web; rol SQL dedicado sin acceso genérico, reclamación exclusiva/token, arrendamiento, reintentos 1/5/15, inciertos sin repetición ciega, conciliación con evidencia, acciones versionadas/idempotentes/auditadas. Destino original y transacción empresarial preservados. Migración nueva aditiva; anteriores intactas.

CA12-01 a CA12-05: evidencia y límites en [PRUEBAS](docs/PRUEBAS.md). Ensayos sintéticos de PostgreSQL real, identidad/correo dobles y HTTP sustituido; no envío ni proveedor gestionado acreditados. CA12-06 PENDIENTE. Fase 12 EN_REVISION; última completada 11. Fases 13–15 PENDIENTE / NO OTORGADA. No se inician por verificar esta fase. F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días conservados. Sin datos/cuentas reales, permisos remotos, gastos, producción ni despliegue.

Sincronización mediante commit/push normales a main con autoría noreply y comparación de SHA remoto antes de entregar. Siguiente paso: revisión/aceptación de Fase 12; no autorización de Fase 13 inferida.


## Cierre aprobado de Fase 12 y continuidad autorizada de Fase 13 — vigente

2026-11-02. Evidencia literal: «Apruebo fase 12 y inicia en nuevo chat fase 13». D-35 acepta la entrega `377be1ac61a077606a4fa06b4986353c4a4fff0f`, cumple CA12-06 y cierra Fase 12 COMPLETADA. Se conservan 100 pruebas API/seguridad, 39 de navegador y 7 revalidadas tras el ajuste visual final, junto con sus evidencias y límites: PostgreSQL/GoTrue locales y dobles de identidad/correo; sin Resend/Supabase gestionados, advisors operativos, hardware/Safari, carga objetivo ni continuidad productiva acreditados. La aceptación no activa correo real ni elimina seguimientos.

Fase 13 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Esta tarea solo registra cierre y continuidad y sincroniza GitHub. No se crea automáticamente otra conversación ni se ejecuta QA de Fase 13 aquí. Fases 14–15 PENDIENTE / NO OTORGADA; sin despliegue, producción, datos reales, gastos o cambios remotos de permisos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14, UX D-15, arquitectura D-17, datos D-19, acceso D-21, seguridad D-23, API D-25, frontend D-27, administración D-29, procesos D-31, reportes D-33 y notificaciones D-35; revisar código, migraciones, pruebas/evidencias y límites. No volver a pedir autorización de Fase 13.
2. Presentar un plan limitado a QA, rendimiento y seguridad: matriz trazable RF/HU/CR/CA, criterios de salida medibles, regresión unitaria/integración/E2E, accesibilidad, dependencias y escenarios adversos. Registrar defectos por severidad y corregir únicamente los del alcance aprobado, preservando reglas de negocio, evidencia aceptada y cambios de terceros. No incorporar módulos nuevos ni iniciar Fase 14 por dependencia.
3. Revalidar permisos/sesión/cuenta/MFA vigentes, Origin/CSRF, RLS/pools/contexto SQL LOCAL y mínimo privilegio. Probar IDOR/BOLA, inyección/XSS, secretos/PII, privacidad de exportaciones y avisos, versiones/idempotencia, rollback, concurrencia, último administrador y revocación. No rebajar controles ni usar claims obsoletos o metadatos del cliente para conseguir tiempos menores.
4. Medir A-09/CR-17/CA-N07 con muestra sintética: 3.000 bienes, 500 funcionarios, 25 cuentas, 10 usuarios concurrentes y hasta 100.000 movimientos/auditorías por categoría. Tras calentamiento, 1.000 consultas mixtas y 200 escrituras válidas; p95 de listas/búsquedas de 50 filas ≤2 s y escrituras con auditoría, correo excluido, ≤3 s. Informar conflictos/rechazos/fallos aparte, sin descartarlos para aparentar cumplimiento; documentar recursos, red, configuración, distribución y límites del entorno.
5. Verificar exportaciones A-11 (10.000 XLSX/2.000 PDF) extremo a extremo ≤60 s bajo condiciones registradas y primer intento de aviso ≤1 min en condiciones normales con proveedor doble, sin confundirlo con entrega. Preservar destinatario fijado, minimización, reintentos 1/5/15 y conciliación ante incertidumbre. No activar Resend/correo real, despachar pendientes reales ni dar por verificadas integraciones gestionadas por ensayos locales.
6. Revisar WCAG 2.2 AA como objetivo: teclado/foco, nombres/etiquetas/errores, contraste, tablas y responsive; probar estados carga/vacío/error/permiso y recorridos de ambos roles en computador/iPad/iPhone emulados. Distinguir revisión automática/manual, navegadores/dispositivos disponibles y no ejecutados; no afirmar certificación o Safari/hardware/lector de pantalla sin evidencia.
7. Conservar F1-SEG-01/02/03, UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días. Disponibilidad mensual, respaldo/restauración y operación productiva no se acreditan con una sesión de QA ni autorizan Fase 14. Sin Spec Kit, datos/cuentas reales, cambios remotos de permisos, servicios/costos, despliegues o producción por inferencia; detener solo el ensayo afectado si falta una dependencia y documentar el bloqueo.
8. Entregar matriz/evidencias, defectos/correcciones, pruebas ejecutadas/fallidas/no ejecutadas, riesgos y criterios pendientes. Actualizar documentación y GitHub, comprobar SHA remoto y dejar Fase 13 EN_REVISION para aceptación propia. No marcar COMPLETADA ni iniciar Fases 14–15 sin aprobación independiente.
