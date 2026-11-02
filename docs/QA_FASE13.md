# QA, rendimiento y seguridad — Fase 13

2026-11-02 · COMPLETADA por aceptación expresa D-37. Base de ejecución `da1236e`; entrega aceptada `16f7bf0a4d7a088eae444488874daefc19c35630`.
Responsable de ejecución: Codex; aceptación: usuario. Última fase completada: 13. Fase 14 autorizada para un nuevo chat, ejecución pendiente. Sin despliegue en este cierre.

## Plan presentado antes de ejecutar los cambios

1. Consolidar RF-01–16/HU-01–16/CR-01–20/CA-N01–07 con pruebas existentes y brechas. Ejecutar build, regresión unitaria/integración y E2E sobre PostgreSQL/GoTrue locales y dobles de identidad/correo.
2. Revalidar principal vigente, MFA, revocación, Origin/CSRF, RLS, pools/contexto LOCAL, mínimo privilegio, BOLA/IDOR, inyección/XSS, privacidad, idempotencia, rollback, concurrencia y último administrador. Revisión de dependencias y búsqueda de secretos, con límites explícitos.
3. Medir A-09/CR-17: 3.000 bienes, 500 funcionarios, 25 cuentas, 10 usuarios concurrentes, 100.000 movimientos y 100.000 auditorías. Calentar; registrar 1.000 consultas mixtas y 200 escrituras válidas con auditoría, sin excluir fallos. Listas de 50: p95 ≤2.000 ms; escrituras: p95 ≤3.000 ms. Identidad doble, autorización real en cada solicitud.
4. Medir exportaciones privadas de 10.000 filas XLSX y 2.000 PDF de solicitud a descarga ≤60 s; primer intento de aviso ≤60 s con MailPort doble y polling local. Registrar recursos, red, mezcla, errores y distribución; no extrapolar a infraestructura gestionada.
5. Revisar accesibilidad con axe-core fijado y recorridos de teclado/foco/etiquetas/errores, contraste/tablas y responsive de ambos roles en Chromium, computador/iPad/iPhone emulados. Registrar lo no ejecutado; sin certificación WCAG/Safari/hardware.
6. Registrar defectos por severidad, corregir solo brechas de las funcionalidades aceptadas y repetir pruebas afectadas. Preservar evidencia histórica, actualizar documentación/GitHub y comprobar SHA remoto. Entregar EN_REVISION; aceptación de Fase 13 independiente.

Archivos previstos: suites `tests/qa/`, prueba trazable de buscador, correcciones mínimas en servidor/UI si se reproducen defectos, `docs/evidencias/fase13/`, PRUEBAS/TRAZABILIDAD/SEGURIDAD y documentos de control. Sin Spec Kit instalado ni instalación inferida.

## Criterios de salida

| Criterio | Condición medible |
|---|---|
| CA13-01 | Matriz RF/HU/CR/CA con pruebas y estados ejecutado/fallido/no ejecutado; build y regresión sin fallos |
| CA13-02 | Escenarios adversos y privacidad verificados; cero defectos críticos/altos abiertos en alcance local; dependencias auditadas |
| CA13-03 | Carga A-09 completa, latencias/errores/integridad registradas y comparadas con umbrales |
| CA13-04 | Límites de exportación y primer intento medidos; no se confunden aceptación del doble y entrega física |
| CA13-05 | Accesibilidad automática y revisión de teclado/responsive con hallazgos y límites; evidencia reproducible y GitHub sincronizado |
| CA13-06 | CUMPLIDO por aceptación expresa D-37 del usuario el 2026-11-02 |

Una dependencia ausente bloquea solo su ensayo. No se convierte un criterio parcial en cumplimiento total. No se inicia Fase 14/15 ni se despliega. Correo real deshabilitado; sin Resend, datos/cuentas reales, cambios remotos de permisos, gastos ni infraestructura. F1-SEG-01/02/03 siguen abiertos. UTC, copia semanal, máximo 168 h entre éxitos, RPO 168 h, RTO 8 h y copias 30 días se preservan; disponibilidad, restauración y continuidad productiva quedan sin acreditar.

## Resultados y reproducción

