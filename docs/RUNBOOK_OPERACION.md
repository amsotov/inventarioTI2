# Runbook de operación y recuperación — Fase 14

2026-11-02 · Entrega de Fase 14 aceptada por D-39; parámetros/compromisos operativos propuestos siguen sin aprobar. Solo ensayos sintéticos ejecutados. [Plan y cobertura](DESPLIEGUE.md) · [Checklist](CHECKLIST_LIBERACION.md). Producción/correo real no autorizados. Fase 15 autorizada para nuevo chat, sin ejecución aquí.

## Responsables y registro

Antes de operación gestionada registrar: ambiente/proyecto/origen HTTPS; commit/artefacto/hash, Node/PG/migraciones; operador/suplente y autorizador de reapertura; contacto/canal de incidente; referencia de gestor de secretos (sin valores); almacén/clave independientes, timestamp de snapshot/finalización y última restauración buena. Personas **SIN DESIGNAR**; horario/canal/destino F1-SEG-03 **SIN APROBAR**. No inventar asignaciones ni enviar mensajes desde esta tarea.

Propuesta de severidad: P1 indisponibilidad, sospecha de fuga/integridad o copia próxima a incumplir; P2 degradación/cola/copia fallida aún dentro de margen. Propuesta de atención: P1 acuse 15 min/actualización 30 min; P2 acuse 1 h/actualización 2 h. No es una guardia existente; requiere aprobación/cobertura. Sin responsable designado, producción sigue bloqueada.

## Liberación futura

1. Completar checklist, identificar destino de pruebas y aprobación concreta; preservar estado actual y paquete anterior. Inspeccionar también automatismos fuera de archivos versionados: Pages legacy main:/docs está activo. Con prohibición de publicación, trabajar en rama/PR sin merge a main hasta resolver ese automatismo; no inferir seguridad por ausencia de workflow de deploy. Producción conserva autorización adicional.
2. Construir desde árbol limpio Node 24/lockfile: `npm ci`, `npm run build`, `npm test`, `npm run test:ops`, `npm run test:ui`. Comprobar CI del SHA exacto. No worker/datos reales. `npm start` exige configuración externa y APP_ORIGIN HTTPS; no provee proxy TLS.
3. Inventariar esquemas/roles/PG/extensiones y ledger/hash de migraciones del destino. Validar compatibilidad hacia atrás, espacio/locks/ventana y copia buena recuperable. No usar `db reset`, `--clean`, seeds ni preparación del fixture en servicio gestionado.
4. Detener escrituras si no se demostró compatibilidad. Aplicar solo migraciones nuevas revisadas, en orden/transacción, con usuario de migración y errores fatales. Ante error: detener, rollback y no registrar versión aplicada; conservar evidencia. Nunca modificar migraciones aceptadas.
5. Inyectar configuración por servicio; revalidar roles mínimos exactos, RLS/ACL/propietarios y ausencia de membresías amplias. Secretos reales fuera de terminal compartida, argumentos registrados, Git y CI.
6. Arrancar candidato web con worker deshabilitado. En ingress privado puede requerir HOST=0.0.0.0; bloquear acceso directo, HTTPS/redirect y sondas live/ready. No abrir tráfico con readiness fallida.
7. Smoke sintético: ambos roles, MFA administrador, revocación, Origin/CSRF y rate limit por proxy; lista/creación con auditoría, replay e idempotencia, descarga privada; rechazos de lectura en administración y de sesión inválida. Salud 200 no acepta release. Probar reinicio y capacidad/colas en plataforma. Integraciones gestionadas sin ensayo conservan bloqueo.
8. Conmutar tráfico solo con autorización y gates PASS; conservar paquete anterior. Ventana de observación propuesta 30 min: sin fallo de smoke, 5xx ≤1 % con muestra suficiente, p95 consultas/escrituras ≤2/3 s. Incumplimiento: aislar/evaluar rollback. No prometer cero downtime sin demostrar solapamiento/drain/capacidad.
9. Publicar web no activa worker. Antes de envío real exigir autorización específica, dominio/credenciales, destinatario autorizado y revisión de pendientes históricos. Registrar commit realmente sirviendo, migraciones/TLS/smoke/promoción; merge/build no es deploy.

## Operación y copia

Cada día operativo revisar salud/errores/latencia, pool/locks, pendientes/edad e inciertos, exportaciones/temporales, recursos y última copia buena. Diagnóstico mediante permisos vigentes/MFA; resultados agregados sin documentos, destinatarios o tokens.

Copia semanal, máximo 168 h entre éxitos. Propuesta: preparar/revisar antes de 144 h y anticipar ejecución para margen; sin scheduler/hora aprobados. Fallo: alerta inmediata y un reintento controlado tras diagnóstico, sin bucle ilimitado; escalar al suplente. Edad 160 h crítica, ≥168 h incumplimiento conservando timestamps. No actualizar lastGood por iniciar job, archivo vacío o upload sin verificación. Reloj inválido/copia ausente = BLOCKED.

Éxito exige snapshot consistente, manifiesto (commit/migraciones/hashes/PG, snapshot y fin, tamaños/cobertura/referencias de claves), cifrado autenticado, upload independiente y lectura de vuelta íntegra. Nunca passwords/claves en manifiesto. RPO desde snapshot recuperable, no fin de carga. Retener cada copia ≥30 días; no borrar última buena ni evidencia de incidente. Expiración/independencia/permisos requieren ensayo; no hay purga automática implementada.

