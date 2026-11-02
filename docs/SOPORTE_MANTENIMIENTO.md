# Soporte y mantenimiento

2026-11-02 · Fase 15 EN_REVISION. Procedimiento propuesto; **sin mesa de ayuda, guardia, canal, personas ni SLA contratados/designados**. [Manual usuario](MANUAL_USUARIO.md) · [Manual admin](MANUAL_ADMIN.md) · [Runbook](RUNBOOK_OPERACION.md) · [Checklist NO-GO](CHECKLIST_LIBERACION.md).

## Solicitar ayuda y preservar evidencia

Preparar un registro para el canal que el responsable del producto designe; no hay dirección de soporte definida. En GitHub solo información sintética/saneada. Sospechas de acceso indebido o datos personales requieren canal privado aprobado, sin adjuntar evidencia sensible en issues públicos.

Registrar: ambiente y commit conocido, fecha/hora UTC del hecho, rol (sin credencial), pantalla/acción, resultado esperado/observado, código de error y Referencia/requestId, alcance e impacto. Añadir pasos con identificadores sintéticos cuando sea posible, y si hay operación pendiente/incierta o respuesta perdida. No adjuntar cookies, cabeceras, DSN, tokens, URL con fragmentos de acceso, códigos MFA, claves, documentos/RUT/correos de personas ni exportaciones reales. Capturas siempre minimizadas y revisadas antes de compartir. La referencia ayuda a correlacionar; no autoriza consultar datos de otra persona.

Plantilla mínima para copiar al canal acordado:

```text
Ambiente / commit:
Instante UTC / rol:
Pantalla / acción / referencia saneada:
Esperado / observado / impacto:
Código / requestId:
¿Resultado incierto? / ¿se conserva la página?:
Pasos sintéticos / evidencia minimizada:
Estado de diagnóstico / siguiente acción / persona responsable:
```

## Diagnóstico inicial

| Síntoma | Acción segura | Cuándo escalar |
|---|---|---|
| Acceso rechazado, cuenta inactiva o MFA perdido | Comprobar cuenta habilitada por canal aprobado; recuperar acceso sin compartir enlaces/códigos | Recuperación/MFA requieren operador y verificación de identidad; no existe bypass administrativo de MFA |
| 400 / 422 | Revisar campos y regla indicada; confirmar situación/custodia actuales | Si el caso válido persiste; evitar cambiar estados para sortear una regla |
| 401 | Autenticar de nuevo; si había comando incierto, conciliar antes de nueva escritura | Sesión revocada/inactividad repetida o sospecha de acceso |
| 403 | Revisar rol/MFA y que se usa origen autorizado | Si el permiso esperado sigue denegado; no desactivar CSRF/RLS ni conceder superusuario |
| 409 | Verificar identificador duplicado o comando incompatible | No reutilizar una clave para otra carga; conciliar efectos previos |
| 412 / 428 | Recargar ficha y revisar versión antes de decidir de nuevo | Conflictos persistentes; nunca forzar sobreescritura |
| 429 | Esperar y revisar frecuencia/intentos | No multiplicar solicitudes; comprobar abuso o configuración |
| 503 / respuesta perdida en escritura | Mantener página y solicitud; usar reintento exacto explícito disponible | Si se pierde contexto/sesión, conciliar historia/auditoría/resultado con responsable antes de repetir como nueva |
| Exportación caducada o de otra cuenta | Solicitar archivo propio nuevo si corresponde; conservar filtros | Denegación inesperada o exposición; no compartir enlace privado para eludir control |
| Aviso pendiente/fallido/incierto | Administrador revisa seguimiento; incierto exige evidencia | No activar worker ni reenviar por intuición; el cambio empresarial puede estar confirmado |

Soporte funcional revisa manual y regla; administración verifica estado/permiso vigente sin cambiarlo por comodidad; desarrollo/operación analiza versión, logs mínimos y dependencia. Estos son papeles propuestos, sin asignar personas. No hay acceso directo a datos concedido por este documento.

