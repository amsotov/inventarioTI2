# FASE 2 — Mapeo de esquemas y matriz de impacto

> Continuidad: usuario acepta Fase 2 mediante «apruebo fase 2 inicia fase 3». Fase 2 COMPLETADA; contenido/evidencia siguiente describe entrega original. Estado actual en [FASES](../../FASES.md) y [Fase 3](03_IMPACTO_FRONTEND_API.md).

Fecha: 2026-11-03. Estado: **EN_REVISION / PROPUESTA DOCUMENTAL**. Base `9dbaa2fe3955e75f237caf873ef2ca44346241c2`.

## Alcance y significado de las correspondencias

El origen actual se reconstruye estáticamente de las ocho migraciones: 19 tablas, 155 campos, incluidos cinco ADD COLUMN posteriores. No se consulta una base desplegada. El destino sigue los 117 campos/30 tablas del Excel originales validados en Fase 1. Los campos dentro de JSONB de sesión/comando/exportación no se cuentan como columnas físicas, pero se conserva su semántica en el soporte técnico.

[02_ESQUEMA_ACTUAL.csv](02_ESQUEMA_ACTUAL.csv) contiene cada declaración, archivo y línea. [02_MAPEO_ACTUAL.csv](02_MAPEO_ACTUAL.csv) tiene una fila por campo actual y [02_MAPEO_DESTINO.csv](02_MAPEO_DESTINO.csv) una por campo destino. Ningún campo actual queda descartado por falta de correspondencia.

Clasificaciones: CONSERVAR capacidad/dato; ADAPTAR representación con garantías; NUEVO_NECESARIO dato/catálogo sin equivalente; PENDIENTE correspondencia bloqueada. No hay PROPONER_RETIRO. Una referencia candidata indica dependencia o conflicto, no asignación de valores aprobada. Ejemplos: proveedor_ref NO es USUA_CLAVE_HASH y codigo NO identifica automáticamente inventario SERVIU/MINVU.

Una extensión de soporte es conceptual: no se inventan tablas/campos físicos en el diccionario ni se crea DDL. Los nombres exactos de los 117 campos objetivo permanecen. La propuesta no elimina atributos ausentes ni convierte la aprobación de Fase 1 en autorización de transformación de datos.

## Correspondencia por tabla actual

| Tabla actual | Campos | Tratamiento principal | Núcleo objetivo / brecha |
|---|---:|---|---|
| inventario.unidades | 4 | PENDIENTE | DEPARTAMENTOS/AREAS son candidatos; no igualdad con delegación/ubicación; conservar activa/versión y pertenencias. |
| inventario.cuentas | 10 | ADAPTAR | USUARIOS/PERFILES/AUTORIZACIONES, con soporte de proveedor/estado pendiente/credencial/versiones; persona por validar. |
| inventario.funcionarios | 11 | ADAPTAR | FUNCIONARIOS; conservar RUT/ID/cargo/alta/versiones y pertenencias faltantes. |
| inventario.bienes | 13 | ADAPTAR | EQUIPOS/catálogos/subtipos; conservar código/adquisición/motivo sin serie/versión/alta. |
| inventario.comandos | 8 | CONSERVAR | Sin equivalente; clave/huella/resultado idempotente durable y vínculo actor-operación-recurso. |
| inventario.pertenencias | 9 | CONSERVAR | Sin equivalente; conservar unidad/nombre histórico/actor/motivo/fechas. |
| inventario.movimientos | 17 | CONSERVAR | Sin equivalente completo; ASIGNACIONES no cubre condición/baja/reactivación/compensación. |
| inventario.custodias | 7 | ADAPTAR | ASIGNACIONES y soporte de instantes/movimientos; no truncar DATE ni perder apertura/cierre. |
| inventario.anotaciones | 7 | CONSERVAR | Sin equivalente; evidencia y corrección vinculada inmutables. |
| inventario.auditoria | 10 | ADAPTAR | AUDITORIA, manteniendo comando y motivo completos, precisión, minimización e inmutabilidad. |
| inventario.configuracion_avisos | 3 | CONSERVAR | Sin equivalente; destinatario configurable/versionado. |
| inventario.outbox | 14 | CONSERVAR | Sin equivalente; destino/propósito fijados, estados/reclamación/leases/reintentos. |
| inventario.intentos_aviso | 6 | CONSERVAR | Sin equivalente; intentos append-only, resultados y correlación. |
| acceso.sesiones | 3 | CONSERVAR | Sin equivalente; huella y estado cifrado en servidor; revocación/actividad/MFA. |
| acceso.intenciones | 3 | CONSERVAR | Sin equivalente; invitación/recuperación de un uso, supersesión e incertidumbre. |
| acceso.entregas | 5 | CONSERVAR | Sin equivalente; canal de identidad separado del aviso empresarial. |
| acceso.limites | 3 | CONSERVAR | Sin equivalente; limitación de tasa durable entre instancias. |
| seguridad.eventos | 5 | CONSERVAR | Sin equivalente; bitácora técnica de autorización, separada de auditoría de negocio. |
| inventario.exportaciones | 17 | CONSERVAR | Sin equivalente; trabajos privados/instantánea/archivo/TTL/propietario. |