Matriz de requisitos, historias, CR y CA: [MATRIZ_QA_FASE13](MATRIZ_QA_FASE13.md). Comandos desde la raíz, Node 24, Docker local y Chromium:

```sh
npm ci
npm run build
npm test
npm run test:ui
npm run test:qa:a11y
npm run test:qa:performance
python3 tests/qa/secrets.py
npm audit --json
```

Ejecutar las suites de forma secuencial en este entorno. Los scripts limitan a un archivo de prueba por vez; las carreras SQL y los 10 usuarios del ensayo de carga conservan su concurrencia explícita. Los fixtures generan sus propios secretos efímeros, puertos loopback y bases; no aceptan DSN del usuario. El helper elimina únicamente su contenedor y sus volúmenes anónimos. Los artefactos de fases aceptadas que regeneran las suites se restauran a su contenido original antes del commit; la evidencia nueva se guarda bajo `evidencias/fase13`.

| Ensayo | Resultado local | Umbral |
|---|---|---|
| 1.000 consultas mixtas, 10 usuarios | p50 98,42 ms; p95 **145,59 ms**; p99 165,73 ms; máximo 186,64 ms; 1.000 HTTP 200 | p95 ≤2.000 ms |
| 200 escrituras admitidas | p50 91,78 ms; p95 **142,17 ms**; p99 168,89 ms; máximo 172,92 ms; 200 HTTP 200 | p95 ≤3.000 ms, auditoría incluida |
| XLSX, 10.000 filas | **3.232,51 ms**, solicitud a descarga; 450.389 bytes | ≤60.000 ms |
| PDF, 2.000 filas | **4.056,60 ms**, solicitud a descarga; 340.416 bytes | ≤60.000 ms |
| Primer intento de 203 avisos sintéticos | p95 **916 ms**; máximo **21.840 ms**, incluidos tres pendientes creados al preparar fixture; todos aceptados por el doble | ≤60.000 ms; no acredita entrega |
| Accesibilidad | 35 análisis axe, cero infracciones detectadas; 79 comprobaciones programáticas aprobadas | Alcance parcial WCAG 2.2 AA |
| Seguridad SQL | 19 tablas privadas con RLS; sin acceso Data API; funciones DEFINER privadas con search_path fijo, dueños mínimos y ejecución pública cerrada | Ninguna ampliación de permisos |

La carga inicia con **3.000 bienes, 500 funcionarios, 25 cuentas, 100.000 movimientos y 100.000 auditorías**. Cinco administradores con MFA y cinco lectores tienen sesiones distintas; 100 consultas de calentamiento preceden las muestras. Se mezclan listas de 50, texto, condición, ID/ficha, funcionarios, inventario, buscador, movimientos y auditoría administrativa. El JSON conserva las 1.200 muestras y percentiles por ruta, sin descartar resultados. Tras la carga hay exactamente 200 movimientos, auditorías, comandos y avisos adicionales. Fuera de la muestra válida se verifican versión obsoleta **412** y escritura de lectura **403**.

