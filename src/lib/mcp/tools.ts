import { after } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { captureServer } from "@/lib/analyticsServer";
import { clampDuration, formatDuration, parseDuration } from "@/lib/format";
import { countryFor, timeZoneFor } from "@/lib/countries";
import { SITE_URL } from "@/lib/site";
import type { Scope } from "@/lib/mcp/config";
import { CLIENT_COLORS, CURRENCIES, type Client, type Invoice, type TimeEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// Definiciones de las tools (cargar y editar horas, crear clientes, consultar).
// El `inputSchema` es JSON Schema estándar, que es lo que el cliente MCP le
// pasa al LLM para que arme los argumentos. Las `annotations` le anticipan al
// cliente qué tools solo leen (Claude las muestra distinto y pide menos
// confirmaciones).
// ---------------------------------------------------------------------------

const INVOICE_STATUS_FILTERS = ["draft", "sent", "paid", "overdue"] as const;
type InvoiceStatusFilter = (typeof INVOICE_STATUS_FILTERS)[number];

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
    name: "create_client",
    title: "Crear cliente",
    description:
      "Crea un cliente nuevo. Solo el nombre es obligatorio: si no se indican, la tarifa queda en 0 y la moneda sale del país del perfil. Antes de usarla revisá list_clients: si ya existe uno con ese nombre, la tool lo rechaza. El plan gratis tiene un máximo de clientes activos; si se alcanza, la tool lo avisa.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre del cliente." },
        hourly_rate: { type: "number", description: "Tarifa por hora (opcional, por defecto 0)." },
        currency: {
          type: "string",
          enum: [...CURRENCIES],
          description: "Moneda de la tarifa (opcional). Por defecto la del país del perfil.",
        },
        contact_name: { type: "string", description: "Nombre de la persona de contacto (opcional)." },
        email: { type: "string", description: "Email del cliente (opcional)." },
      },
      required: ["name"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
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
    name: "update_time_entry",
    title: "Editar una entrada de tiempo",
    description:
      "Modifica una entrada de tiempo existente: cliente, duración, fecha, descripción o si es facturable. Solo se tocan los campos que se mandan. El id sale de list_time_entries. Las entradas que ya están en una factura no se pueden editar.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Id de la entrada (lo devuelve list_time_entries)." },
        client: { type: "string", description: "Nuevo cliente: nombre (no distingue mayúsculas) o id." },
        duration: { type: "string", description: "Nueva duración: '1:30', '1.5' (horas), '90m', '2h'." },
        date: { type: "string", description: "Nueva fecha en formato YYYY-MM-DD." },
        description: { type: "string", description: "Nueva descripción. Un string vacío la borra." },
        billable: { type: "boolean", description: "Si la entrada es facturable." },
      },
      required: ["id"],
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "list_time_entries",
    title: "Ver entradas de tiempo",
    description:
      "Lista las entradas de tiempo en un rango de fechas, opcionalmente filtradas por cliente. Por defecto los últimos 30 días. Cada entrada trae su id (para update_time_entry) y si ya fue facturada.",
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
      "Resumen de horas y montos facturables por cliente en un rango de fechas (como la pantalla de Reportes). Por defecto el mes actual. Separa además lo facturable que todavía no entró en ninguna factura (uninvoiced). Sirve para responder 'cómo voy', 'cuántas horas llevo', 'cuánto tengo para facturar', etc.",
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
  {
    name: "list_invoices",
    title: "Ver facturas",
    description:
      "Lista las facturas (invoices) del usuario, de la más reciente a la más vieja: número, cliente, período, estado, total y link público para compartir. Se puede filtrar por cliente o por estado; 'overdue' son las enviadas cuyo vencimiento ya pasó.",
    inputSchema: {
      type: "object",
      properties: {
        client: { type: "string", description: "Nombre o id del cliente para filtrar (opcional)." },
        status: {
          type: "string",
          enum: [...INVOICE_STATUS_FILTERS],
          description: "Filtrar por estado (opcional): draft, sent, paid u overdue.",
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
] as const;

export type ToolName = (typeof TOOLS)[number]["name"];

const TOOL_SCOPE: Record<ToolName, Scope> = {
  list_clients: "read",
  create_client: "write",
  log_time: "write",
  update_time_entry: "write",
  list_time_entries: "read",
  report_summary: "read",
  list_invoices: "read",
};

/** Las tools que puede ver y usar una conexión con estos scopes. */
export function toolsFor(scopes: Scope[]) {
  return TOOLS.filter((t) => scopes.includes(TOOL_SCOPE[t.name]));
}

// ---------------------------------------------------------------------------
// Contexto del usuario: zona horaria, "hoy" y moneda por defecto
// ---------------------------------------------------------------------------

const DEFAULT_TIME_ZONE = "America/Argentina/Buenos_Aires";
const DEFAULT_CURRENCY = "USD";

export interface UserContext {
  timeZone: string;
  /** Fecha de hoy (YYYY-MM-DD) en la zona horaria del usuario. */
  today: string;
  /** Moneda del país del perfil; es la que usa un cliente nuevo sin moneda. */
  currency: string;
}

/**
 * "Hoy" depende de dónde está el usuario: a las 22:00 de Buenos Aires ya es
 * mañana en UTC, y cargar "2 horas de hoy" con la fecha UTC las mandaba al
 * día siguiente. La zona sale del país del perfil (Ajustes); sin perfil, la de
 * Buenos Aires, igual que el locale por defecto de la app. La moneda por
 * defecto sale del mismo país, como en el alta rápida de clientes del tracker.
 */
export async function userContext(userId: string): Promise<UserContext> {
  let timeZone = DEFAULT_TIME_ZONE;
  let currency = DEFAULT_CURRENCY;
  try {
    const { data } = await getAdminClient()
      .from("profiles")
      .select("country")
      .eq("user_id", userId)
      .maybeSingle();
    timeZone = timeZoneFor(data?.country ?? null);
    currency = countryFor(data?.country ?? null)?.currency ?? DEFAULT_CURRENCY;
  } catch {
    /* sin perfil o tabla: zona y moneda por defecto */
  }
  return { timeZone, today: todayISO(timeZone), currency };
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

/** Un argumento opcional de texto: trim, y null si no vino o vino vacío. */
function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s ? s : null;
}

function parseDurationArg(raw: string): number {
  const parsed = parseDuration(raw);
  if (parsed == null) {
    throw new Error(`No entendí la duración "${raw}". Probá con '1:30', '1.5', '90m' o '2h'.`);
  }
  return clampDuration(parsed);
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

/** Texto con el que se confirma una entrada (la cargada o la editada). */
function describeEntry(
  entry: Pick<TimeEntry, "duration_minutes" | "entry_date" | "billable" | "description">,
  clientName: string
): string {
  const flags = entry.billable ? "" : " (no facturable)";
  const desc = entry.description ? `: ${entry.description}` : "";
  return `${formatDuration(entry.duration_minutes)} para ${clientName} el ${entry.entry_date}${flags}${desc}`;
}

// PostHog va después de responder: su latencia no tiene por qué sumarse a la
// tool. Fuera de una request (no debería pasar) `after` tira, y entonces se
// manda sin esperar.
function captureAfter(userId: string, event: Parameters<typeof captureServer>[1], props: Record<string, unknown>) {
  const send = () => captureServer(userId, event, props);
  try {
    after(send);
  } catch {
    void send();
  }
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
        ? "Esta conexión a Registruti es de solo lectura y no puede cargar ni modificar datos. Desconectá la app y volvé a conectarla autorizando el permiso de escritura."
        : "Esta conexión a Registruti no tiene permiso de lectura. Desconectá la app y volvé a conectarla."
    );
  }

  switch (name as ToolName) {
    case "list_clients":
      return listClients(access.userId, args);
    case "create_client":
      return createClient(access.userId, args);
    case "log_time":
      return logTime(access.userId, args);
    case "update_time_entry":
      return updateTimeEntry(access.userId, args);
    case "list_time_entries":
      return listTimeEntries(access.userId, args);
    case "report_summary":
      return reportSummary(access.userId, args);
    case "list_invoices":
      return listInvoices(access.userId, args);
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

async function createClient(userId: string, args: Record<string, unknown>): Promise<string> {
  const name = optionalText(args.name);
  if (!name) throw new Error("El cliente necesita un nombre.");

  // Mismo nombre (sin distinguir mayúsculas) = mismo cliente: el modelo suele
  // reintentar con otra capitalización en vez de buscar el que ya existe.
  const clients = await fetchClients(userId);
  const existing = clients.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    throw new Error(
      existing.archived
        ? `Ya existe un cliente archivado llamado "${existing.name}". Desarchivalo desde Clientes en la app en vez de crear otro.`
        : `Ya existe un cliente llamado "${existing.name}" (id ${existing.id}). Usalo en vez de crear otro.`
    );
  }

  let hourlyRate = 0;
  if (args.hourly_rate != null && args.hourly_rate !== "") {
    hourlyRate = Number(args.hourly_rate);
    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
      throw new Error(`La tarifa por hora debe ser un número mayor o igual a 0 (recibí "${args.hourly_rate}").`);
    }
  }

  let currency = optionalText(args.currency)?.toUpperCase() ?? null;
  if (currency && !(CURRENCIES as readonly string[]).includes(currency)) {
    throw new Error(`La moneda "${args.currency}" no está soportada. Opciones: ${CURRENCIES.join(", ")}.`);
  }
  if (!currency) currency = (await userContext(userId)).currency;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("clients")
    .insert({
      user_id: userId,
      name,
      contact_name: optionalText(args.contact_name),
      email: optionalText(args.email),
      hourly_rate: hourlyRate,
      currency,
      color: CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)],
      archived: false,
    })
    .select()
    .single();
  if (error || !data) {
    // El límite del plan gratis lo aplica un trigger de la base (ver la
    // migración 20260721000006_pricing_limits.sql), también con la service role.
    if (error?.message.includes("plan_limit_clients")) {
      throw new Error(
        "Llegaste al máximo de clientes activos del plan gratis. Archivá un cliente desde la app o desbloqueá el lifetime access en Ajustes."
      );
    }
    throw new Error(`No pude crear el cliente: ${error?.message ?? "sin respuesta de la base"}.`);
  }
  const client = data as Client;

  captureAfter(userId, "client_created", { source: "mcp", currency, has_rate: hourlyRate > 0 });

  const rate =
    hourlyRate > 0
      ? ` con tarifa ${hourlyRate} ${currency}/h`
      : ` sin tarifa todavía (moneda ${currency}; la podés cargar después)`;
  return `✓ Creé el cliente ${client.name}${rate}. Id: ${client.id}.`;
}