## Cobertura del destino

| Tabla destino | Campos | Procedencia / clasificación de campos |
|---|---:|---|
| REGIONES | 2 | NUEVO_NECESARIO: 1; PENDIENTE: 1 |
| DELEGACIONES | 4 | NUEVO_NECESARIO: 4 |
| DEPARTAMENTOS | 2 | NUEVO_NECESARIO: 1; PENDIENTE: 1 |
| AREAS | 2 | NUEVO_NECESARIO: 1; PENDIENTE: 1 |
| FUNCIONARIOS | 10 | ADAPTAR: 4; NUEVO_NECESARIO: 2; PENDIENTE: 4 |
| PERFILES | 4 | NUEVO_NECESARIO: 2; ADAPTAR: 1; PENDIENTE: 1 |
| USUARIOS | 5 | ADAPTAR: 2; PENDIENTE: 3 |
| AUTORIZACIONES | 3 | ADAPTAR: 2; PENDIENTE: 1 |
| AUDITORIA | 10 | ADAPTAR: 9; NUEVO_NECESARIO: 1 |
| TIPOS_EQUIPO | 2 | ADAPTAR: 2 |
| MARCAS | 2 | ADAPTAR: 2 |
| MODELOS | 3 | ADAPTAR: 3 |
| ORIGENES_EQUIPO | 2 | NUEVO_NECESARIO: 2 |
| ESTADOS_EQUIPO | 2 | ADAPTAR: 2 |
| SITUACIONES | 2 | PENDIENTE: 2 |
| EQUIPOS | 12 | ADAPTAR: 6; NUEVO_NECESARIO: 3; PENDIENTE: 3 |
| SISTEMAS_OPERATIVOS | 2 | NUEVO_NECESARIO: 2 |
| COMPUTADORES | 8 | ADAPTAR: 1; PENDIENTE: 1; NUEVO_NECESARIO: 6 |
| MONITORES | 2 | ADAPTAR: 1; NUEVO_NECESARIO: 1 |
| CLASES_IMPRESORA | 2 | NUEVO_NECESARIO: 2 |
| IMPRESORAS | 4 | ADAPTAR: 1; NUEVO_NECESARIO: 3 |
| SWITCHES | 2 | ADAPTAR: 1; NUEVO_NECESARIO: 1 |
| FAMILIAS_COMPONENTE | 2 | NUEVO_NECESARIO: 2 |
| PIEZAS_COMPUTADOR | 5 | NUEVO_NECESARIO: 5 |
| RUBROS_INSUMO | 2 | NUEVO_NECESARIO: 2 |
| INSUMOS_IMPRESORA | 4 | NUEVO_NECESARIO: 4 |
| MODALIDADES_ASIGNACION | 2 | NUEVO_NECESARIO: 2 |
| ASIGNACIONES | 8 | ADAPTAR: 4; NUEVO_NECESARIO: 1; PENDIENTE: 3 |
| ACTIVIDADES_MANTENCION | 2 | NUEVO_NECESARIO: 2 |
| MANTENCIONES | 5 | NUEVO_NECESARIO: 5 |

Los datos de procesador, red, memoria/discos, tamaños de monitor, impresora/insumos, puertos de switch y mantenciones no existen como columnas en el esquema actual. Pueden venir del Excel operacional o captura futura autorizada; no se crean valores a partir de observaciones sin regla validada. Tipos simples como teclado/mouse/webcam/UPS/escáner no requieren subtipo por inferencia.

## Impacto por dominio y dependencia

