import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import MobileNav from "@/components/marketing/MobileNav";
import { NAV_CTA, PRIMARY_NAV } from "@/lib/nav";

/**
 * Header de todas las páginas públicas, landing incluida (antes la landing
 * tenía el suyo, con seis links, el badge de autor metido entre medio y
 * "Iniciar sesión" apuntando al mismo `/login` que el CTA: a ~1200px se
 * pisaban entre sí y el texto se partía en dos líneas).
 *
 * El ancho del contenedor es el mismo en todo el sitio aunque el contenido de
 * abajo sea más angosto: la barra no cambia de forma al navegar.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Registruti — Inicio"
        >
          <Logo size={28} />
          <Wordmark className="text-lg text-slate-900" />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={NAV_CTA.href}
            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-indigo-600"
          >
            {NAV_CTA.label}
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
