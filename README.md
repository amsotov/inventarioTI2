# inventarioTI2 — Inventario y control de bienes computacionales

Estado vigente (2026-11-02): **Fases 0–15 COMPLETADAS y aceptadas**, cierre D-41 de la entrega `a9a0742`; **CA15-06 CUMPLIDO** con límites conservados. D-41 autoriza instancia local sintética de pruebas en este entorno: [acceso, comandos y pendientes](docs/PRUEBAS_LOCALES.md). [Plan y criterios](docs/FASE15.md) · [FASES](FASES.md) · [ESTADO](ESTADO_PROYECTO.md) · [CHANGELOG](CHANGELOG.md).

Aplicación React/TypeScript con BFF Node, PostgreSQL y adaptador Supabase Auth; inventario compartido con dos roles, funcionarios/custodias/historia, administración, reportes/exportación privada y avisos. La implementación aceptada se ha verificado con entornos sintéticos locales; operación gestionada y producción siguen pendientes. **Correo real deshabilitado.** No hay cuenta por defecto ni URL productiva habilitada por esta entrega.

## Continuar en un nuevo chat

[Pendientes y vista previa — D-43](docs/CONTINUIDAD_PRUEBAS.md) reúne el estado aprobado, los pendientes, plan/criterios de acceso y texto listo para pegar. Primera prioridad: una vista funcional accesible desde Chrome Windows. VP-01 sigue PENDIENTE; localhost remoto y el ZIP entregado no acreditan que el usuario pueda entrar. No se ha creado otro chat ni habilitado una URL nueva en esta preparación.

## Documentación según tarea

| Tarea | Entrada |
|---|---|
| Ingresar, consultar, registrar o exportar | [Manual de usuario](docs/MANUAL_USUARIO.md) |
| Administrar cuentas/unidades, auditoría y avisos | [Manual administrativo](docs/MANUAL_ADMIN.md) |
| Instalar y comprender el proyecto | [Instalación y onboarding](docs/INSTALACION_DESARROLLO.md) |
| Preparar práctica y evaluación por rol | [Capacitación propuesta](docs/CAPACITACION.md); sesiones NO REALIZADAS |
| Solicitar ayuda y mantener cambios | [Soporte y mantenimiento](docs/SOPORTE_MANTENIMIENTO.md) |
| Priorizar pendientes y evolución | [Roadmap y deuda](docs/ROADMAP.md); propuestas SIN IMPLEMENTAR |
| Revisar requisitos y diseño | [Cierre Fase 1](docs/CIERRE_FASE1.md), [trazabilidad](docs/TRAZABILIDAD.md), [arquitectura](docs/ARQUITECTURA.md), [seguridad](docs/SEGURIDAD.md) |
| Examinar evidencia y operación | [Pruebas](docs/PRUEBAS.md), [plan operativo](docs/DESPLIEGUE.md), [runbook](docs/RUNBOOK_OPERACION.md), [checklist NO-GO](docs/CHECKLIST_LIBERACION.md) |

## Servidor local funcional — D-41

**Acceso desde Chrome del usuario pendiente (D-42):** localhost del computador personal no se conecta a este entorno. [Diagnóstico y ejecución local](docs/ACCESO_VISTA_PREVIA.md); no hay herramienta de reenvío de puertos disponible ni URL remota habilitada. El servidor responde en `https://localhost:8443` **solo dentro de este entorno**: UI/BFF compilados, PostgreSQL y Auth locales reales, TLS, MFA y cuentas/datos sintéticos. No es una URL pública ni el localhost del equipo personal. [Guía de acceso/certificado/credenciales/inicio/detención](docs/PRUEBAS_LOCALES.md). Correo real deshabilitado; estado privado bajo work/, sin contraseñas en GitHub. Para retomar: `node ops/local/control.mjs status`; no borrar/reinicializar volúmenes.

## Verificación local de entrada

