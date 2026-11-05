# MTEST-A01 — laboratorio conectado

Solicitud: sitio temporal sobre Supabase inventarioTI2 con datos sintéticos, entorno virtual y todas las vistas modernizadas existentes. Se conserva el proyecto y su autenticación. Autorización de preparación e implementación; no es fase10 ni aceptación de SQLServer.

Criterios: persistencia SQL real bajo los contratos v2; roles/RLS/MFA/CSRF; UUID y vínculo explícito de identidad; dominio+historia+comando+auditoría+aviso atómicos; cursores y versiones; recarga de navegador conserva datos; aislamiento del transporte demo; artefacto reproducible sin secretos; servidor de prueba habilitable solo tras preflight.

La muestra PostgreSQL no migra datos operacionales ni reemplaza SQL Server 2016/130. Reportes v1 conservan su propio origen. Perfiles, baja final, reactivación y compensaciones continúan sin capacidad hasta ratificar políticas pendientes.

Implementación, operación y bloqueos: [guía](../docs/PRUEBA_REAL_SUPABASE.md), [resultado](../docs/prueba-real/RESULTADO.md). Baseline de código: main 5758d58e68a599b4b36655d07e96708094fc9620. Fuentes/modelos/SQL candidatos y evidencia histórica permanecen preservados.
