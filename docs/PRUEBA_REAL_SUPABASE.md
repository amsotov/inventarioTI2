# Prueba temporal conectada — inventarioTI2

Fecha: 2026-11-04, UTC. Alcance MTEST-A01, posterior al cierre documental de las fases 0–9.

## Solicitud y estado

El usuario solicita «una prueba real en sitio temporal conectado con la base de datos real», precisa **Supabase inventarioTI2 con datos de prueba**, autoriza **crear un entorno virtual** y elige **la interfaz modernizada completa**. Se preparan persistencia PostgreSQL, interfaz existente, autenticación y empaquetado del servidor. No se crea una fase 10.

**Estado: preparación local verificada; activación remota pendiente de secretos, cuentas Auth y ruta HTTPS.** No hay URL de prueba conectada publicada. GitHub Pages conserva su demo independiente. El estado remoto y los ensayos de esta entrega se registran en [el comprobante](prueba-real/RESULTADO.md).

El proyecto previsto es `yhsfotxhaptinjtmrinn`, organización sovicl, São Paulo. `inventarioTI` anterior permanece pausado. La instancia SQL Server 2016/130 sigue pendiente; este laboratorio PostgreSQL no certifica su compatibilidad ni cierra decisiones productivas.

## Qué queda implementado

| Parte | Comportamiento de esta entrega |
|---|---|
| Interfaz | Las vistas React modernizadas existentes; compilación conectada con ambos flags demo desactivados y base `/`. Entrada inicial Equipos y relaciones por flag de compilación del paquete; sin simulador de persistencia. |
| Servidor | Fastify/BFF existente y mismas sesiones, MFA de administrador, CSRF/Origin y autorización. Activación explícita `postgres-lab` solo en staging/proyecto autorizado. |
| Modelo | Esquema privado `laboratorio_ti`: las 30 tablas y 117 campos enmendados del núcleo, más 10 tablas de soporte. Variante explícita para PostgreSQL 17. |
| Lectura | Catálogos técnicos y organización, equipos/detalles/técnica, funcionarios y edición privada, historia y mantenciones. Filtros y paginación SQL acotada; cursores ligados a selección; historia en snapshot. |
| Escritura | Altas/atributos de equipos y funcionarios, cuatro subtipos técnicos, componentes/insumos, asignación/devolución/traslado/condición, mantenciones y pertenencias. 17 capacidades de los 18 contratos C03. |
| Atomicidad | La misma conexión/transacción de `Authorization.run` confirma dominio + historia + versión + comando idempotente + auditoría + outbox, antes de responder. Fallos y DTO inválido revierten. |
| Identidad | Supabase Auth se conserva. Vínculo por UUID explícito entre cuenta, USUARIO y FUNCIONARIO; hash externo NULL. La autorización sigue en el servidor, no en metadata editable del usuario. |
| Seguridad | Runtime sin SELECT/DML sobre tablas modernas; solo RPC privados. Propietarios lector/servicio sin LOGIN/SUPERUSER/BYPASSRLS, RLS ENABLE/FORCE, permisos temporales CREATE retirados. Sin acceso anon/authenticated/PUBLIC. |
| Avisos | Cada éxito tiene una fila realmente pendiente. Destinatario sintético `.invalid`; worker fuera del despliegue y entrega deshabilitada. Propósito `modelo_v2` todavía sin despachador/plantilla de entrega habilitados; mantener el worker apagado. No se promete envío. |

`C03-17` (perfiles), bajas finales, reactivaciones y correcciones compensatorias siguen cerradas con 503: dependen de reglas productivas no ratificadas. Las pantallas ya mostraban estas restricciones. El laboratorio no las resuelve por inferencia.

Los reportes y pantallas del inventario anterior siguen usando **v1 y sus propios datos**. Las escrituras v2 no actualizan reportes v1 ni hacen doble escritura. Su coexistencia está identificada en la interfaz. Crear reportes normalizados o migrar registros operacionales exige contratos y correspondencias adicionales; esta entrega no presenta esas salidas como reportes del nuevo núcleo.

## Diferencias deliberadas del laboratorio

Los tipos SQL Server Unicode se representan como textos PostgreSQL; sus precisiones/collation no se certifican con este ensayo. Los instantes se conservan en `timestamptz` UTC (microsegundos PostgreSQL), sin atribuirles precisión SQL Server `DATETIME2(7)`. Los DATE/NULL originales permanecen separados; no se fabrican horas.

La semilla es nueva y sintética: 6 equipos y 3 funcionarios; no copia ni transforma los 6 bienes legacy existentes. Las reglas de tipo se limitan a PC/Notebook/Monitor/Impresora/Switch de esa semilla. No constituyen correspondencias productivas. Tampoco se importan asignaciones históricas con fin desconocido: su clasificación como vigente debe resolverse antes de una carga histórica. Las nuevas asignaciones operativas guardan instante UTC conocido y fecha UTC separada; el traspaso referencia la **asignación anterior**.

