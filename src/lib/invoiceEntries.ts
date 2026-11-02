import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetchAllRows";
import type { TimeEntry } from "@/lib/types";

/**
 * Todas las entradas de un invoice, por fecha. Pagina porque un invoice puede
 * pasar el "Max rows" de PostgREST; `id` desempata para que el orden sea total
 * y las páginas no repitan ni salteen filas.
 */
export function fetchInvoiceEntries(invoiceId: string) {
  return fetchAllRows<TimeEntry>((first, last) =>
    supabase
      .from("time_entries")
      .select("*", { count: "exact" })
      .eq("invoice_id", invoiceId)
      .order("entry_date")
      .order("id")
      .range(first, last)
  );
}
