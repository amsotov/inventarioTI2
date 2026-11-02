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

## Verificación de Fase 3 — arquitectura, 2026-10-31

Base remota integrada por avance directo: `e7db2c6`. Fase 3 autorizada por D-15 y solicitud actual; entrega EN_REVISION. Se ejecutó revisión documental, sin crear servicios ni iniciar Fase 4.

Comando reproducible desde la raíz: `python3 docs/evidencias/fase3/verificar.py`. [Verificador](evidencias/fase3/verificar.py) y [resultado](evidencias/fase3/resultados.txt) versionados. Comprueba preservación byte a byte de 25 archivos de la base ajenos al alcance (incluye prototipo, pruebas UI, capturas, skill, instrucciones y plantillas de datos/seguridad/despliegue), cambios solo documentales/verificador, filas de fases 4–15 intactas, Fase 3 EN_REVISION, enlaces Markdown locales, cobertura de 16 RF/7 RNF/seis CA3/seis ADR, ejemplos JSON válidos y aritmética de costos. No certifica semántica de todo el texto por encontrar identificadores; se complementó con lectura de diferencias y contratos.

Resultados: controles documentales APROBADOS; `git diff --check` sin errores. CA3-01 a CA3-05 revisados a nivel documental, CA3-06 PENDIENTE de aceptación del usuario. Compatibilidad se ha evaluado como diseño, sin build ni prueba de SDKs. Fuentes públicas consultadas vía HTTPS, siete respuestas HTTP 200; URLs/huellas en [fuentes](evidencias/fase3/fuentes.txt). Se revisó changelog Supabase y aviso de actualización PostgreSQL, documentación de RLS/sesiones/backups y tarifas Supabase/Render. No se accedió a proyectos o datos del usuario ni se ejecutaron consultas SQL.

Revisión de escenarios de diseño: doble asignación y último administrador requieren serialización/transacción; timeout tras commit se recupera con clave idempotente; rol revocado se comprueba antes de devolver resultados; cambios de identidad entre proveedores requieren estados/conciliación; aviso incierto no se reenvía automáticamente; límites de exportación se comprueban sobre la misma instantánea; copias Pro de 7 días necesitan complemento externo para 30 días. Son razonamientos sobre contratos, no pruebas de integración ejecutadas.

No ejecutadas: pruebas UI/Playwright (código intacto, evidencia anterior conservada); instalación/build y compatibilidad de librerías (sin stack implementado); API, identidad/MFA, RLS, concurrencia, workers, Excel/PDF reales, correo, rendimiento, respaldo/restauración y revisión jurídica (fases futuras). No se afirma seguridad efectiva, SLA, cumplimiento de RPO/RTO ni compatibilidad SQL Server por escribir arquitectura. No se desplegó ni configuró CI/CD.

GitHub: revisión de diferencias, commit y push normales a main; comprobación de igualdad de SHA local/remoto antes de confirmar entrega. El SHA final se comunica tras verificarlo, sin insertar una referencia circular en el commit.


## Verificación del cierre aprobado de Fase 3 — 2026-10-31

D-17 acepta arquitectura/contratos/ADR de `703002c`, cumple CA3-06 y cierra Fase 3. Fase 4 autorizada para nuevo chat, no ejecutada aquí. Se comprobó por script Python puntual: enlaces Markdown locales existentes, estados vigentes y filas de fases 5–15 intactas respecto de `703002c`; archivos ajenos a los diez documentos de cierre preservados byte a byte. `git diff --check` sin errores. Revisión de diferencias para distinguir aceptación técnica de gasto u operación aprobados.

No se repiten pruebas UI ni se ejecuta SQL/restauración/build: esta tarea solo registra aprobación y continuidad. El verificador y resultados de evidencias/fase3 quedan intactos como evidencia de la entrega original EN_REVISION; no son una comprobación del cierre D-17 ni están diseñados para su estado posterior. No se configura infraestructura ni se inicia Fase 4 por registrar su autorización. SHA local/remoto comparado tras push antes de confirmar entrega.


## Fase 4 — persistencia, 2026-10-31

Base `1fe5859`; [modelo/criterios CA4](BASE_DATOS.md), [diccionario](DICCIONARIO_DATOS.md). Herramientas: Python 3 estándar, Docker 28.4.0; PostgreSQL 17.11 por digest fijo; Supabase CLI 2.122.0 solo para generar archivo de migración después de consultar versión/ayuda. Changelog y guías vigentes consultados; fuentes en [evidencias](evidencias/fase4/fuentes.txt).

