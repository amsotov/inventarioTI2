import type { MailPort, MailResult, Notice } from "./ports.js";

// Solo proyección positiva producida por SQL. Ningún valor libre llega al correo.
export function template(n: Notice, origin: string) {
  if (new URL(origin).origin !== origin || !origin.startsWith("https://"))
    throw Error("Invalid mail origin");
  if (n.proposito === "activacion_avisos")
    return {
      subject: "inventarioTI2 · Avisos activados",
      text:
        "Esta dirección recibirá los avisos de inventarioTI2. Consulta el sistema con tu acceso autorizado: " +
        origin,
    };
  if (n.proposito === "sustitucion_avisos")
    return {
      subject: "inventarioTI2 · Destinatario sustituido",
      text:
        "Esta dirección dejó de ser el destinatario de nuevos avisos de inventarioTI2. Los avisos anteriores conservan su destino original. Consulta el sistema con tu acceso autorizado: " +
        origin,
    };
  return {
    subject: "inventarioTI2 · Cambio confirmado",
    text: `Cambio confirmado en ${n.entidad}.\nReferencia: ${n.referencia}\nAcción: ${n.accion}\nActor (referencia de cuenta): ${n.actor}\nRegistro UTC: ${n.registrada}\n${n.efectiva ? "Fecha efectiva UTC: " + n.efectiva + "\n" : ""}Campos cambiados: ${(n.campos ?? []).join(", ") || "sin cambios de atributos"}.\nConsulta los detalles con tu acceso autorizado: ${origin}`,
  };
}

// Adaptador preparado, sin activación implícita. No registra respuestas ni credenciales.
// Resend conserva Idempotency-Key 24 h; no sustituye la conciliación del outbox.
export class ResendMail implements MailPort {
  constructor(
    private key: string,
    private from: string,
    private request: typeof fetch = fetch,
  ) {
    if (!key || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(from))
      throw Error("Missing mail configuration");
  }
  async send(m: Parameters<MailPort["send"]>[0]): Promise<MailResult> {
    try {
      const r = await this.request("https://api.resend.com/emails", {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
        headers: {
          authorization: "Bearer " + this.key,
          "content-type": "application/json",
          "idempotency-key": m.correlation,
        },
        body: JSON.stringify({
          from: this.from,
          to: [m.to],
          subject: m.subject,
          text: m.text,
        }),
      });
      if (r.status === 429) return { result: "transitorio" };
      // 408, 409, 5xx, error de transporte o respuesta inválida pueden ocultar aceptación.
      if ([400, 401, 403, 404, 405, 413, 422].includes(r.status))
        return { result: "permanente" };
      if (!r.ok) return { result: "incierto" };
      const body = (await r.json()) as { id?: unknown };
      return typeof body.id === "string" &&
        /^[a-zA-Z0-9_-]{1,128}$/.test(body.id)
        ? { result: "aceptado", providerRef: body.id }
        : { result: "incierto" };
    } catch {
      return { result: "incierto" };
    }
  }
}
