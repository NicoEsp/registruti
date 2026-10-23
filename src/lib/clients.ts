import { supabase } from "@/lib/supabase";
import { capture } from "@/lib/analytics";
import { countryFor } from "@/lib/countries";
import { fetchProfile } from "@/lib/profile";
import { isClientLimitError } from "@/lib/plan";
import { CLIENT_COLORS, type Client } from "@/lib/types";

export type CreateClientResult =
  | { ok: true; client: Client }
  | { ok: false; limit: true }
  | { ok: false; limit: false; message: string };

/**
 * Alta mínima de un cliente desde donde se cargan horas (tracker, registro
 * rápido, wizard de bienvenida). Solo el nombre es obligatorio: la primera
 * hora no tiene que esperar a que exista un cliente con tarifa y color. La
 * tarifa queda en 0 (o la que venga) y la moneda sale del país del perfil;
 * las dos se editan después en Clientes.
 *
 * El límite de clientes del plan gratis lo aplica un trigger de la base: si
 * saltó, se devuelve `limit: true` para que quien llama abra el paywall en vez
 * de mostrar el error crudo.
 */
export async function createClientQuick(input: {
  name: string;
  source: "tracker" | "quick_add" | "onboarding";
  hourlyRate?: number;
  currency?: string;
}): Promise<CreateClientResult> {
  const name = input.name.trim();
  if (!name) return { ok: false, limit: false, message: "El cliente necesita un nombre." };

  let currency = input.currency;
  if (!currency) {
    const profile = await fetchProfile();
    currency = countryFor(profile?.country ?? null)?.currency ?? "USD";
  }
  const hourlyRate =
    input.hourlyRate != null && Number.isFinite(input.hourlyRate) && input.hourlyRate > 0
      ? input.hourlyRate
      : 0;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      hourly_rate: hourlyRate,
      currency,
      color: CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)],
    })
    .select()
    .single();
  if (error || !data) {
    if (isClientLimitError(error?.message)) return { ok: false, limit: true };
    return { ok: false, limit: false, message: error?.message ?? "No se pudo crear el cliente." };
  }
  capture("client_created", { source: input.source, currency, has_rate: hourlyRate > 0 });
  return { ok: true, client: data as Client };
}
