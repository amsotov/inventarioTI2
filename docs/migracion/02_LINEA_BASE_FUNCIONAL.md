# FASE 2 — Inventario funcional de referencia

> Continuidad: usuario acepta Fase 2 mediante «apruebo fase 2 inicia fase 3». Fase 2 COMPLETADA; contenido/evidencia siguiente describe entrega original. Estado actual en [FASES](../../FASES.md) y [Fase 3](03_IMPACTO_FRONTEND_API.md).

Fecha: 2026-11-03. Base `9dbaa2fe3955e75f237caf873ef2ca44346241c2`. Inspección estática, sin recorrido ejecutado en navegador ni base desplegada consultada.

## API y contratos

El [inventario API](02_INVENTARIO_API.csv) enumera rutas con método, archivo/línea, ancla de código, permiso, requisito y contrato a conservar. Se expanden los bucles de recursos cerrados (inventario y panel); se conserva :resource para historia y :tipo para informes, con valores permitidos en su esquema. No se cuentan cada ID, formato o tipo como endpoint distinto. Se incluyen salud y recepción de acceso; los assets compilados servidos por webRoutes no son APIs de negocio.

## Pantallas y componentes

El [inventario UI](02_INVENTARIO_UI.csv) distingue aplicación normal, demo sintética, prototipo histórico y capacidad futura. Las rutas #cuentas/#auditoria/#configuracion del prototipo no se atribuyen al React integrado: allí son secciones de #administracion/#reportes. No se afirma que existan pantallas de mantenciones, piezas o insumos.

## Garantías transversales de la línea base

1. Negocio compartido entre ambos roles; acciones administrativas protegidas en backend/SQL. Sesión activa, MFA administrativo y versión de autorización vigentes. Sin autorregistro.
2. Motivos, claves y versiones en los contratos que corresponden; errores 400/401/403/404/409/412/422/428/503 saneados con requestId. Respuesta perdida conserva comando para replay exacto; no recrear operación con clave nueva por inferencia.
3. Historia inmutable, fechas del servidor y unidad histórica; correcciones vinculadas sin reescribir original. Bajas lógicas y condición/custodia/situación separadas.
4. Auditoría/avisos sin secretos, documentos o texto libre innecesario; exportaciones ordinarias sin documento/correo. Seguimiento de aviso solo administrador, destino fijo e incertidumbre conciliada.
5. Web normal bajo mismo origen y HTTPS; demo VITE_DEMO_MODE efímera sin APIs externas ni seguridad operativa acreditada. El selector de rol/eliminación demo no son contratos productivos.
6. UI conserva identidad visual, etiquetas, teclado/foco, responsive, carga/vacío/error/permiso, conflicto y caducidad. A11y automatizada histórica no es conformidad WCAG integral.

## Evidencia y límites

La matriz histórica QA Fase 13 documenta resultados locales con PostgreSQL/dobles; Fase 14 documenta restauración sintética. No se repiten en esta fase. Los títulos de pruebas y sus líneas se incorporan a la trazabilidad como referencias. La ejecución SQL Server, datos operacionales, integración gestionada, hardware/Safari y correo real siguen sin verificar.

[Verificación documental](evidencias/fase2/verificacion.json) compara cobertura y referencias; no acredita funcionamiento actual por existir código/pruebas. [Matriz](02_MATRIZ_TRAZABILIDAD.md) y [mapeo](02_MAPEO_ESQUEMAS.md) son entregables principales. Fase 2 EN_REVISION; Fase 3 NO AUTORIZADA.
