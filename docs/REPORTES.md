# Indicadores, reportes y exportación — Fase 11

2026-11-02 · COMPLETADA por aceptación expresa D-33. Base de ejecución `92a6dec`; entrega aceptada `c94a366be22e6eae917711c52e695ea842c27187`. Fase 12 autorizada para un nuevo chat; ejecución pendiente. Sin despliegue, datos reales ni operaciones remotas de infraestructura.

## Plan y alcance

1. Recuperar main y contrastar requisitos D-14 (A-06/A-10/A-11 y CR-11/12/18/19/20), diseño D-15, arquitectura/ADR D-17 y entregas de datos/acceso/seguridad/API/UI/administración/procesos aceptadas.
2. Implementar métricas de fuente, selección autorizada compartida por cinco reportes y buscador, paginación, filtros y proyecciones positivas.
3. Persistir selección consistente y trabajo privado idempotente; generar XLSX/PDF en hilo aislado con caducidad, límites y autorización vigente al solicitar/generar/publicar el resultado/descargar.
4. Integrar UI según diseño, probar archivos y permisos con PostgreSQL/Chromium sintéticos, registrar límites, actualizar documentación y GitHub. No instalar Spec Kit ni iniciar otras fases.

Archivos principales: `apps/server/reports/{selection.ts,service.ts,routes.ts,renderer.mjs}`, `apps/web/src/reports.tsx`, integración app/main.tsx, migración aditiva `20261102120248_indicadores_reportes_exportaciones.sql`, pruebas `tests/api/reports.test.ts`, `tests/ui/reports.test.ts` y soporte sintético `tests/helpers/reports.ts`. `Authorization.run` incorpora una opción interna para iniciar transacciones REPEATABLE READ y fija UTC mediante SET LOCAL; conserva pools, permisos, contexto y locks de autenticación existentes.

## Métricas reproducibles

Todas son fotografías actuales del inventario compartido, con `generatedAt` UTC y una instantánea consistente de lectura; nunca la referencia estimada de 1.200 bienes.

| Métrica | Definición |
|---|---|
| Bienes registrados | Todos los bienes, incluidos activos y bajas |
| Bienes asignados | Bienes con una custodia vigente (`fin_en IS NULL`) |
| Disponibles | Activos, sin custodia vigente, condición bueno o regular |
| Funcionarios activos | Funcionarios activos; no cuentas de acceso |
| Distribución bueno/regular/malo | Conteos sobre todos los bienes; suma igual a registrados |
| Malos asignados | Condición malo con custodia vigente; no implica devolución automática |
| Últimos movimientos | Cinco más recientes por fecha efectiva y referencia, descendente |

No se agregan avisos ni alertas simuladas al resumen. Las notificaciones empresariales siguen pendientes de Fase 12.

## Contrato HTTP ejecutable

Siempre bajo `/api/v1`, mismo origen y sesión opaca. Los GET de consulta no renuevan actividad. POST exige Origin, CSRF e `Idempotency-Key` UUID. Parámetros desconocidos, filtros inaplicables o fechas inválidas se rechazan; no se aceptan columnas arbitrarias, actor, solicitante, rol ni rutas de archivos del cliente.

| Método/ruta | Respuesta y permiso |
|---|---|
| GET `/resumen` | Métricas, últimos movimientos, instante UTC; ambos roles |
| GET `/reportes/{tipo}` | Tipo cerrado: inventario/por-funcionario/movimientos/por-condicion/auditoria/busqueda |
| GET `/buscar` | Alias del buscador combinado; bienes y funcionarios separados |
| GET `/auditoria` | Alias de reporte de auditoría; solo administrador con MFA |
| POST `/exportaciones` | `{tipo,formato:"xlsx" o "pdf",filtros:{…}}`; `202` con referencia, estado, formato, tipo, total y plazos |
| GET `/exportaciones/{ref}` | Estado del trabajo propio y metadatos, error saneado; sin instantánea ni bytes |
| GET `/exportaciones/{ref}/archivo` | Descarga autenticada privada, `attachment`, MIME correcto y `no-store` |

