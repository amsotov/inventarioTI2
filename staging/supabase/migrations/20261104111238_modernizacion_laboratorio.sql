-- Laboratorio PostgreSQL aislado: NO es SQL Server ni modifica sus candidatos.

-- Generado desde los 117 campos enmendados M6-A02/A03. Aplicar solo tras preflight del proyecto.

begin;
set local createrole_self_grant='set';

create schema laboratorio_ti;

create role inventario_modelo_lector nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role inventario_modelo_servicio nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;

create table laboratorio_ti.referencias(tabla text not null, id bigint not null, ref uuid not null default gen_random_uuid(), version bigint not null default 1 check(version>0), creado_en timestamptz not null default clock_timestamp(), primary key(tabla,id), unique(ref));

create table laboratorio_ti."ACTIVIDADES_MANTENCION" (
 "ACTI_ID" integer generated always as identity not null,
 "ACTI_NOMBRE" varchar(40) not null,
 constraint "PK_ACTIVIDADES_MANTENCION" PRIMARY KEY ("ACTI_ID"),
 constraint "UQ_ACTIVIDADES_MANTENCION_ACTI_NOMBRE" UNIQUE ("ACTI_NOMBRE")
);

create table laboratorio_ti."AREAS" (
 "AREA_ID" integer generated always as identity not null,
 "AREA_NOMBRE" varchar(100) not null,
 constraint "PK_AREAS" PRIMARY KEY ("AREA_ID"),
 constraint "UQ_AREAS_AREA_NOMBRE" UNIQUE ("AREA_NOMBRE")
);

create table laboratorio_ti."CLASES_IMPRESORA" (
 "CLAS_ID" integer generated always as identity not null,
 "CLAS_NOMBRE" varchar(30) not null,
 constraint "PK_CLASES_IMPRESORA" PRIMARY KEY ("CLAS_ID"),
 constraint "UQ_CLASES_IMPRESORA_CLAS_NOMBRE" UNIQUE ("CLAS_NOMBRE")
);

create table laboratorio_ti."DEPARTAMENTOS" (
 "DEPA_ID" integer generated always as identity not null,
 "DEPA_NOMBRE" varchar(80) not null,
 constraint "PK_DEPARTAMENTOS" PRIMARY KEY ("DEPA_ID"),
 constraint "UQ_DEPARTAMENTOS_DEPA_NOMBRE" UNIQUE ("DEPA_NOMBRE")
);

create table laboratorio_ti."ESTADOS_EQUIPO" (
 "ESTA_ID" integer generated always as identity not null,
 "ESTA_NOMBRE" varchar(30) not null,
 constraint "PK_ESTADOS_EQUIPO" PRIMARY KEY ("ESTA_ID"),
 constraint "UQ_ESTADOS_EQUIPO_ESTA_NOMBRE" UNIQUE ("ESTA_NOMBRE")
);

create table laboratorio_ti."FAMILIAS_COMPONENTE" (
 "FAMI_ID" integer generated always as identity not null,
 "FAMI_NOMBRE" varchar(30) not null,
 constraint "PK_FAMILIAS_COMPONENTE" PRIMARY KEY ("FAMI_ID"),
 constraint "UQ_FAMILIAS_COMPONENTE_FAMI_NOMBRE" UNIQUE ("FAMI_NOMBRE")
);

create table laboratorio_ti."MARCAS" (
 "MARC_ID" integer generated always as identity not null,
 "MARC_NOMBRE" varchar(60) not null,
 constraint "PK_MARCAS" PRIMARY KEY ("MARC_ID"),
 constraint "UQ_MARCAS_MARC_NOMBRE" UNIQUE ("MARC_NOMBRE")
);

create table laboratorio_ti."MODALIDADES_ASIGNACION" (
 "MODA_ID" integer generated always as identity not null,
 "MODA_NOMBRE" varchar(30) not null,
 constraint "PK_MODALIDADES_ASIGNACION" PRIMARY KEY ("MODA_ID"),
 constraint "UQ_MODALIDADES_ASIGNACION_MODA_NOMBRE" UNIQUE ("MODA_NOMBRE")
);

create table laboratorio_ti."ORIGENES_EQUIPO" (
 "ORIG_ID" integer generated always as identity not null,
 "ORIG_NOMBRE" varchar(30) not null,
 constraint "PK_ORIGENES_EQUIPO" PRIMARY KEY ("ORIG_ID"),
 constraint "UQ_ORIGENES_EQUIPO_ORIG_NOMBRE" UNIQUE ("ORIG_NOMBRE")
);

create table laboratorio_ti."PERFILES" (
 "PERF_ID" integer generated always as identity not null,
 "PERF_NOMBRE" varchar(30) not null,
 "PERF_NIVEL_ACCESO" smallint not null,
 "PERF_DESCRIPCION" varchar(200),
 constraint "PK_PERFILES" PRIMARY KEY ("PERF_ID"),
 constraint "UQ_PERFILES_PERF_NOMBRE" UNIQUE ("PERF_NOMBRE"),
 constraint "UQ_PERFILES_PERF_NIVEL_ACCESO" UNIQUE ("PERF_NIVEL_ACCESO")
);

create table laboratorio_ti."REGIONES" (
 "REGI_ID" integer generated always as identity not null,
 "REGI_NOMBRE" varchar(60) not null,
 constraint "PK_REGIONES" PRIMARY KEY ("REGI_ID"),
 constraint "UQ_REGIONES_REGI_NOMBRE" UNIQUE ("REGI_NOMBRE")
);

create table laboratorio_ti."RUBROS_INSUMO" (
 "RUBR_ID" integer generated always as identity not null,
 "RUBR_NOMBRE" varchar(40) not null,
 constraint "PK_RUBROS_INSUMO" PRIMARY KEY ("RUBR_ID"),
 constraint "UQ_RUBROS_INSUMO_RUBR_NOMBRE" UNIQUE ("RUBR_NOMBRE")
);

create table laboratorio_ti."SISTEMAS_OPERATIVOS" (
 "SIST_ID" integer generated always as identity not null,
 "SIST_NOMBRE" varchar(40) not null,
 constraint "PK_SISTEMAS_OPERATIVOS" PRIMARY KEY ("SIST_ID"),
 constraint "UQ_SISTEMAS_OPERATIVOS_SIST_NOMBRE" UNIQUE ("SIST_NOMBRE")
);

create table laboratorio_ti."SITUACIONES" (
 "SITU_ID" integer generated always as identity not null,
 "SITU_NOMBRE" varchar(30) not null,
 constraint "PK_SITUACIONES" PRIMARY KEY ("SITU_ID"),
 constraint "UQ_SITUACIONES_SITU_NOMBRE" UNIQUE ("SITU_NOMBRE")
);

create table laboratorio_ti."TIPOS_EQUIPO" (
 "TIPO_ID" integer generated always as identity not null,
 "TIPO_NOMBRE" varchar(40) not null,
 constraint "PK_TIPOS_EQUIPO" PRIMARY KEY ("TIPO_ID"),
 constraint "UQ_TIPOS_EQUIPO_TIPO_NOMBRE" UNIQUE ("TIPO_NOMBRE")
);

create table laboratorio_ti."DELEGACIONES" (
 "DELE_ID" integer generated always as identity not null,
 "DELE_REGION_ID" integer not null,
 "DELE_NOMBRE" varchar(60) not null,
 "DELE_DIRECCION" varchar(150),
 constraint "PK_DELEGACIONES" PRIMARY KEY ("DELE_ID")
);

create table laboratorio_ti."MODELOS" (
 "MODE_ID" integer generated always as identity not null,
 "MODE_MARCA_ID" integer not null,
 "MODE_NOMBRE" varchar(100) not null,
 constraint "PK_MODELOS" PRIMARY KEY ("MODE_ID")
);

create table laboratorio_ti."EQUIPOS" (
 "EQUI_ID" integer generated always as identity not null,
 "EQUI_TIPO_EQUIPO_ID" integer not null,
 "EQUI_MODELO_ID" integer,
 "EQUI_ORIGEN_ID" integer,
 "EQUI_ESTADO_ID" integer,
 "EQUI_SITUACION_ID" integer,
 "EQUI_NUMERO_SERIE" varchar(60),
 "EQUI_INVENTARIO_SERVIU" varchar(30),
 "EQUI_INVENTARIO_MINVU" varchar(30),
 "EQUI_DIRECCION_IP" varchar(45),
 "EQUI_TIENE_CANDADO" boolean,
 "EQUI_OBSERVACION" varchar(500),
 constraint "PK_EQUIPOS" PRIMARY KEY ("EQUI_ID")
);

create table laboratorio_ti."FUNCIONARIOS" (
 "FUNC_ID" integer generated always as identity not null,
 "FUNC_NOMBRE_COMPLETO" varchar(150) not null,
 "FUNC_USUARIO_RED" varchar(50),
 "FUNC_CORREO" varchar(150),
 "FUNC_DELEGACION_ID" integer not null,
 "FUNC_DEPARTAMENTO_ID" integer not null,
 "FUNC_AREA_ID" integer,
 "FUNC_CLAVE_IMPRESION" varchar(10),
 "FUNC_IMPRESION_DOBLE_CARA" boolean,
 "FUNC_ACTIVO" boolean not null default true,
 constraint "PK_FUNCIONARIOS" PRIMARY KEY ("FUNC_ID")
);

create table laboratorio_ti."ASIGNACIONES" (
 "ASIG_ID" integer generated always as identity not null,
 "ASIG_EQUIPO_ID" integer not null,
 "ASIG_FUNCIONARIO_ID" integer not null,
 "ASIG_MODALIDAD_ID" integer,
 "ASIG_FECHA_INICIO" date,
 "ASIG_FECHA_TERMINO" date,
 "ASIG_TRASPASO_DE_ID" integer,
 "ASIG_OBSERVACION" varchar(300),
 constraint "PK_ASIGNACIONES" PRIMARY KEY ("ASIG_ID")
);

