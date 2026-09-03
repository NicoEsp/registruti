import crypto from "node:crypto";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { sha256Hex } from "@/lib/crypto";
import { json } from "@/lib/mcp/http";
import { fetchPublicJson } from "@/lib/mcp/safeFetch";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  ALL_SCOPES,
  AUTH_CODE_TTL_SECONDS,
  CLIENT_METADATA_CACHE_MAX,
  MCP_ENDPOINT,
  OAUTH,
  REFRESH_ROTATION_GRACE_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  REGISTER_LIMIT_GLOBAL_PER_HOUR,
  REGISTER_LIMIT_PER_IP_PER_HOUR,
  SCOPES,
  parseScopes,
  scopeString,
  type Scope,
} from "@/lib/mcp/config";

// Authorization server OAuth 2.1 del MCP de Registruti, a mano y sin
// dependencias nuevas (como el propio servidor MCP). Cubre lo que exige la
// spec de autorización de MCP para que Claude (web, desktop, mobile, Code),
// Cursor y compañía se conecten con un clic:
//
//   - Descubrimiento: RFC 9728 (protected resource metadata) + RFC 8414
//     (authorization server metadata).
//   - Clientes: registro dinámico (RFC 7591) o Client ID Metadata Document
//     (el client_id es una URL https con el metadata).
//   - Authorization code + PKCE S256 obligatorio, con `resource` (RFC 8707).
//   - Refresh tokens rotativos y revocación (RFC 7009).
//
// Todo secreto (codes, tokens, client secrets) se guarda solo como SHA-256.
// El access token es una fila de `mcp_tokens` con vencimiento: la
// verificación en cada request es la misma que la de un token personal.

export class OAuthError extends Error {
  constructor(
    public readonly code: string,
    description: string,
    public readonly status = 400
  ) {
    super(description);
  }
}

/**
 * Error de la pantalla de autorización. Si `redirect` viene, el cliente lo
 * recibe por redirect como manda RFC 6749 §4.1.2.1; si es null (client_id o
 * redirect_uri inválidos) se muestra en pantalla y NUNCA se redirige.
 */
export class AuthorizeError extends OAuthError {
  constructor(
    code: string,
    description: string,
    public readonly redirect: string | null
  ) {
    super(code, description, 400);
  }
}

/** Respuesta de error estándar (RFC 6749 §5.2) para los endpoints OAuth. */
export function oauthErrorResponse(e: unknown): Response {
  if (e instanceof OAuthError) {
    const headers: Record<string, string> = e.status === 429 ? { "retry-after": "3600" } : {};
    return json({ error: e.code, error_description: e.message }, e.status, headers);
  }
  return json(
    { error: "server_error", error_description: e instanceof Error ? e.message : "Error interno." },
    500
  );
}

export type ClientAuthMethod = "none" | "client_secret_post" | "client_secret_basic";

export interface OAuthClient {
  id: string;
  name: string;
  redirectUris: string[];
  authMethod: ClientAuthMethod;
  secretHash: string | null;
  clientUri: string | null;
  logoUri: string | null;
  /** "registered": registrado por DCR. "metadata_document": Client ID Metadata Document. */
  kind: "registered" | "metadata_document";
}

export interface ClientCredentials {
  clientId?: string;
  clientSecret?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  scope: string;
}

// ---------------------------------------------------------------------------
// Metadata de descubrimiento
// ---------------------------------------------------------------------------

/** RFC 9728. Es lo que apunta el `resource_metadata` del 401 del MCP. */
export function protectedResourceMetadata() {
  return {
    resource: MCP_ENDPOINT,
    authorization_servers: [OAUTH.issuer],
    scopes_supported: ALL_SCOPES,
    bearer_methods_supported: ["header"],
    resource_name: "Registruti",
    resource_documentation: OAUTH.documentation,
  };
}

/** RFC 8414. */
export function authorizationServerMetadata() {
  return {
    issuer: OAUTH.issuer,
    authorization_endpoint: OAUTH.authorizationEndpoint,
    token_endpoint: OAUTH.tokenEndpoint,
    registration_endpoint: OAUTH.registrationEndpoint,
    revocation_endpoint: OAUTH.revocationEndpoint,
    scopes_supported: ALL_SCOPES,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    revocation_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    code_challenge_methods_supported: ["S256"],
    client_id_metadata_document_supported: true,
    service_documentation: OAUTH.documentation,
    ui_locales_supported: ["es"],
  };
}

