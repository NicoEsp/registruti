"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import type { Client, TimeEntry } from "@/lib/types";
import {
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
      .map(([clientId, agg]) => ({ client: clientById.get(clientId), ...agg }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [entries, clientById]);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.entry_date, (map.get(e.entry_date) ?? 0) + e.duration_minutes);
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

  const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);
  const maxDay = Math.max(1, ...days.map((d) => byDay.get(d) ?? 0));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Reportes</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
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
          className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="all">Todos los clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
                  const minutes = byDay.get(day) ?? 0;
                  return (
                    <div
                      key={day}
                      className="group relative flex-1 rounded-t bg-indigo-500/80 transition hover:bg-indigo-600"
                      style={{ height: `${(minutes / maxDay) * 100}%`, minHeight: minutes > 0 ? 3 : 0 }}
                      title={`${formatShortDate(day)}: ${formatDuration(minutes)}`}
                    />
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>{formatShortDate(range.from)}</span>
                <span>{formatShortDate(range.to)}</span>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Horas</th>
                  <th className="px-4 py-3">Horas facturables</th>
                  <th className="px-4 py-3 text-right">Monto facturable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byClient.map(({ client, minutes, billableMinutes }) => (
                  <tr key={client?.id ?? "unknown"}>
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
