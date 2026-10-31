# Resolución y cierre de Fase 1

**Fecha:** 2026-10-31 · **Versión:** 2 · **Estado:** COMPLETADA (análisis aceptado, sin implementación).

## Aprobación y alcance vigente

Evidencia literal del usuario: «Apruebo las conversiones, respaldo 1 vez a  la semana, zona horaria UTC y respaldo 1 vez a la semana». En respuesta a la solicitud de aprobación del paquete de recomendaciones, se registra su aceptación y las dos modificaciones expresas: zona de negocio **UTC** y **un respaldo por semana**. No se interpreta «conversiones» como solicitud de convertir archivos, cambiar datos o implementar código. Evidencia vinculada: D-14 en [DECISIONES.md](DECISIONES.md).

Las recomendaciones de la versión 1 quedan adoptadas con esas modificaciones. Este documento es la base vigente; las alternativas se conservan para explicar la elección. A-01 a A-11 se resuelven como requisitos de Fase 1 y P-01/P-02/P-04 quedan ratificados. Las verificaciones funcionales, configuración de respaldos y controles técnicos se ejecutarán únicamente en sus fases autorizadas.

- Chile y 250 funcionarios confirmados. Estimación aceptada: 900–1.500 bienes, referencia 1.200; capacidad objetivo 3.000 bienes. No son existencias medidas.
- 16 RF, 7 RNF, 16 historias con 47 criterios y 20 casos complementarios aceptados como especificación. Las pruebas de aplicación aún no se han ejecutado.
- RPO coherente con respaldo semanal: objetivo de hasta 7 días (168 h) de pérdida máxima de cambios; RTO objetivo 8 h. Conservación de copias 30 días. No son controles ya implantados.
- La política legal de conservación de registros personales no fue informada: se mantiene seguimiento explícito F1-SEG-01 en Fase 6, obligatorio antes de datos reales. La aprobación no acredita cumplimiento jurídico ni permite purgar historia.
- Fase 1 COMPLETADA; Fases 2–15 PENDIENTE / NO OTORGADA. Sin código, prototipo, correo real, despliegue ni cambios de permisos.

## A-01 — Identificación de funcionarios

**Decisión adoptada:** exigir tipo de documento e identificador. Admitir RUT e ID institucional alternativo, sin exigir un RUT a quien usa otro identificador. Nombre, cargo y unidad obligatorios; correo opcional, pero válido si se informa. No usar el correo como identidad del funcionario ni crear una cuenta al registrarlo.

Para RUT, quitar puntos, guion y espacios de presentación; guardar una representación canónica con dígito verificador en mayúscula y validar módulo 11. Para ID alternativo, quitar espacios exteriores y comparar en mayúscula, preservando caracteres interiores. Unicidad por tipo e identificador canónico, también entre inactivos. ID alternativo representa un código institucional, no otra presentación de un RUT: no usarlo para eludir validación de RUT. Corregir identidad de la misma persona conserva su historia y exige motivo/auditoría; no fusionar personas por inferencia.

**Alternativa:** solo RUT obligatorio, más restrictivo para personas sin RUT; identificador libre sin validación, con mayor riesgo de duplicados. Se recomienda la primera por admitir el «RUT/ID» solicitado.

**Criterios aceptados (ejecución futura):** CR-01 y CR-02; HU-01/CA-H01-1. La aceptación de este formato no fija jurisdicción.

## A-02 — Serie, código y bienes heredados

**Decisión adoptada:** código de inventario obligatorio y único. Serie opcional para equipos sin serie verificable; si existe, es única. Comparar serie/código sin espacios exteriores y sin diferencia de mayúsculas; conservar guiones y espacios interiores para no fusionar códigos distintos accidentalmente. La falta de serie se representa como ausencia, nunca con una serie compartida «SIN SERIE». Exigir motivo al registrar ausencia de serie; no inventar una serie del fabricante. Bienes heredados requieren código único antes del alta; no se incluye importación masiva.

La unicidad de identificadores presentes se mantiene incluso tras baja lógica; no reutilizar un código de inventario ni serie para otro bien. Editar identificadores requiere motivo y evidencia antes/nuevo, sin cambiar la identidad histórica del bien.

**Alternativa:** serie obligatoria sin excepciones, que impediría registrar heredados sin serie. La excepción queda ratificada por D-14 y detalla la obligatoriedad que RF-02 dejó abierta.

**Criterios aceptados (ejecución futura):** CR-03; HU-02/CA-H02-1 a CA-H02-3.