export function describeScopes(scopes: Scope[]): { id: Scope; label: string }[] {
  return ALL_SCOPES.filter((s) => scopes.includes(s)).map((s) => ({ id: s, label: SCOPES[s] }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomHex(bytes: number): string {
  return crypto.randomBytes(bytes).toString("hex");
}

function nowIso(): string {
  return new Date().toISOString();
}

function inSeconds(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function isPast(iso: string | null | undefined): boolean {
  return !!iso && new Date(iso).getTime() <= Date.now();
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 && v.length <= 4000 ? v : undefined;
}

function parseUrl(s: string): URL | null {
  try {
    return new URL(s);
  } catch {
    return null;
  }
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function isLoopback(u: URL): boolean {
  return u.protocol === "http:" && LOOPBACK_HOSTS.has(u.hostname);
}

/**
 * Qué redirect_uri aceptamos registrar: https; http solo en loopback (apps
 * nativas como Claude Code, RFC 8252); o un esquema propio de app
 * (cursor://, vscode://). Nunca http plano a un host remoto.
 */
export function isAcceptableRedirectUri(s: string): boolean {
  const u = parseUrl(s);
  if (!u || u.hash) return false;
  if (u.protocol === "https:") return true;
  if (u.protocol === "http:") return isLoopback(u);
  return !["javascript:", "data:", "file:", "blob:", "about:"].includes(u.protocol);
}

function redirectUriMatches(registered: string, requested: string): boolean {
  if (registered === requested) return true;
  const a = parseUrl(registered);
  const b = parseUrl(requested);
  // RFC 8252 §7.3: en loopback el puerto lo elige la app en cada arranque,
  // así que se compara ignorándolo.
  return (
    !!a &&
    !!b &&
    isLoopback(a) &&
    isLoopback(b) &&
    a.hostname === b.hostname &&
    a.pathname === b.pathname &&
    a.search === b.search
  );
}

function optionalHttpsUrl(v: unknown): string | null {
  if (typeof v !== "string" || v.length > 2000) return null;
  const u = parseUrl(v);
  return u && u.protocol === "https:" ? v : null;
}

export function buildRedirect(
  redirectUri: string,
  params: Record<string, string | null | undefined>
): string {
  const url = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, v);
  }
  return url.toString();
}

/** El `resource` (RFC 8707) tiene que ser nuestro endpoint MCP, con o sin barra final. */
export function resourceMatches(resource: string): boolean {
  const norm = (s: string) => s.replace(/\/+$/, "").toLowerCase();
  return norm(resource) === norm(MCP_ENDPOINT);
}

// ---------------------------------------------------------------------------
// Clientes: registro dinámico (RFC 7591) y Client ID Metadata Documents
// ---------------------------------------------------------------------------

export interface RegisterContext {
  /** Hash de la IP que registra (null si no se pudo determinar): solo para limitar abuso. */
  ipHash: string | null;
}

/**
 * Hash con clave de la IP que registra un cliente. Sirve para contar
 * registros por origen sin guardar la IP, y con clave (HMAC) para que quien
 * lea la base no pueda enumerar las 4.000 millones de IPv4 contra un hash
 * sin sal. La clave sale de OAUTH_IP_HASH_SALT o, si no está, de la service
 * role key: ya es secreta, ya es server-only y no cambia entre deploys. Si no
 * hay ninguna, el registro falla cerrado (sin ella tampoco habría base).
 */
export function hashClientIp(ip: string): string {
  const key = process.env.OAUTH_IP_HASH_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new OAuthError(
      "server_error",
      "Falta OAUTH_IP_HASH_SALT (o SUPABASE_SERVICE_ROLE_KEY) para el rate limit del registro.",
      500
    );
  }
  return crypto.createHmac("sha256", key).update(ip).digest("hex");
}

export async function registerClient(body: unknown, ctx: RegisterContext): Promise<Record<string, unknown>> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new OAuthError(
      "invalid_client_metadata",
      "El body tiene que ser un objeto JSON con el metadata del cliente."
    );
  }
  const meta = body as Record<string, unknown>;

  const redirectUris = meta.redirect_uris;
  if (!Array.isArray(redirectUris) || redirectUris.length === 0 || redirectUris.length > 20) {
    throw new OAuthError("invalid_redirect_uri", "redirect_uris es obligatorio: entre 1 y 20 URLs.");
  }
  for (const uri of redirectUris) {
    if (typeof uri !== "string" || uri.length > 2000 || !isAcceptableRedirectUri(uri)) {
      throw new OAuthError(
        "invalid_redirect_uri",
        `redirect_uri no aceptada: ${String(uri).slice(0, 200)}. Se aceptan URLs https, http solo en localhost, o esquemas propios de apps nativas.`
      );
    }
  }

  const authMethod = meta.token_endpoint_auth_method ?? "client_secret_basic";
  if (authMethod !== "none" && authMethod !== "client_secret_post" && authMethod !== "client_secret_basic") {
    throw new OAuthError(
      "invalid_client_metadata",
      `token_endpoint_auth_method no soportado: ${String(authMethod)}. Opciones: none, client_secret_post, client_secret_basic.`
    );
  }

  const grantTypes = meta.grant_types === undefined ? ["authorization_code", "refresh_token"] : meta.grant_types;
  if (
    !Array.isArray(grantTypes) ||
    grantTypes.some((g) => g !== "authorization_code" && g !== "refresh_token") ||
    !grantTypes.includes("authorization_code")
  ) {
    throw new OAuthError(
      "invalid_client_metadata",
      "grant_types tiene que incluir authorization_code y, opcionalmente, refresh_token."
    );
  }

  const responseTypes = meta.response_types === undefined ? ["code"] : meta.response_types;
  if (!Array.isArray(responseTypes) || responseTypes.some((r) => r !== "code") || !responseTypes.includes("code")) {
    throw new OAuthError("invalid_client_metadata", 'response_types solo puede ser ["code"].');
  }

  const name =
    typeof meta.client_name === "string" && meta.client_name.trim()
      ? meta.client_name.trim().slice(0, 100)
      : "Cliente MCP";
  const requestedScopes = typeof meta.scope === "string" ? parseScopes(meta.scope) : [...ALL_SCOPES];
  if (!requestedScopes) {
    throw new OAuthError("invalid_client_metadata", `scope inválido. Scopes disponibles: ${ALL_SCOPES.join(" ")}.`);
  }

  const id = `rc_${randomHex(16)}`;
  const secret = authMethod === "none" ? null : `rcs_${randomHex(32)}`;
  const clientUri = optionalHttpsUrl(meta.client_uri);
  const logoUri = optionalHttpsUrl(meta.logo_uri);

  const admin = getAdminClient();

  // Limpieza oportunista de clientes que nunca completaron una autorización
  // (el cron de la base hace lo mismo cada hora).
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await admin.from("oauth_clients").delete().is("last_used_at", null).lt("created_at", weekAgo);

  // El registro es anónimo y persiste una fila por llamada, así que está
  // acotado por IP y en total por hora. El conteo y el insert los hace una
  // función de Postgres serializada con un advisory lock: contar acá y
  // después insertar dejaba pasar los topes con requests concurrentes.
  const { data: outcome, error } = await admin.rpc("oauth_register_client", {
    p_id: id,
    p_secret_hash: secret ? await sha256Hex(secret) : null,
    p_name: name,
    p_redirect_uris: redirectUris,
    p_auth_method: authMethod,
    p_grant_types: grantTypes,
    p_scope: scopeString(requestedScopes),
    p_client_uri: clientUri,
    p_logo_uri: logoUri,
    p_ip_hash: ctx.ipHash,
    p_ip_limit: REGISTER_LIMIT_PER_IP_PER_HOUR,
    p_global_limit: REGISTER_LIMIT_GLOBAL_PER_HOUR,
  });
  if (error) throw new OAuthError("server_error", `No pude registrar el cliente: ${error.message}`, 500);
  if (outcome === "ip_limited") {
    throw new OAuthError(
      "rate_limited",
      "Demasiados registros de clientes desde esta dirección. Probá de nuevo en una hora.",
      429
    );
  }
  if (outcome === "global_limited") {
    throw new OAuthError(
      "rate_limited",
      "El registro de clientes está saturado en este momento. Probá de nuevo en unos minutos.",
      429
    );
  }
  if (outcome !== "ok") {
    throw new OAuthError("server_error", `Respuesta inesperada al registrar el cliente: ${String(outcome)}`, 500);
  }

  return {
    client_id: id,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    ...(secret ? { client_secret: secret, client_secret_expires_at: 0 } : {}),
    client_name: name,
    redirect_uris: redirectUris,
    token_endpoint_auth_method: authMethod,
    grant_types: grantTypes,
    response_types: ["code"],
    scope: scopeString(requestedScopes),
    ...(clientUri ? { client_uri: clientUri } : {}),
    ...(logoUri ? { logo_uri: logoUri } : {}),
  };
}

