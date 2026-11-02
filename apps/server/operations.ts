import type { FastifyInstance } from 'fastify';

// Only route templates and generated IDs. Never serialize URL/query/body/headers/errors.
export function operations(server: FastifyInstance, probe: () => Promise<void>, write: (line: string) => void) {
  server.get('/health/live', async () => ({ status: 'ok' }));
  server.get('/health/ready', async (_req, res) => {
    try {
      await probe();
      return { status: 'ok' };
    } catch {
      return res.code(503).send({ status: 'unavailable' });
    }
  });
  server.addHook('onResponse', async (req, res) => {
    write(JSON.stringify({
      time: new Date().toISOString(), event: 'http_response', requestId: req.id,
      method: req.method, route: req.routeOptions.url ?? 'unmatched',
      status: res.statusCode, durationMs: Math.round(res.elapsedTime * 100) / 100,
    }) + '\n');
  });
}
