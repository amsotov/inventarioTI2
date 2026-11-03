-- Creado con Supabase CLI 3.0.0; alcance: esquemas privados de la baseline.
-- No cambia permisos de public/auth/storage ni habilita logins o API.
begin;
revoke execute on all functions in schema inventario,acceso,seguridad from public;
commit;
