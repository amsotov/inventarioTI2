import { Field } from "./fields";
import { ModelWorkspace, protectModelNavigation } from "./model";
import { DEMO_MODE } from "./demoMode";
import { Processes, protectProcessNavigation } from "./processes";
import { Reports, protectReportNavigation } from "./reports";
import { Admin } from "./admin";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, ApiError, message } from "./api";
import "./style.css";
type Row = Record<string, any>;
type Session = {
  rol: string;
  csrf: string;
  mfaRequired: boolean;
  factors: { id: string; factorType: string }[];
  expiresAt: string;
  idleExpiresAt: string;
};
const resources = [
  "bienes",
  "funcionarios",
  "unidades",
  "movimientos",
] as const;
type Resource = (typeof resources)[number];
const titles: Record<Resource, string> = {
  bienes: "Bienes",
  funcionarios: "Funcionarios",
  unidades: "Unidades",
  movimientos: "Movimientos",
};
const columns: Record<Resource, string[]> = {
  bienes: ["codigo", "tipo", "marca", "modelo", "condicion", "situacion"],
  funcionarios: ["nombre", "cargo", "unidad_id", "activo"],
  unidades: ["nombre", "activa"],
  movimientos: [
    "tipo",
    "bien_id",
    "efectiva_en",
    "unidad_origen_nombre",
    "unidad_destino_nombre",
  ],
};
function route() {
  return location.hash.slice(1) || (DEMO_MODE || import.meta.env.VITE_MODERNIZATION_ENTRY === "true" ? "modelo/equipos" : "bienes");
}
function App() {
  const [session, setSession] = useState<Session | null>(null),
    [checking, setChecking] = useState(true),
    [view, setView] = useState(route),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false),
    [enrollment, setEnrollment] = useState<Row | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    const change = () => {
      if (protectProcessNavigation() || protectReportNavigation() || protectModelNavigation()) return;
      generation.current++;
      setView(route());
      setError("");
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (!DEMO_MODE) return;
    const showMail = (event: Event) => setNotice((event as CustomEvent<string>).detail);
    window.addEventListener("demo-mail", showMail);
    return () => window.removeEventListener("demo-mail", showMail);
  }, []);
  async function refresh() {
    const { body } = await api("sesion");
    setSession(body);
    return body as Session;
  }
  useEffect(() => {
    refresh()
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(message(e));
      })
      .finally(() => setChecking(false));
  }, []);
  function fail(e: unknown) {
    setError(message(e));
    if (e instanceof ApiError && e.status === 401) {
      generation.current++;
      setSession(null);
      setEnrollment(null);
    }
  }
  useEffect(() => {
    if (!session) return;
    const tick = () => {
      if (
        Date.now() >=
        Math.min(
          Date.parse(session.expiresAt),
          Date.parse(session.idleExpiresAt),
        )
      ) {
        setSession(null);
        setError("La sesión terminó. Inicia sesión nuevamente.");
        generation.current++;
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);
  async function action(fn: () => Promise<void>) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget,
      d = new FormData(f);
    await action(async () => {
      await api("sesion", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(d)),
      });
      f.reset();
      await refresh();
    });
  }
  const [rows, setRows] = useState<Row[]>([]),
    [detail, setDetail] = useState<Row | null>(null),
    [etag, setEtag] = useState<string | null>(null),
    [next, setNext] = useState<string | null>(null),
    [cursors, setCursors] = useState<(string | null)[]>([null]),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [loading, setLoading] = useState(false),
    [loadError, setLoadError] = useState(""),
    [revision, setRevision] = useState(0),
    [edit, setEdit] = useState(false);
  const [resource, ref] = view.split("/") as [Resource, string | undefined];
  const valid = resources.includes(resource),
    newItem = resource === "bienes" && ref === "nuevo";
  useEffect(() => {
    setFilters({});
    setCursors([null]);
    setDetail(null);
    setEdit(false);
  }, [view]);
  // Ignore responses belonging to a previous route, session, filter or page.
  useEffect(() => {
    if (!session || session.mfaRequired || !valid || newItem) return;
    const request = ++generation.current;
    let active = true;
    setLoading(true);
    setLoadError("");
    setRows([]);
    setDetail(null);
    setEtag(null);
    setEdit(false);
    const q = new URLSearchParams({ ...filters, limit: "25" });
    const cursor = cursors.at(-1);
    if (cursor) q.set("cursor", cursor);
    api(resource + (ref ? "/" + encodeURIComponent(ref) : "?" + q))
      .then(({ body, etag }) => {
        if (!active || request !== generation.current) return;
        if (ref) {
          setDetail(body);
          setEtag(etag);
        } else {
          setRows(body.items);
          setNext(body.nextCursor);
        }
      })
      .catch((e) => {
        if (active && request === generation.current) {
          setLoadError(message(e));
          if (e instanceof ApiError && e.status === 401) fail(e);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session, view, filters, cursors, revision]);
  const [pending, setPending] = useState<{
    path: string;
    method: string;
    body: string;
    key: string;
    etag: string | null;
  } | null>(null);
  const [uncertain, setUncertain] = useState(false);
  useEffect(() => {
    if (!session) {
      setPending(null);
      setUncertain(false);
    }
  }, [session]);
  useEffect(() => {
    if (!pending) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending]);
  async function send(command: NonNullable<typeof pending>) {
    setBusy(true);
    setError("");
    setUncertain(false);
    try {
      const { body } = await api(
        command.path,
        {
          method: command.method,
          body: command.body,
          headers: {
            "Idempotency-Key": command.key,
            ...(command.etag ? { "If-Match": command.etag } : {}),
          },
        },
        session!.csrf,
      );
      setPending(null);
      setEdit(false);
      setNotice(DEMO_MODE ? "Bien guardado en memoria. Correo simulado; no se envió ningún correo." : "Bien guardado. Aviso pendiente de procesamiento.");
      if (location.hash === "#bienes/" + body.ref) setRevision((x) => x + 1);
      else location.hash = "bienes/" + body.ref;
    } catch (e) {
      fail(e);
      if (!(e instanceof ApiError) || e.status >= 500) {
        setPending(command);
        setUncertain(true);
      } else setPending(null);
    } finally {
      setBusy(false);
    }
  }
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || pending) return;
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Row;
    for (const k of [
      "serie",
      "motivo_sin_serie",
      "adquisicion",
      "observaciones",
    ])
      if (!data[k]) data[k] = null;
    if (!data.serie && !data.motivo_sin_serie) {
      setError("Indica el motivo de ausencia de serie.");
      return;
    }
    const command = {
      path: "bienes" + (newItem ? "" : "/" + ref),
      method: newItem ? "POST" : "PATCH",
      body: JSON.stringify(data),
      key: crypto.randomUUID(),
      etag: newItem ? null : etag,
    };
    setPending(command);
    void send(command);
  }
  const focus = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) focus.current?.focus();
  }, [error]);
  const modelView = view === "modelo" || view.startsWith("modelo/");
  const canWrite = session?.rol === "administrador" && !session.mfaRequired;
  return (
    <>
      {DEMO_MODE && <div className="demo-banner" role="region" aria-label="Modo demo">
        <strong>Modo demo</strong> · Datos ficticios en memoria. Recargar reinicia los cambios.
        <span>Modernización interactiva · sin conexión a bases de datos.</span>
        {session && <label>Rol demo <select aria-label="Rol demo" value={session.rol}
          disabled={busy || !!pending}
          onChange={(e) => void action(async () => {
            await api("demo/rol", { method: "POST", body: JSON.stringify({ rol: e.target.value }) });
            await refresh();
            setView(route());
          })}>
          <option value="administrador">Administrador</option>
          <option value="lectura">Solo lectura</option>
        </select></label>}
      </div>}
      <a className="skip" href="#contenido" onClick={(event) => {
        event.preventDefault();
        document.getElementById("contenido")?.focus();
      }}>
        Saltar al contenido
      </a>
      <aside>
        <div className="brand">
          IT<span>Inventario TI</span>
        </div>
        <p>Control de bienes computacionales</p>
        <nav aria-label="Principal">
          {DEMO_MODE && <><a href="#modelo/equipos" aria-current={modelView?"page":undefined}>Equipos y relaciones</a><small>Inventario anterior · muestra independiente</small></>}
          <a href="#resumen" aria-current={view==='resumen'?'page':undefined}>Resumen</a>
          {resources.map((r) => (
            <a
              key={r}
              href={"#" + r}
              aria-current={resource === r ? "page" : undefined}
            >
              {titles[r]}
            </a>
          ))}
          {!DEMO_MODE && <a href="#modelo/equipos" aria-current={modelView?"page":undefined}>Equipos y relaciones</a>}
          {DEMO_MODE && import.meta.env.VITE_PAGES_PREVIEW === 'true' && <a href={import.meta.env.BASE_URL + 'modernizacion/'}>Modernización · vista previa</a>}
        {canWrite && <a href="#administracion" aria-current={view==="administracion"?"page":undefined}>Administración</a>}
          <a href="#reportes" aria-current={view==='reportes'?'page':undefined}>Reportes y buscador</a>
        </nav>
        <small>Inventario compartido · UTC</small>
      </aside>
      <main id="contenido" tabIndex={-1}>
        <header>
          <span>Inventario / {modelView ? 'Equipos y relaciones' : view === 'resumen' ? 'Resumen' : view === 'reportes' ? 'Reportes' : view === "administracion" ? "Administración" : valid ? titles[resource] : "Acceso"}</span>
          {session && (
            <div>
              <span>
                {session.rol === "administrador" ? "Administrador" : "Lectura"}
              </span>
              {!DEMO_MODE && <button
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    await api(
                      "sesion/salir",
                      { method: "POST", body: "{}" },
                      session.csrf,
                    );
                    generation.current++;
                    setSession(null);
                    setRows([]);
                    setDetail(null);
                    setPending(null);
                  })
                }
              >
                Cerrar sesión
              </button>}
            </div>
          )}
        </header>
        {error && (
          <div className="error" role="alert" tabIndex={-1} ref={focus}>
            {error}
          </div>
        )}
        {notice && (
          <p role="status" className="success">
            {notice}
          </p>
        )}
        {checking ? (
          <p role="status">Comprobando sesión…</p>
        ) : !session ? (
          <section className="card access">
            <h1>Acceso al inventario</h1>
            <p>Utiliza tu cuenta institucional habilitada.</p>
            <form onSubmit={login}>
              <label>
                Correo
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  maxLength={320}
                />
              </label>
              <label>
                Contraseña
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={1024}
                />
              </label>
              <button disabled={busy}>Iniciar sesión</button>
            </form>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = String(
                  new FormData(e.currentTarget).get("email"),
                );
                void action(async () => {
                  const { body } = await api("acceso/recuperar", {
                    method: "POST",
                    body: JSON.stringify({ email }),
                  });
                  setNotice(body.message);
                });
              }}
            >
              <h2>Recuperar acceso</h2>
              <label>
                Correo de recuperación
                <input type="email" name="email" required />
              </label>
              <button disabled={busy}>Solicitar enlace</button>
            </form>
            <button
              onClick={() =>
                void action(async () => {
                  await refresh();
                })
              }
              disabled={busy}
            >
              Comprobar conexión
            </button>
          </section>
        ) : session.mfaRequired ? (
          <section className="card access">
            <h1>Verificación de administrador</h1>
            <p>Completa el segundo factor para acceder al inventario.</p>
            {!session.factors.length && !enrollment && (
              <button
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    setEnrollment(
                      (
                        await api(
                          "sesion/mfa/enrolar",
                          { method: "POST", body: "{}" },
                          session.csrf,
                        )
                      ).body,
                    );
                  })
                }
              >
                Configurar autenticador
              </button>
            )}
            {enrollment && (
              <p>
                Clave para tu autenticador: <code>{enrollment.secret}</code>
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                void action(async () => {
                  await api(
                    "sesion/mfa/verificar",
                    { method: "POST", body: JSON.stringify(data) },
                    session.csrf,
                  );
                  setEnrollment(null);
                  await refresh();
                });
              }}
            >
              <label>
                Factor
                <select name="factor" required>
                  {enrollment && (
                    <option value={enrollment.id}>Nuevo autenticador</option>
                  )}
                  {session.factors.map((f) => (
                    <option value={f.id} key={f.id}>
                      {f.factorType} · {f.id}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Código de seis dígitos
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="one-time-code"
                  required
                />
              </label>
              <button
                disabled={busy || (!enrollment && !session.factors.length)}
              >
                Verificar
              </button>
            </form>
          </section>
        ) : view === 'resumen' || view === 'reportes' ? (
          <Reports key={DEMO_MODE ? session.rol : undefined} summary={view==='resumen'} admin={canWrite} csrf={session.csrf} onExpired={()=>setSession(null)}/>
        ) : view === "administracion" ? (
          canWrite ? <Admin csrf={session.csrf} onExpired={()=>{setSession(null);}}/> : <section className="card"><h1>Acceso restringido</h1><p>No tienes permiso para administrar.</p></section>
        ) : modelView ? (
          <ModelWorkspace key={session.rol} view={view} csrf={session.csrf} canWrite={canWrite} onExpired={()=>setSession(null)}/>
        ) : !valid ? (
          <section className="card">
            <h1>Vista no disponible</h1>
            <p>
              Esta sección no está disponible. Puedes consultar el inventario
              desde la navegación principal.
            </p>
            <a href="#bienes">Ir a bienes</a>
          </section>
        ) : (
          <>
            <div className="title">
              <div>
                <h1>
                  {newItem
                    ? "Nuevo bien"
                    : ref
                      ? "Ficha de " +
                        (resource === "bienes"
                          ? "bien"
                          : titles[resource].toLowerCase())
                      : titles[resource]}
                </h1>
                <p>
                  {ref
                    ? "Datos disponibles en el inventario"
                    : "Consulta compartida · fechas en UTC"}
                </p>
              </div>
              {resource === "bienes" && !ref && canWrite && (
                <a className="button" href="#bienes/nuevo">
                  Nuevo bien
                </a>
              )}
            </div>
            {!ref && (
              <form
                className="card filters"
                onSubmit={(e) => {
                  e.preventDefault();
                  const values = Object.fromEntries(
                    [...new FormData(e.currentTarget)].filter(
                      ([, v]) => v !== "",
                    ),
                  ) as Record<string, string>;
                  if (
                    values.desde &&
                    values.hasta &&
                    values.desde > values.hasta
                  ) {
                    setError("El rango de fechas está invertido.");
                    return;
                  }
                  setError("");
                  setFilters(values);
                  setCursors([null]);
                }}
                key={resource}
              >
                {resource !== "movimientos" && (
                  <Field
                    name="q"
                    label={
                      resource === "bienes"
                        ? "Buscar por código"
                        : "Buscar por nombre"
                    }
                  />
                )}
                {resource === "bienes" && (
                  <>
                    <label>
                      Condición
                      <select name="condicion">
                        <option value="">Todas</option>
                        {["bueno", "regular", "malo"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Situación
                      <select name="situacion">
                        <option value="">Todas</option>
                        <option>activo</option>
                        <option>baja</option>
                      </select>
                    </label>
                    <Field name="tipo" label="Tipo" />
                  </>
                )}
                {resource === "funcionarios" && (
                  <Field name="unidad_id" label="Referencia de unidad" />
                )}
                {resource === "movimientos" && (
                  <>
                    <Field name="bien_id" label="Referencia de bien" />
                    <Field name="tipo" label="Tipo de movimiento" />
                  </>
                )}
                {resource !== "unidades" && (
                  <>
                    <Field
                      name="desde"
                      label={
                        resource === "bienes"
                          ? "Adquisición desde (UTC)"
                          : resource === "funcionarios"
                            ? "Alta desde (UTC)"
                            : "Fecha efectiva desde (UTC)"
                      }
                      type="date"
                    />
                    <Field
                      name="hasta"
                      label="Hasta (UTC, inclusive)"
                      type="date"
                    />
                  </>
                )}
                <button disabled={loading}>Aplicar filtros</button>
                <button
                  type="reset"
                  onClick={() => {
                    setFilters({});
                    setCursors([null]);
                    setError("");
                  }}
                >
                  Limpiar
                </button>
              </form>
            )}
            {loading && <p role="status">Cargando inventario…</p>}
            {loadError && (
              <div role="alert" className="error">
                {loadError}
                <button onClick={() => setRevision((x) => x + 1)}>
                  Volver a consultar
                </button>
              </div>
            )}
            {!ref && !loading && !loadError && (
              <section className="card">
                <div
                  className="table"
                  tabIndex={0}
                  role="region"
                  aria-label={titles[resource]}
                >
                  <table>
                    <caption>
                      {titles[resource]} · página {cursors.length}
                    </caption>
                    <thead>
                      <tr>
                        {columns[resource].map((k) => (
                          <th key={k}>{k.replaceAll("_", " ")}</th>
                        ))}
                        <th>Ficha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          {columns[resource].map((k) => (
                            <td key={k}>{String(row[k] ?? "—")}</td>
                          ))}
                          <td>
                            <a href={"#" + resource + "/" + row.id}>
                              Ver ficha
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!rows.length && (
                  <p role="status">
                    Sin resultados para los filtros seleccionados.
                  </p>
                )}
                <div className="pagination">
                  <button
                    disabled={cursors.length === 1}
                    onClick={() => setCursors((x) => x.slice(0, -1))}
                  >
                    Anterior
                  </button>
                  <span>Página {cursors.length}</span>
                  <button
                    disabled={!next}
                    onClick={() => setCursors((x) => [...x, next])}
                  >
                    Siguiente
                  </button>
                </div>
              </section>
            )}
            {ref && !newItem && detail && !loading && (
              <section className="card">
                <dl>
                  {Object.entries(detail).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k.replaceAll("_", " ")}</dt>
                      <dd>{String(v ?? "—")}</dd>
                    </div>
                  ))}
                </dl>
                {DEMO_MODE && canWrite && ["bienes", "funcionarios"].includes(resource) && <button
                  onClick={() => void action(async () => {
                    if (!window.confirm("¿Eliminar este registro de la demo? Sus asignaciones se cerrarán.")) return;
                    await api(resource + "/" + ref, { method: "DELETE" });
                    location.hash = resource;
                  })}>Eliminar de la demo</button>}
                {resource === "bienes" && (
                  <>
                    <a
                      href="#movimientos"
                      onClick={(e) => {
                        e.preventDefault();
                        location.hash = "movimientos";
                      }}
                    >
                      Consultar movimientos
                    </a>
                    <p>
                      Filtra los movimientos por la referencia de este bien:{" "}
                      {ref}.
                    </p>
                    {canWrite && (
                      <button
                        disabled={busy || !!pending}
                        onClick={() => setEdit((x) => !x)}
                      >
                        Editar atributos
                      </button>
                    )}
                  </>
                )}
              </section>
            )}
            {!edit && !pending && (
              (resource === "funcionarios" && !ref && canWrite) ||
              (detail && ["bienes", "funcionarios"].includes(resource))
            ) && (
              <Processes
                key={"processes:" + view}
                resource={resource}
                record={ref ? detail : null}
                csrf={session.csrf}
                canWrite={canWrite}
                onExpired={() => setSession(null)}
                onStart={() => setNotice("")}
                onSaved={() => {
                  setNotice(DEMO_MODE ? "Proceso confirmado en memoria. Correo simulado; no se envió ningún correo." : "Proceso confirmado y auditado.");
                  setRevision(x => x + 1);
                }}
              />
            )}
            {(newItem || edit) && canWrite && (
              <section className="card">
                <h2>{newItem ? "Registrar bien" : "Editar atributos"}</h2>
                <p>
                  Los campos con * son obligatorios. La edición conserva
                  condición, situación y custodia.
                </p>
                <form
                  onSubmit={save}
                  key={newItem ? "new" : ref + ":" + detail?.version}
                >
                  <fieldset disabled={busy || !!pending}>
                    <div className="grid">
                      {["codigo", "tipo", "marca", "modelo"].map((k) => (
                        <Field
                          key={k}
                          name={k}
                          label={
                            {
                              codigo: "Código",
                              tipo: "Tipo",
                              marca: "Marca",
                              modelo: "Modelo",
                            }[k]!
                          }
                          value={detail?.[k] ?? ""}
                          required
                        />
                      ))}
                      <Field
                        name="serie"
                        label="Serie"
                        value={detail?.serie ?? ""}
                      />
                      <Field
                        name="motivo_sin_serie"
                        label="Motivo de ausencia de serie"
                        value={detail?.motivo_sin_serie ?? ""}
                      />
                      <Field
                        name="adquisicion"
                        label="Adquisición (UTC)"
                        type="date"
                        value={detail?.adquisicion?.slice(0, 10) ?? ""}
                      />
                      {newItem && (
                        <label>
                          Condición *
                          <select name="condicion" required>
                            <option>bueno</option>
                            <option>regular</option>
                            <option>malo</option>
                          </select>
                        </label>
                      )}
                      <Field
                        name="observaciones"
                        label="Observaciones"
                        value={detail?.observaciones ?? ""}
                      />
                      <Field name="motivo" label="Motivo del cambio" required />
                    </div>
                    <button>Guardar bien</button>
                  </fieldset>
                </form>
                <button
                  disabled={busy || !!pending}
                  onClick={() => {
                    setRevision((x) => x + 1);
                    setError("");
                  }}
                >
                  Recargar ficha
                </button>
                <a href="#bienes">Volver a bienes</a>
              </section>
            )}
            {newItem && !canWrite && (
              <p role="alert" className="error">
                No tienes permiso para registrar bienes.
              </p>
            )}
            {uncertain && pending && (
              <div className="error" role="alert">
                <p>
                  Resultado incierto. Conservamos exactamente la operación y su
                  clave. Consulta la ficha antes de decidir; no crees otra alta.
                </p>
                <button disabled={busy} onClick={() => void send(pending)}>
                  Reintentar la misma operación
                </button>
              </div>
            )}
            <footer>
              <p>Inventario compartido. Fechas y consultas en UTC.</p>
              <button
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    await api(
                      "sesion/actividad",
                      { method: "POST", body: "{}" },
                      session.csrf,
                    );
                    await refresh();
                    setNotice("Sesión renovada por actividad.");
                  })
                }
              >
                Continuar sesión
              </button>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
