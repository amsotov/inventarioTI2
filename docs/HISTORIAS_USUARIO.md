# Historias de usuario y criterios — Fase 1

**Fecha:** 2026-10-31 · **Estado:** COMPLETADA · **Implementación:** ninguna.

Fuentes: [REQUISITOS.md](REQUISITOS.md), [ANALISIS_EMPRESARIAL.md](ANALISIS_EMPRESARIAL.md) y [DECISIONES.md](DECISIONES.md). Todas las historias pertenecen al MVP; conservan el orden inicial aceptado. Administrador = ACT-01; lectura = ACT-02. Los criterios son pruebas futuras con datos sintéticos, no resultados ejecutados.

Los criterios CA-Hxx-n y CR-01 a CR-20 están aceptados como especificación mediante D-14; no se han ejecutado pruebas funcionales. [CIERRE_FASE1.md](CIERRE_FASE1.md) es su resolución vigente: UTC, respaldo semanal y objetivos operativos coherentes. No quedan resultados empresariales condicionados sin definición en estas historias. La validación legal de conservación sigue como F1-SEG-01 antes de datos reales; no equivale a una regla de purga aprobada.

Se conservan los 16 IDs de historias y los 47 IDs de criterios originales. Las referencias A/P ahora remiten a decisiones resueltas en el cierre, no a preguntas abiertas. Chile y 250 funcionarios son datos confirmados; 900–1.500 bienes es estimación aceptada, no medición.

## HU-01 — Mantener funcionarios y unidades

Como administrador quiero registrar y actualizar funcionarios y su unidad para identificar custodios sin perder su historia. M01 · PR-01 · RF-01 · RN-02/RN-07/RN-11. Decisiones aplicables: A-01/A-03/A-05.

- **CA-H01-1:** Dado un administrador y una identidad RUT/ID válida y única según A-01, cuando crea o edita un funcionario, entonces conserva nombre, RUT/ID, cargo, unidad/departamento, correo si existe y activo/inactivo; valida DV de RUT o ID institucional canónico y audita el cambio (CR-01/CR-02).
- **CA-H01-2:** Dado un funcionario con referencias históricas y sin custodia pendiente de resolver, cuando se da de baja lógicamente, entonces su registro e historia siguen consultables.
- **CA-H01-3:** Dado un funcionario con bienes vigentes, cuando se solicita su baja, entonces se rechaza sin perder custodia ni referencias; tras devolver/trasladar explícitamente los bienes, la baja queda admitida (CR-04).
- **CA-H01-4:** Dado un funcionario con bienes que cambia de unidad U1 a U2, cuando se registra el cambio, entonces conserva sus bienes, la consulta actual indica U2 y los movimientos anteriores conservan U1, sin trasladar custodia ficticiamente (CR-07).

## HU-02 — Identificar bienes sin duplicados

Como administrador quiero mantener bienes con sus características para tener un inventario fiable. M02 · PR-02 · RF-02 · RN-03/RN-11/RN-18. Decisiones aplicables: A-02/P-02.

- **CA-H02-1:** Dado un bien válido, cuando se registra, entonces se conservan tipo, marca, modelo, serie, código, fecha de adquisición, condición y observaciones, con auditoría.
- **CA-H02-2:** Dada una serie o código ya existente, cuando se intenta otra alta con ese identificador, entonces se rechaza sin crear parcialmente el bien; ante dos altas concurrentes con el mismo identificador solo una puede persistir.
- **CA-H02-3:** Dadas variantes de caso/espacios exteriores o serie ausente, cuando se valida el alta, entonces se comparan identificadores canónicos; código es obligatorio y serie ausente requiere motivo. No usar «SIN SERIE» compartido ni reutilizar identificadores dados de baja (CR-03).
- **CA-H02-4:** Dado un cambio de condición a malo, cuando se actualiza el bien, entonces condición, custodia y situación administrativa siguen separadas; no se devuelve ni da de baja automáticamente y no admite nueva asignación/traslado mientras permanezca malo (CR-05/CR-06).

## HU-03 — Asignar varios bienes a un funcionario

Como administrador quiero registrar custodia fechada para saber quién tiene cada bien. M03 · PR-03/CU-01 · RF-03 · RN-04/RN-05/RN-15/RN-16. Decisiones aplicables: A-03/A-04/A-06.

