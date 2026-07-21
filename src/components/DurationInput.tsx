"use client";

import { useState } from "react";
import { clampDuration, formatDuration, parseDuration } from "@/lib/format";

// Hasta 2:00: tres chips entran en una sola fila incluso en el form inline
// del tracker; para duraciones más largas está el campo de texto.
const QUICK_CHIPS = [30, 60, 120];

/**
 * Campo de duración de escritura libre: entiende "1:30", "1.5", "90m", "2h30"
 * y números pelados ("2" → 2:00, "45" → 0:45). Normaliza al múltiplo de 15 más
 * cercano dentro de 0:15–8:00 y lo muestra al salir del campo. Mientras el
 * texto no se entienda, `onChange(null)` avisa al form para deshabilitar el
 * guardado; el estado de error recién se muestra al salir del campo, para no
 * marcar rojo un valor a medio tipear.
 */
export default function DurationInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (minutes: number | null) => void;
}) {
  const [text, setText] = useState(value != null ? formatDuration(value) : "");
  const [focused, setFocused] = useState(false);

  function handleChange(raw: string) {
    setText(raw);
    const parsed = parseDuration(raw);
    onChange(parsed != null && parsed > 0 ? clampDuration(parsed) : null);
  }

  function handleBlur() {
    setFocused(false);
    if (value != null) setText(formatDuration(value));
  }

  function handleChip(minutes: number) {
    setText(formatDuration(minutes));
    onChange(minutes);
  }

  const trimmed = text.trim();
  const showError = !focused && trimmed !== "" && value == null;
  // Vista previa de lo interpretado, solo cuando difiere de lo tipeado.
  const preview = value != null && trimmed !== "" && trimmed !== formatDuration(value);

  return (
    <div>
      <input
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder="1:30"
        inputMode="text"
        aria-invalid={showError}
        className={`w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none ${
          showError ? "border-red-400" : "border-slate-300 focus:border-indigo-500"
        }`}
      />
      <div className="mt-1 flex items-center gap-1.5">
        {QUICK_CHIPS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => handleChip(minutes)}
            className={`rounded-md border px-1.5 py-0.5 font-mono text-[11px] transition ${
              value === minutes
                ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"
            }`}
          >
            {formatDuration(minutes)}
          </button>
        ))}
      </div>
      {showError ? (
        <p className="mt-1 text-[11px] text-red-600">Ej: 1:30, 1.5 o 90m</p>
      ) : preview ? (
        <p className="mt-1 font-mono text-[11px] text-slate-500">= {formatDuration(value!)} h</p>
      ) : null}
    </div>
  );
}
