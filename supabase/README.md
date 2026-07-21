# Base de datos (Supabase)

El esquema de la app vive en `supabase/migrations/`. Hasta ahora las tablas se
crearon manualmente en el proyecto remoto y no estaban versionadas; a partir de
acá, todo cambio de base debería agregarse como una nueva migración.

## Cómo aplicar las migraciones

Estas migraciones son **aditivas** (no tocan datos ni columnas existentes).

**Opción A — SQL Editor (rápido):** abrí el proyecto en Supabase → *SQL Editor*
y pegá/ejecutá el contenido de cada archivo de `migrations/` en orden.

**Opción B — Supabase CLI (recomendado a futuro):**

```bash
supabase link --project-ref <TU_PROJECT_REF>
supabase db push
```

### Migraciones actuales

1. `20260702000001_profiles.sql` — tabla `profiles` (datos del emisor para las
   facturas) con RLS por usuario.
2. `20260702000002_invoice_numbering.sql` — contador atómico por usuario y la
   función `next_invoice_number()` para numeración correlativa sin colisiones.
   Siembra el contador con el máximo número ya existente por usuario.
3. `20260717000003_public_invoice_hardening.sql` — endurece el link público:
   `share_token` con default versionado de 128 bits (`generate_share_token()`),
   RPC `get_public_invoice` versionada (security definer con `search_path`
   fijo) y `regenerate_share_token()` para rotar un link filtrado. **Requerida**
   por el botón "Regenerar link" del detalle de factura.
4. `20260717000004_profile_country.sql` — columna `profiles.country` (país del
   emisor) que define etiqueta/formato del ID fiscal, moneda sugerida y locale
   de montos. **Requerida** por el selector de país de Ajustes/Onboarding.

## Auditar RLS

Row Level Security debe estar **activo** en todas las tablas con datos de
usuario. Verificalo corriendo esto en el SQL Editor:

```sql
select
  t.tablename,
  t.rowsecurity as rls_activo,
  count(p.policyname) as cant_policies
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname and p.tablename = t.tablename
where t.schemaname = 'public'
group by t.tablename, t.rowsecurity
order by t.tablename;
```

Toda tabla con datos de usuario (`clients`, `time_entries`, `invoices`,
`profiles`, `invoice_counters`) debe mostrar `rls_activo = true` y al menos una
policy. Si alguna aparece en `false`, hay una fuga de datos entre usuarios y hay
que activar RLS y agregar policies antes de salir a producción.
