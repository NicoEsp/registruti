-- Ventas de LemonSqueezy atómicas e idempotentes por orden.
--
-- Antes el webhook hacía dos llamadas (grant_pro y el insert de la venta). Si
-- la segunda fallaba, el acceso quedaba dado sin venta registrada; y un
-- reenvío de order_created volvía a dar el acceso aunque la venta ya estuviera
-- reembolsada. Ahora:
--   - record_lifetime_sale da el acceso y registra la venta en una sola
--     transacción, y no hace nada si la orden ya se procesó (activa,
--     reembolsada o revocada).
--   - refund_lifetime_sale, si el reembolso llega antes que la venta, deja la
--     orden registrada como reembolsada para que la venta no dé acceso después.
-- Las dos se serializan por orden con un advisory lock, y además por usuario
-- antes de tocar su `pro` (lock_lifetime_user, de 20261102000011): sin eso,
-- dos reembolsos de órdenes distintas del mismo usuario, o un reembolso y una
-- compra nueva, se ven activos entre sí bajo READ COMMITTED y el `pro` queda
-- mal. La venta también toma el lock por email (lock_lifetime_email, de
-- 20261102000011) para no cruzarse con una cuenta que se está creando. Orden
-- de locks: orden → email → usuario → filas.
--
-- Requerida por: el webhook de LemonSqueezy (src/app/api/webhooks/lemonsqueezy).

create or replace function public.record_lifetime_sale(
  p_order_id text,
  p_user_id uuid,
  p_email text,
  p_order_number bigint,
  p_customer_name text,
  p_amount_cents integer,
  p_currency text,
  p_amount_usd_cents integer,
  p_test_mode boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  existing public.lifetime_grants%rowtype;
  target uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('lifetime_sale:' || p_order_id, 0));

  select * into existing from public.lifetime_grants where ls_order_id = p_order_id;
  if found then
    -- Fila creada por un reembolso que llegó antes que la venta: completa los
    -- datos de la orden (monto, cliente, prueba) sin dar acceso.
    if existing.status = 'refunded' and existing.amount_cents is null then
      update public.lifetime_grants
         set ls_order_number = p_order_number,
             customer_name = nullif(trim(p_customer_name), ''),
             amount_cents = p_amount_cents,
             currency = upper(p_currency),
             amount_usd_cents = p_amount_usd_cents,
             test_mode = coalesce(p_test_mode, false),
             email = coalesce(email, lower(nullif(trim(p_email), '')))
       where id = existing.id;
    end if;
    -- Reintento o reenvío de una orden ya procesada: no se vuelve a dar acceso.
    return jsonb_build_object('user_id', existing.user_id, 'status', existing.status, 'duplicate', true);
  end if;

  -- Serializa con el trigger de altas y con admin_grant_lifetime: o esta venta
  -- ve la cuenta ya creada, o el trigger ve la venta pendiente.
  if nullif(trim(p_email), '') is not null then
    perform public.lock_lifetime_email(p_email);
  end if;

  -- Mismo criterio que grant_pro: user_id del checkout si existe, si no el email.
  if p_user_id is not null and exists (select 1 from auth.users where id = p_user_id) then
    target := p_user_id;
  elsif nullif(trim(p_email), '') is not null then
    select id into target from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  end if;

  if target is not null then
    perform public.lock_lifetime_user(target);
    perform public.grant_pro(target, null);
  end if;

  insert into public.lifetime_grants (
    user_id, email, source, ls_order_id, ls_order_number, customer_name,
    amount_cents, currency, amount_usd_cents, test_mode
  ) values (
    target, lower(nullif(trim(p_email), '')), 'lemonsqueezy', p_order_id, p_order_number,
    nullif(trim(p_customer_name), ''), p_amount_cents, upper(p_currency), p_amount_usd_cents,
    coalesce(p_test_mode, false)
  );

  return jsonb_build_object('user_id', target, 'status', 'active', 'duplicate', false);
end;
$$;

revoke all on function public.record_lifetime_sale(text, uuid, text, bigint, text, integer, text, integer, boolean)
  from public, anon, authenticated;
grant execute on function public.record_lifetime_sale(text, uuid, text, bigint, text, integer, text, integer, boolean)
  to service_role;

-- Reemplaza la versión de 20261102000011 (cambia la firma: suma el email).
drop function if exists public.refund_lifetime_sale(text);

create or replace function public.refund_lifetime_sale(p_order_id text, p_email text default null)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('lifetime_sale:' || p_order_id, 0));

  -- También desde 'revoked': si el admin ya había quitado el acceso, la venta
  -- igual tiene que quedar como reembolsada.
  update public.lifetime_grants
     set status = 'refunded', ended_at = now()
   where ls_order_id = p_order_id and status in ('active', 'revoked')
  returning user_id into v_user;

  if not found then
    -- El reembolso llegó antes que la venta: queda registrado como
    -- reembolsado para que un order_created posterior no dé el acceso.
    insert into public.lifetime_grants (email, source, status, ls_order_id, ended_at)
      values (lower(nullif(trim(p_email), '')), 'lemonsqueezy', 'refunded', p_order_id, now())
      on conflict (ls_order_id) do nothing;
    return null;
  end if;

  if v_user is not null then
    -- Espera a otra venta o reembolso del mismo usuario: el chequeo de abajo
    -- ve lo que ya commitearon.
    perform public.lock_lifetime_user(v_user);
    if not exists (
      select 1 from public.lifetime_grants where user_id = v_user and status = 'active'
    ) then
      update public.profiles set pro = false, pro_since = null where user_id = v_user;
    end if;
  end if;

  return v_user;
end;
$$;

revoke all on function public.refund_lifetime_sale(text, text) from public, anon, authenticated;
grant execute on function public.refund_lifetime_sale(text, text) to service_role;
