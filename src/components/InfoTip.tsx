"use client";

import { useState } from "react";

/**
 * Ícono de ayuda con tooltip liviano: hover/focus en desktop, tap en mobile
 * (donde no existe hover). El globo se ancla al borde izquierdo del ícono y
 * se extiende hacia la derecha, que en todos los usos actuales tiene espacio.
 */
export default function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Más información"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-400 transition hover:border-indigo-400 hover:text-indigo-600 focus:border-indigo-400 focus:text-indigo-600 focus:outline-none"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-0 z-30 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-normal leading-relaxed text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
