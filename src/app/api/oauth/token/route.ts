import type { NextRequest } from "next/server";
import {
  OAuthError,
  exchangeAuthorizationCode,
  oauthErrorResponse,
  refreshAccessToken,
} from "@/lib/mcp/oauth";
import { json, preflight, readBasicAuth, readFormOrJson } from "@/lib/mcp/http";

// Token endpoint (RFC 6749 §3.2 / OAuth 2.1): canjea el authorization code
// (con PKCE) por un access token + refresh token, y renueva con el refresh
// token. Las credenciales del cliente pueden venir por HTTP Basic o en el body.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const params = await readFormOrJson(req);
  const basic = readBasicAuth(req);
  const creds = {
    clientId: basic?.clientId ?? params.client_id,
    clientSecret: basic?.clientSecret ?? params.client_secret,
  };

  try {
    switch (params.grant_type) {
      case "authorization_code":
        return json(
          await exchangeAuthorizationCode({
            code: params.code,
            redirectUri: params.redirect_uri,
            codeVerifier: params.code_verifier,
            resource: params.resource,
            creds,
          })
        );
      case "refresh_token":
        return json(
          await refreshAccessToken({
            refreshToken: params.refresh_token,
            scope: params.scope,
            resource: params.resource,
            creds,
          })
        );
      default:
        throw new OAuthError(
          "unsupported_grant_type",
          "grant_type tiene que ser authorization_code o refresh_token."
        );
    }
  } catch (e) {
    return oauthErrorResponse(e);
  }
}

export async function OPTIONS() {
  return preflight();
}