- `python3 tests/datos/verificar.py`: **46 comprobaciones APROBADAS**; [salida íntegra](evidencias/fase4/resultados.txt). Contenedor único sin red/puertos con seed ficticio; elimina exclusivamente sus propios recursos al finalizar.
- Migración transaccional y ledger local con SHA-256, segunda aplicación sin duplicados; integridad RUT/ID/serie/código incluso inactivos, motivo sin serie, FK, unidades activas, versiones y custodia. Dos transacciones simultáneas de asignación confirman exactamente una; baja y asignación concurrentes nunca dejan inactivo con bienes. No es ensayo de 10 usuarios/carga objetivo.
- Custodia de bien malo se conserva y permite devolución; bajas con custodia se rechazan. Traslado cierra/abre en igual instante. Cambio de unidad conserva custodio y la instantánea previa. UPDATE/DELETE/TRUNCATE de evidencia se rechazan; anotación correctiva no se borra. Rango UTC comprueba extremos inclusivo/exclusivo.
- Rollback conjunto de cambio empresarial/comando/auditoría/outbox no deja evidencia; commit conserva resultado único y aviso lógico único. Destinatario no se redirige por UPDATE. La prueba de unicidad de comando no acredita un endpoint de replay/huella HTTP todavía inexistente.
- Trece tablas con RLS, ninguna función SECURITY DEFINER, rol sintético sin acceso al esquema e índices en todas las FK. Consultas clave ejecutadas. No se implementan políticas permisivas ni permisos de aplicación en esta fase.
- `pg_dump -Fc`/`pg_restore --exit-on-error` en otra base vacía del contenedor: **APROBADO**, contenido idéntico en 13 tablas de negocio + ledger de pruebas, secuencia de movimientos y trigger de inmutabilidad restaurado. Sin ACL/propietario productivos (`--no-owner --no-acl`), Auth, configuración de Supabase u objetos externos. No es prueba de recuperación integral de proveedor, RPO/RTO o conservación operativa.
- `python3 docs/evidencias/fase4/verificar_documentos.py`: cobertura de diccionario/CA4, enlaces, estados, comparación byte a byte de archivos ajenos al alcance y filas 5–15; [resultado](evidencias/fase4/documentos.txt). `git diff --check`: APROBADO.

Incidencias de preparación corregidas: la primera espera detectó el PostgreSQL temporal de init y la conexión posterior falló; se cambió a readiness TCP local del servidor definitivo. La ruta antigua de custom-schemas devolvió 404 y se consultó la ruta actual `api/using-custom-schemas`. No se declaran esos intentos como verificaciones aprobadas.

**NO EJECUTADAS:** Supabase remoto, advisors/CLI sobre proyecto local Supabase completo, Auth/sesiones/MFA, RLS con rol/cuenta reales, API/transacciones de aplicación, correo/worker/reintentos, Excel/PDF, rendimiento objetivo, UI nueva y continuidad productiva. UI no repetida porque prototipo/tests/capturas se conservan intactos. CA4-06 pendiente de aceptación; Fase 5 no iniciada y sin despliegue. F1-SEG-01/02/03 y objetivos semanales intactos.


## Cierre aprobado de Fase 4 — 2026-10-31

D-19 acepta entrega `65609df`, cumple CA4-06 y cierra Fase 4. Fase 5 autorizada para nuevo chat, sin ejecución aquí. Verificación puntual reproducida con Python: enlaces Markdown locales existentes, encabezados/filas de estado y CA4-06 consistentes; filas 6–15 idénticas y todos los archivos ajenos a los ocho documentos de cierre preservados byte a byte respecto de `65609df`. `git diff --check` aprobado. Revisión de diferencias para separar aceptación y continuidad de implementación u operación.

No se repiten pruebas PostgreSQL/UI ni se implementan sesiones/Auth o nuevas migraciones por tratarse solo de documentación. Los verificadores/resultados originales de Fase 4 permanecen intactos y evalúan su entrega EN_REVISION; no se presentan como comprobación de este cierre posterior. Los 46 controles locales y límites de restauración se conservan. Sin proyecto remoto, correo real, producción, gastos o despliegues; F1-SEG-01/02/03 siguen abiertos. Commit/push y SHA remoto comprobados antes de confirmar entrega.

## Fase 5 — autenticación, 2026-10-31

Entrega EN_REVISION bajo D-19/D-20. [Alcance y criterios](AUTENTICACION.md). No iniciar Fase 6 ni desplegar.

