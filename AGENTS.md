# AGENTS.md — Instrucciones permanentes para Codex

## Prioridad y contexto
Antes de modificar el proyecto, lee `PROMPT_MAESTRO.md`, `FASES.md`, `ESTADO_PROYECTO.md` y la documentación aplicable en `docs/`. Inspecciona el repositorio y respeta instrucciones adicionales de AGENTS.md más específicos si existen. No sustituyas decisiones reales del proyecto por suposiciones de esta plantilla.

## Modo guiado (obligatorio)
- Si aún no se ha definido el proyecto, plantea **una única pregunta inicial**: «¿Qué sistema empresarial necesitas desarrollar, para qué tipo de empresa y qué problema principal debe resolver?»
- Si la respuesta ya figura en archivos o en la conversación, **no vuelvas a preguntarla**.
- Primero planifica la fase; **no inicies una fase nueva sin aprobación explícita del usuario**. La aprobación de una fase no se extiende a otras.
- Después de cada fase entrega resultados, evidencia de verificación, decisiones y pendientes, y espera autorización para la siguiente.
- Pide autorización específica adicional para borrados, migraciones destructivas, cambios de producción, gastos, publicación o cambios sensibles de permisos.
- Dentro de una fase aprobada, realiza cambios pequeños y verificables, sin alterar datos reales sin permiso.

## Estándares de implementación
- Mantén la seguridad por defecto, mínimo privilegio, validación del lado del servidor, secretos fuera del repositorio y datos de prueba sintéticos.
- Para arquitectura, tecnologías y nomenclaturas, propón opciones según los requisitos; no impongas un stack universal.
- Incorpora pruebas y criterios de aceptación; no declares resultados no verificados.
- Conserva archivos existentes y cambios de terceros; inspecciona `git status` antes de modificar cuando Git esté disponible.
- No elimines ni reescribas código existente por el solo hecho de aplicar la plantilla.
- Al terminar trabajo aprobado, actualiza `FASES.md`, `ESTADO_PROYECTO.md` y documentos vinculados, sin adelantar estados de fases no aprobadas.

## Skill de diseño visual (Fase 2)
Cuando la Fase 2 sea autorizada, utiliza `SKILL.md` (visual-system-designer, incorporado en la raíz por el usuario; si cambia de ubicación, búscalo antes de continuar) para crear un prototipo navegable con datos sintéticos, verificarlo y solicitar aprobación visual. No desarrolles backend ni datos reales por inferencia. Si no hay navegador/Playwright accesible, informa la limitación.

## GitHub Spec Kit
Usa la metodología de Spec Kit **solo si está instalada o el usuario autoriza su instalación**. Detecta su estructura y comandos existentes; no inventes comandos ni sobrescribas su configuración. Guarda especificaciones vinculadas a cada fase en `specs/` o en el directorio que establezca la herramienta.

## Resultado de cada tarea
Informa: fase, objetivo, trabajo hecho, archivos cambiados, pruebas ejecutadas (y no ejecutadas), riesgos/bloqueos y siguiente paso que requiere aprobación.

## Sincronización con GitHub — instrucción del usuario
- Todos los cambios autorizados de inventarioTI2 deben quedar actualizados en `amsotov/inventarioTI2` en GitHub, incluida la documentación.
- Al terminar cada tarea, revisa las diferencias, ejecuta las verificaciones pertinentes, crea el commit y sube los cambios a la rama correspondiente; comprueba el SHA remoto antes de confirmar la entrega. No dejes el resultado únicamente local.
- Preserva trabajo de terceros e integra cambios remotos sin forzar el historial. Si la sincronización queda bloqueada, informa el motivo y conserva los cambios.
- Respeta la privacidad del correo de autoría: si GitHub exige protección de correo, usa la dirección `noreply` verificada de la cuenta correspondiente; no desactives esa protección ni publiques el correo privado.
- Esta autorización de sincronización no inicia nuevas fases ni autoriza despliegues, producción o publicación del sitio. Cada fase conserva su aprobación independiente.


## Modernización — instrucción del usuario de 2026-11-03

