# Continuidad de modernización inventarioTI2

## MPUB-FIX01 — corrección de la demo principal

Usuario «No está actualizado el demo» corrige la publicación solicitada en MPUB-A01. Se comprobó que la portada pública seguía en Bienes: la entrega anterior añadió revisión/prototipo, pero no activó la interfaz moderna en la demo. Se corrige dentro de la autorización de publicación existente, sin otra fase ni nueva confirmación.

La entrada demo abre ahora **Equipos y relaciones** (React implementado en F7), con catálogos, fichas, funcionarios/pertenencias, técnica por tipo, componentes, asignaciones/traspasos/historial y mantenciones sobre datos ficticios en memoria. El inventario anterior se conserva como muestra independiente. No hay HTTP/SDK/storage/DB en la simulación, no se importa el doble del backend de tests y la composición real del servidor sigue intacta. La integración empresarial SQLServer sigue pendiente.

La publicación ejecuta un ensayo Chromium de la demo moderna antes de subir el artefacto, además del CI de la rama. [Corrección y alcance](docs/DEMO_MODERNIZADA.md). Los comprobantes/estados anteriores son snapshots de sus publicaciones y se preservan.


## MPUB-A01 — publicación de modernización autorizada

Usuario: «Publica los cambios de modernización». Autoriza integrar el código aprobado en main y ejecutar la publicación estática de GitHub Pages. Se prepara PR con CI antes de integrar y se comprobará el SHA efectivo en publicacion.json y el workflow de despliegue. No repetir confirmación de esta publicación.

