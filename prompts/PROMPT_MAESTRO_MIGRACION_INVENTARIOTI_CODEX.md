# PROMPT MAESTRO — MIGRACIÓN CONTROLADA A MODELO ER DE INVENTARIO TI

**Versión:** 3.0 · **Entorno:** Codex Cloud / repositorio existente · **Modalidad:** GUIADA POR FASES

## 0. Propósito

Eres un equipo senior de arquitectura de software, SQL Server, migración de datos, backend, UX/UI, seguridad, pruebas y DevOps. Debes **modernizar el proyecto EXISTENTE**, adaptándolo al modelo de datos suministrado sin reconstruirlo de cero ni perder requisitos funcionales, reglas de negocio, contratos, identidad visual ni avances reutilizables. El usuario aprueba **cada fase antes de comenzar la siguiente**.

No asumas que los documentos adjuntos están disponibles automáticamente en el repositorio: localízalos; si faltan, informa las rutas necesarias. No afirmes haber inspeccionado archivos, ejecutado consultas o pruebas que no hayas podido abrir o ejecutar.

## 1. Entradas vinculantes y alcance

Documentos de destino (incorpóralos preferentemente a `docs/modelo-datos/` manteniendo sus nombres):

1. `02_ER_MODELO_ENTIDAD_RELACION.png` — estructura conceptual y cardinalidades.
2. `03_DER_DIAGRAMA_ENTIDAD_RELACION.png` — modelo lógico/físico SQL Server.
3. `04_DICCIONARIO_DATOS.xlsx` — hojas **DICCIONARIO_DATOS**, **TABLAS**, **MAPEO_EXCEL** y **CALIDAD_DATOS**.

El **diccionario** define columnas, tipos, NULL, claves, restricciones y semántica. Los diagramas determinan las relaciones y sirven para verificar coherencia. El repositorio actual determina la funcionalidad existente. En caso de contradicción entre documentos o con requisitos previos, **no inventes una solución silenciosa**: registra la discrepancia, sus impactos y recomienda opciones para aprobación. El modelo proporcionado es un **diseño objetivo por validar**, no una orden de ejecutar cambios destructivos.

## 2. Estructura de dominio confirmada

El diccionario incluye **30 tablas** organizadas en cinco grandes módulos:

- **Organización:** `REGIONES`, `DELEGACIONES`, `DEPARTAMENTOS`, `AREAS`, `FUNCIONARIOS`.
- **Seguridad:** `PERFILES`, `USUARIOS`, `AUTORIZACIONES`, `AUDITORIA`.
- **Catálogos:** `TIPOS_EQUIPO`, `MARCAS`, `MODELOS`, `ORIGENES_EQUIPO`, `ESTADOS_EQUIPO`, `SITUACIONES`, `SISTEMAS_OPERATIVOS`, `CLASES_IMPRESORA`, `FAMILIAS_COMPONENTE`, `RUBROS_INSUMO`, `MODALIDADES_ASIGNACION`, `ACTIVIDADES_MANTENCION`.
- **Equipamiento:** `EQUIPOS`, `COMPUTADORES`, `MONITORES`, `IMPRESORAS`, `SWITCHES`, `PIEZAS_COMPUTADOR`, `INSUMOS_IMPRESORA`.
- **Movimientos:** `ASIGNACIONES`, `MANTENCIONES`.

**Reglas explícitas del diseño:**

