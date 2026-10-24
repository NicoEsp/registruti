"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { capture } from "@/lib/analytics";
import {
  CALCULATOR_CURRENCIES,
  findCalculatorCurrency,
  formatMoney,
} from "@/lib/calculatorCurrencies";

/**
 * Calculadora de horas trabajadas.
 *
 * Por cada día de la semana: hora de entrada, hora de salida y minutos de
 * descanso. Devuelve las horas de cada día y el total semanal en hh:mm y en
 * decimal (que es lo que se multiplica por la tarifa), y si la persona carga
 * su tarifa, cuánto tiene que cobrar. Los valores por defecto (lunes a
 * viernes de 9:00 a 17:30 con 45 minutos de descanso) ya dan un resultado, así
 * que la página sirve sin tocar nada y el HTML se prerenderiza con él.
 *
 * Corre entera en el navegador: no se envía ni se guarda nada.
 */

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

interface DayInput {
  /** "HH:MM" o vacío. */
  start: string;
  /** "HH:MM" o vacío. */
  end: string;
  /** Minutos de descanso que no se cuentan como trabajo. */
  breakMinutes: number;
}

const WORKDAY: DayInput = { start: "09:00", end: "17:30", breakMinutes: 45 };
const REST_DAY: DayInput = { start: "", end: "", breakMinutes: 0 };
const DEFAULT_DAYS: DayInput[] = [WORKDAY, WORKDAY, WORKDAY, WORKDAY, WORKDAY, REST_DAY, REST_DAY];

function toMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutos trabajados en un día: salida − entrada − descanso. */
export function workedMinutes(day: DayInput, roundTo15: boolean): number {
  const start = toMinutes(day.start);
  const end = toMinutes(day.end);
  if (start === null || end === null) return 0;
  // Un turno que termina después de medianoche (22:00 a 02:00) sigue siendo
  // un turno: si la salida es "menor" que la entrada, pasó al día siguiente.
  let span = end - start;
  if (span < 0) span += 24 * 60;
  const net = Math.max(0, span - Math.max(0, Math.floor(day.breakMinutes) || 0));
  // Bloques de 15 minutos: el estándar con el que facturan estudios,
  // consultoras y la mayoría de los freelancers (y el que usa Registruti).
  return roundTo15 ? Math.round(net / 15) * 15 : net;
}

/** 465 → "7:45". */
export function formatHoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** 465 → "7,75" (en el locale de la moneda elegida). */
export function formatDecimalHours(minutes: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minutes / 60);
}

/**
 * Las horas en decimal se muestran siempre con coma ("38,75"), como el resto
 * del texto de la página y la tabla de conversión. No son un monto: no tienen
 * por qué cambiar de separador cuando se elige otra moneda (con USD, el
 * locale en-US las mostraba como "38.75").
 */
