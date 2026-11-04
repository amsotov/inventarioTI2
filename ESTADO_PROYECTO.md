# Estado del proyecto — Punto de continuidad

## MPUB-A01 — publicación de modernización autorizada

Usuario: «Publica los cambios de modernización». Autoriza integrar el código aprobado en main y ejecutar la publicación estática de GitHub Pages. Se prepara PR con CI antes de integrar y se comprobará el SHA efectivo en publicacion.json y el workflow de despliegue. No repetir confirmación de esta publicación.

La demo incluye acceso a [Modernización · vista previa](https://amsotov.github.io/inventarioTI2/modernizacion/), prototipo navegable F3 y seis capturas de la interfaz F7. Se identifican como propuesta/capturas; no hay conexión a la base de destino ni dobles v2 incorporados al servidor. Se conservan Auth, datos/esquema y barreras SQL. La autorización de Pages no configura Auth, aplica SQL, habilita workers/envíos, contrata servicios o acredita operación de SQLServer. F9 documental sigue aceptada y las matrices anteriores son snapshots históricos. [Plan y verificación](docs/PUBLICACION_MODERNIZACION.md).


## M9-A02 — Fase 9 aprobada y consulta de Pages

Usuario: «Apruebo fase 9 quiero ver la publicación GitHub Pages». Acepta la entrega documental de2376a580926dadb1af363f94d3ff74f05f377d34: **FASE9 COMPLETADA_DOCUMENTAL**, con pendientes técnicos conservados. El modelo de destino sigue NO_GO; esta consulta no crea una fase10 ni pide integrar ramas o sustituir el sitio publicado.

**Publicación existente verificada:** https://amsotov.github.io/inventarioTI2/ . HTTP200 y portada React en Chromium, banner Modo demo visible, sin errores JavaScript. Último workflow de Pages observado:41648235275, success, SHA511b99d64c97ff1917f279e78490f377a3f5239a (main). No se ejecutó otro despliegue ni se modificó main. [Verificación y alcance](docs/migracion/CIERRE_FASE9_PAGES.md).

Las ramas de modernización no están publicadas en Pages. La demo utiliza datos sintéticos en memoria, sin login operativo o backend/SQLServer. Verificador F9 y evidencia se conservan como snapshot del commit aceptado2376a58; sus hashes de documentos describen esa entrega, no esta anotación posterior de aceptación. M8-R01 y prerrequisitos del destino siguen abiertos; M9-R01 conserva seguimiento del runtime para futuros paquetes, sin impedir ver la demo ya publicada. README/DEMO ya documentaban compilación estática Node20 correcta y Node24 como requisito del servidor.


## Ciclo vigente de modernización — 2026-11-03

**Migración FASES0–5 aceptadas; entregas parciales F6/F7 y auditoría F8 ACEPTADAS con pendientes. FASE9: EN_REVISION_DOCUMENTAL. Liberación: NO_GO.**

M9-A01: «Apruebo fase 8 inicia fase 9» acepta `e224d6f` e inicia documentación/preparación. [Informe F9](docs/migracion/09_PREPARACION_DESPLIEGUE.md), [compatibilidades](docs/migracion/09_COMPATIBILIDADES.csv), [pendientes](docs/migracion/09_PENDIENTES.csv), [puertas](docs/migracion/09_PUERTAS_LIBERACION.csv) y [manifiesto](docs/migracion/09_MANIFIESTO_PREPARACION.json). Guías vigentes en DESPLIEGUE, RUNBOOK y CHECKLIST. Código, workflows, fuentes ER/DER/Excel, cuatro SQL físicos y evidencia F1–F8 preservados. Solo cambia documentación, verificador y metadata de continuidad SQL review.4.

Las 280 pruebas Node F8 son evidencia histórica aprobada (219 backend/seguridad, 57 UI, 4 operación), no suites repetidas en F9. Verificación nueva documental/linaje/enlaces/matrices y rechazo de liberación; no hay release construido ni CI remoto aprobado de esta rama. M8-R01 sigue abierta: F8 observó autorregistro remoto habilitado, propuesta sin aplicar. M9-R01 registra Node20 en workflow demo frente a Node24 declarado; no se modifica ni ejecuta. Supabase inventarioTI2 mantiene su referencia de laboratorio; F9 no consulta ni cambia proyectos y no reactiva inventarioTI.

SQLServer2016/13.x/130 sigue bloqueado por instancia/edición/SP/CU/collation, soporte/repositorios/escrituras, reglas M1-D, vínculo real cuenta-funcionario/perfiles y fuentes operacionales. M6-A02/A03 Auth/soporte y Unicode/UTC ya aprobadas; no se vuelven a solicitar. Main usa PG y no registra v2; los dobles permanecen en tests. Datos reales, permisos remotos, ejecución SQL, main/merge, despliegue, gastos y correo requieren su alcance/autorización independiente.

Verificador vigente: `python3 docs/migracion/verificar_fase9.py`; `--evaluar-liberacion` devuelve3. Scripts/evidencias F1–F8 son históricos para sus commits. El prompt de migración termina en9; no hay Fase10 definida ni siguiente operación autorizada. El ciclo histórico0–15 conserva sus estados independientes. F9 pendiente de aceptación documental expresa.


**Proyecto:** Inventario y control de bienes computacionales (inventarioTI2)
**Fecha del resumen histórico:** 2026-11-02
**Fase de desarrollo histórica:** 14 — Despliegue, operación y continuidad; EN_REVISION (D-38).
**Modo:** GUIADO
**Última fase completada:** 13.
**Última fase autorizada:** 14, ejecutada localmente bajo D-37/D-38; CA14-06 PENDIENTE. Fase 15 PENDIENTE / NO OTORGADA. Producción requiere autorización independiente.

**Punto de continuidad del ciclo histórico:** Fase 14 entregada para revisión, sin aceptación presumida. [Plan](docs/DESPLIEGUE.md), [runbook](docs/RUNBOOK_OPERACION.md), [checklist](docs/CHECKLIST_LIBERACION.md) y evidencia local. CI sin deploy, salud/logs saneados y copia/restauración sintéticas; operación gestionada pendiente de destino/recursos y F1-SEG-01/02/03. Correo real deshabilitado, sin producción ni Fase 15. Los estados anteriores son antecedentes históricos.

## Objetivo
Inventario centralizado de bienes computacionales por funcionario y unidad, asignación actual e historial fechado; cambios auditados, correos configurables y exportaciones Excel/PDF. La definición ya está documentada: no repetir la pregunta inicial.

## Autorización y continuidad
El registro heredado del repositorio consigna «Autorizo la fase 0 pero crealo en nuevo chat» y posteriormente «actualiza en github». Estas citas se conservan como antecedente del commit recibido; no son una nueva autorización para publicar desde esta sesión. No se ha creado un chat nuevo. En un nuevo chat, leer AGENTS.md, PROMPT_MAESTRO.md, FASES.md y estos entregables antes de continuar.

Inicialmente el usuario autorizó únicamente Fase 0, pidió preservar el trabajo y prohibió código, otras fases y publicación. Después indicó que actualizó GitHub y pidió revisar nuevamente. Se recuperó el commit `ea60377feb246ede15fef00d386bd022a3deaa94` y se tomó su definición detallada como fuente actual. La definición del sistema ya está documentada; no repetir la consulta inicial.

Tras la entrega, el usuario indicó: «todos los cambios del este proyecto inventarioTI2 deben actualizarse en github y aprueba esta fase». Se registra aceptación de entregables, alcance y prioridades y cierre de Fase 0. Todos los cambios autorizados del proyecto deben quedar sincronizados en GitHub; regla persistente incorporada en `AGENTS.md`. Esta instrucción sustituye la restricción de entrega solo local y mantiene sin autorización las fases posteriores y el despliegue del sitio.

## Trabajo realizado
- Leídas las instrucciones y la plantilla existente.
- Documentados visión, actores, MVP, límites, indicadores propuestos y backlog inicial.
- Registrados RF-01 a RF-16 y RNF-01 a RNF-07, con criterios iniciales verificables.
- Separados requisitos confirmados, propuestas y decisiones pendientes.
- Registrada autorización de Fase 0 y condiciones de las fases siguientes.
- Sin código de aplicación, backend, esquema físico, políticas RLS ni datos reales implementados.
- Preservada e integrada la actualización del usuario; mantenidos RF-01 a RF-16, RNF-01 a RNF-07, D-01 a D-09, P-01 a P-04, A-01 a A-11 y R-01 a R-07; añadidas D-10 para las restricciones iniciales y D-11 para la aprobación y sincronización posterior. P-03 se registra como planificación inicial aceptada.
- Complementados los siete módulos del MVP, el orden propuesto, las métricas y dependencias, los recorridos de aceptación futura y CA0-01 a CA0-06.
- Al entregar Fase 0 se registraron responsables propuestos y criterios por fase, sin asignar personas ni adelantar estados. Fase 0 COMPLETADA por aprobación expresa; entonces las fases 1–15 quedaron PENDIENTE y sin autorización. Ver instrucción posterior de Fase 1 más abajo.
- Actualizados el registro de aprobación y CA0-06; autorizados commit y sincronización en `amsotov/inventarioTI2`, rama principal `main` comprobada mediante la referencia HEAD remota.

## Archivos relevantes
- docs/VISION.md: contexto, objetivos, actores, alcance e indicadores.
- docs/REQUISITOS.md: requisitos, permisos, backlog y criterios de aceptación iniciales.
- docs/DECISIONES.md: decisiones, propuestas, preguntas abiertas, riesgos y dependencias.
- FASES.md: estados y autorizaciones.
- AGENTS.md: instrucciones conservadas y ampliadas con la regla permanente de sincronizar cambios autorizados en GitHub. PROMPT_MAESTRO.md permanece sin cambios.
- ESTADO_PROYECTO.md: continuidad y evidencia. Se modifican seis Markdown: los cinco entregables de Fase 0 y AGENTS.md; los otros 11 archivos permanecen intactos respecto de la base actualizada.

## Inspección y preservación de trabajo

- La carpeta inicial solo contenía `.git`, con `work` sin commits. Se consultó el repositorio vinculado y se recuperó la base inicial `a223057c3eff711a515021a1c9dc60a938150b13`, que contenía una plantilla de 17 archivos.
- Tras el aviso del usuario, `git fetch origin` detectó `ea60377` con los cinco documentos actualizados. Se leyeron todos esos documentos antes de complementar el trabajo.
- El borrador local anterior se preservó en `/workspace/work/fase0-pre-actualizacion/` y en un stash identificado como «Fase 0: borrador preservado antes de actualizar GitHub». No se reaplicó porque partía de la plantilla sin el detalle recibido; no sustituye la documentación vigente.
- `git merge --ff-only origin/HEAD` incorporó la actualización del usuario. La base actual de la rama es `ea60377feb246ede15fef00d386bd022a3deaa94`; las diferencias de esta tarea se revisan contra ella.
- Leídos `AGENTS.md`, `PROMPT_MAESTRO.md`, README, fases, estado, documentos de `docs/` y `specs/README.md`. Las instrucciones y documentos ajenos al alcance no cambiaron entre ambas bases; no se encontraron AGENTS más específicos ni aplicación o dependencias de aplicación.
- La revisión inicial terminó sin push ni escritura remota. La instrucción posterior autoriza subir estos cambios a GitHub; no se realiza despliegue del sitio ni se inicia otra fase.

## Decisiones y limitaciones
- Administrador y lectura; funcionarios y cuentas son conceptos distintos.
- Auditoría y movimientos inmutables para cuentas de aplicación; bajas lógicas.
- RLS en Supabase solicitado; portabilidad a SQL Server como objetivo futuro, con arquitectura pendiente.
- Permiso exclusivo administrativo de auditoría es una interpretación por ratificar.
- La ruta .agents/skills/visual-system-designer/SKILL.md no existe en la versión remota inspeccionada.
- No hay aplicación ni manifiestos de dependencias; no hay pruebas funcionales que ejecutar todavía. Spec Kit no está presente y no se instaló.
- Se leyó la guía `supabase` para revisar la orientación documental, sin consultar proyectos ni ejecutar cambios externos. Arquitectura y controles concretos siguen pendientes de sus fases autorizadas.
- No se encontró `visual-system-designer` en la ruta anunciada, ubicaciones locales de skills inspeccionadas ni catálogo disponible. La disponibilidad futura de Playwright no se comprobó; volver a detectarlos en Fase 2. No se instaló ninguna herramienta.

## Verificación de la entrega de Fase 0
- `git diff --check`: APROBADO para el cierre y la regla de GitHub; sin errores de formato de diferencias.
- `git diff --name-only`, revisión de diferencias y comparación de archivos ajenos al alcance: APROBADO; seis Markdown autorizados, otros 11 archivos intactos, 17 archivos en total. Las instrucciones originales de AGENTS.md se conservan y se añade la regla permanente.
- Comprobación puntual con Python de enlaces, IDs, referencias y estados: APROBADO; 8 enlaces locales válidos; IDs únicos y referencias definidas (RF=16, RNF=7, D=11, P=4, A=11, R=7, CA0=6, M=7). Fase 0 COMPLETADA y CA0-06 cumplido; fases 1–15 PENDIENTE / NO OTORGADA. P-03 se actualiza por aceptación; las demás filas de negocio previas se preservan literalmente.
- Pruebas de aplicación, seguridad, RLS, correos, exportaciones, navegador y Playwright: NO EJECUTADAS; no hay implementación y la Fase 2 no está autorizada.

La revisión documental no acredita funcionalidades implementadas, conformidad de accesibilidad ni pruebas de dispositivos. La entrega se mantiene versionada en GitHub; no requiere desplegar el sitio.

## Sincronización con GitHub

- Autorización permanente: todos los cambios aprobados del proyecto deben actualizarse en `https://github.com/amsotov/inventarioTI2`, según el último mensaje del usuario y `AGENTS.md`.
- Rama de entrega: `main`. Preservar cambios remotos y usar un avance normal, sin forzar el historial.
- Comprobación de entrega: comparar `git rev-parse HEAD` con `git ls-remote origin refs/heads/main` después del push; informar el SHA y enlace verificados al usuario. No atribuir éxito remoto a la sola creación de un commit local.
- El primer intento de push fue rechazado por la protección de correo privado de GitHub (GH007). Se conserva esa protección y se usa la dirección `noreply` verificada de la cuenta para el commit, sin modificar la configuración global ni el historial remoto.
- Esta sincronización no equivale a publicación del sistema ni a autorización de otra fase.

## Siguiente paso al cerrar Fase 0 — antecedente
Fase 0 cerrada y aprobada. El usuario autorizó después Fase 1 — análisis empresarial y requisitos para iniciarse en un nuevo chat. Abrir esa conversación, recuperar `main` vigente y seguir el punto de inicio de `FASES.md`; no volver a pedir autorización para Fase 1. No iniciar Fase 2 ni Fase 3 por inferencia.

Decisiones abiertas: A-01 a A-11; interpretaciones por ratificar o desarrollar: P-01, P-02 y P-04. P-03 queda aceptada como planificación inicial y CA0-06 cumplido por aprobación expresa. El cierre acepta la entrega con sus pendientes documentados, sin inventar reglas detalladas ni pedir nuevamente la definición del sistema.

Cuando se autorice Fase 2: obtener y leer visual-system-designer, construir prototipo navegable con datos sintéticos, facilitar revisión en computador/iPad/iPhone y verificar con Playwright si está disponible. Documentar aceptación visual y esperar nueva aprobación para Fase 3.

El permiso actual de actualizar todos los cambios en GitHub es explícito y se conserva para futuras tareas. La prohibición de publicar el sitio o realizar despliegues sigue vigente, al igual que las aprobaciones independientes de las fases.

## Continuidad para iniciar Fase 1 en un nuevo chat — antecedente

- Instrucción recibida: «En nuevo chat inicia fase 1 inventarioTI2».
- Fecha de registro: 2026-10-30 (America/Santiago). La Fase 1 queda autorizada para la nueva conversación; su ejecución continúa PENDIENTE. Fase 0 sigue COMPLETADA y aprobada.
- Preparación realizada aquí: lectura del estado vigente y registro de la autorización y del punto de inicio en `FASES.md` y este documento, preservando la documentación y las decisiones anteriores. No se ha creado otro chat ni se ha realizado el análisis de Fase 1 en esta conversación.
- Alcance de Fase 1: actores, procesos, reglas y excepciones, historias con criterios verificables y matriz de trazabilidad. Reutilizar RF-01 a RF-16, RNF-01 a RNF-07 y los pendientes A-01 a A-11 / P-01, P-02 y P-04; pedir solo las aclaraciones necesarias y no inventar respuestas.
- Verificación de esta preparación: revisión de los dos documentos y relectura de los contenidos guardados en GitHub. No se ejecutan pruebas de aplicación; no hay código ni prototipo autorizado en esta tarea.
- Limitación: no hay herramienta disponible para abrir una nueva conversación desde aquí. El usuario debe abrir el nuevo chat con el repositorio inventarioTI2 y usar la instrucción de inicio; la autorización ya está registrada y no necesita repetirse.
- Las fases 2–15 y el despliegue del sitio siguen sin autorización. La sincronización de todos los cambios autorizados con GitHub permanece vigente.

Este registro posterior actualiza las menciones históricas de Fase 1 sin autorización en los documentos de Fase 0. No modifica las reglas de negocio ni declara resueltos sus pendientes.

## Ejecución inicial de Fase 1 — antecedente del 2026-10-31

### Autorización y plan ejecutado

El usuario solicita: «Inicia únicamente la Fase 1, ya autorizada en FASES.md y ESTADO_PROYECTO.md», con actores, procesos, reglas, historias, criterios y trazabilidad; conservar pendientes y actualizar GitHub, sin código ni Fase 2. La autorización anterior consta en `c45e96e`/`fa323a7`. Se recuperaron ambos commits por avance directo antes de editar, con árbol limpio y sin sobrescribir trabajo remoto. Base de esta entrega: `fa323a774bc763f816d78093370618ee8e867ad2`.

Se presentó el plan y se ejecutó únicamente análisis documental. Responsable de redacción/verificación: Codex; decisiones de negocio y cierre: usuario. No se realizaron entrevistas, no se envió correo ni se consultaron servicios de negocio. No se instaló Spec Kit: no figura en el árbol ni está disponible `specify` en PATH.

### Trabajo y archivos de esta entrega

- Creados `docs/ANALISIS_EMPRESARIAL.md`, `docs/HISTORIAS_USUARIO.md` y `docs/TRAZABILIDAD.md`: 5 actores diferenciados, 7 procesos con alternativas/excepciones, 6 casos críticos de movimientos, 19 reglas (16 confirmadas y 3 interpretaciones), 16 historias con 47 criterios y 7 escenarios RNF.
- Actualizados `docs/REQUISITOS.md`, `docs/DECISIONES.md` y `docs/VISION.md`: enlace al detalle vigente y D-12 para la autorización, preservando las filas de negocio originales. Los antecedentes de Fase 0 se conservan identificados como históricos.
- Actualizados `FASES.md` y este documento: Fase 1 EN_REVISION; Fase 0 COMPLETADA; fases 2–15 PENDIENTE / NO OTORGADA. No se presupone aceptación del análisis.
- Actualizados `docs/PRUEBAS.md`, `README.md` y `specs/README.md`: evidencia documental, navegación y límites reales del repositorio. Se corrige la afirmación heredada de que el skill visual está incluido; su ruta no existe en este árbol y se revisará en una Fase 2 autorizada.
- Total: 11 archivos Markdown nuevos/modificados. AGENTS.md y PROMPT_MAESTRO.md intactos; arquitectura, datos, seguridad, UX/UI, despliegue y manuales intactos. Sin código, prototipo, esquema físico, políticas, herramientas instaladas ni despliegues.

### Decisiones, riesgos y pendientes

- A-01 a A-11 y P-01/P-02/P-04 continúan abiertos, con preguntas concretas y criterios afectados en ANALISIS_EMPRESARIAL. P-03 sigue aceptada como orden inicial del MVP; no se excluyen notificaciones ni reportes.
- Fechas/retroactividad, normalización de identificadores, bajas/reactivaciones, unidad histórica, eventos y fallos del correo, acceso a auditoría, acceso inicial/sesiones, privacidad, columnas y metas operativas no se resuelven por inferencia.
- Los escenarios condicionados no tienen aún resultado empresarial definitivo. La entrega documental no elimina R-01 a R-07 ni acredita funcionalidades o controles implementados.

### Verificaciones ejecutadas

- Lectura de AGENTS.md, PROMPT_MAESTRO.md, toda la documentación vigente, instrucciones de entorno y actualización remota.
- `git fetch origin` con red habilitada y `git merge --ff-only origin/main`: correctos; primer intento sin acceso de red falló al conectar al proxy.
- `python /tmp/verificar_fase1.py`: APROBADO; cardinalidades, unicidad de IDs, referencias, cobertura completa de 16 RF/7 RNF, enlaces locales, preservación literal de filas RF/RNF/D/P/A/R, instrucciones y documentos futuros intactos; cambios solo Markdown.
- `git diff --check` y revisión documental de diferencias/archivos nuevos: APROBADOS. Detalle y límites en docs/PRUEBAS.md.
- Pruebas funcionales, concurrencia real, seguridad/RLS, correo, Excel/PDF, navegador, Playwright, accesibilidad, rendimiento y restauración: NO EJECUTADAS; no hay implementación y Fase 2 no está autorizada.

### Sincronización de esta entrega

Destino autorizado: `amsotov/inventarioTI2`, rama `main`, desde la rama local `work` mediante avance normal y sin forzar historial. Usar autoría `noreply` de la cuenta ya verificada en el historial, sin modificar configuración global ni publicar correo privado. Antes del commit se revisan cambios y verificaciones; después del push se compara `git rev-parse HEAD` con `git ls-remote origin refs/heads/main`. La confirmación y SHA final se entregan al usuario tras esa comprobación, sin una modificación autorreferente del commit.

### Siguiente acción

Revisión de esta entrega y respuestas/ratificación a A-01 a A-11 y P-01/P-02/P-04. CA1-06 y cierre de Fase 1 pendientes; no volver a pedir autorización para el análisis ya ejecutado. Fase 2 continúa sin autorización y no se inicia. La aceptación de documentos, el cierre de fase y el permiso de empezar Fase 2 son decisiones distintas.

## Revisión de pendientes de Fase 1 — antecedente previo al cierre

**Solicitud:** «Revisa y termina los pendientes de la fase 1». **Estado:** EN_REVISION; preparación de resoluciones completada, ratificación pendiente. Este apartado actualiza el punto de continuidad anterior sin borrar antecedentes.

- Leídos nuevamente instrucciones, análisis, decisiones, requisitos, historias, trazabilidad y evidencias. Git inicialmente limpio; `git fetch origin` y `git merge --ff-only origin/main` confirman base `ff64f62e8581016973a9c2cf9d984fffa26dfc42` sin novedades remotas.
- Hallazgo: faltaban resultados concretos para criterios condicionados. Se crea `docs/CIERRE_FASE1.md` con alternativas, recomendaciones, parámetros y CR-01 a CR-20, cubriendo A-01 a A-11 y P-01/P-02/P-04. Contratos de los cinco reportes y buscador, casos límite, correcciones sin edición histórica, eventos/reintentos, acceso inicial y criterios operativos quedan listos para revisión.
- Dato recibido del usuario: «Chile somos 250 funcionarios calcula aprox cuántos bienes pueden ser por funcionarios». D-13 registra Chile y 250 funcionarios. Cálculo solicitado: 3–5 bienes/persona más 20 % de compartidos/reserva = 900–1.500; referencia 1.200. Capacidad objetivo propuesta: 3.000 bienes y 500 funcionarios conservando inactivos. No son existencias medidas ni equivalen a 250 cuentas.
- País confirmado, pero localidad/zona y política obligatoria de conservación no indicadas; se propone America/Santiago según localidad. No se afirma legislación aplicable, plazos legales o cumplimiento verificados.
- Archivos: nuevo CIERRE_FASE1; actualizados ANALISIS_EMPRESARIAL, HISTORIAS_USUARIO, REQUISITOS, TRAZABILIDAD, DECISIONES, PRUEBAS, FASES, README y este estado. Los RF/RNF y criterios originales se conservan; las recomendaciones no se convierten por inferencia en decisiones aprobadas.
- Verificación documental: `python /tmp/verificar_revision_fase1.py`, revisión de tablas, enlaces, referencias, cobertura de 14 pendientes/20 casos, cálculos y preservación de documentos/fases no autorizados; `git diff --check`. Resultados en docs/PRUEBAS.md. Las pruebas funcionales siguen NO EJECUTADAS; no existe implementación ni se inicia Fase 2.
- GitHub: mantener entrega en main, commit con noreply del historial; comparar SHA local/remoto después de push. No afirmar sincronización por la sola creación de un commit; SHA final se informa tras comprobarlo.

**Acción necesaria para cerrar:** usuario revisa el paquete y acepta o corrige sus recomendaciones por ID; aporta localidad/zona y política de conservación (o confirma su inexistencia y acuerda explícitamente su validación antes de datos reales). Ratificar estimación/capacidad si la dotación por persona difiere. Hasta entonces CA1-06 no se marca cumplido. No se vuelve a solicitar la autorización de Fase 1 ya otorgada; se pide únicamente la decisión de negocio concreta que aún falta.

## Cierre de Fase 1 — continuidad vigente del 2026-10-31

**Evidencia literal:** «Apruebo las conversiones, respaldo 1 vez a  la semana, zona horaria UTC y respaldo 1 vez a la semana». Se interpreta en el contexto inmediato como aprobación del paquete de recomendaciones presentado, con dos modificaciones expresas: UTC y respaldo semanal. No es solicitud de convertir archivos ni permiso de ejecutar respaldos o código.

- D-14 registra aceptación y cierre. A-01 a A-11 resueltos como requisitos de análisis y P-01/P-02/P-04 ratificados; CIERRE_FASE1 versión 2 es la base vigente. Fase 1 COMPLETADA; fases 2–15 sin autorización.
- UTC para toda fecha de negocio mostrada/filtrada/exportada, sin conversión automática al dispositivo; no se necesita una localidad chilena para definir esa zona.
- Respaldo una vez por semana con separación máxima de 7 días entre copias exitosas; RPO objetivo ≤ 7 días (168 h), derivado de la frecuencia elegida; RTO ≤ 8 h; conservación de copias 30 días. Se retira el objetivo de RPO 24 h asociado a la propuesta diaria. Posible pérdida de hasta una semana de cambios, sin garantía operativa todavía.
- Chile/250 funcionarios, estimación aceptada de 900–1.500 bienes/referencia 1.200 y capacidad objetivo 3.000 se conservan; objetivos de rendimiento/acceso/reportes/correo aceptados, no medidos ni implementados.
- Política legal de conservación no informada: F1-SEG-01, organización y privacidad en Fase 6, antes de datos reales. No se inventa inexistencia de política ni plazo indefinido. F1-SEG-02 presupuesto/costos en Fase 3; F1-SEG-03 día/hora UTC, alertas, ubicación, copias y restauración en Fases 3/14. Son seguimientos futuros, no preguntas de negocio omitidas ni controles completados.
- Actualizados cierre, decisiones, requisitos, análisis, historias/CA1, trazabilidad, visión, pruebas, README, specs/README, FASES y este estado. Los IDs se conservan; criterios condicionados se concretan con resultados aprobados, sin perder historial Git. Instrucciones y documentos técnicos de fases futuras intactos.
- Revisión documental: `python /tmp/verificar_cierre_fase1.py`, comparación de IDs/tablas/enlaces/estados/alcance y objetivos; `git diff --check`. Evidencia en docs/PRUEBAS.md. Pruebas funcionales, respaldo/restauración real, correo y navegador NO EJECUTADOS; no hay implementación.
- GitHub: base `363cfa0236185a787d86f0ef1afbc5d198ab9ed2`, árbol inicial limpio y remoto integrado sin novedades. Commit y push normales a main; SHA final local/remoto comprobado antes de confirmar entrega. La sincronización no autoriza otra fase o despliegue.

**Siguiente paso:** autorización independiente de Fase 2 antes de UX/UI o prototipo. No solicitar nuevamente decisiones ya aceptadas de Fase 1. Mantener F1-SEG-01/02/03 en el arranque de sus fases y no incorporar datos personales reales antes de validar conservación.

## Continuidad vigente: Fase 2 autorizada para un nuevo chat

- Solicitud del 2026-10-31: «En nuevo chat inicia fase 2 inventarioTI2». Autorización expresa para Fase 2; no necesita repetirse. Ejecución PENDIENTE hasta iniciar en el nuevo chat; Fase 1 permanece COMPLETADA. Este registro actualiza las menciones históricas de Fase 2 sin autorización, sin cambiar decisiones empresariales.
- Trabajo de esta preparación: actualizar únicamente FASES.md y ESTADO_PROYECTO.md, comprobar diferencias/estados y sincronizar GitHub. Sin diseño, prototipo, backend, datos reales, configuración de respaldos ni otra fase iniciados.
- Insumos: requisitos y cierre aceptados por D-14; Chile/250 funcionarios, bienes estimados 900–1.500/referencia 1.200, capacidad 3.000; UTC; respaldo semanal/RPO 7 días/RTO 8 h/copias 30 días. Mantener F1-SEG-01/02/03, sin inventar cumplimiento jurídico ni tareas operativas ejecutadas.
- Inicio autorizado: recuperar main, leer las instrucciones y documentos vigentes, presentar plan de Fase 2 y comprobar disponibilidad de visual-system-designer. La ruta citada no figura en el árbol previamente inspeccionado; buscarla nuevamente en la conversación ejecutora y declarar su ausencia si persiste. No afirmar uso del skill o pruebas sin evidencia.
- Alcance: UX/UI, navegación y prototipo navegable con datos ficticios; revisión en computador/iPad/iPhone, teclado y responsive; Playwright si disponible; registrar evidencia, límites y aceptación visual en docs/UX_UI.md. Seguir el punto de inicio detallado al final de FASES.md.
- Limitación: no hay herramienta para abrir otro chat automáticamente. Usuario debe abrir un nuevo chat con inventarioTI2 y escribir: «Inicia únicamente la Fase 2 de inventarioTI2, ya autorizada en FASES.md y ESTADO_PROYECTO.md. Lee las instrucciones y el cierre de Fase 1. No inicies Fase 3 ni despliegues; conserva los seguimientos y actualiza todos los cambios en GitHub».
- Verificaciones de preparación: git inicial limpio, fetch/avance directo sin novedades; revisión de los dos documentos, conservación de decisiones y filas de fases ajenas, `git diff --check` y comprobación de estados. Sin pruebas de aplicación/navegador, al ser preparación documental.
- Entrega: commit/push normales a main con autoría noreply; comparar SHA local/remoto antes de confirmar sincronización. Esta autorización no extiende permisos a Fase 3, producción ni publicación del sitio.

**Siguiente acción:** abrir el nuevo chat y ejecutar Fase 2 con la autorización ya registrada. Esperar revisión y aceptación visual; después solicitar autorización separada para Fase 3.


## Entrega de Fase 2 — antecedente previo al cierre, 2026-10-31

- Objetivo y alcance: UX/UI y prototipo navegable con datos ficticios, autorizado en FASES y ratificado por la solicitud inicial. Plan presentado; sin iniciar otras fases.
- Bases recuperadas: `fa844ec1ce49d2df22148a4894a5581796df3b8d` y actualización del usuario `d6a14c5` con SKILL.md. Git inicial limpio; integración por avance directo. Se conserva el skill del usuario en raíz y se corrige su referencia en AGENTS. Skill leído/aplicado; la ausencia inicial de la ruta antigua quedó superada.
- Archivos: prototipo/index.html, styles.css y app.js; tests/prototipo.cjs; docs/UX_UI.md, docs/PRUEBAS.md, evidencias/fase2; README, CHANGELOG, FASES, ESTADO, AGENTS y enlaces de continuidad en requisitos/decisiones/trazabilidad.
- Entrega: resumen con métricas de muestra, inventario con filtros combinados/fechas, búsqueda global, fichas bien/funcionario, alta/edición ilustrativas, movimientos con motivo/confirmación, anotación correctiva, cuentas, auditoría, destinatario/avisos y cinco reportes visuales. Selector de rol solo de diseño; no es seguridad real.
- Preview: `python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo`; URL local `http://127.0.0.1:4174/` comprobada en el entorno. Sin URL pública ni acceso del dispositivo del usuario supuesto. Para revisar en otro equipo, descargar/clonar el repositorio y ejecutar el servidor local. file:// está bloqueado por política del navegador del entorno.
- Verificaciones y capturas: resultados, comandos y limitaciones en docs/PRUEBAS.md. Pruebas de UI con Playwright y Chromium del entorno, sintaxis JS y diferencias. Emulación responsive y teclado no acreditan WCAG completa ni hardware/Safari.
- Hallazgos corregidos durante verificación: rango inválido conserva «Limpiar filtros»; enlace de salto enfoca contenido sin convertirse en ruta del prototipo; referencia de funcionario separada del documento; formularios asociados a su resumen de error.
- Riesgos/pendientes: aceptación de colores/marca, navegación, formularios, densidad/gráfico y móvil por el usuario. No hay backend, persistencia, APIs, identidad ni permisos efectivos, correo, Excel/PDF reales o pruebas de carga. No se selecciona arquitectura definitiva ni se configura respaldo.
- Seguimientos preservados: F1-SEG-01 retención legal antes de datos reales; F1-SEG-02 presupuesto en Fase 3; F1-SEG-03 respaldo operativo en sus fases. Requisitos vigentes: UTC, respaldo semanal, RPO 7 días/RTO 8 h/copias 30 días.
- GitHub: sincronización autorizada; revisar diferencias, crear commit y subir sin forzar historial; comparar SHA remoto antes de confirmar entrega. La subida de código no publica sitio ni despliega.

**Siguiente acción:** revisión visual del usuario dentro de Fase 2. **Aprobación visual NO OTORGADA; Fase 3 PENDIENTE / NO OTORGADA.**


## Cierre vigente de Fase 2 y autorización de Fase 3 — 2026-10-31

- Evidencia del usuario: «apruebo la revisión visual" para que cierre la fase y pase a la Fase 3 en nuevo chat». D-15 registra aceptación visual/cierre y autorización para continuar con Fase 3 en un nuevo chat.
- Fase 2 COMPLETADA; CA2-06 cumplido. Se aceptan los entregables visuales de `88d54f6`, conservando las 21 verificaciones UI y capturas de siete tamaños; sus límites no cambian. No se declara backend, seguridad, correo o persistencia reales.
- Trabajo de este cierre: actualizar únicamente documentación de aprobación, estados y continuidad; preservar prototipo, pruebas, capturas, skill y documentos técnicos futuros. No se inicia Fase 3 por registrar su autorización.
- Fase 3 PENDIENTE / AUTORIZADA para un nuevo chat. Arranque: recuperar main, leer instrucciones/requisitos/D-14/D-15/UX_UI y cierres; presentar plan de arquitectura y ejecutarlo dentro de ese alcance. Detalle en FASES. No pedir nuevamente autorización ya otorgada.
- F1-SEG-01/02/03 y requisitos UTC/respaldo semanal/RPO 7 días/RTO 8 h/copias 30 días intactos. Fases 4–15 no autorizadas; sin publicación, producción ni gastos.
- Verificación de este cierre: diferencias, enlaces locales, coherencia de estados y preservación de código/evidencia/fases 4–15; `git diff --check`. Pruebas UI no repetidas porque solo cambia documentación; se conserva la evidencia anterior.
- Sincronización GitHub autorizada: commit y push a main sin forzar; comparar SHA remoto antes de confirmar entrega. No se abrió otro chat automáticamente.

**Siguiente acción:** abrir un nuevo chat e iniciar únicamente Fase 3 con la autorización registrada. No se requiere otra aprobación para ese inicio; su entrega necesitará revisión propia.


## Entrega vigente de Fase 3 — 2026-10-31

**Objetivo/alcance:** arquitectura tecnológica autorizada por D-15 y ratificada por la solicitud de esta conversación; no implementar ni iniciar Fase 4. Fase 3 EN_REVISION, CA3-06 pendiente. Última completada: 2.

**Inspección/plan:** árbol inicial limpio en `363cfa0`; fetch y avance directo a `e7db2c6`, conservando trabajo remoto, cierre D-14/D-15, prototipo/skill/evidencia y reglas. Leídos AGENTS, PROMPT_MAESTRO, fases, estado, requisitos, cierre empresarial, trazabilidad, decisiones, UX_UI y evidencia aplicable. Plan presentado antes de redacción. Spec Kit no detectado (sin .specify ni specify en PATH); no instalado.

**Trabajo/archivos:** docs/ARQUITECTURA.md reemplaza su plantilla con comparación, monolito modular React/TypeScript + API Node/Fastify + worker, PostgreSQL/Supabase/Auth vía adaptadores, diagrama, límites, seguridad de sesión/RLS, integridad, continuidad, costos y portabilidad SQL Server. Nuevos docs/CONTRATOS_API.md y docs/adr/FASE3.md: contratos de API/integración y seis decisiones propuestas. Nuevos verificador, fuentes y resultado documental en docs/evidencias/fase3. Actualizados FASES, este estado, README, CHANGELOG, DECISIONES, TRAZABILIDAD, PRUEBAS y specs/README para continuidad/enlaces.

**Decisiones/riesgos:** selección técnica entregada para revisión, no aceptación implícita. Fuentes públicas actuales de Supabase/Render consultadas por HTTPS; backups Pro incluidos retienen 7 días, requieren complemento externo para 30. Sesiones/enlaces estrictos y cambios Auth/DB necesitan adaptador y conciliación, no basta JWT. No prometer SQL Server sin reimplementar adaptadores, políticas e identidad. F1-SEG-01 legal/retención sigue antes de datos reales; F1-SEG-02 sin presupuesto aprobado (escenario base 67–87 USD/mes, staging persistente +42 bajo supuestos); F1-SEG-03 con diseño pero sin horario/operador/ubicación definitivos ni respaldo configurado. UTC, frecuencia semanal, máximo 168 h entre éxitos, RTO 8 h y copias 30 días intactos.

**Verificaciones:** `python3 docs/evidencias/fase3/verificar.py`, salida versionada en resultados.txt; enlaces locales, cobertura RF/RNF/CA3/ADR, JSON de ejemplos, alcance solo documental y preservación exacta de fases 4–15 y archivos ajenos al alcance respecto de `e7db2c6`. `git diff --check` y revisión de diferencias/nuevos documentos. Detalle en docs/PRUEBAS.md.

**No ejecutadas:** UI/Playwright no repetidos al conservar código; build/compatibilidad de librerías, API/RLS/identidad reales, concurrencia, correo/exportaciones, rendimiento, backup/restauración no ejecutados por no existir implementación autorizada en esta fase. No ER, SQL, migraciones, dependencias, secretos, gasto, datos reales ni despliegues.

**GitHub:** destino main de amsotov/inventarioTI2, commit/push normales con autor noreply del historial; verificar SHA local/remoto antes de confirmar entrega. El SHA final se comunica tras la comprobación, sin commit autorreferente. Si hay cambios remotos, integrarlos y volver a revisar antes de subir; nunca forzar.

**Siguiente acción/aprobación:** revisión y aceptación de Fase 3. La Fase 4 continúa PENDIENTE / NO OTORGADA y requiere autorización expresa separada; no solicitar otra vez autorización para la arquitectura ya ejecutada.


## Cierre vigente de Fase 3 y autorización de Fase 4 — 2026-10-31

- Evidencia literal: «Apruebo y inicia fase 4 en un chat nuevo». D-17 acepta arquitectura, contratos y ADR de `703002c35a4e58d32e8f003b618d38c4f684ac00`; CA3-06 cumplido y Fase 3 COMPLETADA. Se mantiene evidencia documental previa, sin afirmar implementación o pruebas funcionales.
- Fase 4 AUTORIZADA para iniciar en un nuevo chat, ejecución PENDIENTE. No se ha abierto automáticamente otro chat ni se ha desarrollado modelo/SQL/migraciones en esta preparación. Fases 5–15 sin autorización; sin despliegue ni gastos.
- Entregables de este cierre: FASES y este estado; aceptación en ARQUITECTURA, CONTRATOS_API y ADR; D-17 en DECISIONES; continuidad en README/specs/README y evidencia en PRUEBAS/CHANGELOG. Prototipo, tests, capturas, documentos de datos/seguridad/despliegue y evidencia original de Fase 3 intactos.
- Insumos para Fase 4: cierre empresarial D-14, visual D-15, arquitectura aceptada D-17 y contratos; plan y límites al final de FASES. No repetir decisiones de negocio ni aprobación ya otorgadas. Mantener F1-SEG-01/02/03, UTC, frecuencia semanal/máximo 168 h entre copias, RTO 8 h y conservación de copias 30 días. Presupuesto, proveedores y operación no quedan contratados/aprobados por aceptar arquitectura.
- Verificación de cierre: enlaces locales, coherencia de estados/CA3-06/ADR, comparación de archivos y filas de fases 5–15 contra `703002c`; `git diff --check`. Solo documentación, sin repetir pruebas UI o ejecutar pruebas de base de datos.
- GitHub: base limpia y remota al día; commit/push normales a main, sin forzar, con comprobación de SHA remoto antes de confirmar entrega. No modificar el verificador/resultados históricos de la entrega para simular una nueva ejecución: corresponden a su base y estado de revisión.

**Siguiente acción:** abrir un chat nuevo con inventarioTI2 e iniciar únicamente Fase 4 usando la autorización registrada. La entrega de esa fase necesitará revisión propia; fases 5–15 siguen sin autorización.


## Entrega vigente de Fase 4 — 2026-10-31

- Objetivo/alcance: modelado conceptual/lógico/físico y persistencia bajo D-17, ratificados por la solicitud actual. Plan presentado antes de implementar; última completada 3; Fase 4 EN_REVISION, CA4-06 pendiente. Fases 5–15 no autorizadas.
- Inspección: git inicial limpio; fetch y avance directo de `363cfa0` a `1fe5859`, preservando actualizaciones de terceros. Leídos AGENTS/PROMPT_MAESTRO, fases/estado, requisitos/cierre D-14, diseño aceptado D-15, arquitectura/contratos/ADR aceptados D-17. Spec Kit no disponible ni instalado. Guías cloud, Supabase y PostgreSQL aplicadas; changelog/documentación actual consultados.
- Archivos: docs/BASE_DATOS.md con ER, reglas, índices, seguridad cerrada y límites; docs/DICCIONARIO_DATOS.md; migración supabase/migrations/20261031053433_modelo_inicial.sql, generada con CLI 2.122.0; db/seed_prueba.sql y consultas.sql; tests/datos/verificar.py; docs/evidencias/fase4; .gitignore para secretos/caché/dumps; continuidad, trazabilidad, decisiones, README, CHANGELOG y PRUEBAS actualizados. Sin cambios al prototipo ni evidencia anterior.
- Resultado: 13 tablas de negocio privadas, cuenta separada de funcionario, canónicos/unicidad incluso inactivos, RUT válido, custodia vigente única/intervalos no solapados y cierre único, bajas controladas, instantáneas históricas y evidencia append-only, versiones, idempotencia persistente y outbox. Todo el acceso queda cerrado por defecto; no es autorización funcional. Sesiones/identidad, permisos, API, replay HTTP y coordinación obligatoria de cada caso de uso siguen en sus fases.
- Pruebas: `python3 tests/datos/verificar.py` en PostgreSQL 17.11, imagen fijada por digest y contenedor sin red/puertos; resultados exactos versionados en docs/evidencias/fase4/resultados.txt. Migración/checksum/reaplicación, integridad, carreras, UTC, rollback/commit, idempotencia única, inmutabilidad, consultas, cierre de acceso y pg_dump/pg_restore con comparación de contenido y trigger restaurado. Revisión documental reproducible y `git diff --check` registrados en PRUEBAS. Durante preparación se corrigió la espera de PostgreSQL (distinguir servidor temporal de init y definitivo); no se oculta la ejecución inicial fallida.
- Límites: no integración con Supabase gestionado/Auth, advisors remotos, permisos por sesión/rol, API, correo, exportaciones, carga objetivo ni recuperación productiva; no repetir UI al preservar su código. El ensayo restaura datos/esquema locales con propietario de prueba, no Auth/configuración/ACL de proveedor ni RPO/RTO operativo. Sin datos reales, cambios remotos DB, gastos, despliegue o Fase 5.
- Riesgos/seguimientos: F1-SEG-01 conservación legal antes de datos reales; F1-SEG-02 presupuesto sin aprobar; F1-SEG-03 operador/ubicación/claves/alertas/horario sin configurar. UTC y copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Rol SQL definitivo y políticas requieren Fase 6; los servicios de Fases 7/10 deberán coordinar maestros/custodias/evidencia/outbox atómicamente, sin otorgar escritura directa genérica.
- GitHub: commit/push normales a main, sin forzar, con autor noreply ya verificado en historial. Comparar SHA local/remoto después de subir; comunicar SHA final al usuario tras verificar. La actualización no publica el sistema.

**Siguiente acción:** revisión y aceptación expresa de Fase 4; cualquier inicio de Fase 5 requiere autorización separada. No volver a pedir autorización de la Fase 4 ya ejecutada.


## Cierre vigente de Fase 4 y autorización de Fase 5 — 2026-10-31

- Evidencia literal del usuario: «Apruebo fase 4 y inicia fase 5 inventarioTI2 en nuevo chat». D-19 acepta modelo, diccionario, migración y pruebas de `65609df`; CA4-06 cumplido y Fase 4 COMPLETADA. Los 46 controles locales y la revisión documental conservan sus límites; no se afirma integración Supabase productiva ni operación implantada.
- Fase 5 AUTORIZADA para iniciar en un nuevo chat, ejecución PENDIENTE. No se abre automáticamente un chat ni se inicia autenticación aquí. Leer el plan de arranque vigente al final de FASES; no pedir otra vez la autorización ya otorgada. Fases 6–15 sin autorización.
- Trabajo de cierre: actualizar FASES, este estado, aceptación en BASE_DATOS, D-19 en DECISIONES y continuidad en README/specs/README, PRUEBAS y CHANGELOG. Preservar migraciones, seed, consultas, prototipo, tests y evidencias originales byte a byte.
- Verificaciones: árbol inicial limpio, fetch/avance directo sin novedades; enlaces locales, estados y CA4-06, filas 6–15 y archivos ajenos al alcance comparados contra `65609df`; `git diff --check`. Solo documentación; no repetir pruebas de PostgreSQL/UI ni modificar verificadores históricos para hacerlos pasar con estados posteriores.
- Insumos de autenticación: arquitectura BFF/Supabase aceptada, sesión opaca/servidor, revocación estricta, 30 min/8 h, MFA administrativo, invitación 24 h/recuperación 30 min de un uso. Primera identidad real solo mediante puesta en marcha autorizada; sin credenciales predeterminadas. Entorno sintético aislado y migraciones nuevas para cambios necesarios de Fase 5; sin permisos/API empresariales de fases posteriores.
- F1-SEG-01/02/03 conservados: retención legal antes de datos reales, presupuesto no aprobado y respaldo operativo no configurado. UTC, frecuencia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Sin gasto ni despliegue.
- GitHub: commit/push normales a main y comprobación SHA local/remoto antes de confirmar la entrega; aprobación no autoriza producción. SHA final comunicado al usuario tras verificar.

**Siguiente acción:** abrir un nuevo chat con inventarioTI2 e iniciar únicamente Fase 5 bajo D-19. Entrega y cierre de Fase 5 necesitarán revisión propia; no iniciar Fase 6.


## Ejecución y entrega de Fase 5 — vigente, 2026-10-31

- Alcance autorizado: exclusivamente autenticación bajo D-19, ratificada por el usuario en esta conversación. Base recuperada: `3b7e43a`; árbol inicial limpio, avance directo sin sobrescrituras. Instrucciones, requisitos, cierre empresarial, arquitectura/ADR/contratos, persistencia/diccionario/migración y pruebas aceptadas leídos.
- Plan presentado y ejecutado: BFF Fastify/TypeScript, puertos de identidad/persistencia, adaptadores Supabase/PostgreSQL, sesiones opacas cifradas, MFA administrativo, intenciones de acceso de un uso con 24 h/30 min, revocación 30 min/8 h, rate limiting, migración nueva y pruebas aisladas. Sin autorregistro ni primera cuenta real.
- Archivos nuevos: apps/server (composición, HTTP y autenticación), package.json/lockfile/tsconfig/.env.example, supabase/migrations/20261031055416_autenticacion.sql, tests/auth, docs/AUTENTICACION.md y evidencias/fase5. Actualizados .gitignore y documentos de continuidad, contratos/datos/trazabilidad y pruebas. Migración Fase 4, prototipo, seed, consultas, tests/evidencias anteriores preservados.
- Persistencia: cuentas y funcionarios separados; cuenta recibe flag de disponibilidad de credencial, sesiones/intenciones/entregas/límites privados con RLS cerrado. Operaciones externas de identidad dejan estado durable antes de ejecutarse; un resultado incierto bloquea reintento hasta conciliación. No se afirma atomicidad Auth/DB.
- Verificaciones: build TypeScript, suite de autenticación con PostgreSQL real y pruebas de adaptador local GoTrue; resultados exactos/límites en docs/PRUEBAS y evidencias/fase5. npm audit y git diff --check. Pruebas iniciales de preparación y sus correcciones registradas; no atribuir a dobles verificación de capacidades del proveedor.
- Pendientes de aceptación: configuración de proyecto gestionado separado, transporte/buzón de correo de prueba, privilegios SQL mínimos operativos en fase autorizada y conciliación operativa; UI completa de login/MFA no integrada. No datos reales, cambios DB remotos, envío externo, gastos ni despliegue. F1-SEG-01/02/03 intactos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días conservados.
- GitHub: revisión de cambios, commit/push normales a main con autoría noreply histórica y comprobación de SHA local/remoto. SHA final se comunica tras verificar, sin commit autorreferente. No se cambia historial remoto.

**Siguiente acción:** revisión de Fase 5 EN_REVISION y resolución de pendientes propios de integración antes de aceptar cierre. Fases 6–15 siguen PENDIENTE / NO OTORGADA. Esta entrega no solicita ni presume autorización de Fase 6.


## Cierre de Fase 5 y continuidad autorizada de Fase 6 — vigente

- Usuario: «Apruebo fase 5 y en nuevo chat inicia fase 6». D-21 acepta la entrega `6ab7229f2a89ca08fbd2f274377aa146386bc165`, cumple CA5-06 y cierra Fase 5 COMPLETADA. Se mantienen los límites: pruebas locales de PostgreSQL/doble y GoTrue, sin proyecto gestionado, transporte de correo real, privilegios SQL definitivos ni UI completa integrados.
- Fase 6 AUTORIZADA para iniciar en un nuevo chat, ejecución PENDIENTE. Esta tarea no inicia permisos, políticas RLS, auditoría ni modelo de amenazas de Fase 6. No crea automáticamente un chat. Fases 7–15 sin autorización; despliegue/producción/gastos no autorizados.
- Trabajo de cierre: actualizar fases, estado, aceptación en AUTENTICACION, D-21 en DECISIONES y continuidad en README/specs/README, PRUEBAS y CHANGELOG. Código, migraciones, tests y evidencias originales preservados literalmente.
- Insumos para Fase 6: arquitectura BFF/sesión opaca con validación vigente, dos roles con inventario compartido y auditoría/administración restringidas, RLS privado cerrado, rol SQL operativo y contexto transaccional pendientes. Leer pendientes de AUTENTICACION; no usarlos para iniciar otras fases. Retención legal, presupuesto y operación de respaldo F1-SEG-01/02/03 siguen abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.
- Verificación de cierre: árbol inicial limpio y main al día; revisión de diferencias, enlaces locales, estados/CA5-06, filas 7–15 y preservación de archivos contra la entrega aceptada; git diff --check. No repetir pruebas funcionales por cambios solo documentales ni modificar verificadores históricos para hacerlos pasar con estados posteriores.
- GitHub: commit/push normales a main, autoría noreply y comparación de SHA local/remoto antes de confirmar entrega. SHA final se informa después de comprobarlo; sin despliegue.

**Siguiente acción:** abrir un nuevo chat con inventarioTI2 e iniciar únicamente Fase 6 bajo D-21. Su entrega/cierre necesitará revisión propia; no iniciar Fase 7.


## Ejecución y entrega de Fase 6 — vigente, 2026-10-31

- Objetivo: autorización efectiva, privacidad y seguridad bajo D-21, ratificada en esta conversación. Base inicial limpia `6ab7229`, fetch/avance directo a `9845b10`, preservando cierre remoto de Fase 5. Instrucciones, plan vigente, requisitos/D-14, arquitectura/D-17, persistencia/D-19 y autenticación/D-21 inspeccionados. Guías cloud/Supabase/PostgreSQL leídas; documentación RLS/changelog actual consultada. Spec Kit no detectado ni instalado.
- Plan presentado y ejecutado: matriz cerrada administrador/lectura sin ámbito por unidad; puerto servidor Authorization con validación viva y locks; roles SQL separados y privados sin propiedad/BYPASSRLS; contexto de sesión LOCAL y RLS; proyección positiva de datos para futuro exportador; bitácora técnica inmutable sin PII/secretos y endurecimiento HTTP. No endpoints de negocio nuevos ni DML genérico de negocio concedido.
- Archivos: apps/server/security, cambios acotados a AuthService/Postgres, app/main; nueva migración `20261031182220_autorizacion_seguridad.sql`, tests/security, package/tsconfig/.env.example; SEGURIDAD, continuidad/trazabilidad/contratos/datos y evidencia fase6. Migraciones aceptadas, tests anteriores, prototipo y evidencia histórica preservados.
- Corrección hallada durante pruebas: bloqueo propio entre cuenta FOR UPDATE y FK de bitácora desde otro pool; se sustituye por FOR NO KEY UPDATE, compatible con KEY SHARE y aún excluyente frente a revocación/cambio de cuenta. Prueba concurrente cubre operación en curso y denegación siguiente. Se añade credencial_lista a validación vigente; antes solo login la comprobaba.
- Verificaciones: build, suite Auth/PostgreSQL y GoTrue local, pruebas negativas nuevas con roles SQL reales y proveedor doble, npm audit, revisión documental y git diff --check. Resultados exactos y límites en docs/PRUEBAS y evidencias/fase6. La primera ejecución bloqueada fue detenida sobre el contenedor sintético y corregida, no se presenta como éxito.
- Riesgos/pendientes: logins SQL de operación no aprovisionados, Supabase gestionado/advisors remotos no verificados; DATABASE_URL privilegiado ahora rechazado deliberadamente. Las escrituras empresariales, sus eventos RF-12 y controles propio rol/último administrador se implementarán en sus fases; permanecen cerradas. Exportaciones/UI/archivos/carga/pentest completo no ejecutados porque aún no existen esas superficies. F1-SEG-01 legal antes de datos reales, F1-SEG-02 presupuesto y F1-SEG-03 operación de respaldo intactos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días conservados.
- GitHub: commit/push normales a main con autoría noreply del historial; comparar SHA remoto antes de comunicar entrega. Sin permisos remotos, cuentas reales, datos reales, gastos, despliegue o Fase 7.

**Estado:** Fase 6 EN_REVISION, CA6-06 pendiente. **Siguiente acción:** revisión/aceptación expresa de esta entrega; no se presume cierre ni autorización para Fase 7.


## Cierre de Fase 6 y continuidad autorizada de Fase 7 — vigente

- Usuario: «Aprobado fase 6. Inicia fase 7 en nuevo chat». D-23 acepta la entrega `336232a9b1add5c6605f396a90795e419022756c`, cumple CA6-06 y cierra Fase 6 COMPLETADA. La aceptación conserva los límites de las 34 pruebas locales y de las integraciones pendientes; no convierte logins SQL reales ni Supabase gestionado en operación verificada.
- Fase 7 AUTORIZADA para iniciar en un nuevo chat, ejecución PENDIENTE. No se abre automáticamente una conversación ni se implementa backend/API empresarial en este cierre. Fases 8–15 sin autorización; sin despliegue, producción, gastos, datos reales o cambios remotos de permisos.
- Trabajo: documentación de cierre en FASES/ESTADO, SEGURIDAD (CA6-06), D-23 en DECISIONES, continuidad en README/specs/README, PRUEBAS y CHANGELOG. Código, migraciones, tests y evidencias originales preservados literalmente.
- Insumos/plan de Fase 7 al final de FASES: contratos/arquitectura aceptados, modelo y autenticación/seguridad; pool separado/contexto LOCAL, mínimo privilegio, reglas servidor, transacciones/evidencia/outbox/idempotencia, validación y pruebas negativas/concurrentes. No confundir servicios backend autorizados con iniciar frontend, panel u otros módulos futuros.
- F1-SEG-01/02/03 permanecen abiertos: retención legal antes de datos reales, presupuesto y operación de respaldo pendientes. UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.
- Verificación: árbol limpio y remoto al día al comenzar; diferencias, enlaces locales, estados/CA6-06, filas 8–15 y preservación de todos los archivos ajenos a este cierre contra `336232a9b1add5c6605f396a90795e419022756c`; git diff --check. Pruebas funcionales no repetidas porque solo cambia documentación. No modificar verificadores históricos para hacerlos pasar con estados posteriores.
- GitHub: commit/push normales a main con autoría noreply y comparación de SHA local/remoto; SHA final comunicado tras verificar. Sin despliegue.

**Siguiente acción:** abrir un nuevo chat con inventarioTI2 e iniciar únicamente Fase 7 bajo D-23. Su entrega/cierre necesitará revisión propia; no iniciar Fase 8.


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


## Entrega de Fase 8 — vigente 2026-11-01

Ejecución autorizada D-25 y ratificada por solicitud actual, registrada D-26. Base limpia `1297549`, recuperada por avance directo. Se implementa únicamente frontend funcional con React/Vite, BFF mismo origen, acceso/MFA, listas/fichas/filtros/cursor y alta/edición de bienes. Sin nuevos contratos o migraciones empresariales; controles efectivos conservados en servidor. Plan y criterios/archivos/riesgos en [FRONTEND](docs/FRONTEND.md), verificaciones en [PRUEBAS](docs/PRUEBAS.md).

Estado EN_REVISION, última completada 7; aceptación CA8-06 pendiente del usuario. No se presenta integración gestionada como probada: Auth es doble en pruebas; BFF/RLS/PostgreSQL reales y sintéticos. No correo externo, Safari/dispositivos reales, TLS productivo, carga ni continuidad operativa verificados. Prototipo/migraciones/evidencias históricas preservados. F1-SEG-01/02/03 abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.

Siguiente acción: revisión y aceptación de Fase 8. Fase 9 requiere autorización independiente y permanece PENDIENTE / NO OTORGADA junto con 10–15. Sin despliegue, datos reales, cuentas reales, permisos remotos o gastos. Cambios se entregan mediante commit/push y verificación de SHA remoto, conforme AGENTS.


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

Trabajo de cierre: actualización documental de FASES/ESTADO, ADMINISTRACION (CA9-06), MANUAL_ADMIN, D-29 en DECISIONES, continuidad en README/specs/README, PRUEBAS y CHANGELOG. Código, migraciones, dependencias, pruebas, prototipo y evidencias originales preservados literalmente respecto a la entrega aceptada. No se modifican verificadores históricos para adaptarlos a estados posteriores.

Verificación: árbol inicial limpio, main al día; revisión de diferencias, enlaces locales, estados/CA9-06, filas 11–15 y preservación de archivos ajenos al cierre. `git diff --check`. No se repiten pruebas funcionales porque solo cambia documentación. F1-SEG-01/02/03 permanecen abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.

GitHub: commit/push normales a main, autoría noreply y comparación de SHA local/remoto antes de confirmar. Siguiente acción: abrir un nuevo chat e iniciar únicamente Fase 10 bajo D-29. Su entrega/cierre necesitará revisión propia; no iniciar Fase 11.


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


## Entrega inicial de Fase 11 — 2026-11-02 (D-32)

PROYECTO: inventarioTI2. FASE: 11 — Indicadores, reportes y exportación. ESTADO: EN_REVISION. OBJETIVO/ALCANCE: únicamente indicadores actuales verificables, cinco reportes y buscador combinado con filtros UTC y salidas Excel/PDF completas autorizadas. Usuario ratifica D-31 y exige GitHub; prohíbe Fase 12 y despliegue. No se repitió la solicitud de autorización.

Trabajo comprobado: se recuperaron `888f8a2`/`92a6dec` por fast-forward sin reescribir historia. Métricas desde fuente; selección positiva común para UI/archivos; cinco reportes y dos conjuntos de buscador, orden/conteos/subtotales, días UTC inclusivos y unidades históricas. Consulta/exportación en REPEATABLE READ. RLS por solicitante y auditoría administrativa; trabajo/instantánea/archivo privados, claves durables, claim con arrendamiento, recuperación por consulta, caducidad de una hora, límites 10.000 XLSX/2.000 PDF y bytes/tiempo/memoria. Hilo sin credenciales, fórmula Excel como texto, PDF sin ejecutar HTML/URLs. Revocación durante generación impide guardar archivo; descarga vuelve a verificar permisos.

UI: Resumen y Reportes/buscador con carga/vacío/error, filtros, paginación, trabajo/descarga/recuperación propia, reintento exacto tras respuesta perdida, teclado y emulación 1440/768/390. Pequeña corrección del panel: ocultar contenido anterior al cambiar pestaña. Pruebas antiguas corregidas para esperar el campo del formulario nuevo y filtrar explícitamente la referencia en ensayo responsive; sin alterar evidencia aceptada.

Archivos: `apps/server/reports/*`, integración app/security, migración `20261102120248_indicadores_reportes_exportaciones.sql`, `apps/web/src/reports.tsx` e integración/estilos/mensajes/panel, package/lock/tsconfig, tests/api/reports, tests/ui/reports y soporte tests/helpers; documentación REPORTES, API/contratos/datos/seguridad/arquitectura/frontend/trazabilidad/manuales/fases/estado/decisiones/changelog/specs y evidencias/fase11. Spec Kit no instalado ni usado.

Pruebas: `npm run build` correcto; `npm test` 85/85; `npm run test:ui` 32/32; 8/8 revalidadas en Fase 11 tras ajuste final de tabla/capturas; `npm audit --json` 0 vulnerabilidades; `git diff --check` y revisión documental. XLSX inspeccionado independientemente con Python/ZIP/XML (sin nodos fórmula) y PDF con pdftotext; ambos formatos de las seis salidas, límites/vacíos/permisos y revocación. Ensayo de 10.000 filas Excel 1.086 ms y 2.000 PDF 613 ms en loopback sintético; no prueba de capacidad objetivo ni red externa. Changelog Supabase/RLS y versiones/licencias de generadores contrastados. CLI creó migración; advisors/listado local no operativos por ausencia de stack en 54322, no presentados como superados. Cadena SQL completa aplicada en bases efímeras con y sin roles Data API.

Riesgos/decisiones: limpieza física de archivos vencidos diferida a interacción autorizada; metadatos/idempotencia conservados. Pendientes Supabase/identidad/MFA gestionados, integración operativa/retención jurídica, hardware/Safari/accesibilidad completa, carga/infraestructura objetivo y continuidad productiva. F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. No correo externo ni procesamiento de outbox, otras fases, datos reales, cambios remotos de permisos, gastos o despliegues.

Siguiente acción: revisión y aceptación propia de Fase 11 (CA11-06 pendiente). Fases 12–15 PENDIENTE / NO OTORGADA. Sincronización mediante commit/push normales a main, autoría noreply y comprobación de SHA remoto antes de confirmar entrega.


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

Verificación de este cierre: únicamente documentación; diff/revisión de estados, criterios, enlaces locales y preservación de aplicación/migraciones/tests/evidencias. No se reejecutan suites de aplicación porque no cambian código ni dependencias. Sincronización mediante commit/push normales a main, autoría noreply y comparación de SHA remoto antes de confirmar entrega.


## Entrega inicial de Fase 12 — 2026-11-02 (D-34)

PROYECTO: inventarioTI2. FASE: 12 — Notificaciones y automatización. ESTADO: EN_REVISION. OBJETIVO/ALCANCE: ejecutar únicamente catálogo A-07, automatización del outbox y seguimiento administrativo; D-34 ratifica D-33 y exige GitHub, sin Fase 13 ni despliegue. No se repitió la autorización.

Trabajo: base main `c348e873231cc6aaccf33d8c39d61f60943359e6` comprobada con GitHub y fetch normal, árbol inicial limpio. Plan presentado e implementado. Se conservan transacción/idempotencia empresarial, evento/destino inmutables y entregas previas. Reclamación SKIP LOCKED/token/arrendamiento; primer intento y tres reintentos 1/5/15 desde fallo anterior; permanente/agote detenidos, inciertos conciliables con evidencia sin reenvío automático. Contenido positivo, actor técnico, fechas UTC, sin valores personales/texto libre. Puerto MailPort y adaptador Resend preparados sin activar; API/UI de filtros, detalle/intentos y acciones con motivos/confirmación/versión/replay/auditoría. Privilegios mínimos y sesión/MFA/Origin/CSRF vigentes.

Archivos: `apps/server/notifications/*`, app/security, `apps/web/src/notifications.tsx`, integración admin/estilos, `.env.example`, package script; migración `20261102135006_notificaciones_automatizacion.sql`; pruebas API/UI y fixture común, `docs/NOTIFICACIONES.md`, contratos/datos/seguridad/arquitectura/frontend/manuales/trazabilidad, fases/estado/decisiones/changelog/specs y `docs/evidencias/fase12`. Spec Kit no instalado ni simulado. Sin dependencias nuevas.

Pruebas y recuentos finales en PRUEBAS/evidencias/fase12. PostgreSQL real efímero, identidad/correo dobles y HTTP sustituido; pruebas de catálogo, minimización, destino, exclusión, caída, retrasos, permanente/agote/incierto, rollback empresarial y de acción, replay, RLS/permisos/revocación y navegador. Evidencias históricas regeneradas por suites restauradas al contenido aceptado; no se alteran sus resultados. Advisors/listado local no operativos por ausencia de stack en 54322; la cadena de migraciones sí se aplica en bases sintéticas. No correo externo ni integración gestionada acreditados.

Riesgos/decisiones: aceptación no equivale a entrega/lectura; idempotencia Resend documentada 24 h no sustituye conciliación durable. No webhook público/conciliación automática, solo registro administrativo respaldado por evidencia. Arrendamiento de 60 s y consulta cada segundo son parámetros técnicos locales, sin objetivo de capacidad acreditado. Integración real exige remitente/dominio/buzones autorizados, validación de privacidad/costo y credenciales fuera de Git; ejecución externa no autorizada por esta entrega. Pendientes gestionados, hardware/Safari/accesibilidad/carga/continuidad y F1-SEG-01/02/03 conservados. UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.

Siguiente acción: revisión/aceptación propia de Fase 12, CA12-06 pendiente. Última completada 11. Fases 13–15 PENDIENTE / NO OTORGADA; sin datos/cuentas reales, permisos remotos, gastos, producción ni despliegues. GitHub por commit/push normales a main, autoría noreply y comprobación de SHA remoto antes de confirmar.


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

Verificación de este cierre: únicamente documentación; revisión de estados/CA12-06/D-35, enlaces locales y preservación de aplicación, migraciones, dependencias, tests y evidencias aceptadas. `git diff --check`. No se repiten build ni suites funcionales porque no cambia código. Los verificadores históricos conservan las condiciones de su entrega original; no se reescriben para adaptarlos al cierre. Commit/push normales a main, autoría noreply y comparación de SHA remoto antes de confirmar.


## Entrega vigente de Fase 13 — 2026-11-02 (D-36)

PROYECTO: inventarioTI2. FASE: 13 — QA, rendimiento y seguridad. ESTADO: EN_REVISION. OBJETIVO/ALCANCE: consolidar regresión, matriz trazable, carga A-09, accesibilidad, seguridad y correcciones; ratifica D-35 sin repetir autorización. Plan presentado antes de implementar. Base `da1236e`, trabajo inicial limpio, preservado avance remoto de Fase 12.

Trabajo: [plan/criterios/defectos y límites](docs/QA_FASE13.md), [matriz](docs/MATRIZ_QA_FASE13.md) y evidencias nuevas. Correcciones: claves incompletas del buscador; metadatos XLSX/PDF con consulta reservada; etiqueta accesible de avisos; salto de teclado sin cambiar ruta; retiro de volúmenes propios y concurrencia acotada del runner. Se conservan permisos, lógica empresarial, controles de sesión/MFA/RLS, migraciones y evidencia aceptadas. Única dependencia nueva: axe-core 4.14.0 de desarrollo, MPL-2.0, fijada con lockfile.

Pruebas finales: build, 119/119 API/seguridad, 39/39 navegador, 35 análisis axe sin infracciones detectadas y 79 comprobaciones programáticas; auditoría npm sin vulnerabilidades y búsqueda heurística sin coincidencias en alcance registrado. Carga con 3.000 bienes/500 funcionarios/25 cuentas/100.000 movimientos/100.000 auditorías, 10 usuarios, 100 consultas de calentamiento, 1.000 consultas y 200 escrituras medidas: p95 145,59/142,17 ms; +200 movimientos/auditorías/comandos/avisos. XLSX 10.000/PDF 2.000: 3,23/4,06 s; primer intento de 203 avisos con doble ≤21,84 s. Fallos iniciales/preparación y reproducción en PRUEBAS/evidencias/fase13; sin fallos ocultos en percentiles.

Riesgos: dobles de identidad/correo y loopback no acreditan Supabase/Resend gestionados, entrega física, infraestructura contratada, Safari/hardware/lector de pantalla/WCAG completa, pentest independiente, disponibilidad o continuidad productiva. Advisors sin stack/CLI operativo, no modificados proyectos remotos. F1-SEG-01/02/03 abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Sin Spec Kit, servicios/costos, datos reales, permisos remotos o despliegue.

Archivos: selección/renderizador de reportes, main/avisos UI; helper/tests API/seguridad/QA, package/lock/tsconfig; QA/matriz/evidencias, PRUEBAS/TRAZABILIDAD/SEGURIDAD/REPORTES/manual y documentos de control. Siguiente acción: revisión/aceptación propia de Fase 13 (CA13-06 pendiente). No marcar COMPLETADA ni iniciar Fases 14–15. Sincronización normal a main, autoría noreply y comparación SHA remoto al entregar.


## Cierre aprobado de Fase 13 y continuidad autorizada de Fase 14 — vigente

2026-11-02. Evidencia literal: «apruebo fase 13 inicia en nuevo chat fase 14». D-37 acepta la entrega `16f7bf0a4d7a088eae444488874daefc19c35630`, cumple CA13-06 y cierra Fase 13 COMPLETADA. Conserva 119/119 pruebas API/seguridad, 39/39 de navegador, 35 análisis axe sin infracciones detectadas y 79 comprobaciones programáticas. Carga sintética A-09 y exportaciones/avisos con doble conservan sus resultados y límites; la aceptación no acredita Supabase/Resend gestionados, Safari/hardware/WCAG completa ni continuidad productiva.

Fase 14 AUTORIZADA únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Este cierre solo registra aceptación y continuidad y sincroniza GitHub. No se crea automáticamente otra conversación ni se ejecuta Fase 14 aquí. Fase 15 PENDIENTE / NO OTORGADA; producción requiere autorización independiente. Sin despliegue, envíos reales, datos/cuentas reales, gastos ni cambios remotos de permisos en este cierre. F1-SEG-01/02/03 y UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos.

Punto de inicio para el nuevo chat:

1. Recuperar main y leer AGENTS, PROMPT_MAESTRO, FASES, ESTADO, requisitos/cierre D-14, arquitectura/ADR D-17, datos/acceso/seguridad y entregas aceptadas hasta D-37. Revisar `docs/DESPLIEGUE.md` (plantilla pendiente), `docs/QA_FASE13.md`, matriz/evidencias, código/migraciones/pruebas y límites reales. No volver a pedir autorización de Fase 14.
2. Presentar el plan limitado a despliegue, operación y continuidad: aislamiento local/pruebas/producción, configuración/secretos, CI de verificación, control de promoción, migraciones, observabilidad, copias/restauración, rollback y respuesta a incidentes. Preparar runbook y checklist verificables. No iniciar Fase 15 por dependencia.
3. Partir de la arquitectura aceptada como referencia, sin convertir estimaciones o alternativas en servicios contratados. Inspeccionar capacidades/configuración disponibles antes de preguntar. Si faltan dependencias externas, avanzar con documentación y ensayos locales aislados; registrar el bloqueo solo del ensayo afectado. Datos sintéticos y correo capturado/doble; no crear cuentas reales, contratar recursos, modificar permisos remotos ni activar envíos por inferencia.
4. Preservar sesión/rol/MFA vigentes, Origin/CSRF, HTTPS de operación, pools SQL separados/contexto LOCAL, RLS/mínimo privilegio y configuración fuera de Git. Worker de avisos separado y deshabilitado por defecto; ninguna web ni pipeline debe despachar pendientes reales automáticamente. No convertir las pruebas con dobles en integración gestionada acreditada.
5. Mantener UTC y requisitos de continuidad: copia semanal con máximo 168 h entre éxitos, conservación 30 días, RPO ≤168 h y RTO ≤8 h; restauración antes de producción y trimestral después. F1-SEG-03 debe concretar operador, ubicación, cifrado/custodia de claves, horario y alertas, todavía sin aprobar. No fijar domingo 02:00 UTC como decisión aceptada: es una propuesta histórica. Ensayar cobertura de datos/historia/auditoría/outbox, roles/privilegios, identidad/configuración y artefactos necesarios; no afirmar recuperación integral por un pg_dump aislado.
6. Documentar fallos de copia, pérdida/recuperación de servicio, rollback y conciliación de efectos externos inciertos. Preservar evidencia e idempotencia; recuperación no debe restaurar sesiones activas ni reenviar avisos ambiguos. Probar procedimientos únicamente en recursos sintéticos propios, sin borrar ni alterar datos reales.
7. Conservar F1-SEG-01 (retención legal antes de datos reales), F1-SEG-02 (presupuesto/costos pendientes), F1-SEG-03 y límites gestionados/hardware de QA. Disponibilidad mensual 99,5 % no queda acreditada por una sesión ni por scripts. Mantener CI de comprobación separado de despliegues automáticos por push; destinos y promociones deben ser explícitos. Producción requiere autorización expresa adicional; no se deduce del inicio de Fase 14.
8. Registrar plan/criterios, pruebas ejecutadas/fallidas/no ejecutadas, evidencias y bloqueos; actualizar documentación/GitHub y comprobar SHA remoto. Entregar Fase 14 EN_REVISION para aceptación propia; no marcar COMPLETADA ni iniciar Fase 15 sin aprobación independiente.

Verificación de este cierre: únicamente documentación; revisión de estados/CA13-06/D-37 y enlaces locales, `git diff --check` y preservación literal de aplicación, migraciones, dependencias, tests y todas las evidencias aceptadas frente a `16f7bf0`. No se repiten build/suites funcionales porque no cambia código. Los verificadores históricos, incluido `docs/evidencias/fase13/verificar.py`, conservan las condiciones EN_REVISION de su entrega original y no se reescriben para adaptarlos al cierre. Commit/push normales a main, autoría noreply y comparación de SHA remoto antes de confirmar.


## Ejecución vigente de Fase 14 — D-38

2026-11-02. D-37 ratificada por solicitud de iniciar únicamente Fase 14, presentar plan y actualizar GitHub, sin Fase 15 ni producción. Base recuperada `8d66e72`, rama local work limpia; no se sobrescribe trabajo remoto.

Entregables: [plan](docs/DESPLIEGUE.md), [runbook](docs/RUNBOOK_OPERACION.md), [checklist](docs/CHECKLIST_LIBERACION.md), CI Verify only sin deploy/secretos de proveedor, salud live/ready y logs por plantilla sin PII; HOST privado explícito con loopback por defecto. Ensayo `npm run test:ops` de cifrado/manifiesto/restore en contenedores propios, cotejo de datos/roles/RLS/ACL/políticas/secuencias/funciones, cuarentena de sesiones/enlaces/outbox, nueva autenticación y fallo DDL atómico. No se alteran migraciones ni evidencia aceptada.

Comandos/resultados/límites en [PRUEBAS](docs/PRUEBAS.md#fase-14--operación-y-continuidad) y [evidencias](docs/evidencias/fase14/). Ensayos iniciales y correcciones se registran sin ocultar fallos. Sin backup gestionado/Auth/MFA real, almacén/retención externos, proxy/TLS ni rollback de artefacto en plataforma acreditados. F1-SEG-01/02/03 siguen abiertos. No hay operador/suplente, día/hora UTC, destino/custodia/canal aprobados ni presupuesto informado. No fijar domingo 02:00 UTC como aceptado.

Fase 14 EN_REVISION, CA14-06 PENDIENTE; última completada 13. Producción no autorizada; Fase 15 sin iniciar. Siguiente acción: revisión/aceptación propia de entrega con límites y resolución de pendientes operativos. Ninguna autorización futura se presume. Todos los cambios se sincronizan en amsotov/inventarioTI2, main, con commit/push normal y SHA remoto comprobado.

## Incremento vigente — Demo React / Pages (2026-11-02)

El usuario autoriza explícitamente preparar la demo y su publicación estática mediante workflow, entregada por pull request. Se implementa `demoData` en memoria, sesión/roles sintéticos, CRUD y movimientos, banner y correo simulado; Excel/PDF locales, configuración Vite/base y workflow Pages Node 20. Se preservan servidor, Supabase, migraciones, autenticación y flujos normales. React Router no está instalado: la navegación hash existente ya evita el 404 de recarga.

Archivos: `apps/web/src/{api,main,reports,admin,style,demoData,demoMode,env.d}`, `vite.config.js`, `scripts/demo.mjs`, `package.json`/lock, `.github/workflows/deploy-demo.yml`, `tests/demo/browser.mjs`, README y registros de control. El pipeline sube únicamente `dist/web`. Node 24 continúa siendo el requisito del servidor; Node 20 se utiliza solo para compilar la demo. Nueva biblioteca de navegador jsPDF 4.2.1 fijada; write-excel-file ya existía. Sin almacenamiento local/persistente de demo, llamadas API o correo real. Verificación y resultados en `docs/DEMO.md`.

Fase 14 continúa EN_REVISION con CA14-06 pendiente, última completada 13; Fase 15 sin iniciar. La demo no acredita continuidad productiva ni resuelve F1-SEG-01/02/03. Siguiente paso: revisar/integrar el PR y seleccionar GitHub Actions como fuente de Pages. No se activa Pages desde esta tarea ni se publica antes de integrar el PR.


## Publicación demo autorizada — 2026-11-02

El usuario autoriza expresamente integrar el PR #2, preparar y publicar la demo en GitHub Pages. Se corrige previamente CI: faltaba `pdftotext` en el runner, por lo que Verify instalará `poppler-utils` sin omitir pruebas. Se verificará CI, se integrará el PR y se cambiará Pages de la fuente legacy `/docs` a GitHub Actions, publicando solo datos sintéticos. Esta autorización no cierra CA14-06, no inicia Fase 15 ni autoriza el sistema productivo. Resultado final y enlaces en `docs/DEMO.md`.


## Resultado de integración — 2026-11-03

PR #2 integrado en main (`3917d924`) tras CI completo correcto (run 41549745378). Publicación autorizada, compilación estática remota correcta; cambio de fuente Pages denegado por GitHub con HTTP 403 tanto a la credencial externa como al token del workflow. El workflow comprueba la fuente sin intentar modificarla. Pendiente intervención del mantenedor: Settings > Pages > Source: GitHub Actions; después reejecutar el despliegue y verificar la URL pública. Detalles en `docs/DEMO.md`. No se declara publicada la demo ni se cierra Fase 14 por inferencia.


## Demo publicada y verificada — 2026-11-03

El usuario cambió la fuente Pages a GitHub Actions (`build_type=workflow` confirmado). PR #2 integrado; reejecución del workflow 41550326656 correcta (build/deploy), commit de aplicación `79913ae`. URL pública https://amsotov.github.io/inventarioTI2/ con HTTP 200 y recorrido completo `npm run test:demo` contra Pages PASS: CRUD, roles, movimientos/historia, correo simulado, XLSX/PDF filtrados, hash/recarga, cero APIs externas y errores de navegador. Incidencias iniciales y enlaces en `docs/DEMO.md`. Alcance demo solicitado completado; documentación final sincronizada en main. Fase 14 sigue EN_REVISION/CA14-06 pendiente; Fase 15 sin iniciar, sistema productivo no desplegado.


## Entrega vigente de migración Fase 2 — M2-A01

Base 9dbaa2f, fuentes y aplicación conservadas. 23 requisitos, 19 reglas, 16 historias y 20 CR trazados; 19 tablas/155 columnas actuales y 30 tablas/117 campos de destino documentados. Inventarios API/UI y títulos de pruebas existentes, sin reejecución funcional. Verificación estática de cobertura/referencias/hashes; informes en docs/migracion/02_*. Fase 2 EN_REVISION, Fase 3 no autorizada. GitHub por rama dedicada y SHA remoto verificado al entregar, sin main ni despliegue.


## Entrega vigente de migración Fase 3 — M3-A01

Base b29d60c. Diseño de 11 vistas y contratos: conserva 49 pares método/ruta existentes; propone 18 v2 y cobertura de 117 campos. Maqueta HTML/CSS/JS aislada bajo docs/migracion, sin aplicación/API/BD. Playwright/Chromium 1440/768/390 y datos ficticios; capturas/evidencia del ensayo, límites de emulación. Fase 3 EN_REVISION y Fase 4 no autorizada. Sin SQL, integración gestionada, merge ni despliegue; GitHub y SHA remoto al entregar.


## Entrega vigente de migración Fase 4 — M4-A01

Base 59b58d9. Plan de dos fuentes APP_POSTGRES/EXCEL_LEGADO, staging saneado/cuarentena, IDs/replay, DAG de 30 tablas, soporte de capacidades actuales, backup/restauración y retorno antes/después de nuevas escrituras. Reglas cubren 57 filas de MAPEO_EXCEL y 13 de CALIDAD_DATOS, sin copiar valores sensibles. 20 controles, 36 casos futuros y 12 puertas con estado explícito. No perfilado/carga real: falta Excel operacional y siguen decisiones/entorno/seguridad pendientes. Fase 4 EN_REVISION y Fase 5 no autorizada; sin SQL, aplicación o despliegue.

## Continuidad M5-A01

Fase 4 aceptada (`9f84fcd`); Fase 5 preparada para revisión. Leer docs/migracion/05_ESQUEMA_SQLSERVER.md y migrations/sqlserver/README.md. Siguiente acción: resolver decisiones/entorno y revisar candidato antes de aplicar. No hay conexión SQL Server ni ensayos de motor; scripts con barrera incondicional. No convertir datos reales ausentes o casos futuros en éxitos. Fase 6 sin autorización.

## Continuidad M5-A02

Entornos confirmados en docs/migracion/05_ENTORNOS_COMPATIBILIDAD.md. No repetir pregunta de versión/nivel o nombre de proyecto. Falta conexión al proyecto correcto inventarioTI2; no usar inventarioTI. SQL Server 2016/130 es destino, no proveedor disponible. Se conserva aplicación; Fase 5 revisión 2 EN_REVISION, Fase 6 sin autorización.

## Continuidad M5-A03 — provisión Supabase

Creación inventarioTI2 en sovicl/sa-east-1 autorizada por usuario. Intento rechazado por cuota Free, no por credenciales ni aprobación automática. Ver docs/migracion/PROVISION_SUPABASE.md. No existe ref nueva, no hubo SQL/cargas ni modificación de proyectos existentes. Siguiente acción: resolver capacidad con instrucción específica; luego reintentar creación ya autorizada sin repetir preguntas de organización/región. SQL Server/Fase 6 conservan bloqueos.

## Continuidad M5-A04 — entorno nuevo disponible

inventarioTI pausado INACTIVE por instrucción; inventarioTI2 creado ACTIVE_HEALTHY en sovicl/sa-east-1 (Free), ref yhsfotxhaptinjtmrinn. Ver docs/migracion/PROVISION_SUPABASE.md. PostgreSQL 17.11/UTC consultado; no tablas/datos ni funcionalidades de aplicación implantadas. Actualizar alcance de pruebas tras decisiones pendientes; no pedir otra vez creación/organización/pausa. No reactivar el anterior ni tocar hoteles por inferencia. Fase 5 EN_REVISION, Fase 6 NO AUTORIZADA.

## Continuidad M5-A05 — baseline SQL ensayada

Nuevo proyecto inventarioTI2 ya no está vacío: 19 tablas/155 columnas de baseline existente, 2 unidades/3 funcionarios/6 bienes sintéticos. Veinte casos SQL gestionados aprobados con rollback; cero cuentas/sesiones/comandos/auditoría/outbox de ensayo persistentes. Ver docs/migracion/VALIDACION_SUPABASE.md, no reejecutar seed o DDL sin revisar historial. No hay logins de app o interfaz desplegada. Candidato SQL Server revisión4 sin cambios físicos; decisiones/instancia y fases siguientes conservan pendientes.


## M7-A01 — continuidad vigente de Fase 7

Cliente nuevo implementado en React existente, 17 contratos usados, siete atributos de lectura opcionales M7-C01 y comportamientos de conflicto/reintento/privacidad. [Informe](docs/migracion/07_ADAPTACION_VISUAL.md), [pruebas](docs/migracion/evidencias/fase7/pruebas.json), [capturas](docs/migracion/evidencias/fase7/navegador.json). Persistencia v2 usa doble en pruebas, main conserva v1/PostgreSQL. Sin SQL/remoto/deploy ni F8. Siguiente acción: revisión visual y aceptación de F7, conservando pendientes de destino.