- `npm run build`: compilación TypeScript correcta; [salida](evidencias/fase5/build.txt).
- `npm test`: 18 pruebas aprobadas, 0 fallos; [salida exacta](evidencias/fase5/resultados.txt). Dieciséis subpruebas y su contenedor de suite usan PostgreSQL 17.11 real con ambas migraciones y un doble de identidad; reloj controlado, cookie/Origin/CSRF, 30 min/8 h, polling/actividad, versiones/estado, MFA parcial/rotación, invitación/recuperación, consumo concurrente, generación/fallo externo, cifrado, entrega de correo con doble que falla y RLS cerrado.
- La prueba adicional de proveedor usa GoTrue 2.197.0 real local fijado por digest y DB efímera separada: generateLink/verifyOtp invitación de un uso, contraseña, login/getUser, enrolamiento y TOTP calculado real, AAL2, rechazo de código erróneo, recuperación de contraseña con MFA conservado, rechazo de contraseña antigua y cierre. Gateway HTTP mínimo solo de prueba en loopback adapta `/auth/v1`; no Kong/proyecto gestionado ni envío de correo. Puertos efímeros locales; recursos sintéticos eliminados en finally. Red Docker propia sin tráfico empresarial.
- `python3 tests/auth/regresion_fase4.py`: ejecuta la suite histórica íntegra con su migración original en copia temporal, 46 comprobaciones de integridad/concurrencia/restauración. [Salida](evidencias/fase5/regresion-datos.txt). La composición de ambas migraciones actuales se prueba en auth.test.ts; esta regresión no afirma restauración de Auth/secretos/ACL operativos.
- `npm audit`: 0 vulnerabilidades conocidas en dependencias de producción y desarrollo al momento de consulta; [JSON](evidencias/fase5/audit.json). No es garantía de ausencia de vulnerabilidades.
- `python3 docs/evidencias/fase5/verificar.py`: enlaces/estados, versiones exactas/lockfile, preservación literal de instrucciones/prototipo/datos/migración/pruebas/evidencias anteriores y filas 6–15; [salida](evidencias/fase5/documentos.txt). `git diff --check` correcto.

Durante preparación: primera red Docker `--internal` no publicó el puerto necesario; la red dedicada de prueba publica únicamente loopback. GoTrue necesitó esquema auth y search_path de su rol en la DB de prueba. El cambio ordinario de contraseña rechazó con 401 la recuperación de cuenta con MFA: se corrigió usando actualización administrativa limitada a contraseña, únicamente después de verifyOtp y comprobación de identidad, sin cambiar factores. La prueba final comprueba que el factor verificado subsiste y el login nuevo es AAL1. Algunos intentos escribieron simultáneamente una salida temporal; la evidencia final fue regenerada sin escritores concurrentes. No se presentan esos intentos como aprobados.

La ejecución directa del verificador histórico con ambas migraciones falló por su aserción fija de una sola migración (recibió 2, correctamente). No se alteró para forzar su aprobación: el nuevo runner conserva la suite/migración originales en una copia temporal; las pruebas de autenticación aplican ambas migraciones. Sin regresión de UI/navegador por no cambiar prototipo; no E2E de pantallas de login/MFA, entrega real, integración gestionada, privilegios SQL definitivos, advisors remotos, privacidad/legal, carga operativa ni despliegue. Pendientes de aceptación explícitos en AUTENTICACION; no afirmar cierre completo de Fase 5.


## Cierre documental de Fase 5 — D-21, 2026-10-31

Usuario acepta entrega `6ab7229f2a89ca08fbd2f274377aa146386bc165` y autoriza Fase 6 únicamente en un nuevo chat. CA5-06 cumplido, Fase 5 COMPLETADA; Fase 6 ejecución PENDIENTE y fases 7–15 sin autorización. Este registro no amplía los resultados de 18 pruebas de autenticación/46 comprobaciones históricas ni acredita los pendientes operativos.

Verificación: git inicialmente limpio; fetch y avance directo sin novedades; revisión de los ocho Markdown modificados, enlaces locales, estados/aceptación y preservación literal de filas 7–15 y todos los archivos restantes frente a la entrega aceptada; git diff --check. No pruebas funcionales/UI/PostgreSQL/GoTrue repetidas: solo cambia documentación. No alterar el verificador histórico de Fase 5 que espera su estado original. Sin implementación de Fase 6, cambios de permisos, servicios remotos, correos o despliegue. Commit/push normales y comprobación SHA local/remoto antes de confirmar.

## Fase 6 — autorización, privacidad y seguridad (2026-10-31)

Base `9845b10`, entorno sintético aislado. Entrega EN_REVISION bajo D-21; [SEGURIDAD](SEGURIDAD.md) recoge CA6-01 a CA6-06 y límites. No se reescribe evidencia histórica.

| Verificación | Comando y resultado |
|---|---|
| Build | `npm run build`: correcto; evidencias/fase6/build.txt |
| Auth + seguridad | `npm test`: **34 pruebas, 34 correctas, 0 fallidas**, incluyendo contenedores padre; evidencias/fase6/resultados.txt |
| Dependencias | `npm audit --json`: 0 vulnerabilidades; evidencias/fase6/audit.json |
| Documentación/alcance | `python3 docs/evidencias/fase6/verificar.py`: evidencias/fase6/documentos.txt; filas 7–15, archivos históricos y enlaces |
| Diferencias | `git diff --check`: correcto |

