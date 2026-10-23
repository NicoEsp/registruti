import { supabase } from "@/lib/supabase";
import { setMoneyLocale } from "@/lib/format";
import { localeFor } from "@/lib/countries";
import type { Profile } from "@/lib/types";
import { issuerFromProfile, type InvoiceIssuer } from "@/lib/invoiceIssuer";

/**
 * Perfil del usuario (datos del emisor + país). Devuelve null si no hay perfil
 * cargado o si la tabla `profiles` todavía no fue creada (migración sin
 * aplicar), para no romper a quien la usa. Se selecciona `*` para tolerar
 * columnas que aún no existan en la base remota (ej. `country`).
 */
export async function fetchProfile(): Promise<Partial<Profile> | null> {
  const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
  if (error || !data) return null;
  return data as Partial<Profile>;
}

/** Datos del emisor (perfil del usuario) para incluir en los invoices. */
export async function fetchIssuer(): Promise<InvoiceIssuer | null> {
  return issuerFromProfile(await fetchProfile());
}

/** Ajusta el locale de formateo de montos al país del perfil. */
export async function applyProfileMoneyLocale(): Promise<void> {
  const profile = await fetchProfile();
  setMoneyLocale(localeFor(profile?.country ?? null));
}