## A-03 y P-02 — Condición, custodia, bajas y reactivación

**Decisión adoptada:** mantener tres dimensiones independientes: condición bueno/regular/malo; custodia asignado/sin asignar; situación administrativa activo/baja. No crear nuevas condiciones físicas para indicar custodia.

| Operación | Precondición adoptada | Resultado / rechazo |
|---|---|---|
| Asignar | Bien y funcionario activos; bien sin custodia y condición bueno/regular | Crear una custodia; rechazar para inactivos, baja o condición malo |
| Devolver | Bien con custodia vigente | Cerrar custodia y conservar bien sin asignar; no cambiar condición |
| Trasladar a otro funcionario | Custodia vigente, origen esperado coincide, destino activo y distinto; bien activo bueno/regular | Cerrar origen y abrir destino en el mismo instante; ningún resultado parcial |
| Cambiar condición | Bien existente, incluso en baja | Registrar anterior/nueva con motivo; pasar a malo no devuelve ni da de baja automáticamente |
| Baja de funcionario | Sin bienes vigentes | Inactivar conservando identidad; si tiene bienes, rechazar y pedir devolución/traslado explícitos |
| Baja de bien | Sin custodia vigente | Marcar baja; si está asignado, rechazar y pedir devolución explícita |
| Reactivar funcionario o bien | Administrador, registro inactivo/en baja y motivo | Registrar reactivación auditada; no restaurar custodias antiguas ni cambiar condición |

Los bienes en malo que ya estaban asignados mantienen custodia para no perder al responsable, aunque no admiten una asignación/traslado nuevo. Su devolución sí está permitida. Un bien reactivado en malo sigue sin poder asignarse. La consulta muestra registros activos y en baja con distinción explícita; no oculta historia.

**Alternativa:** cerrar automáticamente custodias al dar de baja; se desaconseja porque puede registrar devoluciones que no ocurrieron. P-02 ratificada por D-14.

**Criterios aceptados (ejecución futura):** CR-04 a CR-07; HU-01/CA-H01-2 a CA-H01-4, HU-02/CA-H02-4, HU-03 y HU-04.

## A-04 — Fechas, repeticiones y corrección de errores

**Decisión adoptada para el MVP:** los movimientos y cambios de pertenencia son efectivos al confirmar la operación; la fecha de registro también es automática. No admitir movimientos futuros ni inserción retroactiva que reescriba custodia anterior. La fecha de adquisición es un dato editable distinto de la fecha efectiva de movimiento y no puede ser futura. No se ofrece carga de historia previa mediante importación en el MVP.

La asignación usa intervalo inicio incluido/fin excluido: al trasladar en el instante t, origen termina en t y destino inicia en t. Los eventos que compartan instante conservan un orden estable de registro; no dependen de la precisión del reloj para decidir doble custodia.

Para corregir errores, registrar una anotación inmutable vinculada al movimiento original, con motivo y administrador. Si cambia la situación vigente, registrar además los movimientos compensatorios ordinarios admisibles, vinculados al error, sin editar el original ni alterar custodias intermedias. Una asignación errónea a F1 se devuelve y se asigna a F2; si ya existe una custodia posterior, no se revierte automáticamente sobre ella. La anotación no crea otro rol ni otro módulo.

Rechazar devolución sin custodia, traslado al mismo funcionario o con origen desactualizado, cambio a idéntica condición y baja/reactivación en estado ya solicitado. Una repetición de la misma solicitud de operación debe devolver su resultado conocido sin repetir movimiento/auditoría/aviso; una solicitud distinta incompatible con el estado se rechaza. El mecanismo técnico de correlación corresponde a fases posteriores.

**Alternativa:** admitir retroactividad con recomputación completa de intervalos; requiere reglas más complejas, revisiones históricas y aceptación separada. No incluida en el MVP aprobado; cualquier incorporación posterior requiere nueva decisión de alcance.

**Criterios aceptados (ejecución futura):** CR-08 a CR-10; HU-03/CA-H03-3, HU-04/CA-H04-5, HU-05/CA-H05-2, RNF-02/RNF-03.

## A-05 — Unidad y ubicación

**Decisión adoptada:** la unidad pertenece al funcionario; no introducir ubicación independiente del bien en el MVP. La unidad actual de un bien asignado es la de su custodio actual; sin custodio, mostrar «sin unidad por custodia», sin inferir bodega. Conservar pertenencias históricas fechadas del funcionario y unidad aplicable al momento de cada movimiento.

