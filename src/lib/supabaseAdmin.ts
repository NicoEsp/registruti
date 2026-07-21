import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase server-only con la SERVICE ROLE key. Bypassa RLS, así que
// TODA query hecha con este cliente DEBE filtrar explícitamente por user_id
// (y setear user_id en los inserts). No importar nunca desde código de cliente:
// la service role key jamás debe llegar al browser.
//
// URL y key van por env var en Vercel y NO tienen fallback: una service role
// key apareada con la URL equivocada leería/escribiría en el proyecto que no es,
// así que preferimos fallar fuerte antes que adivinar la URL en silencio.
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas: el servidor MCP no puede acceder a la base."
    );
  }
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
