import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Secciones privadas de la app y links de facturas compartidas:
        // no aportan al SEO y no deben indexarse.
        disallow: ["/tracker", "/clients", "/reports", "/invoices", "/i/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
