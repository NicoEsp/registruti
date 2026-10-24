import type { Metadata } from "next";

// La página de login es un client component; la metadata vive en este layout.
//
// Lleva noindex: es una pantalla de autenticación con treinta palabras y sin
// contenido propio. Google la rastreaba igual (está enlazada desde el header y
// el footer de todo el sitio) y la dejaba en "rastreada, sin indexar"
// ensuciando el informe. Con el noindex explícito entiende que no tiene que
// mostrarla. Sigue siendo rastreable (no va en robots.txt), que es lo que hace
// falta para que lea la etiqueta.
export const metadata: Metadata = {
  title: "Iniciar sesión o crear cuenta gratis",
  description:
    "Entrá a Registruti o creá tu cuenta gratis: control de horas y facturación para freelancers, en español y sin tarjeta de crédito.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