const CLIENT_ID_PATTERN = /^rc_[0-9a-f]{32}$/;

function isClientIdUrl(id: string): boolean {
  return /^https?:\/\//i.test(id);
}

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (LOOPBACK_HOSTS.has(h) || h === "0.0.0.0") return true;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost")) return true;
  // IP literales (v4 o v6): nunca. Un metadata document vive en un dominio.
  return /^\d+\.\d+\.\d+\.\d+$/.test(h) || h.startsWith("[");
}

// http y direcciones privadas solo para las pruebas locales (scripts/mcp-e2e),
// jamás en producción.
function insecureClientMetadataAllowed(): boolean {
  return process.env.MCP_ALLOW_INSECURE_CLIENT_METADATA === "1" && process.env.VERCEL_ENV !== "production";
}

// Filtro previo por hostname; la protección real contra SSRF (la dirección
// resuelta, con DNS rebinding incluido) está en fetchPublicJson.
function clientMetadataUrlAllowed(u: URL): boolean {
  if (u.username || u.password || u.hash) return false;
  if (u.protocol === "https:") return !isPrivateHost(u.hostname);
  return u.protocol === "http:" && insecureClientMetadataAllowed();
}

// Caché por instancia: authorize y token leen el mismo documento seguidos.
// Solo se cachean lecturas exitosas; un fallo transitorio no bloquea 10 min.
// Está acotada porque la URL la elige el cliente sin autenticar: al insertar
// se purgan los vencidos y, si sigue llena, los más viejos.
const CLIENT_METADATA_CACHE_TTL_MS = 10 * 60 * 1000;
const clientMetadataCache = new Map<string, { at: number; client: OAuthClient }>();

