# Resultado MTEST-A01

> Actualización posterior: [entorno conectado privado activo](ENTORNO_ACTIVO.md). Este comprobante conserva el estado histórico de preparación dd9bfa2.

Fecha: 2026-11-04 UTC. **Preparación implementada y verificada; acceso público conectado pendiente de configuración privada.** No hay una URL temporal activa.

## Entrega y pruebas

Código en [PR #5](https://github.com/amsotov/inventarioTI2/pull/5), rama `pruebas/entorno-real-supabase`. El commit de código `4c7b21547c02edd65968a20f9257b84462970156` pasó [CI41826937886](https://github.com/amsotov/inventarioTI2/actions/runs/41826937886): **300/300 pruebas** (233 Node, 4 operativas y 63 de interfaz), build, auditoría npm sin vulnerabilidades y escaneo heurístico sin coincidencias. Las comprobaciones operativas de restauración pasaron en CI.

Los ensayos nuevos usan PostgreSQL real, Supabase Auth/GoTrue local con MFA y navegador con persistencia/recarga. El ensayo de interfaz PostgreSQL utiliza un proveedor de identidad doble local; GoTrue se prueba por separado con SDK/BFF y el mismo repositorio real. No se presenta la identidad doble como Auth remoto.

Se comprobó además pg_dump/pg_restore de **59 tablas**, datos, propietarios/ACL/RLS, outbox pendiente y revocación de sesiones en otra base del mismo clúster sintético. No certifica recreación de roles, respaldo de Supabase Auth gestionado ni RTO productivo. El ensayo legacy de dos contenedores agotó el disco VFS local; se conserva esa evidencia y el éxito posterior de CI, sin reescribir el resultado local.

El paquete conectado pasó otro recorrido Chromium 6/6: portada Equipos y relaciones sin modo demo, altas/edición/recarga, técnica/componentes, movimientos/mantenciones, funcionarios/pertenencias y permisos de lectura. Los reportes v1 conservan su origen independiente.

## Supabase preparado

- Proyecto: inventarioTI2, `yhsfotxhaptinjtmrinn`, sovicl/São Paulo.
- Migración remota: `20261104121044 modernizacion_laboratorio`; archivo CLI local `20261104111238_modernizacion_laboratorio.sql`. Correspondencia explícita; historial sin reparar.
- Esquema privado `laboratorio_ti`: **30 tablas/117 columnas del núcleo y 10 tablas de soporte**; RLS ENABLE/FORCE en las 40. Sin EXECUTE para anon/authenticated/PUBLIC; advisor de seguridad sin observaciones.
- Semilla sintética cargada una vez: **6 equipos y 3 funcionarios nuevos**. Los **6 bienes legacy** permanecen. No se migraron datos operacionales.
- Cuentas de aplicación/Auth, sesiones y outbox: **0**. `inventario_auth`, `inventario_runtime`, `inventario_worker`, lector y servicio modernos conservan NOLOGIN/NOSUPERUSER/NOBYPASSRLS. Bootstrap y apertura de cuentas no ejecutados.
- Barrera de arranque consultada como runtime: `postgres-lab-v1`, `adminBound=false`, `readerBound=false`.
- Proyecto anterior inventarioTI: **INACTIVE**; no reactivado.

La API real usa el BFF y las mismas sesiones/CSRF/MFA. Las escrituras de los 17 contratos habilitados confirman dominio + historia + versión + comando idempotente + auditoría + aviso pendiente en una sola transacción. El propósito `modelo_v2` no tiene entrega habilitada: worker apagado. Perfiles, bajas finales/reactivaciones/compensaciones y SQLServer 2016/130 mantienen sus pendientes.

## Entorno virtual

Imagen local construida `inventarioti2-prueba:4c7b21547c02`, ID `sha256:89e05d8502728dbe3f8486a90a85ef7581aba2929547d41d3d48f5ee59be53c5`, 271927478 bytes. Contiene servidor/web y dependencias de producción; se verificó ausencia de `.env`, SQL de migraciones, tests, dependencias de desarrollo y CA efímero de construcción. Usuario node y verificación TLS obligatoria; HTTPS desde la imagen llegó a Supabase (401 esperado sin clave). La conexión SQL del BFF sigue pendiente de credenciales/red. Compose válido, puerto en loopback, raíz de solo lectura y logs rotados.

El arranque sin configuración termina con `STAGING_REQUIRED`, antes de escuchar. No hay proceso web ni túnel abierto y la imagen no se subió a un registro público. GitHub Pages continúa como demo independiente.

La configuración privada inicial está preparada fuera del repositorio (directorio 700/archivos 600): clave de cifrado, passwords SQL aleatorios y clave publicable. No se activaron esas contraseñas en Supabase. La consulta actual de Auth confirma `disable_signup=false`, sin modificar la configuración.

## Lo necesario para abrir la prueba

1. Vincular en el almacén privado del entorno/VM las conexiones SQL con roles mínimos, claves Supabase, clave de cifrado y certificados CA de la [guía](../PRUEBA_REAL_SUPABASE.md). El entorno actual declara cero secretos/identidades y ningún destino TCP autorizado; necesita acceso PostgreSQL y un ingreso HTTPS o una VM con esa conectividad.
2. Cerrar el registro público de Auth y preparar dos identidades sintéticas confirmadas sin enviar invitaciones. El conector disponible no modifica configuración Auth ni entrega claves secretas de servidor; no se escriben tablas internas de Auth para eludirlo.
3. Ejecutar una vez el bootstrap con los UUID elegidos expresamente. El administrador configura su propio MFA. Ejecutar preflight y abrir el ingreso temporal con el origen/redirects exactos.

No enviar contraseñas ni claves por el chat. La migración y la semilla ya están aplicadas: **no repetirlas**.

Evidencias: [manifiesto](evidencias/manifest.json), [Supabase](evidencias/supabase_final.json), [CI](evidencias/ci_source.json), [contenedor](evidencias/container.json). Fuentes/modelos, cuatro SQLServer candidatos y artefactos históricos preservados.
