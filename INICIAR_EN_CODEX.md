# Continuidad de modernización inventarioTI2

Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

**Migración FASES 0–5: aceptadas. Entrega parcial FASE 6: ACEPTADA por el usuario, con persistencia/integración de destino pendientes. FASE 7: EN_REVISION visual. FASE 8: NO AUTORIZADA.**

M7-A01: «apruebo fase 6 inicia fase 7» acepta `1d7fac0` y autoriza adaptar la interfaz. [Informe F7](docs/migracion/07_ADAPTACION_VISUAL.md), [cobertura](docs/migracion/07_COBERTURA_VISUAL.csv), [pruebas](docs/migracion/evidencias/fase7/pruebas.json) y [capturas](docs/migracion/evidencias/fase7/navegador.json). No convierte los pendientes de F6 en implementación terminada.

React mantiene su diseño, Auth, rutas y reportes actuales; se añade Equipos y relaciones con cliente v2, catálogos, ficha técnica por tipo, historia, mantenciones, funcionarios y pertenencias. Carga/vacío/error/sin permiso/conflicto/reintento, UUID/ETag/CSRF y campos completos antes de editar. M7-C01 amplía opcionalmente siete campos de la respuesta de ficha para evitar perder datos al editar. Main conserva PostgreSQL y no registra v2: el módulo muestra todavía no habilitado cuando falta backend. Los recorridos positivos usan BFF/Auth/RLS PG reales con repositorio v2 doble; no son SQL Server.

Persistencia/escrituras/soporte, instancia/edición/SP/CU/collation SQL Server 2016/130, reglas M1-D y reportes/perfiles de destino siguen pendientes. Los cuatro SQL candidatos permanecen idénticos a F6, bloqueados por THROW; revisión de metadata 0.6.0-review.2. M6-A02/A03 (Auth/soporte, Unicode/UTC) siguen aprobadas. Supabase inventarioTI2 conserva su baseline sintética y no se modifica en F7; inventarioTI permanece pausado. Sin datos reales, main/merge/despliegue, correo externo o producción. F1-SEG y ciclo histórico 0–15 separados; estados posteriores anteriores son historia. Verificador vigente: `python3 docs/migracion/verificar_fase7.py`.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Revisar F7 [informe](docs/migracion/07_ADAPTACION_VISUAL.md), [cobertura](docs/migracion/07_COBERTURA_VISUAL.csv), [pruebas](docs/migracion/evidencias/fase7/pruebas.json), [navegador](docs/migracion/evidencias/fase7/navegador.json) y [linaje](docs/migracion/evidencias/fase7/linaje.json). M7-A01 ya acepta la entrega parcial F6 y autoriza F7; no repetir aprobación. Registrar feedback visual o continuar solo el alcance autorizado. F8 necesita autorización nueva.

Verificación vigente: `python3 docs/migracion/verificar_fase7.py`; `--evaluar-integracion` sale 3 porque SQL Server sigue bloqueado. Los scripts F1–F6 y sus hashes corresponden a sus commits aceptados. No reescribir evidencia antigua para simular que pasa sobre código posterior. Build/npm test/test:ops/test:ui/audit y demo con fuentes actuales se detallan en pruebas.json. UI usa fixture local en 4317/4318; no ejecutar dos ensayos iguales a la vez. Guardar resultados nuevos en F7 y restaurar las rutas de evidencia histórica que escriben las suites anteriores.

La app actual funciona con su composición PostgreSQL existente; main no registra backend v2. #modelo/equipos muestra todavía no habilitado en esa composición. El recorrido positivo se reproduce por el fixture de tests/ui/model.test.ts (BFF/Auth/RLS PG reales, persistencia v2 doble); no copiar ese doble a producción. Client v2 nunca usa respuestas v1 ni inventa éxitos.

Antes de integrar destino: instancia/edición/SP/CU/collation SQL Server 2016/130, soporte/repositorios completos, reglas M1-D y fuentes autorizadas de perfilado/carga. M6-A02/A03 ya aprobaron Auth/soporte y Unicode/UTC. M7-C01 extiende opcionalmente la ficha de lectura, no implementa persistencia. No habilitar SQL ni retirar THROW por aceptar interfaz.

Supabase inventarioTI2/yhsfotxhaptinjtmrinn, sovicl/sa-east-1, ya contiene baseline sintética de F5. No repetir DDL/semilla ni pedir crear/pausar otra vez; inventarioTI permanece pausado y no se reactiva por inferencia. F7 no modificó proyectos remotos ni facturación.

Sincronizar todos los cambios autorizados en GitHub, rama dedicada y SHA comprobado. No main/merge: su workflow despliega demo. Sin despliegues, envíos, gastos o producción por esta guía. Conservar fuentes y F1-SEG; el ciclo histórico 0–15 está separado.
