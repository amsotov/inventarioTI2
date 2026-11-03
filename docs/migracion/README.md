# Entregables de la migración

**Estado vigente:** Fases 0–4 aprobadas; [Fase 5](05_ESQUEMA_SQLSERVER.md) EN_REVISION, aplicación/ensayos de motor BLOQUEADOS; Fase 6 NO AUTORIZADA. Los estados de entregas anteriores se conservan como historia.

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
