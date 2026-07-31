"use client";

import { useMemo, useState } from "react";

/**
 * Calculadora de tarifa por hora freelance.
 *
 * Trabaja al revés que la intuición: no parte de "cuánto cobra el mercado"
 * sino del ingreso que querés llevarte, le suma gastos e impuestos, y lo
 * divide por las horas que realmente podés facturar en un año. Los valores por
 * defecto ya dan un resultado razonable, así que la página sirve incluso sin
 * que el visitante toque nada (y el HTML se prerenderiza con ese resultado).
 */

// Las 9 monedas que soporta Registruti. El locale es el del país de cada
// moneda para que los separadores y el símbolo se vean como los espera quien
// la usa (CLP y COP sin decimales, BRL con coma, etc.).
const CURRENCIES = [
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

const WEEKS_PER_YEAR = 52;
/** Margen sobre la tarifa mínima: colchón para huecos entre proyectos. */
const MARGIN = 0.2;

function formatMoney(value: number, currency: string, locale: string): string {
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

interface FieldProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}

function Field({ label, hint, value, onChange, min, max, step = 1, suffix }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-slate-500">{hint}</span> : null}
      <span className="mt-2 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isNaN(next)) return;
            onChange(Math.min(max, Math.max(min, next)));
          }}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm tabular-nums shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        {suffix ? (
          <span className="shrink-0 text-sm text-slate-500" aria-hidden>
            {suffix}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export default function RateCalculator() {
  const [currency, setCurrency] = useState<string>("USD");
  const [monthlyIncome, setMonthlyIncome] = useState(2000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(200);
  const [taxRate, setTaxRate] = useState(25);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [billableHoursPerDay, setBillableHoursPerDay] = useState(5);
  const [weeksOff, setWeeksOff] = useState(4);

  const selected = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const result = useMemo(() => {
    const netYear = monthlyIncome * 12;
    const expensesYear = monthlyExpenses * 12;
    // Los impuestos se aplican sobre lo que facturás, no sobre lo que te
    // queda: hay que ir para arriba, no restarle un porcentaje al neto.
    const grossYear = (netYear + expensesYear) / (1 - Math.min(taxRate, 90) / 100);
    const billableWeeks = Math.max(WEEKS_PER_YEAR - weeksOff, 1);
    const billableHoursYear = billableWeeks * daysPerWeek * billableHoursPerDay;

    const minRate = billableHoursYear > 0 ? grossYear / billableHoursYear : 0;
    const targetRate = minRate * (1 + MARGIN);

    // La cuenta ingenua con la que casi todos arrancan: sueldo dividido por
    // las horas que estás sentado, sin gastos, impuestos ni tiempo no
    // facturable. Sirve para mostrar el tamaño del error.
    const naiveRate = monthlyIncome / (daysPerWeek * 4.33 * 8);

    // Cuánto se queda corta la cuenta ingenua, expresado como "X% menos".
    // Ojo: es 1 − ingenua/objetivo, no objetivo/ingenua − 1. Lo segundo puede
    // dar más de 100 y "un 205% por debajo" no significa nada.
    const naiveGapPct =
      targetRate > 0 && naiveRate < targetRate
        ? Math.round((1 - naiveRate / targetRate) * 100)
        : 0;

    return {
      minRate,
      targetRate,
      naiveRate,
      naiveGapPct,
      billableHoursYear,
      billableHoursMonth: billableHoursYear / 12,
      grossMonth: grossYear / 12,
      dayRate: targetRate * billableHoursPerDay,
    };
  }, [monthlyIncome, monthlyExpenses, taxRate, daysPerWeek, billableHoursPerDay, weeksOff]);

  const money = (value: number) => formatMoney(value, selected.code, selected.locale);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Entradas */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Moneda</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              label="Ingreso mensual que querés llevarte"
              hint="Neto, en tu bolsillo, después de impuestos"
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              min={0}
              max={100000000}
              step={100}
            />
            <Field
              label="Gastos fijos del mes"
              hint="Software, internet, coworking, contador"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              min={0}
              max={100000000}
              step={50}
            />
            <Field
              label="Impuestos y retenciones"
              hint="Monotributo, ISR, IVA no recuperable, comisiones de cobro"
              value={taxRate}
              onChange={setTaxRate}
              min={0}
              max={90}
              suffix="%"
            />
            <Field
              label="Días que trabajás por semana"
              value={daysPerWeek}
              onChange={setDaysPerWeek}
              min={1}
              max={7}
              suffix="días"
            />
            <Field
              label="Horas facturables por día"
              hint="Solo las que le cobrás a un cliente, no las que estás frente a la compu"
              value={billableHoursPerDay}
              onChange={setBillableHoursPerDay}
              min={1}
              max={12}
              suffix="hs"
            />
            <Field
              label="Semanas al año sin facturar"
              hint="Vacaciones, feriados, enfermedad, meses flojos"
              value={weeksOff}
              onChange={setWeeksOff}
              min={0}
              max={30}
              suffix="sem"
            />
          </div>

          {billableHoursPerDay > 6 ? (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>Ojo:</strong> más de 6 horas facturables por día no se sostiene en el tiempo.
              Vender, cotizar, facturar y responder mails también es trabajo, y no se le cobra a
              nadie. Si ponés un número alto acá, la tarifa te va a dar más baja de lo que
              realmente necesitás.
            </p>
          ) : null}
        </div>

        {/* Resultado */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Tu tarifa por hora
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums">{money(result.targetRate)}</p>
          <p className="mt-1 text-sm text-indigo-100">
            Recomendada, con {Math.round(MARGIN * 100)}% de margen
          </p>

          <dl className="mt-6 space-y-3 border-t border-white/20 pt-5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-indigo-100">Mínimo para no perder plata</dt>
              <dd className="font-semibold tabular-nums">{money(result.minRate)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-indigo-100">Tarifa por día</dt>
              <dd className="font-semibold tabular-nums">{money(result.dayRate)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-indigo-100">Tenés que facturar por mes</dt>
              <dd className="font-semibold tabular-nums">{money(result.grossMonth)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-indigo-100">Horas facturables al mes</dt>
              <dd className="font-semibold tabular-nums">
                {Math.round(result.billableHoursMonth)} hs
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm">
            <p className="font-semibold">La cuenta que hace casi todo el mundo</p>
            <p className="mt-1.5 text-indigo-100">
              Dividir el ingreso deseado por 8 horas diarias da{" "}
              <strong className="text-white tabular-nums">{money(result.naiveRate)}</strong> por
              hora
              {result.naiveGapPct > 0 ? (
                <>
                  {" "}
                  — un <strong className="text-white">{result.naiveGapPct}% menos</strong> de lo que
                  realmente necesitás cobrar.
                </>
              ) : (
                "."
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        La calculadora corre entera en tu navegador: no se envía ni se guarda ninguno de estos
        datos.
      </p>
    </div>
  );
}
