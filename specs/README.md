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


## Incremento de Fase 9 — 2026-11-01

Fase 9 EN_REVISION bajo D-27/D-28. Contrato ejecutable en apps/server/admin/routes.ts, criterios en [ADMINISTRACION](../docs/ADMINISTRACION.md). Spec Kit no instalado ni utilizado. Fase 10 no iniciada; sin despliegue.


Punto vigente — D-29: Fase 9 COMPLETADA, CA9-06 cumplido. Fase 10 autorizada para iniciar en un nuevo chat; ejecución PENDIENTE. Leer [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md) y [ADMINISTRACION](../docs/ADMINISTRACION.md). Fases 11–15 sin autorización; sin implementación de Fase 10, despliegue ni instalación de Spec Kit en este cierre. Las menciones EN_REVISION anteriores son antecedentes.


## Incremento de Fase 10 — 2026-11-02

Funcionarios, pertenencias, custodia, estados e historia/correcciones implementados con migración aditiva y UI/API. Contrato ejecutable, archivos, criterios y límites en [PROCESOS_EMPRESARIALES](../docs/PROCESOS_EMPRESARIALES.md). Los límites de entregas anteriores son antecedentes; OpenAPI Fase 7 conserva su superficie histórica. Fase 10 EN_REVISION; fases 11–15 sin autorización, sin despliegue.


Punto vigente — D-31: Fase 10 COMPLETADA, CA10-06 cumplido. Fase 11 autorizada para iniciar en un nuevo chat; ejecución PENDIENTE. Leer [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md), [PROCESOS_EMPRESARIALES](../docs/PROCESOS_EMPRESARIALES.md) y A-06/A-10/A-11 de [CIERRE_FASE1](../docs/CIERRE_FASE1.md). Fases 12–15 sin autorización; sin implementación de Fase 11, despliegue ni instalación de Spec Kit en este cierre. Las menciones EN_REVISION anteriores son antecedentes.


## Incremento de Fase 11 — 2026-11-02

Especificación/contrato, métricas, columnas, filtros, estados, límites y CA11-01 a CA11-06 en [REPORTES](../docs/REPORTES.md); esquema ejecutable `apps/server/reports/routes.ts` y migración aditiva de exportaciones. Se conserva la metodología existente: Spec Kit no instalado ni simulado. Fases 12–15 sin autorización, sin despliegue.


## Continuidad vigente — D-33

Fase 11 COMPLETADA y CA11-06 cumplido. Fase 12 autorizada únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Leer [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md), [REPORTES](../docs/REPORTES.md) y A-07/A-08/A-10 de [CIERRE_FASE1](../docs/CIERRE_FASE1.md). Este cierre no implementa notificaciones ni instala Spec Kit. Fases 13–15 sin autorización; sin despliegue. Los estados previos se conservan como antecedentes.


## Incremento vigente de Fase 12 — D-34

Especificación/criterios CA12-01 a CA12-06, catálogo A-07, estados/reintentos/conciliación, permisos, API/UI, configuración y límites en [NOTIFICACIONES](../docs/NOTIFICACIONES.md). Esquema ejecutable `apps/server/notifications/routes.ts`, migración aditiva y pruebas API/UI. Spec Kit ausente; no se instala ni simula. Fase 12 EN_REVISION; última completada 11; Fases 13–15 sin autorización. Sin correo real ni despliegue.


## Continuidad vigente — D-35

Fase 12 COMPLETADA y CA12-06 cumplido. Fase 13 autorizada únicamente para iniciar en un nuevo chat; ejecución PENDIENTE. Leer [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md), [NOTIFICACIONES](../docs/NOTIFICACIONES.md), [PRUEBAS](../docs/PRUEBAS.md) y A-09/CR-17/CA-N07 de [CIERRE_FASE1](../docs/CIERRE_FASE1.md). Este cierre no ejecuta QA ni instala Spec Kit. Fases 14–15 sin autorización; correo real deshabilitado y sin despliegue. Los estados previos se conservan como antecedentes.


## Consolidación de Fase 13 — D-35/D-36

