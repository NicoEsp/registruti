import type { Invoice, InvoiceStatus } from "./types";
import { toISODate } from "./format";

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
};

export const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
};

type StatusFields = Pick<Invoice, "status" | "due_date">;

/**
 * "Vencida" es un estado derivado, no persistido: una factura enviada cuyo
 * vencimiento ya pasó. Al marcarla pagada deja de estarlo sola.
 */
export function isInvoiceOverdue(invoice: StatusFields): boolean {
  return (
    invoice.status === "sent" && !!invoice.due_date && invoice.due_date < toISODate(new Date())
  );
}

export function invoiceStatusLabel(invoice: StatusFields): string {
  return isInvoiceOverdue(invoice) ? "Vencida" : STATUS_LABELS[invoice.status];
}

export function invoiceStatusStyle(invoice: StatusFields): string {
  return isInvoiceOverdue(invoice) ? "bg-red-50 text-red-700" : STATUS_STYLES[invoice.status];
}