create table laboratorio_ti."COMPUTADORES" (
 "COMP_EQUIPO_ID" integer not null,
 "COMP_ES_NOTEBOOK" boolean not null,
 "COMP_NOMBRE_RED" varchar(50) not null,
 "COMP_DIRECCION_MAC" varchar(17),
 "COMP_GUID" varchar(36),
 "COMP_PROCESADOR" varchar(100),
 "COMP_VELOCIDAD_GHZ" decimal(4,2),
 "COMP_SISTEMA_OPERATIVO_ID" integer,
 constraint "PK_COMPUTADORES" PRIMARY KEY ("COMP_EQUIPO_ID"),
 constraint "UQ_COMPUTADORES_COMP_NOMBRE_RED" UNIQUE ("COMP_NOMBRE_RED")
);

create table laboratorio_ti."IMPRESORAS" (
 "IMPR_EQUIPO_ID" integer not null,
 "IMPR_CLASE_ID" integer,
 "IMPR_DUPLEX" boolean,
 "IMPR_ANCHO_CARRO" decimal(4,1),
 constraint "PK_IMPRESORAS" PRIMARY KEY ("IMPR_EQUIPO_ID")
);

create table laboratorio_ti."MANTENCIONES" (
 "MANT_ID" integer generated always as identity not null,
 "MANT_EQUIPO_ID" integer not null,
 "MANT_ACTIVIDAD_ID" integer not null,
 "MANT_FECHA" date not null,
 "MANT_OBSERVACION" varchar(300),
 constraint "PK_MANTENCIONES" PRIMARY KEY ("MANT_ID")
);

create table laboratorio_ti."MONITORES" (
 "MONI_EQUIPO_ID" integer not null,
 "MONI_PULGADAS" decimal(4,1),
 constraint "PK_MONITORES" PRIMARY KEY ("MONI_EQUIPO_ID")
);

create table laboratorio_ti."SWITCHES" (
 "SWIT_EQUIPO_ID" integer not null,
 "SWIT_CANTIDAD_PUERTOS" smallint not null,
 constraint "PK_SWITCHES" PRIMARY KEY ("SWIT_EQUIPO_ID")
);

create table laboratorio_ti."USUARIOS" (
 "USUA_ID" integer generated always as identity not null,
 "USUA_FUNCIONARIO_ID" integer not null,
 "USUA_CLAVE_HASH" varchar(255),
 "USUA_ACTIVO" boolean not null default true,
 "USUA_FECHA_CREACION" timestamptz not null default clock_timestamp(),
 constraint "PK_USUARIOS" PRIMARY KEY ("USUA_ID"),
 constraint "UQ_USUARIOS_USUA_FUNCIONARIO_ID" UNIQUE ("USUA_FUNCIONARIO_ID")
);

create table laboratorio_ti."AUDITORIA" (
 "AUDI_ID" bigint generated always as identity not null,
 "AUDI_USUARIO_ID" integer not null,
 "AUDI_FECHA_HORA" timestamptz not null default clock_timestamp(),
 "AUDI_ACCION" varchar(20) not null,
 "AUDI_ENTIDAD" varchar(60),
 "AUDI_ENTIDAD_ID" varchar(50),
 "AUDI_VALOR_ANTERIOR" text,
 "AUDI_VALOR_NUEVO" text,
 "AUDI_CONTEXTO" varchar(500),
 "AUDI_DIRECCION_IP" varchar(45),
 constraint "PK_AUDITORIA" PRIMARY KEY ("AUDI_ID")
);

create table laboratorio_ti."AUTORIZACIONES" (
 "AUTO_USUARIO_ID" integer not null,
 "AUTO_PERFIL_ID" integer not null,
 "AUTO_FECHA_OTORGADO" timestamptz not null default clock_timestamp(),
 constraint "PK_AUTORIZACIONES" PRIMARY KEY ("AUTO_USUARIO_ID", "AUTO_PERFIL_ID")
);

create table laboratorio_ti."INSUMOS_IMPRESORA" (
 "INSU_ID" integer generated always as identity not null,
 "INSU_IMPRESORA_ID" integer not null,
 "INSU_RUBRO_ID" integer not null,
 "INSU_CODIGO" varchar(30) not null,
 constraint "PK_INSUMOS_IMPRESORA" PRIMARY KEY ("INSU_ID")
);

create table laboratorio_ti."PIEZAS_COMPUTADOR" (
 "PIEZ_ID" integer generated always as identity not null,
 "PIEZ_COMPUTADOR_ID" integer not null,
 "PIEZ_FAMILIA_ID" integer not null,
 "PIEZ_CAPACIDAD_GB" integer not null,
 "PIEZ_FECHA_ASIGNACION" date,
 constraint "PK_PIEZAS_COMPUTADOR" PRIMARY KEY ("PIEZ_ID")
);

alter table laboratorio_ti."DELEGACIONES" add foreign key ("DELE_REGION_ID") references laboratorio_ti."REGIONES"("REGI_ID") on delete no action on update no action;

alter table laboratorio_ti."FUNCIONARIOS" add foreign key ("FUNC_DELEGACION_ID") references laboratorio_ti."DELEGACIONES"("DELE_ID") on delete no action on update no action;

alter table laboratorio_ti."FUNCIONARIOS" add foreign key ("FUNC_DEPARTAMENTO_ID") references laboratorio_ti."DEPARTAMENTOS"("DEPA_ID") on delete no action on update no action;

alter table laboratorio_ti."FUNCIONARIOS" add foreign key ("FUNC_AREA_ID") references laboratorio_ti."AREAS"("AREA_ID") on delete no action on update no action;

alter table laboratorio_ti."USUARIOS" add foreign key ("USUA_FUNCIONARIO_ID") references laboratorio_ti."FUNCIONARIOS"("FUNC_ID") on delete no action on update no action;

alter table laboratorio_ti."AUTORIZACIONES" add foreign key ("AUTO_USUARIO_ID") references laboratorio_ti."USUARIOS"("USUA_ID") on delete no action on update no action;

alter table laboratorio_ti."AUTORIZACIONES" add foreign key ("AUTO_PERFIL_ID") references laboratorio_ti."PERFILES"("PERF_ID") on delete no action on update no action;

alter table laboratorio_ti."AUDITORIA" add foreign key ("AUDI_USUARIO_ID") references laboratorio_ti."USUARIOS"("USUA_ID") on delete no action on update no action;

alter table laboratorio_ti."MODELOS" add foreign key ("MODE_MARCA_ID") references laboratorio_ti."MARCAS"("MARC_ID") on delete no action on update no action;

alter table laboratorio_ti."EQUIPOS" add foreign key ("EQUI_TIPO_EQUIPO_ID") references laboratorio_ti."TIPOS_EQUIPO"("TIPO_ID") on delete no action on update no action;

alter table laboratorio_ti."EQUIPOS" add foreign key ("EQUI_MODELO_ID") references laboratorio_ti."MODELOS"("MODE_ID") on delete no action on update no action;

alter table laboratorio_ti."EQUIPOS" add foreign key ("EQUI_ORIGEN_ID") references laboratorio_ti."ORIGENES_EQUIPO"("ORIG_ID") on delete no action on update no action;

alter table laboratorio_ti."EQUIPOS" add foreign key ("EQUI_ESTADO_ID") references laboratorio_ti."ESTADOS_EQUIPO"("ESTA_ID") on delete no action on update no action;

alter table laboratorio_ti."EQUIPOS" add foreign key ("EQUI_SITUACION_ID") references laboratorio_ti."SITUACIONES"("SITU_ID") on delete no action on update no action;

alter table laboratorio_ti."COMPUTADORES" add foreign key ("COMP_EQUIPO_ID") references laboratorio_ti."EQUIPOS"("EQUI_ID") on delete no action on update no action;

alter table laboratorio_ti."COMPUTADORES" add foreign key ("COMP_SISTEMA_OPERATIVO_ID") references laboratorio_ti."SISTEMAS_OPERATIVOS"("SIST_ID") on delete no action on update no action;

alter table laboratorio_ti."MONITORES" add foreign key ("MONI_EQUIPO_ID") references laboratorio_ti."EQUIPOS"("EQUI_ID") on delete no action on update no action;

alter table laboratorio_ti."IMPRESORAS" add foreign key ("IMPR_EQUIPO_ID") references laboratorio_ti."EQUIPOS"("EQUI_ID") on delete no action on update no action;

alter table laboratorio_ti."IMPRESORAS" add foreign key ("IMPR_CLASE_ID") references laboratorio_ti."CLASES_IMPRESORA"("CLAS_ID") on delete no action on update no action;

alter table laboratorio_ti."SWITCHES" add foreign key ("SWIT_EQUIPO_ID") references laboratorio_ti."EQUIPOS"("EQUI_ID") on delete no action on update no action;

alter table laboratorio_ti."PIEZAS_COMPUTADOR" add foreign key ("PIEZ_COMPUTADOR_ID") references laboratorio_ti."COMPUTADORES"("COMP_EQUIPO_ID") on delete no action on update no action;

alter table laboratorio_ti."PIEZAS_COMPUTADOR" add foreign key ("PIEZ_FAMILIA_ID") references laboratorio_ti."FAMILIAS_COMPONENTE"("FAMI_ID") on delete no action on update no action;

alter table laboratorio_ti."INSUMOS_IMPRESORA" add foreign key ("INSU_IMPRESORA_ID") references laboratorio_ti."IMPRESORAS"("IMPR_EQUIPO_ID") on delete no action on update no action;

alter table laboratorio_ti."INSUMOS_IMPRESORA" add foreign key ("INSU_RUBRO_ID") references laboratorio_ti."RUBROS_INSUMO"("RUBR_ID") on delete no action on update no action;

alter table laboratorio_ti."ASIGNACIONES" add foreign key ("ASIG_EQUIPO_ID") references laboratorio_ti."EQUIPOS"("EQUI_ID") on delete no action on update no action;

alter table laboratorio_ti."ASIGNACIONES" add foreign key ("ASIG_FUNCIONARIO_ID") references laboratorio_ti."FUNCIONARIOS"("FUNC_ID") on delete no action on update no action;

alter table laboratorio_ti."ASIGNACIONES" add foreign key ("ASIG_MODALIDAD_ID") references laboratorio_ti."MODALIDADES_ASIGNACION"("MODA_ID") on delete no action on update no action;

alter table laboratorio_ti."ASIGNACIONES" add foreign key ("ASIG_TRASPASO_DE_ID") references laboratorio_ti."ASIGNACIONES"("ASIG_ID") on delete no action on update no action;

