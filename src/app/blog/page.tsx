import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Guías, novedades y tutoriales de ${SITE_NAME}: control de horas, facturación e integraciones para freelancers.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: `Blog | ${SITE_NAME}`,
    description: `Guías, novedades y tutoriales de ${SITE_NAME}.`,
  },
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mt-3 text-slate-600">
        Guías, novedades y tutoriales para sacarle el jugo a Registruti.
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
    </main>
  );
}
