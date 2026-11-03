-- Fase 11. Datos temporales privados de exportación; sin worker de avisos ni producción.
begin;
-- Adaptación de operador PostgreSQL gestionado, sin LOGIN ni BYPASSRLS.
set local createrole_self_grant = 'set';
grant select on inventario.movimientos to inventario_contexto;
create policy contexto_nombres_historia on inventario.movimientos for select to inventario_contexto using(true);
-- Proyección mínima de actores de historia compartida: no expone cuentas/correos/roles.
create function seguridad.nombre_actor(referencia uuid) returns text
language sql stable security definer set search_path=pg_catalog as $$
 select c.nombre from inventario.cuentas c
 where c.id=referencia and exists(select 1 from seguridad.principal() p where
  p.rol='administrador' or exists(select 1 from inventario.movimientos m where m.actor_id=referencia))
$$;
grant create on schema seguridad to inventario_contexto;
alter function seguridad.nombre_actor(uuid) owner to inventario_contexto;
revoke create on schema seguridad from inventario_contexto;
revoke all on function seguridad.nombre_actor(uuid) from public;
grant execute on function seguridad.nombre_actor(uuid) to inventario_runtime;

create table inventario.exportaciones (
 id uuid primary key default gen_random_uuid(),
 solicitante uuid not null references inventario.cuentas(id),
 clave uuid not null,
 huella text not null check(huella ~ '^[0-9a-f]{64}$'),
 tipo text not null check(tipo in ('inventario','por-funcionario','movimientos','por-condicion','auditoria','busqueda')),
 formato text not null check(formato in ('xlsx','pdf')),
 filtros jsonb not null check(jsonb_typeof(filtros)='object'),
 total integer not null check(total>=0 and total<=case formato when 'xlsx' then 10000 else 2000 end),
 estado text not null default 'pendiente' check(estado in ('pendiente','procesando','listo','fallido','caducado')),
 instantanea jsonb check(octet_length(instantanea::text)<=33554432),
 archivo bytea check(octet_length(archivo)<=52428800),
 error text check(error in ('EXPORT_FAILED','EXPORT_TIMEOUT')),
 intento uuid,
 arrendamiento_hasta timestamptz,
 generado_en timestamptz not null,
 creado_en timestamptz not null default clock_timestamp(),
 vence_en timestamptz not null default clock_timestamp()+interval '1 hour',
 unique(solicitante,clave),
 check(vence_en>creado_en),
 check(estado<>'listo' or archivo is not null),
 check(estado not in ('fallido','caducado') or (archivo is null and instantanea is null))
);
alter table inventario.exportaciones enable row level security;
alter table inventario.exportaciones force row level security;
revoke all on inventario.exportaciones from public;
grant select,insert,update on inventario.exportaciones to inventario_runtime;
create policy exportacion_propia on inventario.exportaciones to inventario_runtime
 using(solicitante=(select actor_id from seguridad.principal()) and (tipo<>'auditoria' or (select rol from seguridad.principal())='administrador'))
 with check(solicitante=(select actor_id from seguridad.principal()) and (tipo<>'auditoria' or (select rol from seguridad.principal())='administrador'));
create index exportaciones_activas on inventario.exportaciones(solicitante,vence_en) where estado in ('pendiente','procesando');

create function inventario.proteger_exportacion() returns trigger language plpgsql set search_path=pg_catalog as $$
begin
 if tg_op='INSERT' then
  if new.estado<>'pendiente' or new.archivo is not null or new.instantanea is null then raise exception 'INVALID_REQUEST'; end if;
 else
  if (new.id,new.solicitante,new.clave,new.huella,new.tipo,new.formato,new.filtros,new.total,new.generado_en,new.creado_en,new.vence_en)
     is distinct from (old.id,old.solicitante,old.clave,old.huella,old.tipo,old.formato,old.filtros,old.total,old.generado_en,old.creado_en,old.vence_en)
  then raise exception 'IMMUTABLE_EXPORT'; end if;
  if new.estado='caducado' then
   if old.vence_en>clock_timestamp() then raise exception 'INVALID_REQUEST'; end if;
  elsif old.estado='pendiente' and new.estado='procesando' then null;
  elsif old.estado='procesando' and new.estado in ('listo','fallido') then null;
  elsif old.estado='procesando' and new.estado='procesando' and old.arrendamiento_hasta<clock_timestamp() then null;
  else raise exception 'INVALID_REQUEST'; end if;
  if new.instantanea is not null and new.instantanea is distinct from old.instantanea then raise exception 'IMMUTABLE_EXPORT'; end if;
 end if;
 return new;
end $$;
revoke all on function inventario.proteger_exportacion() from public;
create trigger proteger_exportacion before insert or update on inventario.exportaciones for each row execute function inventario.proteger_exportacion();
-- PostgreSQL de pruebas puede no tener roles Data API. Cuando existen, revocar explícitamente.
do $$ declare r text; begin
 for r in select rolname from pg_roles where rolname in ('anon','authenticated') loop
  execute format('revoke all on inventario.exportaciones from %I',r);
  execute format('revoke all on function seguridad.nombre_actor(uuid) from %I',r);
  execute format('revoke all on function inventario.proteger_exportacion() from %I',r);
 end loop;
end $$;
commit;
