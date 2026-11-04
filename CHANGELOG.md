# Cambios

## 2026-11-03 — Migración Fase 8: seguridad y regresión, con bloqueos

- M8-A01 acepta F7/inicia F8; F9 sin autorización.
- Corrige comparación UUID en traspasos/referencias de perfil y clasificación HTTP 400 de JSON inválido.
- Amplía Auth real local GoTrue/BFF/PG (TOTP, rol SQL, revocación) y matriz adversarial v2; 280 casos Node aprobados.
- Auditoría Supabase solo lectura: RLS/ACL conservados, sin avisos del asesor; detecta M8-R01 autorregistro habilitado. Propuesta de corrección no aplicada.
- Evidencia e integración de destino claramente separadas; SQL Server/vínculo funcionario/perfiles siguen bloqueados. Sin SQL remoto, main, merge o despliegue.


## 2026-11-03 — Migración Fase 7: adaptación visual EN_REVISION

- M7-A01 acepta entrega parcial F6 e inicia interfaz; persisten bloqueos del destino.
- Reutiliza React/shell/campos y agrega equipos/relaciones con 17 contratos v2, fichas por cuatro subtipos, historia, mantenciones y pertenencias.
- M7-C01 lectura compatible con siete atributos opcionales; edición cerrada si falta información.
- Conserva UUID/CSRF/ETag y reintento estable; estados y capturas responsive con ambas funciones de acceso.
- Reportes, acceso, perfiles y demo actuales conservados; no backend ficticio en aplicación, SQL aplicado, main/merge/despliegue o F8.

## 2026-11-03 — Migración Fase 6: incremento parcial de backend

- M6-A01 acepta F5/inicia F6; M6-A02/A03 aprueban Auth/soporte y Unicode/UTC.
- Desacopla repositorio de inventario; conserva v1/PostgreSQL y seguridad.
- Implementa frontera por inyección para 18 contratos v2 y dos lecturas SQL Server parametrizadas por puerto; no escrituras de destino.
- Enmienda candidato 0.6.0-review.1 en 42 campos sin retirar barreras ni ejecutar SQL.
- Pruebas nuevas, regresión, linaje y diagnóstico de pendientes; F6 EN_PROGRESO con integración bloqueada, sin F7/merge/despliegue.

## 2026-11-03 — Migración Fase 4: plan ETL EN_REVISION

- Registra aprobación de Fase 3 y M4-A01; sin Fase 5.
- Planifica dos fuentes, saneamiento previo, staging/cuarentena, reglas, identidades, replay y carga por dependencias.
- Cubre 57 mapeos/13 hallazgos, 20 excepciones, 36 pruebas futuras y 12 puertas de control.
- Define respaldo/restauración/reconciliación y rollback antes/después de nuevas escrituras; fuente operacional ausente.
- Verificación documental únicamente: sin SQL, datos reales, implementación, merge ni despliegue.

## 2026-11-03 — Migración Fase 3: diseño visual/contratos EN_REVISION

- Registra aprobación de Fase 2 y M3-A01; sin Fase 4.
- Propone 11 vistas conservando identidad visual y compatibilidad de las 49 rutas; 18 contratos v2 y 117 campos con exposición explícita.
- Maqueta documental navegable, datos sintéticos, prueba Chromium responsive y capturas reales; no modifica aplicación/API/BD.
- Documenta garantías, pendientes y límites; sin SQL, merge ni despliegue.

## 2026-11-03 — Migración Fase 2: trazabilidad y mapeo EN_REVISION

- Registra aceptación documental de Fase 1 e inicio exclusivo de Fase 2 por M2-A01.
- Documenta 16 RF/7 RNF, 19 reglas, 16 historias, 20 criterios; referencias API/UI/servicios/pruebas existentes.
- Mapea 155 campos actuales y 117 destino sin eliminar capacidades ausentes del núcleo objetivo.
- Verificación documental y manifiesto de fuentes; sin SQL, implementación, merge, despliegue ni Fase 3.

