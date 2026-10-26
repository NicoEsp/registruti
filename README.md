# Registruti — Time Tracking & Invoicing

Aplicación de seguimiento de horas de consultoría y facturación por cliente, al estilo Toggl Track.

**App:** https://registruti.app/

## Funcionalidades

- **Tracker semanal**: registro de horas por día con duración de escritura libre ("1:30", "1.5", "90m"), en intervalos de 15 minutos (mínimo 0:15, máximo 8:00 por entrada), con descripción, cliente, marca de facturable y repetición de entradas con un click. El cliente se puede crear desde el mismo formulario (y desde el registro rápido): la primera hora no espera a que exista.
- **Onboarding**: el wizard de bienvenida pide una sola cosa, la primera entrada de tiempo (crea el cliente de paso, con tarifa opcional). Los datos del emisor se piden recién al armar el primer invoice.
- **Clientes**: alta, edición, archivado y eliminación de clientes, cada uno con tarifa por hora, moneda y color propio.
- **Reportes**: horas y montos facturables por cliente y por día, con filtros por período (semana, mes, mes pasado o rango personalizado) y exportación a CSV.
- **Invoices**: generación de invoices por cliente y período a partir de las horas no facturadas, con estados (borrador → enviado → pagado), vencimiento opcional con marca de vencido, descarga de PDF con el detalle del trabajo, los datos de pago del emisor (alias/CBU, PayPal, Wise…) y numeración automática. En el producto el documento se llama **invoice**, no factura: es un documento comercial, no un comprobante fiscal (ARCA/DGI/SII), y lo dice en el pie. "Facturar", "facturable" y "facturación" siguen siendo los verbos; la landing conserva "facturación" en títulos y FAQ por SEO. Hay un invoice de ejemplo en `/invoice-de-ejemplo` y en la vista vacía de Invoices.
- **Link público por invoice**: cada invoice tiene un link compartible (`/i/<token>`, con token de 128 bits regenerable si se filtra) para que el cliente vea el detalle de horas sin necesidad de cuenta — trazabilidad externa.
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
| `invoices` | Invoices por período con totales, estado y token público de acceso |

Las tres tablas tienen RLS por `user_id`. La función `get_public_invoice(token)` (security definer)
expone un invoice puntual en modo lectura a través de su token no adivinable.

## Servidor MCP

