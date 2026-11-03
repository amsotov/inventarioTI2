# FASE 4 — Estrategia de reconciliación y rollback

Fecha: 2026-11-03. Estado: **EN_REVISION / PROCEDIMIENTO FUTURO NO EJECUTADO**.

## 1. Niveles de comparación

1. **Fuente física:** hashes/versiones/manifiesto. Hash de archivo no acredita semántica ni identidad de cada equipo; no usar secretos como claves públicas.
2. **Filas de lectura:** toda fila fuente termina conciliada, pendiente o descartada justificadamente (p. ej. vacía/auxiliar). Una fila parcialmente resuelta permanece pendiente hasta clasificar todos sus fragmentos. Contar una sola vez por snapshot, sin confundir eventos de reintento con nuevas filas.
3. **Fragmentos de entidad:** equipo/monitor/pieza/insumo/mantención/persona/catálogo. Cada candidato conserva locator y ordinal; una fila puede producir varios objetos o ninguno con razón. Fragmentos finales se particionan entre aceptados, cuarentena o descartados explícitos; candidatos fusionados conservan todas las procedencias.
4. **Objetos destino:** conteos por entidad/tipo/origen/condición/situación/custodio, mapas y relaciones. Objetos nuevos únicos = grupos de identidad aprobados, no número bruto de fragmentos. Equipos ya existentes se cuentan como enlaces/enriquecimientos, no altas repetidas.
5. **Historia/seguridad/efectos:** comparación por correspondencia e invariantes; sesiones invalidadas y jobs/transitorios aislados se justifican por política de seguridad, no por igualdad ciega de estado operativo.

Balances mínimos de cada snapshot: filas_leidas = filas_conciliadas + filas_pendientes + filas_descartadas_justificadas; fragmentos_emitidos = fragmentos_aceptados + fragmentos_cuarentena + fragmentos_descartados_justificados. Expansión y deduplicación tienen tablas de linaje separadas; no calcular objetos = filas menos errores. Secretos excluidos se contabilizan por disposición de campo sin copiar valor a balances.

## 2. Hashes portables y tolerancias

Definir serialización canónica versionada de campos autorizados: orden de columnas fijo, tipo y longitud en bytes, NULL distinto de vacío, texto UTF-8 completo, decimal exacto sin float, enteros sin transformación de identificadores, instantes UTC preservando precisión original y fechas DATE sin hora. Tildes/Unicode se conservan; normalización adicional solo con regla aprobada. JSON semántico con claves ordenadas si procede, arrays conservan orden con significado. Binaries privados por hash/longitud en custodia; no imprimir contenido.

IDs se traducen mediante correspondencia antes de comparar relaciones; no comparar UUID y INT literalmente. Columnas del destino con semántica diferente no se fuerzan para lograr mismo hash: comparar valor lógico y mostrar transformación aprobada. Cifrado reemitido no tiene por qué conservar ciphertext; comprobar recuperación/control de acceso sin volcar plaintext. No tolerancia numérica para inventarios, series, dinero/decimales exactos o conteos de historia. Tolerancias de metadatos técnicos generados deben estar enumeradas y aprobadas, nunca aceptadas por porcentaje global.

## 3. Invariantes y pruebas

Los [36 casos](04_PRUEBAS_RECONCILIACION.csv) son guion futuro, todos NO_EJECUTADA_PLANIFICADA. Deben comprobar:

