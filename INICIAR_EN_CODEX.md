# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

Migración Fase 0 COMPLETADA por aprobación del usuario. Fase 1 EN_REVISION: validación documental preparada, 16 decisiones propuestas pendientes. Fase 2 NO AUTORIZADA. No ejecutar SQL, modificar esquema/datos/aplicación ni convertir recomendaciones en decisiones aprobadas.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Consultar el mensaje vigente del usuario y las decisiones aprobadas posteriores; no volver a pedir una autorización ya otorgada. Conservar fases históricas y garantías existentes. Si se recibe aprobación de Fase 2, iniciar solo línea base y trazabilidad; no implementar ni activar el skill visual por coincidencia del número de fase.

Verificación documental: `python3 docs/migracion/verificar_fase1.py`. No abre conexiones ni ejecuta SQL. Las pruebas funcionales no se han repetido en esta fase.

Todos los cambios autorizados deben quedar en GitHub, incluidos informes y estado. Usar rama dedicada; cotejar remoto antes de entregar. No fusionar a main por inferencia: su workflow publica la demo automáticamente. No se autorizan despliegues, envíos, gastos, producción ni cambios de permisos por esta guía.
