-- Fase 12. Roles locales sin login; sin configuración ni envíos remotos.
begin;
-- Adaptación de operador PostgreSQL gestionado, sin LOGIN ni BYPASSRLS.
set local createrole_self_grant = 'set';
create role inventario_avisos nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role inventario_worker nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
grant usage on schema inventario,seguridad to inventario_avisos;
grant usage on schema inventario to inventario_worker;
grant execute on function seguridad.principal() to inventario_avisos;

alter table inventario.outbox add column version bigint not null default 1 check(version>0);
alter table inventario.outbox add column intentos integer not null default 0 check(intentos>=0);
alter table inventario.outbox add column ciclo_intentos integer not null default 0 check(ciclo_intentos between 0 and 4);
alter table inventario.outbox add column reclamacion uuid;
create index outbox_arrendamiento_idx on inventario.outbox(arrendamiento_hasta,id) where estado='procesando';
grant select,insert on inventario.intentos_aviso,inventario.comandos,inventario.auditoria to inventario_avisos;
grant select,update(estado,siguiente_en,arrendamiento_hasta,proveedor_ref,ultimo_error_codigo,version,intentos,ciclo_intentos,reclamacion) on inventario.outbox to inventario_avisos;
grant select(comando_id,efectiva_en) on inventario.movimientos,inventario.pertenencias to inventario_avisos;
grant usage on sequence inventario.intentos_aviso_id_seq,inventario.auditoria_id_seq to inventario_avisos;
do $$ declare t text; begin
 foreach t in array array['outbox','intentos_aviso','comandos','auditoria','movimientos','pertenencias'] loop
  execute format('create policy motor_avisos on inventario.%I to inventario_avisos using(true) with check(true)',t);
 end loop;
 foreach t in array array['outbox','intentos_aviso'] loop
  execute format('grant select on inventario.%I to inventario_runtime',t);
  execute format('create policy seguimiento_avisos on inventario.%I for select to inventario_runtime using(exists(select 1 from seguridad.principal() p where p.rol=''administrador''))',t);
 end loop;
end $$;

