"use strict";
// Fase 2: estado efímero y sintético. No hay API, credenciales ni persistencia.
const people = [
  {
    id: "F-DEMO-01",
    name: "Camila Demo",
    job: "Analista de gestión",
    unit: "Administración",
    email: "camila@example.invalid",
    active: true,
    date: "2026-01-05",
  },
  {
    id: "F-DEMO-02",
    name: "Diego Ejemplo",
    job: "Soporte TI",
    unit: "Tecnología",
    email: "diego@example.invalid",
    active: true,
    date: "2026-02-12",
  },
  {
    id: "F-DEMO-03",
    name: "Valentina Muestra",
    job: "Profesional de finanzas",
    unit: "Finanzas",
    email: "valentina@example.invalid",
    active: true,
    date: "2026-03-02",
  },
  {
    id: "F-DEMO-04",
    name: "Tomás Ficticio",
    job: "Administrativo",
    unit: "Administración",
    email: "",
    active: false,
    date: "2025-07-08",
  },
];
const goods = [
  {
    code: "TI-0001",
    type: "Notebook",
    brand: "Lenovo",
    model: "ThinkPad E14",
    serial: "DEMO-LEN-001",
    date: "2026-02-10",
    condition: "Bueno",
    person: "F-DEMO-01",
    active: true,
    notes: "Equipo de demostración.",
  },
  {
    code: "TI-0002",
    type: "Monitor",
    brand: "Dell",
    model: "P2425H",
    serial: "DEMO-DEL-002",
    date: "2026-02-10",
    condition: "Bueno",
    person: "F-DEMO-01",
    active: true,
    notes: "",
  },
  {
    code: "TI-0003",
    type: "Notebook",
    brand: "HP",
    model: "ProBook 440",
    serial: "DEMO-HP-003",
    date: "2026-03-15",
    condition: "Regular",
    person: "F-DEMO-02",
    active: true,
    notes: "",
  },
  {
    code: "TI-0004",
    type: "Monitor",
    brand: "Samsung",
    model: "S24C310",
    serial: "DEMO-SAM-004",
    date: "2026-04-18",
    condition: "Bueno",
    person: "",
    active: true,
    notes: "",
  },
  {
    code: "TI-0005",
    type: "Dock",
    brand: "Lenovo",
    model: "USB-C Dock",
    serial: "",
    serialReason: "Etiqueta ilegible en muestra sintética",
    date: "2026-05-09",
    condition: "Bueno",
    person: "F-DEMO-03",
    active: true,
    notes: "",
  },
  {
    code: "TI-0006",
    type: "Impresora",
    brand: "Brother",
    model: "HL-L5210",
    serial: "DEMO-BRO-006",
    date: "2025-08-11",
    condition: "Malo",
    person: "",
    active: false,
    notes: "Baja ficticia.",
  },
  {
    code: "TI-0007",
    type: "Notebook",
    brand: "Dell",
    model: "Latitude 5450",
    serial: "DEMO-DEL-007",
    date: "2026-08-01",
    condition: "Bueno",
    person: "",
    active: true,
    notes: "",
  },
  {
    code: "TI-0008",
    type: "Monitor",
    brand: "LG",
    model: "24MR400",
    serial: "DEMO-LG-008",
    date: "2025-11-02",
    condition: "Malo",
    person: "F-DEMO-02",
    active: true,
    notes: "Mantiene custodia; devolución pendiente.",
  },
];
let events = [
  {
    id: "MOV-003",
    code: "TI-0008",
    action: "Cambio de condición",
    from: "F-DEMO-02",
    to: "F-DEMO-02",
    fromUnit: "Tecnología",
    toUnit: "Tecnología",
    date: "2026-10-30T14:20:00Z",
    reason: "Falla detectada en revisión de muestra",
    detail: "Bueno → Malo",
  },
  {
    id: "MOV-002",
    code: "TI-0001",
    action: "Asignación",
    from: "",
    to: "F-DEMO-01",
    fromUnit: "",
    toUnit: "Administración",
    date: "2026-10-29T09:15:00Z",
    reason: "Entrega de equipo ficticia",
    detail: "Sin asignar → Camila Demo",
  },
  {
    id: "MOV-001",
    code: "TI-0003",
    action: "Traslado",
    from: "F-DEMO-04",
    to: "F-DEMO-02",
    fromUnit: "Administración",
    toUnit: "Tecnología",
    date: "2026-10-28T11:00:00Z",
    reason: "Reasignación ficticia",
    detail: "Tomás Ficticio → Diego Ejemplo",
  },
];
let audit = [
  {
    id: "AUD-001",
    date: "2026-10-30T14:20:00Z",
    entity: "TI-0008",
    action: "Cambio de condición",
    before: "Bueno",
    after: "Malo",
    actor: "Administrador Demo",
  },
];
let recipient = "encargado@example.invalid";
let accounts = [
  {
    id: "CTA-01",
    name: "Administrador Demo",
    email: "admin@example.invalid",
    role: "Administrador",
    active: true,
  },
  {
    id: "CTA-02",
    name: "Consulta Demo",
    email: "consulta@example.invalid",
    role: "Lectura",
    active: true,
  },
];
let filters = {
  q: "",
  condition: "",
  type: "",
  custody: "",
  unit: "",
  state: "",
  start: "",
  end: "",
};
let role = "admin",
  globalQuery = "",
  route = "",
  detail = "";
const $ = (s) => document.querySelector(s);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const norm = (v) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const canonical = (v) => String(v).trim().toUpperCase();
const who = (id) => people.find((p) => p.id === id);
const unit = (g) => who(g.person)?.unit || "Sin unidad por custodia";
const stamp = (date) =>
  new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(date)) + " UTC";
const badge = (v) =>
  `<span class="badge ${["Bueno", "Activo", "Asignado"].includes(v) ? "good" : ["Regular", "Sin asignar", "Pendiente"].includes(v) ? "warn" : ["Malo", "Baja", "Inactivo", "Fallido"].includes(v) ? "bad" : ""}">${esc(v)}</span>`;
