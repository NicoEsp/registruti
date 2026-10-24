import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import Wordmark from "@/components/Wordmark";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";
import { buildComparisonJsonLd } from "@/lib/comparisonJsonLd";

const PAGE_URL = `${SITE_URL}/time-tracker-gratis`;
const PUBLISHED_ISO = "2026-10-24";
const UPDATED_ISO = "2026-10-24";

// "Time tracker" tiene 1.500 búsquedas por mes en México (dificultad 12) y
// 100 en Argentina. Es la búsqueda genérica de quien todavía no eligió
// herramienta: la landing responde qué es, qué incluye el plan gratis y en
// qué se diferencia de los planes gratis de Toggl, Clockify y Harvest, con
// México nombrado explícitamente (pesos, RFC, CFDI). Con la plantilla
// "| Registruti" el title queda en 59 caracteres.
export const metadata: Metadata = {
  title: "Time tracker gratis en español para freelancers",
  description:
    "Registruti es un time tracker gratis y en español: registrá horas por cliente con tarifa y moneda, mirá reportes y generá facturas en PDF. Sin tarjeta.",
  keywords: [
    "time tracker gratis",
    "time tracker",
    "time tracker en español",
    "time tracking gratis",
    "app para registrar horas de trabajo gratis",
    "control de horas gratis",
    "software para control de horas trabajadas gratis",
    "time tracker México",
    "time tracker freelance",
  ],
  alternates: { canonical: "/time-tracker-gratis" },
  openGraph: {
    images: [SITE_OG_IMAGE],
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    title: "Time tracker gratis en español, con facturación | Registruti",
    description:
      "Horas por cliente con su tarifa y su moneda, reportes y facturas en PDF. Gratis para empezar, sin tarjeta, en español.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Time tracker gratis en español para freelancers",
    description:
      "Registrá tus horas por cliente, mirá cuánto facturás y generá la factura en PDF. Gratis y en español.",
  },
};

const MUST_HAVE = [
  {
    icon: "👤",
    title: "Horas por cliente, no solo horas",
    body: "Saber que trabajaste 32 horas no sirve para cobrar. Saber que fueron 18 para un cliente y 14 para otro, sí. Cada entrada lleva su cliente.",
  },
  {
    icon: "💱",
    title: "Tarifa y moneda por cliente",
    body: "Un cliente en pesos mexicanos, otro en dólares, otro en euros. Cada uno con su tarifa, y los reportes en su moneda, sin convertir a mano.",
  },
  {
    icon: "📊",
    title: "Reportes que responden “¿cuánto facturo?”",
    body: "Horas y montos por cliente, por semana, por mes o por el rango que elijas. Es la pregunta que un time tracker tiene que responder a fin de mes.",
  },
  {
    icon: "🧾",
    title: "La factura, desde las horas",
    body: "Elegís cliente y período y el invoice sale en PDF con el detalle por día, numerado y con un link público para que el cliente lo vea sin crear cuenta.",
  },
];

const FREE_PLAN = [
  { feature: "Registro de horas", value: "Ilimitado: todos los días, todas las entradas" },
  { feature: "Clientes activos", value: "Hasta 3 (ilimitados con el lifetime access)" },
  { feature: "Tarifa y moneda por cliente", value: "Incluido, 9 monedas" },
  { feature: "Reportes de horas y montos", value: "Incluidos, con exportación a CSV" },
  { feature: "Invoices en PDF con link público", value: "Hasta 4 (ilimitados con el lifetime access)" },
  { feature: "Conexión con Claude y otros asistentes (MCP)", value: "Incluida" },
  { feature: "Idioma", value: "Español, de punta a punta" },
  { feature: "Tarjeta de crédito", value: "No hace falta" },
];

const FREE_VS = [
  {
    tool: "Registruti",
    free: "Horas ilimitadas, tarifas por cliente, reportes con montos y facturas en PDF; hasta 3 clientes y 4 invoices",
    language: "Español",
    upgrade: "Pago único de por vida",
  },
  {
    tool: "Toggl Track",
    free: "Horas ilimitadas hasta 5 usuarios; sin tarifas facturables ni montos",
    language: "Inglés",
    upgrade: "USD 9 por usuario por mes (anual)",
  },
  {
    tool: "Clockify",
    free: "Horas, usuarios y proyectos ilimitados; sin facturación",
    language: "Español parcial",
    upgrade: "USD 6,99 por usuario por mes",
  },
  {
    tool: "Harvest",
    free: "1 usuario y 2 proyectos",
    language: "Inglés",
    upgrade: "Desde USD 9 por usuario por mes más cargos por uso",
  },
];

