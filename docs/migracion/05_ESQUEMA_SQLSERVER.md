# FASE 5 — Esquema y migraciones SQL Server

Continuación M5-A05: [entornos y compatibilidad](05_ENTORNOS_COMPATIBILIDAD.md) y [provisión](PROVISION_SUPABASE.md). SQL Server 2016/13.x/nivel 130 sigue como destino. Supabase inventarioTI2 contiene la baseline existente de 19 tablas/155 columnas y semilla sintética; [20 casos SQL aprobados](VALIDACION_SUPABASE.md), sin HTTP/Auth real/UI. Revisión 0.5.0-review.4, sin iniciar Fase 6.

Fecha: 2026-11-03. Estado: **EN_REVISION; aplicación/ensayos de SQL Server BLOQUEADOS**.
Base aceptada: `9f84fcd836550654770bd7ed4191f9edaffe2528`. M5-A01: «apruebo fase 4 inicia fase 5». Fases 0–4 COMPLETADAS; Fase 6 NO AUTORIZADA. M5-A01 permite preparar el candidato SQL Server; no elige alternativas M1-D ni autoriza su instancia de destino/producción/despliegue. M5-A03–05 sí habilitan el entorno PostgreSQL aislado y su ensayo sintético, registrado aparte.

## Fuentes revisadas y resultado concreto

AGENTS, prompts, FASES/ESTADO/README/INICIAR, requisitos/decisiones y runbook; originales ER/DER/diccionario; matrices 1–3, diseño/API aceptados y plan/excepciones/puertas de Fase 4. Se conserva la aplicación existente y sus ocho migraciones PostgreSQL. La fuente operacional sigue ausente; no hay perfilado, extracción ni carga operacional real; la semilla sintética PostgreSQL se registra aparte.

Se entrega un **candidato físico de revisión** en [migrations/sqlserver](../../migrations/sqlserver/README.md): 30 tablas/117 campos, 30 PK (31 componentes), 30 FK, 18 UQ, 25 IDENTITY y cinco defaults según diccionario. AUTORIZACIONES conserva PK compuesta; cuatro subtipos mantienen PK/FK sin IDENTITY. FK con NO ACTION es propuesta conservadora explícita: no hay cascadas destructivas.

Cuatro archivos SQL separados, cada uno con `THROW 51050` incondicional al inicio. **Ningún indicador, variable o aprobación general permite saltarlo.** No retirar la barrera manualmente: tras resolver decisiones y autorizar entorno hay que emitir una versión revisada con fingerprints y revisión de diferencias. Aquí no existe ejecutor de conexiones ni comando de aplicación. No se ha ejecutado ninguno de los SQL Server candidatos. La consulta de metadatos PostgreSQL de M5-A04 se registra aparte.

| Archivo | Alcance | Límite |
|---|---|---|
| 0001_nucleo_diccionario.candidate.sql | Núcleo exacto + PK/UQ/DEFAULT/FK, transacción/XACT_ABORT/TRY-CATCH/applock, exige destino vacío | Sin CHECK incompletos, sin soporte ni reglas transaccionales de aplicación |
| 0002_checks_propuestos.candidate.sql | Nueve expresiones propuestas, WITH CHECK | Requieren aprobación M1-D14 y decisiones relacionadas |
| 0003_indices_fk.candidate.sql | 24 índices FK no cubiertos por primera clave PK/UQ | Sin benchmark ni promesa de rendimiento |
| 900_catalogo_esperado.candidate.sql | Consulta de metadatos bidireccional de columnas/PK/UQ/FK | No comprueba por sí sola defaults/CHECK/índices/collation ni negocio |

No se crean bases, logins, usuarios, permisos, semillas, hashes, datos de ejemplo ni tablas adicionales a las 30 del núcleo. Los candidatos SQL Server no ejecutan DML de negocio. El DML sintético del ensayo PostgreSQL es separado y no migra datos operacionales reales. Los INSERT de 900 solo pueblan variables de tabla de metadatos en un eventual ensayo autorizado.

## Diferencias y decisiones que impiden aplicar

