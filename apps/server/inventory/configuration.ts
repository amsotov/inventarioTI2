/** Selección explícita: nunca caer a PostgreSQL si se solicitó otro motor. */
export function inventoryDriver(value: string | undefined): 'postgres' {
  if (value === undefined || value === 'postgres') return 'postgres';
  if (value === 'sqlserver2016') throw new Error('SQLSERVER_MODEL_NOT_READY');
  throw new Error('UNKNOWN_INVENTORY_DRIVER');
}
