/**
 * Wordmark oficial: "Registruti", semibold. El color por defecto de marca es
 * Dark Slate (text-slate-800 en el call site); se hereda del contenedor para
 * permitir énfasis puntuales (ej. índigo en la tabla comparativa).
 * El tamaño se controla vía className (text-lg, text-2xl…).
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-semibold tracking-tight ${className}`}>Registruti</span>;
}
