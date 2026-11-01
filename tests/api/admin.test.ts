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
test("Fase 9: administración HTTP/Auth/RLS/PostgreSQL (identidad doble)", async (t) => {
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
    const post = async (
      resource: string,
      body: object,
      ref?: string,
      version?: number,
      key = randomUUID(),
      session = a,
    ) =>
      server.inject({
        method: ref ? "PATCH" : "POST",
        url: "/api/v1/admin/" + resource + (ref ? "/" + ref : ""),
        headers: {
          ...headers(session),
          "idempotency-key": key,
          ...(version ? { "if-match": '"v' + version + '"' } : {}),
        },
        payload: body,
      });
    const base = { motivo: "Ensayo sintético", confirmado: true };
    const account = {
      ...base,
      nombre: "Cuenta nueva",
      correo: "new@example.invalid",
      rol: "lectura",
    };
    try {
      await t.test(
        "lectura, ausencia de sesión/MFA, CSRF y Origin denegados",
        async () => {
          assert.equal(
            (await server.inject("/api/v1/admin/cuentas")).statusCode,
            401,
          );
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/admin/cuentas",
                headers: headers(r),
              })
            ).statusCode,
            403,
          );
          assert.equal(
            (
              await post(
                "cuentas",
                account,
                undefined,
                undefined,
                randomUUID(),
                await auth.login("admin@example.invalid", "synthetic"),
              )
            ).statusCode,
            403,
          );
          assert.equal(
            (
              await post(
                "cuentas",
                account,
                undefined,
                undefined,
                randomUUID(),
                r,
              )
            ).statusCode,
            403,
          );
          for (const h of [
            { ...headers(), "x-csrf-token": "bad" },
            { ...headers(), origin: "https://evil.test" },
          ])
            assert.equal(
              (
                await server.inject({
                  method: "POST",
                  url: "/api/v1/admin/cuentas",
                  headers: h,
                  payload: account,
                })
              ).statusCode,
              403,
            );
        },
      );
      await t.test(
        "configuración inicial, evidencia y destinatario previo/nuevo",
        async () => {
          const first = await post("avisos", {
            ...base,
            destinatario: "old@example.invalid",
          });
          assert.equal(first.statusCode, 201, first.body);
          const second = await post(
            "avisos",
            { ...base, destinatario: "new@example.invalid" },
            undefined,
            1,
          );
          assert.equal(second.statusCode, 201, second.body);
          const out = (
            await root!.query(
              "select destinatario,proposito from inventario.outbox order by creado_en",
            )
          ).rows;
          assert(
            out.some(
              (x) =>
                x.destinatario === "old@example.invalid" &&
                x.proposito === "sustitucion_avisos",
            ),
          );
          assert(
            out.some(
              (x) =>
                x.destinatario === "new@example.invalid" &&
                x.proposito === "activacion_avisos",
            ),
          );
        },
      );
      let target = "";
      await t.test(
        "alta pendiente, replay y colisión canónica; no expone proveedor",
        async () => {
          const key = randomUUID(),
            first = await post("cuentas", account, undefined, undefined, key);
          assert.equal(first.statusCode, 201, first.body);
          target = first.json().ref;
          assert.deepEqual(
            (await post("cuentas", account, undefined, undefined, key)).json(),
            first.json(),
          );
          assert.equal(
            (
              await post(
                "cuentas",
                { ...account, nombre: "Otro" },
                undefined,
                undefined,
                key,
              )
            ).statusCode,
            409,
          );
          assert.equal(
            (
              await post("cuentas", {
                ...account,
                correo: "NEW@example.invalid",
              })
            ).statusCode,
            409,
          );
          const list = await server.inject({
            url: "/api/v1/admin/cuentas",
            headers: headers(),
          });
          assert.equal(list.statusCode, 200);
          assert(!list.body.includes("proveedor_ref"));
          assert(!list.body.includes("credencial_lista"));
          assert.equal(
            (
              await root!.query(
                "select estado from inventario.cuentas where id=$1",
                [target],
              )
            ).rows[0].estado,
            "pendiente",
          );
        },
      );
      await t.test(
        "confirmación, tipos, identidad y privilegios no aceptados",
        async () => {
          for (const payload of [
            { ...account, confirmado: false },
            { ...account, rol: "superadmin" },
            { ...account, nombre: 1 },
            { ...account, proveedor_ref: randomUUID() },
          ])
            assert.equal((await post("cuentas", payload)).statusCode, 400);
        },
      );
      await t.test(
        "invitación 24 h y recuperación forzada 30 min sin correo real",
        async () => {
          const issue = () =>
            server.inject({
              method: "POST",
              url: "/api/v1/admin/cuentas/" + target + "/enlace",
              headers: headers(),
              payload: { confirmado: true },
            });
          assert.equal((await issue()).statusCode, 202);
          let intent = (
            await root!.query(
              "select datos from acceso.intenciones where cuenta_id=$1 order by datos->>'expires' desc",
              [target],
            )
          ).rows[0].datos;
          assert.equal(intent.kind, "invite");
          assert.equal(intent.state, "pending");
          assert(Math.abs(intent.expires - Date.now() - 86400000) < 5000);
          await root!.query(
            "update inventario.cuentas set estado='activa',credencial_lista=true where id=$1",
            [target],
          );
          const version = Number(
            (
              await root!.query(
                "select version from inventario.cuentas where id=$1",
                [target],
              )
            ).rows[0].version,
          );
          const forced = await post(
            "cuentas",
            {
              ...base,
              nombre: "Cuenta nueva",
              rol: "lectura",
              estado: "activa",
              forzar: true,
            },
            target,
            version,
          );
          assert.equal(forced.statusCode, 200, forced.body);
          assert.equal(
            (
              await root!.query(
                "select credencial_lista from inventario.cuentas where id=$1",
                [target],
              )
            ).rows[0].credencial_lista,
            false,
          );
          assert.equal((await issue()).statusCode, 202);
          intent = (
            await root!.query(
              "select datos from acceso.intenciones where cuenta_id=$1 and datos->>'state'='pending'",
              [target],
            )
          ).rows[0].datos;
          assert.equal(intent.kind, "recovery");
          assert(Math.abs(intent.expires - Date.now() - 1800000) < 5000);
          assert.equal(
            (
              await root!.query(
                "select count(*)::int n from acceso.entregas where cuenta_id=$1",
                [target],
              )
            ).rows[0].n,
            2,
          );
          await root!.query(
            "update inventario.cuentas set estado='pendiente',credencial_lista=false where id=$1",
            [target],
          );
        },
      );
      await t.test(
        "propia cuenta protegida y versiones obligatorias",
        async () => {
          const edit = {
            ...base,
            nombre: "Cambio",
            rol: "lectura",
            estado: "activa",
          };
          assert.equal((await post("cuentas", edit, admin, 1)).statusCode, 422);
          assert.equal(
            (await post("cuentas", { ...edit, estado: "pendiente" }, target))
              .statusCode,
            428,
          );
          assert.equal(
            (
              await post(
                "cuentas",
                { ...edit, estado: "pendiente" },
                target,
                99,
              )
            ).statusCode,
            412,
          );
          assert.equal(
            (
              await post(
                "cuentas",
                edit,
                target,
                Number(
                  (
                    await root!.query(
                      "select version from inventario.cuentas where id=$1",
                      [target],
                    )
                  ).rows[0].version,
                ),
              )
            ).statusCode,
            422,
          );
        },
      );
      await t.test(
        "catálogo: alta, edición, baja lógica y unicidad",
        async () => {
          const create = await post("unidades", {
            ...base,
            nombre: "Área nueva",
          });
          assert.equal(create.statusCode, 201, create.body);
          assert.equal(
            (await post("unidades", { ...base, nombre: "área nueva" }))
              .statusCode,
            409,
          );
          const edit = await post(
            "unidades",
            { ...base, nombre: "Área editada", activa: false },
            create.json().ref,
            1,
          );
          assert.equal(edit.statusCode, 200, edit.body);
          assert.equal(
            (
              await root!.query(
                "select activa from inventario.unidades where id=$1",
                [create.json().ref],
              )
            ).rows[0].activa,
            false,
          );
        },
      );
      await t.test(
        "rol/estado invalidan sesión en la siguiente petición",
        async () => {
          const first = await post(
            "cuentas",
            {
              ...base,
              nombre: "Lectura editada",
              rol: "lectura",
              estado: "inactiva",
            },
            reader,
            1,
          );
          assert.equal(first.statusCode, 200, first.body);
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/bienes",
                headers: headers(r),
              })
            ).statusCode,
            401,
          );
        },
      );
      await t.test(
        "rollback al fallar auditoría no deja cuenta/comando/aviso",
        async () => {
          const counts = async () =>
            Promise.all(
              ["cuentas", "comandos", "auditoria", "outbox"].map(
                async (tab) =>
                  (
                    await root!.query(
                      "select count(*)::int n from inventario." + tab,
                    )
                  ).rows[0].n,
              ),
            );
          const before = await counts();
          await root!.query(
            "create function inventario.fail_admin() returns trigger language plpgsql as $$begin raise exception 'synthetic'; end$$; create trigger fail_admin before insert on inventario.auditoria for each row execute function inventario.fail_admin()",
          );
          try {
            assert.equal(
              (
                await post("cuentas", {
                  ...account,
                  correo: "rollback@example.invalid",
                })
              ).statusCode,
              503,
            );
            assert.deepEqual(await counts(), before);
          } finally {
            await root!.query(
              "drop trigger fail_admin on inventario.auditoria; drop function inventario.fail_admin()",
            );
          }
        },
      );
      await t.test(
        "sin DML genérico y función SQL deniega lectura/sin sesión",
        async () => {
          await assert.rejects(
            business!.query(
              "update inventario.cuentas set rol='administrador'",
            ),
          );
          await assert.rejects(
            business!.query(
              "select inventario.administrar($1,null,$2,null,$3)",
              ["cuentas", randomUUID(), account],
            ),
          );
        },
      );
      await t.test(
        "dos administradores concurrentes nunca eliminan el último; sesiones SQL reales",
        async () => {
          const other = randomUUID();
          await root!.query(
            "insert into inventario.cuentas(id,nombre,correo,rol,estado,credencial_lista) values($1,'Otro','other@example.invalid','administrador','activa',true)",
            [other],
          );
          const h = hash("synthetic-other"),
            now = Date.now();
          await root!.query(
            "insert into acceso.sesiones(huella,cuenta_id,datos) values($1,$2,$3)",
            [
              h,
              other,
              {
                accountId: other,
                version: "1",
                revoked: false,
                created: now,
                activity: now,
                mfa: true,
              },
            ],
          );
          const pool = new Pool({ ...cfg, user: "inventario_runtime", max: 2 });
          const run = async (session: string, ref: string) => {
            const c = await pool.connect();
            try {
              await c.query("begin");
              await c.query("select set_config('inventario.sesion',$1,true)", [
                session,
              ]);
              await c.query("select inventario.administrar($1,$2,$3,1,$4)", [
                "cuentas",
                ref,
                randomUUID(),
                { ...base, nombre: "Admin", rol: "lectura", estado: "activa" },
              ]);
              await c.query("commit");
              return "ok";
            } catch (e) {
              await c.query("rollback");
              return (e as Error).message;
            } finally {
              c.release();
            }
          };
          try {
            const results = await Promise.all([
              run(hash(a.sid), other),
              run(h, admin),
            ]);
            assert.equal(
              results.filter((x) => x === "ok").length,
              1,
              JSON.stringify(results),
            );
            assert.equal(
              (
                await root!.query(
                  "select count(*)::int n from inventario.cuentas where rol='administrador' and estado='activa'",
                )
              ).rows[0].n,
              1,
            );
          } finally {
            await pool.end();
          }
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
