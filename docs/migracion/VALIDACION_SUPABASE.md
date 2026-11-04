# FASE 5 — Validación inicial de baseline en Supabase

Fecha local: 2026-11-03, America/Santiago. M5-A05: usuario «remota donde quedaste», interpretado como retomar Fase 5, dentro del entorno aislado/sintético ya elegido y creado. Base: `cdd0f0398026384a2ff4aca20353017e0c6c5f91`. **Baseline existente instalada y 20 casos SQL aprobados. Fase 5 EN_REVISION; Fase 6 NO AUTORIZADA.**

## Alcance y conservación

Proyecto exclusivo: inventarioTI2, ref `yhsfotxhaptinjtmrinn`, sovicl/sa-east-1, PostgreSQL 17.11. InventarioTI permanece pausado; ningún proyecto de hotel, plan, frontend, backend o fuente original fue modificado. Se revisaron fases/estado/prompts, scripts existentes, fixtures y permisos del entorno gestionado antes de aplicar. Se consultaron documentación vigente de roles Supabase y PostgreSQL 17.

Se reutilizó el modelo actual de **19 tablas / 155 columnas**, no se tradujeron las 30 tablas objetivo a PostgreSQL ni se resolvieron silenciosamente M1-D. El candidato SQL Server 2016/130 conserva sus cuatro SQL byte a byte; solo su manifiesto/documentación pasan a revisión4 para describir el entorno. Los ocho archivos originales de `supabase/migrations` y todo código de aplicación/modelo/diseño aceptado se conservan.

## Migraciones y adaptación gestionada

[Paquete reproducible](../../migrations/supabase-pruebas/README.md), [manifest y hashes](../../migrations/supabase-pruebas/manifest.json): ocho migraciones de fuente más dos correcciones privadas, diez entradas comprobadas en historial Supabase. Nombres remotos/versiones reales se registran sin fingir igualdad con timestamps originales.

El operador postgres gestionado tiene CREATEROLE y BYPASSRLS, pero no SUPERUSER. Por eso el ensayo no puede acreditar RLS si permanece como operador: los casos de permisos cambian expresamente a inventario_runtime/anon. Se habilitó SET del creador de roles solo en la transacción de cada migración; para transferir funciones se otorgó CREATE temporal al propietario nuevo y se revocó enseguida. Las siete pertenencias del operador tienen SET=true/INHERIT=false; el parámetro volvió a vacío. Los siete roles de aplicación quedan NOLOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOBYPASSRLS y sin CREATE en los esquemas verificados.

**PG-ACL-01, corregida:** los defaults/grants emitidos desde un operador no SUPERUSER dejaron EXECUTE de PUBLIC en funciones, aunque el navegador carecía de USAGE del esquema. La primera corrección quitó los permisos en funciones del operador, pero quedaron nueve funciones de otros propietarios. El catálogo detectó ese resultado parcial; una segunda corrección ejecutó REVOKE y los GRANT explícitos de la fuente como cada propietario efectivo. Resultado: **cero funciones privadas con EXECUTE para PUBLIC**, sin conceder acceso de navegador. Se conservaron ambas migraciones aplicadas y no se reescribió su historia.

La extracción inicial de JSON de la envoltura MCP se ajustó a la línea real de datos, ignorando instrucciones/texto del envoltorio; no fue un fallo del SQL ni causó repetir migraciones/semillas. Los 20 casos SQL se ejecutaron antes y después de las correcciones; la evidencia vigente corresponde al cierre final.

## Datos sintéticos persistentes y aislamiento

Quedan **2 unidades, 3 funcionarios y 6 bienes**, con nombres/códigos SINT y correos example.invalid. No hay RUT, PIN, secretos, fuente Excel operacional o historia real. Son fixtures de arranque, no operaciones administrativas reales ni evidencia histórica migrada. La semilla aborta si encuentra datos; no usa ON CONFLICT para ocultar diferencias.

No hay cuentas de aplicación, sesiones, comandos, auditorías u outbox persistentes del ensayo. Tampoco se crearon usuarios Supabase Auth, contraseñas o credenciales de conexión. Los contextos de administrador/lector/MFA fueron sintéticos y transaccionales; se revirtieron. No se ejecutaron procesos de worker, SMTP o envíos. No confundir roles NOLOGIN con usuarios funcionales disponibles.

## Veinte casos ejecutados

| Caso | Comprobación SQL |
|---|---|
| PG01–02 | Principal administrativo sintético y denegación de DML directo al runtime |
| PG03–05 | Alta por función, replay sin duplicados y conflicto por payload distinto |
| PG06–07 | Unicidad canónica y motivo obligatorio cuando falta serie |
| PG08–10 | Versión incorrecta, actualización válida y versión obsoleta |
| PG11–12 | Funcionario con pertenencia y asignación con custodia única |
| PG13–15 | Asignación incompatible rechazada, traspaso con cierre/apertura en el mismo instante y baja bloqueada con custodia |
| PG16–19 | Lector consulta sin auditoría, escritura prohibida, anon sin esquema y revocación del principal por estado |
| PG20 | Inmutabilidad de auditoría, incluso con DML ordinario del operador |

El batch exige n=20 y todas las aserciones antes de ROLLBACK; el SELECT posterior confirma semilla intacta y cero cuentas/sesiones/comandos/auditorías/outbox. No se interpreta un rollback como validación de restauración desde copia. Las secuencias pueden consumir valores aun sin filas persistentes.

Catálogo final: 19 tablas/155 columnas, RLS en las 19, siete roles sin atributos elevados ni CREATE residual, cero USAGE para anon/authenticated en esquemas privados y cero EXECUTE PUBLIC en funciones privadas. Advisors de seguridad: sin lints devueltos al consultar; no equivale a auditoría universal o garantía de ausencia de riesgos. [Resultados saneados](evidencias/fase5/ensayo_supabase/resultados.json).

## No ejecutado y siguiente paso

No se probaron conexiones reales como roles runtime, Supabase Auth/MFA real, HTTP, UI, PDF/Excel, correo, dos escritores concurrentes, rendimiento, backup/restore o perfilado/reconciliación real. El fixture original de tests crea contenedores y resets locales: no se apuntó al proyecto remoto ni se habilitaron logins por conveniencia. No se instaló o desplegó una app.

SQL Server **no se ejecutó**. Sus 30 casos futuros, instancia/edición/SP/CU/collation, Unicode, HASH/Auth, precisión UTC, soporte de historia/UUID/sesiones/outbox, CHECK y decisiones de negocio siguen pendientes. Esta línea base PostgreSQL demuestra conservación parcial de reglas existentes, no migración terminada ni equivalencia de motores. F1-SEG-01/02/03, RPO/RTO/UTC/conservación siguen vigentes sin acreditación operacional nueva.

Revisar esta evidencia y cerrar las decisiones aplicables antes de habilitar el DDL SQL Server. Fase 6 (adaptación de backend) solo con autorización independiente; este ensayo no la inicia. Verificación documental: `python3 docs/migracion/verificar_fase5.py`; comprueba hashes/evidencia y no repite SQL remoto. Scripts de ensayo requieren selección y revisión explícitas del proyecto, no son un despliegue automático.

Referencias: [roles Supabase](https://supabase.com/docs/guides/database/postgres/roles), [createrole_self_grant](https://www.postgresql.org/docs/17/runtime-config-client.html), [ALTER FUNCTION y propietarios](https://www.postgresql.org/docs/17/sql-alterfunction.html), [default privileges por esquema](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html).