alter table laboratorio_ti."MANTENCIONES" add foreign key ("MANT_EQUIPO_ID") references laboratorio_ti."EQUIPOS"("EQUI_ID") on delete no action on update no action;

alter table laboratorio_ti."MANTENCIONES" add foreign key ("MANT_ACTIVIDAD_ID") references laboratorio_ti."ACTIVIDADES_MANTENCION"("ACTI_ID") on delete no action on update no action;

create function laboratorio_ti.registrar_referencia() returns trigger language plpgsql set search_path=pg_catalog as $$
begin insert into laboratorio_ti.referencias(tabla,id) values(TG_TABLE_NAME,(to_jsonb(NEW)->>TG_ARGV[0])::bigint);return NEW;end $$;

create trigger registrar_ref after insert on laboratorio_ti."ACTIVIDADES_MANTENCION" for each row execute function laboratorio_ti.registrar_referencia('ACTI_ID');

create trigger registrar_ref after insert on laboratorio_ti."AREAS" for each row execute function laboratorio_ti.registrar_referencia('AREA_ID');

create trigger registrar_ref after insert on laboratorio_ti."CLASES_IMPRESORA" for each row execute function laboratorio_ti.registrar_referencia('CLAS_ID');

create trigger registrar_ref after insert on laboratorio_ti."DEPARTAMENTOS" for each row execute function laboratorio_ti.registrar_referencia('DEPA_ID');

create trigger registrar_ref after insert on laboratorio_ti."ESTADOS_EQUIPO" for each row execute function laboratorio_ti.registrar_referencia('ESTA_ID');

create trigger registrar_ref after insert on laboratorio_ti."FAMILIAS_COMPONENTE" for each row execute function laboratorio_ti.registrar_referencia('FAMI_ID');

create trigger registrar_ref after insert on laboratorio_ti."MARCAS" for each row execute function laboratorio_ti.registrar_referencia('MARC_ID');

create trigger registrar_ref after insert on laboratorio_ti."MODALIDADES_ASIGNACION" for each row execute function laboratorio_ti.registrar_referencia('MODA_ID');

create trigger registrar_ref after insert on laboratorio_ti."ORIGENES_EQUIPO" for each row execute function laboratorio_ti.registrar_referencia('ORIG_ID');

create trigger registrar_ref after insert on laboratorio_ti."PERFILES" for each row execute function laboratorio_ti.registrar_referencia('PERF_ID');

create trigger registrar_ref after insert on laboratorio_ti."REGIONES" for each row execute function laboratorio_ti.registrar_referencia('REGI_ID');

create trigger registrar_ref after insert on laboratorio_ti."RUBROS_INSUMO" for each row execute function laboratorio_ti.registrar_referencia('RUBR_ID');

create trigger registrar_ref after insert on laboratorio_ti."SISTEMAS_OPERATIVOS" for each row execute function laboratorio_ti.registrar_referencia('SIST_ID');

create trigger registrar_ref after insert on laboratorio_ti."SITUACIONES" for each row execute function laboratorio_ti.registrar_referencia('SITU_ID');

create trigger registrar_ref after insert on laboratorio_ti."TIPOS_EQUIPO" for each row execute function laboratorio_ti.registrar_referencia('TIPO_ID');

create trigger registrar_ref after insert on laboratorio_ti."DELEGACIONES" for each row execute function laboratorio_ti.registrar_referencia('DELE_ID');

create trigger registrar_ref after insert on laboratorio_ti."MODELOS" for each row execute function laboratorio_ti.registrar_referencia('MODE_ID');

create trigger registrar_ref after insert on laboratorio_ti."EQUIPOS" for each row execute function laboratorio_ti.registrar_referencia('EQUI_ID');

create trigger registrar_ref after insert on laboratorio_ti."FUNCIONARIOS" for each row execute function laboratorio_ti.registrar_referencia('FUNC_ID');

create trigger registrar_ref after insert on laboratorio_ti."ASIGNACIONES" for each row execute function laboratorio_ti.registrar_referencia('ASIG_ID');

create trigger registrar_ref after insert on laboratorio_ti."COMPUTADORES" for each row execute function laboratorio_ti.registrar_referencia('COMP_EQUIPO_ID');

create trigger registrar_ref after insert on laboratorio_ti."IMPRESORAS" for each row execute function laboratorio_ti.registrar_referencia('IMPR_EQUIPO_ID');

create trigger registrar_ref after insert on laboratorio_ti."MANTENCIONES" for each row execute function laboratorio_ti.registrar_referencia('MANT_ID');

create trigger registrar_ref after insert on laboratorio_ti."MONITORES" for each row execute function laboratorio_ti.registrar_referencia('MONI_EQUIPO_ID');

create trigger registrar_ref after insert on laboratorio_ti."SWITCHES" for each row execute function laboratorio_ti.registrar_referencia('SWIT_EQUIPO_ID');

create trigger registrar_ref after insert on laboratorio_ti."USUARIOS" for each row execute function laboratorio_ti.registrar_referencia('USUA_ID');

create trigger registrar_ref after insert on laboratorio_ti."AUDITORIA" for each row execute function laboratorio_ti.registrar_referencia('AUDI_ID');

create trigger registrar_ref after insert on laboratorio_ti."INSUMOS_IMPRESORA" for each row execute function laboratorio_ti.registrar_referencia('INSU_ID');

create trigger registrar_ref after insert on laboratorio_ti."PIEZAS_COMPUTADOR" for each row execute function laboratorio_ti.registrar_referencia('PIEZ_ID');

create table laboratorio_ti.equipo_soporte(
 equipo_id integer primary key references laboratorio_ti."EQUIPOS"("EQUI_ID"), codigo_operativo text not null check(length(btrim(codigo_operativo)) between 1 and 2000),
 motivo_sin_serie text, adquisicion date, serie_original text, inventario_serviu_original text, inventario_minvu_original text, observacion_original text);
create unique index equipo_codigo_unico on laboratorio_ti.equipo_soporte(upper(btrim(codigo_operativo)));
create table laboratorio_ti.funcionario_soporte(
 funcionario_id integer primary key references laboratorio_ti."FUNCIONARIOS"("FUNC_ID"), documento_tipo text not null check(documento_tipo in ('ID','RUT')), documento text not null, cargo text not null,
 correo_original text, unique(documento_tipo,documento));
create table laboratorio_ti.usuario_auth(cuenta_id uuid primary key references inventario.cuentas(id), usuario_id integer not null unique references laboratorio_ti."USUARIOS"("USUA_ID"));
create table laboratorio_ti.asignacion_soporte(asignacion_id integer primary key references laboratorio_ti."ASIGNACIONES"("ASIG_ID"),inicio_utc timestamptz,fin_utc timestamptz,precision_temporal text not null check(precision_temporal in ('instante','dia','desconocida')));
create unique index custodia_actual_unica on laboratorio_ti."ASIGNACIONES"("ASIG_EQUIPO_ID") where "ASIG_FECHA_TERMINO" is null;
create table laboratorio_ti.movimientos(id bigint generated always as identity primary key,equipo_id integer not null references laboratorio_ti."EQUIPOS"("EQUI_ID"),tipo text not null,
 origen_id integer references laboratorio_ti."FUNCIONARIOS"("FUNC_ID"),destino_id integer references laboratorio_ti."FUNCIONARIOS"("FUNC_ID"),condicion_anterior integer references laboratorio_ti."ESTADOS_EQUIPO"("ESTA_ID"),condicion_nueva integer references laboratorio_ti."ESTADOS_EQUIPO"("ESTA_ID"),
 efectiva_en timestamptz not null default clock_timestamp(),registrada_en timestamptz not null default clock_timestamp(),motivo text not null,actor_id uuid not null references inventario.cuentas(id),comando_id uuid not null references inventario.comandos(id));
create table laboratorio_ti.anotaciones(id bigint generated always as identity primary key,movimiento_id bigint not null references laboratorio_ti.movimientos(id),texto text not null,registrada_en timestamptz not null default clock_timestamp());
create table laboratorio_ti.mantencion_soporte(mantencion_id integer primary key references laboratorio_ti."MANTENCIONES"("MANT_ID"),registrado_en timestamptz not null default clock_timestamp());
create table laboratorio_ti.pertenencias(id bigint generated always as identity primary key,funcionario_id integer not null references laboratorio_ti."FUNCIONARIOS"("FUNC_ID"),anterior jsonb,nueva jsonb not null,registrada_en timestamptz not null default clock_timestamp(),actor_id uuid not null references inventario.cuentas(id),comando_id uuid not null references inventario.comandos(id));

-- El vínculo de cuenta es explícito; no se infiere por nombre/correo. Contexto privado sin LOGIN.
grant usage on schema laboratorio_ti to inventario_contexto,inventario_runtime,inventario_modelo_servicio;
grant select on laboratorio_ti.usuario_auth,laboratorio_ti."USUARIOS",laboratorio_ti."FUNCIONARIOS" to inventario_contexto;
create function laboratorio_ti.usuario_actual() returns integer language sql stable security definer set search_path=pg_catalog as $$
 select u."USUA_ID" from laboratorio_ti.usuario_auth a join laboratorio_ti."USUARIOS" u on u."USUA_ID"=a.usuario_id
 join laboratorio_ti."FUNCIONARIOS" f on f."FUNC_ID"=u."USUA_FUNCIONARIO_ID"
 where a.cuenta_id=(select actor_id from seguridad.principal()) and u."USUA_ACTIVO" and f."FUNC_ACTIVO"
