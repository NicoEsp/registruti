import { supabase } from "@/lib/supabase";
import type { InvoiceIssuer } from "@/lib/invoicePdf";

/**
 * Datos del emisor (perfil del usuario) para incluir en las facturas.
 * Devuelve null si no hay perfil cargado o si la tabla `profiles` todavía no
 * fue creada (la migración no se aplicó), para no romper la generación del PDF.
 */
export async function fetchIssuer(): Promise<InvoiceIssuer | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("business_name, tax_id, email, address")
    .maybeSingle();
  if (error || !data) return null;
  return {
    businessName: data.business_name,
    taxId: data.tax_id,
    email: data.email,
    address: data.address,
  };
}
