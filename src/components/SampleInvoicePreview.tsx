"use client";

import InvoiceDocument from "@/components/InvoiceDocument";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import {
  SAMPLE_CLIENT,
  SAMPLE_ENTRIES,
  SAMPLE_INVOICE,
  SAMPLE_ISSUER,
} from "@/lib/sampleInvoice";

/**
 * La factura de muestra tal como la vería el cliente, con el PDF descargable:
 * ver el documento real es lo que le permite a alguien que viene de Toggl (o
 * de armar la factura a mano) decidir si esto le sirve.
 */
export default function SampleInvoicePreview() {
  return (
    <div>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          Ejemplo
        </span>
        <button
          onClick={() =>
            downloadInvoicePdf({
              invoice: SAMPLE_INVOICE,
              clientName: SAMPLE_CLIENT.name,
              clientContact: SAMPLE_CLIENT.contact_name,
              clientEmail: SAMPLE_CLIENT.email,
              entries: SAMPLE_ENTRIES,
              issuer: SAMPLE_ISSUER,
            })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
        >
          Descargar PDF de ejemplo
        </button>
      </div>
      <InvoiceDocument
        invoice={SAMPLE_INVOICE}
        clientName={SAMPLE_CLIENT.name}
        clientContact={SAMPLE_CLIENT.contact_name}
        clientEmail={SAMPLE_CLIENT.email}
        entries={SAMPLE_ENTRIES}
        issuer={SAMPLE_ISSUER}
      />
    </div>
  );
}
