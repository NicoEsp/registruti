import { CURRENCIES } from "@/lib/types";

/**
 * Traspaso de la tarifa calculada en /cuanto-cobrar-por-hora hacia el
 * onboarding de la app.
 *
 * Es el puente entre el marketing y el producto: alguien que llega a la
 * calculadora por Google saca su número, se registra, y el wizard del primer
 * cliente ya viene con esa tarifa y esa moneda cargadas. Sin ese puente, el
 * visitante se lleva el número y nosotros no nos llevamos nada.
 *
 * Va por localStorage y no por query string porque el login pasa por OAuth:
 * el usuario se va a Google y vuelve a /auth/callback, así que cualquier
 * parámetro en la URL se pierde en el camino. localStorage sobrevive el
 * round-trip porque es el mismo origen.
 */

const KEY = "registruti_tarifa_calculada_v1";
/** Pasado un mes, el número ya no representa lo que la persona quiso cobrar. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface CalculatedRate {
  rate: number;
  currency: string;
}

/** Guarda la tarifa al momento de hacer clic en el CTA de la calculadora. */
export function saveCalculatedRate(rate: number, currency: string): void {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(rate) || rate <= 0) return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ rate, currency, savedAt: Date.now() })
    );
  } catch {
    // Modo incógnito o storage lleno: el CTA igual navega, solo se pierde el
    // prellenado. No vale la pena molestar al usuario con esto.
  }
}

/**
 * Lee la tarifa guardada y la borra: es de un solo uso, para que no reaparezca
 * en un onboarding futuro. Devuelve null si no hay, si venció o si está rota.
 */
export function takeCalculatedRate(): CalculatedRate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    window.localStorage.removeItem(KEY);

    const parsed = JSON.parse(raw) as Partial<CalculatedRate> & { savedAt?: number };
    const { rate, currency, savedAt } = parsed;

    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) return null;
    if (typeof currency !== "string") return null;
    // La moneda tiene que existir en el select del onboarding; si no, el valor
    // prellenado no matchearía ninguna opción y el campo quedaría en blanco.
    if (!(CURRENCIES as readonly string[]).includes(currency)) return null;
    if (typeof savedAt !== "number" || Date.now() - savedAt > MAX_AGE_MS) return null;

    return { rate, currency };
  } catch {
    return null;
  }
}
