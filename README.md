# inventarioTI2 — Inventario y control de bienes computacionales

Estado vigente (2026-10-31): Fase 0 aceptada; Fase 1 COMPLETADA y aceptada por D-14. Fase 2 COMPLETADA: revisión visual aprobada por D-15. Fase 3 EN_REVISION: arquitectura documental entregada; fases 4–15 sin autorización y sin despliegue. Consultar [FASES.md](FASES.md), [ESTADO_PROYECTO.md](ESTADO_PROYECTO.md), [análisis empresarial](docs/ANALISIS_EMPRESARIAL.md), [historias](docs/HISTORIAS_USUARIO.md) y [trazabilidad](docs/TRAZABILIDAD.md).

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

Fase 3 ejecutada y entregada EN_REVISION: [arquitectura, costos y riesgos](docs/ARQUITECTURA.md), [contratos](docs/CONTRATOS_API.md), [ADR](docs/adr/FASE3.md). Selección técnica propuesta: React/TypeScript, API Node modular y PostgreSQL/Supabase; no hay implementación de servicios ni infraestructura contratada.

Verificación documental reproducible: `python3 docs/evidencias/fase3/verificar.py`; resultados y límites en [PRUEBAS](docs/PRUEBAS.md). Prototipo y evidencia visual conservados. Siguiente acción: revisar/aceptar Fase 3. Fase 4 requiere autorización independiente; sin despliegue.
