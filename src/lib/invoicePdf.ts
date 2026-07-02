import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, TimeEntry } from "@/lib/types";
import { SITE_NAME } from "@/lib/site";
import { parseISODate } from "@/lib/format";

type EntryRow = Pick<TimeEntry, "entry_date" | "duration_minutes" | "description">;

export interface InvoicePdfData {
  invoice: Omit<Invoice, "user_id"> | Invoice;
  clientName: string;
  clientContact?: string | null;
  clientEmail?: string | null;
  entries: EntryRow[];
}

// Paleta inspirada en la factura de referencia: azul oscuro para títulos/total,
// gris para labels y líneas suaves.
const NAVY: [number, number, number] = [43, 42, 77];
const INK: [number, number, number] = [51, 55, 69];
const MUTED: [number, number, number] = [128, 133, 148];
const LINE: [number, number, number] = [228, 230, 236];

/** DD-MM-YYYY, como el invoice de referencia. */
function formatDashDate(iso: string): string {
  const d = parseISODate(iso);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
}

/** Horas en decimal: 1, 1.5, 0.75 (sin ceros de más). */
function formatQty(minutes: number): string {
  const hours = minutes / 60;
  return hours % 1 === 0 ? hours.toString() : hours.toFixed(2).replace(/0$/, "");
}

/** Monto numérico sin símbolo (ej. 1.234,56). */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Construye el PDF de la factura replicando el layout de la factura de referencia:
 * título "Factura", metadatos, "Facturado a", tabla DESCRIPCIÓN/CANTIDAD/IMPORTE
 * con el detalle de lo trabajado, y SUBTOTAL + TOTAL.
 */
export function buildInvoicePdf({
  invoice,
  clientName,
  clientContact,
  clientEmail,
  entries,
}: InvoicePdfData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 18;
  const rightX = pageWidth - marginX;
  let y = 24;

  // Marca (discreta, arriba a la derecha) + título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(SITE_NAME, rightX, y - 6, { align: "right" });

  doc.setFontSize(30);
  doc.setTextColor(...NAVY);
  doc.text("Factura", marginX, y + 4);
  y += 16;

  // Metadatos (labels en negrita + valores)
  const meta: [string, string][] = [
    ["N° de factura:", invoice.invoice_number],
    ["Fecha de emisión:", formatDashDate(invoice.issue_date)],
  ];
  if (invoice.due_date) meta.push(["Vencimiento:", formatDashDate(invoice.due_date)]);
  meta.push([
    "Período:",
    `${formatDashDate(invoice.period_start)} – ${formatDashDate(invoice.period_end)}`,
  ]);

  doc.setFontSize(9.5);
  const valueX = marginX + 34;
  for (const [label, value] of meta) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    doc.text(value, valueX, y);
    y += 6;
  }

  y += 8;

  // Facturado a
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text("Facturado a:", marginX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(clientName, marginX, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  if (clientContact) {
    doc.text(clientContact, marginX, y);
    y += 5;
  }
  if (clientEmail) {
    doc.text(clientEmail, marginX, y);
    y += 5;
  }

  y += 6;

  // Tabla: DESCRIPCIÓN · CANTIDAD · IMPORTE
  autoTable(doc, {
    startY: y,
    theme: "plain",
    head: [["DESCRIPCIÓN", "CANTIDAD", "IMPORTE"]],
    body: entries.map((e) => [
      e.description || "Trabajo de consultoría",
      formatQty(e.duration_minutes),
      formatAmount((e.duration_minutes / 60) * invoice.hourly_rate),
    ]),
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 9.5,
      cellPadding: { top: 4.5, bottom: 4.5, left: 0, right: 0 },
      textColor: INK,
      lineColor: LINE,
      lineWidth: { bottom: 0.1 },
    },
    headStyles: {
      fontStyle: "bold",
      fontSize: 8.5,
      textColor: MUTED,
      lineColor: LINE,
      lineWidth: { bottom: 0.3 },
      cellPadding: { top: 2, bottom: 4, left: 0, right: 0 },
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 30 },
      2: { halign: "right", cellWidth: 34 },
    },
  });

  const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const code = invoice.currency;

  // SUBTOTAL
  let ty = afterTable + 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text("SUBTOTAL", marginX, ty);
  doc.setTextColor(...INK);
  doc.text(`${formatAmount(invoice.total_amount)} ${code}`, rightX, ty, { align: "right" });

  // TOTAL (destacado, abajo a la derecha)
  ty += 16;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("TOTAL", rightX, ty - 7, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  doc.text(`${formatAmount(invoice.total_amount)} ${code}`, rightX, ty, { align: "right" });

  // Notas
  if (invoice.notes) {
    ty += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(doc.splitTextToSize(invoice.notes, rightX - marginX), marginX, ty);
  }

  // Pie
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Generado con ${SITE_NAME} · registruti.app`, marginX, footerY);

  return doc;
}

/** Genera y descarga el PDF de la factura. */
export function downloadInvoicePdf(data: InvoicePdfData): void {
  const doc = buildInvoicePdf(data);
  doc.save(`${data.invoice.invoice_number}.pdf`);
}
