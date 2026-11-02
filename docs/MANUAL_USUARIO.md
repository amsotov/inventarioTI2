# Manual de usuario

**Estado:** PLANTILLA — contenido pendiente de definición y aprobación.

## Información a documentar
Perfiles, ingreso, navegación, tareas frecuentes, errores conocidos, procedimientos y ayuda.

## Hallazgos confirmados
- Pendiente.

## Pendientes y decisiones abiertas
- Pendiente.

## Evidencias y referencias
- No hay evidencia todavía.


## Procesos disponibles — Fase 10

En Funcionarios, el administrador puede crear una persona con RUT válido o ID institucional, nombre, cargo y unidad activa. El correo es opcional; no se crea una cuenta de acceso. Abre su ficha para editar identidad/atributos, cambiar unidad, inactivar o reactivar. Copia su referencia desde la ficha/listado para usarla como destino de custodia. Cambiar unidad conserva sus bienes; la historia conserva nombres anteriores de unidad.

Desde la ficha de un bien, selecciona asignacion, devolucion, traslado, condicion, baja o reactivacion. Indica destino cuando corresponde; devolución/traslado requieren la referencia del custodio actual. Revisa motivo y confirmación antes de guardar; Cancelar proceso no persiste. Malo no cierra custodia automáticamente; devuelve explícitamente antes de baja. No se permite inactivar funcionarios con bienes vigentes.

La sección Procesos e historia muestra custodias, movimientos, pertenencias y anotaciones en UTC; Más permite continuar cada colección. Para corregir, usa Anotar corrección con el ID del movimiento original y motivo. Si cambia la situación actual, realiza movimientos ordinarios válidos indicando el movimiento que compensan. Nunca se edita la historia original ni se retrotraen fechas.

Ante conflicto de versión, recarga y revisa antes de decidir de nuevo. Ante resultado incierto, conserva la página y usa Reintentar proceso: repite la misma solicitud, sin duplicar efectos. Si abandonas la página o sesión, concilia con el responsable antes de crear otro comando. Ningún aviso pendiente equivale a correo enviado. Ver [alcance y límites](PROCESOS_EMPRESARIALES.md).


## Resumen y reportes — Fase 11

1. Inicia sesión; el administrador completa MFA. En **Resumen**, consulta registrados, asignados, disponibles, funcionarios activos, condición física y últimos movimientos. Cada cálculo muestra instante UTC; disponibles significa activo/sin custodia/bueno o regular.
2. En **Reportes y buscador**, elige inventario general, bienes por funcionario, movimientos, bienes por condición o buscador combinado. Auditoría aparece solo para administración. Aplica texto, filtros y días UTC; adquisición en inventario/condición/bienes de búsqueda, alta en funcionarios de búsqueda, inicio de custodia por funcionario, fecha efectiva en movimientos y registro en auditoría. Unidad histórica filtra cualquiera de los extremos de movimientos; inventario usa unidad actual del custodio.
3. Consulta totales/subtotales y avanza páginas. En buscador, bienes y funcionarios se separan; filtros específicos de bienes solo afectan a bienes. Sin custodia no se asigna una unidad ficticia.
4. **Exportar Excel/PDF** usa todos los resultados del filtro aplicado, aunque haya varias páginas. Límite exacto 10.000 Excel o 2.000 PDF, sumando conjuntos en buscador. Si excede, acota filtros; no se trunca. Cero resultados produce archivo válido con cabeceras/metadatos.
5. Espera estado listo y **Descargar archivo privado**. Guarda la referencia para recuperarlo tras recargar; dura una hora y requiere tu cuenta/permisos vigentes. Otra cuenta no puede abrirlo. Si hay respuesta perdida, conserva la vista y usa **Reintentar misma solicitud**. Para fallo final o archivo caducado, solicita una exportación nueva. Los archivos incluyen instante UTC y filtros; nuevas consultas pueden reflejar cambios posteriores.

No se genera un inventario reconstruido a una fecha pasada ni se envía correo por exportar. Alcance, privacidad y límites en [REPORTES](REPORTES.md).
