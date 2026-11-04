-- Fase 4: solamente persistencia; sin roles de aplicación ni políticas de acceso.
begin;
-- Adaptación de operador PostgreSQL gestionado, sin LOGIN ni BYPASSRLS.
set local createrole_self_grant = 'set';
create schema inventario;
revoke all on schema inventario from public;
alter default privileges in schema inventario revoke execute on functions from public;
set local search_path = inventario, pg_catalog;

create function canon(text) returns text language sql immutable strict
set search_path = pg_catalog as $$ select upper(btrim($1)) $$;

create function documento_canon(tipo text, valor text) returns text
language sql immutable strict set search_path = pg_catalog as $$
 select case when tipo = 'RUT' then upper(regexp_replace(valor, '[.[:space:]-]', '', 'g'))
 else upper(btrim(valor)) end
$$;
create function rut_valido(valor text) returns boolean
language plpgsql immutable strict set search_path = pg_catalog as $$
declare total integer := 0; factor integer := 2; i integer; digito text;
begin
 if valor !~ '^[1-9][0-9]{0,7}[0-9K]$' then return false; end if;
 for i in reverse length(valor)-1..1 loop
  total := total + substring(valor,i,1)::integer * factor;
  factor := case when factor = 7 then 2 else factor + 1 end;
 end loop;
 digito := case 11 - total % 11 when 11 then '0' when 10 then 'K' else (11 - total % 11)::text end;
 return right(valor,1) = digito;
end $$;

