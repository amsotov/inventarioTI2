# Manual de administración

2026-11-02 · Consolidación de Fase 15 **COMPLETADA por D-41**. Solo para administrador con sesión/MFA vigentes. [Manual de usuario](MANUAL_USUARIO.md) cubre acceso, bienes, funcionarios y procesos; [SOPORTE](SOPORTE_MANTENIMIENTO.md), [CAPACITACION](CAPACITACION.md) y [ROADMAP](ROADMAP.md) completan la entrega. Este manual no concede permisos nuevos ni acredita operación gestionada.

## Preparación y límites de administración

No existe primer administrador creado desde la UI ni cuenta predeterminada: el bootstrap de identidad/cuenta necesita procedimiento y autorización específicos. Funcionario y cuenta son entidades distintas. Solo existen roles Lectura y Administrador; no se configuran permisos arbitrarios por persona/unidad. Administración no concede propiedad SQL, no desactiva MFA/RLS/CSRF y no cambia infraestructura por el panel.

Antes de altas/cambios revisar ambiente, sesión/MFA, cuenta objetivo y motivo. No modificar el propio registro completo ni dejar al sistema sin el último administrador habilitado; coordinar con otra persona autorizada sin compartir credenciales. El correo de una cuenta no se edita desde este panel. Pendiente no significa habilitada; activar requiere credencial lista y MFA administrativo conforme a las reglas. Reactivar no restaura sesiones antiguas.

Invitación/recuperación de identidad y avisos empresariales son canales distintos. Solicitar un enlace no acredita envío; el worker de avisos no implementa el correo de identidad. **Correo real deshabilitado/no acreditado**, sin autorización para activar servicios. No copiar enlaces, contraseñas ni claves en motivos/evidencias.

## Recorridos del panel conservados desde Fase 9

Entrega de Fase 9 aceptada por D-29; instrucciones limitadas al panel implementado. No acredita puesta en marcha ni aceptación de esta consolidación Fase 15. Detalle técnico, criterios y riesgos en [ADMINISTRACION](ADMINISTRACION.md).

1. Inicia sesión como administrador y completa MFA. Abre **Administración**. Lectura no tiene acceso; el servidor también lo deniega.
2. Si aún no hay encargado, abre **Parámetros de avisos**, completa destinatario/motivo y confirma. Si ya existe, selecciona **Editar** para cargar su versión. El cambio queda auditado y genera avisos pendientes al nuevo/anterior; no los envía.
3. En **Cuentas**, registra nombre, correo y uno de los dos roles. La cuenta nace pendiente. Usa **Editar → Solicitar invitación o recuperación** y confirma para tramitar el enlace de acceso. Nunca copies credenciales ni enlaces en el inventario. El 202 registra la solicitud, no demuestra envío. Entrega real depende de integración operativa autorizada.
4. En otra cuenta, edita nombre/rol/estado con motivo y confirmación. Desactivar no borra historia; reactivar no recupera sesiones antiguas. Un pendiente requiere completar credencial antes de activación. No se modifica el propio registro ni se puede perder el último administrador habilitado.
5. Para exigir contraseña nueva, marca la opción, confirma y guarda. El acceso de esa cuenta queda bloqueado. Vuelve a seleccionar la cuenta y solicita recuperación; hasta completar el enlace no recuperará acceso. Invitación vence a 24 h, recuperación a 30 min; reenvío invalida la anterior. Ante resultado incierto del proveedor, conciliar antes de repetir.
6. En **Catálogo de unidades**, crea o edita nombre y estado. Desactivar conserva referencias; futuras pertenencias no admiten unidad inactiva. No se crean movimientos desde este panel.
7. Para descartar el formulario, usa **Cancelar**. Ante 412, recarga la administración y revisa datos actuales. Ante resultado incierto, mantén la página y usa **Reintentar operación** con la clave original; antes de abandonar/cerrar sesión, concilia con el responsable. No repitas como un alta nueva.

Las listas se paginan de 50 en 50. El panel no cambia correo de cuenta, permisos arbitrarios, UTC ni respaldo operativo, no crea el primer administrador y no despacha outbox. Los objetivos de respaldo semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días aún requieren configuración y verificación operativa independiente. Las fases 0–14 están aceptadas; Fase 15 COMPLETADA por D-41, sin despliegue.


