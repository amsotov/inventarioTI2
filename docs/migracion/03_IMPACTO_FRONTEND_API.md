# FASE 3 — Impacto frontend y API

> Continuidad: usuario acepta Fase 3 por «apruebo fase 3 inicia fase 4». Fase 3 COMPLETADA; el informe/capturas siguientes conservan la entrega original. Las condiciones de datos/opciones siguen vigentes. Estado actual en [FASES](../../FASES.md) y [Fase 4](04_PLAN_ETL.md).

Fecha: 2026-11-03. Estado: **EN_REVISION**. Base: `b29d60cd1fe0acfa02a77e3d69c1a8becedd7052`.

## Autorización y alcance

Usuario: «apruebo fase 2 inicia fase 3». Se acepta/cierra Fase 2 y autoriza únicamente diseño visual/de contratos. No se implementan adaptadores, endpoints, cambios de aplicaciones, esquema, ETL, identidad ni envíos. Fase 4 NO AUTORIZADA. Continúa sincronización GitHub por rama dedicada, sin merge/despliegue.

Se aplica [visual-system-designer](../../SKILL.md) al diseño autorizado de migración (Fase 3); su número histórico de fase no altera el alcance vigente. Se crea una maqueta HTML/CSS/JS aislada bajo docs/migracion, con muestras ficticias y sin API/persistencia. Es artefacto de diseño, no modificación del frontend React. La aprobación de Fase 2 no elige automáticamente alternativas M1-D ni resuelve datos que requieren perfilado.

## Documentos y prototipo revisables

- [Diseño visual y capturas](03_DISENO_VISUAL.md), [mapa de pantallas](03_PANTALLAS.csv).
- [Compatibilidad de las 49 rutas existentes](03_COMPATIBILIDAD_API.csv).
- [Contratos v2 propuestos y ejemplos sintéticos](03_CONTRATOS_PROPUESTOS.json): registro de diseño con JSON Schema, no OpenAPI de aplicación ni implementación.
- [Cobertura de los 117 campos UI/API](03_CAMPOS_UI_API.csv), separando campos excluidos, administrativos y de consulta.
- [Maqueta navegable](prototipo-fase3/index.html), [ensayo de navegador](evidencias/fase3/navegador.json) y [verificación documental](evidencias/fase3/verificacion.json).

## Navegación y conservación funcional