Al cambiar al funcionario de unidad, conservar sus bienes asignados y registrar el cambio de pertenencia; no crear traslados ficticios entre personas. La ficha actual refleja la nueva unidad, mientras los movimientos anteriores conservan la unidad que tenían. Renombrar una unidad no reescribe las denominaciones históricas registradas. Gestión mínima del catálogo por administrador: nombre identificable y desactivación sin borrar referencias; una unidad desactivada no admite nuevas pertenencias.

**Alternativa:** ubicación física/unidad propietaria independiente; requeriría ampliación de alcance explícita. **Criterios aceptados (ejecución futura):** CR-07/CR-11; HU-01/CA-H01-4, HU-07/CA-H07-2.

## A-06 — Semántica de fechas y cortes

**Decisión adoptada:** cada rango de días incluye ambos días en la zona de negocio: desde 00:00 del primer día hasta 00:00 del día posterior al último, excluido. Un rango invertido se rechaza. La zona de negocio aprobada es **UTC**, por instrucción expresa del usuario, aunque la organización opere en Chile. Mostrar UTC en fichas, historial, auditoría, filtros y exportaciones; no convertir automáticamente a la hora local del dispositivo. Los rangos son días UTC de 24 horas, sin cambios estacionales; no se necesita la localidad para definirlos.

| Consulta / reporte | Fecha usada por el rango | Estado / unidad |
|---|---|---|
| Buscador: bienes; inventario general; bienes por condición | Fecha de adquisición; sin dato de adquisición queda fuera de un rango activo y se identifica como sin fecha cuando no hay rango | Situación y unidad actuales |
| Buscador: funcionarios | Fecha de alta del registro | Pertenencia actual |
| Bienes por funcionario | Inicio de asignación vigente | Custodio/unidad actuales; historia anterior se consulta en ficha o movimientos |
| Movimientos | Fecha efectiva del movimiento | Origen/destino y unidad de cada uno al momento del movimiento; filtro por unidad coincide con cualquiera de ambos |
| Auditoría | Fecha de registro del cambio | Actor y entidad del evento; sin sustituirlo por la fecha efectiva |
| Historial de ficha | Fecha efectiva de movimientos; pertenencias por sus fechas efectivas | Conservar vínculo con fecha de registro y correcciones |

Inventario general y bienes por condición son fotografías actuales, no inventario reconstruido a una fecha pasada. El rango selecciona la fecha indicada y no reconstruye otro estado. No se ofrece un corte de custodia histórico agregado en el MVP: se consulta la cronología por fechas. Esta limitación queda aceptada por D-14 y conserva el historial fechado solicitado.

**Alternativa:** reconstrucción «a una fecha», con requisitos adicionales de instantáneas y correcciones. **Zona confirmada:** UTC (D-14); America/Santiago no es la zona del sistema. **Criterios aceptados (ejecución futura):** CR-12; HU-07/CA-H07-2, HU-13/CA-H13-1, HU-16/CA-H16-1, CA-N03.

## A-07 y P-04 — Catálogo de avisos y fallos

**Decisión adoptada:** el fallo del correo no revierte una operación empresarial válida. El encargado recibe avisos posteriores al cambio confirmado. La auditoría empresarial y el estado de entrega son evidencias distintas; el envío aceptado por proveedor no prueba lectura ni entrega final.

| Evento aprobado | Destinatario / contenido |
|---|---|
| Alta/edición/baja/reactivación de funcionario o bien; pertenencia; asignación/devolución/traslado/condición; anotación correctiva | Encargado vigente al confirmar; entidad por referencia, acción, campos cambiados, actor y fechas; sin RUT, correo personal ni texto libre de observaciones/motivos en el mensaje |
| Crear cuenta, cambiar rol, activar/desactivar o exigir cambio de contraseña | Encargado vigente; referencia de cuenta, acción, actor y fecha; sin credenciales, tokens ni enlaces de recuperación |
| Cambio del destinatario de avisos | Nuevo destinatario recibe confirmación mínima de activación de avisos; anterior recibe solo aviso de sustitución sin revelar dirección nueva; si coinciden, rechazar cambio sin efecto |
| Invitación/recuperación/segundo factor | Solo titular de la cuenta por el canal de acceso; no copiar enlaces ni códigos al encargado |
| Búsqueda, lectura, exportación o intento rechazado | Sin aviso automático al encargado; auditoría de seguridad adicional se definirá en Fase 6, sin ampliar RF-12 por inferencia |

