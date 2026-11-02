-- Back office (/admin): solo para el admin. Ver usuarios y ventas, y dar o
-- quitar el lifetime access a mano.
--
-- Toda la seguridad vive acá, no en el frontend: cada RPC admin_* empieza
-- verificando is_admin() (el email del usuario logueado, confirmado, tiene que
-- estar en admin_emails()), y la tabla de ventas solo tiene policy de lectura
-- para el admin.
--
-- Requerida por: /admin y el registro de ventas del webhook de LemonSqueezy.

-- 1) Quién es admin. Separado de owner_emails() (owner = siempre pro) para
--    que sumar un owner no le dé acceso al back office, ni al revés.
create or replace function public.admin_emails()
  returns text[] language sql immutable as $$ select array['nicolassespindola@gmail.com'] $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
      from auth.users u
     where u.id = auth.uid()
       and u.email_confirmed_at is not null
       and lower(u.email) = any (select lower(e) from unnest(public.admin_emails()) e)
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2) Accesos lifetime: una fila por venta de LemonSqueezy o por acceso dado a
--    mano. `user_id` nulo = pendiente: el email todavía no tiene cuenta y el
--    acceso se activa cuando la cree (trigger de abajo).
create table if not exists public.lifetime_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  source text not null check (source in ('lemonsqueezy', 'manual')),
  status text not null default 'active' check (status in ('active', 'refunded', 'revoked')),
  -- Datos de la orden (solo source = 'lemonsqueezy').
  ls_order_id text unique,
  ls_order_number bigint,
  customer_name text,
  amount_cents integer,      -- total de la orden en su moneda, en centavos
  currency text,
  amount_usd_cents integer,  -- total_usd: para sumar ventas en distintas monedas
  test_mode boolean not null default false,
  -- Acceso manual: nota interna y quién lo dio.
  note text,
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  ended_at timestamptz       -- cuándo se reembolsó o se revocó
);

create index if not exists lifetime_grants_user_id_idx on public.lifetime_grants (user_id);
create index if not exists lifetime_grants_pending_email_idx
  on public.lifetime_grants (lower(email))
  where user_id is null and status = 'active';

alter table public.lifetime_grants enable row level security;

-- Solo el admin lee. Nadie escribe por PostgREST: las altas y bajas pasan por
-- las RPC de abajo (security definer) o por la service role (webhook).
drop policy if exists "lifetime_grants_admin_select" on public.lifetime_grants;
create policy "lifetime_grants_admin_select" on public.lifetime_grants
  for select
  to authenticated
  using (public.is_admin());

revoke all on public.lifetime_grants from anon;

-- 3) Blindaje de `pro`: igual que en 20260721000006_pricing_limits.sql, más
--    una excepción para el admin. Sin ella, las RPC admin_* (que corren con el
--    JWT del admin, rol authenticated) no podrían activar ni quitar el acceso.
create or replace function public.protect_pro_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  );
begin
  if jwt_role in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.pro := false;
      new.pro_since := null;
    elsif tg_op = 'UPDATE' then
      new.pro := old.pro;
      new.pro_since := old.pro_since;
    end if;
  end if;
  return new;
end;
$$;

-- 4) Usuarios para el back office, con plan y uso de la app.
create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  plan text,              -- 'owner' | 'lifetime' | 'free'
  pro_since timestamptz,
  grant_source text,      -- origen del acceso vigente: 'lemonsqueezy' | 'manual' | null
  clients integer,
  entries integer,
  minutes integer,
  invoices integer,
  last_entry_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;

  return query
  with
    c as (select c.user_id, count(*)::int as n from public.clients c group by c.user_id),
    t as (
      select t.user_id, count(*)::int as n, coalesce(sum(t.duration_minutes), 0)::int as mins,
             max(t.created_at) as last_at
        from public.time_entries t
       group by t.user_id
    ),
    i as (select i.user_id, count(*)::int as n from public.invoices i group by i.user_id)
  select
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    case
      when lower(u.email) = any (select lower(e) from unnest(public.owner_emails()) e) then 'owner'
      when coalesce(p.pro, false) then 'lifetime'
      else 'free'
    end,
    p.pro_since,
    g.source,
    coalesce(c.n, 0),
    coalesce(t.n, 0),
    coalesce(t.mins, 0),
    coalesce(i.n, 0),
    t.last_at
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  left join c on c.user_id = u.id
  left join t on t.user_id = u.id
  left join i on i.user_id = u.id
  left join lateral (
    select lg.source
      from public.lifetime_grants lg
     where lg.user_id = u.id and lg.status = 'active'
     order by lg.created_at desc
     limit 1
  ) g on true;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- 5) Dar lifetime access a mano. Si el email ya tiene cuenta, se activa en el