$$;
revoke all on function laboratorio_ti.usuario_actual() from public,anon,authenticated;
grant execute on function laboratorio_ti.usuario_actual() to inventario_runtime,inventario_modelo_servicio,inventario_modelo_lector;
grant create on schema laboratorio_ti to inventario_contexto;
alter function laboratorio_ti.usuario_actual() owner to inventario_contexto;
revoke create on schema laboratorio_ti from inventario_contexto;
grant usage on schema seguridad,inventario to inventario_modelo_servicio;
set local role inventario_contexto;
grant execute on function seguridad.principal() to inventario_modelo_servicio,inventario_modelo_lector;
reset role;
grant select on inventario.configuracion_avisos,inventario.comandos to inventario_modelo_servicio;
grant insert on inventario.comandos,inventario.auditoria,inventario.outbox to inventario_modelo_servicio;
grant select(id) on inventario.auditoria to inventario_modelo_servicio;
grant usage on sequence inventario.auditoria_id_seq to inventario_modelo_servicio;
create policy modelo_servicio_comandos on inventario.comandos to inventario_modelo_servicio using(exists(select 1 from seguridad.principal() p where p.rol='administrador')) with check(exists(select 1 from seguridad.principal() p where p.rol='administrador'));
create policy modelo_servicio_auditoria on inventario.auditoria to inventario_modelo_servicio using(exists(select 1 from seguridad.principal() p where p.rol='administrador')) with check(exists(select 1 from seguridad.principal() p where p.rol='administrador'));
create policy modelo_servicio_outbox on inventario.outbox to inventario_modelo_servicio using(exists(select 1 from seguridad.principal() p where p.rol='administrador')) with check(exists(select 1 from seguridad.principal() p where p.rol='administrador'));
create policy modelo_servicio_destino on inventario.configuracion_avisos for select to inventario_modelo_servicio using(true);
-- Privilegios de dominio para el servicio, no DML genérico para runtime.
grant usage on schema laboratorio_ti,seguridad to inventario_modelo_lector;

grant select on all tables in schema laboratorio_ti to inventario_modelo_lector;
grant select,insert,update on all tables in schema laboratorio_ti to inventario_modelo_servicio;
grant usage on all sequences in schema laboratorio_ti to inventario_modelo_servicio;
do $$ declare t text;begin for t in select tablename from pg_tables where schemaname='laboratorio_ti' loop
 execute format('alter table laboratorio_ti.%I enable row level security',t);
 execute format('alter table laboratorio_ti.%I force row level security',t);
 execute format('create policy lectura on laboratorio_ti.%I for select to inventario_modelo_lector using(laboratorio_ti.usuario_actual() is not null)',t);
 execute format('create policy servicio on laboratorio_ti.%I to inventario_modelo_servicio using(laboratorio_ti.usuario_actual() is not null and exists(select 1 from seguridad.principal() p where p.rol=''administrador'')) with check(laboratorio_ti.usuario_actual() is not null and exists(select 1 from seguridad.principal() p where p.rol=''administrador''))',t);
 end loop;
 foreach t in array array['usuario_auth','USUARIOS','FUNCIONARIOS'] loop execute format('create policy contexto on laboratorio_ti.%I for select to inventario_contexto using(true)',t);end loop;
end $$;
revoke all on schema laboratorio_ti from public,anon,authenticated;
revoke all on all tables in schema laboratorio_ti from public,anon,authenticated;
revoke all on all sequences in schema laboratorio_ti from public,anon,authenticated;



-- Configuración exclusiva del ensayo; no decide la política productiva de subtipos.
create table laboratorio_ti.tipo_reglas(tipo_id integer primary key references laboratorio_ti."TIPOS_EQUIPO"("TIPO_ID"),subtipo text not null check(subtipo in ('computador','monitor','impresora','switch')),es_notebook boolean);
alter table laboratorio_ti.tipo_reglas enable row level security;
alter table laboratorio_ti.tipo_reglas force row level security;
create policy lectura on laboratorio_ti.tipo_reglas for select to inventario_modelo_lector,inventario_modelo_servicio using(laboratorio_ti.usuario_actual() is not null);
grant select on laboratorio_ti.tipo_reglas to inventario_modelo_lector,inventario_modelo_servicio;
create function laboratorio_ti.ref(t text,n bigint) returns uuid language sql stable set search_path=pg_catalog as $$ select ref from laboratorio_ti.referencias where tabla=t and id=n $$;
create function laboratorio_ti.id(t text,r text) returns integer language plpgsql stable set search_path=pg_catalog as $$
declare n integer;begin if r is null then return null;end if;
select id into n from laboratorio_ti.referencias where tabla=t and ref=r::uuid;
if n is null then raise exception 'BUSINESS_RULE';end if;return n;end $$;
create function laboratorio_ti.tecnica(n integer) returns jsonb language sql stable set search_path=pg_catalog as $$
 select case
 when c."COMP_EQUIPO_ID" is not null then jsonb_build_object('subtipo','computador','nombreRed',c."COMP_NOMBRE_RED",'esNotebook',c."COMP_ES_NOTEBOOK",'sistemaOperativoRef',laboratorio_ti.ref('SISTEMAS_OPERATIVOS',c."COMP_SISTEMA_OPERATIVO_ID"),'procesador',c."COMP_PROCESADOR",'velocidadGhz',c."COMP_VELOCIDAD_GHZ",'direccionMac',c."COMP_DIRECCION_MAC",'guid',c."COMP_GUID",'piezas',coalesce((select jsonb_agg(jsonb_build_object('familiaRef',laboratorio_ti.ref('FAMILIAS_COMPONENTE',p."PIEZ_FAMILIA_ID"),'capacidadGb',p."PIEZ_CAPACIDAD_GB") order by p."PIEZ_ID") from laboratorio_ti."PIEZAS_COMPUTADOR" p where p."PIEZ_COMPUTADOR_ID"=n),'[]'::jsonb))
 when m."MONI_EQUIPO_ID" is not null then jsonb_build_object('subtipo','monitor','pulgadas',m."MONI_PULGADAS")
 when i."IMPR_EQUIPO_ID" is not null then jsonb_build_object('subtipo','impresora','claseRef',laboratorio_ti.ref('CLASES_IMPRESORA',i."IMPR_CLASE_ID"),'duplex',i."IMPR_DUPLEX",'anchoCarro',i."IMPR_ANCHO_CARRO",'insumos',coalesce((select jsonb_agg(jsonb_build_object('rubroRef',laboratorio_ti.ref('RUBROS_INSUMO',s."INSU_RUBRO_ID"),'codigo',s."INSU_CODIGO") order by s."INSU_ID") from laboratorio_ti."INSUMOS_IMPRESORA" s where s."INSU_IMPRESORA_ID"=n),'[]'::jsonb))
 when w."SWIT_EQUIPO_ID" is not null then jsonb_build_object('subtipo','switch','cantidadPuertos',w."SWIT_CANTIDAD_PUERTOS") else null end
 from laboratorio_ti."EQUIPOS" e
 left join laboratorio_ti."COMPUTADORES" c on c."COMP_EQUIPO_ID"=e."EQUI_ID"
 left join laboratorio_ti."MONITORES" m on m."MONI_EQUIPO_ID"=e."EQUI_ID"
 left join laboratorio_ti."IMPRESORAS" i on i."IMPR_EQUIPO_ID"=e."EQUI_ID"
 left join laboratorio_ti."SWITCHES" w on w."SWIT_EQUIPO_ID"=e."EQUI_ID" where e."EQUI_ID"=n
$$;
create function laboratorio_ti.equipo(n integer,detalle boolean default false) returns jsonb language sql stable set search_path=pg_catalog as $$
 select jsonb_build_object('ref',r.ref,'codigoOperativo',s.codigo_operativo,'tipoRef',laboratorio_ti.ref('TIPOS_EQUIPO',e."EQUI_TIPO_EQUIPO_ID"),'modeloRef',laboratorio_ti.ref('MODELOS',e."EQUI_MODELO_ID"),'condicionRef',laboratorio_ti.ref('ESTADOS_EQUIPO',e."EQUI_ESTADO_ID"),'situacionRef',laboratorio_ti.ref('SITUACIONES',e."EQUI_SITUACION_ID"),'custodioRef',(select laboratorio_ti.ref('FUNCIONARIOS',a."ASIG_FUNCIONARIO_ID") from laboratorio_ti."ASIGNACIONES" a where a."ASIG_EQUIPO_ID"=n and a."ASIG_FECHA_TERMINO" is null),'version',r.version::text)
 ||case when detalle then jsonb_build_object('tecnica',laboratorio_ti.tecnica(n),'origenRef',laboratorio_ti.ref('ORIGENES_EQUIPO',e."EQUI_ORIGEN_ID"),'numeroSerie',coalesce(s.serie_original,e."EQUI_NUMERO_SERIE"),'motivoSinSerie',s.motivo_sin_serie,'inventarioServiu',coalesce(s.inventario_serviu_original,e."EQUI_INVENTARIO_SERVIU"),'inventarioMinvu',coalesce(s.inventario_minvu_original,e."EQUI_INVENTARIO_MINVU"),'adquisicion',s.adquisicion,'observacion',coalesce(s.observacion_original,e."EQUI_OBSERVACION")) else '{}'::jsonb end
 from laboratorio_ti."EQUIPOS" e join laboratorio_ti.equipo_soporte s on s.equipo_id=e."EQUI_ID" join laboratorio_ti.referencias r on r.tabla='EQUIPOS' and r.id=n where e."EQUI_ID"=n
$$;
create function laboratorio_ti.funcionario(n integer,privado boolean default false) returns jsonb language sql stable set search_path=pg_catalog as $$
 select jsonb_build_object('ref',r.ref,'nombre',f."FUNC_NOMBRE_COMPLETO",'cargo',s.cargo,'organizacion',jsonb_build_object('delegacionRef',laboratorio_ti.ref('DELEGACIONES',f."FUNC_DELEGACION_ID"),'departamentoRef',laboratorio_ti.ref('DEPARTAMENTOS',f."FUNC_DEPARTAMENTO_ID"),'areaRef',laboratorio_ti.ref('AREAS',f."FUNC_AREA_ID")),'activo',f."FUNC_ACTIVO",'version',r.version::text)
 ||case when privado then jsonb_build_object('documentoTipo',s.documento_tipo,'documento',s.documento,'correo',coalesce(s.correo_original,f."FUNC_CORREO")) else '{}'::jsonb end
 from laboratorio_ti."FUNCIONARIOS" f join laboratorio_ti.funcionario_soporte s on s.funcionario_id=f."FUNC_ID" join laboratorio_ti.referencias r on r.tabla='FUNCIONARIOS' and r.id=n where f."FUNC_ID"=n