Cada evento genera como máximo un aviso lógico por destinatario/propósito, con su correlación y estado. Destinatario fijado al confirmar: cambiar configuración no redirige avisos ya pendientes ni reintentos; un administrador puede cancelar un pendiente con motivo, sin borrar evidencia, antes de enviar a una dirección que dejó de estar autorizada.

Intento inicial y tres reintentos a 1, 5 y 15 minutos desde el fallo anterior para errores transitorios; ante error permanente, detener sin reintentar. Tras agotar, marcar fallo y permitir reintento manual administrativo con motivo, reutilizando la correlación. Estado y último error visibles solo para administrador, sin secretos del proveedor. Si no se conoce el resultado de un envío, marcarlo incierto y no repetirlo ciegamente; conciliación con el proveedor en diseño técnico. No prometer entrega exactamente una vez.

**Alternativa:** impedir operaciones si falla el correo; perjudica disponibilidad y puede duplicar movimientos al repetir. **Criterios aceptados (ejecución futura):** CR-13/CR-14; HU-14/HU-15, CA-N07.

## A-08 — Acceso inicial, invitación, recuperación y sesiones

**Decisión adoptada:** primer administrador designado por el responsable de la organización, con identidad validada fuera del sistema y alta controlada en una fase de puesta en marcha autorizada. No incluir cuenta o contraseña predeterminada ni secretos en Git. Los siguientes usuarios solo por administrador, sin autorregistro público.

- Invitación: 24 horas, un solo uso; al reenviarla se invalida la anterior. Crear cuenta pendiente no concede acceso hasta completar activación.
- Recuperación: 30 minutos, un solo uso; una nueva solicitud invalida enlaces anteriores. La respuesta pública no confirma existencia de una cuenta. Cuentas desactivadas no se reactivan por recuperar contraseña.
- MFA obligatorio para administradores y opcional para lectura; enrolamiento y recuperación del segundo factor se diseñan en Fases 3/5/6. Primera activación administrativa debe completar MFA antes de operaciones de inventario. No elegir proveedor en Fase 1.
- Desactivación, cambio de rol o cambio/restablecimiento de contraseña revocan sesiones previas: la siguiente operación protegida debe validar la nueva situación y denegarse cuando corresponda. No confiar en el rol antiguo de una sesión.
- Sesiones: inactividad máxima de 30 minutos y duración absoluta de 8 horas, con nueva autenticación para continuar. Son objetivos aprobados, no capacidades verificadas de un producto.
- Confirmación y motivo para baja/reactivación, corrección, cambio de rol/activación, forzar contraseña y cambiar destinatario. La confirmación no reemplaza autorización. Prohibir cambio de propio rol; impedir pérdida del último administrador incluso concurrentemente; impedir autodesactivación para evitar pérdida accidental de acceso.

**Alternativa:** MFA opcional también para administradores; se desaconseja por acceso a datos personales y control de cuentas. **Criterios aceptados (ejecución futura):** CR-15/CR-16; HU-09/HU-10/HU-11.

## A-09 — Objetivos de capacidad y operación aprobados

**Dato confirmado:** 250 funcionarios en Chile. El usuario solicita estimar bienes, sin suministrar un conteo real.

| Estimación | Cálculo y supuestos | Resultado |
|---|---|---|
| Escenario bajo | 3 bienes/persona × 250; más 20 % de compartidos/reserva | 750 personales + 150 = 900 bienes |
| Referencia | 4 bienes/persona × 250; más 20 % de compartidos/reserva | 1.000 personales + 200 = 1.200 bienes |
| Escenario alto inicial | 5 bienes/persona × 250; más 20 % de compartidos/reserva | 1.250 personales + 250 = 1.500 bienes |

Supuestos: un computador, uno o dos monitores y periféricos/dock inventariados individualmente según la práctica de la organización; impresoras, repuestos y bienes compartidos en el margen. Son ejemplos de composición, no una dotación constatada. Si teclado/mouse no se inventarían individualmente o varios funcionarios comparten equipos, el conteo será menor. No convertir 250 funcionarios en 250 cuentas: el acceso sigue siendo solo para quienes gestionan/consultan el sistema.

**Capacidad objetivo aprobada para pruebas:** 3.000 bienes (2,5 veces la referencia de 1.200), 500 funcionarios conservando inactivos, 25 cuentas, 10 usuarios concurrentes y hasta 100.000 movimientos/auditorías por categoría en la muestra de referencia. El margen cubre crecimiento y acumulación de bajas sin prometer años concretos. Revisar cifras y costos en Fase 3; no constituye infraestructura contratada.

