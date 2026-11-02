# Cambios

## 2026-11-02 — Preparación de vista previa remota (D-44)

- Instancia sintética independiente en entorno nuevo; runtime D-41 no disponible.
- Gateway loopback/origen exacto y cliente WebSocket opcionales, sin publicar.
- Smoke 12 grupos, integración gateway 11 grupos, transporte y reinicio PASS.
- VP-01 BLOQUEADO: permiso externo e integración pública/Chrome Windows pendientes; evidencia previa intacta, sin main/Pages/producción.

## 2026-11-02 — Continuidad para nuevo chat (D-43)

- Pendientes F1-SEG/EV15 priorizados, contexto de aprobaciones y plan de vista previa con criterios VP-01–05; prompt listo para pegar.
- Acceso real desde Windows/Chrome como primera prioridad; VP-01 pendiente, sin repetir localhost remoto ni afirmar instalación/URL nueva.
- Solo documentación, sin nueva fase, cambios funcionales, infraestructura, main/Pages/merge, producción ni correo real; evidencia aceptada preservada.

## 2026-11-02 — Diagnóstico de acceso a vista previa (D-42)

- Se corrige el enlace de acceso: localhost del computador del usuario no alcanza el servidor del entorno; readiness interno 200 no prueba conectividad externa.
- Guía de diagnóstico y launcher para Linux/Docker Engine nativo; paquete fuente sin estado/credenciales para instalación local. Ejecución en equipo del usuario no realizada; acceso aún bloqueado.
- Sin cambios de aplicación, permisos, BD/Auth o evidencia aceptada; instancia interna conservada y sin publicación externa/main/Pages/producción.

## 2026-11-02 — Fase 15 aprobada y sistema local de pruebas (D-41)

- Usuario acepta `a9a0742`; CA15-06 CUMPLIDO y Fases 0–15 COMPLETADAS con pendientes conservados.
- Autoriza sistema local en este entorno: controlador/gateway TLS, PostgreSQL y Auth locales reales, bootstrap sintético con claves aleatorias fuera de Git y MFA administrativo, worker deshabilitado.
- Inicio/detención con almacenamiento persistente; smoke de 12 grupos y reinicio verificados, fallos iniciales de red/espacio registrados. Guía de acceso, pendientes y continuidad para otro chat.
- Aplicación/migraciones/dependencias/tests/evidencia aceptada intactos; sin merge/main/Pages, producción, correo real, gasto o permisos remotos. Capacitación/hardware/gestión real y F1-SEG-01/02/03 siguen pendientes.

## 2026-11-02 — Fase 15: documentación, capacitación y evolución (EN_REVISION)

- D-40 ratifica D-39; manuales de ambos roles completados y README como entrada vigente, conservando antecedentes.
- Guía de instalación/onboarding, soporte/mantenimiento, capacitación propuesta con ejercicios/acta pendiente y roadmap/deuda con dependencias y autorizaciones futuras.
- Reproducción en checkout limpio: npm ci/build PASS y 9/9 pruebas del recorrido frontend; validación documental y evidencia nueva exclusiva de Fase 15. Fuentes y evidencia aceptada intactas.
- Capacitación real y onboarding por persona nueva no realizados; CA15-06 pendiente, última completada 14. PR #1 en borrador sin merge, Pages bloqueado, sin producción/correo real ni cierre de F1-SEG-01/02/03.

## 2026-11-02 — Cierre aprobado de Fase 14

- D-39 acepta entrega `da1ac91`, cumple CA14-06 y cierra Fase 14 COMPLETADA con sus límites; CI PASS del SHA aceptado y evidencia 119/39/4/19 conservados.
- Fase 15 autorizada para iniciar en un nuevo chat; ejecución pendiente y punto de continuidad registrado en la rama del PR #1. No se abre otro chat automáticamente.
- Solo documentación de cierre; código, ops, workflow, migraciones, dependencias, tests y evidencia intactos. PR sin merge por bloqueo Pages; sin producción/correo real ni resolución de F1-SEG-01/02/03.

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


## 2026-11-02 — Ajuste CI y bloqueo Pages heredado de Fase 14

- Runner instala poppler-utils para las pruebas PDF existentes; primer CI remoto FAIL por prerrequisito ausente preservado.
- Pages legacy main:/docs detectado y run cancelado antes del job deploy; siguientes cambios por rama/PR sin merge. Configuración y sitio previo intactos. Sin Fase 15 ni producción.