La demo incluye acceso a [Modernización · vista previa](https://amsotov.github.io/inventarioTI2/modernizacion/), prototipo navegable F3 y seis capturas de la interfaz F7. Se identifican como propuesta/capturas; no hay conexión a la base de destino ni dobles v2 incorporados al servidor. Se conservan Auth, datos/esquema y barreras SQL. La autorización de Pages no configura Auth, aplica SQL, habilita workers/envíos, contrata servicios o acredita operación de SQLServer. F9 documental sigue aceptada y las matrices anteriores son snapshots históricos. [Plan y verificación](docs/PUBLICACION_MODERNIZACION.md).


## M9-A02 — Fase 9 aprobada y consulta de Pages

Usuario: «Apruebo fase 9 quiero ver la publicación GitHub Pages». Acepta la entrega documental de2376a580926dadb1af363f94d3ff74f05f377d34: **FASE9 COMPLETADA_DOCUMENTAL**, con pendientes técnicos conservados. El modelo de destino sigue NO_GO; esta consulta no crea una fase10 ni pide integrar ramas o sustituir el sitio publicado.

**Publicación existente verificada:** https://amsotov.github.io/inventarioTI2/ . HTTP200 y portada React en Chromium, banner Modo demo visible, sin errores JavaScript. Último workflow de Pages observado:41648235275, success, SHA511b99d64c97ff1917f279e78490f377a3f5239a (main). No se ejecutó otro despliegue ni se modificó main. [Verificación y alcance](docs/migracion/CIERRE_FASE9_PAGES.md).

Las ramas de modernización no están publicadas en Pages. La demo utiliza datos sintéticos en memoria, sin login operativo o backend/SQLServer. Verificador F9 y evidencia se conservan como snapshot del commit aceptado2376a58; sus hashes de documentos describen esa entrega, no esta anotación posterior de aceptación. M8-R01 y prerrequisitos del destino siguen abiertos; M9-R01 conserva seguimiento del runtime para futuros paquetes, sin impedir ver la demo ya publicada. README/DEMO ya documentaban compilación estática Node20 correcta y Node24 como requisito del servidor.


Creado el 2026-11-03 durante Fase 1. No existía en la base `511b99d`.

## Punto actual

**Migración FASES0–5 aceptadas; entregas parciales F6/F7 y auditoría F8 ACEPTADAS con pendientes. FASE9: EN_REVISION_DOCUMENTAL. Liberación: NO_GO.**

M9-A01: «Apruebo fase 8 inicia fase 9» acepta `e224d6f` e inicia documentación/preparación. [Informe F9](docs/migracion/09_PREPARACION_DESPLIEGUE.md), [compatibilidades](docs/migracion/09_COMPATIBILIDADES.csv), [pendientes](docs/migracion/09_PENDIENTES.csv), [puertas](docs/migracion/09_PUERTAS_LIBERACION.csv) y [manifiesto](docs/migracion/09_MANIFIESTO_PREPARACION.json). Guías vigentes en DESPLIEGUE, RUNBOOK y CHECKLIST. Código, workflows, fuentes ER/DER/Excel, cuatro SQL físicos y evidencia F1–F8 preservados. Solo cambia documentación, verificador y metadata de continuidad SQL review.4.

Las 280 pruebas Node F8 son evidencia histórica aprobada (219 backend/seguridad, 57 UI, 4 operación), no suites repetidas en F9. Verificación nueva documental/linaje/enlaces/matrices y rechazo de liberación; no hay release construido ni CI remoto aprobado de esta rama. M8-R01 sigue abierta: F8 observó autorregistro remoto habilitado, propuesta sin aplicar. M9-R01 registra Node20 en workflow demo frente a Node24 declarado; no se modifica ni ejecuta. Supabase inventarioTI2 mantiene su referencia de laboratorio; F9 no consulta ni cambia proyectos y no reactiva inventarioTI.

SQLServer2016/13.x/130 sigue bloqueado por instancia/edición/SP/CU/collation, soporte/repositorios/escrituras, reglas M1-D, vínculo real cuenta-funcionario/perfiles y fuentes operacionales. M6-A02/A03 Auth/soporte y Unicode/UTC ya aprobadas; no se vuelven a solicitar. Main usa PG y no registra v2; los dobles permanecen en tests. Datos reales, permisos remotos, ejecución SQL, main/merge, despliegue, gastos y correo requieren su alcance/autorización independiente.

Verificador vigente: `python3 docs/migracion/verificar_fase9.py`; `--evaluar-liberacion` devuelve3. Scripts/evidencias F1–F8 son históricos para sus commits. El prompt de migración termina en9; no hay Fase10 definida ni siguiente operación autorizada. El ciclo histórico0–15 conserva sus estados independientes. F9 pendiente de aceptación documental expresa.

## Lectura obligatoria

1. [AGENTS](AGENTS.md), [FASES](FASES.md), [ESTADO](ESTADO_PROYECTO.md), [README](README.md).
2. [Prompt de migración](prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md).
3. [Diagnóstico aprobado](docs/migracion/00_DIAGNOSTICO.md), [validación](docs/migracion/01_VALIDACION_MODELO.md), [decisiones pendientes](docs/migracion/01_DECISIONES_PENDIENTES.md).
4. ER, DER y diccionario originales en [docs/modelo-datos](docs/modelo-datos/), y requisitos/decisiones históricas citados en los informes.

## Trabajo permitido al retomar

Revisar F9, matrices, manifiesto, DESPLIEGUE/RUNBOOK/CHECKLIST y evidencia de integridad. M9-A01 ya autoriza la preparación documental: no pedir otra vez inicio F9 ni M6-A02/A03. F9 EN_REVISION_DOCUMENTAL, aceptación pendiente; liberación NO_GO. El ciclo termina en9, sin fase10 ni autorización implícita de operaciones. Tras aceptación acordar alcance concreto del cierre de pendientes.

Verificar con `python3 docs/migracion/verificar_fase9.py`; `--evaluar-liberacion` debe salir3. Los verificadores previos corresponden a sus commits, incluyendo F8/e224d6f; no reescribir evidencia para pasar sobre versiones posteriores. Suites que regeneran evidencia histórica deben ejecutarse en copias aisladas, archivando resultados nuevos y restaurando originales. F9 no repitió las 280 pruebas F8 porque no cambia aplicación/SQL/workflows/dependencias.

M8-R01 no tiene evidencia de corrección; la propuesta Auth no aplica cambios. M9-R01 registra workflow demo Node20 incompatible con Node24 declarado. Antes de operaciones: SQLServer2016/130/instancia/edición/SP/CU/collation, soporte/repositorios/escrituras, vínculo/perfiles/reglas, fuente operacional, RLS/seguridad, backup/restore/CI/paquete/proxy y responsables. Ver 09_PENDIENTES.csv y09_PUERTAS_LIBERACION.csv. No pedir secretos en chat ni usar SQL interno Auth para eludir falta de herramienta.

Laboratorio ya aprobado: inventarioTI2/yhsfotxhaptinjtmrinn, sovicl/sa-east-1, baseline PG de F5 y datos sintéticos; F8 auditó sin mutar, F9 no consultó proyectos. No repetir DDL/semilla ni crear otro recurso o reactivar inventarioTI por inferencia. Nunca redirigir fixtures locales con roles/reset al gestionado. Los cuatro SQL candidatos siguen con THROW; no retirarlo ni usar en PostgreSQL.

Guardar cambios autorizados en GitHub, rama dedicada con SHA remoto verificado. Main dispara demo; no merge, PR o workflow manual por esta guía. No migrar datos, enviar correo, contratar, desplegar, cambiar configuración sensible o producir por aceptar documentos. Ciclo histórico0–15 separado.