| Medida | Objetivo aprobado y condición de aceptación futura |
|---|---|
| Búsqueda/lista paginada | p95 ≤ 2 s, página de 50, mezcla de consultas por ID/texto/filtros, 10 usuarios y volumen de referencia |
| Escrituras admitidas | p95 ≤ 3 s, auditoría incluida, correo excluido; cero inconsistencias ante conflictos concurrentes |
| Exportación | ≤ 60 s para límites A-11; medición extremo a extremo en entorno de prueba con condiciones de red registradas |
| Muestra de medición | 1.000 consultas y 200 escrituras válidas tras calentamiento; conflictos y rechazos se reportan aparte; recursos, red y resultados documentados, no se descartan fallos para aparentar cumplimiento |
| Avisos | Primer intento en ≤ 1 minuto en condiciones normales; no equivale a entrega del proveedor |
| Disponibilidad | Objetivo mensual 99,5 % para el servicio completo, incluyendo mantenimientos; no garantía contractual ni selección de hosting |
| Respaldo/recuperación | Una copia por semana, separación máxima de 7 días entre copias exitosas, conservación de copias durante 30 días; RPO objetivo ≤ 7 días (168 h), RTO ≤ 8 h; restauración de prueba antes de producción y luego trimestral |

El respaldo semanal sustituye la recomendación diaria anterior. Se ajusta el RPO de 24 h a **7 días (168 h)** como consecuencia de la frecuencia elegida: un incidente previo a la siguiente copia puede perder los cambios de hasta una semana. No hay garantía de RPO de 24 h con solo una copia semanal. Día/hora UTC, alertas de fallo, ubicación y prueba de restauración se diseñarán en Fases 3/14 (F1-SEG-03); si falla una copia se debe alertar y recuperar la periodicidad, no considerar cumplido el objetivo. No se configura ningún respaldo en esta entrega.

**Alternativa:** fijar metas a partir de datos medidos; aún no hay implementación ni línea base. **Alcance aceptado:** rango estimado y capacidad aprobados como referencia; presupuesto no informado y por evaluar en Fase 3 (F1-SEG-02). El conteo real se obtendrá al levantar inventario, no se inventa para cerrar Fase 1. Hosting, costos, proveedor y mecanismos corresponden a Fase 3; no se contrata ni aprueba gasto. **Criterios aceptados (ejecución futura):** CR-17, CA-N07.

## A-10 — Privacidad y conservación

**Decisión funcional adoptada:** ambos roles acceden a campos de funcionarios/inventario ya solicitados y su historia; solo administrador gestiona cuentas, destinatario y auditoría según P-01. Los reportes ordinarios excluyen RUT/ID y correo personal por defecto; no permitir agregar columnas personales nuevas por selección libre. Correos de avisos siguen minimización de A-07; los enlaces llevan a contenido con autenticación, sin incluir credenciales.

La historia y auditoría no se eliminan mediante cuentas de aplicación. No fijar una retención legal indefinida ni un número de años inventado: se necesita la política de la organización. Chile está confirmado, pero no se ha verificado aquí la normativa sectorial ni el régimen de conservación aplicable. La conservación de respaldo (30 días aprobados en A-09) no reemplaza la retención empresarial del registro. Cualquier purga/anonimización futura requiere política, responsable y autorización específica; no forma parte del MVP de aplicación ni se ejecuta en esta fase.

**Alternativa:** plazo arbitrario único para todo; se descarta como recomendación por carecer de sustento. **Seguimiento F1-SEG-01:** la organización no ha informado su política obligatoria; no se afirma que no exista. Se acepta el requisito funcional de conservación sin purga por cuentas de aplicación y se traslada la validación jurídica/sectorial y del plazo a Fase 6, obligatoria antes de incorporar datos personales reales y antes de producción. No se declara cumplimiento legal ni plazo indefinido de conservación aprobado. Esta dependencia futura no es un requisito empresarial sin analizar de Fase 1. **Criterios aceptados (ejecución futura):** CR-18, HU-12/HU-13/HU-15/HU-16, CA-N04.

## A-11 — Contratos de los cinco reportes y el buscador

