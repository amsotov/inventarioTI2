-- Semilla sintética de una sola ejecución. No crea usuarios Auth ni contraseñas.
-- Cada FK usa la identidad retornada/encontrada en esta semilla, nunca un ID generado supuesto.
begin;
do $$begin if exists(select 1 from laboratorio_ti.referencias) then raise exception 'LAB_SEED_ALREADY_USED';end if;end $$;
insert into laboratorio_ti."REGIONES"("REGI_NOMBRE") values('Región sintética');
insert into laboratorio_ti."DELEGACIONES"("DELE_REGION_ID","DELE_NOMBRE") select "REGI_ID",'Delegación de prueba' from laboratorio_ti."REGIONES" where "REGI_NOMBRE"='Región sintética';
insert into laboratorio_ti."DEPARTAMENTOS"("DEPA_NOMBRE") values('Tecnología de prueba'),('Operaciones de prueba');
insert into laboratorio_ti."AREAS"("AREA_NOMBRE") values('Área sintética');
insert into laboratorio_ti."TIPOS_EQUIPO"("TIPO_NOMBRE") values('PC'),('Notebook'),('Monitor'),('Impresora'),('Switch');
insert into laboratorio_ti.tipo_reglas select t."TIPO_ID",r.subtipo,r.notebook from (values('PC','computador',false),('Notebook','computador',true),('Monitor','monitor',null),('Impresora','impresora',null),('Switch','switch',null)) r(nombre,subtipo,notebook) join laboratorio_ti."TIPOS_EQUIPO" t on t."TIPO_NOMBRE"=r.nombre;
insert into laboratorio_ti."MARCAS"("MARC_NOMBRE") values('Marca laboratorio');
insert into laboratorio_ti."MODELOS"("MODE_MARCA_ID","MODE_NOMBRE") select "MARC_ID",'Modelo sintético' from laboratorio_ti."MARCAS" where "MARC_NOMBRE"='Marca laboratorio';
insert into laboratorio_ti."ORIGENES_EQUIPO"("ORIG_NOMBRE") values('Laboratorio');
insert into laboratorio_ti."ESTADOS_EQUIPO"("ESTA_NOMBRE") values('Bueno'),('Regular'),('Malo');
insert into laboratorio_ti."SITUACIONES"("SITU_NOMBRE") values('Activo'),('En proceso de baja');
insert into laboratorio_ti."SISTEMAS_OPERATIVOS"("SIST_NOMBRE") values('Sistema de prueba');
insert into laboratorio_ti."CLASES_IMPRESORA"("CLAS_NOMBRE") values('Láser sintética');
insert into laboratorio_ti."FAMILIAS_COMPONENTE"("FAMI_NOMBRE") values('RAM'),('SSD');
insert into laboratorio_ti."RUBROS_INSUMO"("RUBR_NOMBRE") values('Tóner de prueba');
insert into laboratorio_ti."MODALIDADES_ASIGNACION"("MODA_NOMBRE") values('Temporal de ensayo');
insert into laboratorio_ti."ACTIVIDADES_MANTENCION"("ACTI_NOMBRE") values('Limpieza de ensayo'),('Diagnóstico de ensayo');
insert into laboratorio_ti."FUNCIONARIOS"("FUNC_NOMBRE_COMPLETO","FUNC_DELEGACION_ID","FUNC_DEPARTAMENTO_ID","FUNC_AREA_ID")
 select r.nombre,d."DELE_ID",p."DEPA_ID",case when r.area then a."AREA_ID" end
 from (values('Administración sintética','Tecnología de prueba',true),('Lectura sintética','Tecnología de prueba',false),('Custodio sintético','Operaciones de prueba',false))r(nombre,departamento,area)
 join laboratorio_ti."DEPARTAMENTOS" p on p."DEPA_NOMBRE"=r.departamento cross join laboratorio_ti."DELEGACIONES" d cross join laboratorio_ti."AREAS" a
 where d."DELE_NOMBRE"='Delegación de prueba' and a."AREA_NOMBRE"='Área sintética' order by case r.nombre when 'Administración sintética' then 1 when 'Lectura sintética' then 2 else 3 end;
