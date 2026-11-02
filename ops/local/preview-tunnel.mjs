// Explicit, temporary publication only after the user's specific authorization.
// Uses the documented open-source Tunnelmole WebSocket message protocol, without
// installing its CLI, telemetry, subscription keys or global configuration.
import { randomUUID } from 'node:crypto';
import { request } from 'node:http';
import { main as startIngress, previewOrigin } from './preview-gateway.mjs';

if (process.argv[2] !== '--publish-authorized') {
  console.error('No tunnel created. Obtain specific user authorization, then use --publish-authorized.');
  process.exit(1);
}
if (process.env.NODE_USE_ENV_PROXY !== '1') {
  console.error('Use NODE_USE_ENV_PROXY=1 to preserve the managed HTTPS proxy.');
  process.exit(1);
}

const port = 8750;
const socket = new WebSocket('wss://service.tunnelmole.com:8083');
let ingress, origin, stopping = false;
const pending = new Set();
const send = value => { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(value)); };
function stop(failed = false) {
  if (stopping) return;
  stopping = true;
  clearTimeout(initialTimeout);
  for (const req of pending) req.destroy();
  ingress?.close(); socket.close();
  if (failed) process.exitCode = 1;
}
const initialTimeout = setTimeout(() => { console.error('Tunnel setup timed out; no usable preview confirmed.'); stop(true); }, 30000);
socket.addEventListener('open', () => send({ type: 'initialise', clientId: randomUUID(),
  connectionInfo: { isCli: false, isNpm: false, nodeVersion: process.version, tunnelmoleVersion: '2.4.0' } }));

socket.addEventListener('message', async event => {
  try {
    if (typeof event.data !== 'string' || event.data.length > 2 * 1024 * 1024) throw Error();
    const message = JSON.parse(event.data);
    if (message.type === 'hostnameAssigned') {
      if (origin) throw Error(); // A changed origin requires an explicit restart and verification.
      origin = previewOrigin('https://' + message.hostname).origin;
      ingress = await startIngress(origin, port);
      if (stopping) { ingress.close(); return; }
      clearTimeout(initialTimeout);
      console.log('Assigned temporary HTTPS origin (external verification still required): ' + origin);
      return;
    }
    if (message.type !== 'forwardedRequest') return;
    if (!origin || !ingress || pending.size >= 16 || typeof message.requestId !== 'string' ||
        typeof message.url !== 'string' || typeof message.method !== 'string' ||
        typeof message.body !== 'string' || !message.headers || typeof message.headers !== 'object') throw Error();
    const req = request({ hostname: '127.0.0.1', port, path: message.url, method: message.method,
      headers: message.headers }, res => {
      const chunks = []; let size = 0;
      res.on('data', chunk => { size += chunk.length; if (size > 32 * 1024 * 1024) req.destroy(); else chunks.push(chunk); });
      res.on('end', () => {
        const headers = { ...res.headers };
        for (const name of ['connection', 'transfer-encoding', 'keep-alive', 'upgrade']) delete headers[name];
        send({ type: 'forwardedResponse', requestId: message.requestId, url: message.url,
          statusCode: res.statusCode, headers, body: Buffer.concat(chunks).toString('base64') });
      });
    });
    pending.add(req);
    req.setTimeout(25000, () => req.destroy());
    req.on('close', () => pending.delete(req));
    req.on('error', () => send({ type: 'forwardedResponse', requestId: message.requestId, url: message.url,
      statusCode: 503, headers: { 'cache-control': 'no-store' }, body: '' }));
    req.end(Buffer.from(message.body, 'base64'));
  } catch { console.error('Tunnel protocol or ingress failure; no request contents printed.'); stop(true); }
});
socket.addEventListener('close', () => { console.log('Temporary tunnel closed; local data and accounts preserved.'); stop(); });
socket.addEventListener('error', () => { console.error('Tunnel TLS/WebSocket failure; no public access verified.'); stop(true); });
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => stop());
