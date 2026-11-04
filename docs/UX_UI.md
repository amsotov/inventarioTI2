# UX/UI — Fase 2

**Proyecto:** inventarioTI2 · **Fecha:** 2026-10-31 · **Estado:** COMPLETADA.
**Aprobación visual:** OTORGADA el 2026-10-31; D-15. Fase 3 AUTORIZADA para un nuevo chat, ejecución PENDIENTE.

## Alcance y fuentes

Fase 2 autorizada en FASES/ESTADO y ratificada en esta conversación. Base: cierre de Fase 1 D-14, RF-01 a RF-16 y HU-01 a HU-16. Se construye un prototipo ejecutable de diseño, con HTML/CSS/JS sin dependencias de ejecución, sin decidir el stack definitivo. Todos los registros, cuentas y correos son sintéticos (`example.invalid`). Cambios solo en memoria: recargar reinicia la muestra.

El skill visual-system-designer fue añadido por el usuario a la raíz como [SKILL.md](../SKILL.md), recibido en `d6a14c5`. Se leyó y aplicó antes de cerrar la entrega. La búsqueda inicial de la ruta antigua resultó negativa; ese hallazgo quedó superado por la incorporación del usuario. AGENTS ahora señala la ubicación real. No se instaló Spec Kit ni se cambió su estructura.

## Plan ejecutado y ruta crítica

1. Recuperar main y las resoluciones aceptadas, preservar trabajo remoto y presentar alcance.
2. Extraer pantallas por rol y crear sistema visual coherente, responsive y accesible como objetivo.
3. Prototipar consulta, escritura simulada y excepciones sin servicios externos.
4. Verificar recorridos, estados y tamaños mediante Playwright/Chromium, capturar evidencia y documentar límites.
5. Sincronizar GitHub y entregar a revisión visual; ninguna fase posterior se inicia.

Ruta crítica: resumen → bienes → filtros/búsqueda → ficha de bien → movimiento con motivo y confirmación → custodia e historial → ficha de funcionario. Ruta complementaria: funcionario → edición de unidad → bienes actuales actualizados, historia con unidad original. La búsqueda global presenta bienes y funcionarios por separado.

## Mapa de navegación y cobertura

| Pantalla / fragmento URL | Administrador | Lectura | Historia / interacción de diseño |
|---|---|---|---|
| `#resumen` | Consulta y alta | Consulta | KPI calculados sobre muestra, distribución física, últimos movimientos |
| `#bienes` | Consulta y formulario de alta | Consulta | HU-02/06/07: texto, condición, tipo, custodia, unidad, situación y adquisición UTC |
| `#bien/TI-0001` | Consulta, movimiento, anotación | Consulta | HU-03/04/05: condición, custodia y baja separadas; historia original conservada |
| `#funcionarios` | Consulta y alta | Consulta | HU-01: identificador institucional o RUT, validación ilustrativa y unicidad |
| `#funcionario/F-DEMO-01` | Consulta, edición, baja/reactivación | Consulta | HU-01/06: datos, bienes actuales y anteriores, bloqueo de baja con bienes |
| `#buscar` | Consulta y vista de exportación | Igual | HU-06/07: código/serie/marca/modelo/tipo/condición; nombre/documento/correo/cargo/unidad |
| `#movimientos` | Consulta y movimiento | Consulta | HU-03/04/05: filtros por fecha efectiva y unidad histórica de origen/destino |
| `#reportes` | Cinco reportes | Cuatro, sin auditoría | HU-16: vistas de Excel/PDF, sin generación ni descargas reales |
| `#cuentas` | Invitación y gestión simulada | Vista restringida | HU-08/09/11: cuenta propia protegida, invitados sin acceso, roles y activación |
| `#auditoria` | Consulta filtrada | Vista restringida | HU-12/13: actor, entidad, acción, anterior/nuevo y registro UTC |
| `#configuracion` | Destinatario y aviso fallido/incierto | Vista restringida | HU-14/15: motivo obligatorio, pendientes conservan destinatario original |
| `#acceso` | Recorrido demo | Recorrido demo | HU-10: inicio/MFA conceptual, recuperación genérica, enlace caducado, carga/error/reintento |

