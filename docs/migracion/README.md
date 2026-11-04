# Entregables de la migración

## Estado vigente — Fase 9

M9-A01 acepta auditoría F8/inicia [preparación documental](09_PREPARACION_DESPLIEGUE.md). EN_REVISION_DOCUMENTAL; liberación NO_GO. [Compatibilidades](09_COMPATIBILIDADES.csv), [18 pendientes](09_PENDIENTES.csv), [12 puertas](09_PUERTAS_LIBERACION.csv), [manifiesto](09_MANIFIESTO_PREPARACION.json), [pruebas documentales](evidencias/fase9/pruebas.json). Guías vigentes en DESPLIEGUE/RUNBOOK/CHECKLIST; M8-R01, M9-R01 y destino pendientes. verificar_fase9.py vigente; --evaluar-liberacion sale3. Prompt termina en9: no fase posterior definida/operación autorizada. Los apartados siguientes son historia.


## Estado de entrega Fase 8 — histórico

M8-A01 acepta F7/inicia F8. [Informe](08_SEGURIDAD_REGRESION.md), [matriz](08_MATRIZ_PRUEBAS.csv), [pruebas](evidencias/fase8/pruebas.json), [propuesta Auth](08_CONFIGURACION_AUTH_PROPUESTA.json). EN_REVISION_CON_BLOQUEOS; 280 casos Node aprobados y desviación M8-R01 de autorregistro remoto FALLIDA/no corregida. Integración SQL Server/identidad empresarial/perfiles bloqueadas. F9 no autorizada. Verificador vigente verificar_fase8.py; --evaluar-liberacion sale 3. Las continuidades siguientes son registros históricos conservados.


**Estado histórico de F7:** M7-A01 acepta la entrega parcial F6 y autoriza [Fase 7 visual](07_ADAPTACION_VISUAL.md), EN_REVISION. [Cobertura](07_COBERTURA_VISUAL.csv), [pruebas](evidencias/fase7/pruebas.json), [capturas](evidencias/fase7/navegador.json). Persistencia/SQL Server continúan bloqueados; no F8. Verificador actual: `python3 docs/migracion/verificar_fase7.py`. Entregas y estados anteriores se conservan como historia.

Esta carpeta recibirá los informes y matrices generados por Codex durante las fases autorizadas del prompt en `../../prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md`.

No se han ejecutado migraciones ni pruebas al preparar este kit. No escribir datos en producción sin autorización específica.


## Entrega original de Fase 1 — 2026-11-03

- [00_DIAGNOSTICO.md](00_DIAGNOSTICO.md): Fase 0 aprobada; informe incorporado ahora con autorización.
- [01_VALIDACION_MODELO.md](01_VALIDACION_MODELO.md): Fase 1 EN_REVISION, hallazgos H01–H15.
- [01_DECISIONES_PENDIENTES.md](01_DECISIONES_PENDIENTES.md): M1-D01–M1-D16 sin aprobación implícita.
- [01_MATRIZ_CAMPOS.csv](01_MATRIZ_CAMPOS.csv): 117 campos conciliados.
- [01_RELACIONES.csv](01_RELACIONES.csv): 30 relaciones revisadas.
- [Evidencia](evidencias/fase1/verificacion.json) y [verificador documental](verificar_fase1.py).

El modelo no está habilitado para implementación. Fase 2 no autorizada. Esta numeración es independiente del desarrollo histórico. Ver [continuidad](../../INICIAR_EN_CODEX.md).


## Continuidad vigente — Fase 2

Usuario: «apruebo y inicia fase 2». Fase 1 aceptada; Fase 2 EN_REVISION; Fase 3 NO AUTORIZADA. El apartado anterior corresponde a la entrega original.

- [02_MATRIZ_TRAZABILIDAD.md](02_MATRIZ_TRAZABILIDAD.md) y [anexo CSV](02_TRAZABILIDAD.csv).
- [02_MAPEO_ESQUEMAS.md](02_MAPEO_ESQUEMAS.md), [campos actuales](02_MAPEO_ACTUAL.csv) y [destino](02_MAPEO_DESTINO.csv).
- [Línea base](02_LINEA_BASE_FUNCIONAL.md), [API](02_INVENTARIO_API.csv), [UI](02_INVENTARIO_UI.csv) y [criterios](02_CRITERIOS_REGRESION.csv).
- [Esquema actual declarado](02_ESQUEMA_ACTUAL.csv), [verificador](verificar_fase2.py) y [evidencia](evidencias/fase2/verificacion.json).

Decisiones con alternativas/datos pendientes no se resuelven automáticamente por aceptar la fase. Sin implementación, SQL ni despliegues.


## Continuidad vigente — Fase 3

Usuario acepta Fase 2 y autoriza diseño. [03_IMPACTO_FRONTEND_API.md](03_IMPACTO_FRONTEND_API.md), [03_DISENO_VISUAL.md](03_DISENO_VISUAL.md), [pantallas](03_PANTALLAS.csv), [compatibilidad](03_COMPATIBILIDAD_API.csv), [borrador v2](03_CONTRATOS_PROPUESTOS.json), [campos UI/API](03_CAMPOS_UI_API.csv) y [evidencia](evidencias/fase3/verificacion.json). Fase 3 EN_REVISION; Fase 4 NO AUTORIZADA. Apartados anteriores describen entregas previas. Sin SQL, cambios de aplicación, merge ni despliegue.


## Continuidad vigente — Fase 4

