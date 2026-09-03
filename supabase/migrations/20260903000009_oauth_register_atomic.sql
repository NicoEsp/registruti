-- Registro dinámico atómico y retención de refresh tokens rotados (review del
-- PR #27, segunda ronda):
--
--   1. `oauth_register_client()`: verifica los límites por IP y global y hace
--      el insert en una sola transacción, serializada con un advisory lock.
--      Antes el endpoint contaba y después insertaba en dos requests, así que
--      varios registros concurrentes podían pasar los topes.
--   2. `mcp_oauth_cleanup()` deja de borrar los refresh tokens ya rotados:
--      tienen que sobrevivir hasta su vencimiento, porque son lo que permite
--      reconocer un reuso tardío y revocar la autorización entera. Solo se
--      van cuando vence el refresh token (60 días).

create or replace function public.oauth_register_client(
  p_id text,
  p_secret_hash text,
  p_name text,
  p_redirect_uris text[],
  p_auth_method text,
  p_grant_types text[],
  p_scope text,
  p_client_uri text,
  p_logo_uri text,
  p_ip_hash text,
  p_ip_limit integer,
  p_global_limit integer
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - interval '1 hour';
begin
  -- Un solo lock para todos los registros: el volumen es mínimo y así el
  -- conteo y el insert son atómicos también para el tope global. Se libera
  -- solo al terminar la transacción.
  perform pg_advisory_xact_lock(hashtext('oauth_register_client'));

  if p_ip_hash is not null and (
    select count(*) from public.oauth_clients
    where ip_hash = p_ip_hash and created_at >= v_since
  ) >= p_ip_limit then
    return 'ip_limited';
  end if;

  if (
    select count(*) from public.oauth_clients where created_at >= v_since
  ) >= p_global_limit then
    return 'global_limited';
  end if;

  insert into public.oauth_clients
    (id, secret_hash, name, redirect_uris, token_endpoint_auth_method, grant_types, scope, client_uri, logo_uri, ip_hash)
  values
    (p_id, p_secret_hash, p_name, p_redirect_uris, p_auth_method, p_grant_types, p_scope, p_client_uri, p_logo_uri, p_ip_hash);

  return 'ok';
end;
$$;

-- Solo la service role (el endpoint) la ejecuta: nadie desde el browser. El
-- grant explícito no depende de los default privileges del proyecto.
revoke all on function public.oauth_register_client(text, text, text, text[], text, text[], text, text, text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.oauth_register_client(text, text, text, text[], text, text[], text, text, text, text, integer, integer)
  to service_role;

create or replace function public.mcp_oauth_cleanup()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.oauth_codes
    where expires_at < now() - interval '1 day';
  -- Los refresh tokens rotados se conservan hasta vencer (detección de reuso).
  delete from public.oauth_refresh_tokens
    where expires_at < now();
  delete from public.mcp_tokens
    where expires_at is not null and expires_at < now() - interval '1 day';
  delete from public.oauth_clients
    where last_used_at is null and created_at < now() - interval '7 days';
$$;

revoke all on function public.mcp_oauth_cleanup() from public, anon, authenticated;
