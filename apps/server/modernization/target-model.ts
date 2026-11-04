// Derivado del diccionario y de las enmiendas M6-A02/M6-A03.
export const targetColumns = [
  {
    "tabla": "ACTIVIDADES_MANTENCION",
    "campo": "ACTI_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 112
  },
  {
    "tabla": "ACTIVIDADES_MANTENCION",
    "campo": "ACTI_NOMBRE",
    "tipo": "NVARCHAR(40)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 113
  },
  {
    "tabla": "AREAS",
    "campo": "AREA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 10
  },
  {
    "tabla": "AREAS",
    "campo": "AREA_NOMBRE",
    "tipo": "NVARCHAR(100)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 11
  },
  {
    "tabla": "CLASES_IMPRESORA",
    "campo": "CLAS_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 81
  },
  {
    "tabla": "CLASES_IMPRESORA",
    "campo": "CLAS_NOMBRE",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 82
  },
  {
    "tabla": "DEPARTAMENTOS",
    "campo": "DEPA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 8
  },
  {
    "tabla": "DEPARTAMENTOS",
    "campo": "DEPA_NOMBRE",
    "tipo": "NVARCHAR(80)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 9
  },
  {
    "tabla": "ESTADOS_EQUIPO",
    "campo": "ESTA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 53
  },
  {
    "tabla": "ESTADOS_EQUIPO",
    "campo": "ESTA_NOMBRE",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 54
  },
  {
    "tabla": "FAMILIAS_COMPONENTE",
    "campo": "FAMI_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 89
  },
  {
    "tabla": "FAMILIAS_COMPONENTE",
    "campo": "FAMI_NOMBRE",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 90
  },
  {
    "tabla": "MARCAS",
    "campo": "MARC_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 46
  },
  {
    "tabla": "MARCAS",
    "campo": "MARC_NOMBRE",
    "tipo": "NVARCHAR(60)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 47
  },
  {
    "tabla": "MODALIDADES_ASIGNACION",
    "campo": "MODA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 102
  },
  {
    "tabla": "MODALIDADES_ASIGNACION",
    "campo": "MODA_NOMBRE",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 103
  },
  {
    "tabla": "ORIGENES_EQUIPO",
    "campo": "ORIG_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 51
  },
  {
    "tabla": "ORIGENES_EQUIPO",
    "campo": "ORIG_NOMBRE",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 52
  },
  {
    "tabla": "PERFILES",
    "campo": "PERF_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 22
  },
  {
    "tabla": "PERFILES",
    "campo": "PERF_NOMBRE",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 23
  },
  {
    "tabla": "PERFILES",
    "campo": "PERF_NIVEL_ACCESO",
    "tipo": "TINYINT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 24
  },
  {
    "tabla": "PERFILES",
    "campo": "PERF_DESCRIPCION",
    "tipo": "NVARCHAR(200)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 25
  },
  {
    "tabla": "REGIONES",
    "campo": "REGI_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 2
  },
  {
    "tabla": "REGIONES",
    "campo": "REGI_NOMBRE",
    "tipo": "NVARCHAR(60)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 3
  },
  {
    "tabla": "RUBROS_INSUMO",
    "campo": "RUBR_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 96
  },
  {
    "tabla": "RUBROS_INSUMO",
    "campo": "RUBR_NOMBRE",
    "tipo": "NVARCHAR(40)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 97
  },
  {
    "tabla": "SISTEMAS_OPERATIVOS",
    "campo": "SIST_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 69
  },
  {
    "tabla": "SISTEMAS_OPERATIVOS",
    "campo": "SIST_NOMBRE",
    "tipo": "NVARCHAR(40)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 70
  },
  {
    "tabla": "SITUACIONES",
    "campo": "SITU_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 55
  },
  {
    "tabla": "SITUACIONES",
    "campo": "SITU_NOMBRE",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 56
  },
  {
    "tabla": "TIPOS_EQUIPO",
    "campo": "TIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 44
  },
  {
    "tabla": "TIPOS_EQUIPO",
    "campo": "TIPO_NOMBRE",
    "tipo": "NVARCHAR(40)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 45
  },
  {
    "tabla": "DELEGACIONES",
    "campo": "DELE_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 4
  },
  {
    "tabla": "DELEGACIONES",
    "campo": "DELE_REGION_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 5
  },
  {
    "tabla": "DELEGACIONES",
    "campo": "DELE_NOMBRE",
    "tipo": "NVARCHAR(60)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 6
  },
  {
    "tabla": "DELEGACIONES",
    "campo": "DELE_DIRECCION",
    "tipo": "NVARCHAR(150)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 7
  },
  {
    "tabla": "MODELOS",
    "campo": "MODE_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 48
  },
  {
    "tabla": "MODELOS",
    "campo": "MODE_MARCA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 49
  },
  {
    "tabla": "MODELOS",
    "campo": "MODE_NOMBRE",
    "tipo": "NVARCHAR(100)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 50
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 57
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_TIPO_EQUIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 58
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_MODELO_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 59
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_ORIGEN_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 60
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_ESTADO_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 61
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_SITUACION_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 62
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_NUMERO_SERIE",
    "tipo": "NVARCHAR(60)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 63
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_INVENTARIO_SERVIU",
    "tipo": "NVARCHAR(30)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 64
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_INVENTARIO_MINVU",
    "tipo": "NVARCHAR(30)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 65
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_DIRECCION_IP",
    "tipo": "VARCHAR(45)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 66
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_TIENE_CANDADO",
    "tipo": "BIT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 67
  },
  {
    "tabla": "EQUIPOS",
    "campo": "EQUI_OBSERVACION",
    "tipo": "NVARCHAR(500)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 68
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 12
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_NOMBRE_COMPLETO",
    "tipo": "NVARCHAR(150)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 13
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_USUARIO_RED",
    "tipo": "NVARCHAR(50)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 14
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_CORREO",
    "tipo": "NVARCHAR(150)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 15
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_DELEGACION_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 16
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_DEPARTAMENTO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 17
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_AREA_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 18
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_CLAVE_IMPRESION",
    "tipo": "VARCHAR(10)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 19
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_IMPRESION_DOBLE_CARA",
    "tipo": "BIT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 20
  },
  {
    "tabla": "FUNCIONARIOS",
    "campo": "FUNC_ACTIVO",
    "tipo": "BIT",
    "permite_null": false,
    "identity": false,
    "default": "1",
    "fila_excel": 21
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 104
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_EQUIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 105
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_FUNCIONARIO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 106
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_MODALIDAD_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 107
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_FECHA_INICIO",
    "tipo": "DATE",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 108
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_FECHA_TERMINO",
    "tipo": "DATE",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 109
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_TRASPASO_DE_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 110
  },
  {
    "tabla": "ASIGNACIONES",
    "campo": "ASIG_OBSERVACION",
    "tipo": "NVARCHAR(300)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 111
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_EQUIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 71
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_ES_NOTEBOOK",
    "tipo": "BIT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 72
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_NOMBRE_RED",
    "tipo": "NVARCHAR(50)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 73
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_DIRECCION_MAC",
    "tipo": "VARCHAR(17)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 74
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_GUID",
    "tipo": "VARCHAR(36)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 75
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_PROCESADOR",
    "tipo": "NVARCHAR(100)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 76
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_VELOCIDAD_GHZ",
    "tipo": "DECIMAL(4,2)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 77
  },
  {
    "tabla": "COMPUTADORES",
    "campo": "COMP_SISTEMA_OPERATIVO_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 78
  },
  {
    "tabla": "IMPRESORAS",
    "campo": "IMPR_EQUIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 83
  },
  {
    "tabla": "IMPRESORAS",
    "campo": "IMPR_CLASE_ID",
    "tipo": "INT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 84
  },
  {
    "tabla": "IMPRESORAS",
    "campo": "IMPR_DUPLEX",
    "tipo": "BIT",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 85
  },
  {
    "tabla": "IMPRESORAS",
    "campo": "IMPR_ANCHO_CARRO",
    "tipo": "DECIMAL(4,1)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 86
  },
  {
    "tabla": "MANTENCIONES",
    "campo": "MANT_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 114
  },
  {
    "tabla": "MANTENCIONES",
    "campo": "MANT_EQUIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 115
  },
  {
    "tabla": "MANTENCIONES",
    "campo": "MANT_ACTIVIDAD_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 116
  },
  {
    "tabla": "MANTENCIONES",
    "campo": "MANT_FECHA",
    "tipo": "DATE",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 117
  },
  {
    "tabla": "MANTENCIONES",
    "campo": "MANT_OBSERVACION",
    "tipo": "NVARCHAR(300)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 118
  },
  {
    "tabla": "MONITORES",
    "campo": "MONI_EQUIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 79
  },
  {
    "tabla": "MONITORES",
    "campo": "MONI_PULGADAS",
    "tipo": "DECIMAL(4,1)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 80
  },
  {
    "tabla": "SWITCHES",
    "campo": "SWIT_EQUIPO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 87
  },
  {
    "tabla": "SWITCHES",
    "campo": "SWIT_CANTIDAD_PUERTOS",
    "tipo": "SMALLINT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 88
  },
  {
    "tabla": "USUARIOS",
    "campo": "USUA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 26
  },
  {
    "tabla": "USUARIOS",
    "campo": "USUA_FUNCIONARIO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 27
  },
  {
    "tabla": "USUARIOS",
    "campo": "USUA_CLAVE_HASH",
    "tipo": "VARCHAR(255)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 28
  },
  {
    "tabla": "USUARIOS",
    "campo": "USUA_ACTIVO",
    "tipo": "BIT",
    "permite_null": false,
    "identity": false,
    "default": "1",
    "fila_excel": 29
  },
  {
    "tabla": "USUARIOS",
    "campo": "USUA_FECHA_CREACION",
    "tipo": "DATETIME2(7)",
    "permite_null": false,
    "identity": false,
    "default": "SYSUTCDATETIME()",
    "fila_excel": 30
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_ID",
    "tipo": "BIGINT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 34
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_USUARIO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 35
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_FECHA_HORA",
    "tipo": "DATETIME2(7)",
    "permite_null": false,
    "identity": false,
    "default": "SYSUTCDATETIME()",
    "fila_excel": 36
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_ACCION",
    "tipo": "NVARCHAR(20)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 37
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_ENTIDAD",
    "tipo": "NVARCHAR(60)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 38
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_ENTIDAD_ID",
    "tipo": "NVARCHAR(50)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 39
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_VALOR_ANTERIOR",
    "tipo": "NVARCHAR(MAX)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 40
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_VALOR_NUEVO",
    "tipo": "NVARCHAR(MAX)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 41
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_CONTEXTO",
    "tipo": "NVARCHAR(500)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 42
  },
  {
    "tabla": "AUDITORIA",
    "campo": "AUDI_DIRECCION_IP",
    "tipo": "NVARCHAR(45)",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 43
  },
  {
    "tabla": "AUTORIZACIONES",
    "campo": "AUTO_USUARIO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 31
  },
  {
    "tabla": "AUTORIZACIONES",
    "campo": "AUTO_PERFIL_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 32
  },
  {
    "tabla": "AUTORIZACIONES",
    "campo": "AUTO_FECHA_OTORGADO",
    "tipo": "DATETIME2(7)",
    "permite_null": false,
    "identity": false,
    "default": "SYSUTCDATETIME()",
    "fila_excel": 33
  },
  {
    "tabla": "INSUMOS_IMPRESORA",
    "campo": "INSU_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 98
  },
  {
    "tabla": "INSUMOS_IMPRESORA",
    "campo": "INSU_IMPRESORA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 99
  },
  {
    "tabla": "INSUMOS_IMPRESORA",
    "campo": "INSU_RUBRO_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 100
  },
  {
    "tabla": "INSUMOS_IMPRESORA",
    "campo": "INSU_CODIGO",
    "tipo": "NVARCHAR(30)",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 101
  },
  {
    "tabla": "PIEZAS_COMPUTADOR",
    "campo": "PIEZ_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": true,
    "default": "",
    "fila_excel": 91
  },
  {
    "tabla": "PIEZAS_COMPUTADOR",
    "campo": "PIEZ_COMPUTADOR_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 92
  },
  {
    "tabla": "PIEZAS_COMPUTADOR",
    "campo": "PIEZ_FAMILIA_ID",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 93
  },
  {
    "tabla": "PIEZAS_COMPUTADOR",
    "campo": "PIEZ_CAPACIDAD_GB",
    "tipo": "INT",
    "permite_null": false,
    "identity": false,
    "default": "",
    "fila_excel": 94
  },
  {
    "tabla": "PIEZAS_COMPUTADOR",
    "campo": "PIEZ_FECHA_ASIGNACION",
    "tipo": "DATE",
    "permite_null": true,
    "identity": false,
    "default": "",
    "fila_excel": 95
  }
] as const;
