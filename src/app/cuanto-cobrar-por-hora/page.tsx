import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import RateCalculator from "@/components/marketing/RateCalculator";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/cuanto-cobrar-por-hora`;
const UPDATED_ISO = "2026-07-31";

export const metadata: Metadata = {
  title: "¿Cuánto cobrar por hora? Calculadora de tarifa freelance",
  description:
    "Calculá tu tarifa por hora como freelance en 9 monedas: partí del ingreso que querés llevarte, sumá gastos, impuestos y horas realmente facturables. Gratis y sin registro.",
  keywords: [
    "cuánto cobrar por hora",
    "cuánto cobrar por hora freelance",
    "calculadora de tarifa freelance",
    "cómo calcular mi tarifa por hora",
    "precio hora freelance",
    "cuánto cobrar como freelance",
    "tarifa por hora consultor",
  ],
  alternates: { canonical: "/cuanto-cobrar-por-hora" },
  openGraph: {
    images: [SITE_OG_IMAGE],
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    title: "Calculadora: ¿cuánto cobrar por hora como freelance?",
    description:
      "La fórmula real: ingreso deseado + gastos + impuestos ÷ horas facturables. Calculala en 9 monedas, gratis y sin registro.",
  },
  twitter: {
    card: "summary_large_image",
    title: "¿Cuánto cobrar por hora como freelance? Calculadora gratis",
    description:
      "Tu tarifa no es el sueldo dividido 160. Calculá la real: gastos, impuestos y horas facturables incluidas.",
  },
};

const RANGES = [
  { rol: "Redacción y contenido", rango: "USD 10 – 40" },
  { rol: "Diseño", rango: "USD 15 – 60" },
  { rol: "Desarrollo de software", rango: "USD 25 – 100" },
];

const FAQS = [
  {
    q: "¿Cómo calculo cuánto cobrar por hora como freelance?",
    a: "Sumá el ingreso neto anual que querés llevarte más tus gastos fijos anuales, dividí ese total por (1 menos tu carga impositiva) para llegar al monto que tenés que facturar, y dividí el resultado por las horas realmente facturables que tenés en el año. Esas horas son menos de las que pensás: si trabajás 5 días por semana con 5 horas facturables por día y te tomás 4 semanas al año, son 1.200 horas, no 2.080.",
  },
  {
    q: "¿Por qué no puedo dividir el sueldo que quiero por 160 horas?",
    a: "Porque esa cuenta asume tres cosas falsas: que todas las horas que trabajás son facturables, que no tenés gastos y que no pagás impuestos. Vender, cotizar, facturar, responder mails y administrar tu negocio ocupa buena parte de la semana y no se le cobra a ningún cliente. Dividir por 160 suele dejar la tarifa entre un 30% y un 50% por debajo de lo que necesitás — o, dicho al revés, la tarifa correcta suele estar entre un 40% y un 100% por encima de esa cuenta.",
  },
  {
    q: "¿Cuántas horas facturables tiene un día realista?",
    a: "Entre 4 y 6 para la mayoría de los freelancers a tiempo completo. Por encima de 6 sostenidas durante meses, algo se está rompiendo: o no estás contando el trabajo comercial y administrativo, o estás trabajando de más. Es mejor asumir 5 y que la tarifa lo refleje, que asumir 8 y descubrir a fin de año que trabajaste el doble por el mismo dinero.",
  },
  {
    q: "¿Conviene cobrar por hora o por proyecto?",
    a: "Por proyecto suele ser mejor negocio cuando podés estimar bien y mejorás tu velocidad con la experiencia: cobrás por el resultado, no por el tiempo. Pero incluso cotizando por proyecto necesitás tu tarifa por hora, porque es la base para estimar el precio y para saber después si el proyecto fue rentable. Por eso conviene trackear las horas aunque cobres un monto cerrado.",
  },
  {
    q: "¿Cada cuánto tengo que subir mi tarifa?",
    a: "Al menos una vez al año para no perder contra la inflación, y además cada vez que cambie tu situación: cuando tengas más demanda de la que podés atender, cuando sumes una especialidad o cuando un cliente te pida algo fuera del alcance original. La señal más clara de que estás barato es que nadie te discuta nunca el precio.",
  },
  {
    q: "¿Cómo cobro distintas tarifas a distintos clientes?",
    a: "Es lo normal: un cliente grande con procesos pesados vale más por hora que uno chico y ágil, y un cliente en dólares no se cotiza igual que uno local. Lo importante es que cada cliente tenga su tarifa y su moneda registradas, y que cada hora que cargues quede asociada al cliente correcto. En Registruti eso es parte del modelo: cada cliente tiene su tarifa por hora y su moneda entre 9 disponibles.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": PAGE_URL,
      url: PAGE_URL,
      name: "¿Cuánto cobrar por hora? Calculadora de tarifa freelance",
      description:
        "Calculadora gratuita de tarifa por hora para freelancers y consultores, con gastos, impuestos y horas facturables, en 9 monedas.",
      inLanguage: "es",
      datePublished: UPDATED_ISO,
      dateModified: UPDATED_ISO,
      isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "WebApplication",
      "@id": `${PAGE_URL}#calculadora`,
      name: "Calculadora de tarifa por hora freelance",
      url: PAGE_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: "es",
      description:
        "Calculá tu tarifa por hora a partir del ingreso que querés llevarte, tus gastos fijos, tu carga impositiva y las horas que realmente podés facturar.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Cuánto cobrar por hora", item: PAGE_URL },
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

