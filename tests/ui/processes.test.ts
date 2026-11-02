import { chromium } from "@playwright/test";
import { resolve } from "node:path";
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
  async link() {
    return { userId: reader, hash: "synthetic" };
  }
  async complete() {
    return reader;
  }
  async logout() {}
}
test("Fase 10: navegador → BFF → RLS → PostgreSQL sintético (identidad doble)", async (t) => {
  const name = "inventario-ui-" + randomUUID(),
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
  let server: ReturnType<typeof app> | undefined,
    browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    const cfg = {
      host: "127.0.0.1",
      port: Number(docker("port", name, "5432/tcp").split(":").at(-1)),
      password,
      database: "postgres",
      max: 2,
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
      "insert into inventario.configuracion_avisos(destinatario) values('encargado@example.invalid')",
    );
    const origin = "http://localhost:4200";
    const auth = new AuthService(
      new Postgres(authPool),
      new IdentityDouble(),
      new Vault(randomBytes(32).toString("base64")),
      origin,
    );
    server = app(
      auth,
      origin,
      new Inventory(new Authorization(auth, business)),
      resolve("dist/web"),
      new Authorization(auth, business),
    );
    await server.listen({ host: "127.0.0.1", port: 4200 });
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const login = async (email: string) => {
      await page.getByLabel("Correo", { exact: true }).fill(email);
      await page.getByLabel("Contraseña", { exact: true }).fill("synthetic");
      await page
        .getByRole("button", { name: "Iniciar sesión", exact: true })
        .click();
    };
    await root.query(
      "insert into inventario.unidades(nombre) values('Unidad UI')",
    );
    await page.goto(origin);
    await login("admin@example.invalid");
    await page.getByRole("button", { name: "Configurar autenticador" }).click();
    await page.getByLabel("Código de seis dígitos").fill("123456");
    await page.getByRole("button", { name: "Verificar", exact: true }).click();
    await page.getByRole("link", { name: "Funcionarios", exact: true }).click();
    await t.test(
      "alta de funcionario y cancelación sin persistencia",
      async () => {
        await page
          .getByRole("button", { name: "Nuevo funcionario", exact: true })
          .click();
        await page.getByLabel("RUT / ID", { exact: true }).fill("UI-F-01");
        await page.getByLabel("Nombre del funcionario").fill("Funcionario UI");
        await page.getByLabel("Cargo", { exact: true }).fill("Cargo UI");
        await page
          .getByLabel("Unidad destino")
          .selectOption({ label: "Unidad UI" });
        await page.getByLabel("Motivo del proceso").fill("Ensayo de navegador");
        await page.getByLabel("Confirmo el proceso y su motivo").check();
        await page
          .getByRole("button", { name: "Confirmar proceso", exact: true })
          .click();
        await page
          .getByText("Proceso confirmado y auditado.", { exact: true })
          .waitFor();
        await page
          .getByRole("button", { name: "Nuevo funcionario", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Cancelar proceso", exact: true })
          .click();
        assert.equal(
          (
            await root!.query(
              "select count(*)::int n from inventario.funcionarios",
            )
          ).rows[0].n,
          1,
        );
      },
    );
    const employee = (
      await root.query("select id from inventario.funcionarios")
    ).rows[0].id;
    const item = (
      await root.query(
        "insert into inventario.bienes(codigo,tipo,marca,modelo,condicion,motivo_sin_serie) values('UI-PRO','Notebook','Marca','Modelo','bueno','Sin serie') returning id",
      )
    ).rows[0].id;
    await page.goto(origin + "/#bienes/" + item);
    await t.test(
      "asignación y respuesta perdida con replay exacto",
      async () => {
        await page
          .getByRole("button", { name: "asignacion", exact: true })
          .click();
        assert.equal(await page.getByLabel("Buscar por nombre", {exact:true}).count(), 0);
        await page
          .getByLabel("Referencia de funcionario destino")
          .fill(employee);
        await page.getByLabel("Motivo del proceso").fill("Custodia UI");
        await page.getByLabel("Confirmo el proceso y su motivo").check();
        const keys: string[] = [];
        await page.route("**/api/v1/bienes/*/movimientos", async (route) => {
          keys.push(route.request().headers()["idempotency-key"]);
          if (keys.length === 1) {
            await route.fetch();
            await route.abort("failed");
          } else await route.continue();
        });
        await page
          .getByRole("button", { name: "Confirmar proceso", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Reintentar proceso", exact: true })
          .waitFor();
        await page
          .getByRole("link", { name: "Funcionarios", exact: true })
          .click();
        assert(page.url().includes("#bienes/"));
        await page.evaluate(() => {
          location.hash = "funcionarios";
        });
        await page.waitForFunction(() => location.hash.startsWith("#bienes/"));
        await page
          .getByRole("button", { name: "Reintentar proceso", exact: true })
          .waitFor();
        await page
          .getByRole("button", { name: "Reintentar proceso", exact: true })
          .click();
        await page
          .getByText("Proceso confirmado y auditado.", { exact: true })
          .waitFor();
        assert.equal(keys.length, 2);
        assert.equal(keys[0], keys[1]);
        assert.equal(
          (
            await root!.query(
              "select count(*)::int n from inventario.movimientos",
            )
          ).rows[0].n,
          1,
        );
        await page.unroute("**/api/v1/bienes/*/movimientos");
      },
    );
    await t.test(
      "historia, devolución, corrección, responsive y teclado",
      async () => {
        await page
          .getByRole("table", { name: "movimientos", exact: true })
          .waitFor();
        await page
          .getByRole("button", { name: "devolucion", exact: true })
          .click();
        await page.getByLabel("Referencia de custodio actual").fill(employee);
        await page.getByLabel("Motivo del proceso").fill("Devolución UI");
        await page.getByLabel("Confirmo el proceso y su motivo").check();
        await page
          .getByRole("button", { name: "Confirmar proceso", exact: true })
          .click();
        await page
          .getByText("Proceso confirmado y auditado.", { exact: true })
          .waitFor();
        await page
          .getByRole("button", { name: "Anotar corrección", exact: true })
          .click();
        const original = (
          await root!.query(
            "select id from inventario.movimientos order by id limit 1",
          )
        ).rows[0].id;
        await page.getByLabel("Movimiento original").fill(original);
        await page.getByLabel("Texto de corrección").fill("Anotación UI");
        await page.getByLabel("Motivo del proceso").fill("Corrección UI");
        await page.getByLabel("Confirmo el proceso y su motivo").check();
        for (const [name, width, height] of [
          ["computador", 1440, 900],
          ["ipad", 820, 1180],
          ["iphone", 390, 844],
        ] as const) {
          await page.setViewportSize({ width, height });
          await page.screenshot({
            path: "docs/evidencias/fase10/" + name + ".png",
            fullPage: true,
          });
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            name,
          );
        }
        await page.keyboard.press("Tab");
        assert(
          await page.evaluate(() => document.activeElement !== document.body),
        );
        await page
          .getByRole("button", { name: "Confirmar proceso", exact: true })
          .click();
        await page
          .getByText("Proceso confirmado y auditado.", { exact: true })
          .waitFor();
        assert.equal(
          (
            await root!.query(
              "select count(*)::int n from inventario.anotaciones",
            )
          ).rows[0].n,
          1,
        );
      },
    );
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    await server?.close();
    await authPool?.end();
    await business?.end();
    await root?.end();
    docker("rm", "-f", "-v", name);
  }
});
