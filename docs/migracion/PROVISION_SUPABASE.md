# Provisión Supabase — inventarioTI2

Fecha: 2026-11-03. M5-A03. Estado: **BLOQUEADO_CUOTA_FREE / PROYECTO NO CREADO**. Continúa Fase 5; Fase 6 no autorizada.

## Autorización y solicitud concreta

Usuario: «te autorizo crear el proyecto en supabase» y, al seleccionar organización/región, «sovicl, región São Paulo». Permite crear inventarioTI2 como proyecto aislado de pruebas sintéticas, organización sovicl, región sa-east-1. No volver a pedir esa autorización o selección cuando haya cupo. SQL Server 2016/13.x y nivel 130 siguen siendo destino separado; esta creación no habilita el candidato SQL Server ni cierra decisiones del modelo.

## Resultado comprobado

1. Se comprobó que inventarioTI2 no existía en la organización elegida antes de solicitar creación.
2. Se realizó **un intento** de create_project sin confirm_cost_id, como requiere el conector para una solicitud inicial. No se suministraron ni expusieron credenciales.
3. Supabase devolvió BadRequestException (código del conector INVALID_ARGUMENT): límite máximo de dos proyectos Free activos alcanzado por miembros administradores/propietarios. Es rechazo del proveedor por cuota, no rechazo de revisión automática de permisos.
4. Se consultó la cotización del plan actual: amount 0, recurrence monthly. El coste de creación en Free es US$0/mes según la tarifa/moneda de Supabase; la cotización no reserva un cupo ni informa del coste de subir de plan. No se llamó confirm_cost ni se aprobó/activó un plan de pago.
5. Se volvió a listar proyectos y consultar organización: plan free, dos proyectos activos, cero proyectos con nombre inventarioTI2. No se obtuvo referencia de proyecto nuevo ni hubo inicialización que esperar.

[Evidencia saneada](evidencias/fase5/provision_supabase.json). Se omiten detalles de proyectos ajenos al trabajo, credenciales e identificadores de miembros. Se conserva el motivo efectivo del rechazo.

## Continuidad y límites

El bloqueo anterior «proyecto no visible» queda precisado: el proyecto aún no está creado y el intento autorizado está bloqueado por cuota Free. El manifiesto del candidato y la evidencia de revisión 2 conservan su alcance histórico de proyecto ausente; este registro aporta el resultado operacional posterior. No se cambia el DDL ni se presenta su verificador como ensayo Supabase.

La autorización recibida cubre la creación, no pausar o eliminar servicios existentes, modificar roles, facturación o cambiar plan. Para liberar cupo hace falta una acción concreta del usuario o autorización específica para pausar un proyecto identificado, explicando que interrumpe su servicio. Si se opta por un plan de pago, obtener cotización real y aprobación del coste antes de cambiarlo; no usar la cotización Free de cero como aceptación de gastos.

No crear otra organización o una rama para eludir la cuota. No renombrar/reutilizar inventarioTI ni asumir que es inventarioTI2. Tras cupo confirmado: releer proyectos para evitar duplicados; reintentar inventarioTI2 en sovicl/sa-east-1 con la autorización vigente; consultar get_project hasta estado saludable con esperas acotadas; registrar ref/versión/estado y revisar metadatos del proyecto nuevo antes de preparar pruebas. No volcar claves al repositorio o chat.

No hubo SQL, nuevas tablas, cargas, cuentas reales, mensajes, cambios de permisos, migración de datos, modificaciones de app, merge o despliegue. Las pruebas funcionales y los ensayos de SQL Server permanecen pendientes. Los fuentes, ocho migraciones PostgreSQL, modelo original y diseño aceptado se conservan.

Referencias consultadas: [Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq) y [facturación por organización](https://supabase.com/docs/guides/platform/billing-on-supabase). La cuota de proyectos Free se aplica a propietarios/administradores entre organizaciones; un nuevo nombre de organización no demuestra disponibilidad de cupo.
