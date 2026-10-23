import type { Invoice, TimeEntry } from "@/lib/types";
import type { InvoiceIssuer } from "@/lib/invoiceIssuer";

/**
 * Factura de muestra. Se ve en la vista vacía de Facturas y en la página
 * pública /factura-de-ejemplo: la factura es lo que diferencia a Registruti
 * de un tracker, y era lo último que un usuario nuevo llegaba a ver (había
 * que registrarse, crear un cliente, cargar horas y recién ahí generarla).
 *
 * Fechas fijas a propósito: lo que importa es la forma del documento, no que
 * parezca de hoy. El cliente y el número son los mismos del mock de la landing.
 */
export const SAMPLE_INVOICE: Omit<Invoice, "user_id"> = {
  id: "ejemplo",
  client_id: "ejemplo",
  invoice_number: "INV-0007",
  period_start: "2026-09-01",
  period_end: "2026-09-30",
  issue_date: "2026-10-01",
  due_date: "2026-10-15",
  status: "sent",
  hourly_rate: 40,
  currency: "USD",
  total_minutes: 1125,
  total_amount: 750,
  notes: null,
  share_token: "ejemplo",
  created_at: "2026-10-01T12:00:00Z",
};

export const SAMPLE_CLIENT = {
  name: "Estudio Galley",
  contact_name: "Laura Galley",
  email: "laura@estudiogalley.com",
};

export const SAMPLE_ISSUER: InvoiceIssuer = {
  businessName: "Mariana Pérez · Diseño UX",
  taxId: "27-12345678-9",
  email: "hola@marianaperez.dev",
  address: "Córdoba, Argentina",
  paymentDetails:
    "Transferencia en USD: alias mariana.dev.usd\nPayPal: hola@marianaperez.dev\nWise: @marianaperez",
};

/** Suman 18:45 (1125 min), que a 40 USD/h da los 750 del total. */
export const SAMPLE_ENTRIES: Pick<TimeEntry, "entry_date" | "duration_minutes" | "description">[] = [
  { entry_date: "2026-09-02", duration_minutes: 180, description: "Kickoff y relevamiento del sitio actual" },
  { entry_date: "2026-09-04", duration_minutes: 240, description: "Wireframes de la home y el catálogo" },
  { entry_date: "2026-09-09", duration_minutes: 150, description: "Diseño visual: home" },
  { entry_date: "2026-09-11", duration_minutes: 210, description: "Diseño visual: catálogo y ficha de producto" },
  { entry_date: "2026-09-16", duration_minutes: 120, description: "Revisión con el cliente y ajustes" },
  { entry_date: "2026-09-23", duration_minutes: 225, description: "Entrega de assets y guía de estilos" },
];
