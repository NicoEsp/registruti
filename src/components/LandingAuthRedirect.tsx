"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";

/**
 * Red de seguridad para el retorno de OAuth / confirmación de email.
 *
 * Si en Supabase la Redirect URL exacta (`/auth/callback`) no matchea la
 * allowlist, el token vuelve al Site URL raíz — es decir, a esta landing —
 * con `#access_token=...` en el hash. El cliente de Supabase
 * (detectSessionInUrl) igual procesa ese token y crea la sesión, pero eso
 * tarda ~1s: sin esto, el usuario ve el marketing hasta que redirigimos.
 *
 * Cuando detectamos un token de auth en la URL, tapamos la landing con un
 * overlay de carga y entramos al tracker apenas la sesión está lista. Un
 * usuario ya logueado que navega la landing a propósito (sin hash) no se ve
 * afectado: no hay token, no hay overlay.
 */
export default function LandingAuthRedirect() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const isAuthReturn = hash.includes("access_token=") || hash.includes("error=");
    if (!isAuthReturn) return;

    setProcessing(true);

    let done = false;
    const enter = () => {
      if (done) return;
      done = true;
      router.replace("/tracker");
    };

    // La sesión puede quedar lista antes o después de suscribirnos.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) enter();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) enter();
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!processing) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center">
      <div className="flex items-center gap-2">
        <Logo size={32} />
        <Wordmark className="text-xl text-slate-800" />
      </div>
      <p className="text-sm text-slate-500">Completando tu ingreso…</p>
    </div>
  );
}
