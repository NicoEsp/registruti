import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetchAllRows";

// Back office (/admin). La seguridad vive en la base: cada RPC admin_* y la
// policy de lifetime_grants verifican is_admin() (migración
// 20261102000011_back_office.sql). Esto es solo el cliente.

/**
 * Emails con acceso al back office. Acá SOLO decide si se muestra el link en la
 * app; quién entra lo decide `admin_emails()` en la base. Si se cambia uno, se
 * cambia el otro.
 */
const ADMIN_EMAILS = ["nicolassespindola@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export type AdminPlan = "owner" | "lifetime" | "free";
export type GrantSource = "lemonsqueezy" | "manual";
export type GrantStatus = "active" | "refunded" | "revoked";

export interface AdminUser {
  user_id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  plan: AdminPlan;
  pro_since: string | null;
  grant_source: GrantSource | null;
  clients: number;
  entries: number;
  minutes: number;
  invoices: number;
  last_entry_at: string | null;
}

export interface LifetimeGrant {
  id: string;
  user_id: string | null;
  email: string | null;
  source: GrantSource;
  status: GrantStatus;
  ls_order_id: string | null;
  ls_order_number: number | null;
  customer_name: string | null;
  amount_cents: number | null;
  currency: string | null;
  amount_usd_cents: number | null;
  test_mode: boolean;
  note: string | null;
  created_at: string;
  ended_at: string | null;
}

/** ¿El usuario logueado es admin? Cualquier error cuenta como no. */
export async function fetchIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

export async function fetchAdminUsers() {
  return fetchAllRows<AdminUser>((from, to) =>
    supabase
      .rpc("admin_list_users", {}, { count: "exact" })
      .order("created_at", { ascending: false })
      .order("user_id")
      .range(from, to)
  );
}

export async function fetchLifetimeGrants() {
  return fetchAllRows<LifetimeGrant>((from, to) =>
    supabase
      .from("lifetime_grants")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to)
  );
}

/** Da lifetime access. `pending`: el email todavía no tiene cuenta. */
export async function grantLifetime(
  email: string,
  note: string
): Promise<{ pending: boolean } | { error: string }> {
  const { data, error } = await supabase.rpc("admin_grant_lifetime", {
    p_email: email,
    p_note: note,
  });
  if (error) return { error: adminErrorMessage(error.message) };
  return { pending: (data as { pending?: boolean } | null)?.pending === true };
}

export async function revokeLifetime(userId: string): Promise<string | null> {
  const { error } = await supabase.rpc("admin_revoke_lifetime", { p_user_id: userId });
  return error ? adminErrorMessage(error.message) : null;
}

export async function cancelPendingGrant(grantId: string): Promise<string | null> {
  const { error } = await supabase.rpc("admin_cancel_pending_grant", { p_grant_id: grantId });
  return error ? adminErrorMessage(error.message) : null;
}

const ERRORS: [code: string, message: string][] = [
  ["admin_only", "Tu sesión no tiene permisos de admin."],
  ["admin_invalid_email", "El email no es válido."],
  ["admin_already_pro", "Ese usuario ya tiene lifetime access."],
  ["admin_already_pending", "Ese email ya tiene un acceso pendiente."],
  ["admin_owner_always_pro", "El owner tiene lifetime access siempre: no se puede quitar."],
  ["admin_grant_not_pending", "Ese acceso ya no está pendiente. Recargá la lista."],
];

export function adminErrorMessage(message: string): string {
  return ERRORS.find(([code]) => message.includes(code))?.[1] ?? message;
}
