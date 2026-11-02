# Checklist de liberación — Fase 14

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
| Automatismos externos al repo | Inspeccionar Pages/configuración del proveedor/runs/despliegues antes de push/merge | BLOCKED: Pages legacy main:/docs activo; run disparado cancelado, job deploy CANCELLED. Ajustes posteriores solo rama/PR sin merge |
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
