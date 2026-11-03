-- Fase 6: roles sin login. No crea credenciales ni modifica identidades reales.
begin;
-- Adaptación de operador PostgreSQL gestionado, sin LOGIN ni BYPASSRLS.
set local createrole_self_grant = 'set';
create role inventario_auth nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role inventario_runtime nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role inventario_contexto nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create schema seguridad;
revoke all on schema seguridad from public;
alter default privileges in schema seguridad revoke execute on functions from public;
grant usage on schema inventario,acceso to inventario_auth;
grant select on inventario.cuentas to inventario_auth;
grant update(proveedor_ref,estado,version_autorizacion,credencial_lista) on inventario.cuentas to inventario_auth;
create policy auth_cuentas on inventario.cuentas to inventario_auth using(true) with check(true);
grant select,insert,update on all tables in schema acceso to inventario_auth;
do $$ declare t text; begin
 foreach t in array array['sesiones','intenciones','entregas','limites'] loop
  execute format('create policy autenticacion on acceso.%I to inventario_auth using(true) with check(true)',t);
 end loop;
end $$;
-- Lookup privilegiado estrictamente acotado: propietario sin BYPASSRLS, sin escritura.
grant usage on schema inventario,acceso,seguridad to inventario_contexto;
grant select on inventario.cuentas,acceso.sesiones to inventario_contexto;
create policy contexto_cuentas on inventario.cuentas for select to inventario_contexto using(true);
create policy contexto_sesiones on acceso.sesiones for select to inventario_contexto using(true);
create function seguridad.principal() returns table(actor_id uuid,rol text)
language sql stable security definer set search_path=pg_catalog as $$
 select c.id,c.rol from acceso.sesiones s join inventario.cuentas c on c.id=s.cuenta_id
 where s.huella=nullif(current_setting('inventario.sesion',true),'')
 and s.datos->>'accountId'=c.id::text
 and c.estado='activa' and c.credencial_lista
 and s.datos->>'version'=c.version_autorizacion::text
 and s.datos->>'revoked'='false'
 and (s.datos->>'created')::numeric > extract(epoch from statement_timestamp())*1000-28800000
 and (s.datos->>'activity')::numeric > extract(epoch from statement_timestamp())*1000-1800000
 and (s.datos->>'created')::numeric <= extract(epoch from statement_timestamp())*1000
 and (s.datos->>'activity')::numeric <= extract(epoch from statement_timestamp())*1000
 and (c.rol='lectura' or s.datos->>'mfa'='true')
$$;
grant create on schema seguridad to inventario_contexto;
alter function seguridad.principal() owner to inventario_contexto;
revoke create on schema seguridad from inventario_contexto;
revoke all on function seguridad.principal() from public;
grant usage on schema seguridad,inventario to inventario_runtime;
grant execute on function seguridad.principal() to inventario_runtime;
-- Lectura compartida. No se conceden escrituras genéricas de negocio.
do $$ declare t text; begin
 foreach t in array array['unidades','funcionarios','bienes','pertenencias','movimientos','custodias','anotaciones'] loop
  execute format('grant select on inventario.%I to inventario_runtime',t);
  execute format('create policy consulta_compartida on inventario.%I for select to inventario_runtime using(exists(select 1 from seguridad.principal()))',t);
 end loop;
 foreach t in array array['cuentas','auditoria','configuracion_avisos'] loop
  execute format('grant select on inventario.%I to inventario_runtime',t);
  execute format('create policy consulta_administrativa on inventario.%I for select to inventario_runtime using(exists(select 1 from seguridad.principal() p where p.rol=''administrador''))',t);
 end loop;
end $$;
-- Bitácora técnica separada de auditoría empresarial RF-12 (comando obligatorio).
create table seguridad.eventos (
 id bigint generated always as identity primary key,
 actor_id uuid not null references inventario.cuentas(id),
 permiso text not null check(permiso in ('inventario.consultar','historial.consultar','reportes.exportar','inventario.modificar','cuentas.administrar','configuracion.administrar','auditoria.consultar','auditoria.exportar')),
 permitido boolean not null,
 registrado_en timestamptz not null default clock_timestamp()
);
create index eventos_actor_fecha on seguridad.eventos(actor_id,registrado_en);
alter table seguridad.eventos enable row level security;
revoke all on seguridad.eventos from public;
grant select,insert on seguridad.eventos to inventario_runtime;
grant usage on sequence seguridad.eventos_id_seq to inventario_runtime;
create policy registrar on seguridad.eventos for insert to inventario_runtime
 with check(actor_id=(select p.actor_id from seguridad.principal() p));
create policy consultar on seguridad.eventos for select to inventario_runtime
 using(exists(select 1 from seguridad.principal() p where p.rol='administrador'));
create trigger eventos_inmutables before update or delete on seguridad.eventos for each row execute function inventario.inmutable();
create trigger eventos_no_truncate before truncate on seguridad.eventos for each statement execute function inventario.inmutable();
commit;