export default function CuantoCobrarPorHoraPage() {
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
            Calculadora gratis · sin registro
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            ¿Cuánto cobrar por hora{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              como freelance?
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Tu tarifa no sale de mirar lo que cobra el mercado: sale del ingreso que querés
            llevarte, más lo que te cuesta trabajar, dividido por las horas que realmente podés
            facturar. Movés los números y la ves cambiar.
          </p>
        </div>

        {/* Calculadora */}
        <section id="calculadora" className="mt-12 scroll-mt-20">
          <RateCalculator />
        </section>

        {/* La fórmula */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">La fórmula, explicada</h2>
          <p className="mt-4 text-slate-600">
            Son cuatro pasos, y el orden importa. Los impuestos van sobre lo que facturás, no sobre
            lo que te queda: por eso se divide, no se resta.
          </p>
          <ol className="mt-6 space-y-5">
            {[
              {
                title: "Arrancá por lo que querés ganar, no por lo que cobra el mercado",
                body: "El ingreso neto anual que querés llevarte a tu bolsillo. Si querés 2.000 al mes, son 24.000 al año. Este es el único número que define el resto.",
              },
              {
                title: "Sumale lo que te cuesta trabajar",
                body: "Software, internet, coworking, contador, equipamiento amortizado. Son gastos del negocio, no tuyos: si no los sumás, salen de tu sueldo sin que te des cuenta.",
              },
              {
                title: "Dividí por (1 − tu carga impositiva)",
                body: "Con 25% de impuestos y 26.400 de objetivo, no tenés que facturar 33.000 (26.400 + 25%): tenés que facturar 35.200, porque 26.400 ÷ 0,75 = 35.200. Restar el porcentaje en vez de dividir es el error más caro de esta cuenta.",
              },
              {
                title: "Dividí por tus horas facturables reales del año",
                body: "Semanas del año menos las que no vas a facturar, por días por semana, por horas facturables por día. Cinco días, cinco horas y cuatro semanas libres dan 1.200 horas — no las 2.080 de un empleo full time.",
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

        {/* El error clásico */}
        <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Por qué “sueldo ÷ 160 horas” te deja corto
          </h2>
          <p className="mt-4 text-slate-700">
            Es la primera cuenta que hace todo el mundo: quiero ganar 2.000, trabajo 160 horas al
            mes, cobro 12,50 la hora. El problema es que esa cuenta asume tres cosas que no son
            ciertas.
          </p>
          <ul className="mt-5 space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span aria-hidden>❌</span>
              <span>
                <strong>Que todas tus horas son facturables.</strong> No lo son. Buscar clientes,
                cotizar, reunirte, facturar y perseguir cobranzas puede llevarse un tercio de tu
                semana, y nadie te lo paga.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>❌</span>
              <span>
                <strong>Que no tenés gastos.</strong> Las herramientas, el contador y el
                equipamiento salen de algún lado. Si no están en la tarifa, salen de tu sueldo.
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>❌</span>
              <span>
                <strong>Que no pagás impuestos.</strong> Monotributo, ISR, retenciones, comisiones
                de la plataforma de cobro: entre todo puede irse entre el 15% y el 35% de lo que
                facturás.
              </span>
            </li>
          </ul>
          <p className="mt-5 text-slate-700">
            Corregidas las tres, la tarifa real suele quedar entre un 40% y un 100% por encima de
            la cuenta ingenua. La calculadora de arriba te muestra las dos, una al lado de la otra.
          </p>
        </section>

        {/* Rangos de referencia */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Rangos de referencia por especialidad
          </h2>
          <p className="mt-4 text-slate-600">
            Sirven para saber si tu número está en el mapa, no para fijar tu precio. Varían
            muchísimo según país del cliente, seniority y tipo de proyecto: el mismo trabajo para un
            cliente local y para uno de Estados Unidos no se cotiza igual.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Especialidad</th>
                  <th className="px-5 py-4">Rango por hora habitual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {RANGES.map((row) => (
                  <tr key={row.rol}>
                    <td className="px-5 py-4 font-medium">{row.rol}</td>
                    <td className="px-5 py-4 tabular-nums text-slate-600">{row.rango}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Rangos orientativos que se repiten en las guías de tarifas freelance publicadas en
            español. Tomalos como referencia amplia: tu número sale de la calculadora, no de esta
            tabla.
          </p>
        </section>

        {/* De la tarifa a la factura */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tener la tarifa es la mitad: después hay que cobrarla
          </h2>
          <p className="mt-4 text-slate-600">
            La tarifa solo sirve si al final del mes podés decir con precisión cuántas horas le
            dedicaste a cada cliente. Si esa parte la hacés de memoria o en una planilla que
            actualizás los viernes, vas a subfacturar: las horas que no anotaste el mismo día no se
            recuperan.
          </p>
          <p className="mt-4 text-slate-600">
            Para eso está{" "}
            <Link href="/" className="font-medium text-indigo-600 underline-offset-2 hover:underline">
              Registruti
            </Link>
            : cada cliente con su tarifa por hora y su moneda —las mismas 9 de la calculadora—, las
            horas cargadas en una vista semanal, y la factura en PDF generada desde esas horas con
            un link público para que el cliente vea el detalle. Gratis para empezar, en español.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
            >
              Empezá gratis
            </Link>
            <Link
              href="/blog/control-de-horas-trabajadas"
              className="rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Cómo llevar el control de horas
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Preguntas frecuentes sobre la tarifa freelance
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
                Cómo llevar el control de horas trabajadas: guía para freelancers
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
                href="/alternativa-toggl-track"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                La alternativa a Toggl Track gratis y en español
              </Link>
            </li>
          </ul>
        </section>

        {/* CTA final */}
        <section className="mt-16 text-center">
          <Logo size={48} />
          <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            Ya sabés cuánto vale tu hora. Ahora contalas.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Cargá tus clientes con la tarifa que te dio la calculadora y trackeá esta semana. El
            viernes tenés el reporte de cuánto facturaste, por cliente.
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
