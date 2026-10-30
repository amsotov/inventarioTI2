# Requisitos y criterios de aceptación iniciales

**Proyecto:** inventarioTI2
**Fase:** 0 — EN_REVISION
**Fecha:** 2026-10-30

Este catálogo recoge los requisitos del usuario y criterios propuestos para validación posterior. No constituye análisis detallado de Fase 1 ni evidencia de funcionalidades implementadas.

## Requisitos funcionales y backlog inicial
Todas las filas pertenecen al MVP. El orden es una prioridad técnica propuesta, pendiente de revisión; no cambia las puertas de aprobación por fase.

| ID | Módulo / requisito | Criterio de aceptación propuesto |
|---|---|---|
| RF-01 | Funcionarios: nombre, RUT/ID, cargo, unidad/departamento, correo y activo/inactivo; crear, editar, mover de unidad y dar de baja lógicamente. | El administrador gestiona los datos; la baja conserva referencias e historial. El tratamiento de bienes aún asignados se define antes de implementar. |
| RF-02 | Bienes: tipo (notebook, PC, monitor, impresora, etc.), marca, modelo, serie, código de inventario, fecha de adquisición, condición y observaciones. | Serie y código son únicos; se rechaza un duplicado sin escritura parcial. Normalización, obligatoriedad y datos heredados quedan por precisar. |
| RF-03 | Asignaciones: funcionario con varios bienes y bien con una sola asignación vigente; fecha de inicio y fin. | Asignar dos bienes al mismo funcionario es válido; dos asignaciones simultáneas del mismo bien se rechazan también bajo concurrencia. |
| RF-04 | Movimientos: asignación, devolución, traslado a otro funcionario, cambio de condición y baja. | Se conserva bien, origen/destino cuando corresponda, fecha, motivo y administrador responsable; la situación actual coincide con el historial. |
| RF-05 | Historial de movimientos inmutable. | No hay edición ni borrado por las cuentas de la aplicación. La forma de corregir un error sin perder evidencia queda pendiente. |
| RF-06 | Buscador global con una sola barra para bienes y funcionarios. | Busca bienes por serie, código, marca, modelo, tipo y condición; funcionarios por nombre, RUT/ID, correo, cargo y unidad. La ficha del bien muestra asignación actual e historial; la del funcionario muestra bienes actuales y anteriores. |
| RF-07 | Filtros combinables: condición, tipo de bien, unidad, asignado/sin asignar y fechas. | Los filtros se combinan y se conservan en las exportaciones; el significado del rango de fechas y de la unidad histórica queda por acordar. |
| RF-08 | Dos roles: administrador y lectura. | Lectura consulta inventario e historial y exporta reportes permitidos; sus intentos de escritura se deniegan en servidor/base de datos, aunque evite la interfaz. |
| RF-09 | Gestión de cuentas solo por administrador: nombre, correo, rol, cambio de rol, desactivar/reactivar y forzar cambio de contraseña. | No existe autorregistro público; se conserva identidad histórica de cuentas desactivadas; se verifica revocación de acceso. |
| RF-10 | Recuperar/restablecer contraseña mediante correo. | El proceso usa enlaces temporales y de uso limitado sin exponer contraseñas; caducidad y experiencia de invitación por definir. |
| RF-11 | Proteger administradores y acciones críticas. | No es posible desactivar ni degradar al último administrador activo, tampoco concurrentemente; un administrador no cambia su propio rol y las acciones críticas requieren confirmación. |
| RF-12 | Bitácora de auditoría de cambios: quién, cuándo, entidad, acción y valores anterior/nuevo. | Crear, editar, baja y movimientos de bienes/funcionarios, cambios de cuentas/roles/activación y configuración generan registro protegido contra actualización/borrado por cuentas de aplicación; no se registran contraseñas ni tokens. |
| RF-13 | Consulta administrativa de auditoría con filtros por fecha, usuario, bien, funcionario y acción. | El administrador puede filtrar y consultar registros; lectura no obtiene auditoría según interpretación inicial de la matriz del usuario, pendiente de ratificación. |
| RF-14 | Destinatario de notificaciones configurable por administrador. | Un cambio autorizado del correo queda auditado y afecta notificaciones posteriores, sin modificar código; permisos de configuración se verifican fuera de la interfaz. |
| RF-15 | Correo automático ante cambios: qué cambió, quién lo hizo y cuándo. | Se registra el resultado del envío y se comprueba el destinatario vigente. Alcance de eventos, reintentos, duplicados, fallos y cambio del destinatario se deciden antes de implementar. Los cambios de cuentas deben auditarse; su notificación se confirma expresamente. |
| RF-16 | Reportes: inventario general, bienes por funcionario, movimientos por fechas, bienes por condición y auditoría. | Excel y PDF contienen los datos y filtros solicitados y respetan permisos; auditoría restringida según RF-13. También se exportan resultados del buscador. |

