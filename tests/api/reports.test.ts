import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fixture, reader, admin } from "../helpers/reports.js";
import { Reports, renderFile } from "../../apps/server/reports/service.js";
import {
  reportTypes,
  type ReportType,
} from "../../apps/server/reports/selection.js";

function inspectXlsx(bytes: Buffer) {
  const script = `import sys,io,json,zipfile,xml.etree.ElementTree as E
z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); ns={'x':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
shared=[]
if 'xl/sharedStrings.xml' in z.namelist():
 for s in E.fromstring(z.read('xl/sharedStrings.xml')).findall('x:si',ns): shared.append(''.join(s.itertext()))
result=[]
for path in sorted(p for p in z.namelist() if p.startswith('xl/worksheets/sheet') and p.endswith('.xml')):
 root=E.fromstring(z.read(path)); rows=[]
 assert not root.findall('.//x:f',ns), 'Unexpected formula'
 for row in root.findall('.//x:sheetData/x:row',ns):
  cells=[]
  for c in row.findall('x:c',ns):
   v=c.find('x:v',ns); value=v.text if v is not None else ''.join(c.find('x:is',ns).itertext()) if c.find('x:is',ns) is not None else ''
   cells.append(shared[int(value)] if c.get('t')=='s' else value)
  rows.append(cells)
 result.append(rows)
print(json.dumps(result))`;
  return JSON.parse(
    execFileSync("python3", ["-c", script], {
      input: bytes,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    }),
  );
}
test("Fase 11: reportes/exportaciones reales, HTTP/Auth/RLS/PostgreSQL sintético", async (t) => {
  const x = await fixture(),
    { server, root, security, r, a, headers } = x;
  type Session = { sid: string; csrf: string };
  const get = async (path: string, s: Session = r) => {
    const res = await server.inject({
      url: "/api/v1/" + path,
      headers: headers(s),
    });
    assert.equal(res.statusCode, 200, res.body);
    return res.json();
  };
  const create = async (
    type: ReportType,
    format: "xlsx" | "pdf",
    filters: Record<string, string> = {},
    key = randomUUID(),
    s: Session = r,
  ) =>
    server.inject({
      method: "POST",
      url: "/api/v1/exportaciones",
      headers: { ...headers(s), "idempotency-key": key },
      payload: { tipo: type, formato: format, filtros: filters },
    });
  const ready = async (id: string, s: Session = r) => {
    for (let i = 0; i < 700; i++) {
      const job = await get("exportaciones/" + id, s);
      if (!["pendiente", "procesando"].includes(job.estado)) {
        assert.equal(job.estado, "listo", JSON.stringify(job));
        return job;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    throw Error("Exportación no finaliza");
  };
  const file = async (
    type: ReportType,
    format: "xlsx" | "pdf",
    filters: Record<string, string> = {},
    s: Session = r,
  ) => {
    const res = await create(type, format, filters, randomUUID(), s);
    assert.equal(res.statusCode, 202, res.body);
    await ready(res.json().ref, s);
    const response = await server.inject({
      url: "/api/v1/exportaciones/" + res.json().ref + "/archivo",
      headers: headers(s),
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.match(response.headers["cache-control"] as string, /no-store/);
    return { response, job: res.json() };
  };
  try {
    await t.test(
      "indicadores calculados desde fuente; condición/custodia/baja independientes",
      async () => {
        const result = await get("resumen");
        assert.equal(result.metrics.registrados, 32);
        assert.equal(result.metrics.asignados, 1);
        assert.equal(result.metrics.funcionarios_activos, 1);
        const source = (
          await root.query(
            "select count(*)::int n from inventario.bienes b where situacion='activo' and condicion in ('bueno','regular') and not exists(select 1 from inventario.custodias c where c.bien_id=b.id and c.fin_en is null)",
          )
        ).rows[0].n;
        assert.equal(result.metrics.disponibles, source);
        assert.equal(
          result.metrics.bueno + result.metrics.regular + result.metrics.malo,
          32,
        );
        assert.equal(result.timezone, "UTC");
      },
    );
    await t.test(
      "cinco reportes, buscador separado, orden, totales, subtotales y proyección positiva",
      async () => {
        for (const type of reportTypes) {
          const result = await get(
            "reportes/" + type,
            type === "auditoria" ? a : r,
          );
          assert.equal(result.type, type);
          assert.equal(
            result.total,
            result.sections.reduce((n: number, s: any) => n + s.total, 0),
          );
          assert(!JSON.stringify(result).includes("ID-PRIVADO"));
          assert(!JSON.stringify(result).includes("personal@example.invalid"));
          assert(!JSON.stringify(result).includes("OBSERVACION-PRIVADA"));
        }
        const inv = await get("reportes/inventario");
        assert.equal(inv.sections[0].items.length, 25);
        assert.equal(inv.total, 32);
        assert(inv.sections[0].nextCursor);
        assert.deepEqual(
          inv.sections[0].items.map((v: any) => v.codigo),
          Array.from(
            { length: 25 },
            (_, i) => "TI-" + String(i + 1).padStart(4, "0"),
          ),
        );
        const next = await get(
          "reportes/inventario?cursor=" +
            encodeURIComponent(inv.sections[0].nextCursor),
        );
        assert.equal(next.sections[0].items.length, 7);
        const mixed = await get("buscar?q=sintética");
        assert.equal(mixed.sections.length, 2);
        assert.equal(mixed.sections[1].total, 1);
        const condition = await get("reportes/por-condicion");
        assert.equal(
          Object.values(condition.subtotals).reduce(
            (a: any, b: any) => a + b,
            0,
          ),
          32,
        );
      },
    );
    await t.test(
      "unidad actual frente a instantáneas históricas y fechas UTC inclusivas",
      async () => {
        assert.equal(
          (await get("reportes/inventario?unidad_id=" + x.units[0].id)).total,
          0,
        );
        assert.equal(
          (await get("reportes/inventario?unidad_id=" + x.units[1].id)).total,
          1,
        );
        const history = await get(
          "reportes/movimientos?unidad_id=" + x.units[0].id,
        );
        assert.equal(history.total, 1);
        assert.equal(
          history.sections[0].items[0].unidad_destino,
          "Unidad histórica",
        );
        assert.equal(history.sections[0].items[0].actor, "Admin sintético");
        assert.equal(
          (await get("reportes/inventario?desde=2026-10-01&hasta=2026-10-01"))
            .total,
          31,
        );
        assert.equal(
          (await get("reportes/inventario?desde=2026-10-02")).total,
          0,
        );
        assert.equal(
          (
            await get(
              "reportes/por-funcionario?desde=" +
                new Date().toISOString().slice(0, 10),
            )
          ).total,
          1,
        );
        assert.equal(
          (await get("buscar?desde=2026-10-01&hasta=2026-10-01")).sections[1]
            .total,
          1,
        );
        // Tres eventos sintéticos de frontera; solo deshabilita el sello de fecha de ESTA base efímera.
        await root.query(
          "alter table inventario.movimientos disable trigger z_fecha_servidor",
        );
        const cmd = (
          await root.query("select id from inventario.comandos limit 1")
        ).rows[0].id;
        for (const date of [
          "2026-10-10T00:00:00Z",
          "2026-10-10T23:59:59.999999Z",
          "2026-10-11T00:00:00Z",
        ])
          await root.query(
            "insert into inventario.movimientos(bien_id,tipo,condicion_anterior,condicion_nueva,actor_id,comando_id,motivo,efectiva_en,registrada_en) values($1,'condicion','bueno','regular',$2,$3,'Frontera sintética',$4,$4)",
            [x.b.id, admin, cmd, date],
          );
        await root.query(
          "alter table inventario.movimientos enable trigger z_fecha_servidor",
        );
        assert.equal(
          (await get("reportes/movimientos?desde=2026-10-10&hasta=2026-10-10"))
            .total,
          2,
        );
      },
    );
    await t.test(
      "validación estricta, filtros inaplicables, SQL como texto, MFA/Origin/CSRF y auditoría",
      async () => {
        for (const q of [
          "desde=2026-02-30",
          "desde=2026-11-02&hasta=2026-11-01",
          "actor_id=bad",
          "columns=correo",
          "limit=0",
          "cursor=bad",
          "unidad_id=bad",
        ])
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/reportes/inventario?" + q,
                headers: headers(),
              })
            ).statusCode,
            400,
            q,
          );
        assert.equal(
          (await get("buscar?q=" + encodeURIComponent("' or 1=1 --"))).total,
          0,
        );
        assert.equal(
          (
            await server.inject({
              url: "/api/v1/reportes/auditoria",
              headers: headers(),
            })
          ).statusCode,
          403,
        );
        assert.equal((await create("auditoria", "xlsx")).statusCode, 403);
        assert.equal(
          (await server.inject({ url: "/api/v1/resumen" })).statusCode,
          401,
        );
        const unverified = await x.auth.login(
          "admin@example.invalid",
          "synthetic",
        );
        assert.equal(
          (
            await server.inject({
              url: "/api/v1/resumen",
              headers: headers(unverified),
            })
          ).statusCode,
          403,
        );
        const payload = { tipo: "inventario", formato: "pdf", filtros: {} };
        for (const extra of [
          { "x-csrf-token": "" },
          { origin: "https://otro.invalid" },
        ])
          assert.equal(
            (
              await server.inject({
                method: "POST",
                url: "/api/v1/exportaciones",
                headers: { ...headers(), ...extra },
                payload,
              })
            ).statusCode,
            403,
          );
      },
    );
    await t.test(
      "Excel/PDF de seis salidas, coincidencia completa y datos fórmula como texto",
      async () => {
        for (const type of reportTypes) {
          const session = type === "auditoria" ? a : r;
          const source = await get("reportes/" + type + "?limit=100", session);
          for (const format of ["xlsx", "pdf"] as const) {
            const { response, job } = await file(type, format, {}, session);
            assert.equal(job.total, source.total);
            if (format === "xlsx") {
              const sheets = inspectXlsx(response.rawPayload);
              assert.equal(sheets.length, source.sections.length);
              for (const [i, section] of source.sections.entries()) {
                assert.deepEqual(
                  sheets[i][6],
                  section.columns.map((c: any) => c.label),
                );
                assert.equal(sheets[i].length - 7, section.total);
                assert.deepEqual(
                  sheets[i].slice(7),
                  section.items.map((row: any) =>
                    section.columns.map((c: any) =>
                      row[c.key] === null
                        ? ""
                        : typeof row[c.key] === "boolean"
                          ? row[c.key]
                            ? "Sí"
                            : "No"
                          : String(row[c.key]),
                    ),
                  ),
                );
              }
            } else {
              assert.equal(
                response.rawPayload.subarray(0, 5).toString(),
                "%PDF-",
              );
              const text = execFileSync("pdftotext", ["-layout", "-", "-"], {
                input: response.rawPayload,
                encoding: "utf8",
              });
              assert.match(text, /UTC/);
              assert.match(text, /Total combinado:/);
              if (type === "inventario") {
                assert.match(text, /TI-0032/);
                assert.match(text, /=2\+2/);
                writeFileSync(
                  "docs/evidencias/fase11/inventario-muestra.pdf",
                  response.rawPayload,
                );
              }
            }
          }
        }
      },
    );
    await t.test(
      "vacío válido con cabeceras, metadatos y total cero en ambos formatos",
      async () => {
        for (const format of ["xlsx", "pdf"] as const) {
          const { response, job } = await file("inventario", format, {
            q: "no-existe",
          });
          assert.equal(job.total, 0);
          if (format === "xlsx")
            assert.equal(inspectXlsx(response.rawPayload)[0].length, 7);
          else
            assert.match(
              execFileSync("pdftotext", ["-", "-"], {
                input: response.rawPayload,
                encoding: "utf8",
              }),
              /Total cero/,
            );
        }
      },
    );
    await t.test(
      "PDF conserva texto extenso en varias páginas y trata URLs/HTML como texto",
      async () => {
        const model =
          "<script>https://example.invalid</script> " +
          "Contenido áéíóú ".repeat(115) +
          " MARCADOR-FINAL";
        await root.query(
          "update inventario.bienes set modelo=$1 where codigo='TI-0004'",
          [model],
        );
        const { response } = await file("inventario", "pdf", { q: "ti-0004" });
        const parsed = execFileSync("pdftotext", ["-raw", "-", "-"], {
          input: response.rawPayload,
          encoding: "utf8",
        });
        assert.match(parsed.replace(/\s/g, ""), /MARCADOR-FINAL/);
        assert.match(
          parsed.replace(/\s/g, ""),
          /<script>https:\/\/example.invalid<\/script>/,
        );
        assert(!response.rawPayload.includes(Buffer.from("/JavaScript")));
        assert(!response.rawPayload.includes(Buffer.from("/URI")));
      },
    );
    await t.test(
      "replay concurrente durable, payload distinto, propietario y archivo privado",
      async () => {
        const key = randomUUID();
        const res = await Promise.all([
          create("inventario", "xlsx", {}, key),
          create("inventario", "xlsx", {}, key),
        ]);
        assert(
          res.every((r) => r.statusCode === 202),
          res.map((r) => r.body).join(),
        );
        assert.equal(res[0].json().ref, res[1].json().ref);
        assert.equal(
          (await create("inventario", "pdf", {}, key)).statusCode,
          409,
        );
        const id = res[0].json().ref;
        await ready(id);
        assert.equal(
          (
            await root.query(
              "select count(*)::int n from inventario.exportaciones where clave=$1",
              [key],
            )
          ).rows[0].n,
          1,
        );
        for (const path of ["", "/archivo"])
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/exportaciones/" + id + path,
                headers: headers(x.o),
              })
            ).statusCode,
            404,
          );
        assert.equal(
          (
            await server.inject({
              url: "/api/v1/exportaciones/" + id + "/archivo",
            })
          ).statusCode,
          401,
        );
        // TTL se comprueba sin esperar una hora, solo en artefacto sintético.
        await root.query(
          "alter table inventario.exportaciones disable trigger proteger_exportacion",
        );
        await root.query(
          "update inventario.exportaciones set creado_en=clock_timestamp()-interval '2 hours',vence_en=clock_timestamp()-interval '1 hour' where id=$1",
          [id],
        );
        await root.query(
          "alter table inventario.exportaciones enable trigger proteger_exportacion",
        );
        assert.equal((await get("exportaciones/" + id)).estado, "caducado");
        assert.equal(
          (
            await server.inject({
              url: "/api/v1/exportaciones/" + id + "/archivo",
              headers: headers(),
            })
          ).statusCode,
          410,
        );
        assert.equal(
          (
            await root.query(
              "select archivo,instantanea from inventario.exportaciones where id=$1",
              [id],
            )
          ).rows[0].archivo,
          null,
        );
      },
    );
    await t.test(
      "límites exactos XLSX 10000 / PDF 2000 y exceso rechazado sin truncar",
      async () => {
        await root.query(
          `insert into inventario.bienes(codigo,motivo_sin_serie,tipo,marca,modelo,condicion) select 'LIM-X-'||lpad(n::text,5,'0'),'Sintético','LimiteXLSX','Marca','Modelo','bueno' from generate_series(1,10000)n`,
        );
        const start = performance.now();
        const exact = await file("inventario", "xlsx", { tipo: "LimiteXLSX" });
        assert.equal(exact.job.total, 10000);
        assert.equal(
          inspectXlsx(exact.response.rawPayload)[0].length - 7,
          10000,
        );
        console.log(
          "XLSX 10000 filas ms:",
          Math.round(performance.now() - start),
        );
        await root.query(
          "insert into inventario.bienes(codigo,motivo_sin_serie,tipo,marca,modelo,condicion) values('LIM-X-EXCESO','Sintético','LimiteXLSX','Marca','Modelo','bueno')",
        );
        assert.equal(
          (await create("inventario", "xlsx", { tipo: "LimiteXLSX" })).json()
            .code,
          "EXPORT_LIMIT",
        );
        await root.query(
          `insert into inventario.bienes(codigo,motivo_sin_serie,tipo,marca,modelo,condicion) select 'LIM-P-'||lpad(n::text,5,'0'),'Sintético','LimitePDF','Marca','Modelo','bueno' from generate_series(1,2000)n`,
        );
        const startPdf = performance.now();
        const pdf = await file("inventario", "pdf", { tipo: "LimitePDF" });
        assert.equal(pdf.job.total, 2000);
        const text = execFileSync("pdftotext", ["-layout", "-", "-"], {
          input: pdf.response.rawPayload,
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        });
        assert.match(text, /LIM-P-02000/);
        assert.equal((text.match(/LIM-P-\d{5}/g) ?? []).length, 2000);
        console.log(
          "PDF 2000 filas ms:",
          Math.round(performance.now() - startPdf),
        );
        await root.query(
          "insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,unidad_id) values('ID','MIXTO','LIM-P-Persona','Cargo',$1)",
          [x.units[0].id],
        );
        const mixed = await create("busqueda", "pdf", { q: "lim-p-" });
        assert.equal(mixed.json().code, "EXPORT_LIMIT", mixed.body);
        await root.query(
          "insert into inventario.bienes(codigo,motivo_sin_serie,tipo,marca,modelo,condicion) values('LIM-P-EXCESO','Sintético','LimitePDF','Marca','Modelo','bueno')",
        );
        assert.equal(
          (await create("inventario", "pdf", { tipo: "LimitePDF" })).json()
            .code,
          "EXPORT_LIMIT",
        );
      },
    );
    await t.test(
      "instantánea durable: cambio de datos durante generación no altera contenido/conteo",
      async () => {
        let release!: () => void, started!: () => void;
        const gate = new Promise<void>((r) => (release = r)),
          start = new Promise<void>((r) => (started = r));
        const reports = new Reports(security, async (report, format) => {
          started();
          await gate;
          return renderFile(report, format);
        });
        const job = await reports.create(
          a.sid,
          a.csrf,
          randomUUID(),
          "inventario",
          "xlsx",
          { q: "ti-0002" },
        );
        await start;
        await root.query(
          "update inventario.bienes set modelo='CAMBIO POSTERIOR' where codigo='TI-0002'",
        );
        release();
        await reports.close();
        const bytes = await reports.download(a.sid, job.ref);
        const rows = inspectXlsx(bytes.bytes)[0];
        assert.equal(rows[7][4], "=2+2");
        assert.equal(rows.length - 7, job.total);
      },
    );
    await t.test(
      "errores saneados y recuperación de arrendamiento tras caída sin duplicar trabajo",
      async () => {
        const fail = new Reports(security, async () => {
          throw Error("detalle-secreto-del-generador");
        });
        const job = await fail.create(
          a.sid,
          a.csrf,
          randomUUID(),
          "inventario",
          "pdf",
          { q: "ti-0001" },
        );
        await fail.close();
        const state = await fail.status(a.sid, job.ref);
        assert.equal(state.estado, "fallido");
        assert.equal(state.error, "EXPORT_FAILED");
        assert(!JSON.stringify(state).includes("detalle-secreto"));
        assert.equal(
          (
            await root.query(
              "select instantanea,archivo from inventario.exportaciones where id=$1",
              [job.ref],
            )
          ).rows[0].instantanea,
          null,
        );
        // Simula proceso perdido: crear trabajo sin ejecutarlo y claim vencido, en base efímera.
        const stopped = new Reports(security);
        await stopped.close();
        const recovery = await stopped.create(
          a.sid,
          a.csrf,
          randomUUID(),
          "inventario",
          "pdf",
          { q: "ti-0001" },
        );
        await root.query(
          "update inventario.exportaciones set estado='procesando',intento=$2,arrendamiento_hasta=clock_timestamp()-interval '1 second' where id=$1",
          [recovery.ref, randomUUID()],
        );
        const restored = new Reports(security);
        await restored.status(a.sid, recovery.ref);
        await restored.close();
        assert.equal(
          (await restored.status(a.sid, recovery.ref)).estado,
          "listo",
        );
      },
    );
    await t.test(
      "revocación durante render: no guarda archivo y deniega estado/descarga",
      async () => {
        let release!: () => void, started!: () => void;
        const gate = new Promise<void>((r) => (release = r)),
          start = new Promise<void>((r) => (started = r));
        const reports = new Reports(security, async (report, format) => {
          started();
          await gate;
          return renderFile(report, format);
        });
        const job = await reports.create(
          x.o.sid,
          x.o.csrf,
          randomUUID(),
          "inventario",
          "pdf",
          { q: "ti-0001" },
        );
        await start;
        await root.query(
          "update inventario.cuentas set estado='inactiva',version_autorizacion=version_autorizacion+1 where id=$1",
          ["10000000-0000-4000-8000-000000000003"],
        );
        release();
        await reports.close();
        assert.equal(
          (
            await root.query(
              "select archivo from inventario.exportaciones where id=$1",
              [job.ref],
            )
          ).rows[0].archivo,
          null,
        );
        for (const suffix of ["", "/archivo"])
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/exportaciones/" + job.ref + suffix,
                headers: headers(x.o),
              })
            ).statusCode,
            401,
          );
      },
    );
    await t.test(
      "rol administrativo revocado después de generar bloquea auditoría y archivo existente",
      async () => {
        const job = await file("auditoria", "pdf", {}, a);
        const backup = randomUUID();
        await root.query(
          "insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,'Admin reserva sintético','reserva@example.invalid','administrador','activa',true)",
          [backup],
        );
        await root.query(
          "update inventario.cuentas set rol='lectura',version_autorizacion=version_autorizacion+1 where id=$1",
          [admin],
        );
        const current = await x.auth.login(
          "admin@example.invalid",
          "synthetic",
        );
        assert.equal(
          (
            await server.inject({
              url: "/api/v1/reportes/auditoria",
              headers: headers(current),
            })
          ).statusCode,
          403,
        );
        for (const suffix of ["", "/archivo"])
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/exportaciones/" + job.job.ref + suffix,
                headers: headers(current),
              })
            ).statusCode,
            404,
          );
      },
    );
    await t.test(
      "RLS sin contexto y roles Data API no pueden leer artefactos; outbox sigue pendiente",
      async () => {
        assert.equal(
          (
            await x.business.query(
              "select count(*)::int n from inventario.exportaciones",
            )
          ).rows[0].n,
          0,
        );
        assert.equal(
          (
            await root.query(
              "select has_table_privilege('anon','inventario.exportaciones','select') x,has_table_privilege('authenticated','inventario.exportaciones','select') y",
            )
          ).rows[0].x,
          false,
        );
        assert.equal(
          (
            await root.query(
              "select count(*)::int n from inventario.outbox where estado<>'pendiente'",
            )
          ).rows[0].n,
          0,
        );
      },
    );
  } finally {
    await x.close();
  }
});
