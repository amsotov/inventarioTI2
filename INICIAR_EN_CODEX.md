# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

Migración Fases 0–2 COMPLETADAS por aprobación del usuario. Fase 3 EN_REVISION: diseño visual/contratos y maqueta documental preparados. Fase 4 NO AUTORIZADA. No ejecutar SQL, modificar aplicación/esquema/datos ni aplicar decisiones condicionadas por inferencia.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Consultar el mensaje vigente del usuario y las decisiones aprobadas posteriores; no volver a pedir una autorización ya otorgada. Conservar fases históricas y garantías existentes. La Fase 3 ya fue autorizada y entregada; no volver a pedir su inicio. Revisar diseño/contratos y decisiones pendientes. Solo tras aprobación nueva, iniciar Fase 4: plan ETL/protección de datos, sin ejecutar migraciones.

Lectura adicional: [matriz de Fase 2](docs/migracion/02_MATRIZ_TRAZABILIDAD.md), [mapeo](docs/migracion/02_MAPEO_ESQUEMAS.md) y [línea base](docs/migracion/02_LINEA_BASE_FUNCIONAL.md).

Lectura vigente: [impacto](docs/migracion/03_IMPACTO_FRONTEND_API.md), [visual](docs/migracion/03_DISENO_VISUAL.md). Verificación documental vigente: `python3 docs/migracion/verificar_fase3.py`. Ensayo de maqueta: `python3 docs/migracion/evidencias/fase3/verificar_prototipo.py`. La verificación de Fase 1 conserva evidencia de su entrega original. No abre conexiones ni ejecuta SQL. Las pruebas funcionales no se han repetido en esta fase.

Todos los cambios autorizados deben quedar en GitHub, incluidos informes y estado. Usar rama dedicada; cotejar remoto antes de entregar. No fusionar a main por inferencia: su workflow publica la demo automáticamente. No se autorizan despliegues, envíos, gastos, producción ni cambios de permisos por esta guía.
