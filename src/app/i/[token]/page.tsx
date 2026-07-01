"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InvoiceDocument from "@/components/InvoiceDocument";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import { supabase } from "@/lib/supabase";
import type { PublicInvoice } from "@/lib/types";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/invoiceStatus";

export default function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .rpc("get_public_invoice", { p_token: token })
      .then(({ data: result, error: err }) => {
        if (err) setError(err.message);
        else if (!result) setError("Factura no encontrada");
        else setData(result as PublicInvoice);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Cargando…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="rounded-lg bg-red-50 px-6 py-4 text-sm text-red-700">
          {error ?? "Factura no encontrada"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-6 flex items-center justify-between">
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[data.invoice.status]}`}
          >
            {STATUS_LABELS[data.invoice.status]}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                downloadInvoicePdf({
                  invoice: data.invoice,
                  clientName: data.client.name,
                  clientContact: data.client.contact_name,
                  clientEmail: data.client.email,
                  entries: data.entries,
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
          </div>
        </div>
        <InvoiceDocument
          invoice={data.invoice}
          clientName={data.client.name}
          clientContact={data.client.contact_name}
          clientEmail={data.client.email}
          entries={data.entries}
        />
      </div>
    </div>
  );
}
