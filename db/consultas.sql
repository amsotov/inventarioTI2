-- Proyecciones de referencia; no conceden acceso ni implementan endpoints.
set search_path = inventario, pg_catalog;
-- Inventario actual: unidad del custodio actual, sin inventar ubicación de bodega.
select b.id,b.codigo,b.condicion,b.situacion,b.adquisicion,c.funcionario_id,
       f.unidad_id,u.nombre as unidad_actual
from bienes b left join custodias c on c.bien_id=b.id and c.fin_en is null
left join funcionarios f on f.id=c.funcionario_id
left join unidades u on u.id=f.unidad_id
order by b.codigo,b.id;
-- Días UTC inclusivos: el cliente futuro validará desde <= hasta.
select id,tipo,efectiva_en,unidad_origen_nombre,unidad_destino_nombre
from movimientos
where efectiva_en >= timestamptz '2026-10-01 00:00:00+00'
  and efectiva_en < timestamptz '2026-11-01 00:00:00+00'
order by efectiva_en,id;
-- Adquisición ausente queda fuera solo cuando se activa un rango.
select id,codigo from bienes where adquisicion >= date '2026-10-01'
 and adquisicion < date '2026-11-01' order by adquisicion,id;
-- Adquisición exclusiva de trabajo futuro dentro de una transacción corta.
-- No enviar correo ni llamar proveedores manteniendo este bloqueo.
begin;
select id from outbox where estado='pendiente' and siguiente_en<=clock_timestamp()
order by siguiente_en,id for update skip locked limit 1;
rollback;