Las 15 pruebas nuevas de seguridad usan PostgreSQL 17 real fijado por digest, tres migraciones compuestas y conexiones diferenciadas como inventario_auth/inventario_runtime. Identidad del proveedor DOBLE en estas pruebas; la regresión del adaptador usa GoTrue real local por separado. Comprueban matriz, privilegios, contexto falso/ausente, inventario compartido, auditoría/admin denegadas al lector, MFA, CSRF obligatorio, inmutabilidad, escritura genérica cerrada, pool tras commit/rollback, versión/estado/credencial/revocación/expiración, revocación concurrente, errores de proveedor, anon/authenticated, proyección sin PII, CSP/XSS/Origin/inyección y cuerpo excesivo. Las 16 pruebas previas de Auth y el escenario GoTrue también pasaron; dos contenedores padre completan el total del runner.

Incidencias de preparación resueltas: primera ejecución se bloqueó porque FOR UPDATE en cuenta era incompatible con KEY SHARE de su FK desde la bitácora en otro pool; se detuvo únicamente el contenedor sintético, se cambió a FOR NO KEY UPDATE y se añadió prueba concurrente y timeout en el nuevo harness. Segundo intento detectó un defecto del propio test anon/authenticated: `pool.query` descartaba la conexión tras un error y el siguiente intento volvía a postgres; ahora usa cliente fijado hasta RESET ROLE. Resultado final completo arriba; no se cuentan esos intentos como éxitos.

No ejecutadas: proyecto Supabase gestionado/advisors remotos, aprovisionamiento SQL real, pruebas por ID de endpoints empresariales aún inexistentes, exportaciones reales, panel/último administrador, UI completa, hardware/navegadores, carga/pentest integral ni respaldo operativo. Regresión histórica de datos/UI no repetida al conservar migraciones y código originales; las tres migraciones sí se aplican juntas en las suites actuales. No se atribuyen datos/entrega externos ni cumplimiento legal; F1-SEG-01/02/03 siguen abiertos. No Fase 7 ni despliegue.


## Cierre aprobado de Fase 6 — D-23, 2026-10-31

Evidencia del usuario: «Aprobado fase 6. Inicia fase 7 en nuevo chat». CA6-06 cumplido y Fase 6 COMPLETADA. Se conserva la entrega `336232a9b1add5c6605f396a90795e419022756c` y las 34 pruebas locales con sus límites. Este cierre solo cambia documentación; no se repiten pruebas funcionales ni se modifican verificadores/resultados históricos.

Revisión ejecutada: git inicial limpio, fetch/avance directo sin novedades; git diff --check; enlaces locales de documentos cambiados; coherencia de estados/CA6-06/D-23; filas de fases 8–15 y contenido de todos los archivos ajenos a los ocho documentos de cierre comparados contra `336232a9b1add5c6605f396a90795e419022756c`. Fase 7 autorizada pero no iniciada aquí; sin Fase 8 ni despliegue. Sincronización a main con comprobación de SHA remoto al finalizar.

## Fase 7 — backend y API, 2026-10-31

Base aceptada `0fead7b`; entorno local sintético, PostgreSQL 17 fijado por digest y roles operativos separados. `npm ci` y `npm run build`: correctos. `npm test`: **49 pruebas, 49 pasan, 0 fallos/omitidas**; incluye 14 casos nuevos de composición HTTP/Auth/Authorization/RLS/SQL más su contenedor, regresión de autenticación/seguridad y GoTrue local. La suite empresarial usa proveedor de identidad doble explícito; la prueba separada de GoTrue no acredita Supabase gestionado.

Probado: denegaciones por sesión/rol/CSRF/Origin; JSON/campos/fechas inválidos; alta y edición con auditoría/outbox/comando; clave repetida y payload distinto; respuesta perdida simulada mediante replay tras commit; versión ausente/obsoleta; dos conexiones SQL reales compitiendo por la misma versión; rollback por configuración ausente y por fallo inyectado al insertar outbox, sin evidencia parcial, con reintento posterior válido; paginación y cursor ligado a filtros, UTC inclusivo, inyección literal, ETag/404, proyección positiva de funcionarios, DML directo denegado y revocación vigente.

Evidencia: [resultados](evidencias/fase7/resultados.txt), [build](evidencias/fase7/build.txt), [audit](evidencias/fase7/audit.json), [regresión histórica de datos](evidencias/fase7/regresion-datos.txt), [revisión documental](evidencias/fase7/documentos.txt) y [fuentes](evidencias/fase7/fuentes.txt). `npm audit --omit=dev`: cero vulnerabilidades informadas en dependencias de producción; no equivale a una auditoría integral.

No ejecutado: Supabase remoto, credenciales reales, correo externo, UI integrada, dispositivos, carga productiva, operación/respaldos reales ni despliegue. No se invocan advisors remotos: no hay proyecto gestionado conectado; se verifican grants/RLS/función privada mediante PostgreSQL local real. El CLI creó solamente el archivo de migración; sin enlazar ni modificar proyectos remotos. Los primeros ensayos detectaron ambigüedad SQL y un lock que exigía UPDATE; ambos corregidos antes de la corrida final conservada. El flujo SQL no abre DML directo al runtime.

