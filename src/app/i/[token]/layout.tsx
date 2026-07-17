import type { Metadata } from "next";

// Las facturas compartidas son privadas (datos de clientes y montos): nunca
// deben indexarse, ni siquiera si alguien enlaza el token público. Y el token
// no debe viajar en el header Referer si la página enlaza a otro sitio.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function PublicInvoiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
