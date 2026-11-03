# FASE 1 — Validación documental del modelo objetivo

Fecha: 2026-11-03. Estado: **EN_REVISION**. Responsable de preparación: Codex; aprobación: usuario.

## Alcance autorizado y fuentes

La instrucción «apruebo fase 0 y inicia fase 1 de aquí en adelante guarda todo github los cambios realizados» cierra Fase 0, autoriza validación documental y su sincronización. No aprueba decisiones pendientes ni inicia Fase 2. No se cambia esquema, SQL, backend, frontend ni datos. El diseño de extensiones en este informe es una propuesta, no una migración implementada.

Base remota `511b99d64c97ff1917f279e78490f377a3f5239a`. Fuentes: [prompt](../../prompts/PROMPT_MAESTRO_MIGRACION_INVENTARIOTI_CODEX.md), [ER](../modelo-datos/02_ER_MODELO_ENTIDAD_RELACION.png), [DER](../modelo-datos/03_DER_DIAGRAMA_ENTIDAD_RELACION.png), [Excel](../modelo-datos/04_DICCIONARIO_DATOS.xlsx), [requisitos](../REQUISITOS.md), [cierre aprobado D-14](../CIERRE_FASE1.md), [arquitectura](../ARQUITECTURA.md), [datos actuales](../DICCIONARIO_DATOS.md), código y ocho migraciones existentes. Las tres fuentes originales permanecen byte por byte iguales.

## Método y evidencia

1. Lectura visual de ER y DER, con ampliaciones de trabajo para verificar etiquetas. Transcripción manual independiente del DER en [der_transcrito.csv](evidencias/fase1/der_transcrito.csv); claves visibles del ER en [er_claves_transcritas.json](evidencias/fase1/er_claves_transcritas.json) y destinos FK transcritos visualmente en [aristas_transcritas.json](evidencias/fase1/aristas_transcritas.json). Las ampliaciones no se incorporan al repositorio.
2. Lectura de las cuatro hojas del Excel. Comparación de cada campo con la transcripción del DER: nombre, tabla, tipo/longitud, PK, FK, UQ y NULL. El ER conceptual muestra claves/relaciones, no todos los atributos ni tipos: se marca NO_APLICA para atributos no representados, sin fingir validación visual inexistente.
3. Revisión de las 30 aristas FK y su cardinalidad. Se separa lo permitido por claves/nulabilidad de la participación dibujada. Las expresiones de CHECK/defaults/IDENTITY no se verifican contra un motor porque no hay DDL destino ni ejecución autorizada.
4. Contraste de discrepancias con reglas ya aprobadas; propuestas y decisiones registradas aparte. No se ejecuta el ETL ni se construye la matriz requisito→pantalla de Fase 2.

La comprobación automática vuelve a comparar transcripciones y Excel; **no interpreta imágenes** ni sustituye la revisión visual. Sus hashes permiten detectar cambios de fuentes y transcripciones, no certificar semántica por sí solos.

## Resultado campo por campo

[01_MATRIZ_CAMPOS.csv](01_MATRIZ_CAMPOS.csv) contiene las 117 filas con número de fila Excel, tipo original, longitud, claves, referencia, nulabilidad, restricciones, lectura DER, presencia ER y hallazgos aplicables. [01_RELACIONES.csv](01_RELACIONES.csv) cubre las 30 FK. Son anexos documentales de esta fase, no el mapeo entre esquemas de Fase 2.

- 30 tablas y 117 campos, sin duplicación de nombres dentro de una tabla.
- 31 componentes de PK: 29 tablas con PK simple y AUTORIZACIONES con PK compuesta de dos campos.
- 30 campos FK con destino declarado existente y candidato PK/UQ compatible; todos INT.
- 55 campos de clave visibles en el ER coinciden con la unión PK/FK del diccionario.
- Coinciden nombres, PK/FK, marcas UQ explícitas y NULL entre DER y diccionario en las 117 filas.
- 114 tipos completos coinciden; 3 DATETIME2 coinciden en familia, pero la escala no está definida por el Excel: no se declaran equivalentes sin resolver H07.
- Nueve CHECK están etiquetados sin predicado completo. El DER omite representación de CHECK/defaults/IDENTITY; esto es límite de documentación, no prueba de ausencia física.

## Conciliación por tabla