Recuperar la rama `phase14/ci-prerequisites-and-pages-guard` del [PR #1](https://github.com/amsotov/inventarioTI2/pull/1). Leer AGENTS/PROMPT/FASES/ESTADO. Con Node 24, npm, Docker local y Chromium, desde raíz:

```sh
npm ci
npm run build
node --import tsx --test --test-concurrency=1 tests/ui/frontend.test.ts
```

La [guía](docs/INSTALACION_DESARROLLO.md) explica herramientas PDF, imágenes, puertos, ruta de Chromium y evidencia regenerada: usar checkout desechable. Este recorrido termina su servidor y usa identidad doble/DB sintética; no deja una instancia interactiva. `npm start` exige configuración externa, HTTPS y roles SQL separados; no carga `.env` por sí solo. `npm run dev:web` es Vite sin API/proxy. El prototipo en `prototipo/` es visual y efímero, con simulaciones; no introducir datos reales.

## Límites y continuidad

F1-SEG-01 (retención legal antes de datos reales), F1-SEG-02 (presupuesto/recursos) y F1-SEG-03 (operador/custodia/horario/alertas de respaldo) siguen abiertos. UTC, copia semanal/máximo 168 h/RPO ≤168 h/RTO ≤8 h/copias 30 días conservados. Integraciones gestionadas, continuidad integral, hardware/Safari, accesibilidad completa, capacitación y validación humana nueva conservan sus pendientes.

**GitHub:** PR #1 en borrador y sin merge. Pages legacy `main:/docs` sigue activo fuera del árbol: no hacer push/merge a main bajo prohibición de publicación. Verify only no despliega. Esta entrega no cambia esa configuración ni autoriza publicación, producción, correo real, cuentas/datos reales, gastos o permisos remotos. La siguiente acción es probar la instancia local autorizada por D-41; el roadmap y la aceptación documental no autorizan evolución adicional ni operación productiva.

## Antecedentes conservados

El texto siguiente conserva la plantilla y entregas históricas. Sus estados, límites y órdenes de iniciar fases se refieren a sus fechas; prevalecen el estado vigente y los documentos enlazados arriba.

<details>
<summary>Plantilla original y registro histórico de Fases 2–14</summary>

Las instrucciones de la plantilla original se conservan a continuación como referencia.

Conjunto reutilizable de instrucciones y documentos para iniciar **un repositorio de proyecto nuevo**, usando un **modo guiado**: cada fase necesita aprobación expresa antes de comenzar.

## Uso rápido

1. Descarga y descomprime el ZIP.
2. Copia **el contenido de esta carpeta** a la raíz de tu repositorio (no copies la carpeta contenedora).
3. Si ya existen `AGENTS.md`, `README.md` u otros archivos, **fusiónalos con cuidado; no los sobreescribas**. Esta plantilla está orientada a proyectos nuevos.
4. Haz commit y envía los archivos a GitHub usando tu flujo habitual.
5. Abre el repositorio en Codex Cloud y envía:

   `Lee AGENTS.md y PROMPT_MAESTRO.md. Trabaja en modo GUIADO. Si el proyecto aún no está definido, haz la pregunta inicial. Prepara la propuesta de Fase 0 y solicita mi aprobación antes de comenzar a implementarla.`

6. Cuando definas el proyecto, reemplaza los marcadores `POR DEFINIR` de la documentación con hechos validados.
7. Mantén `ESTADO_PROYECTO.md` actualizado para continuar en nuevos chats.

## Estructura

- `PROMPT_MAESTRO.md`: metodología completa por 16 fases.
- `AGENTS.md`: instrucciones persistentes para Codex.
- `FASES.md`: fases, estados y registro de aprobaciones.
- `ESTADO_PROYECTO.md`: memoria de ejecución comprobable.
- `docs/`: requisitos, UX, arquitectura, datos, seguridad, pruebas, despliegue y manuales.
- `specs/`: especificaciones de funcionalidades; opcionalmente Spec Kit.
- `.gitignore`: patrones iniciales para evitar secretos y artefactos locales.

## Advertencias

- Descomprimir no configura por sí solo Codex Cloud, GitHub ni Spec Kit; requiere repositorio y entorno apropiados.
- Una instrucción en Markdown **no garantiza** que un agente no ejecute cambios no autorizados: revisa los permisos y propuestas de acciones.
- No subas claves de acceso ni datos sensibles al repositorio.
- Las carpetas `docs/` y `specs/` ya contienen plantillas para conservarse en Git.

## Revisar el prototipo de Fase 2

El skill [visual-system-designer](SKILL.md) fue incorporado por el usuario y aplicado. Guía, mapa de pantallas, decisiones, límites y aceptación registrada en [UX/UI](docs/UX_UI.md); resultados y capturas en [pruebas](docs/PRUEBAS.md).

Desde la raíz del repositorio, ejecuta:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo
```

Abre `http://127.0.0.1:4174/` en la misma máquina. Para revisarlo en tu equipo, descarga/clona el repositorio y ejecuta allí el mismo servidor local. No hay enlace público ni despliegue.

Recorrido sugerido: Resumen → Bienes → filtros → ficha de bien → registrar movimiento con motivo y confirmación → ficha del custodio → historial. Prueba también lectura en el selector de rol, reportes y los estados de carga/error en Acceso demo.

La demo usa datos sintéticos y cambios solo en memoria; recargar reinicia todo. No introduzcas datos reales. Las vistas de exportación y acceso son simulaciones; no hay backend, persistencia, seguridad efectiva ni envío de correos.

Pruebas UI: `PLAYWRIGHT_MODULE=/ruta/a/playwright CHROMIUM_PATH=/ruta/a/chromium PROTOTYPE_URL=http://127.0.0.1:4174 node tests/prototipo.cjs`. Playwright/Chromium deben estar instalados; no son dependencias de ejecución del prototipo. Las rutas concretas usadas están en docs/PRUEBAS.md.

## Arquitectura y continuidad

Fase 3 completada y aceptada por D-17: [arquitectura, costos y riesgos](docs/ARQUITECTURA.md), [contratos](docs/CONTRATOS_API.md), [ADR](docs/adr/FASE3.md). Selección técnica aceptada como diseño: React/TypeScript, API Node modular y PostgreSQL/Supabase; no hay implementación de servicios ni infraestructura contratada.

Verificación documental reproducible: `python3 docs/evidencias/fase3/verificar.py`; resultados y límites en [PRUEBAS](docs/PRUEBAS.md). Prototipo y evidencia visual conservados. El verificador conserva el estado de la entrega original; la revisión de este cierre está en PRUEBAS. Fase 4 aceptada por D-19; ver modelo y pruebas a continuación. Sin despliegue.

## Persistencia de Fase 4

[Modelo ER y reglas](docs/BASE_DATOS.md), [diccionario](docs/DICCIONARIO_DATOS.md), [migración](supabase/migrations/20261031053433_modelo_inicial.sql), [datos sintéticos](db/seed_prueba.sql) y [consultas](db/consultas.sql). Esquema privado con acceso cerrado; sin Auth, API ni worker funcional. El prototipo conserva sus datos efímeros y todavía no se conecta a esta persistencia.

Requiere Python 3 y Docker para ejecutar la suite aislada:

```sh
docker pull postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f
python3 tests/datos/verificar.py
python3 docs/evidencias/fase4/verificar_documentos.py
```

La suite crea y elimina exclusivamente sus recursos sintéticos, sin red ni puertos publicados. No acepta una base remota. Resultados y limitaciones en [PRUEBAS](docs/PRUEBAS.md). Fase 4 COMPLETADA por D-19. Fase 5 autorizada para un nuevo chat, ejecución pendiente; no se implementa aquí ni se despliega.

Los verificadores de Fase 3/4 conservan las condiciones de su entrega original; no verifican los cierres aprobados posteriores. La verificación documental de este cierre se registra en PRUEBAS.


## Inicio de Fase 5 en un nuevo chat

No puedo abrir automáticamente otro chat. Abre uno con inventarioTI2 y escribe:

> Inicia únicamente la Fase 5 de inventarioTI2, ya autorizada por D-19 en FASES.md y ESTADO_PROYECTO.md. Lee las instrucciones, la arquitectura y la persistencia aceptadas; presenta el plan y desarrolla autenticación con pruebas en un entorno aislado. Conserva los seguimientos y actualiza GitHub. No inicies Fase 6 ni despliegues.


## Autenticación — entrega de Fase 5

[Implementación, ejecución, criterios y pendientes](docs/AUTENTICACION.md). Node 24: `npm ci`, `npm run build`, `npm test` (requiere Docker e imágenes de prueba). Variables de servidor en [.env.example](.env.example), sin secretos ni cuentas de ejemplo utilizables. Sin despliegue; Fase 6 autorizada para un nuevo chat por D-21. El prototipo sigue siendo una referencia visual sintética, no una sesión real.


## Continuidad aprobada — Fase 6 en nuevo chat

Usuario acepta Fase 5 y autoriza iniciar únicamente Fase 6 en un nuevo chat (D-21). Recuperar main y seguir el punto de arranque al final de [FASES.md](FASES.md), sin volver a pedir esa autorización. Esta actualización solo registra el cierre; no inicia Fase 6 ni crea el chat. Los [pendientes operativos de autenticación](docs/AUTENTICACION.md) permanecen documentados; sin despliegue ni autorización de Fase 7.


## Entrega de Fase 6

Ver [SEGURIDAD](docs/SEGURIDAD.md) y [PRUEBAS](docs/PRUEBAS.md). `npm ci`, `npm run build`, `npm test` (Docker local requerido, datos sintéticos). `DATABASE_URL` ahora exige identidad SQL `inventario_auth` sin membresías ni privilegios de propietario. No se aprovisionan logins reales. Puerto de negocio separado listo para integración futura; ninguna API empresarial nueva ni despliegue.


Punto vigente — D-23: para continuar, abrir un nuevo chat e indicar «Inicia únicamente la Fase 7, ya autorizada en FASES.md y ESTADO_PROYECTO.md. Desarrolla Backend y API y actualiza GitHub. No inicies Fase 8 ni despliegues». El cierre actual solo registra continuidad; no inicia backend empresarial.


## Entrega de Fase 7 — 2026-10-31

Fase 7 EN_REVISION: [backend/API](docs/BACKEND_API.md) y [OpenAPI](docs/openapi-fase7.json). Para arrancar, se requiere BUSINESS_DATABASE_URL con identidad exacta inventario_runtime, separado de DATABASE_URL (inventario_auth). Aplicar migraciones solo en entorno autorizado; no hay credenciales predeterminadas. npm ci, npm run build y npm test (Docker local para pruebas sintéticas). Fases 8–15 no iniciadas; sin despliegue.


## Cierre de Fase 7 — 2026-11-01

Entrega aceptada por D-25. Fase 8 autorizada para un nuevo chat; no iniciada en esta tarea. Consultar continuidad vigente en FASES y ESTADO; los estados EN_REVISION anteriores son antecedentes.


## Frontend funcional — Fase 8 COMPLETADA (D-27)

React/Vite y BFF bajo el mismo origen: acceso/MFA, consultas/fichas/filtros/paginación y alta/edición de atributos de bienes. `npm run build` compila servidor y UI; `npm run test:ui` verifica navegador/BFF/PostgreSQL sintéticos (Docker y Chromium). Configuración, ejecución y límites en [FRONTEND](docs/FRONTEND.md). Fase 9 autorizada para un nuevo chat, ejecución pendiente; sin despliegue.


Punto vigente — Fase 9 COMPLETADA por D-29: [panel administrativo](docs/ADMINISTRACION.md), [manual del panel](docs/MANUAL_ADMIN.md) y [pruebas](docs/PRUEBAS.md). Última completada 9; Fase 10 autorizada para un nuevo chat, ejecución pendiente. Sin despliegue.


## Cierre de Fase 9 — 2026-11-01

Entrega aceptada por D-29. Fase 10 autorizada para un nuevo chat; seguir el plan de continuidad al final de [FASES](FASES.md). Esta tarea solo registra el cierre y no abre automáticamente otra conversación. Fases 11–15 sin autorización; sin despliegue. Los estados anteriores son antecedentes históricos.


## Cierre de Fase 10 — 2026-11-02

Entrega aceptada por D-31. Fase 11 autorizada para un nuevo chat; seguir el plan de continuidad al final de [FASES](FASES.md). Esta tarea solo registra el cierre y no abre automáticamente otra conversación. Fases 12–15 sin autorización; sin despliegue. Los estados anteriores son antecedentes históricos.


## Cierre de Fase 11 — 2026-11-02

Entrega aceptada por D-33. Fase 12 autorizada para un nuevo chat; seguir el plan de continuidad al final de [FASES](FASES.md). Esta tarea solo registra cierre/continuidad y no abre automáticamente una conversación. En el nuevo chat indica:

> Inicia únicamente la Fase 12 de inventarioTI2, ya autorizada por D-33 en FASES.md y ESTADO_PROYECTO.md. Presenta el plan de notificaciones y automatización, conserva los límites y actualiza GitHub. No inicies Fase 13 ni despliegues.

Fases 13–15 sin autorización. Sin implementación/envíos de Fase 12 ni despliegues en este cierre.


## Entrega de Fase 12 — 2026-11-02

[Catálogo, configuración, estados, API, verificación y pendientes](docs/NOTIFICACIONES.md). Administración → Seguimiento de avisos permite consultar intentos y registrar cancelación/reintento/conciliación con evidencia. `npm start` no envía avisos; el worker separado `npm run start:notifications` está deshabilitado por defecto y requiere configuración y autorización de envío propias. Ensayos sin llamadas a Resend ni mensajes reales. Fase 12 EN_REVISION; no iniciar Fase 13 ni desplegar.


## Cierre de Fase 12 — 2026-11-02

Entrega aceptada por D-35. Fase 13 autorizada para un nuevo chat; seguir el punto de continuidad al final de [FASES](FASES.md). Esta tarea solo registra cierre/continuidad; no crea automáticamente otra conversación. En el nuevo chat indica:

> Inicia únicamente la Fase 13 de inventarioTI2, ya autorizada por D-35 en FASES.md y ESTADO_PROYECTO.md. Presenta el plan de QA, rendimiento y seguridad, conserva los límites y actualiza GitHub. No inicies Fase 14 ni despliegues.

Fases 14–15 sin autorización. Sin ejecución de Fase 13, activación/envíos reales ni despliegues en este cierre.


## Cierre de Fase 13 — 2026-11-02

Entrega aceptada por D-37. Fase 14 autorizada para iniciar en un nuevo chat; seguir el punto de continuidad al final de [FASES](FASES.md). Este cierre solo registra aceptación/continuidad y no crea automáticamente otra conversación. Abre un nuevo chat con inventarioTI2 e indica:

> Inicia únicamente la Fase 14 de inventarioTI2, ya autorizada por D-37. Presenta el plan de despliegue, operación y continuidad, conserva los límites y actualiza GitHub. No inicies Fase 15 ni despliegues a producción.

Fase 15 sin autorización. Sin implementación de Fase 14, activación/envíos reales ni despliegues en este cierre. Los límites de QA y F1-SEG-01/02/03 se conservan.


## Entrega de Fase 14 — EN_REVISION

Plan, runbook y checklist enlazados al inicio. `npm run test:ops` reproduce el ensayo aislado de copia cifrada/restauración y las verificaciones de salud/logs/edad de copia; requiere Docker local, nunca DSN real. El workflow GitHub solo verifica. `npm start` conserva worker apagado y exige configuración externa; /health/live y /health/ready no sustituyen el smoke autenticado. Pendientes gestionados y aceptación CA14-06 explícitos. Producción no desplegada; Fase 15 sin iniciar.


## Cierre de Fase 14 — D-39

Entrega `da1ac91` aprobada y Fase 14 COMPLETADA. Fase 15 autorizada para un nuevo chat, ejecución pendiente. No puedo abrir automáticamente esa conversación. Abre un nuevo chat con inventarioTI2 y la rama del [PR #1](https://github.com/amsotov/inventarioTI2/pull/1), e indica:

> Inicia únicamente la Fase 15 de inventarioTI2, ya autorizada por D-39. Recupera la rama del PR #1 y lee FASES.md y ESTADO_PROYECTO.md. Presenta el plan de documentación, capacitación y evolución y actualiza GitHub en rama/PR, sin merge a main por el bloqueo de Pages. No publiques ni despliegues a producción.

Este cierre no ejecuta Fase 15 ni elimina pendientes F1-SEG-01/02/03; no autoriza correo real, gastos, cuentas/datos reales, permisos remotos, merge o publicación.

</details>
