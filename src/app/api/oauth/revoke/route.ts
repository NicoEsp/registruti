import type { NextRequest } from "next/server";
import { oauthErrorResponse, revokeToken } from "@/lib/mcp/oauth";
import { CORS_HEADERS, preflight, readBasicAuth, readFormOrJson } from "@/lib/mcp/http";

// RFC 7009: revocación. Es lo que llama el cliente cuando el usuario
// "desconecta" Registruti desde su lado.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const params = await readFormOrJson(req);
  const basic = readBasicAuth(req);
  try {
    await revokeToken({
      token: params.token,
      creds: {
        clientId: basic?.clientId ?? params.client_id,
        clientSecret: basic?.clientSecret ?? params.client_secret,
      },
    });
    return new Response(null, { status: 200, headers: { ...CORS_HEADERS, "cache-control": "no-store" } });
  } catch (e) {
    return oauthErrorResponse(e);
  }
}

export async function OPTIONS() {
  return preflight();
}
