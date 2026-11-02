# Preparación de vista previa HTTPS temporal — D-44

2026-11-02. Continuación de pruebas desde `1c08afc` del PR #1, rama
`phase14/ci-prerequisites-and-pages-guard`. Fases 0–15 aceptadas; no nueva fase.

## Estado comprobado

**VP-01 BLOQUEADO: sin URL pública ni prueba Chrome Windows.** Las consultas de
permiso externo no tienen respuesta al preparar esta entrega. El silencio no
autoriza publicación. No entregar localhost remoto como acceso del usuario.

Este entorno nuevo no contenía el estado privado, contenedores ni volúmenes D-41.
No se afirma recuperar sus datos/cuentas/MFA. Se creó una instancia sintética
independiente con el controlador existente, sin reset/borrado. Evidencia histórica
intacta; credenciales aleatorias y factores solo en work/ protegido. El
administrador interactivo configura su propio autenticador. Correo real apagado.

## Ruta concreta preparada, aún sin publicar

Chrome Windows → HTTPS temporal *.tunnelmole.net → WebSocket TLS por el proxy del
entorno → gateway loopback → BFF con origen exacto → PostgreSQL/GoTrue locales
reales. El proveedor termina TLS y transporta las peticiones sintéticas: requiere
permiso específico. Sin dominio propio, cuenta de pago o producción; sin SLA o
permanencia prometida. No requiere instalar la CA local en Windows.

Cloudflare se descartó antes de publicar: necesita TCP/UDP 7844 y su dialer no usa
el proxy HTTP. Política observada HTTP irrestricta aplicada, sin destinos TCP
concedidos. No se intentó eludirla. Handshake TLS/WebSocket hacia
`wss://service.tunnelmole.com:8083` PASS con `NODE_USE_ENV_PROXY=1`, sin mensaje
initialise ni pedir hostname. Prueba salida, no acceso público del usuario.

Scripts opcionales fuera del arranque habitual:

- `ops/local/preview-gateway.mjs`: segundo BFF con origen HTTPS exacto, listener
  solo loopback, rechaza Host/protocolo ajenos y Auth directo. Conserva Origin,
  CSRF, cookies, idempotencia y binarios. GoTrue queda en el HTTPS local confiado;
  no modifica claves, estado, cuentas ni contenedores.
- `ops/local/preview-tunnel.mjs`: cliente mínimo del protocolo abierto Tunnelmole
  2.4.0 con WebSocket nativo Node 24/proxy heredado. Sin instalar CLI/dependencias,
  telemetría adicional o configuración global. Rechaza arrancar sin flag, no
  reconecta con otro origen y cierra gateway con el túnel. **Integración pública
  completa NO PROBADA.**

Solo después de autorización específica, con instancia local iniciada:

```sh
NODE_USE_ENV_PROXY=1 node ops/local/preview-tunnel.mjs --publish-authorized
```

El flag es control operativo, no sustituye el permiso. El comando asignaría el
hostname real y arrancaría el gateway; no entregar un ejemplo como enlace.
Si falta X-Forwarded-Proto: https, se rechaza la petición: comprobar con proveedor
sin retirar ese control para aparentar éxito. Cambio de hostname exige reiniciar
y verificar con el nuevo origen. Ctrl+C cierra túnel/gateway y conserva DB/Auth.

El servidor local sigue bajo `node ops/local/control.mjs status|stop|start`.
No resetear work/ ni volúmenes. Certificados/JWT duran siete días, sin renovación
automática ni garantía de persistencia tras reemplazar el entorno.

## Verificar antes de entregar un enlace

1. Consultar hostname real por HTTPS fuera del listener local: certificado válido,
   documento/assets, salud 200 y cabeceras de proveedor. Revisar HTTP sin enviar
   credenciales hasta confirmar redirección/rechazo.
2. Repetir con ese origen login lectura/admin/MFA real, rechazo Origin/CSRF,
   escritura/replay, reportes/descarga privada, aislamiento y revocación. Cookies
   Secure/HttpOnly/SameSite, RLS y correo apagado; no reasignar pruebas locales.
3. Navegador externo con TLS normal, sin ignorar errores. Credenciales solo por
   medio privado, nunca GitHub; smoke reservado sin consumir MFA interactivo.
4. Confirmar que abre desde Chrome Windows del usuario. Separar prueba externa
   automatizada de observación humana. VP-01 pendiente hasta entonces.

## Evidencia de esta preparación

| Ejecutado | Resultado y límite |
|---|---|
| npm ci y npm run build | PASS, lockfile/dependencias existentes intactos |
| Smoke existente con NODE_EXTRA_CA_CERTS apuntando a ca.crt local | [12 grupos PASS](evidencias/vista-previa-d44/local-smoke.json), Chromium local con pin; no Windows |
| npx --no-install tsx --test tests/ops/preview-gateway.test.ts | PASS: Host/protocolo/rutas rechazados, cabeceras/cuerpo/binarios/cookie preservados y upstream caído 503 |
| Gateway + BFF/DB/Auth reales con hostname sintético, sin red externa | [11 grupos PASS](evidencias/vista-previa-d44/gateway-loopback.json), roles/MFA/CSRF/escritura/replay/XLSX privado/logout; driver derivado del smoke en work/preview/verify-loopback.mjs, sin navegador/TLS externo |
| Stop/start y huellas privadas | [PASS](evidencias/vista-previa-d44/reinicio.json): conteos bienes/cuentas/outbox e IDs/hashes de contraseña/factores MFA intactos; no recuperación D-41 |
| Sintaxis scripts y rechazo de túnel sin flag | PASS, sin asignar URL/publicar |
| Handshake WebSocket TLS por proxy | PASS sin inicializar túnel; no prueba ruta pública |

`python3 tests/qa/secrets.py`: PASS sin hallazgos; el resultado nuevo se separó
en [secretos](evidencias/vista-previa-d44/secretos.json). Este verificador regenera
su salida histórica: se restauró la versión aceptada y se comprobó igualdad byte
a byte de los 136 archivos previos. [Preservación y 615 enlaces válidos](evidencias/vista-previa-d44/preservacion.json).

No ejecutados: túnel publicado, integración pública completa, Chrome Windows,
hardware/Safari ni suites históricas completas que regeneran evidencia aceptada.
No atribuir CI nuevo sin observarlo. Cero avisos sintéticos aceptados/entregados.

## Pendientes y decisión final

Primero autorizar/verificar esta ruta o comprobar el paquete Windows/WSL2 en el
equipo del usuario. **No hay acceso remoto listo para entregar.** Después siguen
[F1-SEG-01/02/03 y EV15-01–13](ROADMAP.md): retención legal; presupuesto/proveedores;
operador/copia externa/restauración; Pages; destino gestionado; correo;
compatibilidad TLS; formación; accesibilidad/dispositivos; recuperación/rotación/
limpieza; API y evolución. Enumerarlos no autoriza ejecutarlos. Main/Pages y
producción intactos; PR #1 en borrador/sin merge. Sin nueva fase.

Fuentes: [Cloudflare red](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/tunnel-with-firewall/),
[dialer](https://github.com/cloudflare/cloudflared/blob/2026.10.7/edgediscovery/dial.go),
[cliente Tunnelmole](https://github.com/robbie-cahill/tunnelmole-client),
[protocolo servidor](https://github.com/robbie-cahill/tunnelmole-service/blob/main/src/handlers/handle-request.ts),
[Supabase changelog](https://supabase.com/changelog.md).
Sin proyecto Supabase gestionado consultado/modificado ni cambios de schema/RLS.
