"use client";

import type { Client } from "@/lib/types";

/** Valor del select que significa "crear uno nuevo con el nombre tipeado". */
export const NEW_CLIENT_VALUE = "__nuevo__";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

/**
 * Selector de cliente que también permite crearlo en el momento. Pedir que
 * exista un cliente antes de la primera hora era el paso en el que la gente
 * nueva se quedaba (lo decía el feedback y lo confirmó PostHog), así que:
 *
 * - sin clientes, muestra directamente el campo de nombre;
 * - con clientes, la opción "Crear cliente nuevo…" abre el mismo campo
 *   debajo del select.
 *
 * El componente no inserta nada: quien lo usa decide qué hacer con `newName`
 * al guardar (ver `createClientQuick`), así el cliente y la entrada se crean
 * en el mismo clic.
 */
export default function ClientSelect({
  clients,
  value,
  onChange,
  newName,
  onNewNameChange,
  compact,
}: {
  clients: Client[];
  value: string;
  onChange: (value: string) => void;
  newName: string;
  onNewNameChange: (name: string) => void;
  /** Ancho al contenido en sm+ (el formulario en línea del tracker). */
  compact?: boolean;
}) {
  const noClients = clients.length === 0;
  const creating = noClients || value === NEW_CLIENT_VALUE;

  const nameInput = (
    <input
      required
      value={newName}
      onChange={(e) => onNewNameChange(e.target.value)}
      placeholder="Ej: Acme, App de Juan…"
      // Solo cuando aparece por elección: con la lista vacía el foco lo tiene
      // la descripción, que es el primer campo del formulario.
      autoFocus={!noClients}
      aria-label="Nombre del cliente nuevo"
      className={`${INPUT_CLASS} ${compact ? "sm:min-w-52" : ""}`}
    />
  );

  if (noClients) {
    return (
      <div>
        {nameInput}
        <p className="mt-1 text-[11px] text-slate-400">
          Se crea con esta entrada. La tarifa la cargás después en Clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} bg-white ${compact ? "sm:w-auto" : ""}`}
      >
        <option value="">Elegir…</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value={NEW_CLIENT_VALUE}>+ Crear cliente nuevo…</option>
      </select>
      {creating && nameInput}
    </div>
  );
}