Restaurar antes de producción y trimestralmente; registrar fecha, volumen, tiempos, operador, integridad/permisos y límites. Repetir tras cambio sustancial de PG/Auth/esquema/claves/almacén. Ensayo pequeño no demuestra RTO real ni recuperación externa con proveedor primario caído.

## Respuesta a incidente

1. Registrar UTC detección, último servicio/snapshot sano, ambiente/versión/impacto y correlaciones sin PII. Congelar promociones/efectos externos; conservar estado/paquetes/logs/copia. Activar responsables por canal acordado; esta tarea no envía comunicaciones.
2. Comprobar live/ready, DB/Auth/red/TLS, pools/locks y cambios recientes. No desactivar MFA/RLS/CSRF ni convertir runtime en superusuario. Ante compromiso, aislar y rotar por gestor sin imprimir secretos; coordinar privacidad bajo F1-SEG-01, sin inventar obligaciones legales.
3. Elegir rollback de aplicación si datos/esquema íntegros y paquete compatible; recuperación si pérdida/corrupción. Documentar decisión/autorización concreta antes de alterar recursos reales. Restaurar datos reales requiere tratamiento propio; no se deduce de autorización de deploy.

## Recuperación a destino aislado

1. Medir RTO desde detección/pérdida de servicio hasta servicio útil aceptado (≤8 h), sin reiniciar reloj al iniciar restore. Elegir copia buena; calcular RPO snapshot→incidente ≤168 h. Registrar brechas, nunca alterar timestamps.
2. Detener escrituras y todo despacho en origen/destino; conservar origen y backup. Preparar destino limpio aprobado/aislado y compatible, con espacio suficiente y sin exposición pública. No restaurar sobre origen ni usar limpieza indiscriminada.
3. Recuperar clave desde custodia independiente; verificar autenticidad/hashes/cobertura/versiones/acceso externo. Error bloquea restore: preservar archivo y evaluar otra copia buena, no omitir errores. El fixture no cubre Auth/settings gestionados.
4. Restaurar roles personalizados sin passwords y DB según procedimiento del proveedor para esa versión. Reemitir passwords desde gestor; validar propietarios/RLS/políticas/ACL/funciones y privilegios negativos. No reemplazar roles internos por los del fixture. Comparar datos, historia/custodia/auditoría/comandos/intentos/seqs con manifiesto/evidencia fuente.
5. Solo en destino restaurado sin procesos, aplicar aislamiento equivalente a [recovery-isolation.sql](../ops/recovery-isolation.sql). Sesiones/enlaces pendientes invalidados; entregas de identidad y avisos pendientes/procesando inciertos. No resetear a pendiente ni cambiar destinatarios/claves. Estados Auth processing/uncertain anteriores se conservan para conciliación administrativa con evidencia, sin reactivación ciega.
6. Recuperar/reconfigurar identidad gestionada: UUID/proveedor_ref, MFA/políticas/redirects/secretos/settings. Revocar sesiones también en proveedor, exigir nuevo login/MFA e invalidar enlaces antiguos. Recuperar clave de sobres si necesaria para conciliación; no reabrir con sesiones del snapshot. JWT/SMTP/settings no se recuperan por dump genérico. Sin identidad acreditada, no abrir acceso.
7. Conciliar intervalo snapshot→incidente: negocio/Auth/correo pueden haber ocurrido fuera de la copia. Usar referencias y evidencia real del proveedor, sin reenviar ni fabricar IDs/eventos. Conservar transacción estado/historia/auditoría/outbox/idempotencia. Aceptación por proveedor no demuestra entrega física.
8. Arrancar candidato sin worker y ejecutar smoke/permisos/nueva autenticación. Comprobar sesión/enlace antiguos inválidos, descargas privadas, datos/historia/auditoría, ausencia de avisos reclamables y efectos inciertos pendientes. Explicar pérdida/diferencias; conteo de tablas no acredita recuperación integral.
9. Reabrir solo con responsable autorizado y evidencia/checklist. Informar RTO/RPO observados, brechas y exclusiones. Reactivar efectos solo tras conciliación y permiso para envío real. Conservar evidencia y causa/acciones del incidente; no iniciar Fase 15 por mejoras propuestas.

## Rollback de aplicación

Congelar promoción, parar worker y registrar corte. Verificar paquete exacto anterior contra esquema actual y reglas/idempotencia. Si compatible, dirigir tráfico a anterior, drenar solicitudes y verificar health/login/MFA/smoke/errores sin revertir datos ni reenviar outbox. Conservar migración aditiva suele ser más seguro que down destructivo. Si compatibilidad no demostrada, mantener mantenimiento y preparar corrección o restore aislado con autorización concreta. No usar force push, borrar tablas o reescribir historia/auditoría como rollback. Registrar versión efectiva y evidencia. Rollback de binario/plataforma **NO EJECUTADO** aquí.

## Ensayo local reproducible

Node 24 y Docker local, desde raíz: `npm ci`, `npm run build`, `npm run test:ops`. Solo contenedores propios UUID, secretos efímeros y migraciones aceptadas en origen; restaura cifrado/roles en destino limpio, compara 19 tablas/catálogos, rota logins sintéticos, aísla sesiones/outbox, reautentica con doble y prueba permisos/fallo DDL. Además comprueba corrupción/clave errónea y fronteras de copia/fallo/reloj. Sin DSN del usuario/correo; retira solo sus contenedores/volúmenes. Resultado: [recuperacion.json](evidencias/fase14/recuperacion.json).
