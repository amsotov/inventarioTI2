# Requisitos y criterios de aceptación iniciales

**Proyecto:** inventarioTI2
**Fase:** 1 — COMPLETADA; requisitos detallados aceptados por D-14.
**Fecha:** 2026-10-31

El alcance de Fase 0 y sus IDs se conservan. [CIERRE_FASE1.md](CIERRE_FASE1.md) es la resolución aprobada de A-01 a A-11 y P-01/P-02/P-04; completa [análisis](ANALISIS_EMPRESARIAL.md), [historias](HISTORIAS_USUARIO.md) y [trazabilidad](TRAZABILIDAD.md). Usuario aprueba recomendaciones con **UTC** y **respaldo semanal**. No hay funcionalidades implementadas; aceptación de requisitos y pruebas ejecutadas son distintas. Jurisdicción Chile, 250 funcionarios; bienes estimados 900–1.500, referencia 1.200. Validación legal de conservación: F1-SEG-01 antes de datos reales.

## Requisitos funcionales y backlog inicial
Todas las filas pertenecen al MVP aprobado en Fase 0. El orden es la prioridad inicial aceptada para planificación, con refinamiento posterior; no cambia las puertas de aprobación por fase.

| ID | Módulo / requisito | Criterio de aceptación vigente |
|---|---|---|
| RF-01 | Funcionarios: nombre, RUT/ID, cargo, unidad/departamento, correo y activo/inactivo; crear, editar, mover de unidad y dar de baja lógicamente. | Administrador gestiona identidad RUT/ID canónica y única; baja bloqueada mientras tenga bienes. Reactivar no restaura custodia; pertenencias históricas conservadas (A-01/A-03/A-05). |
| RF-02 | Bienes: tipo (notebook, PC, monitor, impresora, etc.), marca, modelo, serie, código de inventario, fecha de adquisición, condición y observaciones. | Código obligatorio y único; serie opcional con motivo si falta y única cuando existe. Comparar sin espacios exteriores y sin diferencia de mayúsculas; no reutilizar tras baja. Duplicados concurrentes sin escritura parcial (A-02). |
| RF-03 | Asignaciones: funcionario con varios bienes y bien con una sola asignación vigente; fecha de inicio y fin. | Asignar dos bienes al mismo funcionario es válido; dos asignaciones simultáneas del mismo bien se rechazan también bajo concurrencia. |
| RF-04 | Movimientos: asignación, devolución, traslado a otro funcionario, cambio de condición y baja. | Se conserva bien, origen/destino cuando corresponda, fecha, motivo y administrador responsable; la situación actual coincide con el historial. |
| RF-05 | Historial de movimientos inmutable. | No editar/borrar movimientos por cuentas de aplicación. Corregir con anotación inmutable vinculada y movimientos compensatorios admisibles, sin reescribir historia (A-04). |
| RF-06 | Buscador global con una sola barra para bienes y funcionarios. | Busca bienes por serie, código, marca, modelo, tipo y condición; funcionarios por nombre, RUT/ID, correo, cargo y unidad. La ficha del bien muestra asignación actual e historial; la del funcionario muestra bienes actuales y anteriores. |
| RF-07 | Filtros combinables: condición, tipo de bien, unidad, asignado/sin asignar y fechas. | Filtros combinados y exportación coherente. Días UTC con fin exclusivo del día siguiente; campo temporal y unidad actual/histórica definidos por consulta en A-05/A-06. |
| RF-08 | Dos roles: administrador y lectura. | Lectura consulta inventario e historial y exporta reportes permitidos; sus intentos de escritura se deniegan en servidor/base de datos, aunque evite la interfaz. |
| RF-09 | Gestión de cuentas solo por administrador: nombre, correo, rol, cambio de rol, desactivar/reactivar y forzar cambio de contraseña. | Sin autorregistro; invitación de un uso/24 h, MFA administrativo y revocación en siguiente operación protegida. Identidad de cuenta inactiva conservada (A-08). |
| RF-10 | Recuperar/restablecer contraseña mediante correo. | Enlace de un uso/30 min; nuevo enlace invalida anteriores; no reactiva cuentas inactivas ni expone contraseñas (A-08). |
| RF-11 | Proteger administradores y acciones críticas. | No es posible desactivar ni degradar al último administrador activo, tampoco concurrentemente; un administrador no cambia su propio rol y las acciones críticas requieren confirmación. |
| RF-12 | Bitácora de auditoría de cambios: quién, cuándo, entidad, acción y valores anterior/nuevo. | Crear, editar, baja y movimientos de bienes/funcionarios, cambios de cuentas/roles/activación y configuración generan registro protegido contra actualización/borrado por cuentas de aplicación; no se registran contraseñas ni tokens. |
| RF-13 | Consulta administrativa de auditoría con filtros por fecha, usuario, bien, funcionario y acción. | Administrador filtra y consulta; lectura no accede a auditoría ni la exporta. P-01 ratificada por D-14; fechas de registro UTC. |
| RF-14 | Destinatario de notificaciones configurable por administrador. | Un cambio autorizado del correo queda auditado y afecta notificaciones posteriores, sin modificar código; permisos de configuración se verifican fuera de la interfaz. |
| RF-15 | Correo automático ante cambios: qué cambió, quién lo hizo y cuándo. | Catálogo A-07 aprobado: cambios empresariales/cuentas/configuración según destinatarios y minimización. Registrar resultado; fallo no revierte operación. Tres reintentos transitorios a 1/5/15 min; resultado incierto requiere conciliación. No copiar recuperación al encargado. |
| RF-16 | Reportes: inventario general, bienes por funcionario, movimientos por fechas, bienes por condición y auditoría. | Cinco reportes y buscador en Excel/PDF conforme A-11; mismos filtros/permisos, columnas/orden definidos. Límites 10.000 filas Excel/2.000 PDF, sin truncado; auditoría solo administrador; vacío válido. |

