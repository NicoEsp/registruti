import type { Metadata } from "next";

// La página de login es un client component; la metadata vive en este layout.
export const metadata: Metadata = {
  title: "Iniciar sesión o crear cuenta gratis",
  description:
    "Entrá a Registruti o creá tu cuenta gratis: control de horas y facturación para freelancers, en español y sin tarjeta de crédito.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
