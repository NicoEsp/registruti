import { getAdminClient } from "@/lib/supabaseAdmin";
import { sha256Hex } from "@/lib/crypto";
import { ALL_SCOPES, parseScopes, type Scope } from "@/lib/mcp/config";

export interface McpAccess {
  userId: string;
  scopes: Scope[];
  /** null en los tokens personales generados en Ajustes; id del grant en los emitidos por OAuth. */
  grantId: string | null;
}

/**
 * Resuelve el acceso que representa un bearer token a partir de su valor en
 * claro: el usuario dueño y los scopes. Devuelve null si el token no existe o
 * venció (`expires_at` en el pasado: los access tokens OAuth duran una hora,
 * los personales no vencen). Marca el último uso best-effort, en el grant si
 * es un token OAuth (es lo que muestra "Apps conectadas") o en el token si es
 * personal.
 *
 * Si la consulta a Supabase falla, tira: un error de base NO es un token
 * inválido. Devolver null ahí hacía que un problema transitorio nuestro
 * (Supabase caído, pool agotado, timeout) le llegara al usuario como un 401
 * "token inválido", que en los clientes MCP se ve como sesión desautorizada y
 * manda a reconectar una app que estaba perfecta. Tirando, el endpoint responde
 * 500 y el cliente lo trata como lo que es: una falla del server, reintentable.
 */
export async function resolveAccess(token: string): Promise<McpAccess | null> {
  const hash = await sha256Hex(token);
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("mcp_tokens")
    .select("id, user_id, expires_at, grant_id, scope")
    .eq("token_hash", hash)
    .maybeSingle();

  if (error) throw new Error(`No pude verificar el token MCP: ${error.message}`);
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return null;

  const now = new Date().toISOString();
  if (data.grant_id) {
    await admin.from("oauth_grants").update({ last_used_at: now }).eq("id", data.grant_id);
  } else {
    await admin.from("mcp_tokens").update({ last_used_at: now }).eq("id", data.id);
  }

  return {
    userId: data.user_id as string,
    scopes: data.grant_id ? (parseScopes(data.scope) ?? [...ALL_SCOPES]) : [...ALL_SCOPES],
    grantId: (data.grant_id as string | null) ?? null,
  };
}
