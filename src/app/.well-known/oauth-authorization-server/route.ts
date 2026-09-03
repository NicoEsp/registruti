import { authorizationServerMetadata } from "@/lib/mcp/oauth";
import { json, preflight } from "@/lib/mcp/http";

// RFC 8414: metadata del authorization server del MCP. El issuer es el
// origen del sitio, así que este es el único path de descubrimiento.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return json(authorizationServerMetadata(), 200, { "cache-control": "public, max-age=3600" });
}

export async function OPTIONS() {
  return preflight();
}
