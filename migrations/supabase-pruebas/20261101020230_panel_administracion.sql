-- Fase 9: superficie administrativa privada, sin credenciales ni permisos remotos.
begin;
-- Adaptación de operador PostgreSQL gestionado, sin LOGIN ni BYPASSRLS.
set local createrole_self_grant = 'set';
create role inventario_admin nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
grant usage on schema inventario,seguridad to inventario_admin;
grant execute on function seguridad.principal() to inventario_admin;
grant execute on function inventario.canon(text) to inventario_admin;
grant select,insert on inventario.cuentas,inventario.unidades,inventario.configuracion_avisos,inventario.comandos,inventario.auditoria,inventario.outbox to inventario_admin;
grant update(nombre,rol,estado,version_autorizacion,credencial_lista) on inventario.cuentas to inventario_admin;
grant update(nombre,activa) on inventario.unidades to inventario_admin;
grant update(destinatario) on inventario.configuracion_avisos to inventario_admin;
grant usage on sequence inventario.auditoria_id_seq to inventario_admin;
do $$ declare t text; begin
 foreach t in array array['cuentas','unidades','configuracion_avisos','comandos','auditoria','outbox'] loop
 execute format('create policy administracion on inventario.%I to inventario_admin using(exists(select 1 from seguridad.principal() p where p.rol=''administrador'')) with check(exists(select 1 from seguridad.principal() p where p.rol=''administrador''))',t);
 end loop;
