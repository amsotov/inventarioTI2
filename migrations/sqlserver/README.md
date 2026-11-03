# SQL Server — candidato Fase 5

Estado: CANDIDATO BLOQUEADO, NO APLICADO. La aplicación existente sigue usando PostgreSQL/Supabase sin cambios.

Leer [informe y decisiones](../../docs/migracion/05_ESQUEMA_SQLSERVER.md) antes de revisar SQL. Orden propuesto: 0001 → 0002 → 0003 → 900 (verificación parcial de catálogo). Todos comienzan con THROW incondicional. No quitarlo manualmente; emitir nueva versión solo con diseño y entorno autorizados.

`manifest.json` contiene hashes/versionado de revisión; no autoriza ejecución. No hay runner ni conexión configurada. No pasar estos scripts al runner Supabase ni aplicar a base existente. No contienen down destructivo, GRANT, logins, usuarios o semillas.

Verificación sin DB: `python3 docs/migracion/verificar_fase5.py` desde raíz. Para parser T-SQL estático instalar SQLFluff==3.5.0 en venv externo y ejecutar con su Python y `--analizar-sintaxis`. `--evaluar-aplicacion` devuelve código 3 porque aplicación sigue bloqueada.

Núcleo: 30 tablas/117 campos/30 PK/30 FK/18 UQ/25 IDENTITY/5 DEFAULT. Propuestas separadas: 9 CHECK y 24 índices FK. Soporte actual 19 tablas/155 campos identificado, sin DDL nuevo. Scripts no garantizan todavía autenticación, roles/RLS, historia precisa, reglas de subtipos/asignación ni idempotencia de negocio; nada sustituye a la aplicación actual por ejecutar DDL.
