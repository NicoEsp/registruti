import type { AnalyticsEvent } from "@/lib/analytics";

/**
 * Captura de eventos desde el servidor. La usa el servidor MCP para las horas
 * y los clientes que se crean por ahí, que antes no dejaban rastro
 * (`posthog-js` es del browser) y dejaban el embudo de activación a ciegas
 * para quien carga todo hablándole a Claude.
 *
 * Sin SDK a propósito: PostHog acepta eventos por HTTP con la misma key
 * pública que usa el browser, y `posthog-node` sería una dependencia más para
 * un POST. Misma regla que en el cliente: sin key, no se manda nada; y un
 * PostHog caído no puede romper una tool, así que acá nunca se lanza.
 *
 * El `distinct_id` es el `user_id` de Supabase, el mismo con el que el
 * browser identifica a la persona: los eventos de las dos fuentes caen en el
 * mismo perfil.
 */
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export async function captureServer(
  distinctId: string,
  event: AnalyticsEvent,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!POSTHOG_KEY || !distinctId) return;
  try {
    await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $lib: "registruti-server" },
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Red caída o timeout: se pierde un evento, no una entrada de tiempo.
  }
}