const linkGood = (code) =>
  `<a href="#bien/${encodeURIComponent(code)}">${esc(code)}</a>`;
const linkPerson = (id) =>
  id
    ? `<a href="#funcionario/${encodeURIComponent(id)}">${esc(who(id)?.name || id)}</a>`
    : "Sin asignar";
const btn = (text, action, primary = false, extra = "") =>
  `<button ${primary ? 'class="primary"' : ""} data-action="${action}" ${extra}>${text}</button>`;
const adminBtn = (...args) => (role === "admin" ? btn(...args) : "");
const modules = [
  ["resumen", "◫", "Resumen"],
  ["bienes", "▣", "Bienes"],
  ["funcionarios", "♙", "Funcionarios"],
  ["buscar", "⌕", "Búsqueda global"],
  ["movimientos", "⇄", "Movimientos"],
  ["reportes", "▤", "Reportes"],
  ["cuentas", "♧", "Cuentas"],
  ["auditoria", "◎", "Auditoría"],
  ["configuracion", "⚙", "Configuración"],
  ["acceso", "↪", "Acceso demo"],
];
const privateRoutes = ["cuentas", "auditoria", "configuracion"];
function heading(title, subtitle, actions = "") {
  return `<div class="heading"><div><p class="eyebrow">GESTIÓN DE INVENTARIO</p><h1>${esc(title)}</h1><p class="subtitle">${esc(subtitle)}</p></div><div class="actions">${actions}</div></div>`;
}
function panel(title, body, action = "", sub = "") {
  return `<section class="panel"><div class="panel-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${action}</div>${body}</section>`;
}
function empty(text = "Prueba con otro término o elimina los filtros.") {
  return `<div class="empty"><div class="empty-symbol">⌕</div><strong>Sin resultados</strong>${esc(text)}</div>`;
}
function table(headers, rows) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Tabla desplazable"><table><thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
function goodTable(list) {
  return list.length
    ? table(
        ["Bien / identificación", "Tipo", "Condición", "Custodia", "Situación"],
        list
          .map(
            (g) =>
              `<tr><td>${linkGood(g.code)}<small>${esc(g.brand)} ${esc(g.model)}</small></td><td>${esc(g.type)}</td><td>${badge(g.condition)}</td><td>${linkPerson(g.person)}<small>${esc(unit(g))}</small></td><td>${badge(g.active ? "Activo" : "Baja")}</td></tr>`,
          )
          .join(""),
      )
    : empty();
}
function personTable(list) {
  return list.length
    ? table(
        ["Funcionario", "Cargo / unidad", "Bienes vigentes", "Estado"],
        list
          .map(
            (p) =>
              `<tr><td><a href="#funcionario/${p.id}">${esc(p.name)}</a><small>${esc(p.id)}</small></td><td>${esc(p.job)}<small>${esc(p.unit)}</small></td><td>${goods.filter((g) => g.person === p.id).length}</td><td>${badge(p.active ? "Activo" : "Inactivo")}</td></tr>`,
          )
          .join(""),
      )
    : empty();
}
function eventTable(list) {
  return list.length
    ? table(
        ["Movimiento / fecha efectiva", "Bien", "Origen → destino", "Motivo"],
        list
          .map(
            (e) =>
              `<tr><td><strong>${esc(e.action)}</strong><small>${esc(e.id)} · ${stamp(e.date)}</small></td><td>${linkGood(e.code)}</td><td>${linkPerson(e.from)} → ${linkPerson(e.to)}<small>${esc(e.fromUnit || "Sin unidad por custodia")} → ${esc(e.toUnit || "Sin unidad por custodia")}</small></td><td>${esc(e.reason)}<small>${esc(e.detail)} · Administrador Demo</small></td></tr>`,
          )
          .join(""),
      )
    : empty();
}
function dateMatches(date, start, end) {
  return (
    (!start || date?.slice(0, 10) >= start) &&
    (!end || date?.slice(0, 10) <= end)
  );
}
function filteredGoods() {
  return goods.filter(
    (g) =>
      (!filters.q ||
        norm(
          [g.code, g.serial, g.type, g.brand, g.model, g.condition].join(" "),
        ).includes(norm(filters.q))) &&
      (!filters.condition || g.condition === filters.condition) &&
      (!filters.type || g.type === filters.type) &&
      (!filters.custody ||
        (filters.custody === "asignado" ? !!g.person : !g.person)) &&
      (!filters.unit || who(g.person)?.unit === filters.unit) &&
      (!filters.state || (filters.state === "activo" ? g.active : !g.active)) &&
      dateMatches(g.date, filters.start, filters.end),
  );
}
function select(label, name, options, value = "", attrs = "") {
  return `<label>${esc(label)}<select name="${name}" ${attrs}>${options
    .map((o) => {
      let v = Array.isArray(o) ? o[0] : o,
        t = Array.isArray(o) ? o[1] : o;
      return `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(t)}</option>`;
    })
    .join("")}</select></label>`;
}
function input(label, name, value = "", type = "text", attrs = "") {
  return `<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
}
function fieldFilters() {
  return `<div class="filters" id="filters">${input("Buscar código, serie, marca o modelo", "q", filters.q, "search")}${select("Condición", "condition", [["", "Todas"], "Bueno", "Regular", "Malo"], filters.condition)}${select("Tipo", "type", [["", "Todos"], ...new Set(goods.map((g) => g.type))], filters.type)}${select(
    "Custodia",
    "custody",
    [
      ["", "Todas"],
      ["asignado", "Asignado"],
      ["libre", "Sin asignar"],
    ],
    filters.custody,
  )}${select("Unidad actual por custodia", "unit", [["", "Todas"], ...new Set(people.map((p) => p.unit))], filters.unit)}${select(
    "Situación administrativa",
    "state",
    [
      ["", "Todas"],
      ["activo", "Activo"],
      ["baja", "Baja"],
    ],
    filters.state,
  )}${input("Adquisición desde (UTC)", "start", filters.start, "date")}${input("Adquisición hasta (UTC)", "end", filters.end, "date")}</div>`;
}
function rangeError(start, end) {
  return start && end && start > end;
}
function summary() {
  const assigned = goods.filter((g) => g.person).length,
    available = goods.filter(
      (g) => !g.person && g.active && g.condition !== "Malo",
    ).length;
  return (
    heading(
      "Todo tu inventario, en un lugar",
      "Consulta los bienes, su custodia y los últimos movimientos.",
      adminBtn("＋ Registrar bien", "new-good", true),
    ) +
    `<div class="stats">${[
      ["Bienes registrados", goods.length, "Incluye activos y bajas", "▣"],
      ["Bienes asignados", assigned, "Con custodio vigente", "⇄"],
      ["Disponibles", available, "Activos en bueno o regular", "✓"],
      [
        "Funcionarios activos",
        people.filter((p) => p.active).length,
        "Muestra ficticia; no son cuentas",
        "♙",
      ],
    ]
      .map(
        (s) =>
          `<section class="stat"><div class="stat-top">${s[0]}<span class="stat-icon">${s[3]}</span></div><strong>${s[1]}</strong><small>${s[2]}</small></section>`,
      )
      .join(
        "",
      )}</div><div class="dashboard-grid"><div>${panel("Bienes en seguimiento", goodTable(goods.slice(0, 4)), '<a href="#bienes">Ver inventario ↗</a>', "Custodia y condición actual de la muestra")}${panel(
      "Últimos movimientos",
      `<div class="panel-body"><ol class="timeline">${events
        .slice(0, 3)
        .map(
          (e) =>
            `<li><h3>${esc(e.action)} · ${linkGood(e.code)}</h3><p>${esc(e.detail)}</p><time datetime="${e.date}">${stamp(e.date)}</time></li>`,
        )
        .join("")}</ol></div>`,
      '<a href="#movimientos">Ver todos ↗</a>',
    )}</div><div>${panel("Condición de los bienes", `<div class="panel-body"><p class="muted">Una vista de la condición física actual.</p><div class="distribution" aria-hidden="true">${["Bueno", "Regular", "Malo"].map((c) => `<span class="${c.toLowerCase()}" style="flex:${goods.filter((g) => g.condition === c).length}"></span>`).join("")}</div>${["Bueno", "Regular", "Malo"].map((c) => `<div class="legend-row"><span><i class="dot ${c.toLowerCase()}"></i>${c}</span><strong>${goods.filter((g) => g.condition === c).length} bienes</strong></div>`).join("")}<p class="preview-label">Condición, custodia y baja son dimensiones independientes.</p></div>`)}${panel("Requiere atención", `<div class="panel-body"><h3>1 bien en mal estado con custodia</h3><p class="muted">El responsable se conserva hasta registrar una devolución explícita.</p><p>${linkGood("TI-0008")} · ${linkPerson("F-DEMO-02")}</p><div class="note warning"><strong>Aviso simulado fallido</strong><br>El movimiento se conserva. Revisa la demostración de avisos en configuración.</div><a href="#configuracion">Revisar configuración →</a></div>`)}<div class="note">Esta muestra contiene ${goods.length} bienes. La referencia de 1.200 bienes es una estimación de planificación, no una existencia medida.</div></div></div>`
  );
}
function inventory() {
  return (
    heading(
      "Bienes",
      "Identificación, condición física y custodia actual.",
      btn("Vista de exportación", "export-search") +
        adminBtn("＋ Registrar bien", "new-good", true),
    ) +
    `<section class="panel">${fieldFilters()}<div id="goods-result"></div></section>`
  );
}
function goodsResult() {
  if (rangeError(filters.start, filters.end))
    return (
      '<div class="result-count">' +
      btn("Limpiar filtros", "clear-filters") +
      '</div><div class="error" role="alert">La fecha inicial no puede superar la final.</div>'
    );
  const list = filteredGoods();
  return `<div class="result-count"><span>${list.length} de ${goods.length} bienes · Rango por adquisición UTC</span>${btn("Limpiar filtros", "clear-filters")}</div>${goodTable(list)}`;
}
function goodDetail() {
  const g = goods.find((x) => x.code === detail);
  if (!g) return empty("No existe ese bien en la muestra.");
  return (
    heading(
      g.code,
      `${g.brand} ${g.model} · ${g.type}`,
      `<a href="#bienes">← Volver a bienes</a>` +
        adminBtn(
          "Registrar movimiento",
          "move",
          true,
          `data-code="${esc(g.code)}"`,
        ),
    ) +
    panel(
      "Ficha del bien",
      `<div class="panel-body">${badge(g.condition)} ${badge(g.person ? "Asignado" : "Sin asignar")} ${badge(g.active ? "Activo" : "Baja")}<dl class="details">${[
        ["Serie", g.serial || "Sin serie verificable"],
        ["Adquisición (UTC)", g.date],
        ["Custodio actual", linkPerson(g.person)],
        ["Unidad actual", esc(unit(g))],
        ["Observaciones", esc(g.notes || "Sin observaciones")],
        ["Ausencia de serie", esc(g.serialReason || "No aplica")],
      ]
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
        .join("")}</dl></div>`,
    ) +
    panel(
      "Historial del bien · UTC",
      eventTable(events.filter((e) => e.code === g.code)),
      adminBtn(
        "Anotar corrección",
        "annotation",
        false,
        `data-code="${esc(g.code)}"`,
      ),
      "Registros originales conservados. Las correcciones añaden evidencia.",
    )
  );
}
function personDetail() {
  const p = who(detail);
  if (!p) return empty("No existe ese funcionario en la muestra.");
  return (
    heading(
      p.name,
      `${p.id} · Funcionario ficticio`,
      `<a href="#funcionarios">← Volver a funcionarios</a>` +
        adminBtn(
          "Editar funcionario",
          "edit-person",
          true,
          `data-person="${p.id}"`,
        ),
    ) +
    panel(
      "Datos del funcionario",
      `<div class="panel-body">${badge(p.active ? "Activo" : "Inactivo")}<dl class="details">${[
        [p.docType || "ID institucional", p.document || p.id],
        ["Cargo", p.job],
        ["Unidad actual", p.unit],
        ["Correo", p.email || "No informado"],
        ["Alta (UTC)", p.date],
      ]
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
        .join(
          "",
        )}</dl>${role === "admin" ? `<div class="actions">${btn(p.active ? "Dar de baja" : "Reactivar", "person-state", false, `data-person="${p.id}"`)}</div>` : ""}</div>`,
    ) +
    panel(
      "Bienes vigentes",
      goodTable(goods.filter((g) => g.person === p.id)),
    ) +
    panel(
      "Bienes anteriores y movimientos · UTC",
      eventTable(events.filter((e) => e.from === p.id || e.to === p.id)),
      "",
      "La unidad de cada movimiento conserva su denominación histórica.",
    )
  );
}
function globalSearch() {
  const q = norm(globalQuery);
  const g = goods.filter((g) =>
    norm(
      [g.code, g.serial, g.brand, g.model, g.type, g.condition].join(" "),
    ).includes(q),
  );
  const p = people.filter((p) =>
    norm([p.id, p.document, p.name, p.email, p.job, p.unit].join(" ")).includes(
      q,
    ),
  );
  return (
    heading(
      "Búsqueda global",
      "Encuentra bienes y funcionarios desde una sola consulta.",
      btn("Vista de exportación", "export-search"),
    ) +
    `<label class="search-input">Código, serie, nombre, ID, correo, cargo o unidad<input id="global-query" type="search" value="${esc(globalQuery)}" placeholder="Prueba con Camila, Tecnología o TI-0001"></label><div id="search-result"><div class="search-results">${panel(`Bienes · ${g.length}`, goodTable(g))}${panel(`Funcionarios · ${p.length}`, personTable(p))}</div></div>`
  );
}
function movements() {
  return (
    heading(
      "Movimientos",
      "Fecha efectiva al confirmar · Sin retroactividad ni edición del original.",
      adminBtn("＋ Registrar movimiento", "move", true),
    ) +
    `<section class="panel"><div class="filters">${input("Buscar código, motivo o movimiento", "event-q", "", "search")}${input("Fecha efectiva desde (UTC)", "event-start", "", "date")}${input("Fecha efectiva hasta (UTC)", "event-end", "", "date")}${select("Unidad histórica de origen o destino", "event-unit", [["", "Todas"], ...new Set(people.map((p) => p.unit))])}</div><div id="event-result">${eventTable(events)}</div></section>`
  );
}
const reports = [
  "Inventario general",
  "Bienes por funcionario",
  "Movimientos",
  "Bienes por condición",
  "Auditoría",
];
function reportScreen() {
  return (
    heading(
      "Reportes",
      "Vista previa de los cinco reportes · Excel y PDF se representan sin generar archivos.",
    ) +
    `<div class="report-grid">${reports
      .filter((r) => role === "admin" || r !== "Auditoría")
      .map(
        (r) =>
          `<article class="report-card"><div class="number">REPORTE 0${reports.indexOf(r) + 1}</div><h2>${r}</h2><p>${r === "Movimientos" ? "Fecha efectiva y unidades históricas" : r === "Auditoría" ? "Fecha de registro, actor y cambios" : r === "Bienes por funcionario" ? "Asignación vigente y unidad actual" : "Situación actual, con rango por adquisición"} · UTC.</p><div class="actions">${btn("Vista Excel", "report", false, `data-report="${r}" data-format="Excel"`)}${btn("Vista PDF", "report", false, `data-report="${r}" data-format="PDF"`)}</div></article>`,
      )
      .join(
        "",
      )}</div><div class="note">Las vistas excluyen RUT/ID documental y correo personal por defecto. No hay descarga real en este prototipo. Los límites aprobados son 10.000 filas Excel y 2.000 PDF; nunca truncar silenciosamente.</div>`
  );
}
function accountScreen() {
  return (
    heading(
      "Cuentas",
      "Los funcionarios y las cuentas de acceso se gestionan por separado.",
      adminBtn("＋ Invitar cuenta", "invite", true),
    ) +
    panel(
      "Acceso a la organización",
      table(
        ["Cuenta", "Rol", "Estado", "Acciones"],
        accounts
          .map(
            (a) =>
              `<tr><td>${esc(a.name)}<small>${esc(a.email)}</small></td><td>${esc(a.role)}</td><td>${badge(a.active ? "Activo" : "Inactivo")}</td><td>${a.id === "CTA-01" ? '<span class="muted">Tu cuenta · rol y activación protegidos</span>' : btn("Gestionar", "account", false, `data-account="${a.id}"`)}</td></tr>`,
          )
          .join(""),
      ),
    ) +
    `<div class="note">MFA obligatorio para administración. Invitaciones: 24 h y un uso. La demo no autentica, envía invitaciones ni aplica seguridad real.</div>`
  );
}
function auditScreen() {
  return (
    heading(
      "Auditoría",
      "Evidencia sintética de cambios · Solo vista administrador.",
    ) +
    `<section class="panel"><div class="filters">${input("Actor, entidad o acción", "audit-q", "", "search")}${input("Registro desde (UTC)", "audit-start", "", "date")}${input("Registro hasta (UTC)", "audit-end", "", "date")}</div><div id="audit-result">${auditTable(audit)}</div></section>`
  );
}
function auditTable(list) {
  return list.length
    ? table(
        ["Registro UTC", "Actor", "Entidad / acción", "Anterior → nuevo"],
        list
          .map(
            (a) =>
              `<tr><td>${esc(a.id)}<small>${stamp(a.date)}</small></td><td>${esc(a.actor)}</td><td>${esc(a.entity)}<small>${esc(a.action)}</small></td><td>${esc(a.before)} → ${esc(a.after)}</td></tr>`,
          )
          .join(""),
      )
    : empty();
}
function configuration() {
  return (
    heading(
      "Configuración",
      "Destinatario y seguimiento de avisos de demostración.",
    ) +
    panel(
      "Destinatario de avisos",
      `<div class="panel-body"><h3>${esc(recipient)}</h3><p class="muted">Los nuevos avisos usan el destinatario vigente al confirmar. Los avisos pendientes mantienen el original.</p>${adminBtn("Cambiar destinatario", "recipient", true)}</div>`,
    ) +
    panel(
      "Estado de avisos · Simulación",
      table(
        ["Referencia", "Evento", "Estado", "Detalle"],
        `<tr><td>AV-DEMO-01</td><td>TI-0008 · Condición</td><td>${badge("Fallido")}</td><td>Error transitorio ficticio · 3 reintentos agotados<small>Destinatario: encargado@example.invalid</small>${btn("Simular reintento con motivo", "retry")}</td></tr><tr><td>AV-DEMO-02</td><td>Resultado de proveedor desconocido</td><td>${badge("Incierto")}</td><td>Conciliación pendiente; no repetir ciegamente</td></tr>`,
      ),
    ) +
    `<div class="note">El fallo de correo conserva la operación. No se envían mensajes. Respaldos aprobados: semanal, RPO 7 días, RTO 8 h, copias 30 días; todavía sin configuración operativa.</div>`
  );
}
function accessScreen() {
  return (
    heading(
      "Acceso · recorrido visual",
      "No introduzcas credenciales reales. Esta pantalla es una demostración.",
    ) +
    panel(
      "Ingresar o recuperar acceso",
      `<div class="panel-body"><p>En el producto futuro: sesión de 30 min de inactividad y máximo de 8 h. Sin autorregistro público.</p><div class="actions">${btn("Simular inicio y MFA", "login", true)}${btn("Recuperar acceso", "recover")}${btn("Ver enlace caducado", "expired")}${btn("Ver carga y error", "load-error")}</div></div>`,
    )
  );
}
function render(focus = false) {
  [route, detail = ""] = location.hash.slice(1).split("/");
  detail = decodeURIComponent(detail);
  route = route || "resumen";
  const title =
    modules.find((m) => m[0] === route)?.[2] ||
    { bien: "Ficha de bien", funcionario: "Ficha de funcionario" }[route] ||
    "Página no encontrada";
  $("#breadcrumb").textContent = `Espacio de trabajo / ${title}`;
  $("#nav").innerHTML = modules
    .filter((m) => role === "admin" || !privateRoutes.includes(m[0]))
    .map(
      ([id, icon, label]) =>
        `<a href="#${id}" ${route === id || (id === "bienes" && route === "bien") || (id === "funcionarios" && route === "funcionario") ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</a>`,
    )
    .join("");
  if (role !== "admin" && privateRoutes.includes(route)) {
    $("#contenido").innerHTML =
      heading(
        "Vista restringida",
        "Esta sección está reservada al administrador en el diseño.",
      ) +
      '<div class="note">La selección de rol solo demuestra visibilidad. La autorización real requiere validación en servidor en sus fases.</div>';
    return;
  }
  const screens = {
    resumen: summary,
    bienes: inventory,
    bien: goodDetail,
    funcionarios: () =>
      heading(
        "Funcionarios",
        "Custodios, unidades y bienes vigentes.",
        adminBtn("＋ Registrar funcionario", "new-person", true),
      ) + panel("Directorio de muestra", personTable(people)),
    funcionario: personDetail,
    buscar: globalSearch,
    movimientos: movements,
    reportes: reportScreen,
    cuentas: accountScreen,
    auditoria: auditScreen,
    configuracion: configuration,
    acceso: accessScreen,
  };
  $("#contenido").innerHTML = (
    screens[route] ||
    (() => empty("La ruta solicitada no existe. Usa la navegación."))
  )();
  if (route === "bienes") $("#goods-result").innerHTML = goodsResult();
  if (focus) $("#contenido").focus();
}
function announce(message) {
  $("#announcement").textContent = message;
  clearTimeout(announce.timer);
  announce.timer = setTimeout(
    () => ($("#announcement").textContent = ""),
    6000,
  );
}
function modal(title, body, submit, onSubmit) {
  const origin = document.activeElement;
  $("#dialog-body").innerHTML =
    `<h2 id="dialog-title">${esc(title)}</h2><p class="subtitle">Simulación · Datos ficticios · Sin persistencia</p><form id="demo-form" novalidate>${body}<div id="form-error" class="error" role="alert" tabindex="-1"></div><div class="actions">${btn("Cancelar", "close")}<button class="primary" type="submit">${esc(submit)}</button></div></form>`;
  const d = $("#dialog");
  d.querySelectorAll("input,select,textarea").forEach((f) =>
    f.setAttribute("aria-describedby", "form-error"),
  );
  d.showModal();
  d.addEventListener(
    "close",
    () => {
      if (origin?.isConnected) origin.focus();
    },
    { once: true },
  );
  $("#demo-form").onsubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const invalid = [...form.querySelectorAll("input,select,textarea")].find(
      (f) => !f.checkValidity(),
    );
    if (invalid) {
      fail("Completa los campos obligatorios y revisa el formato indicado.");
      invalid.setAttribute("aria-invalid", "true");
      invalid.focus();
      return;
    }
    onSubmit(Object.fromEntries(new FormData(form)));
  };
}
function fail(text) {
  $("#form-error").textContent = text;
  $("#form-error").focus();
}
function done(text) {
  $("#dialog").close();
  render();
  announce(text + " · Solo en esta demo.");
}
function record(entity, action, before, after) {
  audit.unshift({
    id: `AUD-${audit.length + 1}`,
    date: new Date().toISOString(),
    entity,
    action,
    before,
    after,
    actor: "Administrador Demo",
  });
}
function newGood() {
  modal(
    "Registrar bien",
    `<div class="form-grid">${input("Código de inventario *", "code", "", "text", 'required maxlength="50"')}${input("Serie (opcional)", "serial", "", "text", 'maxlength="100"')}${input("Motivo si no hay serie", "serialReason")}${select("Tipo *", "type", ["Notebook", "Monitor", "Dock", "Impresora"])}${input("Marca *", "brand", "", "text", 'required maxlength="80"')}${input("Modelo *", "model", "", "text", 'required maxlength="100"')}${input("Fecha de adquisición * (UTC)", "date", "", "date", `required max="${new Date().toISOString().slice(0, 10)}"`)}${select("Condición *", "condition", ["Bueno", "Regular", "Malo"])}<label class="full">Observaciones<textarea name="notes" maxlength="500"></textarea></label></div>`,
    "Registrar en demo",
    (v) => {
      if (goods.some((g) => canonical(g.code) === canonical(v.code)))
        return fail(
          "El código ya existe, incluso si el bien está dado de baja.",
        );
      if (
        v.serial &&
        goods.some(
          (g) => g.serial && canonical(g.serial) === canonical(v.serial),
        )
      )
        return fail("La serie ya existe.");
      if (!v.serial.trim() && !v.serialReason.trim())
        return fail("Indica el motivo de ausencia de serie.");
      if (!v.code.trim() || !v.brand.trim() || !v.model.trim())
        return fail("Código, marca y modelo no pueden estar vacíos.");
      goods.push({
        ...v,
        code: canonical(v.code),
        serial: v.serial.trim(),
        person: "",
        active: true,
      });
      record(v.code, "Alta de bien", "—", v.model);
      done("Bien registrado");
    },
  );
}
function validRut(raw) {
  const v = raw.replace(/[.\s-]/g, "").toUpperCase();
  if (!/^\d{7,8}[\dK]$/.test(v)) return false;
  let s = 0,
    f = 2;
  for (const c of v.slice(0, -1).split("").reverse()) {
    s += Number(c) * f;
    f = f === 7 ? 2 : f + 1;
  }
  const d = 11 - (s % 11);
  return v.at(-1) === (d === 11 ? "0" : d === 10 ? "K" : String(d));
}
function personForm(p) {
  modal(
    p ? "Editar funcionario" : "Registrar funcionario",
    `<div class="form-grid">${select("Tipo de documento *", "docType", ["ID institucional", "RUT"], p?.docType || "ID institucional")}${input("Identificador *", "id", p?.document || p?.id || "", "text", "required")}${input("Nombre *", "name", p?.name || "", "text", "required")}${input("Cargo *", "job", p?.job || "", "text", "required")}${select("Unidad *", "unit", ["Administración", "Tecnología", "Finanzas"], p?.unit || "Administración")}${input("Correo (opcional)", "email", p?.email || "", "email")}${p ? input("Motivo del cambio *", "reason", "", "text", "required") : ""}</div>`,
    "Guardar en demo",
    (v) => {
      if (
        !v.id.trim() ||
        !v.name.trim() ||
        !v.job.trim() ||
        (p && !v.reason.trim())
      )
        return fail(
          "Los campos obligatorios no pueden contener solo espacios.",
        );
      if (v.docType === "RUT" && !validRut(v.id))
        return fail("El RUT no tiene un dígito verificador válido.");
      let id =
        v.docType === "RUT"
          ? v.id.replace(/[.\s-]/g, "").toUpperCase()
          : canonical(v.id);
      if (
        people.some(
          (x) =>
            x !== p &&
            (x.docType || "ID institucional") === v.docType &&
            canonical(x.document || x.id) === id,
        )
      )
        return fail("El identificador ya existe, incluidos los inactivos.");
      if (p) {
        const before = p.unit;
        Object.assign(p, v, { id: p.id, document: id });
        record(p.id, "Edición de funcionario", before, v.unit);
      } else {
        const ref = `F-DEMO-${String(people.length + 1).padStart(2, "0")}`;
        people.push({
          ...v,
          id: ref,
          document: id,
          active: true,
          date: new Date().toISOString().slice(0, 10),
        });
        record(ref, "Alta de funcionario", "—", v.name);
      }
      done("Funcionario guardado");
    },
  );
}
function move(code) {
  const options = goods.map((g) => [
    g.code,
    `${g.code} · ${g.brand} ${g.model}`,
  ]);
  modal(
    "Registrar movimiento",
    `<div class="form-grid">${select("Bien *", "code", options, code || goods[0].code)}${select("Operación *", "operation", ["Asignación", "Devolución", "Traslado", "Cambio de condición", "Baja", "Reactivación"])}${select("Funcionario destino (asignación / traslado)", "person", [["", "Seleccionar"], ...people.filter((p) => p.active).map((p) => [p.id, p.name])])}${select("Nueva condición (solo cambio de condición)", "condition", ["Bueno", "Regular", "Malo"])}<label class="full">Motivo *<textarea name="reason" required maxlength="500"></textarea></label></div><div class="note">Se hará efectivo al confirmar, en UTC. El motivo y la confirmación son obligatorios. No se edita historia.</div><label><input type="checkbox" name="confirm" required style="width:auto;vertical-align:middle"> Confirmo el movimiento simulado</label>`,
    "Confirmar movimiento",
    (v) => {
      const g = goods.find((g) => g.code === v.code),
        from = g.person,
        fromUnit = who(from)?.unit || "",
        before = `${g.condition} / ${g.person || "Sin asignar"} / ${g.active ? "Activo" : "Baja"}`;
      if (!v.reason.trim()) return fail("Indica un motivo.");
      if (["Asignación", "Traslado"].includes(v.operation)) {
        if (!g.active || g.condition === "Malo")
          return fail(
            "No se puede asignar o trasladar un bien en baja o en mal estado.",
          );
        if (!who(v.person)?.active)
          return fail("Selecciona un funcionario activo de destino.");
        if (v.operation === "Asignación" && from)
          return fail("El bien ya tiene custodia. Usa traslado o devolución.");
        if (v.operation === "Traslado" && (!from || from === v.person))
          return fail("El traslado requiere custodia y un destino distinto.");
        g.person = v.person;
      } else if (v.operation === "Devolución") {
        if (!from) return fail("El bien no tiene custodia vigente.");
        g.person = "";
      } else if (v.operation === "Cambio de condición") {
        if (g.condition === v.condition)
          return fail("Selecciona una condición diferente de la actual.");
        g.condition = v.condition;
      } else if (v.operation === "Baja") {
        if (!g.active) return fail("El bien ya está en baja.");
        if (from) return fail("Devuelve el bien antes de darlo de baja.");
        g.active = false;
      } else if (v.operation === "Reactivación") {
        if (g.active) return fail("El bien ya está activo.");
        g.active = true;
      }
      const after = `${g.condition} / ${g.person || "Sin asignar"} / ${g.active ? "Activo" : "Baja"}`;
      events.unshift({
        id: `MOV-${events.length + 1}`,
        code: g.code,
        action: v.operation,
        from,
        to: g.person,
        fromUnit,
        toUnit: who(g.person)?.unit || "",
        date: new Date().toISOString(),
        reason: v.reason,
        detail: `${before} → ${after}`,
      });
      record(g.code, v.operation, before, after);
      done("Movimiento confirmado; custodia e historia actualizadas");
    },
  );
}
function motive(title, callback) {
  modal(
    title,
    input("Motivo *", "reason", "", "text", 'required maxlength="500"'),
    "Confirmar en demo",
    (v) => {
      if (!v.reason.trim()) return fail("Indica un motivo.");
      callback(v);
    },
  );
}
function reportPreview(name, format) {
  if (role !== "admin" && name === "Auditoría") return;
  const mixed = name === "Buscador";
  let content =
    name === "Movimientos"
      ? eventTable(events)
      : name === "Auditoría"
        ? auditTable(audit)
        : name === "Bienes por funcionario"
          ? goodTable(goods.filter((g) => g.person))
          : mixed && route === "buscar"
            ? (() => {
                const q = norm(globalQuery);
                return (
                  goodTable(
                    goods.filter((g) =>
                      norm(
                        [
                          g.code,
                          g.serial,
                          g.brand,
                          g.model,
                          g.type,
                          g.condition,
                        ].join(" "),
                      ).includes(q),
                    ),
                  ) +
                  personTable(
                    people.filter((p) =>
                      norm(
                        [p.name, p.id, p.email, p.job, p.unit].join(" "),
                      ).includes(q),
                    ),
                  )
                );
              })()
            : goodTable(
                mixed
                  ? filteredGoods()
                  : name === "Bienes por condición"
                    ? [...goods].sort(
                        (a, b) =>
                          ["Bueno", "Regular", "Malo"].indexOf(a.condition) -
                          ["Bueno", "Regular", "Malo"].indexOf(b.condition),
                      )
                    : goods,
              );
  modal(
    `${name} · Vista ${format}`,
    `<div class="note">Vista de diseño. No genera ${format}. Fecha de muestra: ${stamp(new Date())}. ${mixed ? "Conserva la consulta actual." : "Muestra completa sin filtros."} Columnas de referencia; contrato completo en CIERRE_FASE1 A-11.</div>${content}<p class="preview-label">Límite futuro: ${format === "PDF" ? "2.000" : "10.000"} filas; el producto deberá rechazar el exceso sin truncar.</p>`,
    "Cerrar vista",
    () => $("#dialog").close(),
  );
}
const handlers = {
  "load-error": () => {
    modal(
      "Cargando vista",
      '<div class="loading" role="status">Consultando datos de demostración…</div>',
      "Cerrar",
      () => $("#dialog").close(),
    );
    const loadingView = $(".loading");
    setTimeout(() => {
      if (loadingView.isConnected && $("#dialog").open) {
        $("#dialog-body").innerHTML =
          '<h2 id="dialog-title">No pudimos cargar la vista</h2><div class="error" role="alert">Error simulado. Tus cambios anteriores se conservan en esta sesión de demostración.</div><div class="actions">' +
          btn("Cerrar", "close") +
          btn("Reintentar", "load-retry", true) +
          "</div>";
        $("#dialog-body button").focus();
      }
    }, 700);
  },
  "load-retry": () => {
    $("#dialog").close();
    announce("Vista recuperada en la simulación.");
  },
  close: () => $("#dialog").close(),
  "new-good": newGood,
  "new-person": () => personForm(),
  "edit-person": (b) => personForm(who(b.dataset.person)),
  move: (b) => move(b.dataset.code),
  "clear-filters": () => {
    Object.keys(filters).forEach((k) => (filters[k] = ""));
    render();
  },
  "export-search": () => reportPreview("Buscador", "Excel / PDF"),
  report: (b) => reportPreview(b.dataset.report, b.dataset.format),
  "person-state": (b) => {
    const p = who(b.dataset.person);
    motive(
      p.active ? "Dar de baja al funcionario" : "Reactivar funcionario",
      (v) => {
        if (p.active && goods.some((g) => g.person === p.id))
          return fail(
            "El funcionario tiene bienes vigentes. Devuelve o traslada los bienes antes de la baja.",
          );
        p.active = !p.active;
        record(
          p.id,
          "Cambio de activación",
          String(!p.active),
          String(p.active),
        );
        done("Estado del funcionario actualizado");
      },
    );
  },
  annotation: (b) =>
    modal(
      "Anotar corrección",
      `${select(
        "Movimiento original *",
        "event",
        events
          .filter((e) => e.code === b.dataset.code)
          .map((e) => [e.id, `${e.id} · ${e.action}`]),
        "",
        "required",
      )}${input("Anotación / motivo *", "reason", "", "text", "required")}<div class="note">Conserva el original. Un cambio de custodia requiere movimientos compensatorios separados.</div>`,
      "Añadir anotación",
      (v) => {
        if (!v.reason.trim()) return fail("Indica el motivo.");
        const e = events.find((e) => e.id === v.event);
        if (!e) return fail("Selecciona un movimiento original.");
        events.unshift({
          ...e,
          id: `NOTA-${events.length + 1}`,
          date: new Date().toISOString(),
          action: "Anotación correctiva",
          reason: v.reason,
          detail: `Referencia original: ${e.id}`,
        });
        record(e.code, "Anotación correctiva", e.id, v.reason);
        done("Anotación añadida sin modificar el original");
      },
    ),
  recipient: () =>
    modal(
      "Cambiar destinatario",
      `${input("Nuevo correo *", "email", recipient, "email", "required")}${input("Motivo *", "reason", "", "text", "required")}<div class="note">Los pendientes conservan el destinatario original. El anterior no verá la dirección nueva.</div>`,
      "Confirmar cambio",
      (v) => {
        if (!v.reason.trim()) return fail("Indica el motivo.");
        if (norm(v.email.trim()) === norm(recipient))
          return fail("El nuevo destinatario debe ser diferente.");
        record("Configuración", "Cambio de destinatario", recipient, v.email);
        recipient = v.email;
        done("Destinatario actualizado sin enviar correos");
      },
    ),
  retry: () =>
    motive("Simular reintento de aviso", () =>
      done(
        "Reintento ilustrado con correlación AV-DEMO-01; no se envió correo",
      ),
    ),
  invite: () =>
    modal(
      "Invitar cuenta",
      `<div class="form-grid">${input("Nombre *", "name", "", "text", "required")}${input("Correo *", "email", "", "email", "required")}${select("Rol *", "role", ["Lectura", "Administrador"])}</div><div class="note">Invitación de un solo uso válida por 24 h. No se enviará ningún correo.</div>`,
      "Simular invitación",
      (v) => {
        if (!v.name.trim()) return fail("Indica un nombre.");
        if (accounts.some((a) => norm(a.email) === norm(v.email)))
          return fail("El correo ya tiene una cuenta.");
        accounts.push({
          ...v,
          id: `CTA-${accounts.length + 1}`,
          active: false,
        });
        record(v.email, "Invitación", "—", "Pendiente");
        done("Invitación preparada; cuenta pendiente sin acceso");
      },
    ),
  account: (b) => {
    const a = accounts.find((a) => a.id === b.dataset.account);
    modal(
      "Gestionar cuenta",
      `${select("Rol", "role", ["Lectura", "Administrador"], a.role)}${select(
        "Estado",
        "active",
        [
          ["true", "Activo"],
          ["false", "Inactivo"],
        ],
        String(a.active),
      )}${input("Motivo *", "reason", "", "text", "required")}`,
      "Confirmar cambio",
      (v) => {
        if (!v.reason.trim()) return fail("Indica el motivo.");
        if (a.id === "CTA-01")
          return fail("No puedes cambiar tu propio rol ni desactivarte.");
        if (
          a.role === "Administrador" &&
          a.active &&
          (v.role !== "Administrador" || v.active === "false") &&
          accounts.filter((x) => x.active && x.role === "Administrador")
            .length <= 1
        )
          return fail("Debe permanecer un administrador activo.");
        record(
          a.id,
          "Gestión de cuenta",
          `${a.role}/${a.active}`,
          `${v.role}/${v.active}`,
        );
        a.role = v.role;
        a.active = v.active === "true";
        done(
          "Cuenta actualizada; el producto real deberá revocar las sesiones previas",
        );
      },
    );
  },
  recover: () =>
    modal(
      "Recuperar acceso",
      input("Correo de la cuenta *", "email", "", "email", "required"),
      "Solicitar enlace demo",
      () =>
        done(
          "Si la cuenta es elegible, recibirá instrucciones. Enlace previsto: 30 min y un uso; no se envió correo",
        ),
    ),
  login: () =>
    modal(
      "Segundo factor · demostración",
      "<p>El administrador debe completar MFA antes de operar. El proveedor y la seguridad se implementarán en sus fases.</p>",
      "Continuar demo",
      () => {
        location.hash = "resumen";
        done("Recorrido visual de acceso completado");
      },
    ),
  expired: () =>
    modal(
      "Enlace no disponible",
      '<div class="error">Este enlace caducó o ya fue utilizado. Solicita otro enlace de recuperación.</div>',
      "Cerrar",
      () => $("#dialog").close(),
    ),
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  e.preventDefault();
  const action = b.dataset.action;
  if (
    role !== "admin" &&
    ![
      "close",
      "clear-filters",
      "report",
      "export-search",
      "recover",
      "login",
      "expired",
      "load-error",
      "load-retry",
    ].includes(action)
  )
    return;
  handlers[action]?.(b);
});
document.addEventListener("input", (e) => {
  if (e.target.closest("#filters")) {
    filters[e.target.name] = e.target.value;
    $("#goods-result").innerHTML = goodsResult();
  }
  if (e.target.id === "global-query") {
    globalQuery = e.target.value;
    const temp = document.createElement("div");
    temp.innerHTML = globalSearch();
    $("#search-result").innerHTML =
      temp.querySelector("#search-result").innerHTML;
  }
  if (e.target.name?.startsWith("event-")) {
    const q = norm($('[name="event-q"]').value),
      start = $('[name="event-start"]').value,
      end = $('[name="event-end"]').value,
      u = $('[name="event-unit"]').value;
    $("#event-result").innerHTML = rangeError(start, end)
      ? '<div class="error" role="alert">La fecha inicial no puede superar la final.</div>'
      : eventTable(
          events.filter(
            (x) =>
              norm([x.code, x.action, x.reason].join(" ")).includes(q) &&
              dateMatches(x.date, start, end) &&
              (!u || x.fromUnit === u || x.toUnit === u),
          ),
        );
  }
  if (e.target.name?.startsWith("audit-")) {
    const q = norm($('[name="audit-q"]').value),
      start = $('[name="audit-start"]').value,
      end = $('[name="audit-end"]').value;
    $("#audit-result").innerHTML = rangeError(start, end)
      ? '<div class="error" role="alert">La fecha inicial no puede superar la final.</div>'
      : auditTable(
          audit.filter(
            (a) =>
              norm([a.actor, a.entity, a.action].join(" ")).includes(q) &&
              dateMatches(a.date, start, end),
          ),
        );
  }
});
$(".skip").onclick = (e) => {
  e.preventDefault();
  $("#contenido").focus();
};
$("#role").onchange = (e) => {
  role = e.target.value;
  render();
  announce(
    `Vista ${role === "admin" ? "administrador" : "lectura"}; solo cambia la presentación.`,
  );
};
$("#reset").onclick = () => location.reload();
window.addEventListener("hashchange", () => render(true));
render();
