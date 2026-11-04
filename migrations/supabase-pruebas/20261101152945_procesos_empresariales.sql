begin;
-- Adaptación de operador PostgreSQL gestionado, sin LOGIN ni BYPASSRLS.
set local createrole_self_grant = 'set';
-- Servicio privado sin DML directo para runtime ni permisos públicos.
grant select,insert on inventario.funcionarios,inventario.pertenencias,inventario.movimientos,inventario.anotaciones to inventario_servicio;
grant select,update(nombre) on inventario.unidades to inventario_servicio; -- FOR SHARE de validación/instantáneas
grant insert on inventario.custodias to inventario_servicio;
grant update(documento_tipo,documento,nombre,cargo,correo,unidad_id,activo) on inventario.funcionarios to inventario_servicio;
grant update(condicion,situacion,version) on inventario.bienes to inventario_servicio;
grant update(fin_en,cierre_id) on inventario.custodias to inventario_servicio;
grant usage on sequence inventario.pertenencias_id_seq,inventario.movimientos_id_seq,inventario.anotaciones_id_seq to inventario_servicio;
grant execute on function inventario.documento_canon(text,text),inventario.rut_valido(text) to inventario_servicio;
do $$ declare t text; begin
 foreach t in array array['funcionarios','pertenencias','movimientos','anotaciones','unidades'] loop
 execute format('create policy procesos on inventario.%I to inventario_servicio using(exists(select 1 from seguridad.principal() p where p.rol=''administrador'')) with check(exists(select 1 from seguridad.principal() p where p.rol=''administrador''))',t);
 end loop;
