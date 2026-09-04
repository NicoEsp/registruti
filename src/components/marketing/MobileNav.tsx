"use client";

import { useState } from "react";
import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/nav";

/**
 * Menú del header en mobile. Antes los links del header eran `hidden md:flex`
 * sin alternativa, así que abajo de 768px la navegación directamente no
 * existía: se llegaba al blog o a la calculadora solo desde el footer.
 *
 * El panel se posiciona contra el <header> (que es sticky, o sea contenedor de
 * posicionamiento) para caer justo debajo de la barra.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
          {open ? (
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-lg"
        >
          <nav aria-label="Menú" className="mx-auto max-w-6xl px-4 py-3">
            <ul className="flex flex-col">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
