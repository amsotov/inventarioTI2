# FASES.md — Plan y control de avance

**Proyecto:** Inventario y control de bienes computacionales (inventarioTI2)
**Modo:** GUIADO (aprobación expresa antes de cada fase)
**Fase actual:** 5 — EN_REVISION; autenticación local implementada, aceptación operativa pendiente.
**Última fase completada:** 4.
**Fase 5:** ejecución autorizada por D-19 y ratificada en esta conversación. **Fases 6–15:** PENDIENTE / NO OTORGADA.

> La Fase 0 está completada y aprobada por el usuario. La Fase 1 fue autorizada posteriormente y su análisis documental se ejecutó en esta nueva conversación; está COMPLETADA por aprobación D-14, con seguimientos futuros explícitos y sin implementación. La Fase 2 está completada por aprobación visual expresa D-15. Fase 3 completada por D-17; Fase 4 completada por D-19; Fase 5 ejecutada y EN_REVISION; fases 6–15 sin autorización. Todos los cambios autorizados del proyecto deben sincronizarse con GitHub.

| Fase | Etapa | Entregable orientativo | Estado | Aprobación |
|---|---|---|---|---|
| 0 | Diagnóstico y planificación | Visión, requisitos iniciales, MVP, riesgos y decisiones | COMPLETADA | Ejecución y entregables APROBADOS por el usuario el 2026-10-30 |
| 1 | Análisis empresarial y requisitos | Actores, procesos, historias, criterios y trazabilidad | COMPLETADA | Entrega y resoluciones APROBADAS por usuario el 2026-10-31; UTC y respaldo semanal |
| 2 | UX/UI y diseño visual | Sistema visual, prototipo navegable y aprobación visual | COMPLETADA | Revisión visual y cierre APROBADOS el 2026-10-31; D-15 |
| 3 | Arquitectura tecnológica | Stack y decisiones arquitectónicas | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-10-31; D-17 |
| 4 | Modelado y persistencia de datos | Modelo ER, restricciones y migraciones | COMPLETADA | Entrega y cierre APROBADOS por usuario el 2026-10-31; D-19 |
| 5 | Autenticación | Inicio de sesión, recuperación y sesiones | EN_REVISION | Ejecución AUTORIZADA por D-19; aceptación/cierre PENDIENTES |
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
| 2026-10-30 | 1–15 | Al cerrar Fase 0, antes de la instrucción posterior, ninguna ejecución estaba autorizada | NO OTORGADA en ese momento | Antecedente histórico; ver autorización posterior de Fase 1 |
| 2026-10-30 | 1 | Autorizar análisis empresarial y requisitos para iniciarse en un nuevo chat | Usuario | «En nuevo chat inicia fase 1 inventarioTI2»; autorización registrada, conversación nueva aún no abierta ni trabajo de Fase 1 ejecutado |
| 2026-10-31 | 1 | Ejecutar únicamente análisis documental, conservar pendientes y sincronizar GitHub; sin código ni Fase 2 | Usuario | Solicitud de esta conversación; entrega EN_REVISION, aceptación y cierre aún no otorgados |
| 2026-10-31 | 1 | Aceptar paquete de recomendaciones con UTC y respaldo una vez por semana; cerrar análisis | Usuario | «Apruebo las conversiones, respaldo 1 vez a  la semana, zona horaria UTC y respaldo 1 vez a la semana»; D-14; no autoriza Fase 2 ni configuración operativa |
| 2026-10-31 | 2 | Iniciar UX/UI y prototipo con datos ficticios en un nuevo chat | Usuario | «En nuevo chat inicia fase 2 inventarioTI2»; ejecución pendiente para esa conversación, sin autorizar Fase 3 ni despliegue |
| 2026-10-31 | 2 | Aceptar revisión visual y cerrar Fase 2; autorizar Fase 3 para un nuevo chat | Usuario | D-15; aprobación expresa en esta conversación; arquitectura no iniciada |
| 2026-10-31 | 3 | Ejecutar únicamente arquitectura, leer cierre visual y sincronizar GitHub; sin Fase 4 ni despliegue | Usuario | Solicitud de esta conversación y D-15; entrega EN_REVISION, D-16 |
| 2026-10-31 | 3 / 4 | Aceptar arquitectura y cierre de Fase 3; autorizar Fase 4 en un chat nuevo | Usuario | «Apruebo y inicia fase 4 en un chat nuevo»; D-17. Sin gasto, despliegue ni fases 5–15 |

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
