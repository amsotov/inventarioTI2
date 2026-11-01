import type { FastifyInstance } from "fastify";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
// Register only compiled public files; no user-controlled filesystem paths or SPA fallback for API URLs.
export function webRoutes(server: FastifyInstance, root: string) {
  const register = (url: string, file: string, type: string) => {
    const content = readFileSync(file);
    server.get(url, async (_req, res) => res.type(type).send(content));
  };
  register("/", join(root, "index.html"), "text/html; charset=utf-8");
  for (const name of readdirSync(join(root, "assets"))) {
    if (!/^[A-Za-z0-9_-]+\.(js|css)$/.test(name)) continue;
    register(
      "/assets/" + name,
      join(root, "assets", name),
      name.endsWith(".js")
        ? "application/javascript; charset=utf-8"
        : "text/css; charset=utf-8",
    );
  }
}
