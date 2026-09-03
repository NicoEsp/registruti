// Destino al que volver después de iniciar sesión.
//
// El login es un redirect a Google y de vuelta a /auth/callback, que siempre
// entraba a /tracker. Para flujos que arrancan afuera de la app —la pantalla
// de autorización OAuth del MCP, que abre Claude— hay que retomar donde el
// usuario estaba. Se guarda en localStorage (sobrevive al viaje a Google y
// funciona en los in-app browsers de mobile) con vencimiento corto, y se
// consume una sola vez.

const KEY = "registruti:post-login-next";
const MAX_AGE_MS = 15 * 60 * 1000;

/** Solo paths relativos del propio sitio: nada de open redirects. */
export function isSafeNextPath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\") &&
    path.length < 4000
  );
}

export function setPostLoginNext(path: string): void {
  if (!isSafeNextPath(path)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    /* storage bloqueado: el usuario cae en /tracker como siempre */
  }
}

export function peekPostLoginNext(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { path, at } = JSON.parse(raw) as { path?: unknown; at?: unknown };
    if (typeof at !== "number" || Date.now() - at > MAX_AGE_MS || !isSafeNextPath(path)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return path;
  } catch {
    return null;
  }
}

export function consumePostLoginNext(): string | null {
  const path = peekPostLoginNext();
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
  return path;
}