## 2026-11-03 — Modernización: diagnóstico aprobado y Fase 1 EN_REVISION

- Registra aprobación de Fase 0 e incorpora su informe; autoriza únicamente validación documental y sincronización GitHub.
- Concilia ER/DER/Excel con 117 campos y 30 relaciones; transcripciones independientes, verificador y evidencia documental.
- Presenta 15 hallazgos y 16 decisiones pendientes; conserva modelo, aplicación, SQL, pruebas y evidencia histórica.
- Añade guía INICIAR_EN_CODEX y separa fases de migración del desarrollo histórico. Fase 2 no autorizada; sin merge ni despliegue.

## 2026-11-02 — Fase 14: operación y continuidad (EN_REVISION)

- Plan de ambientes/configuración/CI/migraciones, runbook de incidentes/recuperación/rollback y checklist NO-GO productivo.
- CI Verify only sin deploy; salud live/ready, logs mínimos sin PII y HOST explícito conservando loopback.
- Ensayo sintético de copia cifrada/restauración, integridad/roles/RLS, revocación de sesión y cuarentena de efectos inciertos; pruebas/evidencia y límites.
- CA14-06 pendiente; F1-SEG-01/02/03 abiertos. Sin Fase 15, producción, correo real ni provisión/gastos.

## 2026-11-02 — Cierre aprobado de Fase 13

- D-37 acepta entrega `16f7bf0`; CA13-06 cumplido y Fase 13 COMPLETADA con sus límites documentados.
- Fase 14 autorizada para iniciar en un nuevo chat; ejecución pendiente y punto de continuidad registrado. Fase 15 sin autorización; producción requiere autorización independiente.
- Solo documentación de cierre; aplicación, migraciones, dependencias, pruebas y evidencias aceptadas preservadas. Sin ejecución de Fase 14, correo real ni despliegue en este cierre.

## 2026-11-02 — Fase 13: QA, rendimiento y seguridad (EN_REVISION)

- Matriz RF/HU/CR/CA, regresión consolidada, carga A-09 completa, accesibilidad y revisión de seguridad con evidencia reproducible.
- Corrige claves de búsqueda, privacidad de metadatos de exportación, etiqueta accesible de avisos y salto a contenido. Fixtures retiran volúmenes propios y runner acota concurrencia.
- 119 pruebas API/seguridad, 39 navegador; p95 consultas/escrituras 146/142 ms; exportaciones límite 3,23/4,06 s; avisos con doble antes de 1 min. Límites gestionados/hardware/operativos conservados.
- Aceptación propia pendiente; Fases 14–15 sin autorización, correo real deshabilitado y sin despliegue.

## 2026-11-02 — Cierre aprobado de Fase 11

- D-33 acepta entrega `c94a366`; CA11-06 cumplido y Fase 11 COMPLETADA.
- Fase 12 autorizada para un nuevo chat; ejecución pendiente y punto de arranque registrado.
- Solo documentación de cierre; código, migraciones, pruebas y evidencias preservados. Sin implementación/envíos de Fase 12 ni despliegues.

## 2026-11-02 — Fase 11: indicadores, reportes y exportación

- Resumen desde datos fuente; cinco reportes y buscador combinado con filtros/días UTC, proyección positiva, columnas/orden y conteos/subtotales compartidos.
- Excel/PDF privados, conjunto completo, límites 10.000/2.000 sin truncar, instantánea persistida, trabajo idempotente/recuperable y permisos vigentes en descarga.
- UI, pruebas HTTP/SQL/archivos/navegador y documentación. Entrega para aceptación propia; sin Fase 12 ni despliegue.

## 2026-11-01 — Cierre aprobado de Fase 9

- D-29 acepta entrega `fff63ac`; CA9-06 cumplido y Fase 9 COMPLETADA.
- Fase 10 autorizada para un nuevo chat; ejecución pendiente y plan de arranque registrado.
- Solo documentación de cierre; aplicación, migraciones, pruebas y evidencias preservadas. Sin implementación de Fase 10 ni despliegue.

