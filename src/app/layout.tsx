import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diamble — Time Tracking & Invoicing",
  description: "Seguimiento de horas de consultoría y facturación por cliente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
