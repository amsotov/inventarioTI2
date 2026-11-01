# Backend y API — Fase 7

Entrega 2026-10-31 · COMPLETADA por aceptación expresa D-25 el 2026-11-01; base de ejecución `0fead7b`. Fase 8 autorizada para un nuevo chat, ejecución pendiente.

Plan previo: contratos y servicios por dominio, validación estricta, consultas/filtros/paginación/ETag, integración de autorización, escritura atómica de atributos de bienes, pruebas HTTP/SQL negativas y concurrentes, documentación y sincronización GitHub. Codex prepara/verifica; usuario acepta.

## Superficie implementada

[OpenAPI 3.1](openapi-fase7.json) describe exclusivamente los endpoints empresariales habilitados; autenticación existente en [AUTENTICACION](AUTENTICACION.md). Los contratos de Fase 3 siguen como objetivo global, no como lista de funcionalidades terminadas.

- GET `/api/v1/bienes`, `/funcionarios`, `/unidades`, `/movimientos` y sus fichas `/{ref}`. Proyección positiva, filtros admitidos por recurso, orden estable por ID, límite predeterminado 50/máximo 100 y cursor vinculado al recurso/filtros; cursores no conservan instantánea. Fechas de adquisición/alta/fecha efectiva en días UTC inclusivos. Unidades no admite fechas. Búsqueda literal `q` sobre código de bien o nombre de funcionario/unidad. No hay búsqueda global ni agregados.
- Fichas devuelven los atributos disponibles; no ensamblan todavía cronología, pertenencias y custodia en una única respuesta. Movimientos se consulta separadamente. Funcionarios excluye documento y correo en ambos roles; una futura edición administrativa requerirá contrato propio.
- POST `/api/v1/bienes`: código, tipo, marca, modelo, condición y motivo obligatorios; serie opcional con motivo de ausencia; adquisición y observaciones opcionales. Serie/código sin espacios exteriores y únicos sin distinguir mayúsculas, incluso tras baja. Alta sin custodia y situación activa. `201 {ref,version,aviso:"pendiente"}` y ETag.
- PATCH `/api/v1/bienes/{ref}`: edición de atributos con representación completa de código/tipo/marca/modelo y motivo; los campos opcionales omitidos se limpian. Exige `If-Match: "vN"`; prohíbe condición, situación y custodia. `200` con referencia/versión y ETag. No ofrece JSON Merge Patch.

JSON estricto, campos desconocidos rechazados, límite de cuerpo 8192 bytes heredado; textos hasta 2000 caracteres. Errores `application/problem+json` con requestId, sin SQL ni detalles internos. El rol lectura consulta inventario compartido; solo administrador con MFA puede escribir. Origen y CSRF requeridos en comandos. Clave idempotente UUID obligatoria. La respuesta original se recupera antes de validar la versión antigua; cambiar payload con la misma clave produce 409. La huella usa JSONB normalizado por claves (espacios del contenido siguen siendo significativos).

## Unidad de trabajo y privilegios

`main.ts` compone Inventory y Authorization con `BUSINESS_DATABASE_URL` separado de Auth. Verifica `inventario_runtime` sin propiedad/BYPASSRLS/membresías. Authorization mantiene sesión/cuenta bloqueadas durante la operación, valida identidad externa y principal SQL vigente, establece contexto LOCAL y controla commit/rollback. El servicio no vuelve a entrar en Auth ni confirma transacciones propias.

La migración nueva incorpora `inventario_servicio` NOLOGIN, sin propiedad de tablas ni BYPASSRLS, con grants mínimos y RLS administrativo. Solo es propietario de la función acotada `guardar_bien`, privada, search_path fijo y EXECUTE revocado a PUBLIC. Runtime puede invocarla, pero no hacer DML directo; no se conceden permisos públicos Supabase. La función deriva actor de la sesión vigente, valida entrada y nunca acepta actor/rol/fecha del cliente. No se aprovisionan logins reales.

Una transacción conserva bien + comando inmutable + auditoría antes/nuevo + aviso lógico pendiente. Edición de atributos queda representada por auditoría; no inventa un movimiento de custodia. Lock transaccional de clave idempotente y lock de fila/versiones previenen ejecución duplicada y actualizaciones perdidas. Resultado durable conserva ref/versión; replay no duplica evidencia ni aviso. Un fallo del outbox revierte todo. Sin destinatario configurado se devuelve 503 y no se registra éxito parcial; la configuración operativa pertenece a su fase. En pruebas se usa dirección example.invalid.

## Criterios y límites

| Criterio | Entrega |
|---|---|
| CA7-01 | Contrato OpenAPI de superficie implementada y documentación de lo pendiente |
| CA7-02 | Consultas autorizadas, proyección positiva, filtros UTC y paginación estable |
| CA7-03 | Validación servidor, ETag/If-Match y errores consistentes |
| CA7-04 | Alta/edición atómicas, idempotencia, unicidad, evidencia/outbox y rollback |
| CA7-05 | Build, regresión Auth/seguridad y composición real HTTP/PostgreSQL con identidad doble; evidencia en PRUEBAS |
| CA7-06 | CUMPLIDO por D-25 el 2026-11-01; Fase 7 COMPLETADA |

No implementado: comandos de funcionarios/unidades, movimientos de custodia/transiciones/anotaciones (Fase 10); cuentas/panel/configuración administrativa (Fase 9); resumen/búsqueda combinada/reportes/exportaciones (Fase 11); procesamiento/envío del outbox (Fase 12); frontend funcional (Fase 8). No se presenta la API global del MVP como completa. Las fases 9–12 requerirán autorización independiente; este reparto respeta el punto de continuidad D-23.

No probado aquí: Supabase gestionado, credenciales reales, dispositivos/UI integrada, correo externo, rendimiento de producción o continuidad operativa. F1-SEG-01 (conservación legal antes de datos reales), F1-SEG-02 (presupuesto) y F1-SEG-03 (operación del respaldo) siguen abiertos. UTC y copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Sin Spec Kit instalado, proyectos remotos, datos reales, gastos ni despliegue.


## Cierre aprobado — 2026-11-01

D-25 acepta la entrega `6035e125617a2c8d6e366df49940b8d720f8d535` con sus límites y pendientes intactos; no agrega funcionalidades ni nuevas verificaciones operativas. Fase 8 autorizada para un nuevo chat, sin ejecución aquí.
