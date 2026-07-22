import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-slate-900">
      <Logo size={48} />
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Esta página no existe
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        El link puede estar vencido o mal escrito. Estas salidas sí funcionan:
      </p>
      <nav className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-indigo-600"
        >
          Ir al inicio
        </Link>
        <Link href="/blog" className="text-indigo-600 underline-offset-2 hover:underline">
          Leer el blog
        </Link>
        <Link
          href="/alternativa-toggl-track"
          className="text-indigo-600 underline-offset-2 hover:underline"
        >
          Alternativa a Toggl Track
        </Link>
        <Link href="/login" className="text-indigo-600 underline-offset-2 hover:underline">
          Entrar a mi cuenta
        </Link>
      </nav>
    </div>
  );
}
