"use client";

import InfoTip from "@/components/InfoTip";

const BILLABLE_TIP =
  "Una hora facturable es trabajo que le cobrás al cliente: suma al monto de los reportes y entra al generar la factura. Desmarcala para lo que no vas a cobrar — reuniones internas, aprendizaje, retrabajos o cortesías. Sigue contando en tus horas, pero no en la plata.";

/**
 * Checkbox de "Facturable" con su tooltip de contexto, compartido por los
 * tres formularios de tiempo (tracker, registro rápido y edición). El ícono
 * de ayuda va fuera del <label> para que abrir el tooltip no togglee el check.
 */
export default function BillableCheckbox({
  checked,
  onChange,
  compact = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Estilo chico para el form inline del tracker; el default es el de los modales. */
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <label
        className={`flex cursor-pointer items-center gap-2 ${
          compact ? "py-2 text-xs font-medium text-slate-500" : "text-sm text-slate-600"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded accent-indigo-600"
        />
        Facturable
      </label>
      <InfoTip text={BILLABLE_TIP} />
    </span>
  );
}
