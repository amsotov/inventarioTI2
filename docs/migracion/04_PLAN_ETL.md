# FASE 4 — Plan ETL y protección de datos

Fecha: 2026-11-03. Estado: **EN_REVISION / PLAN NO EJECUTADO**. Base aceptada de Fase 3: `59b58d912010e7e6a0bd56d1ceef71264d5ad05e`.

## 1. Autorización, fuentes y estado real

Usuario: «apruebo fase 3 inicia fase 4». Cierra Fase 3 y autoriza únicamente planificación ETL, excepciones, reconciliación y recuperación. No SQL, DDL, conexión a base desplegada, extracción operacional, transformación/carga de datos reales, cambios de aplicación, merge, despliegue, envíos ni Fase 5.

Revisados prompt de migración, estado/instrucciones, cuatro hojas del diccionario, entregas 0–3, esquema actual declarado (19 tablas/155 campos), modelo objetivo (30 tablas/117 campos), contratos, requisitos y runbook/ensayo histórico de recuperación. El repositorio contiene el diccionario, pero no el Excel operacional del que proceden MAPEO_EXCEL/CALIDAD_DATOS ni una extracción de datos reales. Los 57 mapeos y 13 hallazgos son requisitos documentados; sus conteos/ejemplos no se presentan como perfilado nuevo ni como datos ya cargados.

La aprobación de diseño de Fase 3 adopta la propuesta visual/contractual para continuar planificación; las elecciones excluyentes y decisiones condicionadas a datos M1-D01–16 conservan sus condiciones. [Puertas de control](04_PUERTAS_CONTROL.csv) distinguen lo pendiente de los futuros ensayos. Aceptar este plan no acredita esas puertas.

## 2. Dos entradas y autoridad de datos

**APP_POSTGRES:** inventario, personas, cuentas y proveedor_ref, historial, pertenencias, custodias, anotaciones, auditoría, comandos, avisos, intentos, sesiones/intenciones/entregas/límites, seguridad.eventos y exportaciones. Preservar referencias públicas UUID, integridad y garantías existentes mediante el soporte complementario aprobado; 30 tablas nuevas no reemplazan todas las capacidades.

**EXCEL_LEGADO:** equipos/atributos técnicos/catálogos/personas/asignaciones/mantenciones de las hojas EquipoComputacional, Print&Plotter, Escanner, UPS y Switch. Puede enriquecer o proponer altas, pero no sobrescribe automáticamente identidad, custodia ni historia de aplicación. No mezclar un código operativo con inventario SERVIU/MINVU ni creer que una fila equivale a un equipo.

La precedencia por campo debe ser aprobada por inventario y datos: discrepancia entre fuentes genera candidato, no última-escritura-gana. Un catálogo derivado se vincula mediante equivalencia validada; personas y equipos solo se fusionan con identidad autoritativa. Conservar ambos orígenes y la resolución. La asociación cuenta↔funcionario requiere comprobación separada; no toda persona necesita usuario.

## 3. Recepción y staging propuestos

Las zonas siguientes son lógicas, **no esquemas creados**:

| Zona | Contenido y controles | Salida permitida |
|---|---|---|
| Recepción restringida | Original inmutable, cifrado, custodio/permiso, hash de archivo y cadena de custodia; nunca GitHub | Referencia opaca, tamaño, versión y resultado de recepción |
| Aislamiento de contenido | Lector inerte: sin fórmulas/macros/links externos; verificar cabeceras/tipos; control de secretos antes de staging saneado | Celdas aptas o incidencias sin copiar secretos |
| Staging saneado | Valores autorizados, identidad de lote/fuente/hoja/fila/columna y precisión/tipo original; acceso mínimo | Fragmentos normalizables trazables |
| Normalización propuesta | Valores original autorizado/canónico y reglas versionadas; catálogos/candidatos/identidades | Datos aprobados o cuarentena |
| Correspondencias | ID antiguo↔ref pública↔ID destino, fuente y subentidad, evidencia/decisión | Mapas persistentes verificables |
| Cuarentena | Código de excepción, referencia opaca, responsable/estado/evidencia; valores sensibles solo en custodia separada | Cierre/rechazo explícito, sin valores en reportes públicos |
| Candidato de carga | Agregados íntegros con padres/FK resueltos y manifiesto de resultado | Solo destino aislado autorizado y todavía sin consumidores |

