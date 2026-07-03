import type { Metadata } from "next";

// Las facturas compartidas son privadas (datos de clientes y montos): nunca
// deben indexarse, ni siquiera si alguien enlaza el token público.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PublicInvoiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