CA7-01 a CA7-05 verificados con el alcance limitado de [BACKEND_API](BACKEND_API.md). CA7-06 pendiente de aceptación expresa; Fase 7 EN_REVISION. Fase 8 no iniciada.


## Cierre documental de Fase 7 — 2026-11-01

D-25 cumple CA7-06 por aceptación expresa de la entrega `6035e125617a2c8d6e366df49940b8d720f8d535`. Se conserva evidencia de 49 pruebas de aplicación y 46 comprobaciones históricas; no se repiten tests de aplicación en este cierre sin cambios de código. Revisión de estados, enlaces locales, preservación de código/evidencia y filas 9–15; `git diff --check` y SHA remoto comprobados al sincronizar. No se implementa ni verifica Fase 8 aquí. Los estados anteriores EN_REVISION y Fase 8 no autorizada son antecedentes actualizados por D-25.

## Fase 8 — 2026-11-01

Entrega EN_REVISION, base `1297549`. Evidencia nueva en `docs/evidencias/fase8/`; no se sobrescribe evidencia histórica.

- `npm run build`: TypeScript servidor/UI/pruebas y build Vite aprobados ([salida](evidencias/fase8/build.txt)).
- `npm test`: 49 pruebas aprobadas de Auth/proveedor/seguridad/API, sin fallos ([salida](evidencias/fase8/regresion.txt)).
- `npm run test:ui`: 9 pruebas aprobadas, sin fallos ([salida](evidencias/fase8/ui.txt)): lector/sesión/privilegios, MFA/alta/edición persistidas, pérdida de respuesta y replay exacto sin auditoría duplicada, conflicto 412 concurrente, filtros/vacío/XSS, paginación real y reinicio de cursor, responsive/teclado y 503/401 por revocación. El conteo incluye el contenedor de ocho subpruebas.
- `npm audit --json`: cero vulnerabilidades conocidas reportadas ([salida](evidencias/fase8/audit.json)). Se retiró la dependencia estática que incorporaba tres avisos moderados; se registran solo archivos públicos compilados explícitos.
- `python3 docs/evidencias/fase8/verificar.py` y `git diff --check`: continuidad, enlaces y preservación ([salida](evidencias/fase8/documentos.txt)).

Ensayo aislado con Docker/PostgreSQL 17, migraciones aceptadas, credenciales aleatorias temporales, roles SQL efectivos y Chromium. Auth externo es doble: no acredita Supabase gestionado, TOTP real, correo o enlaces enviados. Las llamadas de negocio recorren BFF/RLS/PostgreSQL reales; solo se interceptan la pérdida de respuesta después del commit y un fallo 503 declarado. Localhost HTTP en pruebas aprovecha la excepción Secure del navegador, sin modificar cookie ni rebajar la validación HTTPS de main. No es validación de TLS operativo.

Revisión visual y comprobación de ancho a 1440×900, 820×1180 y 390×844; [computador](evidencias/fase8/computador.png), [iPad](evidencias/fase8/ipad.png), [iPhone](evidencias/fase8/iphone.png). Tabla con desplazamiento horizontal propio y foco visible. Emulación Chromium; no hardware iPad/iPhone, Safari, lector de pantalla ni certificación WCAG completa. No pruebas de carga, producción, correo externo, respaldo operativo ni nuevos módulos. F1-SEG-01/02/03 permanecen abiertos; sin Fase 9 ni despliegue.


## Cierre documental de Fase 8 — 2026-11-01

D-27 acepta `570e90d10819999e96e17a4f88dfd30c8e1f5224` y cumple CA8-06. Solo cambios documentales: comprobación de estados/criterios, enlaces, preservación de código/migraciones/evidencias y `git diff --check`. Las 49 pruebas de regresión y 9 de UI conservan su alcance histórico; no se repiten pruebas de aplicación por este cierre sin cambios de código. No acredita integración gestionada ni operación productiva. Fase 9 autorizada para otro chat, no ejecutada aquí.

## Fase 9 — panel administrativo, 2026-11-01

Entrega EN_REVISION, D-27/D-28; CA9-06 pendiente. Alcance/criterios en [ADMINISTRACION](ADMINISTRACION.md). Base `3dc4df2`, árbol inicialmente limpio, main recuperado por avance directo. Solo ensayos locales sintéticos; ninguna migración remota ni despliegue.

