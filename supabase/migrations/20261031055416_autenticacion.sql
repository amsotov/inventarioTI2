-- Fase 5, aditiva. Sin políticas empresariales ni grants a roles del navegador.
begin;
alter table inventario.cuentas add column credencial_lista boolean not null default false;
create schema acceso;
revoke all on schema acceso from public;
alter default privileges in schema acceso revoke all on tables from public;
create table acceso.sesiones (
 huella text primary key check (huella ~ '^[a-f0-9]{64}$'),
 cuenta_id uuid not null references inventario.cuentas(id),
 datos jsonb not null check (jsonb_typeof(datos)='object')
);
create index sesiones_cuenta_idx on acceso.sesiones(cuenta_id);
create table acceso.intenciones (
 huella text primary key check (huella ~ '^[a-f0-9]{64}$'),
 cuenta_id uuid not null references inventario.cuentas(id),
 datos jsonb not null check (jsonb_typeof(datos)='object')
);
create index intenciones_cuenta_idx on acceso.intenciones(cuenta_id);
create table acceso.entregas (
 id uuid primary key default gen_random_uuid(),
 cuenta_id uuid not null references inventario.cuentas(id),
 sobre text not null,
 estado text not null default 'pendiente' check (estado in ('pendiente','procesando','completada','incierta')),
 creado_en timestamptz not null default clock_timestamp()
);
create index entregas_cuenta_idx on acceso.entregas(cuenta_id);
create table acceso.limites (
 huella text primary key check (huella ~ '^[a-f0-9]{64}$'),
 ventana bigint not null,
 intentos integer not null check (intentos>0)
);
alter table acceso.sesiones enable row level security;
alter table acceso.intenciones enable row level security;
alter table acceso.entregas enable row level security;
alter table acceso.limites enable row level security;
revoke all on all tables in schema acceso from public;
commit;
