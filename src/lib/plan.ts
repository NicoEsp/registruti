import { supabase } from "@/lib/supabase";

// Límites del plan gratis. Deben coincidir con free_client_limit() /
// free_invoice_limit() de la migración 20260721000006_pricing_limits.sql
// (la base es la fuente de verdad; esto es solo para la UX).
export const FREE_CLIENT_LIMIT = 3;
export const FREE_INVOICE_LIMIT = 4;

// URL base del checkout del lifetime access en LemonSqueezy (el "buy link" del
// producto). Es pública, así que va hardcodeada como default; se puede
// sobreescribir por env var. Si quedara vacía, el paywall cae a un mailto.
const DEFAULT_CHECKOUT_URL =
  "https://nicoproducto.lemonsqueezy.com/checkout/buy/e1727dda-4b32-4d09-a210-95d1e210dbd7";
export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? DEFAULT_CHECKOUT_URL;
export const CHECKOUT_CONTACT_EMAIL = "hola@registruti.app";

export interface PlanStatus {
  pro: boolean;
  activeClients: number;
  invoices: number;
}

/**
 * Estado del plan del usuario: si tiene lifetime access y cuánto lleva usado.
 * Tolerante a que la migración de planes todavía no esté aplicada (columna `pro`
 * inexistente): en ese caso trata al usuario como free sin romper.
 */
export async function fetchPlanStatus(): Promise<PlanStatus> {
  const [profileRes, clientsRes, invoicesRes] = await Promise.all([
    supabase.from("profiles").select("*").maybeSingle(),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("archived", false),
    supabase.from("invoices").select("id", { count: "exact", head: true }),
  ]);
  const profile = profileRes.data as { pro?: boolean } | null;
  return {
    pro: profile?.pro === true,
    activeClients: clientsRes.count ?? 0,
    invoices: invoicesRes.count ?? 0,
  };
}

export function clientsAtLimit(status: PlanStatus): boolean {
  return !status.pro && status.activeClients >= FREE_CLIENT_LIMIT;
}

export function invoicesAtLimit(status: PlanStatus): boolean {
  return !status.pro && status.invoices >= FREE_INVOICE_LIMIT;
}

/**
 * Arma el link de checkout de LemonSqueezy con el `user_id` y el email
 * precargados. Mandar el user_id en custom_data es lo que le permite al webhook
 * activar al usuario correcto aunque pague con otro email.
 * Ver: LemonSqueezy → "Prefilling checkout fields" y "Passing custom data".
 */
export function buildCheckoutUrl(userId: string | null, email: string | null): string {
  if (!CHECKOUT_URL) {
    return `mailto:${CHECKOUT_CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Quiero el lifetime access de Registruti"
    )}`;
  }
  const url = new URL(CHECKOUT_URL);
  if (userId) url.searchParams.set("checkout[custom][user_id]", userId);
  if (email) url.searchParams.set("checkout[email]", email);
  return url.toString();
}

// Detección del error que levanta el trigger de la base cuando se topa el límite,
// para distinguirlo de un error genérico y abrir el paywall en vez de un cartel rojo.
export function isClientLimitError(message?: string | null): boolean {
  return !!message && message.includes("plan_limit_clients");
}

export function isInvoiceLimitError(message?: string | null): boolean {
  return !!message && message.includes("plan_limit_invoices");
}
