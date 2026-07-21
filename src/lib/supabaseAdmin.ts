import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase server-only con la SERVICE ROLE key. Bypassa RLS, así que
// TODA query hecha con este cliente DEBE filtrar explícitamente por user_id
// (y setear user_id en los inserts). No importar nunca desde código de cliente:
// la service role key jamás debe llegar al browser.
//
// La URL cae al mismo proyecto que usa la app; la key va por env var en Vercel
// (SUPABASE_SERVICE_ROLE_KEY) y no tiene fallback: sin ella el MCP no opera.
const url =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://lcurdrsvexvjwfeekrxi.supabase.co";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada: el servidor MCP no puede acceder a la base."
    );
  }
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
