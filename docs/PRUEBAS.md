# Plan y evidencia de verificación

**Fecha:** 2026-10-31 · **Fase:** 1 — EN_REVISION.

## Alcance de esta revisión

Verificación documental de análisis, historias, criterios y trazabilidad. No hay aplicación ni dependencias de aplicación. Los escenarios funcionales de [HISTORIAS_USUARIO.md](HISTORIAS_USUARIO.md) y los escenarios RNF de [TRAZABILIDAD.md](TRAZABILIDAD.md) están definidos para ejecución futura, no aprobados por ejecución.

## Controles ejecutados

| Control / comando | Resultado observado | Límite |
|---|---|---|
| `git status --short --branch`; lectura de instrucciones y documentos | Árbol inicial limpio; base local `f5dbc83` | No acredita reglas empresariales |
| `git fetch origin`; `git merge --ff-only origin/main` | Incorporados `c45e96e` y `fa323a7`, sin conflictos; base de esta entrega `fa323a774bc763f816d78093370618ee8e867ad2` | Primer fetch sin permiso de red falló por conexión al proxy; con red habilitada funcionó |
| Inspección del árbol y `command -v specify` | Sin aplicación, manifiestos, estructura de Spec Kit ni comando disponible; no se instaló nada | Ausencia verificada en árbol y PATH, no búsqueda global de software |
| `python /tmp/verificar_fase1.py` (comprobación puntual fuera del repositorio) | 5 actores, 7 procesos, 6 casos de uso, 19 reglas, 16 historias, 47 criterios de historia y 7 escenarios RNF; IDs únicos y referencias definidas | Revisa estructura/cobertura, no corrección de decisiones no recibidas |
| Misma comprobación: matriz y preservación | 16/16 RF y 7/7 RNF cubiertos; filas originales RF/RNF/D/P/A/R conservadas literalmente frente a `fa323a7`; A-01 a A-11 y P-01/P-02/P-04 siguen abiertos | Cobertura documental; no pruebas funcionales |
| Misma comprobación: enlaces, límites y estados | Enlaces Markdown relativos resueltos; fases 2–15 PENDIENTE / NO OTORGADA; instrucciones y documentos de fases futuras sin cambios; cambios solo Markdown | No verifica destinos externos ni renderizado Mermaid |
| `git diff --check`; revisión de diferencias y documentos nuevos | Sin errores de espacios; documentación dentro del alcance | No acredita aprobación del usuario |

La comprobación puntual utiliza aserciones de cardinalidad, referencias, cobertura, enlaces locales, preservación de filas y comparación de archivos con la base. El script de apoyo está en `/tmp`, no forma parte del producto ni implementa funcionalidades.

## Pruebas no ejecutadas

- Unitarias, integración, API, persistencia, concurrencia real, autenticación, permisos/RLS, recuperación y auditoría: **NO EJECUTADAS**, no hay código ni servicios implementados.
- Envío/recepción/reintentos de correo y exportaciones Excel/PDF: **NO EJECUTADAS**; solo criterios, sin conectar servicios ni datos reales.
- Navegador, Playwright, computador/iPad/iPhone, accesibilidad y renderizado del diagrama: **NO EJECUTADAS**; Fase 2 no iniciada.
- Rendimiento, respaldo/restauración, migración SQL Server, despliegue y producción: **NO EJECUTADAS**, fuera de Fase 1.
- Validación empresarial y aceptación de CA1-06: **PENDIENTES** del usuario; no se declara cumplimiento jurídico ni cierre de riesgos.

## Continuación

Validar las preguntas de A-01 a A-11 y ratificar P-01/P-02/P-04; actualizar los criterios condicionados y sus resultados esperados. Solo entonces evaluar cierre de Fase 1. Una eventual Fase 2 necesita autorización independiente. La comprobación de sincronización de GitHub se registra en [ESTADO_PROYECTO.md](../ESTADO_PROYECTO.md); el éxito remoto se informa únicamente tras comparar SHA local/remoto.

## Revisión de pendientes — evidencia del 2026-10-31

Base de comparación: `ff64f62e8581016973a9c2cf9d984fffa26dfc42`. `git status` inicial limpio y `git fetch origin`/`git merge --ff-only origin/main` sin cambios remotos adicionales. La solicitud de revisar y terminar pendientes se atiende dentro de Fase 1; la respuesta del usuario confirma Chile y 250 funcionarios y pide estimar bienes.

- `python /tmp/verificar_revision_fase1.py`: APROBADO. Cubre A-01 a A-11 y P-01/P-02/P-04 (14 filas) con recomendaciones y CR-01 a CR-20; referencias CR definidas, sin duplicados y tablas consistentes.
- Misma comprobación: 16 historias y 47 criterios originales intactos; 16 RF/7 RNF cubiertos; filas anteriores RF/RNF/D/P/A/R preservadas; enlaces locales válidos. D-13 reproduce fielmente el dato nuevo sin atribuir al usuario las recomendaciones.
- Cálculos revisados: 250 × 3 × 1,20 = 900; 250 × 4 × 1,20 = 1.200; 250 × 5 × 1,20 = 1.500; capacidad objetivo 3.000/1.200 = 2,5 veces la referencia. Son estimaciones/objetivos, no inventario medido ni rendimiento probado.
- Instrucciones y documentos de arquitectura, datos, seguridad, UX/UI, despliegue y manuales comparados con la base: intactos. Solo Markdown modificado; fases 2–15 PENDIENTE / NO OTORGADA; Fase 1 EN_REVISION.
- `git diff --check`, estructura de tablas y revisión de diferencias: APROBADOS. Se corrige además una frase histórica de DECISIONES que podía interpretarse como falta de autorización actual para Fase 1.

Las comprobaciones validan cobertura, preservación y coherencia documental. CR-01 a CR-20 son resultados propuestos para futuras pruebas, no pruebas funcionales ejecutadas. No hay código ni prototipo; todas las pruebas funcionales/no documentales del apartado anterior continúan NO EJECUTADAS. Aprobación empresarial, zona horaria/localidad y política de conservación siguen pendientes; no se declara cerrada Fase 1.