1. **M1-D01/15:** SQL Server 2016/13.x y compatibility_level 130 confirmados por M5-A02; edición/SP/CU/entorno/collation siguen pendientes. VARCHAR depende de bytes y comparación; SQL Server 2016 no soporta collations UTF-8. Recomendar enmienda explícita a NVARCHAR para texto Unicode completo y comprobar longitudes/UQ, o justificar dominio representable sin pérdida; no cambiar tipos por inferencia. No crear base a ciegas.
2. **M1-D02/03:** USUA_CLAVE_HASH NOT NULL se conserva solo como baseline fiel, pero contradice Auth externo. Recomendación pendiente: mantener Supabase Auth, hash no aplicable/nullable y soporte de proveedor/estado/MFA/sesiones. No copiar ni fabricar hashes ni convertir funcionarios en cuentas.
3. **M1-D07:** tres DATETIME2 del Excel quedan escritos sin escala, como su fuente; SQL Server usa escala 7 por defecto. DER pide 0/0/3: discrepancia abierta. Cinco DEFAULT: dos `1` y tres `SYSDATETIME()` literales del diccionario; **estos últimos no garantizan UTC**. Recomendación de enmienda: precisión de instantes explícita sin pérdida y SYSUTCDATETIME; DATE histórico permanece día/NULL. No se aplica enmienda en silencio ni se usa esta base para producir eventos.
4. **M1-D14:** [nueve CHECK](05_CHECKS_PROPUESTOS.csv) son propuestas; no están aprobados por escribir SQL. La restricción de acción no inventa un catálogo CRUD; solo propone no vacío/controles y deja dominio pendiente. Correo es formato mínimo, no RFC ni prueba de existencia. MAC admite 12 hex o 17 con separadores uniformes. Dimensiones/capacidad/velocidad/puertos positivos son propuestas sin máximos empresariales inventados. WITH CHECK conserva confianza; no NOCHECK.
5. **M1-D08/09:** [19 conjuntos actuales](05_SOPORTE_ACTUAL.csv) y [155 campos](05_PRESERVACION_CAMPOS.csv) requieren soporte complementario. No hay DDL de ese soporte aún: no presentar un núcleo vacío como sustituto del sistema. Persistencia de UUID, versión/ETag, idempotencia, historia con instantes/actores, store de acceso, outbox/exportaciones no se eliminan. Diseñar soporte junto al adaptador, antes de una aplicación utilizable.
6. **M1-D04/05/06/10/11/13/16:** ubicación independiente sigue sin aprobación; equipo compartido sin persona real queda en excepción; no UQ nuevos para inventarios/series/correo; matriz de subtipos y modelos, permisos efectivos y baja final/transiciones siguen pendientes. ASIG_TRASPASO_DE_ID solo es FK: **no garantiza mismo equipo, vigencia única, orden, ausencia de ciclos/ramas/solapes**. No se afirma que el candidato ya implemente esas garantías.
7. **M1-D12:** FUNC_CLAVE_IMPRESION permanece como columna del modelo, sin valor/carga. Recomendación de minimización: omitir su uso; si se necesita, requiere enmienda de cifrado/custodia/roles. AUDI_VALOR_* no habilita volcar filas completas; sanitización, inmutabilidad y mínimos permisos siguen obligatorios.

## Dependencias, concurrencia, versión e idempotencia

0001 crea padres/hijos según orden de Fase 4; agrega FK después para incluir auto-FK. SQL en un único batch por archivo, sin GO/USE, sp_getapplock con propietario Transaction y timeout cero, @@TRANCOUNT inicial cero, XACT_ABORT y TRY/CATCH con rollback. Los cuatro scripts no están incorporados a los runners Supabase ni al workflow. Main y workflows se conservan: su push desplegaría la demo, por eso rama dedicada sin PR/merge.

`manifest.json` fija versión candidata, base, hashes, 117 columnas, bloqueos, destino 2016/130 confirmado y entorno SQL Server nulo; el verificador comprueba manifiesto contra Excel y SQL, no confía solo en ese manifiesto. No es firma ni autorización. No hay tabla/runner de versiones productivo. Antes de habilitar: decidir ledger/fingerprint, bloqueo compartido, checksum/versionado y política de reaplicación. Hoy repetir 0001 debe **rechazar un destino no vacío**, no omitir objetos con IF NOT EXISTS y ocultar drift. Los candidatos bloqueados no acreditan idempotencia ejecutada.

