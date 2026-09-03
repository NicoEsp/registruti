import type { NextRequest } from "next/server";
import { oauthErrorResponse, registerClient } from "@/lib/mcp/oauth";
import { json, preflight } from "@/lib/mcp/http";

// RFC 7591: registro dinámico de clientes. Abierto, como pide la spec de MCP:
// un cliente nuevo (Claude, Cursor…) se registra solo antes de mandar al
// usuario a autorizar. Solo guarda metadata pública del cliente.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(
      { error: "invalid_client_metadata", error_description: "El body tiene que ser JSON." },
      400
    );
  }
  try {
    return json(await registerClient(body), 201);
  } catch (e) {
    return oauthErrorResponse(e);
  }
}

export async function OPTIONS() {
  return preflight();
}
