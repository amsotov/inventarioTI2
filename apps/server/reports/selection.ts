import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { AuthError } from "../auth/service.js";

export const reportTypes = [
  "inventario",
  "por-funcionario",
  "movimientos",
  "por-condicion",
  "auditoria",
  "busqueda",
] as const;
export type ReportType = (typeof reportTypes)[number];
export type Filters = Record<string, string>;
export type Column = { key: string; label: string };
export type Section = {
  name: string;
  columns: Column[];
  items: Record<string, unknown>[];
  total: number;
  nextCursor: string | null;
  dateField: string | null;
};
export type Report = {
  type: ReportType;
  filters: Filters;
  generatedAt: string;
  timezone: "UTC";
  total: number;
  sections: Section[];
  subtotals: Record<string, number> | null;
};
const columns = (items: string[][]): Column[] =>
  items.map(([key, label]) => ({ key, label }));
const goodsColumns = columns([
  ["codigo", "Código"],
  ["serie", "Serie o ausencia"],
  ["tipo", "Tipo"],
  ["marca", "Marca"],
  ["modelo", "Modelo"],
  ["adquisicion", "Adquisición"],
  ["condicion", "Condición"],
  ["situacion", "Estado administrativo"],
  ["custodio", "Custodio actual"],
  ["unidad", "Unidad actual por custodia"],
]);
const employeeColumns = columns([
  ["referencia", "Referencia de funcionario"],
  ["nombre", "Nombre"],
  ["cargo", "Cargo"],
  ["unidad", "Unidad actual"],
  ["activo", "Activo"],
]);
const custodyColumns = columns([
  ["referencia", "Referencia de funcionario"],
  ["nombre", "Nombre"],
  ["cargo", "Cargo"],
  ["unidad", "Unidad actual"],
  ["codigo", "Código"],
  ["serie", "Serie o ausencia"],
  ["tipo", "Tipo"],
  ["marca", "Marca"],
  ["modelo", "Modelo"],
  ["condicion", "Condición"],
  ["inicio", "Inicio de custodia UTC"],
]);
const movementColumns = columns([
  ["referencia", "Referencia de movimiento"],
  ["codigo", "Código del bien"],
  ["tipo", "Movimiento"],
  ["efectiva_en", "Fecha efectiva UTC"],
  ["registrada_en", "Fecha de registro UTC"],
  ["origen_ref", "Referencia origen"],
  ["origen", "Nombre origen"],
  ["destino_ref", "Referencia destino"],
  ["destino", "Nombre destino"],
  ["unidad_origen", "Unidad histórica origen"],
  ["unidad_destino", "Unidad histórica destino"],
  ["motivo", "Motivo"],
  ["actor_ref", "Referencia administrador"],
  ["actor", "Administrador"],
  ["correccion", "Referencia de corrección"],
]);
const auditColumns = columns([
  ["referencia", "Referencia"],
  ["registrada_en", "Fecha de registro UTC"],
  ["actor_ref", "Referencia actor"],
  ["actor", "Actor"],
  ["entidad", "Entidad"],
  ["entidad_ref", "Referencia entidad"],
  ["accion", "Acción"],
  ["campos", "Campos"],
  ["anterior", "Anterior"],
  ["nuevo", "Nuevo"],
]);
const goodsFilters = [
  "q",
  "tipo",
  "condicion",
  "situacion",
  "custodia",
  "unidad_id",
  "funcionario_id",
  "bien_id",
  "desde",
  "hasta",
];
const supported: Record<ReportType, string[]> = {
  inventario: goodsFilters,
  "por-condicion": goodsFilters,
  "por-funcionario": goodsFilters,
  movimientos: [
    "q",
    "tipo",
    "unidad_id",
    "funcionario_id",
    "bien_id",
    "desde",
    "hasta",
  ],
  auditoria: [
    "q",
    "actor_id",
    "entidad",
    "entidad_ref",
    "accion",
    "desde",
    "hasta",
  ],
  busqueda: [...goodsFilters, "activo"],
};
const invalid = () => new AuthError(400, "INVALID_REQUEST");
export function normalize(
  type: ReportType,
  input: Record<string, unknown>,
): Filters {
  if (!reportTypes.includes(type)) throw invalid();
  const out: Filters = {};
  for (const k of Object.keys(input).sort()) {
    if (!supported[type].includes(k) || typeof input[k] !== "string")
      throw invalid();
    let v = (input[k] as string).trim();
    if (!v || v.length > 200) throw invalid();
    if (k === "q") v = v.toLowerCase();
    if (
      k.endsWith("_id") &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
    )
      throw invalid();
    if (k.endsWith("_id")) v = v.toLowerCase();
    if (
      ["desde", "hasta"].includes(k) &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
        v < "0001-01-01" ||
        v > "9999-12-30" ||
        !Number.isFinite(Date.parse(v)) ||
        new Date(v).toISOString().slice(0, 10) !== v)
    )
      throw invalid();
    const enums: Record<string, string[]> = {
      condicion: ["bueno", "regular", "malo"],
      situacion: ["activo", "baja"],
      custodia: ["asignado", "sin-asignar"],
      activo: ["true", "false"],
    };
    if (enums[k] && !enums[k].includes(v)) throw invalid();
    out[k] = v;
  }
  if (out.desde && out.hasta && out.desde > out.hasta) throw invalid();
  return out;
}
export const fingerprint = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
type Plan = {
  name: string;
  columns: Column[];
  select: string;
  from: string;
  order: string;
  dateField: string | null;
  values: unknown[];
  where: string;
};
function plans(type: ReportType, f: Filters): Plan[] {
  const make = (kind: "goods" | "employees" | "movements" | "audit"): Plan => {
    const values: unknown[] = [],
      terms: string[] = [];
    const param = (v: unknown) => {
      values.push(v);
      return "$" + values.length;
    };
    const eq = (col: string, key: string) => {
      if (f[key]) terms.push(`${col}=${param(f[key])}`);
    };
    const text = (cols: string[]) => {
      if (f.q)
        terms.push(
          `strpos(lower(concat_ws(' ',${cols.join(",")})),${param(f.q)})>0`,
        );
    };
    let name: string,
      cols: Column[],
      select: string,
      from: string,
      order: string,
      dateField: string | null,
      date: string | null;
    if (kind === "goods") {
      name = "Bienes";
      cols =
        type === "por-funcionario"
          ? custodyColumns
          : type === "por-condicion"
            ? goodsColumns
                .filter((c) => c.key !== "adquisicion")
                .sort((a, b) =>
                  a.key === "condicion" ? -1 : b.key === "condicion" ? 1 : 0,
                )
            : goodsColumns;
      from =
        "inventario.bienes b left join inventario.custodias c on c.bien_id=b.id and c.fin_en is null left join inventario.funcionarios f on f.id=c.funcionario_id left join inventario.unidades u on u.id=f.unidad_id";
      select = `b.codigo,coalesce(b.serie,'Sin serie') serie,b.tipo,b.marca,b.modelo,to_char(b.adquisicion,'YYYY-MM-DD') adquisicion,b.condicion,b.situacion,f.nombre custodio,coalesce(u.nombre,'Sin unidad por custodia') unidad,f.id referencia,f.nombre,f.cargo,c.inicio_en inicio`;
      order =
        type === "por-funcionario"
          ? 'f.nombre collate "C",f.id,b.codigo collate "C",b.id'
          : type === "por-condicion"
            ? `case b.condicion when 'bueno' then 1 when 'regular' then 2 else 3 end,b.codigo collate "C",b.id`
            : 'b.codigo collate "C",b.id';
      date = type === "por-funcionario" ? "c.inicio_en" : "b.adquisicion";
      dateField =
        type === "por-funcionario"
          ? "inicio de custodia vigente"
          : "adquisición";
      text(["b.codigo", "b.serie", "b.tipo", "b.marca", "b.modelo"]);
      eq("b.tipo", "tipo");
      eq("b.condicion", "condicion");
      eq("b.situacion", "situacion");
      eq("u.id", "unidad_id");
      eq("f.id", "funcionario_id");
      eq("b.id", "bien_id");
      if (type === "por-funcionario") terms.push("c.id is not null");
      if (f.custodia)
        terms.push(
          f.custodia === "asignado" ? "c.id is not null" : "c.id is null",
        );
    } else if (kind === "employees") {
      name = "Funcionarios";
      cols = employeeColumns;
      from =
        "inventario.funcionarios f join inventario.unidades u on u.id=f.unidad_id";
      select = "f.id referencia,f.nombre,f.cargo,u.nombre unidad,f.activo";
      order = 'f.nombre collate "C",f.id';
      date = "f.alta_en";
      dateField = "alta de funcionario";
      text(["f.nombre", "f.cargo"]);
      eq("u.id", "unidad_id");
      eq("f.id", "funcionario_id");
      eq("f.activo", "activo");
    } else if (kind === "movements") {
      name = "Movimientos";
      cols = movementColumns;
      from =
        "inventario.movimientos m join inventario.bienes b on b.id=m.bien_id left join inventario.funcionarios o on o.id=m.origen_id left join inventario.funcionarios d on d.id=m.destino_id";
      select =
        "m.id referencia,b.codigo,m.tipo,m.efectiva_en,m.registrada_en,m.origen_id origen_ref,o.nombre origen,m.destino_id destino_ref,d.nombre destino,m.unidad_origen_nombre unidad_origen,m.unidad_destino_nombre unidad_destino,m.motivo,m.actor_id actor_ref,seguridad.nombre_actor(m.actor_id) actor,m.corrige_id correccion";
      order = "m.efectiva_en,m.id";
      date = "m.efectiva_en";
      dateField = "fecha efectiva de movimiento";
      text(["b.codigo", "m.tipo", "o.nombre", "d.nombre"]);
      eq("m.tipo", "tipo");
      eq("b.id", "bien_id");
      if (f.unidad_id) {
        const p = param(f.unidad_id);
        terms.push(`(m.unidad_origen_id=${p} or m.unidad_destino_id=${p})`);
      }
      if (f.funcionario_id) {
        const p = param(f.funcionario_id);
        terms.push(`(m.origen_id=${p} or m.destino_id=${p})`);
      }
    } else {
      name = "Auditoría";
      cols = auditColumns;
      from = "inventario.auditoria a";
      select =
        "a.id referencia,a.registrada_en,a.actor_id actor_ref,seguridad.nombre_actor(a.actor_id) actor,a.entidad,a.entidad_ref,a.accion,a.anterior,a.nuevo";
      order = "a.registrada_en,a.id";
      date = "a.registrada_en";
      dateField = "fecha de registro de auditoría";
      text(["a.entidad", "a.entidad_ref", "a.accion"]);
      eq("a.actor_id", "actor_id");
      eq("a.entidad", "entidad");
      eq("a.entidad_ref", "entidad_ref");
      eq("a.accion", "accion");
    }
    if (f.desde)
      terms.push(
        `${date}>=(${param(f.desde)}::date::timestamp at time zone 'UTC')`,
      );
    if (f.hasta)
      terms.push(
        `${date}<((${param(f.hasta)}::date+1)::timestamp at time zone 'UTC')`,
      );
    return {
      name,
      columns: cols,
      select,
      from,
      order,
      dateField,
      values,
      where: terms.length ? " where " + terms.join(" and ") : "",
    };
  };
  return type === "busqueda"
    ? [make("goods"), make("employees")]
    : [
        make(
          type === "auditoria"
            ? "audit"
            : type === "movimientos"
              ? "movements"
              : "goods",
        ),
      ];
}
// Auditoría: lista positiva de campos empresariales. Campos personales, configuración de
// destinatario, observaciones libres, credenciales y claves desconocidas nunca se copian.
const auditKeys = [
  "id",
  "nombre",
  "cargo",
  "unidad_id",
  "activo",
  "codigo",
  "serie",
  "tipo",
  "marca",
  "modelo",
  "adquisicion",
  "condicion",
  "situacion",
  "rol",
  "estado",
  "version",
  "movimiento_id",
  "anotacion_id",
  "activa",
];
function safeRow(row: Record<string, any>, cols: Column[], audit: boolean) {
  if (audit) {
    const before: Record<string, unknown> = {},
      after: Record<string, unknown> = {};
    const changed: string[] = [];
    for (const key of auditKeys) {
      const a = row.anterior?.[key],
        b = row.nuevo?.[key];
      if (JSON.stringify(a) === JSON.stringify(b)) continue;
      if (
        a !== undefined &&
        (a === null || ["string", "number", "boolean"].includes(typeof a))
      )
        before[key] = a;
      if (
        b !== undefined &&
        (b === null || ["string", "number", "boolean"].includes(typeof b))
      )
        after[key] = b;
      if (key in before || key in after) changed.push(key);
    }
    row = {
      ...row,
      campos: changed.join(", "),
      anterior: JSON.stringify(before),
      nuevo: JSON.stringify(after),
    };
  }
  return Object.fromEntries(
    cols.map(({ key }) => [
      key,
      row[key] instanceof Date ? row[key].toISOString() : (row[key] ?? null),
    ]),
  );
}
export async function selectReport(
  db: PoolClient,
  type: ReportType,
  filters: Filters,
  page: { limit: number; cursor?: string } | null,
  maximum?: number,
): Promise<Report> {
  const ps = plans(type, filters),
    binding = fingerprint([type, filters]);
  let offset = 0;
  if (page?.cursor) {
    try {
      const c = JSON.parse(Buffer.from(page.cursor, "base64url").toString());
      if (
        c.binding !== binding ||
        !Number.isSafeInteger(c.offset) ||
        c.offset < 0 ||
        c.offset > 10000000
      )
        throw Error();
      offset = c.offset;
    } catch {
      throw new AuthError(400, "INVALID_CURSOR");
    }
  }
  const generatedAt = (
    await db.query("select transaction_timestamp() t")
  ).rows[0].t.toISOString();
  const totals: number[] = [];
  for (const p of ps)
    totals.push(
      Number(
        (await db.query(`select count(*) n from ${p.from}${p.where}`, p.values))
          .rows[0].n,
      ),
    );
  const total = totals.reduce((a, b) => a + b, 0);
  if (maximum !== undefined && total > maximum)
    throw new AuthError(422, "EXPORT_LIMIT");
  const sections: Section[] = [];
  for (const [i, p] of ps.entries()) {
    const values = [...p.values];
    let paging = "";
    if (page) {
      values.push(page.limit, offset);
      paging = ` limit $${values.length - 1} offset $${values.length}`;
    }
    const rows = (
      await db.query(
        `select ${p.select} from ${p.from}${p.where} order by ${p.order}${paging}`,
        values,
      )
    ).rows;
    sections.push({
      name: p.name,
      columns: p.columns,
      items: rows.map((r) => safeRow(r, p.columns, type === "auditoria")),
      total: totals[i],
      nextCursor:
        page && offset + page.limit < totals[i]
          ? Buffer.from(
              JSON.stringify({ binding, offset: offset + page.limit }),
            ).toString("base64url")
          : null,
      dateField: p.dateField,
    });
  }
  let subtotals: Record<string, number> | null = null;
  if (type === "por-condicion") {
    const p = ps[0];
    subtotals = { bueno: 0, regular: 0, malo: 0 };
    for (const r of (
      await db.query(
        `select b.condicion,count(*) n from ${p.from}${p.where} group by b.condicion`,
        p.values,
      )
    ).rows)
      subtotals[r.condicion] = Number(r.n);
  }
  return {
    type,
    filters,
    generatedAt,
    timezone: "UTC",
    total,
    sections,
    subtotals,
  };
}
