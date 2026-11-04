-- Ensayo SQL del sistema existente en inventarioTI2. No login real, HTTP o SQL Server.
-- Toda cuenta/sesión/operación de esta transacción se revierte; las secuencias pueden avanzar.
begin;
set local timezone = 'UTC';
do $ensayo$
declare
 n integer:=0; actor uuid:=gen_random_uuid(); lector uuid:=gen_random_uuid(); unidad uuid;
 sesion text:=encode(sha256(convert_to(gen_random_uuid()::text,'UTF8')),'hex');
 sesion_lector text:=encode(sha256(convert_to(gen_random_uuid()::text,'UTF8')),'hex');
 momento numeric:=extract(epoch from (statement_timestamp()-interval '1 second'))*1000;
 v_clave uuid:=gen_random_uuid(); resultado jsonb; repetido jsonb; bien uuid; f1 uuid; f2 uuid; datos jsonb; edicion jsonb;
begin
 if current_user<>'postgres' then raise exception 'ENSAYO_REQUIERE_OPERADOR_PRIVILEGIADO_NO_RUNTIME'; end if;
 if (select count(*) from inventario.cuentas)<>0 or (select count(*) from acceso.sesiones)<>0 then raise exception 'CUENTAS_NO_VACIAS_REVISAR'; end if;
 select id into strict unidad from inventario.unidades where nombre='SINT — Soporte TI';
 insert into inventario.cuentas(id,nombre,correo,rol,estado,credencial_lista)
 values(actor,'Administrador efímero','admin-ensayo@example.invalid','administrador','activa',true),
       (lector,'Lector efímero','lector-ensayo@example.invalid','lectura','activa',true);
 insert into acceso.sesiones(huella,cuenta_id,datos) values
 (sesion,actor,jsonb_build_object('accountId',actor,'version',1,'revoked',false,'created',momento,'activity',momento,'mfa',true)),
 (sesion_lector,lector,jsonb_build_object('accountId',lector,'version',1,'revoked',false,'created',momento,'activity',momento,'mfa',false));
 insert into inventario.configuracion_avisos(destinatario) values('sin-envio@example.invalid');
 perform set_config('inventario.sesion',sesion,true);
 execute 'set local role inventario_runtime';

 -- PG01: principal administrativo con contexto de prueba (no prueba del proveedor MFA).
 if not exists(select 1 from seguridad.principal() p where p.actor_id=actor and p.rol='administrador') then raise exception 'PG01'; end if; n:=n+1;
 -- PG02: runtime sin DML directo.
 begin
  insert into inventario.bienes(codigo,tipo,marca,modelo,condicion,motivo_sin_serie) values('PROHIBIDO','Notebook','Prueba','Prueba','bueno','Prueba');
  raise exception 'PG02_NO_DENEGADO';
 exception when insufficient_privilege then n:=n+1; end;
 datos:=jsonb_build_object('codigo','ENSAYO-0001','serie',null,'motivo_sin_serie','Sin serie sintética','tipo','Notebook','marca','Marca sintética','modelo','Modelo sintético','condicion','bueno','motivo','Ensayo SQL reversible');
 -- PG03: alta por función privada, versión y UUID resultantes.
 resultado:=inventario.guardar_bien(null,v_clave,null,datos);bien:=(resultado->>'ref')::uuid;
 if bien is null or (resultado->>'version')::bigint<>1 then raise exception 'PG03'; end if;n:=n+1;
 -- PG04: replay con misma clave conserva resultado y un solo efecto.
 repetido:=inventario.guardar_bien(null,v_clave,null,datos);
 if repetido<>resultado then raise exception 'PG04'; end if;
 execute 'reset role';
 if (select count(*) from inventario.comandos where actor_id=actor and comandos.clave=v_clave)<>1
 or (select count(*) from inventario.auditoria where actor_id=actor)<>1
 or (select count(*) from inventario.outbox)<>1 then raise exception 'PG04_EFECTOS'; end if;
 execute 'set local role inventario_runtime';n:=n+1;
 -- PG05: misma clave y contenido distinto rechazado.
 begin perform inventario.guardar_bien(null,v_clave,null,datos||jsonb_build_object('codigo','OTRO'));raise exception 'PG05_NO_DENEGADO';
 exception when raise_exception then if sqlerrm<>'IDEMPOTENCY_MISMATCH' then raise;end if;n:=n+1;end;
 -- PG06: código único canónico.
 begin perform inventario.guardar_bien(null,gen_random_uuid(),null,datos||jsonb_build_object('codigo',' ensayo-0001 '));raise exception 'PG06_NO_DENEGADO';
 exception when unique_violation then n:=n+1;end;
 -- PG07: ausencia de serie exige motivo.
 begin perform inventario.guardar_bien(null,gen_random_uuid(),null,datos-'motivo_sin_serie');raise exception 'PG07_NO_DENEGADO';
 exception when raise_exception then if sqlerrm<>'BUSINESS_RULE' then raise;end if;n:=n+1;end;
 edicion:=(datos-'condicion')||jsonb_build_object('modelo','Modelo actualizado');
 -- PG08: versión incorrecta.
 begin perform inventario.guardar_bien(bien,gen_random_uuid(),99,edicion);raise exception 'PG08_NO_DENEGADO';
 exception when raise_exception then if sqlerrm<>'VERSION_MISMATCH' then raise;end if;n:=n+1;end;
 -- PG09: edición aumenta versión.
 resultado:=inventario.guardar_bien(bien,gen_random_uuid(),1,edicion);
 if (resultado->>'version')::bigint<>2 then raise exception 'PG09';end if;n:=n+1;
 -- PG10: versión obsoleta posterior al cambio.
 begin perform inventario.guardar_bien(bien,gen_random_uuid(),1,edicion);raise exception 'PG10_NO_DENEGADO';
 exception when raise_exception then if sqlerrm<>'VERSION_MISMATCH' then raise;end if;n:=n+1;end;
 -- PG11: alta de persona y pertenencia histórica por función.
 resultado:=inventario.procesar('funcionario',null,gen_random_uuid(),null,jsonb_build_object('documento_tipo','ID','documento','ENSAYO-FUNC-1','nombre','Persona efímera uno','cargo','Ensayo','unidad_id',unidad::text,'motivo','Ensayo reversible','confirmado',true));f1:=(resultado->>'ref')::uuid;
 if not exists(select 1 from inventario.pertenencias where funcionario_id=f1) then raise exception 'PG11';end if;n:=n+1;
 resultado:=inventario.procesar('funcionario',null,gen_random_uuid(),null,jsonb_build_object('documento_tipo','ID','documento','ENSAYO-FUNC-2','nombre','Persona efímera dos','cargo','Ensayo','unidad_id',unidad::text,'motivo','Ensayo reversible','confirmado',true));f2:=(resultado->>'ref')::uuid;
 -- PG12: asignación abre custodia única.
 resultado:=inventario.procesar('movimiento',bien::text,gen_random_uuid(),2,jsonb_build_object('tipo','asignacion','destino',f1::text,'motivo','Ensayo reversible','confirmado',true));
 if (resultado->>'version')::bigint<>3 or (select count(*) from inventario.custodias where bien_id=bien and fin_en is null)<>1 then raise exception 'PG12';end if;n:=n+1;
 -- PG13: asignación incompatible simultánea rechazada (sin ensayo de concurrencia real).
 begin perform inventario.procesar('movimiento',bien::text,gen_random_uuid(),3,jsonb_build_object('tipo','asignacion','destino',f2::text,'motivo','Ensayo reversible','confirmado',true));raise exception 'PG13_NO_DENEGADO';
 exception when raise_exception then if sqlerrm<>'BUSINESS_RULE' then raise;end if;n:=n+1;end;
 -- PG14: traspaso cierra y abre en el mismo instante.
 resultado:=inventario.procesar('movimiento',bien::text,gen_random_uuid(),3,jsonb_build_object('tipo','traslado','origenEsperado',f1::text,'destino',f2::text,'motivo','Ensayo reversible','confirmado',true));
 if (resultado->>'version')::bigint<>4 or (select count(*) from inventario.custodias where bien_id=bien and fin_en is null)<>1
 or not exists(select 1 from inventario.custodias anterior join inventario.custodias nueva on anterior.bien_id=nueva.bien_id and anterior.fin_en=nueva.inicio_en where anterior.bien_id=bien and anterior.funcionario_id=f1 and nueva.funcionario_id=f2 and nueva.fin_en is null) then raise exception 'PG14';end if;n:=n+1;
 -- PG15: baja bloqueada mientras hay custodia vigente.
 begin perform inventario.procesar('movimiento',bien::text,gen_random_uuid(),4,jsonb_build_object('tipo','baja','motivo','Ensayo reversible','confirmado',true));raise exception 'PG15_NO_DENEGADO';
 exception when raise_exception then if sqlerrm<>'BUSINESS_RULE' then raise;end if;n:=n+1;end;
 -- PG16/17: lector consulta inventario, pero no ve auditoría ni escribe.
 execute 'reset role';perform set_config('inventario.sesion',sesion_lector,true);execute 'set local role inventario_runtime';
 if (select count(*) from inventario.bienes)<1 or exists(select 1 from inventario.auditoria) then raise exception 'PG16';end if;n:=n+1;
 begin perform inventario.guardar_bien(null,gen_random_uuid(),null,datos||jsonb_build_object('codigo','LECTOR'));raise exception 'PG17_NO_DENEGADO';
 exception when raise_exception then if sqlerrm<>'FORBIDDEN' then raise;end if;n:=n+1;end;
 -- PG18: rol del navegador sin acceso al esquema privado.
 execute 'reset role';execute 'set local role anon';
 begin perform 1 from inventario.bienes;raise exception 'PG18_NO_DENEGADO';exception when insufficient_privilege then n:=n+1;end;
 -- PG19: revocación del estado de cuenta quita acceso al principal/RLS.
 execute 'reset role';update inventario.cuentas set estado='inactiva' where id=lector;execute 'set local role inventario_runtime';
 if exists(select 1 from seguridad.principal()) or exists(select 1 from inventario.bienes) then raise exception 'PG19';end if;n:=n+1;
 -- PG20: ni el operador puede modificar la evidencia con DML ordinario.
 execute 'reset role';
 begin update inventario.auditoria set motivo='No permitido' where actor_id=actor;raise exception 'PG20_NO_DENEGADO';exception when check_violation then n:=n+1;end;
 if n<>20 then raise exception 'ENSAYO_INCOMPLETO: %',n;end if;
end $ensayo$;
rollback;
-- Solo se llega aquí si todas las aserciones del batch terminaron sin error.
select 'APROBADO' as resultado,20 as casos_sql,
 (select count(*)::integer from inventario.unidades) as unidades,
 (select count(*)::integer from inventario.funcionarios) as funcionarios,
 (select count(*)::integer from inventario.bienes) as bienes,
 (select count(*)::integer from inventario.cuentas) as cuentas,
 (select count(*)::integer from acceso.sesiones) as sesiones,
 (select count(*)::integer from inventario.comandos) as comandos,
 (select count(*)::integer from inventario.auditoria) as auditoria,
 (select count(*)::integer from inventario.outbox) as outbox;
