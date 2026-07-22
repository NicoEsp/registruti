import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import MadeByBadge from "@/components/MadeByBadge";

/**
 * Footer compartido de las páginas de marketing (blog, comparativas).
 * Incluye los links internos clave para el crawleo del sitio.
 */
export default function SiteFooter({ wide = false }: { wide?: boolean }) {
  return (
    <footer className="border-t border-slate-100">
      <div
        className={`mx-auto flex flex-col items-center gap-3 px-4 py-10 text-center ${
          wide ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        <div className="flex items-center gap-2">
          <Logo size={20} />
          <Wordmark className="text-slate-800" />
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Inicio
          </Link>
          <Link href="/blog" className="hover:text-slate-900">
            Blog
          </Link>
          <Link href="/alternativa-toggl-track" className="hover:text-slate-900">
            Alternativa a Toggl Track
          </Link>
          <Link href="/login" className="hover:text-slate-900">
            Iniciar sesión
          </Link>
          <Link href="/terms" className="hover:text-slate-900">
            Términos
          </Link>
          <Link href="/privacy" className="hover:text-slate-900">
            Privacidad
          </Link>
        </nav>
        <MadeByBadge />
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Registruti — Control de horas y facturación para
          freelancers.
        </p>
      </div>
    </footer>
  );
}
