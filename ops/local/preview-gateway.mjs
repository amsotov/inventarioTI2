// Optional loopback ingress for an explicitly authorized HTTPS preview provider.
// This command does not create a tunnel, publish a URL or change local state.
import { createServer, request } from 'node:http';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { directory, root, load } from './control.mjs';

export function previewOrigin(value) {
  const url = new URL(value);
  if (url.origin !== value || url.protocol !== 'https:' || url.username || url.password ||
      url.port || !url.hostname.endsWith('.tunnelmole.net') ||
      !/^[a-z0-9-]+\.tunnelmole\.net$/.test(url.hostname)) {
    throw Error('Expected an assigned HTTPS Tunnelmole origin without path or credentials');
  }
  return url;
}

export function gateway(origin, bffPort) {
  const host = previewOrigin(origin).host;
  const server = createServer((req, res) => {
    const reject = code => { res.writeHead(code, { 'cache-control': 'no-store' }); res.end(); };
    if (req.headers.host !== host) return reject(421);
    // Do not expose the raw identity provider or an open proxy through the ingress.
    if (!req.url?.startsWith('/') || req.url.startsWith('//') ||
        /^\/auth(?:[/?]|$)/i.test(req.url)) return reject(404);
    if (req.headers['x-forwarded-proto'] !== 'https') return reject(400);
    const headers = { ...req.headers };
    for (const key of Object.keys(headers)) {
      if (key.startsWith('x-forwarded-') || key === 'forwarded') delete headers[key];
    }
    // Origin, cookies, CSRF and binary responses pass unchanged to the real BFF.
    const upstream = request({ hostname: '127.0.0.1', port: bffPort,
      method: req.method, path: req.url, headers }, reply => {
      res.writeHead(reply.statusCode, { ...reply.headers,
        'strict-transport-security': 'max-age=86400', 'cache-control': 'no-store' });
      reply.pipe(res);
    });
    upstream.setTimeout(20000, () => upstream.destroy());
    upstream.on('error', () => {
      if (!res.headersSent) reject(503);
      else res.destroy();
    });
    req.on('aborted', () => upstream.destroy());
    res.on('close', () => { if (!res.writableFinished) upstream.destroy(); });
    req.pipe(upstream);
  });
  server.headersTimeout = 15000;
  server.requestTimeout = 30000;
  return server;
}

export async function main(origin, port = 8750) {
  previewOrigin(origin);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Invalid loopback port');
  const state = load();
  if (!state.initialized) throw Error('Start the local synthetic system first');
  // Reserve both loopback listeners before launching a second BFF process.
  const reservation = createServer();
  await new Promise((yes, no) => { reservation.once('error', no); reservation.listen(0, '127.0.0.1', yes); });
  const bffPort = reservation.address().port;
  await new Promise(yes => reservation.close(yes));
  const ingress = gateway(origin, bffPort);
  await new Promise((yes, no) => { ingress.once('error', no); ingress.listen(port, '127.0.0.1', yes); });
  const env = { ...process.env, APP_ORIGIN: origin, HOST: '127.0.0.1', PORT: String(bffPort),
    DATABASE_URL: `postgres://inventario_auth:${state.authPassword}@${state.dbHost}:${state.dbPort}/postgres`,
    BUSINESS_DATABASE_URL: `postgres://inventario_runtime:${state.runtimePassword}@${state.dbHost}:${state.dbPort}/postgres`,
    SUPABASE_URL: state.origin, SUPABASE_PUBLISHABLE_KEY: state.anonKey,
    SUPABASE_SECRET_KEY: state.serviceKey, AUTH_ENCRYPTION_KEY: state.vault,
    NOTIFICATION_DELIVERY_ENABLED: 'false', NODE_EXTRA_CA_CERTS: resolve(directory, 'ca.crt') };
  delete env.NOTIFICATION_DATABASE_URL; delete env.RESEND_API_KEY; delete env.NOTIFICATION_FROM;
  const bff = spawn(process.execPath, [resolve(root, 'dist/apps/server/main.js')], { cwd: root, env,
    stdio: ['ignore', 'inherit', 'inherit'] });
  let stopping = false;
  const close = () => {
    if (stopping) return;
    stopping = true; ingress.close(); ingress.closeAllConnections(); bff.kill('SIGTERM');
  };
  bff.on('error', () => { close(); process.exitCode = 1; });
  bff.on('exit', () => { if (!stopping) { close(); process.exitCode = 1; } });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, close);
  console.log('Preview ingress prepared on loopback; no tunnel created.');
  return { close };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv[2], Number(process.argv[3] ?? 8750)).catch(() => {
    console.error('Preview ingress failed; no credentials printed or local state reset.'); process.exitCode = 1;
  });
}
