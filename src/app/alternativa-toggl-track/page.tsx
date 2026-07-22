import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/alternativa-toggl-track`;
const UPDATED_ISO = "2026-07-22";

export const metadata: Metadata = {
  title: "Alternativa a Toggl Track gratis y en español (2026)",
  description:
    "¿Buscás una alternativa a Toggl Track? Registruti es gratis, está 100% en español e incluye lo que Toggl cobra USD 9/mes: tarifas por cliente, reportes facturables y facturas en PDF.",
  keywords: [
    "alternativa a Toggl Track",
    "alternativa a Toggl Track gratis",
    "Toggl Track en español",
    "Toggl Track precio",
    "Toggl Track gratis",
    "app como Toggl Track",
    "time tracker con facturación",
  ],
  alternates: { canonical: "/alternativa-toggl-track" },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    title: "La alternativa a Toggl Track gratis y en español | Registruti",
    description:
      "Todo lo que Toggl Track cobra USD 9 por mes —tarifas por cliente, montos facturables, facturación— gratis y en español. Comparación completa y honesta.",
  },
  twitter: {
    card: "summary_large_image",
    title: "La alternativa a Toggl Track gratis y en español",
    description:
      "Comparación honesta Registruti vs Toggl Track: precios 2026, funcionalidades y cómo migrar en 15 minutos.",
  },
};

const COMPARISON: { criterio: string; registruti: string; toggl: string; wins: boolean }[] = [
  {
    criterio: "Precio para usar tarifas facturables",
    registruti: "Gratis",
    toggl: "Plan Starter: USD 9/usuario/mes (anual) o ~USD 11 mensual",
    wins: true,
  },
  { criterio: "Idioma de la interfaz", registruti: "100% en español", toggl: "Solo inglés", wins: true },
  {
    criterio: "Tarifa y moneda por cliente",
    registruti: "Sí, 9 monedas (ARS, USD, EUR, UYU, BRL, CLP, COP, MXN, GBP)",
    toggl: "Tarifas en planes pagos; multi-moneda limitada",
    wins: true,
  },
  {
    criterio: "Generación de facturas",
    registruti: "Sí: desde tus horas, con numeración, estados y PDF",
    toggl: "No genera facturas (exporta reportes)",
    wins: true,
  },
  {
    criterio: "Link público para que tu cliente vea el detalle",
    registruti: "Sí, por factura, sin que tu cliente cree cuenta",
    toggl: "No tiene equivalente directo",
    wins: true,
  },
  {
    criterio: "Reportes de horas y montos por cliente",
    registruti: "Sí, con filtros por semana, mes o rango",
    toggl: "Sí (montos en planes pagos)",
    wins: true,
  },
  {
    criterio: "Modelo de cobro",
    registruti: "Freemium + lifetime access (pago único, sin suscripción)",
    toggl: "Suscripción mensual/anual por usuario",
    wins: true,
  },
  {
    criterio: "Pensada para",
    registruti: "Freelancers y consultores independientes",
    toggl: "Equipos y empresas",
    wins: true,
  },
  {
    criterio: "Cronómetro en tiempo real",
    registruti: "No: carga manual en bloques de 15 min a 8 hs",
    toggl: "Sí, excelente, con detección de inactividad",
    wins: false,
  },
  {
    criterio: "Apps nativas iOS / Android / escritorio",
    registruti: "No (web responsive, instalable como PWA)",
    toggl: "Sí, todas las plataformas",
    wins: false,
  },
  {
    criterio: "Integraciones (calendarios, PM, etc.)",
    registruti: "Servidor MCP para asistentes de IA (Claude, Cursor)",
    toggl: "100+ integraciones",
    wins: false,
  },
];

const FAQS = [
  {
    q: "¿Toggl Track está disponible en español?",
    a: "No. La interfaz de Toggl Track está únicamente en inglés y no ofrece traducción oficial al español. Registruti, en cambio, está escrita 100% en español desde cero: menús, reportes, facturas y soporte.",
  },
  {
    q: "¿Cuánto cuesta Toggl Track en 2026?",
    a: "Toggl Track tiene un plan Free (hasta 5 usuarios) que no incluye tarifas facturables. El plan Starter cuesta USD 9 por usuario por mes con facturación anual (USD 108/año) o alrededor de USD 11 mes a mes, y el plan Premium USD 18 por usuario por mes anual. Para un freelancer que necesita tarifas y montos facturables, el costo real de Toggl es de USD 108 a 216 por año.",
  },
  {
    q: "¿Qué alternativa a Toggl Track es gratis e incluye facturación?",
    a: "Registruti: el plan gratis incluye tarifas por cliente en 9 monedas, reportes con montos facturables y generación de facturas en PDF con link público (hasta 3 clientes activos y 4 facturas). El desbloqueo total es un pago único de por vida, no una suscripción.",
  },
  {
    q: "¿Qué pierdo si dejo Toggl Track por Registruti?",
    a: "Principalmente dos cosas: el cronómetro corriendo en tiempo real (en Registruti cargás bloques de 15 minutos a 8 horas, típicamente al cerrar el día) y las apps nativas de iOS/Android (Registruti es web y se puede instalar como PWA en el celular). Si tu flujo depende de un timer siempre encendido, Toggl sigue siendo mejor para vos.",
  },
  {
    q: "¿Puedo importar mis datos de Toggl Track a Registruti?",
    a: "Todavía no hay importación automática. Lo que recomendamos: exportá tu histórico desde Toggl (Reports → Export → CSV) para conservarlo, creá tus clientes en Registruti con su tarifa y moneda, y empezá a trackear la semana en curso. La migración típica lleva unos 15 minutos.",
  },
  {
    q: "¿Necesito tarjeta de crédito para probar Registruti?",
    a: "No. Creás la cuenta con tu email o con Google y empezás a trackear al instante. El plan gratis no tiene límite de tiempo ni pide medio de pago.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": PAGE_URL,
      url: PAGE_URL,
      name: "Alternativa a Toggl Track gratis y en español (2026)",
      description:
        "Comparación completa entre Registruti y Toggl Track para freelancers: precios 2026, funcionalidades, idioma y cómo migrar.",
      inLanguage: "es",
      datePublished: UPDATED_ISO,
      dateModified: UPDATED_ISO,
      isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
      about: { "@type": "SoftwareApplication", "@id": `${SITE_URL}/#app` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Alternativa a Toggl Track", item: PAGE_URL },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ],
};

