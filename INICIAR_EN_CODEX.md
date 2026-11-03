# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

**Migración FASES 0–5: COMPLETADAS por aprobación del usuario. FASE 6: EN_PROGRESO, integración/escrituras SQL Server BLOQUEADAS. FASE 7: NO AUTORIZADA.**

M6-A01: «apruebo fase 5 inicia fase 6» acepta `27cae1f` e inicia adaptación del backend. M6-A02 aprueba conservar Supabase Auth sin hashes duplicados y soporte de UUID/sesiones/historia/idempotencia/outbox; M6-A03 aprueba NVARCHAR e instantes DATETIME2(7)/SYSUTCDATETIME sin inventar horas históricas. [Informe de avance F6](docs/migracion/06_ADAPTACION_BACKEND.md) y [pruebas](docs/migracion/evidencias/fase6/pruebas.json).

Implementados repositorio/gateway de inventario conservando v1/PostgreSQL, frontera de 18 contratos v2 por inyección, controles de autorización/transacción y dos lecturas SQL Server parametrizadas por puerto. No hay backend de escritura normalizado ni soporte físico SQL Server completo: faltan reglas de negocio, instancia/edición/SP/CU/collation y ensayos reales. v2 no se activa en main; seleccionar SQL Server falla cerrado. Candidato enmendado `0.6.0-review.1`, 30 tablas/117 campos y cuatro THROW intactos; no SQL Server ejecutado. Frontend y fuentes ER/DER/Excel intactos. No se solicita cierre ni avance de fase mientras falten sus criterios.

Entorno gestionado previamente ensayado en F5: inventarioTI2/yhsfotxhaptinjtmrinn en sovicl/São Paulo, baseline PostgreSQL 19 tablas/155 columnas y 20 casos SQL sintéticos; no repetir DDL/seed. inventarioTI permanece pausado por autorización del usuario. F6 no modifica Supabase remoto. [Verificador vigente](docs/migracion/verificar_fase6.py); evidencias y verificadores F1–F5 corresponden a sus commits históricos. Sin main/merge/despliegue ni datos reales. F1-SEG-01/02/03 y ciclo histórico 0–15 conservados; textos posteriores con estados anteriores son antecedentes.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Continuar únicamente Fase 6 ya autorizada. Leer [informe](docs/migracion/06_ADAPTACION_BACKEND.md), [enmiendas](docs/migracion/evidencias/fase6/enmiendas.json), [pruebas](docs/migracion/evidencias/fase6/pruebas.json) y [manifest](migrations/sqlserver/manifest.json). No repetir aprobaciones M6-A01/A02/A03. Resolver reglas pendientes y disponibilidad de instancia SQL Server; no pedir contraseñas ni cadenas con secretos. No confundir 18 controladores probados con persistencia normalizada implementada: hay dos lecturas por puerto, cero escrituras del destino y falta soporte físico.

Verificación estática vigente: `python3 docs/migracion/verificar_fase6.py`; `--evaluar-aplicacion` devuelve 3. Verificadores/evidencia F1–F5 deben revisarse en sus commits aceptados; F5 rechazará cambios de código/tipos expresamente autorizados en F6. No reescribir esa evidencia para simular éxito. Regresión: npm ci, npm run build, npm test, npm run test:ops, npm run test:ui y npm audit. Usar exclusivamente contenedores PostgreSQL locales sintéticos para fixtures, con espacio suficiente y sin conexión a proyectos gestionados. Los ensayos UI/ops reescriben evidencia histórica por diseño: archivarla por separado para F6 y preservar originales.

M5-A02 ya confirma destino 2016/13.x/compatibilidad 130 y proyecto inicial inventarioTI2; faltan edición/SP/CU/collation e instancia. M5-A03/A04 ya crearon inventarioTI2 en sovicl/sa-east-1 y pausaron inventarioTI: no repetir ni reactivar el anterior. M5-A05 instaló baseline existente y realizó 20 casos SQL con rollback. No repetir DDL/semilla. F6 no alteró Supabase remoto.

Todos los cambios autorizados deben quedar en GitHub, incluidos informes y estado. Usar rama dedicada y cotejar SHA remoto. No fusionar a main: su workflow publica la demo automáticamente. No se autorizan Fase 7, despliegues, envíos, gastos o producción por esta guía. F1-SEG y ciclo histórico 0–15 permanecen separados.
