# Frontend funcional — Fase 8

2026-11-01 · COMPLETADA por aceptación expresa D-27. Base de ejecución `1297549`; entrega aceptada `570e90d10819999e96e17a4f88dfd30c8e1f5224`. Fase 9 autorizada para un nuevo chat; ejecución pendiente.

## Plan y entrega

Codex implementa y verifica; el usuario revisa/acepta. Dependencias: diseño D-15, ADR-001/003, autenticación D-21, seguridad D-23 y API D-25. Plan presentado: React/Vite/TypeScript, navegación bajo el mismo origen que BFF, acceso/sesión/MFA, consultas/fichas/filtros/paginación y alta/edición de atributos; verificación UI/API sintética, documentación y GitHub. Riesgos: integración gestionada aún pendiente y superficie API parcial. No se instala Spec Kit.

Código: `apps/web` (componentes, cliente HTTP y estilos); `apps/server/web.ts` (lista explícita de archivos públicos compilados), composición en app/main; pruebas en `tests/ui/frontend.test.ts`. Versiones exactas y lockfile actualizado. Se preserva el prototipo y la evidencia histórica.

- Acceso, cierre, recuperación genérica, enrolamiento manual TOTP y verificación MFA. `/acceso` conserva la recepción segura de enlaces existente de Fase 5. Secretos MFA solo transitorios en memoria durante enrolamiento; se eliminan al verificar/salir.
- Sesión opaca HttpOnly/Secure/SameSite Strict, CSRF solo en memoria, sin SDK de identidad, credenciales de infraestructura ni tokens de proveedor en navegador/localStorage. La expiración local oculta el inventario; el servidor verifica siempre sesión/rol/MFA vigentes. Renovación por actividad explícita «Continuar sesión», sin keepalive automático.
- Bienes, funcionarios, unidades y movimientos: listas y fichas con proyección real de la API. Búsqueda por código o nombre según recurso; filtros admitidos, fechas inclusivas UTC y paginación por cursor (25 registros). No se inventan totales o agregados. Movimientos se filtra separadamente por referencia de bien.
- Alta administrativa y edición completa de atributos. PATCH nunca manda condición/situación/custodia; incluye los opcionales actuales o null explícito, motivo y ETag leído. Formularios conservan los datos ante rechazo. Lectura no ofrece escrituras y el servidor mantiene su control independiente.
- Errores de validación, permiso, expiración, conflicto y dependencia con requestId. 412/428 requieren recargar/revisar la ficha, sin sobreescribir automáticamente. Cada comando obtiene UUID; respuesta perdida/5xx conserva payload, versión y clave en memoria. El reintento es explícito y exacto, incluso tras navegación interna. Bloquea otras escrituras mientras exista resultado incierto; al abandonar/recargar el navegador advierte de pérdida de esa operación. Tras cerrar sesión debe conciliarse con el responsable antes de crear un alta nueva; no hay almacenamiento persistente de comandos en el navegador.
- Estados de carga, vacío, error, éxito y permiso; respuestas obsoletas ignoradas. Paleta, tipografía, navegación y tablas del diseño aceptado; formularios con etiquetas, foco, mensajes accesibles, enlace de salto y tablas desplazables.

## Verificación y aceptación

| Criterio | Evidencia / estado |
|---|---|
| CA8-01 | React/Vite/TypeScript compilado, assets/API mismo origen; diseño derivado de D-15 |
| CA8-02 | Acceso/MFA/salida, sesión y permisos verificados con identidad doble; no proveedor gestionado |
| CA8-03 | Consultas, fichas, filtros, vacío y paginación real contra PostgreSQL |
| CA8-04 | Alta/edición persistidas, 412 concurrente, respuesta perdida/replay sin duplicar auditoría |
| CA8-05 | Navegador Chromium, responsive y teclado; regresión y auditoría en PRUEBAS |
| CA8-06 | CUMPLIDO por aceptación expresa D-27 el 2026-11-01 |

Comandos reproducibles: `npm ci`, `npm run build`, `npm test`, `npm run test:ui`. UI requiere Docker local y Chromium (`CHROMIUM_PATH` opcional); prepara PostgreSQL efímero sintético, aplica migraciones existentes y lo retira al terminar. Usa loopback HTTP/localhost (excepción Secure de Chromium) y proveedor doble exclusivamente en el ensayo; no acredita TLS, TOTP externo, correo real ni Supabase gestionado. Las rutas y servicios empresariales son reales, no interceptados, salvo el ensayo explícito de error 503 y pérdida de respuesta.

`npm start` sirve la UI compilada y API bajo un origen con configuración segura de `.env.example`; conserva las exigencias HTTPS y roles SQL existentes. No ejecutar contra producción ni asumir que los logins están aprovisionados. `npm run dev:web` solo es desarrollo visual Vite, sin proxy ni API integrada; para recorrido funcional usar BFF compilado o el ensayo aislado. No se ha desplegado.

Capturas emuladas: [computador](evidencias/fase8/computador.png), [iPad](evidencias/fase8/ipad.png), [iPhone](evidencias/fase8/iphone.png). No equivalen a hardware real, Safari o conformidad WCAG 2.2 AA completa. Recuperación de correo gestionado y enlace real, carga objetivo, lector de pantalla, retención legal y continuidad operativa no verificados.

Fuera de alcance: administración de cuentas/permisos/catálogos (9), comandos de custodia/transiciones (10), indicadores/buscador global/reportes/exportación (11), procesamiento/envío outbox (12). No se habilitan botones que simulen esos servicios. F1-SEG-01 (retención legal), F1-SEG-02 (presupuesto) y F1-SEG-03 (operación del respaldo) siguen abiertos; UTC, copia semanal/máximo 168 h/RPO 168 h/RTO 8 h/copias 30 días intactos. Sin cuentas/datos reales, permisos remotos, gastos o despliegues. Fase 9 AUTORIZADA por D-27 para un nuevo chat, ejecución PENDIENTE.


## Cierre aprobado — 2026-11-01

D-27 acepta la entrega `570e90d10819999e96e17a4f88dfd30c8e1f5224` mediante «Apruebo fase 8 y en un nuevo chat inicia fase 9». Fase 8 COMPLETADA y CA8-06 CUMPLIDO. Los límites, seguimientos y evidencia local se conservan; no se implementa Fase 9 ni se despliega por este cierre.


## Incremento de Fase 9 — 2026-11-01

Incremento Fase 9: navegación Administración, componente separado de panel, cuentas/unidades/destinatario sobre API real, paginación, motivo/confirmación, errores y reintento idéntico. Alcance/evidencia vigente en [ADMINISTRACION](ADMINISTRACION.md). Fase 8 sigue aceptada; Fase 10 no iniciada.


## Incremento de Fase 10 — 2026-11-02

Funcionarios, pertenencias, custodia, estados e historia/correcciones implementados con migración aditiva y UI/API. Contrato ejecutable, archivos, criterios y límites en [PROCESOS_EMPRESARIALES](PROCESOS_EMPRESARIALES.md). Los límites de entregas anteriores son antecedentes; OpenAPI Fase 7 conserva su superficie histórica. Fase 10 EN_REVISION; fases 11–15 sin autorización, sin despliegue.