Cifrado en tránsito/reposo y claves en gestor separado, identidades separadas para extracción, saneamiento, resolución, carga y verificación. Nada de credenciales en variables impresas, CLI con secretos, logs, PR, Excel de errores o auditoría antes/nuevo. No enviar filas a proveedores de correo ni a servicios externos para limpiarlas. Roles y operador concretos se asignan antes de acceder al origen, no se inventan personas responsables.

La copia original puede contener secretos y debe permanecer en recepción cifrada con acceso excepcional, no replicarse indiscriminadamente a cuarentenas. Ante secreto identificado, suspender propagación, registrar metadatos mínimos y solicitar a su custodio evaluación/rotación por canal seguro. **No se ha enviado ninguna comunicación ni rotado credenciales en esta fase.** FUNC_CLAVE_IMPRESION se omite por defecto; conservarlo exige necesidad, cifrado, permisos y custodia aprobados.

Retención de staging/originales/cuarentena no se inventa: concretar F1-SEG-01 y política técnica antes de recibir datos reales. No confundir copias 30 días con política legal de personas/auditoría ni implantar purga sin autorización.

## 4. Manifiesto, claves e idempotencia

Cada ejecución futura tendrá sourceSystem, snapshotId, hash de fuente, schemaVersion, reglasVersion, decisionesVersion, applicationCommit, modeloHash, custodio y tiempos UTC; lote con estado PREPARADO/VALIDADO/CARGANDO/CONCILIADO/RECHAZADO, checkpoint y manifestación de fallos. Son contratos operativos propuestos, no tablas implementadas.

Identidad de aplicación conserva tabla+UUID original y ref pública; ID INT nuevo se asigna una vez y se conserva en correspondencia. Identidad de fragmento Excel usa snapshot, hoja, locator de fila, grupo/subentidad y ordinal (por ejemplo monitor/módulo/disco/rubro); nunca nombre de persona, serie vacía, número auxiliar o año como PK. La posición de fila solo es estable dentro del mismo snapshot; un archivo reordenado exige nueva reconciliación, no actualización por número de fila.

Clave de replay del lote incorpora hash de fuente + versiones de reglas/decisiones + entidad/fragmento. Hash de carga canónica separa misma clave/mismo contenido de misma clave/contenido distinto. No usar hashes simples de PIN/contraseñas/datos personales como identificadores públicos; referencias opacas/HMAC bajo clave externa cuando proceda. Conservar procedencia sin exponer valores sensibles.

Reejecutar lote idéntico no crea equipos, asignaciones, movimientos, auditorías, comandos ni avisos adicionales. Cambiar fuente/regla/resolución crea una versión nueva y diff aprobado; no sobrescribe historia inmutable ni reasigna IDs. Confirmación perdida se concilia por manifiesto/mapa durable antes de repetir. La idempotencia ETL no reemplaza Idempotency-Key de negocio ni autoriza reproducir efectos externos.

## 5. Transformaciones y deduplicación

[04_REGLAS_TRANSFORMACION.csv](04_REGLAS_TRANSFORMACION.csv) cubre las 57 filas MAPEO_EXCEL con nombres físicos exactos, tratamiento, excepción y decisiones. Los textos abreviados del Excel no se ejecutan como nombres SQL: por ejemplo rubro/código de insumos se resuelve a INSU_RUBRO_ID/INSU_CODIGO. No se alteran nombres del diccionario.

- Preservar texto/caso original autorizado; aplicar solo alias/canonización aprobados. TRIM/UPPER/NBSP, tildes y collation se perfilan; no fusionar departamentos o marcas por aproximación. MODELOS pertenece a MARCAS; marca sin modelo requiere conservación en soporte o placeholder explícito aprobado, no modelo real inventado.
- Identificadores como texto con dominio y procedencia; años de inventario se excluyen y valores redondeados/científicos se verifican contra fuente exacta. No inventar dígitos/ceros, convertir código operativo a MINVU/SERVIU por intuición ni imponer UQ no declarados sin perfilado.
- Desnormalizar una fila en múltiples candidatos: PC, hasta cuatro monitores y periféricos; cada pieza/insumo/mantención conserva su ordinal y origen. No crear hardware por indicador booleano aislado ni por celdas vacías. Validar tipo/subtipo/exclusión y nombre de red obligatorio/único; si falta, no fabricarlo.
- RAM/discos: capacidad y tecnología separadas con decimal/entero exacto; notación ambigua queda en cola. El diccionario describe TB decimal; su ratificación no permite adivinar multiplicidad. Dúplex/preferencia personal/candado son campos distintos, con NULL para desconocido cuando corresponda.
- Fechas: formatos explícitos, validación de calendario y precisión. DATE conocido es día, no instante UTC inventado. Conservar inicio NULL histórico; no usar fecha actual/lote para rellenar. Instantes de aplicación siguen UTC y precisión íntegra; Fase 1 detectó DATETIME2(0)/(3) y DATE insuficientes, requieren diseño complementario antes de cargar.
- Vigencia no se deduce únicamente de fecha de inicio ausente. Resolver estado/custodia desde evidencia y preservar origen. Traspaso solo si predecesor/mismo equipo/orden/cierre-apertura están verificados; sin ciclos, autoenlaces, solapes o ramas incompatibles. No confundir cambio de unidad del custodio con traslado de equipo.
- Observaciones saneadas se asignan a la entidad correcta; notas de traslado o estado libre no son códigos/eventos automáticamente. Dos mantenciones del mismo día no se fusionan por fecha sola.

