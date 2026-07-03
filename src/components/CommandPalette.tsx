"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { openNewClient, openNewInvoice } from "@/lib/appEvents";

type Action = {
  id: string;
  label: string;
  section: "Acciones" | "Ir a";
  keywords: string;
  kbd?: string;
  run: () => void;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Command palette (⌘K / Ctrl+K) al estilo Raycast: buscá una acción o una
 * sección y ejecutala con el teclado, sin tocar el mouse.
 */
export default function CommandPalette({
  onClose,
  onQuickAdd,
}: {
  onClose: () => void;
  onQuickAdd: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const actions = useMemo<Action[]>(() => {
    const go = (href: string) => () => {
      onClose();
      router.push(href);
    };
    return [
      {
        id: "quick-add",
        label: "Registrar tiempo",
        section: "Acciones",
        keywords: "registrar tiempo horas entrada cargar trackear nueva",
        kbd: "T",
        run: () => {
          onClose();
          onQuickAdd();
        },
      },
      {
        id: "new-invoice",
        label: "Nueva factura",
        section: "Acciones",
        keywords: "nueva factura crear generar invoice facturar",
        kbd: "F",
        run: () => {
          onClose();
          openNewInvoice(pathname, (href) => router.push(href));
        },
      },
      {
        id: "new-client",
        label: "Nuevo cliente",
        section: "Acciones",
        keywords: "nuevo cliente crear proyecto alta",
        run: () => {
          onClose();
          openNewClient(pathname, (href) => router.push(href));
        },
      },
      { id: "go-tracker", label: "Tracker", section: "Ir a", keywords: "tracker horas semana tiempo", run: go("/tracker") },
      { id: "go-clients", label: "Clientes", section: "Ir a", keywords: "clientes proyectos tarifas", run: go("/clients") },
      { id: "go-reports", label: "Reportes", section: "Ir a", keywords: "reportes graficos resumen montos", run: go("/reports") },
      { id: "go-invoices", label: "Facturas", section: "Ir a", keywords: "facturas invoices pdf cobrar", run: go("/invoices") },
      { id: "go-settings", label: "Ajustes", section: "Ir a", keywords: "ajustes configuracion emisor cuit perfil cuenta", run: go("/settings") },
    ];
  }, [onClose, onQuickAdd, pathname, router]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return actions;
    return actions.filter((a) => normalize(`${a.label} ${a.keywords}`).includes(q));
  }, [actions, query]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selected]?.run();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, selected, onClose]);

  // Mantener la opción seleccionada a la vista al navegar con flechas.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${selected}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const sections: ("Acciones" | "Ir a")[] = ["Acciones", "Ir a"];

  return (
    <div
      data-overlay
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="palette-in w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué querés hacer?"
          className="w-full border-b border-slate-100 px-4 py-3.5 text-sm focus:outline-none"
        />
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              Sin resultados para “{query}”
            </p>
          )}
          {sections.map((section) => {
            const items = filtered.filter((a) => a.section === section);
            if (items.length === 0) return null;
            return (
              <div key={section}>
                <p className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {section}
                </p>
                {items.map((action) => {
                  const index = filtered.indexOf(action);
                  return (
                    <button
                      key={action.id}
                      data-index={index}
                      onClick={action.run}
                      onMouseMove={() => setSelected(index)}
                      className={`mx-2 flex w-[calc(100%-1rem)] items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        index === selected
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-700"
                      }`}
                    >
                      {action.label}
                      {action.kbd && (
                        <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                          {action.kbd}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
          <span>↑↓ navegar</span>
          <span>↵ ejecutar</span>
          <span>esc cerrar</span>
        </div>
      </div>
    </div>
  );
}
