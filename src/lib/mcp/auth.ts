import { getAdminClient } from "@/lib/supabaseAdmin";

/** SHA-256 en hex, con Web Crypto (disponible en el runtime de Node de Next). */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Resuelve el user_id dueño de un token MCP a partir de su valor en claro.
 * Devuelve null si el token no existe. Marca `last_used_at` best-effort.
 */
export async function resolveUserId(token: string): Promise<string | null> {
  const hash = await sha256Hex(token);
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("mcp_tokens")
    .select("id, user_id")
    .eq("token_hash", hash)
    .maybeSingle();

  if (error || !data) return null;

  await admin
    .from("mcp_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return data.user_id as string;
}
