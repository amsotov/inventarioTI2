# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

Migración Fases 0–4 COMPLETADAS por aprobación del usuario. Fase 5 EN_REVISION como candidato SQL Server bloqueado; ensayos de motor pendientes de diseño/entorno autorizado. Fase 6 NO AUTORIZADA. M5-A02 confirma SQL Server 2016/13.x/nivel 130 y Supabase/PostgreSQL inventarioTI2 para pruebas sintéticas; ese proyecto no aparece en la conexión y no se usará inventarioTI como sustituto. No hay fuente operacional ni perfilado real.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Consultar el mensaje vigente y las decisiones aprobadas posteriores; no pedir autorizaciones ya otorgadas. Fase 5 ya fue autorizada: revisar [candidato](docs/migracion/05_ESQUEMA_SQLSERVER.md), [manifest](migrations/sqlserver/manifest.json), CHECK y soporte. Verificar sin DB: `python3 docs/migracion/verificar_fase5.py`; parser opcional `--analizar-sintaxis` en venv externo con SQLFluff 3.5.0. `--evaluar-aplicacion` debe bloquear (salida 3). No retirar THROW ni elegir alternativas pendientes por inferencia; emitir versión habilitada solo después de resolver diseño y autorizar entorno/operación. Fase 6 requiere aprobación nueva. La ausencia de datos reales bloquea perfilado/carga, no revisión estática.

Lectura de continuación: [entornos y compatibilidad 130](docs/migracion/05_ENTORNOS_COMPATIBILIDAD.md). No volver a preguntar versión/nivel o nombre del proyecto ya confirmados. Falta hacer visible inventarioTI2 en la conexión; no crear recursos o cambiar permisos por inferencia. Edición/collation/instancia SQL Server y decisiones siguen pendientes. Parser opcional con `--dotnet-bin /ruta/dotnet --scriptdom-dll /ruta/ScriptDom130.dll` junto a la verificación estándar.

Lectura adicional: [matriz de Fase 2](docs/migracion/02_MATRIZ_TRAZABILIDAD.md), [mapeo](docs/migracion/02_MAPEO_ESQUEMAS.md) y [línea base](docs/migracion/02_LINEA_BASE_FUNCIONAL.md).

Lectura vigente: [impacto](docs/migracion/03_IMPACTO_FRONTEND_API.md), [visual](docs/migracion/03_DISENO_VISUAL.md). Lectura actual: [plan ETL](docs/migracion/04_PLAN_ETL.md), [excepciones](docs/migracion/04_EXCEPCIONES_DATOS.md), [reconciliación](docs/migracion/04_RECONCILIACION_ROLLBACK.md). Verificación del plan anterior: `python3 docs/migracion/verificar_fase4.py`. Verificación vigente del candidato: `python3 docs/migracion/verificar_fase5.py`. Ensayo de maqueta: `python3 docs/migracion/evidencias/fase3/verificar_prototipo.py`. La verificación de Fase 1 conserva evidencia de su entrega original. No abre conexiones ni ejecuta SQL. Las pruebas funcionales no se han repetido en esta fase.

Todos los cambios autorizados deben quedar en GitHub, incluidos informes y estado. Usar rama dedicada; cotejar remoto antes de entregar. No fusionar a main por inferencia: su workflow publica la demo automáticamente. No se autorizan despliegues, envíos, gastos, producción ni cambios de permisos por esta guía.
