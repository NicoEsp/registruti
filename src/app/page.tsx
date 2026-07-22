import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import MadeByBadge from "@/components/MadeByBadge";
import LandingAuthRedirect from "@/components/LandingAuthRedirect";
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
      "Cada cliente con su tarifa por hora, su color y su moneda: ARS, USD, EUR, UYU, BRL, CLP, COP, MXN o GBP. Cobrale en pesos a uno y en dólares a otro sin hacer cuentas aparte.",
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
    diamble: "Gratis; todo ilimitado con un pago único (sin suscripción)",
    toggl: "USD 9–11/usuario/mes (plan Starter)",
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
    criterio: "Asistentes de IA (MCP)",
    diamble: "Sí: servidor MCP integrado — cargá horas desde Claude o Cursor",
    toggl: "Sin soporte oficial",
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
    a: "Sí. Registruti es una alternativa gratuita y en español a Toggl Track, pensada para freelancers. Incluye desde el inicio lo que en Toggl requiere el plan Starter (USD 9/usuario/mes con facturación anual): tarifas por cliente, montos facturables y generación de facturas. Empezá gratis hoy, sin tarjeta.",
  },
  {
    q: "¿Cuánto cuesta Registruti?",
    a: "El plan gratis no vence nunca e incluye todas las funcionalidades —tracker, reportes, facturas en PDF con link público y conexión MCP— con un tope de 3 clientes activos y 4 facturas. Si necesitás más, el lifetime access desbloquea clientes y facturas ilimitados con un único pago de por vida: no hay suscripción mensual ni anual.",
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
    q: "¿Puedo cargar horas hablándole a Claude u otro asistente de IA?",
    a: "Sí. Registruti tiene un servidor MCP (Model Context Protocol) integrado: generás un token en Ajustes, lo conectás a Claude Desktop, Claude Code, Cursor u otro cliente MCP, y le pedís cosas como “cargá 2 horas de hoy para Acme” o “¿cuántas horas facturables llevo este mes?”. En el blog hay un tutorial paso a paso.",
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
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
      sameAs: ["https://x.com/nicoproducto"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "es",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Time tracking y facturación",
      operatingSystem: "Web",
      inLanguage: "es",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Registro de horas semanal en bloques de 15 minutos",
        "Tarifa por hora y moneda propia por cliente (9 monedas)",
        "Reportes de horas y montos facturables por cliente y período",
        "Generación de facturas en PDF desde las horas trackeadas",
        "Link público por factura para compartir con el cliente",
        "Servidor MCP para cargar horas por lenguaje natural",
      ],
      audience: { "@type": "Audience", audienceType: "Freelancers y consultores independientes" },
      author: { "@id": `${SITE_URL}/#organization` },
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
      <LandingAuthRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={30} />
            <Wordmark className="text-lg text-slate-800" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#funcionalidades" className="hover:text-slate-900">
              Funcionalidades
            </a>
            <a href="#precios" className="hover:text-slate-900">
              Precios
            </a>
            <a href="#vs-toggl" className="hover:text-slate-900">
              vs Toggl Track
            </a>
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
            <a href="#faq" className="hover:text-slate-900">
              Preguntas
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden xl:block">
              <MadeByBadge />
            </div>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-indigo-600"
            >
              Empezá gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-50 via-indigo-50/40 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <span aria-hidden>⏱️</span> Hecha para freelancers de Latinoamérica
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Control de horas y facturación para freelancers,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                en español
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Trackeá tu semana en bloques de 15 minutos, asignale a cada cliente su tarifa en su
              moneda (ARS, USD, EUR y 6 más) y generá la factura en PDF en un clic. Lo que Toggl
              Track cobra desde USD 9 por usuario al mes, acá lo empezás gratis.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
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
                        ? "border-indigo-600 bg-gradient-to-b from-indigo-600 to-indigo-500 text-white"
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
              <div className="mt-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2.5">
                <span className="text-xs font-medium text-indigo-800">
                  Factura INV-0007 · Estudio Galley
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-700 shadow-sm">
                  PDF + link público
                </span>
              </div>
            </div>
            <div
              className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-300/40 to-violet-400/40 blur-2xl"
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
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-base font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conexión MCP */}
      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-3xl" aria-hidden>
              🤖
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Cargá horas hablándole a Claude
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Registruti tiene servidor MCP integrado: conectala a Claude Desktop, Claude Code o
                Cursor y pedile “cargá 2 horas de hoy para Acme” o “¿cuánto facturo este mes?” sin
                abrir la app.
              </p>
            </div>
          </div>
          <Link
            href="/blog/mcp"
            className="shrink-0 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            Ver el tutorial →
          </Link>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Precios simples: gratis, o un único pago
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Sin suscripciones. El plan gratis no vence, y si necesitás más, lo desbloqueás todo una
          sola vez y para siempre.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Gratis</h3>
            <p className="mt-1 text-3xl font-bold tracking-tight">USD 0</p>
            <p className="text-sm text-slate-500">para siempre, sin tarjeta</p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
              {[
                "Hasta 3 clientes activos y 4 facturas",
                "Tracker semanal en bloques de 15 minutos",
                "Tarifa y moneda por cliente (9 monedas)",
                "Reportes de horas y montos + export CSV",
                "Facturas en PDF con link público",
                "Conexión MCP (Claude, Cursor)",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-600" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 rounded-xl border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Empezá gratis
            </Link>
          </div>
          <div className="relative flex flex-col rounded-2xl border-2 border-indigo-500 bg-white p-6 shadow-md">
            <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-3 py-0.5 text-xs font-semibold text-white">
              Sin suscripción
            </span>
            <h3 className="text-lg font-semibold">Lifetime access</h3>
            <p className="mt-1 text-3xl font-bold tracking-tight">Pago único</p>
            <p className="text-sm text-slate-500">una vez, tuyo de por vida</p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
              {[
                "Todo lo del plan gratis",
                "Clientes activos ilimitados",
                "Facturas ilimitadas",
                "Todas las funcionalidades futuras",
                "Sin mensualidad, sin renovaciones",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-600" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-indigo-600"
            >
              Crear cuenta y desbloquear
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-500">
          El lifetime access se desbloquea desde la app cuando lo necesites. Comparado con Toggl
          Track Starter (USD 108 por año, todos los años), se paga solo.
        </p>
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
        <p className="mt-4 text-center">
          <Link
            href="/alternativa-toggl-track"
            className="text-sm font-medium text-indigo-600 underline-offset-2 hover:underline"
          >
            Ver la comparación completa: Registruti como alternativa a Toggl Track →
          </Link>
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
        <Logo size={48} />
        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
          Tu próxima factura empieza con la próxima hora trackeada
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Creá tu cuenta, cargá tu primer cliente y empezá a trackear en menos de dos minutos.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
        >
          Empezá gratis hoy
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <Wordmark className="text-slate-800" />
          </div>
          <p className="text-sm text-slate-500">
            Registrá cada hora que trabajás y convertila en factura. Sin vueltas.
          </p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <a href="#funcionalidades" className="hover:text-slate-900">
              Funcionalidades
            </a>
            <a href="#precios" className="hover:text-slate-900">
              Precios
            </a>
            <Link href="/alternativa-toggl-track" className="hover:text-slate-900">
              Alternativa a Toggl Track
            </Link>
            <a href="#faq" className="hover:text-slate-900">
              Preguntas
            </a>
            <Link href="/blog" className="hover:text-slate-900">
              Blog
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Iniciar sesión
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-slate-900">
              Privacidad
            </Link>
          </nav>
          <MadeByBadge />
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Registruti — Control de horas y facturación para
            freelancers.
          </p>
        </div>
      </footer>
    </div>
  );
}
