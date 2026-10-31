# Plan y evidencia de verificación

**Fecha:** 2026-10-31 · **Fase:** 1 — COMPLETADA (aceptación documental; sin pruebas funcionales).

## Alcance de esta revisión

Verificación documental de análisis, historias, criterios y trazabilidad. No hay aplicación ni dependencias de aplicación. Los escenarios funcionales de [HISTORIAS_USUARIO.md](HISTORIAS_USUARIO.md) y los escenarios RNF de [TRAZABILIDAD.md](TRAZABILIDAD.md) están definidos para ejecución futura, no aprobados por ejecución.

## Controles ejecutados — entregas previas a la aprobación

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
- Validación empresarial y aceptación de CA1-06: **ACEPTADAS** por D-14. No se declara cumplimiento jurídico, pruebas funcionales ni cierre de riesgos de implementación.

## Continuación

D-14 resuelve el análisis A-01 a A-11 y ratifica P-01/P-02/P-04. Fase 1 cerrada documentalmente; mantener F1-SEG-01/02/03 y verificar funcionalidades en fases futuras. Una eventual Fase 2 necesita autorización independiente. La comprobación de sincronización de GitHub se registra en [ESTADO_PROYECTO.md](../ESTADO_PROYECTO.md); el éxito remoto se informa únicamente tras comparar SHA local/remoto.

## Revisión de pendientes — evidencia del 2026-10-31

Base de comparación: `ff64f62e8581016973a9c2cf9d984fffa26dfc42`. `git status` inicial limpio y `git fetch origin`/`git merge --ff-only origin/main` sin cambios remotos adicionales. La solicitud de revisar y terminar pendientes se atiende dentro de Fase 1; la respuesta del usuario confirma Chile y 250 funcionarios y pide estimar bienes.

- `python /tmp/verificar_revision_fase1.py`: APROBADO. Cubre A-01 a A-11 y P-01/P-02/P-04 (14 filas) con recomendaciones y CR-01 a CR-20; referencias CR definidas, sin duplicados y tablas consistentes.
- Misma comprobación: 16 historias y 47 criterios originales intactos; 16 RF/7 RNF cubiertos; filas anteriores RF/RNF/D/P/A/R preservadas; enlaces locales válidos. D-13 reproduce fielmente el dato nuevo sin atribuir al usuario las recomendaciones.
- Cálculos revisados: 250 × 3 × 1,20 = 900; 250 × 4 × 1,20 = 1.200; 250 × 5 × 1,20 = 1.500; capacidad objetivo 3.000/1.200 = 2,5 veces la referencia. Son estimaciones/objetivos, no inventario medido ni rendimiento probado.
- Instrucciones y documentos de arquitectura, datos, seguridad, UX/UI, despliegue y manuales comparados con la base: intactos. Solo Markdown modificado; fases 2–15 PENDIENTE / NO OTORGADA; Fase 1 EN_REVISION.
- `git diff --check`, estructura de tablas y revisión de diferencias: APROBADOS. Se corrige además una frase histórica de DECISIONES que podía interpretarse como falta de autorización actual para Fase 1.

Las comprobaciones validan cobertura, preservación y coherencia documental. CR-01 a CR-20 son resultados propuestos para futuras pruebas, no pruebas funcionales ejecutadas. No hay código ni prototipo; todas las pruebas funcionales/no documentales del apartado anterior continúan NO EJECUTADAS. Aprobación empresarial, zona horaria/localidad y política de conservación siguen pendientes; no se declara cerrada Fase 1.

## Cierre aprobado — evidencia vigente del 2026-10-31

Base: `363cfa0236185a787d86f0ef1afbc5d198ab9ed2`. Git inicial limpio; `git fetch origin`/`git merge --ff-only origin/main` sin novedades. D-14 conserva la respuesta literal del usuario y las modificaciones UTC/respaldo semanal; no configura servicios ni respaldo.

