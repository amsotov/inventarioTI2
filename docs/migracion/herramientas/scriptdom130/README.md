# Parser estático de SQL Server 2016

Herramienta de verificación documental; no es backend ni migrador. No depende de SQLClient, no conecta a bases y no ejecuta SQL. Usa TSql130Parser, paquete Microsoft.SqlServer.TransactSql.ScriptDom 161.9142.1 con packages.lock.json. Requiere SDK .NET 8 para compilar; no modifica las dependencias de la aplicación.

Copiar este directorio a un directorio externo de trabajo y ejecutar allí `dotnet restore --locked-mode` y `dotnet build --no-restore --configuration Release --output bin`. Mantener NUGET_PACKAGES, DOTNET_CLI_HOME y salidas fuera del repositorio. Puede fijarse DOTNET_CLI_TELEMETRY_OPTOUT=1 y DOTNET_GENERATE_ASPNET_CERTIFICATE=false. No copiar bin/obj ni paquetes al proyecto.

Desde raíz, el verificador Python puede invocarlo con `python3 docs/migracion/verificar_fase5.py --dotnet-bin /ruta/dotnet --scriptdom-dll /ruta/bin/ScriptDom130.dll`. `--analizar-sintaxis` añade SQLFluff 3.5.0 desde el Python del venv externo, si está instalado.

La DLL recibe cuatro rutas SQL, calcula hashes y devuelve únicamente errores de sintaxis por número/línea/columna. Incluye tres autopruebas; salida cero exige las tres y los cuatro archivos sin errores. No exporta sentencias ni valores de datos. El programa rechaza falta de argumentos con salida 2 y errores de parseo/autoprueba con salida 1.

El resultado no acredita funciones disponibles, edition/SP/CU, collation, integridad, permisos, transacciones, rendimiento o recuperación. Esos ensayos requieren SQL Server 2016 real y entorno autorizado. No se retira la barrera de los candidatos para analizarlos.
