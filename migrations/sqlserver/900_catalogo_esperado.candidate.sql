-- CANDIDATO EN REVISION. No aplicado ni habilitado para ejecución.
-- No quitar esta barrera manualmente: requiere nueva versión revisada,
-- decisiones resueltas y entorno/operación autorizados.
;THROW 51050, N'FASE 5: candidato bloqueado; consultar docs/migracion/05_ESQUEMA_SQLSERVER.md', 1;
IF ISNULL(TRY_CONVERT(INT, SERVERPROPERTY('ProductMajorVersion')), 0) <> 13
    THROW 51054, N'Se requiere motor SQL Server 2016 (13.x); otro motor con compatibilidad 130 no es equivalente', 1;
IF ISNULL((SELECT compatibility_level FROM sys.databases WHERE database_id = DB_ID()), 0) <> 130
    THROW 51055, N'Se requiere compatibility_level 130; no se modifica automáticamente', 1;
IF DB_ID() <= 4
    THROW 51056, N'No se permite usar una base de sistema', 1;
SET NOCOUNT ON;
SET XACT_ABORT ON;
IF @@TRANCOUNT <> 0
    THROW 51051, N'Se requiere conexión sin transacción previa', 1;

DECLARE @esperado TABLE (tabla SYSNAME, campo SYSNAME, tipo SYSNAME, bytes SMALLINT, precision_val TINYINT, escala TINYINT, permite_null BIT, es_identity BIT);
INSERT INTO @esperado VALUES
(N'ACTIVIDADES_MANTENCION', N'ACTI_ID', N'int', 4, 10, 0, 0, 1),
(N'ACTIVIDADES_MANTENCION', N'ACTI_NOMBRE', N'varchar', 40, 0, 0, 0, 0),
(N'AREAS', N'AREA_ID', N'int', 4, 10, 0, 0, 1),
(N'AREAS', N'AREA_NOMBRE', N'varchar', 100, 0, 0, 0, 0),
(N'CLASES_IMPRESORA', N'CLAS_ID', N'int', 4, 10, 0, 0, 1),
(N'CLASES_IMPRESORA', N'CLAS_NOMBRE', N'varchar', 30, 0, 0, 0, 0),
(N'DEPARTAMENTOS', N'DEPA_ID', N'int', 4, 10, 0, 0, 1),
(N'DEPARTAMENTOS', N'DEPA_NOMBRE', N'varchar', 80, 0, 0, 0, 0),
(N'ESTADOS_EQUIPO', N'ESTA_ID', N'int', 4, 10, 0, 0, 1),
(N'ESTADOS_EQUIPO', N'ESTA_NOMBRE', N'varchar', 30, 0, 0, 0, 0),
(N'FAMILIAS_COMPONENTE', N'FAMI_ID', N'int', 4, 10, 0, 0, 1),
(N'FAMILIAS_COMPONENTE', N'FAMI_NOMBRE', N'varchar', 30, 0, 0, 0, 0),
(N'MARCAS', N'MARC_ID', N'int', 4, 10, 0, 0, 1),
(N'MARCAS', N'MARC_NOMBRE', N'varchar', 60, 0, 0, 0, 0),
(N'MODALIDADES_ASIGNACION', N'MODA_ID', N'int', 4, 10, 0, 0, 1),
(N'MODALIDADES_ASIGNACION', N'MODA_NOMBRE', N'varchar', 30, 0, 0, 0, 0),
(N'ORIGENES_EQUIPO', N'ORIG_ID', N'int', 4, 10, 0, 0, 1),
(N'ORIGENES_EQUIPO', N'ORIG_NOMBRE', N'varchar', 30, 0, 0, 0, 0),
(N'PERFILES', N'PERF_ID', N'int', 4, 10, 0, 0, 1),
(N'PERFILES', N'PERF_NOMBRE', N'varchar', 30, 0, 0, 0, 0),
(N'PERFILES', N'PERF_NIVEL_ACCESO', N'tinyint', 1, 3, 0, 0, 0),
(N'PERFILES', N'PERF_DESCRIPCION', N'varchar', 200, 0, 0, 1, 0),
(N'REGIONES', N'REGI_ID', N'int', 4, 10, 0, 0, 1),
(N'REGIONES', N'REGI_NOMBRE', N'varchar', 60, 0, 0, 0, 0),
(N'RUBROS_INSUMO', N'RUBR_ID', N'int', 4, 10, 0, 0, 1),
(N'RUBROS_INSUMO', N'RUBR_NOMBRE', N'varchar', 40, 0, 0, 0, 0),
(N'SISTEMAS_OPERATIVOS', N'SIST_ID', N'int', 4, 10, 0, 0, 1),
(N'SISTEMAS_OPERATIVOS', N'SIST_NOMBRE', N'varchar', 40, 0, 0, 0, 0),
(N'SITUACIONES', N'SITU_ID', N'int', 4, 10, 0, 0, 1),
(N'SITUACIONES', N'SITU_NOMBRE', N'varchar', 30, 0, 0, 0, 0),
(N'TIPOS_EQUIPO', N'TIPO_ID', N'int', 4, 10, 0, 0, 1),
(N'TIPOS_EQUIPO', N'TIPO_NOMBRE', N'varchar', 40, 0, 0, 0, 0),
(N'DELEGACIONES', N'DELE_ID', N'int', 4, 10, 0, 0, 1),
(N'DELEGACIONES', N'DELE_REGION_ID', N'int', 4, 10, 0, 0, 0),
(N'DELEGACIONES', N'DELE_NOMBRE', N'varchar', 60, 0, 0, 0, 0),
(N'DELEGACIONES', N'DELE_DIRECCION', N'varchar', 150, 0, 0, 1, 0),
(N'MODELOS', N'MODE_ID', N'int', 4, 10, 0, 0, 1),
(N'MODELOS', N'MODE_MARCA_ID', N'int', 4, 10, 0, 0, 0),
(N'MODELOS', N'MODE_NOMBRE', N'varchar', 100, 0, 0, 0, 0),
(N'EQUIPOS', N'EQUI_ID', N'int', 4, 10, 0, 0, 1),
(N'EQUIPOS', N'EQUI_TIPO_EQUIPO_ID', N'int', 4, 10, 0, 0, 0),
(N'EQUIPOS', N'EQUI_MODELO_ID', N'int', 4, 10, 0, 1, 0),
(N'EQUIPOS', N'EQUI_ORIGEN_ID', N'int', 4, 10, 0, 1, 0),
(N'EQUIPOS', N'EQUI_ESTADO_ID', N'int', 4, 10, 0, 1, 0),
(N'EQUIPOS', N'EQUI_SITUACION_ID', N'int', 4, 10, 0, 1, 0),
(N'EQUIPOS', N'EQUI_NUMERO_SERIE', N'varchar', 60, 0, 0, 1, 0),
(N'EQUIPOS', N'EQUI_INVENTARIO_SERVIU', N'varchar', 30, 0, 0, 1, 0),
(N'EQUIPOS', N'EQUI_INVENTARIO_MINVU', N'varchar', 30, 0, 0, 1, 0),
(N'EQUIPOS', N'EQUI_DIRECCION_IP', N'varchar', 45, 0, 0, 1, 0),
(N'EQUIPOS', N'EQUI_TIENE_CANDADO', N'bit', 1, 1, 0, 1, 0),
(N'EQUIPOS', N'EQUI_OBSERVACION', N'varchar', 500, 0, 0, 1, 0),
(N'FUNCIONARIOS', N'FUNC_ID', N'int', 4, 10, 0, 0, 1),
(N'FUNCIONARIOS', N'FUNC_NOMBRE_COMPLETO', N'varchar', 150, 0, 0, 0, 0),
(N'FUNCIONARIOS', N'FUNC_USUARIO_RED', N'varchar', 50, 0, 0, 1, 0),
(N'FUNCIONARIOS', N'FUNC_CORREO', N'varchar', 150, 0, 0, 1, 0),
(N'FUNCIONARIOS', N'FUNC_DELEGACION_ID', N'int', 4, 10, 0, 0, 0),
(N'FUNCIONARIOS', N'FUNC_DEPARTAMENTO_ID', N'int', 4, 10, 0, 0, 0),
(N'FUNCIONARIOS', N'FUNC_AREA_ID', N'int', 4, 10, 0, 1, 0),
(N'FUNCIONARIOS', N'FUNC_CLAVE_IMPRESION', N'varchar', 10, 0, 0, 1, 0),
(N'FUNCIONARIOS', N'FUNC_IMPRESION_DOBLE_CARA', N'bit', 1, 1, 0, 1, 0),
(N'FUNCIONARIOS', N'FUNC_ACTIVO', N'bit', 1, 1, 0, 0, 0),
(N'ASIGNACIONES', N'ASIG_ID', N'int', 4, 10, 0, 0, 1),
(N'ASIGNACIONES', N'ASIG_EQUIPO_ID', N'int', 4, 10, 0, 0, 0),
(N'ASIGNACIONES', N'ASIG_FUNCIONARIO_ID', N'int', 4, 10, 0, 0, 0),
(N'ASIGNACIONES', N'ASIG_MODALIDAD_ID', N'int', 4, 10, 0, 1, 0),
(N'ASIGNACIONES', N'ASIG_FECHA_INICIO', N'date', 3, 10, 0, 1, 0),
(N'ASIGNACIONES', N'ASIG_FECHA_TERMINO', N'date', 3, 10, 0, 1, 0),
(N'ASIGNACIONES', N'ASIG_TRASPASO_DE_ID', N'int', 4, 10, 0, 1, 0),
(N'ASIGNACIONES', N'ASIG_OBSERVACION', N'varchar', 300, 0, 0, 1, 0),
(N'COMPUTADORES', N'COMP_EQUIPO_ID', N'int', 4, 10, 0, 0, 0),
(N'COMPUTADORES', N'COMP_ES_NOTEBOOK', N'bit', 1, 1, 0, 0, 0),
(N'COMPUTADORES', N'COMP_NOMBRE_RED', N'varchar', 50, 0, 0, 0, 0),
(N'COMPUTADORES', N'COMP_DIRECCION_MAC', N'varchar', 17, 0, 0, 1, 0),
(N'COMPUTADORES', N'COMP_GUID', N'varchar', 36, 0, 0, 1, 0),
(N'COMPUTADORES', N'COMP_PROCESADOR', N'varchar', 100, 0, 0, 1, 0),
(N'COMPUTADORES', N'COMP_VELOCIDAD_GHZ', N'decimal', 5, 4, 2, 1, 0),
(N'COMPUTADORES', N'COMP_SISTEMA_OPERATIVO_ID', N'int', 4, 10, 0, 1, 0),
(N'IMPRESORAS', N'IMPR_EQUIPO_ID', N'int', 4, 10, 0, 0, 0),
(N'IMPRESORAS', N'IMPR_CLASE_ID', N'int', 4, 10, 0, 1, 0),
(N'IMPRESORAS', N'IMPR_DUPLEX', N'bit', 1, 1, 0, 1, 0),
(N'IMPRESORAS', N'IMPR_ANCHO_CARRO', N'decimal', 5, 4, 1, 1, 0),
(N'MANTENCIONES', N'MANT_ID', N'int', 4, 10, 0, 0, 1),
(N'MANTENCIONES', N'MANT_EQUIPO_ID', N'int', 4, 10, 0, 0, 0),
(N'MANTENCIONES', N'MANT_ACTIVIDAD_ID', N'int', 4, 10, 0, 0, 0),
(N'MANTENCIONES', N'MANT_FECHA', N'date', 3, 10, 0, 0, 0),
(N'MANTENCIONES', N'MANT_OBSERVACION', N'varchar', 300, 0, 0, 1, 0),
(N'MONITORES', N'MONI_EQUIPO_ID', N'int', 4, 10, 0, 0, 0),
(N'MONITORES', N'MONI_PULGADAS', N'decimal', 5, 4, 1, 1, 0),
(N'SWITCHES', N'SWIT_EQUIPO_ID', N'int', 4, 10, 0, 0, 0),
(N'SWITCHES', N'SWIT_CANTIDAD_PUERTOS', N'smallint', 2, 5, 0, 0, 0),
(N'USUARIOS', N'USUA_ID', N'int', 4, 10, 0, 0, 1),
(N'USUARIOS', N'USUA_FUNCIONARIO_ID', N'int', 4, 10, 0, 0, 0),
(N'USUARIOS', N'USUA_CLAVE_HASH', N'varchar', 255, 0, 0, 0, 0),
(N'USUARIOS', N'USUA_ACTIVO', N'bit', 1, 1, 0, 0, 0),
(N'USUARIOS', N'USUA_FECHA_CREACION', N'datetime2', 8, 27, 7, 0, 0),
(N'AUDITORIA', N'AUDI_ID', N'bigint', 8, 19, 0, 0, 1),
(N'AUDITORIA', N'AUDI_USUARIO_ID', N'int', 4, 10, 0, 0, 0),
(N'AUDITORIA', N'AUDI_FECHA_HORA', N'datetime2', 8, 27, 7, 0, 0),
(N'AUDITORIA', N'AUDI_ACCION', N'varchar', 20, 0, 0, 0, 0),
(N'AUDITORIA', N'AUDI_ENTIDAD', N'varchar', 60, 0, 0, 1, 0),
(N'AUDITORIA', N'AUDI_ENTIDAD_ID', N'varchar', 50, 0, 0, 1, 0),
(N'AUDITORIA', N'AUDI_VALOR_ANTERIOR', N'varchar', -1, 0, 0, 1, 0),
(N'AUDITORIA', N'AUDI_VALOR_NUEVO', N'varchar', -1, 0, 0, 1, 0),
(N'AUDITORIA', N'AUDI_CONTEXTO', N'varchar', 500, 0, 0, 1, 0),
(N'AUDITORIA', N'AUDI_DIRECCION_IP', N'varchar', 45, 0, 0, 1, 0),
(N'AUTORIZACIONES', N'AUTO_USUARIO_ID', N'int', 4, 10, 0, 0, 0),
(N'AUTORIZACIONES', N'AUTO_PERFIL_ID', N'int', 4, 10, 0, 0, 0),
(N'AUTORIZACIONES', N'AUTO_FECHA_OTORGADO', N'datetime2', 8, 27, 7, 0, 0),
(N'INSUMOS_IMPRESORA', N'INSU_ID', N'int', 4, 10, 0, 0, 1),
(N'INSUMOS_IMPRESORA', N'INSU_IMPRESORA_ID', N'int', 4, 10, 0, 0, 0),
(N'INSUMOS_IMPRESORA', N'INSU_RUBRO_ID', N'int', 4, 10, 0, 0, 0),
(N'INSUMOS_IMPRESORA', N'INSU_CODIGO', N'varchar', 30, 0, 0, 0, 0),
(N'PIEZAS_COMPUTADOR', N'PIEZ_ID', N'int', 4, 10, 0, 0, 1),
(N'PIEZAS_COMPUTADOR', N'PIEZ_COMPUTADOR_ID', N'int', 4, 10, 0, 0, 0),
(N'PIEZAS_COMPUTADOR', N'PIEZ_FAMILIA_ID', N'int', 4, 10, 0, 0, 0),
(N'PIEZAS_COMPUTADOR', N'PIEZ_CAPACIDAD_GB', N'int', 4, 10, 0, 0, 0),
(N'PIEZAS_COMPUTADOR', N'PIEZ_FECHA_ASIGNACION', N'date', 3, 10, 0, 1, 0);
DECLARE @actual TABLE (tabla SYSNAME, campo SYSNAME, tipo SYSNAME, bytes SMALLINT, precision_val TINYINT, escala TINYINT, permite_null BIT, es_identity BIT);
INSERT INTO @actual
SELECT t.name, c.name, ty.name, c.max_length, c.precision, c.scale, c.is_nullable, c.is_identity
FROM sys.tables AS t JOIN sys.schemas AS s ON s.schema_id = t.schema_id
JOIN sys.columns AS c ON c.object_id = t.object_id
JOIN sys.types AS ty ON ty.user_type_id = c.user_type_id
WHERE s.name = N'dbo' AND t.name IN (SELECT tabla FROM @esperado);
IF EXISTS (SELECT * FROM @esperado EXCEPT SELECT * FROM @actual)
   OR EXISTS (SELECT * FROM @actual EXCEPT SELECT * FROM @esperado)
    THROW 51060, N'Catálogo de columnas difiere del candidato', 1;