Plan/criterios/defectos en [QA_FASE13](../docs/QA_FASE13.md), cobertura en [MATRIZ_QA_FASE13](../docs/MATRIZ_QA_FASE13.md) y evidencia en [PRUEBAS](../docs/PRUEBAS.md#fase-13--qa-rendimiento-y-seguridad). Spec Kit no instalado ni simulado. Fase 13 EN_REVISION; última completada 12; aceptación CA13-06 pendiente. Fases 14–15 sin autorización. Sin correo real ni despliegue.


## Continuidad vigente — D-37

Fase 13 COMPLETADA y CA13-06 cumplido. Fase 14 autorizada únicamente para iniciar en un nuevo chat, ejecución PENDIENTE. Leer [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md), [QA_FASE13](../docs/QA_FASE13.md), [ARQUITECTURA](../docs/ARQUITECTURA.md) y [DESPLIEGUE](../docs/DESPLIEGUE.md), que conserva su plantilla pendiente. Este cierre no implementa operación/despliegue ni instala Spec Kit. Fase 15 sin autorización, correo real deshabilitado y producción sujeta a autorización independiente. Los estados previos se conservan como antecedentes.


## Entrega vigente de Fase 14 — D-37/D-38

[Plan/criterios/cobertura](../docs/DESPLIEGUE.md), [runbook](../docs/RUNBOOK_OPERACION.md), [checklist](../docs/CHECKLIST_LIBERACION.md) y [pruebas](../docs/PRUEBAS.md#fase-14--operación-y-continuidad). Spec Kit no instalado ni simulado. CI sin deploy y ensayos sintéticos locales; operación/identidad/retención gestionadas pendientes. EN_REVISION, CA14-06 PENDIENTE; última completada 13. F1-SEG-01/02/03 abiertos, Fase 15 sin autorización y sin producción/correo real. Antecedentes anteriores conservados.


## Continuidad vigente — D-39

Fase 14 COMPLETADA y CA14-06 CUMPLIDO; entrega aceptada `da1ac91`, con límites y evidencias conservados. Fase 15 AUTORIZADA para nuevo chat, ejecución PENDIENTE. Recuperar rama phase14/ci-prerequisites-and-pages-guard del [PR #1](https://github.com/amsotov/inventarioTI2/pull/1), no solo main. Seguir [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md), manuales existentes, [DESPLIEGUE](../docs/DESPLIEGUE.md), [RUNBOOK](../docs/RUNBOOK_OPERACION.md) y [CHECKLIST](../docs/CHECKLIST_LIBERACION.md). Spec Kit no instalado ni simulado. PR sin merge por Pages main:/docs; no ejecución de Fase 15 ni producción en este cierre. F1-SEG-01/02/03 y autorizaciones independientes intactos.

## Entrega vigente — Fase 15 (D-40)

Fase 15 EN_REVISION; CA15-06 PENDIENTE, última completada 14. [Plan/criterios](../docs/FASE15.md), manuales, [instalación/onboarding](../docs/INSTALACION_DESARROLLO.md), [capacitación propuesta](../docs/CAPACITACION.md), [soporte](../docs/SOPORTE_MANTENIMIENTO.md) y [roadmap/deuda](../docs/ROADMAP.md). Se reutiliza documentación existente sin duplicar especificaciones ni instalar Spec Kit. Reproducción técnica local no equivale a capacitación o evaluación humana realizadas. PR #1 en borrador, rama segura sin merge a main por Pages; producción y F1-SEG-01/02/03 siguen bloqueados. Los registros previos son antecedentes.

## Cierre de Fase 15 y pruebas locales — D-41

Fase 15 COMPLETADA por aceptación de `a9a0742`, CA15-06 CUMPLIDO; Fases 0–15 aceptadas. [Sistema local, pendientes y continuidad](../docs/PRUEBAS_LOCALES.md): D-41 autoriza solo esta instancia sintética en el entorno de trabajo, con Auth local real/MFA y sin correo. No se instala Spec Kit ni se inicia Fase 16. PR #1 sigue en borrador/sin merge por Pages, sin producción ni cierre de F1-SEG-01/02/03. Evidencia previa se conserva como histórica.