Usuario aprueba Fase 3 e inicia Fase 4. [Plan](04_PLAN_ETL.md), [excepciones](04_EXCEPCIONES_DATOS.md), [reconciliación/rollback](04_RECONCILIACION_ROLLBACK.md), [57 reglas](04_REGLAS_TRANSFORMACION.csv), [catálogo de excepciones](04_CATALOGO_EXCEPCIONES.csv), [orden](04_ORDEN_CARGA.csv), [pruebas futuras](04_PRUEBAS_RECONCILIACION.csv) y [puertas](04_PUERTAS_CONTROL.csv). [Verificador](verificar_fase4.py) y [evidencia](evidencias/fase4/verificacion.json). Fase 4 EN_REVISION; Fase 5 NO AUTORIZADA. No SQL, ETL ejecutado ni datos reales perfilados. Apartados anteriores son entregas históricas.

## Estado vigente — Fase 5

M5-A01 «apruebo fase 4 inicia fase 5» acepta `9f84fcd`; Fases 0–4 COMPLETADAS. [Fase 5](05_ESQUEMA_SQLSERVER.md) EN_REVISION; aplicación/ensayos de motor BLOQUEADOS. [SQL candidato](../../migrations/sqlserver/README.md), [CHECK](05_CHECKS_PROPUESTOS.csv), [índices](05_INDICES_PROPUESTOS.csv), [soporte 19 tablas](05_SOPORTE_ACTUAL.csv), [155 campos](05_PRESERVACION_CAMPOS.csv), [30 casos futuros](05_CASOS_SQLSERVER.csv), [verificación](evidencias/fase5/verificacion.json). Fase 6 NO AUTORIZADA. Estados anteriores son antecedentes de sus entregas; no modifican el estado vigente.

## Continuidad vigente M5-A02 — revisión 2

[Entornos/compatibilidad](05_ENTORNOS_COMPATIBILIDAD.md): pruebas iniciales Supabase/PostgreSQL inventarioTI2 (no visible), destino SQL Server 2016/13.x/nivel 130, edición/collation/instancia pendientes. Candidato 0.5.0-review.2 con [parser 130](herramientas/scriptdom130/README.md), 19 negativas y evidencia actual; [revisión inicial](evidencias/fase5/revision1/verificacion.json) histórica. Fase 5 EN_REVISION, Fase 6 NO AUTORIZADA. Sin SQL ejecutado/carga remota.

## Continuidad M5-A03 — creación autorizada y cuota

[Provisión Supabase](PROVISION_SUPABASE.md): usuario autorizó inventarioTI2 en sovicl/sa-east-1. Un intento rechazado por límite Free de dos activos; NO CREADO. [Evidencia](evidencias/fase5/provision_supabase.json). Esperar instrucción específica para liberar cupo o revisar plan/coste; no repetir permiso de creación ni sustituir otro proyecto. No cambia el esquema candidato ni inicia Fase 6.

## Continuidad M5-A04 — Supabase provisionado

[Estado actual](PROVISION_SUPABASE.md): inventarioTI pausado INACTIVE; inventarioTI2 creado ACTIVE_HEALTHY en sovicl/sa-east-1, ref yhsfotxhaptinjtmrinn, plan Free. [Evidencia](evidencias/fase5/provision_supabase_creado.json): PostgreSQL 17.11/UTC, cero tablas de aplicación. Revisión3 vincula proyecto/manifiesto y 20 negativas, sin modificar cuatro SQL. [Revisión2 histórica](evidencias/fase5/revision2/verificacion.json). Fase 5 EN_REVISION; sin instalación/carga/pruebas funcionales ni Fase 6.

## Continuidad M5-A05 — baseline existente validada

[Validación Supabase](VALIDACION_SUPABASE.md): baseline PostgreSQL 19/155, 10 migraciones (8 fuentes/2 ACL), semilla 2 unidades/3 funcionarios/6 bienes y 20 casos SQL aprobados con rollback. [Paquete trazable](../../migrations/supabase-pruebas/README.md). No es modelo SQL Server ni validación de HTTP/Auth real/UI. Fase 5 EN_REVISION; decisiones/destino/fases siguientes pendientes.

## M6-A01/A02/A03 — adaptación de backend en progreso

[Informe vigente](06_ADAPTACION_BACKEND.md), [pruebas](evidencias/fase6/pruebas.json), [enmiendas](evidencias/fase6/enmiendas.json) y [linaje](evidencias/fase6/linaje.json). Repositorio actual desacoplado; frontera 18 contratos/27 schemas; dos lecturas de catálogos SQL Server por puerto y sonda 117 columnas. Cero escrituras de destino implementadas y sin instancia real. Candidato 0.6.0-review.1 con Unicode/UTC/hash nullable, cuatro barreras intactas. No frontend, merge, deploy o cambios Supabase remoto. Continuar F6 tras reglas/soporte/instancia; F7 no autorizada.

## M7-A01 — adaptación visual para revisión

[Informe F7](07_ADAPTACION_VISUAL.md): React existente con nueva área de equipos/relaciones, cuatro fichas técnicas, historia, mantenciones y pertenencias; 17 contratos v2 usados, reportes/perfiles v1 conservados. M7-C01 extensión de lectura compatible para editar sin perder datos. Main no activa v2, prueba positiva usa persistencia doble y la ausencia de capacidad se muestra expresamente. F7 EN_REVISION; SQL Server/soporte/escrituras y reglas siguen pendientes. Sin main, merge, deploy o cambios remotos.
