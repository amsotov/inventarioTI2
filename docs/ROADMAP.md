# Roadmap y deuda técnica propuestos

2026-11-02 · Fase 15 EN_REVISION. Lista para priorizar con el usuario, **sin ejecución, responsables designados, fechas comprometidas ni gasto aprobado**. P0 bloquea operación/datos reales/promoción; P1 prepara validación; P2 es evolución opcional. No se inicia trabajo futuro por figurar aquí. [Estado/criterios de entrega](FASE15.md) · [Decisiones](DECISIONES.md) · [Checklist](CHECKLIST_LIBERACION.md).

## Bloqueos y preparación de operación

| ID / prioridad | Problema y resultado propuesto | Dependencia / evidencia para considerar resuelto |
|---|---|---|
| F1-SEG-01 / P0 | Retención legal de datos personales/logs sin política ni responsable aprobados | Validación aplicable a Chile/actividad, responsable y política aprobada antes de datos reales; no inventar plazos ni borrar historia |
| F1-SEG-02 / P0 | Presupuesto/moneda/recursos/región y costos vigentes sin aprobar | Cotización actual y tope/proveedores autorizados; estimaciones históricas no equivalen a contratación |
| F1-SEG-03 / P0 | Copia/recuperación operativas aún sin operador, suplente, almacén, custodia, horario y alertas | Designación/decisión expresa, evidencia externa y restauración integral: UTC/semanal/máximo 168 h/RPO ≤168 h/RTO ≤8 h/copias 30 días; no cerrar por ensayo local |
| EV15-01 / P0 | Pages legacy main:/docs activo impide sincronizar main sin publicar | Decisión específica sobre automatismo/destino; evidencia de configuración y comportamiento antes de permitir merge/push. No cambiar ni eliminar sitio desde esta fase |
| EV15-02 / P0 | Falta ensayo DB/Auth/TLS/secretos/artefacto/migraciones y rollback en destino gestionado | Destino y recursos autorizados, F1-SEG aplicables resueltos; smoke de roles/MFA/CSRF/RLS, revocación, copia externa/Auth/MFA/settings y recuperación independiente documentados; producción conserva permiso propio |
| EV15-03 / P0 antes de correo real | Canal de identidad no operativo y correo empresarial deshabilitado | Selección/autorización de proveedor y destinatarios de prueba; conectar/verificar AuthMailer por separado, entrega de enlace y conciliación; worker empresarial con permisos/dominio y revisión de pendientes. Aceptado no significa entregado |
| EV15-04 / P1 con revisión prioritaria | Cambio de cifrados TLS 1.2 de Supabase anunciado para 2026-11-10; cambios de PG/zonas horarias | Inventario de destino/cliente/versiones reales y prueba de compatibilidad autorizada contra documentación actual. No hay destino gestionado comprobado ni actualización ejecutada; usar fecha del proveedor como aviso, no compromiso propio |

## Validación y deuda de implementación

| ID / prioridad | Trabajo propuesto y motivo | Condición de aceptación futura / referencia |
|---|---|---|
| EV15-05 / P1 | Validar manuales y onboarding con personas; realizar capacitación | Nuevo desarrollador instala/explica sin ayuda; sesiones por rol, ejercicios, dudas y acta observada; [CAPACITACION](CAPACITACION.md). No marcar realizada por tests |
| EV15-06 / P1 | Completar accesibilidad y compatibilidad reales | Revisar WCAG 2.2 AA con pruebas manuales/lector de pantalla y Safari/iPad/iPhone físicos; resolver hallazgos y registrar límites. Axe/Chromium emulado aceptados no son certificación |
| EV15-07 / P1 antes de exposición pública | Reducir diferencias temporales de recuperación pública | Medición y diseño de tiempos/cola sin enumeración ni cambios de contrato; fallos/efectos externos siguen durables e inciertos hasta conciliación. [AUTENTICACION](AUTENTICACION.md) |
| EV15-08 / P1 | Operativizar rotación y recuperación de claves/credenciales/MFA | Procedimiento probado con custodia independiente, recifrado o revocación y verificación de identidad; sin bypass ni reactivar sesiones antiguas. No hay recuperación autoservicio de factor verificado |
| EV15-09 / P1 | Mantenimiento de exportaciones, sesiones y evidencia bajo política legal | Definir política en F1-SEG-01, capacidad/alertas y eventual limpieza controlada/idempotente; acceso a exportación caduca técnicamente a una hora y la limpieza de bytes está diferida al acceso del solicitante; metadatos/historia no se purgan por inferencia |
| EV15-10 / P1 | Consolidar documentación de contrato API posterior a Fase 7 | Comparar rutas reales de admin/procesos/reportes/avisos y errores/permisos; contrato verificable sin reemplazar evidencia histórica ni afirmar cobertura inexistente |
| EV15-11 / P2 | Revisar serialización conservadora de comandos de procesos si el volumen lo requiere | Medir en destino representativo; conservar invariantes, locks ordenados, versiones/replay y rollback. A-09 local pasó en Fase 13; no existe incumplimiento productivo demostrado |
| EV15-12 / P2 | Separar destino de evidencia regenerada por suites | Diseñar salida configurable sin sobrescribir artefactos aceptados; comprobar compatibilidad CI. Mientras tanto usar checkout desechable y copiar solo evidencia nueva a su fase |
| EV15-13 / P2 | Evaluar portabilidad futura a SQL Server si sigue siendo prioridad | ADR con equivalencia transaccional/RLS/idempotencia/auditoría y costos, sin migrar por la sola mención del objetivo. [ARQUITECTURA](ARQUITECTURA.md) |

Propuesta de secuencia: resolver decisiones P0 y automatismo Pages; habilitar entorno de prueba autorizado y validar servicios/continuidad; validar con personas/accesibilidad; revisar evolución P2 por necesidad medida. Preparación documental/ejercicios sintéticos puede avanzar sin contratar servicios; cualquier implementación futura necesita alcance autorizado. No es calendario ni aprobación de producción.

Fuentes consultadas el 2026-11-02 para EV15-04: [índice de cambios](https://supabase.com/changelog), [aviso TLS](https://supabase.com/changelog/cbc-tls-ciphers-deprecated), [corrección de zonas de PG](https://supabase.com/changelog/tzdata-local-time-vancouver-edmonton-casablanca). No se consultó ni modificó proyecto remoto del usuario. Fechas operativas internas permanecen UTC; sesiones de capacitación se acordarán por separado.