Consulta: `limit` 1–100 (25 por defecto), `cursor` vinculado a tipo/filtros normalizados. Cada sección tiene columnas fijas, filas, total y cursor. En buscador, la página avanza el mismo desplazamiento en ambos conjuntos; un conjunto agotado puede estar vacío mientras el otro continúa. El total siempre suma ambos conjuntos completos. Las páginas y nuevas exportaciones son consultas actuales independientes: cambios confirmados entre peticiones pueden modificar resultados; se muestra el instante de cada una. La selección persistida de una exportación no cambia durante su generación.

| Tipo | Filtros admitidos y campo temporal |
|---|---|
| Inventario, condición | `q` (código/serie/tipo/marca/modelo), `tipo`, `condicion`, `situacion`, `custodia` (asignado/sin-asignar), `unidad_id`, `funcionario_id`, `bien_id`, `desde`, `hasta`; adquisición |
| Por funcionario | Mismos filtros, solo custodias vigentes; inicio de custodia |
| Movimientos | `q` (código/tipo/nombres), `tipo` de movimiento, `unidad_id` histórica de cualquiera de ambos extremos, `funcionario_id` de origen/destino, `bien_id`, días; fecha efectiva |
| Auditoría | `q` (entidad/referencia/acción), `actor_id`, `entidad`, `entidad_ref`, `accion`, días; fecha de registro |
| Buscador | Filtros de bienes para bienes; `q` por nombre/cargo, `unidad_id`, `funcionario_id`, `activo` true/false y días para funcionarios; adquisición en bienes, alta en funcionarios |

Filtros se ordenan, recortan y normalizan (`q` minúscula; UUID minúsculo); texto literal parametrizado, sin comodines SQL. Igualdad de tipo de bien conserva su texto. En buscador se aplican los filtros específicos solo a su conjunto, como indica la pantalla. Referencias son UUID técnicos, nunca RUT/ID personal. La UI ofrece unidades iniciales mediante sugerencias y permite ingresar una referencia de unidad; no se infiere una bodega para bienes sin custodia.

Días UTC desde 00:00 incluido hasta 00:00 del día posterior a `hasta`, excluido. Rangos invertidos y fechas inexistentes se rechazan. Sin adquisición, un bien queda fuera del rango activo. Inventario/condición no reconstruyen existencias a una fecha pasada. Unidad actual procede del custodio actual; movimientos conservan denominación/unidad histórica al registrarse. No se crean traslados ficticios por cambio de unidad.

## Columnas y privacidad

