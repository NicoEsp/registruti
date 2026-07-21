import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import McpArticle from "@/components/blog/McpArticle";

// Mapa slug → cuerpo del artículo. Al sumar un post: agregá su entrada en
// src/lib/blog.ts y su componente acá.
const BODIES: Record<string, ReactNode> = {
  mcp: <McpArticle />,
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
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.dateISO,
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
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.dateISO,
    inLanguage: "es",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
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

      <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
          {post.tag}
        </span>
        <time dateTime={post.dateISO}>{post.date}</time>
        <span>·</span>
        <span>{post.readingMinutes} min de lectura</span>
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg text-slate-600">{post.description}</p>

      <hr className="my-8 border-slate-100" />

      <article className="article">{body}</article>

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
    </main>
  );
}