Se conserva el lenguaje visual actual (system-ui 14, texto #20323c, fondo #f4f6f7, verde #08766b, lateral #152c35, tarjetas/tablas/formularios). base.css es copia idéntica del CSS actual; ajustes de la maqueta están separados. La interfaz real mantiene sus rutas; los fragmentos de la maqueta organizan una propuesta y no se sustituyen en React.

| Vista | Tratamiento | Requisitos / condición |
|---|---|---|
| Resumen | ADAPTAR | RF-06;RF-16. Métricas actuales desde fuente; separar condición, situación y custodia. M1-D07;M1-D13 |
| Catálogo de equipos | ADAPTAR | RF-02;RF-06;RF-07. Búsqueda, filtros, tablas desplazables y ficha; administración ofrece alta. M1-D06;M1-D09;M1-D10;M1-D13 |
| Ficha e historial por tipo | ADAPTAR | RF-02;RF-04;RF-05. Datos comunes + técnico aplicable + piezas/insumos + historia inmutable. M1-D07;M1-D08;M1-D10 |
| Alta de equipo por tipo | ADAPTAR | RF-02. Modelo filtrado por marca; el backend deriva marca del modelo, sin duplicarla en EQUIPOS. Periférico simple sin subtipo. M1-D06;M1-D10;M1-D14;M1-D15 |
| Funcionarios y pertenencias | ADAPTAR | RF-01;RF-06. Conservar RUT/ID/cargo y unidad histórica; cuenta vinculada solo tras validación. M1-D03;M1-D04;M1-D08 |
| Asignación, devolución y traspaso | ADAPTAR | RF-03;RF-04;RF-05. Muchos equipos por funcionario, un vigente por equipo; motivo, confirmación y origen esperado; fecha operativa del servidor. M1-D05;M1-D07;M1-D08;M1-D13 |
| Historial y alta de mantenciones | NUEVO_NECESARIO | RF-02;RF-05. Equipo/actividad/fecha/observación; ampliación propuesta sin observaciones con secretos. M1-D10;M1-D12;M1-D16 |
| Administración y seguimiento de avisos | ADAPTAR | RF-09;RF-11;RF-14;RF-15. Cuentas pendientes, propio rol/último administrador, catálogos y destinatario; incierto requiere evidencia. M1-D02;M1-D03;M1-D09;M1-D11;M1-D12 |
| Acceso, perfiles y permisos | CONSERVAR | RF-08;RF-09;RF-10;RF-11. Conservar Supabase Auth como alternativa recomendada, sesión opaca/MFA/recuperación; combinación de perfiles pendiente. M1-D02;M1-D11 |
| Auditoría administrativa | ADAPTAR | RF-12;RF-13. Filtros de registro/actor/entidad/acción, evidencia minimizada; sin editar ni borrar. M1-D07;M1-D08;M1-D12 |
| Reportes y buscador | ADAPTAR | RF-06;RF-07;RF-13;RF-16. Cinco reportes y búsqueda separada; filtros/columnas A-11, UTC, propietario, TTL y límites XLSX/PDF. M1-D07;M1-D09;M1-D12;M1-D15 |

La ruta crítica propuesta es resumen → equipos → filtros/ficha → movimiento con origen esperado/motivo/confirmación → historia. Ruta técnica: alta → tipo/modelo → detalle aplicable → piezas/insumos como filas. Ruta persona: funcionario → edición administrativa/pertenencia → bienes actuales/historia. Cuentas, auditoría y seguimiento conservan acceso administrativo; lectura puede consultar inventario/historia y reportes ordinarios.

## Compatibilidad de API

Se conservan los **45 pares método/ruta v1** y cuatro rutas auxiliares de Fase 2. Ninguna respuesta, campo, referencia UUID, código de error, permiso, paginación, ETag o semántica de PATCH existente cambia por esta entrega. SQL Server es adaptación interna posterior. En particular, alta/edición de bienes v1 no recibe por inferencia el confirmado del panel; los nuevos comandos v2 sí lo proponen.

Nuevas capacidades: 18 contratos versionados bajo /api/v2 para catálogos, equipos, técnica, movimientos/historia, mantenciones, funcionarios/edición/pertenencias, perfiles y organización. Reportes, exportaciones, auditoría y acceso siguen en v1; se adaptan selecciones internas en fases posteriores preservando A-11. No se crea v2 por cada tabla ni endpoint SQL genérico.

Las referencias públicas siguen siendo UUID opacos, con correspondencia durable a PK INT del modelo. Nunca sustituir una referencia v1 por un INT ni aceptar FK interna del cliente sin resolver catálogo/autorización. La marca la determina el modelo; seleccionar marca en UI solo filtra modelos, no añade marca a EQUIPOS.

Consultas v2: parámetros tipados, allowlist por recurso y cursor ligado a filtros/orden/versión del contrato; default 50/máximo 100 en listas, hasta 100 por colección histórica. Cursores v1 no se reutilizan como v2. La selección temporal conserva el campo de negocio por consulta, UTC e intervalo [desde, día siguiente a hasta). Ni las páginas ni un filtro de inventario reconstruyen automáticamente un corte histórico.

## Escrituras, conflictos y privacidad

Comandos v2: Origin y CSRF, Idempotency-Key; existentes además If-Match. La cuenta/rol/MFA se revalidan antes de replay; clave igual con carga diferente →409, versión obsoleta →412, versión requerida ausente →428, regla empresarial →422. Actor/fechas/versión/situación/custodia no se toman de campos arbitrarios. Las fechas de mantención representan actividad declarada, distintas del instante de registro del servidor.

PATCH de atributos mantiene representación completa y limpieza explícita de opcionales según contrato; no es JSON Merge Patch. Técnica es operación separada versionada: no transforma silenciosamente tipo/subtipo ni borra piezas/insumos omitidos. Cambio de tipo con datos técnicos incompatibles debe bloquearse para resolución aprobada, no eliminar filas. El alta de datos comunes no se presenta como alta técnica completa atómica: si se exige esa experiencia, se debe aprobar comando agregado antes de implementar; la maqueta ilustra validación conjunta, no promete atomicidad de dos solicitudes.

Guardar operación debe confirmar estado + historia + auditoría + resultado idempotente + outbox en una transacción. Fallo de correo posterior no revierte negocio. Último administrador, propio rol y combinación de perfiles requieren validación transaccional y revocación. Un permiso de consulta no autoriza DML directo.

Listados ordinarios de personas no incorporan RUT/correo. Edición administrativa se mantiene en contrato separado. USUA_CLAVE_HASH y FUNC_CLAVE_IMPRESION quedan fuera de DTO y maqueta; su diseño de almacenamiento no se resuelve por dibujar una pantalla. Auditoría/observaciones/exports minimizadas; ni mensajes de error ni documentación contienen credenciales reales.

## Brechas y decisiones que no se resuelven al diseñar

Ubicación física independiente y custodia institucional no se añaden como campos operativos: A-05 anterior no contemplaba ubicación separada y ASIG exige funcionario. La maqueta informa la necesidad de definición sin crear personas ficticias. Homologación de código a inventarios, UQ, fechas históricas, precisión UTC, baja final, vínculo cuenta/persona, Auth externo y longitudes conservan M1-D01–M1-D16. No se inventan datos para que un formulario parezca completo.

Los JSON Schema ilustran el contrato propuesto y rangos representables del destino, con validaciones nuevas sujetas a M1-D14/M1-D15. No sustituyen perfilado ni expresiones CHECK aprobadas. Cadenas heredadas de hasta 2000 caracteres no se truncan al VARCHAR objetivo; se bloquea implementación hasta acordar conservación/extensión o rechazo explícito compatible. Inicio histórico desconocido puede ser null con precisionTemporal dia/fechaOrigen; no se convierte en medianoche ficticia. Nuevos movimientos siempre reciben instante del servidor.

## Criterios de salida y verificación

Revisión inicial: el verificador documental detectó que la ficha visual no declaraba literalmente el estado de Fase 4; se añadió NO AUTORIZADA. Las comprobaciones de maqueta y contratos se distinguen de la aplicación real.

CA-M3-01: 11 vistas con ambos perfiles y navegación/estados, diseño conservado. CA-M3-02: contratos de las 49 rutas actuales preservados, 18 propuestas v2 y cobertura de 117 campos. CA-M3-03: revisión responsive 1440/768/390 y capturas reales de la maqueta, sin afirmación de dispositivos físicos. CA-M3-04: compatibilidad, seguridad, pendientes y límites documentados; aplicación/fuentes originales conservadas. CA-M3-05: evidencia documental y GitHub verificables. CA-M3-06: aceptación visual/contractual por usuario **PENDIENTE**.

Reproducción de navegador: Python Playwright y Chromium instalados; ejecutar `python3 docs/migracion/evidencias/fase3/verificar_prototipo.py`. El script sirve únicamente archivos de maqueta en loopback y prueba datos sintéticos; escribe capturas/evidencia de esta fase. No usa la API de aplicación ni SQL. Comprobación documental: `python3 docs/migracion/verificar_fase3.py` (requiere Python 3 y la biblioteca jsonschema instalada en el entorno de ensayo).

Verificaciones funcionales de React, SQL Server/PostgreSQL, ETL, identidad/MFA reales, exportaciones reales, correo y servicios gestionados: **NO EJECUTADAS**. El selector de rol y las validaciones ilustrativas no acreditan RBAC real. Auditoría WCAG integral, Safari/hardware/lector de pantalla: NO EJECUTADOS. Siguiente propuesta: Fase 4 plan ETL/protección de datos, solo con autorización nueva.
