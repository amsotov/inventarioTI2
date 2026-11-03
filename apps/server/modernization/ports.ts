import type { Account } from '../auth/ports.js';
import type { Permission } from '../security/policy.js';

export type ModelRequest = { operation: string; params: Record<string, string>;
  query: Record<string, unknown>; body: Record<string, unknown> | undefined };
export type ModelContext = { actorId: string; role: Account['rol']; authorizationVersion: string;
  permission: Permission; idempotencyKey?: string; expectedVersion?: string };
export type ModelActor={actorId:string;role:Account['rol'];authorizationVersion:string};
export interface ModelAccess {
  readonly engine:'postgres'|'sqlserver2016';
  run<T>(sid:string,permission:Permission,work:(actor:ModelActor,transaction:unknown)=>Promise<T>,csrf?:string):Promise<T>;
}
/** Adaptador confiable: una escritura confirma dominio+historia+auditoría+comando+outbox o revierte todo.
 * No hay implementación de destino habilitada hasta resolver modelo/soporte/instancia.
 * Nunca implementar este puerto con un conjunto de llamadas HTTP independientes a tablas.
 */
export interface ModelBackend {
  readonly engine:'postgres'|'sqlserver2016';
  readonly operations: ReadonlySet<string>;
  executeAtomic(context: ModelContext, request: ModelRequest, transaction:unknown): Promise<unknown>;
}