DECLARE @claves TABLE (tabla SYSNAME, clase VARCHAR(2), campo SYSNAME, ordinal INT);
INSERT INTO @claves VALUES
(N'ACTIVIDADES_MANTENCION', 'PK', N'ACTI_ID', 1),
(N'ACTIVIDADES_MANTENCION', 'UQ', N'ACTI_NOMBRE', 1),
(N'AREAS', 'PK', N'AREA_ID', 1),
(N'AREAS', 'UQ', N'AREA_NOMBRE', 1),
(N'CLASES_IMPRESORA', 'PK', N'CLAS_ID', 1),
(N'CLASES_IMPRESORA', 'UQ', N'CLAS_NOMBRE', 1),
(N'DEPARTAMENTOS', 'PK', N'DEPA_ID', 1),
(N'DEPARTAMENTOS', 'UQ', N'DEPA_NOMBRE', 1),
(N'ESTADOS_EQUIPO', 'PK', N'ESTA_ID', 1),
(N'ESTADOS_EQUIPO', 'UQ', N'ESTA_NOMBRE', 1),
(N'FAMILIAS_COMPONENTE', 'PK', N'FAMI_ID', 1),
(N'FAMILIAS_COMPONENTE', 'UQ', N'FAMI_NOMBRE', 1),
(N'MARCAS', 'PK', N'MARC_ID', 1),
(N'MARCAS', 'UQ', N'MARC_NOMBRE', 1),
(N'MODALIDADES_ASIGNACION', 'PK', N'MODA_ID', 1),
(N'MODALIDADES_ASIGNACION', 'UQ', N'MODA_NOMBRE', 1),
(N'ORIGENES_EQUIPO', 'PK', N'ORIG_ID', 1),
(N'ORIGENES_EQUIPO', 'UQ', N'ORIG_NOMBRE', 1),
(N'PERFILES', 'PK', N'PERF_ID', 1),
(N'PERFILES', 'UQ', N'PERF_NOMBRE', 1),
(N'PERFILES', 'UQ', N'PERF_NIVEL_ACCESO', 1),
(N'REGIONES', 'PK', N'REGI_ID', 1),
(N'REGIONES', 'UQ', N'REGI_NOMBRE', 1),
(N'RUBROS_INSUMO', 'PK', N'RUBR_ID', 1),
(N'RUBROS_INSUMO', 'UQ', N'RUBR_NOMBRE', 1),
(N'SISTEMAS_OPERATIVOS', 'PK', N'SIST_ID', 1),
(N'SISTEMAS_OPERATIVOS', 'UQ', N'SIST_NOMBRE', 1),
(N'SITUACIONES', 'PK', N'SITU_ID', 1),
(N'SITUACIONES', 'UQ', N'SITU_NOMBRE', 1),
(N'TIPOS_EQUIPO', 'PK', N'TIPO_ID', 1),
(N'TIPOS_EQUIPO', 'UQ', N'TIPO_NOMBRE', 1),
(N'DELEGACIONES', 'PK', N'DELE_ID', 1),
(N'MODELOS', 'PK', N'MODE_ID', 1),
(N'EQUIPOS', 'PK', N'EQUI_ID', 1),
(N'FUNCIONARIOS', 'PK', N'FUNC_ID', 1),
(N'ASIGNACIONES', 'PK', N'ASIG_ID', 1),
(N'COMPUTADORES', 'PK', N'COMP_EQUIPO_ID', 1),
(N'COMPUTADORES', 'UQ', N'COMP_NOMBRE_RED', 1),
(N'IMPRESORAS', 'PK', N'IMPR_EQUIPO_ID', 1),
(N'MANTENCIONES', 'PK', N'MANT_ID', 1),
(N'MONITORES', 'PK', N'MONI_EQUIPO_ID', 1),
(N'SWITCHES', 'PK', N'SWIT_EQUIPO_ID', 1),
(N'USUARIOS', 'PK', N'USUA_ID', 1),
(N'USUARIOS', 'UQ', N'USUA_FUNCIONARIO_ID', 1),
(N'AUDITORIA', 'PK', N'AUDI_ID', 1),
(N'AUTORIZACIONES', 'PK', N'AUTO_USUARIO_ID', 1),
(N'AUTORIZACIONES', 'PK', N'AUTO_PERFIL_ID', 2),
(N'INSUMOS_IMPRESORA', 'PK', N'INSU_ID', 1),
(N'PIEZAS_COMPUTADOR', 'PK', N'PIEZ_ID', 1);
DECLARE @claves_actuales TABLE (tabla SYSNAME, clase VARCHAR(2), campo SYSNAME, ordinal INT);
INSERT INTO @claves_actuales
SELECT t.name, k.type, c.name, ic.key_ordinal FROM sys.key_constraints AS k
JOIN sys.tables AS t ON t.object_id = k.parent_object_id
JOIN sys.schemas AS s ON s.schema_id = t.schema_id
JOIN sys.index_columns AS ic ON ic.object_id = t.object_id AND ic.index_id = k.unique_index_id
JOIN sys.columns AS c ON c.object_id = t.object_id AND c.column_id = ic.column_id
WHERE s.name = N'dbo' AND ic.key_ordinal > 0 AND t.name IN (SELECT tabla FROM @esperado);
IF EXISTS (SELECT * FROM @claves EXCEPT SELECT * FROM @claves_actuales)
   OR EXISTS (SELECT * FROM @claves_actuales EXCEPT SELECT * FROM @claves)
   OR (SELECT COUNT(*) FROM sys.key_constraints AS k JOIN sys.tables AS t ON t.object_id = k.parent_object_id JOIN sys.schemas AS s ON s.schema_id = t.schema_id WHERE s.name = N'dbo' AND t.name IN (SELECT tabla FROM @esperado)) <> 48
    THROW 51061, N'PK/UQ difieren del candidato', 1;

