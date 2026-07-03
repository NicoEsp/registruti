import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Secciones privadas de la app, callbacks de auth y links de facturas
        // compartidas: no aportan al SEO y no deben indexarse.
        disallow: [
          "/tracker",
          "/clients",
          "/reports",
          "/invoices",
          "/settings",
          "/auth/",
          "/i/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
