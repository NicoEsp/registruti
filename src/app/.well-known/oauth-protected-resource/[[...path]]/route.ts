import { protectedResourceMetadata } from "@/lib/mcp/oauth";
import { json, preflight } from "@/lib/mcp/http";

// RFC 9728: metadata del recurso protegido (el servidor MCP). Se sirve en la
// raíz (/.well-known/oauth-protected-resource) y en la variante con el path
// del recurso (/.well-known/oauth-protected-resource/api/mcp): los clientes
// prueban una u otra según la versión de la spec que implementan.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const resourcePath = `/${(path ?? []).join("/")}`;
  if (resourcePath !== "/" && resourcePath !== "/api/mcp") {
    return json({ error: "not_found", error_description: "Recurso desconocido." }, 404);
  }
  return json(protectedResourceMetadata(), 200, { "cache-control": "public, max-age=3600" });
}

export async function OPTIONS() {
  return preflight();
}
