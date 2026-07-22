-- Planes y límites del free tier (freemium con lifetime access).
--
-- Modelo: gratis hasta N clientes activos y M facturas; el flag `profiles.pro`
-- (lifetime access) desbloquea todo. El límite se aplica EN LA BASE — no solo en
-- el frontend — porque los inserts salen directo del browser vía RLS y un tope
-- que viviera solo en el cliente sería trivial de saltear desde la consola.
--
-- Requerida por: el paywall de Clientes/Facturas y la sección "Plan" de Ajustes.

-- 1) Entitlement del usuario. Vive en `profiles` por conveniencia, pero se
--    protege abajo para que el usuario no pueda auto-otorgárselo.
alter table public.profiles
  add column if not exists pro boolean not null default false;

alter table public.profiles
  add column if not exists pro_since timestamptz; -- cuándo se activó (traza)

-- 2) Límites del free tier. Centralizados acá para ajustarlos en un solo lugar.
create or replace function public.free_client_limit()
  returns int language sql immutable as $$ select 3 $$;

create or replace function public.free_invoice_limit()
  returns int language sql immutable as $$ select 4 $$;

-- Email(s) del/los dueño(s) del proyecto: siempre pro, pase lo que pase con la
-- fila de profiles. Centralizado acá para agregar/quitar en un solo lugar.
create or replace function public.owner_emails()
  returns text[] language sql immutable as $$ select array['nicolassespindola@gmail.com'] $$;

-- ¿El usuario tiene lifetime access? Es pro si es owner (por email, garantía que
-- sobrevive a un reset del perfil) o si su perfil tiene pro = true. Falta de
-- perfil y no-owner = free.
create or replace function public.user_is_pro(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(
    (select true
       from auth.users
       where id = uid and lower(email) = any (select lower(e) from unnest(public.owner_emails()) e)),
    (select pro from public.profiles where user_id = uid),
    false
  );
$$;

-- 3) Blindaje del entitlement: el usuario (rol authenticated/anon vía PostgREST)
--    NUNCA puede escribir `pro`/`pro_since`. Solo la service role (webhook de
--    pago / admin) o el acceso directo a la base (SQL Editor) pueden activarlo.
--    Sin esto, el upsert de perfil de Ajustes permitiría a cualquiera mandarse
--    `pro: true` y saltear el cobro.
--
--    El rol se lee directo del JWT que setea PostgREST (no dependemos del helper
--    auth.role(): si no existiera, romperíamos el guardado de perfil de todos).
--    Desde el SQL Editor / conexión directa no hay JWT → rol nulo → se permite.
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
  if jwt_role in ('authenticated', 'anon') then
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

drop trigger if exists profiles_protect_pro on public.profiles;
create trigger profiles_protect_pro
  before insert or update on public.profiles
  for each row execute function public.protect_pro_columns();

-- 4) Límite de clientes ACTIVOS (no archivados). Archivar libera un cupo.
create or replace function public.enforce_client_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_count int;
begin
  if public.user_is_pro(new.user_id) then
    return new;
  end if;
  select count(*) into active_count
    from public.clients
    where user_id = new.user_id and archived = false;
  if active_count >= public.free_client_limit() then
    raise exception
      'plan_limit_clients: llegaste al máximo de % clientes del plan gratis. Desbloqueá con lifetime access.',
      public.free_client_limit()
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists clients_enforce_limit on public.clients;
create trigger clients_enforce_limit
  before insert on public.clients
  for each row execute function public.enforce_client_limit();

-- 5) Límite de facturas (total de por vida en el plan gratis).
create or replace function public.enforce_invoice_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_count int;
begin
  if public.user_is_pro(new.user_id) then
    return new;
  end if;
  select count(*) into invoice_count
    from public.invoices
    where user_id = new.user_id;
  if invoice_count >= public.free_invoice_limit() then
    raise exception
      'plan_limit_invoices: llegaste al máximo de % facturas del plan gratis. Desbloqueá con lifetime access.',
      public.free_invoice_limit()
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_enforce_limit on public.invoices;
create trigger invoices_enforce_limit
  before insert on public.invoices
  for each row execute function public.enforce_invoice_limit();

-- 6) Activación del lifetime access desde el webhook de pago (LemonSqueezy).
--    Resuelve el usuario por user_id (preferido: lo mandamos en custom_data del
--    checkout) o, si no, por email. Devuelve el user_id activado o null si no se
--    encontró. Es security definer para poder leer auth.users y escribir `pro`
--    (el trigger de blindaje deja pasar porque la request viene con rol
--    service_role, no authenticated/anon).
create or replace function public.grant_pro(p_user_id uuid, p_email text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target uuid;
begin
  if p_user_id is not null and exists (select 1 from auth.users where id = p_user_id) then
    target := p_user_id;
  elsif p_email is not null and length(trim(p_email)) > 0 then
    select id into target from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  end if;

  if target is null then
    return null;
  end if;

  insert into public.profiles (user_id, pro, pro_since)
    values (target, true, now())
  on conflict (user_id)
    do update set pro = true, pro_since = coalesce(public.profiles.pro_since, now());
  return target;
end;
$$;

-- CRÍTICO: sin esto, cualquier usuario logueado podría llamar grant_pro y
-- auto-activarse. Solo la service role (webhook) puede ejecutarla.
revoke all on function public.grant_pro(uuid, text) from public, anon, authenticated;
grant execute on function public.grant_pro(uuid, text) to service_role;

-- Pro efectivo del usuario actual, para la UI. Usa la MISMA lógica que el
-- enforcement (incluye el check de owner por email), así el frontend nunca
-- muestra el paywall a quien la base considera pro. No expone el email de nadie:
-- solo devuelve un booleano del usuario logueado.
create or replace function public.is_pro_self()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_is_pro(auth.uid());
$$;

grant execute on function public.is_pro_self() to authenticated;

-- Activación manual alternativa (SQL Editor), por si hace falta hacerlo a mano:
--   select public.grant_pro(null, 'cliente@mail.com');

-- 7) Seed: el/los owner(s) arrancan con lifetime access, para que la UI también
--    lo refleje (además del check por email en user_is_pro, que es la garantía
--    de fondo). Idempotente; no-op si el usuario todavía no existe en auth.users.
do $$
declare
  e text;
begin
  foreach e in array public.owner_emails() loop
    perform public.grant_pro(null, e);
  end loop;
end $$;
