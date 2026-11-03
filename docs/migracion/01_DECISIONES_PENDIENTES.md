# FASE 1 — Decisiones de diseño pendientes

Fecha: 2026-11-03. Estado: **EN_REVISION / PROPUESTAS NO APROBADAS**.

## Autorizaciones y decisiones ya vigentes

- **M1-A01 APROBADA:** usuario acepta Fase 0 y autoriza únicamente Fase 1, con sincronización de todos los cambios autorizados en GitHub. Evidencia literal en [diagnóstico](00_DIAGNOSTICO.md).
- **M1-A02 VIGENTE:** conservar requisitos y avances; no reconstruir, modificar datos/esquema/aplicación ni ejecutar SQL en esta fase. Sin merge, despliegue, gastos, cambios de permisos remotos o producción.
- RF-01–16, RNF-01–07, D-14/D-17 y seguimientos F1-SEG-01/02/03 se conservan. SQL Server es el objetivo declarado por el nuevo prompt; su adaptación no rebaja garantías actuales.
- Esta Fase 1 pertenece al ciclo de migración. No sustituye la Fase 1 empresarial histórica ni su cierre D-14. Aprobar el inicio de una fase no aprueba las recomendaciones que produce.

## Cómo revisar

Cada decisión identifica hechos, alternativas y recomendación. Todas las M1-D01–M1-D16 están **PENDIENTES**; la columna recomendada no es una resolución. El usuario puede aprobar recomendaciones por ID y señalar opciones distintas. Las decisiones que necesitan datos quedan condicionadas a perfilado posterior autorizado: una aprobación de diseño no verifica identidades reales ni inventarios.

La aceptación documental y la autorización de Fase 2 son independientes de implementar SQL. Fase 2 puede registrar decisiones de datos todavía abiertas, pero no debe presentarlas como resueltas ni habilitar Fase 5 sin cierre de bloqueantes aplicables.

## M1-D01 — Motor objetivo y alcance tecnológico

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: D-17 eligió PostgreSQL/Supabase y previó portabilidad; el nuevo prompt especifica SQL Server.

Alternativas: A: SQL Server para datos empresariales, conservando React/Fastify y evaluando Auth aparte. B: proponer excepción de motor al modelo.

Recomendación: A; tratar SQL Server como objetivo documental vigente, ratificando alcance antes de implementar. No reconstruir backend en otro lenguaje.

Condición/impacto: Habilita diseño y estimación de adaptadores; no autoriza aprovisionamiento ni ejecución.

## M1-D02 — Autenticación externa y USUA_CLAVE_HASH

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: AuthService/SupabaseProvider ya implementan MFA, recuperación y sesiones; HASH NOT NULL contradice la alternativa externa admitida por el Excel.

Alternativas: A: mantener Supabase Auth, vínculo de proveedor y estado de acceso en soporte de aplicación; aprobar HASH nullable/no aplicable al proveedor externo. B: migración de identidad separada con estrategia de contraseñas/MFA y aceptación propia.

Recomendación: A. No duplicar hashes ni usar valores ficticios. Preservar pendiente/activa/inactiva, credencial_lista, revocación, 30 min/8 h y recuperación/invitación.

Condición/impacto: Requiere enmienda documental aprobada; proveedor gestionado y mapeo de cuentas no probados.

## M1-D03 — Identidad de funcionarios, vínculo de cuenta y unicidad de correo/red

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Destino no incluye RUT/ID/cargo; cuenta actual independiente. CALIDAD_DATOS afirma UQ de correo/red, sin UQ en campos/DER.

Alternativas: A: conservar identidad RUT/ID/cargo y mapear cada cuenta con persona validada; correo de login único para cuentas habilitadas mediante regla aprobada. B: conservar cuentas independientes como excepción explícita.

Recomendación: A condicionada a correspondencia humana; no unir personas por nombres/correos parecidos. Personas sin cuenta son válidas. No imponer UQ global al correo/red antes de perfilar datos y resolver nulabilidad/duplicados.

Condición/impacto: Aclarar 0..1 cuentas por persona y no crear cuentas para todos los funcionarios. Aprobación de arquitectura no valida asociaciones reales.

## M1-D04 — Ubicación física independiente

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: A-05 aprobado dice sin ubicación independiente; FUNC_AREA_ID depende de persona. Nuevo prompt pide evaluar equipo ubicado aparte.

Alternativas: A: conservar solo unidad por custodio, anotando límite. B: extensión normalizada de ubicaciones e historial por equipo, separada de pertenencia del funcionario.

Recomendación: B si se confirma necesidad de almacenes/equipos en otro lugar; hasta aprobarla rige A. Catálogo de ubicación e intervalos con un lugar vigente por equipo son propuesta conceptual, sin nombres/campos impuestos.

Condición/impacto: Cambio de alcance funcional; no traducir automáticamente área de persona a ubicación del equipo.

## M1-D05 — Equipos compartidos sin responsable nominal

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: ASIG_FUNCIONARIO_ID obligatorio; calidad identifica destinos por unidad.

