// Cross-platform: set the flag before Vite resolves configuration and modules.
process.env.VITE_DEMO_MODE = "true";
const { createServer } = await import("vite");
const server = await createServer({
  root: "apps/web",
  configFile: "vite.config.js",
  server: { host: "127.0.0.1" },
});
await server.listen();
server.printUrls();