El selector de rol es una herramienta de revisión visual; no representa autenticación ni permisos efectivos. En lectura se ocultan escrituras y el acceso por fragmento a administración presenta estado restringido. Esto no acredita RNF-01 ni RLS.

## Sistema visual propuesto, sujeto a aprobación

No se recibió marca institucional ni logo. Se propone identidad tipográfica propia del prototipo, sin atribuirla a la organización.

| Elemento | Propuesta implementada |
|---|---|
| Paleta | Navegación `#152c35`, acción principal `#08766b`, fondo `#f4f6f7`, texto `#20323c`, secundario `#586b75` |
| Estados | Bueno/activo verde; regular/pendiente ámbar; malo/baja/error rojo. Siempre con texto además del color |
| Tipografía | Fuentes de sistema, texto 14 px; título 29 px escritorio/26 px móvil; etiquetas 11–12 px |
| Espaciado | Escala de 4/8/12/16/20/24 px; tarjetas con radio 12 px; formularios agrupados en una/dos columnas |
| Jerarquía | Navegación lateral escritorio; barra de navegación horizontal móvil; breadcrumb, título, acción primaria y contenido |
| Tablas | Cabeceras semánticas, identificador enlazado, dato secundario, región desplazable con teclado |
| Formularios | Etiqueta visible, requerido marcado, ayuda, resumen de error enfocable y asociado; validación ilustrativa |
| Foco | Contorno ámbar visible, enlace de salto a contenido, diálogo nativo y Escape/cancelación |
| Gráfico | Barra por condición calculada sobre muestra, leyenda textual con conteos; no depende solo de color |
| Responsive | A 1150 px se apila dashboard; a 700 px navegación superior, tarjetas 2×2 y formularios en una columna |

## Estados y reglas representadas

- Vacío: búsqueda sin coincidencias, tablas sin filas, filtro sin resultados.
- Carga/error/reintento: recorrido deliberado en Acceso demo → Ver carga y error. No finge llamadas reales.
- Error de formulario: obligatorios, RUT inválido, duplicados aun en baja, ausencia de serie sin motivo, rangos invertidos.
- Éxito: anuncio accesible y resultado visible en lista/ficha tras un cambio simulado.
- Confirmación/cancelación: motivo y confirmación de movimiento; cancelar/Escape conserva datos.
- Permiso: vista lectura y acceso administrativo directo restringido a nivel visual.
- Movimientos: bloquear doble asignación, mal estado/baja, destino igual o inactivo, baja con custodia; devolución conserva condición. Cambio a malo conserva responsable. Reactivación no restaura custodia ni condición.
- Unidad actual depende del custodio; sin él se muestra «Sin unidad por custodia». Los movimientos guardan unidad histórica.
- Anotación correctiva añade referencia sin modificar el original. Compensaciones se representan con movimientos ordinarios separados.
- Fechas UTC explícitas. Movimientos efectivos al confirmar; sin campo retroactivo/futuro. Adquisición no futura. Rangos por días inclusivos con campo temporal identificado.
- Aviso fallido no revierte operación, resultado incierto sin repetición ciega; reintento es ilustrativo y no envía correo.

## Abrir el prototipo

Desde la raíz del repositorio:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo
```

Abrir `http://127.0.0.1:4174/` en la misma máquina. El punto de entrada es [index.html](../prototipo/index.html); en este entorno debe servirse por HTTP local porque la política del navegador bloquea file://. La URL loopback se verifica en el entorno de trabajo; no es un enlace público ni se afirma que sea accesible desde el dispositivo del usuario. Para revisar fuera del entorno, descargar/clonar el repositorio y ejecutar el mismo comando localmente. No hubo despliegue ni publicación.

Prueba reproducible (Node, Playwright y Chromium instalados):