- **CA-H03-1:** Dados un funcionario admisible y dos bienes disponibles, cuando se asignan ambos, entonces cada bien tiene una sola asignación vigente y ambos constan en la ficha del funcionario, con inicio, motivo y responsable.
- **CA-H03-2:** Dado un bien ya asignado, cuando se intenta otra asignación vigente, entonces se rechaza sin alterar la primera; dos solicitudes concurrentes para un bien disponible no producen dos custodios vigentes.
- **CA-H03-3:** Dados movimientos retroactivos/futuros o destino inactivo/bien dado de baja o malo, cuando se solicita asignación, entonces se rechaza sin cambios parciales. Los movimientos válidos son efectivos al confirmar en UTC y no permiten doble custodia (CR-05/CR-08/CR-10).

## HU-04 — Registrar movimientos y bajas

Como administrador quiero devolver, trasladar, cambiar condición y dar de baja bienes para conservar custodia y cronología coherentes. M03 · PR-03/CU-02 a CU-05 · RF-04 · RN-05/RN-07/RN-16/RN-18. Decisiones aplicables: A-03/A-04/A-05/A-06/P-02.

- **CA-H04-1:** Dado un bien asignado, cuando se registra una devolución admisible, entonces termina la custodia y ambas fichas conservan bien, fecha, motivo y responsable en la historia.
- **CA-H04-2:** Dado un bien con custodio origen y destino admisible, cuando se traslada, entonces queda un único custodio destino y ambas fichas muestran el traslado; un conflicto concurrente no deja cierre sin destino ni doble asignación.
- **CA-H04-3:** Dado un cambio admisible de bueno a regular o malo, cuando se registra, entonces ficha e historia coinciden con la condición resultante, sin borrar la condición previa.
- **CA-H04-4:** Dado un bien con historia, cuando se solicita baja, entonces se conserva su registro y se bloquea si tiene custodia vigente. Reactivarlo exige administrador/motivo y no restaura custodios ni cambia condición (CR-04/CR-06).
- **CA-H04-5:** Dados movimientos retroactivos/futuros, devolución sin custodia, traslado a sí mismo/origen obsoleto o condición idéntica, cuando se solicitan, entonces se rechazan; repetir la correlación de una operación ya admitida devuelve su resultado sin duplicar movimiento/auditoría/aviso (CR-08/CR-10).

## HU-05 — Conservar historia inmutable

Como administrador quiero consultar movimientos originales para disponer de evidencia fiable. M03 · PR-03/CU-06 · RF-05 · RN-06. Decisión aplicable: A-04.

- **CA-H05-1:** Dado un movimiento registrado, cuando cualquier cuenta de aplicación intenta editarlo o borrarlo, incluso mediante acceso directo, entonces se deniega y el original permanece intacto.
- **CA-H05-2:** Dado un error en la historia, cuando se tramita su corrección, entonces una anotación inmutable vinculada preserva el original y, si cambia la situación actual, se registran compensaciones ordinarias admisibles sin reescribir custodias intermedias (CR-09).

## HU-06 — Encontrar bienes y funcionarios

Como administrador o lectura quiero una búsqueda global para localizar custodia actual e historia. M04 · PR-04 · RF-06 · RN-01/RN-04/RN-06. Decisiones aplicables: A-05/A-06 para interpretación histórica.

- **CA-H06-1:** Dado un conjunto sintético con coincidencias conocidas, cuando se busca individualmente por serie, código, marca, modelo, tipo y condición, entonces se encuentran los bienes correspondientes; por nombre, RUT/ID, correo, cargo y unidad se encuentran funcionarios.
- **CA-H06-2:** Dado un bien con asignaciones anteriores, cuando se abre su ficha, entonces se distinguen custodia vigente e historial fechado; la ficha del funcionario muestra bienes actuales y anteriores coherentes con él.
- **CA-H06-3:** Dada una consulta sin coincidencias, cuando se ejecuta, entonces se identifica resultado vacío y no se presentan registros como coincidencias ficticias.

## HU-07 — Combinar filtros

Como administrador o lectura quiero acotar resultados para revisar y exportar el subconjunto relevante. M04 · PR-04 · RF-07 · RN-14/RN-16. Decisiones aplicables: A-05/A-06.

- **CA-H07-1:** Dados bienes de diferentes condiciones/tipos/custodia, cuando se combinan condición, tipo y asignado/sin asignar, entonces cada resultado satisface todos los filtros aplicados; al quitarlos se recupera el conjunto autorizado.
- **CA-H07-2:** Dadas fechas de borde y cambio de unidad, cuando se filtra, entonces se usa UTC, intervalo de días con fin exclusivo del día siguiente y campo temporal por consulta de A-06; unidad actual en inventario y unidad de origen/destino al evento en movimientos (CR-07/CR-11/CR-12).
- **CA-H07-3:** Dada una consulta filtrada, cuando se exporta, entonces la exportación mantiene los mismos filtros y permisos.

