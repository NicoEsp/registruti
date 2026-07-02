-- Datos del emisor (freelancer/negocio) que se muestran en las facturas.
-- Una fila por usuario. Protegida por RLS: cada usuario ve y edita solo la suya.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  business_name text,
  tax_id text,          -- CUIT / CUIL / identificación fiscal
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_own_all" on public.profiles;
create policy "profiles_own_all" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Mantener updated_at al día.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