async function logTime(userId: string, args: Record<string, unknown>): Promise<string> {
  const clientRef = String(args.client ?? "").trim();
  const durationRaw = String(args.duration ?? "").trim();
  if (!clientRef) throw new Error("Falta el cliente.");
  if (!durationRaw) throw new Error("Falta la duración.");

  const minutes = parseDurationArg(durationRaw);

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

  // Mismo evento que el tracker, para que el embudo cuente también a quien
  // carga todo por Claude.
  captureAfter(userId, "time_entry_created", { source: "mcp", duration_minutes: minutes, billable });

  return `✓ Registré ${describeEntry({ duration_minutes: minutes, entry_date: date, billable, description }, client.name)}.`;
}

async function updateTimeEntry(userId: string, args: Record<string, unknown>): Promise<string> {
  const id = optionalText(args.id);
  if (!id) throw new Error("Falta el id de la entrada (lo devuelve list_time_entries).");

  const admin = getAdminClient();
  const { data: found, error: readError } = await admin
    .from("time_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw new Error(`No pude leer la entrada: ${readError.message}`);
  if (!found) throw new Error(`No encontré ninguna entrada con id "${id}". Buscala con list_time_entries.`);
  const entry = found as TimeEntry;

  // Mismo criterio que el tracker: una entrada facturada ya forma parte del
  // total de un invoice y no se edita (ni se borra) suelta.
  if (entry.invoice_id) {
    throw new Error(
      "Esa entrada ya está en una factura y no se puede editar. Para corregirla hay que borrar la factura desde la app y volver a generarla."
    );
  }

  const patch: Partial<Pick<TimeEntry, "client_id" | "entry_date" | "duration_minutes" | "description" | "billable">> =
    {};
  const clients = await fetchClients(userId);

  const clientRef = optionalText(args.client);
  if (clientRef) patch.client_id = resolveClient(clients, clientRef).id;

  const durationRaw = optionalText(args.duration);
  if (durationRaw) patch.duration_minutes = parseDurationArg(durationRaw);

  if (args.date != null && args.date !== "") patch.entry_date = validDate(String(args.date), "de la entrada");
  if (args.description != null) patch.description = String(args.description);
  if (typeof args.billable === "boolean") patch.billable = args.billable;

  if (Object.keys(patch).length === 0) {
    throw new Error("No indicaste ningún cambio. Podés modificar cliente, duración, fecha, descripción o facturable.");
  }

  const { error } = await admin.from("time_entries").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(`No pude actualizar la entrada: ${error.message}`);

  const updated = { ...entry, ...patch };
  const clientName = clients.find((c) => c.id === updated.client_id)?.name ?? "Cliente eliminado";
  return `✓ Actualicé la entrada: ${describeEntry(updated, clientName)}.`;
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
    id: e.id,
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

  // "Sin facturar" = facturable y todavía fuera de cualquier invoice: es lo
  // que se puede facturar hoy, que es la pregunta previa a crear una factura.
  const agg = new Map<string, { minutes: number; billableMinutes: number; uninvoicedMinutes: number }>();
  for (const e of entries) {
    const a = agg.get(e.client_id) ?? { minutes: 0, billableMinutes: 0, uninvoicedMinutes: 0 };
    a.minutes += e.duration_minutes;
    if (e.billable) {
      a.billableMinutes += e.duration_minutes;
      if (e.invoice_id == null) a.uninvoicedMinutes += e.duration_minutes;
    }
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
        uninvoiced_hours: formatDuration(a.uninvoicedMinutes),
        uninvoiced_minutes: a.uninvoicedMinutes,
        uninvoiced_amount: client ? amount(a.uninvoicedMinutes, client.hourly_rate) : null,
      };
    })
    .sort((x, y) => y.minutes - x.minutes);

  const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);
  const totalBillableMinutes = entries.reduce((s, e) => s + (e.billable ? e.duration_minutes : 0), 0);
  const totalUninvoicedMinutes = entries.reduce(
    (s, e) => s + (e.billable && e.invoice_id == null ? e.duration_minutes : 0),
    0
  );

  const sumByCurrency = (pick: (row: (typeof perClient)[number]) => number | null) => {
    const out: Record<string, number> = {};
    for (const row of perClient) {
      const value = pick(row);
      if (row.currency && value != null) {
        out[row.currency] = Math.round(((out[row.currency] ?? 0) + value) * 100) / 100;
      }
    }
    return out;
  };

  return JSON.stringify(
    {
      period: { from, to },
      by_client: perClient,
      totals: {
        hours: formatDuration(totalMinutes),
        minutes: totalMinutes,
        billable_hours: formatDuration(totalBillableMinutes),
        billable_minutes: totalBillableMinutes,
        billable_amount_by_currency: sumByCurrency((r) => r.billable_amount),
        uninvoiced_hours: formatDuration(totalUninvoicedMinutes),
        uninvoiced_minutes: totalUninvoicedMinutes,
        uninvoiced_amount_by_currency: sumByCurrency((r) => r.uninvoiced_amount),
      },
    },
    null,
    2
  );
}

