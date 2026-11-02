# Continuidad para nuevo chat: pendientes y vista previa — D-43

2026-11-02. Solicitud: «preparame en chat nuevo los pendientes del sistema inventarioTI2 y una vista previa para probar el sistema». Se prepara este punto de arranque y se sincroniza GitHub. No se crea automáticamente otra conversación ni se afirma haber habilitado una URL nueva.

## Estado que debe recuperar el nuevo chat

- Repositorio: `amsotov/inventarioTI2`, rama `phase14/ci-prerequisites-and-pages-guard` del [PR #1](https://github.com/amsotov/inventarioTI2/pull/1), en borrador/sin merge. Base de esta preparación: `445d018e64806ba4373e7690397d00c10a428562`; recuperar también el HEAD vigente del PR para incluir este documento y preservar cambios posteriores.
- Fases 0–15 COMPLETADAS; Fase 15 aceptada por D-41, CA15-06 CUMPLIDO. No volver a pedir aprobación de Fase 15 ni crear una Fase 16 por inferencia. La solicitud vigente prepara continuidad sobre pruebas y pendientes, no una autorización global para ejecutar toda la deuda o inventar decisiones legales/presupuestarias.
- Usuario: **Windows, Chrome**. No preguntar de nuevo su sistema operativo. WSL2/Ubuntu/Node/Docker en su equipo no se han comprobado; tampoco se ha ejecutado allí el launcher.
- Instancia D-41 probada dentro del entorno con PostgreSQL/GoTrue locales reales, UI/BFF, MFA TOTP, Origin/CSRF/RLS y datos/cuentas sintéticos. Doce grupos funcionales PASS y reinicio con persistencia; evidencia aceptada en [PRUEBAS](PRUEBAS.md#publicación-local-de-pruebas--d-41).
- **La vista previa desde el Chrome del usuario sigue BLOQUEADA.** `https://localhost:8443` corresponde al entorno y no al computador personal. El usuario mostró ERR_CONNECTION_REFUSED; readiness 200 o capturas internas no prueban acceso desde su navegador. D-42 y [diagnóstico](ACCESO_VISTA_PREVIA.md) explican el fallo. No repetir el enlace como si fuera accesible ni presentar el prototipo como sistema funcional.
- En el entorno inspeccionado no había herramienta de reenvío de puertos. Revisar las capacidades del nuevo entorno: podrían cambiar. No inventar URL, túnel, sesión de navegador o servicio publicado.
- Existe [paquete fuente Windows/WSL2 de D-42](https://github.com/amsotov/inventarioTI2/archive/445d018e64806ba4373e7690397d00c10a428562.zip), launcher CMD y Bash. Requiere Docker Engine Linux nativo en la misma distribución; Docker Desktop/Windows nativo no acreditados. Entregar ese ZIP no resolvió por sí solo el acceso.

Leer primero [AGENTS](../AGENTS.md), [PROMPT_MAESTRO](../PROMPT_MAESTRO.md), [FASES](../FASES.md), [ESTADO](../ESTADO_PROYECTO.md), [DECISIONES](DECISIONES.md) D-41/D-42/D-43, [PRUEBAS_LOCALES](PRUEBAS_LOCALES.md), este documento y el [ROADMAP](ROADMAP.md). Conservar datos, cuentas, MFA, claves y volúmenes de pruebas; si el entorno se reemplazó, no afirmar que los recursos anteriores siguen existiendo.

## Prioridad 1: vista previa funcional que el usuario pueda abrir

1. Recuperar rama/HEAD y comprobar servicio, certificados y capacidades reales. Los certificados/JWT de prueba duran 7 días: comprobar vigencia sin imprimir secretos y sin borrar estado para renovarlos.
2. Establecer una ruta de acceso comprobable desde Windows/Chrome. Usar reenvío privado nativo si el nuevo entorno lo ofrece. Si se ejecuta en Windows/WSL2, comprobar sus requisitos y la conexión Windows↔WSL; no asumir instalación ni control remoto de su computador. Si es necesaria otra infraestructura o exposición externa, preparar la solución concreta y revisar el permiso específico antes de publicarla: la autorización vigente sigue siendo local, sin producción/gastos ni main/Pages.
3. Verificar origen HTTPS, cookies Secure/HttpOnly/SameSite, CSRF, sesión/rol vigentes, RLS y MFA. No resolver el acceso eliminando estos controles, insertando identidad doble o creando una demo que acepta cualquier contraseña.
4. Preparar accesos sintéticos de administrador y lectura, conservando las existentes cuando corresponda. Entregar al usuario un medio privado para ver credenciales y configurar su propio autenticador; nada de claves/cookies/TOTP en GitHub ni en capturas públicas. Mantener correo real/worker deshabilitados.
5. Facilitar el recorrido de prueba: ingreso/MFA, consultas y filtros, alta de bien/funcionario, asignación/traslado/devolución, historia, reportes/exportación privada, panel/auditoría según rol, errores y salida. Conservar motivo, versiones, idempotencia y conciliación de resultados inciertos.
6. Comprobar persistencia al detener/retomar y describir duración del entorno, validez del certificado, comandos y límites. No prometer permanencia o acceso entre equipos sin evidencia.

| Criterio de entrega de la vista previa | Evidencia requerida |
|---|---|
| VP-01: acceso desde el usuario | Dirección/ruta exacta y confirmación de que abre desde su Chrome Windows; prueba interna separada si aún falta esa confirmación |
| VP-02: sistema funcional | UI/BFF/DB/Auth reales de pruebas, dos roles y MFA; no solo prototipo ni pantalla estática |
| VP-03: recorridos y privacidad | Escritura/historia/exportación propias, denegación a lectura y a otra cuenta, CSRF/reintento; correo real apagado |
| VP-04: continuidad | Datos/cuentas/MFA conservados; inicio/detención y expiración documentados; sin reset automático |
| VP-05: trazabilidad | Pruebas ejecutadas/fallidas/no ejecutadas, riesgos y SHA remoto; evidencia anterior intacta, PR sin merge |

VP-01 **PENDIENTE**. Los demás tienen evidencia parcial local de D-41 y deben contrastarse con la ruta/instancia final; no se presume cumplimiento del nuevo acceso. La preparación D-43 no ejecuta de nuevo los ensayos ni da por hecha la prueba del usuario.

## Pendientes del sistema, en orden propuesto

| Prioridad / seguimiento | Pendiente concreto | Decisión o comprobación necesaria |
|---|---|---|
| Primero: acceso de prueba | Vista previa accesible en Chrome Windows | Resolver VP-01–05 y registrar el acceso observado por el usuario |
| F1-SEG-01 / P0 antes de datos reales | Retención legal de datos personales y logs | Responsable, política y validación aplicable a Chile/actividad; no inventar plazos ni purgar historia |
| F1-SEG-02 / P0 antes de contratar | Presupuesto/moneda, región, recursos y proveedores | Cotización actual, tope y aprobación; estimación histórica no autoriza gasto |
| F1-SEG-03 / P0 operativo | Operador/suplente, horario UTC, destino externo, custodia/cifrado y alertas | Copia semanal con máximo 168 h, RPO ≤168 h, RTO ≤8 h y retención 30 días; restauración integral y evidencia externa |
| EV15-01 / P0 | Pages legacy main:/docs activo | Resolver expresamente el automatismo antes de push/merge a main; no cambiar ni eliminar sitio por estas pruebas |
| EV15-02 / P0 gestionado | Destino de pruebas/producción, DB/Auth/TLS/secretos/artefactos y rollback | Ensayo gestionado autorizado y checklist completo, incluyendo recuperación de identidad/MFA/settings; local no lo acredita |
| EV15-03 / P0 antes de envío real | Correo de identidad y avisos empresariales | Integraciones separadas, dominio/credenciales/destinatarios de prueba autorizados, entrega y conciliación verificadas; no activar pendientes reales |
| EV15-04 / revisión prioritaria | Compatibilidad de proveedores | Revisar aviso TLS de Supabase de 2026-11-10 y versiones reales PG/SDK del destino; volver a consultar documentación actual |
| EV15-05 / P1 | Capacitación y onboarding humano | Facilitador/participantes, ejercicios/acta y prueba por desarrollador nuevo; material preparado no significa realizado |
| EV15-06 / P1 | Accesibilidad/dispositivos reales | Lector de pantalla, revisión manual WCAG 2.2 AA y Safari/iPad/iPhone físicos; Chromium emulado/axe no certifican conformidad |
| EV15-07/08/09 / P1 | Recuperación pública, rotación/recuperación de claves/MFA y retención/limpieza | Medición/diseño, verificación de identidad y custodia; política previa a purga, sin bypass ni reenviar inciertos |
| EV15-10 / P1 | Contrato API posterior a Fase 7 | Consolidar rutas/permisos/errores actuales sin reescribir evidencia histórica |
| EV15-11/12/13 / P2 | Concurrencia, salida de evidencia y eventual SQL Server | Priorizar según medición/necesidad; no hay migración ni nueva implementación autorizadas por esta lista |

El detalle y condiciones de aceptación futura están en [ROADMAP](ROADMAP.md), [SOPORTE](SOPORTE_MANTENIMIENTO.md), [CAPACITACION](CAPACITACION.md), [RUNBOOK](RUNBOOK_OPERACION.md) y [CHECKLIST](CHECKLIST_LIBERACION.md). La disponibilidad 99,5 %, recuperación gestionada y operación productiva no están acreditadas por una sesión de pruebas local.

## Texto listo para pegar en el nuevo chat

> Continúa inventarioTI2 desde la rama phase14/ci-prerequisites-and-pages-guard del PR #1 en amsotov/inventarioTI2. Recupera el HEAD vigente y lee AGENTS.md, FASES.md, ESTADO_PROYECTO.md y docs/CONTINUIDAD_PRUEBAS.md. Fases 0–15 están aprobadas por D-41; no repitas la aprobación ni crees una Fase 16. Presenta los pendientes y prioriza una vista previa funcional que yo pueda abrir desde Chrome en Windows. El localhost del entorno remoto ya falló: no lo entregues como enlace accesible desde mi computador. Revisa las capacidades reales y resuelve la ruta de acceso antes de afirmar que la vista previa está lista; una prueba interna no equivale a mi acceso. Conserva datos, cuentas, MFA, claves, volúmenes y evidencia. Usa solo datos sintéticos y correo real deshabilitado; mantén sesión/roles/MFA/CSRF/RLS. Prepara la alternativa concreta si falta infraestructura o un permiso aplicable. Actualiza GitHub y verifica el SHA remoto, sin merge a main, Pages, producción, gastos, datos reales o publicación externa no autorizados.