insert into laboratorio_ti.funcionario_soporte(funcionario_id,documento_tipo,documento,cargo)
 select f."FUNC_ID",'ID',r.documento,r.cargo from (values('Administración sintética','LAB-ADMIN','Administrador de prueba'),('Lectura sintética','LAB-LECTOR','Lector de prueba'),('Custodio sintético','LAB-CUSTODIO','Analista de prueba'))r(nombre,documento,cargo) join laboratorio_ti."FUNCIONARIOS" f on f."FUNC_NOMBRE_COMPLETO"=r.nombre;
do $$declare r record;n integer;modelo integer;origen integer;situacion integer;begin
 select "MODE_ID" into modelo from laboratorio_ti."MODELOS" where "MODE_NOMBRE"='Modelo sintético';
 select "ORIG_ID" into origen from laboratorio_ti."ORIGENES_EQUIPO" where "ORIG_NOMBRE"='Laboratorio';
 select "SITU_ID" into situacion from laboratorio_ti."SITUACIONES" where "SITU_NOMBRE"='Activo';
 for r in select * from (values('LAB-001','PC','Bueno',true),('LAB-002','Notebook','Bueno',true),('LAB-003','Monitor','Regular',true),('LAB-004','Impresora','Bueno',true),('LAB-005','Switch','Bueno',true),('LAB-006','PC','Malo',false))r(codigo,tipo,estado,completo) order by codigo loop
 insert into laboratorio_ti."EQUIPOS"("EQUI_TIPO_EQUIPO_ID","EQUI_MODELO_ID","EQUI_ESTADO_ID","EQUI_SITUACION_ID","EQUI_ORIGEN_ID")
 select t."TIPO_ID",case when r.completo then modelo end,e."ESTA_ID",case when r.completo then situacion end,origen from laboratorio_ti."TIPOS_EQUIPO" t cross join laboratorio_ti."ESTADOS_EQUIPO" e where t."TIPO_NOMBRE"=r.tipo and e."ESTA_NOMBRE"=r.estado returning "EQUI_ID" into n;
 insert into laboratorio_ti.equipo_soporte(equipo_id,codigo_operativo,motivo_sin_serie,adquisicion) values(n,r.codigo,'Bien sintético sin serie','2026-11-01');
 end loop;
end $$;
insert into laboratorio_ti."COMPUTADORES"("COMP_EQUIPO_ID","COMP_ES_NOTEBOOK","COMP_NOMBRE_RED","COMP_SISTEMA_OPERATIVO_ID")
 select e.equipo_id,r.notebook,r.red,s."SIST_ID" from (values('LAB-001',false,'LAB-PC-01'),('LAB-002',true,'LAB-NB-01'))r(codigo,notebook,red) join laboratorio_ti.equipo_soporte e on e.codigo_operativo=r.codigo cross join laboratorio_ti."SISTEMAS_OPERATIVOS" s where s."SIST_NOMBRE"='Sistema de prueba';
insert into laboratorio_ti."MONITORES" select equipo_id,24 from laboratorio_ti.equipo_soporte where codigo_operativo='LAB-003';
insert into laboratorio_ti."IMPRESORAS" select e.equipo_id,c."CLAS_ID",true,21 from laboratorio_ti.equipo_soporte e cross join laboratorio_ti."CLASES_IMPRESORA" c where e.codigo_operativo='LAB-004' and c."CLAS_NOMBRE"='Láser sintética';
insert into laboratorio_ti."SWITCHES" select equipo_id,24 from laboratorio_ti.equipo_soporte where codigo_operativo='LAB-005';
-- Reserva de avisos sin entrega. El worker no forma parte de este despliegue.
insert into inventario.configuracion_avisos(destinatario) values('laboratorio@example.invalid') on conflict(id) do nothing;
commit;
