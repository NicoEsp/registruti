import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, TimeEntry } from "@/lib/types";
import { formatDuration, formatMoney, formatShortDate } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";

type EntryRow = Pick<TimeEntry, "entry_date" | "duration_minutes" | "description">;

export interface InvoicePdfData {
  invoice: Omit<Invoice, "user_id"> | Invoice;
  clientName: string;
  clientContact?: string | null;
  clientEmail?: string | null;
  entries: EntryRow[];
}

const INK = { slate900: [15, 23, 42] as const, slate500: [100, 116, 139] as const, slate200: [226, 232, 240] as const, indigo: [79, 70, 229] as const };

/**
 * Construye un PDF con el detalle de la factura (fechas, tareas, horas y montos)
 * replicando el documento en pantalla. Devuelve la instancia jsPDF.
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
  const marginX = 16;
  const rightX = pageWidth - marginX;
  let y = 20;

  // Marca
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INK.indigo);
  doc.text(SITE_NAME, marginX, y);

  // Título "Factura" + número
  doc.setTextColor(...INK.slate900);
  doc.setFontSize(22);
  doc.text("Factura", marginX, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK.slate500);
  doc.text(invoice.invoice_number, marginX, y + 18);

  // Metadatos a la derecha
  doc.setFontSize(9);
  const metaLines = [
    `Emitida: ${formatShortDate(invoice.issue_date)}`,
    `Período: ${formatShortDate(invoice.period_start)} – ${formatShortDate(invoice.period_end)}`,
  ];
  doc.text(metaLines, rightX, y + 12, { align: "right" });

  y += 30;

  // Facturar a
  doc.setFontSize(8);
  doc.setTextColor(...INK.slate500);
  doc.text("FACTURAR A", marginX, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK.slate900);
  doc.text(clientName, marginX, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK.slate500);
  let billY = y + 11;
  if (clientContact) {
    doc.text(clientContact, marginX, billY);
    billY += 5;
  }
  if (clientEmail) {
    doc.text(clientEmail, marginX, billY);
    billY += 5;
  }

  y = billY + 4;

  // Tabla de entradas
  autoTable(doc, {
    startY: y,
    head: [["Fecha", "Descripción", "Horas", "Importe"]],
    body: entries.map((e) => [
      formatShortDate(e.entry_date),
      e.description || "Trabajo de consultoría",
      formatDuration(e.duration_minutes),
      formatMoney((e.duration_minutes / 60) * invoice.hourly_rate, invoice.currency),
    ]),
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [30, 41, 59] },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [100, 116, 139],
      fontStyle: "bold",
      lineWidth: { bottom: 0.3 },
      lineColor: [...INK.slate200],
    },
    bodyStyles: { lineWidth: { bottom: 0.1 }, lineColor: [241, 245, 249] },
    columnStyles: {
      0: { cellWidth: 26 },
      2: { halign: "right", cellWidth: 22 },
      3: { halign: "right", cellWidth: 34 },
    },
  });

  // Totales
  const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  let ty = afterTable + 10;
  const labelX = rightX - 60;

  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 9);
    const [lr, lg, lb] = bold ? INK.slate900 : INK.slate500;
    doc.setTextColor(lr, lg, lb);
    doc.text(label, labelX, ty);
    doc.setTextColor(...INK.slate900);
    doc.text(value, rightX, ty, { align: "right" });
    ty += bold ? 8 : 6;
  };

  totalRow("Horas totales", formatDuration(invoice.total_minutes));
  totalRow("Tarifa por hora", formatMoney(invoice.hourly_rate, invoice.currency));
  doc.setDrawColor(...INK.slate200);
  doc.line(labelX, ty - 2, rightX, ty - 2);
  ty += 2;
  totalRow("Total", formatMoney(invoice.total_amount, invoice.currency), true);

  // Notas
  if (invoice.notes) {
    ty += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK.slate500);
    const noteLines = doc.splitTextToSize(invoice.notes, rightX - marginX);
    doc.text(noteLines, marginX, ty);
  }

  // Pie
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(8);
  doc.setTextColor(...INK.slate500);
  doc.text(`Generado con ${SITE_NAME} · registruti.app`, marginX, footerY);

  return doc;
}

/** Genera y descarga el PDF de la factura. */
export function downloadInvoicePdf(data: InvoicePdfData): void {
  const doc = buildInvoicePdf(data);
  doc.save(`${data.invoice.invoice_number}.pdf`);
}
