"use client";

import { useState } from "react";
import { clampDuration, formatDuration, parseDuration } from "@/lib/format";

const QUICK_CHIPS = [30, 60, 120, 240];

/**
 * Campo de duración de escritura libre: entiende "1:30", "1.5", "90m", "2h30"
 * y números pelados ("2" → 2:00, "45" → 0:45). Normaliza al múltiplo de 15 más
 * cercano dentro de 0:15–8:00 y lo muestra al salir del campo. Mientras el
 * texto no se entienda, `onChange(null)` avisa al form para deshabilitar el
 * guardado.
 */
export default function DurationInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (minutes: number | null) => void;
}) {
  const [text, setText] = useState(value != null ? formatDuration(value) : "");

  function handleChange(raw: string) {
    setText(raw);
    const parsed = parseDuration(raw);
    onChange(parsed != null && parsed > 0 ? clampDuration(parsed) : null);
  }

  function handleBlur() {
    if (value != null) setText(formatDuration(value));
  }

  function handleChip(minutes: number) {
    setText(formatDuration(minutes));
    onChange(minutes);
  }

  const trimmed = text.trim();
  const invalid = trimmed !== "" && value == null;
  // Vista previa de lo interpretado, solo cuando difiere de lo tipeado.
  const preview = value != null && trimmed !== "" && trimmed !== formatDuration(value);

  return (
    <div>
      <input
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="1:30"
        inputMode="text"
        aria-invalid={invalid}
        className={`w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none ${
          invalid
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-indigo-500"
        }`}
      />
      <div className="mt-1.5 flex items-center gap-1.5">
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
        {invalid ? (
          <span className="ml-auto whitespace-nowrap text-[11px] text-red-600">
            Probá 1:30, 1.5 o 90m
          </span>
        ) : preview ? (
          <span className="ml-auto whitespace-nowrap font-mono text-[11px] text-slate-500">
            = {formatDuration(value!)} h
          </span>
        ) : null}
      </div>
    </div>
  );
}