```sh
PLAYWRIGHT_MODULE=/ruta/a/playwright CHROMIUM_PATH=/ruta/a/chromium PROTOTYPE_URL=http://127.0.0.1:4174 node tests/prototipo.cjs
```

Con Playwright resoluble por Node puede omitirse PLAYWRIGHT_MODULE. Las capturas se generan en `docs/evidencias/fase2/`. Comandos/resultados efectivos se registran en [PRUEBAS.md](PRUEBAS.md).

## Limitaciones del prototipo aceptado

Prototipo de memoria con muestra pequeña, sin persistencia, API, backend, autenticación/MFA real, sesión, RLS, correos, Excel/PDF ni configuración de respaldo. Reportes son vistas simplificadas para revisar presentación; el contrato funcional completo A-11 sigue pendiente de implementación en Fase 11. No se prueban concurrencia, idempotencia persistente, rendimiento objetivo, carga, recuperación operativa ni seguridad efectiva por tener controles en JavaScript. No se declara conformidad WCAG 2.2 AA completa, compatibilidad Safari ni prueba en hardware iPad/iPhone.

F1-SEG-01: validación legal/retención antes de datos reales; F1-SEG-02: presupuesto en Fase 3; F1-SEG-03: operación de respaldos en sus fases. Se mantienen UTC y respaldo semanal/RPO 7 días/RTO 8 h/copias 30 días como requisitos, sin configuración real.

El usuario aprobó la revisión visual de la entrega sin solicitar cambios concretos. La aceptación incluye el diseño presentado, sin inventar preferencias de marca adicionales ni certificar accesibilidad/compatibilidad completa. La Fase 2 queda COMPLETADA; Fase 3 autorizada para un nuevo chat y no iniciada aquí.

## Evidencia de la entrega

21 verificaciones UI aprobadas; 12 rutas revisadas en siete tamaños (84 comprobaciones de ancho). Resultado y alcance de cada revisión en [PRUEBAS.md](PRUEBAS.md) y [salida de ejecución](evidencias/fase2/resultados.txt).

| Vista | Captura |
|---|---|
| Computador 1440×900 | [Resumen](evidencias/fase2/computador.png) |
| Tablet 768×1024 | [Resumen](evidencias/fase2/tablet.png) |
| iPad 820×1180 | [Resumen](evidencias/fase2/ipad.png) |
| iPhone 390×844 | [Resumen](evidencias/fase2/iphone.png), [bienes](evidencias/fase2/iphone-bienes.png), [formulario](evidencias/fase2/iphone-formulario.png) |

Aceptación visual: **APROBADA** el 2026-10-31. Evidencia: «apruebo la revisión visual" para que cierre la fase y pase a la Fase 3 en nuevo chat». D-15 acepta la entrega visual y cierra Fase 2; autoriza Fase 3 para un nuevo chat. Se conservan capturas, resultados y limitaciones. No se solicitaron ajustes visuales específicos.


## Migración Fase 3 — propuesta visual y de contratos

[Muestra revisable con capturas](migracion/03_DISENO_VISUAL.md) y [mapa de pantallas](migracion/03_PANTALLAS.csv). Se aplica SKILL visual-system-designer al diseño de migración autorizado, conservando identidad del frontend. Solo maqueta aislada, sin cambiar React ni acreditar funcionalidad por mocks. Fase 2 de migración aceptada por M3-A01; Fase 3 EN_REVISION, sin aprobación visual presumida ni Fase 4.


## Migración Fase 7 — interfaz para revisión visual

La nueva área se integra al shell/CSS React existente; [recorridos, cobertura, capturas y límites](migracion/07_ADAPTACION_VISUAL.md). Se aplica SKILL.md por su alcance visual ya autorizado. 1440/768/390 y ambos roles, teclado/foco y axe automático delimitado. Fuentes F3/identidad conservadas; no se vuelve a un prototipo aislado para aparentar integración. Revisión visual del usuario PENDIENTE; ninguna aceptación de pantalla acredita persistencia SQL Server.
