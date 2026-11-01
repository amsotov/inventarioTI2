# Autorización, privacidad y seguridad — Fase 6

**Estado: COMPLETADA — aceptada por D-23** · 2026-10-31 · Autorización D-21 ratificada por la solicitud actual. Entrega y cierre aceptados expresamente por el usuario; los límites operativos se conservan. Base `9845b10`. Solo entorno sintético local, sin despliegue ni cambios remotos de permisos.

## Alcance y aceptación

Dependencias: [requisitos](REQUISITOS.md), [cierre D-14](CIERRE_FASE1.md), [arquitectura aceptada D-17](ARQUITECTURA.md), [datos D-19](BASE_DATOS.md) y [autenticación D-21](AUTENTICACION.md). Plan: matriz/amenazas, roles SQL mínimos, contexto transaccional validado, RLS, privacidad, auditoría técnica, endurecimiento HTTP y pruebas negativas. Spec Kit no detectado; no instalado.

| Criterio | Entrega / validación |
|---|---|
| CA6-01 | Matriz cerrada de dos roles y permisos desconocidos denegados |
| CA6-02 | Roles SQL sin propiedad/BYPASSRLS; lectura RLS y administración aisladas |
| CA6-03 | Sesión/rol/estado/versión/credencial/MFA vigentes, contexto local, pool limpio y revocación |
| CA6-04 | Privacidad, auditoría inmutable, controles HTTP y modelo de amenazas |
| CA6-05 | Pruebas negativas reproducibles en PostgreSQL real; límites y evidencias en PRUEBAS |
| CA6-06 | CUMPLIDO por D-23: usuario acepta entrega y cierre de Fase 6; Fase 7 autorizada para un nuevo chat |

## Matriz y ámbito empresarial

| Permiso del servidor | Administrador con MFA | Lectura |
|---|---|---|
| inventario.consultar / historial.consultar | Sí | Sí |
| reportes.exportar (ordinarios) | Sí | Sí |
| inventario.modificar | Sí, sujeto al servicio futuro | No |
| cuentas.administrar / configuracion.administrar | Sí, sujeto al servicio futuro | No |
| auditoria.consultar / auditoria.exportar | Sí | No |
| Editar/borrar historia o auditoría; permisos desconocidos | No | No |

Inventario compartido por toda la organización: unidad, bien o funcionario no son ámbitos de propiedad ni cuentas. No se inventa ABAC por unidad ni restricciones por propietario. RNF-01/RF-08/RF-13 requieren distinguir historial empresarial (ambos roles) de auditoría (solo administrador). La función `allowed` valida una lista cerrada; ningún rol del cuerpo HTTP ni `user_metadata` participa.

Los permisos de modificación son la política para futuros servicios. **Esta fase no concede DML empresarial genérico a ningún rol de negocio**, ni crea endpoints de inventario, cuentas, reportes o panel. Los casos de uso atómicos y restricciones de propio rol/último administrador concurrente deberán implementarse en fases 7/9/10; no existen todavía operaciones de administración habilitadas que eludan esos controles.

## Fronteras de confianza y contexto

1. Navegador: cookie opaca HttpOnly/Secure/SameSite=Strict. Origin exacto en mutaciones y token CSRF vinculado a sesión en operaciones autenticadas. Sin tokens de proveedor en cliente.
2. `AuthService.withPrincipal`: reutiliza validación estricta con proveedor, estado, credencial disponible, versión, 30 min/8 h y MFA. Mantiene locks de sesión/cuenta y serialización de autenticación hasta terminar el callback; una revocación espera la operación ya autorizada y se aplica a la siguiente. No usar `status` como autorización de negocio: admite sesión parcial para enrolar MFA.
3. `Authorization.run`: puerto interno, sin endpoint nuevo. Recibe permiso definido por código, callback SQL interno y CSRF cuando hay mutación. Verifica identidad SQL, abre transacción de negocio, usa `set_config(..., true)` parametrizado con la huella SHA-256 de la sesión y resuelve principal desde BD. El callback solo se ejecuta tras autorización. El rollback/commit elimina contexto antes de devolver la conexión al pool. Los permisos de mutación rechazan también la omisión de CSRF.
4. `seguridad.principal`: relaciona huella con sesión y cuenta reales; comprueba cuenta activa, credencial, versión, revocación, caducidad, marcas de tiempo no futuras y MFA administrativo. Ignora variables de actor/rol falsificadas. Nunca devuelve tokens, correo, CSRF o cifrados.

La transacción de Auth y la de negocio usan pools distintos; no hay atomicidad distribuida. Los futuros cambios empresariales/evidencia/outbox deberán quedar juntos en la única transacción del callback, con idempotencia para una respuesta perdida tras commit. El callback no debe reingresar a Auth (serialización global retenida), hacer envío externo ni confirmar su propia transacción. Esto es un contrato interno para fases posteriores, no API empresarial implementada.

