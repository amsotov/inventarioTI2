import { targetColumns } from './target-model.js';

export type TargetColumn = {schema_name:string;table_name:string;column_name:string;column_type:string;
  max_length:number;precision_value:number;scale_value:number;nullable:boolean|number;identity_value:boolean|number;default_value:string|null};
export interface TargetSnapshot {major:number;compatibility:number;columns:TargetColumn[]}
export interface MetadataReader {read<T>(sql:string):Promise<T[]>}
export const targetEngineQuery="SELECT ISNULL(TRY_CONVERT(int,SERVERPROPERTY('ProductMajorVersion')),0) AS major, ISNULL((SELECT compatibility_level FROM sys.databases WHERE database_id=DB_ID()),0) AS compatibility;";
const tables=[...new Set(targetColumns.map(c=>c.tabla))].sort();
// Los identificadores vienen del modelo versionado, nunca de HTTP o de las filas de la base.
export const targetCatalogQuery=`SELECT s.name AS schema_name,t.name AS table_name,c.name AS column_name,
 ty.name AS column_type,c.max_length,c.precision AS precision_value,c.scale AS scale_value,
 c.is_nullable AS nullable,c.is_identity AS identity_value,dc.definition AS default_value
 FROM sys.tables t JOIN sys.schemas s ON s.schema_id=t.schema_id
 JOIN sys.columns c ON c.object_id=t.object_id JOIN sys.types ty ON ty.user_type_id=c.user_type_id
 LEFT JOIN sys.default_constraints dc ON dc.object_id=c.default_object_id
 WHERE s.name=N'dbo' AND t.name IN (${tables.map(t=>"N'"+t+"'").join(',')});`;

export function columnShape(type:string): {kind:string;bytes:number;precision:number;scale:number} {
 const kind=type.split('(')[0].toLowerCase();
 if(kind==='varchar'||kind==='nvarchar') {
  const length=type.split('(')[1].slice(0,-1);
  return {kind,bytes:length==='MAX'?-1:Number(length)*(kind==='nvarchar'?2:1),precision:0,scale:0};
 }
 if(kind==='decimal') {
  const [precision,scale]=type.split('(')[1].slice(0,-1).split(',').map(Number);
  return {kind,bytes:precision<=9?5:precision<=19?9:precision<=28?13:17,precision,scale};
 }
 const fixed:Record<string,[number,number,number]>={int:[4,10,0],bigint:[8,19,0],smallint:[2,5,0],tinyint:[1,3,0],bit:[1,1,0],date:[3,10,0],datetime2:[8,27,7]};
 if(!fixed[kind])throw new Error('Unknown target type');
 const [bytes,precision,scale]=fixed[kind];return {kind,bytes,precision,scale};
}
const defaultToken=(s:string|null)=>s?.replace(/[\s()[\]]/g,'').toUpperCase()??'';
/** Sonda de núcleo; no certifica PK/FK, soporte, permisos o escrituras de la aplicación. */
export function compareTarget(snapshot:TargetSnapshot) {
 const issues:string[]=[];
 if(snapshot.major!==13)issues.push('SQLSERVER_2016_REQUIRED');
 if(snapshot.compatibility!==130)issues.push('COMPATIBILITY_130_REQUIRED');
 const actual=new Map<string,TargetColumn>();
 for(const row of snapshot.columns) {
  const key=row.table_name+'.'+row.column_name;
  if(row.schema_name!=='dbo'||actual.has(key))issues.push('UNEXPECTED_OR_DUPLICATE_COLUMN');
  actual.set(key,row);
 }
 for(const expected of targetColumns) {
  const key=expected.tabla+'.'+expected.campo,row=actual.get(key),shape=columnShape(expected.tipo);
  if(!row){issues.push('MISSING_COLUMN:'+key);continue;}
  if(row.column_type!==shape.kind||row.max_length!==shape.bytes||row.precision_value!==shape.precision||row.scale_value!==shape.scale||
     Boolean(row.nullable)!==expected.permite_null||Boolean(row.identity_value)!==expected.identity||defaultToken(row.default_value)!==defaultToken(expected.default))issues.push('COLUMN_MISMATCH:'+key);
  actual.delete(key);
 }
 if(actual.size)issues.push('UNEXPECTED_COLUMNS');
 return {coreCompatible:issues.length===0,activationReady:false as const,issues,
   blockers:['SQLSERVER_SUPPORT_REPOSITORY_NOT_IMPLEMENTED','SQLSERVER_INTEGRATION_NOT_EXECUTED']};
}
export async function inspectTarget(reader:MetadataReader) {
 const engine=await reader.read<{major:number;compatibility:number}>(targetEngineQuery);
 if(engine.length!==1)throw new Error('Invalid target engine metadata');
 return compareTarget({...engine[0],columns:await reader.read<TargetColumn>(targetCatalogQuery)});
}
/** NVARCHAR(n) mide unidades UTF-16: nunca truncar para hacer caber un valor. */
export function fitsTargetText(table:string,field:string,value:string|null):boolean {
 const column=targetColumns.find(c=>c.tabla===table&&c.campo===field);
 if(!column)return false;
 const shape=columnShape(column.tipo);
 if(!['varchar','nvarchar'].includes(shape.kind))return false;
 if(value===null)return column.permite_null;
 if(typeof value!=='string')return false;
 if(shape.kind==='varchar'&&!/^[\x20-\x7e]*$/.test(value))return false;
 return shape.bytes===-1||value.length<=(shape.kind==='nvarchar'?shape.bytes/2:shape.bytes);
}
