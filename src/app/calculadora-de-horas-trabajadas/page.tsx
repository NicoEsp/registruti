import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import HoursCalculator from "@/components/marketing/HoursCalculator";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/calculadora-de-horas-trabajadas`;
// datePublished no se toca al editar la página; solo se mueve UPDATED_ISO
// (y HOURS_CALC_UPDATED en sitemap.ts, que tiene que coincidir).
const PUBLISHED_ISO = "2026-10-24";
const UPDATED_ISO = "2026-10-24";

// "Calculadora de horas trabajadas" tiene 450 búsquedas por mes en Argentina
// y 400 en México, con dificultad casi nula, y sumando "calculadora",
// "calculador" y "contador de horas" son varios miles. Google no premia ahí
// guías sino herramientas: la que gana en Argentina es Jibble, y segunda está
// Cucutime con DR 10. Hay lugar para una herramienta que funcione y que, a
// diferencia de las de nómina, le hable al freelancer que se controla solo.
// El title dice qué es y que es gratis; con la plantilla "| Registruti" queda
// en 51 caracteres.
export const metadata: Metadata = {
  title: "Calculadora de horas trabajadas gratis",
  description:
    "Sumá las horas trabajadas por día y por semana con entrada, salida y descansos, pasalas a decimal y calculá cuánto cobrar. Gratis y sin registro.",
  keywords: [
    "calculadora de horas trabajadas",
    "calculadora de horas",
    "calculador de horas",
    "contador de horas",
    "calcular horas trabajadas",
    "sumar horas trabajadas",
    "conteo de horas trabajadas",
    "calculadora de horas y minutos",
    "horas trabajadas a decimal",
    "calcular horas de trabajo semanales",
  ],
  alternates: { canonical: "/calculadora-de-horas-trabajadas" },
  openGraph: {
    images: [SITE_OG_IMAGE],
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    title: "Calculadora de horas trabajadas gratis | Registruti",
    description:
      "Entrada, salida y descansos de cada día: el total de la semana en horas y minutos, en decimal y en plata. Sin registro.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de horas trabajadas gratis",
    description:
      "Sumá tu semana con entrada, salida y descansos. Total en hh:mm, en decimal y cuánto cobrar.",
  },
};

// Lo que confunde a casi todo el mundo: 7:45 no son 7,45 horas.
const DECIMAL_TABLE = [
  { minutes: 5, decimal: "0,08" },
  { minutes: 10, decimal: "0,17" },
  { minutes: 15, decimal: "0,25" },
  { minutes: 20, decimal: "0,33" },
  { minutes: 30, decimal: "0,50" },
  { minutes: 40, decimal: "0,67" },
  { minutes: 45, decimal: "0,75" },
  { minutes: 50, decimal: "0,83" },
];

const FAQS = [
  {
    q: "¿Cómo se calculan las horas trabajadas?",
    a: "Restá la hora de entrada a la hora de salida y descontá los descansos que no se cuentan como trabajo. Si entraste a las 9:00, saliste a las 17:30 y paraste 45 minutos para almorzar, son 8 horas y 30 minutos menos 45 minutos: 7 horas y 45 minutos. Para la semana, repetí la cuenta por día y sumá. La calculadora de arriba hace exactamente eso con los siete días.",
  },
  {
    q: "¿Cómo paso las horas y minutos a decimal para facturar?",
    a: "Dividí los minutos por 60 y sumáselos a las horas: 7 horas y 45 minutos son 7 más 45 ÷ 60, es decir 7,75 horas. Ese número es el que se multiplica por la tarifa. El error más común es escribir 7,45 como si fueran 7 horas y 45 minutos: en decimal, 7,45 son 7 horas y 27 minutos, y a una tarifa de 40 por hora la diferencia son 12 por día.",
  },
  {
    q: "¿Cómo calculo las horas si el turno termina después de medianoche?",
    a: "Sumale 24 horas a la salida antes de restar. Un turno de 22:00 a 02:00 son 26:00 menos 22:00, es decir 4 horas, y después descontás el descanso. La calculadora lo detecta sola: si la salida es anterior a la entrada, asume que terminaste al día siguiente.",
  },
  {
    q: "¿Cómo sumo las horas de la semana o del mes sin equivocarme?",
    a: "Sumá los minutos aparte y pasá cada 60 minutos a una hora: 7:45 más 8:10 son 15 horas y 55 minutos, o sea 15:55, porque 45 más 10 no llega a 60. En cambio, 7:45 más 8:30 son 15 horas y 75 minutos, o sea 16:15. En una planilla, usá celdas en formato de hora y el formato [h]:mm en el total, que permite pasar de 24 horas. Para el mes, multiplicar una semana típica por 4,33 da una aproximación; la cuenta exacta sale de registrar cada día.",
  },
  {
    q: "¿Cuántas horas facturables tiene una semana de freelance?",
    a: "Entre 20 y 30 para la mayoría de los freelancers a tiempo completo, es decir de 4 a 6 horas facturables por día. Las demás horas de la semana se van en buscar clientes, cotizar, facturar, responder mails y administrar el negocio, y no se le cobran a nadie. Por eso conviene registrar también las horas no facturables: son las que muestran cuánto te cuesta de verdad cada cliente.",
  },
  {
    q: "¿Sirve para calcular horas extra?",
    a: "Sí. Calculá el total de la semana y restale la jornada que tenés pactada: lo que sobra son horas extra. Cuánto se paga cada una y cuál es el tope semanal depende de la ley laboral de cada país y del convenio, así que ese porcentaje no está en la calculadora; el total de horas sí.",
  },
  {
    q: "¿La calculadora guarda mis horas?",
    a: "No. Corre entera en tu navegador y no envía ni guarda nada: al cerrar la pestaña, la cuenta desaparece. Si querés guardar las horas por cliente, con su tarifa y su moneda, y que a fin de mes se conviertan en un invoice en PDF, para eso está Registruti, que es gratis para empezar.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": PAGE_URL,
      url: PAGE_URL,
      name: "Calculadora de horas trabajadas gratis",
      description:
        "Calculadora gratuita de horas trabajadas por día y por semana: entrada, salida y descansos, total en horas y minutos, en decimal y monto a cobrar según tu tarifa.",
      inLanguage: "es",
      datePublished: PUBLISHED_ISO,
      dateModified: UPDATED_ISO,
      isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "WebApplication",
      "@id": `${PAGE_URL}#calculadora`,
      name: "Calculadora de horas trabajadas",
      url: PAGE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "es",
      description:
        "Sumá las horas trabajadas de cada día de la semana a partir de la hora de entrada, la de salida y los descansos. Total en hh:mm y en decimal, con redondeo opcional a bloques de 15 minutos y monto a cobrar según tu tarifa por hora.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Calculadora de horas trabajadas", item: PAGE_URL },
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

export default function CalculadoraHorasTrabajadasPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-14">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Calculadora gratis · sin registro · en español
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Calculadora de horas trabajadas{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              por día y por semana
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Cargá la hora de entrada, la de salida y los descansos de cada día. Te devuelve las
            horas de cada jornada, el total de la semana en horas y minutos y en decimal, y cuánto
            tenés que cobrar si ponés tu tarifa.
          </p>
        </div>

        {/* Calculadora */}
        <section id="calculadora" className="mt-12 scroll-mt-20">
          <HoursCalculator />
        </section>

        {/* Cómo se calcula */}
        <section id="como-calcular" className="mx-auto mt-16 max-w-3xl scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cómo calcular las horas trabajadas (a mano)
          </h2>
          <p className="mt-4 text-slate-600">
            Es una resta y una suma, y el único lugar donde la gente se equivoca es en los minutos.
          </p>
          <ol className="mt-6 space-y-5">
            {[
              {
                title: "Restá la entrada a la salida",
                body: "De 9:00 a 17:30 son 8:30. Si la salida es más chica que la entrada (22:00 a 02:00), sumale 24 horas a la salida antes de restar: 26:00 menos 22:00 son 4:00.",
              },
              {
                title: "Descontá los descansos",
                body: "Almuerzo, pausas largas, lo que no fue trabajo. 8:30 menos 0:45 de almuerzo son 7:45. Si facturás por hora, un descanso no descontado es una hora que tu cliente va a discutir.",
              },
              {
                title: "Sumá los días, con los minutos aparte",
                body: "Sumá las horas por un lado y los minutos por otro, y pasá cada 60 minutos a una hora. Cinco días de 7:45 son 35 horas y 225 minutos: 225 minutos son 3 horas y 45 minutos, así que el total es 38:45.",
              },
              {
                title: "Pasá el total a decimal para multiplicarlo por la tarifa",
                body: "Minutos dividido 60: 38:45 son 38,75 horas. A una tarifa de 40 por hora, son 1.550. Nunca multipliques 38,45 por la tarifa: eso son 38 horas y 27 minutos.",
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

        {/* Minutos a decimal */}
        <section id="minutos-a-decimal" className="mx-auto mt-16 max-w-3xl scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tabla: minutos a horas decimales
          </h2>
          <p className="mt-4 text-slate-600">
            Para facturar, los minutos se dividen por 60. Esta es la tabla que conviene tener a
            mano (o dejar que la calculadora la aplique sola).
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Minutos</th>
                  <th className="px-5 py-3">En decimal</th>
                  <th className="px-5 py-3">Ejemplo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {DECIMAL_TABLE.map((row) => (
                  <tr key={row.minutes}>
                    <td className="px-5 py-3 font-medium tabular-nums">{row.minutes} min</td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{row.decimal}</td>
                    <td className="px-5 py-3 tabular-nums text-slate-500">
                      3:{String(row.minutes).padStart(2, "0")} = 3,{row.decimal.slice(2)} horas
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Por eso tanta gente factura en bloques de 15 minutos: 0,25, 0,50 y 0,75 se suman de
            memoria, y una llamada de 20 minutos se decide como 0:15 o 0:30 con un criterio fijo.
          </p>
        </section>

        {/* Para quién */}
        <section id="para-que-sirve" className="mx-auto mt-16 max-w-3xl scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Para qué sirve calcular las horas trabajadas
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🧾",
                title: "Si facturás por hora",
                body: "El total de la semana por cliente, multiplicado por la tarifa, es tu factura. Las horas que no anotaste el mismo día no se recuperan.",
              },
              {
                icon: "📋",
                title: "Si cobrás por proyecto",
                body: "Las horas reales contra las que estimaste te dicen si el proyecto fue negocio. Sin esa cuenta, el próximo presupuesto es una adivinanza.",
              },
              {
                icon: "⏰",
                title: "Si trabajás en relación de dependencia",
                body: "El total menos la jornada pactada son tus horas extra. Tenerlas anotadas por día es lo que vale cuando hay que reclamarlas.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-5">
                <p className="text-2xl" aria-hidden>
                  {item.icon}
                </p>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Planilla y app */}
        <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            La semana que viene hay que volver a hacer la cuenta
          </h2>
          <p className="mt-4 text-slate-700">
            Una calculadora resuelve hoy. Para que el registro de horas sirva a fin de mes hacen
            falta dos cosas más: anotar cada día (no reconstruir el viernes) y separar por cliente.
            Hay dos caminos:
          </p>
          <ul className="mt-5 space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span aria-hidden>📊</span>
              <span>
                <strong>La planilla.</strong> En la{" "}
                <Link
                  href="/blog/control-de-horas-trabajadas"
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline"
                >
                  guía de control de horas trabajadas
                </Link>{" "}
                hay una planilla gratis para Excel y Google Sheets con estas mismas fórmulas, por
                cliente y con el importe calculado. Alcanza mientras tengas un cliente.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>⏱️</span>
              <span>
                <strong>La app.</strong>{" "}
                <Link href="/" className="font-medium text-indigo-600 underline-offset-2 hover:underline">
                  Registruti
                </Link>{" "}
                registra las horas por cliente con su tarifa y su moneda, las suma sola por semana
                y por mes, y genera el invoice en PDF desde esas horas. Gratis para empezar, en
                español.
              </span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
            >
              Empezá gratis
            </Link>
            <a
              href="/plantillas/control-de-horas-trabajadas.xlsx"
              download
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Descargar la planilla (Excel)
            </a>
          </div>
        </section>

        {/* Tarifa */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tenés las horas. ¿Y la tarifa?
          </h2>
          <p className="mt-4 text-slate-600">
            Multiplicar las horas por un número inventado es la otra mitad del problema. La tarifa
            por hora sale del ingreso que querés llevarte, más tus gastos e impuestos, dividido por
            las horas que realmente podés facturar al año, que son menos de las que parece. La{" "}
            <Link
              href="/cuanto-cobrar-por-hora"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              calculadora de cuánto cobrar por hora
            </Link>{" "}
            hace esa cuenta en 9 monedas, con rangos por especialidad y por país.
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Preguntas frecuentes sobre el cálculo de horas trabajadas
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
            Seguí leyendo
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/blog/control-de-horas-trabajadas"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Control de horas trabajadas: guía y planilla gratis
              </Link>
            </li>
            <li>
              <Link
                href="/cuanto-cobrar-por-hora"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Calculadora: cuánto cobrar por hora como freelance
              </Link>
            </li>
            <li>
              <Link
                href="/blog/cobrar-por-hora-o-por-proyecto"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                ¿Cobrar por hora o por proyecto? Cómo decidir y cotizar cada uno
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
          </ul>
        </section>

        {/* CTA final */}
        <section className="mt-16 text-center">
          <Logo size={48} />
          <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            Que la cuenta de la semana se haga sola
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Cargá lo que hiciste hoy, para qué cliente y cuánto tardaste. El total de la semana, el
            reporte del mes y el invoice en PDF salen de ahí.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
          >
            Empezá gratis hoy
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
