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
  /** Keywords para la meta tag y el JSON-LD del artículo. */
  keywords: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "mejores-alternativas-toggl-track",
    title: "Las 6 mejores alternativas a Toggl Track en 2026 (gratis y pagas)",
    description:
      "Comparamos las mejores alternativas a Toggl Track para freelancers: precios reales por usuario, idioma, facturación incluida y para quién conviene cada una.",
    date: "22 de julio de 2026",
    dateISO: "2026-07-22",
    tag: "Comparativas",
    readingMinutes: 9,
    keywords: [
      "alternativas a Toggl Track",
      "alternativa a Toggl Track gratis",
      "Toggl Track en español",
      "Toggl Track precio",
      "apps como Toggl",
      "time tracking para freelancers",
    ],
  },
  {
    slug: "mejores-time-trackers-freelancers",
    title: "Los mejores time trackers para freelancers en 2026",
    description:
      "¿Qué time tracker te conviene si sos freelancer? Los comparamos según lo que necesitás: facturar tus horas, cronómetro automático, precio real y español.",
    date: "22 de julio de 2026",
    dateISO: "2026-07-22",
    tag: "Comparativas",
    readingMinutes: 8,
    keywords: [
      "mejores time trackers",
      "time tracker gratis",
      "time tracker en español",
      "app para registrar horas de trabajo",
      "control de horas freelance",
      "software de time tracking",
    ],
  },
  {
    slug: "control-de-horas-trabajadas",
    title: "Cómo llevar el control de horas trabajadas: guía para freelancers",
    description:
      "Método simple para registrar tus horas por cliente sin que se te escape nada: qué anotar, cada cuánto, con qué herramienta y cómo convertirlas en facturas.",
    date: "22 de julio de 2026",
    dateISO: "2026-07-22",
    tag: "Guías",
    readingMinutes: 7,
    keywords: [
      "control de horas trabajadas",
      "registro de horas de trabajo",
      "planilla de horas trabajadas",
      "cómo registrar horas freelance",
      "horas facturables",
      "facturar por hora",
    ],
  },
  {
    slug: "mcp",
    title: "Cómo conectar Registruti a Claude con MCP",
    description:
      "Guía paso a paso para agregar Registruti como servidor MCP en Claude Desktop, Claude Code, Cursor u otro cliente MCP, y cargar horas o consultar tus reportes por lenguaje natural.",
    date: "21 de julio de 2026",
    dateISO: "2026-07-21",
    tag: "Integraciones",
    readingMinutes: 6,
    keywords: [
      "MCP",
      "Model Context Protocol",
      "Claude Desktop",
      "conectar Claude a time tracker",
      "cargar horas con inteligencia artificial",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