const HOURS_LOCALE = "es-AR";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm tabular-nums shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function HoursCalculator() {
  const [days, setDays] = useState<DayInput[]>(DEFAULT_DAYS);
  const [roundTo15, setRoundTo15] = useState(false);
  const [rate, setRate] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("USD");

  const selected = findCalculatorCurrency(currency);

  const perDay = useMemo(() => days.map((day) => workedMinutes(day, roundTo15)), [days, roundTo15]);
  const totalMinutes = perDay.reduce((sum, m) => sum + m, 0);
  const workedDays = perDay.filter((m) => m > 0).length;
  const averageMinutes = workedDays ? Math.round(totalMinutes / workedDays) : 0;
  const amount = rate > 0 ? (totalMinutes / 60) * rate : 0;

  function updateDay(index: number, patch: Partial<DayInput>) {
    setDays((current) => current.map((day, i) => (i === index ? { ...day, ...patch } : day)));
  }

  function copyMondayToWeekdays() {
    setDays((current) => current.map((day, i) => (i >= 1 && i <= 4 ? { ...current[0] } : day)));
  }

  function clearAll() {
    setDays(DAYS.map(() => ({ ...REST_DAY })));
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Entradas */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">
              Entrada, salida y descanso de cada día
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Repetir el lunes de martes a viernes
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Vaciar
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-3 font-medium">Día</th>
                  <th className="pb-2 pr-3 font-medium">Entrada</th>
                  <th className="pb-2 pr-3 font-medium">Salida</th>
                  <th className="pb-2 pr-3 font-medium">Descanso</th>
                  <th className="pb-2 text-right font-medium">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS.map((label, i) => {
                  const day = days[i];
                  return (
                    <tr key={label}>
                      <td className="py-2 pr-3 font-medium text-slate-700">{label}</td>
                      <td className="py-2 pr-3">
                        <input
                          type="time"
                          aria-label={`${label}: hora de entrada`}
                          value={day.start}
                          onChange={(e) => updateDay(i, { start: e.target.value })}
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="time"
                          aria-label={`${label}: hora de salida`}
                          value={day.end}
                          onChange={(e) => updateDay(i, { end: e.target.value })}
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <span className="flex items-center gap-1.5">
                          <input
                            type="number"
                            inputMode="numeric"
                            aria-label={`${label}: minutos de descanso`}
                            value={day.breakMinutes}
                            min={0}
                            max={720}
                            step={5}
                            onChange={(e) => {
                              const raw = e.target.value;
                              // Number("") es 0, no NaN: vaciar el campo para
                              // retipearlo no tiene que clavarlo en cero.
                              if (raw.trim() === "") return;
                              const next = Number(raw);
                              if (Number.isNaN(next)) return;
                              updateDay(i, { breakMinutes: Math.min(720, Math.max(0, next)) });
                            }}
                            className={`${inputClass} w-20`}
                          />
                          <span className="text-xs text-slate-500" aria-hidden>
                            min
                          </span>
                        </span>
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums text-slate-900">
                        {perDay[i] > 0 ? formatHoursMinutes(perDay[i]) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={roundTo15}
              onChange={(e) => setRoundTo15(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              Redondear cada día a bloques de 15 minutos.{" "}
              <span className="text-slate-500">
                Es como facturan estudios, consultoras y la mayoría de los freelancers: una
                llamada de 20 minutos se cobra como 0:15 o 0:30, nunca al minuto.
              </span>
            </span>
          </label>
        </div>

        {/* Resultado */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">
            Horas trabajadas en la semana
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums">{formatHoursMinutes(totalMinutes)}</p>
          <p className="mt-1 text-sm text-indigo-100">
            {formatDecimalHours(totalMinutes, HOURS_LOCALE)} horas en decimal
          </p>

          <dl className="mt-6 space-y-3 border-t border-white/20 pt-5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-indigo-100">Días trabajados</dt>
              <dd className="font-semibold tabular-nums">{workedDays}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-indigo-100">Promedio por día</dt>
              <dd className="font-semibold tabular-nums">
                {workedDays ? formatHoursMinutes(averageMinutes) : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-indigo-100">Proyección mensual (× 4,33)</dt>
              <dd className="font-semibold tabular-nums">
                {formatHoursMinutes(Math.round(totalMinutes * 4.33))}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm">
            <p className="font-semibold">¿Cuánto cobrar por estas horas?</p>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <label className="block">
                <span className="sr-only">Tarifa por hora</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Tarifa por hora"
                  value={rate || ""}
                  min={0}
                  step={1}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setRate(Number.isNaN(next) || next < 0 ? 0 : next);
                  }}
                  className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm tabular-nums text-white placeholder:text-indigo-200 focus:border-white focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="sr-only">Moneda</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-lg border border-white/30 bg-white/10 px-2 py-2 text-sm text-white focus:border-white focus:outline-none [&>option]:text-slate-900"
                >
                  {CALCULATOR_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {rate > 0 ? (
              <p className="mt-3 text-indigo-100">
                Total a cobrar:{" "}
                <strong className="text-lg text-white tabular-nums">
                  {formatMoney(amount, selected.code, selected.locale)}
                </strong>
              </p>
            ) : (
              <p className="mt-3 text-indigo-100">
                ¿No sabés tu tarifa?{" "}
                <Link href="/cuanto-cobrar-por-hora" className="font-medium text-white underline">
                  Calculala acá
                </Link>
                .
              </p>
            )}
          </div>

          {/* La cuenta de una semana es el momento en que la persona ve el
              problema: la semana que viene hay que volver a hacerla. */}
          <Link
            href="/login"
            onClick={() => capture("hours_calculator_cta_clicked")}
            className="mt-6 block rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            Guardar mis horas por cliente, gratis
          </Link>
          <p className="mt-2 text-center text-xs text-indigo-100">
            Registruti suma tus horas por cliente, con su tarifa, y arma el invoice del mes.
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        La calculadora corre entera en tu navegador: no se envía ni se guarda ninguno de estos
        datos.
      </p>
    </div>
  );
}
