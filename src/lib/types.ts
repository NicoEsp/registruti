export interface Client {
  id: string;
  user_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  hourly_rate: number;
  currency: string;
  color: string;
  archived: boolean;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  client_id: string;
  entry_date: string; // YYYY-MM-DD
  duration_minutes: number;
  description: string;
  billable: boolean;
  invoice_id: string | null;
  created_at: string;
}

export interface Profile {
  user_id: string;
  business_name: string | null;
  tax_id: string | null;
  email: string | null;
  address: string | null;
  country: string | null; // código de countries.ts (AR, UY, ..., OTRO)
  pro: boolean; // lifetime access: desbloquea los límites del plan gratis
  pro_since: string | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid";

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  hourly_rate: number;
  currency: string;
  total_minutes: number;
  total_amount: number;
  notes: string | null;
  share_token: string;
  created_at: string;
}

export interface PublicInvoice {
  invoice: Omit<Invoice, "user_id">;
  client: { name: string; email: string | null; contact_name: string | null };
  entries: Pick<TimeEntry, "entry_date" | "duration_minutes" | "description">[];
}

export const CURRENCIES = [
  "USD",
  "EUR",
  "ARS",
  "UYU",
  "BRL",
  "CLP",
  "COP",
  "MXN",
  "PEN",
  "PYG",
  "BOB",
  "VES",
  "GBP",
] as const;

export const CLIENT_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#ef4444",
  "#84cc16",
  "#f97316",
  "#14b8a6",
] as const;