- Cada uno de los 155 campos actuales conserva semántica o una disposición técnica aprobada; 117 campos del núcleo con procedencia/regla/ausencia declarada. No pérdida de RUT/ID/cargo/código/adquisición/motivo sin serie/versiones por no existir en núcleo.
- FK válidas y subtipos compatibles; un vigente por equipo y varios equipos por persona; sin solapes/ciclos; traspaso del mismo bien con cierre/apertura exactos; mantenciones/piezas no deduplicadas por coincidencia insuficiente.
- Estado actual coincide con historia; unidad/nombre históricos intactos; correcciones/anotaciones append-only; baja final separada de en proceso y condición independiente.
- Cuentas pendientes/inactivas no operan; MFA/revocación/último administrador/propio rol y RLS/roles mínimos verificados también por acceso directo. Mantener proveedor externo no acredita store SQL Server.
- Cinco reportes y buscador con mismos filtros/campo temporal/proyección/conteos/subtotales/orden y referencias equivalentes; páginas no sustituyen exportación completa. Límites XLSX 10000/PDF 2000 y vacío/exceso verificados.
- Replay idéntico sin filas/eventos/avisos extra; caída/confirmación perdida sin estado parcial; cambios de reglas requieren versión y diff aprobado.

Resultados de ensayos futuros: APROBADA/FALLIDA/BLOQUEADA/NO_EJECUTADA con snapshot/regla/prueba/entorno/fecha/evidencia. No heredar PASS histórico de PostgreSQL a SQL Server ni considerar prueba ejecutada por existir guion.

## 4. Copia, restauración y dos ventanas de reversión

| Momento | Acción propuesta | Prohibición / condición |
|---|---|---|
| Preparación | Copia consistente cifrada de DB + soporte/historia, Excel originales, mapas/versiones/roles/configuración y referencias de claves; probar lectura/restore | Archivo/hash/VERIFYONLY aislado no demuestra recuperación; sin datos reales hasta permiso |
| Carga aislada | App/worker/consumidores apagados; checkpoints/agregados verificables; destino no expuesto | No deshabilitar integridad ni borrar historia para que cargue |
| Fallo antes de reapertura | Mantener target para análisis, origen congelado como fuente de retorno; restaurar servicio anterior compatible con autorización | No reenviar outbox ni borrar lotes ajenos; rollback del candidato no es purga |
| Apertura controlada | Nuevo login/MFA, sesiones/enlaces previos inválidos, TTL/propietario de exportaciones, permisos y efectos conciliados | Apertura exige código/adaptadores/regresión de fases posteriores, no solo tablas |
| Fallo después de nuevas escrituras | Congelar ambos, preservar delta y efectos; decidir corrección hacia adelante o reconciliación inversa autorizada | No apuntar al origen viejo ni restaurar snapshot perdiendo nuevos cambios |
| Retorno y observación | Smoke, reportes/invariantes, RTO/RPO real y diferencias documentadas; un único escritor | Reactivar envíos solo con evidencia y permiso específico; sin doble escritura improvisada |

Fecha/hora del snapshot, fin de extracción, corte de escritura, apertura y última operación aceptada se registran en UTC. RPO observado se calcula con la última copia buena respecto al incidente; RTO desde interrupción a servicio útil aceptado. Requisitos previos siguen 168 h/8 h y copias 30 días, con semanal/máximo 168 h entre éxitos. Para el corte usar captura final de cambios hasta la congelación; no descartar transacciones conocidas amparándose en un objetivo RPO.

Ningún procedimiento aquí es comando ejecutado. Los ensayos históricos de recuperación locales en Fase 14 son referencia, no backup actual ni acreditación de recuperación de identidad/infraestructura gestionadas. Copias/métodos de PostgreSQL y SQL Server se prueban por separado, incluyendo configuración y permisos.

## 5. Decisión GO/NO-GO

[12 puertas](04_PUERTAS_CONTROL.csv) tienen estado actual explícito. Si faltan fuente autorizada, diseño ejecutable, correspondencias, seguridad/custodia, backup restaurado, reconciliación, aplicación compatible, ventana/rollback o permiso, NO-GO para la operación afectada. Un caso pendiente no se vuelve aprobado por transcurso de tiempo o aprobación genérica de fase.

La aceptación de Fase 4 cierra el plan; autorizar Fase 5 permite solo el alcance que se defina expresamente. No constituye permiso productivo ni acredita datos. Fase 4 EN_REVISION; Fase 5 NO AUTORIZADA.
