import { chromium, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
const url = process.env.DEMO_URL || "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ acceptDownloads: true });
const unexpected = [],
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (
    !r.url().startsWith(new URL(url).origin) ||
    new URL(r.url()).pathname.startsWith("/api/")
  )
    unexpected.push(r.url());
});
page.on("dialog", (d) => d.accept());
const goto = async (hash) => {
  await page.goto(url + "#" + hash);
};
const confirmProcess = async () => {
  await page.getByLabel("Motivo del proceso").fill("Prueba demo");
  await page.getByLabel("Confirmo el proceso y su motivo").check();
  await page
    .getByRole("button", { name: "Confirmar proceso", exact: true })
    .click();
  await expect(page.locator('.success[role="status"]')).toContainText(
    "Proceso confirmado",
  );
  await expect(page.locator('.success[role="status"]')).toContainText(
    "Correo simulado",
  );
};
try {
  await goto("bienes");
  await expect(
    page.getByRole("region", { name: "Modo demo", exact: true }),
  ).toBeVisible();
  await expect(page.locator("table:has(caption)")).toContainText("TI-0001");
  await expect(
    page.getByRole("heading", { name: "Acceso al inventario" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Nuevo bien", exact: true }).click();
  await page.getByLabel("Código *", { exact: true }).fill("DEMO-TEST");
  await page.getByLabel("Tipo *", { exact: true }).fill("Notebook");
  await page.getByLabel("Marca *", { exact: true }).fill("Lenovo");
  await page.getByLabel("Modelo *", { exact: true }).fill("Prueba");
  await page.getByLabel("Serie", { exact: true }).fill("DEMO-TEST-SN");
  await page.getByLabel("Motivo del cambio *", { exact: true }).fill("Prueba");
  await page.getByRole("button", { name: "Guardar bien", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Editar atributos", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Editar atributos", exact: true })
    .click();
  await page.getByLabel("Modelo *", { exact: true }).fill("Modelo editado");
  await page
    .getByLabel("Motivo del cambio *", { exact: true })
    .fill("Edición demo");
  await page.getByRole("button", { name: "Guardar bien", exact: true }).click();
  await expect(page.locator("dl").first()).toContainText("Modelo editado");
  await page.getByRole("button", { name: "asignacion", exact: true }).click();
  await page
    .getByLabel("Referencia de funcionario destino")
    .fill("00000000-0000-4000-8000-000000000010");
  await confirmProcess();
  await expect(
    page.getByRole("table", { name: "custodias", exact: true }),
  ).toContainText("00000000-0000-4000-8000-000000000010");
  await page.getByRole("button", { name: "traslado", exact: true }).click();
  await page
    .getByLabel("Referencia de funcionario destino")
    .fill("00000000-0000-4000-8000-000000000011");
  await confirmProcess();
  await expect(
    page.getByRole("table", { name: "movimientos", exact: true }),
  ).toContainText("traslado");
  await page.getByLabel("Rol demo", { exact: true }).selectOption("lectura");
  await expect(
    page.getByRole("button", { name: "Editar atributos", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Eliminar de la demo", exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Rol demo", { exact: true })
    .selectOption("administrador");
  await page
    .getByRole("button", { name: "Eliminar de la demo", exact: true })
    .click();
  await expect(page.locator("table:has(caption)")).not.toContainText("DEMO-TEST");
  await page.getByRole("link", { name: "Funcionarios", exact: true }).click();
  await page
    .getByRole("button", { name: "Nuevo funcionario", exact: true })
    .click();
  await page.getByLabel("RUT / ID").fill("TEST-ID");
  await page.getByLabel("Nombre del funcionario").fill("Persona prueba");
  await page.getByLabel("Cargo", { exact: true }).fill("Analista");
  await page
    .getByLabel("Unidad destino")
    .selectOption("00000000-0000-4000-8000-000000000001");
  await confirmProcess();
  await page
    .getByRole("row")
    .filter({ hasText: "Persona prueba" })
    .getByRole("link", { name: "Ver ficha" })
    .click();
  await page
    .getByRole("button", { name: "Editar funcionario", exact: true })
    .click();
  await page.getByLabel("Nombre del funcionario").fill("Persona editada");
  await confirmProcess();
  await expect(page.locator("dl").first()).toContainText("Persona editada");
  await page
    .getByRole("button", { name: "Cambiar unidad", exact: true })
    .click();
  await page
    .getByLabel("Unidad destino")
    .selectOption("00000000-0000-4000-8000-000000000002");
  await confirmProcess();
  await expect(
    page.getByRole("table", { name: "pertenencias", exact: true }),
  ).toContainText("Administración");
  await page
    .getByRole("button", { name: "Eliminar de la demo", exact: true })
    .click();
  await expect(page.locator("table:has(caption)")).not.toContainText("Persona editada");
  await page.getByRole("link", { name: "Bienes", exact: true }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "TI-0001" })
    .getByRole("link", { name: "Ver ficha" })
    .click();
  await page
    .getByRole("button", { name: "Editar atributos", exact: true })
    .click();
  await page.getByLabel("Modelo *", { exact: true }).fill("Modelo temporal");
  await page
    .getByLabel("Motivo del cambio *", { exact: true })
    .fill("Cambio temporal para exportar");
  await page.getByRole("button", { name: "Guardar bien", exact: true }).click();
  await expect(page.locator("dl").first()).toContainText("Modelo temporal");
  await page
    .getByRole("link", { name: "Reportes y buscador", exact: true })
    .click();
  await page
    .getByLabel("Texto en código, serie, tipo, marca o modelo", { exact: true })
    .fill("Modelo temporal");
  await page
    .getByRole("button", { name: "Aplicar filtros", exact: true })
    .click();
  await expect(
    page.getByText("Total filtrado:", { exact: false }),
  ).toContainText("Total filtrado: 1");
  for (const format of ["Excel", "PDF"]) {
    await page
      .getByRole("button", { name: "Exportar " + format, exact: true })
      .click();
    console.log("Downloading", format);
    const download = page
      .waitForEvent("download", { timeout: 10000 })
      .catch(async (e) => {
        console.error(await page.locator("body").innerText(), errors);
        throw e;
      });
    await page
      .getByRole("button", { name: "Descargar archivo privado", exact: true })
      .click();
    const file = await download;
    const bytes = await readFile(await file.path());
    if (format === "Excel") {
      const zip = unzipSync(bytes);
      const xml = Object.values(zip).map(strFromU8).join("");
      assert.ok(
        xml.includes("TI-0001") &&
          xml.includes("Modelo temporal") &&
          !xml.includes("TI-0002"),
      );
    } else {
      assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
      assert.ok(
        bytes.toString().includes("TI-0001") &&
          bytes.toString().includes("Modelo temporal") &&
          !bytes.toString().includes("TI-0002"),
      );
    }
  }
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bienes registrados", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Bienes registrados", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Bienes", exact: true }).click();
  await expect(page.locator("table:has(caption)")).not.toContainText("DEMO-TEST");
  await page
    .getByRole("row")
    .filter({ hasText: "TI-0001" })
    .getByRole("link", { name: "Ver ficha" })
    .click();
  await expect(page.locator("dl").first()).toContainText("ThinkPad E14");
  await expect(page.locator("dl").first()).not.toContainText("Modelo temporal");
  if (process.env.DEMO_PUBLICATION_CHECK === 'true') {
    await page.getByRole('link', {name:'Modernización · vista previa', exact:true}).click();
    await expect(page.getByRole('heading', {name:'Modernización', exact:true})).toBeVisible();
    await expect(page.locator('figure img')).toHaveCount(6);
    for (const picture of await page.locator('figure img').all()) {
      await picture.scrollIntoViewIfNeeded();
      await expect(picture).toHaveJSProperty('complete', true);
      assert(await picture.evaluate(img => img.naturalWidth > 0));
    }
    await page.getByRole('link', {name:'Abrir prototipo de modernización', exact:true}).click();
    await expect(page.getByText('Propuesta de diseño · FASE 3', {exact:true})).toBeVisible();
    await page.getByRole('link', {name:'Equipos', exact:true}).click();
    await expect(page.getByRole('heading', {name:'Equipos', exact:true})).toBeVisible();
    console.log('PASS: publication preview, six images and navigable prototype.');
  }
  assert.deepEqual(unexpected, [], "No external or API requests");
  assert.deepEqual(errors, [], "No browser errors");
  console.log(
    "PASS: demo entry, equipment/person CRUD, assignment/transfer/history, roles, mail simulation, XLSX/PDF contents, hash reload, zero API/external requests. " +
      url,
  );
} finally {
  await browser.close();
}
