# Runbook de operación y recuperación — Fase 14

> Guía vigente de modernización: [F9 corte y retorno](#migración-fase-9--corte-y-retorno), autorizada por M9-A01 solo como documentación. Liberación NO_GO. La continuidad F8 y los procedimientos anteriores se conservan como historia; no se ejecutan por aceptación de F9.

> Continuidad vigente de migración: M8-A01 acepta F7 e inicia [F8 seguridad/regresión](migracion/08_SEGURIDAD_REGRESION.md). EN_REVISION_CON_BLOQUEOS; [matriz](migracion/08_MATRIZ_PRUEBAS.csv) y [evidencia](migracion/evidencias/fase8/pruebas.json). 280 casos Node aprobados; M8-R01 autorregistro remoto FALLIDA/no corregida, [propuesta sin aplicar](migracion/08_CONFIGURACION_AUTH_PROPUESTA.json). GoTrue/BFF/PG reales localmente; no integración gestionada ni SQL Server. F9 no autorizada, producción bloqueada. El contenido restante conserva su contexto histórico.


2026-11-02 · Propuesta para revisión D-38. Solo ensayos sintéticos ejecutados. [Plan y cobertura](DESPLIEGUE.md) · [Checklist](CHECKLIST_LIBERACION.md). Producción/correo real no autorizados; Fase 15 sin iniciar.

## Responsables y registro

Antes de operación gestionada registrar: ambiente/proyecto/origen HTTPS; commit/artefacto/hash, Node/PG/migraciones; operador/suplente y autorizador de reapertura; contacto/canal de incidente; referencia de gestor de secretos (sin valores); almacén/clave independientes, timestamp de snapshot/finalización y última restauración buena. Personas **SIN DESIGNAR**; horario/canal/destino F1-SEG-03 **SIN APROBAR**. No inventar asignaciones ni enviar mensajes desde esta tarea.

Propuesta de severidad: P1 indisponibilidad, sospecha de fuga/integridad o copia próxima a incumplir; P2 degradación/cola/copia fallida aún dentro de margen. Propuesta de atención: P1 acuse 15 min/actualización 30 min; P2 acuse 1 h/actualización 2 h. No es una guardia existente; requiere aprobación/cobertura. Sin responsable designado, producción sigue bloqueada.

## Liberación futura

1. Completar checklist, identificar destino de pruebas y aprobación concreta; preservar estado actual y paquete anterior. Producción conserva autorización adicional.
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


## Migración Fase 4 — planificación de corte y reversión

[Plan ETL](migracion/04_PLAN_ETL.md) y [reconciliación/rollback](migracion/04_RECONCILIACION_ROLLBACK.md) proponen origen congelado, snapshot consistente, soporte de identidad/efectos, restauración aislada y retorno condicionado al punto de nuevas escrituras. Los procedimientos previos se conservan como referencia histórica; no se ejecutó operación ni se acredita recuperación SQL Server. Fuente real, operadores/entorno/seguridad y autorización concreta pendientes. Fase 4 EN_REVISION, sin Fase 5 ni producción.

## Candidato SQL Server de modernización — Fase 5

El [DDL candidato](../migrations/sqlserver/README.md) está bloqueado y no integrado al runner actual. No quitar THROW ni ejecutar sobre PostgreSQL/base existente. [Informe](migracion/05_ESQUEMA_SQLSERVER.md) detalla versión/edición/collation, soporte y decisiones pendientes. Sin ensayo de motor, restore o rollback; procedimientos de Fase 4 y runbook histórico conservan sus límites. Fase 6/producción sin autorización.

## M5-A02 — dos entornos de validación

Pruebas iniciales Supabase/PostgreSQL inventarioTI2 con datos sintéticos; falta proyecto visible/identificado. Destino SQL Server 2016/13.x/nivel 130 confirmado, sin instancia/collation/edición autorizadas. No redirigir fixtures locales con resets/roles al proyecto gestionado; no aplicar T-SQL a PostgreSQL. [Compatibilidad y límites](migracion/05_ENTORNOS_COMPATIBILIDAD.md). No activar workers/envíos ni retirar barreras del candidato.

## M5-A04 — proyecto Supabase creado

inventarioTI pausado por autorización y confirmado INACTIVE; no reactivar automáticamente porque inventarioTI2 ocupa el cupo Free. Nuevo inventarioTI2 ref yhsfotxhaptinjtmrinn, ACTIVE_HEALTHY, sovicl/sa-east-1, PostgreSQL 17.11/UTC según SELECT de metadatos. Cero tablas de aplicación. [Registro](migracion/PROVISION_SUPABASE.md). No se almacenaron claves/cadenas de conexión ni se cambiaron workers/correo/roles. Preparación de esquema/cargas/funcionalidad y SQL Server conserva sus puertas; Fase 6 no autorizada.

## M5-A05 — baseline y datos de laboratorio

[Paquete](../migrations/supabase-pruebas/README.md) exclusivo de inventarioTI2/yhsfotxhaptinjtmrinn, 10 entradas remotas y semilla aplicada. No ejecutar carpeta en bloque ni reaplicar seed: aborta sobre datos preexistentes. InventarioTI sigue pausado. Roles NOLOGIN; sin usuarios Auth, passwords o workers activados. [Ensayo](migracion/VALIDACION_SUPABASE.md) con rollback no es restauración de copia ni prueba de operación real. No redirigir fixtures locales con resets al gestionado. Fase 6/producción sin autorización.


## Modernización Fase 6 — activación restringida

Seguir [informe F6](migracion/06_ADAPTACION_BACKEND.md). INVENTORY_BACKEND=postgres por defecto; sqlserver2016 falla antes de crear pools. v2 requiere inyección explícita y no está registrada en main. No retirar barreras, elegir backend incompleto ni aplicar SQL Server a Supabase. No se cambió configuración remota ni habilitó envío. Para revertir este incremento de código en entorno autorizado, volver al commit padre 27cae1f con sus dependencias, sin rollback de datos: F6 no ejecuta migraciones remotas. No desplegar por esta instrucción.


## Migración Fase 7 — interfaz sin activación de destino

[Informe F7](migracion/07_ADAPTACION_VISUAL.md). Main conserva PostgreSQL/v1, SQL Server falla cerrado; nuevo módulo informa no habilitado si no hay backend v2. No registrar ModelContractDouble fuera de tests ni poner datos v1 como respuesta v2. No hubo migración remota: rollback de este incremento en entorno autorizado es volver a 1d7fac0 con sus dependencias, sin deshacer datos. No desplegar por esta guía.

## Migración Fase 9 — corte y retorno

M9-A01 autoriza preparar este procedimiento, sin ejecutarlo. [Despliegue](DESPLIEGUE.md#migración-fase-9--preparación-vigente), [puertas](migracion/09_PUERTAS_LIBERACION.csv) y [pendientes](migracion/09_PENDIENTES.csv). No hay punto de corte real, paquete nuevo/anterior desplegado ni rollback SQL Server verificado. F8 probó restore PostgreSQL local cifrado; no es una copia actual ni restauración de identidad/infraestructura gestionada.

### Registro y decisión antes de operar

Registrar por canal protegido: permiso con SHA/entorno/operación, operador/suplente y aprobador, ventana UTC, versiones/configuración no secreta, paquete nuevo/anterior y hashes, origen/base destino, snapshot consistente y copia restaurada, mapas y excepciones, última escritura aceptada y estado de efectos. Las claves/cadenas quedan en gestor, fuera del registro. Sin una puerta aplicable resuelta: detener preparación operativa, conservar el sistema vigente y pedir alcance concreto cuando exista un resultado revisable.

| Situación | Retorno propuesto, sujeto a autorización concreta | Evidencia para decidir |
| --- | --- | --- |
| Solo documentos de F9, nada desplegado | Revertir mediante commit los documentos de esta entrega si se solicita; conservar evidencia y aceptación anteriores. No tocar DB. | SHA/árbol Git y diff; F9 no cambia código ni datos. |
| Candidato de aplicación PG, esquema compatible y sin pérdida de datos | Congelar promoción/worker, comprobar paquete anterior contra esquema actual, dirigir tráfico solo al anterior y ejecutar smoke con nueva autenticación. | Hash del binario anterior, migraciones/config compatibles, pruebas de roles/MFA/replay/exportación y ausencia de despacho duplicado. |
| DDL/carga aislados fallan antes de abrir destino | Detener lote y conservar errores/checkpoints; rollback transaccional si procede; mantener origen intacto como único escritor cuando la reapertura sea autorizada. | Transacción/ledger sin éxito falso, balances de filas/fragmentos, hashes, mapa y marca UTC del congelamiento. No purgar destino ni lotes ajenos. |
| Corte a SQLServer preparado, todavía sin escrituras nuevas | No abrir candidato con divergencias; volver al origen compatible únicamente tras comprobar que no recibió cambios ocultos y conciliar efectos. | Restauración real del motor/identidad, reconciliación y constatación de cero escrituras nuevas; no basta contar tablas. |
| Ya se aceptaron escrituras en el destino | Congelar ambos y todo despacho, conservar delta/artefactos/efectos; decidir corrección hacia adelante o reconciliación inversa diseñada y autorizada. | Historial, actor/comando/idempotencia/UTC y referencias de efectos desde corte. No apuntar al snapshot viejo ni improvisar doble escritura. |
| Corrupción o pérdida de datos | Recuperar a base aislada autorizada desde copia buena verificada, preservando origen; reconciliar cambios posteriores y decidir reapertura. | Cobertura/cifrado/claves, restauración de esquema/roles/RLS/Auth/MFA/settings/UUID y soporte, secuencias/relaciones/reportes y efectos. |

### Restauración y reapertura futuras

1. Parar escrituras y worker/consumidores; conservar origen y evidencia. Validar hash/autenticidad/cobertura de la copia y disponibilidad independiente de claves. Un fallo de integridad bloquea restore; no omitir errores o usar --clean sobre origen. El dump PG del fixture no es un backup SQLServer ni del proveedor Auth completo.
2. Restaurar con procedimiento del motor/proveedor correspondiente en destino limpio aislado. PostgreSQL/Supabase: respetar roles/esquemas gestionados y ledger, no copiar preparación del fixture. SQLServer: falta instancia y procedimiento probado; el núcleo candidato no incluye soporte completo. No aplicar ops/recovery-isolation.sql de PostgreSQL a SQLServer. Preparar equivalencia solo tras diseño/permiso y ensayo.
3. Verificar mapas/UUID/INT, datos y relaciones, historia/auditoría/comandos/outbox/secuencias y permisos negativos. Invalidez de sesiones/enlaces locales y del proveedor, nuevo login/MFA, proyecciones/exportaciones privadas y versiones de autorización. Los settings Auth requieren recuperación/verificación separada; no considerar M8-R01 resuelta por restaurar tablas.
4. Conciliar el intervalo snapshot→corte/incidente y todos los efectos externos inciertos. No resetear avisos a pendiente, cambiar destinatarios/claves ni reenviar por ausencia en la copia. Una respuesta perdida conserva su clave/carga/versión hasta verificar resultado. Mantener historia append-only y una sola autoridad de escritura.
5. Medir RPO desde snapshot recuperable hasta incidente (objetivo ≤168h), RTO desde interrupción hasta servicio útil aceptado (≤8h), conservar copias ≥30d y registrar brechas reales. Para migración planificada no descartar transacciones conocidas amparándose en RPO. El horario exacto/custodia/almacén/alertas siguen en F1-SEG-03, sin scheduler operativo acreditado.
6. Reabrir solo con permiso y evidencia del SHA/entorno exactos: health, Auth/MFA/revocación, roles, datos/historia/reportes, replay y ausencia de jobs reclamables indebidos. Confirmar configuración sin autorregistro tras remediación autorizada. Registrar versión efectiva, pérdida/diferencias, responsable y resultado. Reactivar correo requiere su autorización independiente después de conciliación.

La restauración no se ha ejecutado en SQLServer ni en Supabase gestionado. No usar retiro de THROW, reset de Auth, desactivación de RLS/MFA/TLS o force push como técnica de recuperación. Aceptar este runbook no acredita disponibilidad, pérdida cero, RTO real ni permiso para intervenir recursos.