## Permisos iniciales
| Acción | Administrador | Lectura |
|---|---|---|
| Buscar, ver inventario, funcionarios e historial | Sí | Sí |
| Exportar inventario e historial filtrados | Sí | Sí |
| Crear/editar/mover/dar de baja bienes y funcionarios | Sí | No |
| Asignar, devolver y trasladar bienes | Sí | No |
| Gestionar cuentas y destinatario | Sí | No |
| Consultar/exportar auditoría | Sí | No; P-01 ratificada por D-14 |
| Editar/borrar historial o auditoría | No | No |

## Requisitos no funcionales
| ID | Requisito | Validación futura propuesta |
|---|---|---|
| RNF-01 | Autorización efectiva en servidor y RLS en Supabase, validando rol real. | Pruebas negativas por rol y acceso directo; nunca confiar en controles visuales. |
| RNF-02 | Integridad y concurrencia. | Operaciones relacionadas sin estados parciales; unicidad y última cuenta administrativa protegidas bajo concurrencia. |
| RNF-03 | Trazabilidad temporal. | Fechas efectivas/registro diferenciadas; UTC por decisión del usuario. Movimientos al confirmar, sin retroactividad; intervalos inicio incluido/fin excluido (A-04/A-06). |
| RNF-04 | Privacidad y secretos. | Campos personales solo por acceso autorizado; secretos fuera de Git/correos/auditoría. Exportaciones ordinarias sin RUT/ID ni correo personal. Validación legal y plazo de conservación en F1-SEG-01 antes de datos reales. |
| RNF-05 | Responsive y accesibilidad. | Revisión de computador, iPad e iPhone en Fase 2; objetivo WCAG 2.2 AA, con evidencia de pruebas y límites explícitos. |
| RNF-06 | Portabilidad futura a SQL Server. | Separar reglas de negocio de adaptadores específicos; justificar dependencias de Supabase en Fase 3 sin prometer migración sin cambios. |
| RNF-07 | Operación y recuperación. | Objetivos A-09 aprobados: capacidad 3.000 bienes; búsqueda p95 ≤ 2 s, escritura ≤ 3 s; copia semanal, RPO ≤ 7 días (168 h), RTO ≤ 8 h, copias 30 días. Verificación de respaldo/restauración pendiente en fases futuras. |

## Orden propuesto del backlog del MVP
1. Consistencia de bienes, funcionarios, asignaciones y fechas (RF-01 a RF-05).
2. Seguridad transversal, cuentas y auditoría (RF-08 a RF-13; RNF-01 a RNF-04).
3. Búsqueda, fichas y filtros (RF-06 y RF-07).
4. Configuración y notificaciones (RF-14 y RF-15).
5. Reportes y exportaciones (RF-16).