- Para el ciclo de migración leer `prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md`, `docs/migracion/` e `INICIAR_EN_CODEX.md`. Mantener separado su control de fases del desarrollo histórico 0–15.
- M7-A01 «apruebo fase 6 inicia fase 7» acepta la entrega parcial F6 y autoriza F7 visual/interacción. Leer docs/migracion/07_ADAPTACION_VISUAL.md. Integración/escrituras SQL Server siguen bloqueadas; no afirmar destino terminado ni iniciar F8, desplegar o aplicar SQL por inferencia.
- El usuario ratificó: «de aquí en adelante guarda todo github los cambios realizados». Sincronizar todos los cambios autorizados, incluida documentación, en rama dedicada y verificar SHA remoto. No implica merge, despliegue, envío real ni producción; main tiene despliegue automático de demo y no se actualiza por inferencia.
- La Fase 2 de migración es trazabilidad, no UX/UI. Las instrucciones históricas de diseño visual se aplican a su fase de diseño correspondiente cuando esté autorizada.

- M5-A02: destino SQL Server 2016 (13.x), compatibility_level 130; edición/SP/CU/collation/instancia siguen pendientes. Pruebas iniciales en proyecto Supabase/PostgreSQL aislado inventarioTI2 con datos sintéticos; no usar inventarioTI como sustituto. No asumir soporte de collations UTF-8 en 2016 ni validar SQL Server mediante PostgreSQL. El proyecto de pruebas debe estar visible/identificado antes de cargas; no crear recursos con costo ni cambiar permisos por inferencia. Esta aclaración no aprueba Fase 5 ni inicia Fase 6.

- M5-A03: usuario autorizó crear inventarioTI2 en Supabase y eligió sovicl, región São Paulo (sa-east-1). No pedir otra vez permiso de creación/organización/región. Un intento fue rechazado por cuota de dos proyectos Free activos; NO CREADO. Tras cupo disponible comprobar duplicados y reintentar. Pausar/eliminar otros proyectos o cambiar facturación requiere autorización específica; no crear organizaciones/ramas alternativas para eludir el límite. No inicia Fase 6 ni habilita el DDL SQL Server.

- M5-A04: usuario «pausa inventarioTI». Se verificó el objetivo, se pausó hasta INACTIVE y se creó inventarioTI2 en sovicl/sa-east-1 con la autorización anterior. Proyecto nuevo ref yhsfotxhaptinjtmrinn, ACTIVE_HEALTHY; SELECT de metadatos PostgreSQL 17.11/UTC, cero tablas de aplicación. No repetir pausa/creación ni pedir nuevamente esas autorizaciones. No reactivar el anterior por inferencia (el cupo se usa por el nuevo); no implica carga, aplicación de SQL Server, facturación, fase siguiente o despliegue.

- M5-A05: se retomó Fase 5 y se instaló exclusivamente baseline existente PostgreSQL en inventarioTI2/yhsfotxhaptinjtmrinn: 10 migraciones remotas (8 copias adaptadas + 2 ACL), 19 tablas/155 columnas, semilla sintética y 20 casos SQL con rollback. Fuentes originales inmutables. No reejecutar seed/DDL a ciegas, no redirigir fixtures locales al remoto ni activar LOGIN/worker para el ensayo. No equivale a SQL Server, HTTP/Auth real/UI o inicio de Fase 6. Registros en docs/migracion/VALIDACION_SUPABASE.md y migrations/supabase-pruebas/manifest.json.

## M6-A01/A02/A03 — continuidad vigente

M6-A01 acepta F5/inicia F6; las notas M5 conservan sus estados históricos. M6-A02 aprueba conservar Supabase Auth sin duplicar hashes, hash externo nullable y soporte complementario existente; M6-A03 aprueba NVARCHAR e instantes operativos DATETIME2(7)/SYSUTCDATETIME, conservando DATE/NULL histórico separado. No volver a pedir esas aprobaciones. No ratifican correspondencias reales de cuentas, todas las reglas de subtipos/perfiles/bajas ni collation/longitudes.

