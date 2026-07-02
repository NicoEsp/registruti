import type { Metadata } from "next";
import Link from "next/link";
import FlameLogo from "@/components/FlameLogo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FEATURES = [
  {
    icon: "⏱️",
    title: "Tu semana, en bloques de 15",
    description:
      "Cargá entradas de 15 minutos a 8 horas por día, con descripción y cliente. Una vista semanal donde se ve todo de un vistazo.",
  },
  {
    icon: "💱",
    title: "Cada cliente, su tarifa y su moneda",
    description:
      "Clientes ilimitados, cada uno con su tarifa por hora, su color y su moneda: ARS, USD, EUR, UYU, BRL, CLP, COP, MXN o GBP. Cobrale en pesos a uno y en dólares a otro sin hacer cuentas aparte.",
  },
  {
    icon: "📊",
    title: "Reportes que responden “¿cuánto facturo?”",
    description:
      "Horas y monto facturable por cliente, gráfico de barras apiladas y matriz cliente × día con subtotales semanales. Filtrá por semana, mes o el rango que quieras.",
  },
  {
    icon: "🧾",
    title: "Facturas que se arman solas",
    description:
      "Elegí cliente y período, y la factura se genera desde tus horas trackeadas: numeración automática, estados (borrador, enviada, pagada) y exportación a PDF lista para imprimir o mandar.",
  },
  {
    icon: "🔗",
    title: "Un link y tu cliente ve todo",
    description:
      "Cada factura tiene un link público con el detalle de horas y montos. Tu cliente lo abre sin crear cuenta: trazabilidad total, cero idas y vueltas por mail.",
  },
  {
    icon: "🇦🇷",
    title: "100% en español, cero curva de aprendizaje",
    description:
      "Hecha para freelancers hispanohablantes, no para equipos enterprise. Sin menús traducidos a medias ni configuración de media hora: entrás y trackeás.",
  },
];

const COMPARISON: { criterio: string; diamble: string; toggl: string; wins: boolean }[] = [
  {
    criterio: "Precio para facturar con tarifas",
    diamble: "Gratis hoy",
    toggl: "~USD 10/usuario/mes (plan Starter)",
    wins: true,
  },
  { criterio: "Idioma", diamble: "100% en español", toggl: "Solo en inglés", wins: true },
  {
    criterio: "Facturación incluida",
    diamble: "Sí: generada desde tus horas, con PDF y estados",
    toggl: "Tarifas en planes pagos; facturación limitada",
    wins: true,
  },
  {
    criterio: "Link público para tu cliente",
    diamble: "Sí: detalle de horas y montos sin crear cuenta",
    toggl: "No tiene equivalente directo",
    wins: true,
  },
  {
    criterio: "Multi-moneda con foco LatAm",
    diamble: "9 monedas, incluidas ARS, UYU, CLP, COP, MXN y BRL",
    toggl: "Multi-moneda en planes pagos",
    wins: true,
  },
  {
    criterio: "Pensada para",
    diamble: "Freelancers y consultores independientes",
    toggl: "Equipos y empresas",
    wins: true,
  },
  {
    criterio: "Apps móviles",
    diamble: "No (web, usable desde el celular)",
    toggl: "Sí, iOS y Android",
    wins: false,
  },
  {
    criterio: "Timer automático en tiempo real",
    diamble: "No: cargás bloques de 15 min a 8 hs",
    toggl: "Sí, con cronómetro y detección de actividad",
    wins: false,
  },
];

const STEPS = [
  {
    title: "Creá tus clientes",
    description:
      "Cargá cada cliente con su tarifa por hora, su moneda y un color para identificarlo de un vistazo.",
  },
  {
    title: "Trackeá tu semana",
    description:
      "Registrá tus horas por día en bloques de 15 minutos, con descripción y cliente, desde la vista semanal.",
  },
  {
    title: "Facturá en un clic",
    description:
      "Generá la factura del período con numeración automática, exportala a PDF y compartile a tu cliente el link público con todo el detalle.",
  },
];