Este orden expresa dependencias; no autoriza implementar ni adelantar fases.

## Modelo conceptual sugerido por el usuario
Entidades candidatas: `funcionarios`, `bienes`, `asignaciones`, `movimientos`, `auditoria`, `configuracion` y `usuarios` con rol. Las relaciones, tipos, tablas físicas, políticas RLS y migraciones corresponden a fases posteriores. Condición física y situación administrativa del bien deben representarse por separado. Funcionario y cuenta no son equivalentes.

## Dependencias de implementación
Consultar la matriz de decisiones en [DECISIONES.md](DECISIONES.md). No se han ejecutado pruebas de aplicación; este documento define comportamiento esperado.

## Fuente de Fase 0 y evolución de los requisitos

Los siguientes pendientes describen el estado heredado de Fase 0. D-14 y CIERRE_FASE1 los actualizan y resuelven para el análisis; los seguimientos futuros continúan explícitos.

Se preservan RF-01 a RF-16, RNF-01 a RNF-07 y su numeración del commit actualizado por el usuario `ea60377feb246ede15fef00d386bd022a3deaa94`. La revisión de GitHub solicitada en esta sesión aporta el detalle empresarial que no estaba en la plantilla inicial. No se excluyen correos ni reportes del MVP.

- **Alcance documentado por el usuario:** funcionarios y bienes; dos roles; unicidad y asignación vigente única; bajas lógicas; historial/auditoría; cuentas; correo configurable; Excel/PDF; orientación Supabase/RLS y portabilidad futura a SQL Server.
- **Planificación aceptada:** alcance y orden inicial P-03, por aprobación de Fase 0. **Interpretaciones por ratificar:** P-01, P-02 y P-04. En particular, no convertir «lectura puede ver todo» en acceso definitivo a auditoría sin ratificar P-01.
- **Detalles abiertos:** A-01 a A-11. No se han decidido formato obligatorio de identificadores, retroactividad, cortes históricos, eventos exactos de correo, retención, umbrales ni solución arquitectónica.
- La lectura de la guía `supabase` se limita a revisar la orientación documentada. No se han creado proyectos, conexiones, tablas, funciones, políticas RLS ni migraciones; no se ha escogido frontend ni proveedor de correo.

## Recorridos críticos para aceptación futura del MVP

Son los escenarios iniciales conservados de Fase 0, ahora desarrollados en HISTORIAS_USUARIO.md y TRAZABILIDAD.md. No son pruebas ejecutadas. Los detalles empresariales están resueltos por D-14; ejecución con datos sintéticos y seguimientos futuros aún pendientes.

1. **Inventariar y asignar:** administrador registra un funcionario y dos bienes, asigna ambos al funcionario y comprueba sus fichas e historial. Serie/código duplicados y segunda asignación vigente del mismo bien se rechazan sin cambios parciales, incluidas solicitudes concurrentes (RF-01 a RF-03; A-01/A-02).
2. **Mover y conservar historia:** trasladar un bien a otro funcionario, devolverlo y cambiar su condición; comprobar cronología y situación vigente en ambas fichas. La baja lógica conserva referencias; sus efectos sobre asignaciones y corrección de errores se prueban conforme A-03/A-04/A-05 (RF-04/RF-05).
3. **Consultar y exportar:** buscar por las claves de bienes y funcionarios, combinar y limpiar filtros, abrir fichas y exportar resultados. Los cinco reportes en Excel/PDF conservan filtros, columnas autorizadas y criterios de fechas acordados; sus datos concuerdan con la fuente (RF-06/RF-07/RF-16; A-06/A-11).
4. **Restringir y administrar:** lectura consulta y exporta lo autorizado, pero no escribe mediante interfaz ni acceso directo. Administrador gestiona cuentas sin cambiar su propio rol ni dejar el sistema sin administrador activo; probar concurrencia, desactivación y recuperación según A-08 (RF-08 a RF-11).
5. **Auditar y avisar:** cada evento contemplado tiene autor, fecha, entidad y cambio pertinente sin secretos. Cambiar destinatario afecta avisos posteriores y queda auditado. Probar envío simulado, fallo, reintento y duplicado según A-07; el acceso a auditoría sigue la ratificación de P-01 (RF-12 a RF-15).

