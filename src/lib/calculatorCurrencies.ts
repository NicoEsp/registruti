/**
 * Las 9 monedas que soporta Registruti, para las calculadoras públicas (la de
 * tarifa por hora y la de horas trabajadas). El locale es el del país de cada
 * moneda para que los separadores y el símbolo se vean como los espera quien
 * la usa (CLP y COP sin decimales, BRL con coma, etc.).
 */
export const CALCULATOR_CURRENCIES = [
  { code: "USD", label: "Dólar (USD)", locale: "en-US" },
  { code: "ARS", label: "Peso argentino (ARS)", locale: "es-AR" },
  { code: "MXN", label: "Peso mexicano (MXN)", locale: "es-MX" },
  { code: "COP", label: "Peso colombiano (COP)", locale: "es-CO" },
  { code: "CLP", label: "Peso chileno (CLP)", locale: "es-CL" },
  { code: "UYU", label: "Peso uruguayo (UYU)", locale: "es-UY" },
  { code: "BRL", label: "Real (BRL)", locale: "pt-BR" },
  { code: "EUR", label: "Euro (EUR)", locale: "es-ES" },
  { code: "GBP", label: "Libra (GBP)", locale: "en-GB" },
] as const;

export type CalculatorCurrency = (typeof CALCULATOR_CURRENCIES)[number];

export function findCalculatorCurrency(code: string): CalculatorCurrency {
  return CALCULATOR_CURRENCIES.find((c) => c.code === code) ?? CALCULATOR_CURRENCIES[0];
}

export function formatMoney(value: number, currency: string, locale: string): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  // Los montos grandes (ARS, COP, CLP) no necesitan centavos; los chicos sí.
  const digits = value >= 1000 ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