-- Sin exponer auditoría completa al worker. Solo nombres de campos predefinidos y referencias.
create function inventario.contenido_aviso(evento bigint, proposito text) returns jsonb
language plpgsql set search_path=pg_catalog as $$
declare a inventario.auditoria; campos jsonb; efectiva timestamptz;
begin
 select * into strict a from inventario.auditoria where id=evento;
 if proposito in ('activacion_avisos','sustitucion_avisos') and a.entidad='avisos' and a.accion in ('alta','edicion') then
  return jsonb_build_object('proposito',proposito);
 end if;
 if not (
  proposito='cambio_bien' and a.entidad='bien' and a.accion in ('alta','edicion') or
  proposito='cambio_cuenta' and a.entidad='cuentas' and a.accion in ('alta','edicion','forzar_clave') or
  proposito='proceso_empresarial' and (
   a.entidad='funcionario' and a.accion in ('funcionario','pertenencia','estado') or
   a.entidad='bien' and a.accion in ('asignacion','devolucion','traslado','condicion','baja','reactivacion','anotacion'))
 ) then return null; end if;
 if a.entidad_ref !~ '^[a-fA-F0-9-]{36}$' then return null; end if;
 select coalesce(jsonb_agg(k order by k),'[]'::jsonb) into campos from unnest(array[
  'codigo','serie','tipo','marca','modelo','condicion','adquisicion','situacion','nombre','cargo','unidad_id','activo','rol','estado',
  'documento_tipo','documento','correo','observaciones','motivo_sin_serie'
 ]) k where a.nuevo->k is distinct from a.anterior->k;
 select max(f) into efectiva from (
  select efectiva_en f from inventario.movimientos where comando_id=a.comando_id
  union all select efectiva_en from inventario.pertenencias where comando_id=a.comando_id
 ) fechas;
 return jsonb_build_object('proposito',proposito,'entidad',a.entidad,'referencia',a.entidad_ref,
  'accion',a.accion,'actor',a.actor_id,'registrada',to_char(a.registrada_en at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
  'efectiva',case when efectiva is not null then to_char(efectiva at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') end,'campos',campos);
end $$;
grant create on schema inventario to inventario_avisos;
alter function inventario.contenido_aviso(bigint,text) owner to inventario_avisos;
revoke create on schema inventario from inventario_avisos;
revoke all on function inventario.contenido_aviso(bigint,text) from public;

create function inventario.reclamar_aviso() returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare o inventario.outbox; contenido jsonb; token uuid:=gen_random_uuid();
begin
 -- Una caída no demuestra ausencia de envío. Expirar a incierto, sin devolver a pendiente.
 for o in select * from inventario.outbox where estado='procesando' and arrendamiento_hasta<=clock_timestamp()
  order by arrendamiento_hasta,id for update skip locked limit 50 loop
  insert into inventario.intentos_aviso(outbox_id,numero,resultado,codigo) values(o.id,o.intentos,'incierto','LEASE_EXPIRED');
  update inventario.outbox set estado='incierto',ultimo_error_codigo='LEASE_EXPIRED',arrendamiento_hasta=null,reclamacion=null,version=version+1 where id=o.id;
 end loop;
 select * into o from inventario.outbox where estado='pendiente' and siguiente_en<=clock_timestamp()
  order by siguiente_en,id for update skip locked limit 1;
 if not found then return null; end if;
 contenido:=inventario.contenido_aviso(o.auditoria_id,o.proposito);
 if contenido is null or o.ciclo_intentos>=4 then
  update inventario.outbox set estado='fallido',ultimo_error_codigo='CATALOG_REJECTED',version=version+1 where id=o.id;
  return null;
 end if;
 update inventario.outbox set estado='procesando',intentos=intentos+1,ciclo_intentos=ciclo_intentos+1,
  reclamacion=token,arrendamiento_hasta=clock_timestamp()+interval '60 seconds',version=version+1 where id=o.id;
 return jsonb_build_object('id',o.id,'token',token,'destinatario',o.destinatario,'contenido',contenido);
end $$;
grant create on schema inventario to inventario_avisos;
alter function inventario.reclamar_aviso() owner to inventario_avisos;
revoke create on schema inventario from inventario_avisos;
revoke all on function inventario.reclamar_aviso() from public;
grant execute on function inventario.reclamar_aviso() to inventario_worker;

create function inventario.finalizar_aviso(referencia uuid, token uuid, resultado text, proveedor text) returns boolean
language plpgsql security definer set search_path=pg_catalog as $$
declare o inventario.outbox; codigo text; nuevo_estado text; proximo timestamptz:=clock_timestamp();
begin
 if resultado is null or resultado not in ('aceptado','transitorio','permanente','incierto') then raise exception 'INVALID_REQUEST'; end if;
 if resultado='aceptado' and (proveedor is null or proveedor !~ '^[a-zA-Z0-9_-]{1,128}$') then raise exception 'INVALID_REQUEST'; end if;
 select * into o from inventario.outbox where id=referencia for update;
 if not found or o.estado<>'procesando' or o.reclamacion is distinct from token or o.arrendamiento_hasta<=clock_timestamp() then return false; end if;
 codigo:=case resultado when 'transitorio' then 'PROVIDER_TRANSIENT' when 'permanente' then 'PROVIDER_PERMANENT' when 'incierto' then 'PROVIDER_UNCERTAIN' end;
 nuevo_estado:=case resultado when 'aceptado' then 'aceptado' when 'incierto' then 'incierto' else 'fallido' end;
 if resultado='transitorio' and o.ciclo_intentos<4 then
  nuevo_estado:='pendiente';
  proximo:=clock_timestamp()+case o.ciclo_intentos when 1 then interval '1 minute' when 2 then interval '5 minutes' else interval '15 minutes' end;
 elsif resultado='transitorio' then codigo:='RETRIES_EXHAUSTED'; end if;
 insert into inventario.intentos_aviso(outbox_id,numero,resultado,codigo) values(o.id,o.intentos,resultado,codigo);
 update inventario.outbox set estado=nuevo_estado,siguiente_en=proximo,arrendamiento_hasta=null,reclamacion=null,
  proveedor_ref=case when resultado='aceptado' then proveedor else proveedor_ref end,ultimo_error_codigo=codigo,version=version+1 where id=o.id;
 return true;
end $$;
grant create on schema inventario to inventario_avisos;
alter function inventario.finalizar_aviso(uuid,uuid,text,text) owner to inventario_avisos;
revoke create on schema inventario from inventario_avisos;
revoke all on function inventario.finalizar_aviso(uuid,uuid,text,text) from public;
grant execute on function inventario.finalizar_aviso(uuid,uuid,text,text) to inventario_worker;

create function inventario.accion_aviso(referencia uuid, clave uuid, esperada bigint, datos jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid; o inventario.outbox; repetido inventario.comandos; resultado jsonb; cmd uuid:=gen_random_uuid();
 huella text:=encode(sha256(convert_to(jsonb_build_array(datos,esperada)::text,'UTF8')),'hex'); k text; nuevo_estado text; codigo text;
begin
 select p.actor_id into actor from seguridad.principal() p where p.rol='administrador';
 if actor is null then raise exception 'FORBIDDEN'; end if;
 if clave is null or jsonb_typeof(datos) is distinct from 'object' or datos->'confirmado' is distinct from 'true'::jsonb
  or nullif(btrim(datos->>'motivo'),'') is null or length(datos->>'motivo')>2000 then raise exception 'INVALID_REQUEST'; end if;
 for k in select jsonb_object_keys(datos) loop
  if k not in ('accion','motivo','confirmado','resultado','evidencia') then raise exception 'INVALID_REQUEST'; end if;
  if k<>'confirmado' and (jsonb_typeof(datos->k)<>'string' or length(datos->>k)>2000) then raise exception 'INVALID_REQUEST'; end if;
 end loop;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||referencia::text||clave::text,0));
 select * into repetido from inventario.comandos c where c.actor_id=actor and c.operacion='aviso_accion' and c.recurso=referencia::text and c.clave=accion_aviso.clave;
 if found then
  if repetido.huella<>huella then raise exception 'IDEMPOTENCY_MISMATCH'; end if;
  return repetido.resultado;
 end if;
 select * into o from inventario.outbox where id=referencia for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if esperada is null then raise exception 'VERSION_REQUIRED'; end if;
 if esperada<>o.version then raise exception 'VERSION_MISMATCH'; end if;
 if datos->>'accion'='cancelar' and o.estado in ('pendiente','fallido') then nuevo_estado:='cancelado'; codigo:='ADMIN_CANCELLED';
 elsif datos->>'accion'='reintentar' and o.estado='fallido' then
  if o.ultimo_error_codigo='CATALOG_REJECTED' then raise exception 'BUSINESS_RULE'; end if;
  nuevo_estado:='pendiente'; codigo:=null;
 elsif datos->>'accion'='conciliar' and o.estado in ('incierto','aceptado') then
  if nullif(btrim(datos->>'evidencia'),'') is null then raise exception 'INVALID_REQUEST'; end if;
  if datos->>'resultado'='entregado' then nuevo_estado:='entregado'; codigo:=null;
  elsif datos->>'resultado'='permanente' then nuevo_estado:='fallido'; codigo:='RECONCILED_PERMANENT';
  elsif o.estado='incierto' and datos->>'resultado'='aceptado' then nuevo_estado:='aceptado'; codigo:=null;
  elsif o.estado='incierto' and datos->>'resultado'='no_enviado' then nuevo_estado:='fallido'; codigo:='NOT_SENT_CONFIRMED';
  else raise exception 'BUSINESS_RULE'; end if;
 else raise exception 'BUSINESS_RULE'; end if;
 update inventario.outbox set estado=nuevo_estado,ultimo_error_codigo=codigo,version=version+1,
  siguiente_en=case when nuevo_estado='pendiente' then clock_timestamp() else siguiente_en end,
  ciclo_intentos=case when datos->>'accion'='reintentar' then 0 else ciclo_intentos end where id=o.id returning version into esperada;
 resultado:=jsonb_build_object('ref',o.id,'version',esperada,'estado',nuevo_estado);
 insert into inventario.comandos(id,actor_id,operacion,recurso,clave,huella,resultado)
  values(cmd,actor,'aviso_accion',o.id::text,clave,huella,resultado);
 insert into inventario.auditoria(actor_id,comando_id,entidad,entidad_ref,accion,anterior,nuevo,motivo)
  values(actor,cmd,'aviso',o.id::text,datos->>'accion',jsonb_build_object('estado',o.estado,'version',o.version),
   resultado||jsonb_build_object('evidencia',datos->>'evidencia'),datos->>'motivo');
 return resultado;
end $$;
grant create on schema inventario to inventario_avisos;
alter function inventario.accion_aviso(uuid,uuid,bigint,jsonb) owner to inventario_avisos;
revoke create on schema inventario from inventario_avisos;
revoke all on function inventario.accion_aviso(uuid,uuid,bigint,jsonb) from public;
grant execute on function inventario.accion_aviso(uuid,uuid,bigint,jsonb) to inventario_runtime;
commit;
