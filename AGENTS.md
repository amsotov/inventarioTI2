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
- Fases 0–4 de migración aprobadas; Fase 5 autorizada por «apruebo fase 4 inicia fase 5» y entregada EN_REVISION como candidato SQL bloqueado. No iniciar Fase 6 ni aplicar SQL/cargar datos por inferencia. Resolver diseño y autorizar entorno antes de habilitar una versión; el plan ETL y la maqueta no son ejecución operacional.
- El usuario ratificó: «de aquí en adelante guarda todo github los cambios realizados». Sincronizar todos los cambios autorizados, incluida documentación, en rama dedicada y verificar SHA remoto. No implica merge, despliegue, envío real ni producción; main tiene despliegue automático de demo y no se actualiza por inferencia.
- La Fase 2 de migración es trazabilidad, no UX/UI. Las instrucciones históricas de diseño visual se aplican a su fase de diseño correspondiente cuando esté autorizada.

- M5-A02: destino SQL Server 2016 (13.x), compatibility_level 130; edición/SP/CU/collation/instancia siguen pendientes. Pruebas iniciales en proyecto Supabase/PostgreSQL aislado inventarioTI2 con datos sintéticos; no usar inventarioTI como sustituto. No asumir soporte de collations UTF-8 en 2016 ni validar SQL Server mediante PostgreSQL. El proyecto de pruebas debe estar visible/identificado antes de cargas; no crear recursos con costo ni cambiar permisos por inferencia. Esta aclaración no aprueba Fase 5 ni inicia Fase 6.

- M5-A03: usuario autorizó crear inventarioTI2 en Supabase y eligió sovicl, región São Paulo (sa-east-1). No pedir otra vez permiso de creación/organización/región. Un intento fue rechazado por cuota de dos proyectos Free activos; NO CREADO. Tras cupo disponible comprobar duplicados y reintentar. Pausar/eliminar otros proyectos o cambiar facturación requiere autorización específica; no crear organizaciones/ramas alternativas para eludir el límite. No inicia Fase 6 ni habilita el DDL SQL Server.
