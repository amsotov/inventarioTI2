export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public requestId?: string,
  ) {
    super(code);
  }
}
export async function api(
  path: string,
  options: RequestInit = {},
  csrf?: string,
) {
  const response = await fetch("/api/v1/" + path, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok)
    throw new ApiError(response.status, body.code ?? "ERROR", body.requestId);
  return { body, etag: response.headers.get("etag") };
}
export function message(e: unknown): string {
  if (!(e instanceof ApiError))
    return "Servicio no disponible. Comprueba la conexión y vuelve a consultar.";
  const messages: Record<number, string> = {
    400: "Revisa los campos y filtros.",
    401: "La sesión terminó. Inicia sesión nuevamente.",
    403: "No tienes permiso para esta operación.",
    404: "Registro no encontrado.",
    409: "Conflicto: el identificador o la clave de operación ya existe.",
    412: "Otro usuario modificó este bien. Recarga la ficha y revisa los cambios antes de guardar.",
    428: "Falta la versión del bien. Recarga la ficha.",
    422: "Los datos incumplen una regla del inventario.",
    429: "Demasiados intentos. Espera antes de volver a intentar.",
    503: "Servicio no disponible. La operación puede requerir conciliación.",
  };
  return (
    (messages[e.status] ?? "No se pudo completar la operación.") +
    (e.requestId ? " Referencia: " + e.requestId : "")
  );
}