| Verificación ejecutada | Resultado / evidencia |
|---|---|
| `npm ci` y `npm run build` | Instalación reproducible con lockfile existente y compilación TS/React/Vite correctas; [build](evidencias/fase9/build.txt). Aviso Vite de directorio de salida externo al root de apps/web, sin fallo de build. |
| `npm test` | **61/61** (incluye regresión de 49 y 12 de administración contando el contenedor de pruebas); [regresión](evidencias/fase9/regresion.txt). PostgreSQL/roles/RLS reales y sintéticos; adaptador GoTrue local, sin servicio gestionado. |
| `npx tsx --test tests/api/admin.test.ts` | **12/12**; [administración](evidencias/fase9/admin.txt). Permisos, MFA, CSRF/Origin, tipos/confirmación, configuración anterior/nueva, alta pendiente, replay/conflicto, unicidad, propia cuenta, versiones, credencial, invitación 24 h/recuperación administrativa 30 min, revocación, rollback ante fallo de auditoría, DML denegado y dos administradores SQL concurrentes. |
| `npx tsx --test tests/ui/admin.test.ts` | **11/11**, contando contenedor; [navegador](evidencias/fase9/ui.txt). Regresión frontend y panel real navegador→HTTP→PostgreSQL, alta cuenta/unidad, cambio destinatario, respuesta perdida y reintento con misma clave sin duplicar auditoría, navegación bloqueada mientras incierto, responsive y teclado. |
| `npm audit --json` | **0 vulnerabilidades**; [auditoría](evidencias/fase9/audit.json). |
| `python docs/evidencias/fase9/verificar.py` y `git diff --check` | Estados, filas 10–15, preservación literal de migraciones/prototipo/evidencias aceptadas y enlaces; [documentos](evidencias/fase9/documentos.txt). |
| CLI `supabase db advisors --local`, `migration list --local` | **NO VERIFICADO**: no existe stack Supabase en 127.0.0.1:54322; [advisors](evidencias/fase9/advisors.txt), [lista](evidencias/fase9/migraciones-local.txt). Los ensayos aplican todas las migraciones a PostgreSQL efímero en puerto aleatorio y sí verifican sus operaciones. No se inicia otro stack ni se confunde esto con verificación gestionada. |

Capturas nuevas: [computador](evidencias/fase9/computador.png), [iPad](evidencias/fase9/ipad.png), [iPhone](evidencias/fase9/iphone.png); las capturas `regresion-*` pertenecen a la parte de inventario del mismo ensayo. Emulación Chromium, no hardware físico ni Safari; revisión visual de captura móvil realizada. Prototipo y evidencia histórica conservados.

Durante preparación se corrigieron ambigüedad SQL de parámetro/columna, grant explícito de función canónica y desbordamiento del contenedor de tabla. Los primeros ensayos fallidos no se declaran éxitos. Se sincronizó el ensayo nuevo con el fin real de MFA y con carga de pestañas; la comprobación de ficha usa referencia explícita para no depender del orden aleatorio UUID de la primera página. El listener temporal de diagnóstico se retiró para evitar leer respuestas tras cerrar navegador. Las pruebas finales anteriores corresponden al código corregido; no se alteraron pruebas/evidencias históricas.

No ejecutado/acreditado: Supabase gestionado/advisors remotos, identidad/correo externos, dispositivos físicos, lector de pantalla o WCAG completa, carga/pentest integral, restauración productiva o continuidad operativa. Las 46 comprobaciones históricas de datos no se repitieron en esta fase ni se atribuyen como nuevas. F1-SEG-01/02/03 abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Fase 10 no iniciada, sin envío del outbox ni despliegue.


## Cierre aprobado de Fase 9 — 2026-11-01

D-29 acepta la entrega `fff63ac3f8afd6c471ef1649dd83ab5332d0f36c`: CA9-06 CUMPLIDO y Fase 9 COMPLETADA; Fase 10 autorizada únicamente para iniciar en un nuevo chat, ejecución PENDIENTE. No se alteran los resultados ni los límites originales de 61 pruebas de regresión, 11 de navegador y auditoría sin vulnerabilidades. Supabase gestionado/advisors locales, correo externo y operación productiva continúan sin acreditarse.

Verificación del cierre: árbol inicial limpio y main al día, revisión de diferencias, enlaces locales, estados/CA9-06, filas 11–15 intactas y preservación literal de todos los archivos fuera de los nueve documentos de cierre respecto a `fff63ac`. `git diff --check`. No se repiten pruebas funcionales por cambios exclusivamente documentales ni se modifica el verificador histórico de Fase 9, ligado al estado original EN_REVISION. Commit/push normales y comparación de SHA remoto antes de confirmar la entrega; sin Fase 10 implementada ni despliegue.

## Fase 10 — procesos empresariales (2026-11-02)

Ejecución D-29/D-30. Fase EN_REVISION, aceptación CA10-06 pendiente. Plan/contrato/archivos en [PROCESOS_EMPRESARIALES](PROCESOS_EMPRESARIALES.md). Ensayos sintéticos PostgreSQL 17 real con identidad doble, pools SQL separados y RLS, sin cuentas/datos reales ni despliegue.

