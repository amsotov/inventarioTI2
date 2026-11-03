import type { Authorization } from '../security/postgres.js';
import type { ModelAccess } from './ports.js';

/** Reutiliza sesión/MFA/CSRF, principal RLS, permiso y evento técnico de v1. */
export function postgresModelAccess(security:Authorization):ModelAccess {
 return {engine:'postgres',run:(sid,permission,work,csrf)=>security.run(sid,permission,(db,account)=>
  work({actorId:account.id,role:account.rol,authorizationVersion:account.version_autorizacion},db),csrf)};
}
