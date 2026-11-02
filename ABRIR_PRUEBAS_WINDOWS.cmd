@echo off
setlocal
where wsl.exe >nul 2>nul
if errorlevel 1 goto requisitos
set "IT2_WSL_ROOT="
for /f "delims=" %%P in ('wsl.exe --exec wslpath -u "%~dp0."') do set "IT2_WSL_ROOT=%%P"
if not defined IT2_WSL_ROOT goto requisitos
wsl.exe --exec bash "%IT2_WSL_ROOT%/ops/local/iniciar-pruebas.sh"
if errorlevel 1 goto fallo
start "" "https://localhost:8443/"
echo Servidor iniciado en este equipo. Revisa el certificado y las credenciales en la guia.
goto fin
:requisitos
echo Se requiere Ubuntu en WSL2, Node 24, npm, OpenSSL y Docker Engine nativo dentro de Ubuntu.
echo No se instala software ni se cambia Windows automaticamente.
goto fallo
:fallo
echo No se ha confirmado el arranque. No se abrira una vista previa que aparenta funcionar.
echo Consulta docs\ACCESO_VISTA_PREVIA.md y conserva el mensaje anterior sin contrasenas.
:fin
pause
endlocal