**Recomendación común:** Excel y PDF con idéntico conjunto autorizado, filtros, conteo total, fecha/hora/zona de generación y campo temporal aplicado. Orden estable por claves indicadas y referencia interna como desempate; no exportar solo la página visible. Mantener filtros de texto, tipo, condición, unidad, custodia, estado administrativo y fechas cuando sean aplicables. Solo administrador accede a auditoría (P-01).

| Salida | Columnas aprobadas | Orden |
|---|---|---|
| Inventario general | Código, serie o ausencia, tipo, marca, modelo, adquisición, condición, estado administrativo, custodio actual y unidad actual por custodia | Código |
| Bienes por funcionario | Referencia no documental del funcionario, nombre, cargo, unidad actual, código/serie/tipo/marca/modelo del bien, condición, inicio de custodia | Nombre/referencia de funcionario, código |
| Movimientos | Referencia de movimiento, código del bien, tipo de movimiento, fecha efectiva y de registro, origen/destino por referencia/nombre, unidades históricas de ambos, motivo, administrador por referencia/nombre y referencia de corrección si existe | Fecha efectiva, orden de registro |
| Bienes por condición | Condición, código, serie, tipo, marca, modelo, estado administrativo, custodio y unidad actual; subtotales por condición | Condición bueno/regular/malo, código |
| Auditoría | Referencia, fecha de registro, actor, entidad/referencia, acción, campos y anterior/nuevo pertinentes sin secretos | Fecha de registro, referencia |
| Resultados del buscador | Dos conjuntos separados: bienes con columnas de inventario; funcionarios con referencia no documental, nombre, cargo, unidad y activo/inactivo | Tipo de resultado, código o nombre/referencia |

Los motivos y valores de auditoría son contenido autorizado solo en sus reportes respectivos; se excluyen secretos y se revisa minimización A-10. No añadir texto libre de observaciones de bienes a exportaciones generales por defecto. Datos con aspecto de fórmulas en Excel se tratan como texto; PDF no ejecuta contenido introducido por usuarios.

Límites aprobados por exportación: 10.000 filas Excel y 2.000 PDF; en buscador mixto se suman ambos conjuntos. Si se supera, rechazar explícitamente y pedir acotar filtros; nunca truncar silenciosamente ni cambiar de formato. Sin coincidencias: archivo válido con cabeceras, filtros y total cero, sin filas ficticias. Para informes con subtotales, el límite cuenta filas de detalle; no se repiten filas como datos por paginación del PDF. Presentación visual y tecnología de generación quedan en fases posteriores.

**Alternativa:** exportación sin límites o solo página visible; la primera no tiene garantía operativa, la segunda contradice la exportación del conjunto filtrado. **Criterios aceptados (ejecución futura):** CR-19/CR-20; HU-16 y CA-H07-3.

## P-01/P-02/P-04 — Ratificación aprobada

| ID | Decisión ratificada | Motivo / alternativa |
|---|---|---|
| P-01 | Consulta y exportación de auditoría solo administrador; lectura conserva inventario e historial empresarial completos | Diferenciar evidencia de seguridad de historia de custodia; alternativa: lectura también ve auditoría, que exigiría revisar privacidad y matriz |
| P-02 | Condición física, custodia y baja separadas, con reglas A-03 | Evitar que cambiar a malo borre responsable; alternativa de un único estado confunde dimensiones |
| P-04 | Operación confirmada subsiste al fallar correo; aviso fallido visible y recuperable según A-07 | No duplicar ni perder movimientos por disponibilidad de un servicio externo |

## Criterios complementarios con resultado aprobado

Son criterios de negocio aprobados para pruebas futuras; su ejecución funcional está pendiente. «t» es un instante sintético; Z es **UTC**, la zona empresarial confirmada. F1/F2, B1/B2 y ADM1/ADM2 son referencias sintéticas sin datos reales.

