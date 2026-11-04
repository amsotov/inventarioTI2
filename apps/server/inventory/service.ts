import { AuthError } from '../auth/service.js';
import { InventoryFailure, type InventoryGateway, type Resource, type Filters } from './ports.js';
export type { Resource, Filters } from './ports.js';
// Compatibilidad de imports existentes; el servicio no construye ni ejecuta estas consultas.
export { resources, selection } from './postgres.js';

export class Inventory {
 constructor(private gateway: InventoryGateway) {}
 private async map<T>(work:()=>Promise<T>): Promise<T> {
  try{return await work();}catch(error){
   if(error instanceof InventoryFailure)throw new AuthError(error.status,error.code);
   throw error;
  }
 }
 list(sid:string,resource:Resource,filters:Filters) {
  this.gateway.validateList(resource,filters);
  return this.map(()=>this.gateway.run(sid,resource==='movimientos'?'historial.consultar':'inventario.consultar',repository=>repository.list(resource,filters)));
 }
 detail(sid:string,resource:Resource,ref:string) {
  return this.map(()=>this.gateway.run(sid,resource==='movimientos'?'historial.consultar':'inventario.consultar',repository=>repository.detail(resource,ref)));
 }
 async save(sid:string,csrf:string,ref:string|null,key:string,version:string|undefined,body:Record<string,unknown>) {
  let expected:string|null=null;
  if(version!==undefined){if(!/^"v[1-9][0-9]{0,14}"$/.test(version))throw new AuthError(400,'INVALID_REQUEST');expected=version.slice(2,-1);}
  return this.map(()=>this.gateway.run(sid,'inventario.modificar',repository=>repository.save(ref,key,expected,body),csrf));
 }
}