La huella de sesión es un secreto equivalente a una capacidad de acceso SQL: no registrarla ni exponerla. Un usuario con acceso al rol SQL de negocio y una huella válida puede usar ese contexto: la barrera contra SQL arbitrario es mantener credenciales solo en servidor y todas las consultas parametrizadas. La validación viva del proveedor ocurre en el BFF, no mediante llamadas externas desde RLS. Compromiso del BFF/credenciales SQL o del propietario de migraciones queda fuera de la garantía de RLS; no se promete defensa absoluta frente a un administrador de base de datos.

## Privilegios SQL y RLS

Migración aditiva `20261031182220_autorizacion_seguridad.sql`, generada con CLI Supabase 2.122.0. No altera las migraciones aceptadas. Crea roles NOLOGIN, sin membresías, superusuario, creación de roles/BD ni BYPASSRLS:

- `inventario_auth`: acceso a las cuatro tablas privadas de autenticación y SELECT de cuentas; UPDATE limitado a proveedor_ref, estado, version_autorizacion, credencial_lista. Sin actualización de rol/nombre/correo ni acceso al inventario. Es un componente de confianza capaz de emitir sesiones; sus credenciales se aíslan de negocio.
- `inventario_runtime`: SELECT compartido en unidades/funcionarios/bienes/pertenencias/movimientos/custodias/anotaciones, condicionado a principal válido. SELECT de cuentas/configuración/auditoría solo con administrador vigente. Sin acceso a sesiones, intenciones, entregas, límites, comandos ni outbox. INSERT de bitácora técnica solo para el propio actor; no UPDATE/DELETE/TRUNCATE ni DML de negocio.
- `inventario_contexto`: propietario NOLOGIN de una única función SECURITY DEFINER privada, search_path fijo pg_catalog, SELECT exclusivo de cuentas y sesiones mediante políticas explícitas. No propietario de tablas ni BYPASSRLS, sin escritura. Excepción justificada para resolver contexto sin exponer secretos ni provocar recursión de RLS. EXECUTE revocado a PUBLIC y concedido solo a runtime; no membresías otorgadas a los otros roles.

Las políticas se dirigen a roles concretos; `anon`/`authenticated`/PUBLIC no reciben grants. Esquemas privados no deben exponerse a Data API. Sin vistas nuevas ni `auth.role()` ni JWT como autoridad. RLS no reemplaza privilegios de tabla ni validación del proveedor.

`main.ts` rechaza arrancar con propietario, superusuario, BYPASSRLS, rol distinto de `inventario_auth` o membresías. `DATABASE_URL` debe seleccionar ese rol exacto. La migración **no crea login/contraseña ni vincula cuentas SQL**. Aprovisionar identidades reales requiere tarea operativa autorizada; por ello un DATABASE_URL antiguo con postgres deja de ser aceptado deliberadamente. El puerto de negocio futuro requiere un pool separado autenticado exactamente como `inventario_runtime`; nunca reutilizar el pool Auth o service_role. El código comprueba también ese rol antes de cada operación. No hay pool de negocio conectado en main mientras no existan servicios de Fase 7.

## Auditoría y privacidad

RF-12 conserva su tabla empresarial `inventario.auditoria`, ligada a comandos y protegida por triggers/privilegios. La coordinación de auditoría con escrituras empresariales corresponde a cada caso de uso futuro; no se afirma que esté terminada.

Nueva `seguridad.eventos`: actor, permiso enumerado, resultado booleano y fecha UTC del servidor. No admite texto libre, cuerpos, documentos personales, correos, contraseñas, cookies, tokens, hashes de sesión ni valores cifrados. Accesible solo a administrador válido; inserción ligada al propio actor y protección contra UPDATE/DELETE/TRUNCATE. La denegación de permiso de una sesión válida se confirma antes de responder 403. Si el callback falla, la autorización positiva se revierte con el negocio; fallos sin identidad válida no crean eventos atribuibles a una cuenta. No equivale a un SIEM ni a un registro completo de incidentes.

`publicEmployee` usa proyección positiva de id técnico, nombre, cargo, unidad y activo: excluye RUT/ID personal, documento normalizado, correo y cualquier campo futuro. Es un componente verificado para exportaciones ordinarias de Fase 11; todavía no hay exportador integrado. Las fichas autorizadas pueden acceder a datos personales conforme A-10. No confundir UUID interno con documento personal. Auditoría administrativa futura debe aplicar su contrato específico de columnas/minimización. No introducir datos reales hasta resolver F1-SEG-01 con responsable jurídico; no se fija plazo legal por inferencia ni se ejecuta purga.

## Amenazas, controles y límites

