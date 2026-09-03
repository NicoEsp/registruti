// Helpers HTTP compartidos por el endpoint MCP y los endpoints OAuth.
//
// CORS abierto a propósito: los endpoints se autentican por bearer token o por
// PKCE, no por cookies, así que un origen ajeno no gana nada con el preflight;
// y sin estos headers los clientes MCP que corren en el browser (MCP Inspector,
// playgrounds) no pueden ni descubrir el servidor.
export const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers":
    "Authorization, Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "access-control-expose-headers": "WWW-Authenticate, Mcp-Session-Id, Mcp-Protocol-Version",
  "access-control-max-age": "86400",
};

export function json(payload: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Lee los parámetros de un POST OAuth. El estándar es
 * application/x-www-form-urlencoded, pero algunos clientes mandan JSON; se
 * aceptan los dos. Devuelve siempre strings.
 */
export async function readFormOrJson(req: Request): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") ?? "";
  const raw = await req.text();
  const out: Record<string, string> = {};
  if (contentType.includes("application/json")) {
    let parsed: unknown;
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      return out;
    }
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
        else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
      }
    }
    return out;
  }
  for (const [k, v] of new URLSearchParams(raw)) out[k] = v;
  return out;
}

/** Credenciales de cliente enviadas por HTTP Basic (RFC 6749 §2.3.1), si las hay. */
export function readBasicAuth(req: Request): { clientId: string; clientSecret: string } | null {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Basic\s+([A-Za-z0-9+/=]+)$/i);
  if (!match) return null;
  let decoded: string;
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return null;
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return null;
  try {
    return {
      clientId: decodeURIComponent(decoded.slice(0, idx)),
      clientSecret: decodeURIComponent(decoded.slice(idx + 1)),
    };
  } catch {
    return { clientId: decoded.slice(0, idx), clientSecret: decoded.slice(idx + 1) };
  }
}