Registruti expone un servidor [MCP](https://modelcontextprotocol.io/) en `POST /api/mcp`
(transporte Streamable HTTP) para operar la app por lenguaje natural desde Claude (web,
escritorio y celular), Claude Code, Cursor u otro cliente MCP. La conexión es de un clic: el
servidor es a la vez un **authorization server OAuth 2.1**, así que el cliente descubre solo
cómo autorizarse, manda al usuario a `/oauth/authorize`, y el usuario aprueba con su sesión de
Registruti. Sin instalar nada ni copiar tokens. Para clientes sin OAuth sigue existiendo el
token personal de Ajustes.

### Tools disponibles

| Tool | Scope | Qué hace |
| --- | --- | --- |
| `list_clients` | `read` | Lista los clientes con tarifa, moneda y color |
| `create_client` | `write` | Crea un cliente (nombre; tarifa, moneda, contacto y email opcionales). Rechaza nombres repetidos y avisa si se topó el límite del plan gratis |
| `log_time` | `write` | Registra una entrada de tiempo (cliente, fecha, duración libre, descripción, facturable) |
| `update_time_entry` | `write` | Edita una entrada por su id (cliente, duración, fecha, descripción, facturable). Las ya facturadas no se tocan |
| `list_time_entries` | `read` | Consulta entradas por rango de fechas y cliente, con su id y si ya fueron facturadas |
| `report_summary` | `read` | Resumen de horas y montos facturables por cliente y período, con lo que falta facturar |
| `list_invoices` | `read` | Lista las facturas con número, cliente, período, estado (incluido vencido), total y link público |

Cada token resuelve un `user_id` y un conjunto de scopes; todas las tools quedan scopeadas a
los datos de ese usuario. "Hoy" y los rangos por defecto se calculan en la zona horaria del país
del perfil (`countries.ts`), no en UTC. El `initialize` devuelve `instructions` con la fecha y la
zona del usuario para que el modelo resuelva "ayer" o "este mes" sin adivinar.

### Cómo conectarlo

- **Claude (web, escritorio, celular):** Ajustes → Conectores → Agregar conector personalizado,
  con la URL `https://registruti.app/api/mcp`. Al tocar *Conectar* se abre la pantalla de
  autorización de Registruti.
- **Claude Code:** `claude mcp add --transport http --scope user registruti https://registruti.app/api/mcp`
  y después `/mcp` → *Authenticate*.
- **Cursor y otros clientes con OAuth:** servidor MCP remoto apuntando a la misma URL.
- **Clientes sin OAuth** (archivo de configuración de Claude Desktop vía `mcp-remote`, scripts):
  token personal de Ajustes en el header `Authorization: Bearer reg_…`.

La guía para usuarios está en [`/blog/mcp`](https://registruti.app/blog/mcp).

> **Tiene que ser el apex, sin `www`.** `www.registruti.app` redirige a `registruti.app` y ese
> salto es cross-origin: `fetch` (el que usan todos los clientes MCP) borra el header
> `Authorization` al seguir el redirect, la request llega sin token y el server contesta 401.
> Por eso todo el metadata OAuth se arma desde `MCP_BASE_URL`/`SITE_URL` y no desde el host de
> la request.

### Cómo funciona el OAuth (Fase 2)

Implementado a mano en `src/lib/mcp/oauth.ts`, sin dependencias nuevas, siguiendo la
[spec de autorización de MCP](https://modelcontextprotocol.io/specification/latest/basic/authorization):

| Pieza | Ruta |
| --- | --- |
| Protected resource metadata (RFC 9728) | `/.well-known/oauth-protected-resource` y `/.well-known/oauth-protected-resource/api/mcp` |
| Authorization server metadata (RFC 8414) | `/.well-known/oauth-authorization-server` |
| Registro dinámico de clientes (RFC 7591) | `POST /api/oauth/register` |
| Pantalla de autorización (consentimiento) | `GET /oauth/authorize` + `POST /api/oauth/authorize` |
| Token endpoint (`authorization_code` + PKCE, `refresh_token`) | `POST /api/oauth/token` |
| Revocación (RFC 7009) | `POST /api/oauth/revoke` |

- El 401 de `/api/mcp` lleva `WWW-Authenticate: Bearer resource_metadata="…", scope="read write"`,
  que es lo que dispara el flujo en el cliente.
- Clientes: registro dinámico (públicos o con `client_secret`) o **Client ID Metadata Document**
  (el `client_id` es una URL https con el metadata; se lee en el momento, sin registro).
  `redirect_uri` solo https, loopback http (puerto libre, RFC 8252) o esquemas de apps nativas.
- PKCE S256 obligatorio; `resource` (RFC 8707) validado contra el endpoint.
- La sesión de Registruti vive en el browser (supabase-js), así que la pantalla de autorización
  valida el pedido contra `/api/oauth/authorize` y aprueba con el JWT del usuario, que el server
  verifica con Supabase Auth antes de emitir el code (de un solo uso, 10 minutos).
- Access tokens de 1 hora (filas de `mcp_tokens` con `expires_at` y `grant_id`) y refresh tokens
  de 60 días que rotan en cada uso, con 60 segundos de gracia para dos refresh concurrentes.
  Reusar un code revoca lo que salió de él.
- Cada autorización es una fila de `oauth_grants`, que el usuario ve y revoca en Ajustes →
  *Apps conectadas*; borrarla borra en cascada sus tokens. Todo secreto se guarda como SHA-256.
  Reusar un refresh token ya rotado (fuera de la gracia) también revoca la autorización entera.
- El registro dinámico es anónimo y escribe en la base, así que está limitado por IP (20/hora)
  y en total (500/hora). El conteo y el insert los hace la función `oauth_register_client()`
  serializada con un advisory lock, así que el tope no se pasa con requests concurrentes; la IP
  se guarda solo como HMAC con clave del server. Los clientes que nunca completan una
  autorización se borran a los 7 días. Los Client ID Metadata Documents se leen con `src/lib/mcp/safeFetch.ts`, que valida la
  dirección resuelta en el propio socket (nada de loopback, privadas ni link-local) y no sigue
  redirects. La limpieza de codes y tokens vencidos corre cada hora por `pg_cron`
  (`mcp_oauth_cleanup()`), además de la limpieza oportunista de los endpoints.
- Si el login hace falta en el medio, `/auth/callback` vuelve a la pantalla de autorización
  (`src/lib/postLogin.ts`) en vez de al tracker.

### Configuración

El endpoint usa la service role key de Supabase; hay que definir `SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY` como env vars en Vercel (ver [`supabase/README.md`](supabase/README.md))
y aplicar las migraciones `20260721000005_mcp_tokens.sql`, `20260903000007_mcp_oauth.sql`,
`20260903000008_mcp_oauth_hardening.sql` y `20260903000009_oauth_register_atomic.sql`.

Opcionales:

- `OAUTH_IP_HASH_SALT`: clave del HMAC con el que se guarda la IP que registra un cliente MCP
  (rate limit del registro dinámico). Si no está, se usa la service role key. Cambiarla solo
  reinicia los conteos de la última hora.
- `MCP_BASE_URL`: URL pública bajo la que se anuncian el servidor y sus endpoints OAuth
  (default `SITE_URL`). Sirve para probar el flujo completo en un preview de Vercel.
- `MCP_ALLOW_INSECURE_CLIENT_METADATA=1`: acepta Client ID Metadata Documents por http. Solo
  para la prueba local; se ignora si `VERCEL_ENV=production`.

### Prueba end-to-end

```bash
npm run test:mcp            # compila si hace falta, levanta un Supabase de mentira y next start
npm run test:mcp -- --build # fuerza recompilar
```

`scripts/mcp-e2e/run.mjs` recorre con el SDK oficial de MCP el mismo camino que hace Claude
(401 → descubrimiento → registro → autorización → canje → tools → refresh → revocación) y cubre a
mano los casos de borde (consentimiento denegado, redirect_uri ajena, reuso de code, PKCE
incorrecto, clientes confidenciales, scope de solo lectura, CIMD, token personal). Es lo que hay
que correr antes de tocar cualquier cosa del MCP.

## SEO

La captación orgánica apunta a búsquedas de "alternativa a Toggl Track", "time tracker
gratis/en español", "control de horas" y, desde octubre de 2026 (auditoría SEO y AEO de
Circe), a herramientas: "calculadora de horas trabajadas" es la búsqueda con más volumen
de todo el sitio y Google ahí premia herramientas, no guías. Estructura:

- **`/alternativa-toggl-track`** — página de comparación dedicada (la "money page"):
  tabla completa, precios 2026, guía de migración y FAQ con schema propio.
  `/alternativa-clockify` y `/alternativa-harvest` comparten layout
  (`AlternativePage`) pero no contenido, y cada una tiene su propio H2 de veredicto.
- **`/cuanto-cobrar-por-hora`** — calculadora de tarifa: la página con más impresiones
  orgánicas del sitio ("cuánto cobrar por hora" y sus variantes por especialidad y por
  país). Su artículo satélite es `/blog/cobrar-por-hora-o-por-proyecto`; se linkean entre
  sí, todas las páginas de marketing la enlazan (header, footer, landing, índice del blog)
  y el CTA del resultado pasa la tarifa al onboarding (`src/lib/calculatedRate.ts`).
- **`/calculadora-de-horas-trabajadas`** — calculadora de horas: entrada, salida y
  descanso por día, total semanal en hh:mm y decimal, redondeo opcional a 15 minutos y
  monto según tarifa (`HoursCalculator`). Las monedas y el formato de dinero de las dos
  calculadoras viven en `src/lib/calculatorCurrencies.ts`.
- **`/time-tracker-gratis`** — landing para la búsqueda genérica "time tracker" (sobre
  todo México): qué incluye el plan gratis y comparación de planes gratis.
- **`/blog`** — artículos registrados en `src/lib/blog.ts` (metadata) con cuerpo en
  `src/components/blog/*` y mapeo por slug en `src/app/blog/[slug]/page.tsx`.
  Feed RSS en `/blog/feed.xml`. Cada post declara sus `related` (los tres posts del
  "Seguí leyendo", elegidos por tema), opcionalmente `faqs` (acordeón al pie + `FAQPage`
  en el JSON-LD) y `metaTitle` (el `<title>` exacto, sin la plantilla "| Registruti",
  para los que con marca pasan los 60 caracteres).
- **Planilla de control de horas** — `public/plantillas/control-de-horas-trabajadas.xlsx`,
  la descarga de `/blog/control-de-horas-trabajadas`. La genera
  `scripts/plantillas/control-de-horas.py` (openpyxl): no se edita a mano, se cambia el
  script y se vuelve a correr. El ejemplo cargado es la misma semana que cuenta el post.
- **Structured data** — JSON-LD por página: `Organization` + `WebSite` +
  `SoftwareApplication` + `FAQPage` en la landing; `BlogPosting` + `BreadcrumbList`
  (+ `FAQPage` si el post tiene `faqs`) en los posts; `Blog` en el índice; `WebPage` +
  `FAQPage` + `BreadcrumbList` en las comparaciones y landings; `WebPage` +
  `WebApplication` + `BreadcrumbList` + `FAQPage` en las calculadoras. El autor es un
  nodo `Person` (`authorPersonJsonLd()` en `src/lib/site.ts`) con el `@id`
  `https://nicoproducto.work/#person`, referenciado como `founder` de la Organization,
  `creator` de la SoftwareApplication y `author` de cada BlogPosting. **Ese `@id`, el
  nombre y el sitio tienen que ser los mismos en nicoproducto.work y productprepa.com**:
  es lo que le dice a Google y a las IAs que los tres sitios son de la misma persona.
  En el badge del footer ("Un producto por NicoProducto", con X y LinkedIn) el nombre
  enlaza a nicoproducto.work.
- **Indexación** — `robots.ts` + headers `X-Robots-Tag: noindex` (vercel.json) para
  las rutas privadas (`/tracker`, `/clients`, `/reports`, `/invoices`, `/settings`,
  `/auth`, `/api`, `/i`); `/login` lleva `noindex` por metadata (es una pantalla de
  auth sin contenido); `sitemap.xml` generado desde `src/app/sitemap.ts`;
  `public/llms.txt` para asistentes de IA.
- **Dominio** — la versión canónica es `https://registruti.app`, sin `www`. La
  redirección de `www` la decide el panel de Vercel (Settings → Domains), no el código
  (ver la nota en `next.config.ts`): tiene que ser **308** (permanente) y en un solo
  salto desde `http://www`, no 307. Con 307 Google sigue guardando las URLs con www y
  reparte entre las dos versiones los clics y la autoridad de una misma página.
- **Search Console** — para verificar la propiedad por meta tag, setear en Vercel la
  env var `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` con el token del método "HTML tag"
  (solo el `content`). Alternativa: verificación por DNS, sin tocar nada acá.

Reglas que conviene no romper (de la auditoría): title de 60 caracteres o menos con la
keyword al principio y description de 120 a 155; un solo H1 por página y H2 propios (nada
de repetir el mismo H2 entre landings); una keyword principal por página; la respuesta en
las dos primeras frases; enlaces comunes (`<a>`), nunca botones que solo funcionan con
JavaScript; cada URL que cambie lleva 301 y actualiza enlaces internos y sitemap.

Al publicar un post nuevo: entrada en `src/lib/blog.ts` (con `related` y, si aplica,
`faqs`) + componente + mapeo del slug. El sitemap, el feed y el índice lo levantan solos.

## Analítica (PostHog)

La app manda eventos a [PostHog](https://posthog.com/) para responder tres
preguntas del embudo: cuánta gente se registra, cuánta llega a cargar horas y
facturar, y cuánta ve el paywall y hace clic en el checkout.

**Env var en Vercel** (una sola, y es pública):

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...   # Project API key, en PostHog → Settings → Project
```

`NEXT_PUBLIC_POSTHOG_HOST` es opcional y solo cambia si el proyecto se crea en
la región EU (`https://eu.i.posthog.com`); el default es US, que es donde está
Registruti. **Si alguna vez cambia la región, hay que actualizar `/privacy`**,
que declara dónde se procesan los datos. Sin la key, la analítica es un no-op: no se descarga el script ni
se manda un request, así que en local y en los previews no se ensucian los datos.

### Eventos

Están todos tipados en `src/lib/analytics.ts` (`AnalyticsEvent`): si un nombre
no está en esa unión, no compila.

| Evento | Dónde | Propiedades |
| --- | --- | --- |
| `signed_up` | vuelta del OAuth (`/auth/callback` y la landing) | — |
| `onboarding_completed` | fin del wizard, salteado o no | `last_step` (0 bienvenida, 1 primera entrada, 2 listo), `created_client`, `rate_from_calculator` |
| `time_entry_created` | tracker, registro rápido, repetir entrada, wizard y servidor MCP | `source` (`tracker` / `quick_add` / `repeat` / `onboarding` / `mcp`), `duration_minutes`, `billable` |
| `invoice_created` | alta de invoice | `currency`, `total_minutes`, `entries` |
| `invoice_blocked` | se abrió "Nuevo invoice" sin nada que facturar (una vez por apertura) | `reason` (`no_clients` / `no_billable_hours`) |
| `paywall_shown` | se abre `UpgradeModal` | `reason` (`clients` / `invoices` / `general`) |
| `checkout_clicked` | clic en "Desbloquear lifetime access" | `reason` |
| `calculator_cta_clicked` | CTA de `/cuanto-cobrar-por-hora` (salida a `/login`) | — (a propósito: la página promete que lo calculado no sale del navegador) |
| `hours_calculator_cta_clicked` | CTA de `/calculadora-de-horas-trabajadas` (salida a `/login`) | — (misma razón) |
| `client_created` | wizard de bienvenida, alta en Clientes y alta al vuelo desde el tracker o el registro rápido | `source` (`onboarding` / `clients` / `tracker` / `quick_add`), `currency`, `has_rate` |
| `invoice_viewed` | enlace público `/i/[token]`, lo abre el cliente del usuario | `status`, `currency` |

Más `$pageview` por navegación (a mano: con el App Router el automático solo
contaría la primera vista) y autocapture de clics en links y botones.

Las horas cargadas por el servidor MCP también cuentan: `log_time` corre
server-side, así que el evento sale por HTTP desde `src/lib/analyticsServer.ts`
(misma key pública, sin SDK) después de responder la tool, con `distinct_id`
= `user_id`, el mismo con el que el browser identifica a la persona.

### Links con UTM

`posthog-js` lee los `utm_*` de la URL solo: quedan en cada evento y, como
`$initial_utm_source`, en la persona. Sin ellos, Instagram, X y
nicoproducto.work aparecen como referrers sueltos, y un link pegado en
WhatsApp directamente como `$direct`. Convención para lo que se comparte a
mano (no hay que tocar la app: el parámetro no afecta el canonical ni el
prerender):

| Dónde | Link |
| --- | --- |
| Bio de Instagram | `https://registruti.app/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Posts y stories | `…?utm_source=instagram&utm_medium=social&utm_campaign=<nombre-del-post>` |
| X / Twitter | `…?utm_source=x&utm_medium=social` |
| nicoproducto.work | `…?utm_source=nicoproducto&utm_medium=referral` |

### Decisiones que conviene no deshacer sin pensarlo

- **Proxy inverso** (`/ingest` → PostHog, en `src/middleware.ts`): los eventos
  salen por el propio dominio, así que no los cortan los bloqueadores por lista.
  Va en un middleware y no en los `rewrites` de `next.config.ts` porque un
  rewrite de config reenvía los headers de la request tal cual: al ser
  same-origin, el browser adjunta las cookies del dominio y terminarían en un
  tercero. El middleware saca `Cookie` y `Authorization` antes de mandar, y su
  `matcher` lo limita a `/ingest/*`. Obliga a `skipTrailingSlashRedirect: true`,
  porque varios endpoints de PostHog terminan en barra y la normalización de
  Next los redirigía antes. No duplica URLs indexables: todas las páginas
  públicas declaran su `canonical`.
- **Carga diferida**: `posthog-js` pesa ~276 KB y esto vive en el layout raíz.
  Con el `import()` dinámico queda en un chunk aparte que no entra en el camino
  crítico de la landing ni de las páginas de comparación (la landing baja de
  258 kB a 168 kB de First Load JS). Los eventos que ocurren antes de que
  termine de cargar se encolan.
- **Nada de datos de los clientes del usuario**: no se mandan nombres de
  clientes, descripciones de tareas ni montos facturados. `invoice_created`
  lleva horas y moneda, no plata.
- **Session replay apagado** (`disable_session_recording`), que es lo que
  promete `/privacy`.
- **`respect_dnt` queda apagado** (su default). No cubre solo Do Not Track: el
  SDK corta la captura entera si encuentra cualquiera de `doNotTrack`,
  `msDoNotTrack`, `window.doNotTrack` o **`globalPrivacyControl`**, y ese último
  lo mandan Brave y DuckDuckGo por defecto. Prenderlo dejaba el panel en cero
  sin un error ni un aviso, idéntico a "no entró nadie". Si alguna vez se
  vuelve a prender, hay que actualizar `/privacy` y asumir que una parte del
  público desaparece de las métricas.
- **`person_profiles: "identified_only"`**: las visitas anónimas del marketing
  generan eventos igual (los embudos funcionan), pero no crean perfiles
  facturables.

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
