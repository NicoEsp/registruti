-- Endurecimiento del OAuth del MCP (review del PR #27):
--
--   1. `oauth_clients.ip_hash`: hash (con sal fija) de la IP que registró el
--      cliente. El registro dinámico (RFC 7591) es anónimo y persiste una fila
--      por llamada, así que el endpoint lo limita por IP y en total por hora.
--   2. Índices para los predicados de limpieza y de rate limit.
--   3. `mcp_oauth_cleanup()`: borra codes vencidos, refresh tokens vencidos o
--      ya rotados fuera de la ventana de gracia, access tokens OAuth vencidos
--      y clientes registrados que nunca completaron una autorización. Los
--      endpoints limpian de forma oportunista; esto garantiza que nada quede
--      para siempre aunque el grant no se vuelva a usar.
--   4. Si pg_cron está disponible (en Supabase lo está), programa esa limpieza
--      cada hora. Si no, avisa y queda solo la limpieza oportunista.

alter table public.oauth_clients
  add column if not exists ip_hash text;

create index if not exists oauth_clients_ip_hash_created_at_idx on public.oauth_clients (ip_hash, created_at);
create index if not exists oauth_clients_created_at_idx on public.oauth_clients (created_at);
create index if not exists oauth_codes_expires_at_idx on public.oauth_codes (expires_at);
create index if not exists oauth_refresh_tokens_expires_at_idx on public.oauth_refresh_tokens (expires_at);
create index if not exists oauth_refresh_tokens_rotated_at_idx on public.oauth_refresh_tokens (rotated_at);
create index if not exists mcp_tokens_expires_at_idx on public.mcp_tokens (expires_at);

create or replace function public.mcp_oauth_cleanup()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.oauth_codes
    where expires_at < now() - interval '1 day';
  delete from public.oauth_refresh_tokens
    where expires_at < now()
       or (rotated_at is not null and rotated_at < now() - interval '5 minutes');
  delete from public.mcp_tokens
    where expires_at is not null and expires_at < now() - interval '1 day';
  delete from public.oauth_clients
    where last_used_at is null and created_at < now() - interval '7 days';
$$;

-- Solo la corre el cron (como postgres) o el owner: nadie desde la API.
revoke all on function public.mcp_oauth_cleanup() from public, anon, authenticated;

do $do$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    if exists (select 1 from cron.job where jobname = 'mcp_oauth_cleanup') then
      perform cron.unschedule('mcp_oauth_cleanup');
    end if;
    perform cron.schedule('mcp_oauth_cleanup', '17 * * * *', $cron$select public.mcp_oauth_cleanup()$cron$);
  else
    raise notice 'pg_cron no disponible: la limpieza del OAuth queda solo oportunista (corré mcp_oauth_cleanup() a mano).';
  end if;
end
$do$;
