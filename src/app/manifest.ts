import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME} — Control de horas y facturación`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/tracker",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es",
    categories: ["productivity", "business", "finance"],
    background_color: "#f8fafc",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Registrar tiempo",
        short_name: "Registrar",
        description: "Cargar una entrada de tiempo",
        url: "/tracker?registrar=1",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Nueva factura",
        short_name: "Factura",
        description: "Crear una factura a partir de tus horas",
        url: "/invoices?nueva=1",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Reportes",
        short_name: "Reportes",
        description: "Ver tus horas y montos del período",
        url: "/reports",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