- `npm ci` y `npm run build`: correctos; [build](evidencias/fase10/build.txt).
- `npm test`: 70 pruebas pasadas, 0 fallidas/omitidas, incluidos contenedores de prueba; [regresión](evidencias/fase10/regresion.txt). La suite cuenta contenedores y subpruebas.
- `npx tsx --test tests/api/processes.test.ts`: 9 pruebas pasadas (contenedor y 8 subpruebas); [procesos](evidencias/fase10/procesos.txt). RUT válido/inválido, ID canónico/duplicado/inactivo, edición, separación de cuentas, permisos/MFA/Origin/CSRF/proyección, asignación/traslado/devolución/condición/estados, pertenencias sin traslados ficticios y conservación de instantáneas. Comprueba intervalos contiguos, replay sin evidencia duplicada, versión obsoleta, doble asignación, anotación/compensación inmutable, paginación de más de 100 anotaciones, denegación de DML directo, rollback de estado/historia/comando/auditoría/outbox y carrera asignación/baja con conexiones SQL independientes sin locks de Auth.
- `npm run test:ui`: 24 pruebas pasadas, 0 fallidas/omitidas, regresión de navegador de Fases 8/9/10; [resultado](evidencias/fase10/regresion-ui.txt). `npx tsx --test tests/ui/processes.test.ts`: 4 pruebas pasadas tras el ajuste final de navegación/claves React; verifica bloqueo de hash, ausencia de formulario residual y replay exacto; [resultado específico](evidencias/fase10/ui.txt). Alta real de funcionario, cancelación, custodia, pérdida de respuesta tras commit y replay exacto, historia/devolución/anotación, teclado y anchos 1440/820/390. [Computador](evidencias/fase10/computador.png), [iPad](evidencias/fase10/ipad.png), [iPhone](evidencias/fase10/iphone.png). Emulación Chromium/localhost, no dispositivos físicos/TLS productivo.
- `npm audit --omit=dev --json`: 0 vulnerabilidades; [auditoría](evidencias/fase10/audit.json). No se afirma auditoría completa de dependencias de desarrollo.
- Supabase `db advisors --local` y `migration list --local`: NO EJECUTABLES contra stack Supabase ausente en 54322, error conservado en [advisors](evidencias/fase10/advisors.txt) y [lista local](evidencias/fase10/migraciones-local.txt). Esto no impidió aplicar todas las migraciones a bases PostgreSQL efímeras de los ensayos; no se presenta revisión gestionada como superada. [Fuentes y hashes](evidencias/fase10/fuentes.txt).

Los primeros ensayos identificaron fallos de implementación/preparación, desbordamiento en iPad y pérdida del comando ante navegación por hash; corregidos y repetidos. Los registros enlazados muestran los resultados finales, sin reescribir evidencia histórica de fases aceptadas. No se verificaron proveedor gestionado/Auth externo, correo real, Safari, hardware físico, WCAG completa, carga objetivo ni continuidad operativa. F1-SEG-01/02/03 siguen abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Fases 11–15 no iniciadas ni autorizadas.


## Cierre documental de Fase 10 — 2026-11-02

D-31 acepta la entrega `888f8a2dda2a851db291209299c24eb7eb6be381` y cumple CA10-06. Se conservan literalmente código, migraciones, tests y evidencia funcional anterior. Verificaciones de este cierre: diferencias y enlaces locales de documentos cambiados, estados de Fase 10 COMPLETADA y Fase 11 PENDIENTE/autorizada para un nuevo chat, fases 12–15 sin autorización, preservación del resto del árbol y `git diff --check`. No se repiten pruebas funcionales porque solo cambia documentación. No se modifica evidencia histórica para adaptarla al nuevo estado ni se implementa Fase 11. F1-SEG-01/02/03 y límites operativos permanecen abiertos; sin despliegue.


## Fase 11 — 2026-11-02 · entrega EN_REVISION

Entorno: Node 24.19.0, Docker 28.4.0, PostgreSQL 17 fijado por digest existente, Chromium local; bases efímeras y proveedor de identidad doble. Solo datos sintéticos; loopback HTTP en navegador (excepción Secure de Chromium), no TLS/servicio externo real. Consola sin errores en recorridos de Fase 11. Alcance y CA11 en [REPORTES](REPORTES.md).

