# FASE 6 — Adaptación del backend

Fecha local: 2026-11-03, America/Santiago. Base aceptada: `27cae1fde225ce10aebef7b89db65da2fd8c1aed`.
**Estado: EN_PROGRESO; integración y escrituras del modelo SQL Server BLOQUEADAS. Entrega parcial verificable, sin cierre de Fase 6 ni autorización de Fase 7.**

El usuario acepta Fase 5 e inicia Fase 6. Se conserva la aplicación existente y se preparan sus límites de persistencia y contratos de destino. Esta entrega permite revisar código y pruebas; todavía no permite operar el inventario sobre las 30 tablas nuevas.

## Autorizaciones y fuentes

| ID | Evidencia del usuario | Alcance |
|---|---|---|
| M6-A01 | «apruebo fase 5 inicia fase 6» | Acepta entrega F5 y autoriza adaptación del backend, con sincronización GitHub. Los ensayos SQL Server pendientes siguen pendientes. |
| M6-A02 | «Sí, conservar Auth y soporte existentes» | Mantener Supabase Auth, sin duplicar contraseñas; `USUA_CLAVE_HASH` nullable para cuentas externas; UUID públicos, sesiones, historia, idempotencia y outbox en soporte complementario. |
| M6-A03 | «Sí, preservar Unicode e instantes UTC» | NVARCHAR para textos Unicode; DATETIME2(7)/SYSUTCDATETIME para instantes operativos; DATE/NULL histórico separado, sin fabricar horas. |

Leídos AGENTS/FASES/ESTADO/README/INICIAR, ambos prompts maestros, arquitectura/seguridad/contratos/pruebas/runbook y entregas de migración 0–5. ER/DER/Excel originales y las cuatro hojas del diccionario siguen intactos. Los 18 contratos y 27 schemas de F3 son la fuente del contrato ejecutable. La [trazabilidad de las enmiendas](evidencias/fase6/enmiendas.json) conserva valores anteriores/nuevos y autorizaciones literales.

## Código implementado y conservado

- `inventory/ports.ts`, `postgres.ts` y `service.ts`: separar la lógica del inventario de su persistencia mediante repositorio/gateway. El adaptador PostgreSQL mantiene consultas parametrizadas, paginación, proyecciones, versión y llamadas a funciones transaccionales existentes. La composición de producción y los fixtures usan explícitamente este adaptador.
- `modernization/contract.ts` y `routes.ts`: frontera HTTP para las 18 operaciones v2, registrada únicamente mediante inyección explícita. Schemas cerrados, validación de referencias/fechas/headers, motivo/confirmación, combinación de movimiento, CSRF, permisos y ETag. Los schemas derivados se cotejan íntegramente con F3. No se modifican sus originales.
- `modernization/postgres-access.ts`: la frontera reutiliza sesión, MFA, revocación, principal RLS y evento de autorización existentes. El callback recibe solo id/rol/versión de autorización; nunca credenciales o actor del payload. La validación de respuesta ocurre dentro de la transacción; el envío HTTP ocurre después de su commit. Una proyección con campos inesperados falla cerrada.
- `modernization/ports.ts`: un backend debe operar sobre la misma transacción autorizada y confirmar dominio, cierre/apertura de custodia, historia, auditoría, comando y outbox conjuntamente. Se rechaza mezclar un acceso PostgreSQL con un repositorio SQL Server. Una interfaz no demuestra que esas escrituras estén implementadas.
- `modernization/sqlserver-catalogs.ts`: dos lecturas concretas de destino, C03-01/C03-18, cubren 12 catálogos y 4 grupos organizativos por lista fija. TOP/cursores/búsqueda/marca usan parámetros tipados; los nombres de tablas no proceden de HTTP. INT internos se resuelven a UUID persistidos por un puerto de referencias; una correspondencia ausente produce 503, sin inventar identificadores. No hay controlador TDS ni store físico de referencias aún.
- `modernization/sqlserver2016.ts` y `target-model.ts`: sonda de motor 13/nivel 130 y de las 117 columnas enmendadas; compara tipo, bytes, precisión, escala, NULL, identity y defaults. No certifica PK/FK/UQ, permisos, soporte o transacciones. Aun con núcleo compatible, `activationReady` es siempre false. Validador de texto mide NVARCHAR en unidades UTF-16 y rechaza excesos sin truncar; es una utilidad para el futuro repositorio, no una migración de datos.
- `inventory/configuration.ts`, `main.ts`, `.env.example`: `INVENTORY_BACKEND=postgres` por defecto; seleccionar `sqlserver2016` falla antes de abrir pools. No hay fallback silencioso. `main` no registra v2; la ruta no existe sin inyección. Un backend inyectado sin capacidad autorizada responde 503 después del control de acceso.

AuthService/SupabaseProvider, recuperación, políticas, funciones SQL PostgreSQL, procesos, reportes, exportación y workers se conservan. Los módulos de administración/procesos/reportes/notificaciones aún dependen de PostgreSQL: no se presentan como portados. El frontend, identidad visual, prototipo F3 y migraciones originales PostgreSQL permanecen intactos. Los cambios en tests existentes solo actualizan la composición del inventario.

## Enmienda del candidato SQL Server

Revisión **0.6.0-review.1**: 42 campos cambian respecto del candidato aceptado: 38 VARCHAR→NVARCHAR con longitudes originales, tres DATETIME2→DATETIME2(7) con SYSUTCDATETIME y `USUA_CLAVE_HASH` nullable. Se actualizan núcleo, catálogo esperado y manifest; ningún SQL se ejecuta.