function cacheClientMetadata(clientId: string, client: OAuthClient): void {
  const now = Date.now();
  for (const [key, entry] of clientMetadataCache) {
    if (now - entry.at >= CLIENT_METADATA_CACHE_TTL_MS) clientMetadataCache.delete(key);
  }
  while (clientMetadataCache.size >= CLIENT_METADATA_CACHE_MAX) {
    const oldest = clientMetadataCache.keys().next().value;
    if (oldest === undefined) break;
    clientMetadataCache.delete(oldest);
  }
  clientMetadataCache.set(clientId, { at: now, client });
}

function parseClientMetadataDocument(clientId: string, doc: unknown): OAuthClient | null {
  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) return null;
  const meta = doc as Record<string, unknown>;
  // El documento tiene que declararse a sí mismo: client_id idéntico a su URL.
  if (meta.client_id !== clientId) return null;
  const uris = Array.isArray(meta.redirect_uris)
    ? meta.redirect_uris.filter((r): r is string => typeof r === "string" && isAcceptableRedirectUri(r))
    : [];
  if (uris.length === 0) return null;
  // Son clientes públicos por definición; private_key_jwt no está soportado.
  if ((meta.token_endpoint_auth_method ?? "none") !== "none") return null;
  const name =
    typeof meta.client_name === "string" && meta.client_name.trim()
      ? meta.client_name.trim().slice(0, 100)
      : new URL(clientId).hostname;
  return {
    id: clientId,
    name,
    redirectUris: uris,
    authMethod: "none",
    secretHash: null,
    clientUri: optionalHttpsUrl(meta.client_uri),
    logoUri: optionalHttpsUrl(meta.logo_uri),
    kind: "metadata_document",
  };
}

async function loadClientMetadataDocument(clientId: string): Promise<OAuthClient | null> {
  const cached = clientMetadataCache.get(clientId);
  if (cached && Date.now() - cached.at < CLIENT_METADATA_CACHE_TTL_MS) return cached.client;

  const u = parseUrl(clientId);
  if (!u || !clientMetadataUrlAllowed(u)) return null;

  const doc = await fetchPublicJson(u, { allowPrivate: insecureClientMetadataAllowed() });
  const client = parseClientMetadataDocument(clientId, doc);
  if (client) cacheClientMetadata(clientId, client);
  return client;
}

