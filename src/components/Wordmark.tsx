/**
 * Wordmark oficial: "Registruti" en Dark Slate (#1e293b), semibold.
 * El tamaño se controla vía className (text-lg, text-2xl…).
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight text-slate-800 ${className}`}>
      Registruti
    </span>
  );
}
