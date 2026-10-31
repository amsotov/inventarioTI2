/* Pruebas de la demo Fase 2; no acreditan seguridad ni backend. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = process.env.PROTOTYPE_URL || "http://127.0.0.1:4174";
  let count = 0;
  const check = async (name, fn) => {
    await fn();
    console.log(`OK ${++count}: ${name}`);
  };
  let opened = false;
  const go = async (hash) => {
    if (!opened) {
      await page.goto(`${url}/#${hash}`);
      opened = true;
    } else {
      await page.evaluate((h) => (location.hash = h), hash);
      await page.waitForFunction(
        (h) =>
          route === h.split("/")[0] &&
          detail === decodeURIComponent(h.split("/")[1] || ""),
        hash,
      );
    }
    await page.locator("h1").waitFor();
  };
  const action = async (a) =>
    page.locator(`[data-action="${a}"]`).first().click();
  const fill = async (n, v) => page.locator(`#demo-form [name="${n}"]`).fill(v);
  const submit = async () => page.locator('#demo-form [type="submit"]').click();
  const dialog = page.locator("#dialog");
  const expectError = async (text) =>
    assert.match(await page.locator("#form-error").innerText(), text);
  await check("Resumen usa los 8 bienes ficticios", async () => {
    await go("resumen");
    assert.equal(await page.locator(".stat strong").first().innerText(), "8");
  });
  await check("Filtros combinados y vacío", async () => {
    await go("bienes");
    await page.selectOption('[name="condition"]', "Bueno");
    await page.selectOption('[name="custody"]', "libre");
    assert.equal(await page.locator("#goods-result tbody tr").count(), 2);
    await page.fill('[name="q"]', "NO-EXISTE");
    assert.match(
      await page.locator("#goods-result").innerText(),
      /Sin resultados/,
    );
    await action("clear-filters");
    assert.equal(await page.locator("#goods-result tbody tr").count(), 8);
  });
  await check("Rango UTC invertido y extremos inclusivos", async () => {
    await page.fill('[name="start"]', "2026-02-10");
    await page.fill('[name="end"]', "2026-02-10");
    assert.equal(await page.locator("#goods-result tbody tr").count(), 2);
    await page.fill('[name="end"]', "2026-01-01");
    assert.match(
      await page.locator("#goods-result").innerText(),
      /fecha inicial/,
    );
    await action("clear-filters");
  });
  await check(
    "Búsqueda global por persona e ID y navegación a ficha",
    async () => {
      await go("buscar");
      await page.fill("#global-query", "camila");
      assert.equal(await page.locator("#search-result tbody tr").count(), 1);
      await page
        .getByRole("link", { name: "Camila Demo", exact: true })
        .click();
      await page.waitForURL("**/#funcionario/F-DEMO-01");
      assert.equal(await page.locator("h1").innerText(), "Camila Demo");
      assert.equal(
        await page.locator(".panel").nth(1).locator("tbody tr").count(),
        2,
      );
    },
  );
  await check(
    "Alta: obligatorios, duplicado en baja y ausencia de serie",
    async () => {
      await go("bienes");
      await action("new-good");
      await submit();
      await expectError(/obligatorios/);
      await fill("code", "ti-0006");
      await fill("brand", "Demo");
      await fill("model", "Modelo ficticio");
      await fill("date", "2026-10-01");
      await submit();
      await expectError(/ya existe/);
      await fill("code", "TI-DEMO-09");
      await submit();
      await expectError(/ausencia de serie/);
      await fill("serialReason", "No verificable en la muestra");
      await submit();
      await dialog.waitFor({ state: "hidden" });
      assert.equal(await page.locator("#goods-result tbody tr").count(), 9);
    },
  );
  await check("Asignación simulada actualiza ficha e historial", async () => {
    await go("bien/TI-0004");
    await action("move");
    await page.selectOption('#demo-form [name="person"]', "F-DEMO-03");
    await fill("reason", "Entrega ficticia");
    await page.check('[name="confirm"]');
    await submit();
    await dialog.waitFor({ state: "hidden" });
    assert.match(await page.locator("main").innerText(), /Valentina Muestra/);
    assert.match(await page.locator(".panel").last().innerText(), /Asignación/);
  });
  await check(
    "Baja con custodia rechazada; cancelar preserva datos",
    async () => {
      await action("move");
      await page.selectOption('#demo-form [name="operation"]', "Baja");
      await fill("reason", "Prueba");
      await page.check('[name="confirm"]');
      await submit();
      await expectError(/Devuelve/);
      await action("close");
      assert.match(await page.locator(".panel").first().innerText(), /Activo/);
    },
  );
  await check(
    "Traslado a sí mismo rechazado; devolución conserva condición",
    async () => {
      await action("move");
      await page.selectOption('#demo-form [name="operation"]', "Traslado");
      await page.selectOption('#demo-form [name="person"]', "F-DEMO-03");
      await fill("reason", "Prueba");
      await page.check('[name="confirm"]');
      await submit();
      await expectError(/destino distinto/);
      await page.selectOption('#demo-form [name="operation"]', "Devolución");
      await submit();
      await dialog.waitFor({ state: "hidden" });
      assert.match(
        await page.locator(".panel").first().innerText(),
        /Sin asignar/,
      );
      assert.match(await page.locator(".panel").first().innerText(), /Bueno/);
    },
  );
  await check(
    "Mal estado bloquea asignación; custodia existente se conserva",
    async () => {
      await go("bien/TI-0008");
      assert.match(
        await page.locator(".panel").first().innerText(),
        /Diego Ejemplo/,
      );
      await action("move");
      await page.selectOption('#demo-form [name="operation"]', "Traslado");
      await page.selectOption('#demo-form [name="person"]', "F-DEMO-03");
      await fill("reason", "Prueba");
      await page.check('[name="confirm"]');
      await submit();
      await expectError(/mal estado/);
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
    },
  );
  await check("Baja de funcionario con custodia rechazada", async () => {
    await go("funcionario/F-DEMO-01");
    await action("person-state");
    await fill("reason", "Prueba");
    await submit();
    await expectError(/bienes vigentes/);
    await action("close");
  });
  await check(
    "Formulario funcionario: RUT inválido y alta institucional",
    async () => {
      await go("funcionarios");
      await action("new-person");
      await page.selectOption('[name="docType"]', "RUT");
      await fill("id", "12345678-0");
      await fill("name", "Persona Demo");
      await fill("job", "Prueba");
      await submit();
      await expectError(/verificador/);
      await page.selectOption('[name="docType"]', "ID institucional");
      await fill("id", "F-DEMO-05");
      await submit();
      await dialog.waitFor({ state: "hidden" });
      assert.match(await page.locator("main").innerText(), /Persona Demo/);
    },
  );
  await check("Anotación mantiene el original y añade referencia", async () => {
    await go("bien/TI-0001");
    await action("annotation");
    await fill("reason", "Corrección ficticia");
    await submit();
    await dialog.waitFor({ state: "hidden" });
    const text = await page.locator(".panel").last().innerText();
    assert.match(text, /Anotación correctiva/);
    assert.match(text, /MOV-002/);
    assert.match(text, /Asignación/);
  });
  await check("Cinco reportes representados, vista sin descarga", async () => {
    await go("reportes");
    assert.equal(await page.locator(".report-card").count(), 5);
    await action("report");
    assert.match(await dialog.innerText(), /No genera Excel/);
    assert.doesNotMatch(await dialog.innerText(), /camila@example/);
    await action("close");
  });
  await check(
    "Configuración requiere motivo y audita cambio sin envío",
    async () => {
      await go("configuracion");
      await action("recipient");
      await fill("email", "nuevo@example.invalid");
      await submit();
      await expectError(/obligatorios/);
      await fill("reason", "Cambio ficticio");
      await submit();
      await dialog.waitFor({ state: "hidden" });
      assert.match(
        await page.locator("main").innerText(),
        /nuevo@example.invalid/,
      );
      await go("auditoria");
      await page.fill('[name="audit-q"]', "Configuración");
      assert.match(
        await page.locator("#audit-result").innerText(),
        /Cambio de destinatario/,
      );
    },
  );
  await check("Cuenta propia protegida e invitación pendiente", async () => {
    await go("cuentas");
    assert.match(
      await page.locator("main").innerText(),
      /rol y activación protegidos/,
    );
    await action("invite");
    await fill("name", "Invitado Ficticio");
    await fill("email", "invitado@example.invalid");
    await submit();
    await dialog.waitFor({ state: "hidden" });
    assert.match(await page.locator("main").innerText(), /Invitado Ficticio/);
  });
  await check(
    "Lectura oculta escritura y deniega ruta administrativa visual",
    async () => {
      await page.selectOption("#role", "lectura");
      await go("bienes");
      assert.equal(await page.locator('[data-action="new-good"]').count(), 0);
      await go("auditoria");
      assert.match(await page.locator("h1").innerText(), /restringida/);
      await go("reportes");
      assert.equal(await page.locator(".report-card").count(), 4);
      await page.selectOption("#role", "admin");
    },
  );
  await check("Carga, error y reintento demostrables", async () => {
    await go("acceso");
    await action("load-error");
    assert.match(await dialog.innerText(), /Consultando/);
    await page.locator('[data-action="load-retry"]').waitFor();
    assert.match(await dialog.innerText(), /Error simulado/);
    await action("load-retry");
    await dialog.waitFor({ state: "hidden" });
  });
  await check("Recuperación responde sin revelar cuenta", async () => {
    await action("recover");
    await fill("email", "desconocida@example.invalid");
    await submit();
    await dialog.waitFor({ state: "hidden" });
    assert.match(
      await page.locator("#announcement").innerText(),
      /Si la cuenta es elegible/,
    );
  });
  await check("Teclado: salto, diálogo, Escape y retorno de foco", async () => {
    await go("bienes");
    await page.locator(".skip").focus();
    assert.equal(
      await page.locator(".skip").evaluate((e) => e === document.activeElement),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await page
        .locator("#contenido")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await action("new-good");
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => !!document.activeElement.closest("dialog")),
      true,
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .locator('[data-action="new-good"]')
        .evaluate((e) => e === document.activeElement),
      true,
    );
  });
  const evidence = path.resolve(__dirname, "../docs/evidencias/fase2");
  fs.mkdirSync(evidence, { recursive: true });
  await page.reload();
  await check(
    "Responsive: siete tamaños, todas las pantallas sin desborde de página",
    async () => {
      for (const [name, width, height] of [
        ["computador", 1440, 900],
        ["computador-horizontal", 900, 1440],
        ["tablet", 768, 1024],
        ["ipad", 820, 1180],
        ["ipad-horizontal", 1180, 820],
        ["iphone", 390, 844],
        ["iphone-horizontal", 844, 390],
      ]) {
        await page.setViewportSize({ width, height });
        for (const hash of [
          "resumen",
          "bienes",
          "bien/TI-0001",
          "funcionarios",
          "funcionario/F-DEMO-01",
          "buscar",
          "movimientos",
          "reportes",
          "cuentas",
          "auditoria",
          "configuracion",
          "acceso",
        ]) {
          await go(hash);
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
            `${name} ${hash}: desborde`,
          );
        }
        await go("resumen");
        await page.evaluate(() => {
          document.activeElement.blur();
          scrollTo(0, 0);
        });
        if (!name.includes("horizontal"))
          await page.screenshot({
            path: path.join(evidence, `${name}.png`),
            fullPage: true,
          });
      }
    },
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await go("bienes");
  await page.evaluate(() => {
    document.activeElement.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: path.join(evidence, "iphone-bienes.png"),
    fullPage: true,
  });
  await action("new-good");
  await page.screenshot({
    path: path.join(evidence, "iphone-formulario.png"),
    fullPage: true,
  });
  await action("close");
  await check("Sin errores JS ni llamadas API externas", async () => {
    assert.deepEqual(errors, []);
    const external = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((e) => !e.name.startsWith(location.origin)),
    );
    assert.deepEqual(external, []);
  });
  console.log(
    `TOTAL: ${count} verificaciones OK. Chromium ${browser.version()}. Emulación, no dispositivos reales.`,
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
