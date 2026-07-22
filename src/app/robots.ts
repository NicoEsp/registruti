import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Secciones privadas de la app, callbacks de auth, API y links de
        // facturas compartidas: no aportan al SEO y no deben indexarse.
        // (Además llevan X-Robots-Tag: noindex vía vercel.json, que es lo que
        // realmente saca de la SERP una URL ya conocida.)
        disallow: [
          "/tracker",
          "/clients",
          "/reports",
          "/invoices",
          "/settings",
          "/auth/",
          "/api/",
          "/i/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