export async function loadClient(clientId: string): Promise<OAuthClient | null> {
  if (isClientIdUrl(clientId)) return loadClientMetadataDocument(clientId);
  if (!CLIENT_ID_PATTERN.test(clientId)) return null;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("oauth_clients")
    .select("id, name, redirect_uris, token_endpoint_auth_method, secret_hash, client_uri, logo_uri")
    .eq("id", clientId)
    .maybeSingle();
  if (error) throw new OAuthError("server_error", `No pude leer el cliente OAuth: ${error.message}`, 500);
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    redirectUris: data.redirect_uris ?? [],
    authMethod: data.token_endpoint_auth_method,
    secretHash: data.secret_hash,
    clientUri: data.client_uri,
    logoUri: data.logo_uri,
    kind: "registered",
  };
}

/** Autentica al cliente en token/revoke: existe y, si es confidencial, el secret coincide. */
export async function authenticateClient(creds: ClientCredentials): Promise<OAuthClient> {
  const clientId = creds.clientId?.trim();
  if (!clientId) throw new OAuthError("invalid_client", "Falta client_id.", 401);
  const client = await loadClient(clientId);
  if (!client) {
    throw new OAuthError(
      "invalid_client",
      "Cliente desconocido. Desconectá Registruti en tu cliente MCP y volvé a conectarlo.",
      401
    );
  }
  if (client.secretHash) {
    const secret = creds.clientSecret ?? "";
    if (!secret || !safeEqual(await sha256Hex(secret), client.secretHash)) {
      throw new OAuthError("invalid_client", "client_secret inválido.", 401);
    }
  }
  return client;
}

// ---------------------------------------------------------------------------
// Autorización (pantalla /oauth/authorize)
// ---------------------------------------------------------------------------

export interface AuthorizeRequest {
  client: OAuthClient;
  redirectUri: string;
  state: string | null;
  scopes: Scope[];
  codeChallenge: string;
  resource: string | null;
}

/**
 * Valida los parámetros del authorization request. Primero client_id y
 * redirect_uri (si fallan, el error se muestra y no hay redirect); recién
 * después el resto, cuyos errores viajan al cliente por redirect.
 */
export async function parseAuthorizeRequest(params: Record<string, unknown>): Promise<AuthorizeRequest> {
  const clientId = str(params.client_id);
  if (!clientId) throw new AuthorizeError("invalid_request", "Falta el parámetro client_id.", null);
  const client = await loadClient(clientId);
  if (!client) {
    throw new AuthorizeError(
      "invalid_request",
      "No conozco a la app que pide acceso. Desconectá Registruti en tu cliente MCP y volvé a conectarlo para que se registre de nuevo.",
      null
    );
  }

  let redirectUri = str(params.redirect_uri);
  if (!redirectUri) {
    if (client.redirectUris.length !== 1) {
      throw new AuthorizeError("invalid_request", "Falta el parámetro redirect_uri.", null);
    }
    redirectUri = client.redirectUris[0];
  }
  const finalRedirectUri = redirectUri;
  if (!client.redirectUris.some((r) => redirectUriMatches(r, finalRedirectUri))) {
    throw new AuthorizeError(
      "invalid_request",
      "La redirect_uri no está registrada para esta app. Por seguridad no se puede continuar.",
      null
    );
  }

  const state = str(params.state) ?? null;
  const fail = (code: string, description: string) =>
    new AuthorizeError(
      code,
      description,
      buildRedirect(finalRedirectUri, { error: code, error_description: description, state, iss: OAUTH.issuer })
    );

  if (str(params.response_type) !== "code") {
    throw fail("unsupported_response_type", "Solo se soporta response_type=code.");
  }
  const codeChallenge = str(params.code_challenge);
  if (!codeChallenge) throw fail("invalid_request", "Falta code_challenge: PKCE es obligatorio.");
  if ((str(params.code_challenge_method) ?? "plain") !== "S256") {
    throw fail("invalid_request", "code_challenge_method tiene que ser S256.");
  }
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(codeChallenge)) {
    throw fail("invalid_request", "code_challenge inválido.");
  }
  const scopes = parseScopes(str(params.scope));
  if (!scopes) throw fail("invalid_scope", `Scope desconocido. Disponibles: ${ALL_SCOPES.join(" ")}.`);
  const resource = str(params.resource) ?? null;
  if (resource && !resourceMatches(resource)) {
    throw fail("invalid_target", `resource desconocido. El servidor MCP de Registruti es ${MCP_ENDPOINT}.`);
  }

  return { client, redirectUri: finalRedirectUri, state, scopes, codeChallenge, resource };
}

