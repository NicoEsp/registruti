#!/usr/bin/env node
// Prueba end-to-end del servidor MCP de Registruti y de su OAuth.
//
// Levanta un Supabase de mentira (mock-supabase.mjs) y la app compilada
// (`next start`) apuntando a él, y recorre con el SDK oficial de MCP el mismo
// camino que hace Claude al conectar un servidor remoto: 401 → descubrimiento
// (RFC 9728 / 8414) → registro dinámico → autorización con PKCE → canje del
// code → tools → refresh automático al vencer el access token → revocación.
// Después cubre a mano los casos que el SDK no ejercita: consentimiento
// denegado, redirect_uri no registrada, reuso de code, PKCE incorrecto,
// clientes confidenciales, scope de solo lectura, Client ID Metadata Document
// y el token personal de Ajustes.
//
//   npm run test:mcp            # usa la build existente (o compila si no hay)
//   npm run test:mcp -- --build # fuerza recompilar
//   npm run test:mcp -- --verbose

import { spawn, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import { SERVICE_ROLE_KEY, USER_JWT, startMockSupabase } from "./mock-supabase.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP_PORT = Number(process.env.MCP_E2E_PORT ?? 3939);
const BASE = `http://127.0.0.1:${APP_PORT}`;
const MCP_URL = `${BASE}/api/mcp`;
const VERBOSE = process.argv.includes("--verbose");
const NEXT_BIN = path.join(ROOT, "node_modules", ".bin", "next");

// ---------------------------------------------------------------------------
// Mini harness
// ---------------------------------------------------------------------------

const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: e });
    console.log(`  ✗ ${name}\n    ${e?.stack ?? e}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg ?? "assertion failed");
}

function eq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg ?? "esperaba igualdad"}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers HTTP
// ---------------------------------------------------------------------------

async function waitFor(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`La app no levantó en ${timeoutMs} ms (${url})`);
}

function sha256Hex(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function pkce() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

function todayInBuenosAires() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function authorizeApi(decision, params, jwt) {
  const res = await fetch(`${BASE}/api/oauth/authorize`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(jwt ? { authorization: `Bearer ${jwt}` } : {}) },
    body: JSON.stringify({ decision, params }),
  });
  return { status: res.status, body: await res.json() };
}

/** Simula al usuario aprobando en /oauth/authorize; devuelve el code del redirect. */
async function approve(authorizationUrl) {
  const params = Object.fromEntries(new URL(authorizationUrl).searchParams.entries());
  const inspect = await authorizeApi("inspect", params);
  assert(inspect.status === 200, `inspect falló: ${JSON.stringify(inspect.body)}`);
  const approved = await authorizeApi("approve", params, USER_JWT);
  assert(approved.status === 200 && approved.body.redirect, `approve falló: ${JSON.stringify(approved.body)}`);
  const redirect = new URL(approved.body.redirect);
  eq(redirect.searchParams.get("state"), params.state ?? null, "state");
  eq(redirect.searchParams.get("iss"), BASE, "iss");
  const code = redirect.searchParams.get("code");
  assert(code?.startsWith("reg_ac_"), `code raro: ${code}`);
  return { code, redirect, inspect: inspect.body, params };
}

async function registerClient(metadata) {
  const res = await fetch(`${BASE}/api/oauth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(metadata),
  });
  return { status: res.status, body: await res.json() };
}

