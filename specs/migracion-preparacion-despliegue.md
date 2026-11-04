# M9 — Entrega documental y preparación de operación

M9-A01: «Apruebo fase 8 inicia fase 9». Base e224d6f3a15d09899eba2c6a908548eef73014e8. [Informe](../docs/migracion/09_PREPARACION_DESPLIEGUE.md), [puertas](../docs/migracion/09_PUERTAS_LIBERACION.csv), [manifiesto](../docs/migracion/09_MANIFIESTO_PREPARACION.json).

Resultado: instrucciones de continuidad, compatibilidades, acciones pendientes, secuencia de despliegue/rollback y evidencia verificable. F9 EN_REVISION_DOCUMENTAL; liberación NO_GO. Mantener fuentes, código, workflows, migraciones y evidencia histórica. Spec Kit no instalado ni simulado.

Criterios: CA9-01 autorización/continuidad coherentes; CA9-02 compatibilidades/pendientes/puertas trazables; CA9-03 guías por motor y ventanas de retorno con protección de efectos; CA9-04 evidencia nueva e histórica diferenciadas; CA9-05 código/SQL/fuentes preservados; CA9-06 sincronización GitHub y SHA comprobado; CA9-07 aceptación documental expresa pendiente. Ningún criterio documental cierra M8-R01, M9-R01 o los bloqueos de destino.

Verificar con `python3 docs/migracion/verificar_fase9.py`; `--evaluar-liberacion` sale 3. No se repiten suites de aplicación para cambios documentales; 280 casos F8 conservados como evidencia histórica. No ejecutar operaciones de despliegue/SQL/restore/configuración o iniciar otra etapa por esta especificación.
