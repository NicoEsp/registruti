"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import FlameLogo from "@/components/FlameLogo";
import Onboarding from "@/components/Onboarding";

const NAV_ITEMS = [
  { href: "/tracker", label: "Tracker", icon: "⏱" },
  { href: "/clients", label: "Clientes", icon: "👥" },
  { href: "/reports", label: "Reportes", icon: "📊" },
  { href: "/invoices", label: "Facturas", icon: "🧾" },
  { href: "/settings", label: "Ajustes", icon: "⚙️" },
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
      {/* Sidebar (desktop) */}
      <aside className="no-print fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-slate-200 bg-white md:flex">
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          <FlameLogo size={30} />
          <span className="text-lg font-semibold tracking-tight">Registruti</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
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
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-medium text-slate-600 hover:text-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="no-print fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <FlameLogo size={26} />
          <span className="text-base font-semibold tracking-tight">Registruti</span>
        </Link>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm font-medium text-slate-500 hover:text-red-600"
        >
          Salir
        </button>
      </header>

      {/* Contenido */}
      <main className="flex-1 px-4 pb-24 pt-20 md:ml-56 md:px-8 md:py-8 md:pb-8 print:ml-0 print:px-0 print:py-0 print:pb-0 print:pt-0">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                active ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Onboarding />
    </div>
  );
}
