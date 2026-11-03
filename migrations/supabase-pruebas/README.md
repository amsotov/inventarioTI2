# Baseline PostgreSQL de pruebas — inventarioTI2

Aplicada exclusivamente al proyecto `yhsfotxhaptinjtmrinn`, sovicl/sa-east-1. No es el modelo objetivo SQL Server. No instalar en inventarioTI ni en otra base. Revisar [informe y resultados](../../docs/migracion/VALIDACION_SUPABASE.md) y comprobar identidad/estado/historial antes de cualquier ejecución.

Diez DDL versionados en Supabase: ocho copias trazadas de `supabase/migrations`, con adaptación del operador no SUPERUSER, y dos correcciones aditivas de ACL privadas. Los originales no cambiaron. [Manifest](manifest.json) registra hashes de ambos archivos y versión real remota. Las versiones remotas las generó el conector; no se reemplazó el historial por timestamps locales. Los comentarios de fases 4–12 pertenecen al ciclo histórico, no inician Fase 6 de modernización.

Las pertenencias creadas para el operador permiten SET ROLE sin herencia; roles de aplicación NOLOGIN/NOBYPASSRLS y sin CREATE final. El CREATE temporal de propietario se revoca de inmediato. La segunda corrección ejecuta REVOKE/GRANT como propietario efectivo y conserva solo los permisos explícitos de la fuente. Su comentario «ni INHERIT» se refiere a las pertenencias: postgres tiene rolinherit=true, pero inherit_option=false en estas siete pertenencias. No hay cambios de permisos en public/auth/storage, navegador, otros proyectos o facturación.

No reescribir una migración aplicada ni ejecutar archivos de este directorio en bloque. La fuente original no es idempotente; una colisión requiere revisar drift. No se introdujo un runner automático o una conexión con secretos. Las dos correcciones nuevas se crearon con `supabase migration new` de CLI 3.0.0 en work/, fuera del proyecto, y se aplicaron por conector.

`seed_sintetico.sql` es DML de prueba: 2 unidades, 3 funcionarios, 6 bienes; aborta si los maestros/cuentas ya tienen datos. No reejecutarlo sobre la semilla existente. No contiene cuentas Auth ni credenciales, y no pretende reconstruir historia real.

`ensayo_transaccional.sql` ejecuta 20 casos bajo SET ROLE del operador y termina con ROLLBACK. Su SELECT final comprueba que no quedaron cuentas/sesiones/comandos/auditoría/outbox. Las secuencias pueden avanzar con rollback; no representan pérdida de filas. No prueba login real, HTTP/UI, envío de correo, dos conexiones concurrentes ni SQL Server. No activar workers o cambiar estos roles a LOGIN para ejecutar el ensayo.