| ID | Dado / cuando | Entonces aprobado | Trazabilidad |
|---|---|---|---|
| CR-01 | Un RUT válido con/sin puntos, guion y k/K; se registra otra presentación de la misma identidad | Un único funcionario; duplicado rechazado incluso si el primero está inactivo; DV inválido rechazado | A-01; HU-01; RF-01 |
| CR-02 | ID institucional ` F001 ` ya registrado; se intenta `f001`; se edita luego un cargo válido | Alta duplicada rechazada; edición válida conserva identidad e historia y genera auditoría | A-01; HU-01; RF-01 |
| CR-03 | Código ` EQ-01 ` existe y serie `SN-1` existe; se crean duplicados y dos bienes sin serie con códigos distintos | Duplicados rechazados por separado/concurrentemente; dos ausencias de serie permitidas con motivo; no se reutiliza identidad dada de baja | A-02; HU-02; RF-02 |
| CR-04 | F1 tiene B1; se solicita baja de F1 o B1; luego se devuelve B1 y repite la baja | Primeras bajas rechazadas sin cambios; después bajas lógicas admitidas, historia intacta | A-03; HU-01/HU-04; RF-01/RF-04 |
| CR-05 | Bien en baja, funcionario inactivo o bien malo; se intenta asignación; bien ya asignado pasa a malo | Nuevas asignaciones rechazadas; el cambio a malo conserva custodio; devolución posterior permitida | A-03/P-02; HU-02/HU-03/HU-04; RF-02/RF-03/RF-04 |
| CR-06 | Bien malo dado de baja sin custodia; administrador lo reactiva y pide asignarlo | Reactivación con motivo conserva malo y sin custodia; asignación rechazada hasta cambio válido de condición | A-03/P-02; HU-04; RF-04 |
| CR-07 | F1 cambia de unidad U1 a U2 teniendo B1 y un movimiento previo en U1 | Bien sigue con F1; ficha actual indica U2, movimiento previo conserva U1; no se inventa traslado de custodio | A-05; HU-01/HU-07; RF-01/RF-07 |
| CR-08 | B1 está con F1; traslado a F2 en t y dos solicitudes en conflicto | Origen termina en t, destino inicia en t; un solo custodio y ningún cierre parcial; traslado a sí mismo/origen obsoleto rechazado | A-04; HU-03/HU-04; RF-03/RF-04; RNF-02 |
| CR-09 | Movimiento erróneo B1→F1; se anota y compensa devolviendo y asignando a F2 | Original intacto, anotación y compensaciones vinculadas; ficha muestra F2 e historia completa; si hay custodia posterior no se revierte automáticamente | A-04; HU-05; RF-05 |
| CR-10 | Se solicita movimiento retroactivo/futuro, devolución sin custodia o cambio a misma condición; se repite una solicitud exitosa con su correlación | Inválidas rechazadas; repetición retorna resultado original sin nuevo movimiento/auditoría/aviso lógico | A-04; HU-03/HU-04/HU-05; RF-03/RF-04/RF-05 |
| CR-11 | B1 sin custodia y B2 con F1 en U1; se consulta filtro de unidad U1 y luego historial tras cambio a U2 | En actual U1 coincide B2 antes del cambio, nunca B1; historia sigue indicando unidad aplicable a cada evento | A-05; HU-06/HU-07; RF-06/RF-07 |
| CR-12 | Eventos justo al inicio, último instante y 00:00 del día siguiente en UTC; se filtra un día con dispositivo configurado en zona distinta | Incluye los dos primeros y excluye el tercero por instantes; usa campo temporal de A-06; rango invertido rechazado; no confunde adquisición con movimiento | A-06; HU-07/HU-13/HU-16; RF-07/RF-13/RF-16; RNF-03 |
| CR-13 | Cambio empresarial confirmado falla al enviar correo; se cambia destinatario y reintenta el pendiente | Operación subsiste; fallo visible al administrador; reintento usa destinatario original o se cancela con motivo, sin modificar evidencia | A-07/P-04; HU-14/HU-15; RF-14/RF-15 |
| CR-14 | Error transitorio, permanente o resultado incierto; evento con datos personales o cambio de destinatario | Transitorio: tres reintentos; permanente: detener; incierto: conciliar sin repetición ciega; aplicar catálogo y minimización; no incluir tokens/RUT/correo personal ni dirección nueva al anterior | A-07/A-10; HU-14/HU-15; RF-14/RF-15; RNF-04 |
| CR-15 | Invitación consumida o de más de 24 h; recuperación consumida o de más de 30 min; cuenta desactivada | No conceder acceso; reenvío invalida enlace previo; recuperación no reactiva cuenta; siguiente petición tras revocación falla, sin confiar en sesiones antiguas | A-08; HU-09/HU-10; RF-09/RF-10 |
| CR-16 | Administrador sin MFA, cambio de propio rol, autodesactivación o dos bajas de últimos administradores; se cancela una acción crítica | Sin MFA no opera; propio rol/autodesactivación rechazados; al menos un administrador activo; cancelación sin cambios | A-08; HU-08/HU-11; RF-08/RF-11; RNF-01/RNF-02 |
| CR-17 | Conjunto y carga de referencia A-09; futura medición de consultas, escritura, avisos, respaldo/restauración | Comparar con cada objetivo A-09, incluido respaldo semanal/RPO de 7 días y RTO de 8 h; reportar desviaciones sin afirmar cumplimiento por documentar metas | A-09; HU-06/HU-15/HU-16; RF-06/RF-15/RF-16; RNF-07 |
| CR-18 | Lectura intenta auditoría/cuentas/configuración o exportar columnas personales adicionales; se solicita purga de historia | Acceso/columnas rechazados; inventario e historia de custodia sí accesibles; no hay purga de aplicación; política legal no se da por validada | A-10/P-01; HU-08/HU-12/HU-13/HU-16; RF-08/RF-12/RF-13/RF-16; RNF-04 |
| CR-19 | Los cinco reportes y buscador se generan en Excel/PDF con datos/filtros conocidos; texto comienza con `=` | Misma selección autorizada, columnas y orden A-11, metadatos, conteos y subtotales correctos; texto no se ejecuta como fórmula | A-11; HU-07/HU-16; RF-07/RF-16 |
| CR-20 | Cero filas; exactamente 10.000/2.000 filas; luego una fila adicional, en Excel/PDF respectivamente | Vacío válido; límite exacto permitido; exceso rechazado sin truncar, incluyendo suma de conjuntos del buscador | A-09/A-11; HU-16; RF-16 |

