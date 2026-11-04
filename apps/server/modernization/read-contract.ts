/** Extensión aditiva M7-C01: la edición completa no puede inferir campos ausentes.
 * F3/F6 originales permanecen versionados. Los lectores anteriores siguen siendo válidos;
 * la UI solo permite editar atributos cuando el repositorio devuelve todos estos campos.
 */
export const equipmentReadFields = ['origenRef','numeroSerie','motivoSinSerie','inventarioServiu','inventarioMinvu','adquisicion','observacion'] as const;
export function modelReadSchemas<T extends {EquipoDetalle:{properties:object};EquipoAtributos:{properties:object}}>(schemas:T) {
 const attributes=schemas.EquipoAtributos.properties as Record<string,unknown>;
 return {...schemas,EquipoDetalle:{...schemas.EquipoDetalle,properties:{...schemas.EquipoDetalle.properties,
  ...Object.fromEntries(equipmentReadFields.map(key=>[key,attributes[key]]))}}};
}