async function tokenRequest(params, headers = {}) {
  const res = await fetch(`${BASE}/api/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", ...headers },
    body: new URLSearchParams(params),
  });
  return { status: res.status, body: await res.json() };
}

/** Flujo de autorización a mano (sin SDK): registra PKCE, aprueba y devuelve code + verifier. */
async function manualAuthorize({ clientId, redirectUri, scope, extra = {} }) {
  const { verifier, challenge } = pkce();
  const state = crypto.randomBytes(8).toString("hex");
  const url = new URL(`${BASE}/oauth/authorize`);
  const params = {
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    resource: MCP_URL,
    ...(scope ? { scope } : {}),
    ...extra,
  };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const { code, inspect } = await approve(url.toString());
  return { code, verifier, state, inspect };
}

async function rpc(token, method, params = {}, id = 1) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(id === undefined ? { jsonrpc: "2.0", method, params } : { jsonrpc: "2.0", id, method, params }),
  });
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}

function toolText(result) {
  assert(!result.isError, `la tool devolvió error: ${JSON.stringify(result.content)}`);
  return result.content[0].text;
}

// ---------------------------------------------------------------------------
// OAuthClientProvider en memoria, como el que usa cualquier cliente MCP.
// ---------------------------------------------------------------------------

class MemoryProvider {
  constructor(redirectUrl, clientMetadata) {
    this._redirectUrl = redirectUrl;
    this._clientMetadata = clientMetadata;
    this.authorizationUrl = null;
    this.clientInfo = undefined;
    this.tokensSaved = undefined;
    this._verifier = undefined;
    this._state = undefined;
  }
  get redirectUrl() {
    return this._redirectUrl;
  }
  get clientMetadata() {
    return this._clientMetadata;
  }
  state() {
    this._state = crypto.randomBytes(8).toString("hex");
    return this._state;
  }
  clientInformation() {
    return this.clientInfo;
  }
  saveClientInformation(info) {
    this.clientInfo = info;
  }
  tokens() {
    return this.tokensSaved;
  }
  saveTokens(tokens) {
    this.tokensSaved = tokens;
  }
  redirectToAuthorization(url) {
    this.authorizationUrl = url.toString();
  }
  saveCodeVerifier(v) {
    this._verifier = v;
  }
  codeVerifier() {
    return this._verifier;
  }
  invalidateCredentials(scope) {
    if (scope === "all" || scope === "tokens") this.tokensSaved = undefined;
    if (scope === "all" || scope === "client") this.clientInfo = undefined;
  }
}

// ---------------------------------------------------------------------------
// Pruebas
// ---------------------------------------------------------------------------

async function runTests(mock) {
  const PRM_PATH = `${BASE}/.well-known/oauth-protected-resource/api/mcp`;

  console.log("\nProtocolo y descubrimiento");

  await test("GET /api/mcp responde 405 con Allow y CORS", async () => {
    const res = await fetch(MCP_URL);
    eq(res.status, 405);
    assert(res.headers.get("allow")?.includes("POST"), "sin Allow");
    eq(res.headers.get("access-control-allow-origin"), "*");
  });

  await test("OPTIONS /api/mcp responde el preflight CORS", async () => {
    const res = await fetch(MCP_URL, { method: "OPTIONS" });
    eq(res.status, 204);
    assert(res.headers.get("access-control-allow-headers")?.toLowerCase().includes("authorization"), "sin Authorization en allow-headers");
  });

  await test("POST sin token: 401 con WWW-Authenticate → resource_metadata y scope", async () => {
    const r = await rpc(null, "initialize", {});
    eq(r.status, 401);
    const www = r.headers.get("www-authenticate") ?? "";
    assert(www.startsWith("Bearer "), www);
    assert(www.includes(`resource_metadata="${PRM_PATH}"`), www);
    assert(www.includes('scope="read write"'), www);
    eq(r.body.error.code, -32001);
  });

  await test("POST con token inválido: 401 con error=\"invalid_token\"", async () => {
    const r = await rpc("reg_nada", "initialize", {});
    eq(r.status, 401);
    assert((r.headers.get("www-authenticate") ?? "").includes('error="invalid_token"'));
  });

  await test("Protected resource metadata en la ruta con path y en la raíz", async () => {
    for (const url of [PRM_PATH, `${BASE}/.well-known/oauth-protected-resource`]) {
      const res = await fetch(url);
      eq(res.status, 200, url);
      const doc = await res.json();
      eq(doc.resource, MCP_URL);
      eq(doc.authorization_servers[0], BASE);
      assert(doc.scopes_supported.includes("write"));
    }
    const unknown = await fetch(`${BASE}/.well-known/oauth-protected-resource/otra/cosa`);
    eq(unknown.status, 404);
  });

  await test("Authorization server metadata (RFC 8414)", async () => {
    const res = await fetch(`${BASE}/.well-known/oauth-authorization-server`);
    eq(res.status, 200);
    const doc = await res.json();
    eq(doc.issuer, BASE);
    eq(doc.authorization_endpoint, `${BASE}/oauth/authorize`);
    eq(doc.token_endpoint, `${BASE}/api/oauth/token`);
    eq(doc.registration_endpoint, `${BASE}/api/oauth/register`);
    eq(doc.revocation_endpoint, `${BASE}/api/oauth/revoke`);
    assert(doc.code_challenge_methods_supported.includes("S256"));
    assert(doc.token_endpoint_auth_methods_supported.includes("none"));
    eq(doc.client_id_metadata_document_supported, true);
  });

  console.log("\nFlujo completo con el SDK oficial (registro dinámico, como Claude)");

  const provider = new MemoryProvider("http://localhost:4321/callback", {
    client_name: "E2E Claude",
    redirect_uris: ["http://localhost:4321/callback"],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  });
  let client = null;

  await test("connect sin credenciales registra el cliente y redirige a /oauth/authorize", async () => {
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), { authProvider: provider });
    const first = new Client({ name: "registruti-e2e", version: "1.0.0" });
    let thrown = null;
    try {
      await first.connect(transport);
    } catch (e) {
      thrown = e;
    }
    assert(thrown instanceof UnauthorizedError, `esperaba UnauthorizedError, vino: ${thrown}`);
    assert(provider.clientInfo?.client_id?.startsWith("rc_"), `no registró: ${JSON.stringify(provider.clientInfo)}`);
    eq(provider.clientInfo.client_secret, undefined, "un cliente público no lleva secret");
    assert(provider.authorizationUrl, "no redirigió a autorizar");
    const url = new URL(provider.authorizationUrl);
    eq(`${url.origin}${url.pathname}`, `${BASE}/oauth/authorize`);
    eq(url.searchParams.get("response_type"), "code");
    eq(url.searchParams.get("code_challenge_method"), "S256");
    eq(url.searchParams.get("resource"), MCP_URL);
    eq(url.searchParams.get("scope"), "read write");
    const registered = mock.db().oauth_clients;
    eq(registered.length, 1);
    eq(registered[0].name, "E2E Claude");
    eq(registered[0].secret_hash, null);
  });

  await test("el usuario autoriza, el SDK canjea el code y conecta", async () => {
    const { code, inspect } = await approve(provider.authorizationUrl);
    eq(inspect.client.name, "E2E Claude");
    eq(inspect.client.kind, "registered");
    eq(inspect.scopes.length, 2);
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), { authProvider: provider });
    await transport.finishAuth(code);
    assert(provider.tokensSaved?.access_token?.startsWith("reg_at_"), "sin access token");
    assert(provider.tokensSaved?.refresh_token?.startsWith("reg_rt_"), "sin refresh token");
    eq(provider.tokensSaved.token_type, "Bearer");
    eq(provider.tokensSaved.expires_in, 3600);
    eq(provider.tokensSaved.scope, "read write");
    client = new Client({ name: "registruti-e2e", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(MCP_URL), { authProvider: provider }));
    eq(client.getServerVersion()?.name, "registruti");
    const instructions = client.getInstructions() ?? "";
    assert(instructions.includes(`hoy es ${todayInBuenosAires()}`), `instructions sin la fecha del usuario: ${instructions}`);
    assert(instructions.includes("America/Argentina/Buenos_Aires"), instructions);
    const grants = mock.db().oauth_grants;
    eq(grants.length, 1);
    eq(grants[0].client_name, "E2E Claude");
    eq(grants[0].scope, "read write");
    eq(mock.db().oauth_codes[0].used_at != null, true, "el code no quedó marcado como usado");
  });

  await test("tools/list expone las 4 tools con annotations", async () => {
    const { tools } = await client.listTools();
    eq(tools.length, 4);
    const names = tools.map((t) => t.name).sort();
    eq(names.join(","), "list_clients,list_time_entries,log_time,report_summary");
    eq(tools.find((t) => t.name === "log_time").annotations.readOnlyHint, false);
    eq(tools.find((t) => t.name === "report_summary").annotations.readOnlyHint, true);
  });

  await test("log_time carga 1h30 para Acme con la fecha de hoy en Buenos Aires", async () => {
    const result = await client.callTool({
      name: "log_time",
      arguments: { client: "acme", duration: "1h30", description: "Reunión e2e" },
    });
    const text = toolText(result);
    const today = todayInBuenosAires();
    assert(text.includes(`1:30 para Acme el ${today}`), text);
    const rows = mock.db().time_entries.filter((e) => e.description === "Reunión e2e");
    eq(rows.length, 1);
    eq(rows[0].duration_minutes, 90);
    eq(rows[0].entry_date, today);
    eq(rows[0].billable, true);
  });

  await test("log_time con cliente ambiguo o inexistente devuelve un error útil", async () => {
    const result = await client.callTool({ name: "log_time", arguments: { client: "nadie", duration: "1h" } });
    eq(result.isError, true);
    assert(result.content[0].text.includes("Clientes disponibles: Acme, Globex, Old Corp"), result.content[0].text);
  });

  await test("report_summary y list_time_entries usan el mes y la zona del usuario", async () => {
    const summary = JSON.parse(toolText(await client.callTool({ name: "report_summary", arguments: {} })));
    eq(summary.period.to, todayInBuenosAires());
    assert(summary.period.from.endsWith("-01"), summary.period.from);
    const acme = summary.by_client.find((c) => c.client === "Acme");
    eq(acme.minutes, 210);
    eq(acme.billable_amount, 175);
    const entries = JSON.parse(toolText(await client.callTool({ name: "list_time_entries", arguments: { client: "Globex" } })));
    eq(entries.count, 1);
    eq(entries.entries[0].billable, false);
  });

  await test("list_clients oculta archivados salvo include_archived", async () => {
    const visible = JSON.parse(toolText(await client.callTool({ name: "list_clients", arguments: {} })));
    eq(visible.length, 2);
    const all = JSON.parse(toolText(await client.callTool({ name: "list_clients", arguments: { include_archived: true } })));
    eq(all.length, 3);
    assert(mock.db().oauth_grants[0].last_used_at, "no marcó el último uso del grant");
  });

  await test("al vencer el access token, el SDK renueva solo con el refresh token (rotativo)", async () => {
    const before = provider.tokensSaved.access_token;
    const refreshBefore = provider.tokensSaved.refresh_token;
    await fetch(`${mock.url}/__test/expire-access-tokens`, { method: "POST" });
    const result = await client.callTool({ name: "list_clients", arguments: {} });
    toolText(result);
    assert(provider.tokensSaved.access_token !== before, "no renovó el access token");
    assert(provider.tokensSaved.refresh_token !== refreshBefore, "no rotó el refresh token");
    // Dentro de la ventana de gracia el refresh viejo sigue valiendo (carrera de dos refresh).
    const graced = await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: refreshBefore,
      client_id: provider.clientInfo.client_id,
    });
    eq(graced.status, 200, JSON.stringify(graced.body));
    // Fuera de la gracia, no.
    await fetch(`${mock.url}/__test/rotate-back`, { method: "POST" });
    const stale = await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: refreshBefore,
      client_id: provider.clientInfo.client_id,
    });
    eq(stale.status, 400);
    eq(stale.body.error, "invalid_grant");
    // Los access tokens vencidos del grant se limpiaron.
    const expired = mock.db().mcp_tokens.filter((t) => t.grant_id && new Date(t.expires_at) < new Date());
    eq(expired.length, 0, "quedaron access tokens vencidos");
  });

  await test("revocar el refresh token borra la autorización y sus tokens", async () => {
    const rt = provider.tokensSaved.refresh_token;
    const res = await fetch(`${BASE}/api/oauth/revoke`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: rt, client_id: provider.clientInfo.client_id }),
    });
    eq(res.status, 200);
    eq(mock.db().oauth_grants.length, 0);
    eq(mock.db().mcp_tokens.filter((t) => t.grant_id).length, 0);
    eq(mock.db().oauth_refresh_tokens.length, 0);
    const after = await rpc(provider.tokensSaved.access_token, "ping");
    eq(after.status, 401);
    // Revocar algo desconocido también es 200 (RFC 7009).
    const again = await fetch(`${BASE}/api/oauth/revoke`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: "reg_rt_nada" }),
    });
    eq(again.status, 200);
    await client.close();
  });

  console.log("\nCasos de borde del authorization server");

  const publicClient = (await registerClient({
    client_name: "Manual",
    redirect_uris: ["https://example.com/cb", "http://localhost/callback"],
    token_endpoint_auth_method: "none",
  })).body;

  await test("registro dinámico: respuesta RFC 7591 y validación de redirect_uris", async () => {
    assert(publicClient.client_id?.startsWith("rc_"), JSON.stringify(publicClient));
    eq(publicClient.token_endpoint_auth_method, "none");
    eq(publicClient.grant_types.join(","), "authorization_code,refresh_token");
    const bad = await registerClient({ client_name: "Mal", redirect_uris: ["http://evil.example.com/cb"] });
    eq(bad.status, 400);
    eq(bad.body.error, "invalid_redirect_uri");
    const none = await registerClient({ client_name: "Sin URIs" });
    eq(none.status, 400);
  });

  await test("loopback: el puerto de la redirect_uri puede variar (RFC 8252)", async () => {
    const { code, verifier } = await manualAuthorize({
      clientId: publicClient.client_id,
      redirectUri: "http://localhost:51234/callback",
    });
    const tokens = await tokenRequest({
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: "http://localhost:51234/callback",
      client_id: publicClient.client_id,
      resource: MCP_URL,
    });
    eq(tokens.status, 200, JSON.stringify(tokens.body));
  });

  await test("el usuario cancela: redirect con error=access_denied y state", async () => {
    const { challenge } = pkce();
    const params = {
      response_type: "code",
      client_id: publicClient.client_id,
      redirect_uri: "https://example.com/cb",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: "xyz",
    };
    const denied = await authorizeApi("deny", params);
    eq(denied.status, 200);
    const url = new URL(denied.body.redirect);
    eq(url.origin + url.pathname, "https://example.com/cb");
    eq(url.searchParams.get("error"), "access_denied");
    eq(url.searchParams.get("state"), "xyz");
  });

  await test("redirect_uri no registrada o cliente desconocido: error en pantalla, sin redirect", async () => {
    const { challenge } = pkce();
    const base = { response_type: "code", code_challenge: challenge, code_challenge_method: "S256" };
    const badUri = await authorizeApi("inspect", { ...base, client_id: publicClient.client_id, redirect_uri: "https://evil.example.com/cb" });
    eq(badUri.status, 400);
    eq(badUri.body.redirect, null);
    const badClient = await authorizeApi("inspect", { ...base, client_id: "rc_00000000000000000000000000000000", redirect_uri: "https://example.com/cb" });
    eq(badClient.status, 400);
    eq(badClient.body.redirect, null);
  });

  await test("sin PKCE o con método plain: error por redirect (RFC 6749 §4.1.2.1)", async () => {
    const noPkce = await authorizeApi("inspect", {
      response_type: "code",
      client_id: publicClient.client_id,
      redirect_uri: "https://example.com/cb",
      state: "s1",
    });
    eq(noPkce.status, 400);
    const url = new URL(noPkce.body.redirect);
    eq(url.searchParams.get("error"), "invalid_request");
    eq(url.searchParams.get("state"), "s1");
    const plain = await authorizeApi("inspect", {
      response_type: "code",
      client_id: publicClient.client_id,
      redirect_uri: "https://example.com/cb",
      code_challenge: "abc",
      code_challenge_method: "plain",
    });
    eq(plain.status, 400);
    assert(plain.body.redirect?.includes("error=invalid_request"));
  });

  await test("aprobar exige la sesión de Registruti (JWT válido)", async () => {
    const { challenge } = pkce();
    const params = {
      response_type: "code",
      client_id: publicClient.client_id,
      redirect_uri: "https://example.com/cb",
      code_challenge: challenge,
      code_challenge_method: "S256",
    };
    const noJwt = await authorizeApi("approve", params);
    eq(noJwt.status, 401);
    eq(noJwt.body.error, "login_required");
    const badJwt = await authorizeApi("approve", params, "otro-jwt");
    eq(badJwt.status, 401);
  });

  await test("PKCE incorrecto → invalid_grant; el code sigue sin usar", async () => {
    const { code } = await manualAuthorize({ clientId: publicClient.client_id, redirectUri: "https://example.com/cb" });
    const bad = await tokenRequest({
      grant_type: "authorization_code",
      code,
      code_verifier: "verificador-equivocado-verificador-equivocado-1234",
      redirect_uri: "https://example.com/cb",
      client_id: publicClient.client_id,
    });
    eq(bad.status, 400);
    eq(bad.body.error, "invalid_grant");
  });

  await test("reuso de un code → invalid_grant y se revoca lo que salió de él", async () => {
    const { code, verifier } = await manualAuthorize({ clientId: publicClient.client_id, redirectUri: "https://example.com/cb" });
    const params = {
      grant_type: "authorization_code",
      code,
      code_verifier: verifier,
      redirect_uri: "https://example.com/cb",
      client_id: publicClient.client_id,
    };
    const first = await tokenRequest(params);
    eq(first.status, 200, JSON.stringify(first.body));
    const grantsBefore = mock.db().oauth_grants.length;
    const second = await tokenRequest(params);
    eq(second.status, 400);
    eq(second.body.error, "invalid_grant");
    eq(mock.db().oauth_grants.length, grantsBefore - 1, "no revocó el grant del code reusado");
    const dead = await rpc(first.body.access_token, "ping");
    eq(dead.status, 401);
  });

  await test("code de otro cliente, resource ajeno y grant_type desconocido", async () => {
    const { code, verifier } = await manualAuthorize({ clientId: publicClient.client_id, redirectUri: "https://example.com/cb" });
    const other = (await registerClient({ client_name: "Otro", redirect_uris: ["https://example.com/cb"], token_endpoint_auth_method: "none" })).body;
    const stolen = await tokenRequest({ grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: "https://example.com/cb", client_id: other.client_id });
    eq(stolen.status, 400);
    eq(stolen.body.error, "invalid_grant");
    const badResource = await tokenRequest({ grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: "https://example.com/cb", client_id: publicClient.client_id, resource: "https://otro.example.com/mcp" });
    eq(badResource.status, 400);
    eq(badResource.body.error, "invalid_target");
    const weird = await tokenRequest({ grant_type: "password", client_id: publicClient.client_id });
    eq(weird.status, 400);
    eq(weird.body.error, "unsupported_grant_type");
  });

  await test("cliente confidencial: exige el client_secret (por body o HTTP Basic)", async () => {
    const reg = await registerClient({
      client_name: "Confidencial",
      redirect_uris: ["https://example.com/cb"],
      token_endpoint_auth_method: "client_secret_post",
    });
    eq(reg.status, 201);
    assert(reg.body.client_secret?.startsWith("rcs_"), "sin client_secret");
    const { code, verifier } = await manualAuthorize({ clientId: reg.body.client_id, redirectUri: "https://example.com/cb" });
    const base = { grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: "https://example.com/cb" };
    const noSecret = await tokenRequest({ ...base, client_id: reg.body.client_id });
    eq(noSecret.status, 401);
    eq(noSecret.body.error, "invalid_client");
    const wrong = await tokenRequest({ ...base, client_id: reg.body.client_id, client_secret: "rcs_mala" });
    eq(wrong.status, 401);
    const basic = Buffer.from(`${encodeURIComponent(reg.body.client_id)}:${encodeURIComponent(reg.body.client_secret)}`).toString("base64");
    const ok = await tokenRequest(base, { authorization: `Basic ${basic}` });
    eq(ok.status, 200, JSON.stringify(ok.body));
    const refreshed = await tokenRequest({ grant_type: "refresh_token", refresh_token: ok.body.refresh_token, client_id: reg.body.client_id, client_secret: reg.body.client_secret });
    eq(refreshed.status, 200, JSON.stringify(refreshed.body));
    const refreshedNoSecret = await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshed.body.refresh_token, client_id: reg.body.client_id });
    eq(refreshedNoSecret.status, 401);
  });

  await test("scope=read: la conexión no ve ni puede usar log_time", async () => {
    const { code, verifier, inspect } = await manualAuthorize({ clientId: publicClient.client_id, redirectUri: "https://example.com/cb", scope: "read" });
    eq(inspect.scopes.map((s) => s.id).join(","), "read");
    const tokens = await tokenRequest({ grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: "https://example.com/cb", client_id: publicClient.client_id });
    eq(tokens.status, 200, JSON.stringify(tokens.body));
    eq(tokens.body.scope, "read");
    const list = await rpc(tokens.body.access_token, "tools/list");
    eq(list.body.result.tools.length, 3);
    const call = await rpc(tokens.body.access_token, "tools/call", { name: "log_time", arguments: { client: "Acme", duration: "1h" } });
    eq(call.body.result.isError, true);
    assert(call.body.result.content[0].text.includes("solo lectura"), call.body.result.content[0].text);
    const init = await rpc(tokens.body.access_token, "initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "x", version: "1" } });
    assert(init.body.result.instructions.includes("solo lectura"));
    // scope pedido al refrescar no puede exceder el autorizado
    const up = await tokenRequest({ grant_type: "refresh_token", refresh_token: tokens.body.refresh_token, client_id: publicClient.client_id, scope: "read write" });
    eq(up.status, 200);
    eq(up.body.scope, "read");
  });

  await test("Client ID Metadata Document: el client_id es la URL del metadata", async () => {
    const clientId = `${mock.url}/cimd/claude.json`;
    const { code, verifier, inspect } = await manualAuthorize({ clientId, redirectUri: "https://claude.ai/api/mcp/auth_callback" });
    eq(inspect.client.name, "Claude (CIMD)");
    eq(inspect.client.kind, "metadata_document");
    const tokens = await tokenRequest({ grant_type: "authorization_code", code, code_verifier: verifier, redirect_uri: "https://claude.ai/api/mcp/auth_callback", client_id: clientId, resource: MCP_URL });
    eq(tokens.status, 200, JSON.stringify(tokens.body));
    const ping = await rpc(tokens.body.access_token, "ping");
    eq(ping.status, 200);
    eq(mock.db().oauth_grants.at(-1).client_name, "Claude (CIMD)");
    // Una redirect_uri que el documento no lista, no pasa.
    const { challenge } = pkce();
    const bad = await authorizeApi("inspect", { response_type: "code", client_id: clientId, redirect_uri: "https://evil.example.com/cb", code_challenge: challenge, code_challenge_method: "S256" });
    eq(bad.status, 400);
    eq(bad.body.redirect, null);
  });

  console.log("\nToken personal de Ajustes y detalles del protocolo");

  await test("un token personal (Authorization: Bearer reg_…) sigue funcionando con acceso total", async () => {
    const token = `reg_${crypto.randomBytes(32).toString("hex")}`;
    await fetch(`${mock.url}/__test/seed-token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token_hash: sha256Hex(token), name: "Claude Desktop" }) });
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), { requestInit: { headers: { authorization: `Bearer ${token}` } } });
    const c = new Client({ name: "registruti-e2e-token", version: "1.0.0" });
    await c.connect(transport);
    const { tools } = await c.listTools();
    eq(tools.length, 4);
    const text = toolText(await c.callTool({ name: "log_time", arguments: { client: "Globex", duration: "45m", date: "2026-01-15", billable: false } }));
    assert(text.includes("0:45 para Globex el 2026-01-15 (no facturable)"), text);
    await c.close();
    const row = mock.db().mcp_tokens.find((t) => t.name === "Claude Desktop");
    assert(row.last_used_at, "no marcó el último uso del token");
  });

  await test("JSON-RPC: notificaciones 202, batch rechazado, método desconocido, versión de protocolo", async () => {
    const token = `reg_${crypto.randomBytes(32).toString("hex")}`;
    await fetch(`${mock.url}/__test/seed-token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token_hash: sha256Hex(token) }) });
    const notif = await rpc(token, "notifications/initialized", {}, undefined);
    eq(notif.status, 202);
    const batch = await fetch(MCP_URL, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: "[]" });
    eq(batch.status, 400);
    const unknown = await rpc(token, "resources/list");
    eq(unknown.body.error.code, -32601);
    const future = await rpc(token, "initialize", { protocolVersion: "2099-01-01", capabilities: {}, clientInfo: { name: "x", version: "1" } });
    eq(future.body.result.protocolVersion, "2025-11-25");
    const old = await rpc(token, "initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "x", version: "1" } });
    eq(old.body.result.protocolVersion, "2025-03-26");
    eq(old.body.result.serverInfo.name, "registruti");
  });
}

// ---------------------------------------------------------------------------
// Ciclo de vida
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(path.join(ROOT, ".next", "BUILD_ID")) || process.argv.includes("--build")) {
    console.log("Compilando la app (next build)…");
    const build = spawnSync(NEXT_BIN, ["build"], { cwd: ROOT, stdio: "inherit" });
    if (build.status !== 0) process.exit(build.status ?? 1);
  }

  const mock = await startMockSupabase({ verbose: VERBOSE });
  console.log(`Supabase de mentira en ${mock.url}`);

  const app = spawn(NEXT_BIN, ["start", "-H", "127.0.0.1", "-p", String(APP_PORT)], {
    cwd: ROOT,
    env: {
      ...process.env,
      SUPABASE_URL: mock.url,
      SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY,
      MCP_BASE_URL: BASE,
      MCP_ALLOW_INSECURE_CLIENT_METADATA: "1",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: VERBOSE ? "inherit" : ["ignore", "pipe", "pipe"],
  });
  let appLog = "";
  app.stdout?.on("data", (d) => (appLog += d));
  app.stderr?.on("data", (d) => (appLog += d));

  try {
    await waitFor(MCP_URL, 90_000);
    console.log(`App en ${BASE}`);
    await runTests(mock);
  } catch (e) {
    console.error(e);
    results.push({ name: "runner", ok: false, error: e });
  } finally {
    app.kill("SIGTERM");
    await mock.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} pruebas OK`);
  if (failed.length > 0) {
    if (!VERBOSE && appLog) console.log(`\n--- últimas líneas de next start ---\n${appLog.slice(-4000)}`);
    process.exit(1);
  }
}

main();