$$;
create function laboratorio_ti.asignacion(n integer) returns jsonb language sql stable set search_path=pg_catalog as $$
 select jsonb_build_object('ref',laboratorio_ti.ref('ASIGNACIONES',n),'equipoRef',laboratorio_ti.ref('EQUIPOS',a."ASIG_EQUIPO_ID"),'funcionarioRef',laboratorio_ti.ref('FUNCIONARIOS',a."ASIG_FUNCIONARIO_ID"),'inicio',s.inicio_utc,'fin',s.fin_utc,'fechaOrigen',case when s.precision_temporal='instante' then null else a."ASIG_FECHA_INICIO" end,'precisionTemporal',coalesce(s.precision_temporal,case when a."ASIG_FECHA_INICIO" is null then 'desconocida' else 'dia' end),'traspasoDeRef',laboratorio_ti.ref('ASIGNACIONES',a."ASIG_TRASPASO_DE_ID"),'vigente',a."ASIG_FECHA_TERMINO" is null)
 from laboratorio_ti."ASIGNACIONES" a left join laboratorio_ti.asignacion_soporte s on s.asignacion_id=n where a."ASIG_ID"=n
$$;
create function laboratorio_ti.mantencion(n integer) returns jsonb language sql stable set search_path=pg_catalog as $$
 select jsonb_build_object('ref',laboratorio_ti.ref('MANTENCIONES',n),'equipoRef',laboratorio_ti.ref('EQUIPOS',m."MANT_EQUIPO_ID"),'actividadRef',laboratorio_ti.ref('ACTIVIDADES_MANTENCION',m."MANT_ACTIVIDAD_ID"),'fecha',m."MANT_FECHA",'observacion',m."MANT_OBSERVACION",'registradoEn',s.registrado_en)
 from laboratorio_ti."MANTENCIONES" m join laboratorio_ti.mantencion_soporte s on s.mantencion_id=n where m."MANT_ID"=n
$$;

create function laboratorio_ti.consultar(op text,recurso uuid,familia text,q jsonb,pos bigint,lim integer) returns jsonb language plpgsql stable security definer set search_path=pg_catalog as $$
declare n integer; filas jsonb; resultado jsonb;begin
 if laboratorio_ti.usuario_actual() is null then raise exception 'FORBIDDEN';end if;
 if lim not between 1 and 101 or pos<0 then raise exception 'INVALID_REQUEST';end if;
 if op in ('C03-01','C03-18') then
 case familia
 when 'tipos-equipo' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."TIPO_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('TIPOS_EQUIPO',t."TIPO_ID"),'nombre',t."TIPO_NOMBRE") data from laboratorio_ti."TIPOS_EQUIPO" t where t."TIPO_ID">pos and (q->>'q' is null or strpos(lower(t."TIPO_NOMBRE"),lower(q->>'q'))>0) order by t."TIPO_ID" limit lim)z;
 when 'marcas' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."MARC_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('MARCAS',t."MARC_ID"),'nombre',t."MARC_NOMBRE") data from laboratorio_ti."MARCAS" t where t."MARC_ID">pos and (q->>'q' is null or strpos(lower(t."MARC_NOMBRE"),lower(q->>'q'))>0) order by t."MARC_ID" limit lim)z;
 when 'modelos' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."MODE_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('MODELOS',t."MODE_ID"),'nombre',t."MODE_NOMBRE",'marcaRef',laboratorio_ti.ref('MARCAS',t."MODE_MARCA_ID")) data from laboratorio_ti."MODELOS" t where t."MODE_ID">pos and (q->>'q' is null or strpos(lower(t."MODE_NOMBRE"),lower(q->>'q'))>0) and (q->>'marcaRef' is null or t."MODE_MARCA_ID"=laboratorio_ti.id('MARCAS',q->>'marcaRef')) order by t."MODE_ID" limit lim)z;
 when 'origenes' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."ORIG_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('ORIGENES_EQUIPO',t."ORIG_ID"),'nombre',t."ORIG_NOMBRE") data from laboratorio_ti."ORIGENES_EQUIPO" t where t."ORIG_ID">pos and (q->>'q' is null or strpos(lower(t."ORIG_NOMBRE"),lower(q->>'q'))>0) order by t."ORIG_ID" limit lim)z;
 when 'estados' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."ESTA_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('ESTADOS_EQUIPO',t."ESTA_ID"),'nombre',t."ESTA_NOMBRE") data from laboratorio_ti."ESTADOS_EQUIPO" t where t."ESTA_ID">pos and (q->>'q' is null or strpos(lower(t."ESTA_NOMBRE"),lower(q->>'q'))>0) order by t."ESTA_ID" limit lim)z;
 when 'situaciones' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."SITU_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('SITUACIONES',t."SITU_ID"),'nombre',t."SITU_NOMBRE") data from laboratorio_ti."SITUACIONES" t where t."SITU_ID">pos and (q->>'q' is null or strpos(lower(t."SITU_NOMBRE"),lower(q->>'q'))>0) order by t."SITU_ID" limit lim)z;
 when 'sistemas-operativos' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."SIST_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('SISTEMAS_OPERATIVOS',t."SIST_ID"),'nombre',t."SIST_NOMBRE") data from laboratorio_ti."SISTEMAS_OPERATIVOS" t where t."SIST_ID">pos and (q->>'q' is null or strpos(lower(t."SIST_NOMBRE"),lower(q->>'q'))>0) order by t."SIST_ID" limit lim)z;
 when 'clases-impresora' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."CLAS_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('CLASES_IMPRESORA',t."CLAS_ID"),'nombre',t."CLAS_NOMBRE") data from laboratorio_ti."CLASES_IMPRESORA" t where t."CLAS_ID">pos and (q->>'q' is null or strpos(lower(t."CLAS_NOMBRE"),lower(q->>'q'))>0) order by t."CLAS_ID" limit lim)z;
 when 'familias-componente' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."FAMI_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('FAMILIAS_COMPONENTE',t."FAMI_ID"),'nombre',t."FAMI_NOMBRE") data from laboratorio_ti."FAMILIAS_COMPONENTE" t where t."FAMI_ID">pos and (q->>'q' is null or strpos(lower(t."FAMI_NOMBRE"),lower(q->>'q'))>0) order by t."FAMI_ID" limit lim)z;
 when 'rubros-insumo' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."RUBR_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('RUBROS_INSUMO',t."RUBR_ID"),'nombre',t."RUBR_NOMBRE") data from laboratorio_ti."RUBROS_INSUMO" t where t."RUBR_ID">pos and (q->>'q' is null or strpos(lower(t."RUBR_NOMBRE"),lower(q->>'q'))>0) order by t."RUBR_ID" limit lim)z;
 when 'modalidades-asignacion' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."MODA_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('MODALIDADES_ASIGNACION',t."MODA_ID"),'nombre',t."MODA_NOMBRE") data from laboratorio_ti."MODALIDADES_ASIGNACION" t where t."MODA_ID">pos and (q->>'q' is null or strpos(lower(t."MODA_NOMBRE"),lower(q->>'q'))>0) order by t."MODA_ID" limit lim)z;
 when 'actividades-mantencion' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."ACTI_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('ACTIVIDADES_MANTENCION',t."ACTI_ID"),'nombre',t."ACTI_NOMBRE") data from laboratorio_ti."ACTIVIDADES_MANTENCION" t where t."ACTI_ID">pos and (q->>'q' is null or strpos(lower(t."ACTI_NOMBRE"),lower(q->>'q'))>0) order by t."ACTI_ID" limit lim)z;
 when 'regiones' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."REGI_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('REGIONES',t."REGI_ID"),'nombre',t."REGI_NOMBRE") data from laboratorio_ti."REGIONES" t where t."REGI_ID">pos and (q->>'q' is null or strpos(lower(t."REGI_NOMBRE"),lower(q->>'q'))>0) order by t."REGI_ID" limit lim)z;
 when 'delegaciones' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."DELE_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('DELEGACIONES',t."DELE_ID"),'nombre',t."DELE_NOMBRE") data from laboratorio_ti."DELEGACIONES" t where t."DELE_ID">pos and (q->>'q' is null or strpos(lower(t."DELE_NOMBRE"),lower(q->>'q'))>0) order by t."DELE_ID" limit lim)z;
 when 'departamentos' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."DEPA_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('DEPARTAMENTOS',t."DEPA_ID"),'nombre',t."DEPA_NOMBRE") data from laboratorio_ti."DEPARTAMENTOS" t where t."DEPA_ID">pos and (q->>'q' is null or strpos(lower(t."DEPA_NOMBRE"),lower(q->>'q'))>0) order by t."DEPA_ID" limit lim)z;
 when 'areas' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select t."AREA_ID" id,jsonb_build_object('ref',laboratorio_ti.ref('AREAS',t."AREA_ID"),'nombre',t."AREA_NOMBRE") data from laboratorio_ti."AREAS" t where t."AREA_ID">pos and (q->>'q' is null or strpos(lower(t."AREA_NOMBRE"),lower(q->>'q'))>0) order by t."AREA_ID" limit lim)z;
 else raise exception 'INVALID_REQUEST';end case; return filas;
 elsif op in ('C03-04','C03-13','C03-14') then
 if op='C03-14' and not exists(select 1 from seguridad.principal() where rol='administrador') then raise exception 'FORBIDDEN';end if;
 select id into n from laboratorio_ti.referencias where ref=recurso and tabla=case when op='C03-04' then 'EQUIPOS' else 'FUNCIONARIOS' end;
 if n is null then raise exception 'NOT_FOUND';end if;
 resultado=case when op='C03-04' then laboratorio_ti.equipo(n,true) else laboratorio_ti.funcionario(n,op='C03-14') end;
 if resultado is null then raise exception 'NOT_FOUND';end if;return resultado;
 elsif op='C03-02' then
 select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select e."EQUI_ID" id,laboratorio_ti.equipo(e."EQUI_ID") data from laboratorio_ti."EQUIPOS" e join laboratorio_ti.equipo_soporte s on s.equipo_id=e."EQUI_ID"
 left join laboratorio_ti."ASIGNACIONES" a on a."ASIG_EQUIPO_ID"=e."EQUI_ID" and a."ASIG_FECHA_TERMINO" is null
 left join laboratorio_ti."FUNCIONARIOS" f on f."FUNC_ID"=a."ASIG_FUNCIONARIO_ID"
 where e."EQUI_ID">pos and (q->>'q' is null or strpos(lower(s.codigo_operativo),lower(q->>'q'))>0)
 and (q->>'tipoRef' is null or e."EQUI_TIPO_EQUIPO_ID"=laboratorio_ti.id('TIPOS_EQUIPO',q->>'tipoRef'))
 and (q->>'condicionRef' is null or e."EQUI_ESTADO_ID"=laboratorio_ti.id('ESTADOS_EQUIPO',q->>'condicionRef'))
 and (q->>'situacionRef' is null or e."EQUI_SITUACION_ID"=laboratorio_ti.id('SITUACIONES',q->>'situacionRef'))
 and (q->>'funcionarioRef' is null or a."ASIG_FUNCIONARIO_ID"=laboratorio_ti.id('FUNCIONARIOS',q->>'funcionarioRef'))
 and (q->>'custodia' is null or (q->>'custodia'='asignado')=(a."ASIG_ID" is not null))
 and (q->>'delegacionRef' is null or f."FUNC_DELEGACION_ID"=laboratorio_ti.id('DELEGACIONES',q->>'delegacionRef'))
 and (q->>'departamentoRef' is null or f."FUNC_DEPARTAMENTO_ID"=laboratorio_ti.id('DEPARTAMENTOS',q->>'departamentoRef'))
 and (q->>'areaRef' is null or f."FUNC_AREA_ID"=laboratorio_ti.id('AREAS',q->>'areaRef'))
 and (q->>'desde' is null or s.adquisicion>=(q->>'desde')::date) and (q->>'hasta' is null or s.adquisicion<=(q->>'hasta')::date)
 order by e."EQUI_ID" limit lim)z;return filas;
 elsif op='C03-11' then
 select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select f."FUNC_ID" id,laboratorio_ti.funcionario(f."FUNC_ID") data from laboratorio_ti."FUNCIONARIOS" f join laboratorio_ti.referencias r on r.tabla='FUNCIONARIOS' and r.id=f."FUNC_ID"
 where f."FUNC_ID">pos and (q->>'q' is null or strpos(lower(f."FUNC_NOMBRE_COMPLETO"),lower(q->>'q'))>0)
 and (q->>'delegacionRef' is null or f."FUNC_DELEGACION_ID"=laboratorio_ti.id('DELEGACIONES',q->>'delegacionRef'))
 and (q->>'departamentoRef' is null or f."FUNC_DEPARTAMENTO_ID"=laboratorio_ti.id('DEPARTAMENTOS',q->>'departamentoRef'))
 and (q->>'areaRef' is null or f."FUNC_AREA_ID"=laboratorio_ti.id('AREAS',q->>'areaRef'))
 and (q->>'desde' is null or r.creado_en>=(q->>'desde')::date) and (q->>'hasta' is null or r.creado_en<(q->>'hasta')::date+interval '1 day')
 order by f."FUNC_ID" limit lim)z;return filas;
 elsif op='C03-09' then
 select id into n from laboratorio_ti.referencias where tabla='EQUIPOS' and ref=recurso;if n is null then raise exception 'NOT_FOUND';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select m."MANT_ID" id,laboratorio_ti.mantencion(m."MANT_ID") data from laboratorio_ti."MANTENCIONES" m where m."MANT_EQUIPO_ID"=n and m."MANT_ID">pos order by m."MANT_ID" limit lim)z;return filas;
 elsif op='C03-08' then
 select id into n from laboratorio_ti.referencias where tabla='EQUIPOS' and ref=recurso;if n is null then raise exception 'NOT_FOUND';end if;
 case familia
 when 'asignaciones' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select a."ASIG_ID" id,laboratorio_ti.asignacion(a."ASIG_ID") data from laboratorio_ti."ASIGNACIONES" a where a."ASIG_EQUIPO_ID"=n and a."ASIG_ID">pos order by a."ASIG_ID" limit lim)z;
 when 'movimientos' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select m.id,jsonb_build_object('ref',m.id::text,'equipoRef',recurso,'tipo',m.tipo,'origenRef',laboratorio_ti.ref('FUNCIONARIOS',m.origen_id),'destinoRef',laboratorio_ti.ref('FUNCIONARIOS',m.destino_id),'efectivaEn',m.efectiva_en,'registradaEn',m.registrada_en,'motivo',m.motivo) data from laboratorio_ti.movimientos m where m.equipo_id=n and m.id>pos order by m.id limit lim)z;
 when 'anotaciones' then select coalesce(jsonb_agg(jsonb_build_object('id',z.id::text,'data',z.data) order by z.id),'[]'::jsonb) into filas from
 (select a.id,jsonb_build_object('ref',a.id::text,'movimientoRef',a.movimiento_id::text,'texto',a.texto,'registradaEn',a.registrada_en) data from laboratorio_ti.anotaciones a join laboratorio_ti.movimientos m on m.id=a.movimiento_id where m.equipo_id=n and a.id>pos order by a.id limit lim)z;
 when 'vigente' then return (select laboratorio_ti.asignacion(a."ASIG_ID") from laboratorio_ti."ASIGNACIONES" a where a."ASIG_EQUIPO_ID"=n and a."ASIG_FECHA_TERMINO" is null);
 else raise exception 'INVALID_REQUEST';end case;return filas;
 else raise exception 'MODEL_OPERATION_NOT_READY';end if;
