-- Datos de pago del emisor en la factura, y datos del emisor en el link público.
--
-- 1. `profiles.payment_details`: cómo cobrarle al usuario (alias/CBU, PayPal,
--    Wise, cripto...). Texto libre que se imprime al pie de la factura, para
--    que el cliente no tenga que pedirlo por otro lado.
-- 2. `get_public_invoice` devuelve además el perfil del emisor (`issuer`).
--    Hasta ahora la factura compartida por link salía sin "De:" ni forma de
--    pago, y el PDF descargado desde ese link tampoco los tenía.

alter table public.profiles
  add column if not exists payment_details text;

comment on column public.profiles.payment_details is
  'Cómo cobrar al emisor (alias, CBU, PayPal, Wise, ...). Texto libre; se muestra al pie de la factura.';

-- Misma firma que en 20260717000003: `create or replace` conserva owner y
-- permisos. Los grants se repiten igual por si la función se creó a mano.
create or replace function public.get_public_invoice(p_token text)
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
    -- Null si el usuario nunca cargó su perfil: la página lo tolera.
    'issuer', (
      select json_build_object(
        'business_name', p.business_name,
        'tax_id', p.tax_id,
        'email', p.email,
        'address', p.address,
        'payment_details', p.payment_details
      )
      from public.profiles p
      where p.user_id = i.user_id
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
  where i.share_token = (
    case
      when p_token ~* '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$' then p_token::uuid
      else null
    end
  );
$$;

revoke execute on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon, authenticated;
