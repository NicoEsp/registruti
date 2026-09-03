import type { NextRequest } from "next/server";
import { resolveAccess, type McpAccess } from "@/lib/mcp/auth";
import { callTool, toolsFor, userContext } from "@/lib/mcp/tools";
import { ALL_SCOPES, MCP_ENDPOINT, OAUTH } from "@/lib/mcp/config";
import { json, preflight, CORS_HEADERS } from "@/lib/mcp/http";

// Servidor MCP de Registruti, implementado a mano sobre el transporte
// Streamable HTTP (JSON-RPC 2.0 por POST). Stateless: cada request trae el
// bearer token en el header Authorization y se resuelve el acceso en el
// momento. Sin dependencias nuevas: el protocolo MCP para un server de
// solo-tools es un puñado de métodos JSON-RPC.
//
// El token puede ser personal (generado en Ajustes) o un access token emitido
// por el flujo OAuth (ver src/lib/mcp/oauth.ts). Sin token, el 401 anuncia en
// WWW-Authenticate dónde está el metadata del recurso protegido: es lo que
// dispara el login automático en Claude, Cursor y demás clientes MCP.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_INFO = { name: "registruti", title: "Registruti", version: "2.0.0" };
// De más nueva a más vieja. Si el cliente pide una que no conocemos (por
// ejemplo, una futura), respondemos con la más nueva nuestra y él decide.
const SUPPORTED_PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const DEFAULT_PROTOCOL = SUPPORTED_PROTOCOLS[0];

// RFC 6750 + spec de autorización de MCP: `resource_metadata` apunta al
// documento RFC 9728 desde el que el cliente descubre el authorization server.
const BEARER_CHALLENGE = `Bearer realm="registruti-mcp", resource_metadata="${OAUTH.protectedResourceMetadata}", scope="${ALL_SCOPES.join(" ")}"`;

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

// El 401 distingue los dos casos porque se arreglan distinto, y confundirlos
// manda al usuario a reconectar apps que están bien:
//
//  - Sin header `Authorization`: o el cliente todavía no se autorizó (y el
//    WWW-Authenticate lo manda a hacerlo), o apunta a www.registruti.app: el
//    redirect al apex es cross-origin y `fetch` borra el header al seguirlo
//    (spec de Fetch), así que la request nos llega pelada.
//  - Con header pero sin match: el token no existe, venció o fue revocado.
function missingCredentials() {
  return json(
    rpcError(
      null,
      -32001,
      `Falta el header Authorization. Conectá Registruti desde tu cliente MCP con la URL ${MCP_ENDPOINT} (te va a pedir autorizar el acceso) o usá un token personal de Ajustes. Si tu cliente apunta a www.registruti.app, cambialo por ${MCP_ENDPOINT}: el redirect del www borra el header y el token nunca llega.`
    ),
    401,
    { "www-authenticate": BEARER_CHALLENGE }
  );
}

function invalidToken() {
  return json(
    rpcError(
      null,
      -32001,
      "El token MCP no es válido, venció o fue revocado. Si conectaste por OAuth, el cliente debería renovarlo solo; si no lo hace, desconectá y volvé a conectar la app. Si usás un token personal, generá uno nuevo en Ajustes."
    ),
    401,
    { "www-authenticate": `${BEARER_CHALLENGE}, error="invalid_token"` }
  );
}

export async function OPTIONS() {
  return preflight();
}

export async function GET() {
  // Streamable HTTP permite un GET para abrir un stream de notificaciones del
  // server; este server no emite ninguna, así que 405 es la respuesta que
  // prevé la spec y los clientes siguen sin problema.
  return new Response(
    `Servidor MCP de Registruti. Configuralo en tu cliente MCP con la URL ${MCP_ENDPOINT} (sin www): al conectar te va a pedir autorizar el acceso con tu cuenta. Guía: ${OAUTH.documentation}`,
    {
      status: 405,
      headers: { allow: "POST, OPTIONS", "content-type": "text/plain; charset=utf-8", ...CORS_HEADERS },
    }
  );
}

export async function POST(req: NextRequest) {
  // 1. Auth por bearer token.
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return missingCredentials();

  let access: McpAccess | null;
  try {
    access = await resolveAccess(match[1].trim());
  } catch (e) {
    return json(rpcError(null, -32603, e instanceof Error ? e.message : "Error interno."), 500);
  }
  if (!access) return invalidToken();

  // 2. Parseo del body. El protocolo eliminó el batching JSON-RPC a partir de
  // 2025-06-18; como este server es stateless no trackeamos la versión
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

  const res = await handleMessage(body, access);

  // Una notificación no lleva respuesta → 202.
  if (res === null) return new Response(null, { status: 202, headers: CORS_HEADERS });

  return json(res);
}

async function buildInstructions(access: McpAccess): Promise<string> {
  const ctx = await userContext(access.userId);
  const lines = [
    "Registruti es el time tracker y facturador del usuario. Estas herramientas leen y cargan datos de SU cuenta, nada más.",
    `Las fechas van en formato YYYY-MM-DD y se interpretan en la zona horaria del usuario (${ctx.timeZone}): hoy es ${ctx.today}. Si no menciona una fecha, es hoy.`,
    "Antes de cargar horas, asegurate del cliente: si el nombre no coincide con uno de list_clients o es ambiguo, preguntá en vez de adivinar.",
    "Las duraciones aceptan '1:30', '1.5', '90m' o '2h' y se redondean a múltiplos de 15 minutos (mínimo 0:15, máximo 8:00). Al confirmar una carga, repetí cliente, fecha y duración tal como quedaron.",
  ];
  if (!access.scopes.includes("write")) {
    lines.push("Esta conexión es de solo lectura: podés consultar pero no cargar horas.");
  }
  return lines.join("\n");
}

async function handleMessage(raw: unknown, access: McpAccess) {
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
      if (isNotification) return null;
      const requested = msg.params?.protocolVersion;
      const protocolVersion =
        typeof requested === "string" && SUPPORTED_PROTOCOLS.includes(requested)
          ? requested
          : DEFAULT_PROTOCOL;
      let instructions: string | undefined;
      try {
        instructions = await buildInstructions(access);
      } catch {
        instructions = undefined;
      }
      return result(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        ...(instructions ? { instructions } : {}),
      });
    }

    case "notifications/initialized":
    case "notifications/cancelled":
    case "notifications/roots/list_changed":
      return null;

    case "ping":
      return isNotification ? null : result(id, {});

    case "tools/list":
      return isNotification ? null : result(id, { tools: toolsFor(access.scopes) });

    case "tools/call": {
      if (isNotification) return null;
      const name = String(msg.params?.name ?? "");
      const args = (msg.params?.arguments as Record<string, unknown>) ?? {};
      try {
        const text = await callTool(access, name, args);
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
