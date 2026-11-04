// This module is loaded only by VITE_DEMO_MODE. No storage, SDK, or HTTP calls.
import { ApiError } from "./api";
type Row = Record<string, any>;
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const fixedId = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
let role = "administrador";
export const demoRole = () => role;
const units: Row[] = [
  "Informática",
  "Administración",
  "Atención ciudadana",
].map((nombre, i) => ({
  id: fixedId(i + 1),
  nombre,
  activa: true,
  version: 1,
}));
const people: Row[] = [
  "Ana Torres",
  "Carlos Muñoz",
  "Valentina Rojas",
  "Diego Pérez",
].map((nombre, i) => ({
  id: fixedId(10 + i),
  nombre,
  documento_tipo: "ID",
  documento: `DEMO-${100 + i}`,
  cargo: ["Analista TI", "Contador", "Ejecutiva", "Técnico de soporte"][i],
  correo: `persona${i + 1}@example.invalid`,
  unidad_id: units[i % 3].id,
  activo: true,
  creado_en: "2026-05-10T09:00:00Z",
  version: 1,
}));
const assets: Row[] = [
  ["Notebook", "Lenovo", "ThinkPad E14", "bueno"],
  ["Monitor", "Dell", "P2422H", "bueno"],
  ["Notebook", "HP", "ProBook 440", "regular"],
  ["Impresora", "Brother", "HL-L2350DW", "malo"],
  ["PC escritorio", "Dell", "OptiPlex 7010", "bueno"],
  ["Monitor", "Samsung", "S24R350", "regular"],
].map(([tipo, marca, modelo, condicion], i) => ({
  id: fixedId(20 + i),
  codigo: `TI-${String(i + 1).padStart(4, "0")}`,
  tipo,
  marca,
  modelo,
  condicion,
  situacion: "activo",
  serie: `DEMO-SN-${2000 + i}`,
  adquisicion: "2025-03-15",
  observaciones: "Equipo de ejemplo ficticio",
  version: 1,
}));
const custodias: Row[] = assets.slice(0, 3).map((b, i) => ({
  id: fixedId(30 + i),
  bien_id: b.id,
  funcionario_id: people[i].id,
  inicio_en: "2026-06-01T10:00:00Z",
  fin_en: null,
}));
const pertenencias: Row[] = people.map((p) => ({
  id: id(),
  funcionario_id: p.id,
  unidad_id: p.unidad_id,
  unidad_nombre: units.find((u) => u.id === p.unidad_id)!.nombre,
  inicio_en: p.creado_en,
  fin_en: null,
}));
const movements: Row[] = custodias.map((c, i) => ({
  id: fixedId(40 + i),
  tipo: "asignacion",
  bien_id: c.bien_id,
  origen_id: null,
  destino_id: c.funcionario_id,
  efectiva_en: c.inicio_en,
  registrada_en: c.inicio_en,
  unidad_origen_nombre: null,
  unidad_destino_nombre: units.find((u) => u.id === people[i].unidad_id)!
    .nombre,
  motivo: "Entrega inicial de equipo de trabajo",
}));
const annotations: Row[] = [];
const audit: Row[] = [];
const accounts: Row[] = [
  {
    id: fixedId(50),
    nombre: "Administrador demo",
    correo: "admin@example.invalid",
    rol: "administrador",
    estado: "activa",
    version: 1,
  },
];
const settings: Row[] = [
  { id: fixedId(51), destinatario: "inventario@example.invalid", version: 1 },
];
const notices: Row[] = [];
const jobs = new Map<string, Row>();
const replay = new Map<string, any>();
function reject(status: number, code = "DEMO_ERROR"): never {
  throw new ApiError(status, code);
}
function mail() {
  const n = {
    id: id(),
    destinatario: settings[0].destinatario,
    proposito: "Cambio de inventario (simulado)",
    estado: "entregado",
    version: 1,
    intentos: 1,
    ciclo_intentos: 1,
    siguiente_en: now(),
    creado_en: now(),
    proveedor_ref: null,
    ultimo_error_codigo: null,
    attempts: [
      { numero: 1, resultado: "simulado", codigo: null, registrado_en: now() },
    ],
  };
  notices.unshift(n);
  window.dispatchEvent(
    new CustomEvent("demo-mail", {
      detail:
        "Correo simulado: se mostraría un aviso a " +
        n.destinatario +
        ". No se envió ningún correo.",
    }),
  );
}
function enrich(b: Row): Row {
  const c = custodias.find((c) => c.bien_id === b.id && !c.fin_en);
  const p = people.find((p) => p.id === c?.funcionario_id);
  return {
    ...b,
    bien_id: b.id,
    funcionario_id: p?.id ?? null,
    funcionario_nombre: p?.nombre ?? null,
    unidad_id: p?.unidad_id ?? null,
    unidad_nombre: units.find((u) => u.id === p?.unidad_id)?.nombre ?? null,
    inicio_en: c?.inicio_en ?? null,
  };
}
function filtered(rows: Row[], q: URLSearchParams) {
  return rows.filter((r) =>
    [...q].every(([k, v]) => {
      if (!v || ["cursor", "limit"].includes(k)) return true;
      if (k === "q")
        return Object.values(r).some((x) =>
          String(x ?? "")
            .toLocaleLowerCase()
            .includes(v.toLocaleLowerCase()),
        );
      if (k === "desde" || k === "hasta") {
        const date = String(
          r.efectiva_en ?? r.adquisicion ?? r.creado_en ?? "",
        ).slice(0, 10);
        return k === "desde" ? date >= v : date <= v;
      }
      if (k === "custodia")
        return v === "asignado" ? !!r.funcionario_id : !r.funcionario_id;
      return String(r[k] ?? "") === v;
    }),
  );
}
function page(rows: Row[], q: URLSearchParams) {
  const start = Number(q.get("cursor") || 0),
    limit = Number(q.get("limit") || 25);
  return {
    items: rows.slice(start, start + limit),
    nextCursor: start + limit < rows.length ? String(start + limit) : null,
  };
}
function report(type: string, q: URLSearchParams) {
  const sections = (
    type === "busqueda" ? ["bienes", "funcionarios"] : [type]
  ).map((name) => {
    let rows =
      name === "movimientos"
        ? movements.map((m) => ({
            ...m,
            codigo: assets.find((b) => b.id === m.bien_id)?.codigo,
          }))
        : name === "auditoria"
          ? audit
          : name === "funcionarios"
            ? people
            : assets.map(enrich);
    rows = filtered(rows, q);
    if (name === "por-funcionario") rows = rows.filter((r) => r.funcionario_id);
    const columns = (
      name === "movimientos"
        ? ["codigo", "tipo", "efectiva_en", "origen_id", "destino_id", "motivo"]
        : name === "funcionarios"
          ? ["id", "nombre", "cargo", "unidad_id", "activo"]
          : name === "auditoria"
            ? ["id", "accion", "entidad", "entidad_ref", "registrada_en"]
            : [
                "codigo",
                "tipo",
                "marca",
                "modelo",
                "condicion",
                "situacion",
                "funcionario_nombre",
                "unidad_nombre",
              ]
    ).map((key) => ({ key, label: key.replaceAll("_", " ") }));
    return {
      name,
      total: rows.length,
      dateField: name === "movimientos" ? "efectiva_en" : "adquisicion",
      columns,
      ...page(rows, q),
    };
  });
  const filters = Object.fromEntries(
    [...q].filter(([k]) => !["limit", "cursor"].includes(k)),
  );
  return {
    generatedAt: now(),
    filters,
    sections,
    total: sections.reduce((n, s) => n + s.total, 0),
    subtotals: Object.fromEntries(
      ["bueno", "regular", "malo"].map((c) => [
        c,
        filtered(assets.map(enrich), q).filter((b) => b.condicion === c).length,
      ]),
    ),
  };
}
export async function demoApi(
  path: string,
  options: RequestInit = {},
): Promise<{ body: any; etag: string | null }> {
  const url = new URL(path, "https://demo.invalid/"),
    q = url.searchParams;
  const [resource, ref, op] = url.pathname.slice(1).split("/");
  const method = options.method ?? "GET",
    write = method !== "GET";
  const d: Row = options.body ? JSON.parse(String(options.body)) : {};
  const result = (body: any) => ({
    body: structuredClone(body),
    etag: body?.version ? `"v${body.version}"` : null,
  });
  if (resource === "demo" && ref === "rol") {
    if (!["lectura", "administrador"].includes(d.rol)) reject(400);
    role = d.rol;
    return result(null);
  }
  if (resource === "sesion")
    return result({
      nombre: "Administrador demo",
      rol: role,
      csrf: "demo-only",
      mfaRequired: false,
      factors: [],
      expiresAt: "9999-12-31T00:00:00Z",
      idleExpiresAt: "9999-12-31T00:00:00Z",
    });
  if (write && role !== "administrador" && resource !== "exportaciones")
    reject(403);
  if (
    role !== "administrador" &&
    (["admin", "avisos"].includes(resource) ||
      (resource === "reportes" && ref === "auditoria") ||
      d.tipo === "auditoria")
  )
    reject(403);
  const key = new Headers(options.headers).get("Idempotency-Key");
  if (write && key && replay.has(key)) return result(replay.get(key));
  if (resource === "resumen")
    return result({
      generatedAt: now(),
      metrics: {
        registrados: assets.length,
        asignados: custodias.filter((c) => !c.fin_en).length,
        disponibles: assets
          .map(enrich)
          .filter(
            (b) =>
              b.situacion === "activo" &&
              b.condicion !== "malo" &&
              !b.funcionario_id,
          ).length,
        funcionarios_activos: people.filter((p) => p.activo).length,
        ...Object.fromEntries(
          ["bueno", "regular", "malo"].map((c) => [
            c,
            assets.filter((b) => b.condicion === c).length,
          ]),
        ),
        malos_asignados: assets
          .map(enrich)
          .filter((b) => b.condicion === "malo" && b.funcionario_id).length,
      },
      recent: movements
        .slice(-5)
        .reverse()
        .map((m) => ({
          ...m,
          referencia: m.id,
          codigo: assets.find((b) => b.id === m.bien_id)?.codigo,
        })),
    });
  if (resource === "reportes" || resource === "buscar")
    return result(report(ref ?? "busqueda", q));
  if (resource === "exportaciones") {
    if (write) {
      const snapshot = report(
        d.tipo,
        new URLSearchParams({ ...d.filtros, limit: "10000" }),
      );
      const job = {
        ref: id(),
        formato: d.formato,
        estado: "listo",
        total: snapshot.total,
        generatedAt: now(),
        expiresAt: "9999-12-31T00:00:00Z",
        snapshot,
      };
      jobs.set(job.ref, job);
      if (key) replay.set(key, job);
      return result(job);
    }
    const job = jobs.get(ref) ?? reject(404);
    if (
      role !== "administrador" &&
      job.snapshot.sections.some((s: Row) => s.name === "auditoria")
    )
      reject(403);
    return result(job);
  }
  const tables: Record<string, Row[]> = {
    bienes: assets,
    funcionarios: people,
    unidades: units,
    movimientos: movements,
    avisos: notices,
  };
  const table =
    resource === "admin"
      ? (
          { cuentas: accounts, unidades: units, avisos: settings } as Record<
            string,
            Row[]
          >
        )[ref]
      : tables[resource];
  if (!table) reject(404);
  const recordId = resource === "admin" ? op : ref;
  let r = recordId ? table.find((r) => r.id === recordId) : undefined;
  if (
    resource === "admin" &&
    ref === "cuentas" &&
    url.pathname.endsWith("/enlace")
  ) {
    mail();
    return result({
      message:
        "Correo de invitación simulado. No se envió ningún mensaje real.",
    });
  }
  if (!write) {
    if (!recordId)
      return result(
        page(
          filtered(resource === "bienes" ? assets.map(enrich) : table, q),
          q,
        ),
      );
    if (!r) reject(404);
    if (op === "historia" && resource !== "admin") {
      const cs = custodias.filter(
        (c) => c[resource === "bienes" ? "bien_id" : "funcionario_id"] === ref,
      );
      return result({
        custodias: cs,
        vigentes: cs.filter((c) => !c.fin_en),
        pertenencias: pertenencias.filter((p) => p.funcionario_id === ref),
        movimientos: movements.filter(
          (m) =>
            m.bien_id === ref || m.origen_id === ref || m.destino_id === ref,
        ),
        anotaciones: annotations.filter((a) =>
          movements.some((m) => m.id === a.movimiento_id && m.bien_id === ref),
        ),
        next: {},
      });
    }
    return result(r);
  }
  if (recordId && !r) reject(404);
  const expected = new Headers(options.headers).get("If-Match");
  if (r && expected && expected !== `"v${r.version}"`) reject(412);
  if (method === "DELETE") {
    if (!["bienes", "funcionarios"].includes(resource)) reject(403);
    custodias
      .filter(
        (c) =>
          !c.fin_en &&
          c[resource === "bienes" ? "bien_id" : "funcionario_id"] === ref,
      )
      .forEach((c) => (c.fin_en = now()));
    table.splice(table.indexOf(r!), 1);
  } else if (resource === "bienes" && op === "movimientos") {
    const b = r!,
      c = custodias.find((c) => c.bien_id === ref && !c.fin_en);
    const destination = people.find((p) => p.id === d.destino && p.activo);
    if (
      ["asignacion", "traslado"].includes(d.tipo) &&
      (!destination || b.situacion === "baja" || b.condicion === "malo")
    )
      reject(422);
    if (d.tipo === "asignacion" && c) reject(422);
    if (
      ["devolucion", "traslado"].includes(d.tipo) &&
      (!c || c.funcionario_id !== d.origenEsperado)
    )
      reject(422);
    if (d.tipo === "baja" && c) reject(422);
    if (["devolucion", "traslado"].includes(d.tipo)) c!.fin_en = now();
    if (["asignacion", "traslado"].includes(d.tipo))
      custodias.push({
        id: id(),
        bien_id: ref,
        funcionario_id: d.destino,
        inicio_en: now(),
        fin_en: null,
      });
    const anterior = b.condicion;
    if (d.tipo === "condicion") b.condicion = d.condicion;
    if (d.tipo === "baja") b.situacion = "baja";
    if (d.tipo === "reactivacion") b.situacion = "activo";
    movements.push({
      id: id(),
      bien_id: ref,
      tipo: d.tipo,
      origen_id: c?.funcionario_id ?? null,
      destino_id: destination?.id ?? null,
      unidad_origen_nombre:
        units.find(
          (u) =>
            u.id === people.find((p) => p.id === c?.funcionario_id)?.unidad_id,
        )?.nombre ?? null,
      unidad_destino_nombre:
        units.find((u) => u.id === destination?.unidad_id)?.nombre ?? null,
      condicion_anterior: anterior,
      condicion_nueva: b.condicion,
      motivo: d.motivo,
      efectiva_en: now(),
      registrada_en: now(),
    });
    b.version++;
  } else if (resource === "funcionarios" && op === "pertenencias") {
    if (!units.some((u) => u.id === d.unidad_id && u.activa)) reject(422);
    pertenencias
      .filter((p) => p.funcionario_id === ref && !p.fin_en)
      .forEach((p) => (p.fin_en = now()));
    r!.unidad_id = d.unidad_id;
    r!.version++;
    pertenencias.push({
      id: id(),
      funcionario_id: ref,
      unidad_id: d.unidad_id,
      unidad_nombre: units.find((u) => u.id === d.unidad_id)!.nombre,
      inicio_en: now(),
      fin_en: null,
    });
  } else if (resource === "funcionarios" && op === "estado") {
    if (
      !d.activo &&
      custodias.some((c) => c.funcionario_id === ref && !c.fin_en)
    )
      reject(422);
    r!.activo = d.activo;
    r!.version++;
  } else if (resource === "movimientos" && op === "anotaciones") {
    annotations.push({
      id: id(),
      movimiento_id: ref,
      texto: d.texto,
      motivo: d.motivo,
      registrada_en: now(),
    });
  } else if (r) {
    if (
      resource === "bienes" &&
      table.some((b) => b.id !== ref && b.codigo === d.codigo)
    )
      reject(409);
    Object.assign(r, d, { version: r.version + 1 });
    if (typeof r.activa === "string") r.activa = r.activa === "true";
  } else {
    if (resource === "bienes" && assets.some((b) => b.codigo === d.codigo))
      reject(409);
    r = {
      id: id(),
      creado_en: now(),
      version: 1,
      ...(resource === "bienes"
        ? { situacion: "activo" }
        : { activo: true, activa: true }),
      ...d,
    };
    table.push(r);
    if (resource === "funcionarios")
      pertenencias.push({
        id: id(),
        funcionario_id: r.id,
        unidad_id: r.unidad_id,
        unidad_nombre: units.find((u) => u.id === r!.unidad_id)?.nombre,
        inicio_en: now(),
        fin_en: null,
      });
  }
  audit.push({
    id: id(),
    accion: method,
    entidad: resource,
    entidad_ref: r?.id ?? ref,
    registrada_en: now(),
  });
  mail();
  const body = { ...r, ref: r?.id ?? ref };
  if (key) replay.set(key, body);
  return result(body);
}
export async function downloadDemoExport(ref: string) {
  const job = jobs.get(ref) ?? reject(404);
  const sections = job.snapshot.sections;
  if (
    role !== "administrador" &&
    sections.some((s: Row) => s.name === "auditoria")
  )
    reject(403);
  if (job.formato === "xlsx") {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    await writeXlsxFile(
      sections.map((s: any) => ({
        sheet: s.name,
        data: [
          s.columns.map((c: any) => ({ value: c.label, fontWeight: "bold" })),
          ...s.items.map((r: Row) =>
            s.columns.map((c: any) => ({
              value: String(r[c.key] ?? ""),
              type: String,
            })),
          ),
        ],
      })),
    ).toFile("inventario-demo.xlsx");
  } else {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape" });
    let y = 15;
    const line = (text: string) => {
      for (const part of doc.splitTextToSize(text, 270)) {
        if (y > 190) {
          doc.addPage();
          y = 15;
        }
        doc.text(part, 12, y);
        y += 6;
      }
    };
    doc.setFontSize(10);
    line("Inventario TI - Modo demo - " + job.generatedAt);
    sections.forEach((s: any) => {
      line(s.name);
      s.items.forEach((r: Row) =>
        line(
          s.columns
            .map((c: any) => `${c.label}: ${r[c.key] ?? "—"}`)
            .join(" | "),
        ),
      );
    });
    doc.save("inventario-demo.pdf");
  }
}