end $$;
create function inventario.administrar(recurso text, referencia uuid, clave uuid, esperada bigint, datos jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid; previo jsonb; actual jsonb; repetido inventario.comandos; resultado jsonb;
 comando uuid:=gen_random_uuid(); evento bigint; destino text; anterior_destino text;
 huella text:=encode(sha256(convert_to(jsonb_build_array(datos,esperada)::text,'UTF8')),'hex');
 ref text:=coalesce(referencia::text,'nuevo'); k text;
begin
 select p.actor_id into actor from seguridad.principal() p where p.rol='administrador';
 if actor is null then raise exception 'FORBIDDEN'; end if;
 if recurso not in ('cuentas','unidades','avisos') or clave is null or jsonb_typeof(datos)<>'object' then raise exception 'INVALID_REQUEST'; end if;
 if datos->'confirmado' is distinct from 'true'::jsonb or nullif(btrim(datos->>'motivo'),'') is null then raise exception 'INVALID_REQUEST'; end if;
 for k in select jsonb_object_keys(datos) loop
 if k not in ('nombre','correo','rol','estado','activa','destinatario','motivo','confirmado','forzar') then raise exception 'INVALID_REQUEST'; end if;
 if k not in ('confirmado','activa','forzar') and (jsonb_typeof(datos->k)<>'string' or length(datos->>k)>2000) then raise exception 'INVALID_REQUEST'; end if;
 end loop;
 -- Mutex independiente de Auth: nunca readquirir el lock de su otra conexión.
 perform pg_advisory_xact_lock(9102026);
 select p.actor_id into actor from seguridad.principal() p where p.rol='administrador';
 if actor is null then raise exception 'FORBIDDEN'; end if;
 select * into repetido from inventario.comandos c where c.actor_id=actor and c.operacion='admin_'||administrar.recurso and c.recurso=ref and c.clave=administrar.clave;
 if found then
 if repetido.huella<>huella then raise exception 'IDEMPOTENCY_MISMATCH'; end if;
 return repetido.resultado;
 end if;
 select c.destinatario into destino from inventario.configuracion_avisos c where id for update;
 anterior_destino:=destino;
 if recurso='cuentas' then
 if referencia=actor then raise exception 'SELF_PROTECTED'; end if;
 if referencia is null then
 insert into inventario.cuentas(nombre,correo,rol) values(btrim(datos->>'nombre'),lower(btrim(datos->>'correo')),datos->>'rol') returning to_jsonb(cuentas) into actual;
 else
 select to_jsonb(c) into previo from inventario.cuentas c where id=referencia for update;
 if previo is null then raise exception 'NOT_FOUND'; end if;
 if esperada is null then raise exception 'VERSION_REQUIRED'; end if;
 if (previo->>'version')::bigint<>esperada then raise exception 'VERSION_MISMATCH'; end if;
 if previo->>'rol'='administrador' and previo->>'estado'='activa' and
 (datos->>'rol'<>'administrador' or datos->>'estado'<>'activa' or datos->>'forzar'='true') and
 (select count(*) from inventario.cuentas where rol='administrador' and estado='activa' and credencial_lista)<=1 then raise exception 'LAST_ADMIN'; end if;
 if datos->>'estado'='activa' and not (previo->>'credencial_lista')::boolean then raise exception 'CREDENTIAL_REQUIRED'; end if;
 update inventario.cuentas set nombre=btrim(datos->>'nombre'),rol=datos->>'rol',estado=datos->>'estado',
 version_autorizacion=version_autorizacion+1,
 credencial_lista=case when datos->>'forzar'='true' then false else credencial_lista end
 where id=referencia returning to_jsonb(cuentas) into actual;
 end if;
 elsif recurso='unidades' then
 if referencia is null then
 insert into inventario.unidades(nombre) values(btrim(datos->>'nombre')) returning to_jsonb(unidades) into actual;
 else
 select to_jsonb(u) into previo from inventario.unidades u where id=referencia for update;
 if previo is null then raise exception 'NOT_FOUND'; end if;
 if esperada is null then raise exception 'VERSION_REQUIRED'; end if;
 if (previo->>'version')::bigint<>esperada then raise exception 'VERSION_MISMATCH'; end if;
 update inventario.unidades set nombre=btrim(datos->>'nombre'),activa=(datos->>'activa')::boolean where id=referencia returning to_jsonb(unidades) into actual;
 end if;
 else
 select to_jsonb(c) into previo from inventario.configuracion_avisos c where id;
 if previo is not null then
 if esperada is null then raise exception 'VERSION_REQUIRED'; end if;
 if (previo->>'version')::bigint<>esperada then raise exception 'VERSION_MISMATCH'; end if;
 if lower(btrim(datos->>'destinatario'))=lower(destino) then raise exception 'BUSINESS_RULE'; end if;
 update inventario.configuracion_avisos set destinatario=lower(btrim(datos->>'destinatario')) where id returning to_jsonb(configuracion_avisos) into actual;
 else
 insert into inventario.configuracion_avisos(destinatario) values(lower(btrim(datos->>'destinatario'))) returning to_jsonb(configuracion_avisos) into actual;
 end if;
 destino:=actual->>'destinatario';
 end if;
 if destino is null then raise exception 'NOTIFICATION_NOT_CONFIGURED'; end if;
 -- No exponer ni auditar referencias del proveedor/flags internos.
 previo:=previo-'proveedor_ref'-'credencial_lista'; actual:=actual-'proveedor_ref'-'credencial_lista';
 resultado:=jsonb_build_object('ref',coalesce(actual->>'id','avisos'),'version',actual->'version');
 insert into inventario.comandos(id,actor_id,operacion,recurso,clave,huella,resultado) values(comando,actor,'admin_'||administrar.recurso,ref,clave,huella,resultado);
 insert into inventario.auditoria(actor_id,comando_id,entidad,entidad_ref,accion,anterior,nuevo,motivo)
 values(actor,comando,recurso,resultado->>'ref',case when datos->>'forzar'='true' then 'forzar_clave' when previo is null then 'alta' else 'edicion' end,previo,actual,datos->>'motivo') returning id into evento;
 if recurso<>'unidades' then
 insert into inventario.outbox(auditoria_id,destinatario,proposito) values(evento,destino,case when recurso='avisos' then 'activacion_avisos' else 'cambio_cuenta' end);
 if recurso='avisos' and anterior_destino is not null then
 insert into inventario.outbox(auditoria_id,destinatario,proposito) values(evento,anterior_destino,'sustitucion_avisos');
 end if;
 end if;
 return resultado;
end $$;
grant create on schema inventario to inventario_admin;
alter function inventario.administrar(text,uuid,uuid,bigint,jsonb) owner to inventario_admin;
revoke create on schema inventario from inventario_admin;
revoke all on function inventario.administrar(text,uuid,uuid,bigint,jsonb) from public;
grant execute on function inventario.administrar(text,uuid,uuid,bigint,jsonb) to inventario_runtime;
commit;
