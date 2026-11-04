# Checklist de liberación — Fase 14

> Control vigente de modernización: [F9](#migración-fase-9--control-vigente), M9-A01. Documentación EN_REVISION; despliegue NO_GO. El checklist histórico siguiente mantiene su alcance original.

2026-11-02 · **NO-GO a producción**. Preparación EN_REVISION, aceptación CA14-06 pendiente. No es una orden de desplegar. [Plan](DESPLIEGUE.md) · [Runbook](RUNBOOK_OPERACION.md).

Cada fila exige estado PASS/FAIL/BLOCKED/NOT_EXECUTED, UTC, responsable y evidencia del **SHA y destino concretos**. Pendiente o FAIL bloquea esa promoción. Propuestas no son aprobaciones.

| Puerta | Evidencia exigida | Estado actual |
|---|---|---|
| Alcance/destino | Proyecto/origen/ambiente y permiso aplicable | Fase 14 local autorizada D-37; destino gestionado sin aprobar; producción NO AUTORIZADA |
| F1-SEG-01 | Responsable/política legal y retención de datos/logs, región/tratamiento | BLOCKED antes de datos reales |
| F1-SEG-02 | Tope/moneda/cotización/capacidad/proveedores autorizados | BLOCKED; estimación histórica no aprueba gasto |
| F1-SEG-03 | Operador/suplente, horario UTC, almacén externo, claves, alertas/canal/cobertura | BLOCKED |
| Commit/paquete | SHA remoto, árbol limpio, artefactos actual/anterior y hashes/versiones/migraciones | Build local; SHA GitHub se verifica al entregar; release gestionado NOT_EXECUTED |
| CI/seguridad | Run PASS del SHA exacto, dependencias/pruebas pertinentes, sin secretos | CI preparado sin deploy; resultado remoto solo al observarlo |
| Aislamiento | DB/Auth/origen/secretos separados, mínimo privilegio, worker off, TLS verificado | PASS fixture; gestionado NOT_EXECUTED |
| Migración | Inventario/ledger/hash/copia previa, compatibilidad y errores fatales | PASS ensayo DDL atómico; gestionado NOT_EXECUTED |
| Salud/monitoreo | Live/ready y smoke autenticado; proxy/CSRF/MFA/rate limit; alerta recibida | PASS sondas/logs locales; proxy/colector/alertas NOT_EXECUTED |
| Copia | Cobertura/cifrado/custodia/snapshot, upload/lectura externos, 30 días | PASS cifrado local; externo/retención BLOCKED |
| Recuperación | Datos/historia/auditoría/outbox/roles/RLS/Auth/MFA/settings/secretos/paquete; 168 h/8 h | PASS alcance local/doble; integral gestionado BLOCKED |
| Efectos externos | Sesiones/enlaces anulados, inciertos conciliados sin reenvío ciego; envío autorizado | PASS aislamiento local; proveedor NOT_EXECUTED |
| Rollback/reinicio | Paquete compatible, corte/drain, sin pérdida ni duplicación, smoke posterior | Procedimiento; plataforma NOT_EXECUTED |
| Staging aceptado | Ambos roles/MFA, negocio/exportaciones privadas/correo capturado y carga representativa | QA local Fase 13 conservada; gestionado NOT_EXECUTED |
| Producción | Sí expreso para release/ambiente/ventana/operación/datos/riesgos | **BLOCKED: no otorgado** |

Registro futuro, sin inventar valores: destino ___; commit ___; paquete/hash ___; snapshot ___; ventana UTC ___; operador/suplente ___; aprobador/evidencia ___; resultado/limitaciones ___; reversión ___; próxima restauración trimestral ___. Aceptar esta fase no aprueba producción. Fase 15 PENDIENTE / NO OTORGADA.

## Migración Fase 9 — control vigente

M9-A01 acepta auditoría F8 con pendientes e inicia documentación/preparación. **Estado documental EN_REVISION; liberación NO_GO.** [Doce puertas actuales](migracion/09_PUERTAS_LIBERACION.csv), [18 pendientes](migracion/09_PENDIENTES.csv), [compatibilidades](migracion/09_COMPATIBILIDADES.csv) y [manifiesto de preparación](migracion/09_MANIFIESTO_PREPARACION.json). Las filas APROBADA_DOCUMENTAL no sustituyen pruebas del motor/entorno. No hay artefacto release, CI remoto F9, destino SQLServer completo o autorización de despliegue.

Antes de una solicitud futura, aportar en un registro protegido: SHA y hash de artefacto/paquete anterior; ambiente/proyecto/origen/base y versiones/collation; permiso de operación/ventana UTC; operador/suplente/aprobador; snapshot/restore/linaje y balances; estado de Auth/settings/perfiles; smoke y CI del SHA concreto; controles de efectos externos, retorno y criterios de abandono; evidencia y limitaciones de cada puerta. Referencias de secretos únicamente, nunca valores.

M8-R01 (autorregistro F8) y M9-R01 (workflow demo Node20 frente a runtime24) siguen abiertos. Las 280 pruebas Node F8 son evidencia local histórica; no acreditan este despliegue. La salida3 de `python3 docs/migracion/verificar_fase9.py --evaluar-liberacion` conserva NO_GO. No ejecutar workflows manuales, abrir PR, fusionar a main ni iniciar worker para intentar convertir esa salida en0.

CA9-01 a CA9-05: preparación/evidencia verificables en el informe y linaje. CA9-06: sincronización/lectura del SHA remoto al entregar. CA9-07: aceptación documental del usuario PENDIENTE. El prompt termina en Fase9; el siguiente trabajo exige alcance propio, sin inferir producción, una fase10 o cierre del ciclo histórico 0–15.
