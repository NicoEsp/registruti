"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import type { Client, TimeEntry } from "@/lib/types";
import {
  DURATION_OPTIONS,
  addDays,
  formatDayLabel,
  formatDuration,
  startOfWeek,
  toISODate,
} from "@/lib/format";

export default function TrackerPage() {
  return (
    <AppShell>
      <Tracker />
    </AppShell>
  );
}

function Tracker() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<TimeEntry | null>(null);

  // New entry form
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => toISODate(addDays(weekStart, i))),
    [weekStart]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    const from = toISODate(weekStart);
    const to = toISODate(addDays(weekStart, 6));
    const [clientsRes, entriesRes] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase
        .from("time_entries")
        .select("*")
        .gte("entry_date", from)
        .lte("entry_date", to)
        .order("created_at", { ascending: false }),
    ]);
    if (clientsRes.error || entriesRes.error) {
      setError(clientsRes.error?.message ?? entriesRes.error?.message ?? null);
    } else {
      setClients(clientsRes.data);
      setEntries(entriesRes.data);
      setError(null);
    }
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeClients = clients.filter((c) => !c.archived);
  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const weekTotal = entries.reduce((sum, e) => sum + e.duration_minutes, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) return;
    setSaving(true);
    const { error: err } = await supabase.from("time_entries").insert({
      client_id: clientId,
      entry_date: date,
      duration_minutes: duration,
      description,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDescription("");
    loadData();
  }

  async function handleDelete(entry: TimeEntry) {
    if (entry.invoice_id) {
      alert("Esta entrada ya está facturada y no puede eliminarse.");
      return;
    }
    if (!confirm("¿Eliminar esta entrada?")) return;
    const { error: err } = await supabase.from("time_entries").delete().eq("id", entry.id);
    if (err) setError(err.message);
    else loadData();
  }

  const isCurrentWeek = toISODate(startOfWeek(new Date())) === toISODate(weekStart);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tracker</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            ‹
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            disabled={isCurrentWeek}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40"
          >
            Hoy
          </button>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            ›
          </button>
          <span className="ml-3 text-sm text-slate-500">
            Total semana: <strong className="text-slate-900">{formatDuration(weekTotal)}</strong>
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <form
        onSubmit={handleAdd}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-48 flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            ¿En qué trabajaste?
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción de la tarea"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Cliente</label>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Elegir…</option>
            {activeClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Fecha</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Duración</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {DURATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={saving || !clientId}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>

      {activeClients.length === 0 && !loading && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Todavía no tenés clientes. Creá uno en la sección{" "}
          <a href="/clients" className="font-medium underline">
            Clientes
          </a>{" "}
          para empezar a trackear.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : (
        <div className="space-y-6">
          {weekDays.map((day) => {
            const dayEntries = entries.filter((e) => e.entry_date === day);
            if (dayEntries.length === 0) return null;
            const dayTotal = dayEntries.reduce((s, e) => s + e.duration_minutes, 0);
            return (
              <section key={day}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-slate-700">{formatDayLabel(day)}</h2>
                  <span className="text-sm text-slate-500">{formatDuration(dayTotal)}</span>
                </div>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
                  {dayEntries.map((entry) => {
                    const client = clientById.get(entry.client_id);
                    return (
                      <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: client?.color ?? "#94a3b8" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {entry.description || (
                              <span className="italic text-slate-400">Sin descripción</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {client?.name ?? "Cliente eliminado"}
                            {entry.invoice_id && (
                              <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                Facturada
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-medium">
                          {formatDuration(entry.duration_minutes)}
                        </span>
                        <button
                          onClick={() => setEditing(entry)}
                          disabled={!!entry.invoice_id}
                          className="text-sm text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                          title={entry.invoice_id ? "Entrada facturada" : "Editar"}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(entry)}
                          disabled={!!entry.invoice_id}
                          className="text-sm text-slate-400 hover:text-red-600 disabled:opacity-30"
                          title={entry.invoice_id ? "Entrada facturada" : "Eliminar"}
                        >
                          🗑
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {entries.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">
              No hay entradas esta semana.
            </p>
          )}
        </div>
      )}

      {editing && (
        <EditEntryModal
          entry={editing}
          clients={activeClients}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function EditEntryModal({
  entry,
  clients,
  onClose,
  onSaved,
}: {
  entry: TimeEntry;
  clients: Client[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [description, setDescription] = useState(entry.description);
  const [clientId, setClientId] = useState(entry.client_id);
  const [date, setDate] = useState(entry.entry_date);
  const [duration, setDuration] = useState(entry.duration_minutes);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error: err } = await supabase
      .from("time_entries")
      .update({
        description,
        client_id: clientId,
        entry_date: date,
        duration_minutes: duration,
      })
      .eq("id", entry.id);
    setSaving(false);
    if (err) setError(err.message);
    else onSaved();
  }

  return (
    <Modal title="Editar entrada" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Descripción</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Cliente</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Duración</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
