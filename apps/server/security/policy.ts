import { AuthError } from '../auth/service.js';
export const permissions = ['inventario.consultar','historial.consultar','reportes.exportar','inventario.modificar','cuentas.administrar','configuracion.administrar','auditoria.consultar','auditoria.exportar'] as const;
export type Permission = typeof permissions[number];
export function allowed(role: string, permission: string): boolean {
  return (permissions as readonly string[]).includes(permission) &&
    (role==='administrador' || (role==='lectura' && ['inventario.consultar','historial.consultar','reportes.exportar'].includes(permission)));
}
// Proyección positiva: nunca serializar filas completas en exportaciones ordinarias.
export function publicEmployee(row: Record<string,unknown>) {
  return {id:row.id,nombre:row.nombre,cargo:row.cargo,unidad_id:row.unidad_id,activo:row.activo};
}
export function requirePermission(role: string, permission: string) {
  if(!allowed(role,permission)) throw new AuthError(403,'FORBIDDEN');
}