Alternativas: A: responsable nominal real validado, conservando carácter compartido. B: custodia institucional por unidad con tipos de destinatario explícitos y reglas de exclusión.

Recomendación: A cuando la organización designe responsable; mantener casos sin resolver en cola de revisión. B requiere extensión y aprobación.

Condición/impacto: Nunca personas ficticias, asignaciones huérfanas ni funcionario elegido automáticamente.

## M1-D06 — Código actual, inventarios y serie

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: A-02 exige código único y motivo sin serie; EQUI tiene dos inventarios/serie nullable sin UQ.

Alternativas: A: conservar identificador operativo actual independiente de inventarios de origen y acordar unicidad por dominio tras perfilado. B: reemplazar código solo con equivalencia completa validada.

Recomendación: A; preservar código/serie actuales y trazabilidad. No imponer UQ nuevos a los inventarios SERVIU/MINVU sin análisis. COMP_NOMBRE_RED ya declara UQ; tratar ausencias del origen como excepciones.

Condición/impacto: No usar años como inventarios ni inventar números. Requiere datos originales autorizados en fase ETL.

## M1-D07 — UTC, precisión, fechas históricas y vigencia

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: D-14/A-04/A-06 exigen instantes y efectiva/registro separados; Excel usa DATE nullable para ASIG y DATETIME2 sin escala; DER fija 0/0/3.

Alternativas: A: mantener DATE de origen como dato histórico y añadir soporte de instantes UTC para eventos operativos con precisión acordada. B: revisar campos de ASIG a mayor precisión mediante enmienda.

Recomendación: A o B con decisión explícita; preservar todos los instantes existentes sin truncar y no fabricar hora para datos que solo tienen día. Acordar SYSUTCDATETIME/precisión en documentación; no asumir UTC del servidor.

Condición/impacto: Traslado cierra/abre en mismo instante; NULL permitido en históricos no habilita nuevas asignaciones sin fecha del servidor. Intervalos [inicio,fin).

## M1-D08 — Historia, concurrencia y cadena de traspasos

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: ASIGNACIONES no cubre movimientos de condición/baja, pertenencias, anotaciones ni sus garantías.

Alternativas: A: conservar estructuras de evidencia complementarias y proyección de asignaciones. B: equivalencia alternativa demostrable de todas las operaciones/historia.

Recomendación: A. Vigente única por equipo, intervalos sin solape, mismo equipo en predecesor, sin ciclos/autoenlace y política de sucesores aprobada. Transacción única con historia/auditoría/comando/outbox.

Condición/impacto: No definir DDL ahora. Cadena lineal es propuesta: ratificar antes de imponer UQ al predecesor.

## M1-D09 — Soporte técnico e identificadores públicos

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Modelo de 30 tablas no incluye sesiones/comandos/outbox/exportaciones/versiones. API actual usa UUID, ETag e Idempotency-Key.

Alternativas: A: conservar soporte técnico y correspondencia durable entre identificadores actuales y nuevos, manteniendo referencias públicas cuando sea posible. B: versionar contratos y migrar clientes con compatibilidad acordada.

Recomendación: A; separar núcleo documental de soporte técnico sin eliminar garantías. Conservar worker deshabilitado y exportación privada con permisos vigentes.

Condición/impacto: Diseño de tablas/adaptadores y mapeo detallado se desarrolla en fases posteriores autorizadas.

## M1-D10 — Subtipos, modelo/marca y compatibilidad

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Cuatro PK/FK no imponen disyunción ni tipo; MODELOS solo referencia marca.

Alternativas: A: validar matriz tipo→subtipo permitido/exigido, con cero subtipos para periféricos simples; modelo determina marca. B: ampliar catálogo de modelos con compatibilidad por tipo.

Recomendación: A y evaluar B. Un solo subtipo técnico aplicable; COMP_ES_NOTEBOOK coherente con tipo. No duplicar marca en EQUIPOS. Validar si nombres de modelos se distinguen por marca antes de añadir UQ compuesta.

Condición/impacto: Reglas exactas y mecanismos transaccionales pendientes; ninguna tabla o restricción nueva creada.

## M1-D11 — Perfiles múltiples y permisos efectivos

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Actual administrador/lectura; destino AUTORIZACIONES N:M y PERF_NIVEL_ACCESO UQ con niveles 1/2 descritos.

Alternativas: A: mantener dos perfiles iniciales y política explícita de permisos para multiasignación. B: extender catálogo de perfiles/niveles con revisión de UNIQUE y CHECK.

Recomendación: A inicialmente; una autorización administrativa exige MFA y controles de último administrador/propio rol; no derivar permiso de datos del cliente. Aclarar si se permite más de un perfil efectivo.

Condición/impacto: No se aprueba ampliación de privilegios ni se modifica RLS. Definir equivalencia SQL Server después.

