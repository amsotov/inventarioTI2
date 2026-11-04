import type { Permission } from '../security/policy.js';

export type Resource = 'bienes' | 'funcionarios' | 'unidades' | 'movimientos';
export type Filters = { limit?: number; cursor?: string; q?: string; desde?: string; hasta?: string;
  condicion?: string; tipo?: string; situacion?: string; unidad_id?: string; bien_id?: string };
export type InventoryRow = {id:string;version?:string|number} & Record<string, unknown>;
export type InventoryPage = { items: InventoryRow[]; nextCursor: string | null; generatedAt: string;
  timezone: 'UTC'; dateField: string | null };
export type InventoryCommand = { ref: string; version: string | number; aviso: string };

/** El repositorio recibe operaciones de dominio, nunca SQL o tablas desde HTTP. */
export interface InventoryRepository {
  list(resource: Resource, filters: Filters): Promise<InventoryPage>;
  detail(resource: Resource, ref: string): Promise<InventoryRow>;
  save(ref: string | null, key: string, expectedVersion: string | null,
       body: Record<string, unknown>): Promise<InventoryCommand>;
}

/** Conserva autenticación, permiso y transacción durante toda la operación. */
export interface InventoryGateway {
  validateList(resource: Resource, filters: Filters): void;
  run<T>(sid: string, permission: Permission, work: (repository: InventoryRepository) => Promise<T>, csrf?: string): Promise<T>;
}

export class InventoryFailure extends Error {
  constructor(readonly code: string, readonly status: number) { super(code); }
}