| Verificación | Resultado / evidencia |
|---|---|
| `npm run build` | Correcto; TypeScript servidor/UI y Vite; [build](evidencias/fase11/build.txt) |
| `npm test` | 85/85, cero omitidas/fallidas; [regresión API/seguridad](evidencias/fase11/regresion.txt) |
| `npm run test:ui` | 32/32, cero omitidas/fallidas; [regresión navegador](evidencias/fase11/regresion-ui.txt) |
| `npx tsx --test tests/ui/reports.test.ts` | Revalidación final 8/8 tras ancho de tabla/capturas; [UI](evidencias/fase11/ui.txt) |
| `npm audit --json` | Cero vulnerabilidades; [audit](evidencias/fase11/audit.json) |
| Migraciones | Cadena completa aplicada en cada PostgreSQL sintético, incluidas bases sin roles anon/authenticated. Archivo nuevo creado mediante CLI 2.122.0; advisors/listado local sin stack 54322, [diagnóstico](evidencias/fase11/advisors.txt), no verificación gestionada superada |
| Revisión documental y diff | Estados vigentes, alcance, enlaces/archivos y ausencia de inicio de fases 12–15; [revisión](evidencias/fase11/documentos.txt) |

Se verifican métricas frente a consultas de fuente; columnas/orden/conteos/subtotales de cinco reportes y buscador; unidad actual frente a unidades históricas renombradas; fechas UTC de comienzo/final/día siguiente, adquisición nula y rangos inválidos. XLSX completo contrastado celda a celda con pantalla/API por ZIP/XML/Python, sin nodos fórmula; PDF extraído con pdftotext, texto extenso continuado, URLs/HTML sin ejecución. Vacío con metadatos/cabeceras; 10.000 filas XLSX y 2.000 PDF admitidas y excesos/suma del buscador rechazados, sin truncamiento. Muestra PDF inspeccionada visualmente: [archivo sintético](evidencias/fase11/inventario-muestra.pdf).

Permisos/seguridad: sesión/MFA/Origin/CSRF, auditoría administrativa, datos personales excluidos, propietario ajeno 404, RLS sin contexto, anon/authenticated sin permisos; replay concurrente durable/payload distinto, instantánea frente a cambios durante generación, fallo saneado/recuperación de arrendamiento, TTL y limpieza técnica, revocación durante render sin guardar archivo y revocación administrativa después de generar. Outbox continúa pendiente: ningún aviso enviado.

UI real: resumen, filtros/búsqueda, paginación y exportación completa, estados vacío/error, respuesta perdida después de commit y reintento sin duplicación, recuperación propia tras recarga, ambos formatos, auditoría con MFA y expiración al revocar. Teclado en tablas desplazables y emulación [computador](evidencias/fase11/computador.png), [iPad](evidencias/fase11/ipad.png), [iPhone](evidencias/fase11/iphone.png). Se conservaron imágenes/evidencias históricas aceptadas de otras fases.

Fallos iniciales resueltos: migración no asumirá roles Data API en PostgreSQL puro; etiqueta accesible del selector de reporte; expectativas correctas de sesión parcial rotada/cierre de acceso; selectores de regresión no confunden código del formulario con buscador y no presumen qué registro cae en página 1; al cambiar pestaña administrativa se ocultan filas anteriores mientras carga. Se ejecutó de nuevo la verificación afectada hasta pasar; los logs enlazados son del resultado final.

Medición local, muestra sintética simple: XLSX 10.000 filas 1.086 ms, PDF 2.000 filas 613 ms, desde solicitud a descarga/inspección en loopback. No acredita rendimiento bajo carga, red externa ni objetivo ≤60 s en infraestructura objetivo; sin muestra completa CA-N07. Changelog Supabase/documentación RLS y paquetes/licencias consultados: [fuentes](evidencias/fase11/fuentes.txt).

No ejecutado/acreditado: Supabase gestionado/identidad/MFA externos, advisors operativos sin stack, hardware/Safari, lector de pantalla/conformidad WCAG completa, apertura física en Excel/Acrobat, carga/continuidad productiva. F1-SEG-01/02/03 abiertos; UTC/copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días conservados. Fase 11 EN_REVISION; CA11-06 pendiente de aceptación propia. Sin Fase 12 ni despliegue.


## Cierre aprobado de Fase 11 — 2026-11-02

D-33: «Apruebo fase 11, inicia en nuevo chat fase 12». Entrega aceptada `c94a366be22e6eae917711c52e695ea842c27187`; Fase 11 COMPLETADA y CA11-06 cumplido. Se conservan los resultados originales 85/85 API/seguridad, 32/32 navegador y 8/8 revalidadas; evidencias y límites gestionados/hardware/carga/operación sin cambios. La aprobación no convierte pruebas locales en integración productiva acreditada.

Esta tarea modifica solo documentación: revisión de estados/criterio D-33/continuidad, enlaces locales y `git diff --check`, con comprobación de que no cambian código, migraciones, dependencias, tests ni evidencias aceptadas. No se reejecutan build ni suites de aplicación por este cierre documental. GitHub mediante commit/push normales y comparación de SHA remoto antes de confirmar.

Fase 12 autorizada para un nuevo chat, ejecución PENDIENTE. No se crean workers/plantillas/envíos aquí, ni se inicia Fase 13 o despliega. Los estados EN_REVISION anteriores son antecedentes históricos.
