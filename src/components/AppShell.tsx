"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/", label: "Tracker", icon: "⏱" },
  { href: "/clients", label: "Clientes", icon: "👥" },
  { href: "/reports", label: "Reportes", icon: "📊" },
  { href: "/invoices", label: "Facturas", icon: "🧾" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (!data.session) router.replace("/login");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Cargando…
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            D
          </span>
          <span className="text-lg font-semibold tracking-tight">Diamble</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="mb-2 truncate text-xs text-slate-500">{session.user.email}</p>
          <button
            onClick={async () => {
              const password = prompt("Nueva contraseña (mínimo 6 caracteres):");
              if (!password) return;
              const { error } = await supabase.auth.updateUser({ password });
              alert(error ? `Error: ${error.message}` : "Contraseña actualizada.");
            }}
            className="mb-1 block text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Cambiar contraseña
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-medium text-slate-600 hover:text-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="ml-56 flex-1 px-8 py-8 print:ml-0 print:px-0 print:py-0">
        {children}
      </main>
    </div>
  );
}