export default function AlternativaTogglPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <SiteHeader wide />

      <main className="mx-auto max-w-5xl px-4 py-14">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Comparación actualizada · julio 2026
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            La alternativa a Toggl Track{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              gratis y en español
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Todo lo que Toggl Track cobra USD 9 por usuario por mes —tarifas por cliente, montos
            facturables, reportes— acá es gratis, en tu idioma, y con un paso que Toggl no tiene:
            la factura en PDF lista para mandar.
          </p>
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

        {/* Veredicto rápido */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
            El veredicto en 20 segundos
          </h2>
          <p className="mt-3 text-slate-700">
            <strong>Elegí Registruti</strong> si sos freelancer o consultor, facturás por hora a
            varios clientes y querés pasar de las horas a la factura sin pagar suscripción y sin
            pelear con el inglés. <strong>Quedate en Toggl Track</strong> si tu prioridad es un
            cronómetro corriendo en segundo plano, apps nativas en todas las plataformas o tracking
            para un equipo grande. Abajo está el detalle, sin humo.
          </p>
        </div>

        {/* Por qué buscar alternativa */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Por qué buscar una alternativa a Toggl Track?
          </h2>
          <p className="mt-4 text-slate-600">
            Toggl Track es un gran producto — no vamos a decirte lo contrario. Pero hay tres
            fricciones que los freelancers hispanohablantes se encuentran una y otra vez:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-2xl" aria-hidden>
                💸
              </p>
              <h3 className="mt-2 font-semibold">El free no alcanza para cobrar</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Las tarifas facturables —lo mínimo para saber cuánta plata generaste— arrancan en
                el plan Starter: USD 108 por año.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-2xl" aria-hidden>
                🌎
              </p>
              <h3 className="mt-2 font-semibold">Solo en inglés</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                No hay versión en español. Para una herramienta que usás todos los días, el idioma
                es fricción diaria.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="text-2xl" aria-hidden>
                🏢
              </p>
              <h3 className="mt-2 font-semibold">Pensado para equipos</h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Permisos, auditoría, tracking de equipo: pagás (y navegás) funciones de empresa que
                un freelancer no usa.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla comparativa */}
        <section id="comparacion" className="mt-16 scroll-mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Registruti vs. Toggl Track: la comparación completa
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Datos verificados a julio de 2026. Marcamos también dónde gana Toggl — una comparación
            que esconde eso no te sirve para decidir.
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
                  <th className="px-5 py-4">Toggl Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {COMPARISON.map((row) => (
                  <tr key={row.criterio}>
                    <td className="px-5 py-4 font-medium">{row.criterio}</td>
                    <td
                      className={`px-5 py-4 ${
                        row.wins ? "font-medium text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {row.registruti}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{row.toggl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Precios */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Cuánto cuesta Toggl Track en 2026? (y cuánto Registruti)
          </h2>
          <p className="mt-4 text-slate-600">
            El plan Free de Toggl sirve para medir tiempo, pero un freelancer que factura necesita
            tarifas y montos facturables, y eso vive en los planes pagos:
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Precio por usuario</th>
                  <th className="px-5 py-4">Costo anual real (1 persona)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-5 py-4 font-medium">Toggl Track Free</td>
                  <td className="px-5 py-4 text-slate-500">USD 0 (sin tarifas facturables)</td>
                  <td className="px-5 py-4 text-slate-500">USD 0</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Toggl Track Starter</td>
                  <td className="px-5 py-4 text-slate-500">USD 9/mes (anual) · ~USD 11 mensual</td>
                  <td className="px-5 py-4 text-slate-500">USD 108–136</td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium">Toggl Track Premium</td>
                  <td className="px-5 py-4 text-slate-500">USD 18/mes (anual) · ~USD 23 mensual</td>
                  <td className="px-5 py-4 text-slate-500">USD 216–272</td>
                </tr>
                <tr className="bg-indigo-50/40">
                  <td className="px-5 py-4 font-semibold text-indigo-700">Registruti</td>
                  <td className="px-5 py-4 font-medium text-emerald-700">
                    Gratis (tarifas y facturas incluidas)
                  </td>
                  <td className="px-5 py-4 font-medium text-emerald-700">
                    USD 0 · lifetime access opcional con pago único
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Precios publicados por Toggl a julio de 2026 (facturación anual vs. mensual). El plan
            gratis de Registruti incluye hasta 3 clientes activos y 4 facturas; el lifetime access
            desbloquea todo con un único pago, sin suscripción.
          </p>
        </section>

        {/* Cuándo Toggl */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cuándo Toggl Track sigue siendo tu mejor opción
          </h2>
          <p className="mt-4 text-slate-600">Nos interesa que elijas bien, no que elijas Registruti:</p>
          <ul className="mt-4 space-y-3 text-slate-600">
            <li className="flex gap-3">
              <span aria-hidden>⏲️</span>
              <span>
                <strong className="text-slate-900">Vivís del cronómetro.</strong> Si tu flujo es
                play/stop todo el día con detección de inactividad, el timer de Toggl es el mejor
                del mercado. Registruti usa carga manual en bloques de 15 minutos.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>📱</span>
              <span>
                <strong className="text-slate-900">Necesitás apps nativas.</strong> Toggl tiene apps
                de iOS, Android, macOS, Windows y Linux. Registruti es web (instalable como PWA en
                el celular).
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>👥</span>
              <span>
                <strong className="text-slate-900">Gestionás un equipo.</strong> Aprobaciones,
                permisos, tarifas por miembro, 100+ integraciones: para equipos, Toggl está años
                adelante. Registruti es deliberadamente individual.
              </span>
            </li>
          </ul>
          <p className="mt-4 text-slate-600">
            ¿Ninguno de los tres es tu caso? Entonces seguí leyendo, porque probablemente estés
            pagando (o sufriendo en inglés) funciones que no usás. También comparamos{" "}
            <Link
              href="/blog/mejores-alternativas-toggl-track"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              otras 6 alternativas a Toggl Track
            </Link>{" "}
            por si querés ver el mercado completo.
          </p>
        </section>

        {/* Migración */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cómo pasarte de Toggl Track a Registruti en 15 minutos
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                title: "Exportá tu histórico de Toggl",
                body: "En Toggl: Reports → elegí el rango → Export → CSV. Guardá ese archivo: es tu respaldo completo de horas históricas (por ahora Registruti no importa CSV automáticamente).",
              },
              {
                title: "Creá tu cuenta gratis en Registruti",
                body: "Con email o Google, sin tarjeta. Elegí tu país para que la moneda y el ID fiscal (CUIT, RUT, RFC...) se configuren solos.",
              },
              {
                title: "Cargá tus clientes con tarifa y moneda",
                body: "Uno por uno, con su tarifa por hora y su moneda (ARS, USD, EUR y 6 más). Esto es lo que en Toggl requería el plan pago.",
              },
              {
                title: "Arrancá a trackear la semana en curso",
                body: "Cargá las horas de esta semana en la vista semanal. Desde la primera semana completa ya podés generar tu primera factura en PDF con link público.",
              },
            ].map((step, i) => (
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
            Preguntas frecuentes sobre dejar Toggl Track
          </h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((faq) => (
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

        {/* Seguir leyendo */}
        <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Seguí comparando
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/blog/mejores-alternativas-toggl-track"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Las 6 mejores alternativas a Toggl Track en 2026 (gratis y pagas)
              </Link>
            </li>
            <li>
              <Link
                href="/blog/mejores-time-trackers-freelancers"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Los mejores time trackers para freelancers en 2026
              </Link>
            </li>
            <li>
              <Link
                href="/blog/control-de-horas-trabajadas"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Cómo llevar el control de horas trabajadas: guía para freelancers
              </Link>
            </li>
          </ul>
        </section>

        {/* CTA final */}
        <section className="mt-16 text-center">
          <Logo size={48} />
          <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            Probala con tu semana real
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Creá tu cuenta, cargá tus clientes con su tarifa y trackeá esta semana. Si el viernes la
            factura no sale en un clic, volvé a Toggl — el CSV exportado te espera.
          </p>
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
