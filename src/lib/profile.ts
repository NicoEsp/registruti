import { supabase } from "@/lib/supabase";
import { setMoneyLocale } from "@/lib/format";
import { localeFor } from "@/lib/countries";
import type { Profile } from "@/lib/types";
import type { InvoiceIssuer } from "@/lib/invoicePdf";

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

/** Datos del emisor (perfil del usuario) para incluir en las facturas. */
export async function fetchIssuer(): Promise<InvoiceIssuer | null> {
  const profile = await fetchProfile();
  if (!profile) return null;
  return {
    businessName: profile.business_name ?? null,
    taxId: profile.tax_id ?? null,
    email: profile.email ?? null,
    address: profile.address ?? null,
  };
}

/** Ajusta el locale de formateo de montos al país del perfil. */
export async function applyProfileMoneyLocale(): Promise<void> {
  const profile = await fetchProfile();
  setMoneyLocale(localeFor(profile?.country ?? null));
}
