"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { TOAST_EVENT, openNewInvoice } from "@/lib/appEvents";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import MadeByBadge from "@/components/MadeByBadge";
import Onboarding from "@/components/Onboarding";
import CommandPalette from "@/components/CommandPalette";
import QuickAddEntry from "@/components/QuickAddEntry";

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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
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

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

  // Atajos globales: ⌘K/Ctrl+K abre la paleta; T registra tiempo; F nueva factura.
  // Todo overlay (modales de página, onboarding, palette, quick-add) marca su
  // backdrop con data-overlay: mientras haya uno abierto, los atajos no disparan
  // acciones que puedan pisar o desmontar trabajo a medio hacer.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const overlayOpen = !!document.querySelector("[data-overlay]");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (paletteOpen) setPaletteOpen(false);
        else if (!overlayOpen) setPaletteOpen(true);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (overlayOpen || paletteOpen || quickAddOpen) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      const key = e.key.toLowerCase();
      if (key === "t") {
        e.preventDefault();
        setQuickAddOpen(true);
      } else if (key === "f") {
        e.preventDefault();
        openNewInvoice(pathname, (href) => router.push(href));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, quickAddOpen, pathname, router]);

  // Toasts globales (ej. confirmación del registro rápido).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function onToast(e: Event) {
      setToast((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 2600);
    }
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);

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
          <Logo size={30} />
          <Wordmark className="text-lg text-slate-800" />
        </Link>
        <button
          onClick={() => setPaletteOpen(true)}
          className="mx-3 mb-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
        >
          <span>Buscar o crear…</span>
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px]">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
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
          <MadeByBadge variant="sidebar" />
          <p className="mb-2 mt-3 truncate text-xs text-slate-500">{session.user.email}</p>
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
          <Logo size={26} />
          <Wordmark className="text-base text-slate-800" />
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuickAddOpen(true)}
            aria-label="Registrar tiempo"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4.5 w-4.5" aria-hidden>
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-medium text-slate-500 hover:text-red-600"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 px-4 pb-24 pt-20 md:ml-56 md:px-8 md:py-8 md:pb-8 print:ml-0 print:px-0 print:py-0 print:pb-0 print:pt-0">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
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

      {/* Onboarding va antes que palette/quick-add: si conviven, los overlays
          del shell (que tienen el foco) pintan por encima. */}
      <Onboarding />

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onQuickAdd={() => setQuickAddOpen(true)}
        />
      )}
      {quickAddOpen && <QuickAddEntry onClose={() => setQuickAddOpen(false)} />}

      {toast && (
        <div className="toast-in fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg md:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}