F6 adapta repositorio actual y frontera v2 por inyección. main usa PostgreSQL; SQL Server no se puede activar, no hay escrituras ni soporte físico de destino completo. Conservar barreras y no aparentar transacciones entre motores. M7-A01 acepta el incremento parcial F6 y autoriza F7; los criterios de implementación/integración pendientes se conservan abiertos, no se declaran cumplidos. F8 no autorizada. Verificación vigente: `python3 docs/migracion/verificar_fase6.py`; `--evaluar-aplicacion` debe devolver 3. Los verificadores F1–F5 conservan precondiciones históricas y se ejecutan sobre sus commits, no se alteran para ocultar cambios autorizados. Fuentes/modelo/prototipo y evidencia histórica preservados por hashes. No ejecutar seed/DDL remoto nuevamente ni reactivar inventarioTI por inferencia.

## M7-A01 — continuidad vigente

Usuario «apruebo fase 6 inicia fase 7» acepta commit 1d7fac0 como entrega parcial. No pedir nuevamente permiso de F7 ni M6-A02/A03. F7 interfaz EN_REVISION; F8 no autorizada. Aceptación de fase no ratifica reglas M1-D ni completa backend/SQL Server. Los dobles de persistencia v2 viven exclusivamente en tests/helpers/model.ts; nunca registrarlos en main, usar datos v1 como respuesta v2 o presentarlos como integración del destino.

M7-C01 añade siete atributos opcionales a la ficha de lectura; no cambia schemas requeridos o contratos de escritura. Una edición completa necesita todos los atributos presentes y ETag válido, sin inventar vacíos. Conservar protección de resultado incierto, clave/carga/versión estables y autorización en cada petición. Reportes/perfiles actuales se conservan en v1; no mezclar cifras con el nuevo modelo ni inventar catálogo/política de perfiles.

Verificador vigente: `python3 docs/migracion/verificar_fase7.py`; `--evaluar-integracion` debe devolver 3 por destino bloqueado. Verificadores y evidencia F1–F6 son históricos y se revisan en sus commits. Los ensayos UI/ops antiguos escriben en rutas históricas: conservar originales y archivar resultados nuevos por fase. Usar contenedores locales sintéticos y suficiente espacio; no ejecutar ensayos del navegador del mismo puerto concurrentemente. Sin despliegue, merge a main, permisos remotos o reactivación de inventarioTI.

## M8-A01 — continuidad vigente (sustituye estados anteriores de autorización)

Usuario «Apruebo fase 7 inicia fase 8» acepta daea7d2 como entrega visual parcial e inicia exclusivamente seguridad/auditoría/regresión. [Informe F8](docs/migracion/08_SEGURIDAD_REGRESION.md), [matriz](docs/migracion/08_MATRIZ_PRUEBAS.csv). F8 EN_REVISION_CON_BLOQUEOS; F9 no autorizada. No pedir otra vez aprobación de inicio F8 ni M6-A02/A03. Backend normalizado/vínculo funcionario/perfiles/SQL Server siguen pendientes, aunque F7 haya sido aceptada.

Corregidos UUID semánticos y HTTP 400 de parser. GoTrue+BFF+PG reales solo en ensayo local; doble de persistencia v2 exclusivamente en tests. M8-R01: Auth remoto permite signup; comprobación FALLIDA, propuesta no aplicada. Conector sin operación de configuración Auth; no eludir por SQL ni pedir secretos. Cambios sensibles remotos conservan autorización específica; aceptar F8/F9 no la infiere. Auditoría remota sin mutaciones, inventarioTI permanece pausado.

Verificador vigente: `python3 docs/migracion/verificar_fase8.py`; `--evaluar-liberacion` sale 3 con bloqueos. Evidencia F1–F7 y fuentes preservadas; scripts antiguos para sus commits. Archivar resultados nuevos y restaurar salidas históricas de suites. Cuatro SQL idénticos a F6, THROW intactos. Rama dedicada con SHA remoto comprobado, main/merge/despliegue/producción sin autorización. No ejecutar contenedores grandes en paralelo ni hacer limpieza global de Docker.
