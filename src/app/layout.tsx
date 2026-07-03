import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "control de horas para freelancers",
    "alternativa a Toggl Track gratis",
    "time tracking en español",
    "facturación para freelancers",
    "app para trackear horas de trabajo",
    "control de horas y facturación",
    "facturar horas a clientes",
    "registro de horas trabajadas por cliente",
    "time tracker gratis en español",
    "facturación freelance en pesos y dólares",
    "tarifa por hora freelance",
    "reporte de horas por cliente",
    "factura con detalle de horas",
    "Toggl Track en español",
    "control de horas consultores",
  ],
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    title: "Registruti — Trackeá tus horas, facturá a tus clientes. Gratis y en español.",
    description:
      "El time tracker pensado para freelancers de Latinoamérica: tarifas por cliente en 9 monedas, reportes claros y facturas en PDF con link público para que tu cliente vea cada hora. Empezá gratis hoy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Registruti — Trackeá tus horas, facturá a tus clientes",
    description:
      "Control de horas y facturación para freelancers, gratis y en español. La alternativa a Toggl Track hecha en Latinoamérica.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={GeistSans.className}>
      <body>{children}</body>
    </html>
  );
}
