"use client";

import { useState } from "react";
import { clampDuration, formatDuration, parseDuration } from "@/lib/format";

// Sugerencias rápidas, hasta 2:00; para más tiempo se tipea (ej. "4", "6:30").
const SUGGESTIONS = [30, 60, 90, 120];

/**
 * Campo de duración de escritura libre: entiende "1:30", "1.5", "90m", "2h30"
 * y números pelados ("2" → 2:00, "45" → 0:45), normalizando al múltiplo de 15
 * dentro de 0:15–8:00. Las sugerencias y la vista previa viven en un popover
 * que se abre al enfocar, así el campo ocupa una sola línea en el layout. Un
 * texto que no se entiende se revierte al último valor válido al salir del
 * campo; mientras tanto `onChange(null)` mantiene deshabilitado el guardado.
 */
export default function DurationInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (minutes: number | null) => void;
}) {
  const [text, setText] = useState(value != null ? formatDuration(value) : "");
  const [open, setOpen] = useState(false);

  function handleChange(raw: string) {
    setText(raw);
    setOpen(true);
    const parsed = parseDuration(raw);
    onChange(parsed != null && parsed > 0 ? clampDuration(parsed) : null);
  }

  function handleBlur() {
    setOpen(false);
    // Sin estados de error persistentes: al salir, el texto se normaliza o se
    // revierte al último valor válido.
    setText(value != null ? formatDuration(value) : "");
  }

  function pick(minutes: number) {
    setText(formatDuration(minutes));
    onChange(minutes);
    setOpen(false);
  }

  const trimmed = text.trim();
  const preview = value != null && trimmed !== "" && trimmed !== formatDuration(value);
  const invalid = trimmed !== "" && value == null;

  return (
    <div className="relative">
      <input
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          // Cierra el popover sin cerrar el modal contenedor.
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        placeholder="1:30"
        inputMode="text"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
      />
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-max rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
          {preview && (
            <p className="px-1 pb-1.5 font-mono text-[11px] text-slate-500">
              = {formatDuration(value!)} h
            </p>
          )}
          {invalid && (
            <p className="px-1 pb-1.5 text-[11px] text-red-600">Probá 1:30, 1.5 o 90m</p>
          )}
          <div className="flex gap-1">
            {SUGGESTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => {
                  // preventDefault evita el blur del input antes de aplicar el valor.
                  e.preventDefault();
                  pick(minutes);
                }}
                className={`rounded-md border px-2 py-1 font-mono text-xs transition ${
                  value === minutes
                    ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                }`}
              >
                {formatDuration(minutes)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
