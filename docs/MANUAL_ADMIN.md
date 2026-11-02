# Manual del panel administrativo — incremento de Fase 9

Entrega de Fase 9 aceptada por D-29; instrucciones operativas limitadas al panel implementado. No acredita puesta en marcha ni sustituye los pendientes de Fase 14/15. Detalle técnico, criterios y riesgos en [ADMINISTRACION](ADMINISTRACION.md).

1. Inicia sesión como administrador y completa MFA. Abre **Administración**. Lectura no tiene acceso; el servidor también lo deniega.
2. Si aún no hay encargado, abre **Parámetros de avisos**, completa destinatario/motivo y confirma. Si ya existe, selecciona **Editar** para cargar su versión. El cambio queda auditado y genera avisos pendientes al nuevo/anterior; no los envía.
3. En **Cuentas**, registra nombre, correo y uno de los dos roles. La cuenta nace pendiente. Usa **Editar → Solicitar invitación o recuperación** y confirma para tramitar el enlace de acceso. Nunca copies credenciales ni enlaces en el inventario. El 202 registra la solicitud, no demuestra envío. Entrega real depende de integración operativa autorizada.
4. En otra cuenta, edita nombre/rol/estado con motivo y confirmación. Desactivar no borra historia; reactivar no recupera sesiones antiguas. Un pendiente requiere completar credencial antes de activación. No se modifica el propio registro ni se puede perder el último administrador habilitado.
5. Para exigir contraseña nueva, marca la opción, confirma y guarda. El acceso de esa cuenta queda bloqueado. Vuelve a seleccionar la cuenta y solicita recuperación; hasta completar el enlace no recuperará acceso. Invitación vence a 24 h, recuperación a 30 min; reenvío invalida la anterior. Ante resultado incierto del proveedor, conciliar antes de repetir.
6. En **Catálogo de unidades**, crea o edita nombre y estado. Desactivar conserva referencias; futuras pertenencias no admiten unidad inactiva. No se crean movimientos desde este panel.
7. Para descartar el formulario, usa **Cancelar**. Ante 412, recarga la administración y revisa datos actuales. Ante resultado incierto, mantén la página y usa **Reintentar operación** con la clave original; antes de abandonar/cerrar sesión, concilia con el responsable. No repitas como un alta nueva.

Las listas se paginan de 50 en 50. El panel no cambia correo de cuenta, permisos arbitrarios, UTC ni respaldo operativo, no crea el primer administrador y no procesa outbox. Los objetivos de respaldo semanal/RPO 168 h/RTO 8 h/copias 30 días aún requieren configuración y verificación operativa independiente. Fase 10 autorizada para un nuevo chat, ejecución pendiente; sin despliegue.


## Reporte de auditoría y exportación privada — Fase 11

Con sesión administrativa y MFA vigentes, abre Reportes → Auditoría. Filtra por fecha de registro UTC, actor, entidad/referencia/acción. Se muestran diferencias empresariales minimizadas; documento, correo, destinatario, proveedor y claves desconocidas no se copian. Excel/PDF conservan la selección completa, límites, orden y metadatos. El archivo es del solicitante, caduca una hora después de crear y vuelve a validar rol al descargar. Revocar el rol impide acceder a un archivo de auditoría ya generado. Los trabajos fallidos/caducados requieren una nueva solicitud explícita; una respuesta perdida se resuelve con la misma clave. No altera historia ni procesa avisos. Ver [REPORTES](REPORTES.md).
