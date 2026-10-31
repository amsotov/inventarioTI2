# Especificaciones del proyecto

Esta carpeta se reserva para especificaciones funcionales por módulo o historia de usuario. Si se instala GitHub Spec Kit, **respeta la estructura y los comandos que genere la versión instalada**; Spec Kit puede utilizar otros directorios y archivos.

## Plantilla mínima de una especificación
- Identificador y título.
- Problema y resultado esperado.
- Personas usuarias y permisos.
- Reglas de negocio y casos límite.
- Flujos y criterios de aceptación.
- Dependencias y riesgos.
- Casos de prueba.
- Estado y aprobación.

El análisis de Fase 1 se mantiene en la documentación existente: [análisis empresarial](../docs/ANALISIS_EMPRESARIAL.md), [historias](../docs/HISTORIAS_USUARIO.md) y [trazabilidad](../docs/TRAZABILIDAD.md). No se detectó Spec Kit en el árbol ni el comando `specify`; no se instaló ni se generó configuración. Esta carpeta se conserva sin duplicar especificaciones.

Fase 1 COMPLETADA por D-14. [CIERRE_FASE1.md](../docs/CIERRE_FASE1.md) contiene requisitos aceptados, UTC y respaldo semanal, con seguimientos futuros explícitos. Fase 2 posteriormente cerrada por D-15; Fase 3 entregada EN_REVISION, fases 4–15 sin autorización.

Arquitectura de Fase 3 en [ARQUITECTURA](../docs/ARQUITECTURA.md), [contratos](../docs/CONTRATOS_API.md) y [ADR](../docs/adr/FASE3.md). Se conserva la metodología documental existente; Spec Kit no instalado.

D-17 acepta/cierra Fase 3 y autoriza Fase 4 en un nuevo chat, ejecución pendiente. Los estados EN_REVISION previos corresponden a la entrega original. Fases 5–15 sin autorización; no se instala Spec Kit por esta continuidad.


Fase 4 ejecutada, EN_REVISION: [modelo y CA4-01 a CA4-06](../docs/BASE_DATOS.md), [diccionario](../docs/DICCIONARIO_DATOS.md), migración y pruebas locales aisladas. Sin Spec Kit instalado ni especificaciones duplicadas. Fases 5–15 continúan sin autorización; aceptación de Fase 4 pendiente.


D-19 acepta/cierra Fase 4 y autoriza únicamente Fase 5 para un nuevo chat, ejecución pendiente. CA4-06 cumplido. Los estados EN_REVISION anteriores son antecedentes de entrega. Fases 6–15 sin autorización, sin instalación de Spec Kit ni implementación de autenticación en este cierre.


Punto vigente posterior: Fase 5 ejecutada y EN_REVISION. [Autenticación](../docs/AUTENTICACION.md) contiene alcance, CA5, flujos, dependencias y pruebas. Fases 6–15 sin autorización. Spec Kit no instalado ni utilizado.


Punto vigente posterior — D-21: Fase 5 COMPLETADA por aceptación expresa de la entrega `6ab7229`; Fase 6 autorizada para iniciar en un nuevo chat, ejecución PENDIENTE. Seguir [FASES](../FASES.md) y [ESTADO](../ESTADO_PROYECTO.md); no volver a pedir autorización. Fases 7–15 sin autorización; sin despliegue. Spec Kit no instalado ni utilizado. Los antecedentes EN_REVISION anteriores se conservan como históricos.


## Continuidad de Fase 6 — 2026-10-31

Entrega de Fase 6 EN_REVISION bajo D-21: ver docs/SEGURIDAD.md (CA6-01 a CA6-06), tests/security y evidencias/fase6. No se instala Spec Kit ni inicia Fase 7.


Punto vigente — D-23: Fase 6 COMPLETADA, CA6-06 cumplido. Fase 7 autorizada para iniciar en un nuevo chat; ejecución PENDIENTE, sin backend empresarial desarrollado en este cierre. Leer [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md) y [SEGURIDAD](../docs/SEGURIDAD.md). Fases 8–15 sin autorización; sin despliegue ni instalación de Spec Kit. Los estados anteriores son antecedentes históricos.


## Entrega de Fase 7 — 2026-10-31

Fase 7: contrato ejecutable de validación en apps/server/inventory/routes.ts y [OpenAPI 3.1](../docs/openapi-fase7.json); servicios/pruebas reales en apps/server/inventory y tests/api. No se instala ni simula Spec Kit.
