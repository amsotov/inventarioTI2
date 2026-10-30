# Visión del producto

**Proyecto:** Inventario y control de bienes computacionales (inventarioTI2)
**Fecha:** 2026-10-30
**Estado:** EN_REVISION — propuesta de Fase 0; no es una implementación.

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

## MVP propuesto
1. Funcionarios y unidades: datos personales/laborales, estado activo/inactivo y baja lógica.
2. Bienes: identificación, características, adquisición, condición y observaciones.
3. Asignaciones y movimientos: asignación, devolución, traslado entre funcionarios, cambio de condición y baja.
4. Búsqueda global, ficha del bien y ficha del funcionario con historial por fechas.
5. Administración de cuentas, roles, recuperación y protecciones del último administrador.
6. Auditoría de cambios, configuración del destinatario y notificaciones.
7. Reportes de inventario, bienes por funcionario, movimientos, condición y auditoría; Excel y PDF.

Todos estos módulos forman parte del alcance solicitado. El orden de implementación propuesto está en REQUISITOS.md; no excluye módulos del MVP.

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
Definición detallada del usuario en el chat del 2026-10-30. Autorización: «Autorizo la fase 0 pero crealo en nuevo chat». Posteriormente solicitó «actualiza en github»; esta actualización conserva la continuidad en el repositorio. Solo la Fase 0 está autorizada; alcance y prioridades quedan para revisión antes de Fase 1.
