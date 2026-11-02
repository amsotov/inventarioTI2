import { test } from 'node:test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from '@playwright/test';

test('clicking the current route during a delayed inventory response preserves its results', async () => {
  // Isolated UI fixture; public preview checks use real GoTrue/PostgreSQL separately.
  const web = resolve('dist/web');
  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url!, 'http://localhost').pathname;
    const file = resolve(web, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(web + '/')) { res.writeHead(404).end(); return; }
    try {
      res.setHeader('content-type', ({ '.js': 'application/javascript', '.css': 'text/css' } as Record<string, string>)[extname(file)] ?? 'text/html');
      res.end(await readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  await new Promise<void>(yes => server.listen(0, '127.0.0.1', yes));
  const port = (server.address() as { port: number }).port;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
  let release!: () => void, arrived!: () => void;
  const gate = new Promise<void>(yes => { release = yes; });
  const requestArrived = new Promise<void>(yes => { arrived = yes; });
  let first = true;
  try {
    const page = await browser.newPage();
    await page.route('**/api/v1/**', async route => {
      const path = new URL(route.request().url()).pathname;
      let body: unknown;
      if (path.endsWith('/sesion')) body = { rol: 'lectura', csrf: 'fixture', mfaRequired: false,
        factors: [], expiresAt: new Date(Date.now() + 3600000).toISOString(), idleExpiresAt: new Date(Date.now() + 3600000).toISOString() };
      else if (path.endsWith('/bienes')) {
        if (first) { first = false; arrived(); await gate; }
        body = { items: [{ ref: 'synthetic-ref', codigo: 'DELAYED-ITEM', tipo: 'Computador', marca: 'Sintética', modelo: 'Prueba', condicion: 'bueno', situacion: 'disponible' }], nextCursor: null };
      } else body = { items: [], nextCursor: null };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto('http://127.0.0.1:' + port);
    await requestArrived;
    await page.getByRole('link', { name: 'Bienes', exact: true }).click();
    await page.waitForURL('**/#bienes');
    release();
    await page.getByText('DELAYED-ITEM', { exact: true }).waitFor({ timeout: 5000 });
    await page.getByRole('link', { name: 'Unidades', exact: true }).click();
    await page.getByRole('heading', { name: 'Unidades', exact: true }).waitFor();
    await page.getByRole('link', { name: 'Bienes', exact: true }).click();
    await page.getByText('DELAYED-ITEM', { exact: true }).waitFor({ timeout: 5000 });
  } finally {
    release(); await browser.close(); server.closeAllConnections();
    await new Promise<void>(yes => server.close(() => yes()));
  }
});
