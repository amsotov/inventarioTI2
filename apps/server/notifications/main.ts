import { Pool } from "pg";
import { NotificationWorker } from "./worker.js";
import { ResendMail } from "./mail.js";
function required(name: string) {
  const value = process.env[name];
  if (!value) throw Error("Missing " + name);
  return value;
}
// Ejecutable separado: arrancar web/API nunca despacha avisos pendientes.
if (process.env.NOTIFICATION_DELIVERY_ENABLED !== "true")
  throw Error("Notification delivery disabled");
const origin = required("APP_ORIGIN");
if (new URL(origin).origin !== origin || !origin.startsWith("https://"))
  throw Error("APP_ORIGIN requires HTTPS origin");
const pool = new Pool({
  connectionString: required("NOTIFICATION_DATABASE_URL"),
  max: 2,
  connectionTimeoutMillis: 5000,
  statement_timeout: 15000,
});
const worker = new NotificationWorker(
  pool,
  new ResendMail(required("RESEND_API_KEY"), required("NOTIFICATION_FROM")),
  origin,
);
let running = true;
const controller = new AbortController();
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    running = false;
    controller.abort();
  });
try {
  while (running) {
    try {
      await worker.tick();
    } catch {
      process.stderr.write("NOTIFICATION_WORKER_UNAVAILABLE\n");
    }
    if (running)
      await new Promise<void>((resolve) => {
        const timer = setTimeout(done, 1000);
        function done() {
          clearTimeout(timer);
          controller.signal.removeEventListener("abort", done);
          resolve();
        }
        controller.signal.addEventListener("abort", done, { once: true });
      });
  }
} finally {
  await pool.end();
}
