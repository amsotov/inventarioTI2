import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { fixture } from "../helpers/reports.js";
import { NotificationWorker } from "../../apps/server/notifications/worker.js";

test("Fase 12: navegador, avisos y acciones administrativas con proveedor doble", async (t) => {
  const origin = "http://localhost:4312",
    x = await fixture(origin, resolve("dist/web"));
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({ timezoneId: "America/Santiago" }),
    page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const login = async (isAdmin: boolean) => {
    await context.clearCookies();
    await page.goto(origin);
    await page
      .getByLabel("Correo", { exact: true })
      .fill(isAdmin ? "admin@example.invalid" : "reader@example.invalid");
    await page.getByLabel("Contraseña", { exact: true }).fill("synthetic");
    await page
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    if (isAdmin) {
      await page
        .getByRole("button", { name: "Configurar autenticador", exact: true })
        .click();
      await page
        .getByLabel("Código de seis dígitos", { exact: true })
        .fill("123456");
      await page
        .getByRole("button", { name: "Verificar", exact: true })
        .click();
    }
    await page.getByRole("link", { name: "Resumen", exact: true }).waitFor();
  };
  const open = async () => {
    await page.goto(origin + "/#administracion");
    await page
      .getByRole("heading", { name: "Administración", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Seguimiento de avisos", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Seguimiento de avisos", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: /^Ver aviso / })
      .first()
      .waitFor();
  };
  const current = async (id: string) =>
    (await x.root.query("select * from inventario.outbox where id=$1", [id]))
      .rows[0];
  const detail = async (id: string) => {
    await page
      .getByRole("button", { name: "Ver aviso " + id, exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Detalle del aviso", exact: true })
      .waitFor();
  };
  try {
    await x.server.listen({ host: "127.0.0.1", port: 4312 });
    await login(true);
    await open();
    const jobs = (
      await x.root.query("select id from inventario.outbox order by id")
    ).rows;
    await t.test(
      "consulta real, confirmación, cancelación y auditoría",
      async () => {
        assert.match(await page.locator("main").innerText(), /UTC/);
        await detail(jobs[0].id);
        assert.equal(
          await page
            .getByText(
              "Destino original: encargado@example.invalid · Estado: pendiente",
              { exact: true },
            )
            .count(),
          1,
        );
        await page
          .getByLabel("Motivo de la acción", { exact: true })
          .fill("Cancelación sintética desde navegador");
        await page
          .getByLabel(
            "Confirmo la acción sobre este aviso y su destinatario original",
            { exact: true },
          )
          .check();
        await page
          .getByRole("button", {
            name: "Confirmar acción del aviso",
            exact: true,
          })
          .click();
        await page
          .getByText("Acción registrada y auditada.", { exact: true })
          .waitFor();
        assert.equal((await current(jobs[0].id)).estado, "cancelado");
        assert.equal(
          (
            await x.root.query(
              "select count(*) from inventario.auditoria where entidad='aviso' and entidad_ref=$1",
              [jobs[0].id],
            )
          ).rows[0].count,
          "1",
        );
      },
    );
    await t.test(
      "incierto requiere evidencia, conciliación y reintento separado",
      async () => {
        await x.root.query(
          "update inventario.outbox set siguiente_en=clock_timestamp()+interval '1 day' where estado='pendiente'",
        );
        await x.root.query(
          "update inventario.outbox set siguiente_en=clock_timestamp() where id=$1",
          [jobs[1].id],
        );
        const worker = new NotificationWorker(
          x.workerPool,
          {
            async send() {
              throw Error("SECRET-RAW-PROVIDER");
            },
          },
          "https://inventario.test",
        );
        await worker.tick();
        await page
          .getByLabel("Estado del aviso", { exact: true })
          .selectOption("incierto");
        await detail(jobs[1].id);
        assert.equal(
          await page
            .getByRole("option", { name: "Reintentar fallo", exact: true })
            .count(),
          0,
        );
        await page
          .getByLabel("Resultado verificado", { exact: true })
          .selectOption("no_enviado");
        await page
          .getByLabel("Evidencia de conciliación", { exact: true })
          .fill("Proveedor doble confirma ausencia de envío");
        await page
          .getByLabel("Motivo de la acción", { exact: true })
          .fill("Conciliación sintética");
        await page
          .getByLabel(
            "Confirmo la acción sobre este aviso y su destinatario original",
            { exact: true },
          )
          .check();
        await page
          .getByRole("button", {
            name: "Confirmar acción del aviso",
            exact: true,
          })
          .click();
        await page
          .getByText("Sin avisos para este filtro.", { exact: true })
          .waitFor();
        assert.equal((await current(jobs[1].id)).estado, "fallido");
        await page
          .getByLabel("Estado del aviso", { exact: true })
          .selectOption("fallido");
        await detail(jobs[1].id);
        await page
          .getByLabel("Motivo de la acción", { exact: true })
          .fill("Reintento con destino original");
        await page
          .getByLabel(
            "Confirmo la acción sobre este aviso y su destinatario original",
            { exact: true },
          )
          .check();
        await page
          .getByRole("button", {
            name: "Confirmar acción del aviso",
            exact: true,
          })
          .click();
        await page
          .getByText("Sin avisos para este filtro.", { exact: true })
          .waitFor();
        assert.equal((await current(jobs[1].id)).estado, "pendiente");
        assert(
          !(await page
            .locator("main")
            .innerText()
            .then((s) => s.includes("SECRET-RAW-PROVIDER"))),
        );
      },
    );
    await t.test(
      "respuesta perdida conserva clave/versión/cuerpo y recupera sin duplicar auditoría",
      async () => {
        await page
          .getByLabel("Estado del aviso", { exact: true })
          .selectOption("pendiente");
        await detail(jobs[2].id);
        const requests: {
          key: string | undefined;
          version: string | undefined;
          body: string | null;
        }[] = [];
        let drop = true;
        await page.route("**/api/v1/avisos/*/acciones", async (route) => {
          const r = route.request();
          requests.push({
            key: r.headers()["idempotency-key"],
            version: r.headers()["if-match"],
            body: r.postData(),
          });
          if (drop) {
            drop = false;
            await route.fetch();
            await route.abort("failed");
          } else await route.continue();
        });
        await page
          .getByLabel("Motivo de la acción", { exact: true })
          .fill("Respuesta perdida sintética");
        await page
          .getByLabel(
            "Confirmo la acción sobre este aviso y su destinatario original",
            { exact: true },
          )
          .check();
        await page
          .getByRole("button", {
            name: "Confirmar acción del aviso",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: "Recuperar resultado de la acción",
            exact: true,
          })
          .waitFor();
        await page
          .getByRole("button", {
            name: "Recuperar resultado de la acción",
            exact: true,
          })
          .click();
        await page
          .getByText("Acción registrada y auditada.", { exact: true })
          .waitFor();
        assert.equal(requests.length, 2);
        assert.deepEqual(requests[0], requests[1]);
        assert.equal((await current(jobs[2].id)).estado, "cancelado");
        assert.equal(
          (
            await x.root.query(
              "select count(*) from inventario.auditoria where entidad='aviso' and entidad_ref=$1",
              [jobs[2].id],
            )
          ).rows[0].count,
          "1",
        );
        await page.unroute("**/api/v1/avisos/*/acciones");
      },
    );
    await t.test(
      "conflicto de versión conserva registro y explica recarga",
      async () => {
        await detail(jobs[1].id);
        await x.root.query(
          "update inventario.outbox set version=version+1 where id=$1",
          [jobs[1].id],
        );
        await page
          .getByLabel("Motivo de la acción", { exact: true })
          .fill("Conflicto sintético");
        await page
          .getByLabel(
            "Confirmo la acción sobre este aviso y su destinatario original",
            { exact: true },
          )
          .check();
        await page
          .getByRole("button", {
            name: "Confirmar acción del aviso",
            exact: true,
          })
          .click();
        await page
          .getByRole("alert")
          .filter({ hasText: "Otro usuario modificó este registro" })
          .waitFor();
        assert.equal((await current(jobs[1].id)).estado, "pendiente");
        await page
          .getByRole("button", { name: "Actualizar avisos", exact: true })
          .click();
      },
    );
    await t.test(
      "teclado, carga/vacío/error y computador/iPad/iPhone emulados",
      async () => {
        await page
          .getByLabel("Estado del aviso", { exact: true })
          .selectOption("entregado");
        await page
          .getByText("Sin avisos para este filtro.", { exact: true })
          .waitFor();
        await page.route("**/api/v1/avisos?**", (route) =>
          route.fulfill({
            status: 503,
            contentType: "application/problem+json",
            body: JSON.stringify({ code: "DEPENDENCY_UNAVAILABLE" }),
          }),
        );
        await page
          .getByRole("button", { name: "Actualizar avisos", exact: true })
          .click();
        await page
          .getByRole("alert")
          .filter({ hasText: "Servicio no disponible" })
          .waitFor();
        await page.unroute("**/api/v1/avisos?**");
        await page
          .getByLabel("Estado del aviso", { exact: true })
          .selectOption("");
        await page
          .getByRole("button", { name: /^Ver aviso / })
          .first()
          .waitFor();
        await detail(jobs[1].id);
        await page.getByLabel("Motivo de la acción", { exact: true }).focus();
        await page.keyboard.press("Tab");
        assert.equal(
          await page
            .getByLabel(
              "Confirmo la acción sobre este aviso y su destinatario original",
              { exact: true },
            )
            .evaluate((e) => e === document.activeElement),
          true,
        );
        mkdirSync("docs/evidencias/fase12", { recursive: true });
        for (const [name, width, height] of [
          ["computador", 1440, 1000],
          ["ipad", 768, 1024],
          ["iphone", 390, 844],
        ] as const) {
          await page.setViewportSize({ width, height });
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            name,
          );
          await page.screenshot({
            path: "docs/evidencias/fase12/" + name + ".png",
            fullPage: true,
          });
        }
        assert.deepEqual(errors, []);
      },
    );
    await t.test(
      "lectura no accede a destinatarios ni acciones por navegación directa",
      async () => {
        await login(false);
        await page.goto(origin + "/#administracion");
        await page
          .getByRole("heading", { name: "Acceso restringido", exact: true })
          .waitFor();
        assert(
          !(await page
            .locator("main")
            .innerText()
            .then((s) => s.includes("encargado@example.invalid"))),
        );
        assert.equal(
          await page
            .getByRole("button", { name: "Seguimiento de avisos", exact: true })
            .count(),
          0,
        );
      },
    );
  } finally {
    await context.close();
    await browser.close();
    await x.close();
  }
});
