# Historias de usuario y criterios — Fase 1

**Fecha:** 2026-10-31 · **Estado:** EN_REVISION · **Implementación:** ninguna.

Fuentes: [REQUISITOS.md](REQUISITOS.md), [ANALISIS_EMPRESARIAL.md](ANALISIS_EMPRESARIAL.md) y [DECISIONES.md](DECISIONES.md). Todas las historias pertenecen al MVP; conservan el orden inicial aceptado. Administrador = ACT-01; lectura = ACT-02. Los criterios son pruebas futuras con datos sintéticos, no resultados ejecutados.

Cada CA-Hxx-n tiene estructura dado/cuando/entonces. **Condicionado** significa que la prueba precisa la decisión citada antes de fijar su resultado; no se interpreta como requisito aprobado ni como criterio superado. Ninguna historia está aceptada o implementada por estar escrita.

## Concreción de los criterios condicionados

La [propuesta de resolución de pendientes](CIERRE_FASE1.md) completa resultados esperados y parámetros con CR-01 a CR-20. Sus decisiones están listas para ratificar, sin aceptación presumida. Se mantienen los 47 criterios y sus IDs; los CR complementan sus casos límite. Chile y 250 funcionarios son datos confirmados; el inventario estimado de 900–1.500 bienes no es una medición.

## HU-01 — Mantener funcionarios y unidades

Como administrador quiero registrar y actualizar funcionarios y su unidad para identificar custodios sin perder su historia. M01 · PR-01 · RF-01 · RN-02/RN-07/RN-11. Pendientes: A-01/A-03/A-05.

- **CA-H01-1:** Dado un administrador y datos válidos según A-01, cuando crea o edita un funcionario, entonces conserva nombre, RUT/ID, cargo, unidad/departamento, correo y activo/inactivo; el cambio queda auditado. Condicionado en validaciones de identidad.
- **CA-H01-2:** Dado un funcionario con referencias históricas y sin custodia pendiente de resolver, cuando se da de baja lógicamente, entonces su registro e historia siguen consultables.
- **CA-H01-3:** Dado un funcionario con bienes vigentes, cuando se solicita su baja, entonces se aplica el resultado aprobado en A-03 sin perder custodia ni referencias. Condicionado; no se elige bloqueo o cierre automático.
- **CA-H01-4:** Dado un funcionario que cambia de unidad, cuando se registra el cambio, entonces su pertenencia actual y su consulta histórica coinciden con la definición aceptada en A-05. Condicionado.

## HU-02 — Identificar bienes sin duplicados

Como administrador quiero mantener bienes con sus características para tener un inventario fiable. M02 · PR-02 · RF-02 · RN-03/RN-11/RN-18. Pendientes: A-02/P-02.

- **CA-H02-1:** Dado un bien válido, cuando se registra, entonces se conservan tipo, marca, modelo, serie, código, fecha de adquisición, condición y observaciones, con auditoría.
- **CA-H02-2:** Dada una serie o código ya existente, cuando se intenta otra alta con ese identificador, entonces se rechaza sin crear parcialmente el bien; ante dos altas concurrentes con el mismo identificador solo una puede persistir.
- **CA-H02-3:** Dadas variantes de caso/espacios o serie ausente, cuando se valida el alta, entonces se usa la equivalencia/obligatoriedad acordada en A-02. Condicionado.
- **CA-H02-4:** Dado un cambio de condición, cuando se actualiza el bien, entonces no se deduce automáticamente asignación o baja; la representación separada y transiciones se validan con P-02. Condicionado en representación.

## HU-03 — Asignar varios bienes a un funcionario

Como administrador quiero registrar custodia fechada para saber quién tiene cada bien. M03 · PR-03/CU-01 · RF-03 · RN-04/RN-05/RN-15/RN-16. Pendientes: A-03/A-04/A-06.

- **CA-H03-1:** Dados un funcionario admisible y dos bienes disponibles, cuando se asignan ambos, entonces cada bien tiene una sola asignación vigente y ambos constan en la ficha del funcionario, con inicio, motivo y responsable.
- **CA-H03-2:** Dado un bien ya asignado, cuando se intenta otra asignación vigente, entonces se rechaza sin alterar la primera; dos solicitudes concurrentes para un bien disponible no producen dos custodios vigentes.
- **CA-H03-3:** Dadas fechas retroactivas, límites coincidentes o destino inactivo, cuando se solicita asignación, entonces se verifica la política aceptada en A-03/A-04/A-06 manteniendo la cardinalidad. Condicionado.

