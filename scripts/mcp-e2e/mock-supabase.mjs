// Supabase de mentira para la prueba end-to-end del MCP (scripts/mcp-e2e/run.mjs).
//
// Implementa lo justo de PostgREST (GET/POST/PATCH/DELETE con filtros eq/is/
// lt/gte/lte/in, select, order, Prefer: return=representation, Accept de
// objeto único) y del endpoint GET /auth/v1/user de GoTrue, sobre tablas en
// memoria con la misma forma que las de producción. Sin dependencias.
//
// También sirve un Client ID Metadata Document (/cimd/claude.json) y unos
// endpoints /__test/* para manipular el estado desde la prueba.

import http from "node:http";
import crypto from "node:crypto";

export const USER = { id: "11111111-1111-4111-8111-111111111111", email: "e2e@registruti.app" };
export const USER_JWT = "e2e-user-jwt";
export const SERVICE_ROLE_KEY = "e2e-service-role-key";

const CASCADES = {
  // tabla borrada → [tabla hija, columna FK, acción]
  oauth_grants: [
    ["mcp_tokens", "grant_id", "delete"],
    ["oauth_refresh_tokens", "grant_id", "delete"],
    ["oauth_codes", "grant_id", "set-null"],
  ],
};

const UNIQUE = {
  mcp_tokens: ["token_hash"],
  oauth_codes: ["code_hash"],
  oauth_refresh_tokens: ["token_hash"],
  oauth_clients: ["id"],
};

function seed() {
  const today = new Date().toISOString().slice(0, 10);
  const acme = "aaaaaaaa-0000-4000-8000-000000000001";
  const globex = "aaaaaaaa-0000-4000-8000-000000000002";
  const old = "aaaaaaaa-0000-4000-8000-000000000003";
  return {
    profiles: [{ user_id: USER.id, country: "AR", business_name: "E2E", created_at: now() }],
    clients: [
      { id: acme, user_id: USER.id, name: "Acme", hourly_rate: 50, currency: "USD", color: "#6366f1", archived: false, created_at: now() },
      { id: globex, user_id: USER.id, name: "Globex", hourly_rate: 30000, currency: "ARS", color: "#ec4899", archived: false, created_at: now() },
      { id: old, user_id: USER.id, name: "Old Corp", hourly_rate: 10, currency: "USD", color: "#f59e0b", archived: true, created_at: now() },
    ],
    time_entries: [
      { id: crypto.randomUUID(), user_id: USER.id, client_id: acme, entry_date: today, duration_minutes: 120, description: "Kickoff", billable: true, invoice_id: null, created_at: now() },
      { id: crypto.randomUUID(), user_id: USER.id, client_id: globex, entry_date: today, duration_minutes: 45, description: "Soporte", billable: false, invoice_id: null, created_at: now() },
    ],
    mcp_tokens: [],
    oauth_clients: [],
    oauth_codes: [],
    oauth_grants: [],
    oauth_refresh_tokens: [],
  };
}

function now() {
  return new Date().toISOString();
}

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

function applyFilter(rows, key, raw) {
  const m = raw.match(/^(eq|neq|gt|gte|lt|lte|is|in)\.([\s\S]*)$/);
  if (!m) throw new Error(`Filtro PostgREST no soportado por el mock: ${key}=${raw}`);
  const [, op, val] = m;
  return rows.filter((row) => {
    const v = row[key];
    switch (op) {
      case "eq":
        return v != null && String(v) === val;
      case "neq":
        return String(v) !== val;
      case "gt":
        return v != null && compare(v, val) > 0;
      case "gte":
        return v != null && compare(v, val) >= 0;
      case "lt":
        return v != null && compare(v, val) < 0;
      case "lte":
        return v != null && compare(v, val) <= 0;
      case "is":
        if (val === "null") return v == null;
        if (val === "true") return v === true;
        if (val === "false") return v === false;
        return false;
      case "in": {
        const list = val
          .replace(/^\(|\)$/g, "")
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""));
        return list.includes(String(v));
      }
      default:
        return false;
    }
  });
}

const RESERVED = new Set(["select", "order", "limit", "offset", "columns", "on_conflict"]);

