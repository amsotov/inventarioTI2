# Capacitación propuesta y evaluación

2026-11-02 · Fase 15 COMPLETADA por D-41 · **MATERIAL PREPARADO; SESIONES NO REALIZADAS**. No hay participantes, facilitador, fechas ni ambiente de capacitación designados. Duraciones y umbrales siguientes son propuestas para revisión, sin convocatorias ni compromisos aprobados.

## Condiciones de preparación

Usuario/revisor acuerda alcance, facilitador y participantes por rol. Un operador autorizado prepara ambiente aislado con datos sintéticos y correo capturado/doble; sin conectar cuentas/datos reales ni activar envíos. Contar con unidades ficticias, dos funcionarios sintéticos activos, bienes de práctica bueno/regular/malo, cuentas de prueba de ambos roles y una exportación. No publicar este ambiente por inferencia. El fixture automático de [instalación](INSTALACION_DESARROLLO.md) finaliza al terminar sus pruebas: no es aula interactiva ni aprovisiona cuentas para una sesión.

Revisar accesibilidad y necesidades de participantes antes de acordar medio/duración. Facilitar [manual de usuario](MANUAL_USUARIO.md), [manual administrativo](MANUAL_ADMIN.md) y [soporte](SOPORTE_MANTENIMIENTO.md); usar referencias sintéticas en capturas/actas. Nunca grabar contraseñas, claves MFA, enlaces de acceso ni documentos personales.

## Agenda propuesta por público

| Público | Duración estimada | Contenido y práctica | Evidencia esperada |
|---|---|---|---|
| Lectura | 45 min | Acceso/salida, UTC, navegación/teclado, consultas/filtros/historia, resumen y exportación propia | Checklist L1–L4, archivo sintético y registro de dudas |
| Administración | 75 min adicionales | MFA, alta/edición, funcionarios/custodia/condición, bajas, versiones/reintentos; cuentas, unidades, auditoría/avisos | Checklist A1–A5 y referencias de cambios auditados |
| Soporte/operación | 60 min | Solicitud saneada, severidad propuesta, diagnóstico sin rebajar controles, inciertos, runbook y puertas NO-GO | Resolución escrita de escenario S1; sin restore real |
| Desarrollo | 60–90 min | Checkout, instalación/build/ensayo, mapa BFF/SQL/UI, evidencia y revisión en rama segura | Registro D1 con versiones/resultados y limitaciones |

No se promete competencia por asistencia. Se propone evaluación práctica independiente por rol, con repetición de ejercicios fallidos y registro de ayuda recibida.

## Guion de ejercicios con resultado esperado

| ID | Acción sobre datos sintéticos | Resultado que se debe observar |
|---|---|---|
| L1 | Iniciar/cerrar sesión y explicar UTC, 30 min de inactividad y 8 h absolutas | Cuenta/rol correctos; entiende que consultar/polling no prolonga actividad; vuelve a autenticar tras salir |
| L2 | Consultar bien/funcionario/historia y acotar filtros | Encuentra referencias y distingue situación, condición, custodia y unidad histórica |
| L3 | Generar Excel/PDF filtrado, descargar propio y explicar caducidad | Archivo completo dentro de límite 10.000/2.000, UTC/filtros y acceso privado de una hora; no compartirlo sin permiso |
| L4 | Intentar acceso administrativo con lectura | Función ausente/rechazo; no intenta eludir permisos; reporta bloqueo con referencia saneada |
| A1 | Completar MFA y registrar bien/funcionario | Código/identidad válidos, serie o motivo de ausencia, motivo/confirmación; funcionario no crea cuenta |
| A2 | Asignar, trasladar y devolver; probar malo/baja | Malo mantiene custodia; baja con custodia rechazada; devolución explícita; historia original preservada |
| A3 | Simular versión obsoleta y respuesta perdida, con facilitador | Recarga ante conflicto; conserva solicitud y usa reintento exacto ante incertidumbre; si abandona, concilia antes de crear otra |
| A4 | Revisar cuentas/unidades/destinatario y auditoría | No cambia propio registro ni pierde último administrador; cambio de destinatario no redirige avisos antiguos |
| A5 | Resolver aviso incierto de práctica con evidencia simulada identificada como tal | No reenvía por intuición; distingue aceptado/entregado; no activa worker real |
| S1 | Analizar un caso de 503 y una operación incierta | Registra ambiente/commit/UTC/requestId saneados, preserva evidencia y escala; no debilita MFA/CSRF/RLS ni afirma resultado sin prueba |
| D1 | Seguir la guía en checkout limpio y explicar flujo UI→BFF→SQL | Instala/compila/prueba sin credenciales reales; localiza reglas/rutas/migraciones y presenta límites y fallos honestamente |

Evaluación propuesta: completar todos los ejercicios del rol; los controles críticos L4, A2, A3, A5 y S1 deben explicarse sin sugerir bypass o reenvío ciego. Con fallos, registrar duda, volver al manual y repetir antes de considerar habilitación. No hay personas evaluadas ni aprobación de estos umbrales todavía.

## Acta para cada sesión futura

| Campo | Registro |
|---|---|
| Estado | PENDIENTE; no realizada |
| Ambiente / commit / versión de material | SIN ACORDAR |
| Fecha/hora y zona de sesión | SIN ACORDAR; los registros de aplicación permanecen UTC |
| Facilitador / participantes y rol | SIN DESIGNAR; identidad en registro privado autorizado, no datos personales en Git |
| Ejercicios / resultado / evidencia saneada | NO EJECUTADOS |
| Ayuda necesaria, dudas y correcciones al material | PENDIENTE |
| Reevaluación / validación de participante y revisor | PENDIENTE |

Una acta requiere hechos observados. No completar asistentes, firmas, tiempos ni satisfacción supuestos. No se envían invitaciones desde esta tarea. Aceptación documental CA15-06 y capacitación realizada son decisiones y evidencias distintas; consultar [Fase 15](FASE15.md).
