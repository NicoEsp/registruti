"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import BillableCheckbox from "@/components/BillableCheckbox";
import ClientSelect, { NEW_CLIENT_VALUE } from "@/components/ClientSelect";
import DurationInput from "@/components/DurationInput";
import UpgradeModal from "@/components/UpgradeModal";
import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/types";
import { formatDuration, toISODate } from "@/lib/format";
import { emitEntryAdded, showToast } from "@/lib/appEvents";
import { capture } from "@/lib/analytics";
import { createClientQuick } from "@/lib/clients";

/**
 * Registro rápido de tiempo, invocable desde cualquier pantalla (atajo T,
 * command palette o el botón + en mobile). Al guardar emite un evento para
 * que el tracker se refresque si está abierto, y muestra un toast. Si no hay
 * cliente, se crea con la entrada (ver ClientSelect).
 */
export default function QuickAddEntry({ onClose }: { onClose: () => void }) {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [duration, setDuration] = useState<number | null>(60);
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    supabase
      .from("clients")
      .select("*")
      .eq("archived", false)
      .order("name")
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          setClients([]);
          return;
        }
        setClients(data);
        if (data.length === 1) setClientId(data[0].id);
      });
  }, []);

  const creatingClient = clients !== null && (clients.length === 0 || clientId === NEW_CLIENT_VALUE);
  const canSubmit =
    clients !== null &&
    duration != null &&
    (creatingClient ? newClientName.trim().length > 0 : clientId !== "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || duration == null) return;
    setSaving(true);
    setError(null);
    let targetClientId = clientId;
    let clientName = clients?.find((c) => c.id === clientId)?.name ?? "";
    if (creatingClient) {
      const created = await createClientQuick({ name: newClientName, source: "quick_add" });
      if (!created.ok) {
        setSaving(false);
        if (created.limit) setShowUpgrade(true);
        else setError(created.message);
        return;
      }
      targetClientId = created.client.id;
      clientName = created.client.name;
      // Si la entrada falla, que el reintento use este cliente y no cree otro.
      setClients((cur) => [...(cur ?? []), created.client]);
      setClientId(created.client.id);
      setNewClientName("");
    }
    const { error: err } = await supabase.from("time_entries").insert({
      client_id: targetClientId,
      entry_date: date,
      duration_minutes: duration,
      description,
      billable,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    capture("time_entry_created", { source: "quick_add", duration_minutes: duration, billable });
    emitEntryAdded();
    showToast(`✓ ${formatDuration(duration)} registradas a ${clientName}`);
    onClose();
  }

  return (
    <>
      <Modal title="Registrar tiempo" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              ¿En qué trabajaste?
            </label>
            <input
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la tarea"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {clients !== null && clients.length === 0 ? "Cliente o proyecto" : "Cliente"}
            </label>
            {clients === null ? (
              <select
                disabled
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-400"
              >
                <option>Cargando…</option>
              </select>
            ) : (
              <ClientSelect
                clients={clients}
                value={clientId}
                onChange={setClientId}
                newName={newClientName}
                onNewNameChange={setNewClientName}
              />
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Duración</label>
              <DurationInput value={duration} onChange={setDuration} />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <BillableCheckbox checked={billable} onChange={setBillable} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-between pt-2">
            <span className="hidden text-[11px] text-slate-400 sm:block">
              Enter para guardar · Esc para cerrar
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !canSubmit}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Registrar"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
      {showUpgrade && <UpgradeModal reason="clients" onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
