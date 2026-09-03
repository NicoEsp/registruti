import { SITE_URL } from "@/lib/site";

// URL pública bajo la que viven el servidor MCP y su authorization server.
//
// Tiene que ser el host canónico (apex, sin www): www.registruti.app redirige
// al apex y ese salto es cross-origin, así que `fetch` borra el header
// Authorization al seguirlo y el token nunca llega. Por eso todo el metadata
// OAuth (issuer, endpoints, resource) se arma desde acá y no desde el host de
// la request: un cliente que descubra el servidor a través de un host
// equivocado igual termina apuntando al correcto.
//
// `MCP_BASE_URL` existe para los previews de Vercel y las pruebas locales
// (scripts/mcp-e2e), donde el host real no es registruti.app.
export const MCP_BASE_URL = (process.env.MCP_BASE_URL ?? SITE_URL).replace(/\/+$/, "");

export const MCP_ENDPOINT = `${MCP_BASE_URL}/api/mcp`;

export const OAUTH = {
  issuer: MCP_BASE_URL,
  authorizationEndpoint: `${MCP_BASE_URL}/oauth/authorize`,
  tokenEndpoint: `${MCP_BASE_URL}/api/oauth/token`,
  registrationEndpoint: `${MCP_BASE_URL}/api/oauth/register`,
  revocationEndpoint: `${MCP_BASE_URL}/api/oauth/revoke`,
  // RFC 9728: metadata del recurso protegido, en la variante con path del
  // recurso (/api/mcp). Es la URL que anuncia el 401 en WWW-Authenticate.
  protectedResourceMetadata: `${MCP_BASE_URL}/.well-known/oauth-protected-resource/api/mcp`,
  documentation: `${MCP_BASE_URL}/blog/mcp`,
} as const;

// Scopes del MCP. Se muestran en la pantalla de autorización y se aplican en
// tools/list y tools/call. Un token personal (generado en Ajustes) tiene todos.
export const SCOPES = {
  read: "Ver tus clientes, horas y reportes",
  write: "Cargar horas en tu nombre",
} as const;

export type Scope = keyof typeof SCOPES;

export const ALL_SCOPES: Scope[] = ["read", "write"];

export function isScope(s: string): s is Scope {
  return s in SCOPES;
}

/**
 * Interpreta un parámetro `scope` ("read write"). Los valores desconocidos se
 * ignoran; si no queda ninguno, se otorgan todos (es lo que piden Claude y el
 * SDK oficial cuando no especifican). Devuelve null solo si el cliente pidió
 * scopes y ninguno es de los nuestros: eso sí es un pedido inválido.
 */
export function parseScopes(raw: string | null | undefined): Scope[] | null {
  const requested = (raw ?? "").split(/[\s,]+/).filter(Boolean);
  if (requested.length === 0) return [...ALL_SCOPES];
  const known = ALL_SCOPES.filter((s) => requested.includes(s));
  return known.length > 0 ? known : null;
}

export function scopeString(scopes: Scope[]): string {
  return ALL_SCOPES.filter((s) => scopes.includes(s)).join(" ");
}

// Vidas útiles.
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hora
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 24 * 60 * 60; // 60 días, se renueva en cada refresh
export const AUTH_CODE_TTL_SECONDS = 10 * 60; // 10 minutos
// Ventana en la que un refresh token ya rotado sigue valiendo, para no romper
// al cliente que dispara dos refresh a la vez (pasa en Claude al reconectar).
export const REFRESH_ROTATION_GRACE_SECONDS = 60;

// Límites del registro dinámico de clientes (RFC 7591), que es anónimo y
// escribe en la base: por IP y global, por hora. Un usuario legítimo registra
// un cliente por app y por máquina; esto solo frena a quien intente inflar la
// tabla. Los clientes registrados que nunca completan una autorización se
// borran a los 7 días (public.mcp_oauth_cleanup).
export const REGISTER_LIMIT_PER_IP_PER_HOUR = 20;
export const REGISTER_LIMIT_GLOBAL_PER_HOUR = 500;
// Tope de Client ID Metadata Documents cacheados en memoria por instancia.
export const CLIENT_METADATA_CACHE_MAX = 200;
