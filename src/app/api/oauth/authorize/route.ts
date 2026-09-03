import type { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import {
  AuthorizeError,
  OAuthError,
  createAuthorizationCode,
  denyRedirect,
  describeScopes,
  parseAuthorizeRequest,
} from "@/lib/mcp/oauth";

// Backend de la pantalla de autorización (/oauth/authorize). La sesión de
// Registruti vive en el browser (supabase-js), así que la página valida el
// pedido y lo aprueba llamando acá con el JWT del usuario; el server lo
// verifica contra Supabase Auth y recién ahí emite el authorization code.
//
//   - inspect: valida los parámetros y devuelve qué app pide qué permisos.
//   - approve: (con Authorization: Bearer <jwt de Supabase>) emite el code y
//     devuelve la URL a la que volver.
//   - deny: devuelve la URL de retorno con error=access_denied.
//
// Mismo origen y sin cookies: no necesita CORS.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function respond(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function displayHost(uri: string): string {
  try {
    const u = new URL(uri);
    return u.host || u.protocol.replace(/:$/, "");
  } catch {
    return uri;
  }
}

export async function POST(req: NextRequest) {
  let body: { decision?: unknown; params?: unknown };
  try {
    body = await req.json();
  } catch {
    return respond({ error: "invalid_request", error_description: "Body inválido." }, 400);
  }
  const params = (
    typeof body.params === "object" && body.params !== null && !Array.isArray(body.params)
      ? body.params
      : {}
  ) as Record<string, unknown>;

  try {
    const request = await parseAuthorizeRequest(params);

    switch (body.decision) {
      case "inspect":
        return respond({
          client: {
            name: request.client.name,
            uri: request.client.clientUri,
            logo: request.client.logoUri,
            kind: request.client.kind,
          },
          scopes: describeScopes(request.scopes),
          return_to: displayHost(request.redirectUri),
        });

      case "deny":
        return respond({ redirect: denyRedirect(request) });

      case "approve": {
        const jwt = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
        if (!jwt) {
          return respond({ error: "login_required", error_description: "Iniciá sesión para autorizar." }, 401);
        }
        const { data, error } = await getAdminClient().auth.getUser(jwt);
        if (error || !data.user) {
          return respond(
            { error: "login_required", error_description: "Tu sesión venció. Volvé a iniciar sesión." },
            401
          );
        }
        return respond({ redirect: await createAuthorizationCode(request, data.user.id) });
      }

      default:
        return respond({ error: "invalid_request", error_description: "decision inválida." }, 400);
    }
  } catch (e) {
    if (e instanceof AuthorizeError) {
      return respond({ error: e.code, error_description: e.message, redirect: e.redirect }, 400);
    }
    if (e instanceof OAuthError) {
      return respond({ error: e.code, error_description: e.message }, e.status);
    }
    return respond(
      { error: "server_error", error_description: e instanceof Error ? e.message : "Error interno." },
      500
    );
  }
}
