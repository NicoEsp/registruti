import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getAdminClient } from "@/lib/supabaseAdmin";

// Webhook de LemonSqueezy para el lifetime access de Registruti.
// Al confirmarse un pago (order_created), marca profiles.pro = true del usuario
// y registra la venta en `lifetime_grants` (la lista de Ventas del back office).
// Ante un reembolso (order_refunded), marca la venta como reembolsada y le
// quita el acceso.
//
// Config en LemonSqueezy → Settings → Webhooks:
//   - Callback URL: https://registruti.app/api/webhooks/lemonsqueezy
//   - Signing secret: el mismo valor que LEMONSQUEEZY_WEBHOOK_SECRET (env en Vercel)
//   - Eventos: order_created y order_refunded
//
// La firma se verifica con HMAC-SHA256 del body crudo. Reusa la service role de
// Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) para poder escribir `pro`.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Variant del producto "lifetime access" en LemonSqueezy. Solo una orden de este
// variant activa el pro (defensa por si un evento ajeno llegara al endpoint).
// Sobreescribible por env var; 0 = no verificar.
const EXPECTED_VARIANT_ID = Number(process.env.LEMONSQUEEZY_VARIANT_ID ?? 1934751);

interface LemonWebhook {
  meta?: {
    event_name?: string;
    test_mode?: boolean;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: string | number;
    attributes?: {
      order_number?: number;
      user_name?: string;
      user_email?: string;
      status?: string;
      currency?: string;
      /** Total en centavos de `currency`. */
      total?: number;
      /** Total en centavos de USD. */
      total_usd?: number;
      first_order_item?: { variant_id?: number };
    };
  };
}

/** Entero o null: los montos llegan como number, pero no confiamos a ciegas. */
function intOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
}

/** Comparación en tiempo constante de dos hex de igual longitud esperada. */
function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length === 0 || ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    // Falla fuerte: sin secret no podemos verificar la firma y no queremos
    // activar accesos a ciegas.
    return new Response("LEMONSQUEEZY_WEBHOOK_SECRET no configurada.", { status: 500 });
  }

  const raw = await req.text();
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const signature = req.headers.get("x-signature") ?? "";
  if (!safeEqualHex(expected, signature)) {
    return new Response("Firma inválida.", { status: 401 });
  }

  let body: LemonWebhook;
  try {
    body = JSON.parse(raw) as LemonWebhook;
  } catch {
    return new Response("Body inválido.", { status: 400 });
  }

  const event = body.meta?.event_name;
  // Solo actuamos ante un pago concretado o un reembolso. Otros eventos se
  // aceptan (200) para que LemonSqueezy no los reintente, pero no hacen nada.
  if (event !== "order_created" && event !== "order_refunded") {
    return new Response("ok", { status: 200 });
  }

  // Solo el producto del lifetime access cuenta. Si el evento trae otro
  // variant, lo aceptamos (200) pero no hacemos nada.
  const attributes = body.data?.attributes ?? {};
  const variantId = attributes.first_order_item?.variant_id;
  if (EXPECTED_VARIANT_ID && variantId && variantId !== EXPECTED_VARIANT_ID) {
    return new Response("ok", { status: 200 });
  }

  const orderId = body.data?.id != null ? String(body.data.id) : null;
  const admin = getAdminClient();

  if (event === "order_refunded") {
    if (!orderId) return new Response("Sin id de orden.", { status: 422 });
    // Marca la venta como reembolsada y quita el acceso si no le queda otro.
    // Idempotente: un reintento no encuentra la venta activa y no hace nada.
    const { error } = await admin.rpc("refund_lifetime_sale", { p_order_id: orderId });
    if (error) {
      return new Response(`No se pudo registrar el reembolso: ${error.message}`, { status: 500 });
    }
    return new Response("ok", { status: 200 });
  }

  if (attributes.status && attributes.status !== "paid") {
    return new Response("ok", { status: 200 });
  }

  // Preferimos el user_id que mandamos en custom_data del checkout; si no vino,
  // caemos al email con el que se pagó.
  const rawUserId = body.meta?.custom_data?.user_id;
  const userId = typeof rawUserId === "string" && rawUserId.trim() ? rawUserId.trim() : null;
  const email = attributes.user_email?.trim().toLowerCase() || null;

  if (!userId && !email) {
    return new Response("Sin user_id ni email en el evento.", { status: 422 });
  }

  const { data: granted, error } = await admin.rpc("grant_pro", {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    // 500 → LemonSqueezy reintenta. El upsert es idempotente, así que reintentar
    // es seguro.
    return new Response(`No se pudo activar el acceso: ${error.message}`, { status: 500 });
  }

  // La venta, para el back office. Si no encontramos al usuario (pagó con otro
  // email y sin user_id), queda pendiente con su email: el acceso se activa
  // solo cuando cree la cuenta con ese email, o a mano desde /admin.
  // Idempotente por ls_order_id, así que un reintento no la duplica.
  if (orderId) {
    const { error: saleError } = await admin.from("lifetime_grants").upsert(
      {
        user_id: (granted as string | null) ?? null,
        email,
        source: "lemonsqueezy",
        ls_order_id: orderId,
        ls_order_number: intOrNull(attributes.order_number),
        customer_name: attributes.user_name?.trim() || null,
        amount_cents: intOrNull(attributes.total),
        currency: attributes.currency?.toUpperCase() ?? null,
        amount_usd_cents: intOrNull(attributes.total_usd),
        test_mode: body.meta?.test_mode === true,
      },
      { onConflict: "ls_order_id", ignoreDuplicates: true }
    );
    if (saleError) {
      // El acceso ya quedó activado; 500 para que el reintento registre la venta.
      return new Response(`No se pudo registrar la venta: ${saleError.message}`, { status: 500 });
    }
  }

  if (!granted) {
    // 200 para no reintentar en loop: queda como venta pendiente en /admin.
    return new Response("Usuario no encontrado: venta pendiente de cuenta.", { status: 200 });
  }

  return new Response("ok", { status: 200 });
}

export async function GET() {
  return new Response("Webhook de LemonSqueezy. Usa POST.", {
    status: 405,
    headers: { allow: "POST" },
  });
}
