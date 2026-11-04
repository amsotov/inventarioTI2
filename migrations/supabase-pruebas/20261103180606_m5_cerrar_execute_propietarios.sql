-- Cierre de ACL como propietario efectivo; postgres gestionado no es SUPERUSER ni INHERIT.
-- Restituye solo los GRANT explícitos de las ocho migraciones fuente.
begin;
do $acl$
declare r record; destinatario text; propietario_actual text;
begin
 if current_user<>'postgres' then raise exception 'MIGRADOR_NO_ESPERADO';end if;
 for r in select * from (values
  ('seguridad.principal()','inventario_contexto',array['inventario_runtime','inventario_servicio','inventario_admin','inventario_avisos']::text[]),
  ('seguridad.nombre_actor(uuid)','inventario_contexto',array['inventario_runtime']::text[]),
  ('inventario.guardar_bien(uuid,uuid,bigint,jsonb)','inventario_servicio',array['inventario_runtime']::text[]),
  ('inventario.procesar(text,text,uuid,bigint,jsonb)','inventario_servicio',array['inventario_runtime']::text[]),
  ('inventario.administrar(text,uuid,uuid,bigint,jsonb)','inventario_admin',array['inventario_runtime']::text[]),
  ('inventario.contenido_aviso(bigint,text)','inventario_avisos',array[]::text[]),
  ('inventario.reclamar_aviso()','inventario_avisos',array['inventario_worker']::text[]),
  ('inventario.finalizar_aviso(uuid,uuid,text,text)','inventario_avisos',array['inventario_worker']::text[]),
  ('inventario.accion_aviso(uuid,uuid,bigint,jsonb)','inventario_avisos',array['inventario_runtime']::text[])
 ) as x(firma,propietario,destinatarios) loop
  select pg_get_userbyid(p.proowner) into propietario_actual from pg_proc p where p.oid=to_regprocedure(r.firma);
  if propietario_actual is distinct from r.propietario then raise exception 'PROPIETARIO_NO_ESPERADO: %',r.firma;end if;
  execute format('set local role %I',r.propietario);
  execute format('revoke execute on function %s from public',r.firma);
  foreach destinatario in array r.destinatarios loop
   execute format('grant execute on function %s to %I',r.firma,destinatario);
  end loop;
  execute 'reset role';
 end loop;
end $acl$;
commit;
