"use client";

import { useEffect, useRef } from "react";

/**
 * Mini bus de eventos de la app (window CustomEvents) para coordinar acciones
 * globales — command palette, registro rápido y toasts — sin acoplar páginas.
 * Los nombres de evento y de query param viven acá, una sola vez.
 */
export const ENTRY_ADDED_EVENT = "registruti:entry-added";
export const NEW_INVOICE_EVENT = "registruti:new-invoice";
export const NEW_CLIENT_EVENT = "registruti:new-client";
export const TOAST_EVENT = "registruti:toast";

export const NEW_INVOICE_PARAM = "nueva";
export const NEW_CLIENT_PARAM = "nuevo";
export const QUICK_ADD_PARAM = "registrar";

export function emitEntryAdded(): void {
  window.dispatchEvent(new CustomEvent(ENTRY_ADDED_EVENT));
}

export function showToast(message: string): void {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}

/** Abre el modal de nueva factura: dispara el evento si ya estamos en /invoices, si no navega. */
export function openNewInvoice(pathname: string, push: (href: string) => void): void {
  if (pathname === "/invoices") window.dispatchEvent(new CustomEvent(NEW_INVOICE_EVENT));
  else push(`/invoices?${NEW_INVOICE_PARAM}=1`);
}

/** Abre el alta de cliente: dispara el evento si ya estamos en /clients, si no navega. */
export function openNewClient(pathname: string, push: (href: string) => void): void {
  if (pathname === "/clients") window.dispatchEvent(new CustomEvent(NEW_CLIENT_EVENT));
  else push(`/clients?${NEW_CLIENT_PARAM}=1`);
}

/**
 * Suscripción a un evento del bus con cleanup automático. El handler se lee
 * de un ref, así que puede ser una arrow inline sin re-suscribir por render.
 */
export function useAppEvent(name: string, handler: () => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const h = () => ref.current();
    window.addEventListener(name, h);
    return () => window.removeEventListener(name, h);
  }, [name]);
}

/**
 * Consume un query param de apertura (?nueva=1 / ?nuevo=1) al montar: si está
 * presente lo limpia de la URL (replaceState) y ejecuta onOpen una sola vez.
 */
export function useOpenParam(param: string, onOpen: () => void): void {
  const ref = useRef(onOpen);
  ref.current = onOpen;
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get(param) !== "1") return;
    url.searchParams.delete(param);
    window.history.replaceState(null, "", url.pathname + url.search);
    ref.current();
  }, [param]);
}
