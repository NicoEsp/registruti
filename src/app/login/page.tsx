"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // Si arranca el redirect no volvemos acá; solo manejamos el error inmediato.
    if (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Logo size={40} />
          <Wordmark className="text-2xl text-slate-800" />
        </Link>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Entrá a tu cuenta</h1>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Trackeá tus horas y facturá a tus clientes. Gratis y en español.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
              />
            </svg>
            {busy ? "Redirigiendo…" : "Continuar con Google"}
          </button>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Al continuar aceptás los{" "}
          <Link href="/terms" className="hover:text-slate-600 hover:underline">
            Términos
          </Link>{" "}
          y la{" "}
          <Link href="/privacy" className="hover:text-slate-600 hover:underline">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
