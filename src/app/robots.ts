import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Acá van SOLO las rutas que no queremos que Google ni siquiera
        // rastree.
        //
        // Las secciones privadas de la app (/tracker, /clients, /reports,
        // /invoices, /settings) y los callbacks de auth NO se bloquean acá a
        // propósito: llevan X-Robots-Tag: noindex vía vercel.json, y eso es lo
        // que realmente saca de la SERP una URL ya conocida. Pero Google solo
        // puede obedecer un noindex si puede rastrear la URL y leer la
        // cabecera: bloquearlas también en robots.txt hacía justo lo contrario
        // (nunca veía el noindex y la URL podía quedar indexada solo por su
        // dirección).
        disallow: [
          "/api/",
          // Links públicos de facturas: el token no es adivinable, pero
          // preferimos que ningún bot ande leyendo datos de clientes. Acá sí
          // queremos cortar el rastreo, no solo la indexación.
          "/i/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
