import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import MadeByBadge from "@/components/MadeByBadge";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <Wordmark className="text-lg text-slate-800" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="font-medium text-slate-600 hover:text-slate-900">
              Blog
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-indigo-600"
            >
              Empezá gratis
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-10 text-center">
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
    </div>
  );
}
