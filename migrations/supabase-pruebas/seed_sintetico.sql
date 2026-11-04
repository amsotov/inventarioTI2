-- Solo inventarioTI2/yhsfotxhaptinjtmrinn, baseline existente; no modelo SQL Server.
begin;
set local timezone = 'UTC';
do $seed$
declare u1 uuid; u2 uuid; i integer;
begin
 if exists(select 1 from inventario.unidades) or exists(select 1 from inventario.funcionarios) or exists(select 1 from inventario.bienes) or exists(select 1 from inventario.cuentas) then
  raise exception 'SEED_REQUIERE_BASELINE_VACIA; no sobrescribir ni omitir diferencias';
 end if;
 insert into inventario.unidades(nombre) values('SINT — Soporte TI') returning id into u1;
 insert into inventario.unidades(nombre) values('SINT — Administración') returning id into u2;
 for i in 1..3 loop
  insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,correo,unidad_id,activo)
  values('ID','SINT-FUNC-'||lpad(i::text,3,'0'),'Persona sintética '||i,'Cargo de ensayo','persona'||i||'@example.invalid',case when i=1 then u1 else u2 end,i<>3);
 end loop;
 for i in 1..6 loop
  insert into inventario.bienes(codigo,serie,motivo_sin_serie,tipo,marca,modelo,condicion,situacion,adquisicion,observaciones)
  values('SINT-TI-'||lpad(i::text,3,'0'),case when i<=4 then 'SINT-SERIE-'||i end,case when i>4 then 'Equipo de ensayo sin serie real' end,
   (array['Notebook','Monitor','Impresora','UPS','Escáner','Switch'])[i],'Marca sintética','Modelo sintético',case when i=3 then 'malo' when i=2 then 'regular' else 'bueno' end,
   case when i=6 then 'baja' else 'activo' end,case when i=5 then null else date '2026-01-15' end,'Datos sintéticos de validación; sin historia real ni credenciales');
 end loop;
end $seed$;
commit;
select 'SEED_SINTETICO_APLICADO' as resultado,(select count(*)::integer from inventario.unidades) as unidades,(select count(*)::integer from inventario.funcionarios) as funcionarios,(select count(*)::integer from inventario.bienes) as bienes,(select count(*)::integer from inventario.cuentas) as cuentas;