## Registro de resolución y seguimientos

| ID | Resolución aceptada de Fase 1 | Evidencia / criterio |
|---|---|---|
| A-01 | Identidad RUT/ID canónica, obligatoria y única por tipo | D-14; CR-01/CR-02 |
| A-02 | Código obligatorio; serie única si existe, ausencia con motivo | D-14; CR-03 |
| A-03 | Bloquear bajas con custodia; activos admisibles; reactivar sin restaurar asignaciones | D-14; CR-04 a CR-06 |
| A-04 | Movimientos al confirmar, sin retroactividad; corrección vinculada y compensaciones; no duplicar solicitudes | D-14; CR-08 a CR-10 |
| A-05 | Unidad del custodio, pertenencia histórica y sin ubicación independiente | D-14; CR-07/CR-11 |
| A-06 | UTC; límites de días y campo temporal por reporte definidos | D-14; CR-12 |
| A-07 | Catálogo de avisos, destinatario fijado, minimización y fallos/reintentos definidos | D-14; CR-13/CR-14 |
| A-08 | Alta controlada, invitación 24 h, recuperación 30 min, MFA y revocación; sesiones 30 min/8 h | D-14; CR-15/CR-16 |
| A-09 | Capacidad/objetivos aceptados; respaldo semanal, RPO 7 días, RTO 8 h, copias 30 días | D-14; CR-17/CR-20; F1-SEG-02/F1-SEG-03 para ejecución futura |
| A-10 | Minimización y conservación sin purga de aplicación aceptadas; validación legal antes de datos reales | D-14; CR-18; seguimiento obligatorio F1-SEG-01 |
| A-11 | Columnas, fechas, orden y límites de cinco reportes/buscador en Excel/PDF | D-14; CR-19/CR-20 |
| P-01 | Auditoría solo para administrador; lectura consulta historia empresarial | D-14; CR-18 |
| P-02 | Condición/custodia/baja separadas | D-14; CR-05/CR-06 |
| P-04 | Fallo de correo no revierte negocio confirmado | D-14; CR-13/CR-14 |

| Seguimiento | Responsable y fase futura | Condición de cumplimiento |
|---|---|---|
| F1-SEG-01 | Organización y responsable de privacidad; Fase 6 | Validar normativa chilena/sectorial y política/plazo de conservación antes de datos reales; no se presupone inexistencia de política ni se autoriza purga |
| F1-SEG-02 | Usuario y arquitectura; Fase 3 | Presupuesto, costos y capacidad real contrastados con objetivos; no autoriza gasto ni hosting |
| F1-SEG-03 | Operaciones y usuario; diseño en Fase 3, ejecución Fase 14 | Fijar día/hora UTC del respaldo semanal, alertas, ubicación, conservación 30 días y restauración; verificar RPO ≤ 7 días y RTO ≤ 8 h fuera de producción |

CA1-06 cumplido por aprobación del usuario. Los seguimientos son dependencias operativas/jurídicas explícitas de fases futuras; no se marcan ejecutados ni se eliminan riesgos por cerrar el análisis. La Fase 2 necesita autorización expresa independiente.
