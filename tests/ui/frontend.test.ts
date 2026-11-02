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
test("Fase 8: navegador → BFF → RLS → PostgreSQL sintético (identidad doble)", async (t) => {
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
    const origin = "http://localhost:4188";
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
    );
    await server.listen({ host: "127.0.0.1", port: 4188 });
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
    await page.goto(origin);
    await t.test("sesión, lector, vacío y seguridad de assets", async () => {
      await login("reader@example.invalid");
      await page
        .getByRole("status")
        .filter({ hasText: "Sin resultados" })
        .waitFor();
      assert.equal(
        await page
          .getByRole("link", { name: "Nuevo bien", exact: true })
          .count(),
        0,
      );
      await page.goto(origin + "/#bienes/nuevo");
      await page
        .getByRole("alert")
        .filter({ hasText: "No tienes permiso" })
        .waitFor();
      assert.equal(
        await page.evaluate(async () =>
          fetch("/api/v1/bienes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          }).then((r) => r.status),
        ),
        400,
      );
      const cookies = await page.context().cookies();
      assert(
        cookies[0].httpOnly &&
          cookies[0].secure &&
          cookies[0].sameSite === "Strict",
      );
      assert.equal(await page.evaluate(() => localStorage.length), 0);
      await page.getByRole("button", { name: "Cerrar sesión" }).click();
      await page
        .getByRole("heading", { name: "Acceso al inventario" })
        .waitFor();
    });
    await t.test(
      "acceso MFA, alta persistida y edición con representación completa",
      async () => {
        await login("admin@example.invalid");
        await page
          .getByRole("heading", { name: "Verificación de administrador" })
          .waitFor();
        await page
          .getByRole("button", { name: "Configurar autenticador" })
          .click();
        await page.getByLabel("Código de seis dígitos").fill("123456");
        await page
          .getByRole("button", { name: "Verificar", exact: true })
          .click();
        await page.goto(origin + "/#bienes");
        await page
          .getByRole("link", { name: "Nuevo bien", exact: true })
          .click();
        for (const [label, value] of Object.entries({
          "Código *": "UI-001",
          Tipo: "Notebook",
          Marca: "Marca sintética",
          Modelo: "Modelo",
          "Motivo de ausencia de serie": "Sin serie",
          "Motivo del cambio": "Alta sintética",
        }))
          await page.getByLabel(label, { exact: false }).fill(value);
        await page
          .getByRole("button", { name: "Guardar bien", exact: true })
          .click();
        await page.getByRole("button", { name: "Editar atributos" }).waitFor();
        assert.equal(
          (
            await root!.query(
              "select count(*)::int n from inventario.bienes where codigo='UI-001'",
            )
          ).rows[0].n,
          1,
        );
        await page.getByRole("button", { name: "Editar atributos" }).click();
        await page
          .getByLabel("Modelo *", { exact: true })
          .fill("Modelo editado");
        await page.getByLabel("Motivo del cambio").fill("Corrección");
        await page
          .getByRole("button", { name: "Guardar bien", exact: true })
          .click();
        await page.getByText("Modelo editado", { exact: true }).waitFor();
        assert.equal(
          (
            await root!.query(
              "select version::int from inventario.bienes where codigo='UI-001'",
            )
          ).rows[0].version,
          2,
        );
      },
    );
    await t.test(
      "respuesta perdida: replay explícito conserva clave y no duplica evidencia",
      async () => {
        await page.getByRole("button", { name: "Editar atributos" }).click();
        await page
          .getByLabel("Motivo del cambio")
          .fill("Ensayo de respuesta perdida");
        const keys: string[] = [];
        await page.route("**/api/v1/bienes/*", async (route) => {
          if (route.request().method() !== "PATCH") return route.continue();
          keys.push(route.request().headers()["idempotency-key"]);
          if (keys.length === 1) {
            await route.fetch();
            await route.abort("failed");
          } else await route.continue();
        });
        await page
          .getByRole("button", { name: "Guardar bien", exact: true })
          .click();
        await page.getByText("Resultado incierto.", { exact: false }).waitFor();
        const before = (
          await root!.query("select count(*)::int n from inventario.auditoria")
        ).rows[0].n;
        await page
          .getByRole("button", { name: "Reintentar la misma operación" })
          .click();
        await page.getByRole("button", { name: "Editar atributos" }).waitFor();
        assert.equal(keys.length, 2);
        assert.equal(keys[0], keys[1]);
        assert.equal(
          (
            await root!.query(
              "select count(*)::int n from inventario.auditoria",
            )
          ).rows[0].n,
          before,
        );
        await page.unroute("**/api/v1/bienes/*");
      },
    );
    await t.test(
      "conflicto concurrente 412 conserva edición y obliga a recargar",
      async () => {
        await page.getByRole("button", { name: "Editar atributos" }).click();
        await page
          .getByLabel("Modelo *", { exact: true })
          .fill("Cambio obsoleto");
        await page.getByLabel("Motivo del cambio").fill("Conflicto sintético");
        await root!.query(
          "update inventario.bienes set version=version+1 where codigo='UI-001'",
        );
        await page
          .getByRole("button", { name: "Guardar bien", exact: true })
          .click();
        await page
          .getByRole("alert")
          .filter({ hasText: "Otro usuario" })
          .waitFor();
        assert.equal(
          (
            await root!.query(
              "select modelo from inventario.bienes where codigo='UI-001'",
            )
          ).rows[0].modelo,
          "Modelo editado",
        );
        await page.getByRole("button", { name: "Recargar ficha" }).click();
        await page.getByRole("button", { name: "Editar atributos" }).waitFor();
      },
    );
    await t.test(
      "filtros, vacío, ficha y escape de contenido sin ejecutar HTML",
      async () => {
        await page.goto(origin + "/#bienes");
        await page.getByLabel("Buscar por código").fill("sin-coincidencia");
        await page.getByRole("button", { name: "Aplicar filtros" }).click();
        await page
          .getByText("Sin resultados para los filtros seleccionados.")
          .waitFor();
        await page
          .getByRole("button", { name: "Limpiar", exact: true })
          .click();
        await page.getByText("UI-001", { exact: true }).waitFor();
        await root!.query(
          "update inventario.bienes set modelo='<img src=x onerror=alert(1)>' where codigo='UI-001'",
        );
        await page.reload();
        await page
          .getByText("<img src=x onerror=alert(1)>", { exact: true })
          .waitFor();
        assert.equal(await page.locator("td img").count(), 0);
      },
    );
    await t.test(
      "paginación real y reinicio de cursor al filtrar",
      async () => {
        await root!.query(
          "insert into inventario.bienes(codigo,tipo,marca,modelo,condicion,motivo_sin_serie) select 'PAGE-'||n,'Notebook','Sintética','Modelo','bueno','Muestra' from generate_series(1,26) n",
        );
        await page.reload();
        await page
          .getByRole("button", { name: "Siguiente", exact: true })
          .waitFor();
        await page
          .getByRole("button", { name: "Siguiente", exact: true })
          .click();
        await page.getByText("Página 2", { exact: true }).waitFor();
        await page.getByLabel("Buscar por código").fill("UI-001");
        await page.getByRole("button", { name: "Aplicar filtros" }).click();
        await page.getByText("Página 1", { exact: true }).waitFor();
        await page.getByText("UI-001", { exact: true }).waitFor();
        assert(
          await page
            .getByRole("button", { name: "Siguiente", exact: true })
            .isDisabled(),
        );
      },
    );
    await t.test("responsive computador/iPad/iPhone y teclado", async () => {
      await root!.query(
        "update inventario.bienes set modelo='Modelo editado' where codigo='UI-001'",
      );
      await page.reload();
      await page.getByLabel("Buscar por código").fill("UI-001");
      await page.getByRole("button", { name: "Aplicar filtros", exact: true }).click();
      await page.getByText("Modelo editado", { exact: true }).waitFor();
      for (const [name, width, height] of [
        ["computador", 1440, 900],
        ["ipad", 820, 1180],
        ["iphone", 390, 844],
      ] as const) {
        await page.setViewportSize({ width, height });
        await page.screenshot({
          path: "docs/evidencias/fase8/" + name + ".png",
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
    });
    await t.test("errores 503 y expiración 401 al revocar cuenta", async () => {
      await page.route("**/api/v1/unidades*", (r) =>
        r.fulfill({
          status: 503,
          contentType: "application/problem+json",
          body: JSON.stringify({
            code: "DEPENDENCY_UNAVAILABLE",
            requestId: "synthetic",
          }),
        }),
      );
      await page.getByRole("link", { name: "Unidades", exact: true }).click();
      await page
        .getByRole("alert")
        .filter({ hasText: "Servicio no disponible" })
        .waitFor();
      await page.unroute("**/api/v1/unidades*");
      await root!.query(
        "update inventario.cuentas set version_autorizacion=version_autorizacion+1 where id=$1",
        [admin],
      );
      await page.getByRole("button", { name: "Volver a consultar" }).click();
      await page
        .getByRole("heading", { name: "Acceso al inventario" })
        .waitFor();
      assert.equal(await page.getByText("UI-001", { exact: true }).count(), 0);
    });
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    await server?.close();
    await authPool?.end();
    await business?.end();
    await root?.end();
    docker("rm", "-f", name);
  }
});