- `python /tmp/verificar_cierre_fase1.py`: revisión de IDs únicos y definidos (5 actores, 7 procesos, 6 casos, 19 reglas, 16 historias, 47 criterios, 20 CR, 16 RF/7 RNF); IDs y alcance conservados frente a la base. Criterios antes condicionados concretados con la resolución aprobada.
- Comprobación de enlaces locales y tablas; fases 2–15 PENDIENTE / NO OTORGADA e intactas respecto de la base; AGENTS, PROMPT_MAESTRO y documentos técnicos futuros intactos; diferencias solo Markdown.
- Coherencia UTC en definición y CR-12; respaldo semanal/RPO ≤ 7 días (168 h), RTO ≤ 8 h, copias 30 días en cierre, requisitos, trazabilidad y continuidad. Se retira la meta RPO 24 h de la propuesta diaria, conservando su antecedente explicativo.
- A-01 a A-11 resueltos en el alcance de análisis, P-01/P-02/P-04 ratificados y CA1-06 cumplido por D-14; F1-SEG-01/02/03 conservados explícitamente antes de datos reales y en sus fases respectivas. El silencio sobre retención legal no se convierte en inexistencia de política.
- `git diff --check`, revisión de diferencias y comprobación de alcance: sin errores de formato ni archivos de implementación. El SHA local/remoto se compara tras push antes de confirmar la entrega.

Resultado de los controles documentales de cierre: APROBADO. Pruebas funcionales y de respaldo/restauración, concurrencia, correo, Excel/PDF, seguridad, Playwright y dispositivos: NO EJECUTADAS por ausencia de implementación y fases futuras sin autorización. Fase 1 COMPLETADA no significa sistema implementado ni respaldo configurado.

## Fase 2 — evidencia de UI del 2026-10-31

La autorización posterior está en FASES/ESTADO. Se construyó únicamente el prototipo UX/UI y se aplicó visual-system-designer de SKILL.md (agregado por el usuario en `d6a14c5`). Los apartados previos corresponden a las entregas documentales anteriores.

Comandos ejecutados:

```sh
node --check prototipo/app.js
node --check tests/prototipo.cjs
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo
PROTOTYPE_URL=http://127.0.0.1:4174 PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright node tests/prototipo.cjs
```

Resultado: **21 verificaciones OK**, Chromium **154.0.8037.57**, Playwright del entorno. Salida completa reproducible: [resultados.txt](evidencias/fase2/resultados.txt). Servidor ligado exclusivamente a loopback, URL local comprobada por el navegador; no hay publicación ni acceso externo supuesto.

| Área | Resultado observado |
|---|---|
| Resumen | Conteos calculados sobre los 8 bienes iniciales; no confundir con inventario real ni capacidad objetivo |
| Bienes | Filtros combinados, vacío, limpieza y rangos UTC con extremos inclusivos e inversión rechazada |
| Búsqueda global | Coincidencia por nombre y enlace a ficha con los dos bienes vigentes del custodio de muestra |
| Alta | Rechazos de obligatorios, código existente incluso en baja y ausencia de serie sin motivo; alta sintética visible |
| Movimientos | Asignación actualiza custodia/historia; baja con custodia y traslado al mismo destino rechazados; devolución conserva condición; mal estado bloquea nuevo traslado |
| Funcionarios | Baja con bienes rechazada; RUT inválido rechazado; alta con ID institucional ilustrada |
| Correcciones | Anotación referenciada añadida, movimiento original conservado |
| Reportes | Cinco tarjetas administrador/cuatro lectura; vista simplificada Excel sin descarga ni correo personal |
| Configuración | Motivo obligatorio, cambio de destinatario visible y evento local consultable en auditoría |
| Cuentas | Cuenta propia identificada como protegida; invitación simulada pendiente sin acceso real |
| Rol lectura | Escrituras ocultas; ruta administrativa directa muestra vista restringida; esto no prueba seguridad efectiva |
| Estados | Vacío/error/éxito, carga→error→reintento y recuperación sin revelar existencia de cuenta |
| Teclado | Salto al contenido, foco de diálogo, Escape y retorno al botón que lo abrió |
| Responsive | 12 rutas × 7 tamaños = 84 comprobaciones de ancho sin desborde de documento; tablas con desplazamiento interno |
| JavaScript / recursos | Cero errores pageerror en el recorrido; sin recursos externos en la muestra final |