function project(row, select) {
  if (!select || select.trim() === "*") return { ...row };
  const cols = select.split(",").map((c) => c.trim()).filter(Boolean);
  const out = {};
  for (const c of cols) out[c] = row[c] ?? null;
  return out;
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

export async function startMockSupabase({ verbose = false } = {}) {
  let db = seed();
  const log = (...args) => verbose && console.log("[mock-supabase]", ...args);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const send = (status, payload, headers = {}) => {
      res.writeHead(status, { "content-type": "application/json", ...headers });
      res.end(payload === undefined ? "" : JSON.stringify(payload));
    };
    const rawBody = await readBody(req);
    log(req.method, url.pathname + url.search, rawBody.slice(0, 200));

    // --- GoTrue: usuario a partir del JWT ---------------------------------
    if (url.pathname === "/auth/v1/user") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${USER_JWT}`) {
        return send(200, { id: USER.id, aud: "authenticated", role: "authenticated", email: USER.email, app_metadata: {}, user_metadata: {}, created_at: now() });
      }
      return send(401, { code: 401, msg: "invalid JWT", error_code: "bad_jwt" });
    }

    // --- Client ID Metadata Document --------------------------------------
    if (url.pathname === "/cimd/claude.json") {
      const self = `http://127.0.0.1:${server.address().port}/cimd/claude.json`;
      return send(200, {
        client_id: self,
        client_name: "Claude (CIMD)",
        client_uri: "https://claude.ai",
        redirect_uris: ["https://claude.ai/api/mcp/auth_callback"],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
      });
    }

    // --- Control de la prueba ---------------------------------------------
    if (url.pathname.startsWith("/__test/")) {
      const body = rawBody ? JSON.parse(rawBody) : {};
      switch (url.pathname) {
        case "/__test/db":
          return send(200, db);
        case "/__test/reset":
          db = seed();
          return send(200, { ok: true });
        case "/__test/expire-access-tokens": {
          const past = new Date(Date.now() - 60_000).toISOString();
          for (const t of db.mcp_tokens) if (t.grant_id) t.expires_at = past;
          return send(200, { ok: true });
        }
        case "/__test/rotate-back": {
          // Simula que la rotación fue hace mucho: el refresh viejo ya no vale.
          const long = new Date(Date.now() - 10 * 60_000).toISOString();
          for (const t of db.oauth_refresh_tokens) if (t.rotated_at) t.rotated_at = long;
          return send(200, { ok: true });
        }
        case "/__test/seed-token":
          db.mcp_tokens.push({ id: crypto.randomUUID(), user_id: USER.id, token_hash: body.token_hash, name: body.name ?? "personal", created_at: now(), last_used_at: null, expires_at: null, grant_id: null, scope: null });
          return send(200, { ok: true });
        default:
          return send(404, { error: "unknown test endpoint" });
      }
    }

    // --- PostgREST ---------------------------------------------------------
    const m = url.pathname.match(/^\/rest\/v1\/([a-z_]+)$/);
    if (!m) return send(404, { message: `Not found: ${req.method} ${url.pathname}` });
    const table = m[1];
    if (!(table in db)) return send(404, { code: "42P01", message: `relation "${table}" does not exist` });
    if (req.headers.apikey !== SERVICE_ROLE_KEY) {
      return send(401, { message: "Invalid API key (el mock espera la service role de la prueba)" });
    }

    const prefer = req.headers.prefer ?? "";
    const wantsRepresentation = prefer.includes("return=representation");
    const wantsObject = (req.headers.accept ?? "").includes("vnd.pgrst.object");
    const select = url.searchParams.get("select");

    let rows = db[table];
    for (const [key, raw] of url.searchParams) {
      if (RESERVED.has(key)) continue;
      rows = applyFilter(rows, key, raw);
    }

    const finish = (status, result) => {
      let out = result.map((r) => project(r, select));
      if (wantsObject) {
        if (out.length !== 1) {
          return send(406, { code: "PGRST116", message: `JSON object requested, multiple (or no) rows returned (${out.length})` });
        }
        return send(status, out[0]);
      }
      return send(status, out);
    };

    try {
      switch (req.method) {
        case "GET": {
          const order = url.searchParams.get("order");
          if (order) {
            const [col, dir] = order.split(".");
            rows = [...rows].sort((a, b) => (dir === "desc" ? -1 : 1) * compare(a[col], b[col]));
          }
          const limit = url.searchParams.get("limit");
          if (limit) rows = rows.slice(0, Number(limit));
          return finish(200, rows);
        }
        case "POST": {
          const parsed = JSON.parse(rawBody);
          const values = Array.isArray(parsed) ? parsed : [parsed];
          const inserted = [];
          for (const v of values) {
            const row = { id: crypto.randomUUID(), created_at: now(), ...v };
            for (const col of UNIQUE[table] ?? []) {
              if (db[table].some((r) => r[col] === row[col])) {
                return send(409, { code: "23505", message: `duplicate key value violates unique constraint "${table}_${col}_key"` });
              }
            }
            db[table].push(row);
            inserted.push(row);
          }
          if (!wantsRepresentation) return send(201, undefined);
          return finish(201, inserted);
        }
        case "PATCH": {
          const patch = JSON.parse(rawBody);
          for (const row of rows) Object.assign(row, patch);
          if (!wantsRepresentation) return send(204, undefined);
          return finish(200, rows);
        }
        case "DELETE": {
          const ids = new Set(rows.map((r) => r.id));
          const deleted = rows;
          db[table] = db[table].filter((r) => !ids.has(r.id));
          for (const [child, fk, action] of CASCADES[table] ?? []) {
            if (action === "delete") db[child] = db[child].filter((r) => !ids.has(r[fk]));
            else for (const r of db[child]) if (ids.has(r[fk])) r[fk] = null;
          }
          if (!wantsRepresentation) return send(204, undefined);
          return finish(200, deleted);
        }
        default:
          return send(405, { message: "method not allowed" });
      }
    } catch (e) {
      return send(500, { message: e instanceof Error ? e.message : String(e) });
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  return {
    url: `http://127.0.0.1:${port}`,
    db: () => db,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
