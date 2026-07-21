# Registruti — Time Tracking & Invoicing

Aplicación de seguimiento de horas de consultoría y facturación por cliente, al estilo Toggl Track.

**App:** https://registruti.app/

## Funcionalidades

- **Tracker semanal**: registro de horas por día con duración de escritura libre ("1:30", "1.5", "90m"), en intervalos de 15 minutos (mínimo 0:15, máximo 8:00 por entrada), con descripción, cliente, marca de facturable y repetición de entradas con un click.
- **Clientes**: alta, edición, archivado y eliminación de clientes, cada uno con tarifa por hora, moneda y color propio.
- **Reportes**: horas y montos facturables por cliente y por día, con filtros por período (semana, mes, mes pasado o rango personalizado) y exportación a CSV.
- **Facturas**: generación de facturas por cliente y período a partir de las horas no facturadas, con estados (borrador → enviada → pagada), vencimiento opcional con marca de vencida, descarga de PDF con el detalle del trabajo y numeración automática.
- **Link público por factura**: cada factura tiene un link compartible (`/i/<token>`, con token de 128 bits regenerable si se filtra) para que el cliente vea el detalle de horas sin necesidad de cuenta — trazabilidad externa.
- **Por país**: el perfil guarda el país del emisor (Argentina, Uruguay, Chile, México, ... ) y con eso se adaptan el tipo de ID fiscal (CUIT, RUT, RFC, ...), la moneda sugerida y el formato de los montos.
- **Conexión MCP**: cada usuario puede generar un token en Ajustes y conectar Registruti a Claude Desktop (o cualquier cliente MCP con header de autorización) para cargar horas y consultar cómo va por lenguaje natural. Ver [Servidor MCP](#servidor-mcp) más abajo.
- **Planes (freemium + lifetime access)**: el plan gratis incluye hasta 3 clientes activos y 4 facturas; el *lifetime access* (un único pago vía LemonSqueezy) desbloquea todo de por vida. Los límites se aplican en la base con triggers (no solo en el frontend), así que no son salteables desde la consola. Ver [Planes y límites](#planes-y-límites) más abajo.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — autenticación y Postgres con Row Level Security
- Deploy en [Vercel](https://vercel.com/)

## Desarrollo local

```bash
npm install
npm run dev
```

La app usa por defecto las credenciales publicables del proyecto de Supabase `diamble-jamble`
(seguras de exponer: el acceso a los datos está protegido por RLS). Se pueden sobreescribir con:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Modelo de datos

| Tabla | Descripción |
| --- | --- |
| `clients` | Clientes con tarifa por hora, moneda y color |
| `time_entries` | Entradas de tiempo (15 min a 8 h, múltiplos de 15) vinculadas a cliente y opcionalmente a una factura |
| `invoices` | Facturas por período con totales, estado y token público de acceso |

Las tres tablas tienen RLS por `user_id`. La función `get_public_invoice(token)` (security definer)
expone una factura puntual en modo lectura a través de su token no adivinable.

## Servidor MCP

Registruti expone un servidor [MCP](https://modelcontextprotocol.io/) en `POST /api/mcp`
(transporte Streamable HTTP) para operar la app por lenguaje natural desde Claude Desktop
u otro cliente MCP. Es la **Fase 1**: autenticación por token personal (sin OAuth).

### Tools disponibles

| Tool | Qué hace |
| --- | --- |
| `list_clients` | Lista los clientes con tarifa, moneda y color |
| `log_time` | Registra una entrada de tiempo (cliente, fecha, duración libre, descripción, facturable) |
| `list_time_entries` | Consulta entradas por rango de fechas y cliente |
| `report_summary` | Resumen de horas y montos facturables por cliente y período |

Cada token resuelve un `user_id`; todas las tools quedan scopeadas a los datos de ese usuario.

### Cómo conectarlo

1. En **Ajustes → Conexión MCP**, generá un token (se muestra una sola vez).
2. Registralo en tu cliente MCP apuntando a `https://registruti.app/api/mcp` con el header
   `Authorization: Bearer <token>`. En Claude Code, por ejemplo:

   ```bash
   claude mcp add --transport http registruti https://registruti.app/api/mcp \
     --header "Authorization: Bearer reg_xxxxxxxx"
   ```

3. Pedile cosas como *"cargá 2 horas de hoy para Acme, reunión de kickoff"* o
   *"¿cuántas horas facturables llevo este mes?"*.

### Configuración

El endpoint usa la service role key de Supabase; hay que definir `SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY` como env vars en Vercel (ver [`supabase/README.md`](supabase/README.md))
y aplicar la migración `20260721000005_mcp_tokens.sql`.

> **Nota:** la app web/mobile de Claude.ai exige OAuth para conectar un MCP remoto; eso es la
> Fase 2. La Fase 1 cubre Claude Desktop, Claude Code y clientes similares que aceptan un token.

## Planes y límites

Registruti es **freemium con lifetime access** (pago único, sin suscripción):

| | Plan gratis | Lifetime access |
| --- | --- | --- |
| Clientes activos | hasta **3** | ilimitados |
| Facturas | hasta **4** | ilimitadas |
| Pago | — | único, para siempre |

Al topar cualquiera de los dos límites (lo que llegue primero) la UI abre un
paywall con el checkout. Los topes se aplican con **triggers en Postgres**
(`clients`, `invoices`), no solo en el frontend, así que no se pueden saltear
desde la consola del browser. El entitlement vive en `profiles.pro` y está
**blindado**: el usuario no puede escribirlo; solo la service role o el SQL
Editor lo activan.

### Cobro con LemonSqueezy

El flujo de pago usa [LemonSqueezy](https://www.lemonsqueezy.com/):

1. El botón "Desbloquear lifetime access" abre el checkout de LemonSqueezy con el
   `user_id` de Registruti en `custom_data` y el email precargados.
2. Al concretarse el pago, LemonSqueezy dispara el evento `order_created` al
   webhook `POST /api/webhooks/lemonsqueezy`.
3. El endpoint verifica la firma HMAC y llama a la RPC `grant_pro`, que marca
   `profiles.pro = true` del usuario (resuelto por `user_id`, o por email si no
   vino). El pago con otro email igual se matchea gracias al `user_id`.

El webhook solo activa el `pro` si la orden es del **variant del lifetime
access** (`1934751`), como defensa por si un evento ajeno llegara al endpoint.

**Config del webhook** (LemonSqueezy → Settings → Webhooks):

- **Callback URL:** `https://registruti.app/api/webhooks/lemonsqueezy`
- **Signing secret:** un valor que elegís vos; el mismo va en la env var de Vercel.
- **Eventos:** `order_created`.

**Env vars en Vercel:**

```
LEMONSQUEEZY_WEBHOOK_SECRET=...      # el signing secret del webhook (secreto) — REQUERIDA

# Opcionales (tienen default hardcodeado):
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=https://nicoproducto.lemonsqueezy.com/checkout/buy/...
LEMONSQUEEZY_VARIANT_ID=1934751     # variant del producto; 0 = no verificar
```

El checkout URL y el variant ya vienen con default en el código (son públicos),
así que solo hace falta setear `LEMONSQUEEZY_WEBHOOK_SECRET`. El webhook reusa
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (las mismas del MCP) para activar el
acceso. Ver [`supabase/README.md`](supabase/README.md) para la activación manual
y el detalle de la migración.
