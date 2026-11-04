-- Servicios acotados; runtime conserva denegación de DML directo.
begin;
-- Adaptación de operador PostgreSQL gestionado, sin LOGIN ni BYPASSRLS.
set local createrole_self_grant = 'set';
create role inventario_servicio nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
grant usage on schema inventario,seguridad to inventario_servicio;
grant execute on function seguridad.principal() to inventario_servicio;
grant execute on function inventario.canon(text) to inventario_servicio;
grant select,insert on inventario.bienes,inventario.comandos,inventario.auditoria,inventario.outbox to inventario_servicio;
grant update(codigo,serie,motivo_sin_serie,tipo,marca,modelo,adquisicion,observaciones) on inventario.bienes to inventario_servicio;
grant select on inventario.configuracion_avisos,inventario.custodias to inventario_servicio;
grant usage on sequence inventario.auditoria_id_seq to inventario_servicio;
do $$ declare t text; begin
 foreach t in array array['bienes','comandos','auditoria','outbox','configuracion_avisos','custodias'] loop
 execute format('create policy servicio on inventario.%I to inventario_servicio using(exists(select 1 from seguridad.principal() p where p.rol=''administrador'')) with check(exists(select 1 from seguridad.principal() p where p.rol=''administrador''))',t);
 end loop;
end $$;
create function inventario.guardar_bien(referencia uuid, clave uuid, esperada bigint, datos jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid; previo inventario.bienes; actual inventario.bienes; comando uuid:=gen_random_uuid();
 v_recurso text:=coalesce(referencia::text,'nuevo'); v_huella text:=encode(sha256(convert_to(datos::text,'UTF8')),'hex');
 repetido inventario.comandos; resultado jsonb; auditoria bigint; destinatario text; k text;
begin
 select p.actor_id into actor from seguridad.principal() p where p.rol='administrador';
 if actor is null then raise exception 'FORBIDDEN'; end if;
 if clave is null or jsonb_typeof(datos)<>'object' then raise exception 'INVALID_REQUEST'; end if;
 for k in select jsonb_object_keys(datos) loop
  if k not in ('codigo','serie','motivo_sin_serie','tipo','marca','modelo','condicion','adquisicion','observaciones','motivo')
    or (referencia is not null and k='condicion') then raise exception 'INVALID_REQUEST'; end if;
  if jsonb_typeof(datos->k) not in ('string','null') or length(datos->>k)>2000 then raise exception 'INVALID_REQUEST'; end if;
 end loop;
 foreach k in array array['codigo','tipo','marca','modelo','motivo'] loop
  if nullif(btrim(datos->>k),'') is null then raise exception 'INVALID_REQUEST'; end if;
 end loop;
 if datos->>'serie' is null and nullif(btrim(datos->>'motivo_sin_serie'),'') is null then raise exception 'BUSINESS_RULE'; end if;
 -- Una clave en ejecución se serializa; tras rollback se puede reintentar sin éxito fantasma.
 perform pg_advisory_xact_lock(hashtextextended(actor::text||v_recurso||clave::text,0));
 select * into repetido from inventario.comandos c where c.actor_id=actor and c.operacion='guardar_bien' and c.recurso=v_recurso and c.clave=guardar_bien.clave;
 if found then
  if repetido.huella<>v_huella then raise exception 'IDEMPOTENCY_MISMATCH'; end if;
  return repetido.resultado;
 end if;
 if referencia is not null then
  select * into previo from inventario.bienes where id=referencia for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if esperada is null then raise exception 'VERSION_REQUIRED'; end if;
  if previo.version<>esperada then raise exception 'VERSION_MISMATCH'; end if;
  update inventario.bienes set codigo=btrim(datos->>'codigo'),serie=btrim(datos->>'serie'),motivo_sin_serie=datos->>'motivo_sin_serie',
   tipo=btrim(datos->>'tipo'),marca=btrim(datos->>'marca'),modelo=btrim(datos->>'modelo'),adquisicion=(datos->>'adquisicion')::date,observaciones=datos->>'observaciones'
   where id=referencia returning * into actual;
 else
  insert into inventario.bienes(codigo,serie,motivo_sin_serie,tipo,marca,modelo,condicion,adquisicion,observaciones)
   values(btrim(datos->>'codigo'),btrim(datos->>'serie'),datos->>'motivo_sin_serie',btrim(datos->>'tipo'),btrim(datos->>'marca'),btrim(datos->>'modelo'),datos->>'condicion',(datos->>'adquisicion')::date,datos->>'observaciones') returning * into actual;
 end if;
 select c.destinatario into destinatario from inventario.configuracion_avisos c where id;
 if destinatario is null then raise exception 'NOTIFICATION_NOT_CONFIGURED'; end if;
 resultado:=jsonb_build_object('ref',actual.id,'version',actual.version,'aviso','pendiente');
 insert into inventario.comandos(id,actor_id,operacion,recurso,clave,huella,resultado) values(comando,actor,'guardar_bien',v_recurso,clave,v_huella,resultado);
 insert into inventario.auditoria(actor_id,comando_id,entidad,entidad_ref,accion,anterior,nuevo,motivo)
  values(actor,comando,'bien',actual.id::text,case when referencia is null then 'alta' else 'edicion' end,
  case when referencia is null then null else to_jsonb(previo) end,to_jsonb(actual),datos->>'motivo') returning id into auditoria;
 insert into inventario.outbox(auditoria_id,destinatario,proposito) values(auditoria,destinatario,'cambio_bien');
 return resultado;
end $$;
grant create on schema inventario to inventario_servicio;
alter function inventario.guardar_bien(uuid,uuid,bigint,jsonb) owner to inventario_servicio;
revoke create on schema inventario from inventario_servicio;
revoke all on function inventario.guardar_bien(uuid,uuid,bigint,jsonb) from public;
grant execute on function inventario.guardar_bien(uuid,uuid,bigint,jsonb) to inventario_runtime;
commit;
