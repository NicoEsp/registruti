export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(2)} h`;
}

// Locale con el que se formatean los montos. Se ajusta al país del perfil
// (ver countries.ts) apenas carga la sesión; es-AR es el default histórico.
let moneyLocale = "es-AR";

export function setMoneyLocale(locale: string): void {
  moneyLocale = locale;
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(moneyLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DAY_ABBREV = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatDayLabel(iso: string): string {
  const d = parseISODate(iso);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`;
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

/** Monday of the week containing the given date. */
export function startOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export const MIN_DURATION_MINUTES = 15;
export const MAX_DURATION_MINUTES = 480;

/** Redondea al múltiplo de 15 más cercano y acota al rango 0:15–8:00. */
export function clampDuration(minutes: number): number {
  const rounded = Math.round(minutes / 15) * 15;
  return Math.min(MAX_DURATION_MINUTES, Math.max(MIN_DURATION_MINUTES, rounded));
}

/**
 * Interpreta una duración escrita libre: "1:30", "1.5" o "1,5" (horas), "90m",
 * "2h", "2h30". Un número pelado se lee como horas si es ≤ 8 y como minutos si
 * no ("2" → 2:00, "45" → 0:45, "90" → 1:30). Devuelve minutos sin redondear,
 * o null si no se entiende.
 */
export function parseDuration(input: string): number | null {
  const s = input.trim().toLowerCase().replace(",", ".");
  if (!s) return null;

  let m = s.match(/^(\d{1,2}):([0-5]?\d)$/); // h:mm
  if (m) return Number(m[1]) * 60 + Number(m[2]);

  m = s.match(/^(\d+(?:\.\d+)?)\s*h(?:s|oras?)?(?:\s*([0-5]?\d)\s*(?:m|min)?)?$/); // 2h, 1.5h, 2h30
  if (m) return Math.round(Number(m[1]) * 60) + (m[2] ? Number(m[2]) : 0);

  m = s.match(/^(\d+)\s*(?:m|min|mins|minutos?)$/); // 90m
  if (m) return Number(m[1]);

  m = s.match(/^(\d+(?:\.\d+)?)$/); // número pelado
  if (m) {
    const n = Number(m[1]);
    return n <= 8 ? Math.round(n * 60) : Math.round(n);
  }

  return null;
}
