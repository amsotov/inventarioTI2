import type { FastifyInstance } from "fastify";
import { Reports } from "./service.js";
import { reportTypes, type ReportType } from "./selection.js";
const uuid = {
  type: "string",
  pattern:
    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
};
const filters = {
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(
    [
      "q",
      "tipo",
      "condicion",
      "situacion",
      "custodia",
      "unidad_id",
      "funcionario_id",
      "bien_id",
      "actor_id",
      "entidad",
      "entidad_ref",
      "accion",
      "activo",
      "desde",
      "hasta",
    ].map((key) => [key, { type: "string", minLength: 1, maxLength: 200 }]),
  ),
};
export function reportRoutes(
  server: FastifyInstance,
  reports: Reports,
  sid: (r: any) => string,
  csrf: (r: any) => string,
) {
  const query = {
    ...filters,
    properties: {
      ...filters.properties,
      limit: { type: "integer", minimum: 1, maximum: 100 },
      cursor: { type: "string", maxLength: 1024 },
    },
  };
  const get = (type: (r: any) => ReportType) => (req: any) => {
    const { limit = 25, cursor, ...f } = req.query;
    return reports.list(sid(req), type(req), f, limit, cursor);
  };
  server.get(
    "/api/v1/resumen",
    {
      schema: { querystring: { type: "object", additionalProperties: false } },
    },
    (req) => reports.summary(sid(req)),
  );
  server.get(
    "/api/v1/reportes/:tipo",
    {
      schema: {
        params: {
          type: "object",
          required: ["tipo"],
          properties: { tipo: { enum: reportTypes } },
        },
        querystring: query,
      },
    },
    get((r) => r.params.tipo),
  );
  server.get(
    "/api/v1/buscar",
    { schema: { querystring: query } },
    get(() => "busqueda"),
  );
  server.get(
    "/api/v1/auditoria",
    { schema: { querystring: query } },
    get(() => "auditoria"),
  );
  server.post<{
    Body: {
      tipo: ReportType;
      formato: "xlsx" | "pdf";
      filtros: Record<string, unknown>;
    };
  }>(
    "/api/v1/exportaciones",
    {
      schema: {
        headers: {
          type: "object",
          required: ["idempotency-key"],
          properties: { "idempotency-key": uuid },
        },
        body: {
          type: "object",
          additionalProperties: false,
          required: ["tipo", "formato", "filtros"],
          properties: {
            tipo: { enum: reportTypes },
            formato: { enum: ["xlsx", "pdf"] },
            filtros: filters,
          },
        },
      },
    },
    async (req, res) => {
      const result = await reports.create(
        sid(req),
        csrf(req),
        String(req.headers["idempotency-key"]),
        req.body.tipo,
        req.body.formato,
        req.body.filtros,
      );
      return res.code(202).send(result);
    },
  );
  const params = {
    type: "object",
    required: ["ref"],
    properties: { ref: uuid },
  };
  server.get<{ Params: { ref: string } }>(
    "/api/v1/exportaciones/:ref",
    { schema: { params } },
    (req) => reports.status(sid(req), req.params.ref),
  );
  server.get<{ Params: { ref: string } }>(
    "/api/v1/exportaciones/:ref/archivo",
    { schema: { params } },
    async (req, res) => {
      const file = await reports.download(sid(req), req.params.ref);
      return res
        .header(
          "content-disposition",
          `attachment; filename="inventario-${req.params.ref}.${file.format}"`,
        )
        .type(
          file.format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        .send(file.bytes);
    },
  );
  server.addHook("onClose", () => reports.close());
}
