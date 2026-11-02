# Fase 15 — Documentación, capacitación y evolución

2026-11-02 · **EN_REVISION** · Ejecución autorizada por D-39 y ratificada por D-40. Última fase completada: 14. La revisión de esta entrega y el cierre final corresponden al usuario.

## Plan presentado y alcance

Base recuperada: `5632391e112079e92f40d913ff48dfd1c7f242b4`, rama `phase14/ci-prerequisites-and-pages-guard` del [PR #1](https://github.com/amsotov/inventarioTI2/pull/1); main `82d8ad6` solo como referencia. Árbol inicial limpio. Leídos AGENTS, PROMPT_MAESTRO, FASES, ESTADO, D-39 y documentación aplicable. Se contrastan los recorridos con UI, rutas, políticas, configuración y pruebas existentes. No se instala Spec Kit.

| Orden | Actividad y entregable | Dependencia | Criterio de revisión |
|---|---|---|---|
| 1 | Completar manuales de usuario y administración, conservando sus recorridos anteriores | Implementación aceptada Fases 5–14 | Acceso, roles, tareas, errores e incertidumbre explicados sin funciones inventadas |
| 2 | Instalación y onboarding; mapa de código/configuración y comprobación desde checkout limpio | Node 24, npm, Docker y Chromium para ensayo | Instalación, build y recorrido sintético reproducibles; límites de arranque operativo explícitos |
| 3 | Soporte y mantenimiento enlazados al runbook/checklist existentes | F1-SEG-01/02/03 abiertos | Diagnóstico saneado, escalamiento propuesto, cambios y continuidad sin rebajar controles |
| 4 | Capacitación por rol con ejercicios, evaluación y acta vacía | Ambiente sintético y futuros participantes/facilitador | Material preparado; sesiones reales separadas y pendientes |
| 5 | Roadmap/deuda y estado de entrega; actualización GitHub | Autorización de sincronización; Pages main:/docs bloqueado | Prioridades, dependencias, evidencia y permisos futuros; PR en borrador sin merge |

Codex redacta y verifica esta entrega. El usuario revisa/acepta; facilitador, soporte, operador y demás responsables reales **SIN DESIGNAR**. Fechas de sesiones, presupuesto y compromisos de soporte **SIN APROBAR**. El roadmap propone trabajo futuro, sin iniciarlo.

## Documentación entregada

| Público | Documento vigente | Uso |
|---|---|---|
| Lectura y administración | [Manual de usuario](MANUAL_USUARIO.md) | Acceso, consultas, bienes, funcionarios, movimientos, reportes y errores |
| Administración | [Manual administrativo](MANUAL_ADMIN.md) | Cuentas, MFA, unidades, avisos, auditoría y límites de atribuciones |
| Desarrollo | [Instalación y onboarding](INSTALACION_DESARROLLO.md) | Prerrequisitos, ensayo local, configuración y mapa del código |
| Soporte/operación | [Soporte y mantenimiento](SOPORTE_MANTENIMIENTO.md) | Recepción, diagnóstico, escalamiento y cambios seguros |
| Facilitador y participantes | [Capacitación propuesta](CAPACITACION.md) | Agenda, ejercicios por rol, evaluación y registro pendiente |
| Responsable del producto | [Roadmap y deuda](ROADMAP.md) | Bloqueos, prioridades propuestas y condiciones de aceptación futura |

[README](../README.md) es la entrada; [CHANGELOG](../CHANGELOG.md), [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md), [DECISIONES](DECISIONES.md) y [PRUEBAS](PRUEBAS.md#fase-15--documentación-capacitación-y-evolución) conservan trazabilidad. El [runbook](RUNBOOK_OPERACION.md) y [checklist de liberación](CHECKLIST_LIBERACION.md) siguen siendo las fuentes de procedimientos operativos; no se duplican ni se ejecutan sobre recursos reales.

## Criterios de aceptación

| ID | Criterio verificable | Resultado de esta entrega |
|---|---|---|
| CA15-01 | Manuales cubren ambos roles, acceso, tareas implementadas, errores e incertidumbre; referencias a implementación | Documentado y contrastado con fuentes; revisión humana pendiente |
| CA15-02 | Guía de instalación distingue prueba sintética, prototipo y arranque configurado; explica variables y mínimo privilegio | Documentado; arranque con proveedor gestionado NO EJECUTADO |
| CA15-03 | Un checkout limpio permite instalar, compilar y comprobar recorrido local con instrucciones reproducibles | Evidencia técnica en PRUEBAS; onboarding por una persona desarrolladora nueva NO EJECUTADO |
| CA15-04 | Soporte/mantenimiento, capacitación por rol y roadmap tienen procedimientos, evaluación, dependencias y pendientes explícitos | Material entregado; capacitación y guardia operativas NO REALIZADAS |
| CA15-05 | Enlaces/estados/diff revisados, fuentes y evidencia aceptadas preservadas; commit en rama del PR y SHA remoto cotejado al entregar | Verificación en PRUEBAS; sincronización se confirma contra HEAD remoto del PR |
| CA15-06 | Aceptación expresa de esta entrega y decisión de cierre por el usuario | **PENDIENTE** |

## Riesgos y límites conservados

F1-SEG-01: política/responsable legal de retención de datos/logs antes de datos reales. F1-SEG-02: presupuesto, moneda, región/recursos y costos sin aprobar. F1-SEG-03: operador/suplente, horario UTC, almacén externo, custodia de claves y alertas sin aprobar. No se cierran mediante manuales.

UTC; copia semanal con máximo 168 h entre éxitos; RPO ≤168 h, RTO ≤8 h y copias 30 días permanecen como requisitos. Integraciones Supabase/Resend gestionadas, correo de identidad, recuperación integral, retención externa, SLA mensual, rollback de plataforma, Safari/hardware y accesibilidad completa conservan sus límites de QA/operación. Evidencia histórica 119/39/4/19 y CI PASS 41473700624 corresponden a la entrega aceptada `da1ac91`, sin trasladarlos al SHA documental nuevo.

No se cambia aplicación, ops, workflow, migraciones, dependencias, pruebas ni evidencia aceptada. No hay cuentas/datos reales, gastos, permisos remotos, envío real ni despliegue. Pages legacy main:/docs impide push/merge a main bajo la prohibición de publicación. Esta entrega usa exclusivamente la rama del PR #1.

## Estado y siguiente acción

Fase 15 EN_REVISION, CA15-06 PENDIENTE, última completada 14. Revisar manuales, guía, capacitación propuesta y prioridades; realizar validación por nuevo desarrollador y sesiones solo con ambiente/participantes acordados. Aceptar la documentación no acredita capacitación ni preparación productiva. El cierre del sistema, cualquier evolución posterior, merge, publicación y producción requieren su decisión propia; no existe una Fase 16 autorizada por inferencia.