## 2026-11-01 — Fase 9 EN_REVISION

- Panel real de cuentas/dos roles, unidades y destinatario; motivo/confirmación, versiones y replay.
- Función SQL privada con RLS, propia cuenta/último administrador protegidos, revocación y auditoría/outbox atómicos.
- Invitación/recuperación administrativa explícitas; pruebas sintéticas SQL/HTTP/navegador y manual del panel.
- Sin Fase 10, permisos remotos, correo real ni despliegue.

## 2026-10-31 — Cierre aprobado de Fase 6

- D-23 acepta entrega `336232a`; CA6-06 cumplido y Fase 6 COMPLETADA.
- Fase 7 autorizada para un nuevo chat; ejecución pendiente y plan de arranque registrado.
- Solo documentación de cierre; código, migraciones, tests y evidencias preservados. Sin Fase 7 implementada ni despliegue.

## 2026-10-31 — Fase 6, entrega EN_REVISION

- Matriz de permisos, puerto de autorización, contexto transaccional y RLS con roles SQL mínimos.
- Privacidad por proyección positiva, bitácora técnica inmutable y cabeceras/límites HTTP.
- Pruebas negativas locales y regresión; nueva migración aditiva y documentación de seguridad. Sin API empresarial nueva, permisos remotos, Fase 7 ni despliegue.

## 2026-10-31 — Cierre aprobado de Fase 5

- D-21 acepta entrega de autenticación `6ab7229`; CA5-06 cumplido, Fase 5 COMPLETADA.
- Fase 6 autorizada para un nuevo chat, ejecución pendiente y arranque documentado.
- Solo documentación de cierre; código, migraciones, pruebas y evidencias intactos. Pendientes operativos conservados; sin Fase 6 implementada ni despliegue.

## 2026-10-31 — Fase 5, entrega EN_REVISION

- BFF de autenticación TypeScript/Fastify, Supabase Auth y PostgreSQL, sesiones opacas/MFA/intenciones de un uso y conciliación durable.
- Migración aditiva sin alterar modelo aceptado, dependencias exactas/lockfile y pruebas sintéticas aisladas.
- Pendientes operativos explícitos en AUTENTICACION; sin permisos empresariales, correo real, Fase 6 ni despliegue.

## 2026-10-31 — Cierre aprobado de Fase 4

- D-19 acepta modelo/persistencia de `65609df`; CA4-06 cumplido, Fase 4 COMPLETADA.
- Fase 5 autorizada para un nuevo chat, ejecución pendiente y arranque documentado.
- Solo continuidad documental; SQL, tests y evidencias intactos, sin autenticación implementada ni despliegue.

## 2026-10-31 — Fase 4, entrega EN_REVISION

- Modelo ER, diccionario, migración PostgreSQL transaccional y datos sintéticos.
- Restricciones/índices, custodia única, evidencia inmutable, idempotencia y outbox persistentes, acceso cerrado.
- 46 comprobaciones reales locales, concurrencia y pg_dump/pg_restore; revisión documental reproducible.
- Sin Auth, permisos funcionales, API, integración al prototipo ni despliegue; aceptación pendiente, Fase 5 no autorizada.

## 2026-10-31 — Cierre aprobado de Fase 3

- D-17 acepta arquitectura, contratos y seis ADR; CA3-06 cumplido, Fase 3 COMPLETADA.
- Fase 4 autorizada para un nuevo chat, ejecución pendiente; continuidad documentada.
- Solo documentación: sin SQL, migraciones, implementación, gastos ni despliegue; fases 5–15 sin autorización.

## 2026-10-31 — Fase 3, entrega EN_REVISION

- Arquitectura modular, stack comparado, diagrama y límites de integración, RLS y portabilidad SQL Server.
- Contratos de API, seis ADR, estimación de costos y propuesta de continuidad semanal con copias externas.
- Verificación documental reproducible y actualización de continuidad; aceptación pendiente.
- Prototipo/capturas y fases 4–15 preservados; sin implementación de persistencia ni despliegue.

