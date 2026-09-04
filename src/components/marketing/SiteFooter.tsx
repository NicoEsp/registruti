import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import MadeByBadge from "@/components/MadeByBadge";
import { FOOTER_NAV, LEGAL_NAV } from "@/lib/nav";

/**
 * Footer de todas las páginas públicas, landing incluida.
 *
 * Los mismos links de antes, que son los que sostienen el crawleo interno,
 * pero agrupados en columnas: en una sola fila centrada de nueve items no se
 * entendía qué era navegación de producto, qué era contenido y qué era legal.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Logo size={24} />
              <Wordmark className="text-lg text-slate-900" />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              Registrá cada hora que trabajás y convertila en factura. Control de horas y
              facturación en español, para freelancers.
            </p>
            <div className="mt-5">
              <MadeByBadge />
            </div>
          </div>

          {FOOTER_NAV.map((group) => (
            <nav key={group.title} aria-labelledby={`footer-${group.title.toLowerCase()}`}>
              <h2
                id={`footer-${group.title.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Registruti — Control de horas y facturación para
            freelancers.
          </p>
          <ul className="flex items-center gap-5">
            {LEGAL_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