const FAQS = [
  {
    q: "¿Hay una alternativa gratis a Toggl Track?",
    a: "Sí. Registruti es una alternativa gratuita y en español a Toggl Track, pensada para freelancers. Incluye desde el inicio lo que en Toggl requiere el plan Starter (~USD 10/usuario/mes): tarifas por cliente, montos facturables y generación de facturas. Empezá gratis hoy, sin tarjeta.",
  },
  {
    q: "¿Cómo llevo el control de horas como freelancer?",
    a: "La clave es registrar las horas el mismo día, asociadas a un cliente y con una descripción corta de la tarea. En Registruti lo hacés en una vista semanal con bloques de 15 minutos a 8 horas, y los reportes te muestran automáticamente cuántas horas y cuánta plata acumulaste por cliente en la semana, el mes o el rango que elijas.",
  },
  {
    q: "¿Puedo facturar en pesos y en dólares a la vez?",
    a: "Sí. Cada cliente tiene su propia tarifa y su propia moneda: podés cobrarle en ARS a un cliente local y en USD a uno del exterior, sin conversiones manuales. Hay 9 monedas disponibles: ARS, USD, EUR, UYU, BRL, CLP, COP, MXN y GBP.",
  },
  {
    q: "¿Mi cliente puede ver las horas que le facturo?",
    a: "Sí, y sin crear cuenta. Cada factura genera un link público con el detalle completo de horas, descripciones y montos. Se lo mandás y tu cliente verifica todo por su cuenta: menos discusiones, más confianza, trazabilidad total.",
  },
  {
    q: "¿Cómo genero la factura desde mis horas trackeadas?",
    a: "Elegís el cliente y el período, y Registruti arma la factura automáticamente con todas las horas registradas, la tarifa del cliente y la numeración correlativa. Después la gestionás por estados (borrador, enviada, pagada) y la exportás a PDF para imprimir o enviar.",
  },
  {
    q: "¿Registruti sirve para equipos o empresas?",
    a: "No es el foco. Registruti está diseñada para freelancers y consultores independientes que facturan por hora a varios clientes. Si necesitás gestión de equipos, permisos y nómina, una herramienta enterprise te va a servir mejor; si trabajás por tu cuenta, acá no pagás por funciones que no usás.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "es",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      audience: { "@type": "Audience", audienceType: "Freelancers y consultores independientes" },
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

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <FlameLogo size={30} />
            <span className="text-lg font-semibold tracking-tight">Registruti</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#funcionalidades" className="hover:text-slate-900">
              Funcionalidades
            </a>
            <a href="#vs-toggl" className="hover:text-slate-900">
              vs Toggl Track
            </a>
            <a href="#faq" className="hover:text-slate-900">
              Preguntas
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-amber-600 hover:to-orange-700"
            >
              Empezá gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-amber-50 via-orange-50/40 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
              <span aria-hidden>🔥</span> Hecha para freelancers de Latinoamérica
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Control de horas y facturación para freelancers,{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                en español
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Trackeá tu semana en bloques de 15 minutos, asignale a cada cliente su tarifa en su
              moneda (ARS, USD, EUR y 6 más) y generá la factura en PDF en un clic. Lo que Toggl
              Track cobra USD 10 por mes, acá lo empezás gratis.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-700"
              >
                Empezá gratis hoy
              </Link>
              <a
                href="#como-funciona"
                className="rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">Sin tarjeta de crédito. Sin instalación.</p>
          </div>

          {/* Mock del producto */}
          <div className="relative" aria-hidden>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Tracker</span>
                <span className="text-xs text-slate-500">
                  Total semana: <strong className="text-slate-900">23:45</strong>
                </span>
              </div>
              <div className="mb-4 grid grid-cols-7 gap-1.5">
                {[
                  ["Lun", "6:15", false],
                  ["Mar", "4:30", false],
                  ["Mié", "5:00", true],
                  ["Jue", "3:45", false],
                  ["Vie", "4:15", false],
                  ["Sáb", "—", false],
                  ["Dom", "—", false],
                ].map(([day, total, selected]) => (
                  <div
                    key={day as string}
                    className={`flex flex-col items-center rounded-lg border px-1 py-1.5 text-[10px] ${
                      selected
                        ? "border-orange-500 bg-gradient-to-b from-amber-500 to-orange-600 text-white"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    <span className="font-medium uppercase">{day}</span>
                    <span className="font-mono">{total}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  ["#f59e0b", "Auditoría de producto", "Estudio Galley", "2:30"],
                  ["#6366f1", "Discovery + roadmap Q3", "Baratie Labs", "1:45"],
                  ["#10b981", "Sesión de mentoría", "All Blue Ventures", "0:45"],
                ].map(([color, task, client, duration]) => (
                  <div
                    key={task as string}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color as string }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{task}</p>
                      <p className="text-[10px] text-slate-500">{client}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold">{duration}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5">
                <span className="text-xs font-medium text-orange-800">
                  Factura INV-0007 · Estudio Galley
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-orange-700 shadow-sm">
                  PDF + link público
                </span>
              </div>
            </div>
            <div
              className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-300/40 to-orange-400/40 blur-2xl"
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            De las horas trabajadas a la factura enviada, sin pasos intermedios.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-600">
            Registruti convierte tu semana de trabajo en facturas listas para enviar: trackeás
            tus horas por cliente, cada uno con su tarifa y su moneda, y la factura se genera sola
            con el detalle completo. Tu cliente la ve desde un link público, sin crear cuenta ni
            pedirte explicaciones. En español, gratis, y sin las funciones enterprise que nunca vas
            a usar.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Todo lo que necesitás para cobrar tus horas
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Ni más, ni menos: las funcionalidades que un freelancer usa todos los días.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden>
                {feature.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-20 border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Cómo funciona
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-base font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* vs Toggl Track */}
      <section id="vs-toggl" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Registruti vs. Toggl Track
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
          Toggl Track es una gran herramienta, pero está pensada (y cobrada) para equipos. Si sos
          freelancer y lo que necesitás es trackear, reportar y facturar, esta es la comparación
          honesta:
        </p>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Criterio</th>
                <th className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-orange-600">
                    <FlameLogo size={16} /> Registruti
                  </span>
                </th>
                <th className="px-5 py-4">Toggl Track</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {COMPARISON.map((row) => (
                <tr key={row.criterio}>
                  <td className="px-5 py-4 font-medium">{row.criterio}</td>
                  <td className={`px-5 py-4 ${row.wins ? "font-medium text-emerald-700" : "text-slate-500"}`}>
                    {row.diamble}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{row.toggl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm italic text-slate-500">
          Resumen honesto: si necesitás cronómetro corriendo en segundo plano y app nativa, Toggl
          gana. Si necesitás pasar de horas a factura cobrable, en tu idioma y sin pagar USD 120 al
          año, Registruti es para vos.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-10 space-y-3">
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
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <FlameLogo size={48} />
        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
          Tu próxima factura empieza con la próxima hora trackeada
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Creá tu cuenta, cargá tu primer cliente y empezá a trackear en menos de dos minutos.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-700"
        >
          Empezá gratis hoy
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center">
          <div className="flex items-center gap-2">
            <FlameLogo size={22} />
            <span className="font-semibold">Registruti</span>
          </div>
          <p className="text-sm text-slate-500">
            Registrá cada hora que trabajás y convertila en factura. Sin vueltas.
          </p>
          <nav className="flex gap-5 text-sm text-slate-500">
            <a href="#funcionalidades" className="hover:text-slate-900">
              Funcionalidades
            </a>
            <a href="#vs-toggl" className="hover:text-slate-900">
              vs Toggl Track
            </a>
            <a href="#faq" className="hover:text-slate-900">
              Preguntas
            </a>
            <Link href="/login" className="hover:text-slate-900">
              Iniciar sesión
            </Link>
          </nav>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Registruti — Control de horas y facturación para
            freelancers.
          </p>
        </div>
      </footer>
    </div>
  );
}