No se carga nuevo catálogo, persona, cuenta, equipo o movimiento para conseguir que una FK pase. La cola de excepciones resuelve faltantes; la historia y auditoría existentes se conservan aunque su actor esté inactivo. Actor sin correspondencia es bloqueante, no usuario genérico ficticio.

## 6. Orden de carga, atomicidad y soporte

[Orden de las 30 tablas](04_ORDEN_CARGA.csv) deriva del grafo FK ignorando solo el lazo de predecesor de ASIGNACIONES, tratado mediante validación topológica específica. Padres y correspondencias antes de hijos; FK/checks/seguridad activos, sin deshabilitarlos para ocultar fallos. Es orden de planificación, no script SQL.

Después de núcleo validado, integrar soporte de los 19 conjuntos actuales según sus dependencias: identidad/roles/store, comandos, pertenencias/movimientos/custodias/anotaciones, auditoría, outbox/intentos/configuración, seguridad y exportaciones. Algunos datos alimentan núcleo y soporte a la vez; no duplicar sus eventos. La relación usuario/persona y precisión/historia deben estar resueltas antes de promover cualquier carga con actores/instantes.

Cargas en destino aislado, sin web/worker/consumidores. Checkpoints por lote/partición autorizada y agregado; el tamaño se decide por ensayo, no se promete por estimación. Dentro del agregado de equipo y movimiento, estado/historia/asignación/auditoría/comando/aviso quedan íntegros o se revierten. Los padres precargados no habilitan exposición parcial: solo se promueve un candidato completo reconciliado. No ejecutar down destructivo ni borrar lotes ajenos como reparación.

Mantener Supabase Auth como proveedor no significa mantener sin diseño un store PostgreSQL incompatible con el negocio SQL Server. El adaptador de cuentas/sesiones/intenciones/principal debe ser coherente y probado; alternativa de store separado exige diseño explícito de revocación/consistencia. No se promete transacción distribuida ni migración de contraseñas/MFA por copiar tablas.

## 7. Respaldo, restauración y reversión

Antes de una ejecución real: snapshot consistente de APP_POSTGRES, originales Excel cifrados, mapas/reglas/decisiones/manifiestos, esquema/roles/ACL/RLS/funciones/secuencias/propietarios, configuración de aplicación e identidad y referencias de custodia. Backups de datos no incluyen automáticamente configuración/proveedor/MFA ni secretos externos. No volcar secrets a Git ni copiar sesiones operativas como acceso válido.

Verificar copia mediante lectura/autenticidad y **restauración a destino aislado**, cotejo de manifiesto, conteos/hashes/relaciones, mínimos privilegios, login nuevo/MFA y descargas privadas. Un archivo, hash aislado o VERIFYONLY por sí solo no acredita recuperación integral. La herramienta histórica de ops/continuity.ts es ensayo sintético, no solución productiva universal. PostgreSQL y SQL Server requieren procedimientos/versiones/métodos de copia propios; no tratar dump/backup de un motor como restaurable directamente en otro.

Al restaurar: sesiones y enlaces anteriores invalidados; credenciales/configuración recuperadas desde custodia; worker apagado y avisos/entregas inciertos en cuarentena. Exportaciones mantienen propietario/TTL y permisos actuales: no servir artefactos caducados ni reautorizar por restaurar bytes. Conservar historia/comandos/destino/correlación/intentos; estados transitorios cambian solo mediante política de aislamiento aprobada y trazada, no mutación silenciosa de evidencia.

**Antes de reapertura:** si falla candidato, conservar origen congelado íntegro y volver al servicio anterior compatible, con efectos externos detenidos y evidencia preservada. Retirar solo recursos de ensayo propios si está autorizado; no borrar destino para ocultar fallo.

