# FASE 9 — Documentación y preparación de despliegue

**Estado: EN_REVISION_DOCUMENTAL. Liberación del modelo de destino: NO_GO / BLOQUEADA.**

M9-A01: usuario «Apruebo fase 8 inicia fase 9». Base aceptada: `e224d6f3a15d09899eba2c6a908548eef73014e8`. Acepta la auditoría F8 con pendientes declarados; no cierra M8-R01 ni implementa el destino. Fecha documental: 2026-11-03, America/Santiago; evidencia de ejecución con instantes UTC del 2026-11-04.

## Objetivo, plan y alcance

Preparar una entrega que otra persona pueda revisar y retomar: continuidad de instrucciones y fases; índice de evidencia; compatibilidades y decisiones abiertas; paquete de preparación; puertas de liberación; despliegue/rollback por escenario. Se conserva la aplicación existente y toda su evidencia. No se instala Spec Kit, cambia código, workflow, dependencia o esquema físico. No se realizan consultas al proyecto Supabase, DDL/DML, configuración Auth, migración de datos, envíos, provisión, PR, merge a main o despliegue.

Plan ejecutado: comprobar base Git/GitHub e instrucciones; revisar F1/F3/F4/F5/F6/F7/F8 y procedimientos operativos; registrar compatibilidades/bloqueos; actualizar documentos rectores y guías; verificar hashes, vínculos, trazabilidad de pendientes y negativa de liberación; sincronizar en `migracion/fase9-documentacion-despliegue` y comprobar SHA remoto/local. Codex prepara/verifica; el usuario acepta la entrega documental. Operador, suplente y autorizador de operación futura siguen sin designar.

## Documentación realmente revisada

AGENTS, ambos prompts, FASES, ESTADO, README e INICIAR; índice de migración, decisiones F1, línea base F2, contratos F3, reconciliación/puertas F4, entornos y manifiestos F5, cobertura backend F6, visual F7 y seguridad F8. También DESPLIEGUE, RUNBOOK_OPERACION, CHECKLIST_LIBERACION, SEGURIDAD, AUTENTICACION, PRUEBAS, specs y CHANGELOG. Se contrastaron `.env.example`, package/lock, main, selector de motor, worker y ambos workflows. ER/DER/diccionario, prototipos y todas las evidencias F1–F8 quedan conservados por hash; no se reinterpreta su diseño ni se usan como fuente operacional.

Se aplicaron instrucciones cloud y Supabase para documentación/seguridad de operación. Changelog y guías oficiales de configuración Auth y backup/restore consultados sin credenciales. El procedimiento oficial puede incluir operaciones de administración, reset o desactivación de triggers: no se copian como órdenes aplicables a esta instalación ni se ejecutan. Las fuentes/versiones consultadas quedan en [fuentes](evidencias/fase9/fuentes.json).

## Entregables y compatibilidades

