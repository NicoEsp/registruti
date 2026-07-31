import { SITE_URL } from "@/lib/site";

/**
 * JSON-LD compartido de las páginas "alternativa a X".
 *
 * Las tres arman el mismo grafo (WebPage + BreadcrumbList + FAQPage) y solo
 * cambian los datos. Tenerlo en un lugar evita que se separen con el tiempo:
 * la distinción entre datePublished y dateModified, por ejemplo, se arregla
 * una vez y vale para todas.
 */

export interface ComparisonFaq {
  q: string;
  a: string;
}

export interface ComparisonJsonLdInput {
  pageUrl: string;
  /** Nombre de la página en el grafo (suele coincidir con el <title> sin marca). */
  name: string;
  description: string;
  /** Último nivel del breadcrumb; el primero siempre es Inicio. */
  breadcrumbLabel: string;
  /**
   * Fecha de publicación ORIGINAL. No se toca al editar la página: si se mueve,
   * le estamos diciendo a Google que el contenido es más nuevo de lo que es y
   * perdemos la antigüedad acumulada.
   */
  publishedISO: string;
  /** Fecha de la última edición real de contenido. */
  modifiedISO: string;
  faqs: readonly ComparisonFaq[];
}

export function buildComparisonJsonLd(input: ComparisonJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": input.pageUrl,
        url: input.pageUrl,
        name: input.name,
        description: input.description,
        inLanguage: "es",
        datePublished: input.publishedISO,
        dateModified: input.modifiedISO,
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
        about: { "@type": "SoftwareApplication", "@id": `${SITE_URL}/#app` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: input.breadcrumbLabel, item: input.pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: input.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
}
