import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";

/**
 * Layout compartido de las páginas "alternativa a X".
 *
 * Comparte la estructura, no el contenido: cada página trae sus propias
 * razones, tabla, FAQs y prosa. Es a propósito — tres páginas con el mismo
 * texto y el nombre cambiado son páginas puente, y Google las trata como tales.
 *
 * La página de Toggl Track no usa este componente: tiene secciones propias
 * (tabla de precios por plan, comparación extendida) y es la que ya rankea, así
 * que no la tocamos para no mover lo que funciona.
 */
export interface AlternativePageProps {
  competitor: string;
  badge: string;
  h1Lead: string;
  h1Highlight: string;
  subtitle: string;
  verdict: ReactNode;
  reasonsTitle: string;
  reasonsIntro: string;
  reasons: { icon: string; title: string; body: string }[];
  comparisonTitle: string;
  comparisonNote: string;
  comparison: { criterio: string; registruti: string; competitor: string; wins: boolean }[];
  /** Sección propia de cada página (precios, contexto extra). */
  extra?: ReactNode;
  whenCompetitorTitle: string;
  whenCompetitorIntro: string;
  whenCompetitor: { icon: string; title: string; body: string }[];
  migrationTitle: string;
  migration: { title: string; body: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  ctaTitle: string;
  ctaBody: string;
}

export default function AlternativePage(props: AlternativePageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader wide />

      <main className="mx-auto max-w-5xl px-4 py-14">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {props.badge}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {props.h1Lead}{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              {props.h1Highlight}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{props.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
            >
              Empezá gratis hoy
            </Link>
            <a
              href="#comparacion"
              className="rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver la comparación
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-500">Sin tarjeta de crédito. Sin instalación.</p>
        </div>

        {/* Veredicto */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
            El veredicto en 20 segundos
          </h2>
          <p className="mt-3 text-slate-700">{props.verdict}</p>
        </div>

        {/* Razones */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{props.reasonsTitle}</h2>
          <p className="mt-4 text-slate-600">{props.reasonsIntro}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {props.reasons.map((reason) => (
              <div key={reason.title} className="rounded-2xl border border-slate-200 p-5">
                <p className="text-2xl" aria-hidden>
                  {reason.icon}
                </p>
                <h3 className="mt-2 font-semibold">{reason.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{reason.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tabla comparativa */}
        <section id="comparacion" className="mt-16 scroll-mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            {props.comparisonTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            {props.comparisonNote}
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Criterio</th>
                  <th className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <Logo size={16} /> <Wordmark className="text-sm" />
                    </span>
                  </th>
                  <th className="px-5 py-4">{props.competitor}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {props.comparison.map((row) => (
                  <tr key={row.criterio}>
                    <td className="px-5 py-4 font-medium">{row.criterio}</td>
                    <td
                      className={`px-5 py-4 ${
                        row.wins ? "font-medium text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {row.registruti}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {props.extra}

        {/* Cuándo el competidor */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {props.whenCompetitorTitle}
          </h2>
          <p className="mt-4 text-slate-600">{props.whenCompetitorIntro}</p>
          <ul className="mt-4 space-y-3 text-slate-600">
            {props.whenCompetitor.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span aria-hidden>{item.icon}</span>
                <span>
                  <strong className="text-slate-900">{item.title}</strong> {item.body}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Migración */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{props.migrationTitle}</h2>
          <ol className="mt-6 space-y-5">
            {props.migration.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            {props.faqTitle}
          </h2>
          <div className="mt-8 space-y-3">
            {props.faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-slate-200 bg-white px-5 py-4"
              >
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

        {/* Seguir comparando */}
        <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Seguí comparando
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {props.related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA final */}
        <section className="mt-16 text-center">
          <Logo size={48} />
          <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{props.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">{props.ctaBody}</p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
          >
            Empezá gratis hoy
          </Link>
        </section>
      </main>

      <SiteFooter wide />
    </div>
  );
}
