import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";

/**
 * Header compartido de las páginas de marketing (blog, comparativas).
 * La landing tiene el suyo propio con anchors internos.
 */
export default function SiteHeader({ wide = false }: { wide?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div
        className={`mx-auto flex items-center justify-between px-4 py-3 ${
          wide ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
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
  );
}
