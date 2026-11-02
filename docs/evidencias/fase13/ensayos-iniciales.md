# Ensayos iniciales y preparación — Fase 13

Los resultados finales están en PRUEBAS y los archivos finales de este directorio. Se conservan las distinciones siguientes:

- Línea base antes de correcciones: 100/100 API/seguridad y 39/39 navegador; auditoría npm sin vulnerabilidades.
- RF-06: prueba reprodujo cuatro omisiones (condición, documento, correo y unidad). En la preparación de esa prueba se corrigió además la expectativa de una unidad: su muestra tiene un funcionario, no dos. La regresión final añade las cinco claves restantes y RUT original/canónico, sin columnas personales.
- Primer axe: label-content-name-mismatch en los tres botones de avisos para cada tamaño administrativo. Se alineó texto visible y nombre accesible. Prueba de salto de teclado posterior reprodujo fallo en ambos roles y los tres tamaños; corregida navegación/foco.
- La primera preparación de 100.000 movimientos excedió statement_timeout de 15 s. Solo el pool propietario de preparación recibió 120 s para cargar la muestra; los pools de peticiones medidas conservan 15 s. No se rebajó sesión, MFA, RLS, permisos ni locks.
- Primer ensayo completo de carga: 1.000 HTTP 200 y 200 escrituras HTTP 200, con integridad y límites de archivo correctos. Los 203 avisos quedaron inciertos: el runner configuraba origen HTTP y la plantilla de correo rechaza enlaces no HTTPS, por lo que nunca llamó al doble. No se cambió ese control; el runner usa enlace HTTPS sintético y fue repetido entero. El resultado final registra las 203 llamadas aceptadas por el doble.
- Fallos de preparación del runner corregidos: tipo explícito de sesiones para TypeScript; catálogo espera las 19 tablas reales; helper de nombres de tsx inyectado solo por Playwright para evaluar cálculo CSS en navegador.
- Una regresión con ambos comandos de suite simultáneos falló al iniciar varios PostgreSQL (ECONNREFUSED/ready=false): 63/67 comprobaciones API y 20/23 de navegador en ese intento. Se comprobó además que el helper compartido retiraba contenedor sin -v y había 26 volúmenes anónimos inactivos (1,846 GB). La causa única de los arranques fallidos no se demuestra con esos errores; se acota concurrencia a un archivo por comando, se ejecutan suites secuenciales y se corrige retiro de volumen propio. Ningún volumen ajeno se purga. La repetición completa termina 119/119 y 39/39.

Los fallos iniciales de producto y del harness no se computan como éxitos. Los percentiles finales usan todas las muestras de la repetición; rechazos esperados 412/403 se informan aparte. No hubo llamadas a Resend ni envío real.
