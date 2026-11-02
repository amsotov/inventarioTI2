# Cambios

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