Entorno: Linux x64, Node 24.19.0, CPU AMD EPYC 9V74; cuota de proceso **2 CPU**, límite cgroup **8 GiB**, pools Auth/negocio/worker de tres conexiones cada uno. PostgreSQL 17 fijado por digest existente; API y DB en loopback, HTTP sin TLS/WAN. Los dobles de identidad/correo responden inmediatamente, conservando toda validación del BFF y SQL. Son mediciones del entorno descrito, sin equivalencia afirmada con Supabase/Resend gestionados ni capacidad operativa contratada. Evidencia: [rendimiento.json](evidencias/fase13/rendimiento.json), [accesibilidad.json](evidencias/fase13/accesibilidad.json) y [PRUEBAS](PRUEBAS.md#fase-13--qa-rendimiento-y-seguridad).

axe dejó revisión de contraste incompleta en celdas/enlaces fuera del área visible por scroll. El runner conserva esos `incomplete` y añade cálculo de contraste CSS para los pares opacos afectados; las combinaciones revisadas cumplen su umbral. No se oculta el estado original ni se afirma una certificación. Los 79 controles son programáticos; se inspeccionaron visualmente capturas de lectura en iPhone y administrador en computador para revisar jerarquía, formularios y tablas. No se ejecutó una auditoría manual integral con usuarios o lector de pantalla. Teclado: salto conserva ruta y mueve foco, tabla recibe foco, error de rango se anuncia/enfoca; ambos roles, 1440/820/390, sin desborde global ni errores JavaScript. Escenarios carga/vacío/error/permiso y replay se revalidan además en las suites de navegador.

## Defectos priorizados y correcciones

| ID / severidad | Reproducción / efecto | Corrección y verificación |
|---|---|---|
| F13-01 / media | RF-06: condición, documento/correo/unidad no encontraban coincidencias válidas | Ampliar solo predicados parametrizados; columnas positivas intactas. `tests/api/qa.test.ts`: código/serie/tipo/marca/modelo/condición, nombre/RUT original y canónico/ID/correo/cargo/unidad; SQL hostil literal |
| F13-02 / media | Buscar por documento/correo podía copiar ese texto a metadatos compartibles al ampliar claves | XLSX y PDF presentan `q` como `[consulta reservada]` en búsqueda combinada. Conservan selección/filas y otros filtros; el valor original sigue solo en la consulta/pantalla autenticada y el trabajo privado. Prueba inspecciona XML/texto PDF sin datos personales |
| F13-03 / media | axe `label-content-name-mismatch`: «Ver detalle» no estaba en nombre accesible «Ver aviso …» | Texto visible «Ver aviso» coincide con el nombre; 35 análisis finales sin infracciones detectadas |
| F13-04 / media | Activar «Saltar al contenido» cambiaba fragmento a ruta inexistente | Interceptar solo ese enlace y enfocar `main` con `tabIndex=-1`; seis recorridos rol/tamaño verifican foco y conservación de pantalla |
| F13-05 / media, infraestructura de prueba | Helper cerraba contenedor sin retirar su volumen anónimo; archivos de suite arrancaban sin límite adaptado al entorno | Cierre con `docker rm -f -v` del contenedor propio, concurrencia del runner fijada a 1; suites finales repetidas. Ninguna limpieza global de volúmenes ajenos |

Sin defectos críticos/altos abiertos identificados en este alcance local; las dependencias externas pendientes conservan sus bloqueos. Los fallos del primer ensayo y de preparación están en [ensayos iniciales](evidencias/fase13/ensayos-iniciales.md), junto con sus causas verificadas/límites; no se confunden con resultados finales.

## Estado de salida y pendientes

CA13-01/02/03/04 verificados en el alcance local descrito; CA13-05 conserva su alcance parcial, con accesibilidad/hardware e integraciones excluidos explícitamente y sincronización GitHub comprobada al entregar. CA13-06 **CUMPLIDO** por aceptación expresa D-37. Fase 13 **COMPLETADA**, última completada 13. La aceptación conserva los límites operativos y no convierte verificaciones parciales en cumplimiento integral.

NO EJECUTADOS: Supabase/Auth/MFA gestionados y advisors sobre ese servicio, Resend/buzones/SPF/DKIM/DMARC/rebotes/entrega física, Safari/hardware/lector de pantalla y WCAG completa, apertura física Excel/Acrobat, pentest independiente, SQL Server, disponibilidad mensual y respaldo/restauración/rollback operativos. No se inicia infraestructura de Fase 14 para resolverlos. F1-SEG-01/02/03 permanecen abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Siguiente paso: Fase 14 autorizada por D-37 para iniciar en un nuevo chat, ejecución pendiente. Fase 15 sin autorización; producción requiere aprobación independiente. No se ejecuta Fase 14 ni se despliega en este cierre.


## Cierre aprobado — 2026-11-02

D-37 acepta la entrega `16f7bf0a4d7a088eae444488874daefc19c35630` mediante «apruebo fase 13 inicia en nuevo chat fase 14». Fase 13 COMPLETADA y CA13-06 CUMPLIDO. Se conservan resultados/evidencias, cinco defectos corregidos, alcance parcial CA13-05 y todos los pendientes gestionados/hardware/operativos. La aprobación no equivale a conformidad WCAG integral, entrega de correo real o continuidad productiva. Fase 14 autorizada para iniciar en un nuevo chat, sin ejecución en este cierre; continuidad en [FASES](../FASES.md) y [ESTADO](../ESTADO_PROYECTO.md).
