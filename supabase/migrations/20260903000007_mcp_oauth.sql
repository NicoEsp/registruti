-- OAuth 2.1 para el servidor MCP de Registruti (Fase 2).
--
-- Hasta acá el MCP solo aceptaba tokens personales generados a mano en Ajustes
-- (tabla `mcp_tokens`). Eso alcanza para Claude Code con `--header` o para
-- Claude Desktop vía `mcp-remote`, pero Claude web/mobile/desktop ("Conectores"),
-- Claude Code sin header, Cursor y ChatGPT exigen que el servidor sea un
-- authorization server OAuth 2.1 con descubrimiento (RFC 8414 / RFC 9728),
-- registro dinámico de clientes (RFC 7591) y PKCE. Esta migración agrega lo
-- que ese flujo necesita persistir. Todo secreto se guarda hasheado (SHA-256).
--
-- Flujo: el cliente MCP se registra (oauth_clients) → manda al usuario a
-- /oauth/authorize → el usuario aprueba y se emite un code (oauth_codes) →
-- el cliente lo canjea en /api/oauth/token → nace una autorización
-- (oauth_grants) con un access token (fila en mcp_tokens, con vencimiento) y
-- un refresh token (oauth_refresh_tokens). Revocar la autorización desde
-- Ajustes borra el grant y, por cascada, todos sus tokens.

-- Clientes registrados dinámicamente (Claude, Cursor, etc.). Los clientes que
-- se identifican con un Client ID Metadata Document (una URL https) no se
-- guardan acá: se leen de su URL en el momento.
create table if not exists public.oauth_clients (
  id text primary key,                          -- client_id opaco ("rc_" + hex)
  secret_hash text,                             -- SHA-256 del client_secret; null en clientes públicos
  name text not null,
  redirect_uris text[] not null,
  token_endpoint_auth_method text not null default 'none',
  grant_types text[] not null default array['authorization_code', 'refresh_token'],
  scope text,
  client_uri text,
  logo_uri text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.oauth_clients enable row level security;
-- Sin policies a propósito: solo la service role (el endpoint OAuth) opera
-- esta tabla. Ningún usuario la ve desde el browser.

-- Una fila por autorización otorgada (usuario × cliente × momento). Es lo que
-- el usuario ve y revoca en Ajustes → "Apps conectadas".
create table if not exists public.oauth_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id text not null,                      -- id de oauth_clients o URL del metadata document
  client_name text not null,                    -- copia del nombre al momento de autorizar
  scope text not null,                          -- "read write", "read"
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists oauth_grants_user_id_idx on public.oauth_grants (user_id);

alter table public.oauth_grants enable row level security;

-- El dueño lista y revoca (borra) sus autorizaciones con su propia sesión.
-- Crear/actualizar es exclusivo de la service role.
drop policy if exists "oauth_grants_own_select" on public.oauth_grants;
create policy "oauth_grants_own_select" on public.oauth_grants
  for select using (auth.uid() = user_id);

drop policy if exists "oauth_grants_own_delete" on public.oauth_grants;
create policy "oauth_grants_own_delete" on public.oauth_grants
  for delete using (auth.uid() = user_id);

-- Authorization codes: de un solo uso y con vida corta (10 minutos).
create table if not exists public.oauth_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id text not null,
  client_name text not null,
  redirect_uri text not null,
  code_challenge text not null,                 -- PKCE S256
  scope text not null,
  resource text,                                -- RFC 8707, si el cliente lo mandó
  expires_at timestamptz not null,
  used_at timestamptz,
  grant_id uuid references public.oauth_grants (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.oauth_codes enable row level security;
-- Sin policies: solo la service role.

-- Refresh tokens. Rotan en cada uso: el viejo queda marcado con `rotated_at`
-- y sigue valiendo unos segundos para tolerar dos refresh concurrentes del
-- mismo cliente.
create table if not exists public.oauth_refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  grant_id uuid not null references public.oauth_grants (id) on delete cascade,
  expires_at timestamptz not null,
  rotated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists oauth_refresh_tokens_grant_id_idx on public.oauth_refresh_tokens (grant_id);

alter table public.oauth_refresh_tokens enable row level security;
-- Sin policies: solo la service role.

-- Los access tokens OAuth viven en mcp_tokens (misma verificación que los
-- tokens personales), pero atados a su grant y con scope. `grant_id` null
-- sigue siendo un token personal generado en Ajustes.
alter table public.mcp_tokens
  add column if not exists grant_id uuid references public.oauth_grants (id) on delete cascade,
  add column if not exists scope text;

create index if not exists mcp_tokens_grant_id_idx on public.mcp_tokens (grant_id);
