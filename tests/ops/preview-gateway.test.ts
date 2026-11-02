import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer, request, type Server } from 'node:http';
import { spawnSync } from 'node:child_process';
import { gateway, previewOrigin } from '../../ops/local/preview-gateway.mjs';

test('temporary tunnel refuses startup without the explicit publication flag', () => {
  const result = spawnSync(process.execPath, ['ops/local/preview-tunnel.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No tunnel created/);
  assert.equal(result.stdout, '');
});

async function listen(server: Server) {
  await new Promise<void>((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
  return (server.address() as { port: number }).port;
}
async function close(server: Server) {
  server.closeAllConnections(); await new Promise<void>(yes => server.close(() => yes()));
}

test('preview transport rejects unapproved hosts/schemes and preserves security headers and binary exports', async () => {
  const origin = 'https://synthetic-check.tunnelmole.net';
  for (const value of ['http://synthetic-check.tunnelmole.net', origin + '/', origin + ':443',
    'https://user:pass@synthetic-check.tunnelmole.net', 'https://evil.example',
    'https://nested.synthetic-check.tunnelmole.net']) assert.throws(() => previewOrigin(value));
  const seen: { headers?: import('node:http').IncomingHttpHeaders; body?: string } = {};
  let calls = 0;
  const upstream = createServer(async (req, res) => {
    calls++; seen.headers = req.headers;
    const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(chunk);
    seen.body = Buffer.concat(chunks).toString();
    res.writeHead(200, { 'content-type': 'application/octet-stream',
      'set-cookie': ['__Host-it2=opaque; Path=/; HttpOnly; Secure; SameSite=Strict'] });
    res.end(Buffer.from([0, 255, 80, 75, 13, 10]));
  });
  const ingress = gateway(origin, await listen(upstream));
  const port = await listen(ingress);
  const call = (headers: Record<string, string>, path = '/api/v1/exportaciones', body = '{}') =>
    new Promise<{ status: number; headers: import('node:http').IncomingHttpHeaders; body: Buffer }>((yes, no) => {
      const req = request({ hostname: '127.0.0.1', port, method: 'POST', path, headers }, res => {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => yes({ status: res.statusCode!, headers: res.headers, body: Buffer.concat(chunks) }));
      }); req.on('error', no); req.end(body);
    });
  const headers = { host: new URL(origin).host, 'x-forwarded-proto': 'https', origin,
    cookie: '__Host-it2=opaque', 'x-csrf-token': 'test-csrf', 'idempotency-key': 'test-replay',
    'x-forwarded-for': 'spoofed', forwarded: 'spoofed' };
  try {
    assert.equal((await call({ ...headers, host: 'evil.example' })).status, 421);
    assert.equal((await call({ ...headers, 'x-forwarded-proto': 'http' })).status, 400);
    assert.equal((await call({ ...headers, 'x-forwarded-proto': '' })).status, 400);
    assert.equal((await call(headers, '/auth/v1/token')).status, 404);
    assert.equal((await call(headers, 'https://evil.example/')).status, 404);
    assert.equal(calls, 0);
    const response = await call(headers, '/api/v1/exportaciones', '{"filtro":"sintético"}');
    assert.equal(response.status, 200);
    assert.deepEqual([...response.body], [0, 255, 80, 75, 13, 10]);
    assert.match(response.headers['set-cookie']![0], /HttpOnly; Secure; SameSite=Strict/);
    assert.equal(seen.headers?.origin, origin);
    assert.equal(seen.headers?.cookie, headers.cookie);
    assert.equal(seen.headers?.['x-csrf-token'], headers['x-csrf-token']);
    assert.equal(seen.headers?.['idempotency-key'], headers['idempotency-key']);
    assert.equal(seen.headers?.['x-forwarded-for'], undefined);
    assert.equal(seen.headers?.forwarded, undefined);
    assert.equal(seen.body, '{"filtro":"sintético"}');
    await close(upstream);
    assert.equal((await call(headers)).status, 503);
  } finally { await close(ingress); if (upstream.listening) await close(upstream); }
});
