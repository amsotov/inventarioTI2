using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.SqlServer.TransactSql.ScriptDom;

// Herramienta estática: sin cliente SQL, conexiones ni ejecución de consultas.
static IList<ParseError> Parse(string sql)
{
    var parser = new TSql130Parser(initialQuotedIdentifiers: true);
    parser.Parse(new StringReader(sql), out IList<ParseError> errors);
    return errors;
}

if (args.Length == 0) return 2;
var selfTests = new[]
{
    new { Caso = "select_basico", Sql = "SELECT 1;", Aceptar = true },
    new { Caso = "sql_invalido", Sql = "CREATE TABLE [dbo].[Rota] ([id] INT NOT NULL;", Aceptar = false },
    new { Caso = "sintaxis_posterior_a_130", Sql = "SELECT CASE WHEN 1 IS DISTINCT FROM 2 THEN 1 ELSE 0 END;", Aceptar = false }
}.Select(t => new { caso = t.Caso, esperado = t.Aceptar ? "ACEPTAR" : "RECHAZAR", correcto = (Parse(t.Sql).Count == 0) == t.Aceptar }).ToArray();
var files = args.Select(path =>
{
    var bytes = File.ReadAllBytes(path);
    var errors = Parse(System.Text.Encoding.UTF8.GetString(bytes));
    return new
    {
        archivo = path,
        sha256 = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),
        errores = errors.Select(e => new { numero = e.Number, linea = e.Line, columna = e.Column }).ToArray()
    };
}).ToArray();
var report = new
{
    herramienta = "Microsoft.SqlServer.TransactSql.ScriptDom",
    version_paquete = "161.9142.1",
    parser = "TSql130Parser",
    destino = "SQL Server 2016",
    compatibility_level = 130,
    limite = "Análisis sintáctico estático; no ejecución, compilación semántica ni plan del motor SQL Server",
    autopruebas = selfTests,
    archivos = files
};
Console.WriteLine(JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
return files.All(f => f.errores.Length == 0) && selfTests.All(t => t.correcto) ? 0 : 1;