--    momento; si no, queda pendiente y se activa cuando la cree.
create or replace function public.admin_grant_lifetime(p_email text, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  target uuid;
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'admin_invalid_email' using errcode = 'P0001';
  end if;

  select id into target from auth.users where lower(email) = v_email limit 1;

  if target is not null then
    if public.user_is_pro(target) then
      raise exception 'admin_already_pro' using errcode = 'P0001';
    end if;
    perform public.grant_pro(target, null);
  elsif exists (
    select 1 from public.lifetime_grants
     where user_id is null and status = 'active' and lower(email) = v_email
  ) then
    raise exception 'admin_already_pending' using errcode = 'P0001';
  end if;

  insert into public.lifetime_grants (user_id, email, source, note, granted_by)
    values (target, v_email, 'manual', v_note, auth.uid());

  return jsonb_build_object('user_id', target, 'pending', target is null);
end;
$$;

revoke all on function public.admin_grant_lifetime(text, text) from public, anon;
grant execute on function public.admin_grant_lifetime(text, text) to authenticated;

-- 6) Quitar el lifetime access de un usuario (acceso manual equivocado,
--    contracargo...). Marca revocados sus accesos vigentes. El owner no se
--    puede quitar: user_is_pro lo reconoce por email pase lo que pase.
create or replace function public.admin_revoke_lifetime(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;
  if exists (
    select 1 from auth.users
     where id = p_user_id
       and lower(email) = any (select lower(e) from unnest(public.owner_emails()) e)
  ) then
    raise exception 'admin_owner_always_pro' using errcode = 'P0001';
  end if;

  update public.lifetime_grants
     set status = 'revoked', ended_at = now()
   where user_id = p_user_id and status = 'active';

  update public.profiles
     set pro = false, pro_since = null
   where user_id = p_user_id;
end;
$$;

revoke all on function public.admin_revoke_lifetime(uuid) from public, anon;
grant execute on function public.admin_revoke_lifetime(uuid) to authenticated;

-- 7) Cancelar un acceso pendiente (email que todavía no tiene cuenta).
create or replace function public.admin_cancel_pending_grant(p_grant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;

  update public.lifetime_grants
     set status = 'revoked', ended_at = now()
   where id = p_grant_id and user_id is null and status = 'active';

  if not found then
    raise exception 'admin_grant_not_pending' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.admin_cancel_pending_grant(uuid) from public, anon;
grant execute on function public.admin_cancel_pending_grant(uuid) to authenticated;

-- 8) Reembolso de LemonSqueezy (order_refunded): la venta queda reembolsada y
--    el usuario pierde el acceso, salvo que tenga otro vigente o sea owner.
--    Solo la service role (webhook).
create or replace function public.refund_lifetime_sale(p_order_id text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid;
begin
  update public.lifetime_grants
     set status = 'refunded', ended_at = now()
   where ls_order_id = p_order_id and status = 'active'
  returning user_id into v_user;

  if v_user is not null
     and not exists (
       select 1 from public.lifetime_grants where user_id = v_user and status = 'active'
     )
  then
    update public.profiles set pro = false, pro_since = null where user_id = v_user;
  end if;

  return v_user;
end;
$$;

revoke all on function public.refund_lifetime_sale(text) from public, anon, authenticated;
grant execute on function public.refund_lifetime_sale(text) to service_role;

-- 9) Accesos pendientes: cuando una cuenta confirma su email, recibe los
--    accesos que esperaban ese email (dados a mano o pagos con un email que no
--    tenía cuenta). Solo con email confirmado, para que nadie se registre con
--    un email ajeno y se quede con el acceso. Un error acá nunca frena el alta.
create or replace function public.apply_pending_lifetime()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.email is null or new.email_confirmed_at is null then
    return new;
  end if;
  begin
    update public.lifetime_grants
       set user_id = new.id
     where user_id is null and status = 'active' and lower(email) = lower(new.email);
    if found then
      perform public.grant_pro(new.id, null);
    end if;
  exception when others then
    raise warning 'apply_pending_lifetime: %', sqlerrm;
  end;
  return new;
end;
$$;

revoke all on function public.apply_pending_lifetime() from public, anon, authenticated;

drop trigger if exists on_auth_user_lifetime on auth.users;
create trigger on_auth_user_lifetime
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.apply_pending_lifetime();

-- 10) Los pro que ya existían (activados por el webhook o por SQL antes de
--     esta tabla) quedan registrados como accesos manuales, para que el back
--     office los muestre con origen. El owner no: es pro por email.
insert into public.lifetime_grants (user_id, email, source, note, created_at)
select p.user_id, lower(u.email), 'manual', 'Activado antes del back office', coalesce(p.pro_since, now())
  from public.profiles p
  join auth.users u on u.id = p.user_id
 where p.pro
   and not (lower(u.email) = any (select lower(e) from unnest(public.owner_emails()) e))
   and not exists (select 1 from public.lifetime_grants g where g.user_id = p.user_id);
