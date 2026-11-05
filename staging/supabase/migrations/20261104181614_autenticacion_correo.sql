-- Cambio autorizado de autenticación del laboratorio inventarioTI2.
-- No cambia RLS/ACL/roles ni certifica SQL Server. No reutilizar en otro entorno.
begin;
do $$ begin
 if laboratorio_ti.version()<>'postgres-lab-v1' then raise exception 'WRONG_DATABASE';end if;
end $$;

grant create on schema seguridad to inventario_contexto;
set local role inventario_contexto;
create or replace function seguridad.principal() returns table(actor_id uuid,rol text)
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
 and s.datos->>'method'='email-otp'
 and s.datos->>'emailVerified'='true'
$$;

reset role;
revoke create on schema seguridad from inventario_contexto;

-- Invalidar sesiones y autorizaciones anteriores; no eliminar historia.
update acceso.sesiones set datos=jsonb_set(datos,'{revoked}','true');
update inventario.cuentas set version_autorizacion=version_autorizacion+1;

commit;