end $$;
revoke all on function laboratorio_ti.consultar(text,uuid,text,jsonb,bigint,integer) from public,anon,authenticated;
grant execute on function laboratorio_ti.consultar(text,uuid,text,jsonb,bigint,integer) to inventario_runtime;
grant create on schema laboratorio_ti to inventario_modelo_lector;
alter function laboratorio_ti.consultar(text,uuid,text,jsonb,bigint,integer) owner to inventario_modelo_lector;
revoke create on schema laboratorio_ti from inventario_modelo_lector;
-- Solo el BFF invoca este comando privado, dentro de Authorization.run y su misma transacción.
create function laboratorio_ti.aplicar(op text,recurso uuid,clave uuid,esperada bigint,datos jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid; usuario integer; v_tabla text; n integer; v bigint; r uuid; cmd uuid=gen_random_uuid(); h text; anterior jsonb; nuevo jsonb; res jsonb; previo record;
 destino_correo text; audit_id bigint; ahora timestamptz=clock_timestamp(); a record; origen integer; destino integer; asig integer; org jsonb; item jsonb; regla record; permitidas text[];
begin
 select actor_id into actor from seguridad.principal() where rol='administrador';usuario=laboratorio_ti.usuario_actual();
 if actor is null or usuario is null then raise exception 'FORBIDDEN';end if;
 if clave is null or jsonb_typeof(datos)<>'object' or datos->'confirmado' is distinct from 'true'::jsonb or coalesce(length(btrim(datos->>'motivo')),0)=0 or length(datos->>'motivo')>2000 then raise exception 'INVALID_REQUEST';end if;
 case op
 when 'C03-03' then permitidas=array['codigoOperativo','tipoRef','modeloRef','origenRef','numeroSerie','motivoSinSerie','inventarioServiu','inventarioMinvu','adquisicion','observacion','condicionRef'];
 when 'C03-05' then permitidas=array['codigoOperativo','tipoRef','modeloRef','origenRef','numeroSerie','motivoSinSerie','inventarioServiu','inventarioMinvu','adquisicion','observacion'];
 when 'C03-06' then permitidas=array['subtipo','nombreRed','esNotebook','sistemaOperativoRef','procesador','velocidadGhz','direccionMac','guid','piezasAgregar','pulgadas','claseRef','duplex','anchoCarro','insumosAgregar','cantidadPuertos'];
 when 'C03-07' then permitidas=array['tipo','destinoRef','origenEsperadoRef','condicionRef','corrigeRef'];
 when 'C03-10' then permitidas=array['actividadRef','fecha','observacion'];
 when 'C03-12' then permitidas=array['documentoTipo','documento','nombre','cargo','correo','organizacion'];
 when 'C03-15' then permitidas=array['documentoTipo','documento','nombre','cargo','correo'];
 when 'C03-16' then permitidas=array['organizacion'];
 else raise exception 'MODEL_OPERATION_NOT_READY';end case;
 if exists(select 1 from jsonb_object_keys(datos) k where not k=any(permitidas||array['motivo','confirmado'])) then raise exception 'INVALID_REQUEST';end if;
 v_tabla=case when op in ('C03-12','C03-15','C03-16') then 'FUNCIONARIOS' else 'EQUIPOS' end;
 h=encode(sha256(convert_to(jsonb_build_array(op,recurso,esperada,datos)::text,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended(actor::text||op||coalesce(recurso::text,'nuevo')||clave::text,0));
 select c.huella,c.resultado into previo from inventario.comandos c where c.actor_id=actor and c.operacion=op and c.recurso='modelo-v2:'||coalesce(aplicar.recurso::text,'nuevo') and c.clave=aplicar.clave;
 if found then if previo.huella<>h then raise exception 'IDEMPOTENCY_MISMATCH';end if;return previo.resultado;end if;
 if op not in ('C03-03','C03-12') then
 select x.id,x.version,x.ref into n,v,r from laboratorio_ti.referencias x where x.tabla=v_tabla and x.ref=recurso for update;
 if n is null then raise exception 'NOT_FOUND';end if;if esperada is null then raise exception 'VERSION_REQUIRED';end if;if v<>esperada then raise exception 'VERSION_MISMATCH';end if;
 anterior=case when v_tabla='EQUIPOS' then laboratorio_ti.equipo(n) else laboratorio_ti.funcionario(n) end;
 else if recurso is not null or esperada is not null then raise exception 'INVALID_REQUEST';end if;end if;
 select destinatario into destino_correo from inventario.configuracion_avisos where id;
 if destino_correo is null then raise exception 'NOTIFICATION_NOT_CONFIGURED';end if;
 if op in ('C03-03','C03-05') then
 if coalesce(length(btrim(datos->>'codigoOperativo')),0) not between 1 and 2000 or datos->>'tipoRef' is null or not datos?'modeloRef' or
 ((datos->>'numeroSerie' is null) and coalesce(length(btrim(datos->>'motivoSinSerie')),0)=0) then raise exception 'BUSINESS_RULE';end if;
 if op='C03-03' then
 if datos->>'condicionRef' is null then raise exception 'BUSINESS_RULE';end if;
 insert into laboratorio_ti."EQUIPOS"("EQUI_TIPO_EQUIPO_ID","EQUI_MODELO_ID","EQUI_ESTADO_ID","EQUI_SITUACION_ID")
 values(laboratorio_ti.id('TIPOS_EQUIPO',datos->>'tipoRef'),laboratorio_ti.id('MODELOS',datos->>'modeloRef'),laboratorio_ti.id('ESTADOS_EQUIPO',datos->>'condicionRef'),null) returning "EQUI_ID" into n;
 insert into laboratorio_ti.equipo_soporte(equipo_id,codigo_operativo) values(n,datos->>'codigoOperativo');
 else
 -- No convertir un subtipo existente por editar el catálogo de tipo.
 select * into regla from laboratorio_ti.tipo_reglas where tipo_id=laboratorio_ti.id('TIPOS_EQUIPO',datos->>'tipoRef');
 if laboratorio_ti.tecnica(n) is not null and (regla.subtipo is distinct from laboratorio_ti.tecnica(n)->>'subtipo' or
 (regla.subtipo='computador' and regla.es_notebook is distinct from (laboratorio_ti.tecnica(n)->>'esNotebook')::boolean)) then raise exception 'BUSINESS_RULE';end if;
 end if;
 update laboratorio_ti."EQUIPOS" set "EQUI_TIPO_EQUIPO_ID"=laboratorio_ti.id('TIPOS_EQUIPO',datos->>'tipoRef'),"EQUI_MODELO_ID"=laboratorio_ti.id('MODELOS',datos->>'modeloRef'),"EQUI_ORIGEN_ID"=laboratorio_ti.id('ORIGENES_EQUIPO',datos->>'origenRef'),
 "EQUI_NUMERO_SERIE"=case when length(datos->>'numeroSerie')<=60 then datos->>'numeroSerie' end,
 "EQUI_INVENTARIO_SERVIU"=case when length(datos->>'inventarioServiu')<=30 then datos->>'inventarioServiu' end,
 "EQUI_INVENTARIO_MINVU"=case when length(datos->>'inventarioMinvu')<=30 then datos->>'inventarioMinvu' end,
 "EQUI_OBSERVACION"=case when length(datos->>'observacion')<=500 then datos->>'observacion' end where "EQUI_ID"=n;
 update laboratorio_ti.equipo_soporte set codigo_operativo=datos->>'codigoOperativo',motivo_sin_serie=datos->>'motivoSinSerie',adquisicion=(datos->>'adquisicion')::date,
 serie_original=datos->>'numeroSerie',inventario_serviu_original=datos->>'inventarioServiu',inventario_minvu_original=datos->>'inventarioMinvu',observacion_original=datos->>'observacion' where equipo_id=n;
 elsif op in ('C03-12','C03-15') then
 if datos->>'documentoTipo' not in ('ID','RUT') or coalesce(length(btrim(datos->>'documento')),0) not between 1 and 2000 or
 coalesce(length(btrim(datos->>'nombre')),0) not between 1 and 150 or coalesce(length(btrim(datos->>'cargo')),0) not between 1 and 2000 then raise exception 'BUSINESS_RULE';end if;
 if datos->>'documentoTipo'='RUT' and not inventario.rut_valido(inventario.documento_canon('RUT',datos->>'documento')) then raise exception 'BUSINESS_RULE';end if;
 if op='C03-12' then
 org=datos->'organizacion';if org->>'delegacionRef' is null or org->>'departamentoRef' is null or not org?'areaRef' then raise exception 'BUSINESS_RULE';end if;
 insert into laboratorio_ti."FUNCIONARIOS"("FUNC_NOMBRE_COMPLETO","FUNC_DELEGACION_ID","FUNC_DEPARTAMENTO_ID","FUNC_AREA_ID")
 values(datos->>'nombre',laboratorio_ti.id('DELEGACIONES',org->>'delegacionRef'),laboratorio_ti.id('DEPARTAMENTOS',org->>'departamentoRef'),laboratorio_ti.id('AREAS',org->>'areaRef')) returning "FUNC_ID" into n;
 insert into laboratorio_ti.funcionario_soporte(funcionario_id,documento_tipo,documento,cargo) values(n,datos->>'documentoTipo',inventario.documento_canon(datos->>'documentoTipo',datos->>'documento'),datos->>'cargo');
 end if;
 update laboratorio_ti."FUNCIONARIOS" set "FUNC_NOMBRE_COMPLETO"=datos->>'nombre',"FUNC_CORREO"=case when length(datos->>'correo')<=150 then datos->>'correo' end where "FUNC_ID"=n;
 update laboratorio_ti.funcionario_soporte set documento_tipo=datos->>'documentoTipo',documento=inventario.documento_canon(datos->>'documentoTipo',datos->>'documento'),cargo=datos->>'cargo',correo_original=datos->>'correo' where funcionario_id=n;
 end if;
 -- La versión y el recibo se reservan dentro de esta misma transacción, nunca como éxito parcial.
 if op in ('C03-03','C03-12') then select x.ref,x.version into r,v from laboratorio_ti.referencias x where x.tabla=v_tabla and x.id=n;
 else update laboratorio_ti.referencias x set version=x.version+1 where x.tabla=v_tabla and x.id=n returning x.version into v;end if;
 res=jsonb_build_object('ref',r,'version',v::text,'aviso','pendiente');
 insert into inventario.comandos(id,actor_id,operacion,recurso,clave,huella,resultado) values(cmd,actor,op,'modelo-v2:'||coalesce(recurso::text,'nuevo'),clave,h,res);
 if op='C03-06' then
 select tr.* into regla from laboratorio_ti.tipo_reglas tr join laboratorio_ti."EQUIPOS" e on e."EQUI_TIPO_EQUIPO_ID"=tr.tipo_id where e."EQUI_ID"=n;
 if regla.subtipo is distinct from datos->>'subtipo' then raise exception 'BUSINESS_RULE';end if;
 case datos->>'subtipo'
 when 'computador' then
 if regla.es_notebook is distinct from (datos->>'esNotebook')::boolean or coalesce(length(btrim(datos->>'nombreRed')),0)=0 then raise exception 'BUSINESS_RULE';end if;
 insert into laboratorio_ti."COMPUTADORES"("COMP_EQUIPO_ID","COMP_ES_NOTEBOOK","COMP_NOMBRE_RED","COMP_DIRECCION_MAC","COMP_GUID","COMP_PROCESADOR","COMP_VELOCIDAD_GHZ","COMP_SISTEMA_OPERATIVO_ID")
 values(n,(datos->>'esNotebook')::boolean,datos->>'nombreRed',datos->>'direccionMac',datos->>'guid',datos->>'procesador',(datos->>'velocidadGhz')::numeric,laboratorio_ti.id('SISTEMAS_OPERATIVOS',datos->>'sistemaOperativoRef'))
 on conflict("COMP_EQUIPO_ID") do update set "COMP_ES_NOTEBOOK"=excluded."COMP_ES_NOTEBOOK","COMP_NOMBRE_RED"=excluded."COMP_NOMBRE_RED","COMP_DIRECCION_MAC"=excluded."COMP_DIRECCION_MAC","COMP_GUID"=excluded."COMP_GUID","COMP_PROCESADOR"=excluded."COMP_PROCESADOR","COMP_VELOCIDAD_GHZ"=excluded."COMP_VELOCIDAD_GHZ","COMP_SISTEMA_OPERATIVO_ID"=excluded."COMP_SISTEMA_OPERATIVO_ID";
 for item in select value from jsonb_array_elements(coalesce(datos->'piezasAgregar','[]'::jsonb)) loop
 if (item->>'capacidadGb')::integer<=0 then raise exception 'BUSINESS_RULE';end if;
 insert into laboratorio_ti."PIEZAS_COMPUTADOR"("PIEZ_COMPUTADOR_ID","PIEZ_FAMILIA_ID","PIEZ_CAPACIDAD_GB","PIEZ_FECHA_ASIGNACION") values(n,laboratorio_ti.id('FAMILIAS_COMPONENTE',item->>'familiaRef'),(item->>'capacidadGb')::integer,(ahora at time zone 'UTC')::date);end loop;
 when 'monitor' then
 if (datos->>'pulgadas')::numeric<=0 then raise exception 'BUSINESS_RULE';end if;
 insert into laboratorio_ti."MONITORES" values(n,(datos->>'pulgadas')::numeric) on conflict("MONI_EQUIPO_ID") do update set "MONI_PULGADAS"=excluded."MONI_PULGADAS";
 when 'impresora' then
 insert into laboratorio_ti."IMPRESORAS" values(n,laboratorio_ti.id('CLASES_IMPRESORA',datos->>'claseRef'),(datos->>'duplex')::boolean,(datos->>'anchoCarro')::numeric) on conflict("IMPR_EQUIPO_ID") do update set "IMPR_CLASE_ID"=excluded."IMPR_CLASE_ID","IMPR_DUPLEX"=excluded."IMPR_DUPLEX","IMPR_ANCHO_CARRO"=excluded."IMPR_ANCHO_CARRO";
 for item in select value from jsonb_array_elements(coalesce(datos->'insumosAgregar','[]'::jsonb)) loop
 insert into laboratorio_ti."INSUMOS_IMPRESORA"("INSU_IMPRESORA_ID","INSU_RUBRO_ID","INSU_CODIGO") values(n,laboratorio_ti.id('RUBROS_INSUMO',item->>'rubroRef'),item->>'codigo');end loop;
 when 'switch' then
 if (datos->>'cantidadPuertos')::integer<=0 then raise exception 'BUSINESS_RULE';end if;
 insert into laboratorio_ti."SWITCHES" values(n,(datos->>'cantidadPuertos')::smallint) on conflict("SWIT_EQUIPO_ID") do update set "SWIT_CANTIDAD_PUERTOS"=excluded."SWIT_CANTIDAD_PUERTOS";
 else raise exception 'BUSINESS_RULE';end case;
 elsif op='C03-07' then
 if datos?'corrigeRef' or datos->>'tipo' in ('baja','reactivacion') then raise exception 'MODEL_OPERATION_NOT_READY';end if;
 if ((datos->>'tipo' in ('asignacion','traslado')) is distinct from (datos?'destinoRef')) or
 ((datos->>'tipo' in ('devolucion','traslado')) is distinct from (datos?'origenEsperadoRef')) or
 ((datos->>'tipo'='condicion') is distinct from (datos?'condicionRef')) then raise exception 'BUSINESS_RULE';end if;
 select * into a from laboratorio_ti."ASIGNACIONES" where "ASIG_EQUIPO_ID"=n and "ASIG_FECHA_TERMINO" is null for update;
 origen=a."ASIG_FUNCIONARIO_ID";destino=laboratorio_ti.id('FUNCIONARIOS',datos->>'destinoRef');
 if datos->>'tipo' not in ('asignacion','devolucion','traslado','condicion') then raise exception 'BUSINESS_RULE';end if;
 if datos->>'tipo'='asignacion' and origen is not null then raise exception 'BUSINESS_RULE';end if;
 if datos->>'tipo' in ('devolucion','traslado') and (origen is null or origen is distinct from laboratorio_ti.id('FUNCIONARIOS',datos->>'origenEsperadoRef')) then raise exception 'BUSINESS_RULE';end if;
 if datos->>'tipo' in ('asignacion','traslado') then
 perform 1 from laboratorio_ti."FUNCIONARIOS" where "FUNC_ID"=destino and "FUNC_ACTIVO" for share;
 if not found or origen=destino then raise exception 'BUSINESS_RULE';end if;end if;
 if datos->>'tipo' in ('devolucion','traslado') then
 update laboratorio_ti."ASIGNACIONES" set "ASIG_FECHA_TERMINO"=(ahora at time zone 'UTC')::date where "ASIG_ID"=a."ASIG_ID";
 insert into laboratorio_ti.asignacion_soporte(asignacion_id,inicio_utc,fin_utc,precision_temporal) values(a."ASIG_ID",null,ahora,case when a."ASIG_FECHA_INICIO" is null then 'desconocida' else 'dia' end)
 on conflict(asignacion_id) do update set fin_utc=ahora;
 end if;
 if datos->>'tipo' in ('asignacion','traslado') then
 insert into laboratorio_ti."ASIGNACIONES"("ASIG_EQUIPO_ID","ASIG_FUNCIONARIO_ID","ASIG_FECHA_INICIO","ASIG_TRASPASO_DE_ID") values(n,destino,(ahora at time zone 'UTC')::date,case when datos->>'tipo'='traslado' then a."ASIG_ID" end) returning "ASIG_ID" into asig;
 insert into laboratorio_ti.asignacion_soporte values(asig,ahora,null,'instante');end if;
 insert into laboratorio_ti.movimientos(equipo_id,tipo,origen_id,destino_id,condicion_anterior,condicion_nueva,efectiva_en,registrada_en,motivo,actor_id,comando_id)
 select n,datos->>'tipo',origen,destino,e."EQUI_ESTADO_ID",case when datos->>'tipo'='condicion' then laboratorio_ti.id('ESTADOS_EQUIPO',datos->>'condicionRef') else e."EQUI_ESTADO_ID" end,ahora,ahora,datos->>'motivo',actor,cmd from laboratorio_ti."EQUIPOS" e where e."EQUI_ID"=n;
 if datos->>'tipo'='condicion' then
 if datos->>'condicionRef' is null then raise exception 'BUSINESS_RULE';end if;
 update laboratorio_ti."EQUIPOS" set "EQUI_ESTADO_ID"=laboratorio_ti.id('ESTADOS_EQUIPO',datos->>'condicionRef') where "EQUI_ID"=n;end if;
 elsif op='C03-10' then
 if datos->>'actividadRef' is null or datos->>'fecha' is null then raise exception 'BUSINESS_RULE';end if;
 insert into laboratorio_ti."MANTENCIONES"("MANT_EQUIPO_ID","MANT_ACTIVIDAD_ID","MANT_FECHA","MANT_OBSERVACION") values(n,laboratorio_ti.id('ACTIVIDADES_MANTENCION',datos->>'actividadRef'),(datos->>'fecha')::date,datos->>'observacion') returning "MANT_ID" into asig;
 insert into laboratorio_ti.mantencion_soporte values(asig,ahora);
 elsif op='C03-16' then
 org=datos->'organizacion';if org->>'delegacionRef' is null or org->>'departamentoRef' is null or not org?'areaRef' then raise exception 'BUSINESS_RULE';end if;
 update laboratorio_ti."FUNCIONARIOS" set "FUNC_DELEGACION_ID"=laboratorio_ti.id('DELEGACIONES',org->>'delegacionRef'),"FUNC_DEPARTAMENTO_ID"=laboratorio_ti.id('DEPARTAMENTOS',org->>'departamentoRef'),"FUNC_AREA_ID"=laboratorio_ti.id('AREAS',org->>'areaRef') where "FUNC_ID"=n;
 insert into laboratorio_ti.pertenencias(funcionario_id,anterior,nueva,registrada_en,actor_id,comando_id) values(n,anterior->'organizacion',org,ahora,actor,cmd);
 end if;
 -- Auditoría positiva: nunca documento, correo, clave de impresión ni hashes.
 nuevo=case when v_tabla='EQUIPOS' then laboratorio_ti.equipo(n) else laboratorio_ti.funcionario(n) end;
 insert into inventario.auditoria(actor_id,comando_id,entidad,entidad_ref,accion,anterior,nuevo,motivo) values(actor,cmd,'modelo-v2:'||v_tabla,r::text,op,anterior,nuevo,'Operación confirmada en laboratorio') returning id into audit_id;
 insert into laboratorio_ti."AUDITORIA"("AUDI_USUARIO_ID","AUDI_ACCION","AUDI_ENTIDAD","AUDI_ENTIDAD_ID","AUDI_VALOR_ANTERIOR","AUDI_VALOR_NUEVO","AUDI_CONTEXTO") values(usuario,op,v_tabla,r::text,anterior::text,nuevo::text,'Laboratorio PostgreSQL; sin datos privados');
 insert into inventario.outbox(auditoria_id,destinatario,proposito) values(audit_id,destino_correo,'modelo_v2');
 return res;
end $$;
revoke all on function laboratorio_ti.aplicar(text,uuid,uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function laboratorio_ti.aplicar(text,uuid,uuid,bigint,jsonb) to inventario_runtime;
grant create on schema laboratorio_ti to inventario_modelo_servicio;
alter function laboratorio_ti.aplicar(text,uuid,uuid,bigint,jsonb) owner to inventario_modelo_servicio;
revoke create on schema laboratorio_ti from inventario_modelo_servicio;
grant execute on function inventario.rut_valido(text),inventario.documento_canon(text,text) to inventario_modelo_servicio;
-- Apéndices: el servicio solo puede insertar historia y auditoría, nunca modificarlas.
revoke update on laboratorio_ti.movimientos,laboratorio_ti.anotaciones,laboratorio_ti.pertenencias,laboratorio_ti."AUDITORIA" from inventario_modelo_servicio;
create function laboratorio_ti.inmutable() returns trigger language plpgsql set search_path=pg_catalog as $$begin raise exception 'IMMUTABLE_HISTORY';end $$;
do $$ declare t text;begin foreach t in array array['movimientos','anotaciones','pertenencias','AUDITORIA'] loop
 execute format('create trigger inmutable before update or delete on laboratorio_ti.%I for each row execute function laboratorio_ti.inmutable()',t);
 execute format('create trigger no_truncate before truncate on laboratorio_ti.%I for each statement execute function laboratorio_ti.inmutable()',t);
end loop;end $$;
-- No exponer helpers, tablas ni secuencias a navegador/roles públicos.
-- El operador gestiona solo ACL de funciones que todavía le pertenecen.
-- Las tres funciones SECURITY DEFINER recibieron ACL privadas antes de transferir propiedad.
do $acl$ declare f text;begin
 for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='laboratorio_ti' and p.proowner=(select oid from pg_roles where rolname=current_user) loop
 execute 'revoke all on function '||f||' from public,anon,authenticated,inventario_runtime';
 execute 'grant execute on function '||f||' to inventario_modelo_lector,inventario_modelo_servicio';
 end loop;
end $acl$;
create function laboratorio_ti.version() returns text language sql immutable set search_path=pg_catalog as $$select 'postgres-lab-v1'::text$$;
revoke all on function laboratorio_ti.version() from public,anon,authenticated;
grant execute on function laboratorio_ti.version() to inventario_runtime;
-- Diagnóstico mínimo para habilitar el sitio: nunca devuelve identificadores ni datos personales.
create function laboratorio_ti.diagnostico() returns jsonb language sql stable security definer set search_path=pg_catalog as $$
 select jsonb_build_object('adminBound',exists(select 1 from laboratorio_ti.usuario_auth a join laboratorio_ti."USUARIOS" u on u."USUA_ID"=a.usuario_id join laboratorio_ti."FUNCIONARIOS" f on f."FUNC_ID"=u."USUA_FUNCIONARIO_ID" join inventario.cuentas c on c.id=a.cuenta_id where c.rol='administrador' and c.estado='activa' and c.credencial_lista and c.proveedor_ref is not null and u."USUA_ACTIVO" and f."FUNC_ACTIVO"),
 'readerBound',exists(select 1 from laboratorio_ti.usuario_auth a join laboratorio_ti."USUARIOS" u on u."USUA_ID"=a.usuario_id join laboratorio_ti."FUNCIONARIOS" f on f."FUNC_ID"=u."USUA_FUNCIONARIO_ID" join inventario.cuentas c on c.id=a.cuenta_id where c.rol='lectura' and c.estado='activa' and c.credencial_lista and c.proveedor_ref is not null and u."USUA_ACTIVO" and f."FUNC_ACTIVO"))
$$;
revoke all on function laboratorio_ti.diagnostico() from public,anon,authenticated;
grant execute on function laboratorio_ti.diagnostico() to inventario_runtime;
grant create on schema laboratorio_ti to inventario_contexto;
alter function laboratorio_ti.diagnostico() owner to inventario_contexto;
revoke create on schema laboratorio_ti from inventario_contexto;
commit;