Para textos opcionales que superan el largo del diccionario, el complemento conserva el original íntegro y la columna del núcleo permanece NULL; no se trunca. Un nombre obligatorio de funcionario mayor de 150 caracteres se rechaza, sin inventar un criterio productivo de acortamiento. Documento/correo/clave de impresión/hash nunca forman parte del DTO público ni de las proyecciones de auditoría nuevas.

## Preparación de Supabase

1. Aplicar únicamente la [migración incremental](../staging/supabase/migrations/20261104111238_modernizacion_laboratorio.sql) sobre la baseline F5 ya instalada en **inventarioTI2**, después de verificar sus tablas, roles y ausencia de `laboratorio_ti`. Usar `apply_migration` para DDL. La creación del archivo se hizo con Supabase CLI 3.0.0. No repetir si aparece instalada.
2. Cargar una vez [seed.sql](../staging/supabase/seed.sql), que aborta si el esquema ya contiene referencias. Sus FK se resuelven desde las identidades generadas; no presupone IDs. No ejecutar la semilla original F5 otra vez.
3. En [Auth / Providers](https://supabase.com/dashboard/project/yhsfotxhaptinjtmrinn/auth/providers), desactivar **Allow new users to sign up**. M8-R01 continúa pendiente hasta observar `disable_signup: true`. El conector disponible no modifica esta configuración; no se intenta eludirlo escribiendo tablas internas de Auth.
4. Crear dos identidades sintéticas de prueba mediante la Admin API o el panel Auth (**Create user**, sin invitaciones ni correos): una para administrador y otra para lectura. Contraseñas diferentes, sin publicarlas. El administrador configura su propio autenticador TOTP al entrar; no existe MFA precompartido.
5. Registrar las dos referencias Auth y los dos UUID de funcionarios sintéticos expresamente elegidos. No vincular por coincidencia de nombre/correo. Los UUID se consultan en `laboratorio_ti.referencias` para los funcionarios sintéticos.
6. Ejecutar el bootstrap una vez desde el operador con secretos: `node scripts/staging/bootstrap.mjs`, después de `npm run build`. Valida las identidades confirmadas por Admin API y vincula las dos cuentas en una transacción SQL. Habilita LOGIN exclusivamente en `inventario_auth` e `inventario_runtime`, con verificadores SCRAM, sin cambiar membresías/propiedad/privilegios y sin tocar `inventario_worker`. Repetir sobre cuentas existentes aborta; no resetea claves.

`staging/supabase/migrations` contiene **el incremento**, no una copia del historial remoto: no ejecutar `supabase db reset`, `db push` ni reparar historiales apuntando solamente a esa carpeta. La baseline gestionada está en `migrations/supabase-pruebas`; la baseline original está preservada en `supabase/migrations`.

## Secretos y configuración

Configurar estos valores en el almacén privado del entorno/servidor. No pegarlos en el chat, GitHub, comandos con valores literales ni capturas. El entorno cloud disponible no tenía credenciales de ejecución vinculadas al preparar esta entrega. Su política permite HTTP por proxy, pero no declara dominios/rangos TCP autorizados; la conexión PostgreSQL requiere habilitar el destino/puerto en la configuración del entorno o usar una VM que disponga de ese acceso. No se elude esta política mediante PostgREST público ni una conexión postgres del BFF.

| Variable | Uso |
|---|---|
| `APP_ORIGIN` | Origen HTTPS exacto del sitio temporal, sin ruta ni `/` final. |
| `DATABASE_URL` | Sesiones como `inventario_auth`; nunca postgres ni service_role. |
| `BUSINESS_DATABASE_URL` | Dominio como `inventario_runtime`. |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publicable del mismo proyecto. |
| `SUPABASE_SECRET_KEY` | Clave de servidor Supabase; únicamente BFF/operador. |
| `AUTH_ENCRYPTION_KEY` | 32 bytes aleatorios en base64, estables entre reinicios. |
| `DB_SSL_CA_FILE` | Archivo CA obtenido del proyecto, montado solo lectura. |

Para un servidor IPv4 persistente, usar el **session pooler** Supabase de São Paulo, puerto 5432 y usuario `rol.yhsfotxhaptinjtmrinn`. La conexión directa `db.yhsfotxhaptinjtmrinn.supabase.co` exige conectividad IPv6 o el complemento de IPv4 ya contratado; esta entrega no contrata nada. El adaptador rechaza otro proyecto/pooler transaccional y verifica CA/hostname; no acepta desactivar TLS.

Solo para el bootstrap del operador: `STAGING_MIGRATOR_DATABASE_URL`, `STAGING_AUTH_DB_PASSWORD`, `STAGING_RUNTIME_DB_PASSWORD`, `STAGING_ADMIN_AUTH_ID`, `STAGING_READER_AUTH_ID`, `STAGING_ADMIN_FUNCIONARIO_REF`, `STAGING_READER_FUNCIONARIO_REF`. Los passwords SQL nuevos son diferentes, aleatorios, base64url de 32–128 caracteres, y deben coincidir con las URLs privadas del servidor. Retirar estas variables administrativas después; no se montan en el sitio.

El bootstrap y el servidor requieren además `APP_ENV=staging`, `MODERNIZATION_BACKEND=postgres-lab`, `SUPABASE_PROJECT_REF=yhsfotxhaptinjtmrinn`, `SUPABASE_URL=https://yhsfotxhaptinjtmrinn.supabase.co` y `NOTIFICATION_DELIVERY_ENABLED=false`. Compose fija esos valores.

## Construir y abrir el entorno virtual

Requisitos: Node 24.19.0, npm/lock del repositorio, Docker/Compose y un ingreso HTTPS o túnel temporal. Sin servicio de hosting conectado ni secretos no hay publicación activa.

```bash
npm ci
npm run staging:package
docker build --secret id=build_ca,src=/etc/ssl/certs/ca-certificates.crt -f staging/Dockerfile -t inventarioti2-prueba:ENTREGA .
```

El empaquetador recompila en modo conectado y copia únicamente servidor compilado, web, dependencias/lock y preflight. `release.json` registra hashes. No copia SQL, pruebas, documentación, `.env`, claves o node_modules del host. El certificado del proxy de construcción se monta como secreto BuildKit y no queda en capas. En un entorno con proxy, pasar sus variables heredadas con `--build-arg HTTP_PROXY --build-arg HTTPS_PROXY --build-arg NO_PROXY`, sin escribir sus valores en el comando.

Preparar fuera del repositorio un archivo basado en [env.example](../staging/env.example), directorio 700 y archivo 600. Definir `STAGING_ENV_FILE`, `STAGING_DB_CA_FILE` y un `STAGING_IMAGE_TAG` inmutable. No ejecutar `docker compose config` sin `--quiet`: puede imprimir el contenido del archivo privado.

```bash
docker compose -f staging/compose.yaml config --quiet
docker compose -f staging/compose.yaml up -d
```

Compose admite el proxy HTTP heredado y monta el certificado de runtime mediante `STAGING_RUNTIME_CA_FILE` (por defecto el bundle CA del host Linux); Node verifica TLS también al consultar Supabase Auth. Esto no concede acceso TCP a PostgreSQL. El contenedor usa usuario node, raíz de solo lectura, sin capacidades adicionales y puerto publicado en loopback. Primero ejecuta `preflight.mjs`: comprueba TLS/roles, esquema, vínculos de las dos cuentas, Admin API y registro cerrado; ante un fallo no inicia el sitio. Después sirve web y API en el mismo origen. `/health/live` y `/health/ready` no devuelven credenciales.

Conectar el ingreso HTTPS de la VM a `127.0.0.1:3000`. Si se usa un túnel efímero, obtener primero su dominio, configurar ese origen exacto en `APP_ORIGIN` y limitar Site URL/redirects Auth al dominio y `/acceso`. Con Cloudflare Quick Tunnel, si el binario ya está instalado, el comando es `cloudflared tunnel --url http://127.0.0.1:3000 --no-autoupdate`; no se ha iniciado un túnel en esta entrega. No cambiar DNS de sitios existentes. Al cambiar el dominio del túnel hay que actualizar el origen y los redirects y reiniciar; las cookies anteriores no se trasladan.

## Ensayo y cierre

Entrar con lectura y verificar catálogos/fichas/historia sin controles de escritura. Entrar con administrador y completar MFA. Crear/editar un equipo, completar técnica, asignar/trasladar/devolver, registrar condición/mantención y cambiar pertenencia de un funcionario. Recargar y volver a entrar: los cambios deben permanecer. Confirmar versión/conflicto/idempotencia y ausencia de secretos en respuestas/logs.

Comprobar por separado v1/reportes antiguos: sus muestras y cifras no equivalen a los equipos v2. No ensayar bajas finales, reactivaciones, perfiles, correo, datos operacionales o SQL Server bajo esta habilitación.

Para detener la prueba, cerrar el túnel/ingreso y ejecutar `docker compose -f staging/compose.yaml down` con la misma configuración privada. No borrar tablas ni aplicar un rollback automático de datos. Conservar recibos/auditoría y tratar cualquier retirada de cuentas/roles como una acción de cierre concreta. Mantener apagado el worker.