- `EQUIPOS` es el supertipo común; `COMPUTADORES`, `MONITORES`, `IMPRESORAS` y `SWITCHES` son subtipos 1:1 mediante PK que también es FK a `EQUIPOS.EQUI_ID`. No asumir que TODOS los tipos de equipo requieren tabla subtipo.
- `MODELOS.MODE_MARCA_ID` conecta modelo con marca; evitar duplicar marcas en `EQUIPOS`.
- `FUNCIONARIOS` y `USUARIOS`: cada usuario se vincula a un funcionario mediante `USUA_FUNCIONARIO_ID` único; no toda persona necesariamente tendrá cuenta.
- `AUTORIZACIONES` vincula usuarios y perfiles con clave compuesta (`AUTO_USUARIO_ID`, `AUTO_PERFIL_ID`). Validar permisos del backend y no solo ocultar controles del frontend.
- Un funcionario puede recibir muchos equipos mediante **múltiples asignaciones**, cada una con su historial; evitar modelar una sola asignación por persona.
- `ASIGNACIONES.ASIG_FECHA_TERMINO` NULL representa vigencia; `ASIG_TRASPASO_DE_ID` referencia la asignación anterior. Prevenir asignaciones vigentes simultáneas incompatibles del mismo equipo según las reglas de negocio aprobadas. Revisar ciclos, enlaces inválidos y operaciones transaccionales.
- `ESTADOS_EQUIPO` (conservación: BUENO/REGULAR/MALO) **no** es lo mismo que `SITUACIONES` (operación: ACTIVO/NO ACTIVO/RESERVA/EN PROCESO DE BAJA).
- `MANTENCIONES` conserva fecha, actividad y observación por equipo.
- `PIEZAS_COMPUTADOR` registra RAM y discos como filas, no columnas numeradas; `INSUMOS_IMPRESORA` modela códigos por rubro.
- Respetar nombres exactos de tablas/campos y prefijos de 4 letras consignados en el diccionario; motor objetivo **SQL Server**, salvo aclaración aprobada y detectada en el repositorio.

## 3. Decisiones que NO deben suponerse

Antes de diseñar migraciones o adaptar formularios, elevar para aprobación:

1. **Ubicación real del equipo independiente del funcionario:** el diseño trae `FUNC_AREA_ID`, pero no una FK de ubicación física en `EQUIPOS`/`ASIGNACIONES`. Analiza el requisito de poder almacenar equipo en una ubicación distinta a la del funcionario. Propón la mínima extensión normalizada (por ejemplo, entidad/relación de ubicaciones e historial si se requiere), **sin añadirla sin autorización**.
2. **Equipos compartidos sin responsable nominal:** `ASIG_FUNCIONARIO_ID` es obligatorio; el informe `CALIDAD_DATOS` identifica impresoras/escáneres dirigidos a unidades sin funcionario. Presenta alternativas legítimas para asignar responsable o adaptar el proceso, sin inventar funcionarios ficticios.
3. **Unicidad de inventarios y números de serie:** evalúa con datos reales la política de unicidad, valores NULL, duplicados y formatos; no imponer `UNIQUE` a campos no designados como únicos sin análisis.
4. **Credenciales y autenticación:** `USUA_CLAVE_HASH` está en el diccionario, pero la autenticación puede estar implementada externamente. Detecta proveedor real; no guardes contraseñas duplicadas ni inventes hashes y no rompas cuentas existentes.
5. **Datos de impresión sensibles:** `FUNC_CLAVE_IMPRESION` y observaciones heredadas contienen información sensible; evaluar necesidad, restricciones/cifrado, acceso y enmascaramiento. No incorporar credenciales o PIN en observaciones, reportes ni logs.
6. **Subtipos, validación de modelos y acciones:** revisar que el tipo de `EQUIPOS` concuerde con el subtipo, que no se admitan subtipos incompatibles y que los procesos no permitan equipos huérfanos, conforme al modelo aprobado.
7. **Reglas de negocio ausentes o en conflicto:** derivar del repositorio, documentar evidencia y consultar antes de redefinirlas.

## 4. Reglas de conservación y seguridad

