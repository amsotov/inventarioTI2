import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { Pool } from "pg";
import { Postgres } from "../../apps/server/auth/postgres.js";
import { AuthService } from "../../apps/server/auth/service.js";
import { Vault, hash } from "../../apps/server/auth/crypto.js";
import {
  Authorization,
  assertDatabaseRole,
} from "../../apps/server/security/postgres.js";
import {
  allowed,
  permissions,
  publicEmployee,
} from "../../apps/server/security/policy.js";
import { Inventory } from "../../apps/server/inventory/service.js";
import { app } from "../../apps/server/app.js";
import type { Provider, Tokens } from "../../apps/server/auth/ports.js";
const reader = "10000000-0000-4000-8000-000000000001",
  admin = "10000000-0000-4000-8000-000000000002";
class IdentityDouble implements Provider {
  fail = false;
  async login(email: string) {
    return {
      userId: email.startsWith("admin") ? admin : reader,
      access_token: email.startsWith("admin") ? "admin" : "reader",
      refresh_token: "synthetic",
      aal: "aal1" as const,
    };
  }
  async validate(t: Tokens) {
    if (this.fail) throw Error("secret-provider-detail");
    return {
      ...t,
      userId: t.access_token.startsWith("admin") ? admin : reader,
      aal: t.access_token === "admin2" ? ("aal2" as const) : ("aal1" as const),
    };
  }
  async verify() {
    return {
      userId: admin,
      access_token: "admin2",
      refresh_token: "synthetic",
      aal: "aal2" as const,
    };
  }
  async factors() {
    return [];
  }
  async enroll() {
    return { id: "factor", qr: "qr", secret: "secret" };
  }
  private links = new Map<string, string>();
  async link(email: string) {
    if (!this.links.has(email)) this.links.set(email, randomUUID());
    return { userId: this.links.get(email)!, hash: "synthetic" };
  }
  async complete() {
    return reader;
  }
  async logout() {}
}
test("Fase 10: procesos HTTP/Auth/RLS/PostgreSQL (identidad doble)", async (t) => {
  const name = "inventario-api-" + randomUUID(),
    password = randomBytes(24).toString("hex");
  const docker = (...args: string[]) =>
    execFileSync("docker", args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  docker(
    "run",
    "-d",
    "--name",
    name,
    "-e",
    "POSTGRES_PASSWORD=" + password,
    "-p",
    "127.0.0.1::5432",
    "postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f",
  );
  let root: Pool | undefined,
    authPool: Pool | undefined,
    business: Pool | undefined;
  try {
    const cfg = {
      host: "127.0.0.1",
      port: Number(docker("port", name, "5432/tcp").split(":").at(-1)),
      password,
      database: "postgres",
      max: 1,
      statement_timeout: 5000,
      connectionTimeoutMillis: 5000,
    };
    root = new Pool({ ...cfg, user: "postgres" });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try {
        await root.query("select 1");
        ready = true;
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    assert(ready);
    await root.query("create role anon; create role authenticated;");
    for (const file of readdirSync("supabase/migrations").sort())
      await root.query(readFileSync("supabase/migrations/" + file, "utf8"));
    // Credenciales exclusivamente efímeras del ensayo, nunca generadas por la migración.
    await root.query(
      `alter role inventario_auth login password '${password}'; alter role inventario_runtime login password '${password}'`,
    );
    authPool = new Pool({ ...cfg, user: "inventario_auth" });
    business = new Pool({ ...cfg, user: "inventario_runtime" });
    await root.query(
      `insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,'Lectura','reader@example.invalid','lectura','activa',true),($2,$2,'Admin','admin@example.invalid','administrador','activa',true)`,
      [reader, admin],
    );
    await root.query(
      "insert into inventario.unidades(nombre) values ('Unidad sintética')",
    );
    const provider = new IdentityDouble(),
      auth = new AuthService(
        new Postgres(authPool),
        provider,
        new Vault(randomBytes(32).toString("base64")),
        "https://inventario.test",
      );
    const security = new Authorization(auth, business),
      r = await auth.login("reader@example.invalid", "synthetic"),
      partial = await auth.login("admin@example.invalid", "synthetic");
    const a = await auth.verify(partial.sid, partial.csrf, "factor", "123456");
    const server = app(
      auth,
      "https://inventario.test",
      new Inventory(security),
      undefined,
      security,
    );
    const headers = (session = a) => ({
      cookie: "__Host-inventario=" + session.sid,
      origin: "https://inventario.test",
      "x-csrf-token": session.csrf,
      "idempotency-key": randomUUID(),
    });
    const base = { motivo: "Ensayo de proceso", confirmado: true };
    const command = async (
      path: string,
      body: object,
      version?: string,
      key = randomUUID(),
      session = a,
      method: "POST" | "PATCH" = "POST",
    ) =>
      server.inject({
        method,
        url: "/api/v1/" + path,
        headers: {
          ...headers(session),
          "idempotency-key": key,
          ...(version ? { "if-match": `"v${version}"` } : {}),
        },
        payload:
          path === "bienes"
            ? { motivo: base.motivo, ...body }
            : { ...base, ...body },
      });
    const ok = async (
      path: string,
      body: object,
      version?: string,
      method: "POST" | "PATCH" = "POST",
    ) => {
      const res = await command(path, body, version, randomUUID(), a, method);
      assert(res.statusCode < 300, res.body);
      return res.json();
    };
    let f1: any, f2: any, b: any, unit: string, unit2: string;
    try {
      unit = (await root.query("select id from inventario.unidades")).rows[0]
        .id;
      unit2 = (
        await root.query(
          "insert into inventario.unidades(nombre) values('Otra unidad') returning id",
        )
      ).rows[0].id;
      const employee = {
        documento_tipo: "ID",
        documento: " f-1 ",
        nombre: "Persona uno",
        cargo: "Cargo",
        unidad_id: unit,
      };
      await t.test(
        "permisos, MFA, Origin, CSRF y rollback sin destinatario",
        async () => {
          assert.equal(
            (
              await command(
                "funcionarios",
                employee,
                undefined,
                randomUUID(),
                r,
              )
            ).statusCode,
            403,
          );
          const incomplete = await auth.login(
            "admin@example.invalid",
            "synthetic",
          );
          assert.equal(
            (
              await command(
                "funcionarios",
                employee,
                undefined,
                randomUUID(),
                incomplete,
              )
            ).statusCode,
            403,
          );
          for (const h of [
            { ...headers(), origin: "https://evil.invalid" },
            { ...headers(), "x-csrf-token": "bad" },
          ])
            assert.equal(
              (
                await server.inject({
                  method: "POST",
                  url: "/api/v1/funcionarios",
                  headers: h,
                  payload: { ...base, ...employee },
                })
              ).statusCode,
              403,
            );
          assert.equal(
            (await command("funcionarios", employee)).statusCode,
            503,
          );
          assert.equal(
            (
              await root!.query(
                "select count(*)::int n from inventario.funcionarios",
              )
            ).rows[0].n,
            0,
          );
          await root!.query(
            "insert into inventario.configuracion_avisos(destinatario) values('encargado@example.invalid')",
          );
        },
      );
      await t.test(
        "RUT, identidad canónica, unicidad y separación de cuentas",
        async () => {
          assert.equal(
            (
              await command("funcionarios", {
                ...employee,
                documento_tipo: "RUT",
                documento: "12345678-0",
              })
            ).statusCode,
            422,
          );
          f1 = await ok("funcionarios", employee);
          f2 = await ok("funcionarios", {
            ...employee,
            documento: "F-2",
            nombre: "Persona dos",
          });
          assert.equal(
            (await command("funcionarios", { ...employee, documento: "F-1" }))
              .statusCode,
            409,
          );
          assert.equal(
            (
              await root!.query(
                "select count(*)::int n from inventario.cuentas",
              )
            ).rows[0].n,
            2,
          );
          assert.equal(
            (
              await server.inject({
                url: `/api/v1/funcionarios/${f1.ref}/edicion`,
                headers: headers(r),
              })
            ).statusCode,
            403,
          );
          const pub = await server.inject({
            url: `/api/v1/funcionarios/${f1.ref}`,
            headers: headers(r),
          });
          assert(!pub.body.includes("documento"));
          assert.equal(
            (
              await root!.query(
                "select documento from inventario.funcionarios where id=$1",
                [f1.ref],
              )
            ).rows[0].documento,
            "F-1",
          );
          b = await ok("bienes", {
            codigo: "PRO-01",
            tipo: "Notebook",
            marca: "Prueba",
            modelo: "Prueba",
            condicion: "bueno",
            motivo_sin_serie: "Sin serie",
          });
        },
      );
      const version = async () =>
        String(
          (
            await root!.query(
              "select version from inventario.bienes where id=$1",
              [b.ref],
            )
          ).rows[0].version,
        );
      const move = async (body: object) =>
        ok(`bienes/${b.ref}/movimientos`, body, await version());
      await t.test(
        "asignación, replay, versiones y doble asignación concurrente",
        async () => {
          const key = randomUUID(),
            body = { tipo: "asignacion", destino: f1.ref };
          const res = await command(
            `bienes/${b.ref}/movimientos`,
            body,
            "1",
            key,
          );
          assert.equal(res.statusCode, 200, res.body);
          const count = (
            await root!.query(
              "select count(*)::int n from inventario.auditoria",
            )
          ).rows[0].n;
          assert.deepEqual(
            (
              await command(`bienes/${b.ref}/movimientos`, body, "1", key)
            ).json(),
            res.json(),
          );
          assert.equal(
            (
              await root!.query(
                "select count(*)::int n from inventario.auditoria",
              )
            ).rows[0].n,
            count,
          );
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                { ...body, destino: f2.ref },
                "1",
                key,
              )
            ).statusCode,
            409,
          );
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                { tipo: "condicion", condicion: "regular" },
                "1",
              )
            ).statusCode,
            412,
          );
          await move({ tipo: "devolucion", origenEsperado: f1.ref });
          const v = await version();
          const results = await Promise.all([
            command(`bienes/${b.ref}/movimientos`, body, v),
            command(
              `bienes/${b.ref}/movimientos`,
              { ...body, destino: f2.ref },
              v,
            ),
          ]);
          assert.equal(results.filter((x) => x.statusCode === 200).length, 1);
          assert.equal(results.filter((x) => x.statusCode === 412).length, 1);
        },
      );
      await t.test(
        "custodia, pertenencias, condición mala, traslado y bajas",
        async () => {
          const owner = (
            await root!.query(
              "select funcionario_id from inventario.custodias where fin_en is null",
            )
          ).rows[0].funcionario_id;
          const dest = owner === f1.ref ? f2.ref : f1.ref;
          assert.equal(
            (
              await command(
                `funcionarios/${owner}/estado`,
                { activo: false },
                "1",
              )
            ).statusCode,
            422,
          );
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                { tipo: "baja" },
                await version(),
              )
            ).statusCode,
            422,
          );
          await ok(
            `funcionarios/${owner}/pertenencias`,
            { unidad_id: unit2 },
            "1",
          );
          assert.equal(
            (
              await root!.query(
                "select count(*)::int n from inventario.custodias where fin_en is null",
              )
            ).rows[0].n,
            1,
          );
          assert.equal(
            (
              await root!.query(
                "select unidad_destino_nombre from inventario.movimientos where tipo='asignacion' order by id desc limit 1",
              )
            ).rows[0].unidad_destino_nombre,
            "Unidad sintética",
          );
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                { tipo: "traslado", origenEsperado: dest, destino: owner },
                await version(),
              )
            ).statusCode,
            422,
          );
          await move({
            tipo: "traslado",
            origenEsperado: owner,
            destino: dest,
          });
          const intervals = (
            await root!.query(
              "select fin_en from inventario.custodias where funcionario_id=$1 and fin_en is not null order by fin_en desc",
              [owner],
            )
          ).rows;
          const start = (
            await root!.query(
              "select inicio_en from inventario.custodias where fin_en is null",
            )
          ).rows[0].inicio_en;
          assert.equal(+intervals[0].fin_en, +start);
          await move({ tipo: "condicion", condicion: "malo" });
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                { tipo: "traslado", origenEsperado: dest, destino: owner },
                await version(),
              )
            ).statusCode,
            422,
          );
          await move({ tipo: "devolucion", origenEsperado: dest });
          await move({ tipo: "baja" });
          await move({ tipo: "reactivacion" });
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                { tipo: "asignacion", destino: owner },
                await version(),
              )
            ).statusCode,
            422,
          );
          const fv = String(
            (
              await root!.query(
                "select version from inventario.funcionarios where id=$1",
                [owner],
              )
            ).rows[0].version,
          );
          await ok(`funcionarios/${owner}/estado`, { activo: false }, fv);
          assert.equal(
            (await command("funcionarios", employee)).statusCode,
            409,
          );
        },
      );
      await t.test(
        "anotación, compensación vinculada y evidencia inmutable",
        async () => {
          const original = (
            await root!.query(
              "select id from inventario.movimientos order by id limit 1",
            )
          ).rows[0].id;
          const snapshot = (
            await root!.query(
              "select * from inventario.movimientos where id=$1",
              [original],
            )
          ).rows[0];
          await ok(
            `movimientos/${original}/anotaciones`,
            { texto: "Error documentado" },
            await version(),
          );
          await move({
            tipo: "condicion",
            condicion: "regular",
            corrige_id: original,
          });
          assert.deepEqual(
            (
              await root!.query(
                "select * from inventario.movimientos where id=$1",
                [original],
              )
            ).rows[0],
            snapshot,
          );
          const history = await server.inject({
            url: `/api/v1/bienes/${b.ref}/historia`,
            headers: headers(r),
          });
          assert.equal(history.statusCode, 200, history.body);
          assert.equal(history.json().anotaciones.length, 1);
          await assert.rejects(
            business!.query("update inventario.bienes set condicion='bueno'"),
            /permission denied/,
          );
          await assert.rejects(
            root!.query("update inventario.movimientos set motivo='reescrito'"),
            /EVIDENCIA_INMUTABLE/,
          );
        },
      );
      await t.test(
        "edición, reactivación, unidades inactivas, fechas rechazadas e historia paginada",
        async () => {
          const fv = String(
            (
              await root!.query(
                "select version from inventario.funcionarios where id=$1",
                [f1.ref],
              )
            ).rows[0].version,
          );
          const detail = await server.inject({
            url: `/api/v1/funcionarios/${f1.ref}/edicion`,
            headers: headers(),
          });
          assert.equal(detail.statusCode, 200, detail.body);
          const changed = await ok(
            `funcionarios/${f1.ref}`,
            {
              documento_tipo: "RUT",
              documento: "12.345.678-5",
              nombre: "Identidad corregida",
              cargo: "Cargo",
              correo: null,
            },
            fv,
            "PATCH",
          );
          assert.equal(
            (
              await root!.query(
                "select documento from inventario.funcionarios where id=$1",
                [f1.ref],
              )
            ).rows[0].documento,
            "123456785",
          );
          if (!detail.json().activo)
            await ok(
              `funcionarios/${f1.ref}/estado`,
              { activo: true },
              String(changed.version),
            );
          await root!.query(
            "update inventario.unidades set activa=false where id=$1",
            [unit],
          );
          assert.equal(
            (
              await command("funcionarios", {
                ...employee,
                documento: "F-NUEVO",
              })
            ).statusCode,
            422,
          );
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                {
                  tipo: "condicion",
                  condicion: "bueno",
                  efectiva_en: "2025-01-01",
                },
                await version(),
              )
            ).statusCode,
            400,
          );
          const original = (
            await root!.query(
              "select id from inventario.movimientos order by id limit 1",
            )
          ).rows[0].id;
          await root!.query(
            `insert into inventario.anotaciones(movimiento_id,actor_id,comando_id,texto,motivo) select $1,$2,(select id from inventario.comandos limit 1),'Nota sintética','Paginación' from generate_series(1,101)`,
            [original, admin],
          );
          const first = (
            await server.inject({
              url: `/api/v1/bienes/${b.ref}/historia`,
              headers: headers(r),
            })
          ).json();
          assert.equal(first.anotaciones.length, 100);
          assert(first.next.anotaciones);
          const second = (
            await server.inject({
              url: `/api/v1/bienes/${b.ref}/historia?anotaciones=${first.next.anotaciones}`,
              headers: headers(r),
            })
          ).json();
          assert.equal(second.anotaciones.length, 2);
          assert.equal(second.next.anotaciones, null);
        },
      );
      await t.test(
        "dos conexiones SQL independientes: asignación contra baja de funcionario",
        async () => {
          const fresh = await root!.query(
            "insert into inventario.bienes(codigo,tipo,marca,modelo,condicion,motivo_sin_serie) values('RACE','Tipo','Marca','Modelo','bueno','Sin serie') returning id",
          );
          const id = fresh.rows[0].id,
            fv = String(
              (
                await root!.query(
                  "select version from inventario.funcionarios where id=$1",
                  [f1.ref],
                )
              ).rows[0].version,
            );
          const pool = new Pool({ ...cfg, max: 2, user: "inventario_runtime" });
          async function run(op: string, ref: string, v: string, data: object) {
            const client = await pool.connect();
            try {
              await client.query("begin");
              await client.query(
                "select set_config('inventario.sesion',$1,true)",
                [hash(a.sid)],
              );
              await client.query("select inventario.procesar($1,$2,$3,$4,$5)", [
                op,
                ref,
                randomUUID(),
                v,
                { ...base, ...data },
              ]);
              await client.query("commit");
              return "ok";
            } catch (e) {
              await client.query("rollback");
              return (e as Error).message;
            } finally {
              client.release();
            }
          }
          try {
            const result = await Promise.all([
              run("movimiento", id, "1", {
                tipo: "asignacion",
                destino: f1.ref,
              }),
              run("estado", f1.ref, fv, { activo: false }),
            ]);
            assert.equal(
              result.filter((x) => x === "ok").length,
              1,
              JSON.stringify(result),
            );
            assert.equal(
              (
                await root!.query(
                  "select count(*)::int n from inventario.custodias c join inventario.funcionarios f on f.id=c.funcionario_id where c.fin_en is null and not f.activo",
                )
              ).rows[0].n,
              0,
            );
          } finally {
            await pool.end();
          }
        },
      );
      await t.test(
        "fallo de outbox revierte estado, historia y comando",
        async () => {
          await root!.query(
            `create function inventario.fallo_prueba() returns trigger language plpgsql as $$begin raise exception 'fallo sintético';end$$; create trigger fallo before insert on inventario.outbox for each row execute function inventario.fallo_prueba()`,
          );
          const v = await version(),
            counts = (
              await root!.query(
                "select (select count(*) from inventario.movimientos) m,(select count(*) from inventario.comandos) c,(select count(*) from inventario.auditoria) a",
              )
            ).rows[0];
          assert.equal(
            (
              await command(
                `bienes/${b.ref}/movimientos`,
                { tipo: "condicion", condicion: "bueno" },
                v,
              )
            ).statusCode,
            503,
          );
          assert.equal(await version(), v);
          assert.deepEqual(
            (
              await root!.query(
                "select (select count(*) from inventario.movimientos) m,(select count(*) from inventario.comandos) c,(select count(*) from inventario.auditoria) a",
              )
            ).rows[0],
            counts,
          );
        },
      );
    } finally {
      await server.close();
    }
  } finally {
    await business?.end();
    await authPool?.end();
    await root?.end();
    docker("rm", "-f", "-v", name);
  }
});