/** Emite el authorization code para el usuario y devuelve la URL de retorno al cliente. */
export async function createAuthorizationCode(req: AuthorizeRequest, userId: string): Promise<string> {
  const code = `reg_ac_${randomHex(32)}`;
  const admin = getAdminClient();
  const { error } = await admin.from("oauth_codes").insert({
    code_hash: await sha256Hex(code),
    user_id: userId,
    client_id: req.client.id,
    client_name: req.client.name,
    redirect_uri: req.redirectUri,
    code_challenge: req.codeChallenge,
    scope: scopeString(req.scopes),
    resource: req.resource,
    expires_at: inSeconds(AUTH_CODE_TTL_SECONDS),
  });
  if (error) {
    throw new OAuthError("server_error", `No pude emitir el código de autorización: ${error.message}`, 500);
  }
  // Un cliente registrado que llega hasta acá es real: queda fuera de la
  // limpieza de clientes nunca usados. Best-effort.
  if (req.client.kind === "registered") {
    await admin.from("oauth_clients").update({ last_used_at: nowIso() }).eq("id", req.client.id);
  }
  return buildRedirect(req.redirectUri, { code, state: req.state, iss: OAUTH.issuer });
}

export function denyRedirect(req: AuthorizeRequest): string {
  return buildRedirect(req.redirectUri, {
    error: "access_denied",
    error_description: "El usuario canceló la autorización.",
    state: req.state,
    iss: OAUTH.issuer,
  });
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

interface GrantRow {
  id: string;
  user_id: string;
  client_id: string;
  client_name: string;
  scope: string;
}

async function issueTokens(grant: GrantRow, scopes: Scope[]): Promise<TokenResponse> {
  const accessToken = `reg_at_${randomHex(32)}`;
  const refreshToken = `reg_rt_${randomHex(32)}`;
  const [accessHash, refreshHash] = await Promise.all([sha256Hex(accessToken), sha256Hex(refreshToken)]);
  const scope = scopeString(scopes);
  const admin = getAdminClient();

  const { error: accessError } = await admin.from("mcp_tokens").insert({
    user_id: grant.user_id,
    token_hash: accessHash,
    name: grant.client_name,
    grant_id: grant.id,
    scope,
    expires_at: inSeconds(ACCESS_TOKEN_TTL_SECONDS),
  });
  if (accessError) {
    throw new OAuthError("server_error", `No pude emitir el access token: ${accessError.message}`, 500);
  }
  const { error: refreshError } = await admin.from("oauth_refresh_tokens").insert({
    token_hash: refreshHash,
    grant_id: grant.id,
    expires_at: inSeconds(REFRESH_TOKEN_TTL_SECONDS),
  });
  if (refreshError) {
    throw new OAuthError("server_error", `No pude emitir el refresh token: ${refreshError.message}`, 500);
  }

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: refreshToken,
    scope,
  };
}

export interface CodeExchange {
  code?: string;
  redirectUri?: string;
  codeVerifier?: string;
  resource?: string;
  creds: ClientCredentials;
}

