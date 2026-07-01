"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import InvoiceDocument from "@/components/InvoiceDocument";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import { supabase } from "@/lib/supabase";
import type { Client, Invoice, InvoiceStatus, TimeEntry } from "@/lib/types";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/invoiceStatus";

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
    const [clientRes, entriesRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", inv.client_id).single(),
      supabase.from("time_entries").select("*").eq("invoice_id", inv.id).order("entry_date"),
    ]);
    setInvoice(inv);
    setClient(clientRes.data);
    setEntries(entriesRes.data ?? []);
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
    if (
      !confirm(
        "¿Eliminar esta factura? Las horas asociadas volverán a quedar disponibles para facturar."
      )
    )
      return;
    const { error: err } = await supabase.from("invoices").delete().eq("id", invoice.id);
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
          className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[invoice.status]}`}
        >
          {STATUS_LABELS[invoice.status]}
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
            onClick={() =>
              downloadInvoicePdf({
                invoice,
                clientName: client.name,
                clientContact: client.contact_name,
                clientEmail: client.email,
                entries,
              })
            }
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Descargar PDF
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Imprimir
          </button>
          <button
            onClick={handleDelete}
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
    </div>
  );
}
