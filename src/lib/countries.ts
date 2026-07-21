/**
 * Configuración por país de Latinoamérica: cómo se llama el ID fiscal, qué
 * formato tiene, la moneda habitual y el locale para formatear montos.
 * El país elegido se guarda en `profiles.country` (código ISO alfa-2, u OTRO).
 */
export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  taxIdLabel: string;
  taxIdPlaceholder: string;
  /** Validación suave sobre el valor normalizado (sin puntos/guiones/espacios, en mayúsculas). */
  taxIdPattern?: RegExp;
  /** Moneda sugerida para proyectos nuevos. */
  currency: string;
  /** Locale para Intl.NumberFormat. */
  locale: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    taxIdLabel: "CUIT / CUIL",
    taxIdPlaceholder: "20-12345678-9",
    taxIdPattern: /^\d{11}$/,
    currency: "ARS",
    locale: "es-AR",
  },
  {
    code: "BO",
    name: "Bolivia",
    flag: "🇧🇴",
    taxIdLabel: "NIT",
    taxIdPlaceholder: "1234567012",
    taxIdPattern: /^\d{7,12}$/,
    currency: "BOB",
    locale: "es-BO",
  },
  {
    code: "BR",
    name: "Brasil",
    flag: "🇧🇷",
    taxIdLabel: "CNPJ / CPF",
    taxIdPlaceholder: "12.345.678/0001-90",
    taxIdPattern: /^(\d{11}|\d{14})$/,
    currency: "BRL",
    locale: "pt-BR",
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    taxIdLabel: "RUT",
    taxIdPlaceholder: "12.345.678-9",
    taxIdPattern: /^\d{7,8}[0-9K]$/,
    currency: "CLP",
    locale: "es-CL",
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    taxIdLabel: "NIT",
    taxIdPlaceholder: "900.123.456-1",
    taxIdPattern: /^\d{8,11}$/,
    currency: "COP",
    locale: "es-CO",
  },
  {
    code: "EC",
    name: "Ecuador",
    flag: "🇪🇨",
    taxIdLabel: "RUC",
    taxIdPlaceholder: "1790012345001",
    taxIdPattern: /^\d{10}(\d{3})?$/,
    currency: "USD",
    locale: "es-EC",
  },
  {
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    taxIdLabel: "RFC",
    taxIdPlaceholder: "ABCD860101XYZ",
    taxIdPattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/,
    currency: "MXN",
    locale: "es-MX",
  },
  {
    code: "PY",
    name: "Paraguay",
    flag: "🇵🇾",
    taxIdLabel: "RUC",
    taxIdPlaceholder: "80012345-6",
    taxIdPattern: /^\d{6,9}$/,
    currency: "PYG",
    locale: "es-PY",
  },
  {
    code: "PE",
    name: "Perú",
    flag: "🇵🇪",
    taxIdLabel: "RUC",
    taxIdPlaceholder: "20123456789",
    taxIdPattern: /^\d{11}$/,
    currency: "PEN",
    locale: "es-PE",
  },
  {
    code: "UY",
    name: "Uruguay",
    flag: "🇺🇾",
    taxIdLabel: "RUT",
    taxIdPlaceholder: "211234560017",
    taxIdPattern: /^\d{12}$/,
    currency: "UYU",
    locale: "es-UY",
  },
  {
    code: "VE",
    name: "Venezuela",
    flag: "🇻🇪",
    taxIdLabel: "RIF",
    taxIdPlaceholder: "J-12345678-9",
    taxIdPattern: /^[VEJPG]\d{9}$/,
    currency: "VES",
    locale: "es-VE",
  },
  {
    code: "OTRO",
    name: "Otro país",
    flag: "🌎",
    taxIdLabel: "ID fiscal",
    taxIdPlaceholder: "Tu identificación fiscal",
    currency: "USD",
    locale: "es",
  },
];

export function countryFor(code: string | null | undefined): CountryConfig | null {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code) ?? null;
}

/** Locale para montos según el país del perfil; sin país, el histórico es-AR. */
export function localeFor(code: string | null | undefined): string {
  return countryFor(code)?.locale ?? "es-AR";
}

/**
 * Validación suave del ID fiscal: nunca bloquea el guardado, solo avisa.
 * Vacío o país sin patrón cuentan como válidos.
 */
export function validateTaxId(config: CountryConfig | null, value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !config?.taxIdPattern) return true;
  const normalized = trimmed.replace(/[.\-/\s]/g, "").toUpperCase();
  return config.taxIdPattern.test(normalized);
}
