import { getAdminClient } from "@/lib/supabaseAdmin";
import { sha256Hex } from "@/lib/crypto";

/**
 * Resuelve el user_id dueño de un token MCP a partir de su valor en claro.
 * Devuelve null si el token no existe o si venció (`expires_at` en el pasado).
 * Marca `last_used_at` best-effort.
 */
export async function resolveUserId(token: string): Promise<string | null> {
  const hash = await sha256Hex(token);
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("mcp_tokens")
    .select("id, user_id, expires_at")
    .eq("token_hash", hash)
    .maybeSingle();

  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return null;

  await admin
    .from("mcp_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return data.user_id as string;
}
