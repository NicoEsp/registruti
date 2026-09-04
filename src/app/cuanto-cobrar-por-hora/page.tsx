import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import RateCalculator from "@/components/marketing/RateCalculator";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const PAGE_URL = `${SITE_URL}/cuanto-cobrar-por-hora`;
// datePublished no se toca al editar la página; solo se mueve UPDATED_ISO
// (y RATE_CALC_UPDATED en sitemap.ts, que tiene que coincidir).
const PUBLISHED_ISO = "2026-07-31";
const UPDATED_ISO = "2026-09-04";

// Es la página que más impresiones trae desde Google. La query principal es
// "cuánto cobrar por hora" (+ freelance); el resto de las búsquedas que la
// disparan son variantes por especialidad ("cuánto cobrar por hora como
// diseñador / programador") y por país. Por eso el title arranca con la query
// exacta, la descripción anticipa esas dos secciones, y el cuerpo las tiene
// como H2 con su propia FAQ.
export const metadata: Metadata = {
  title: "¿Cuánto cobrar por hora como freelance? Calculadora 2026",
  description:
    "Calculadora gratis: cuánto cobrar por hora como freelance según ingreso deseado, gastos, impuestos y horas facturables. Rangos por especialidad y por país.",
  keywords: [
    "cuánto cobrar por hora",
    "cuánto cobrar por hora freelance",
    "cuánto cobrar por hora de trabajo",
    "calculadora de tarifa freelance",
    "cómo calcular mi tarifa por hora",
    "tarifa por hora freelance 2026",
    "precio hora freelance",
    "cuánto cobrar como freelance",
    "cuánto cobrar por hora como diseñador",
    "cuánto cobrar por hora como programador",
    "tarifa por hora consultor",
    "cobrar por hora o por proyecto",
  ],
  alternates: { canonical: "/cuanto-cobrar-por-hora" },
  openGraph: {
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

// Rangos por hora en dólares para clientes que pagan en dólares (exterior).
// Son los que se repiten en las guías de tarifas freelance en español; sirven
// para ubicar el número de la calculadora en el mapa, no para reemplazarlo.
const RANGES = [
  { rol: "Redacción y contenido", rango: "USD 10 – 40", nota: "Copys y blogs abajo; UX writing y contenido técnico arriba." },
  { rol: "Diseño gráfico y UX/UI", rango: "USD 15 – 60", nota: "Piezas sueltas abajo; producto digital y sistemas de diseño arriba." },
  { rol: "Desarrollo de software", rango: "USD 25 – 100", nota: "Sitios y WordPress abajo; backend, datos y arquitectura arriba." },
  { rol: "Marketing digital y community management", rango: "USD 15 – 70", nota: "Gestión de redes abajo; paid media y estrategia arriba." },
  { rol: "Traducción", rango: "USD 20 – 60", nota: "Se suele cotizar por palabra; la hora sirve para comparar." },
  { rol: "Edición de video", rango: "USD 15 – 60", nota: "Cortes para redes abajo; motion graphics y color arriba." },
  { rol: "Consultoría (negocio, producto, procesos)", rango: "USD 40 – 120", nota: "Depende más del resultado que del tiempo: acá conviene mirar por proyecto." },
];

// Lo que cambia por país es lo que va en el campo de impuestos y la moneda en
// la que hacés la cuenta; la fórmula es la misma. Sin porcentajes exactos a
// propósito: cambian cada año y el que decide es el contador de cada uno.
const COUNTRIES = [
  {
    pais: "Argentina",
    texto:
      "Monotributo (cuota fija según la categoría) o responsable inscripto. Si cobrás en pesos, revisá la tarifa cada pocos meses: con inflación, una tarifa fija es una rebaja automática. Si cobrás del exterior, sumá comisiones de cobro y diferencia de cambio en el campo de impuestos.",
  },
  {
    pais: "México",
    texto:
      "RESICO o actividad empresarial y profesional: ISR más las retenciones de ISR e IVA que te hacen las personas morales. Cotizá en pesos a clientes locales y en dólares a clientes del exterior, sin convertir la tarifa local.",
  },
  {
    pais: "Colombia",
    texto:
      "Régimen simple u ordinario, más la retención en la fuente cuando le facturás a empresas. Es de los mercados donde más distancia hay entre la tarifa local en pesos y la tarifa en dólares para el exterior.",
  },
  {
    pais: "Chile",
    texto:
      "Boleta de honorarios con retención, que además sube año a año. Ese porcentaje va directo al campo de impuestos de la calculadora; si no lo incluís, la tarifa te queda corta desde el primer mes.",
  },
  {
    pais: "España",
    texto:
      "Cuota de autónomos por tramos de ingresos, IRPF e IVA. La cuota es un gasto fijo mensual: va en gastos, no en impuestos, porque la pagás aunque un mes no factures.",
  },
  {
    pais: "Clientes del exterior en dólares",
    texto:
      "La tarifa se fija en el mercado del cliente, no en el tuyo: un freelancer en Latinoamérica que trabaja para una empresa de Estados Unidos cotiza en el rango de ese mercado, no en el local. Lo que sí es tuyo son las comisiones de la plataforma de cobro y la brecha cambiaria: sumalas como impuestos.",
  },
];

const FAQS = [
  {
    q: "¿Cómo calculo cuánto cobrar por hora como freelance?",
    a: "Sumá el ingreso neto anual que querés llevarte más tus gastos fijos anuales, dividí ese total por (1 menos tu carga impositiva) para llegar al monto que tenés que facturar, y dividí el resultado por las horas realmente facturables que tenés en el año. Esas horas son menos de las que pensás: si trabajás 5 días por semana con 5 horas facturables por día y te tomás 4 semanas al año, son 1.200 horas, no 2.080.",
  },
  {
    q: "¿Cuánto cobrar por hora como diseñador, programador o redactor?",
    a: "Para clientes que pagan en dólares, los rangos que se repiten en las guías en español son: redacción y contenido entre USD 10 y 40 la hora, diseño gráfico y UX/UI entre USD 15 y 60, desarrollo de software entre USD 25 y 100, marketing digital y community management entre USD 15 y 70, edición de video entre USD 15 y 60 y consultoría entre USD 40 y 120. Para clientes locales en moneda local suelen quedar por debajo. Son referencias amplias: tu número sale de tu ingreso deseado, tus gastos, tus impuestos y tus horas facturables, y la calculadora de esta página lo resuelve en 9 monedas.",
  },
  {
    q: "¿Cuánto cobrar por hora en Argentina, México, Colombia o Chile?",
    a: "La fórmula es la misma en todos los países; lo que cambia es la moneda en la que hacés la cuenta y lo que va en el campo de impuestos: monotributo o responsable inscripto en Argentina, RESICO o actividad profesional con retenciones en México, régimen simple u ordinario con retención en la fuente en Colombia, boleta de honorarios con retención en Chile. Para un cliente local, calculá en tu moneda con tu régimen; para un cliente del exterior, cotizá en dólares al precio del mercado del cliente y sumá las comisiones de cobro. Si cobrás en una moneda con inflación, revisá la tarifa cada pocos meses.",
  },
  {
    q: "¿Por qué no puedo dividir el sueldo que quiero por 160 horas?",
    a: "Porque esa cuenta asume tres cosas falsas: que todas las horas que trabajás son facturables, que no tenés gastos y que no pagás impuestos. Vender, cotizar, facturar, responder mails y administrar tu negocio ocupa buena parte de la semana y no se le cobra a ningún cliente. Dividir por 160 suele dejar la tarifa entre un tercio y dos tercios por debajo de lo que necesitás; con los valores por defecto de la calculadora, la tarifa correcta casi triplica esa cuenta.",
  },
  {
    q: "¿Cuántas horas facturables tiene un día realista?",
    a: "Entre 4 y 6 para la mayoría de los freelancers a tiempo completo. Por encima de 6 sostenidas durante meses, algo se está rompiendo: o no estás contando el trabajo comercial y administrativo, o estás trabajando de más. Es mejor asumir 5 y que la tarifa lo refleje, que asumir 8 y descubrir a fin de año que trabajaste el doble por el mismo dinero.",
  },
  {
    q: "¿Conviene cobrar por hora o por proyecto?",
    a: "Por hora cuando el alcance es abierto (soporte, consultoría, mantenimiento, horas a demanda) o cuando recién empezás con un cliente. Por proyecto cuando el alcance está cerrado y ya hiciste ese tipo de trabajo antes: cobrás por el resultado, no por el tiempo, y tu eficiencia es tu ganancia. En los dos casos necesitás tu tarifa por hora, porque es la base para cotizar el proyecto y para saber después si fue rentable. Por eso conviene trackear las horas aunque cobres un monto cerrado.",
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
      name: "¿Cuánto cobrar por hora como freelance? Calculadora 2026",
      description:
        "Calculadora gratuita de tarifa por hora para freelancers y consultores, con gastos, impuestos y horas facturables, en 9 monedas. Con rangos por especialidad y por país.",
      inLanguage: "es",
      datePublished: PUBLISHED_ISO,
      dateModified: UPDATED_ISO,
      isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
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
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-14">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Calculadora gratis · sin registro · 9 monedas
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
            facturar. Movés los números y la ves cambiar. Más abajo: rangos por especialidad, qué
            cambia según tu país y cuándo conviene cobrar por proyecto.
          </p>
        </div>

        {/* Calculadora */}
        <section id="calculadora" className="mt-12 scroll-mt-20">
          <RateCalculator />
        </section>

        {/* La fórmula */}
        <section id="formula" className="mx-auto mt-16 max-w-3xl scroll-mt-20">
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
          <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-700">
            <strong>Ejemplo completo:</strong> 2.000 netos al mes, 200 de gastos, 25% de impuestos,
            5 días por semana, 5 horas facturables por día y 4 semanas sin facturar. Hay que
            facturar 35.200 al año en 1.200 horas: el mínimo para no perder plata es 29,33 la hora, y
            la tarifa recomendada, con un 20% de margen para los huecos entre proyectos, 35,20. La
            cuenta ingenua (2.000 ÷ 160) daba 12,50.
          </p>
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
            Corregidas las tres, la tarifa real suele quedar entre un 50% y un 200% por encima de
            la cuenta ingenua (con los valores por defecto de la calculadora, casi el triple). La
            calculadora de arriba te muestra las dos, una al lado de la otra.
          </p>
        </section>

        {/* Rangos por especialidad */}
        <section id="por-especialidad" className="mx-auto mt-16 max-w-3xl scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cuánto cobrar por hora según tu especialidad
          </h2>
          <p className="mt-4 text-slate-600">
            Estos rangos sirven para saber si tu número está en el mapa, no para fijar tu precio.
            Son tarifas en dólares para clientes que pagan en dólares; para clientes locales en
            moneda local suelen quedar por debajo. Y dentro de cada rango, lo que te mueve hacia
            arriba es lo de siempre: seniority, especialización y el tamaño del cliente.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Especialidad</th>
                  <th className="px-5 py-4 whitespace-nowrap">Rango por hora</th>
                  <th className="px-5 py-4">Qué mueve el número</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {RANGES.map((row) => (
                  <tr key={row.rol}>
                    <td className="px-5 py-4 font-medium">{row.rol}</td>
                    <td className="px-5 py-4 whitespace-nowrap tabular-nums text-slate-600">
                      {row.rango}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{row.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Rangos orientativos que se repiten en las guías de tarifas freelance publicadas en
            español a 2026. Si tu resultado en la calculadora cae por debajo del piso de tu
            especialidad, no bajes la tarifa: revisá las horas facturables que asumiste, que es
            donde casi siempre está el error.
          </p>
        </section>

        {/* Por país */}
        <section id="por-pais" className="mx-auto mt-16 max-w-3xl scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cuánto cobrar por hora según tu país (y el de tu cliente)
          </h2>
          <p className="mt-4 text-slate-600">
            La fórmula es la misma en Argentina, México, Colombia, Chile, Uruguay o España. Lo que
            cambia es la moneda en la que hacés la cuenta y lo que va en el campo de impuestos.
            Elegí tu moneda en la calculadora, cargá tu régimen, y la tarifa sale en lo que
            realmente cobrás.
          </p>
          <dl className="mt-6 space-y-4">
            {COUNTRIES.map((item) => (
              <div key={item.pais} className="rounded-2xl border border-slate-200 p-5">
                <dt className="font-semibold text-slate-900">{item.pais}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.texto}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-slate-500">
            Los porcentajes exactos de cada régimen cambian todos los años: el número que va en la
            calculadora es el que te da tu contador, no el de una guía.
          </p>
        </section>

        {/* Hora vs proyecto */}
        <section id="hora-o-proyecto" className="mx-auto mt-16 max-w-3xl scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Cobrar por hora o por proyecto?
          </h2>
          <p className="mt-4 text-slate-600">
            Las dos cosas, según el trabajo. <strong>Por hora</strong> cuando el alcance es abierto
            (soporte, consultoría, mantenimiento, horas a demanda) o cuando recién empezás con un
            cliente y todavía no sabés cuánto te lleva lo que pide. <strong>Por proyecto</strong>{" "}
            cuando el alcance está cerrado y ya hiciste ese tipo de trabajo antes: cobrás por el
            resultado y tu eficiencia es tu ganancia, no la del cliente.
          </p>
          <p className="mt-4 text-slate-600">
            En los dos casos necesitás la tarifa por hora que te dio la calculadora: es la base para
            cotizar el proyecto (horas estimadas × tarifa + colchón de riesgo) y para saber después
            si fue rentable. Cómo decidir en cada caso, cómo cotizar un proyecto sin regalar horas y
            qué pasa con el trabajo que se sale del alcance, en{" "}
            <Link
              href="/blog/cobrar-por-hora-o-por-proyecto"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              ¿Cobrar por hora o por proyecto? Cómo decidir y cómo cotizar cada uno
            </Link>
            .
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
            un link público para que el cliente vea el detalle. Gratis para empezar, en español. Y
            si venís de la calculadora, tu primer cliente ya arranca con la tarifa que te dio.
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
                href="/blog/cobrar-por-hora-o-por-proyecto"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                ¿Cobrar por hora o por proyecto? Cómo decidir y cómo cotizar cada uno
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

      <SiteFooter />
    </div>
  );
}