const STEPS = [
  {
    title: "Creá tu cuenta con Google",
    body: "Sin tarjeta y sin formulario largo. Elegís tu país y la moneda y el ID fiscal (RFC, CUIT, RUT…) quedan configurados.",
  },
  {
    title: "Cargá tu primera hora",
    body: "Qué hiciste, para quién y cuánto tardaste, en bloques de 15 minutos. El cliente se crea en el mismo paso, con su tarifa si ya la tenés.",
  },
  {
    title: "Mirá la semana y facturá",
    body: "La vista semanal muestra tus horas por día y por cliente. A fin de período, el invoice se arma solo desde esas horas.",
  },
];

const FAQS = [
  {
    q: "¿Registruti es realmente un time tracker gratis?",
    a: "Sí. El plan gratis no vence y no pide tarjeta: registro de horas ilimitado, tarifa y moneda por cliente, reportes de horas y montos, exportación a CSV y facturas en PDF con link público, con un tope de 3 clientes activos y 4 invoices. Si necesitás más, el lifetime access desbloquea todo con un pago único, sin suscripción.",
  },
  {
    q: "¿Tiene cronómetro?",
    a: "No. Registruti usa carga manual: al cerrar el día (o en el momento) anotás qué hiciste, para qué cliente y cuánto tardaste, en bloques de 15 minutos a 8 horas. Para la mayoría de los freelancers es más rápido que un timer que hay que acordarse de prender y apagar. Si tu flujo depende de un cronómetro corriendo todo el día, Toggl Track o Clockify te van a servir mejor.",
  },
  {
    q: "¿Funciona en el celular?",
    a: "Sí. Es una aplicación web que se adapta al celular y se puede instalar como app (PWA) desde el navegador, sin pasar por una tienda. No hay apps nativas de iOS o Android.",
  },
  {
    q: "¿Sirve para freelancers en México?",
    a: "Sí. Elegís México como país y la app sugiere pesos mexicanos y el RFC como identificación fiscal; podés tener clientes en pesos y otros en dólares. El invoice que genera es el documento comercial con el detalle de horas y el monto: no reemplaza el CFDI que emitís en el SAT, que lo seguís haciendo con ese total. Lo mismo vale para la factura electrónica de ARCA en Argentina, del SII en Chile o de la DGI en Uruguay.",
  },
  {
    q: "¿Puedo exportar mis horas?",
    a: "Sí. Los reportes se exportan a CSV con horas y montos por cliente y por día, para abrirlos en Excel o Google Sheets o mandárselos a tu contador. Tus datos son tuyos.",
  },
  {
    q: "¿En qué se diferencia del plan gratis de Toggl Track?",
    a: "En lo que pasa después de medir. El plan gratis de Toggl registra horas pero no tiene tarifas facturables ni montos: para saber cuánta plata generaste hay que pasar al plan Starter, de USD 9 por usuario por mes. En Registruti las tarifas por cliente, los montos y las facturas en PDF están en el plan gratis, y la interfaz está en español. Toggl gana en cronómetro, apps nativas e integraciones.",
  },
];

const JSON_LD = buildComparisonJsonLd({
  pageUrl: PAGE_URL,
  name: "Time tracker gratis en español para freelancers",
  description:
    "Qué tiene que tener un time tracker para freelancers, qué incluye el plan gratis de Registruti y cómo se compara con los planes gratis de Toggl Track, Clockify y Harvest.",
  breadcrumbLabel: "Time tracker gratis",
  publishedISO: PUBLISHED_ISO,
  modifiedISO: UPDATED_ISO,
  faqs: FAQS,
});

