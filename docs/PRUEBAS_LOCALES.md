# Sistema local de pruebas y pendientes — D-41

2026-11-02. El usuario acepta Fase 15 y solicita pendientes y publicación del sistema en servidor local de pruebas. Destino aclarado: **«En este entorno de trabajo»**. La entrega aceptada es `a9a0742b0f70ff026d36588f96475cca59c4c3f7`; CA15-06 CUMPLIDO y Fases 0–15 COMPLETADAS con los límites documentados. Esta tarea adicional autoriza exclusivamente la instancia local sintética; no constituye una Fase 16 ni autoriza main/Pages/producción.

## Acceder al sistema

**URL:** `https://localhost:8443/`, en el entorno de trabajo donde se ejecutó esta tarea. Es una instancia funcional de UI/BFF con PostgreSQL y GoTrue locales reales; no es el prototipo ni una identidad doble. Escucha solo en `127.0.0.1`. No hay túnel público, DNS ni servidor instalado en el computador personal del usuario. D-42 confirma fallo de acceso desde Chrome del computador personal y ausencia de una herramienta de reenvío de puertos en este entorno. Por tanto esta URL no da acceso desde ese equipo: ver [diagnóstico y paquete de instalación local](ACCESO_VISTA_PREVIA.md). Servicio interno sano no equivale a vista previa accesible al usuario.

Las credenciales de prueba se generan aleatoriamente y se conservan solo en `work/local-inventarioti2/`, con directorio 0700 y archivos privados 0600. No están en GitHub. Para ver las dos cuentas interactivas, desde la raíz:

```sh
node ops/local/control.mjs credentials
```

Cuenta `admin@example.invalid`: administrador; al primer ingreso configurar autenticador y verificar TOTP de seis dígitos. Cuenta `lectura@example.invalid`: lectura. Las contraseñas las muestra el comando anterior, no existen contraseñas predeterminadas reutilizables. No compartirlas en issues. Las cuentas `smoke-*` están reservadas para verificaciones automáticas y no se muestran por ese comando; su MFA real no modifica el de la cuenta interactiva.

HTTPS usa una CA de prueba generada exclusivamente para localhost. El navegador debe confiar en el certificado público `work/local-inventarioti2/ca.crt` según su procedimiento local; esta tarea **no instala confianza en el sistema del usuario**. No importar ni compartir `ca.key`/`server.key`. La prueba automatizada usa confianza en la CA para Node y un pin del certificado local para Chromium; no desactiva verificación TLS global. Los certificados y claves JWT de este ensayo tienen vigencia de 7 días: requieren renovación controlada si las pruebas se prolongan, conservando datos y vínculos; no borrar el directorio para renovarlos.

## Iniciar, comprobar, detener y retomar

Requisitos: Linux, Node 24/npm, Docker accesible por `/var/run/docker.sock`, OpenSSL; Chromium para prueba de navegador. Desde una copia de esta rama:

```sh
npm ci
npm run build
node ops/local/control.mjs start
node ops/local/control.mjs status
```

El primer arranque crea únicamente recursos etiquetados con UUID propios, dos volúmenes PostgreSQL, ocho migraciones existentes sin modificarlas, identidad local y datos sintéticos. Requiere espacio para imágenes/capas de Docker: en este entorno se observó uso adicional de unos 2,2 GiB con el driver vfs; no es un requisito universal. Si falta una imagen, Docker descarga el digest fijado, sin sustituirlo por latest. El arranque puede tardar por la descarga; no repetirlo en paralelo. No se usa ningún DSN o secreto de proveedor del usuario.

`start` deja el servicio en segundo plano, limitado a la vida de este entorno; no configura arranque del sistema ni garantiza permanencia tras reemplazar el entorno. En un arranque posterior reutiliza cuentas, claves y volúmenes; espera DB/Auth antes del BFF. `status` informa proceso local; para salud consultar también `/health/live` y `/health/ready`. La validación funcional completa exige el smoke descrito abajo. No ejecutar dos controladores simultáneamente ni usar esta herramienta sobre producción.

```sh
node ops/local/control.mjs stop
node ops/local/control.mjs start
```

`stop` comprueba etiquetas de propiedad y detiene solo el proceso/los contenedores de esta instancia. Conserva volúmenes, credenciales, MFA y datos; no elimina recursos ni ejecuta reset/clean. Si un bootstrap incompleto falla, se conserva su estado y se rechaza un reset automático. Diagnóstico privado: `work/local-inventarioti2/service.log` y estado local; no copiar su contenido completo a GitHub. El registro HTTP de BFF está saneado por plantilla.

## Qué queda preparado y qué se comprobó