## Reporte de auditoría y exportación privada — Fase 11

Con sesión administrativa y MFA vigentes, abre Reportes → Auditoría. Filtra por fecha de registro UTC, actor, entidad/referencia/acción. Se muestran diferencias empresariales minimizadas; documento, correo, destinatario, proveedor y claves desconocidas no se copian. Excel/PDF conservan la selección completa, límites, orden y metadatos. El archivo es del solicitante, caduca una hora después de crear y vuelve a validar rol al descargar. Revocar el rol impide acceder a un archivo de auditoría ya generado. Los trabajos fallidos/caducados requieren una nueva solicitud explícita; una respuesta perdida se resuelve con la misma clave. No altera historia ni procesa avisos. Ver [REPORTES](REPORTES.md).


## Seguimiento de avisos — Fase 12

En Administración elige Seguimiento de avisos; filtra estado y abre Ver detalle para revisar destino original, UTC, intentos y resultado saneado. Aceptado no implica entregado. Cancela pendientes/fallidos con motivo; el destino no se modifica. Reintenta solo fallidos, conservando correlación. Ante incierto, verifica primero el resultado con el proveedor por canal autorizado y registra evidencia al conciliar: aceptado, entregado, fallo permanente o ausencia confirmada. Ausencia confirmada habilita un reintento separado. No se concilia ni cancela un envío en vuelo.

Confirma cada acción tras revisar el aviso; una versión obsoleta exige recargar. Ante respuesta perdida usa Recuperar resultado de la acción y conserva esta página. No introduzcas secretos en motivo/evidencia. Volver a parámetros y cuentas permite cambiar el encargado de avisos futuros, sin redirigir anteriores. El worker está deshabilitado por defecto; su activación/servicio de correo reales necesitan autorización propia. Configuración y límites en [NOTIFICACIONES](NOTIFICACIONES.md).

## Errores, acceso y escalamiento

Ante 412/428 recargar y revisar versión; ante respuesta perdida mantener la solicitud y usar el reintento/recuperación de resultado de la misma acción. Si se perdió la página o sesión, conciliar antes de emitir otra. Ante 401 autenticar; ante 403 revisar permiso/MFA/origen por canal autorizado. Nunca dar privilegios amplios para eliminar un error.

MFA perdido, credencial bloqueada por operación incierta o problema del proveedor necesitan verificación y procedimiento autorizado; el panel no ofrece un bypass de MFA ni resuelve automáticamente la incertidumbre de Auth. No reenviar invitaciones o avisos inciertos sin evidencia. Registrar UTC, impacto y requestId saneados; ver [soporte](SOPORTE_MANTENIMIENTO.md).

## Administración funcional y operación de plataforma

Las revisiones diarias de salud, recursos, copias y colas, incidentes, recuperación y rollback se rigen por el [runbook](RUNBOOK_OPERACION.md) y [checklist](CHECKLIST_LIBERACION.md). Los responsables reales, canal y horario de respaldo siguen sin aprobar. F1-SEG-01/02/03 permanecen abiertos; no hay purga de historia/auditoría ni plazos legales inventados. Una restauración real no es una función del panel.

No cambiar configuración Pages ni escribir/mergear main: Pages legacy main:/docs puede publicar. No activar worker ni enviar correo real por seguir este manual. Las comprobaciones locales, la aceptación de Fase 14 y esta entrega documental no acreditan operación productiva, integración gestionada, recuperación integral, retención externa o capacitación realizada. Consultar [Fase 15](FASE15.md) para criterios y pendientes de revisión.

## Bootstrap y pruebas locales — D-41

El controlador específico de [PRUEBAS_LOCALES](PRUEBAS_LOCALES.md) aprovisiona cuentas/identidad **solo sintéticas** en recursos propios del ensayo autorizado; no añade bootstrap público a la UI ni cambia main.ts. Credenciales aleatorias fuera de Git; administrador interactivo configura MFA y las cuentas smoke tienen identidad distinta. No usar este procedimiento en servicio gestionado/productivo ni borrar work/ o volúmenes para resolver un error.
