import { createHash } from 'node:crypto';
import { AuthError } from '../auth/service.js';

export function modelBinding(scope: string, filters: Record<string, unknown>): string {
  const normalized=Object.fromEntries(Object.entries(filters).filter(([k])=>!['cursor','limit'].includes(k)).sort(([a],[b])=>a.localeCompare(b)));
  return createHash('sha256').update(JSON.stringify([scope,normalized])).digest('hex');
}
const validRef=(ref: unknown): ref is string => typeof ref==='string' &&
  (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref) ||
   (/^[1-9][0-9]{0,18}$/.test(ref) && BigInt(ref)<=9223372036854775807n));
export function modelCursor(binding: string, ref: string): string {
  if(!/^[a-f0-9]{64}$/.test(binding)||!validRef(ref))throw new Error('Invalid internal cursor');
  return Buffer.from(JSON.stringify({v:1,binding,ref})).toString('base64url');
}
/** Cursor de posición, no credencial: se valida y su clave solo se usa como parámetro SQL. */
export function readModelCursor(cursor: string, binding: string): string {
  try {
    if(!/^[A-Za-z0-9_-]{1,1024}$/.test(cursor)||Buffer.from(cursor,'base64url').toString('base64url')!==cursor)throw Error();
    const value=JSON.parse(Buffer.from(cursor,'base64url').toString());
    if(!value||Object.keys(value).sort().join(',')!=='binding,ref,v'||value.v!==1||value.binding!==binding||!validRef(value.ref))throw Error();
    return value.ref;
  }catch{throw new AuthError(400,'INVALID_CURSOR');}
}
