# Visión del producto

**Proyecto:** Inventario y control de bienes computacionales (inventarioTI2)
**Fecha:** 2026-10-30
**Estado:** FASE 0 COMPLETADA — visión y alcance inicial aprobados por el usuario el 2026-10-30; no es una implementación.

## Contexto y problema
Organización con funcionarios y equipos computacionales distribuidos entre unidades o áreas. Hoy falta un control centralizado de quién tiene cada equipo, desde cuándo y qué movimientos ha tenido. Esto dificulta auditorías, devoluciones y respaldo ante cambios.

## Objetivos y resultados esperados
- Consultar la asignación actual y el historial fechado de cada bien.
- Consultar los dispositivos actuales y anteriores de cada funcionario.
- Registrar movimientos con fecha, motivo y responsable, conservando la trazabilidad.
- Evitar duplicidad de series y códigos de inventario y asignaciones simultáneas del mismo bien.
- Distinguir condición física (bueno, regular, malo) de asignación y baja administrativa.
- Auditar cambios y notificar al encargado mediante correo configurable.
- Obtener reportes Excel y PDF sujetos a los mismos permisos y filtros de consulta.

## Actores y acceso
| Actor | Responsabilidad y acceso |
|---|---|
| Administrador | Gestiona funcionarios, bienes, asignaciones, movimientos, cuentas y configuración; consulta auditoría. |
| Usuario de lectura | Busca y consulta todo el inventario y su historial; exporta reportes autorizados; no modifica. |
| Funcionario | Persona que puede tener varios bienes; no implica una cuenta de acceso. |
| Encargado de bienes | Destinatario configurable de notificaciones; no implica un tercer rol. |

## MVP acordado en Fase 0
1. Funcionarios y unidades: datos personales/laborales, estado activo/inactivo y baja lógica.
2. Bienes: identificación, características, adquisición, condición y observaciones.
3. Asignaciones y movimientos: asignación, devolución, traslado entre funcionarios, cambio de condición y baja.
4. Búsqueda global, ficha del bien y ficha del funcionario con historial por fechas.
5. Administración de cuentas, roles, recuperación y protecciones del último administrador.
6. Auditoría de cambios, configuración del destinatario y notificaciones.
7. Reportes de inventario, bienes por funcionario, movimientos, condición y auditoría; Excel y PDF.

Todos estos módulos forman parte del alcance solicitado y aceptado en Fase 0. El orden inicial de implementación está en REQUISITOS.md; no excluye módulos del MVP y podrá refinarse en una Fase 1 autorizada.

## Límites
- Sin implementación, backend, datos reales ni despliegue en Fase 0.
- Sin autorregistro público ni eliminación física del historial.
- Sin descubrimiento automático de dispositivos; solo auditoría y notificaciones automáticas asociadas a cambios.
- Sin compras, gastos, cambios productivos ni instalación de Spec Kit por inferencia.
- Migrar a SQL Server es un objetivo futuro de portabilidad, no una entrega actual.
- Importación masiva, adjuntos, firma de actas, códigos QR, integración con directorio y funcionamiento sin conexión quedan fuera del alcance inicial propuesto, salvo aprobación posterior.

## Indicadores y criterios de éxito propuestos
A validar con el usuario; no son resultados medidos:
- Cero series/códigos duplicados y cero asignaciones vigentes múltiples por bien en pruebas de integridad, incluidas solicitudes concurrentes.
- Todos los cambios contemplados generan auditoría con actor, fecha y valores pertinentes, sin exponer secretos.
- Búsqueda por bien y funcionario muestra situación actual y cronología consistente en los escenarios de aceptación.
- Los cinco reportes y los resultados filtrados se exportan a Excel y PDF con autorización correcta.
- Cero escrituras permitidas al rol lectura y protección efectiva del último administrador activo.
- Prototipo de Fase 2 revisable en computador, iPad e iPhone y aprobado expresamente antes de Fase 3.
- Tiempo de búsqueda, volumen, disponibilidad, recuperación y entrega de correos: umbrales por acordar; no inventados.

## Fuente y aprobación
Definición detallada del usuario en el chat del 2026-10-30. Autorización histórica: «Autorizo la fase 0 pero crealo en nuevo chat»; después solicitó «actualiza en github». Tras revisar la entrega actual, indicó «todos los cambios del este proyecto inventarioTI2 deben actualizarse en github y aprueba esta fase». Se registran aceptación del alcance, prioridades y cierre de Fase 0, y sincronización permanente con GitHub. La Fase 1 sigue sin autorización.

