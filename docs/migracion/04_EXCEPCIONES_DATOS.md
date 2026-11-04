# FASE 4 — Excepciones y decisiones de datos

Fecha: 2026-11-03. Estado: **EN_REVISION / REGLAS DOCUMENTADAS, SIN PERFILADO OPERACIONAL**.

## Procedencia y estados

Los primeros 13 controles corresponden uno a uno a las filas 2–14 de CALIDAD_DATOS. Su severidad original se conserva; riesgo_control aplica el criterio bloqueante del prompt a identidad, secretos, inventarios, fechas y capacidades. EX-14–20 añaden riesgos de aplicación/motores/corte detectados en fases anteriores. [Catálogo](04_CATALOGO_EXCEPCIONES.csv).

Los conteos declarados por el Excel —incluidas 91 entradas con años y 42/43 UPS sin fecha— son antecedentes del diccionario. No se afirma que sigan presentes ni se inventan cantidades de incidencias reales. No se copian ejemplos de credenciales, códigos de impresión, direcciones personales ni texto libre operacional.

Estados futuros propuestos por incidencia: ABIERTA → EN_REVISION → RESUELTA_APROBADA o RECHAZADA_CON_MOTIVO. Cierre requiere responsable, evidencia segura, regla/decisión/versiones y disposición final. Un caso sin valor reconstruible puede cerrarse solo como excepción aprobada conservando desconocido; no como dato recuperado ficticio. Cambio de resolución crea versión, no borra decisión anterior. Los 20 controles actuales siguen DOCUMENTADA_NO_PERFILADA.

## Controles de excepción