## HU-04 — Registrar movimientos y bajas

Como administrador quiero devolver, trasladar, cambiar condición y dar de baja bienes para conservar custodia y cronología coherentes. M03 · PR-03/CU-02 a CU-05 · RF-04 · RN-05/RN-07/RN-16/RN-18. Pendientes: A-03/A-04/A-05/A-06/P-02.

- **CA-H04-1:** Dado un bien asignado, cuando se registra una devolución admisible, entonces termina la custodia y ambas fichas conservan bien, fecha, motivo y responsable en la historia.
- **CA-H04-2:** Dado un bien con custodio origen y destino admisible, cuando se traslada, entonces queda un único custodio destino y ambas fichas muestran el traslado; un conflicto concurrente no deja cierre sin destino ni doble asignación.
- **CA-H04-3:** Dado un cambio admisible de bueno a regular o malo, cuando se registra, entonces ficha e historia coinciden con la condición resultante, sin borrar la condición previa.
- **CA-H04-4:** Dado un bien con historia, cuando se da de baja, entonces conserva sus referencias; con custodia vigente o eventual reactivación se aplica A-03. Condicionado en efectos sobre asignación/reactivación.
- **CA-H04-5:** Dados cambios retroactivos, movimientos repetidos o traslado a sí mismo, cuando se solicitan, entonces se aplica A-04 sin romper coherencia temporal. Condicionado.

## HU-05 — Conservar historia inmutable

Como administrador quiero consultar movimientos originales para disponer de evidencia fiable. M03 · PR-03/CU-06 · RF-05 · RN-06. Pendiente: A-04.

- **CA-H05-1:** Dado un movimiento registrado, cuando cualquier cuenta de aplicación intenta editarlo o borrarlo, incluso mediante acceso directo, entonces se deniega y el original permanece intacto.
- **CA-H05-2:** Dado un error en la historia, cuando se tramita su corrección, entonces el procedimiento acordado en A-04 preserva el original y su relación con la evidencia correctiva. Condicionado; movimiento compensatorio sigue siendo alternativa.

## HU-06 — Encontrar bienes y funcionarios

Como administrador o lectura quiero una búsqueda global para localizar custodia actual e historia. M04 · PR-04 · RF-06 · RN-01/RN-04/RN-06. Pendientes: A-05/A-06 para interpretación histórica.

- **CA-H06-1:** Dado un conjunto sintético con coincidencias conocidas, cuando se busca individualmente por serie, código, marca, modelo, tipo y condición, entonces se encuentran los bienes correspondientes; por nombre, RUT/ID, correo, cargo y unidad se encuentran funcionarios.
- **CA-H06-2:** Dado un bien con asignaciones anteriores, cuando se abre su ficha, entonces se distinguen custodia vigente e historial fechado; la ficha del funcionario muestra bienes actuales y anteriores coherentes con él.
- **CA-H06-3:** Dada una consulta sin coincidencias, cuando se ejecuta, entonces se identifica resultado vacío y no se presentan registros como coincidencias ficticias.

## HU-07 — Combinar filtros

Como administrador o lectura quiero acotar resultados para revisar y exportar el subconjunto relevante. M04 · PR-04 · RF-07 · RN-14/RN-16. Pendientes: A-05/A-06.

- **CA-H07-1:** Dados bienes de diferentes condiciones/tipos/custodia, cuando se combinan condición, tipo y asignado/sin asignar, entonces cada resultado satisface todos los filtros aplicados; al quitarlos se recupera el conjunto autorizado.
- **CA-H07-2:** Dadas fechas de borde y un cambio de unidad, cuando se filtra por rango y unidad, entonces los resultados coinciden con zona, campo temporal, extremos y significado de unidad aprobados en A-05/A-06. Condicionado.
- **CA-H07-3:** Dada una consulta filtrada, cuando se exporta, entonces la exportación mantiene los mismos filtros y permisos.

## HU-08 — Restringir escritura por rol