**Después de escrituras nuevas en destino:** no basta apuntar a PostgreSQL anterior ni restaurar snapshot. Congelar ambos lados, preservar intervalo posterior, conciliar comandos/datos/identidad/efectos y aplicar recuperación/delta explícitamente aprobados. Si no hay estrategia demostrada, mantener mantenimiento y resolver; no perder cambios nuevos por un rollback llamado automático.

El plan de reversión detallado está en [04_RECONCILIACION_ROLLBACK.md](04_RECONCILIACION_ROLLBACK.md). Objetivos previos intactos: UTC, copia semanal/máximo 168 h entre éxitos, RPO ≤168 h, RTO ≤8 h y copias 30 días. El corte necesita snapshot final consistente más reciente, no usar el RPO semanal como permiso de perder cambios conocidos. Medir RTO desde interrupción hasta servicio útil aceptado; operador, ventana, cifrado, almacenamiento/alertas y F1-SEG-01/02/03 siguen pendientes.

## 8. Corte y promoción propuestos

1. Autorizar entorno/ventana/operadores/uso de datos y verificar puertas previas; no deducirlo de aceptación documental.
2. Ensayar en aislado con datos sintéticos o fuente autorizada protegida; cerrar excepciones y demostrar restauración/replay/reconciliación.
3. Congelar todas las escrituras de origen y cualquier despacho; drenar comandos en curso y conservar último resultado. Preferir ventana acotada con snapshot final antes que CDC/doble escritura improvisados.
4. Capturar snapshot consistente y manifiesto final; si el origen cambió después, invalidar candidato o ejecutar delta diseñado y aprobado. No mezclar puntos temporales de tablas.
5. Cargar/verificar candidato con aplicación compatible de fases posteriores, sin consumidores. Migrar esquema/datos en Fase 5 no autoriza operar sin adaptadores/regresión de Fases 6–8.
6. Aplicar aislamiento de acceso/efectos, smoke con identidades autorizadas y pruebas negativas, comparar reportes y aceptar balances.
7. Responsable autorizado decide GO; registrar referencia de corte y punto de divergencia. Solo un sistema escritor tras abrir; worker/envío requiere su propia autorización.
8. Observar errores/latencias/diferencias, conservar fuente/backup/mapas y plan de retorno. No eliminar PostgreSQL ni evidencia al aceptar la carga.

No se promete cero downtime, capacidad gestionada ni cumplimiento mensual por este plan. Ventana y comunicación se definen antes de operar; esta fase no envía mensajes.

## 9. Reconciliación, aceptación y estado

[36 casos de reconciliación](04_PRUEBAS_RECONCILIACION.csv) cubren seguridad, datos, historia, idempotencia, concurrencia, reportes y recuperación. Todos son **NO_EJECUTADA_PLANIFICADA**. [Excepciones](04_EXCEPCIONES_DATOS.md) y [20 controles](04_CATALOGO_EXCEPCIONES.csv) no son un registro de incidencias reales perfiladas.

Para GO futuro: cero bloqueantes críticos abiertos, cero huérfanos/dobles vigentes/solapes/ciclos no aprobados, cero pérdidas de historia/precisión/textos/refs y cero secretos en salidas; cada descarte/cambio justificado por regla y aprobación. Conteos iguales donde corresponden y balances explícitos para explosión/deduplicación, sin sumar filas y objetos como si fueran equivalentes. No convertir datos corruptos en éxito parcial por dejar el resto cargado.

CA-M4-01: 57 reglas fuente y 13 hallazgos cubiertos; CA-M4-02: staging/claves/idempotencia/soporte/orden documentados; CA-M4-03: 20 excepciones/36 pruebas/12 puertas trazadas; CA-M4-04: protección/respaldo/restore/rollback sin pérdida previstos; CA-M4-05: verificación documental/GitHub y preservación de fuentes/aplicación; CA-M4-06: aprobación del usuario, **PENDIENTE**.

Revisión inicial del verificador: se corrigió la referencia circular al propio archivo de evidencia durante su primera generación; la ejecución posterior coteja el resultado archivado y todos los demás enlaces. No se ejecutó ETL para corregirlo.

Verificación documental: `python3 docs/migracion/verificar_fase4.py`, sin SQL, conexiones ni ejecución ETL. Evidencia en [verificacion.json](evidencias/fase4/verificacion.json). No build, pruebas funcionales, carga, backup/restore real, perfilado operacional ni servicios gestionados ejecutados. Fase 4 EN_REVISION; **Fase 5 NO AUTORIZADA**.
