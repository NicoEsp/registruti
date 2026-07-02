import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { Invoice, TimeEntry } from "@/lib/types";
import { SITE_NAME } from "@/lib/site";
import { parseISODate } from "@/lib/format";

// jspdf-autotable adjunta `lastAutoTable` a la instancia de jsPDF pero no la
// declara en sus tipos; la exponemos de forma tipada para evitar casts frágiles.
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

type EntryRow = Pick<TimeEntry, "entry_date" | "duration_minutes" | "description">;

export interface InvoiceIssuer {
  businessName?: string | null;
  taxId?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface InvoicePdfData {
  invoice: Omit<Invoice, "user_id"> | Invoice;
  clientName: string;
  clientContact?: string | null;
  clientEmail?: string | null;
  entries: EntryRow[];
  issuer?: InvoiceIssuer | null;
}

function hasIssuerData(issuer?: InvoiceIssuer | null): issuer is InvoiceIssuer {
  return !!issuer && !!(issuer.businessName || issuer.taxId || issuer.email || issuer.address);
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
  issuer,
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
  const startY = y;
  const rightColX = marginX + 95;

  // Columna izquierda: Facturado a (cliente)
  let leftY = startY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text("Facturado a:", marginX, leftY);
  leftY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(clientName, marginX, leftY);
  leftY += 5;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  if (clientContact) {
    doc.text(clientContact, marginX, leftY);
    leftY += 5;
  }
  if (clientEmail) {
    doc.text(clientEmail, marginX, leftY);
    leftY += 5;
  }

  // Columna derecha: De (emisor), si hay datos cargados
  let rightY = startY;
  if (hasIssuerData(issuer)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    doc.text("De:", rightColX, rightY);
    rightY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    if (issuer.businessName) {
      doc.text(issuer.businessName, rightColX, rightY);
      rightY += 5;
    }
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    if (issuer.taxId) {
      doc.text(`CUIT/ID: ${issuer.taxId}`, rightColX, rightY);
      rightY += 5;
    }
    if (issuer.email) {
      doc.text(issuer.email, rightColX, rightY);
      rightY += 5;
    }
    if (issuer.address) {
      const addrLines = doc.splitTextToSize(issuer.address, rightX - rightColX);
      doc.text(addrLines, rightColX, rightY);
      rightY += addrLines.length * 5;
    }
  }

  y = Math.max(leftY, rightY) + 6;

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

  const afterTable = doc.lastAutoTable.finalY;
  const code = invoice.currency;
  const pageHeight = doc.internal.pageSize.getHeight();

  // Si el bloque de totales/notas no entra en lo que queda de página
  // (facturas con muchas entradas), lo pasamos a una hoja nueva para que no
  // se dibuje fuera del área imprimible.
  const noteLines = invoice.notes ? doc.splitTextToSize(invoice.notes, rightX - marginX) : [];
  const totalsBlockHeight = 25 + (invoice.notes ? 14 + noteLines.length * 4 : 0);
  let ty = afterTable + 9;
  if (ty + totalsBlockHeight > pageHeight - 20) {
    doc.addPage();
    ty = 24;
  }

  // SUBTOTAL
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
    doc.text(noteLines, marginX, ty);
  }

  // Pie
  const footerY = pageHeight - 12;
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