export async function exchangeAuthorizationCode(p: CodeExchange): Promise<TokenResponse> {
  const client = await authenticateClient(p.creds);
  if (!p.code) throw new OAuthError("invalid_request", "Falta code.");
  if (!p.codeVerifier) throw new OAuthError("invalid_request", "Falta code_verifier (PKCE).");

  const admin = getAdminClient();
  const { data: row, error } = await admin
    .from("oauth_codes")
    .select("id, user_id, client_id, client_name, redirect_uri, code_challenge, scope, resource, expires_at, used_at, grant_id")
    .eq("code_hash", await sha256Hex(p.code))
    .maybeSingle();
  if (error) throw new OAuthError("server_error", `No pude verificar el código: ${error.message}`, 500);
  if (!row || row.client_id !== client.id) {
    throw new OAuthError("invalid_grant", "Código de autorización inválido.");
  }
  if (row.used_at) {
    // Reuso de un code (RFC 6749 §4.1.2): o lo interceptaron o el cliente lo
    // repitió. Se revoca lo que salió de él.
    if (row.grant_id) {
      const { error: revokeError } = await admin.from("oauth_grants").delete().eq("id", row.grant_id);
      if (revokeError) {
        throw new OAuthError("server_error", `No pude revocar la autorización del código reusado: ${revokeError.message}`, 500);
      }
    }
    throw new OAuthError("invalid_grant", "El código ya fue usado. Volvé a conectar la app.");
  }
  if (isPast(row.expires_at)) {
    throw new OAuthError("invalid_grant", "El código de autorización venció. Volvé a conectar la app.");
  }
  if (p.redirectUri && p.redirectUri !== row.redirect_uri) {
    throw new OAuthError("invalid_grant", "redirect_uri no coincide con la de la autorización.");
  }
  const expectedChallenge = crypto.createHash("sha256").update(p.codeVerifier).digest("base64url");
  if (!safeEqual(expectedChallenge, row.code_challenge)) {
    throw new OAuthError("invalid_grant", "code_verifier inválido (PKCE).");
  }
  if (p.resource && !resourceMatches(p.resource)) {
    throw new OAuthError("invalid_target", `resource desconocido. El servidor MCP de Registruti es ${MCP_ENDPOINT}.`);
  }

  // Marcado atómico de "usado": de dos canjes concurrentes solo gana uno.
  const { data: claimed, error: claimError } = await admin
    .from("oauth_codes")
    .update({ used_at: nowIso() })
    .eq("id", row.id)
    .is("used_at", null)
    .select("id");
  if (claimError) throw new OAuthError("server_error", `No pude consumir el código: ${claimError.message}`, 500);
  if (!claimed || claimed.length === 0) throw new OAuthError("invalid_grant", "El código ya fue usado.");

  const scopes = parseScopes(row.scope) ?? [...ALL_SCOPES];
  const { data: grant, error: grantError } = await admin
    .from("oauth_grants")
    .insert({
      user_id: row.user_id,
      client_id: row.client_id,
      client_name: row.client_name,
      scope: scopeString(scopes),
    })
    .select("id, user_id, client_id, client_name, scope")
    .single();
  if (grantError || !grant) {
    throw new OAuthError("server_error", `No pude crear la autorización: ${grantError?.message ?? "sin datos"}`, 500);
  }
  await admin.from("oauth_codes").update({ grant_id: grant.id }).eq("id", row.id);
  // Limpieza oportunista: codes vencidos del usuario.
  await admin.from("oauth_codes").delete().eq("user_id", row.user_id).lt("expires_at", nowIso());

  return issueTokens(grant as GrantRow, scopes);
}

export interface RefreshRequest {
  refreshToken?: string;
  scope?: string;
  resource?: string;
  creds: ClientCredentials;
}

