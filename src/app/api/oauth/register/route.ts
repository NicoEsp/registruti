import type { NextRequest } from "next/server";
import { oauthErrorResponse, registerClient } from "@/lib/mcp/oauth";
import { json, preflight } from "@/lib/mcp/http";
import { sha256Hex } from "@/lib/crypto";

// RFC 7591: registro dinámico de clientes. Abierto, como pide la spec de MCP:
// un cliente nuevo (Claude, Cursor…) se registra solo antes de mandar al
// usuario a autorizar. Solo guarda metadata pública del cliente, y está
// limitado por IP y en total por hora (ver registerClient).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// En Vercel, x-real-ip y x-forwarded-for los escribe el edge con la IP real
// del cliente (no se pueden falsear desde afuera). Se guarda solo un hash con
// sal fija: alcanza para contar registros por origen sin persistir la IP.
function clientIp(req: NextRequest): string | null {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || null;
}

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
    const ip = clientIp(req);
    const ipHash = ip ? await sha256Hex(`registruti-oauth-register:${ip}`) : null;
    return json(await registerClient(body, { ipHash }), 201);
  } catch (e) {
    return oauthErrorResponse(e);
  }
}

export async function OPTIONS() {
  return preflight();
}
