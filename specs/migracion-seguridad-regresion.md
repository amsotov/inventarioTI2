# M8 — Seguridad y regresión de la migración

M8-A01 acepta F7 e inicia exclusivamente F8. [Informe](../docs/migracion/08_SEGURIDAD_REGRESION.md), [matriz de aceptación](../docs/migracion/08_MATRIZ_PRUEBAS.csv), [evidencia](../docs/migracion/evidencias/fase8/pruebas.json).

Validar identidad real local, SQL como autoridad del rol, MFA, sesiones, frontera HTTP, campos sensibles, auditoría, transacciones y regresión de interfaz/exportaciones. Rechazar UUID equivalentes en traspaso/perfiles y JSON mal formado antes de persistencia. APROBADA/FALLIDA/BLOQUEADA/NO EJECUTADA deben conservar su significado y alcance.

Aceptación local: build, backend 219, UI 57, operación 4, audit y heurística de secretos; sin doble v2 en main. La inspección remota es solo lectura. M8-R01 conserva FALLIDA la política sin autorregistro. SQL Server, vínculo de personas y perfiles de destino permanecen BLOQUEADOS. No liberar hasta cerrar los prerrequisitos y repetir integración real; `--evaluar-liberacion` debe salir 3. Spec Kit no instalado ni simulado; F9 sin autorización.