Hay dos unidades, dos funcionarios ficticios, tres bienes iniciales en condición bueno/regular/malo, dos cuentas interactivas y dos de smoke. Las verificaciones añaden bienes/avisos de prueba auditados; no se borran al terminar. Fechas de aplicación UTC. Roles SQL de acceso y negocio separados, RLS/Origin/CSRF y MFA administrativo conservados. `main.ts` del BFF se ejecuta sin modificaciones; el gateway local aporta TLS y enrutamiento al Auth local.

Los tres contenedores comparten una red Docker **internal**, sin puertos DB/Auth publicados; el host se conecta por el puente privado. El gateway escucha solo loopback. Worker empresarial no iniciado, `NOTIFICATION_DELIVERY_ENABLED=false`, sin credenciales Resend; GoTrue apunta SMTP a un endpoint loopback sin servicio y la red interna no tiene salida externa. Las invitaciones/recuperación no ofrecen entrega de correo real: pueden quedar pendientes/inciertas conforme a su contrato. No activar worker ni intentar enviar a buzones reales.

Verificación reproducible, desde raíz; el ejemplo usa una ruta relativa al checkout para confiar solo en esta CA local:

```sh
NODE_EXTRA_CA_CERTS="$PWD/work/local-inventarioti2/ca.crt" node ops/local/verify.mjs
```

El smoke usa cuentas reservadas y conserva resultados saneados en `work/local-inventarioti2/verification.json`: salud/TLS, sesión requerida, Origin, lectura y denegación administrativa, bloqueo antes de MFA, TOTP real, CSRF, escritura/replay, XLSX privado, outbox sin envío, aislamiento de contenedores, navegador y revocación. No es carga, recuperación integral ni certificación de accesibilidad. Evidencia versionada: [smoke](evidencias/pruebas-locales/smoke.json), [reinicio](evidencias/pruebas-locales/reinicio.json) y [registro de verificación](PRUEBAS.md#publicación-local-de-pruebas--d-41).

Primeros intentos: el puerto publicado de una red Docker interna no fue utilizable; se corrigió a conexión por puente privado. Otro intento falló por espacio durante initdb. Se retiraron exclusivamente contenedores/volúmenes/redes etiquetados de estos intentos no inicializados, conservando diagnóstico privado; no se ejecutó prune ni se tocó recurso preexistente. El arranque posterior y el smoke pasaron. No se ocultan estos fallos como éxitos iniciales.

## Pendientes que siguen abiertos

| Grupo | Pendiente y condición |
|---|---|
| F1-SEG-01 | Responsable/política legal de retención de datos personales y logs antes de datos reales; no se inventan plazos ni se purga historia |
| F1-SEG-02 | Presupuesto, moneda, región, recursos/proveedores y costos actuales aprobados; no se contrata nada por estas pruebas |
| F1-SEG-03 | Operador/suplente, horario UTC, destino externo, cifrado/custodia y alertas; copia semanal/máximo 168 h, RPO ≤168 h, RTO ≤8 h y retención 30 días siguen sin acreditación operativa |
| Publicación/operación gestionada | Resolver Pages legacy main:/docs antes de merge/push a main; destino gestionado, TLS/secretos reales, CI del release, recuperación Auth/MFA/settings, copia externa y rollback de plataforma siguen pendientes |
| Correo | Integrar y verificar canal de identidad y proveedor empresarial por separado, con destinatarios/autorización de envío propios; esta instancia no envía correo real |
| Personas y dispositivos | Capacitación con participantes y actas, onboarding por desarrollador nuevo, Safari/iPad/iPhone físicos, lector de pantalla y accesibilidad completa |
| Evolución | Recuperación pública/tiempos, rotación y recuperación de claves/MFA, retención/limpieza, contrato API consolidado, evidencia configurable, concurrencia según medición y eventual SQL Server: ver [ROADMAP](ROADMAP.md) |
| Proveedor | Revisar compatibilidad TLS anunciada por Supabase para 2026-11-10 y versiones reales del destino futuro; el ensayo GoTrue local no la acredita |

La aprobación de Fase 15 no cierra estos pendientes ni convierte el smoke en validación humana. La instancia local reduce la dependencia de dobles para practicar login/MFA y negocio; los ensayos gestionados siguen abiertos. PR #1 permanece en borrador/sin merge, main intacta y sin producción.

## Continuar en un nuevo chat

No se crea otro chat automáticamente. Punto de continuidad sugerido:

> Recupera la rama phase14/ci-prerequisites-and-pages-guard del PR #1 de inventarioTI2 y lee AGENTS.md, FASES.md, ESTADO_PROYECTO.md y docs/PRUEBAS_LOCALES.md. Fase 15 está aprobada por D-41; no vuelvas a pedir su autorización. Revisa los pendientes y el estado del servidor local de pruebas en este entorno. Conserva las cuentas, MFA, claves y volúmenes existentes; no reinicialices ni reenvíes avisos. Trabaja solo en el alcance de pruebas que te indique, actualiza GitHub sin merge a main por Pages y mantén producción/correo real deshabilitados.
