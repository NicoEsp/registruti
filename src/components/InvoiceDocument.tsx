import type { Invoice, TimeEntry } from "@/lib/types";
import { hasIssuerData, type InvoiceIssuer } from "@/lib/invoiceIssuer";
import {
  formatDuration,
  formatMoney,
  formatShortDate,
} from "@/lib/format";

type EntryRow = Pick<TimeEntry, "entry_date" | "duration_minutes" | "description">;

export default function InvoiceDocument({
  invoice,
  clientName,
  clientContact,
  clientEmail,
  entries,
  issuer,
}: {
  invoice: Omit<Invoice, "user_id"> | Invoice;
  clientName: string;
  clientContact?: string | null;
  clientEmail?: string | null;
  entries: EntryRow[];
  issuer?: InvoiceIssuer | null;
}) {
  const showIssuer = hasIssuerData(issuer);
  const paymentDetails = issuer?.paymentDetails?.trim();

  return (
    <div className="print-page rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Factura</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">{invoice.invoice_number}</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>
            Emitida: <span className="text-slate-900">{formatShortDate(invoice.issue_date)}</span>
          </p>
          <p>
            Período:{" "}
            <span className="text-slate-900">
              {formatShortDate(invoice.period_start)} – {formatShortDate(invoice.period_end)}
            </span>
          </p>
          {invoice.due_date && (
            <p>
              Vencimiento:{" "}
              <span className="text-slate-900">{formatShortDate(invoice.due_date)}</span>
            </p>
          )}
        </div>
      </div>

      <div className={`mb-8 grid gap-6 ${showIssuer ? "sm:grid-cols-2" : ""}`}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Facturar a</p>
          <p className="mt-1 font-medium">{clientName}</p>
          {clientContact && <p className="text-sm text-slate-500">{clientContact}</p>}
          {clientEmail && <p className="text-sm text-slate-500">{clientEmail}</p>}
        </div>
        {showIssuer && (
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">De</p>
            {issuer.businessName && <p className="mt-1 font-medium">{issuer.businessName}</p>}
            {issuer.taxId && <p className="text-sm text-slate-500">CUIT/ID: {issuer.taxId}</p>}
            {issuer.email && <p className="text-sm text-slate-500">{issuer.email}</p>}
            {issuer.address && (
              <p className="whitespace-pre-line text-sm text-slate-500">{issuer.address}</p>
            )}
          </div>
        )}
      </div>

      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-3">Descripción</th>
            <th className="py-2 pr-3">Fecha</th>
            <th className="py-2 pr-3 text-right">Horas</th>
            <th className="py-2 text-right">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((entry, i) => (
            <tr key={i}>
              <td className="py-2 pr-3">
                {entry.description || <span className="italic text-slate-400">Trabajo de consultoría</span>}
              </td>
              <td className="py-2 pr-3 whitespace-nowrap text-slate-500">
                {formatShortDate(entry.entry_date)}
              </td>
              <td className="py-2 pr-3 text-right font-mono">
                {formatDuration(entry.duration_minutes)}
              </td>
              <td className="py-2 text-right font-mono">
                {formatMoney((entry.duration_minutes / 60) * invoice.hourly_rate, invoice.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-full max-w-64 space-y-1 text-sm">
        <p className="flex justify-between">
          <span className="text-slate-500">Horas totales</span>
          <span className="font-mono">{formatDuration(invoice.total_minutes)}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-slate-500">Tarifa por hora</span>
          <span className="font-mono">{formatMoney(invoice.hourly_rate, invoice.currency)}</span>
        </p>
        <p className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(invoice.total_amount, invoice.currency)}</span>
        </p>
      </div>

      {invoice.notes && (
        <p className="mt-8 border-t border-slate-100 pt-4 text-sm text-slate-500">
          {invoice.notes}
        </p>
      )}

      {paymentDetails && (
        <div className="mt-8 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Datos de pago
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{paymentDetails}</p>
        </div>
      )}

      {/* Acá "factura" no es un comprobante de ARCA/DGI/SII: conviene que lo
          diga el propio documento, para quien lo emite y para quien lo recibe. */}
      <p className="mt-8 text-[11px] text-slate-400">
        Detalle de horas y monto a cobrar. No es un comprobante fiscal.
      </p>
    </div>
  );
}
