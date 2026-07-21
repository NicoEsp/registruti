"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import type { Client, TimeEntry } from "@/lib/types";
import {
  DAY_ABBREV,
  addDays,
  formatDuration,
  formatMoney,
  formatShortDate,
  parseISODate,
  startOfWeek,
  toISODate,
} from "@/lib/format";

type Preset = "week" | "month" | "lastMonth" | "custom";

function presetRange(preset: Preset): { from: string; to: string } {
  const now = new Date();
  if (preset === "week") {
    const start = startOfWeek(now);
    return { from: toISODate(start), to: toISODate(addDays(start, 6)) };
  }
  if (preset === "month") {
    return {
      from: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  // lastMonth
  return {
    from: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    to: toISODate(new Date(now.getFullYear(), now.getMonth(), 0)),
  };
}

export default function ReportsPage() {
  return (
    <AppShell>
      <Reports />
    </AppShell>
  );
}

function Reports() {
  const [preset, setPreset] = useState<Preset>("month");
  const [range, setRange] = useState(() => presetRange("month"));
  const [clientFilter, setClientFilter] = useState("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(p: Preset) {
    setPreset(p);
    if (p !== "custom") setRange(presetRange(p));
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("time_entries")
      .select("*")
      .gte("entry_date", range.from)
      .lte("entry_date", range.to);
    if (clientFilter !== "all") query = query.eq("client_id", clientFilter);
    const [clientsRes, entriesRes] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      query,
    ]);
    if (clientsRes.error || entriesRes.error) {
      setError(clientsRes.error?.message ?? entriesRes.error?.message ?? null);
    } else {
      setClients(clientsRes.data);
      setEntries(entriesRes.data);
      setError(null);
    }
    setLoading(false);
  }, [range, clientFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  const byClient = useMemo(() => {
    const map = new Map<string, { minutes: number; billableMinutes: number }>();
    for (const e of entries) {
      const agg = map.get(e.client_id) ?? { minutes: 0, billableMinutes: 0 };
      agg.minutes += e.duration_minutes;
      if (e.billable) agg.billableMinutes += e.duration_minutes;
      map.set(e.client_id, agg);
    }
    return [...map.entries()]
      .map(([clientId, agg]) => ({ clientId, client: clientById.get(clientId), ...agg }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [entries, clientById]);

  // clientId -> day -> minutes
  const byClientDay = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const e of entries) {
      let inner = map.get(e.client_id);
      if (!inner) {
        inner = new Map();
        map.set(e.client_id, inner);
      }
      inner.set(e.entry_date, (inner.get(e.entry_date) ?? 0) + e.duration_minutes);
    }
    return map;
  }, [entries]);

  const days = useMemo(() => {
    const result: string[] = [];
    let d = parseISODate(range.from);
    const end = parseISODate(range.to);
    let guard = 0;
    while (d <= end && guard < 120) {
      result.push(toISODate(d));
      d = addDays(d, 1);
      guard++;
    }
    return result;
  }, [range]);

  // Days grouped by calendar week (Monday-based), preserving order.
  const weeks = useMemo(() => {
    const result: { weekStart: string; days: string[] }[] = [];
    for (const day of days) {
      const ws = toISODate(startOfWeek(parseISODate(day)));
      const last = result[result.length - 1];
      if (last && last.weekStart === ws) last.days.push(day);
      else result.push({ weekStart: ws, days: [day] });
    }
    return result;
  }, [days]);

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.entry_date, (map.get(e.entry_date) ?? 0) + e.duration_minutes);
    }
    return map;
  }, [entries]);

  const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);
  const maxDay = Math.max(1, ...days.map((d) => dayTotals.get(d) ?? 0));

  const clientWeekTotal = (clientId: string, weekDays: string[]) =>
    weekDays.reduce((s, d) => s + (byClientDay.get(clientId)?.get(d) ?? 0), 0);

  // CSV con una fila por entrada del período filtrado. Separador ";" y decimales
  // con coma: es lo que Excel/Sheets en locales latinos abren sin pelear.
  function exportCsv() {
    const decimal = (n: number) => n.toString().replace(".", ",");
    const rows: string[][] = [
      ["Fecha", "Cliente", "Descripción", "Duración", "Horas", "Facturable", "Tarifa", "Moneda", "Monto"],
    ];
    const sorted = [...entries].sort(
      (a, b) => a.entry_date.localeCompare(b.entry_date) || a.created_at.localeCompare(b.created_at)
    );
    for (const e of sorted) {
      const client = clientById.get(e.client_id);
      const amount = e.billable && client ? (e.duration_minutes / 60) * client.hourly_rate : 0;
      rows.push([
        e.entry_date,
        client?.name ?? "Cliente eliminado",
        e.description ?? "",
        formatDuration(e.duration_minutes),
        decimal(e.duration_minutes / 60),
        e.billable ? "Sí" : "No",
        client ? decimal(client.hourly_rate) : "",
        client?.currency ?? "",
        decimal(Math.round(amount * 100) / 100),
      ]);
    }
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(";"))
      .join("\r\n");
    // El BOM hace que Excel detecte UTF-8 (tildes, ñ) en vez de asumir Latin-1.
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registruti-${range.from}-${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Reportes</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {(
            [
              ["week", "Esta semana"],
              ["month", "Este mes"],
              ["lastMonth", "Mes pasado"],
              ["custom", "Personalizado"],
            ] as [Preset, string][]
          ).map(([p, label]) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                preset === p ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <>
            <input
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
          </>
        )}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm sm:ml-auto sm:w-auto"
        >
          <option value="all">Todos los clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={exportCsv}
          disabled={loading || entries.length === 0}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40 sm:w-auto"
          title="Descargar las entradas del período como CSV"
        >
          Exportar CSV
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Horas totales
              </p>
              <p className="mt-1 text-2xl font-semibold">{formatDuration(totalMinutes)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Entradas
              </p>
              <p className="mt-1 text-2xl font-semibold">{entries.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Período
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatShortDate(range.from)} – {formatShortDate(range.to)}
              </p>
            </div>
          </div>

          {days.length <= 62 && totalMinutes > 0 && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Horas por día
              </p>
              <div className="flex h-32 items-end gap-px">
                {days.map((day) => {
                  const dayMinutes = dayTotals.get(day) ?? 0;
                  return (
                    <div
                      key={day}
                      className="flex h-full flex-1 flex-col-reverse"
                      title={`${formatShortDate(day)}: ${formatDuration(dayMinutes)}`}
                    >
                      {byClient.map(({ clientId, client }) => {
                        const minutes = byClientDay.get(clientId)?.get(day) ?? 0;
                        if (minutes === 0) return null;
                        return (
                          <div
                            key={clientId}
                            className="w-full transition hover:opacity-80"
                            style={{
                              height: `${(minutes / maxDay) * 100}%`,
                              minHeight: 3,
                              backgroundColor: client?.color ?? "#94a3b8",
                            }}
                            title={`${client?.name ?? "Cliente eliminado"} · ${formatShortDate(
                              day
                            )}: ${formatDuration(minutes)}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>{formatShortDate(range.from)}</span>
                <span>{formatShortDate(range.to)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {byClient.map(({ clientId, client }) => (
                  <span key={clientId} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: client?.color ?? "#94a3b8" }}
                    />
                    {client?.name ?? "Cliente eliminado"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {byClient.length > 0 && days.length <= 70 && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <p className="px-4 pt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Detalle por cliente, día y semana
              </p>
              <div className="overflow-x-auto p-4">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-white px-2 py-1.5 text-left font-medium text-slate-500">
                        Cliente
                      </th>
                      {weeks.map((week) => (
                        <th
                          key={week.weekStart}
                          colSpan={week.days.length + 1}
                          className="border-l border-slate-200 px-2 py-1.5 text-left font-medium text-slate-500"
                        >
                          Semana del {formatShortDate(week.days[0]).slice(0, 5)}
                        </th>
                      ))}
                      <th className="border-l border-slate-200 px-2 py-1.5 text-right font-semibold text-slate-700">
                        Total
                      </th>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="sticky left-0 z-10 bg-white" />
                      {weeks.map((week) => (
                        <WeekDayHeaders key={week.weekStart} days={week.days} />
                      ))}
                      <th className="border-l border-slate-200" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {byClient.map(({ clientId, client, minutes }) => (
                      <tr key={clientId}>
                        <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-2 py-1.5 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: client?.color ?? "#94a3b8" }}
                            />
                            {client?.name ?? "Cliente eliminado"}
                          </span>
                        </td>
                        {weeks.map((week) => (
                          <WeekCells
                            key={week.weekStart}
                            days={week.days}
                            minutesForDay={(d) => byClientDay.get(clientId)?.get(d) ?? 0}
                            weekTotal={clientWeekTotal(clientId, week.days)}
                          />
                        ))}
                        <td className="border-l border-slate-200 px-2 py-1.5 text-right font-mono font-semibold">
                          {formatDuration(minutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-semibold">
                      <td className="sticky left-0 z-10 bg-white px-2 py-1.5">Total</td>
                      {weeks.map((week) => (
                        <WeekCells
                          key={week.weekStart}
                          days={week.days}
                          minutesForDay={(d) => dayTotals.get(d) ?? 0}
                          weekTotal={week.days.reduce((s, d) => s + (dayTotals.get(d) ?? 0), 0)}
                          bold
                        />
                      ))}
                      <td className="border-l border-slate-200 px-2 py-1.5 text-right font-mono">
                        {formatDuration(totalMinutes)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Mobile: tarjetas por cliente */}
          <div className="space-y-3 md:hidden">
            {byClient.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400 shadow-sm">
                No hay horas registradas en este período.
              </p>
            ) : (
              byClient.map(({ clientId, client, minutes, billableMinutes }) => (
                <div
                  key={clientId}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 font-medium">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: client?.color ?? "#94a3b8" }}
                      />
                      <span className="truncate">{client?.name ?? "Cliente eliminado"}</span>
                    </span>
                    <span className="shrink-0 font-semibold">
                      {client
                        ? formatMoney((billableMinutes / 60) * client.hourly_rate, client.currency)
                        : "—"}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>
                      Horas <span className="font-mono text-slate-700">{formatDuration(minutes)}</span>
                    </span>
                    <span>
                      Facturables{" "}
                      <span className="font-mono text-slate-700">
                        {formatDuration(billableMinutes)}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Horas</th>
                  <th className="px-4 py-3">Horas facturables</th>
                  <th className="px-4 py-3 text-right">Monto facturable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byClient.map(({ clientId, client, minutes, billableMinutes }) => (
                  <tr key={clientId}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: client?.color ?? "#94a3b8" }}
                        />
                        {client?.name ?? "Cliente eliminado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{formatDuration(minutes)}</td>
                    <td className="px-4 py-3 font-mono">{formatDuration(billableMinutes)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {client
                        ? formatMoney((billableMinutes / 60) * client.hourly_rate, client.currency)
                        : "—"}
                    </td>
                  </tr>
                ))}
                {byClient.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                      No hay horas registradas en este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function WeekDayHeaders({ days }: { days: string[] }) {
  return (
    <>
      {days.map((day, i) => {
        const d = parseISODate(day);
        const weekend = d.getDay() === 0 || d.getDay() === 6;
        return (
          <th
            key={day}
            className={`px-2 py-1.5 text-right font-normal ${
              i === 0 ? "border-l border-slate-200" : ""
            } ${weekend ? "text-slate-300" : "text-slate-400"}`}
          >
            {DAY_ABBREV[d.getDay()][0]} {d.getDate()}
          </th>
        );
      })}
      <th className="px-2 py-1.5 text-right font-medium text-slate-500">Sem.</th>
    </>
  );
}

function WeekCells({
  days,
  minutesForDay,
  weekTotal,
  bold,
}: {
  days: string[];
  minutesForDay: (day: string) => number;
  weekTotal: number;
  bold?: boolean;
}) {
  return (
    <>
      {days.map((day, i) => {
        const minutes = minutesForDay(day);
        return (
          <td
            key={day}
            className={`px-2 py-1.5 text-right font-mono ${
              i === 0 ? "border-l border-slate-200" : ""
            } ${minutes === 0 ? "text-slate-300" : ""}`}
          >
            {minutes > 0 ? formatDuration(minutes) : "·"}
          </td>
        );
      })}
      <td
        className={`bg-slate-50 px-2 py-1.5 text-right font-mono ${
          bold ? "" : "font-medium"
        } ${weekTotal === 0 ? "text-slate-300" : ""}`}
      >
        {weekTotal > 0 ? formatDuration(weekTotal) : "·"}
      </td>
    </>
  );
}
