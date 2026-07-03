const X_URL = "https://x.com/nicoproducto";
const LINKEDIN_URL = "https://www.linkedin.com/in/nicolas-espindola/";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

/**
 * Badge "Un producto por NicoProducto" con links a X y LinkedIn.
 * Chip con borde en una sola línea (misma forma en todos los productos).
 * `sidebar` usa un tamaño más chico para el menú de la app.
 */
export default function MadeByBadge({ variant = "card" }: { variant?: "card" | "sidebar" }) {
  const compact = variant === "sidebar";
  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div
      className={
        compact
          ? "flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center shadow-sm"
          : "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
      }
    >
      <span className={`text-slate-500 ${compact ? "text-[11px] leading-tight" : "text-sm"}`}>
        Un producto por <span className="font-medium text-slate-900">NicoProducto</span>
      </span>
      <span className="flex items-center gap-1.5">
        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="NicoProducto en X (Twitter)"
          className="text-slate-500 transition-colors hover:text-slate-900"
        >
          <XIcon className={iconSize} />
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="NicoProducto en LinkedIn"
          className="text-slate-500 transition-colors hover:text-slate-900"
        >
          <LinkedInIcon className={iconSize} />
        </a>
      </span>
    </div>
  );
}