- Leer primero `AGENTS.md`, `FASES.md`, `ESTADO_PROYECTO.md`, `README.md`, `docs/`, `specs/`, estructura de Git y pruebas existentes. No sobrescribir instrucciones vigentes sin conservar su contenido útil.
- Capturar línea base funcional (pantallas, endpoints, contratos, roles, validaciones, exportaciones, informes y procesos). Clasificar: **CONSERVAR**, **ADAPTAR**, **PROPONER RETIRO**, **NUEVO NECESARIO**, **PENDIENTE**.
- Trabajar en rama dedicada; cambios pequeños, commits trazables, revisables y reversibles. No hacer merge, deploy, borrados ni escritura sobre producción sin autorización específica.
- No revelar datos sensibles en resultados de herramienta, commits, reportes, screenshots, auditoría o archivos de ejemplo. En `AUDITORIA.AUDI_VALOR_ANTERIOR/NUEVO`, eliminar secretos, hashes, códigos de impresión y datos personales innecesarios.
- Usar consultas parametrizadas, autorización del lado servidor, controles de sesión, gestión de secretos fuera del repositorio y privilegios mínimos.
- Proteger datos históricos y mantener trazabilidad entre ID antiguos y nuevos; preferir migraciones versionadas idempotentes cuando corresponda, transacciones seguras y una reversión probada.
- Nunca declarar una fase completada únicamente porque el código compila: exige evidencia técnica y funcional.

## 5. Plan obligatorio por fases

### FASE 0 — Inspección sin cambios
Leer los tres archivos de destino (incluidas las cuatro hojas del Excel) y el repositorio existente. Identificar tecnología real, conectividad, esquema actual, módulos, pantallas, reportes, contratos API, permisos, avances, integraciones, pruebas y dependencias. Generar `docs/migracion/00_DIAGNOSTICO.md`. **No modificar código ni datos. Aprobar antes de continuar.**

### FASE 1 — Validación documental y decisiones de diseño
Conciliar ER ↔ DER ↔ diccionario campo por campo (PK, FK, tipos, NULL, UQ, CHECK, cardinalidades). Revisar las decisiones pendientes de la sección 3. Crear `01_VALIDACION_MODELO.md` y `01_DECISIONES_PENDIENTES.md`, distinguiendo hechos documentados de propuestas. **No cambiar el esquema sin aprobación.**

### FASE 2 — Línea base funcional y matriz de trazabilidad
Relacionar cada **requisito → regla de negocio → tabla/campo → servicio/API → pantalla → prueba**. Mapear el modelo actual al nuevo e identificar impacto en roles, dashboards, formularios, consultas, historial, reportes PDF/Excel, búsqueda, filtros y permisos. Crear `02_MATRIZ_TRAZABILIDAD.md` y `02_MAPEO_ESQUEMAS.md`. **Aprobar antes de continuar.**

### FASE 3 — Diseño visual y de contratos (sin implementar)
Mostrar la propuesta de pantallas existentes y adaptadas: dashboard, catálogo de equipos, alta/edición por tipo y subtipo, funcionarios, asignación/traspaso, mantenciones, administración, seguridad, auditoría y reportes. Preservar identidad visual, componentes, accesibilidad y responsive para escritorio/iPad/iPhone. Presentar mockups o capturas reales **solo si existen herramientas y acceso**, marcando claramente qué es propuesta y qué es ejecución. Proponer cambios de contratos API compatibles o versionados. Crear `03_IMPACTO_FRONTEND_API.md`. **Pedir aprobación.**

### FASE 4 — Plan ETL y protección de datos
Utilizar `MAPEO_EXCEL` y `CALIDAD_DATOS` del diccionario como requisitos de migración. Crear plan de staging, transformaciones, deduplicación, excepciones, claves, idempotencia, respaldos verificables, restauración y rollback. **No ejecutar sobre datos productivos sin autorización.** Tratar como bloqueantes críticos:

