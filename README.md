# Plantilla universal de proyectos empresariales para Codex Cloud

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

## Visualización del sistema (Skill de Fase 2)
Esta plantilla contiene `.agents/skills/visual-system-designer/SKILL.md`. Una vez aprobada la Fase 2, indica a Codex: `Usa el skill visual-system-designer para crear un prototipo navegable del sistema con datos ficticios, muéstrame el preview y valida escritorio, tablet y móvil. No avances a Fase 3 sin aprobación.` La posibilidad de preview/screenshot depende del entorno y herramientas instaladas.
