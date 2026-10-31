# inventarioTI2 — Inventario y control de bienes computacionales

Estado vigente (2026-10-31): Fase 0 aceptada; Fase 1 COMPLETADA y aceptada por D-14. Fase 2 COMPLETADA: revisión visual aprobada por D-15. Fase 3 COMPLETADA y aceptada por D-17. Fase 4 COMPLETADA y aceptada por D-19. Fase 5 COMPLETADA y aceptada por D-21. Fase 6 AUTORIZADA para un nuevo chat, ejecución pendiente; fases 7–15 sin autorización y sin despliegue. Consultar [FASES.md](FASES.md), [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md), [análisis empresarial](docs/ANALISIS_EMPRESARIAL.md), [historias](docs/HISTORIAS_USUARIO.md) y [trazabilidad](docs/TRAZABILIDAD.md).

La [revisión de pendientes de Fase 1](docs/CIERRE_FASE1.md) contiene las resoluciones aprobadas: UTC y respaldo semanal (RPO objetivo 7 días, RTO 8 h; copias 30 días). Validación legal de retención antes de datos reales, en F1-SEG-01. Chile y 250 funcionarios confirmados; bienes estimados 900–1.500, referencia 1.200.

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