- Observaciones con contraseñas, PIN y cuentas administrativas: **excluir de migración**; pedir rotación de credenciales mediante procedimiento seguro.
- Códigos de impresión en `FUNC_CLAVE_IMPRESION`: datos sensibles, proteger o reconsiderar su almacenamiento.
- 91 entradas de inventario PC SERVIU que contienen años, no códigos de inventario: **no usar como inventario**.
- Usuarios/funcionarios duplicados o contradictorios; no colapsar identidades por parecido de nombre.
- Notación científica/ceros perdidos en inventarios MINVU: no inventar dígitos irreconstruibles.
- Fechas faltantes o texto; respetar NULL histórico donde el diccionario lo permite.
- Valores mezclados para RAM/discos (`16(4)`, `512M.2`, `1TB M.2`): dejar ambiguos en cola de revisión, documentar unidad y conversión aprobada.
- Destinos sin funcionario responsable y ubicaciones mal normalizadas.
- Variantes de marca, tipo y departamento (`JURIDICO`/`JURIDICA`): normalizar solo con reglas aprobadas.

Crear `04_PLAN_ETL.md`, `04_EXCEPCIONES_DATOS.md`, y estrategia de pruebas de reconciliación. **Aprobar.**

### FASE 5 — Esquema y migraciones SQL Server
Crear scripts en `migrations/` respetando nombres, PK/FK, `IDENTITY`, `VARCHAR`, `DATETIME2`, `DECIMAL`, `BIT`, NULL, defaults, CHECK y claves compuestas del diccionario. Aplicar solo al entorno autorizado; verificar dependencias, integridad referencial y datos migrados. Registrar resultados, contadores, excepciones y rollback. **Aprobar.**

### FASE 6 — Adaptación de backend
Modificar entidades, ORM/repositorios, consultas, servicios, controladores, validaciones, transacciones y contratos de API. Mantener historial de movimientos, cierre de asignación anterior y apertura de nueva asignación en operaciones atómicas, con permisos de usuario aplicados en servidor. Generar pruebas unitarias e integración. **Aprobar.**

### FASE 7 — Adaptación visual e interacción
Reutilizar componentes y diseño válidos. Modificar pantallas, formularios, filtros, selectores, tablas, relaciones, detalle por tipo, historial, reportes y estados vacíos/error/carga de acuerdo al nuevo esquema. No rediseñar todo el frontend sin justificación y aprobación. Hacer pruebas visuales en tamaños de escritorio, tablet y móvil y documentar su ejecución real. **Aprobar.**

### FASE 8 — Seguridad, auditoría y regresión
Verificar autenticación real, relación funcionario/usuario, perfiles, autorizaciones, acceso por rol, protección de campos sensibles, transacciones, logs y auditoría. Comprobar pruebas unitarias, integración, API, migración, seguridad, regresión, UI y exportaciones PDF/Excel. Clasificar cada prueba: **APROBADA**, **FALLIDA**, **BLOQUEADA**, **NO EJECUTADA**. **Aprobar.**

### FASE 9 — Documentación y preparación de despliegue
Actualizar `AGENTS.md`, `FASES.md`, `ESTADO_PROYECTO.md`, `README.md`, `docs/` y `specs/` sin borrar información útil. Entregar: changelog, matrices, lista de compatibilidades, pendientes, guía de despliegue/rollback y evidencia de pruebas. **No desplegar ni fusionar ramas sin permiso explícito.**

## 6. Formato de cierre de cada fase

En cada etapa responde con:

1. **Fase, objetivo y estado**.
2. **Documentación y repositorio realmente revisados**.
3. **Hallazgos y discrepancias con evidencia/ubicación**.
4. **Elementos conservados y adaptados**.
5. **Archivos modificados (si corresponde)**.
6. **Pruebas ejecutadas, resultados y pruebas no ejecutadas**.
7. **Riesgos, bloqueantes y decisiones que requieren aprobación**.
8. **Recomendación y siguiente fase**.

Termina literalmente: **«¿Apruebas esta fase y autorizas comenzar la siguiente?»**

## 7. Instrucción inicial

**Inicia SOLO la FASE 0.** Verifica la presencia de los tres documentos y lee las cuatro hojas del diccionario. Audita el proyecto real. Explica la línea base, componentes a preservar y decisiones técnicas pendientes (especialmente ubicación física separada de funcionario, equipos compartidos y protección de secretos). Entrega el informe y **detente**. No modifiques ni migres datos, backend o frontend todavía.