## Permisos iniciales
| Acción | Administrador | Lectura |
|---|---|---|
| Buscar, ver inventario, funcionarios e historial | Sí | Sí |
| Exportar inventario e historial filtrados | Sí | Sí |
| Crear/editar/mover/dar de baja bienes y funcionarios | Sí | No |
| Asignar, devolver y trasladar bienes | Sí | No |
| Gestionar cuentas y destinatario | Sí | No |
| Consultar/exportar auditoría | Sí | No, interpretación pendiente de ratificación |
| Editar/borrar historial o auditoría | No | No |

## Requisitos no funcionales
| ID | Requisito | Validación futura propuesta |
|---|---|---|
| RNF-01 | Autorización efectiva en servidor y RLS en Supabase, validando rol real. | Pruebas negativas por rol y acceso directo; nunca confiar en controles visuales. |
| RNF-02 | Integridad y concurrencia. | Operaciones relacionadas sin estados parciales; unicidad y última cuenta administrativa protegidas bajo concurrencia. |
| RNF-03 | Trazabilidad temporal. | Diferenciar fecha efectiva del movimiento de fecha de registro; zona horaria de negocio y retroactividad por confirmar. |
| RNF-04 | Privacidad y secretos. | RUT/ID, correos y auditoría solo accesibles por usuarios autorizados; secretos fuera del repositorio y reportes/correos sin credenciales. Retención y normativa por validar. |
| RNF-05 | Responsive y accesibilidad. | Revisión de computador, iPad e iPhone en Fase 2; objetivo WCAG 2.2 AA, con evidencia de pruebas y límites explícitos. |
| RNF-06 | Portabilidad futura a SQL Server. | Separar reglas de negocio de adaptadores específicos; justificar dependencias de Supabase en Fase 3 sin prometer migración sin cambios. |
| RNF-07 | Operación y recuperación. | Definir volúmenes, disponibilidad, respaldos, restauración, retención, desempeño y tratamiento de fallos de correo antes de verificar umbrales. |

## Orden propuesto del backlog del MVP
1. Consistencia de bienes, funcionarios, asignaciones y fechas (RF-01 a RF-05).
2. Seguridad transversal, cuentas y auditoría (RF-08 a RF-13; RNF-01 a RNF-04).
3. Búsqueda, fichas y filtros (RF-06 y RF-07).
4. Configuración y notificaciones (RF-14 y RF-15).
5. Reportes y exportaciones (RF-16).

Este orden expresa dependencias; no autoriza implementar ni adelantar fases.

## Modelo conceptual sugerido por el usuario
Entidades candidatas: `funcionarios`, `bienes`, `asignaciones`, `movimientos`, `auditoria`, `configuracion` y `usuarios` con rol. Las relaciones, tipos, tablas físicas, políticas RLS y migraciones corresponden a fases posteriores. Condición física y situación administrativa del bien deben representarse por separado. Funcionario y cuenta no son equivalentes.

## Pendientes antes de detallar o implementar
Consultar la matriz de decisiones en [DECISIONES.md](DECISIONES.md). No se han ejecutado pruebas de aplicación; este documento define comportamiento esperado.
