import type { FastifyInstance } from "fastify";
import { AuthError, type AuthService } from "../auth/service.js";
import type { Authorization } from "../security/postgres.js";
const uuid = { type: "string", format: "uuid" },
  text = { type: "string", minLength: 1, maxLength: 2000, pattern: "\\S" },
  email = {
    type: "string",
    maxLength: 320,
    pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
  };
export function adminRoutes(
  server: FastifyInstance,
  security: Authorization,
  auth: AuthService,
  sid: (req: any) => string,
  csrf: (req: any) => string,
) {
  const tables = {
    cuentas: "id,nombre,correo,rol,estado,version",
    unidades: "id,nombre,activa,version",
    avisos: "id,destinatario,version",
  };
  for (const resource of Object.keys(tables) as (keyof typeof tables)[]) {
    const permission =
      resource === "cuentas"
        ? "cuentas.administrar"
        : "configuracion.administrar";
    // Lectura administrativa no exige CSRF pero sí sesión/MFA/rol vigentes.
    server.get<{ Querystring: { cursor?: string } }>(
      `/api/v1/admin/${resource}`,
      {
        schema: {
          querystring: {
            type: "object",
            additionalProperties: false,
            properties: resource === "avisos" ? {} : { cursor: uuid },
          },
        },
      },
      (req) =>
        security.run(sid(req), "auditoria.consultar", async (db) => {
          const rows = (
            await db.query(
              `select ${tables[resource]} from inventario.${resource === "avisos" ? "configuracion_avisos" : resource}${req.query.cursor ? " where id>$1" : ""} order by id limit 51`,
              req.query.cursor ? [req.query.cursor] : [],
            )
          ).rows;
          const more = rows.length > 50;
          if (more) rows.pop();
          return { items: rows, nextCursor: more ? rows.at(-1).id : null };
        }),
    );
    const props =
      resource === "cuentas"
        ? {
            nombre: text,
            correo: email,
            rol: { enum: ["administrador", "lectura"] },
            estado: { enum: ["activa", "inactiva", "pendiente"] },
            forzar: { type: "boolean" },
          }
        : resource === "unidades"
          ? { nombre: text, activa: { type: "boolean" } }
          : { destinatario: email };
    for (const edit of [false, true]) {
      if (resource === "avisos" && edit) continue;
      const required =
        resource === "cuentas"
          ? ["nombre", "rol", ...(edit ? ["estado"] : ["correo"])]
          : resource === "unidades"
            ? ["nombre", ...(edit ? ["activa"] : [])]
            : ["destinatario"];
      const properties = {
        ...props,
        motivo: text,
        confirmado: { const: true },
      };
      // No cambiar correo/identidad de una cuenta existente ni flags de alta.
      if (resource === "cuentas") {
        if (edit) delete (properties as any).correo;
        else {
          delete (properties as any).estado;
          delete (properties as any).forzar;
        }
      }
      if (resource === "unidades" && !edit) delete (properties as any).activa;
      server.route<{ Params: { ref: string }; Body: Record<string, unknown> }>({
        method: edit ? "PATCH" : "POST",
        url: `/api/v1/admin/${resource}${edit ? "/:ref" : ""}`,
        schema: {
          headers: {
            type: "object",
            required: ["idempotency-key"],
            properties: {
              "idempotency-key": uuid,
              "if-match": { type: "string", pattern: '^"v[1-9][0-9]{0,14}"$' },
            },
          },
          ...(edit
            ? {
                params: {
                  type: "object",
                  required: ["ref"],
                  properties: { ref: uuid },
                },
              }
            : {}),
          body: {
            type: "object",
            additionalProperties: false,
            required: [...required, "motivo", "confirmado"],
            properties,
          },
        },
        handler: async (req, res) => {
          const match = req.headers["if-match"] as string | undefined;
          try {
            const result = await security.run(
              sid(req),
              permission,
              async (db) =>
                (
                  await db.query(
                    "select inventario.administrar($1,$2,$3,$4,$5) result",
                    [
                      resource,
                      edit ? req.params.ref : null,
                      req.headers["idempotency-key"],
                      match?.slice(2, -1) ?? null,
                      req.body,
                    ],
                  )
                ).rows[0].result,
              csrf(req),
            );
            return res
              .header("etag", `"v${result.version}"`)
              .code(edit ? 200 : 201)
              .send(result);
          } catch (e) {
            const err = e as { message: string; code?: string };
            const errors: Record<string, number> = {
              FORBIDDEN: 403,
              SELF_PROTECTED: 422,
              LAST_ADMIN: 422,
              CREDENTIAL_REQUIRED: 422,
              NOT_FOUND: 404,
              VERSION_REQUIRED: 428,
              VERSION_MISMATCH: 412,
              IDEMPOTENCY_MISMATCH: 409,
              BUSINESS_RULE: 422,
              INVALID_REQUEST: 400,
              NOTIFICATION_NOT_CONFIGURED: 503,
            };
            if (errors[err.message])
              throw new AuthError(errors[err.message], err.message);
            if (err.code === "23505")
              throw new AuthError(409, "DUPLICATE_IDENTIFIER");
            if (["23514", "23502", "22P02"].includes(err.code ?? ""))
              throw new AuthError(422, "BUSINESS_RULE");
            throw e;
          }
        },
      });
    }
  }
  server.post<{ Params: { ref: string } }>(
    "/api/v1/admin/cuentas/:ref/enlace",
    {
      schema: {
        params: {
          type: "object",
          required: ["ref"],
          properties: { ref: uuid },
        },
        body: {
          type: "object",
          additionalProperties: false,
          required: ["confirmado"],
          properties: { confirmado: { const: true } },
        },
      },
    },
    async (req, res) => {
      const account = await security.run(
        sid(req),
        "cuentas.administrar",
        async (db) =>
          (
            await db.query(
              "select correo,estado from inventario.cuentas where id=$1",
              [req.params.ref],
            )
          ).rows[0],
        csrf(req),
      );
      if (!account) throw new AuthError(404, "NOT_FOUND");
      if (account.estado === "inactiva")
        throw new AuthError(422, "BUSINESS_RULE");
      await auth.rate(req.ip, account.correo);
      await auth.issue(
        account.correo,
        account.estado === "pendiente" ? "invite" : "recovery",
        true,
      );
      return res
        .code(202)
        .send({
          message:
            "Solicitud registrada. Revisa la entrega de acceso; no implica correo enviado.",
        });
    },
  );
}
