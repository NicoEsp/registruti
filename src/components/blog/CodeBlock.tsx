"use client";

import { useState } from "react";

/** Bloque de código con botón de copiar. Va dentro de `.article` (que estila el <pre>). */
export default function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard bloqueado: no hacemos nada */
    }
  }

  return (
    <div className="relative">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
      >
        {copied ? "✓ Copiado" : "Copiar"}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