## 2026-10-31 — Cierre aprobado de Fase 2

- Aprobación visual expresa D-15; Fase 2 COMPLETADA.
- Fase 3 autorizada para iniciar en un nuevo chat, sin ejecución en esta sesión.
- Estados y continuidad actualizados; prototipo, pruebas y capturas intactos. Sin despliegue.

## 2026-10-31 — Fase 2, entrega EN_REVISION

- Prototipo UX/UI navegable con muestra sintética y cambios de memoria, sin backend ni despliegue.
- Resumen, bienes, funcionarios, búsqueda, fichas, movimientos, reportes, cuentas, auditoría, configuración y recorridos de acceso de demostración.
- Sistema visual, mapa de pantallas por rol, formularios/estados y guía de revisión local.
- Skill visual-system-designer integrado desde main y aplicado; referencia real SKILL.md corregida en AGENTS.
- 21 verificaciones Playwright/Chromium, revisión de 12 rutas en siete tamaños, capturas y límites de accesibilidad documentados.
- Fase 1 cerrada conservada; Fase 2 pendiente de aceptación visual. Fase 3 y despliegue sin iniciar; seguimientos F1-SEG-01/02/03 intactos.


## Entrega de Fase 7 — 2026-10-31

Fase 7 EN_REVISION: consultas HTTP autorizadas de bienes/funcionarios/unidades/movimientos, filtros UTC/paginación/ETag, alta/edición de bienes atómicas con idempotencia/auditoría/outbox, función SQL privada y pool separado. OpenAPI y pruebas reales locales; sin frontend ni despliegue.


## 2026-11-01 — Cierre de Fase 7

D-25 registra aceptación y cierre de Fase 7 y autorización de Fase 8 para un nuevo chat. Solo documentación; sin cambios de aplicación, migraciones, Fase 8 ejecutada ni despliegues.


## 2026-11-01 — Fase 8 para revisión

- Frontend React/Vite con diseño aceptado, acceso/MFA/sesión y consultas/fichas/filtros/cursor.
- Alta/edición de atributos con CSRF, versión e idempotencia; replay explícito ante resultado incierto.
- Assets compilados bajo BFF, pruebas UI/PostgreSQL y capturas responsive; documentación de límites.
- Fase 8 EN_REVISION; Fase 9 no iniciada, sin despliegue.


## 2026-11-01 — Cierre de Fase 8

D-27 registra aceptación y cierre de Fase 8 y autorización de Fase 9 para un nuevo chat. Solo documentación; sin cambios de aplicación, migraciones, ejecución de Fase 9 ni despliegues.


## 2026-11-02 — Fase 10 EN_REVISION

- Funcionarios RUT/ID, pertenencias, custodia, condición, bajas/reactivaciones y correcciones/historia paginada, con UI/API y migración aditiva.
- Permisos/RLS, versiones, replay, transacciones y pruebas HTTP/SQL/navegador sintéticas; documentación en PROCESOS_EMPRESARIALES y PRUEBAS.
- D-30 ratifica D-29; aceptación propia pendiente. Fase 11 no iniciada; sin despliegue.


## 2026-11-02 — Cierre aprobado de Fase 10 y continuidad de Fase 11

- D-31 acepta la entrega `888f8a2dda2a851db291209299c24eb7eb6be381`; Fase 10 COMPLETADA y CA10-06 CUMPLIDO.
- Fase 11 autorizada únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Plan de continuidad en FASES/ESTADO, sin implementar reportes ni exportadores aquí.
- Se preservan código, migraciones, pruebas/evidencias y límites operativos; fases 12–15 sin autorización, sin producción ni despliegue.


## 2026-11-02 — Fase 12 EN_REVISION (D-34)

