# Resultado MTEST-A01

Fecha: 2026-11-04 UTC. Preparación del sitio conectado; **sin URL remota activa**.

- Aplicación: repositorio PostgreSQL de laboratorio real con 17 capacidades C03, tablas tipadas, sesiones/MFA/CSRF, permisos privados y transacciones. Interfaz existente preservada, sin transporte demo en el paquete.
- Pruebas nuevas locales: 20/20 (PostgreSQL real, operador gestionado sin SUPERUSER, Supabase Auth/GoTrue local y navegador con recarga). Después del endurecimiento de confirmación/movimientos SQL, 14/14 de persistencia/Auth repetidas correctamente; navegador se incluye también en la regresión completa en curso.
- Regresión Node: 232/232 correctas. Recuperación: 3 comprobaciones correctas; ensayo que requiere dos PostgreSQL simultáneos bloqueado por espacio local VFS (disco agotado, destino sin iniciar). No equivale a un fallo demostrado de restauración ni a un backup validado del nuevo esquema. Se repetirá en CI con espacio adecuado.
- Respaldo adicional del modelo modernizado: 1/1 correcto; pg_dump/pg_restore de 59 tablas, datos/propietarios/ACL/RLS y outbox pendiente, con revocación de sesiones en otra base del mismo clúster sintético. No acredita recreación de roles ni recuperación del servicio Auth gestionado.
- Interfaz: 63/63 correctas. Evidencias históricas originales preservadas.
- Build TypeScript/Vite conectado: correcto; sin chunk demo. Composición predeterminada conservada, laboratorio por opt-in y proyecto fijado.
- Supabase remoto antes de activación: proyecto inventarioTI2 activo, baseline 19 tablas/155 columnas, 6 bienes legacy, 0 cuentas/usuarios Auth, roles SQL sin LOGIN. Advisor de seguridad sin observaciones. Esta preparación no usa la cuenta postgres como conexión del BFF.
- Empaquetado de staging: portada moderna confirmada en navegador real, 6/6 comprobaciones; sin modo demo. Auditoría npm sin vulnerabilidades y escaneo heurístico sin coincidencias de secretos.
- Contenedor, migración remota, semilla y publicación: consultar actualización final de este comprobante; no declarados ejecutados en este snapshot inicial.

Para abrir el sitio faltan secretos SQL/Auth y CA en el servidor, dos identidades Auth confirmadas con vínculo expreso, registro público deshabilitado e ingreso HTTPS. El entorno cloud no tiene esos secretos vinculados. El conector no ofrece modificación de configuración Auth ni lectura de claves secretas de servidor. [Pasos concretos](../PRUEBA_REAL_SUPABASE.md).

Perfiles/bajas finales/reactivaciones/compensaciones permanecen cerrados. Reportes v1 tienen origen propio. SQLServer 2016/130 y datos operacionales siguen fuera de este ensayo; los cuatro SQL candidatos y evidencia histórica se preservan.
