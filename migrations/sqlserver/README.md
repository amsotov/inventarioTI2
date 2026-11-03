# SQL Server — candidato Fase 5

Estado: CANDIDATO BLOQUEADO, NO APLICADO. Revisión 0.5.0-review.3, objetivo SQL Server 2016/13.x, compatibility_level 130. La aplicación existente sigue usando PostgreSQL/Supabase sin cambios.

Leer [informe y decisiones](../../docs/migracion/05_ESQUEMA_SQLSERVER.md) antes de revisar SQL. Orden propuesto: 0001 → 0002 → 0003 → 900 (verificación parcial de catálogo). Todos comienzan con THROW incondicional. No quitarlo manualmente; emitir nueva versión solo con diseño y entorno autorizados.

`manifest.json` contiene hashes/versionado de revisión; no autoriza ejecución. No hay runner ni conexión configurada. No pasar estos scripts al runner Supabase ni aplicar a base existente. No contienen down destructivo, GRANT, logins, usuarios o semillas.

Verificación sin DB: `python3 docs/migracion/verificar_fase5.py` desde raíz. Para parser T-SQL estático instalar SQLFluff==3.5.0 en venv externo y ejecutar con su Python y `--analizar-sintaxis`. `--evaluar-aplicacion` devuelve código 3 porque aplicación sigue bloqueada.

Núcleo: 30 tablas/117 campos/30 PK/30 FK/18 UQ/25 IDENTITY/5 DEFAULT. Propuestas separadas: 9 CHECK y 24 índices FK. Soporte actual 19 tablas/155 campos identificado, sin DDL nuevo. Scripts no garantizan todavía autenticación, roles/RLS, historia precisa, reglas de subtipos/asignación ni idempotencia de negocio; nada sustituye a la aplicación actual por ejecutar DDL.

M5-A02: [entornos](../../docs/migracion/05_ENTORNOS_COMPATIBILIDAD.md). Pruebas funcionales iniciales previstas en Supabase/PostgreSQL inventarioTI2; no equivalen a ensayos SQL Server. M5-A04 ya creó inventarioTI2: [provisión](../../docs/migracion/PROVISION_SUPABASE.md), vacío de esquema/datos de aplicación, solo metadatos verificados. Edición/collation SQL Server pendientes; no UTF-8 en 2016. Guards explícitas de motor/nivel y parser [TSql130Parser](../../docs/migracion/herramientas/scriptdom130/README.md), sin retirar THROW.