| Dominio | BD / backend | UI / reportes / permisos | Condición |
|---|---|---|---|
| Organización | Resolver jerarquía y conservar documento/cargo/fecha/pertenencias | Selectores, filtros de unidad y búsqueda privada | M1-D03/04/08; no perder unidad histórica |
| Inventario/catálogos | Normalizar tipo→modelo→marca y estado separado de situación | Alta/edición por tipo, búsqueda y fichas existentes | M1-D06/10/13/15/16; preservar código, textos y bajas |
| Asignaciones | Conservar precisión, origen esperado, vigente única y traslados atómicos | Motivo/confirmación y cronología compartida | M1-D05/07/08; sin duplicados ni fechas ficticias |
| Identidad/perfiles | Adaptar Store/Authorization sin duplicar contraseña, conservar estados y MFA | Acceso/panel/último administrador; no roles desde cliente | M1-D02/03/09/11; no migrar identidades por parecido |
| Auditoría | JSON textual minimizado, referencia antigua/nueva y actor/comando | Auditoría solo admin; historial empresarial para ambos | M1-D08/12/15; sin secretos ni purga de aplicación |
| Avisos | Reimplementar reclamación/lease/estados y rol worker mínimo | Seguimiento/cancelación/reintento/conciliación | M1-D09/12; sin envíos ni redirección de pendientes |
| Exportación | Adaptar joins/snapshot/job/TTL/bytea y reautorización | Columnas y límites actuales, selección igual en pantalla/XLSX/PDF | M1-D07/09/12; propietario y permisos vigentes |
| Operación | RLS/contexto/pools/funciones/bloqueos/copia SQL Server específicos | Logs/salud sin datos privados | M1-D01/09; conservar RPO/RTO; despliegue no autorizado |

## Indicadores y cinco reportes más buscador

| Salida | Selección actual y dato temporal | Mapeo / conservación necesaria |
|---|---|---|
| Resumen | Registrados/asignados/disponibles/funcionarios activos; bueno/regular/malo; malos asignados y últimos movimientos | EQUIPOS + ASIGNACIONES + FUNCIONARIOS; disponibles exige situación/custodia/condición coherentes; últimos movimientos necesita historia complementaria |
| Inventario general | Bien/custodio/unidad actual; rango por adquisición | EQUIPOS + catálogos + ASIGNACIONES/FUNCIONARIOS; adquisición y código deben conservarse aparte |
| Por funcionario | Custodias vigentes y rango por inicio | ASIGNACIONES + FUNCIONARIOS/EQUIPOS; cargo y precisión de inicio faltan |
| Movimientos por fecha | Fecha efectiva; unidad y nombres históricos de extremos | No sustituir por ASIGNACIONES: conservar tipo/actor/motivo/registro/corrección/pertenencias |
| Por condición | Estado físico, subconjunto de inventario y subtotales globales | ESTADOS_EQUIPO separado de SITUACIONES y custodia; no subtotal solo de la página |
| Auditoría | Fecha de registro, actor/entidad/acción; solo admin | AUDITORIA y vínculo de actor; proyección/minimización y precisión UTC |
| Buscador | Bienes y funcionarios en conjuntos separados; adquisición/alta según conjunto | Conservar búsqueda por código/serie/marca/modelo/tipo/condición y persona/documento/correo/cargo/unidad; documento/correo no se exportan; q reservado en metadatos |

Filtros exactos en selection.ts y anexo API; días UTC [desde, día posterior a hasta). Inventario actual no reconstruye automáticamente existencias históricas. XLSX máximo 10000 y PDF 2000 sobre selección total, sin truncar; vacío válido; dos conjuntos cuentan en el total. Respetar columnas A-11 y protección ante fórmulas/HTML. No se modifican renderers ni plantillas.

## Orden propuesto de adaptación posterior

Fase 3: diseñar ajustes UI/contratos con brechas visibles; Fase 4: perfilar origen/ETL, excepciones y reconciliación; Fase 5: esquema/migraciones aprobados; Fase 6: adaptadores/seguridad/transacciones y consultas; Fase 7: UI existente con subtipos; Fase 8: regresión SQL Server y reconciliación. Los bloqueantes de identidad, tiempos, códigos, baja y soporte histórico deben resolverse antes de su implementación. No se inicia ninguna de esas fases ahora.

Los mappings son completos como inventario documental, no prueba de que los datos reales puedan convertirse sin excepciones. SQL Server, ETL, SQL, build, API/UI y servicios gestionados no ejecutados. Fase 2 EN_REVISION, Fase 3 NO AUTORIZADA.
