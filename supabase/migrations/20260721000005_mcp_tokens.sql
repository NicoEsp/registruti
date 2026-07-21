-- Tokens de acceso para el servidor MCP de Registruti (/api/mcp).
--
-- Cada token pertenece a un usuario y se guarda SOLO como hash SHA-256: el
-- token en claro se muestra una única vez al generarlo (en Ajustes) y nunca se
-- persiste. El servidor MCP corre con la service role key, hashea el token que
-- llega en el header `Authorization: Bearer <token>`, busca el hash acá y
-- resuelve el `user_id`; a partir de ahí toda query queda scopeada a ese
-- usuario. Es la Fase 1 del MCP: permite conectar Registruti a Claude Desktop
-- (o cualquier cliente MCP que acepte un header de autorización) con un token
-- personal, sin OAuth.

create table if not exists public.mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null unique,   -- SHA-256 (hex) del token en claro
  name text,                         -- etiqueta opcional ("Claude Desktop", ...)
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists mcp_tokens_user_id_idx on public.mcp_tokens (user_id);

alter table public.mcp_tokens enable row level security;

-- El dueño gestiona sus tokens (listar / crear / borrar) desde Ajustes con su
-- propia sesión. El lookup por hash lo hace la service role, que bypassa RLS.
drop policy if exists "mcp_tokens_own_all" on public.mcp_tokens;
create policy "mcp_tokens_own_all" on public.mcp_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
