import type { Metadata } from "next";

// Pantalla de autorización OAuth del MCP: la abre el cliente (Claude, Cursor…)
// con parámetros de un solo uso. Nunca indexable.
export const metadata: Metadata = {
  title: "Autorizar acceso",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function OAuthAuthorizeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
