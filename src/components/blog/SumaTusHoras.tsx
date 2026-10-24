import Link from "next/link";

/**
 * Bloque "Antes de facturar, sumá tus horas", para las guías de facturación.
 *
 * Va antes del paso a paso, a propósito: quien busca cómo hacer una factura
 * está por cobrar, y el importe sale de las horas del período. Es el momento
 * en que una herramienta que ya tiene la cuenta hecha resuelve el problema
 * real, no el de la pantalla de ARCA.
 */
export default function SumaTusHoras({ intro }: { intro: string }) {
  return (
    <aside className="not-prose rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
        Antes de facturar, sumá tus horas
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{intro}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        Registruti registra las horas por cliente con su tarifa y su moneda, y arma el invoice del
        período en PDF, con el detalle por día y un link público para que tu cliente lo apruebe.
        Ese total es el que va en la factura. Gratis para empezar, en español.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md hover:from-indigo-700 hover:to-indigo-600"
        >
          Sumar mis horas en Registruti
        </Link>
        <Link
          href="/calculadora-de-horas-trabajadas"
          className="text-sm font-medium text-indigo-700 underline-offset-2 hover:underline"
        >
          O usá la calculadora de horas trabajadas →
        </Link>
      </div>
    </aside>
  );
}