## Plan de revisión de Fase 2 — referencia de planificación

1. Exigir autorización expresa de Fase 2 y requisitos aceptados de Fase 1. Volver a comprobar disponibilidad de `visual-system-designer` y usarlo si está disponible. La ruta `.agents/skills/visual-system-designer/SKILL.md` no existe en el árbol inspeccionado ni se encontró en los catálogos disponibles; no se instaló en Fase 0.
2. Construir un prototipo navegable con datos ficticios: listado y búsqueda global, fichas de bien/funcionario, formulario con errores y éxito, movimiento simulado, consulta de historial, cuentas y representación de auditoría/configuración/reportes. Las simulaciones deben ser identificables, sin backend ni datos reales por inferencia.
3. Facilitar acceso local comprobado y registrar ruta/comando de ejecución, capturas y observaciones. Mantener la prohibición de publicación.
4. Matriz de referencia propuesta: computador 1440×900, iPad 820×1180 e iPhone 390×844; revisar también orientaciones horizontales. Confirmar modelos/navegadores reales. La emulación no acredita pruebas en dispositivos reales ni compatibilidad completa con Safari.
5. Con Playwright si está disponible, verificar búsqueda, navegación entre fichas, filtros, validación de formulario, movimiento simulado, navegación por teclado y usabilidad responsive. Registrar comandos, resultados y límites de cobertura. Si no está disponible, informar y documentar la revisión manual efectuada; no afirmar pruebas no ejecutadas.
6. Registrar aceptación visual expresa en `docs/UX_UI.md`. **No iniciar Fase 3 sin otra aprobación expresa.** El prototipo no acredita persistencia, RLS, entrega de correos ni exportaciones funcionales salvo lo efectivamente simulado y verificado.

## Criterios de aceptación de Fase 0

| ID | Comprobación | Estado de entrega |
|---|---|---|
| CA0-01 | Leer instrucciones, inspeccionar Git y recuperar la actualización indicada por el usuario sin perder trabajo | Revisado; evidencia en `ESTADO_PROYECTO.md` |
| CA0-02 | Documentar visión, problema, actores, MVP completo, prioridades y exclusiones según la fuente actualizada | CUMPLIDO; aceptado por el usuario el 2026-10-30 |
| CA0-03 | Mantener RF-01 a RF-16 y RNF-01 a RNF-07, criterios iniciales y trazabilidad con módulos y decisiones | Documentado; no implica pruebas funcionales |
| CA0-04 | Registrar decisiones, interpretaciones, pendientes, riesgos, dependencias y responsables de revisión | Documentado; detalles de Fase 1 sin resolver por inferencia |
| CA0-05 | Preservar trabajo remoto y limitar cambios a documentación autorizada y regla permanente de GitHub en AGENTS.md; sin código, otra fase ni despliegue | CUMPLIDO; verificación documental registrada en `ESTADO_PROYECTO.md`; sincronización autorizada por el usuario |
| CA0-06 | Usuario acepta la entrega, alcance, prioridades y registro explícito de interpretaciones pendientes | CUMPLIDO el 2026-10-30: «todos los cambios del este proyecto inventarioTI2 deben actualizarse en github y aprueba esta fase»; Fase 0 COMPLETADA |

La aceptación del MVP o del prototipo y la autorización de una fase son decisiones distintas. Las futuras fases siguen pendientes en [../FASES.md](../FASES.md).

## Continuidad UX/UI

Fase 2 autorizada y entregada EN_REVISION: ver [UX_UI.md](UX_UI.md) y [PRUEBAS.md](PRUEBAS.md). El plan anterior se conserva como antecedente; skill disponible en [SKILL.md](../SKILL.md). Aceptación visual pendiente; Fase 3 no autorizada. Las pruebas del prototipo no acreditan los controles reales de estos requisitos.

### Cierre visual posterior

D-15 acepta la revisión visual de la entrega; Fase 2 COMPLETADA. La evidencia anterior conserva sus límites. Fase 3 AUTORIZADA para iniciar en un nuevo chat, ejecución pendiente; fases 4–15 no autorizadas. Este registro prevalece sobre las menciones históricas de revisión pendiente.
