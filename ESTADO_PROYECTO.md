# Estado del proyecto — Punto de continuidad

**Proyecto:** Inventario y control de bienes computacionales (inventarioTI2)
**Fecha:** 2026-10-30
**Fase:** 0 — EN_REVISION
**Modo:** GUIADO
**Última fase autorizada:** 0; ninguna fase completada o posterior autorizada.

## Objetivo
Inventario centralizado de bienes computacionales por funcionario y unidad, asignación actual e historial fechado; cambios auditados, correos configurables y exportaciones Excel/PDF. La definición ya está documentada: no repetir la pregunta inicial.

## Autorización y continuidad
El usuario indicó «Autorizo la fase 0 pero crealo en nuevo chat» y posteriormente «actualiza en github». La documentación se prepara en esta conversación para conservarla en GitHub; no se ha creado un chat nuevo. En un nuevo chat, leer AGENTS.md, PROMPT_MAESTRO.md, FASES.md y estos entregables antes de continuar.

## Trabajo realizado
- Leídas las instrucciones y la plantilla existente.
- Documentados visión, actores, MVP, límites, indicadores propuestos y backlog inicial.
- Registrados RF-01 a RF-16 y RNF-01 a RNF-07, con criterios iniciales verificables.
- Separados requisitos confirmados, propuestas y decisiones pendientes.
- Registrada autorización de Fase 0 y condiciones de las fases siguientes.
- Sin código de aplicación, backend, esquema físico, políticas RLS ni datos reales implementados.

## Archivos relevantes
- docs/VISION.md: contexto, objetivos, actores, alcance e indicadores.
- docs/REQUISITOS.md: requisitos, permisos, backlog y criterios de aceptación iniciales.
- docs/DECISIONES.md: decisiones, propuestas, preguntas abiertas, riesgos y dependencias.
- FASES.md: estados y autorizaciones.
- AGENTS.md y PROMPT_MAESTRO.md: instrucciones conservadas sin cambios.

## Decisiones y limitaciones
- Administrador y lectura; funcionarios y cuentas son conceptos distintos.
- Auditoría y movimientos inmutables para cuentas de aplicación; bajas lógicas.
- RLS en Supabase solicitado; portabilidad a SQL Server como objetivo futuro, con arquitectura pendiente.
- Permiso exclusivo administrativo de auditoría es una interpretación por ratificar.
- La ruta .agents/skills/visual-system-designer/SKILL.md no existe en la versión remota inspeccionada.
- No hay aplicación ni manifiestos de dependencias; no hay pruebas funcionales que ejecutar todavía. Spec Kit no está presente y no se instaló.

## Verificación de esta entrega
- `git diff --check`: verificación de espacios y formato del diff; APROBADO.
- Revisión documental: cobertura de requisitos del mensaje del usuario y separación de decisiones abiertas; estados de Fases 1 a 15 pendientes; APROBADO.
- Pruebas de aplicación, seguridad, RLS, correos, exportaciones, navegador y Playwright: NO EJECUTADAS; no hay implementación y la Fase 2 no está autorizada.

## Siguiente paso
Revisar alcance, prioridades e interpretaciones de Fase 0; registrar aceptación antes de cerrar la fase. La Fase 1 requiere autorización expresa. No iniciar Fase 2 ni Fase 3 por inferencia.

Cuando se autorice Fase 2: obtener y leer visual-system-designer, construir prototipo navegable con datos sintéticos, facilitar revisión en computador/iPad/iPhone y verificar con Playwright si está disponible. Documentar aceptación visual y esperar nueva aprobación para Fase 3.

La solicitud de actualizar GitHub no autoriza publicación del entorno ni despliegue. Este documento no acredita publicación remota por sí mismo: comprobar el resultado de Git al terminar.
