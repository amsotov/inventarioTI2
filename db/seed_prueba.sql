-- Solo datos sintéticos. No crea identidades Auth ni credenciales.
set search_path = inventario, pg_catalog;
insert into unidades(id,nombre) values
 ('00000000-0000-4000-8000-000000000001','Unidad sintética A'),
 ('00000000-0000-4000-8000-000000000002','Unidad sintética B');
insert into cuentas(id,nombre,correo,rol) values
 ('00000000-0000-4000-8000-000000000010','Actor sintético','actor@example.invalid','administrador');
insert into funcionarios(id,documento_tipo,documento,nombre,cargo,unidad_id) values
 ('00000000-0000-4000-8000-000000000101','ID',' DEMO-001 ','Persona sintética 1','Cargo de prueba','00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000102','RUT','12.345.678-5','Persona sintética 2','Cargo de prueba','00000000-0000-4000-8000-000000000002');
insert into bienes(id,codigo,serie,tipo,marca,modelo,condicion,adquisicion) values
 ('00000000-0000-4000-8000-000000000201','DEMO-001','SERIE-DEMO-001','Computador','Marca ficticia','Modelo ficticio','bueno','2026-10-01'),
 ('00000000-0000-4000-8000-000000000202','DEMO-002','SERIE-DEMO-002','Monitor','Marca ficticia','Modelo ficticio','regular',null);
insert into configuracion_avisos(destinatario) values ('encargado@example.invalid');
