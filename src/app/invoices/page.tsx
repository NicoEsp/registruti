"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import type { Client, Invoice, TimeEntry } from "@/lib/types";
import { formatDuration, formatMoney, formatShortDate, toISODate } from "@/lib/format";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/invoiceStatus";

export default function InvoicesPage() {
  return (
    <AppShell>
      <Invoices />
    </AppShell>
  );
}

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [invoicesRes, clientsRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("name"),
    ]);
    if (invoicesRes.error || clientsRes.error) {
      setError(invoicesRes.error?.message ?? clientsRes.error?.message ?? null);
    } else {
      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Facturas</h1>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nueva factura
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : invoices.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          Todavía no generaste facturas. Creá la primera a partir de tus horas trackeadas.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Horas</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{clientById.get(inv.client_id)?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatShortDate(inv.period_start)} – {formatShortDate(inv.period_end)}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatDuration(inv.total_minutes)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatMoney(inv.total_amount, inv.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[inv.status]}`}
                    >
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NewInvoiceModal
          clients={clients.filter((c) => !c.archived)}
          invoiceCount={invoices.length}
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function NewInvoiceModal({
  clients,
  invoiceCount,
  onClose,
  onCreated,
}: {
  clients: Client[];
  invoiceCount: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const now = new Date();
  const [clientId, setClientId] = useState("");
  const [from, setFrom] = useState(toISODate(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
  const [preview, setPreview] = useState<TimeEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const client = clients.find((c) => c.id === clientId);

  useEffect(() => {
    if (!clientId) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("time_entries")
      .select("*")
      .eq("client_id", clientId)
      .eq("billable", true)
      .is("invoice_id", null)
      .gte("entry_date", from)
      .lte("entry_date", to)
      .order("entry_date")
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        else {
          setPreview(data);
          setError(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, from, to]);

  const totalMinutes = preview?.reduce((s, e) => s + e.duration_minutes, 0) ?? 0;
  const totalAmount = client ? (totalMinutes / 60) * client.hourly_rate : 0;

  async function handleCreate() {
    if (!client || !preview || preview.length === 0) return;
    setBusy(true);
    setError(null);
    const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(4, "0")}`;
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        client_id: client.id,
        invoice_number: invoiceNumber,
        period_start: from,
        period_end: to,
        hourly_rate: client.hourly_rate,
        currency: client.currency,
        total_minutes: totalMinutes,
        total_amount: Math.round(totalAmount * 100) / 100,
      })
      .select()
      .single();
    if (invErr || !invoice) {
      setError(invErr?.message ?? "No se pudo crear la factura");
      setBusy(false);
      return;
    }
    const { error: updErr } = await supabase
      .from("time_entries")
      .update({ invoice_id: invoice.id })
      .in(
        "id",
        preview.map((e) => e.id)
      );
    setBusy(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    onCreated();
  }

  return (
    <Modal title="Nueva factura" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Cliente</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Elegir…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {client && preview && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            {preview.length === 0 ? (
              <p className="text-slate-500">
                No hay horas facturables sin facturar en este período.
              </p>
            ) : (
              <>
                <p className="flex justify-between">
                  <span className="text-slate-500">Entradas a facturar</span>
                  <span className="font-medium">{preview.length}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">Horas</span>
                  <span className="font-mono font-medium">{formatDuration(totalMinutes)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500">
                    Tarifa ({formatMoney(client.hourly_rate, client.currency)}/h)
                  </span>
                  <span className="font-semibold">
                    {formatMoney(totalAmount, client.currency)}
                  </span>
                </p>
              </>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={busy || !client || !preview || preview.length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "Creando…" : "Crear factura"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