## HU-08 — Restringir escritura por rol

Como responsable del inventario quiero distinguir administración y lectura para proteger registros. M05 · PR-05 y transversal · RF-08 · RN-01/RN-15. P-01 ratificada: auditoría solo administrativa.

- **CA-H08-1:** Dada una cuenta lectura, cuando consulta inventario, funcionarios e historia o exporta salidas permitidas, entonces obtiene información autorizada sin capacidades de modificación.
- **CA-H08-2:** Dada una cuenta lectura, cuando intenta alta, edición, baja, asignación, gestión de cuentas o configuración mediante interfaz o acceso directo, entonces se deniega sin alterar registros; la autorización se verifica fuera de la interfaz.
- **CA-H08-3:** Dada una sesión sin autorización válida, cuando se solicita información protegida, entonces se deniega el acceso sin exponer datos personales.

## HU-09 — Administrar cuentas

Como administrador quiero crear, cambiar roles, desactivar/reactivar y exigir cambio de contraseña para controlar acceso. M05 · PR-05 · RF-09 · RN-08/RN-09/RN-11. Decisión aplicable: A-08.

- **CA-H09-1:** Dado un administrador habilitado, cuando gestiona otra cuenta válida, entonces conserva nombre, correo, rol y activación y audita sus cambios; no existe un recorrido público de autorregistro.
- **CA-H09-2:** Dada una cuenta con acciones históricas, cuando se desactiva, entonces su identidad permanece y las sesiones previas quedan revocadas para la siguiente operación protegida; recuperar contraseña no reactiva la cuenta (CR-15).
- **CA-H09-3:** Dadas primera cuenta, invitación o reactivación, cuando se tramitan, entonces la primera cuenta se designa/controla fuera del autorregistro, la invitación vence en 24 h y es de un uso, y un administrador completa MFA antes de operar; sesiones de 30 min de inactividad/8 h absolutas (CR-15/CR-16).

## HU-10 — Recuperar acceso

Como titular de cuenta quiero restablecer mi contraseña por correo para recuperar acceso sin divulgar credenciales. M05 · PR-05 · RF-10 · RN-10. Decisión aplicable: A-08.

- **CA-H10-1:** Dada una solicitud de recuperación admisible, cuando se emite el enlace, entonces es temporal y de uso limitado y no expone contraseñas en correo o auditoría.
- **CA-H10-2:** Dado un enlace consumido o con más de 30 minutos, cuando se intenta usarlo, entonces no cambia contraseña ni concede acceso; emitir un enlace nuevo invalida anteriores y un cambio válido revoca sesiones previas (CR-15).

## HU-11 — Proteger administración activa

Como administrador quiero evitar pérdida del control del sistema para mantener continuidad. M05 · PR-05 · RF-11 · RN-09/RN-15. Decisión aplicable: A-08.

- **CA-H11-1:** Dado el último administrador activo, cuando se intenta desactivarlo o degradarlo, entonces se rechaza; ante dos operaciones concurrentes sobre los últimos administradores siempre queda al menos uno activo.
- **CA-H11-2:** Dado un administrador, cuando intenta cambiar su propio rol, entonces se deniega, aunque haya otro administrador activo.
- **CA-H11-3:** Dada baja/reactivación, corrección, cambio de rol/activación, forzar contraseña o cambiar destinatario, cuando se solicita, entonces requiere confirmación y motivo, y cancelarla no altera el negocio; autodesactivación administrativa prohibida (CR-16).

## HU-12 — Auditar cambios

Como administrador quiero conocer quién cambió qué y cuándo para reconstruir responsabilidades. M06 · PR-06 · RF-12 · RN-06/RN-11. Decisiones aplicables: A-10/P-01 en acceso y retención.

- **CA-H12-1:** Dados cambios exitosos de bienes, funcionarios, movimientos, cuentas, roles, activación y configuración, cuando se revisa su evidencia, entonces cada cambio previsto tiene actor, fecha, entidad, acción y anterior/nuevo pertinentes; no hay contraseñas ni tokens.
- **CA-H12-2:** Dado un registro de auditoría, cuando una cuenta de aplicación intenta actualizarlo o borrarlo, entonces se deniega y la evidencia permanece intacta.

## HU-13 — Consultar auditoría

Como administrador quiero filtrar auditoría para investigar cambios concretos. M06 · PR-06 · RF-13 · RN-11/RN-17. Decisiones aplicables: P-01/A-06/A-10.

