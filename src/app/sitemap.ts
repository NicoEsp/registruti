import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { POSTS } from "@/lib/blog";

// Fechas de última edición REAL del contenido.
//
// Importante: acá nunca va `new Date()`. El sitemap se genera en build, así que
// `new Date()` significa "la fecha del último deploy": cada deploy —aunque solo
// toque CSS o una ruta de la app— le avisaría a Google que estas páginas
// cambiaron. Google descarta el <lastmod> de los sitios que lo reportan mal, y
// las URLs quedan dando vueltas en "detectada / pendiente" sin terminar de
// indexarse. Al editar de verdad una de estas páginas, actualizá su fecha acá.
const HOME_UPDATED = "2026-09-03";
const TOGGL_UPDATED = "2026-07-31";
const CLOCKIFY_UPDATED = "2026-07-31";
const HARVEST_UPDATED = "2026-07-31";
const RATE_CALC_UPDATED = "2026-07-31";
// Coincide con el "Última actualización" que muestran las páginas legales.
const LEGAL_UPDATED = "2026-07-02";

// El índice del blog cambia cuando se publica un post, así que su lastmod es la
// fecha del post más reciente: se mantiene solo al sumar artículos.
// La semilla sale del propio blog, no de HOME_UPDATED: si algún día todos los
// posts quedan por debajo de la fecha de la home, /blog reportaría la fecha de
// la home en vez de la de su contenido.
const postUpdated = (post: (typeof POSTS)[number]) => post.updatedISO ?? post.dateISO;
const BLOG_UPDATED = POSTS.reduce(
  (latest, post) => (postUpdated(post) > latest ? postUpdated(post) : latest),
  POSTS.length ? postUpdated(POSTS[0]) : HOME_UPDATED
);

export default function sitemap(): MetadataRoute.Sitemap {
  const posts: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(postUpdated(post)),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Solo URLs canónicas, indexables y con contenido propio. /login queda afuera
  // a propósito: es una pantalla de auth sin contenido rastreable, Google la
  // marca "rastreada: actualmente sin indexar" y ensucia el informe de
  // indexación. Sigue siendo rastreable y linkeada desde el footer.
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(HOME_UPDATED),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/alternativa-toggl-track`,
      lastModified: new Date(TOGGL_UPDATED),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cuanto-cobrar-por-hora`,
      lastModified: new Date(RATE_CALC_UPDATED),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/alternativa-clockify`,
      lastModified: new Date(CLOCKIFY_UPDATED),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/alternativa-harvest`,
      lastModified: new Date(HARVEST_UPDATED),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(BLOG_UPDATED),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts,
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