Las columnas y el orden de [A-11](CIERRE_FASE1.md#a-11--contratos-de-los-cinco-reportes-y-el-buscador) se usan en pantalla, hojas Excel y secciones PDF. Desempate por referencia interna, orden explícito y estable; condición bueno/regular/malo. Subtotales por condición son del conjunto completo, no de la página. Se repiten como metadatos en ambos formatos; no cuentan como filas de detalle.

Proyección positiva: reportes ordinarios sin documento/RUT/ID personal, correo, observaciones del bien ni columnas futuras. Motivo solo en movimientos. Auditoría, exclusiva de administración, incluye diferencias anterior/nuevo sobre lista positiva de campos empresariales escalares; excluye documento, correo, proveedor, destinatario, observaciones y claves desconocidas/secretos. Puede mostrar `{}` si un cambio solo contiene campos omitidos; entidad/acción/referencia permanecen. No se copian objetos anidados arbitrarios.

`seguridad.nombre_actor(uuid)` es una proyección interna de nombre: valida `seguridad.principal()`, permite nombres de actores de movimientos a lectura y nombres administrativos al administrador. No concede acceso compartido a cuentas/correos/roles. Función en esquema privado, search_path fijo, ejecutable solo por runtime, dueño sin login/BYPASSRLS con políticas explícitas. No usa metadatos/JWT editables.

## Archivos, estados y límites

Una transacción REPEATABLE READ valida permisos, cuenta y obtiene TODAS las filas del filtro para la instantánea; no solo la página visible. Total/subtotales/filas comparten esa instantánea. Exceso de detalle: XLSX >10.000 o PDF >2.000 devuelve `422 EXPORT_LIMIT` antes de crear el trabajo; límites exactos admitidos. En buscador se suman bienes+funcionarios. Vacío válido: cabeceras, filtros, campo temporal, instante y total cero; sin filas ficticias.

Trabajos en tabla privada con RLS forzada por solicitante y rol vigente para auditoría; sin grants a PUBLIC/anon/authenticated, sin acceso mediante Data API, enlaces públicos ni credenciales en navegador. La fila conserva clave/huella y metadatos: mismo solicitante+clave+payload normalizado devuelve la misma referencia; payload distinto devuelve 409, incluso después de terminar. El archivo no se vuelve a generar por un replay finalizado. Una exportación nueva exige nueva clave explícita.

Estados: pendiente → procesando → listo/fallido; caducado cuando vence. Claim atómico con UUID de intento y arrendamiento de 75 s impide dos generadores del mismo trabajo. Hilo de generación con límite de 60 s y heap de 256 MiB; selección hasta 32 MiB y archivo hasta 50 MiB. Cola hasta 16 trabajos por proceso, un generador activo; hasta 20 solicitudes nuevas por solicitante/hora. Límites técnicos no sustituyen los de filas.

No se persiste SID: la petición crea/consulta y activa procesamiento usando su sesión actual. Se vuelve a autorizar antes de generar y antes de guardar bytes, y al descargar. Revocación durante render no publica el archivo; otra cuenta recibe 404. Tras caída/reinicio, una consulta/replay propio puede reclamar pendiente o arrendamiento vencido con la misma instantánea; no hay reenvío de avisos ni servicio programado. Un trabajo sin consultas tras reinicio no avanza por sí solo. Fallo final `EXPORT_FAILED` o `EXPORT_TIMEOUT` sin error crudo; una nueva exportación se solicita con nueva clave.

Caducidad técnica: una hora desde creación. Se deniega descarga vencida aun si el trabajo estaba listo. Al acceder/crear un trabajo se limpian instantánea/archivo vencidos del solicitante visible; la limpieza física es diferida a esa interacción, sin cron global. Se retienen metadatos/idempotencia; no se purgan historia, auditoría ni comandos empresariales. Retención legal real sigue F1-SEG-01.

XLSX: `write-excel-file` **4.1.1**, MIT, versión/lockfile fijos, solo compresión `fflate` como dependencia. Celdas de usuario siempre String, nunca Formula, incluidos `=`, `+`, `-`, `@`, URLs y metadatos. PDF: `pdfkit` **0.20.2**, MIT, con fuente `dejavu-fonts-ttf` **2.37.3** (Bitstream Vera/Arev, cambios DejaVu de dominio público; licencia del paquete conservada). Tabla A3 apaisada con texto ajustado y filas extensas continuadas, cabeceras repetidas sin duplicar detalle. PDF solo texto; no HTML, scripts, enlaces activos ni acceso a URLs/rutas del usuario. Fuente cubre los caracteres españoles ensayados; no se acredita cobertura de todo Unicode. Las bibliotecas y versiones se contrastaron con npm y sus README/licencias; auditoría de dependencias en evidencias.

## Interfaz y operación local

`#resumen` y `#reportes` se integran con navegación/paleta existentes. Filtros explícitos, fechas UTC, totales/subtotales y tablas accesibles por teclado con desplazamiento horizontal. Estado carga/vacío/error, paginación, exportación completa, polling de trabajo, descarga y recuperación por referencia. Auditoría solo se ofrece a administrador; la API verifica aparte. La referencia permite recuperar un archivo propio tras recargar mientras no caduque; no se almacena en localStorage. Respuesta perdida conserva clave/payload para reintento exacto; bloquea navegación interna mientras se resuelve y advierte al recargar. No renovar sesión por polling.

Reproducir desde raíz, Node 24, Docker local y Chromium instalados: `npm ci`, `npm run build`, `npm test`, `npm run test:ui`. Pruebas de PDF requieren `pdftotext`; inspección independiente del XLSX usa Python 3/zipfile/ElementTree. `CHROMIUM_PATH` opcional. Toda base es efímera local con datos sintéticos y proveedor de identidad doble; el harness aplica la cadena completa de migraciones y retira su contenedor. Configuración normal sigue `.env.example`; no aplicar migraciones a un sistema remoto por inferencia.

## Aceptación y límites de evidencia

| Criterio | Verificación |
|---|---|
| CA11-01 | Métricas frente a fuente y dimensiones independientes; filtros/unidades/fechas A-06 |
| CA11-02 | Cinco reportes y buscador, columnas/orden/conteos/subtotales A-11 y proyección A-10 |
| CA11-03 | XLSX/PDF completos, vacío, fórmulas como texto, límites exactos/exceso y suma de conjuntos |
| CA11-04 | Propietario/RLS/MFA/Origin/CSRF, permisos revocados, idempotencia, instantánea y recuperación |
| CA11-05 | Build/regresión, UI/teclado/responsive, auditoría y documentación con resultados reales en PRUEBAS |
| CA11-06 | CUMPLIDO por aceptación expresa D-33 del usuario el 2026-11-02 |

No acreditado: Supabase gestionado/identidad/MFA externos, advisors operativos sin stack en 54322, hardware iPad/iPhone/Safari, lector de pantalla/conformidad WCAG completa, Excel/Acrobat físicos, carga concurrente ni objetivo de 60 s extremo a extremo en infraestructura objetivo. Las mediciones locales de límites no equivalen a CA-N07 global. F1-SEG-01 (retención legal antes de datos reales), F1-SEG-02 (presupuesto) y F1-SEG-03 (respaldo) siguen abiertos. UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. No se envió correo, procesó outbox, contrató infraestructura ni desplegó.


## Cierre aprobado — 2026-11-02

D-33 acepta la entrega `c94a366be22e6eae917711c52e695ea842c27187` mediante «Apruebo fase 11, inicia en nuevo chat fase 12». Fase 11 COMPLETADA y CA11-06 CUMPLIDO. La aceptación conserva evidencia, limitaciones y seguimientos; no acredita validación gestionada, correo externo, carga objetivo ni continuidad productiva. Fase 12 autorizada para iniciar en un nuevo chat; no se ejecuta en este cierre. Continuidad en [FASES](../FASES.md) y [ESTADO](../ESTADO_PROYECTO.md).


## Correcciones verificadas en Fase 13

D-35/D-36. RF-06: `q` incluye condición del bien y, en funcionarios del buscador combinado, documento original/canónico, correo y unidad además de nombre/cargo. Son claves de selección parametrizadas: las columnas autorizadas no se amplían. En XLSX/PDF del buscador, el metadato `q` se sustituye por `[consulta reservada]` para evitar copiar un documento/correo a un archivo compartible; selección/filas y restantes filtros permanecen coherentes. La pantalla autenticada conserva la consulta introducida y el trabajo privado conserva filtros reales para replay/selección.

Límites A-11 revalidados; medición local con fuente de 100.000 auditorías: XLSX 10.000 filas en 3,23 s y PDF 2.000 en 4,06 s desde solicitud hasta descarga. Recursos/dobles/red y límites en [QA_FASE13](QA_FASE13.md). No equivale a SLA gestionado ni inicia Fase 14.
