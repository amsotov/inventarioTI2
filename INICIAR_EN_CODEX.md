# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

Migración Fases 0 y 1 COMPLETADAS por aprobación del usuario. Fase 2 EN_REVISION: línea base, trazabilidad y mapeo preparados. Fase 3 NO AUTORIZADA. Las 16 decisiones de diseño conservan sus condiciones de datos/aprobación específica; no se aplicaron cambios. No ejecutar SQL, modificar esquema/datos/aplicación ni convertir recomendaciones en decisiones aprobadas.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Consultar el mensaje vigente del usuario y las decisiones aprobadas posteriores; no volver a pedir una autorización ya otorgada. Conservar fases históricas y garantías existentes. La Fase 2 ya fue autorizada y entregada; no volver a pedir su inicio. Si se aprueba Fase 3, iniciar únicamente propuesta visual y de contratos, sin implementar. Aplicar las instrucciones visuales cuando correspondan al diseño autorizado, sin confundir numeración histórica.

Lectura adicional: [matriz de Fase 2](docs/migracion/02_MATRIZ_TRAZABILIDAD.md), [mapeo](docs/migracion/02_MAPEO_ESQUEMAS.md) y [línea base](docs/migracion/02_LINEA_BASE_FUNCIONAL.md).

Verificación documental vigente: `python3 docs/migracion/verificar_fase2.py`. La verificación de Fase 1 conserva evidencia de su entrega original. No abre conexiones ni ejecuta SQL. Las pruebas funcionales no se han repetido en esta fase.

Todos los cambios autorizados deben quedar en GitHub, incluidos informes y estado. Usar rama dedicada; cotejar remoto antes de entregar. No fusionar a main por inferencia: su workflow publica la demo automáticamente. No se autorizan despliegues, envíos, gastos, producción ni cambios de permisos por esta guía.
