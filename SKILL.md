---
name: visual-system-designer
description: Diseña y valida interfaces UX/UI empresariales, prototipos navegables y vistas responsive en la Fase 2 aprobada; úsalo cuando se pida visualizar el sistema, dashboard, pantallas, flujo de navegación o revisión de diseño antes de backend.
---

# Visual System Designer — Skill de Fase 2

## Activación y límite
- Lee `AGENTS.md`, `PROMPT_MAESTRO.md`, `FASES.md`, `ESTADO_PROYECTO.md`, `docs/REQUISITOS.md` y `docs/UX_UI.md`.
- Presenta plan y solicita aprobación explícita de Fase 2 antes de crear o alterar código. No presumas aprobación por esta instrucción ni por descargar la plantilla.
- Si Fase 2 está autorizada, crea prototipo funcional navegable limitado al alcance aprobado; nunca marques como implementadas autenticación, persistencia o APIs por usar mocks.
- Si el repositorio ya contiene frontend, respeta framework, componentes, tokens y archivos existentes. Inspecciona primero y evita cambios destructivos.

## Flujo
1. Extraer perfiles, tareas, flujos, identidad de marca y pantallas del análisis del negocio. Ante vacíos, proponer supuestos explícitos sujetos a validación.
2. Entregar mapa de navegación y lista de pantallas por perfil; identificar ruta crítica de usuario.
3. Proponer sistema de diseño: paleta, tipografía, espaciado, iconos, estados, tablas, formularios, jerarquía y accesibilidad WCAG 2.2 AA como objetivo.
4. Crear interfaz real en HTML/CSS/JS o el stack del repositorio, no una imagen estática. Incorporar pantallas de login de demostración, dashboard, navegación, lista, detalle, formulario y administración solo si corresponden al alcance.
5. Usar datos ficticios, claramente etiquetados. Prototipar estados vacío, carga, error, éxito y falta de permiso. Las acciones deben ser navegables o explicar si son simuladas.
6. Levantar servidor de desarrollo según scripts existentes; facilitar URL de preview solo si es realmente accesible en el entorno. No inventar enlaces públicos ni afirmar acceso desde otros dispositivos sin comprobar.
7. Cuando Playwright esté instalado y sea ejecutable, abrir el prototipo en navegador y verificar navegación, consola, capturas en escritorio (1440px), tablet (768px) y móvil (390px), así como interacciones y accesibilidad básica. Si no está disponible, reportar limitación y entregar pasos manuales.
8. Solicitar al usuario revisión visual concreta: colores, navegación, formularios, densidad de información, gráficos, móvil y coherencia con marca. Iterar dentro de Fase 2 autorizada.
9. Guardar decisiones, capturas si están disponibles, feedback y criterios cumplidos en `docs/UX_UI.md` y estado en `FASES.md`/`ESTADO_PROYECTO.md`.
10. **No avanzar a Fase 3** sin aprobación explícita del usuario; la aprobación visual no autoriza despliegue, autenticación real, base de datos ni tareas de fases siguientes.

## Entrega obligatoria de la fase
- Inventario de pantallas y flujos.
- Prototipo navegable y pasos exactos para ejecutarlo.
- Evidencia de verificaciones realizadas (capturas si se pudieron obtener).
- Checklist de responsive, accesibilidad y estados UI con resultados reales.
- Limitaciones del mock y decisiones que faltan aprobar.
- Pregunta final: `¿Apruebas el diseño visual de Fase 2 y autorizas comenzar la Fase 3?`
