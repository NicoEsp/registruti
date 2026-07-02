-- Numeración de facturas confiable y libre de colisiones.
-- Antes el número salía de contar las facturas en el cliente (INV-000N), lo que
-- podía duplicarse al borrar una factura o al crear dos casi simultáneas.
-- Ahora un contador atómico por usuario garantiza números correlativos únicos.

create table if not exists public.invoice_counters (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_number integer not null default 0
);

alter table public.invoice_counters enable row level security;

-- Lectura opcional del propio contador (la RPC igual corre como security definer).
drop policy if exists "invoice_counters_own_select" on public.invoice_counters;
create policy "invoice_counters_own_select" on public.invoice_counters
  for select
  using (auth.uid() = user_id);

-- Sembrar el contador con el máximo número existente por usuario, para no pisar
-- las facturas ya creadas (INV-0001, INV-0002, ...).
insert into public.invoice_counters (user_id, last_number)
select
  user_id,
  coalesce(max(nullif(regexp_replace(invoice_number, '\D', '', 'g'), '')::int), 0)
from public.invoices
group by user_id
on conflict (user_id) do update
  set last_number = greatest(public.invoice_counters.last_number, excluded.last_number);

-- Devuelve el próximo número formateado de forma atómica.
create or replace function public.next_invoice_number(p_prefix text default 'INV-')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num integer;
begin
  insert into public.invoice_counters (user_id, last_number)
  values (auth.uid(), 1)
  on conflict (user_id) do update
    set last_number = public.invoice_counters.last_number + 1
  returning last_number into v_num;

  return p_prefix || lpad(v_num::text, 4, '0');
end;
$$;

grant execute on function public.next_invoice_number(text) to authenticated;