- **CA-H13-1:** Dada auditoría sintética conocida y administrador autorizado, cuando combina fecha UTC de registro, usuario, bien, funcionario y acción, entonces obtiene solo los eventos correspondientes al rango inclusivo de días definido en A-06 (CR-12).
- **CA-H13-2:** Dada una cuenta lectura, cuando intenta consultar o exportar auditoría por cualquier vía, entonces se deniega conforme P-01 ratificada, conservando su acceso al inventario e historial empresarial (CR-18).

## HU-14 — Configurar destinatario

Como administrador quiero cambiar el correo del encargado para dirigir avisos sin cambiar código. M06 · PR-06 · RF-14 · RN-12. Decisiones aplicables: A-07/A-10.

- **CA-H14-1:** Dado un administrador y una dirección admisible, cuando cambia destinatario, entonces la configuración queda auditada y afecta avisos posteriores; lectura no puede modificarla por ninguna vía.
- **CA-H14-2:** Dado un cambio de destinatario concurrente con un evento, cuando se procesa, entonces el destinatario del evento queda fijado al confirmar y no se redirige por cambios posteriores; cambio de configuración avisa al nuevo y al anterior sin revelar al anterior la dirección nueva (CR-13/CR-14).

## HU-15 — Notificar cambios

Como encargado de bienes quiero recibir avisos de cambios para dar seguimiento. M06 · PR-06 · RF-15 · RN-13/RN-19. Decisiones aplicables: A-07/A-10/P-04.

- **CA-H15-1:** Dado un evento empresarial, de cuentas o configuración del catálogo A-07 aprobado, cuando se procesa el aviso, entonces usa destinatarios/contenido de ese catálogo y registra el resultado, sin RUT/correo personal/texto libre ni credenciales; invitación/recuperación solo al titular (CR-14).
- **CA-H15-2:** Dado un fallo de correo posterior al cambio confirmado, cuando se registra, entonces la operación empresarial subsiste y el administrador puede ver estado/error sin secretos; no se revierte el negocio (CR-13).
- **CA-H15-3:** Dado error transitorio/permanente/resultado incierto o repetición, cuando se procesa, entonces transitorio reintenta tres veces a 1/5/15 min, permanente se detiene e incierto requiere conciliación sin repetición ciega; conservar correlación y un aviso lógico por propósito/destinatario (CR-14).

## HU-16 — Reportar y exportar

Como administrador o lectura quiero reportes Excel/PDF para revisar y compartir información autorizada. M07 · PR-07 · RF-16 · RN-14/RN-17. Decisiones aplicables: A-05/A-06/A-09/A-10/A-11/P-01.

- **CA-H16-1:** Dado un conjunto conocido, cuando se generan inventario, bienes por funcionario, movimientos, condición y auditoría con permiso, entonces Excel/PDF usan columnas/orden de A-11, fechas UTC de A-06 y fuente/selección coherentes; auditoría solo administrador (CR-19).
- **CA-H16-2:** Dados resultados filtrados del buscador, cuando se exportan en ambos formatos, entonces se mantienen filtros y autorización, sin incluir filas o datos personales adicionales no autorizados.
- **CA-H16-3:** Dados cero filas, límite exacto o una fila adicional, cuando se exporta, entonces vacío produce archivo válido, 10.000 filas Excel/2.000 PDF están permitidas y el exceso se rechaza sin truncar; lectura nunca exporta auditoría (CR-18/CR-20).

## Aceptación documental de Fase 1

| ID | Criterio de salida | Situación |
|---|---|---|
| CA1-01 | Actores, áreas funcionales y permisos diferenciados sin roles implícitos | CUMPLIDO; documentación revisada y aceptada por D-14 |
| CA1-02 | Siete módulos con valor, procesos normales, excepciones y reglas vinculadas | CUMPLIDO; análisis y trazabilidad aceptados |
| CA1-03 | 16 RF y 7 RNF cubiertos con historias/criterios y escenarios | CUMPLIDO como especificación; pruebas funcionales no ejecutadas |
| CA1-04 | Resoluciones explícitas de A-01 a A-11 y P-01/P-02/P-04, con seguimientos futuros | CUMPLIDO; cierre aprobado, F1-SEG-01/02/03 conservados sin inventar cumplimiento |
| CA1-05 | Diferencias, enlaces, IDs y cobertura revisados; entrega sincronizada con GitHub | Verificación documental registrada en PRUEBAS; SHA remoto se comprueba tras push antes de confirmar entrega |
| CA1-06 | Usuario acepta paquete y cierre de Fase 1 | CUMPLIDO el 2026-10-31, D-14, UTC y respaldo semanal; Fase 2 no autorizada |
