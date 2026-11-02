-- Only a newly restored, isolated target, with web/identity/notification dispatch stopped.
-- Never run against the source. Keep the original encrypted backup and incident evidence.
begin;
set local timezone = 'UTC';
update acceso.sesiones set datos=jsonb_set(datos,'{revoked}','true');
update acceso.intenciones set datos=jsonb_set(datos,'{state}','"superseded"')
 where datos->>'state'='pending';
update acceso.entregas set estado='incierta' where estado in ('pendiente','procesando');
-- A pending row in the old snapshot may already have been sent after the snapshot.
update inventario.outbox set estado='incierto',ultimo_error_codigo='RECOVERY_RECONCILIATION',
 reclamacion=null,arrendamiento_hasta=null,version=version+1
 where estado in ('pendiente','procesando');
commit;
