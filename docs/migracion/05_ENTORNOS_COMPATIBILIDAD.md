# FASE 5 — Entornos confirmados y compatibilidad 130

Fecha: 2026-11-03. M5-A02 continúa la Fase 5; no acepta su cierre ni inicia Fase 6. Base de continuación: `38603e223d9b5795f4c2179b35e0403b7a2e5d45`. Actualización M5-A05: candidato `0.5.0-review.4`, EN_REVISION. Supabase inventarioTI2 contiene baseline existente (19 tablas/155 columnas), semilla sintética y [20 casos SQL aprobados](VALIDACION_SUPABASE.md); no se ejecutó HTTP/Auth real/UI. Aplicación SQL Server sigue BLOQUEADA. [Provisión actual](PROVISION_SUPABASE.md).

## Confirmación del usuario

«Fase de Pruebas Actual (Supabase): Se utilizará un proyecto aislado en Supabase (PostgreSQL) cargado con datos sintéticos para validar la funcionalidad inicial. Entorno de Destino (SQL Server): SQL Server 2016, compatibility level 130». Al consultar el proyecto correcto, respondió «inventarioTI2».

| Aspecto | Decisión confirmada | Pendiente |
|---|---|---|
| Pruebas iniciales | Supabase/PostgreSQL, proyecto inventarioTI2 aislado, datos sintéticos | Baseline y semilla sintética aplicadas; 20 casos SQL, no HTTP/Auth real/UI |
| Destino | SQL Server 2016, motor 13.x, compatibility_level 130 | Edición, SP/CU, collation, instancia y base autorizada, conectividad y permisos |
| Modelo/reglas | Se mantiene propuesta de 30 tablas y garantías previas | M1-D02–16 aplicables: esta respuesta no resuelve alternativas de auth, CHECK, historia o privacidad |
| Fases | Fase 5 continúa autorizada | Fase 6 y producción no autorizadas |

M1-D01 queda ratificada respecto del objetivo SQL Server y su versión/nivel. No implica que el backend de negocio ya use SQL Server o que exista una conexión de destino. `entorno_autorizado: null` en el manifiesto se refiere al destino SQL Server; el entorno funcional previsto queda registrado separadamente en `pruebas_iniciales`.

## Acceso real a Supabase y alcance

**Estado de creación M5-A04 (histórico):** inventarioTI pausado por autorización expresa; inventarioTI2 ref `yhsfotxhaptinjtmrinn` creado en sovicl/sa-east-1, ACTIVE_HEALTHY, PostgreSQL 17.11.0.011 y UTC según consulta. Cero tablas de aplicación; sin claves en Git/chat. El bloqueo de acceso/cuota quedó resuelto. Lo siguiente conserva el descubrimiento previo M5-A02 como historia.

Se consultaron únicamente metadatos de proyectos y ramas mediante el conector. La conexión mostró tres proyectos, ninguno con nombre inventarioTI2. El proyecto de nombre similar inventarioTI no tiene ramas de desarrollo visibles. **No se deduce que ambos nombres representen el mismo proyecto**. No se consultaron filas, catálogos SQL, logs con contenido de negocio, claves API ni credenciales; no se crearon proyectos/ramas ni se incurrió en aprovisionamiento.

Paso original de M5-A02 (resuelto por M5-A04): hacer accesible inventarioTI2 mediante la conexión Supabase y comprobar su referencia y aislamiento. Si se informa una ref, comprobar visibilidad/identidad antes de cualquier operación. No usar inventarioTI como reemplazo ni pedir contraseñas en chat. La conexión de GitHub y el nombre del repositorio no prueban identidad de un proyecto Supabase.

Preflight previsto tras acceso: confirmar versión PostgreSQL y estructura existente; revisar migraciones aplicadas y advisors; identificar roles/esquemas/RLS/extensiones y configuración de correo/worker. Solo después preparar cargas sintéticas y pruebas compatibles. No ejecutar ciegamente las suites actuales contra Supabase gestionado: sus fixtures crean contenedores PostgreSQL, roles y resets de datos locales. No redirigirlas a un servidor remoto mediante una variable.

El esquema PostgreSQL existente, sus ocho migraciones y código React/Fastify se conservan. No se adapta todavía el modelo de 30 tablas a PostgreSQL ni se escribe un backend dual por inferencia. Si se necesita esa implementación, debe tener alcance explícito de fase. Las pruebas iniciales de la funcionalidad existente no acreditan que el nuevo modelo esté integrado.

## Corrección necesaria: Unicode y collation

SQL Server 2016 **no admite collations `_UTF8`**: esa capacidad se incorpora en SQL Server 2019. Queda descartada la opción UTF-8 para VARCHAR en este destino, aunque estuviera citada como alternativa general en informes anteriores. No se modifica el Excel original ni se reescribe su evidencia histórica.

