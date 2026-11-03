# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

Migración Fases 0–3 COMPLETADAS por aprobación del usuario. Fase 4 EN_REVISION: plan ETL/excepciones/reconciliación/rollback preparados. Fase 5 NO AUTORIZADA. No hay Excel operacional ni perfilado real. No ejecutar SQL, cargar datos o aplicar decisiones condicionadas por inferencia.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Consultar el mensaje vigente del usuario y las decisiones aprobadas posteriores; no volver a pedir una autorización ya otorgada. Conservar fases históricas y garantías existentes. La Fase 4 ya fue autorizada y entregada; no volver a pedir su inicio. Revisar plan y puertas de control. Solo tras aprobación nueva, preparar Fase 5 en alcance/entorno explícitos y resolver bloqueantes aplicables antes de ejecutar. No asumir fuente real, respaldo, diseño o permisos completos por aprobar el plan.

Lectura adicional: [matriz de Fase 2](docs/migracion/02_MATRIZ_TRAZABILIDAD.md), [mapeo](docs/migracion/02_MAPEO_ESQUEMAS.md) y [línea base](docs/migracion/02_LINEA_BASE_FUNCIONAL.md).

Lectura vigente: [impacto](docs/migracion/03_IMPACTO_FRONTEND_API.md), [visual](docs/migracion/03_DISENO_VISUAL.md). Lectura actual: [plan ETL](docs/migracion/04_PLAN_ETL.md), [excepciones](docs/migracion/04_EXCEPCIONES_DATOS.md), [reconciliación](docs/migracion/04_RECONCILIACION_ROLLBACK.md). Verificación documental vigente: `python3 docs/migracion/verificar_fase4.py`. Ensayo de maqueta: `python3 docs/migracion/evidencias/fase3/verificar_prototipo.py`. La verificación de Fase 1 conserva evidencia de su entrega original. No abre conexiones ni ejecuta SQL. Las pruebas funcionales no se han repetido en esta fase.

Todos los cambios autorizados deben quedar en GitHub, incluidos informes y estado. Usar rama dedicada; cotejar remoto antes de entregar. No fusionar a main por inferencia: su workflow publica la demo automáticamente. No se autorizan despliegues, envíos, gastos, producción ni cambios de permisos por esta guía.
