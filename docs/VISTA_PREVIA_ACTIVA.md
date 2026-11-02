# Vista previa HTTPS autorizada y verificación — D-45

2026-11-02. Usuario autoriza el túnel temporal con «autorizo», y posteriormente
indica «Retoma». Se continúa el alcance aprobado sin repetir permisos. Fases
0–15 aceptadas; no nueva fase. PR #1, rama phase14/ci-prerequisites-and-pages-guard.

## Estado de acceso, sin confundir observaciones

Ruta activa al verificar: **https://8lyag2-ip-90-96-187-67.tunnelmole.net/**.
Se comprobó HTTPS 200, assets y salud a través del proxy del entorno. HTTP devuelve
400, sin servir login/credenciales. El [smoke público](evidencias/vista-previa-d45/public-smoke.json)
prueba BFF/PostgreSQL/GoTrue reales y navegador Chromium Linux por esa dirección,
con TLS normal; no es una prueba realizada desde Windows.

**VP-01 sigue PENDIENTE de confirmar la ruta nueva desde Chrome Windows.** El
primer hostname h0na48-ip-90-96-187-67.tunnelmole.net devolvió ERR_INVALID_RESPONSE
al usuario y se retiró. Ese fallo no se considera resuelto por un 200 del entorno.
Se solicitaron dirección exacta/contexto de red y comprobación de la URL nueva;
la respuesta sobre la nueva ruta no está disponible al preparar esta entrega.
No declarar lista la vista para ese equipo antes de observar el resultado.

El handshake y las peticiones públicas del entorno pasan por su proxy; las
comprobaciones HTTP/1.1 y HTTP/2 observadas tampoco certifican la conexión directa
Windows→proveedor. Google DNS resolvió el primer hostname; un intento de consulta
HTTP desde un servicio independiente falló también con su control, por lo que
no aporta evidencia sobre la ruta. La causa de ERR_INVALID_RESPONSE no está
confirmada. No se cambia TLS, MFA, CSRF o permisos para ocultar el fallo.

## Corrección funcional comprobada

Las primeras pruebas públicas pasaron API pero fallaron esperando el inventario
en el navegador. Se reprodujo un caso independiente: al entrar sin hash inicial,
pulsar Bienes mientras su consulta está pendiente cambia el hash, incrementa la
generación y descarta la respuesta aunque la vista siga siendo la misma.
La latencia del túnel hizo visible esta carrera, que la prueba local rápida no
había detectado. No se atribuye a esta carrera el ERR_INVALID_RESPONSE de Windows.

`apps/web/src/main.tsx` ahora ignora el cambio de hash que conserva la vista y
actualiza el listener cuando cambia la vista. Conserva el descarte de respuestas
que sí pertenecen a otra navegación/sesión. Test nuevo `tests/ui/navigation.test.ts`
falló antes de corregir y pasó después: respuesta retenida hasta pulsar la vista
actual, aparición del bien y navegación Unidades→Bienes. Este test usa una
fixture UI aislada; no se presenta como autenticación real. El smoke público
posterior sí usa DB/Auth reales y pasó navegación/inventario/logout.

El BFF conserva index.html al arrancar; recompilar sin reiniciarlo seguía sirviendo
la referencia JS anterior. Se inició un segundo gateway con PREVIEW_PORT=8751 y
un hostname nuevo, se verificó la versión corregida y se detuvo el túnel anterior.
No se resetearon DB, cuentas, MFA, claves o datos. El controlador local D-44
permanece activo para el Auth privado; el BFF público usa origen exacto nuevo.

## Operación temporal y accesos

El proceso del túnel está separado de la llamada interactiva y escribe solo logs
saneados en `work/preview/tunnel-active.log`. PID privado en
`work/preview/tunnel-active.pid`. No lanzar duplicados si ya está activo. La vida
depende del proceso, del proveedor y del entorno; sin SLA, arranque del sistema o
permanencia prometidos. Reemplazar el entorno puede perder recursos; no se afirma
recuperación de D-41. Datos/cuentas/MFA de D-44 se reutilizaron íntegramente.

Comprobar estado y salud mediante el hostname exacto y el controlador local. Para
detener, verificar primero que el PID guardado corresponde a
`ops/local/preview-tunnel.mjs --publish-authorized` y enviar SIGTERM solo a ese
proceso. El túnel cierra su gateway/BFF, conservando DB/Auth. Después, si procede,
`node ops/local/control.mjs stop` conserva volúmenes/cuentas/MFA. Para reiniciar se
requiere iniciar primero el controlador local; un nuevo túnel puede dar otro
hostname y exigirá repetir las comprobaciones. No borrar work/ ni volúmenes.

Arranque manual autorizado, sin crear otro si ya está activo:

```sh
NODE_USE_ENV_PROXY=1 PREVIEW_PORT=8751 node ops/local/preview-tunnel.mjs --publish-authorized
```

Las contraseñas sintéticas se entregan solo en el chat privado; no figuran aquí,
en GitHub, logs, evidencias o capturas. Se conservan las dos cuentas interactivas
admin@example.invalid y lectura@example.invalid. Administrador debe configurar
su propio autenticador TOTP; los ensayos consumen únicamente el MFA reservado
smoke-admin. Correo real/worker apagados; cero avisos aceptados/entregados. No se
inician invitaciones/recuperaciones ni envíos externos.

## Verificación reproducible y límites

```sh
npm run build
npx --no-install tsx --test tests/ops/preview-gateway.test.ts tests/ui/navigation.test.ts
NODE_USE_ENV_PROXY=1 node ops/local/verify-preview.mjs https://8lyag2-ip-90-96-187-67.tunnelmole.net
```

El último comando usa las cuentas reservadas y añade un bien sintético y una
exportación privada, sin borrarlos. No altera el MFA interactivo. Guarda resultados
saneados en work/local-inventarioti2/public-verification.json; incluir origin,
hashes de scripts/frontend y commit base evita atribuirlos a otra versión.

Resultados: build PASS; dos tests de gateway/guardia y uno de navegación PASS;
[12 grupos públicos](evidencias/vista-previa-d45/public-smoke.json) PASS, incluidos
lectura/admin, MFA TOTP, Origin/CSRF, escritura/replay, XLSX privado/otra cuenta,
correo apagado y revocación. [Registro de límites](evidencias/vista-previa-d45/acceso.json).
No ejecutados: Chrome Windows sobre hostname nuevo, hardware/Safari, rendimiento
objetivo ni operación gestionada/producción. No se repiten suites que regeneran
evidencias aceptadas. CI 41505628717 SUCCESS corresponde a c4dcb71, no a estos
cambios posteriores; observar el CI nuevo por separado.

Los pendientes F1-SEG-01/02/03 y EV15-01–13 del [roadmap](ROADMAP.md) siguen abiertos.
No se reabre aprobación de fases. Main/Pages/producción intactos, PR #1 en borrador
sin merge y sin gastos. [Preparación D-44](VISTA_PREVIA_REMOTA.md) queda histórica;
la autorización externa allí pendiente fue otorgada expresamente en esta sesión.