El núcleo candidato conserva VARCHAR del diccionario y NO queda autorizado por ello para almacenar texto que no represente su página de códigos. M1-D15 sigue bloqueante: recomendar enmienda a NVARCHAR para texto que requiera Unicode completo, con longitudes/índices/comparación validados y aceptación explícita; alternativamente, una política acotada y demostrada de representabilidad, sin conversión con pérdida. No decidir collation por idioma aparente, ni considerar que las tildes ensayadas en PostgreSQL verifican Windows code pages. La collation BIN2 explícita de la propuesta de MAC es distinta de una collation de base aprobada y está disponible antes de UTF-8.

## Validación propia de SQL Server 2016

Los cuatro SQL conservan THROW 51050 incondicional. Detrás se añaden comprobaciones fail-closed: ProductMajorVersion = 13, compatibility_level = 130 y rechazo de bases de sistema. No crean base ni ejecutan ALTER DATABASE. Retirar la primera barrera manualmente sigue prohibido; una versión habilitada exige resolver diseño/entorno y nueva revisión.

Se añadió herramienta aislada [ScriptDom130](herramientas/scriptdom130/README.md): Microsoft.SqlServer.TransactSql.ScriptDom **161.9142.1**, clase **TSql130Parser**. El número del paquete no selecciona el motor; la clase selecciona la gramática 130. Los cuatro archivos se analizan sin errores, con SHA-256. Tres autopruebas comprueban SQL válido, sintaxis inválida y rechazo de `IS DISTINCT FROM`, posterior a SQL Server 2016.

El verificador añade controles explícitos contra construcciones seleccionadas posteriores a 2016 (STRING_AGG/TRIM/TRANSLATE/CONCAT_WS/DATETRUNC/GREATEST/LEAST/JSON_OBJECT/JSON_ARRAY/IS DISTINCT FROM y collations UTF-8). Son controles acotados: un parser admite nombres de funciones genéricas y no sustituye la resolución semántica/catálogos del motor. No se afirma compatibilidad funcional completa por pasar el parser o una lista de prohibiciones.

Un SQL Server posterior con compatibility_level 130 no equivale a ejecutar SQL Server 2016: puede permitir funciones del motor posterior. Cambiar el nivel no convierte PostgreSQL en SQL Server. Tampoco se acredita una instancia 2016 ejecutando una imagen Linux de SQL Server posterior.

## Separación de evidencias y pendientes

M5-A05 supera el estado vacío de creación: baseline existente instalada con 10 migraciones trazadas (8 fuentes y 2 correcciones ACL), 2 unidades/3 funcionarios/6 bienes sintéticos y 20 casos SQL reversibles aprobados. Ver [informe](VALIDACION_SUPABASE.md). Las limitaciones de SQL Server y fases siguientes permanecen.

| Evidencia | Estado real | Lo que demuestra |
|---|---|---|
| OOXML ↔ DDL/CSV/manifiesto | APROBADA_ESTATICA | Correspondencia del candidato con 117 campos y restricciones documentadas |
| SQLFluff T-SQL | APROBADA_ESTATICA | Parseo genérico, sin motor |
| ScriptDom TSql130Parser, cuatro archivos | APROBADA_ESTATICA | Gramática 130 de los candidatos, sin compilación semántica |
| 20 negativas del verificador + tres autopruebas ScriptDom | APROBADAS_EN_SU_ALCANCE | Alteraciones rechazadas, incluido motor/nivel/collation/proyecto incorrectos |
| Proyecto Supabase inventarioTI2 y metadatos | VERIFICADO_M5_A04 | ACTIVE_HEALTHY, consulta PostgreSQL 17.11/UTC, cero tablas de aplicación |
| Baseline SQL en Supabase inventarioTI2 | 20 CASOS SQL APROBADOS | 19 tablas/155 columnas; semilla sintética, funciones/RLS/roles/rollback. No acredita Auth/API/UI ni SQL Server |
| Integridad/concurrencia/replay/rendimiento/rollback/restore SQL Server | NO_EJECUTADAS | Faltan instancia autorizada y decisiones; se conservan los 30 casos futuros |

Revisión 2 archivada en [revision2](evidencias/fase5/revision2/verificacion.json); sus hashes describen el estado previo a la provisión. Evidencia actual en [verificacion.json](evidencias/fase5/verificacion.json). Revisión inicial archivada en [revision1](evidencias/fase5/revision1/verificacion.json); sus hashes describen el commit anterior, no los archivos actuales modificados. Fuentes/diseño/Fase 4 se conservan sin alteración.

Referencias consultadas:

- [Microsoft: nivel de compatibilidad y tabla de versiones](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-database-transact-sql-compatibility-level?view=sql-server-ver16).
- [Microsoft: collation y soporte Unicode, introducción de UTF-8 en 2019](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver13).
- [Microsoft: TSql130Parser](https://learn.microsoft.com/en-us/dotnet/api/microsoft.sqlserver.transactsql.scriptdom.tsql130parser?view=sql-transactsql-161).
- [Supabase: arquitectura PostgreSQL](https://supabase.com/docs/guides/getting-started/architecture).
- [Supabase: aislamiento de ramas y semillas](https://supabase.com/docs/guides/deployment/branching). No se creó ni activó una rama.