| Amenaza | Control implementado y prueba | Riesgo restante |
|---|---|---|
| BOLA/IDOR, escalada de rol | Sesión real, permisos enumerados y RLS por clase de recurso; lectura sin cuentas/auditoría; contexto falso denegado | Pruebas por ID y rutas empresariales en fases 7/10/11, aún inexistentes |
| JWT obsoleto/revocación/MFA parcial | Validación viva de proveedor y versión/estado/credencial/sesión; doble validación DB; locks hasta fin de operación | Integración en proyecto Supabase gestionado pendiente |
| Inyección SQL/contaminación del pool | Parámetros para SID/contexto; SQL interno estático; contexto LOCAL; pruebas tras commit/rollback | Revisar cada consulta nueva; credenciales de servidor comprometidas son frontera de confianza |
| CSRF | Origin exacto, token de sesión y cookie Strict; denegación probada | Nuevas mutaciones deberán pasar token a Authorization y validar Origin |
| XSS/clickjacking | CSP restrictiva, sin inline/eval ni reflexión del token; textContent, frame-ancestors y X-Frame-Options DENY | Frontend futuro y navegadores reales no evaluados aquí |
| Cargas abusivas/tipos erróneos | JSON con esquemas cerrados, 8 KiB, límites de tasa persistentes existentes; 413/415 genéricos | No hay uploads habilitados; antivirus/cuotas de archivos no aplican aún |
| Filtración de PII/secretos | Proyección positiva, no-store, no-referrer, logger desactivado, errores genéricos, auditoría de campos cerrados | F1-SEG-01; revisar logs del proxy/proveedor en operación |
| Manipulación de evidencia | ACL sin escritura destructiva y triggers de inmutabilidad en historia/auditoría/eventos | Propietario de migración puede alterar triggers; separar credenciales y revisar cambios |
| Agotamiento/bloqueos | BodyLimit, rate limit, pool acotado, timeouts de SQL y conexión existentes | Lock global de Auth serializa; medir volumen objetivo en Fase 13, no afirmar rendimiento |
| Dependencias/configuración | Versiones fijadas/lockfile, auditoría npm, rechazo de rol privilegiado | Escaneo de secretos histórico, pentest completo y advisors gestionados no ejecutados |

Cabeceras globales adicionales: CSP, HSTS de 1 año (sin preload/includeSubDomains), Permissions-Policy para cámara/micrófono/geolocalización, nosniff. HTTPS es condición de operación ya exigida por APP_ORIGIN. Respuestas 413/415 ya no se transforman en errores de dependencia; mantienen mensajes sin detalles internos.

## Operación pendiente y respuesta

Ante sospecha: responsable operativo futuro debe desactivar cuenta/incrementar versión y revocar sesiones; suspender credenciales afectadas y conciliar efectos externos inciertos sin reintento ciego. Preservar evidencia y limitar acceso; rotar claves con procedimiento que contemple sobres cifrados pendientes. No se cambian cuentas, claves o datos reales en esta entrega.

F1-SEG-01 retención/jurisdicción, F1-SEG-02 presupuesto y F1-SEG-03 operador/ubicación/claves/alertas/horario de respaldo siguen abiertos. UTC, copia semanal, máximo 168 h/RPO 168 h, RTO 8 h y copias 30 días intactos. No se configura infraestructura ni respaldo.

## Evidencia y fuentes

[PRUEBAS](PRUEBAS.md) y `docs/evidencias/fase6/` contienen ejecución y límites. PostgreSQL real aislado con identidades SQL distintas; proveedor doble para los controles nuevos, regresión GoTrue local separada. No se ejecutan pruebas contra datos reales ni proyecto gestionado, advisors remotos, frontend completo, exportaciones, cargas/archivos o producción.

Fuentes consultadas el 2026-10-31: [changelog Supabase](https://supabase.com/changelog.md), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL roles](https://www.postgresql.org/docs/17/user-manag.html). El índice incluye cambios de PG 17.11 y exposición Data API; este cambio conserva esquemas privados y no habilita Data API. La compatibilidad comprobada es la del PostgreSQL 17 fijado por digest en los tests, no una actualización del proveedor.


## Aceptación de Fase 6 — D-23

2026-10-31. «Aprobado fase 6. Inicia fase 7 en nuevo chat». Acepta `336232a9b1add5c6605f396a90795e419022756c` y cumple CA6-06. No se modifican controles, migraciones, pruebas ni evidencias; Fase 7 autorizada para un nuevo chat, ejecución pendiente. Conservados pendientes de logins SQL reales, proyecto gestionado, retención legal y operación. No despliegue ni autorización de fases 8–15.


## Entrega de Fase 7 — 2026-10-31

Fase 7 agrega pool empresarial separado y función privada guardar_bien, con rol NOLOGIN sin BYPASSRLS ni propiedad de tablas. Runtime conserva DML directo denegado; RLS administrativo en el servicio y actor derivado de principal. Sin permisos remotos ni logins reales. Ver [BACKEND_API](BACKEND_API.md).


## Incremento de Fase 9 — 2026-11-01

Panel de Fase 9: rol SQL privado inventario_admin sin propiedad/BYPASSRLS, RLS, principal vigente, MFA, CSRF/Origin, propia cuenta protegida, serialización SQL y revocación por versión. No DML directo de runtime ni grants públicos/remotos. Pruebas nuevas y límites en [ADMINISTRACION](ADMINISTRACION.md) y PRUEBAS; evidencia histórica conservada.