## Severidad, escalamiento y cierre propuestos

P1: indisponibilidad, fuga sospechada, integridad o continuidad amenazada. P2: degradación/cola/copia fallida dentro del margen. Consulta de uso o defecto menor sin pérdida: seguimiento planificado. Criterios y tiempos de acuse propuestos del runbook requieren cobertura/aprobación; **no son compromiso vigente**. Sin responsables/canal designados no se considera listo para producción.

Ante P1, conservar evidencia y escalar al responsable autorizado; aislamiento, rotación o recuperación reales siguen el runbook y sus permisos. No cambiar permisos, borrar datos, reiniciar proveedor o restaurar por una mera solicitud de ayuda. Cierre de ticket propuesto: causa/evidencia, resultado verificado por quien reportó, commit/cambio si existe, impacto residual y acción preventiva; un despliegue o silencio no prueba resolución.

## Rutina de mantenimiento propuesta

| Frecuencia / disparador | Revisión y evidencia | Rol propuesto, SIN DESIGNAR |
|---|---|---|
| Cada día operativo | Salud + smoke pertinente, errores/latencia, pools/locks, cola/inciertos, capacidad y última copia buena | Operación / administración |
| Semanal y antes del margen de copia | Máximo 168 h entre éxitos, snapshot verificable, cifrado/lectura independiente y alertas; retención 30 días | Operación, sujeto a F1-SEG-03 |
| Antes de cada cambio | Diff/secretos, changelog, dependencias/advisories, pruebas según módulos, migraciones/compatibilidad y checklist | Desarrollo / revisor |
| Mensual, propuesta | Tendencias/incidentes, capacidad, cuentas/roles mínimos, dependencias y deuda; sin cambiar/purgar automáticamente | Producto / seguridad / operación |
| Antes de producción, trimestral y tras cambio sustancial | Restauración integral en destino aislado; RPO ≤168 h/RTO ≤8 h desde incidente hasta servicio útil | Operación autorizada |
| Aviso de seguridad/proveedor | Evaluar impacto/versión real y parche aislado; documentar riesgo y resultado | Desarrollo / seguridad |

UTC permanece como zona del sistema. No se fija un domingo/hora aceptados ni scheduler; F1-SEG-03 sigue abierto. Los plazos legales de conservación de datos/logs se decidirán en F1-SEG-01; no hay purga habilitada. Presupuesto/recursos: F1-SEG-02 abierto. No prometer disponibilidad 99,5 % por tener healthchecks o documentación.

## Cambios y dependencias

1. Priorizar con evidencia y autorización de alcance; mantener versiones exactas/lockfile. Consultar changelogs/advisories actuales al cambiar proveedor/SDK/PG, sin actualizar a latest automáticamente.
2. Crear rama segura, reproducir con datos sintéticos y revisar impacto sobre sesiones/MFA/CSRF/RLS, idempotencia, exportaciones y avisos. Pruebas pertinentes en checkout separado; preservar literalmente evidencias aceptadas y migraciones anteriores.
3. Revisar dependencias y secretos sin imprimir valores; actualizar manuales/contratos/CHANGELOG/FASES/ESTADO. Sin Spec Kit instalado; su incorporación requiere decisión propia.
4. Sincronizar con GitHub y comprobar SHA remoto. El PR #1 queda en borrador; Pages legacy main:/docs bloquea merge y escritura en main. La configuración externa no se resuelve editando el workflow Verify only.
5. Promover únicamente con destino/recursos autorizados y checklist completo. Preparar paquete compatible anterior, copia/restauración y rollback del runbook; release, datos reales y correo requieren permisos aplicables. No ejecutar ninguno desde esta entrega documental.

No ejecutar todos los ensayos por rutina si el cambio no los justifica. Ver [ROADMAP](ROADMAP.md) para prioridades, incluida compatibilidad TLS anunciada para el 2026-11-10; no es una actualización ya realizada ni una fecha de entrega comprometida.