| Tabla | Campos | PK | FK | Evaluación |
|---|---:|---|---:|---|
| REGIONES | 2 | REGI_ID | 0 | Coincidencia estructural; ver reglas transversales |
| DELEGACIONES | 4 | DELE_ID | 1 | Coincidencia estructural; ver reglas transversales |
| DEPARTAMENTOS | 2 | DEPA_ID | 0 | Coincidencia estructural; ver reglas transversales |
| AREAS | 2 | AREA_ID | 0 | Coincidencia estructural; ver reglas transversales |
| FUNCIONARIOS | 10 | FUNC_ID | 3 | H03; H08; H09; H12; H15 |
| PERFILES | 4 | PERF_ID | 0 | H04; H12 |
| USUARIOS | 5 | USUA_ID | 1 | H01; H02; H05; H07 |
| AUTORIZACIONES | 3 | AUTO_USUARIO_ID, AUTO_PERFIL_ID | 2 | H07 |
| AUDITORIA | 10 | AUDI_ID | 1 | H07; H12 |
| TIPOS_EQUIPO | 2 | TIPO_ID | 0 | Coincidencia estructural; ver reglas transversales |
| MARCAS | 2 | MARC_ID | 0 | Coincidencia estructural; ver reglas transversales |
| MODELOS | 3 | MODE_ID | 1 | Coincidencia estructural; ver reglas transversales |
| ORIGENES_EQUIPO | 2 | ORIG_ID | 0 | Coincidencia estructural; ver reglas transversales |
| ESTADOS_EQUIPO | 2 | ESTA_ID | 0 | Coincidencia estructural; ver reglas transversales |
| SITUACIONES | 2 | SITU_ID | 0 | Coincidencia estructural; ver reglas transversales |
| EQUIPOS | 12 | EQUI_ID | 5 | H06; H09; H10; H11; H14; H15 |
| SISTEMAS_OPERATIVOS | 2 | SIST_ID | 0 | Coincidencia estructural; ver reglas transversales |
| COMPUTADORES | 8 | COMP_EQUIPO_ID | 2 | H02; H06; H10; H12 |
| MONITORES | 2 | MONI_EQUIPO_ID | 1 | H02; H10; H12 |
| CLASES_IMPRESORA | 2 | CLAS_ID | 0 | Coincidencia estructural; ver reglas transversales |
| IMPRESORAS | 4 | IMPR_EQUIPO_ID | 2 | H02; H10; H12 |
| SWITCHES | 2 | SWIT_EQUIPO_ID | 1 | H02; H10; H12 |
| FAMILIAS_COMPONENTE | 2 | FAMI_ID | 0 | Coincidencia estructural; ver reglas transversales |
| PIEZAS_COMPUTADOR | 5 | PIEZ_ID | 2 | H12; H15 |
| RUBROS_INSUMO | 2 | RUBR_ID | 0 | Coincidencia estructural; ver reglas transversales |
| INSUMOS_IMPRESORA | 4 | INSU_ID | 2 | Coincidencia estructural; ver reglas transversales |
| MODALIDADES_ASIGNACION | 2 | MODA_ID | 0 | Coincidencia estructural; ver reglas transversales |
| ASIGNACIONES | 8 | ASIG_ID | 4 | H07; H08; H13 |
| ACTIVIDADES_MANTENCION | 2 | ACTI_ID | 0 | Coincidencia estructural; ver reglas transversales |
| MANTENCIONES | 5 | MANT_ID | 2 | Coincidencia estructural; ver reglas transversales |

## Cardinalidades y restricciones

Las 30 relaciones están enumeradas en el anexo. Una FK NOT NULL impone un padre por fila hija; nullable permite cero o uno. Si la FK es PK o UNIQUE, hay como máximo una hija por padre; las otras permiten múltiples. Ninguna FK por sí sola exige que todo padre tenga hijos.

- USUARIOS→FUNCIONARIOS: uno obligatorio por usuario, cero o una cuenta por funcionario. Las barras 1:1 de los diagramas requieren aclarar participación opcional del funcionario.
- COMPUTADORES/MONITORES/IMPRESORAS/SWITCHES→EQUIPOS: uno por subtipo y cero o uno de cada subtipo por equipo según PK/FK. Las barras de participación total dibujadas no deben obligar a cuatro subtipos por equipo; faltan disyunción y compatibilidad con tipo.
- AUTORIZACIONES: N:M, con pareja usuario/perfil única por PK compuesta. No hay garantía declarada de al menos un perfil ni definición de combinación de permisos.
- FUNCIONARIOS puede tener muchas ASIGNACIONES; cada ASIGNACION necesita equipo y funcionario. No hay unicidad por funcionario, y no debe añadirse.
- ASIG_TRASPASO_DE_ID nullable: cero o un predecesor por fila. Sin UQ, permite varios sucesores del mismo predecesor; la notación del lazo no basta para decidir si eso es válido. Requiere aclarar cadena lineal, mismo equipo, orden y ciclos.
- Referencias opcionales de EQUIPOS (modelo/origen/estado/situación), FUNC_AREA_ID, sistema operativo, clase de impresora y modalidad coinciden en nulabilidad. Falta diferenciar desconocido histórico de reglas para altas nuevas.
- No se especifican acciones ON DELETE/UPDATE. Propuesta: no cascadas destructivas sobre historia; restricciones y baja lógica por aprobar en diseño.

