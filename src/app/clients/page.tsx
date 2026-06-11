"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import { CLIENT_COLORS, CURRENCIES, type Client } from "@/lib/types";
import { formatDuration, formatMoney } from "@/lib/format";

export default function ClientsPage() {
  return (
    <AppShell>
      <Clients />
    </AppShell>
  );
}

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [totals, setTotals] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [clientsRes, entriesRes] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("time_entries").select("client_id, duration_minutes"),
    ]);
    if (clientsRes.error || entriesRes.error) {
      setError(clientsRes.error?.message ?? entriesRes.error?.message ?? null);
    } else {
      setClients(clientsRes.data);
      const map = new Map<string, number>();
      for (const e of entriesRes.data) {
        map.set(e.client_id, (map.get(e.client_id) ?? 0) + e.duration_minutes);
      }
      setTotals(map);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleArchived(client: Client) {
    const { error: err } = await supabase
      .from("clients")
      .update({ archived: !client.archived })
      .eq("id", client.id);
    if (err) setError(err.message);
    else loadData();
  }

  async function handleDelete(client: Client) {
    const tracked = totals.get(client.id) ?? 0;
    const msg =
      tracked > 0
        ? `"${client.name}" tiene ${formatDuration(tracked)} horas trackeadas. Se eliminarán también sus entradas y facturas. ¿Continuar?`
        : `¿Eliminar a "${client.name}"?`;
    if (!confirm(msg)) return;
    const { error: err } = await supabase.from("clients").delete().eq("id", client.id);
    if (err) setError(err.message);
    else loadData();
  }

  const visible = clients.filter((c) => showArchived || !c.archived);
  const archivedCount = clients.filter((c) => c.archived).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nuevo cliente
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          No hay clientes todavía. Creá el primero para empezar.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tarifa / hora</th>
                <th className="px-4 py-3">Horas trackeadas</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((client) => (
                <tr key={client.id} className={client.archived ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      <div>
                        <p className="font-medium">
                          {client.name}
                          {client.archived && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                              Archivado
                            </span>
                          )}
                        </p>
                        {(client.contact_name || client.email) && (
                          <p className="text-xs text-slate-500">
                            {[client.contact_name, client.email].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatMoney(client.hourly_rate, client.currency)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {formatDuration(totals.get(client.id) ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(client)}
                      className="mr-3 text-slate-400 hover:text-indigo-600"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => toggleArchived(client)}
                      className="mr-3 text-slate-400 hover:text-amber-600"
                      title={client.archived ? "Desarchivar" : "Archivar"}
                    >
                      {client.archived ? "📂" : "📁"}
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="text-slate-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {archivedCount > 0 && (
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="mt-4 text-sm text-slate-500 hover:text-slate-700"
        >
          {showArchived ? "Ocultar archivados" : `Mostrar archivados (${archivedCount})`}
        </button>
      )}

      {(showForm || editing) && (
        <ClientFormModal
          client={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(client?.name ?? "");
  const [contactName, setContactName] = useState(client?.contact_name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [rate, setRate] = useState(client?.hourly_rate.toString() ?? "");
  const [currency, setCurrency] = useState(client?.currency ?? "USD");
  const [color, setColor] = useState(
    client?.color ?? CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: name.trim(),
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      hourly_rate: Number(rate) || 0,
      currency,
      color,
    };
    const query = client
      ? supabase.from("clients").update(payload).eq("id", client.id)
      : supabase.from("clients").insert(payload);
    const { error: err } = await query;
    setSaving(false);
    if (err) setError(err.message);
    else onSaved();
  }

  return (
    <Modal title={client ? "Editar cliente" : "Nuevo cliente"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Nombre *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Empresa o cliente"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Contacto</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nombre de la persona de contacto"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Tarifa por hora *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Color</label>
          <div className="flex flex-wrap gap-2">
            {CLIENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 ${
                  color === c ? "border-slate-900" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
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
            {client ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
