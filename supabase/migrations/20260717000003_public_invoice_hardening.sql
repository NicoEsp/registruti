-- Endurecimiento del link público de facturas.
-- 1. Versiona la generación del token compartible con entropía conocida
--    (128 bits vía pgcrypto) en lugar del default histórico creado a mano.
-- 2. Versiona y endurece la RPC `get_public_invoice` (security definer con
--    search_path fijo, match exacto por token, forma de salida mínima).
-- 3. Agrega `regenerate_share_token` para rotar el link si se filtró: el link
--    viejo deja de funcionar al instante.

create extension if not exists pgcrypto;

-- Token de 32 hex chars = 128 bits de entropía: no adivinable por fuerza bruta.
-- `search_path` incluye `extensions` porque en Supabase pgcrypto vive ahí.
create or replace function public.generate_share_token()
returns text
language sql
volatile
set search_path = public, extensions
as $$
  select encode(gen_random_bytes(16), 'hex');
$$;

alter table public.invoices
  alter column share_token set default public.generate_share_token();

-- La RPC pública se recrea desde cero: el `drop` cubre el caso de que la
-- versión creada a mano tenga otro tipo de retorno.
drop function if exists public.get_public_invoice(text);

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
  from public.invoices i
  join public.clients c on c.id = i.client_id
  where i.share_token = p_token;
$$;

revoke execute on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon, authenticated;

-- Rota el token de una factura propia. Corre como invoker: la RLS de
-- `invoices` garantiza que solo el dueño puede actualizar su fila; si la
-- factura no es del usuario, no actualiza nada y devuelve null.
create or replace function public.regenerate_share_token(p_invoice_id uuid)
returns text
language sql
volatile
set search_path = public, extensions
as $$
  update public.invoices
  set share_token = encode(gen_random_bytes(16), 'hex')
  where id = p_invoice_id
  returning share_token;
$$;

revoke execute on function public.regenerate_share_token(uuid) from public;
grant execute on function public.regenerate_share_token(uuid) to authenticated;
