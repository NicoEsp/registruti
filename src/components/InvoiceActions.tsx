"use client";

import { downloadInvoicePdf, type InvoicePdfData } from "@/lib/invoicePdf";

/**
 * Botones de acción de una factura (descargar PDF / imprimir), compartidos entre
 * la vista autenticada y el link público. Se renderizan como fragmento para
 * integrarse con el layout de botones de cada página.
 */
export default function InvoiceActions(props: InvoicePdfData) {
  return (
    <>
      <button
        onClick={() => downloadInvoicePdf(props)}
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
    </>
  );
}
