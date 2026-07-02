/**
 * Mini bus de eventos de la app (window CustomEvents) para coordinar acciones
 * globales — command palette, registro rápido y toasts — sin acoplar páginas.
 */
export const ENTRY_ADDED_EVENT = "registruti:entry-added";
export const NEW_INVOICE_EVENT = "registruti:new-invoice";
export const NEW_CLIENT_EVENT = "registruti:new-client";
export const TOAST_EVENT = "registruti:toast";

export function emitEntryAdded(): void {
  window.dispatchEvent(new CustomEvent(ENTRY_ADDED_EVENT));
}

export function showToast(message: string): void {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}

/** Abre el modal de nueva factura: dispara el evento si ya estamos en /invoices, si no navega. */
export function openNewInvoice(pathname: string, push: (href: string) => void): void {
  if (pathname === "/invoices") window.dispatchEvent(new CustomEvent(NEW_INVOICE_EVENT));
  else push("/invoices?nueva=1");
}

/** Abre el alta de cliente: dispara el evento si ya estamos en /clients, si no navega. */
export function openNewClient(pathname: string, push: (href: string) => void): void {
  if (pathname === "/clients") window.dispatchEvent(new CustomEvent(NEW_CLIENT_EVENT));
  else push("/clients?nuevo=1");
}
