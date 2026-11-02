import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../helpers/reports.js";
import { renderFile } from "../../apps/server/reports/service.js";
import { execFileSync } from "node:child_process";

test("Fase 13 / RF-06: todas las claves del buscador, sin columnas personales", async (t) => {
  const x = await fixture();
  try {
    await x.root.query("update inventario.bienes set serie='QA-SERIE-BUSQUEDA' where id=$1",[x.b.id]);
    await x.root.query("insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('RUT','12.345.678-5','RUT sintético','QA',$1)",[x.units[1].id]);
    for (const [query, section, expected] of [
      ["TI-0001", 0, 1], ["marca sintética", 0, 32],
      ["QA-SERIE-BUSQUEDA", 0, 1], ["notebook", 0, 32], ["=2+2", 0, 1],
      ["malo", 0, 10], ["ID-PRIVADO", 1, 1],
      ["12.345.678-5", 1, 1], ["123456785", 1, 1],
      ["personal@example.invalid", 1, 1], ["nombre actual diferente", 1, 1],
      ["analista", 1, 1], ["ángela", 1, 1],
      ["' OR 1=1 --", 1, 0],
    ] as const) {
      await t.test(query.includes("@") ? "correo sintético" : `clave ${query}`, async () => {
        const res = await x.server.inject({url:"/api/v1/buscar?q=" + encodeURIComponent(query),headers:x.headers()});
        assert.equal(res.statusCode,200,res.body);
        const result = res.json();
        assert.equal(result.sections[section].total,expected);
        assert.doesNotMatch(JSON.stringify(result.sections), /ID-PRIVADO|personal@example.invalid|OBSERVACION-PRIVADA/);
        if (query === "personal@example.invalid") {
          for (const format of ["xlsx", "pdf"] as const) {
            const bytes = await renderFile(result, format);
            const text = format === "pdf"
              ? execFileSync("pdftotext", ["-", "-"], {input:bytes,encoding:"utf8"})
              : execFileSync("python3", ["-c", "import sys,io,zipfile; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); print(''.join(z.read(p).decode() for p in z.namelist() if p.endswith('.xml')))"], {input:bytes,encoding:"utf8"});
            assert.doesNotMatch(text, /personal@example.invalid|ID-PRIVADO/);
            assert.match(text, /consulta reservada/);
          }
        }
      });
    }
  } finally { await x.close(); }
});