Tamaños CSS revisados: 1440×900, 900×1440, 768×1024 (tablet indicada por el skill), 820×1180 (referencia iPad), 1180×820, 390×844 (referencia iPhone) y 844×390. Son viewports de Chromium, no emulación completa de dispositivo, Safari, WebKit ni prueba sobre hardware real.

Capturas generadas después de reiniciar la muestra y revisadas visualmente (escritorio y móvil):

- [Resumen computador](evidencias/fase2/computador.png)
- [Tablet 768 px](evidencias/fase2/tablet.png)
- [iPad 820 px](evidencias/fase2/ipad.png)
- [Resumen iPhone 390 px](evidencias/fase2/iphone.png)
- [Bienes en móvil](evidencias/fase2/iphone-bienes.png)
- [Formulario en móvil](evidencias/fase2/iphone-formulario.png)

Hallazgos corregidos: «Limpiar filtros» permanece disponible con rango inválido; el enlace de salto no cambia la ruta de navegación; cuadrículas con mínimo cero evitan desborde a 768 px; navegación lateral desplazable en alturas reducidas; documento de funcionario separado de la referencia interna; errores asociados a campos; carga simulada no sobrescribe otro diálogo al cancelarse. La ejecución final pasó después de las correcciones y del formateo con Prettier 3.6.2 temporal, sin añadir dependencias al prototipo.

Revisión básica de accesibilidad: etiquetas visibles, encabezados de tabla, anuncio de éxito, error enfocable, foco visible, diálogo nativo, texto además del color y regiones tabulares enfocables. Cálculo puntual de contraste sRGB: texto principal/blanco 13,27:1; secundario/blanco 5,56:1; acción/blanco 5,51:1; enlaces de navegación/fondo 9,79:1; etiquetas bueno 6,23:1, regular 5,90:1 y malo 5,56:1. Son ocho pares muestreados, no una auditoría de todos los estados, un test de lector de pantalla ni certificación WCAG 2.2 AA.

No ejecutadas/no acreditadas: autenticación/MFA real, persistencia, validación de servidor, RLS, concurrencia/idempotencia persistente, generación Excel/PDF y sus límites de volumen, envío/reintento real de correo, rendimiento con 3.000 bienes, respaldo/restauración, revisión legal o seguridad de producción. Esas tareas pertenecen a fases futuras. F1-SEG-01/02/03 se conservan. Fase 2 EN_REVISION, pendiente de aceptación visual del usuario; Fase 3 no autorizada.

Comprobaciones adicionales de cierre: consola de Chromium sin errores en 10 pantallas por HTTP local; enlaces Markdown locales válidos; filas de Fases 3–15 idénticas a la base `d6a14c5`; SKILL, PROMPT_MAESTRO, cierre de Fase 1 y documentos de arquitectura/datos/seguridad/despliegue intactos. `node --check` y `git diff --check` sin errores. La prueba de apertura `file://` fue bloqueada por política del navegador (`ERR_BLOCKED_BY_ADMINISTRATOR`); no se intentó eludirla. El acceso comprobado y recomendado es el servidor HTTP loopback, también para la revisión del usuario tras clonar el repositorio.

## Verificación del cierre visual — 2026-10-31

D-15 registra aprobación expresa y CA2-06 cumplido; Fase 2 COMPLETADA. Fase 3 autorizada para nuevo chat, ejecución pendiente. Revisión documental: enlaces locales, diferencias y estados coherentes; código de prototipo, pruebas y capturas preservados, fases 4–15 intactas. `git diff --check` sin errores. No se repitieron las 21 pruebas UI porque no hubo cambios de código; sus resultados y límites se conservan. No se ejecutó arquitectura, despliegue ni producción. Sincronización confirmada solo tras comprobar SHA remoto al entregar.