Se conservan VARCHAR para hash, código de impresión, dirección IP del equipo, MAC y GUID, de naturaleza técnica ASCII. Esto mantiene el CHECK propuesto de MAC basado en DATALENGTH. El código de impresión continúa sin almacenamiento/exposición implementados; no se elige conservarlo ni omitirlo por inferencia. PK/FK/UQ/IDENTITY, DATE históricos, nueve CHECK propuestos y 24 índices no cambian. Los cuatro SQL conservan THROW incondicional y guardias 2016/130/base de sistema. No retirar la barrera para ensayar.

NVARCHAR preserva Unicode, pero no resuelve collation, equivalencia de tildes o longitudes superiores al diccionario. La API admite textos más largos que varios campos nuevos: el repositorio de escritura necesita una política de preservación complementaria antes de guardar; no basta validar el JSON. No se estrecha v1 ni se trunca información.

## Cobertura por operación

En las 18 filas hay controlador/validación/autorización y prueba de frontera implementados. Las pruebas HTTP v2 usan persistencia doble y no escriben el modelo normalizado. «Lectura implementada» se limita al constructor/ejecutor parametrizado por puerto, probado con doble SQL; falta conexión, autorización SQL Server y referencias físicas.

| Contrato | Operación | Persistencia de destino |
|---|---|---|
| C03-01 | Catálogos | Lectura implementada por puerto; integración bloqueada |
| C03-02 | Equipos, filtros/página | Pendiente |
| C03-03 | Alta de equipo | Pendiente |
| C03-04 | Ficha de equipo | Pendiente |
| C03-05 | Atributos de equipo | Pendiente |
| C03-06 | Datos técnicos/piezas/insumos | Pendiente |
| C03-07 | Asignación/devolución/traslado/condición/baja/reactivación | Pendiente; atomicidad nueva no demostrada |
| C03-08 | Historia y anotaciones | Pendiente |
| C03-09 | Mantenciones, consulta | Pendiente |
| C03-10 | Alta de mantención | Pendiente |
| C03-11 | Funcionarios, filtros/página | Pendiente |
| C03-12 | Alta de funcionario | Pendiente |
| C03-13 | Ficha pública | Pendiente |
| C03-14 | Ficha de edición privada | Pendiente |
| C03-15 | Atributos de funcionario | Pendiente |
| C03-16 | Pertenencias e historia | Pendiente |
| C03-17 | Perfiles y revocación | Pendiente; política múltiple no ratificada |
| C03-18 | Organización | Lectura implementada por puerto; integración bloqueada |

## Pruebas y límites

Resultados y comandos reproducibles en [evidencia](evidencias/fase6/pruebas.json). La suite Node incluye pruebas nuevas unitarias/HTTP y regresión de v1 con transacciones y roles reales PostgreSQL, concurrencia, replay, historia y fallo de outbox. Identidad usa doble en esas pruebas; la prueba preexistente del adaptador Auth usa GoTrue local. Ninguna se presenta como login/MFA real del proyecto Supabase gestionado.

El parser Microsoft ScriptDom TSql130Parser verificó cuatro SQL y tres autopruebas sin errores, [resultado con hashes](evidencias/fase6/scriptdom130.json). Es análisis estático, sin ejecución o compilación semántica SQL Server. La sonda de catálogo y consultas SQL Server se ensayan con dobles; no se llamó una instancia real.

Se conserva la evidencia histórica F5 en el commit aceptado. Su verificador exige fuentes de aplicación intactas y tipos previos: ya no aplica como comprobación vigente sobre F6. No se alteran sus hashes para simular que pasan. El nuevo `python3 docs/migracion/verificar_fase6.py` verifica preservación, enmiendas y contratos sin conexión; `--evaluar-aplicacion` devuelve 3 por bloqueo. El linaje registra hashes anteriores y posteriores. No hay cambios remotos Supabase durante esta fase; los 20 ensayos gestionados de F5 no se repitieron.

## Bloqueos y continuación dentro de Fase 6

1. Falta instancia SQL Server 2016 aislada/autorizada, edición/SP/CU/collation y acceso de prueba sin secretos en el repositorio. PostgreSQL 17 no verifica T-SQL, locks, collation ni restore de SQL Server.
2. Diseñar e implementar soporte físico, store de acceso y correspondencias durables UUID/INT; enlazar cuentas con personas validadas. M6-A02 aprueba conservar las garantías, no demuestra ese mapeo ni implementa las tablas. No usar dos conexiones de motores distintos para aparentar una transacción atómica.
3. Ratificar reglas concretas M1-D10/D11/D13 (subtipos, perfil efectivo y baja final), predicados M1-D14, datos de impresión M1-D12 y política de excesos/collation M1-D15. M1-D03/06/08/16 conservan condiciones de correspondencia, procedencia, cadena de traspasos y datos. Las decisiones generales de conservación no ratifican automáticamente todas sus alternativas.
4. Implementar repositorios pendientes y su transacción de custodia completa; integrar permisos con el nuevo modelo sin rebajar MFA/CSRF/revocación. Verificar con dos conexiones independientes: unicidad de vigente, cierre/apertura en un instante, replay antes de versión y rollback al fallar auditoría/outbox.
5. Ejecutar pruebas de integridad, permisos, concurrencia y recuperación del destino. Datos reales/Excel operacional solo serán necesarios para perfilado y carga autorizados; su ausencia no impidió desarrollar y probar esta frontera con sintéticos.

Se solicitaron por separado las reglas pendientes y disponibilidad de instancia. No repetir M6-A01/A02/A03 ni pedir credenciales en el chat. Continuar esta misma fase al resolver sus dependencias; no comenzar Fase 7 por inferencia. La aplicación actual queda disponible en su configuración existente. No hay merge, despliegue, producción, correo externo, cambio de facturación ni reactivación de inventarioTI.
