# Despliegue, operación y continuidad — Fase 14

> Continuidad vigente: M9-A01 acepta la auditoría F8 con pendientes y autoriza [F9 documental](migracion/09_PREPARACION_DESPLIEGUE.md), EN_REVISION. [Preparación vigente](#migración-fase-9--preparación-vigente), [compatibilidades](migracion/09_COMPATIBILIDADES.csv) y [puertas](migracion/09_PUERTAS_LIBERACION.csv). Liberación NO_GO; sin operación gestionada. Los apartados históricos conservan su fecha y alcance.

2026-11-02 · **EN_REVISION**, autorizada por D-37 y ratificada por la solicitud actual (D-38). Base `8d66e72`. Ejecución/verificación: Codex; aceptación: usuario. Última fase completada: 13. Fase 15 **PENDIENTE / NO OTORGADA**. **Ningún despliegue a producción realizado ni autorizado.**

## Plan presentado y alcance

1. Separar local/pruebas/producción, configuración, identidades SQL y secretos. Contrastar arquitectura aceptada y documentación vigente de Supabase; mantener Render/Supabase como referencia, sin contratación ni provisión.
2. Incorporar CI reproducible de verificación, separado de promoción y sin credenciales de infraestructura. Preparar secuencia de build/migración/promoción, controles de liberación y rollback.
3. Incorporar salud y logs mínimos sin información personal, y definir umbrales, responsables y respuesta a incidentes.
4. Ensayar copia cifrada, integridad y restauración sobre PostgreSQL propio sintético; comparar datos, historia, auditoría, outbox, idempotencia, funciones, roles y RLS. Invalidar sesiones/enlaces y aislar efectos externos inciertos.
5. Entregar [runbook](RUNBOOK_OPERACION.md), [checklist](CHECKLIST_LIBERACION.md), evidencia y pendientes. Actualizar GitHub y verificar SHA remoto. Entregar para revisión; no declarar aceptación ni iniciar Fase 15.

La fase permite ensayos locales aislados; no se deducen permisos para cuentas/datos reales, cambios remotos de permisos, servicios pagados ni envío de correo. Las pruebas no acreditan operación gestionada. Spec Kit no está instalado ni se instala.

## Entornos y topología

| Ambiente | Configuración y datos | Estado verificable |
|---|---|---|
| Local/CI | PostgreSQL 17 fijado por digest, contenedores efímeros, claves aleatorias, puertos loopback, identidad/correo dobles | Implementado y ensayado; ninguna DSN real aceptada por el ensayo |
| Pruebas gestionadas | Proyecto DB/Auth, dominio, origen HTTPS, claves y credenciales SQL propios; datos sintéticos; correo capturado | NO PROVISIONADO; requiere destino/recursos aprobados |
| Producción | DB/Auth independientes de pruebas; web/API, worker separado, proxy TLS, copias externas y operador | BLOQUEADA: aprobación expresa adicional y puertas del checklist |

Web sirve API y dist/web bajo el mismo origen. Node 24; npm ci, npm run build y npm start. HOST conserva 127.0.0.1 por defecto; 0.0.0.0 solo si el hosting aprobado necesita ingress privado y bloquea acceso directo al puerto. TLS termina en el proxy del proveedor, redirección HTTP→HTTPS allí, sin confiar en encabezados reenviados del cliente (trustProxy:false). Probar Origin, cookies __Host-, MFA y rate limit a través de ese proxy antes de abrir acceso; las direcciones pueden quedar agrupadas por el proxy y no se cambia la confianza por inferencia. No hay dominio, TLS, DNS, firewall o hosting configurados aquí.

El worker de avisos es un proceso separado; NOTIFICATION_DELIVERY_ENABLED=false y **no se arranca** en web/CI. Exportaciones siguen ejecutándose como trabajo asíncrono dentro del proceso API existente, no en un servicio de reportes independiente: dimensionar memoria/reinicio con esta implementación real. No prometer HA/rolling sin ensayo en la plataforma elegida. Estimación histórica 67–87 USD/mes base y 42 adicionales para staging persistente es orientativa de Fase 3, no cotización vigente, presupuesto ni gasto aprobados.

## Configuración y secretos

| Variable / material | Consumidor | Regla |
|---|---|---|
| APP_ORIGIN, HOST, PORT | web; origen también worker | Origen HTTPS exacto sin path; host privado; nunca dominios de otros ambientes |
| DATABASE_URL | web/Auth | Login exacto inventario_auth, sin propiedad ni membresías |
| BUSINESS_DATABASE_URL | web/negocio | Login exacto inventario_runtime, sin propiedad ni membresías |
| NOTIFICATION_DATABASE_URL | worker | Login exacto inventario_worker, separado y mínimo |
| SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY | servidor/identidad | Nunca VITE_*; secret key solo en servidor; proyectos separados |
| AUTH_ENCRYPTION_KEY | servidor | 32 bytes base64; custodia/versionado independiente de la copia; no restaurar sesiones activas |
| RESEND_API_KEY, NOTIFICATION_FROM, activación | worker | Ausentes en web/CI. Activación real requiere permiso específico |
| Credencial de migración y clave de cifrado de copia | operación controlada | Nunca en proceso web/worker ni GitHub CI; rotación/custodia fuera de Git |

Plantilla [.env.example](../.env.example) sin valores utilizables. Inyectar secretos por servicio desde gestor aprobado, sin .env en artefactos ni volcado del entorno. PostgreSQL gestionado exige TLS con CA verificada y cliente compatible; validar pg/certificados/DSN en staging sin deshabilitar verificación. Directa o pool de sesión para dumps/migración; no usar pool transaccional a ciegas. Revisar límites reales: API hasta 5 conexiones Auth + 5 negocio, worker hasta 2, más migración/operación; ajustar al plan y concurrencia antes de promoción. Rotar por ambiente sin publicar cadenas o claves en logs. Copia cifrada y claves deben estar en ubicaciones independientes; perder ambas invalida el RTO.

## CI, migraciones y promoción

[Verify only](../.github/workflows/verify.yml) se ejecuta en PR y push a main, contents:read, acciones fijadas a SHA, Node 24.19.0, checkout sin credenciales persistentes. Instala lockfile, compila, ejecuta regresión API/seguridad, operación/recuperación y UI Chromium, audit de dependencias y búsqueda heurística de secretos. No tiene job de deploy, secretos de proveedor, OIDC, pull_request_target, publicación de artefactos ni arranque del worker real. Los fixtures usan recursos propios; no consumen DSN productiva. La carga/a11y completa de Fase 13 conserva su evidencia; no se repite como certificación de infraestructura por cada push.

El CI remoto solo se declara PASS si se observa su run para el commit entregado; éxito local y sincronización no equivalen a CI remoto aprobado. No se modifica protección de rama ni se afirma que el workflow sea required check. Nunca ampliar scopes para forzar un push rechazado; conservar entrega y reportar bloqueo.

Promoción futura **manual**, por commit exacto, a destino identificado con [checklist](CHECKLIST_LIBERACION.md) firmado. Crear paquete desde árbol limpio con Node/lockfile, dist, dependencias runtime (incluidas fuentes PDF), ocho migraciones y sus SHA-256, versión PG y configuración no secreta; guardar hash/commit y paquete anterior en almacén aprobado. No reconstruir silenciosamente otro commit al promover. El build local verifica compilación; no se ha creado ni desplegado un release gestionado.

Migraciones existentes no se editan. En staging nuevo, inventariar roles reservados y esquemas; aplicar archivos en orden solo con credencial de migración, ON_ERROR_STOP, una transacción por archivo y registro de versión/hash tras éxito. La instalación genérica PostgreSQL del fixture crea anon/authenticated; no ejecutar esa preparación en Supabase donde son roles gestionados. Verificar propietario, RLS, políticas, funciones/grants y sumas antes de habilitar logins mínimos, nunca runtime como propietario. En destino instalado comparar ledger/hash y abortar ante versión desconocida o archivo modificado; no repetir ciegamente CREATE ROLE/TABLE. No hay runner remoto de migración ni ledger operativo configurados aquí.

Antes de migrar: copia verificada, espacio, locks/timeouts, ventana y compatibilidad del binario actual/anterior. Un fallo revierte transacción y detiene promoción; no saltar errores. Migraciones destructivas requieren permiso adicional; no se crean aquí. La prueba reproduce fallo DDL y rollback completo en la base sintética restaurada; no simula un upgrade Supabase gestionado. Pasos de promoción y rollback en el runbook.

## Observabilidad y alertas

GET /health/live: proceso responde. GET /health/ready: alcanza ambos pools SQL y valida identidades mínimas; 503 saneado ante fallo. Sin cuentas, SQL, DSN o excepciones en respuesta. No comprueba Auth/SMTP externo, cola, TLS ni capacidad completa; añadir smoke autenticado sintético controlado en staging para esos contratos. Salud no muta datos ni expone negocio.

operations.ts produce JSON por respuesta: UTC, ID generado, método, plantilla de ruta, status y duración; omite URL/query/identificador de recurso, cuerpos, cookies, IP, tokens y error de dependencia. Auditoría empresarial permanece separada e inmutable. No se habilita logging genérico de Fastify. Retención/acceso/exportación de logs pendientes de F1-SEG-01/02/03; no existe colector ni aviso externo configurado. Worker conserva códigos saneados de indisponibilidad, sin métricas integrales acreditadas.

| Señal / objetivo | Umbral operativo propuesto, por aprobar | Acción |
|---|---|---|
| Proceso/readiness | Sondeo 1 min; 3 fallos consecutivos | P1, congelar promoción y comprobar dependencias |
| HTTP | 5xx >1 % en 5 min con ≥100 solicitudes, o readiness fallida con poco tráfico | Diagnóstico correlacionado sin payloads |
| Latencia | p95 consulta >2 s / escritura >3 s durante 5 min, ≥20 muestras por tipo | Revisar pool/locks/recursos; errores separados |
| Avisos | Pendiente apto >60 s; cualquier incierto/worker caído; fallos permanentes | Conciliación administrativa autenticada; sin reenvío automático de inciertos |
| Exportaciones | Trabajo >60 s/fallos; temporales no purgados al caducar | Revisar leases/memoria; limpieza actual diferida al acceso, sin scheduler creado |
| Copia | Fallo inmediato; edad 144 h prealerta /160 h crítica / ≥168 h incumplimiento | Operador/suplente, intento acotado; no reiniciar edad por fallo |
| Disponibilidad mensual | Objetivo 99,5 %; presupuesto 216 min por 30 días | Medición externa persistente pendiente, sin SLA demostrado |

## Copias y recuperación

Requisitos D-14: **UTC, copia semanal, máximo 168 h entre éxitos, RPO ≤168 h, RTO ≤8 h, conservación 30 días**, restauración antes de producción y trimestral después. Domingo 02:00 UTC es **propuesta histórica**, sin horario aprobado. Para margen se propone anticipar la próxima copia a 144 h desde último éxito; sujeto a aprobación operativa, conserva máximo 168 h. Nada se programa aquí.

Una copia buena solo actualiza lastGood tras snapshot consistente, cifrado autenticado, carga externa confirmada y lectura/integridad de vuelta verificada. Conservar timestamp del **snapshot** además de fin de transferencia: medir RPO sin esconder duración de copia/carga. Registrar fallos/ausencia/reloj futuro. backupStatus implementa fronteras para el ensayo, sin scheduler ni almacenamiento externo. Nuevo éxito no borra incidentes. Retener cada copia ≥30 días; sin borrado automático ni permiso de purga. Verificar retención/independencia y recuperación de claves antes de datos reales.

| Cobertura necesaria | Ensayo de esta entrega | Condición antes de producción |
|---|---|---|
| Inventario, custodia/historia, auditoría, comandos/idempotencia, outbox/intentos | Dump de 19 tablas privadas; hashes comparados en destino | Volumen representativo, upload externo y restore en destino aprobado |
| Esquemas, funciones, propietarios, RLS/FORCE, ACL, roles | Roles sin passwords y dump; catálogos comparados y logins mínimos revalidados | Compatibilidad/roles reservados gestionados comprobados |
| Sesiones/enlaces/entregas locales | Cuarentena; sesión anterior 401, enlace pendiente invalidado, entregas inciertas | Revocar sesiones/conciliar también en proveedor real |
| Supabase Auth: usuarios/UUID, MFA, proveedores, settings | **NO EJECUTADO**, identidad doble, no auth.users gestionado | Exportación/procedimiento autorizado y ensayo real; conservar proveedor_ref/MFA/vínculos |
| Configuración, secretos, dominio/TLS, binario/dependencias | Manifiesto sin valores, build y plan versionados | Custodia/rotación, paquete exacto/configuración reconstruible verificados |
| Efectos externos snapshot→recuperación | Avisos pendiente/procesando pasan a inciertos; sin job reclamable | Conciliar efectos posteriores al snapshot por evidencia del proveedor |
| Objetos/adjuntos externos | No hay adjuntos MVP; exportaciones en DB incluidas | Añadir objetos si cambia alcance: dump DB no contiene bytes externos |

npm run test:ops crea contenedores propios, copia AES-256-GCM con IV aleatorio, manifiesto de hashes/versiones y archivo privado 0600 en directorio 0700 bajo work/ ignorado por Git. Clave solo en memoria; no es KMS productivo. Rechaza alteración, truncamiento y clave incorrecta. Restaura roles y pg_restore en destino limpio, sin --clean, errores fatales. Compara hashes/catálogos antes de aislar. Reemite passwords de prueba, no conserva hashes de passwords. No acepta destino del usuario ni borra recursos ajenos; retira solo sus contenedores/volúmenes. Cifrado del ensayo usa buffers pequeños en memoria: **no es agente de copia productivo**.

[recovery-isolation.sql](../ops/recovery-isolation.sql) solo sobre destino restaurado detenido: invalida sesiones locales, intenciones pendientes, entregas de identidad no terminadas y avisos pendiente/procesando; conserva destinatario, propósito/idempotencia. Estados Auth processing/uncertain previos permanecen como evidencia para conciliación humana, no se reactivan. No ejecutar sobre origen. Ensayo reautentica por doble y verifica permisos sin correo. Su duración excluye provisión real, WAN, claves, Auth gestionado y aprobación de reapertura.

## Criterios y evidencia

| Criterio | Resultado |
|---|---|
| CA14-01: plan, ambientes/configuración y CI separados de producción | Implementado/documentado; CI remoto solo se informa si se observa |
| CA14-02: salud/logs saneados, señales/runbook y liberación controlada | Pruebas locales; colector/alertas/proxy gestionados NO CONFIGURADOS |
| CA14-03: copia/restauración de datos, historia/auditoría/outbox/permisos | PASS local en [recuperacion.json](evidencias/fase14/recuperacion.json); gestionado/externo pendiente |
| CA14-04: efectos inciertos/sesiones, fallo de copia/migración y rollback | Cuarentena/reautenticación/fallo DDL verificados; rollback artefacto/plataforma solo procedimiento, NO EJECUTADO |
| CA14-05: objetivos 168 h/8 h/30 días y seguimientos | Umbrales probados; F1-SEG-01/02/03 ABIERTOS; objetivos productivos/retención real NO ACREDITADOS |
| CA14-06: aceptación expresa del usuario | **PENDIENTE**, no marcar COMPLETADA |

Reproducción desde raíz, suites secuenciales con Docker local: npm ci; npm run build; npm test; npm run test:ops; npm run test:ui; npm audit --json; python3 tests/qa/secrets.py. Guardar salida nueva en Fase 14 y preservar artefactos de fases aceptadas que regeneran las suites. [Evidencia](evidencias/fase14/) y resultados consolidados en [PRUEBAS](PRUEBAS.md#fase-14--operación-y-continuidad).

## Bloqueos y siguiente paso

F1-SEG-01: responsable/política legal de datos personales y logs sin aprobar; **no datos reales**. F1-SEG-02: presupuesto/moneda/costos actuales/región/recursos sin aprobar; **no contratar/provisionar**. F1-SEG-03: operador/suplente, día/hora UTC, destino externo, claves, canal/cobertura de alertas sin designar/aprobar; **no continuidad operativa acreditada**. Esta propuesta no los cierra.

Para completar el carril gestionado, elegir/autorizar recursos/destino de pruebas y responsables; resolver seguimientos, ensayar Auth/DB/TLS/artefactos/copias externas/rollback y adjuntar evidencia real. Correo real tiene autorización independiente. Ninguna dependencia inicia Fase 15. Entrega **EN_REVISION**, CA14-06 pendiente y producción bloqueada.

## Fuentes consultadas

2026-11-02: [changelog Supabase](https://supabase.com/changelog), [backup/restore CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), [restauración desde plataforma](https://supabase.com/docs/guides/self-hosting/restore-from-platform), [TLS APIs](https://supabase.com/changelog/cbc-tls-ciphers-deprecated), [PG 15.19/17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes). Roles no incluyen passwords; identidad/settings/objetos requieren cobertura propia. pg_dump genérico puede incluir internos incompatibles con Supabase: no usar el fixture sobre servicio gestionado. CLI no instalada/ejecutada. Cambio TLS previsto 2026-11-10 y actualización PG/extensiones deben contrastarse con destino real; no se presupone versión gestionada ni cambia imagen aceptada de prueba. Sin consulta/modificación de proyectos remotos.

## Migración Fase 9 — preparación vigente

M9-A01, base e224d6f3a15d09899eba2c6a908548eef73014e8. Esta es la guía vigente de preparación; los procedimientos previos no son una orden de aplicarlos. [Informe](migracion/09_PREPARACION_DESPLIEGUE.md), [manifiesto](migracion/09_MANIFIESTO_PREPARACION.json), [pendientes](migracion/09_PENDIENTES.csv), [rollback](RUNBOOK_OPERACION.md#migración-fase-9--corte-y-retorno). F9 documenta; toda ejecución futura necesita su alcance/destino/permiso concreto. Resultado actual: NO_GO para liberar el modelo de destino.

### Escenarios y orden de habilitación

| Escenario | Lo existente | Acción futura condicionada |
| --- | --- | --- |
| Verificación documental local | Python 3, árbol de fuentes y evidencia F8 | Ejecutar verificar_fase9.py; --evaluar-liberacion devuelve 3 mientras existan bloqueos. No requiere DB, Docker o secretos. |
| Ensayo funcional local | Tests con PG17/GoTrue efímeros; v2 persistencia doble | En alcance autorizado, npm ci/build/test/test:ops/test:ui secuenciales; guardar salidas nuevas y restaurar evidencia histórica. No aceptan DSN remota. |
| Laboratorio inventarioTI2 | sovicl/sa-east-1; baseline PG instalada en F5; auditoría de lectura F8 | Identificar ref y ledger/hash antes de cambios; no reaplicar las ocho originales ni diez entradas adaptadas. No existe BFF desplegado/autenticación positiva gestionada acreditada. |
| SQL Server 2016/130 | Cuatro SQL candidatos bloqueados; soporte/repositorios incompletos | Resolver entorno/reglas/implementación y 30 casos de motor/36 reconciliaciones antes de emitir candidato ejecutable. No quitar THROW ni ejecutar T-SQL en Supabase. |
| Promoción/producción | Sin hosting/origen/ventana/operador/paquete autorizados | Exigir todas las puertas aplicables y permiso para SHA/entorno concretos; sigue bloqueada. |

No hay un flag que complete la migración: INVENTORY_BACKEND=postgres conserva v1; sqlserver2016 lanza SQLSERVER_MODEL_NOT_READY antes de crear pools. Main no inyecta v2. No registrar el doble de tests, sustituir respuestas por v1 o habilitar un segundo escritor para simular disponibilidad.

### Preparación de fuente y paquete futuro

1. Revisar SHA remoto y árbol limpio, runtime Node >=24 <25, lock y manifest de migraciones. Resolver **M9-R01** antes de usar main/workflow demo: su Node20 discrepa del runtime declarado. Verify usa Node24 y solo se dispara en PR/main; publicar una rama no acredita un run remoto. F9 no crea PR ni modifica workflows.
2. En una copia de trabajo del commit aprobado, instalar exactamente con `npm ci`, compilar con `npm run build` y realizar las verificaciones pertinentes. Para aplicación normal VITE_DEMO_MODE no debe ser true; la demo es otro artefacto y no acredita seguridad de operación. Registrar configuración de build, Node/npm y SHA/lock. Los comandos de build no despliegan y no son resultados nuevos de esta fase.
3. Empaquetar dist/apps/server y dist/web del mismo build, package/lock, dependencias runtime y fuentes PDF; incluir manifiesto con hashes, versiones y referencias no secretas de configuración/migraciones. Excluir .env, secretos, datos reales, dobles y fixtures. Mantener paquete anterior y demostrar compatibilidad con esquema/configuración. El [manifiesto F9](migracion/09_MANIFIESTO_PREPARACION.json) es una especificación: todavía no existe release ni hash de binario construido.
4. Identificar qué ledger corresponde al destino. Ocho fuentes originales en supabase/migrations son distintas de las diez entradas adaptadas y ACL del laboratorio (migrations/supabase-pruebas/manifest.json); comparar sus mapas/hashes, sin aplicarlas ambas. Las cuatro candidatas SQL Server son otra familia de motor y no entran en runner PG. Una divergencia o versión desconocida detiene la operación.
5. Antes de modificar cualquier base, exigir copia realmente restaurada, ventanas/timeouts/espacio y migración nueva revisada. Mantener originales inmutables. En SQL Server faltan diseño de soporte y candidato ejecutable: no hay comandos de aplicación listos. En Supabase no ejecutar preparación de roles/reset del fixture ni manipular auth interno. No deshabilitar integridad para que una carga pase.

### Configuración, smoke y decisión

Usar [.env.example](../.env.example) como catálogo sin valores y el manifiesto F9 por consumidor. Web: APP_ORIGIN HTTPS exacto, HOST/PORT según ingress privado, DATABASE_URL inventario_auth y BUSINESS_DATABASE_URL inventario_runtime sin propiedad/membresías, claves Supabase y AUTH_ENCRYPTION_KEY solo servidor. Worker separado y detenido; NOTIFICATION_DELIVERY_ENABLED=false. Migrador/backup usan credenciales y custodia independientes. No colocar secretos en VITE_*, paquetes, logs o ejemplos; no pedirlos por chat.

El proxy debe probarse con trustProxy:false vigente, CA/TLS verificados y mismos origen/cookies. Verificar live/ready y después login/MFA, roles, revocación, Origin/CSRF, límites, escritura sintética auditada/replay, reporte/descarga privada, reinicio y recursos. Salud 200 no prueba Auth ni modelo SQL Server. Confirmar disable_signup:true tras corrección autorizada de M8-R01; su estado F8 FALLIDA sigue sin evidencia de cierre. No crear cuentas remotas o enviar mensajes para marcar pruebas como realizadas por inferencia.

Antes de corte: firmar [puertas](migracion/09_PUERTAS_LIBERACION.csv), registrar operador/suplente y permiso concreto, fuente/mapas/snapshot, reconciliación y plan de retorno; demostrar una sola fuente escritora y efectos externos aislados. Después de nuevas escrituras, volver al origen congelado puede perder datos: seguir la ventana correspondiente del runbook. Conmutación/tráfico/merge a main/correo no están autorizados por F9. InventarioTI permanece pausado, el laboratorio no es producción y no se contratan recursos por una estimación histórica.