Como responsable del inventario quiero distinguir administración y lectura para proteger registros. M05 · PR-05 y transversal · RF-08 · RN-01/RN-15. Pendiente P-01 solo en auditoría.

- **CA-H08-1:** Dada una cuenta lectura, cuando consulta inventario, funcionarios e historia o exporta salidas permitidas, entonces obtiene información autorizada sin capacidades de modificación.
- **CA-H08-2:** Dada una cuenta lectura, cuando intenta alta, edición, baja, asignación, gestión de cuentas o configuración mediante interfaz o acceso directo, entonces se deniega sin alterar registros; la autorización se verifica fuera de la interfaz.
- **CA-H08-3:** Dada una sesión sin autorización válida, cuando se solicita información protegida, entonces se deniega el acceso sin exponer datos personales.

## HU-09 — Administrar cuentas

Como administrador quiero crear, cambiar roles, desactivar/reactivar y exigir cambio de contraseña para controlar acceso. M05 · PR-05 · RF-09 · RN-08/RN-09/RN-11. Pendiente: A-08.

- **CA-H09-1:** Dado un administrador habilitado, cuando gestiona otra cuenta válida, entonces conserva nombre, correo, rol y activación y audita sus cambios; no existe un recorrido público de autorregistro.
- **CA-H09-2:** Dada una cuenta con acciones históricas, cuando se desactiva, entonces su identidad permanece en la evidencia; la revocación y el tratamiento de sesiones activas se verifican según A-08. Condicionado en plazo/mecanismo.
- **CA-H09-3:** Dada la primera cuenta, una invitación, una reactivación o un cambio obligatorio de contraseña, cuando se tramitan, entonces se cumplen recorridos y restricciones acordados en A-08. Condicionado; no se presume acceso recuperado sin validación.

## HU-10 — Recuperar acceso

Como titular de cuenta quiero restablecer mi contraseña por correo para recuperar acceso sin divulgar credenciales. M05 · PR-05 · RF-10 · RN-10. Pendiente: A-08.

- **CA-H10-1:** Dada una solicitud de recuperación admisible, cuando se emite el enlace, entonces es temporal y de uso limitado y no expone contraseñas en correo o auditoría.
- **CA-H10-2:** Dado un enlace consumido o caducado según A-08, cuando se intenta usarlo, entonces no cambia la contraseña ni concede acceso. Condicionado en duración y política de consumo.

## HU-11 — Proteger administración activa

Como administrador quiero evitar pérdida del control del sistema para mantener continuidad. M05 · PR-05 · RF-11 · RN-09/RN-15. Pendiente: A-08.

- **CA-H11-1:** Dado el último administrador activo, cuando se intenta desactivarlo o degradarlo, entonces se rechaza; ante dos operaciones concurrentes sobre los últimos administradores siempre queda al menos uno activo.
- **CA-H11-2:** Dado un administrador, cuando intenta cambiar su propio rol, entonces se deniega, aunque haya otro administrador activo.
- **CA-H11-3:** Dada una acción crítica acordada en A-08, cuando se solicita, entonces requiere confirmación y cancelarla no altera el negocio. Condicionado en catálogo, sin diseñar interfaz.

## HU-12 — Auditar cambios

Como administrador quiero conocer quién cambió qué y cuándo para reconstruir responsabilidades. M06 · PR-06 · RF-12 · RN-06/RN-11. Pendientes: A-10/P-01 en acceso y retención.

- **CA-H12-1:** Dados cambios exitosos de bienes, funcionarios, movimientos, cuentas, roles, activación y configuración, cuando se revisa su evidencia, entonces cada cambio previsto tiene actor, fecha, entidad, acción y anterior/nuevo pertinentes; no hay contraseñas ni tokens.
- **CA-H12-2:** Dado un registro de auditoría, cuando una cuenta de aplicación intenta actualizarlo o borrarlo, entonces se deniega y la evidencia permanece intacta.

## HU-13 — Consultar auditoría

Como administrador quiero filtrar auditoría para investigar cambios concretos. M06 · PR-06 · RF-13 · RN-11/RN-17. Pendientes: P-01/A-06/A-10.

