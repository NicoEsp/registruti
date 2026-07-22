import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog: guías de time tracking y facturación freelance",
  description: `Guías, comparativas y tutoriales de ${SITE_NAME}: control de horas, alternativas a Toggl Track, facturación e integraciones para freelancers.`,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": `${SITE_URL}/blog/feed.xml` },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: `Blog | ${SITE_NAME}`,
    description: `Guías, comparativas y tutoriales de ${SITE_NAME}: control de horas, time trackers y facturación para freelancers.`,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_URL}/blog#blog`,
  url: `${SITE_URL}/blog`,
  name: `Blog de ${SITE_NAME}`,
  description: `Guías, comparativas y tutoriales sobre control de horas, time tracking y facturación para freelancers.`,
  inLanguage: "es",
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  blogPost: POSTS.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.dateISO,
  })),
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mt-3 text-slate-600">
        Guías, comparativas y tutoriales sobre control de horas, time tracking y facturación para
        freelancers.
      </p>

      <div className="mt-10 space-y-4">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
                {post.tag}
              </span>
              <time dateTime={post.dateISO}>{post.date}</time>
              <span>·</span>
              <span>{post.readingMinutes} min de lectura</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
              {post.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{post.description}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600">Leer →</span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-500">
        ¿Comparando herramientas? Empezá por{" "}
        <Link
          href="/alternativa-toggl-track"
          className="font-medium text-indigo-600 underline-offset-2 hover:underline"
        >
          Registruti como alternativa a Toggl Track
        </Link>
        .
      </p>
    </main>
  );
}