### Actualización de fuente en esta sesión

La definición anterior se recibió a través del commit del usuario `ea60377feb246ede15fef00d386bd022a3deaa94` (`docs: documentar alcance y autorización de Fase 0`), recuperado tras su indicación de revisar GitHub nuevamente el 2026-10-30. Las citas del apartado anterior son el registro heredado de ese commit; no se atribuyen a mensajes nuevos de esta sesión.

La instrucción inicial limitaba el trabajo a Fase 0 y prohibía publicar. El mensaje posterior aprueba esta fase y autoriza mantener todos los cambios del proyecto en GitHub; esta autorización sustituye la restricción anterior de entrega únicamente local. Continúan sin autorización el despliegue del sitio, los datos reales y las fases siguientes. La definición detallada del sistema ya está disponible.

## Módulos, prioridades y dependencias del MVP

Todos los módulos siguientes pertenecen al MVP aceptado. La prioridad expresa el orden inicial de trabajo futuro, sin excluir módulos ni autorizar su implementación. Las pruebas de integridad, permisos y auditoría acompañarán cada incremento desde el primer cambio.

| Módulo | Valor de negocio y cobertura | Orden propuesto / dependencia |
|---|---|---|
| M01 — Funcionarios y unidades | Identificar responsables y conservar su historia; RF-01 | Grupo 1: identidad y pertenencia antes de asignar |
| M02 — Bienes | Identificar equipos sin duplicar serie/código y separar condición de situación administrativa; RF-02 | Grupo 1: reglas de identidad por precisar en A-02 |
| M03 — Asignaciones y movimientos | Custodia vigente y trazabilidad fechada por bien y funcionario; RF-03 a RF-05 | Grupo 1: depende de funcionarios, bienes y reglas temporales A-03 a A-06 |
| M04 — Buscador, fichas y filtros | Localizar bienes y funcionarios y reconstruir su relación histórica; RF-06 y RF-07 | Grupo 3: datos y permisos consistentes |
| M05 — Cuentas y acceso | Administración y lectura, recuperación y protección del último administrador; RF-08 a RF-11 | Grupo 2 y transversal: necesario antes de exponer cualquier operación real |
| M06 — Auditoría, configuración y correo | Evidencia de cambios y aviso al encargado configurable; RF-12 a RF-15 | Auditoría transversal en grupo 2; configuración/correo en grupo 4, con A-07 resuelta |
| M07 — Reportes y exportación | Cinco reportes y resultados filtrados en Excel/PDF; RF-16 | Grupo 5: depende de búsquedas, definición temporal y permisos; es obligatorio en el MVP |

## Medición y restricciones por acordar

- Comprobar integridad y concurrencia con casos de resultado conocido: altas duplicadas, doble asignación y acciones sobre el último administrador. Meta propuesta: cero inconsistencias en esos escenarios.
- Medir cobertura de auditoría como cambios previstos con evento completo dividido por cambios previstos ejecutados. Meta propuesta: 100 % en la muestra de aceptación, sin contraseñas ni tokens.
- Comparar conteos, columnas y filtros de cada uno de los cinco reportes y sus dos formatos con un conjunto de datos sintéticos conocido, según permisos acordados.
- Medir tiempo de búsqueda hasta abrir la ficha correcta y tiempo de entrega de correos; acordar volumen, concurrencia, red, percentiles, umbrales y tratamiento de fallos en A-07/A-09. No hay línea base ni resultados medidos.
- Validar modelos y navegadores concretos de computador, iPad e iPhone en Fase 2; no confundir emulación con prueba en hardware real.
- Sector específico, presupuesto, jurisdicción, retención y operación siguen abiertos en A-09/A-10; no se infieren por el uso de RUT o por la ubicación del usuario.

## Aprobación de Fase 0 y pendientes posteriores

El usuario aprobó el alcance, el orden inicial del MVP y la entrega documental de Fase 0 el 2026-10-30. P-03 queda aceptada como planificación inicial. Las interpretaciones P-01, P-02 y P-04 y los detalles A-01 a A-11 se conservan para ratificación o desarrollo en sus fases; la aprobación de la planificación no inventa respuestas a esas preguntas.

Los criterios CA0-01 a CA0-06 y el plan de revisión futura del prototipo están en [REQUISITOS.md](REQUISITOS.md). Las decisiones y riesgos están en [DECISIONES.md](DECISIONES.md), y la aceptación y autorización en [../FASES.md](../FASES.md). Fase 0 COMPLETADA; no iniciar otra fase sin autorización expresa independiente.
