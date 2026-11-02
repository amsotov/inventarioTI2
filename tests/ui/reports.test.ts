import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { fixture, reader } from "../helpers/reports.js";

test("Fase 11: navegador → reportes → exportador privado con datos sintéticos", async (t) => {
  const origin = "http://localhost:4300",
    x = await fixture(origin, resolve("dist/web"));
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
      acceptDownloads: true,
      timezoneId: "America/Santiago",
    }),
    page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const text = async (
    locator: ReturnType<typeof page.locator>,
    pattern: RegExp,
  ) => {
    await locator.filter({ hasText: pattern }).waitFor();
  };
  try {
    await x.server.listen({ host: "127.0.0.1", port: 4300 });
    await page.goto(origin);
    await page
      .getByLabel("Correo", { exact: true })
      .fill("reader@example.invalid");
    await page.getByLabel("Contraseña", { exact: true }).fill("synthetic");
    await page
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await t.test(
      "indicadores reales y zona UTC aunque el navegador use Santiago",
      async () => {
        await page.getByRole("link", { name: "Resumen", exact: true }).click();
        await page
          .getByRole("heading", { name: "Resumen del inventario" })
          .waitFor();
        await text(page.locator(".report-metrics"), /Bienes registrados32/);
        assert.match(await page.locator("main").innerText(), /UTC/);
        assert.match(
          await page.locator("main").innerText(),
          /Á?Fotografía actual/,
        );
      },
    );
    await t.test(
      "paginación, filtros, vacío, error y buscador de dos conjuntos",
      async () => {
        await page
          .getByRole("link", { name: "Reportes y buscador", exact: true })
          .click();
        await page.getByText("Total filtrado: 32", { exact: false }).waitFor();
        assert.equal(await page.locator("tbody tr").count(), 25);
        await page
          .getByRole("button", { name: "Página siguiente", exact: true })
          .click();
        await page.getByText("Página 2", { exact: true }).waitFor();
        await page.getByText("TI-0032", { exact: true }).waitFor();
        assert.equal(await page.locator("tbody tr").count(), 7);
        await page
          .getByRole("button", { name: "Página anterior", exact: true })
          .click();
        await page.getByText("TI-0001", { exact: true }).waitFor();
        await page
          .getByLabel("Tipo de reporte", { exact: true })
          .selectOption("busqueda");
        await page
          .getByLabel("Texto en bienes y funcionarios", { exact: true })
          .fill("no-existe");
        await page
          .getByRole("button", { name: "Aplicar filtros", exact: true })
          .click();
        await page.getByText("Total filtrado: 0", { exact: false }).waitFor();
        await page
          .getByLabel("Texto en bienes y funcionarios", { exact: true })
          .fill("sintética");
        await page
          .getByRole("button", { name: "Aplicar filtros", exact: true })
          .click();
        await page
          .getByRole("heading", { name: "Funcionarios · 1", exact: true })
          .waitFor();
        assert.match(
          await page.locator("main").innerText(),
          /Ángela Sintética/,
        );
        await page
          .getByLabel("Desde (día UTC)", { exact: true })
          .fill("2026-11-02");
        await page
          .getByLabel("Hasta (día UTC, inclusive)", { exact: true })
          .fill("2026-11-01");
        await page
          .getByRole("button", { name: "Aplicar filtros", exact: true })
          .click();
        await page.getByRole("alert").waitFor();
        assert.match(
          await page.getByRole("alert").innerText(),
          /Revisa los campos/,
        );
        await page
          .getByLabel("Tipo de reporte", { exact: true })
          .selectOption("inventario");
        await page.getByText("Total filtrado: 32", { exact: false }).waitFor();
        assert.equal(
          await page
            .getByLabel("Tipo de reporte")
            .locator("option[value=auditoria]")
            .count(),
          0,
        );
      },
    );
    let ref = "";
    await t.test(
      "respuesta perdida tras commit: conserva clave y reintenta sin duplicar",
      async () => {
        let lost = true;
        await page.route("**/api/v1/exportaciones", async (route) => {
          if (route.request().method() === "POST" && lost) {
            lost = false;
            const response = await route.fetch();
            ref = (await response.json()).ref;
            await route.abort("failed");
          } else await route.continue();
        });
        await page
          .getByRole("button", { name: "Exportar Excel", exact: true })
          .click();
        await page
          .getByRole("heading", {
            name: "Solicitud de exportación pendiente",
            exact: true,
          })
          .waitFor();
        await page
          .getByRole("button", {
            name: "Reintentar misma solicitud",
            exact: true,
          })
          .waitFor({ state: "visible" });
        const retry = page.getByRole("button", {
          name: "Reintentar misma solicitud",
          exact: true,
        });
        await page.waitForFunction(
          () =>
            !Array.from(document.querySelectorAll("button")).find(
              (b) => b.textContent === "Reintentar misma solicitud",
            )?.disabled,
        );
        await page.getByRole("link", { name: "Resumen", exact: true }).click();
        assert.equal(
          await page
            .getByRole("heading", {
              name: "Solicitud de exportación pendiente",
              exact: true,
            })
            .count(),
          1,
        );
        await retry.click();
        await page
          .getByRole("button", {
            name: "Descargar archivo privado",
            exact: true,
          })
          .waitFor();
        assert.equal(
          (
            await x.root.query(
              "select count(*)::int n from inventario.exportaciones",
            )
          ).rows[0].n,
          1,
        );
        const download = page.waitForEvent("download");
        await page
          .getByRole("button", {
            name: "Descargar archivo privado",
            exact: true,
          })
          .click();
        const downloaded = await download;
        assert.match(downloaded.suggestedFilename(), /\.xlsx$/);
        assert.equal(
          readFileSync((await downloaded.path())!)
            .subarray(0, 2)
            .toString(),
          "PK",
        );
        await page.unroute("**/api/v1/exportaciones");
      },
    );
    await t.test(
      "recuperar por referencia tras recarga y descargar PDF",
      async () => {
        await page.reload();
        await page
          .getByLabel("Referencia de exportación anterior", { exact: true })
          .fill(ref);
        await page
          .getByRole("button", {
            name: "Recuperar exportación propia",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: "Descargar archivo privado",
            exact: true,
          })
          .waitFor();
        await page
          .getByRole("button", { name: "Exportar PDF", exact: true })
          .click();
        await page
          .getByRole("heading", { name: "Exportación PDF", exact: true })
          .waitFor();
        await page
          .getByRole("button", {
            name: "Descargar archivo privado",
            exact: true,
          })
          .waitFor();
        const download = page.waitForEvent("download");
        await page
          .getByRole("button", {
            name: "Descargar archivo privado",
            exact: true,
          })
          .click();
        assert.match((await download).suggestedFilename(), /\.pdf$/);
      },
    );
    await t.test(
      "computador, iPad e iPhone emulados: tablas, teclado y capturas",
      async () => {
        for (const [name, width, height] of [
          ["computador", 1440, 1000],
          ["ipad", 768, 1024],
          ["iphone", 390, 844],
        ] as const) {
          await page.setViewportSize({ width, height });
          await page
            .getByRole("heading", {
              name: "Reportes y exportación",
              exact: true,
            })
            .waitFor();
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            "Desborde de página " + name,
          );
          const region = page.getByRole("region", {
            name: "Resultados Bienes",
            exact: true,
          });
          await region.focus();
          assert.equal(
            await region.evaluate((el) => el === document.activeElement),
            true,
          );
          await page.keyboard.press("ArrowRight");
          await region.evaluate((element) => {
            element.scrollLeft = 0;
          });
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({
            path: "docs/evidencias/fase11/" + name + ".png",
            fullPage: true,
          });
        }
        assert.deepEqual(errors, []);
      },
    );
    await t.test(
      "administrador con MFA puede consultar y exportar auditoría",
      async () => {
        const adminContext = await browser.newContext({
            acceptDownloads: true,
          }),
          adminPage = await adminContext.newPage();
        adminPage.setDefaultTimeout(10000);
        try {
          await adminPage.goto(origin);
          await adminPage
            .getByLabel("Correo", { exact: true })
            .fill("admin@example.invalid");
          await adminPage
            .getByLabel("Contraseña", { exact: true })
            .fill("synthetic");
          await adminPage
            .getByRole("button", { name: "Iniciar sesión", exact: true })
            .click();
          await adminPage
            .getByRole("button", {
              name: "Configurar autenticador",
              exact: true,
            })
            .click();
          await adminPage
            .getByLabel("Código de seis dígitos", { exact: true })
            .fill("123456");
          await adminPage
            .getByRole("button", { name: "Verificar", exact: true })
            .click();
          await adminPage
            .getByRole("link", { name: "Reportes y buscador", exact: true })
            .click();
          await adminPage
            .getByLabel("Tipo de reporte", { exact: true })
            .selectOption("auditoria");
          await adminPage
            .getByRole("heading", { name: /Auditoría ·/ })
            .waitFor();
          assert(
            !(await adminPage.locator("main").innerText()).includes(
              "ID-PRIVADO",
            ),
          );
          await adminPage
            .getByRole("button", { name: "Exportar Excel", exact: true })
            .click();
          await adminPage
            .getByRole("button", {
              name: "Descargar archivo privado",
              exact: true,
            })
            .waitFor();
        } finally {
          await adminContext.close();
        }
      },
    );
    await t.test(
      "revocación en descarga termina sesión y oculta datos",
      async () => {
        await x.root.query(
          "update inventario.cuentas set estado='inactiva',version_autorizacion=version_autorizacion+1 where id=$1",
          [reader],
        );
        await page
          .getByRole("button", {
            name: "Descargar archivo privado",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", { name: "Iniciar sesión", exact: true })
          .waitFor();
        assert.equal(await page.locator("tbody tr").count(), 0);
      },
    );
  } finally {
    await context.close();
    await browser.close();
    await x.close();
  }
});
