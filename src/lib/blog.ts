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
  /** Última edición real del contenido (YYYY-MM-DD), si el post se actualizó después de publicarse. */
  updatedISO?: string;
  /** Etiqueta corta de categoría. */
  tag: string;
  /** Minutos estimados de lectura. */
  readingMinutes: number;
  /** Keywords para la meta tag y el JSON-LD del artículo. */
  keywords: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "cobrar-por-hora-o-por-proyecto",
    title: "¿Cobrar por hora o por proyecto? Cómo decidir y cotizar cada uno",
    description:
      "Cuándo conviene cobrar por hora, por proyecto o con un retainer mensual, y cómo cotizar un proyecto desde tu tarifa por hora sin regalar horas ni alcance.",
    date: "4 de septiembre de 2026",
    dateISO: "2026-09-04",
    tag: "Guías",
    readingMinutes: 8,
    // Segunda pieza del cluster de tarifa: /cuanto-cobrar-por-hora responde
    // "cuánto cobrar por hora" y este post, la pregunta que viene justo
    // después. Se linkean entre sí y los dos terminan en el producto.
    keywords: [
      "cobrar por hora o por proyecto",
      "precio por proyecto freelance",
      "cómo cotizar un proyecto freelance",
      "presupuesto freelance",
      "tarifa por proyecto",
      "retainer mensual freelance",
    ],
  },
  {
    slug: "mejores-alternativas-toggl-track",
    title: "Las 6 mejores alternativas a Toggl Track en 2026 (gratis y pagas)",
    description:
      "Comparamos las mejores alternativas a Toggl Track para freelancers: precios reales por usuario, idioma, facturación incluida y para quién conviene cada una.",
    date: "22 de julio de 2026",
    dateISO: "2026-07-22",
    updatedISO: "2026-09-04",
    tag: "Comparativas",
    readingMinutes: 9,
    // Intención de listicle/comparativa (plural). El término comercial en
    // singular —"alternativa a Toggl Track", "Toggl Track en español"— lo
    // trabaja /alternativa-toggl-track: si las dos páginas apuntan a lo mismo,
    // Google elige una y suprime la otra, y la que convierte es aquella.
    keywords: [
      "mejores alternativas a Toggl Track",
      "alternativas a Toggl Track 2026",
      "apps como Toggl",
      "Toggl vs Clockify",
      "comparativa de time trackers",
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
    updatedISO: "2026-09-04",
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
    updatedISO: "2026-09-04",
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
      "Conectá Registruti a Claude (web, escritorio o celular), Claude Code o Cursor con un clic: pegás la URL del servidor MCP, autorizás con tu cuenta y cargás horas o consultás tus reportes por lenguaje natural.",
    date: "21 de julio de 2026",
    dateISO: "2026-07-21",
    updatedISO: "2026-09-03",
    tag: "Integraciones",
    readingMinutes: 7,
    keywords: [
      "MCP",
      "Model Context Protocol",
      "conector personalizado Claude",
      "Claude Code MCP",
      "conectar Claude a time tracker",
      "cargar horas con inteligencia artificial",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** "2026-09-04" → "4 de septiembre de 2026". Mediodía UTC para que no retroceda un día. */
export function formatDateES(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
