# Manual de usuario

2026-11-02 · Manual consolidado para Fase 15 **EN_REVISION**. Describe funcionalidades implementadas en las entregas aceptadas hasta Fase 14. No acredita puesta en producción ni capacitación realizada. [Capacitación propuesta](CAPACITACION.md) · [Soporte](SOPORTE_MANTENIMIENTO.md) · [Estado vigente](../ESTADO_PROYECTO.md).

## Perfiles y conceptos

| Perfil / concepto | Alcance |
|---|---|
| Lectura | Consultar inventario compartido, funcionarios, unidades, movimientos/historia, resumen y reportes ordinarios; exportar sus propios archivos autorizados |
| Administrador | Funciones de lectura, alta/edición/procesos y panel de cuentas/unidades/parámetros; auditoría y seguimiento de avisos. Requiere MFA vigente |
| Funcionario / cuenta | Funcionario es quien tiene bienes; cuenta es quien accede. Registrar una persona no crea acceso |
| Situación / condición / custodia | Activo o baja; bueno/regular/malo; responsable actual. Son conceptos independientes: malo no devuelve ni da de baja automáticamente |

No hay autorregistro, cuenta por defecto ni credenciales demo para el sistema funcional. El prototipo visual separado usa simulaciones; no sirve para gestionar inventario real. Fechas e historia se muestran en **UTC**, aunque el equipo tenga otra zona horaria.

## Ingreso, recuperación y salida

1. Abrir la dirección HTTPS aprobada para el ambiente; no hay URL productiva habilitada en esta entrega. Introducir Correo y Contraseña de la cuenta habilitada y elegir **Iniciar sesión**.
2. Administración debe completar **Verificación de administrador**. Si no tiene factor verificado, **Configurar autenticador**, guardar la clave solo en su autenticador y verificar el código de seis dígitos. Nunca compartir clave/código en capturas, correo o soporte. Si ya existe factor, seleccionarlo y verificar. Perder MFA requiere soporte con identidad verificada; no existe bypass ni recuperación autoservicio de factor verificado.
3. Para recuperar acceso, completar Correo de recuperación → **Solicitar enlace**. La respuesta es genérica: no demuestra existencia de cuenta ni envío. Si se ha entregado un enlace válido por un canal autorizado, abrirlo y confirmar la nueva contraseña (12–128 caracteres); después iniciar sesión otra vez. Invitación vence a 24 h, recuperación a 30 min y un enlace nuevo invalida el previo. El correo real está deshabilitado/no acreditado en esta entrega; contactar al responsable designado si no llega, sin repetir solicitudes continuamente.
4. La sesión vence a 30 min de inactividad o 8 h absolutas; una sesión administrativa parcial sin completar MFA vence a 10 min. **Continuar sesión** registra actividad explícita; consultas y polling no mantienen la sesión indefinidamente. Cuenta desactivada, permisos cambiados o revocación pueden terminar acceso antes.
5. Elegir **Cerrar sesión** al terminar. Antes de salir con una escritura incierta, conservar referencias y conciliar su resultado; no crear otra solicitud por haber perdido la sesión.

## Navegación, consultas y estados

Usar Resumen, Bienes, Funcionarios, Unidades, Movimientos y Reportes y buscador; Administración aparece solo con permiso. En las listas, aplicar texto/filtros, abrir ficha y continuar con la paginación disponible. La consulta ordinaria no revela documento/correo de funcionarios; su edición está restringida al administrador. Movimientos puede filtrarse por referencia del bien. Las tablas se desplazan horizontalmente en pantallas pequeñas; usar Tab/Shift+Tab y **Saltar al contenido** para navegación de teclado.

Esperar el estado de carga; vacío significa que no hay coincidencias, no que se hayan borrado datos. Ante error leer mensaje/Referencia y volver a consultar solo cuando sea seguro. La autorización se comprueba también en el servidor: cambiar URL no concede permisos.

## Registrar o editar un bien — administración

