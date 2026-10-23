import type { Invoice, InvoiceStatus } from "./types";
import { toISODate } from "./format";

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Borrador",
  sent: "Enviado",
  paid: "Pagado",
};

export const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
};

type StatusFields = Pick<Invoice, "status" | "due_date">;

/**
 * "Vencido" es un estado derivado, no persistido: un invoice enviado cuyo
 * vencimiento ya pasó. Al marcarlo pagado deja de estarlo solo.
 */
export function isInvoiceOverdue(invoice: StatusFields): boolean {
  return (
    invoice.status === "sent" && !!invoice.due_date && invoice.due_date < toISODate(new Date())
  );
}

export function invoiceStatusLabel(invoice: StatusFields): string {
  return isInvoiceOverdue(invoice) ? "Vencido" : STATUS_LABELS[invoice.status];
}

export function invoiceStatusStyle(invoice: StatusFields): string {
  return isInvoiceOverdue(invoice) ? "bg-red-50 text-red-700" : STATUS_STYLES[invoice.status];
}