## M1-D12 — Datos de impresión y protección de evidencia

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Código sensible opcional; observaciones pueden contener secretos según documento. AUDI admite JSON textual sin filtros definidos.

Alternativas: A: omitir almacenamiento de código si no es necesario. B: conservarlo cifrado con acceso específico, claves externas y enmascaramiento.

Recomendación: A por minimización salvo necesidad confirmada; si B, requiere custodio/rotación y acceso separado. Excluir secretos de observaciones/ETL/auditoría/logs/reportes; iniciar rotación fuera del repositorio por canal seguro.

Condición/impacto: Nunca incluir valores ni muestras reales en documentos, CSV o PR. Auditoría append-only y proyección positiva conservadas.

## M1-D13 — Condición, situación, baja y NULL

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Actual bueno/regular/malo + activo/baja; destino añade NO ACTIVO/RESERVA/EN PROCESO DE BAJA y permite NULL.

Alternativas: A: conservar estado de baja final mediante complemento/catálogo aprobado y definir transiciones de situaciones. B: revisar explícitamente el proceso actual con nuevos criterios.

Recomendación: A. No mapear baja final a en proceso de baja. No asignar a inactivo, baja, condición mala ni situación desconocida sin regla aprobada. Dato desconocido histórico no es estado operativo válido automático.

Condición/impacto: Preservar responsable al pasar a malo, bajas bloqueadas con custodia y reactivación sin recuperar asignaciones.

## M1-D14 — CHECK, claves, cascadas y rangos

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Nueve CHECK sin predicado completo; UNIQUE de niveles y nombre de red explícitos; DER no documenta defaults/IDENTITY.

Alternativas: A: catálogo explícito de validaciones según semántica documentada. B: mantener etiquetas incompletas y bloquear implementación.

Recomendación: A. Proponer formato de correo/MAC, niveles 1/2 si se ratifican, capacidades/dimensiones/puertos positivos y acciones del catálogo; documentar NULL y límites. No confundir propuestas con CHECK aprobados. No cascadas destructivas sobre historia.

Condición/impacto: DECIMAL(4,2) limita magnitud; SMALLINT e INT tienen límites físicos. No imponer enumeraciones nuevas ni valores máximos empresariales por intuición.

## M1-D15 — Longitudes, Unicode y collation

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: Contrato actual admite textos más largos; VARCHAR y UQ dependen de codificación/comparación.

Alternativas: A: ratificar SQL Server/collation Unicode apropiada y perfilar longitudes, manteniendo texto completo en complemento si hace falta. B: enmendar VARCHAR a NVARCHAR o longitudes tras análisis.

Recomendación: Elegir A/B con datos; preservar tildes y textos completos. Canonización actual recorta espacios y compara mayúsculas; sensibilidad a tildes y normalización adicional requieren decisión explícita.

Condición/impacto: Sin truncado silencioso; no usar tamaño de INT como longitud textual, ni 6-8 bytes DATETIME2 como escala.

## M1-D16 — Transformaciones y procedencia de datos

**Estado: PENDIENTE. Responsable de aprobación: usuario.**

Hecho/evidencia: MAPEO_EXCEL/CALIDAD_DATOS describen datos no incluidos como Excel operacional; interpretación de booleanos, identidades, departamentos y capacidades pendiente.

Alternativas: A: ratificar reglas inequívocas, conservar ambiguos en cola y exigir fuente autorizada para perfilado. B: resolver automáticamente contradicciones.

Recomendación: A. TB=1000 GB figura en descripción; confirmar adopción. No decidir significado de valores ambiguos, no inventar ceros/dígitos/fechas y no fusionar JURIDICO/JURIDICA sin validación.

Condición/impacto: No se ejecuta Fase 4 ni se accede a datos reales; el registro actual solo define decisiones necesarias.

## Cobertura de las siete decisiones obligatorias del prompt

| Área del prompt | Decisiones |
|---|---|
| Ubicación real separada del funcionario | M1-D04 |
| Compartidos sin responsable nominal | M1-D05 |
| Unicidad de inventarios/series | M1-D06 |
| Credenciales/autenticación | M1-D02/M1-D03 |
| Datos sensibles de impresión | M1-D12 |
| Subtipos/modelos/acciones | M1-D10/M1-D13/M1-D14 |
| Reglas ausentes o en conflicto | M1-D01/M1-D07/M1-D08/M1-D09/M1-D11/M1-D15/M1-D16 |

## Pendientes documentales y próximos pasos

`INICIAR_EN_CODEX.md` faltaba en la base inspeccionada; se crea en esta entrega como guía de continuidad documental, sin inventar instrucciones previas. ER, DER y Excel se conservan originales. Una futura aprobación debe registrar un addendum versionado o fuentes corregidas por su responsable; no se alteran silenciosamente.

La Fase 1 queda EN_REVISION. El siguiente paso es revisar este registro, resolver/ratificar las propuestas y autorizar por separado Fase 2 (línea base y trazabilidad). No hay Fase 2 iniciada ni migración física autorizada.