- **CA-H13-1:** Dada auditoría sintética conocida y administrador autorizado, cuando combina fecha, usuario, bien, funcionario y acción, entonces obtiene solo registros que cumplen los filtros con interpretación temporal A-06. Condicionado en fechas.
- **CA-H13-2:** Dada una cuenta lectura, cuando intenta consultar o exportar auditoría mediante cualquier vía, entonces recibe únicamente el resultado autorizado por la matriz ratificada en P-01. Condicionado; no se presume concesión ni prohibición definitiva.

## HU-14 — Configurar destinatario

Como administrador quiero cambiar el correo del encargado para dirigir avisos sin cambiar código. M06 · PR-06 · RF-14 · RN-12. Pendientes: A-07/A-10.

- **CA-H14-1:** Dado un administrador y una dirección admisible, cuando cambia destinatario, entonces la configuración queda auditada y afecta avisos posteriores; lectura no puede modificarla por ninguna vía.
- **CA-H14-2:** Dado un cambio de destinatario concurrente con un evento, cuando se genera el aviso, entonces se aplica la definición de destinatario vigente y notificación al anterior/nuevo acordada en A-07, sin exponer secretos. Condicionado.

## HU-15 — Notificar cambios

Como encargado de bienes quiero recibir avisos de cambios para dar seguimiento. M06 · PR-06 · RF-15 · RN-13/RN-19. Pendientes: A-07/A-10/P-04.

- **CA-H15-1:** Dado un evento incluido en el catálogo aprobado, cuando se procesa su aviso, entonces el destinatario acordado recibe qué cambió, quién y cuándo con contenido autorizado y resultado registrado. Condicionado en catálogo/contenido; cuentas y configuración no se incluyen por inferencia.
- **CA-H15-2:** Dado un fallo de envío, cuando se registra el resultado, entonces la operación empresarial y la visibilidad del fallo cumplen P-04/A-07. Condicionado; no se promete reversión ni continuidad hasta ratificación.
- **CA-H15-3:** Dado un reintento o evento repetido, cuando se procesa, entonces se comprueban límites y tratamiento de duplicados acordados en A-07. Condicionado; proveedor y mecanismo pendientes de Fase 3.

## HU-16 — Reportar y exportar

Como administrador o lectura quiero reportes Excel/PDF para revisar y compartir información autorizada. M07 · PR-07 · RF-16 · RN-14/RN-17. Pendientes: A-05/A-06/A-09/A-10/A-11/P-01.

- **CA-H16-1:** Dado un conjunto sintético de resultado conocido, cuando se generan inventario general, bienes por funcionario, movimientos por fechas, bienes por condición y auditoría con permiso, entonces cada uno existe en Excel y PDF y sus datos concuerdan con la fuente bajo los filtros acordados. Condicionado en contrato de columnas/fechas/permisos.
- **CA-H16-2:** Dados resultados filtrados del buscador, cuando se exportan en ambos formatos, entonces se mantienen filtros y autorización, sin incluir filas o datos personales adicionales no autorizados.
- **CA-H16-3:** Dados conjunto vacío, límite de volumen y acceso a auditoría por lectura, cuando se exporta, entonces se verifican resultados definidos en A-09/A-11/P-01 sin inventar umbrales o permisos. Condicionado.

## Aceptación documental de Fase 1

| ID | Criterio de salida | Situación |
|---|---|---|
| CA1-01 | Actores, áreas funcionales y permisos diferenciados sin crear roles implícitos | Documentado; revisión de negocio pendiente |
| CA1-02 | Siete módulos con valor, procesos normales, excepciones y reglas vinculadas | Documentado en análisis y trazabilidad |
| CA1-03 | RF-01 a RF-16 y RNF-01 a RNF-07 cubiertos con criterios y escenarios de verificación | Documentado; ejecución funcional no realizada |
| CA1-04 | A-01 a A-11 y P-01/P-02/P-04 explícitos, sin respuestas inferidas | Conservados; propuestas completas en CIERRE_FASE1, ratificación pendiente |
| CA1-05 | Diferencias, enlaces, IDs y cobertura revisados; cambios documentales en GitHub | Evidencia en PRUEBAS y ESTADO_PROYECTO; comprobar SHA remoto al entregar |
| CA1-06 | Usuario valida análisis, decisiones necesarias y cierre de Fase 1 | PENDIENTE; EN_REVISION, sin aprobación de cierre ni de Fase 2 |
