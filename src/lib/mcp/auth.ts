import { getAdminClient } from "@/lib/supabaseAdmin";
import { sha256Hex } from "@/lib/crypto";

/**
 * Resuelve el user_id dueño de un token MCP a partir de su valor en claro.
 * Devuelve null si el token no existe o si venció (`expires_at` en el pasado).
 * Marca `last_used_at` best-effort.
 *
 * Si la consulta a Supabase falla, tira: un error de base NO es un token
 * inválido. Devolver null ahí hacía que un problema transitorio nuestro
 * (Supabase caído, pool agotado, timeout) le llegara al usuario como un 401
 * "token inválido", que en los clientes MCP se ve como sesión desautorizada y
 * manda a regenerar un token que estaba perfecto. Tirando, el endpoint responde
 * 500 y el cliente lo trata como lo que es: una falla del server, reintentable.
 */
export async function resolveUserId(token: string): Promise<string | null> {
  const hash = await sha256Hex(token);
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("mcp_tokens")
    .select("id, user_id, expires_at")
    .eq("token_hash", hash)
    .maybeSingle();

  if (error) throw new Error(`No pude verificar el token MCP: ${error.message}`);
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return null;

  await admin
    .from("mcp_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return data.user_id as string;
}
