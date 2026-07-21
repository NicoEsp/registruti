-- Endurecimiento del link público de facturas.
--
-- La columna `invoices.share_token` es de tipo `uuid` con default
-- `gen_random_uuid()` (~122 bits de entropía, no adivinable por fuerza bruta).
-- Esta migración NO cambia el tipo ni los tokens ya emitidos; solo:
--   1. Fija el default de forma explícita/versionada.
--   2. Versiona y endurece la RPC `get_public_invoice` (security definer con
--      search_path fijo, match seguro por token y forma de salida mínima).
--   3. Agrega `regenerate_share_token` para rotar el link si se filtró: el link
--      viejo deja de funcionar al instante.

-- Limpieza defensiva por si una corrida anterior dejó una función a medias.
drop function if exists public.generate_share_token();

-- Default versionado y conocido. `gen_random_uuid()` es nativo en Postgres 13+
-- (Supabase corre 15), así que no hace falta ninguna extensión.
alter table public.invoices
  alter column share_token set default gen_random_uuid();

-- Índice único: lookup O(log n) del link público y garantía de no-colisión.
create unique index if not exists invoices_share_token_key
  on public.invoices (share_token);

-- La RPC pública se recrea desde cero. Se cubren las dos firmas posibles de la
-- versión creada a mano (text o uuid) para no dejar overloads ambiguos.
drop function if exists public.get_public_invoice(text);
drop function if exists public.get_public_invoice(uuid);

create function public.get_public_invoice(p_token text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'invoice', json_build_object(
      'id', i.id,
      'client_id', i.client_id,
      'invoice_number', i.invoice_number,
      'period_start', i.period_start,
      'period_end', i.period_end,
      'issue_date', i.issue_date,
      'due_date', i.due_date,
      'status', i.status,
      'hourly_rate', i.hourly_rate,
      'currency', i.currency,
      'total_minutes', i.total_minutes,
      'total_amount', i.total_amount,
      'notes', i.notes,
      'share_token', i.share_token,
      'created_at', i.created_at
    ),
    'client', json_build_object(
      'name', c.name,
      'email', c.email,
      'contact_name', c.contact_name
    ),
    'entries', coalesce(
      (
        select json_agg(
          json_build_object(
            'entry_date', e.entry_date,
            'duration_minutes', e.duration_minutes,
            'description', e.description
          )
          order by e.entry_date
        )
        from public.time_entries e
        where e.invoice_id = i.id
      ),
      '[]'::json
    )
  )
  -- Se valida el formato antes de castear el parámetro a uuid: un token mal
  -- formado no matchea (null) en vez de tirar excepción, y al no castear la
  -- columna el lookup puede usar el índice de share_token.
  from public.invoices i
  join public.clients c on c.id = i.client_id
  where i.share_token = (
    case
      when p_token ~* '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$' then p_token::uuid
      else null
    end
  );
$$;

revoke execute on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon, authenticated;

-- Rota el token de una factura propia. Corre como invoker: la RLS de
-- `invoices` garantiza que solo el dueño puede actualizar su fila; si la
-- factura no es del usuario, no actualiza nada y devuelve null.
create or replace function public.regenerate_share_token(p_invoice_id uuid)
returns uuid
language sql
volatile
set search_path = public
as $$
  update public.invoices
  set share_token = gen_random_uuid()
  where id = p_invoice_id
  returning share_token;
$$;

revoke execute on function public.regenerate_share_token(uuid) from public;
grant execute on function public.regenerate_share_token(uuid) to authenticated;