async function listInvoices(userId: string, args: Record<string, unknown>): Promise<string> {
  const statusRaw = optionalText(args.status)?.toLowerCase() ?? null;
  if (statusRaw && !(INVOICE_STATUS_FILTERS as readonly string[]).includes(statusRaw)) {
    throw new Error(`El estado "${args.status}" no existe. Opciones: ${INVOICE_STATUS_FILTERS.join(", ")}.`);
  }
  const status = statusRaw as InvoiceStatusFilter | null;

  const [ctx, clients] = await Promise.all([userContext(userId), fetchClients(userId)]);
  const clientById = new Map(clients.map((c) => [c.id, c]));

  const admin = getAdminClient();
  let query = admin
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (args.client) {
    const client = resolveClient(clients, String(args.client));
    query = query.eq("client_id", client.id);
  }
  // "Vencido" no se persiste: es un invoice enviado cuyo vencimiento ya pasó
  // (mismo criterio que src/lib/invoiceStatus.ts, pero con el "hoy" del usuario).
  if (status === "overdue") query = query.eq("status", "sent");
  else if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`No pude leer las facturas: ${error.message}`);

  const isOverdue = (inv: Invoice) => inv.status === "sent" && !!inv.due_date && inv.due_date < ctx.today;
  let invoices = (data ?? []) as Invoice[];
  if (status === "overdue") invoices = invoices.filter(isOverdue);

  const rows = invoices.map((inv) => ({
    id: inv.id,
    number: inv.invoice_number,
    client: clientById.get(inv.client_id)?.name ?? "Cliente eliminado",
    status: inv.status,
    overdue: isOverdue(inv),
    period: { from: inv.period_start, to: inv.period_end },
    issue_date: inv.issue_date,
    due_date: inv.due_date,
    hours: formatDuration(inv.total_minutes),
    minutes: inv.total_minutes,
    amount: inv.total_amount,
    currency: inv.currency,
    public_url: `${SITE_URL}/i/${inv.share_token}`,
  }));

  return JSON.stringify({ count: rows.length, invoices: rows }, null, 2);
}