export async function refreshAccessToken(p: RefreshRequest): Promise<TokenResponse> {
  if (!p.refreshToken) throw new OAuthError("invalid_request", "Falta refresh_token.");

  const admin = getAdminClient();
  const { data: row, error } = await admin
    .from("oauth_refresh_tokens")
    .select("id, grant_id, expires_at, rotated_at")
    .eq("token_hash", await sha256Hex(p.refreshToken))
    .maybeSingle();
  if (error) throw new OAuthError("server_error", `No pude verificar el refresh token: ${error.message}`, 500);
  if (!row) throw new OAuthError("invalid_grant", "Refresh token inválido o revocado. Volvé a conectar la app.");
  if (isPast(row.expires_at)) {
    await admin.from("oauth_refresh_tokens").delete().eq("id", row.id);
    throw new OAuthError("invalid_grant", "El refresh token venció. Volvé a conectar la app.");
  }
  if (row.rotated_at && Date.now() - new Date(row.rotated_at).getTime() > REFRESH_ROTATION_GRACE_SECONDS * 1000) {
    // Reuso de un refresh token ya rotado, fuera de la ventana de gracia
    // (RFC 9700 §4.14.2): alguien tiene un token que el cliente legítimo ya
    // descartó. Se revoca la autorización entera y, en cascada, todos sus
    // tokens; el usuario vuelve a autorizar y listo.
    const { error: revokeError } = await admin.from("oauth_grants").delete().eq("id", row.grant_id);
    if (revokeError) {
      throw new OAuthError("server_error", `No pude revocar la autorización tras detectar el reuso: ${revokeError.message}`, 500);
    }
    throw new OAuthError(
      "invalid_grant",
      "Este refresh token ya había sido usado. Por seguridad se revocó la autorización: volvé a conectar la app."
    );
  }

  const { data: grant, error: grantError } = await admin
    .from("oauth_grants")
    .select("id, user_id, client_id, client_name, scope")
    .eq("id", row.grant_id)
    .maybeSingle();
  if (grantError) throw new OAuthError("server_error", `No pude leer la autorización: ${grantError.message}`, 500);
  if (!grant) throw new OAuthError("invalid_grant", "La autorización fue revocada. Volvé a conectar la app.");

  // Tiene que ser el mismo cliente que obtuvo la autorización, y si es
  // confidencial, autenticarse.
  if (p.creds.clientId && p.creds.clientId !== grant.client_id) {
    throw new OAuthError("invalid_grant", "El refresh token pertenece a otro cliente.");
  }
  const client = await loadClient(grant.client_id);
  if (client?.secretHash) {
    await authenticateClient({ clientId: grant.client_id, clientSecret: p.creds.clientSecret });
  }

  const grantScopes = parseScopes(grant.scope) ?? [...ALL_SCOPES];
  let scopes = grantScopes;
  if (p.scope) {
    const requested = parseScopes(p.scope);
    if (!requested) throw new OAuthError("invalid_scope", "Scope desconocido.");
    scopes = requested.filter((s) => grantScopes.includes(s));
    if (scopes.length === 0) throw new OAuthError("invalid_scope", "El scope pedido excede lo autorizado.");
  }
  if (p.resource && !resourceMatches(p.resource)) {
    throw new OAuthError("invalid_target", `resource desconocido. El servidor MCP de Registruti es ${MCP_ENDPOINT}.`);
  }

  if (!row.rotated_at) {
    await admin.from("oauth_refresh_tokens").update({ rotated_at: nowIso() }).eq("id", row.id);
  }
  // Limpieza del grant: solo access tokens vencidos. Los refresh tokens ya
  // rotados se conservan hasta vencer: son lo que permite reconocer un reuso
  // tardío (arriba) y revocar la autorización.
  await admin.from("mcp_tokens").delete().eq("grant_id", grant.id).lt("expires_at", nowIso());

  return issueTokens(grant as GrantRow, scopes);
}

// ---------------------------------------------------------------------------
// Revocación (RFC 7009)
// ---------------------------------------------------------------------------

async function clientMayRevoke(grantId: string, creds: ClientCredentials): Promise<boolean> {
  const admin = getAdminClient();
  const { data: grant } = await admin.from("oauth_grants").select("client_id").eq("id", grantId).maybeSingle();
  if (!grant) return false;
  if (creds.clientId && creds.clientId !== grant.client_id) return false;
  const client = await loadClient(grant.client_id);
  if (client?.secretHash) {
    await authenticateClient({ clientId: grant.client_id, clientSecret: creds.clientSecret });
  }
  return true;
}

/**
 * Revoca un access token o un refresh token. Revocar el refresh token es
 * revocar la autorización entera (el grant y, en cascada, todos sus tokens).
 * Si el token no existe o es de otro cliente, no pasa nada: RFC 7009 pide
 * responder 200 igual para no filtrar información.
 */
export async function revokeToken(p: { token?: string; creds: ClientCredentials }): Promise<void> {
  if (!p.token) throw new OAuthError("invalid_request", "Falta token.");
  const admin = getAdminClient();
  const hash = await sha256Hex(p.token);

  const { data: refresh } = await admin
    .from("oauth_refresh_tokens")
    .select("id, grant_id")
    .eq("token_hash", hash)
    .maybeSingle();
  if (refresh) {
    if (await clientMayRevoke(refresh.grant_id, p.creds)) {
      await admin.from("oauth_grants").delete().eq("id", refresh.grant_id);
    }
    return;
  }

  const { data: access } = await admin
    .from("mcp_tokens")
    .select("id, grant_id")
    .eq("token_hash", hash)
    .maybeSingle();
  // Los tokens personales (sin grant) solo se revocan desde Ajustes.
  if (access?.grant_id && (await clientMayRevoke(access.grant_id, p.creds))) {
    await admin.from("mcp_tokens").delete().eq("id", access.id);
  }
}
