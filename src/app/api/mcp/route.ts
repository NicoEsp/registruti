import type { NextRequest } from "next/server";
import { resolveUserId } from "@/lib/mcp/auth";
import { TOOLS, callTool } from "@/lib/mcp/tools";

// Servidor MCP de Registruti, implementado a mano sobre el transporte
// Streamable HTTP (JSON-RPC 2.0 por POST). Stateless: cada request trae el
// token en el header Authorization y se resuelve el usuario en el momento.
// Sin dependencias nuevas: el protocolo MCP para un server de solo-tools es
// un puñado de métodos JSON-RPC.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_INFO = { name: "registruti", version: "1.0.0" };
const DEFAULT_PROTOCOL = "2025-06-18";
const SUPPORTED_PROTOCOLS = new Set(["2024-11-05", "2025-03-26", "2025-06-18"]);

type JsonRpcId = string | number | null;

interface JsonRpcMessage {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
}

function result(id: JsonRpcId, res: unknown) {
  return { jsonrpc: "2.0", id, result: res };
}

function rpcError(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function json(payload: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

function unauthorized() {
  return json(rpcError(null, -32001, "Token MCP inválido o ausente."), 401, {
    "www-authenticate": 'Bearer realm="registruti-mcp"',
  });
}

export async function GET() {
  return new Response(
    "El endpoint MCP de Registruti usa POST (Streamable HTTP). Configuralo en tu cliente MCP con tu token personal.",
    { status: 405, headers: { allow: "POST" } }
  );
}

export async function POST(req: NextRequest) {
  // 1. Auth por bearer token.
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return unauthorized();

  let userId: string | null;
  try {
    userId = await resolveUserId(match[1].trim());
  } catch (e) {
    return json(rpcError(null, -32603, e instanceof Error ? e.message : "Error interno."), 500);
  }
  if (!userId) return unauthorized();

  // 2. Parseo del body. El protocolo por defecto (2025-06-18) eliminó el
  // batching JSON-RPC; como este server es stateless no trackeamos la versión
  // negociada por cliente, así que rechazamos arrays y procesamos un único
  // mensaje. Los clientes MCP actuales (Claude, etc.) mandan mensajes sueltos.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(rpcError(null, -32700, "Parse error."), 400);
  }

  if (Array.isArray(body)) {
    return json(rpcError(null, -32600, "JSON-RPC batching no está soportado."), 400);
  }

  const res = await handleMessage(body, userId);

  // Una notificación no lleva respuesta → 202.
  if (res === null) return new Response(null, { status: 202 });

  return json(res);
}

async function handleMessage(raw: unknown, userId: string) {
  // El body parseado puede no ser un objeto (ej. un JSON primitivo): sin este
  // guard, `"id" in raw` tiraría TypeError sobre un string/number/boolean.
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return rpcError(null, -32600, "Invalid Request");
  }
  const msg = raw as JsonRpcMessage;
  const id = msg.id ?? null;
  const isNotification = !("id" in msg) || msg.id === undefined;
  const method = msg.method;

  if (msg.jsonrpc !== "2.0" || typeof method !== "string") {
    return isNotification ? null : rpcError(id, -32600, "Invalid Request");
  }

  switch (method) {
    case "initialize": {
      const requested = msg.params?.protocolVersion;
      const protocolVersion =
        typeof requested === "string" && SUPPORTED_PROTOCOLS.has(requested)
          ? requested
          : DEFAULT_PROTOCOL;
      return isNotification
        ? null
        : result(id, {
            protocolVersion,
            capabilities: { tools: { listChanged: false } },
            serverInfo: SERVER_INFO,
          });
    }

    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    case "ping":
      return isNotification ? null : result(id, {});

    case "tools/list":
      return isNotification ? null : result(id, { tools: TOOLS });

    case "tools/call": {
      if (isNotification) return null;
      const name = String(msg.params?.name ?? "");
      const args = (msg.params?.arguments as Record<string, unknown>) ?? {};
      try {
        const text = await callTool(userId, name, args);
        return result(id, { content: [{ type: "text", text }], isError: false });
      } catch (e) {
        const text = e instanceof Error ? e.message : "Error ejecutando la herramienta.";
        return result(id, { content: [{ type: "text", text }], isError: true });
      }
    }

    default:
      return isNotification ? null : rpcError(id, -32601, `Method not found: ${method}`);
  }
}