Catálogo A-07 con plantillas positivas; worker independiente con rol SQL limitado, outbox/token/arrendamiento, reintentos 1/5/15, incertidumbre conservadora y seguimiento de intentos. Puerto/adaptador Resend preparado y deshabilitado; sin envío externo. API/UI administrativa para filtros/detalle, cancelación, reintento y conciliación con evidencia, versión, idempotencia y auditoría. Migración nueva aditiva, pruebas sintéticas SQL/HTTP/navegador y documentación. Resultados en docs/PRUEBAS.md; aceptación propia pendiente. Fase 13 no iniciada, sin despliegue.


## 2026-11-02 — Cierre aprobado de Fase 12 y continuidad de Fase 13

- D-35 acepta la entrega `377be1ac61a077606a4fa06b4986353c4a4fff0f`; Fase 12 COMPLETADA y CA12-06 CUMPLIDO.
- Fase 13 autorizada únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Punto de inicio en FASES/ESTADO, sin ejecutar QA en este cierre.
- Se preservan código, migraciones, dependencias, pruebas/evidencias y límites operativos; correo real deshabilitado, Fases 14–15 sin autorización, sin producción ni despliegue.

## 2026-11-03 — Migración Fase 5, candidato SQL Server

- Fase 4 aceptada por usuario; Fase 5 entregada EN_REVISION, aplicación BLOQUEADA.
- DDL candidato 30 tablas/117 campos/PK/FK/UQ/IDENTITY/defaults; CHECK e índices propuestos separados, consulta de catálogo y manifiesto de revisión.
- Soporte actual 19/155 trazado, controles estáticos/sintácticos y negativas; casos de motor no ejecutados. Sin cambios de aplicación/SQL previo, cargas, merge o despliegue.

## 2026-11-03 — Continuación Fase 5, destino 2016/130

- M5-A02 registra Supabase/PostgreSQL inventarioTI2 para pruebas sintéticas y SQL Server 2016/130 como destino.
- Guards de motor/nivel/bases de sistema, parser estático TSql130Parser con paquete fijado, 19 negativas y evidencia histórica revision1 conservada.
- Se descarta UTF-8 para SQL Server 2016; Unicode requiere decisión explícita. Proyecto inventarioTI2 no visible; no SQL/carga/cambios remotos ni inicio de Fase 6.

## 2026-11-03 — Provisión Supabase M5-A03

- Registra autorización de creación y elección sovicl/São Paulo.
- Un intento rechazado por cuota de dos proyectos Free activos; proyecto inventarioTI2 NO CREADO. Coste cotizado del plan actual 0/mes, sin autorización de plan de pago.
- Evidencia saneada y continuidad en GitHub; sin SQL, cambios en otros proyectos, facturación, aplicación, merge, deploy ni Fase 6.

## 2026-11-03 — Supabase M5-A04 provisionado

- Pausa inventarioTI autorizada y confirmada INACTIVE; inventarioTI2 creado en sovicl/sa-east-1 y ACTIVE_HEALTHY, sin cambio de plan Free.
- Consulta de metadatos PostgreSQL 17.11/UTC y cero tablas de aplicación; sin carga ni pruebas funcionales. Evidencia saneada y estados actualizados.
- Candidato revisión3 registra ref nueva; cuatro SQL Server sin cambios, 20 negativas y parser 130, revisión2 archivada. Sin app/frontend, merge, despliegue ni Fase 6.

## 2026-11-03 — M5-A05 validación inicial Supabase

- Baseline existente instalada con ocho copias trazadas y adaptación de propietarios a operador no SUPERUSER; fuentes originales intactas. Dos migraciones aditivas cierran ACL privadas como propietario efectivo.
- Semilla sintética 2/3/6 (unidades/funcionarios/bienes), 20 casos SQL aprobados, rollback y catálogo/RLS/roles verificados; sin cuentas/sesiones/outbox persistentes ni correos.
- Paquete/manifest/evidencia y revisión4; no frontend/backend fuente, HTTP/Auth real/UI, SQL Server ejecutado, merge, despliegue o Fase 6.
