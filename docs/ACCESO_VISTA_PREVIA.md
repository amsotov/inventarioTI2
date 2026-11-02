# Acceso a la vista de pruebas — D-42

2026-11-02. El usuario informa que la vista previa no funciona y muestra Chrome con `ERR_CONNECTION_REFUSED` al abrir localhost:8443. Se comprueba que el servidor del entorno de trabajo sigue activo y `/health/ready` responde 200. **El acceso desde el navegador del computador personal no está resuelto por ese éxito interno.**

## Causa y corrección del diagnóstico

`localhost` apunta al equipo que hace la petición. La instancia D-41 se ejecuta en el entorno de trabajo remoto; el navegador de la captura consulta el computador personal. No hay servidor escuchando allí ni un puerto reenviado. El error de conexión ocurre antes de validar el certificado o la ruta: importar la CA, cambiar la contraseña, quitar caracteres de la URL o recargar no establece esa conexión.

La entrega anterior confirmó el servicio interno y lo presentó con un enlace localhost que no permitía entrar desde ese navegador. Se corrige esa comunicación: **no existe una vista previa remota accesible al usuario con las capacidades actualmente disponibles**. No se ha identificado herramienta de reenvío de puertos/túnel en este entorno; las comprobaciones internas y el smoke de Chromium no acreditan conectividad desde el equipo personal. No se debe publicar una IP interna ni una URL inventada.

## Alternativa preparada: ejecutar en el equipo de pruebas

Se prepara un ZIP de código versionado, sin work/, cuentas, contraseñas, claves, sesiones, node_modules ni volúmenes del entorno. Al iniciar en otro equipo genera una instancia sintética nueva con credenciales propias; no traslada los datos o MFA de la instancia remota. Esta última se conserva intacta.

El controlador comprobado requiere **Linux con Node 24, npm, OpenSSL y Docker Engine nativo en el mismo sistema/VM**. Usa el socket local `/var/run/docker.sock` y una red Docker interna. Docker Desktop y ejecución Node nativa en Windows/macOS **no están acreditados**; no se promete que el ZIP funcione con ese backend. En Windows, el camino previsto es Ubuntu en WSL2 con Docker Engine instalado dentro de esa distribución; hay que confirmar el sistema y los requisitos del equipo antes de dar por lista esa instalación. No se instala software ni se modifica el computador personal desde esta conversación.

En Windows, extraer el ZIP completamente y abrir `ABRIR_PRUEBAS_WINDOWS.cmd`. El lanzador llama al controlador dentro de la distribución WSL predeterminada, conserva los mensajes de error y solo abre el navegador si el arranque termina correctamente. No instala WSL/Docker/Node, no usa PowerShell ni cambia políticas de ejecución. El lanzador CMD no se ha ejecutado en Windows desde este entorno; el controlador Linux sí tiene verificación local. La conectividad localhost Windows↔WSL también debe comprobarse en ese equipo.

En el Linux de pruebas, extraer el ZIP en una carpeta propia, abrir terminal en esa carpeta y ejecutar:

```sh
bash ops/local/iniciar-pruebas.sh --comprobar
bash ops/local/iniciar-pruebas.sh
```

El primer comando comprueba requisitos. El segundo instala dependencias del lockfile, compila e inicia la instancia; no borra un estado previo. Una vez iniciado **en ese equipo**, abrir `https://localhost:8443/`, sin asteriscos ni Markdown al final. No usar ese enlace como acceso al entorno remoto.

Credenciales y detención, en la misma carpeta/equipo:

```sh
node ops/local/control.mjs credentials
node ops/local/control.mjs status
node ops/local/control.mjs stop
```

Administrador configura su autenticador TOTP; las claves son aleatorias y solo locales. Para HTTPS, confiar únicamente en el certificado público `work/local-inventarioti2/ca.crt` de **esa instalación**, según el procedimiento de su navegador/sistema. No importar claves privadas ni reutilizar la CA de otro equipo; no se modifica la confianza global automáticamente. Certificados/JWT de prueba duran 7 días. Ver [guía del sistema local](PRUEBAS_LOCALES.md) para persistencia y límites.

Si falla el prerrequisito o el arranque, conservar el mensaje saneado y el estado local, sin borrar volúmenes ni pegar contraseñas en GitHub. El paquete y el launcher no prueban que una instalación haya ocurrido en el equipo del usuario. El usuario confirmó Windows. La presencia de WSL2, Ubuntu, Node 24 y Docker Engine y el arranque en su computador siguen sin comprobar.

## Estado y límites

Servidor interno D-41 sano; acceso desde Chrome del usuario **BLOQUEADO por falta de ruta entre equipos**. Paquete local preparado; ejecución en el computador personal NO REALIZADA. Se conserva la instancia y la evidencia D-41, con 12 grupos locales PASS y reinicio; no se reetiquetan como pruebas del acceso remoto.

Una URL externa necesitaría una capacidad de alojamiento/reenvío adecuada y autorización específica para ampliar el alcance local vigente; no se ha habilitado un servicio externo, túnel público, Sites, main/Pages o producción para resolver este fallo. Fases 0–15 permanecen COMPLETADAS; F1-SEG-01/02/03 y los demás pendientes siguen abiertos. La corrección de diagnóstico/documentación se sincroniza en el PR #1 sin merge.
