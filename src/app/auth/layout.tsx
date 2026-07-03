import type { Metadata } from "next";

// Rutas de callback de autenticación: transitorias, no indexables.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
