# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

**Migración FASES 0–5 aceptadas; entregas parciales F6 y F7 ACEPTADAS. FASE 8: EN_REVISION_CON_BLOQUEOS. FASE 9: NO AUTORIZADA.**

M8-A01: «Apruebo fase 7 inicia fase 8» acepta `daea7d2` y autoriza seguridad/auditoría/regresión. [Informe F8](docs/migracion/08_SEGURIDAD_REGRESION.md), [matriz](docs/migracion/08_MATRIZ_PRUEBAS.csv) y [evidencia](docs/migracion/evidencias/fase8/pruebas.json). Corrige igualdad semántica de UUID y JSON mal formado; conserva arquitectura, Auth, interfaz y contratos legítimos. Build y 280 casos Node (219 backend/seguridad, 57 UI, 4 operación) aprobados; npm audit sin avisos. Integración local real GoTrue + BFF + PG, incluida MFA/revocación y rechazo de escalada mediante user_metadata; persistencia v2 DOBLE solo en tests.

Auditoría Supabase inventarioTI2 solo lectura: RLS/ACL y roles cerrados, asesores sin avisos y semilla sin cambios. **M8-R01 ABIERTA/FALLIDA:** Auth remoto permite autorregistro (`disable_signup:false`); [corrección propuesta y revalidación](docs/migracion/08_CONFIGURACION_AUTH_PROPUESTA.json), no aplicada porque el conector no configura Auth. No se crearon cuentas ni se envió correo. inventarioTI sigue pausado.

Persistencia/escrituras/soporte normalizado, vínculo real cuenta-funcionario, perfiles, instancia/edición/SP/CU/collation SQL Server 2016/130, reglas M1-D y datos operacionales siguen BLOQUEADOS; 30 casos SQL Server sin ejecutar. M6-A02/A03 ya aprobaron Auth/soporte y Unicode/UTC. Cuatro SQL candidatos idénticos a F6 con THROW; continuidad de metadata review.3, sin entorno SQL autorizado. Main conserva PostgreSQL y no registra v2. Sin migración de datos, merge, despliegue, producción o F9 por inferencia. Ciclo histórico 0–15 separado.

Verificador vigente: `python3 docs/migracion/verificar_fase8.py`; `--evaluar-liberacion` debe salir 3. Verificadores/evidencia F1–F7 preservados para sus commits; los ensayos que escriben salidas históricas las restauran y archivan sus resultados nuevos en F8.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Leer F8 y su matriz. M8-A01 ya autoriza esta auditoría: no pedir de nuevo permiso de inicio ni M6-A02/A03. F8 se entrega para revisión con M8-R01 y las integraciones abiertas; F9 requiere aprobación explícita. No marcar como lista la migración por aceptación de una entrega parcial.

Verificador vigente: `python3 docs/migracion/verificar_fase8.py`; `--evaluar-liberacion` devuelve 3. Los scripts anteriores se verifican sobre sus commits. No reescribir evidencias históricas. Ensayos locales secuenciales con Docker/Chromium; no redirigir fixtures a proyectos remotos. Para UI/ops/carga, archivar resultados actuales en F8 y restaurar las salidas históricas.

Antes de integrar destino: instancia/edición/SP/CU/collation SQL Server 2016/130, soporte/repositorios/escrituras, reglas M1-D y fuentes operacionales. Antes de cerrar seguridad remota, resolver M8-R01 con capacidad y autorización específica de configuración; la propuesta JSON no aplica cambios. No solicitar contraseñas o claves en el chat. El conector disponible no configura Auth. Nunca usar SQL interno de Auth como sustituto.

Supabase inventarioTI2/yhsfotxhaptinjtmrinn, sovicl/sa-east-1: baseline sintética F5 conservada. No repetir DDL/semilla, activar LOGIN/worker, crear otro proyecto o reactivar inventarioTI por inferencia. La revisión F8 es solo lectura.

Sincronizar cambios autorizados en GitHub, rama dedicada y SHA comprobado. Main despliega demo: no actualizarlo, fusionar o crear despliegues por esta guía. No correos externos, gastos o producción inferidos. Mantener fuentes y F1-SEG; el ciclo histórico es independiente.