export default function TimeTrackerGratisPage() {
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
            Gratis · sin tarjeta · en español
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Un time tracker gratis en español{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              que también factura
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Registruti registra tus horas por cliente, cada uno con su tarifa y su moneda, te
            muestra cuánto facturás por semana y por mes, y genera el invoice en PDF desde esas
            horas. Hecho para freelancers de México, Argentina y toda Latinoamérica.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
            >
              Empezá gratis hoy
            </Link>
            <a
              href="#plan-gratis"
              className="rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Ver qué incluye
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Sin tarjeta de crédito. Sin instalación. El plan gratis no vence.
          </p>
        </div>

        {/* Qué es */}
        <section className="mx-auto mt-14 max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
            Qué es un time tracker (y para qué lo usa un freelance)
          </h2>
          <p className="mt-3 text-slate-700">
            Un time tracker es una herramienta para registrar cuánto tiempo le dedicás a cada
            trabajo. Para una empresa sirve para controlar a un equipo; para un freelance sirve para
            otra cosa: <strong>saber cuántas horas le facturás a cada cliente</strong>, estimar
            mejor el próximo proyecto y no regalar el trabajo chico que la memoria se olvida. Por
            eso un time tracker para freelancers necesita clientes, tarifas y facturas, no GPS ni
            capturas de pantalla.
          </p>
        </section>

        {/* Qué tiene que tener */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Lo que tiene que tener un time tracker para freelancers
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {MUST_HAVE.map((item) => (
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

        {/* Plan gratis */}
        <section id="plan-gratis" className="mt-16 scroll-mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Qué incluye el plan gratis de Registruti
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Todo lo que hace falta para trackear y cobrar. Los topes están en la cantidad de
            clientes e invoices, no en las funciones.
          </p>
          <div className="mx-auto mt-8 max-w-3xl overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100 bg-white">
                {FREE_PLAN.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-5 py-3.5 font-medium">{row.feature}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-500">
            Cuando el plan gratis queda chico, el lifetime access desbloquea clientes e invoices
            ilimitados con un único pago, para siempre. No hay suscripción mensual ni anual.
          </p>
        </section>

        {/* Cómo funciona */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cómo funciona, en tres pasos
          </h2>
          <ol className="mt-6 space-y-5">
            {STEPS.map((step, i) => (
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
          <p className="mt-6 text-sm text-slate-600">
            También podés cargar horas hablándole a Claude u otro asistente: Registruti tiene un{" "}
            <Link
              href="/blog/mcp"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              servidor MCP integrado
            </Link>{" "}
            que se conecta con un clic.
          </p>
        </section>

        {/* Sin cronómetro */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Un time tracker sin cronómetro, a propósito
          </h2>
          <p className="mt-4 text-slate-600">
            La mayoría de los time trackers giran alrededor de un botón de play. Registruti no lo
            tiene: cargás tus horas en bloques de 15 minutos, en el momento o al cerrar el día. Es
            una decisión, no una falta. El cronómetro hay que acordarse de prenderlo y apagarlo, se
            queda corriendo durante el almuerzo y registra al minuto algo que después se factura en
            cuartos de hora. Para quien trabaja solo y cobra por hora, anotar “2:30 para Acme,
            diseño del checkout” al terminar es más rápido y más exacto.
          </p>
          <p className="mt-4 text-slate-600">
            Si tu flujo sí depende de un timer siempre encendido, la comparación honesta está en{" "}
            <Link
              href="/blog/mejores-time-trackers-freelancers"
              className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            >
              los mejores time trackers para freelancers
            </Link>
            , con las opciones que lo tienen.
          </p>
        </section>

        {/* Por país */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Para México, Argentina y el resto de Latinoamérica
          </h2>
          <p className="mt-4 text-slate-600">
            Elegís tu país al crear la cuenta y la app se adapta: pesos mexicanos y RFC en México,
            pesos argentinos y CUIT en Argentina, pesos chilenos y RUT en Chile, y así con Uruguay,
            Colombia, Brasil, España y clientes del exterior en dólares, euros o libras. Cada cliente
            puede estar en una moneda distinta.
          </p>
          <p className="mt-4 text-slate-600">
            Una aclaración importante: el invoice que genera Registruti es el documento comercial,
            con el detalle de horas y el monto para que el cliente apruebe. No reemplaza el
            comprobante fiscal de tu país (el CFDI del SAT en México, la factura electrónica de ARCA
            en Argentina, la boleta del SII en Chile), que lo seguís emitiendo como siempre con ese
            total. Lo habitual es usar los dos.
          </p>
        </section>

        {/* Comparación de planes gratis */}
        <section id="comparacion" className="mt-16 scroll-mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Planes gratis comparados: Registruti, Toggl Track, Clockify y Harvest
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            Lo que cada plan gratis incluye para un freelance que necesita cobrar sus horas. Datos
            verificados en 2026.
          </p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Herramienta</th>
                  <th className="px-5 py-4">Qué incluye el plan gratis</th>
                  <th className="px-5 py-4">Idioma</th>
                  <th className="px-5 py-4">Para desbloquear más</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {FREE_VS.map((row) => (
                  <tr key={row.tool} className={row.tool === "Registruti" ? "bg-indigo-50/40" : ""}>
                    <td className="px-5 py-4 font-medium">
                      {row.tool === "Registruti" ? (
                        <span className="flex items-center gap-1.5 text-indigo-600">
                          <Logo size={16} /> <Wordmark className="text-sm" />
                        </span>
                      ) : (
                        row.tool
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{row.free}</td>
                    <td className="px-5 py-4 text-slate-600">{row.language}</td>
                    <td className="px-5 py-4 text-slate-600">{row.upgrade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-slate-500">
            Comparaciones completas:{" "}
            <Link href="/alternativa-toggl-track" className="font-medium text-indigo-600 hover:underline">
              Toggl Track
            </Link>
            ,{" "}
            <Link href="/alternativa-clockify" className="font-medium text-indigo-600 hover:underline">
              Clockify
            </Link>{" "}
            y{" "}
            <Link href="/alternativa-harvest" className="font-medium text-indigo-600 hover:underline">
              Harvest
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Preguntas frecuentes sobre el time tracker gratis
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
                href="/calculadora-de-horas-trabajadas"
                className="font-medium text-indigo-600 underline-offset-2 hover:underline"
              >
                Calculadora de horas trabajadas
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
            Probalo con tu semana real
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Creá tu cuenta, cargá lo que hiciste hoy y mirá el viernes cuánto facturaste por
            cliente. Gratis, sin tarjeta, en español.
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
