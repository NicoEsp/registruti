import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getAdminClient } from "@/lib/supabaseAdmin";

// Webhook de LemonSqueezy para el lifetime access de Registruti.
// Al confirmarse un pago (order_created), marca profiles.pro = true del usuario.
//
// Config en LemonSqueezy → Settings → Webhooks:
//   - Callback URL: https://registruti.app/api/webhooks/lemonsqueezy
//   - Signing secret: el mismo valor que LEMONSQUEEZY_WEBHOOK_SECRET (env en Vercel)
//   - Eventos: order_created (y opcionalmente order_refunded)
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
    custom_data?: Record<string, unknown>;
  };
  data?: {
    attributes?: {
      user_email?: string;
      status?: string;
      first_order_item?: { variant_id?: number };
    };
  };
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
  // Solo activamos ante un pago concretado. Otros eventos se aceptan (200) para
  // que LemonSqueezy no los reintente, pero no hacen nada.
  if (event !== "order_created") {
    return new Response("ok", { status: 200 });
  }

  const status = body.data?.attributes?.status;
  if (status && status !== "paid") {
    return new Response("ok", { status: 200 });
  }

  // Solo el producto del lifetime access activa el pro. Si el evento trae otro
  // variant, lo aceptamos (200) pero no hacemos nada.
  const variantId = body.data?.attributes?.first_order_item?.variant_id;
  if (EXPECTED_VARIANT_ID && variantId && variantId !== EXPECTED_VARIANT_ID) {
    return new Response("ok", { status: 200 });
  }

  // Preferimos el user_id que mandamos en custom_data del checkout; si no vino,
  // caemos al email con el que se pagó.
  const rawUserId = body.meta?.custom_data?.user_id;
  const userId = typeof rawUserId === "string" && rawUserId.trim() ? rawUserId.trim() : null;
  const email = body.data?.attributes?.user_email ?? null;

  if (!userId && !email) {
    return new Response("Sin user_id ni email en el evento.", { status: 422 });
  }

  const admin = getAdminClient();
  const { data: granted, error } = await admin.rpc("grant_pro", {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    // 500 → LemonSqueezy reintenta. El upsert es idempotente, así que reintentar
    // es seguro.
    return new Response(`No se pudo activar el acceso: ${error.message}`, { status: 500 });
  }

  if (!granted) {
    // Pago válido pero no encontramos al usuario (mail distinto y sin user_id).
    // 200 para no reintentar en loop; queda para resolver a mano.
    return new Response("Usuario no encontrado para este pago.", { status: 200 });
  }

  return new Response("ok", { status: 200 });
}

export async function GET() {
  return new Response("Webhook de LemonSqueezy. Usa POST.", {
    status: 405,
    headers: { allow: "POST" },
  });
}