## Registro de hallazgos

| ID | Severidad | Alcance | Evidencia y discrepancia | Decisiones |
|---|---|---|---|---|
| H01 | CRÍTICA | USUARIOS.USUA_CLAVE_HASH | DICCIONARIO_DATOS fila 28: VARCHAR(255) NOT NULL; descripción admite Supabase Auth; DER también NOT NULL. auth/supabase.ts delega contraseña/MFA al proveedor. | M1-D02 |
| H02 | ALTA | Participación usuario y subtipos | ER/DER dibujan barras 1:1 en usuario–funcionario y en los cuatro subtipos. FK+UQ/PK exige padre por hijo y permite 0..1 hijos por padre; no exige cuenta/subtipo para todo padre. Prompt permite personas sin cuenta y tipos sin subtipo. | M1-D03;M1-D10 |
| H03 | ALTA | FUNC_CORREO y FUNC_USUARIO_RED | CALIDAD_DATOS fila 10 afirma unicidad; DICCIONARIO_DATOS filas 14–15 no declaran UNIQUE y DER tampoco muestra UQ. El correo nullable se describe como identificador de login. | M1-D03 |
| H04 | MEDIA | PERF_NIVEL_ACCESO y perfiles múltiples | Fila 24: UNIQUE,CHECK; descripción enumera niveles 1/2. Si CHECK limita a ambos y UNIQUE se conserva, solo caben dos perfiles. AUTORIZACIONES admite varios perfiles por usuario; falta política efectiva y conservación de último administrador/MFA. | M1-D11 |
| H05 | CRÍTICA | Cuenta vinculada a persona y estado | USUA_FUNCIONARIO_ID obligatorio/único frente a cuentas actuales independientes; BIT USUA_ACTIVO no representa pendiente/activa/inactiva, credencial_lista, proveedor_ref ni version_autorizacion. No existe mapeo de cuentas reales verificado. | M1-D02;M1-D03;M1-D09 |
| H06 | CRÍTICA | Código de inventario y series | RF-02/A-02 y migración inicial exigen código canónico único y serie única cuando existe, con motivo si falta. Filas 63–65 del destino admiten NULL y no declaran UQ. COMP_NOMBRE_RED sí es obligatorio/único (fila 73). | M1-D06 |
| H07 | CRÍTICA | Precisión temporal y UTC | Excel filas 30/33/36 dice DATETIME2, longitud 6-8 (almacenamiento, no escala); DER especifica (0)/(0)/(3). Defaults SYSDATETIME no garantizan UTC salvo configuración comprobada. ASIG usa DATE frente a instantes UTC actuales. | M1-D07 |
| H08 | ALTA | Ubicación y equipos compartidos | FUNC_AREA_ID es opcional y depende de persona; EQUIPOS/ASIGNACIONES no tienen ubicación independiente. ASIG_FUNCIONARIO_ID obligatorio no cubre custodia por unidad. A-05 aprobado previamente excluye ubicación independiente; agregarla sería cambio de alcance. | M1-D04;M1-D05 |
| H09 | CRÍTICA | Secretos y auditoría | Código de impresión en FUNC_CLAVE_IMPRESION y observaciones declaradas sensibles. AUDI_VALOR_ANTERIOR/NUEVO son VARCHAR(MAX), sin proyección positiva/cifrado/inmutabilidad impuestos por el diccionario. Nunca copiar filas completas con secretos. | M1-D12 |
| H10 | ALTA | Subtipos, tipo y modelo | PK/FK de los cuatro subtipos no impide que un equipo aparezca en subtipos incompatibles. COMP_ES_NOTEBOOK y TIPOS_EQUIPO requieren correspondencia. MODELOS conoce marca, pero no tipo compatible ni unicidad marca+nombre. | M1-D10 |
| H11 | CRÍTICA | Situación administrativa y baja | Destino permite situación/condición NULL; catálogos distinguen ACTIVO/NO ACTIVO/RESERVA/EN PROCESO DE BAJA. Actual usa activo/baja. En proceso de baja no equivale a baja concluida; no inventar correspondencia. | M1-D13 |
| H12 | ALTA | CHECK sin expresiones y defaults omitidos del DER | Nueve campos etiquetan CHECK sin predicado completo. DER no representa CHECK, DEFAULT ni IDENTITY; su ausencia visual no prueba contradicción. Formalizar NULL, dominios, rangos y errores sin imponerlos hoy. | M1-D14 |
| H13 | CRÍTICA | Vigencia, traspasos e historia | ASIG no declara índice de vigente única, control de intervalos ni coherencia entre equipo anterior/nuevo. Auto-FK no impide autorreferencia/ciclos/ramificación. DATE+NULL histórico no reconstruye instantes. Faltan movimientos/pertenencias/anotaciones de RF-04/05. | M1-D07;M1-D08 |
| H14 | ALTA | Longitudes, Unicode e identificadores | Textos actuales admiten hasta 2000 caracteres en varios contratos; destino impone 30/60/150/300/500 según campo. VARCHAR depende de collation/codificación y límite en bytes. UUID actuales y referencias HTTP no caben semánticamente en INT sin correspondencia. | M1-D09;M1-D15 |
| H15 | ALTA | Normalización y origen operacional no disponible | MAPEO_EXCEL tiene 57 reglas y CALIDAD_DATOS 13 hallazgos: fechas/identidades ambiguas, años como inventario, precisión perdida, capacidades/unidades y booleanos por confirmar. La hoja de calidad menciona semillas/cargas, pero el kit no prueba su ejecución. | M1-D16 |

