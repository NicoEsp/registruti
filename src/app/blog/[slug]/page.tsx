import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, formatDateES, getPost, getRelatedPosts, type BlogFaq, type BlogPost } from "@/lib/blog";
import { SITE_AUTHOR, SITE_NAME, SITE_OG_IMAGE, SITE_URL, authorPersonJsonLd } from "@/lib/site";
import McpArticle from "@/components/blog/McpArticle";
import TogglAlternativasArticle from "@/components/blog/TogglAlternativasArticle";
import TimeTrackersArticle from "@/components/blog/TimeTrackersArticle";
import ControlHorasArticle from "@/components/blog/ControlHorasArticle";
import CobrarPorHoraOProyectoArticle from "@/components/blog/CobrarPorHoraOProyectoArticle";
import FacturaCArticle from "@/components/blog/FacturaCArticle";
import FacturaEArticle from "@/components/blog/FacturaEArticle";

// Mapa slug → cuerpo del artículo. Al sumar un post: agregá su entrada en
// src/lib/blog.ts y su componente acá.
const BODIES: Record<string, ReactNode> = {
  mcp: <McpArticle />,
  "mejores-alternativas-toggl-track": <TogglAlternativasArticle />,
  "mejores-time-trackers-freelancers": <TimeTrackersArticle />,
  "control-de-horas-trabajadas": <ControlHorasArticle />,
  "cobrar-por-hora-o-por-proyecto": <CobrarPorHoraOProyectoArticle />,
  "factura-c": <FacturaCArticle />,
  "factura-e-servicios-al-exterior": <FacturaEArticle />,
};

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    // `metaTitle` es el <title> exacto para los posts cuyo título con la
    // plantilla "| Registruti" pasa los 60 caracteres y Google lo corta.
    title: post.metaTitle ? { absolute: post.metaTitle } : post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
      types: { "application/rss+xml": `${SITE_URL}/blog/feed.xml` },
    },
    openGraph: {
      images: [SITE_OG_IMAGE],
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.dateISO,
      modifiedTime: post.updatedISO ?? post.dateISO,
      section: post.tag,
      tags: post.keywords,
      locale: "es_AR",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const body = BODIES[slug];
  if (!post || !body) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/${post.slug}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.dateISO,
        dateModified: post.updatedISO ?? post.dateISO,
        inLanguage: "es",
        keywords: post.keywords.join(", "),
        articleSection: post.tag,
        // Persona, no organización: Google evalúa quién firma (E-E-A-T) y el
        // byline visible de abajo tiene que coincidir con esto. El nodo Person
        // completo va al final del grafo, con el @id compartido por los tres
        // sitios del autor.
        author: { "@id": SITE_AUTHOR.id },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
        },
        image: `${SITE_URL}/opengraph-image.jpg`,
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
        isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog#blog` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `${SITE_URL}/blog/${post.slug}`,
          },
        ],
      },
      authorPersonJsonLd(),
      // Las preguntas frecuentes del post, si las tiene: la respuesta corta a
      // la pregunta exacta es lo que Google y las IAs citan.
      ...(post.faqs?.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: post.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-800">
        ← Volver al blog
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
          {post.tag}
        </span>
        <time dateTime={post.dateISO}>{post.date}</time>
        {post.updatedISO ? (
          <>
            <span>·</span>
            <span>
              Actualizado el <time dateTime={post.updatedISO}>{formatDateES(post.updatedISO)}</time>
            </span>
          </>
        ) : null}
        <span>·</span>
        <span>{post.readingMinutes} min de lectura</span>
        <span>·</span>
        <span>
          Por{" "}
          <a
            href={SITE_AUTHOR.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            {SITE_AUTHOR.name}
          </a>
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg text-slate-600">{post.description}</p>

      <hr className="my-8 border-slate-100" />

      <article className="article">{body}</article>

      {post.faqs?.length ? <PostFaqs faqs={post.faqs} /> : null}

      <div className="mt-12 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 text-center">
        <p className="text-base font-semibold text-slate-900">
          ¿Todavía no usás Registruti?
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
          Trackeá tus horas, asigná tarifas por cliente y generá facturas. Gratis y en español.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
        >
          Empezá gratis hoy
        </Link>
      </div>

      <RelatedPosts post={post} />
    </main>
  );
}

/** Preguntas frecuentes al pie del post. Mismo acordeón que las landings. */
function PostFaqs({ faqs }: { faqs: BlogFaq[] }) {
  return (
    <section className="mt-12" aria-labelledby="post-faq">
      <h2 id="post-faq" className="text-xl font-bold tracking-tight text-slate-900">
        Preguntas frecuentes
      </h2>
      <div className="mt-5 space-y-3">
        {faqs.map((faq) => (
          <details key={faq.q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4">
            <summary className="cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {faq.q}
                <span className="text-slate-400 transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Otros artículos del blog, para retención y crawleo interno. Los elige cada
 * post (`related` en blog.ts), por tema: así ningún post se queda con un solo
 * enlace interno por estar último en la lista.
 */
function RelatedPosts({ post }: { post: BlogPost }) {
  const others = getRelatedPosts(post);
  if (others.length === 0) return null;
  return (
    <aside className="mt-12">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Seguí leyendo
      </h2>
      <ul className="mt-4 space-y-3">
        {others.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="text-sm font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