| Entregable | Uso |
| --- | --- |
| [Compatibilidades](09_COMPATIBILIDADES.csv) | Motor/runtime, Unicode/UTC, identidad, UUID, UI/API, reportes, TLS, CI y sus límites |
| [Pendientes](09_PENDIENTES.csv) | Acción de cierre, dependencia, responsable por designar/rol propuesto, evidencia y autorización aplicable |
| [Puertas de liberación](09_PUERTAS_LIBERACION.csv) | Estado actual y condición verificable de cada puerta; documentación aprobable separada de operación bloqueada |
| [Manifiesto de preparación](09_MANIFIESTO_PREPARACION.json) | Fuente/versiones, componentes del paquete futuro, configuración sin valores y operaciones no autorizadas; no es un artefacto desplegable |
| [Guía de despliegue](../DESPLIEGUE.md#migración-fase-9--preparación-vigente) | Secuencia futura por motor y destino, build/paquete, configuración, migraciones y smoke |
| [Rollback y recuperación](../RUNBOOK_OPERACION.md#migración-fase-9--corte-y-retorno) | Retorno antes/después de escrituras nuevas, evidencias, RPO/RTO, identidad y efectos externos |
| [Checklist vigente](../CHECKLIST_LIBERACION.md#migración-fase-9--control-vigente) | Registro futuro de SHA/entorno/ventana/operadores/permiso; no habilita operación |
| [Pruebas de esta fase](evidencias/fase9/pruebas.json) | Controles documentales nuevos y evidencia funcional F8 referenciada como histórica |

Se conservan React/Fastify, Auth/MFA, seguridad por rol SQL, PostgreSQL actual, interfaz, reportes Excel/PDF, historia/idempotencia/outbox y contratos legítimos. Los 18 contratos v2 tienen frontera y 17 recorridos visuales; la persistencia normalizada está incompleta, main no registra v2 y `sqlserver2016` cierra el inicio. No se crea un adaptador PostgreSQL del modelo de 30 tablas ni transacción entre motores por inferencia.

M6-A02/A03 siguen aprobadas: Auth externo sin duplicar hashes; soporte complementario; Unicode y UTC con historia DATE/NULL separada. Los cuatro SQL candidatos permanecen idénticos a F6, con THROW, sin entorno autorizado. Metadata de continuidad `0.6.0-review.4`, sin nueva versión funcional. 30 tablas/117 campos del núcleo no bastan para sustituir 19 tablas/155 columnas actuales y su soporte.

## Hallazgos y pendientes conservados

**M9-R01, discrepancia de preparación:** package.json exige Node >=24 <25 y verify.yml usa 24.19.0; deploy-demo.yml declara Node 20. Se registra incompatibilidad con el runtime declarado, sin afirmar una ejecución fallida de ese workflow. Corregirlo y verificar su ejecución requiere alcance posterior; no se modifica ahora. Main dispara ese deploy automáticamente y no se debe usar como rama de documentación. El CI de verificación se dispara en PR/push a main, no por publicar esta rama; no se atribuye PASS remoto al SHA de F9.

**M8-R01 abierta:** la auditoría F8 observó `disable_signup:false`. Su comprobación de política es FALLIDA; asesores sin avisos no la cierran. La [propuesta Auth](08_CONFIGURACION_AUTH_PROPUESTA.json) está sin aplicar; el conector disponible no configura Auth y el entorno no aporta credenciales de administración. F9 no vuelve a consultar settings ni afirma su estado actual en tiempo real. Corregir y revalidar exige capacidad y autorización específica de configuración; no pedir claves en chat ni eludir por SQL interno.

Persisten falta de instancia/edición/SP/CU/collation SQL Server 2016/130, soporte físico/repositorios/escrituras de destino, vínculo real USUARIOS–FUNCIONARIOS, perfiles múltiples, reglas tipo/subtipo/situación/baja, datos de impresión, longitudes/unicidad/transformaciones y Excel operacional. M1-D04/05 no autorizan inventar ubicación o funcionario para equipos compartidos. Las aprobaciones de fase no resuelven esas decisiones. F1-SEG-01/02/03 conservan legal/retención, presupuesto de nuevos recursos y operación/custodia/alertas pendientes; organización/región del laboratorio ya están aprobadas y no se vuelven a preguntar.

## Evidencia y verificaciones

Antes de editar, se ejecutó el verificador F8 sobre la exportación exacta del commit aceptado: APROBADA; su evaluación de liberación devolvió 3 como estaba previsto. [Resultado conservado](evidencias/fase9/base_f8_verificacion.json). Las 280 pruebas Node de F8 (219 backend/seguridad, 57 UI, 4 operación), compilación, carga, npm audit y heurística son resultados históricos de F8, sin repetirlos ni contarlos como nuevos en F9. Se conservan hashes de todo el código, lock y evidencia funcional; los cambios de esta fase son documentales y su verificador.

Verificación nueva: `python3 docs/migracion/verificar_fase9.py`. Comprueba integridad, archivos permitidos, enlaces locales nuevos, matrices, pendientes y puertas, manifiesto sin secretos, cuatro SQL/columnas originales, límites de autorización y evidencia heredada. `--evaluar-liberacion` **debe devolver 3**: salida documental aprobada no significa despliegue permitido. Una búsqueda heurística comprueba las cinco familias históricas en los archivos de entrega sin imprimir valores. No es certificación universal de secretos. `git diff --check` y comparación GitHub de rutas/ascendencia completan la entrega.

**BLOQUEADAS:** integración/ensayos/carga/rollback SQL Server y operación gestionada sin prerrequisitos. **NO EJECUTADAS:** nuevas suites dinámicas, CI remoto de esta rama, creación de release/binario, login/MFA positivo gestionado, configuración Auth, backup externo/restore gestionado, envío externo, corte o reapertura. No se reutiliza una duración local como RTO real ni PG como prueba de SQL Server.

## Decisión de salida y continuidad

La documentación queda **EN_REVISION**; la liberación del modelo de destino sigue **NO_GO**. Se entrega un plan revisable, con pendientes explícitos, y se espera aceptación del usuario. No marcar F9 COMPLETADA antes de aceptación documental. Aceptar este paquete no autoriza corregir permisos remotos, ejecutar SQL, fusionar, desplegar, usar datos reales o retirar barreras.

El prompt de migración define fases 0–9: no existe una Fase 10 definida. Tras aceptar F9, el siguiente trabajo debe acordarse por alcance concreto: cierre de pendientes, implementación/ensayos del destino o remediación de configuración. La pregunta de cierre del prompt no constituye por sí sola permiso de producción ni crea una nueva fase. El ciclo histórico 0–15 conserva su control independiente.