Cada futura versión es atómica dentro de sí; las tres versiones no se presentan como una transacción única. Un fallo posterior deja candidato parcial no promovible y requiere reconciliación/retorno aprobado. No existe down destructivo. Antes de COMMIT rollback de la transacción; después restauración/candidato nuevo, preservando delta si hubo nuevas escrituras, según [Fase 4](04_RECONCILIACION_ROLLBACK.md). No borrar la fuente ni reutilizar outbox/sesiones al retornar.

La revisión 0.5.0-review.2 añade comprobaciones de motor real 13.x/nivel 130/base no de sistema. [ScriptDom130](herramientas/scriptdom130/README.md) analiza los cuatro SQL con TSql130Parser y tres autopruebas; no compila ni ejecuta el motor. En inventarioTI2 se instaló la baseline existente y se verificaron 20 casos SQL, no HTTP/Auth real/UI ni modelo SQL Server.

## Verificación y criterio de aceptación

[verificar_fase5.py](verificar_fase5.py) usa fuentes OOXML/CSV/SQL y hashes; no abre DB. Valida 117 columnas contra el Excel original, PK/FK/UQ/IDENTITY/defaults, cobertura/expresiones de CHECK propuestos, índices no redundantes, 19/155 de soporte, barreras y preservación de fuentes/capturas. `--analizar-sintaxis` añade parser **SQLFluff 3.5.0, dialecto tsql**, instalado solo en venv de trabajo; no modifica dependencias del proyecto. Es análisis sintáctico estático, **no compilación/ejecución de SQL Server**. Veinte pruebas negativas mutan copias aisladas en memoria; la negativa sintáctica usa un archivo temporal externo. No alteran los SQL versionados.

Comando estándar: `python3 docs/migracion/verificar_fase5.py`. Parser: usar Python de un venv externo con SQLFluff 3.5.0 y añadir `--analizar-sintaxis`. `--evaluar-aplicacion` debe terminar con código 3 y listar bloqueos; no intenta conectarse. [Evidencia](evidencias/fase5/verificacion.json) separa controles estáticos aprobados, fallos corregidos y no ejecutados.

[30 casos SQL Server](05_CASOS_SQLSERVER.csv) quedan NO_EJECUTADOS: motor sin entorno autorizado/configurado. Tener Docker local disponible no es aprobación de base, licencia/versión, collation, datos o conectividad. No se inventó endpoint ni se aprovisionó servidor. SQLFluff se usa como herramienta aislada, sin servicios. No se apuntaron las suites locales de aplicación a Supabase: se ejecutó un ensayo SQL gestionado propio, con ROLLBACK; fuentes originales sin cambios. SQL Server no se simuló mediante SQLite/PostgreSQL.

| Criterio | Estado real |
|---|---|
| CA-M5-01 núcleo trazable y versionado de revisión | VERIFICADO_ESTATICAMENTE |
| CA-M5-02 catálogo CHECK y discrepancias expresas | DOCUMENTADO_PENDIENTE_APROBACION |
| CA-M5-03 preservación de app/fuentes/diseño y soporte identificado | VERIFICADO_ESTATICAMENTE; soporte NO_IMPLEMENTADO |
| CA-M5-04 integridad/negativas/replay/concurrencia/planes en motor | BLOQUEADO_ENTORNO_DISENO |
| CA-M5-05 aplicación/reconciliación/rollback/restore en entorno autorizado | NO_EJECUTADO |
| CA-M5-06 aceptación de entrega y siguiente fase | PENDIENTE_USUARIO |

El primer control estático rechazó DATETIME2 porque una expresión del verificador solo aceptaba letras en el tipo. Se corrigió para aceptar tipos con dígitos y se repitió con éxito; no fue un fallo del esquema ni una ejecución SQL.

## Recomendación y siguiente paso

Revisar el candidato y resolver decisiones M1-D aplicables, ratificar edición/SP/CU/collation y un entorno SQL Server 2016/130 aislado sintético para ensayos antes de habilitar cualquier migración. La fuente operacional será necesaria para perfilado/carga, no para revisar el DDL. Aprobar este informe no convierte los ensayos ausentes en éxitos. Fase 5 no se declara COMPLETADA. Fase 6 (adaptación de backend) exige autorización nueva y conservará bloqueos de integración aplicables. Siguen pendientes F1-SEG-01/02/03; UTC/copia semanal/máximo 168h/RPO≤168h/RTO≤8h/copias30d sin cambios.
