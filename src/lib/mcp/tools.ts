import { getAdminClient } from "@/lib/supabaseAdmin";
import { clampDuration, formatDuration, parseDuration } from "@/lib/format";
import { timeZoneFor } from "@/lib/countries";
import type { Scope } from "@/lib/mcp/config";
import type { Client, TimeEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// Definiciones de las tools (cargar horas + consultar).
// El `inputSchema` es JSON Schema estándar, que es lo que el cliente MCP le
// pasa al LLM para que arme los argumentos. Las `annotations` le anticipan al
// cliente qué tools solo leen (Claude las muestra distinto y pide menos
// confirmaciones).
// ---------------------------------------------------------------------------

export const TOOLS = [
  {
    name: "list_clients",
    title: "Listar clientes",
    description:
      "Lista los clientes del usuario con su tarifa por hora, moneda y color. Útil para saber a qué cliente imputar horas o para obtener su id.",
    inputSchema: {
      type: "object",
      properties: {
        include_archived: {
          type: "boolean",
          description: "Si es true, incluye también los clientes archivados. Por defecto false.",
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "log_time",
    title: "Cargar horas",
    description:
      "Registra una entrada de tiempo para un cliente. La duración acepta formato libre: '1:30', '1.5', '90m', '2h'. Se redondea al múltiplo de 15 minutos más cercano (mínimo 0:15, máximo 8:00).",
    inputSchema: {
      type: "object",
      properties: {
        client: {
          type: "string",
          description: "Nombre del cliente (no distingue mayúsculas) o su id.",
        },
        duration: {
          type: "string",
          description: "Duración: '1:30', '1.5' (horas), '90m', '2h'.",
        },
        date: {
          type: "string",
          description: "Fecha en formato YYYY-MM-DD. Por defecto hoy, en la zona horaria del usuario.",
        },
        description: {
          type: "string",
          description: "Descripción de la tarea (opcional).",
        },
        billable: {
          type: "boolean",
          description: "Si la entrada es facturable. Por defecto true.",
        },
      },
      required: ["client", "duration"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: "list_time_entries",
    title: "Ver entradas de tiempo",
    description:
      "Lista las entradas de tiempo en un rango de fechas, opcionalmente filtradas por cliente. Por defecto los últimos 30 días.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "Fecha desde (YYYY-MM-DD). Por defecto hace 30 días." },
        to: { type: "string", description: "Fecha hasta (YYYY-MM-DD). Por defecto hoy." },
        client: { type: "string", description: "Nombre o id del cliente para filtrar (opcional)." },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "report_summary",
    title: "Resumen de horas y montos",
    description:
      "Resumen de horas y montos facturables por cliente en un rango de fechas (como la pantalla de Reportes). Por defecto el mes actual. Sirve para responder 'cómo voy', 'cuántas horas llevo', etc.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "Fecha desde (YYYY-MM-DD). Por defecto el 1° del mes actual." },
        to: { type: "string", description: "Fecha hasta (YYYY-MM-DD). Por defecto hoy." },
        client: { type: "string", description: "Nombre o id del cliente para filtrar (opcional)." },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
] as const;

export type ToolName = (typeof TOOLS)[number]["name"];

const TOOL_SCOPE: Record<ToolName, Scope> = {
  list_clients: "read",
  log_time: "write",
  list_time_entries: "read",
  report_summary: "read",
};

/** Las tools que puede ver y usar una conexión con estos scopes. */
export function toolsFor(scopes: Scope[]) {
  return TOOLS.filter((t) => scopes.includes(TOOL_SCOPE[t.name]));
}

// ---------------------------------------------------------------------------
// Contexto del usuario: zona horaria y "hoy"
// ---------------------------------------------------------------------------

const DEFAULT_TIME_ZONE = "America/Argentina/Buenos_Aires";

export interface UserContext {
  timeZone: string;
  /** Fecha de hoy (YYYY-MM-DD) en la zona horaria del usuario. */
  today: string;
}

/**
 * "Hoy" depende de dónde está el usuario: a las 22:00 de Buenos Aires ya es
 * mañana en UTC, y cargar "2 horas de hoy" con la fecha UTC las mandaba al
 * día siguiente. La zona sale del país del perfil (Ajustes); sin perfil, la de
 * Buenos Aires, igual que el locale por defecto de la app.
 */
export async function userContext(userId: string): Promise<UserContext> {
  let timeZone = DEFAULT_TIME_ZONE;
  try {
    const { data } = await getAdminClient()
      .from("profiles")
      .select("country")
      .eq("user_id", userId)
      .maybeSingle();
    timeZone = timeZoneFor(data?.country ?? null);
  } catch {
    /* sin perfil o tabla: zona por defecto */
  }
  return { timeZone, today: todayISO(timeZone) };
}

function localDateParts(timeZone: string, at = new Date()): { y: number; m: number; d: number } {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", { ...options, timeZone }).formatToParts(at);
  } catch {
    parts = new Intl.DateTimeFormat("en-US", { ...options, timeZone: DEFAULT_TIME_ZONE }).formatToParts(at);
  }
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

function isoDate(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
}

function todayISO(timeZone: string): string {
  const { y, m, d } = localDateParts(timeZone);
  return isoDate(y, m, d);
}

function daysAgoISO(n: number, timeZone: string): string {
  const { y, m, d } = localDateParts(timeZone);
  return isoDate(y, m, d - n);
}

function monthStartISO(timeZone: string): string {
  const { y, m } = localDateParts(timeZone);
  return isoDate(y, m, 1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(s: string, label: string): string {
  if (!ISO_DATE.test(s)) throw new Error(`La fecha ${label} debe tener formato YYYY-MM-DD (recibí "${s}").`);
  return s;
}

const MAX_RANGE_DAYS = 366;

// Evita que el LLM pida rangos gigantes (varios años) que traerían y
// serializarían miles de filas en la respuesta de la tool.
function assertRange(from: string, to: string): void {
  const span = new Date(to).getTime() - new Date(from).getTime();
  if (span > MAX_RANGE_DAYS * 24 * 60 * 60 * 1000) {
    throw new Error("El rango de fechas es demasiado amplio (máximo ~1 año). Acotalo.");
  }
}

async function fetchClients(userId: string): Promise<Client[]> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name");
  if (error) throw new Error(`No pude leer los clientes: ${error.message}`);
  return (data ?? []) as Client[];
}

/** Resuelve un cliente por id exacto o por nombre (exacto, luego parcial). */
function resolveClient(clients: Client[], ref: string): Client {
  const needle = ref.trim().toLowerCase();
  const byId = clients.find((c) => c.id === ref.trim());
  if (byId) return byId;
  const byName = clients.find((c) => c.name.toLowerCase() === needle);
  if (byName) return byName;
  const partial = clients.filter((c) => c.name.toLowerCase().includes(needle));
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) {
    throw new Error(
      `"${ref}" coincide con varios clientes: ${partial.map((c) => c.name).join(", ")}. Especificá mejor.`
    );
  }
  const names = clients.map((c) => c.name).join(", ") || "(no tenés clientes cargados)";
  throw new Error(`No encontré el cliente "${ref}". Clientes disponibles: ${names}.`);
}

function amount(minutes: number, rate: number): number {
  return Math.round((minutes / 60) * rate * 100) / 100;
}

// ---------------------------------------------------------------------------
// Ejecución
// ---------------------------------------------------------------------------

export interface ToolAccess {
  userId: string;
  scopes: Scope[];
}

export async function callTool(
  access: ToolAccess,
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  if (!(name in TOOL_SCOPE)) throw new Error(`Herramienta desconocida: ${name}`);
  const needed = TOOL_SCOPE[name as ToolName];
  if (!access.scopes.includes(needed)) {
    throw new Error(
      needed === "write"
        ? "Esta conexión a Registruti es de solo lectura y no puede cargar horas. Desconectá la app y volvé a conectarla autorizando el permiso de escritura."
        : "Esta conexión a Registruti no tiene permiso de lectura. Desconectá la app y volvé a conectarla."
    );
  }

  switch (name as ToolName) {
    case "list_clients":
      return listClients(access.userId, args);
    case "log_time":
      return logTime(access.userId, args);
    case "list_time_entries":
      return listTimeEntries(access.userId, args);
    case "report_summary":
      return reportSummary(access.userId, args);
  }
}

async function listClients(userId: string, args: Record<string, unknown>): Promise<string> {
  const includeArchived = args.include_archived === true;
  const clients = (await fetchClients(userId)).filter((c) => includeArchived || !c.archived);
  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    hourly_rate: c.hourly_rate,
    currency: c.currency,
    color: c.color,
    archived: c.archived,
  }));
  return JSON.stringify(rows, null, 2);
}

async function logTime(userId: string, args: Record<string, unknown>): Promise<string> {
  const clientRef = String(args.client ?? "").trim();
  const durationRaw = String(args.duration ?? "").trim();
  if (!clientRef) throw new Error("Falta el cliente.");
  if (!durationRaw) throw new Error("Falta la duración.");

  const parsed = parseDuration(durationRaw);
  if (parsed == null) {
    throw new Error(`No entendí la duración "${durationRaw}". Probá con '1:30', '1.5', '90m' o '2h'.`);
  }
  const minutes = clampDuration(parsed);

  const date = args.date
    ? validDate(String(args.date), "de la entrada")
    : (await userContext(userId)).today;
  const billable = args.billable !== false;
  const description = args.description != null ? String(args.description) : "";

  const clients = await fetchClients(userId);
  const client = resolveClient(clients, clientRef);

  const admin = getAdminClient();
  const { error } = await admin.from("time_entries").insert({
    user_id: userId,
    client_id: client.id,
    entry_date: date,
    duration_minutes: minutes,
    description,
    billable,
  });
  if (error) throw new Error(`No pude registrar la entrada: ${error.message}`);

  const flags = billable ? "" : " (no facturable)";
  const desc = description ? `: ${description}` : "";
  return `✓ Registré ${formatDuration(minutes)} para ${client.name} el ${date}${flags}${desc}.`;
}

async function listTimeEntries(userId: string, args: Record<string, unknown>): Promise<string> {
  const ctx = args.from && args.to ? null : await userContext(userId);
  const from = args.from ? validDate(String(args.from), "desde") : daysAgoISO(30, ctx!.timeZone);
  const to = args.to ? validDate(String(args.to), "hasta") : ctx!.today;
  assertRange(from, to);

  const clients = await fetchClients(userId);
  const clientById = new Map(clients.map((c) => [c.id, c]));

  const admin = getAdminClient();
  let query = admin
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", from)
    .lte("entry_date", to)
    .order("entry_date", { ascending: true });

  if (args.client) {
    const client = resolveClient(clients, String(args.client));
    query = query.eq("client_id", client.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(`No pude leer las entradas: ${error.message}`);

  const entries = (data ?? []) as TimeEntry[];
  const rows = entries.map((e) => ({
    date: e.entry_date,
    client: clientById.get(e.client_id)?.name ?? "Cliente eliminado",
    duration: formatDuration(e.duration_minutes),
    minutes: e.duration_minutes,
    description: e.description,
    billable: e.billable,
    invoiced: e.invoice_id != null,
  }));

  return JSON.stringify({ from, to, count: rows.length, entries: rows }, null, 2);
}

async function reportSummary(userId: string, args: Record<string, unknown>): Promise<string> {
  const ctx = args.from && args.to ? null : await userContext(userId);
  const from = args.from ? validDate(String(args.from), "desde") : monthStartISO(ctx!.timeZone);
  const to = args.to ? validDate(String(args.to), "hasta") : ctx!.today;
  assertRange(from, to);

  const clients = await fetchClients(userId);
  const clientById = new Map(clients.map((c) => [c.id, c]));

  const admin = getAdminClient();
  let query = admin
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", from)
    .lte("entry_date", to);

  if (args.client) {
    const client = resolveClient(clients, String(args.client));
    query = query.eq("client_id", client.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(`No pude leer las entradas: ${error.message}`);

  const entries = (data ?? []) as TimeEntry[];

  const agg = new Map<string, { minutes: number; billableMinutes: number }>();
  for (const e of entries) {
    const a = agg.get(e.client_id) ?? { minutes: 0, billableMinutes: 0 };
    a.minutes += e.duration_minutes;
    if (e.billable) a.billableMinutes += e.duration_minutes;
    agg.set(e.client_id, a);
  }

  const perClient = [...agg.entries()]
    .map(([clientId, a]) => {
      const client = clientById.get(clientId);
      return {
        client: client?.name ?? "Cliente eliminado",
        currency: client?.currency ?? null,
        hours: formatDuration(a.minutes),
        minutes: a.minutes,
        billable_hours: formatDuration(a.billableMinutes),
        billable_minutes: a.billableMinutes,
        billable_amount: client ? amount(a.billableMinutes, client.hourly_rate) : null,
      };
    })
    .sort((x, y) => y.minutes - x.minutes);

  const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);
  const totalBillableMinutes = entries.reduce((s, e) => s + (e.billable ? e.duration_minutes : 0), 0);

  const amountsByCurrency: Record<string, number> = {};
  for (const row of perClient) {
    if (row.currency && row.billable_amount != null) {
      amountsByCurrency[row.currency] = Math.round(
        ((amountsByCurrency[row.currency] ?? 0) + row.billable_amount) * 100
      ) / 100;
    }
  }

  return JSON.stringify(
    {
      period: { from, to },
      by_client: perClient,
      totals: {
        hours: formatDuration(totalMinutes),
        minutes: totalMinutes,
        billable_hours: formatDuration(totalBillableMinutes),
        billable_minutes: totalBillableMinutes,
        billable_amount_by_currency: amountsByCurrency,
      },
    },
    null,
    2
  );
}
