import { getAdminClient } from "@/lib/supabaseAdmin";
import { clampDuration, formatDuration, parseDuration } from "@/lib/format";
import type { Client, TimeEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// Definiciones de las tools (Fase 1: cargar horas + consultar).
// El `inputSchema` es JSON Schema estándar, que es lo que el cliente MCP le
// pasa al LLM para que arme los argumentos.
// ---------------------------------------------------------------------------

export const TOOLS = [
  {
    name: "list_clients",
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
  },
  {
    name: "log_time",
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
          description: "Fecha en formato YYYY-MM-DD. Por defecto hoy (UTC).",
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
  },
  {
    name: "list_time_entries",
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
  },
  {
    name: "report_summary",
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
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function monthStartISO(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function validDate(s: string, label: string): string {
  if (!ISO_DATE.test(s)) throw new Error(`La fecha ${label} debe tener formato YYYY-MM-DD (recibí "${s}").`);
  return s;
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

export async function callTool(
  userId: string,
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "list_clients":
      return listClients(userId, args);
    case "log_time":
      return logTime(userId, args);
    case "list_time_entries":
      return listTimeEntries(userId, args);
    case "report_summary":
      return reportSummary(userId, args);
    default:
      throw new Error(`Herramienta desconocida: ${name}`);
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

  const date = args.date ? validDate(String(args.date), "de la entrada") : todayISO();
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
  const from = args.from ? validDate(String(args.from), "desde") : daysAgoISO(30);
  const to = args.to ? validDate(String(args.to), "hasta") : todayISO();

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
  const from = args.from ? validDate(String(args.from), "desde") : monthStartISO();
  const to = args.to ? validDate(String(args.to), "hasta") : todayISO();

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
