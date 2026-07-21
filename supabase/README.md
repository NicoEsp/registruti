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
   fija el default versionado de `share_token` (columna `uuid`,
   `gen_random_uuid()`, ~122 bits, no adivinable), versiona la RPC
   `get_public_invoice` (security definer con `search_path` fijo) y agrega
   `regenerate_share_token()` para rotar un link filtrado. **Requerida** por el
   botón "Regenerar link" del detalle de factura.
4. `20260717000004_profile_country.sql` — columna `profiles.country` (país del
   emisor) que define etiqueta/formato del ID fiscal, moneda sugerida y locale
   de montos. **Requerida** por el selector de país de Ajustes/Onboarding.
5. `20260721000005_mcp_tokens.sql` — tabla `mcp_tokens` (tokens de acceso al
   servidor MCP, guardados como hash SHA-256) con RLS por usuario. **Requerida**
   por la sección "Conexión MCP" de Ajustes y por el endpoint `/api/mcp`.
6. `20260721000006_pricing_limits.sql` — planes y límites del free tier
   (freemium con lifetime access). Agrega `profiles.pro` / `profiles.pro_since`,
   los blinda para que el usuario no pueda auto-otorgárselos (trigger
   `protect_pro_columns`) y aplica los topes del plan gratis con triggers en
   `clients` (máx. **3** clientes activos) e `invoices` (máx. **4** facturas).
   Incluye la RPC `grant_pro(user_id, email)` (security definer, solo ejecutable
   por la service role) que usa el webhook de pago para activar el acceso.
   **Requerida** por el paywall de Clientes/Facturas y la sección "Plan" de
   Ajustes.

### Activar el lifetime access de un usuario

El flag `pro` solo se puede setear desde la **service role** (webhook de pago) o
el **SQL Editor** — el usuario no puede escribirlo. Lo normal es que lo haga el
webhook de LemonSqueezy; a mano, desde el SQL Editor:

```sql
select public.grant_pro(null, 'cliente@mail.com');
```

`grant_pro` resuelve el usuario por `user_id` (preferido, lo manda el checkout en
`custom_data`) o por email, e inserta/actualiza el perfil de forma idempotente.

**Owner siempre pro:** los emails de `owner_emails()` son pro de forma
incondicional — `user_is_pro` los reconoce por email leyendo `auth.users`, así
que la garantía sobrevive incluso a un reset de su fila en `profiles`. Para
sumar/quitar owners, editá esa función. La UI lo consulta vía la RPC
`is_pro_self()` (misma lógica que el enforcement), así que nunca ve el paywall.

## Servidor MCP (`/api/mcp`)

El endpoint MCP corre con la **service role key** (bypassa RLS), así que necesita
env vars propias en Vercel además de las publicables:

```env
SUPABASE_URL=...                 # URL del proyecto (misma que NEXT_PUBLIC_SUPABASE_URL)
SUPABASE_SERVICE_ROLE_KEY=...    # Settings → API → service_role (secreta)
```

Ninguna tiene fallback: si falta alguna, el endpoint responde 500 en vez de
adivinar. La URL se pide explícita a propósito — aparear la service role key con
la URL equivocada leería/escribiría en el proyecto que no es. Toda query del
servidor MCP filtra además por `user_id` (resuelto a partir del hash del token),
porque la service role no aplica RLS por sí sola.

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
`profiles`, `invoice_counters`, `mcp_tokens`) debe mostrar `rls_activo = true` y
al menos una policy. Si alguna aparece en `false`, hay una fuga de datos entre usuarios y hay
que activar RLS y agregar policies antes de salir a producción.
