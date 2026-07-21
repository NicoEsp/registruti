// Registro de artículos del blog. Solo metadata (para el índice, el SEO y el
// sitemap); el cuerpo de cada artículo es un componente aparte, mapeado por
// slug en src/app/blog/[slug]/page.tsx. Para sumar un post: agregá una entrada
// acá y su componente en el mapa del route.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Fecha legible para mostrar (es-AR). */
  date: string;
  /** Fecha ISO (YYYY-MM-DD) para <time> y sitemap. */
  dateISO: string;
  /** Etiqueta corta de categoría. */
  tag: string;
  /** Minutos estimados de lectura. */
  readingMinutes: number;
}

export const POSTS: BlogPost[] = [
  {
    slug: "mcp",
    title: "Cómo conectar Registruti a Claude con MCP",
    description:
      "Guía paso a paso para agregar Registruti como servidor MCP en Claude Desktop y cargar horas o consultar tus reportes por lenguaje natural.",
    date: "21 de julio de 2026",
    dateISO: "2026-07-21",
    tag: "Integraciones",
    readingMinutes: 6,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