En Bienes elegir **Nuevo bien**. Completar Código, Tipo, Marca, Modelo, Serie o Motivo de ausencia de serie, adquisición si corresponde, condición inicial y observaciones; indicar Motivo del cambio y **Guardar bien**. Revisar datos y motivo antes de guardar: este formulario registra al enviarlo, sin un segundo diálogo de confirmación. Código/serie e identidad deben cumplir unicidad/reglas; no crear duplicados para sortear un rechazo.

Desde la ficha, **Editar atributos** modifica los datos descriptivos con motivo y versión actual; no cambia condición, situación ni custodia. Esos cambios se hacen en Procesos e historia. Volver antes de guardar no registra una operación nueva; si hay resultado incierto, resolverlo antes de abandonar. El registro confirmado conserva auditoría y aviso pendiente en la misma transacción; no implica correo enviado.

## Errores y resultados inciertos

| Caso | Qué hacer |
|---|---|
| Datos inválidos / regla empresarial | Corregir campos y revisar situación/custodia; no inventar un movimiento para eludir el control |
| Sin sesión / sin permiso | Autenticar o consultar al administrador; no compartir cuenta ni pedir que se desactiven controles |
| Versión obsoleta (412/428) | Recargar ficha y revisar cambios antes de decidir; no sobreescribir automáticamente |
| Conflicto (409) | Revisar duplicados y solicitud previa; no reutilizar la misma clave con otros datos |
| Respuesta perdida / resultado incierto | Conservar la página; usar el reintento de la **misma** operación ofrecido por esa pantalla, con solicitud original. No crear otra alta o proceso |
| Página/sesión abandonada durante incertidumbre | Pedir conciliación del resultado a responsable antes de registrar un comando nuevo |
| Dependencia no disponible / demasiados intentos | Conservar referencia saneada; esperar/consultar soporte sin repetir escrituras ciegamente |

Las solicitudes pendientes se conservan en memoria de la página, no en almacenamiento persistente del navegador. Adjuntar al soporte solo ambiente, instante UTC, pantalla, impacto y Referencia/requestId sin credenciales ni datos personales. Procedimiento completo en [SOPORTE](SOPORTE_MANTENIMIENTO.md).

## Alcance y fuentes

Recorridos contrastados con `apps/web/src/main.tsx`, `processes.tsx`, `reports.tsx`, políticas de servidor y pruebas UI existentes. Ver [FRONTEND](FRONTEND.md), [PROCESOS](PROCESOS_EMPRESARIALES.md), [REPORTES](REPORTES.md) y [PRUEBAS](PRUEBAS.md). Se conservan abajo los recorridos incorporados en Fases 10–13; sus nombres de fase identifican origen, no una restricción vigente. Datos/cuentas reales, correo real y producción no quedan habilitados por este manual; F1-SEG-01/02/03 abiertos.


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


## Avisos de cambios — Fase 12

Los cambios confirmados conservan su validez aunque falle el correo al encargado. El seguimiento y la recuperación son tareas de administración; un aviso aceptado por el proveedor no demuestra entrega ni lectura. Los avisos conservan destinatario original y mensajes minimizados con referencias; los detalles requieren acceso al sistema. Invitación/recuperación/MFA se dirigen solo al titular por el canal de acceso. Esta entrega se verifica con correo sintético; no hay envío real activo. Ver [NOTIFICACIONES](NOTIFICACIONES.md).


## Búsqueda y exportación — ajuste de QA Fase 13

El buscador combinado permite texto por código, serie, tipo, marca, modelo o condición del bien, y por nombre, documento/RUT original o canónico, correo, cargo o unidad del funcionario. Las tablas y archivos ordinarios mantienen sus columnas autorizadas, sin añadir documento ni correo. En Excel/PDF, el texto de búsqueda aparece como `[consulta reservada]` para proteger consultas que contienen datos personales; el conjunto exportado sigue correspondiendo a los filtros aplicados. El enlace «Saltar al contenido» mueve el foco a la pantalla actual sin cambiar de vista. «Ver aviso» identifica el detalle del aviso para administradores.
