"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ConfirmDialog from "@/components/ConfirmDialog";
import InvoiceDocument from "@/components/InvoiceDocument";
import InvoiceActions from "@/components/InvoiceActions";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/appEvents";
import { fetchIssuer } from "@/lib/profile";
import type { InvoiceIssuer } from "@/lib/invoicePdf";
import type { Client, Invoice, InvoiceStatus, TimeEntry } from "@/lib/types";
import { invoiceStatusLabel, invoiceStatusStyle } from "@/lib/invoiceStatus";

export default function InvoiceDetailPage() {
  return (
    <AppShell>
      <InvoiceDetail />
    </AppShell>
  );
}

function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [issuer, setIssuer] = useState<InvoiceIssuer | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingRegen, setConfirmingRegen] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();
    if (invErr || !inv) {
      setError(invErr?.message ?? "Factura no encontrada");
      setLoading(false);
      return;
    }
    const [clientRes, entriesRes, issuerData] = await Promise.all([
      supabase.from("clients").select("*").eq("id", inv.client_id).single(),
      supabase.from("time_entries").select("*").eq("invoice_id", inv.id).order("entry_date"),
      fetchIssuer(),
    ]);
    setInvoice(inv);
    setClient(clientRes.data);
    setEntries(entriesRes.data ?? []);
    setIssuer(issuerData);
    setError(null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function updateStatus(status: InvoiceStatus) {
    if (!invoice) return;
    const { error: err } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoice.id);
    if (err) setError(err.message);
    else loadData();
  }

  async function handleDelete() {
    if (!invoice) return;
    const { error: err } = await supabase.from("invoices").delete().eq("id", invoice.id);
    setConfirmingDelete(false);
    if (err) setError(err.message);
    else router.push("/invoices");
  }

  function copyPublicLink() {
    if (!invoice) return;
    const url = `${window.location.origin}/i/${invoice.share_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Rota el token: el link compartido anteriormente deja de funcionar.
  async function regenerateLink() {
    if (!invoice) return;
    setRegenBusy(true);
    const { data, error: err } = await supabase.rpc("regenerate_share_token", {
      p_invoice_id: invoice.id,
    });
    setRegenBusy(false);
    setConfirmingRegen(false);
    if (err || typeof data !== "string") {
      setError(err?.message ?? "No se pudo regenerar el link (¿migración sin aplicar?).");
      return;
    }
    setInvoice({ ...invoice, share_token: data });
    showToast("✓ Link regenerado: el anterior dejó de funcionar");
  }

  if (loading) return <p className="text-sm text-slate-400">Cargando…</p>;
  if (error || !invoice || !client)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error ?? "Factura no encontrada"}
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-6 flex flex-wrap items-center gap-3">
        <Link href="/invoices" className="text-sm text-slate-500 hover:text-slate-800">
          ← Facturas
        </Link>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${invoiceStatusStyle(invoice)}`}
        >
          {invoiceStatusLabel(invoice)}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {invoice.status === "draft" && (
            <button
              onClick={() => updateStatus("sent")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Marcar enviada
            </button>
          )}
          {invoice.status === "sent" && (
            <button
              onClick={() => updateStatus("paid")}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100"
            >
              Marcar pagada
            </button>
          )}
          <button
            onClick={copyPublicLink}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            {copied ? "¡Copiado!" : "Copiar link público"}
          </button>
          <button
            onClick={() => setConfirmingRegen(true)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            title="Genera un link nuevo e invalida el anterior"
          >
            Regenerar link
          </button>
          <InvoiceActions
            invoice={invoice}
            clientName={client.name}
            clientContact={client.contact_name}
            clientEmail={client.email}
            entries={entries}
            issuer={issuer}
          />
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      </div>

      <InvoiceDocument
        invoice={invoice}
        clientName={client.name}
        clientContact={client.contact_name}
        clientEmail={client.email}
        entries={entries}
      />

      {confirmingDelete && (
        <ConfirmDialog
          title="Eliminar factura"
          message={`Se va a eliminar la factura ${invoice.invoice_number}. Las horas asociadas vuelven a quedar disponibles para facturar.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}

      {confirmingRegen && (
        <ConfirmDialog
          title="Regenerar link público"
          message="Se genera un link nuevo y el que compartiste hasta ahora deja de funcionar. Usalo si el link se filtró o lo tiene alguien que no debería."
          confirmLabel="Regenerar"
          busy={regenBusy}
          onConfirm={regenerateLink}
          onCancel={() => setConfirmingRegen(false)}
        />
      )}
    </div>
  );
}