create table unidades (
 id uuid primary key default gen_random_uuid(),
 nombre text not null check (btrim(nombre) <> ''),
 activa boolean not null default true,
 version bigint not null default 1 check (version > 0)
);
create unique index unidades_nombre_uq on unidades (canon(nombre));
-- Cuenta es identidad de aplicación, nunca un funcionario ni una contraseña.
create table cuentas (
 id uuid primary key default gen_random_uuid(),
 proveedor_ref uuid unique,
 nombre text not null check (btrim(nombre) <> ''),
 correo text not null check (correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 rol text not null check (rol in ('administrador','lectura')),
 estado text not null default 'pendiente' check (estado in ('pendiente','activa','inactiva')),
 version bigint not null default 1 check (version > 0),
 version_autorizacion bigint not null default 1 check (version_autorizacion > 0),
 creado_en timestamptz not null default clock_timestamp()
);
create unique index cuentas_correo_uq on cuentas (canon(correo));
create table funcionarios (
 id uuid primary key default gen_random_uuid(),
 documento_tipo text not null check (documento_tipo in ('RUT','ID')),
 documento text not null,
 documento_normalizado text generated always as (documento_canon(documento_tipo,documento)) stored,
 nombre text not null check (btrim(nombre) <> ''),
 cargo text not null check (btrim(cargo) <> ''),
 correo text check (correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 unidad_id uuid not null references unidades(id),
 activo boolean not null default true,
 version bigint not null default 1 check (version > 0),
 alta_en timestamptz not null default clock_timestamp(),
 unique (documento_tipo,documento_normalizado),
 check (documento_normalizado <> ''),
 check (documento_tipo <> 'RUT' or rut_valido(documento_normalizado))
);
create index funcionarios_unidad_idx on funcionarios(unidad_id);
create table bienes (
 id uuid primary key default gen_random_uuid(),
 codigo text not null check (btrim(codigo) <> ''),
 serie text check (btrim(serie) <> ''),
 motivo_sin_serie text,
 tipo text not null check (btrim(tipo) <> ''),
 marca text not null check (btrim(marca) <> ''),
 modelo text not null check (btrim(modelo) <> ''),
 condicion text not null check (condicion in ('bueno','regular','malo')),
 situacion text not null default 'activo' check (situacion in ('activo','baja')),
 adquisicion date,
 observaciones text,
 version bigint not null default 1 check (version > 0),
 alta_en timestamptz not null default clock_timestamp(),
 check (serie is not null or nullif(btrim(motivo_sin_serie),'') is not null)
);
create unique index bienes_codigo_uq on bienes(canon(codigo));
create unique index bienes_serie_uq on bienes(canon(serie)) where serie is not null;
create index bienes_adquisicion_idx on bienes(adquisicion,id);
create index bienes_condicion_idx on bienes(condicion,situacion,id);

create table comandos (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid not null references cuentas(id),
 operacion text not null check (btrim(operacion) <> ''),
 recurso text not null check (btrim(recurso) <> ''),
 clave uuid not null,
 huella text not null check (huella ~ '^[0-9a-f]{64}$'),
 resultado jsonb not null check (jsonb_typeof(resultado) = 'object'),
 registrado_en timestamptz not null default clock_timestamp(),
 unique(actor_id,operacion,recurso,clave)
);
create table pertenencias (
 id bigint generated always as identity primary key,
 funcionario_id uuid not null references funcionarios(id),
 unidad_id uuid not null references unidades(id),
 unidad_nombre text not null check (btrim(unidad_nombre) <> ''),
 actor_id uuid not null references cuentas(id),
 comando_id uuid not null references comandos(id),
 motivo text not null check (btrim(motivo) <> ''),
 efectiva_en timestamptz not null default clock_timestamp(),
 registrada_en timestamptz not null default clock_timestamp()
);
create index pertenencias_funcionario_idx on pertenencias(funcionario_id,efectiva_en,id);
create index pertenencias_unidad_idx on pertenencias(unidad_id);
create table movimientos (
 id bigint generated always as identity primary key,
 bien_id uuid not null references bienes(id),
 tipo text not null check (tipo in ('asignacion','devolucion','traslado','condicion','baja','reactivacion')),
 origen_id uuid references funcionarios(id),
 destino_id uuid references funcionarios(id),
 unidad_origen_id uuid references unidades(id),
 unidad_destino_id uuid references unidades(id),
 unidad_origen_nombre text,
 unidad_destino_nombre text,
 condicion_anterior text check (condicion_anterior in ('bueno','regular','malo')),
 condicion_nueva text check (condicion_nueva in ('bueno','regular','malo')),
 actor_id uuid not null references cuentas(id),
 comando_id uuid not null references comandos(id),
 motivo text not null check (btrim(motivo) <> ''),
 corrige_id bigint references movimientos(id),
 efectiva_en timestamptz not null default clock_timestamp(),
 registrada_en timestamptz not null default clock_timestamp(),
 unique (id,bien_id),
 check (origen_id is distinct from destino_id or (origen_id is null and destino_id is null)),
 check (case tipo when 'asignacion' then origen_id is null and destino_id is not null
 when 'devolucion' then origen_id is not null and destino_id is null
 when 'traslado' then origen_id is not null and destino_id is not null
 else origen_id is null and destino_id is null end),
 check (tipo <> 'condicion' or (condicion_anterior is not null and condicion_nueva is not null and condicion_anterior <> condicion_nueva))
);
create index movimientos_bien_idx on movimientos(bien_id,efectiva_en,id);
create index movimientos_fecha_idx on movimientos(efectiva_en,id);
create index movimientos_origen_idx on movimientos(origen_id);
create index movimientos_destino_idx on movimientos(destino_id);
create index movimientos_unidad_origen_idx on movimientos(unidad_origen_id,efectiva_en);
create index movimientos_unidad_destino_idx on movimientos(unidad_destino_id,efectiva_en);
create index movimientos_corrige_idx on movimientos(corrige_id);

-- Proyección de intervalos. Solo se admite cerrar una vez; la evidencia es movimientos.
create table custodias (
 id uuid primary key default gen_random_uuid(),
 bien_id uuid not null references bienes(id),
 funcionario_id uuid not null references funcionarios(id),
 inicio_en timestamptz not null,
 fin_en timestamptz,
 apertura_id bigint not null unique,
 cierre_id bigint unique,
 foreign key (apertura_id,bien_id) references movimientos(id,bien_id),
 foreign key (cierre_id,bien_id) references movimientos(id,bien_id),
 check (fin_en is null or fin_en >= inicio_en),
 check ((fin_en is null) = (cierre_id is null))
);
create unique index custodias_vigente_uq on custodias(bien_id) where fin_en is null;
create index custodias_bien_idx on custodias(bien_id,inicio_en);
create index custodias_funcionario_idx on custodias(funcionario_id,fin_en);
create table anotaciones (
 id bigint generated always as identity primary key,
 movimiento_id bigint not null references movimientos(id),
 actor_id uuid not null references cuentas(id),
 comando_id uuid not null references comandos(id),
 texto text not null check (btrim(texto) <> ''),
 motivo text not null check (btrim(motivo) <> ''),
 registrada_en timestamptz not null default clock_timestamp()
);
create index anotaciones_movimiento_idx on anotaciones(movimiento_id);
create table auditoria (
 id bigint generated always as identity primary key,
 actor_id uuid not null references cuentas(id),
 comando_id uuid not null references comandos(id),
 entidad text not null check (btrim(entidad) <> ''),
 entidad_ref text not null check (btrim(entidad_ref) <> ''),
 accion text not null check (btrim(accion) <> ''),
 anterior jsonb,
 nuevo jsonb,
 motivo text not null check (btrim(motivo) <> ''),
 registrada_en timestamptz not null default clock_timestamp()
);
create index auditoria_fecha_idx on auditoria(registrada_en,id);
create index auditoria_entidad_idx on auditoria(entidad,entidad_ref);
create table configuracion_avisos (
 id boolean primary key default true check (id),
 destinatario text not null check (destinatario ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 version bigint not null default 1 check (version > 0)
);
create table outbox (
 id uuid primary key default gen_random_uuid(),
 auditoria_id bigint not null references auditoria(id),
 destinatario text not null check (destinatario ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 proposito text not null check (btrim(proposito) <> ''),
 -- Solo referencias; el worker futuro construye la plantilla mínima autorizada.
 estado text not null default 'pendiente' check (estado in ('pendiente','procesando','aceptado','entregado','fallido','incierto','cancelado')),
 siguiente_en timestamptz not null default clock_timestamp(),
 arrendamiento_hasta timestamptz,
 proveedor_ref text,
 ultimo_error_codigo text,
 creado_en timestamptz not null default clock_timestamp(),
 unique (auditoria_id,destinatario,proposito)
);
create index outbox_pendiente_idx on outbox(siguiente_en,id) where estado = 'pendiente';
create table intentos_aviso (
 id bigint generated always as identity primary key,
 outbox_id uuid not null references outbox(id),
 numero integer not null check (numero > 0),
 resultado text not null check (resultado in ('aceptado','transitorio','permanente','incierto','entregado','cancelado')),
 codigo text,
 registrado_en timestamptz not null default clock_timestamp(),
 unique(outbox_id,numero)
);

create function inmutable() returns trigger language plpgsql set search_path = pg_catalog as $$
begin raise exception 'EVIDENCIA_INMUTABLE: %', TG_TABLE_NAME using errcode = '23514'; end $$;
create function sellar_fecha() returns trigger language plpgsql set search_path = pg_catalog as $$
begin
 if TG_TABLE_NAME in ('movimientos','pertenencias') then
  new.efectiva_en := clock_timestamp();
  new.registrada_en := clock_timestamp();
 else new.registrada_en := clock_timestamp(); end if;
 return new;
end $$;
create function proteger_custodia() returns trigger language plpgsql
set search_path = pg_catalog, inventario as $$
declare b inventario.bienes; f inventario.funcionarios; m inventario.movimientos;
begin
 if TG_OP = 'DELETE' then raise exception 'CUSTODIA_NO_BORRABLE' using errcode = '23514'; end if;
 -- Orden global para futuros servicios: bien, funcionarios ordenados, unidades.
 select * into strict b from inventario.bienes where id = new.bien_id for update;
 select * into strict f from inventario.funcionarios where id = new.funcionario_id for update;
 if TG_OP = 'UPDATE' then
  if old.fin_en is not null or new.fin_en is null or
     (to_jsonb(new) - 'fin_en' - 'cierre_id') <> (to_jsonb(old) - 'fin_en' - 'cierre_id') then
   raise exception 'CUSTODIA_SOLO_CIERRE' using errcode = '23514';
  end if;
  select * into strict m from inventario.movimientos where id = new.cierre_id;
  if m.bien_id <> new.bien_id or m.origen_id is distinct from new.funcionario_id or m.tipo not in ('devolucion','traslado') then
   raise exception 'CIERRE_INCOMPATIBLE' using errcode = '23514';
  end if;
  new.fin_en := m.efectiva_en;
 else
  if not f.activo or b.situacion <> 'activo' or b.condicion = 'malo' then
   raise exception 'CUSTODIA_NO_ADMISIBLE' using errcode = '23514';
  end if;
  select * into strict m from inventario.movimientos where id = new.apertura_id;
  if m.bien_id <> new.bien_id or m.destino_id is distinct from new.funcionario_id or m.tipo not in ('asignacion','traslado') or new.fin_en is not null then
   raise exception 'APERTURA_INCOMPATIBLE' using errcode = '23514';
  end if;
  new.inicio_en := m.efectiva_en;
 end if;
 if exists(select 1 from inventario.custodias c where c.bien_id = new.bien_id and c.id <> new.id
   and tstzrange(c.inicio_en,c.fin_en,'[)') && tstzrange(new.inicio_en,new.fin_en,'[)')) then
  raise exception 'CUSTODIA_SOLAPADA' using errcode = '23514';
 end if;
 return new;
end $$;
create trigger custodias_integridad before insert or update or delete on custodias
for each row execute function proteger_custodia();
create trigger custodias_no_truncate before truncate on custodias for each statement execute function inmutable();

create function proteger_maestro() returns trigger language plpgsql
set search_path = pg_catalog, inventario as $$
begin
 if TG_OP = 'DELETE' then raise exception 'BAJA_LOGICA_REQUERIDA' using errcode = '23514'; end if;
 if new.id <> old.id then raise exception 'IDENTIDAD_INMUTABLE' using errcode = '23514'; end if;
 if TG_TABLE_NAME = 'bienes' then
  if new.situacion = 'baja' and exists(select 1 from inventario.custodias where bien_id = old.id and fin_en is null) then
   raise exception 'BIEN_CON_CUSTODIA' using errcode = '23514';
  end if;
 elsif TG_TABLE_NAME = 'funcionarios' then
  if not new.activo and exists(select 1 from inventario.custodias where funcionario_id = old.id and fin_en is null) then
   raise exception 'FUNCIONARIO_CON_BIENES' using errcode = '23514';
  end if;
 end if;
 new.version := old.version + 1;
 return new;
end $$;
create function validar_unidad() returns trigger language plpgsql
set search_path = pg_catalog, inventario as $$
begin
 if TG_OP = 'UPDATE' and new.unidad_id = old.unidad_id then return new; end if;
 perform 1 from inventario.unidades where id = new.unidad_id and activa for share;
 if not found then raise exception 'UNIDAD_INACTIVA' using errcode = '23514'; end if;
 return new;
end $$;
create trigger funcionarios_unidad before insert or update on funcionarios for each row execute function validar_unidad();

-- Instantáneas históricas calculadas en la base, no tomadas de un cliente.
create function instantaneas_movimiento() returns trigger language plpgsql
set search_path = pg_catalog, inventario as $$
begin
 perform 1 from inventario.bienes where id = new.bien_id for update;
 perform 1 from inventario.funcionarios where id in (new.origen_id,new.destino_id) order by id for update;
 select f.unidad_id,u.nombre into new.unidad_origen_id,new.unidad_origen_nombre
 from inventario.funcionarios f join inventario.unidades u on u.id = f.unidad_id where f.id = new.origen_id;
 select f.unidad_id,u.nombre into new.unidad_destino_id,new.unidad_destino_nombre
 from inventario.funcionarios f join inventario.unidades u on u.id = f.unidad_id where f.id = new.destino_id;
 return new;
end $$;
create trigger movimientos_instantaneas before insert on movimientos for each row execute function instantaneas_movimiento();
create function instantanea_pertenencia() returns trigger language plpgsql
set search_path = pg_catalog, inventario as $$
begin
 perform 1 from inventario.funcionarios where id = new.funcionario_id for update;
 select nombre into strict new.unidad_nombre from inventario.unidades where id = new.unidad_id for share;
 return new;
end $$;
create trigger pertenencias_instantanea before insert on pertenencias for each row execute function instantanea_pertenencia();

create function proteger_outbox() returns trigger language plpgsql set search_path = pg_catalog as $$
begin
 if (new.id,new.auditoria_id,new.destinatario,new.proposito,new.creado_en) is distinct from
    (old.id,old.auditoria_id,old.destinatario,old.proposito,old.creado_en) then
  raise exception 'DESTINATARIO_EVENTO_INMUTABLE' using errcode = '23514';
 end if;
 return new;
end $$;
create trigger outbox_identidad before update on outbox for each row execute function proteger_outbox();
create trigger outbox_no_delete before delete on outbox for each row execute function inmutable();
create trigger outbox_no_truncate before truncate on outbox for each statement execute function inmutable();

-- Denegar por defecto: sin políticas/grants de acceso hasta Fase 6.
do $$ declare t text; c record; begin
 foreach t in array array['unidades','cuentas','funcionarios','bienes','comandos','pertenencias','movimientos','custodias','anotaciones','auditoria','configuracion_avisos','outbox','intentos_aviso'] loop
  execute format('alter table inventario.%I enable row level security',t);
  execute format('revoke all on inventario.%I from public',t);
 end loop;
 foreach t in array array['comandos','pertenencias','movimientos','anotaciones','auditoria','intentos_aviso'] loop
  execute format('create trigger evidencia_inmutable before update or delete on inventario.%I for each row execute function inventario.inmutable()',t);
  execute format('create trigger evidencia_no_truncate before truncate on inventario.%I for each statement execute function inventario.inmutable()',t);
 end loop;
 foreach t in array array['pertenencias','movimientos','anotaciones','auditoria'] loop
  execute format('create trigger z_fecha_servidor before insert on inventario.%I for each row execute function inventario.sellar_fecha()',t);
 end loop;
 foreach t in array array['unidades','cuentas','funcionarios','bienes','configuracion_avisos'] loop
  execute format('create trigger maestro_integridad before update or delete on inventario.%I for each row execute function inventario.proteger_maestro()',t);
  execute format('create trigger maestro_no_truncate before truncate on inventario.%I for each statement execute function inventario.inmutable()',t);
 end loop;
 -- Índices para todas las FK no cubiertas a la izquierda por un índice anterior.
 for c in select conrelid::regclass as tabla, conname, a.attname
  from pg_constraint pc join pg_attribute a on a.attrelid = pc.conrelid and a.attnum = pc.conkey[1]
  where pc.contype = 'f' and pc.connamespace = 'inventario'::regnamespace
   and not exists(select 1 from pg_index i where i.indrelid = pc.conrelid and i.indkey[0] = pc.conkey[1]) loop
  execute format('create index %I on %s (%I)',c.conname || '_idx',c.tabla,c.attname);
 end loop;
end $$;
commit;