end $$;
create function inventario.procesar(operacion text, referencia text, clave uuid, esperada bigint, datos jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare actor uuid; cmd uuid:=gen_random_uuid(); v_recurso text:=coalesce(referencia,'nuevo');
 v_huella text:=encode(sha256(convert_to(datos::text,'UTF8')),'hex'); repetido inventario.comandos;
 f inventario.funcionarios; anterior jsonb; nuevo jsonb; b inventario.bienes; c inventario.custodias;
 destino uuid; origen uuid; mid bigint; aid bigint; anotacion bigint; resultado jsonb; destinatario text; k text; permitidas text[]; ver bigint; entidad text; ref text; accion text;
begin
 select p.actor_id into actor from seguridad.principal() p where p.rol='administrador';
 if actor is null then raise exception 'FORBIDDEN'; end if;
 if clave is null or jsonb_typeof(datos) is distinct from 'object' then raise exception 'INVALID_REQUEST'; end if;
 permitidas:=case operacion when 'funcionario' then array['documento_tipo','documento','nombre','cargo','correo','unidad_id','motivo','confirmado']
 when 'pertenencia' then array['unidad_id','motivo','confirmado'] when 'estado' then array['activo','motivo','confirmado']
 when 'movimiento' then array['tipo','destino','origenEsperado','condicion','corrige_id','motivo','confirmado']
 when 'anotacion' then array['texto','motivo','confirmado'] else null end;
 if permitidas is null then raise exception 'INVALID_REQUEST'; end if;
 for k in select jsonb_object_keys(datos) loop
  if not(k=any(permitidas)) or length(datos->>k)>2000 then raise exception 'INVALID_REQUEST'; end if;
  if k in ('confirmado','activo') then
   if jsonb_typeof(datos->k)<>'boolean' then raise exception 'INVALID_REQUEST'; end if;
  elsif jsonb_typeof(datos->k) not in ('string','null') then raise exception 'INVALID_REQUEST'; end if;
 end loop;
 if datos->'confirmado' is distinct from 'true'::jsonb or nullif(btrim(datos->>'motivo'),'') is null then raise exception 'INVALID_REQUEST'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||operacion||v_recurso||clave::text,0));
 select * into repetido from inventario.comandos x where x.actor_id=actor and x.operacion=procesar.operacion and x.recurso=v_recurso and x.clave=procesar.clave;
 if found then
  if repetido.huella<>v_huella then raise exception 'IDEMPOTENCY_MISMATCH'; end if;
  return repetido.resultado;
 end if;
 -- Mutex de procesos; luego bien -> funcionarios ordenados -> unidades.
 perform pg_advisory_xact_lock(hashtextextended('inventario.procesos',0));
 if operacion in ('funcionario','pertenencia','estado') then
  entidad:='funcionario';
  if referencia is not null then
   select * into f from inventario.funcionarios where id=referencia::uuid for update;
   if not found then raise exception 'NOT_FOUND'; end if;
   anterior:=to_jsonb(f); ver:=f.version;
  elsif operacion<>'funcionario' then raise exception 'INVALID_REQUEST'; end if;
 elsif operacion in ('movimiento','anotacion') then
  entidad:='bien';
  if operacion='anotacion' then
   select bien_id into destino from inventario.movimientos where id=referencia::bigint;
   if not found then raise exception 'NOT_FOUND'; end if;
  else destino:=referencia::uuid; end if;
  select * into b from inventario.bienes where id=destino for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  anterior:=to_jsonb(b); ver:=b.version;
 end if;
 if referencia is not null then
  if esperada is null then raise exception 'VERSION_REQUIRED'; end if;
  if ver<>esperada then raise exception 'VERSION_MISMATCH'; end if;
 end if;
 if operacion='funcionario' then
  foreach k in array array['documento_tipo','documento','nombre','cargo'] loop
   if nullif(btrim(datos->>k),'') is null then raise exception 'INVALID_REQUEST'; end if;
  end loop;
  if referencia is null then
   insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,correo,unidad_id)
   values(datos->>'documento_tipo',inventario.documento_canon(datos->>'documento_tipo',datos->>'documento'),btrim(datos->>'nombre'),btrim(datos->>'cargo'),datos->>'correo',(datos->>'unidad_id')::uuid) returning * into f;
  else
   if datos ? 'unidad_id' then raise exception 'INVALID_REQUEST'; end if;
   update inventario.funcionarios set documento_tipo=datos->>'documento_tipo',documento=inventario.documento_canon(datos->>'documento_tipo',datos->>'documento'),nombre=btrim(datos->>'nombre'),cargo=btrim(datos->>'cargo'),correo=datos->>'correo' where id=f.id returning * into f;
  end if;
 elsif operacion='pertenencia' then
  if (datos->>'unidad_id')::uuid=f.unidad_id then raise exception 'BUSINESS_RULE'; end if;
  update inventario.funcionarios set unidad_id=(datos->>'unidad_id')::uuid where id=f.id returning * into f;
 elsif operacion='estado' then
  if not(datos ? 'activo') or (datos->>'activo')::boolean=f.activo then raise exception 'BUSINESS_RULE'; end if;
  update inventario.funcionarios set activo=(datos->>'activo')::boolean where id=f.id returning * into f;
 elsif operacion='movimiento' then
  accion:=datos->>'tipo';
  select * into c from inventario.custodias where bien_id=b.id and fin_en is null;
  origen:=c.funcionario_id; destino:=(datos->>'destino')::uuid;
  perform 1 from inventario.funcionarios where id in (origen,destino) order by id for update;
  if accion not in ('asignacion','devolucion','traslado','condicion','baja','reactivacion') or accion is null then raise exception 'INVALID_REQUEST'; end if;
  if accion in ('asignacion','traslado') then
   if destino is null or not exists(select 1 from inventario.funcionarios where id=destino and activo) or b.situacion<>'activo' or b.condicion='malo' then raise exception 'BUSINESS_RULE'; end if;
  elsif datos ? 'destino' then raise exception 'INVALID_REQUEST'; end if;
  if accion='asignacion' and origen is not null then raise exception 'BUSINESS_RULE'; end if;
  if accion in ('devolucion','traslado') then
   if origen is null or origen is distinct from (datos->>'origenEsperado')::uuid or origen=destino then raise exception 'BUSINESS_RULE'; end if;
  elsif datos ? 'origenEsperado' then raise exception 'INVALID_REQUEST'; end if;
  if accion='condicion' then
   if datos->>'condicion' not in ('bueno','regular','malo') or datos->>'condicion' is null or datos->>'condicion'=b.condicion then raise exception 'BUSINESS_RULE'; end if;
  elsif datos ? 'condicion' then raise exception 'INVALID_REQUEST'; end if;
  if accion='baja' and (origen is not null or b.situacion='baja') or accion='reactivacion' and b.situacion<>'baja' then raise exception 'BUSINESS_RULE'; end if;
  if datos ? 'corrige_id' and not exists(select 1 from inventario.movimientos where id=(datos->>'corrige_id')::bigint and bien_id=b.id) then raise exception 'BUSINESS_RULE'; end if;
  update inventario.bienes set condicion=case when accion='condicion' then datos->>'condicion' else condicion end,
   situacion=case accion when 'baja' then 'baja' when 'reactivacion' then 'activo' else situacion end where id=b.id returning to_jsonb(bienes) into nuevo;
 elsif operacion='anotacion' then
  if nullif(btrim(datos->>'texto'),'') is null then raise exception 'INVALID_REQUEST'; end if;
  update inventario.bienes set version=version where id=b.id returning to_jsonb(bienes) into nuevo;
 end if;
 if entidad='funcionario' then nuevo:=to_jsonb(f); ref:=f.id::text; else ref:=b.id::text; end if;
 resultado:=jsonb_build_object('ref',ref,'version',nuevo->'version','aviso','pendiente');
 insert into inventario.comandos(id,actor_id,operacion,recurso,clave,huella,resultado) values(cmd,actor,operacion,v_recurso,clave,v_huella,resultado);
 if entidad='funcionario' and (operacion='pertenencia' or referencia is null) then
  insert into inventario.pertenencias(funcionario_id,unidad_id,unidad_nombre,actor_id,comando_id,motivo) values(f.id,f.unidad_id,'servidor',actor,cmd,datos->>'motivo');
 elsif operacion='movimiento' then
  insert into inventario.movimientos(bien_id,tipo,origen_id,destino_id,condicion_anterior,condicion_nueva,actor_id,comando_id,motivo,corrige_id)
  values(b.id,accion,case when accion in ('devolucion','traslado') then origen end,case when accion in ('asignacion','traslado') then destino end,
   case when accion='condicion' then b.condicion end,case when accion='condicion' then datos->>'condicion' end,actor,cmd,datos->>'motivo',(datos->>'corrige_id')::bigint) returning id into mid;
  if accion in ('devolucion','traslado') then update inventario.custodias set fin_en=clock_timestamp(),cierre_id=mid where id=c.id; end if;
  if accion in ('asignacion','traslado') then insert into inventario.custodias(bien_id,funcionario_id,inicio_en,apertura_id) values(b.id,destino,clock_timestamp(),mid); end if;
 elsif operacion='anotacion' then
  insert into inventario.anotaciones(movimiento_id,actor_id,comando_id,texto,motivo) values(referencia::bigint,actor,cmd,datos->>'texto',datos->>'motivo') returning id into anotacion;
 end if;
 select x.destinatario into destinatario from inventario.configuracion_avisos x where id;
 if destinatario is null then raise exception 'NOTIFICATION_NOT_CONFIGURED'; end if;
 insert into inventario.auditoria(actor_id,comando_id,entidad,entidad_ref,accion,anterior,nuevo,motivo)
 values(actor,cmd,entidad,ref,coalesce(accion,operacion),anterior,nuevo||jsonb_build_object('movimiento_id',mid,'anotacion_id',anotacion),datos->>'motivo') returning id into aid;
 insert into inventario.outbox(auditoria_id,destinatario,proposito) values(aid,destinatario,'proceso_empresarial');
 return resultado;
end $$;
grant create on schema inventario to inventario_servicio;
alter function inventario.procesar(text,text,uuid,bigint,jsonb) owner to inventario_servicio;
revoke create on schema inventario from inventario_servicio;
revoke all on function inventario.procesar(text,text,uuid,bigint,jsonb) from public;
grant execute on function inventario.procesar(text,text,uuid,bigint,jsonb) to inventario_runtime;
commit;
