# FASE 0 — Diagnóstico de modernización inventarioTI2

Fecha: 2026-11-03. Estado: **COMPLETADA / APROBADA POR EL USUARIO**.

El diagnóstico fue entregado en el chat sin modificar archivos, de acuerdo con la restricción inicial. Se incorpora ahora al repositorio, tras la instrucción: «apruebo fase 0 y inicia fase 1 de aquí en adelante guarda todo github los cambios realizados». Esta aprobación cierra únicamente la Fase 0 de migración, autoriza Fase 1 y ratifica sincronización en GitHub; no aprueba propuestas técnicas ni fases siguientes.

## Evidencia y alcance

Base local auditada `099cb366de2f5c09259e35a1fbfdf4a90730ffde`; documentos de destino en `main` `511b99d64c97ff1917f279e78490f377a3f5239a`. Los archivos compartidos coincidían por hash Git. El remoto añadía el prompt, tres documentos de destino y README de migración; no se actualizaron archivos durante Fase 0.

Revisados AGENTS, FASES, ESTADO_PROYECTO, README, PROMPT_MAESTRO, prompt de migración, specs/README, código y documentación de arquitectura/ADR, requisitos, datos, autenticación, seguridad, procesos, frontend, reportes, avisos y pruebas. Se observaron ambos PNG y las cuatro hojas del Excel. `INICIAR_EN_CODEX.md` no existía en la base inspeccionada. No se inspeccionó una base desplegada ni el Excel operacional que originó el diccionario.

## Arquitectura y funcionalidades

Monolito modular: React 19/TypeScript/Vite; BFF Node 24/Fastify; PostgreSQL vía pg y Supabase Auth. Ocho migraciones declaran 19 tablas en inventario/acceso/seguridad. Son declaraciones versionadas, no constatación de una instancia operativa.

Existen gestión de funcionarios con RUT/ID/cargo/unidad y pertenencias históricas; bienes; asignación, devolución, traslado, condición, baja y reactivación; historia inmutable y anotaciones; cuentas, MFA y recuperación; permisos administrativos; auditoría; indicadores/buscador; cinco reportes y exportación XLSX/PDF; outbox con reintentos y conciliación. La demo React usa datos sintéticos en memoria. La evidencia histórica no se presenta como pruebas ejecutadas en esta auditoría.

La separación de adaptadores es parcial: Auth/Mail tienen puertos, pero Authorization, procesos e informes contienen SQL y tipos pg/PoolClient. La migración exige adaptar PL/pgSQL, triggers, índices, bloqueos, contexto de sesión, RLS y recuperación; no basta cambiar la conexión.

## Modelo objetivo y diferencias

ER y DER presentan 30 tablas; el Excel contiene 117 campos y 30 campos FK. Los conteos por tabla coinciden y los destinos FK existen. EQUIPOS se normaliza con catálogos y cuatro subtipos; piezas, insumos y mantenciones requieren capacidad nueva. Marca procede del modelo.

| Área | Diferencia e impacto preliminar | Clasificación |
|---|---|---|
| Motor | PostgreSQL/Supabase DB frente a SQL Server; seguridad/transacciones específicas | ADAPTAR; REEMPLAZAR implementación del motor |
| Identificadores | UUID expuestos por API frente a INT IDENTITY | ADAPTAR; conservar correspondencia y contratos |
| Personas | Destino sin RUT/ID, cargo, versión y alta | CONSERVAR requisitos; proponer complemento |
| Organización | Unidad actual frente a región/delegación/departamento/área | ADAPTAR sin equiparar entidades automáticamente |
| Ubicación | FUNC_AREA_ID ubica persona; no equipo independiente | PENDIENTE de decisión; no añadir por inferencia |
| Bienes | Dos inventarios opcionales; no equivalencia del código único/adquisición/motivo sin serie | ADAPTAR y conservar datos |
| Tiempo | DATE histórico nullable frente a instantes UTC y registro/efectiva separados | PENDIENTE crítico; evitar pérdida de precisión |
| Historia | ASIGNACIONES no cubre todos los movimientos/pertenencias/anotaciones | CONSERVAR capacidades mediante diseño complementario |
| Identidad | HASH obligatorio y cuenta ligada a funcionario frente a proveedor externo/cuentas independientes | PENDIENTE crítico |
| Roles | Perfil múltiple frente a rol único y protección de último administrador | ADAPTAR sin rebajar permisos |
| Soporte técnico | Sin equivalentes de sesiones, comandos, outbox, intentos y exportaciones | CONSERVAR capacidades |
| UI/reportes | Cambian relaciones y campos; generación y sistema visual reutilizables | CONSERVAR y ADAPTAR en fases autorizadas |

No hay funcionalidades propuestas para retiro. Se conservan frontend, diseño, contratos, requisitos RF-01–16/RNF-01–07 y pruebas aceptadas; no se reconstruye el sistema.

## Riesgos y recomendaciones

No aplicar el modelo directamente: faltan garantías e información necesaria para funciones existentes. Validar autenticación externa, correspondencia de cuentas/personas, unicidad, campos ausentes, precisión UTC, estados/baja, equipos compartidos, ubicación y consistencia de subtipos. Proteger secretos/códigos de impresión y revisar longitudes/collation antes de imponer restricciones.

CALIDAD_DATOS informa secretos en observaciones, códigos de impresión, 91 inventarios PC que son años, duplicados, fechas ausentes e identificadores deteriorados. Son hallazgos declarados por el documento, no medidas nuevas sobre datos reales. No migrar secretos ni inventar dígitos/fechas/identidades.

F1-SEG-01/02/03 siguen abiertos: retención legal, presupuesto y operación del respaldo. UTC, copia semanal con máximo 168 h entre éxitos, RPO 168 h, RTO 8 h y copias 30 días permanecen. El historial de desarrollo conserva última fase completada 13, Fase 14 EN_REVISION y Fase 15 no autorizada.

## Plan por fases de migración

0 diagnóstico; 1 validación documental y decisiones; 2 línea base y trazabilidad; 3 propuesta visual/API sin implementación; 4 plan ETL/reversión; 5 esquema SQL Server en entorno autorizado; 6 backend; 7 frontend; 8 seguridad/regresión; 9 documentación/preparación. Cada fase requiere autorización independiente; merge, despliegue, datos reales y producción no se deducen de la sincronización GitHub.

## Verificación y límites

En Fase 0: inspección estática, hashes, lectura de imágenes/Excel, conteos/referencias y Git limpio. No SQL, build, pruebas funcionales, cambios de archivos, commits o despliegues. Este archivo se guarda en Fase 1, no retroactivamente como ejecución de Fase 0. El informe de Fase 1 precisa y amplía las discrepancias: [validación](01_VALIDACION_MODELO.md) y [decisiones](01_DECISIONES_PENDIENTES.md).