DECLARE @fks TABLE (tabla SYSNAME, campo SYSNAME, padre SYSNAME, campo_padre SYSNAME);
INSERT INTO @fks VALUES
(N'DELEGACIONES', N'DELE_REGION_ID', N'REGIONES', N'REGI_ID'),
(N'FUNCIONARIOS', N'FUNC_DELEGACION_ID', N'DELEGACIONES', N'DELE_ID'),
(N'FUNCIONARIOS', N'FUNC_DEPARTAMENTO_ID', N'DEPARTAMENTOS', N'DEPA_ID'),
(N'FUNCIONARIOS', N'FUNC_AREA_ID', N'AREAS', N'AREA_ID'),
(N'USUARIOS', N'USUA_FUNCIONARIO_ID', N'FUNCIONARIOS', N'FUNC_ID'),
(N'AUTORIZACIONES', N'AUTO_USUARIO_ID', N'USUARIOS', N'USUA_ID'),
(N'AUTORIZACIONES', N'AUTO_PERFIL_ID', N'PERFILES', N'PERF_ID'),
(N'AUDITORIA', N'AUDI_USUARIO_ID', N'USUARIOS', N'USUA_ID'),
(N'MODELOS', N'MODE_MARCA_ID', N'MARCAS', N'MARC_ID'),
(N'EQUIPOS', N'EQUI_TIPO_EQUIPO_ID', N'TIPOS_EQUIPO', N'TIPO_ID'),
(N'EQUIPOS', N'EQUI_MODELO_ID', N'MODELOS', N'MODE_ID'),
(N'EQUIPOS', N'EQUI_ORIGEN_ID', N'ORIGENES_EQUIPO', N'ORIG_ID'),
(N'EQUIPOS', N'EQUI_ESTADO_ID', N'ESTADOS_EQUIPO', N'ESTA_ID'),
(N'EQUIPOS', N'EQUI_SITUACION_ID', N'SITUACIONES', N'SITU_ID'),
(N'COMPUTADORES', N'COMP_EQUIPO_ID', N'EQUIPOS', N'EQUI_ID'),
(N'COMPUTADORES', N'COMP_SISTEMA_OPERATIVO_ID', N'SISTEMAS_OPERATIVOS', N'SIST_ID'),
(N'MONITORES', N'MONI_EQUIPO_ID', N'EQUIPOS', N'EQUI_ID'),
(N'IMPRESORAS', N'IMPR_EQUIPO_ID', N'EQUIPOS', N'EQUI_ID'),
(N'IMPRESORAS', N'IMPR_CLASE_ID', N'CLASES_IMPRESORA', N'CLAS_ID'),
(N'SWITCHES', N'SWIT_EQUIPO_ID', N'EQUIPOS', N'EQUI_ID'),
(N'PIEZAS_COMPUTADOR', N'PIEZ_COMPUTADOR_ID', N'COMPUTADORES', N'COMP_EQUIPO_ID'),
(N'PIEZAS_COMPUTADOR', N'PIEZ_FAMILIA_ID', N'FAMILIAS_COMPONENTE', N'FAMI_ID'),
(N'INSUMOS_IMPRESORA', N'INSU_IMPRESORA_ID', N'IMPRESORAS', N'IMPR_EQUIPO_ID'),
(N'INSUMOS_IMPRESORA', N'INSU_RUBRO_ID', N'RUBROS_INSUMO', N'RUBR_ID'),
(N'ASIGNACIONES', N'ASIG_EQUIPO_ID', N'EQUIPOS', N'EQUI_ID'),
(N'ASIGNACIONES', N'ASIG_FUNCIONARIO_ID', N'FUNCIONARIOS', N'FUNC_ID'),
(N'ASIGNACIONES', N'ASIG_MODALIDAD_ID', N'MODALIDADES_ASIGNACION', N'MODA_ID'),
(N'ASIGNACIONES', N'ASIG_TRASPASO_DE_ID', N'ASIGNACIONES', N'ASIG_ID'),
(N'MANTENCIONES', N'MANT_EQUIPO_ID', N'EQUIPOS', N'EQUI_ID'),
(N'MANTENCIONES', N'MANT_ACTIVIDAD_ID', N'ACTIVIDADES_MANTENCION', N'ACTI_ID');
DECLARE @fks_actuales TABLE (tabla SYSNAME, campo SYSNAME, padre SYSNAME, campo_padre SYSNAME);
INSERT INTO @fks_actuales
SELECT t.name, c.name, p.name, pc.name FROM sys.foreign_keys AS fk
JOIN sys.tables AS t ON t.object_id = fk.parent_object_id JOIN sys.schemas AS s ON s.schema_id = t.schema_id
JOIN sys.foreign_key_columns AS f ON f.constraint_object_id = fk.object_id
JOIN sys.columns AS c ON c.object_id = t.object_id AND c.column_id = f.parent_column_id
JOIN sys.tables AS p ON p.object_id = f.referenced_object_id
JOIN sys.schemas AS ps ON ps.schema_id = p.schema_id
JOIN sys.columns AS pc ON pc.object_id = p.object_id AND pc.column_id = f.referenced_column_id
WHERE s.name = N'dbo' AND ps.name = N'dbo' AND t.name IN (SELECT tabla FROM @esperado);
IF EXISTS (SELECT * FROM @fks EXCEPT SELECT * FROM @fks_actuales)
   OR EXISTS (SELECT * FROM @fks_actuales EXCEPT SELECT * FROM @fks)
   OR (SELECT COUNT(*) FROM @fks_actuales) <> 30
   OR EXISTS (SELECT 1 FROM sys.foreign_keys AS fk JOIN sys.tables AS t ON t.object_id = fk.parent_object_id JOIN sys.schemas AS s ON s.schema_id = t.schema_id WHERE s.name = N'dbo' AND t.name IN (SELECT tabla FROM @esperado) AND (fk.is_disabled = 1 OR fk.is_not_trusted = 1 OR fk.delete_referential_action <> 0 OR fk.update_referential_action <> 0))
    THROW 51062, N'FK difieren o no están activas/confiables/NO ACTION', 1;
-- No acredita defaults, CHECK, índices, collation ni reglas de negocio por sí solo.
SELECT N'CATALOGO_COLUMNAS_PK_UQ_FK_COMPROBADO' AS resultado;