| ID / fila fuente | Riesgo | Tema | Tratamiento | Cierre requerido |
|---|---|---|---|---|
| EX-01 / 2 | CRÍTICO → CRÍTICO | Credenciales en observaciones | Excluir secretos del flujo de transformación, valores nuevos/anteriores, logs, reportes y staging saneado. Custodio de seguridad debe evaluar y rotar las credenciales afectadas por canal seguro. | Confirmación de exclusión y revisión segura/rotación donde corresponda, sin divulgar valores. |
| EX-02 / 3 | ALTO → CRÍTICO | Código de impresión sensible | Omitir por defecto; solo conservar con necesidad, cifrado, acceso por columna/servicio y custodia aprobados. No copiarlo como observación ni ejemplo. | Decisión explícita de no almacenar o diseño de protección y custodia aprobado. |
| EX-03 / 4 | ALTO → CRÍTICO | Años en inventario SERVIU | Las 91 entradas informadas son referencia documental, no medición nueva. No tratarlas como inventario ni sustituirlas por IDs inventados. | Identificador confirmado en fuente autoritativa o excepción admitida sin inventario, manteniendo código operativo. |
| EX-04 / 5 | ALTO → CRÍTICO | Compartidos sin responsable nominal | Responsable real designado o proceso de custodia institucional aprobado; no funcionario ficticio, sin destino o asignación huérfana. | Responsabilidad verificada o extensión institucional aprobada y probada. |
| EX-05 / 6 | MEDIO → ALTO | Variantes de catálogos y booleanos | Normalizar solo con tabla de equivalencias versionada; conservar original y rechazar coincidencias ambiguas. No eliminar tildes por inferencia. | Equivalencia de marca/origen/tipo/departamento o booleano documentada y aprobada. |
| EX-06 / 7 | MEDIO → ALTO | Departamentos potencialmente distintos | No fusionar JURIDICO/JURIDICA hasta confirmar si son la misma unidad; conservar historial de pertenencia. | Correspondencia validada por responsable de organización. |
| EX-07 / 8 | MEDIO → CRÍTICO | Capacidad y tecnología mezcladas | Separar módulos de RAM/discos por fila; unidades y notaciones ambiguas requieren confirmación. No interpretar multiplicidad por intuición. | Capacidad, unidad y familia aprobadas; TB decimal 1000 GB solo si se ratifica regla documentada. |
| EX-08 / 9 | MEDIO → CRÍTICO | Fechas ausentes, texto o granularidad | Parseo estricto de formatos aprobados y fechas existentes. Mantener NULL histórico; no asignar fecha actual ni medianoche ficticia. | Fuente/interpretación de fecha ratificada y representación temporal compatible. |
| EX-09 / 10 | MEDIO → CRÍTICO | Personas, correos y pertenencias contradictorias | No deduplicar por nombre aproximado ni correo aislado; validar identidad y resolver cada conflicto. No imponer UQ de correo/red no declarado en campo. | Clave de persona y vínculo cuenta/funcionario verificados, con decisiones de UQ documentadas. |
| EX-10 / 11 | MEDIO → ALTO | Ubicación y dirección mal clasificadas | No cargar modelo/IP como comuna ni corregir numeración de dirección por patrón. Separar área del funcionario de ubicación del equipo. | Delegación/dirección confirmadas; ubicación independiente solo si se aprueba extensión. |
| EX-11 / 12 | MEDIO → CRÍTICO | Identificadores numéricos dañados y encabezados | Leer tipo/cadena/precisión original sin evaluar Excel. No inventar ceros ni dígitos irreconstruibles ni aceptar redondeo como identidad. Encabezados con apóstrofe se resuelven por alias controlado. | Texto original verificable o excepción explícita sin identificación inventada. |
| EX-12 / 13 | BAJO → MEDIO | Campos derivados, vacíos y numeración auxiliar | No persistir bandera derivada de webcam, columna completamente vacía o ordinal repetido como identidad. Verificar discrepancias entre bandera y evidencia de equipo. | Regla de no persistencia justificada y evidencia de equipo reconciliada. |
| EX-13 / 14 | BAJO → ALTO | Notas en inventarios o estados | Clasificar notas como observación saneada de entidad correcta, sin convertirlas en inventario/situación ni ocultar su procedencia. | Contenido saneado y destino confirmados; nunca secreto en observación. |
| EX-14 / aplicación/corte | NO_APLICA → CRÍTICO | Instantes e historia de la aplicación | No truncar microsegundos, nombres de unidad, actor, motivos, correcciones ni intervalos al DATE o DATETIME2 de menor precisión. | Extensión/precisión aprobada y reconciliación de historia sin pérdidas. |
| EX-15 / aplicación/corte | NO_APLICA → CRÍTICO | Longitud, collation y Unicode | Perfilar tamaños en caracteres y bytes; no truncar texto ni cambiar equivalencia de identidad por collation no aprobada. | Codificación, longitudes y comparación aprobadas, sin pérdidas ni colisiones. |
| EX-16 / aplicación/corte | NO_APLICA → CRÍTICO | Cruce de códigos y equipos entre fuentes | Código de aplicación no es inventario SERVIU/MINVU. No unir dos equipos por serie vacía, año, nombre, fila o coincidencia difusa. | Identidad física confirmada y resolución versionada de equivalencia entre fuentes. |
| EX-17 / aplicación/corte | NO_APLICA → CRÍTICO | Identidad, permisos y soporte de autenticación | Conservar proveedor externo y estado completo; no importar hashes falsos ni dejar runtime leyendo sesión/rol obsoleto de otra base sin diseño. | Decisiones de proveedor/store/perfiles y pruebas de revocación/MFA/último administrador aprobadas. |
| EX-18 / aplicación/corte | NO_APLICA → CRÍTICO | Avisos, enlaces y exportaciones en corte/restauración | Deshabilitar workers, invalidar sesiones/enlaces y conciliar efectos inciertos. No reactivar pendientes ni reenviar automáticamente después de restaurar. | Corte consistente y efectos conciliados; autorización específica para reabrir o enviar. |
| EX-19 / aplicación/corte | NO_APLICA → CRÍTICO | Baja final, condición y situación | No convertir baja concluida en EN PROCESO DE BAJA ni deducir condición de custodia/situación. Bloquear combinación no admisible. | Tabla de estados y transiciones aprobada, historia intacta. |
| EX-20 / aplicación/corte | NO_APLICA → CRÍTICO | Fórmulas, contenido activo y estructura cambiante | No evaluar fórmulas/macros/links externos ni aceptar cabeceras desconocidas. Caches Excel sin evidencia pueden ser insuficientes. | Fuente inerte, encabezados y tipos verificados; nueva versión de manifiesto si cambia. |

## Registro seguro de una incidencia futura

Identificador aleatorio/incidenceId, lote/snapshot/regla, categoría EX, locator opaco, entidad/campo, impacto, responsable propuesto, estado, evidencia restringida y resolución/versiones. El registro compartible no contiene valor original/nuevo, secreto, fragmento de observación ni hash simple de dato personal/código de impresión. La ubicación exacta del origen puede ser restringida; no se publica para facilitar extracción de secretos.

Los responsables son funciones propuestas, no personas designadas ni permisos remotos concedidos. Custodio del origen y seguridad gestionarán rotación de credenciales donde corresponda por canal aprobado; no se contactó a terceros desde esta fase. Retención/accesos/cifrado de cuarentena requieren F1-SEG-01/03 antes de recibir datos reales.

## Bloqueantes y decisiones vinculadas

Todas las M1-D01–16 se siguen en las reglas y el plan: proveedor/store coherentes; personas/cuentas; ubicación; compartidos; códigos/UQ; precisión; historia y soporte; subtipos; perfiles; secretos; baja; CHECK; longitudes/collation; transformaciones. La aprobación de Fase 3 no transforma una correspondencia candidata en identidad confirmada ni define datos irreconstruibles.

Se permite terminar la planificación sin el Excel operacional. Su ausencia bloquea el perfilado y la aceptación de datos reales, no autoriza a generar una muestra presentada como origen. No se crean tickets, registros de incidencias reales ni conteos de saneamiento inventados. Fase 4 EN_REVISION; Fase 5 NO AUTORIZADA.
