// Registro de artículos del blog. Solo metadata (para el índice, el SEO y el
// sitemap); el cuerpo de cada artículo es un componente aparte, mapeado por
// slug en src/app/blog/[slug]/page.tsx. Para sumar un post: agregá una entrada
// acá y su componente en el mapa del route.

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  /** Título visible (H1) y, salvo que haya `metaTitle`, base del <title>. */
  title: string;
  /**
   * <title> exacto, sin la plantilla "| Registruti" del layout. Solo para los
   * posts cuyo título con marca pasa los 60 caracteres: Google corta a unos
   * 580 px y el final del título (que acá es la marca, o el año) desaparece.
   */
  metaTitle?: string;
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
  /**
   * Slugs de los posts que se ofrecen al pie como "Seguí leyendo", en orden.
   * Elegidos a mano por tema, no "los tres primeros de la lista": así cada
   * post recibe enlaces internos desde los que hablan de lo mismo, que es lo
   * que Google usa para entender de qué va y cuánto importa.
   */
  related: string[];
  /**
   * Preguntas frecuentes al pie del post. Se muestran como acordeón y salen
   * como FAQPage en el JSON-LD: la respuesta corta a la pregunta exacta que
   * la gente escribe es lo que Google y las IAs citan.
   */
  faqs?: BlogFaq[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "cobrar-por-hora-o-por-proyecto",
    title: "¿Cobrar por hora o por proyecto? Cómo decidir y cotizar cada uno",
    // El título completo con marca da 77 caracteres y se corta en Google.
    metaTitle: "¿Cobrar por hora o por proyecto? Cómo decidir | Registruti",
    description:
      "Cuándo conviene cobrar por hora, por proyecto o con un retainer mensual, y cómo cotizar un proyecto desde tu tarifa por hora sin regalar horas ni alcance.",
    date: "4 de septiembre de 2026",
    dateISO: "2026-09-04",
    updatedISO: "2026-10-24",
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
    related: ["control-de-horas-trabajadas", "factura-c", "mejores-time-trackers-freelancers"],
  },
  {
    slug: "mejores-alternativas-toggl-track",
    title: "Las 6 mejores alternativas a Toggl Track (comparativa 2026)",
    metaTitle: "Las 6 mejores alternativas a Toggl Track (comparativa 2026)",
    description:
      "Comparamos 6 alternativas a Toggl Track con precios reales, idioma y facturación incluida, en una tabla para elegir rápido.",
    date: "22 de julio de 2026",
    dateISO: "2026-07-22",
    updatedISO: "2026-10-24",
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
    related: ["mejores-time-trackers-freelancers", "control-de-horas-trabajadas", "mcp"],
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
    related: ["mejores-alternativas-toggl-track", "control-de-horas-trabajadas", "mcp"],
  },
  {
    slug: "control-de-horas-trabajadas",
    title: "Control de horas trabajadas: guía y planilla gratis",
    metaTitle: "Control de horas trabajadas: guía y planilla gratis",
    description:
      "Cómo llevar el registro de horas trabajadas por cliente sin que se escape nada, con una planilla gratis para descargar y cuándo conviene pasar a una app.",
    date: "22 de julio de 2026",
    dateISO: "2026-07-22",
    updatedISO: "2026-10-24",
    tag: "Guías",
    readingMinutes: 11,
    // Para "control de horas trabajadas" Google no muestra guías: muestra
    // herramientas (calculadoras, apps, plantillas de Excel). El post compite
    // con lo mismo: planilla para descargar, fórmulas de Excel, calculadora
    // y un ejemplo completo, sin perder el ángulo freelance.
    keywords: [
      "control de horas trabajadas",
      "planilla de horas trabajadas",
      "plantilla excel control de horas trabajadas gratis",
      "cómo calcular las horas trabajadas en excel",
      "registro de horas de trabajo",
      "cómo registrar horas freelance",
      "horas facturables",
      "facturar por hora",
    ],
    related: ["cobrar-por-hora-o-por-proyecto", "factura-c", "mejores-time-trackers-freelancers"],
    faqs: [
      {
        q: "¿Cómo se calculan las horas trabajadas?",
        a: "Restá la hora de entrada a la hora de salida y descontá los descansos. Si entraste a las 9:00, saliste a las 17:30 y almorzaste 45 minutos, trabajaste 8:30 menos 0:45, es decir 7 horas y 45 minutos. Para facturar, pasá los minutos a decimal dividiéndolos por 60: 7:45 son 7,75 horas, que multiplicadas por la tarifa dan el importe. La calculadora de horas trabajadas de Registruti hace esa cuenta por día y por semana.",
      },
      {
        q: "¿Cómo sumar horas y minutos sin equivocarse?",
        a: "Sumá los minutos por separado y pasá cada 60 a una hora: 2:45 más 1:30 son 3 horas y 75 minutos, o sea 4:15. En Excel o Google Sheets alcanza con sumar las celdas si están en formato de hora y aplicarles el formato [h]:mm, que permite totales mayores a 24 horas. El error más común es escribir 7,45 como si fueran 7 horas y 45 minutos: en decimal, 7,45 son 7 horas y 27 minutos.",
      },
      {
        q: "¿Cómo se calculan las horas trabajadas en Excel?",
        a: "Con tres columnas de hora (entrada, salida y descanso) y una fórmula por fila: =salida-entrada-descanso, con las celdas en formato de hora. Para el total del período usá =SUMA() sobre esa columna con formato [h]:mm. Para convertir el total a horas decimales y multiplicarlo por la tarifa, multiplicá la celda por 24: =total*24*tarifa. La planilla gratis de este artículo ya trae esas fórmulas armadas.",
      },
      {
        q: "¿Cuántas horas facturables tiene un freelance por semana?",
        a: "Entre 20 y 30 para la mayoría de los freelancers a tiempo completo, es decir de 4 a 6 horas facturables por día. El resto de la semana se va en buscar clientes, cotizar, facturar, responder mails y administrar el negocio, que no se le cobra a nadie. Por eso la tarifa por hora se calcula sobre las horas facturables reales y no sobre las 40 de un empleo.",
      },
      {
        q: "¿Qué diferencia hay entre una planilla y una app para controlar horas?",
        a: "La planilla es gratis y alcanza con un solo cliente: anotás, sumás y armás la factura a mano. El límite aparece con el segundo y el tercero: tarifas y monedas distintas, saber qué horas ya facturaste y rehacer la factura cada mes. Una app como Registruti registra las horas por cliente con su tarifa y su moneda, suma sola y genera el invoice en PDF desde esas horas; el plan gratis alcanza para empezar.",
      },
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
    related: [
      "control-de-horas-trabajadas",
      "mejores-time-trackers-freelancers",
      "cobrar-por-hora-o-por-proyecto",
    ],
  },
  {
    slug: "factura-c",
    title: "Factura C en ARCA: cómo hacerla paso a paso (monotributo)",
    metaTitle: "Factura C en ARCA: cómo hacerla paso a paso (monotributo)",
    description:
      "Qué es la factura C, quién la emite y cómo hacerla en Comprobantes en línea de ARCA: punto de venta, receptor, período y detalle de horas, paso a paso.",
    date: "24 de octubre de 2026",
    dateISO: "2026-10-24",
    tag: "Facturación",
    readingMinutes: 9,
    // "Factura C" tiene 5.200 búsquedas por mes en Argentina y la hace el
    // freelance en el momento de cobrar, que es cuando necesita saber cuántas
    // horas trabajó. "Monotributo" (98.000) no: quien lo busca quiere entrar a
    // ARCA, no leer un blog.
    keywords: [
      "factura C",
      "cómo hacer una factura C",
      "factura C monotributo",
      "factura C ARCA",
      "comprobantes en línea factura C",
      "factura C por servicios",
      "qué es la factura C",
      "punto de venta ARCA",
    ],
    related: ["factura-e-servicios-al-exterior", "control-de-horas-trabajadas", "cobrar-por-hora-o-por-proyecto"],
    faqs: [
      {
        q: "¿Qué es la factura C?",
        a: "Es el comprobante que emiten los monotributistas y los sujetos exentos de IVA por sus ventas y servicios. No discrimina IVA (el precio es el total que paga el cliente), se emite de forma electrónica desde Comprobantes en línea de ARCA y cada una recibe un CAE que la valida. Sirve para cualquier tipo de receptor: empresas responsables inscriptas, otros monotributistas o consumidores finales.",
      },
      {
        q: "¿Puedo hacerle una factura C a una empresa responsable inscripta?",
        a: "Sí. El monotributista emite factura C a todos sus clientes, sea cual sea su condición frente al IVA. Al cargar el receptor elegís “IVA Responsable Inscripto” y su CUIT. La empresa la registra como gasto; lo que no puede hacer es computar crédito fiscal de IVA, porque la factura C no lo discrimina.",
      },
      {
        q: "¿Cómo anulo una factura C ya emitida?",
        a: "Una factura con CAE no se edita ni se borra. Se anula emitiendo una Nota de crédito C por el mismo importe, asociada a esa factura, desde Generar comprobantes. Después emitís la factura correcta.",
      },
      {
        q: "¿Qué pongo en el detalle cuando facturo horas de trabajo?",
        a: "Una descripción que diga el servicio y el período, por ejemplo “Servicios de diseño UX, octubre 2026”. Podés cargar una sola línea con el total o usar las horas como cantidad (18,75) con unidad “horas” y tu tarifa como precio unitario, así la factura dice exactamente lo mismo que el detalle de horas que le mandaste al cliente.",
      },
      {
        q: "¿Cuándo tengo que emitir la factura C por un servicio?",
        a: "Como regla general, la factura por servicios se emite hasta la fecha de vencimiento fijada para el pago o hasta el día en que cobrás, lo que ocurra primero. En la práctica, la mayoría de los freelancers factura al cerrar el mes, con el período completo. Confirmá los plazos vigentes con tu contador.",
      },
      {
        q: "¿La factura C reemplaza el detalle de horas que le mando al cliente?",
        a: "No, son documentos distintos con el mismo total. La factura C es el comprobante fiscal con CAE. El detalle de horas o invoice es el documento comercial con qué hiciste, qué día y cuánto sale, para que el cliente lo revise y apruebe. Registruti genera ese invoice en PDF desde las horas cargadas; la factura C la hacés en ARCA con ese total.",
      },
    ],
  },
  {
    slug: "factura-e-servicios-al-exterior",
    title: "Factura E para exportar servicios: cómo hacerla en ARCA",
    metaTitle: "Factura E para exportar servicios: cómo hacerla en ARCA",
    description:
      "Cómo emitir la factura E de exportación de servicios en ARCA siendo monotributista o inscripto: datos del cliente del exterior, moneda y cotización.",
    date: "24 de octubre de 2026",
    dateISO: "2026-10-24",
    tag: "Facturación",
    readingMinutes: 8,
    // "Factura E" tiene 1.000 búsquedas por mes en Argentina: el freelance que
    // cobra en dólares a un cliente de afuera, en el momento de cobrar.
    keywords: [
      "factura E",
      "factura de exportación de servicios",
      "factura E monotributo",
      "cómo hacer una factura E",
      "exportación de servicios ARCA",
      "facturar al exterior freelance",
      "factura E en dólares",
      "cobrar del exterior freelance",
    ],
    related: ["factura-c", "control-de-horas-trabajadas", "cobrar-por-hora-o-por-proyecto"],
    faqs: [
      {
        q: "¿Qué es la factura E?",
        a: "Es el comprobante de exportación. Se usa cuando le prestás un servicio (o le vendés un bien) a un cliente del exterior, y en el caso de los servicios, cuando el servicio se utiliza efectivamente afuera. Se emite desde Comprobantes en línea de ARCA, en la moneda pactada y sin IVA, y recibe un CAE como cualquier factura electrónica.",
      },
      {
        q: "¿Un monotributista puede emitir factura E?",
        a: "Sí. Los monotributistas pueden exportar servicios y facturarlos con factura E desde Comprobantes en línea, igual que una factura C. El equivalente en pesos de cada factura, a la cotización oficial de la fecha de emisión, suma al total anual que define la categoría del monotributo.",
      },
      {
        q: "¿La factura E lleva IVA?",
        a: "No. La exportación de servicios no genera IVA en la factura, ni para monotributistas ni para responsables inscriptos. Para los inscriptos hay reglas propias sobre el crédito fiscal y sobre ingresos brutos que conviene revisar con el contador.",
      },
      {
        q: "¿En qué moneda se emite la factura E?",
        a: "En la que pactaste con el cliente: dólar, euro u otra. Al elegirla, ARCA toma la cotización oficial del día hábil anterior y calcula el equivalente en pesos, que queda registrado en el comprobante. El importe se escribe en la moneda extranjera, no en pesos.",
      },
      {
        q: "¿Mi cliente está en el exterior pero el servicio se usa en Argentina: es factura E?",
        a: "En general, no. Para que haya exportación de servicios, el servicio tiene que utilizarse o explotarse efectivamente en el exterior. Si una empresa extranjera te contrata para atender su operación en Argentina, el tratamiento es distinto y conviene definirlo con tu contador antes de facturar.",
      },
      {
        q: "¿Cómo corrijo una factura E con un error?",
        a: "Igual que cualquier factura electrónica: no se edita. Emitís una Nota de crédito E por el mismo importe, asociada a la factura equivocada, y después la factura E correcta.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/**
 * Los posts relacionados de `post`, resueltos y en su orden. Si un slug no
 * existe (todavía), se saltea en vez de romper la página; si la lista queda
 * corta, se completa con los demás posts.
 */
export function getRelatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const chosen = post.related
    .map((slug) => getPost(slug))
    .filter((p): p is BlogPost => Boolean(p) && p!.slug !== post.slug);
  for (const candidate of POSTS) {
    if (chosen.length >= count) break;
    if (candidate.slug !== post.slug && !chosen.includes(candidate)) chosen.push(candidate);
  }
  return chosen.slice(0, count);
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