## Conservación y propuestas

Se conservan literalmente los archivos de aplicación, migraciones, dependencias, pruebas, evidencias históricas y fuentes del modelo. Se propone conservar capacidades de identidad RUT/ID/cargo, adquisición/código, historia completa, control de versión, idempotencia, sesión, permisos, auditoría minimizada, avisos y exportaciones mediante complementos explícitos al núcleo de 30 tablas. No se decide aquí nombre, DDL, implementación ni eliminación de esas capacidades.

Precisión respecto de Fase 0: A-05/CR-07/CR-11 ya aceptó unidad del custodio y ninguna ubicación independiente. El nuevo prompt exige analizar esa necesidad; no la convierte automáticamente en requisito aprobado. H08 y M1-D04 exponen alternativas sin cambiar la regla anterior.

## Verificaciones, límites y criterio de salida

Primer ensayo del verificador: FALLÓ al leer una celda OOXML inline vacía sin nodo de texto. Se corrigió el lector para devolver valor vacío en ese caso; la comprobación posterior pasó. No se modificó la fuente Excel ni se ejecutó SQL para corregirlo. El primer control de espacios detectó finales CRLF en los CSV nuevos; se normalizaron a LF y se repitió el control.

Ejecutar desde la raíz: `python3 docs/migracion/verificar_fase1.py`. Solo usa biblioteca estándar, lee XLSX/CSV/JSON y archivos; no importa código de aplicación ni abre conexiones. Resultado archivado en [verificacion.json](evidencias/fase1/verificacion.json). La revisión adicional comprueba que todos los cambios son documentación/anexos/verificador documental y que no cambian fuentes, aplicación ni SQL. No hay dependencias nuevas.

APROBADAS en su alcance: cobertura de tablas/campos/claves, referencias/tipos/null/UQ, integridad de anexos, hashes de fuentes, registro de hallazgos y preservación de archivos. Discrepancias de diseño: **PENDIENTES DE APROBACIÓN**, no resultados de pruebas funcionales fallidas.

NO EJECUTADAS: SQL Server/PostgreSQL, migraciones, consultas, build, pruebas funcionales/API/UI, carga, proveedores gestionados y perfilado de datos reales. No hay Excel operacional de origen ni datos/cuentas reales examinados. No se acredita migrabilidad física ni calidad real con los conteos del diccionario.

Criterios documentales: 117 campos y 30 relaciones revisados; contradicciones y siete áreas obligatorias del prompt cubiertas por decisiones; fuentes conservadas; entrega en GitHub verificable. Fase 1 queda EN_REVISION, no COMPLETADA: falta aceptación y resolución/ratificación del [registro de decisiones](01_DECISIONES_PENDIENTES.md). Fase 2 permanece NO AUTORIZADA. El modelo todavía no está habilitado para implementar migraciones.
