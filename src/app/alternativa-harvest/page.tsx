import type { Metadata } from "next";
import AlternativePage from "@/components/marketing/AlternativePage";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";
import { buildComparisonJsonLd } from "@/lib/comparisonJsonLd";

const PAGE_URL = `${SITE_URL}/alternativa-harvest`;
const PUBLISHED_ISO = "2026-07-31";
const UPDATED_ISO = "2026-07-31";

export const metadata: Metadata = {
  title: "Alternativa a Harvest para freelancers, gratis y en español",
  description:
    "El plan gratis de Harvest es 1 usuario y 2 proyectos, está solo en inglés y cobra por uso. Registruti da tarifas por cliente y facturas en PDF gratis, en español.",
  keywords: [
    "alternativa a Harvest",
    "Harvest en español",
    "Harvest precio",
    "app como Harvest",
    "Harvest gratis freelance",
  ],
  alternates: { canonical: "/alternativa-harvest" },
  openGraph: {
    images: [SITE_OG_IMAGE],
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    title: "La alternativa a Harvest para freelancers | Registruti",
    description:
      "Harvest está pensada para agencias y cobra por asiento más cargos por uso. Comparación honesta con Registruti, gratis y en español para freelancers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alternativa a Harvest para freelancers, gratis y en español",
    description:
      "Free de 2 proyectos, solo inglés y precios por uso. La comparación completa contra Registruti.",
  },
};

const COMPARISON = [
  {
    criterio: "Plan gratis útil para un freelance",
    registruti: "Sí: 3 clientes activos, 4 facturas, tarifas y reportes incluidos",
    competitor: "1 usuario y 2 proyectos: alcanza para probar, no para trabajar",
    wins: true,
  },
  {
    criterio: "Idioma de la interfaz",
    registruti: "100% en español",
    competitor: "Solo inglés",
    wins: true,
  },
  {
    criterio: "Previsibilidad del costo",
    registruti: "Gratis, o un pago único de por vida",
    competitor: "Por asiento (desde USD 9/mes anual) más cargos por volumen de uso",
    wins: true,
  },
  {
    criterio: "Tarifa y moneda por cliente",
    registruti: "Sí, 9 monedas (ARS, USD, EUR, UYU, BRL, CLP, COP, MXN, GBP)",
    competitor: "Sí, con foco en el mercado estadounidense",
    wins: true,
  },
  {
    criterio: "Modelo de cobro",
    registruti: "Freemium + lifetime access (pago único, sin suscripción)",
    competitor: "Suscripción por usuario + cargos por uso",
    wins: true,
  },
  {
    criterio: "Pensada para",
    registruti: "Freelancers y consultores independientes",
    competitor: "Agencias y equipos con presupuestos por proyecto",
    wins: true,
  },
  {
    criterio: "Cobro online integrado",
    registruti: "No: la factura sale en PDF con link público",
    competitor: "Sí, con Stripe y PayPal integrados",
    wins: false,
  },
  {
    criterio: "Reportes de rentabilidad y presupuestos por proyecto",
    registruti: "Reportes de horas y montos por cliente y período",
    competitor: "Sí, maduros: presupuestos, costos y márgenes por proyecto",
    wins: false,
  },
  {
    criterio: "Seguimiento de gastos",
    registruti: "No",
    competitor: "Sí, con carga de comprobantes",
    wins: false,
  },
  {
    criterio: "Trayectoria y ecosistema",
    registruti: "Producto joven, enfocado",
    competitor: "Desde 2006, con integraciones y ecosistema consolidado",
    wins: false,
  },
];

const FAQS = [
  {
    q: "¿Harvest está disponible en español?",
    a: "No. La interfaz de Harvest está únicamente en inglés, y también lo están sus facturas y su documentación. Para un freelancer que le factura a clientes hispanohablantes, eso significa mandar documentos en inglés o rehacerlos aparte. Registruti está en español de punta a punta, incluida la factura en PDF que ve tu cliente.",
  },
  {
    q: "¿Cuánto cuesta Harvest en 2026?",
    a: "Harvest tiene un plan gratuito limitado a 1 usuario y 2 proyectos activos, y planes pagos desde USD 9 por usuario por mes con facturación anual. En 2026 sumó además cargos por volumen de uso —facturas enviadas, proyectos y clientes—, con lo cual el costo final depende de cuánto la uses y es menos predecible que una suscripción plana.",
  },
  {
    q: "¿El plan gratis de Harvest alcanza para un freelance?",
    a: "En la práctica, no. Dos proyectos activos es suficiente para probar la herramienta, pero cualquier freelancer con tres o cuatro clientes se queda corto en la primera semana. El plan gratis de Registruti permite 3 clientes activos y 4 facturas, con tarifas por cliente y reportes de montos facturables incluidos.",
  },
  {
    q: "¿Qué pierdo si dejo Harvest por Registruti?",
    a: "Tres cosas concretas: el cobro online integrado con Stripe y PayPal (en Registruti la factura sale en PDF con un link público, pero el cobro lo gestionás vos), el seguimiento de gastos con comprobantes, y los reportes de rentabilidad y presupuestos por proyecto. Si tu negocio depende de esas tres, Harvest sigue siendo mejor herramienta.",
  },
  {
    q: "¿Para quién es mejor Harvest que Registruti?",
    a: "Para agencias y equipos. Harvest lleva casi veinte años puliendo el combo tiempo + gastos + facturación con presupuestos por proyecto y márgenes, y eso se nota. Registruti está hecha para una sola persona que factura horas a varios clientes: no tiene gestión de equipo ni pretende tenerla.",
  },
  {
    q: "¿Puedo migrar mis datos de Harvest a Registruti?",
    a: "Todavía no hay importación automática. Lo recomendable es exportar tu histórico desde Harvest en CSV para conservarlo, crear tus clientes en Registruti con su tarifa y su moneda, y empezar a trackear la semana en curso. La migración típica lleva unos 15 minutos.",
  },
];

const JSON_LD = buildComparisonJsonLd({
  pageUrl: PAGE_URL,
  name: "Alternativa a Harvest para freelancers, gratis y en español",
  description:
    "Comparación entre Registruti y Harvest para freelancers: plan gratis real, previsibilidad del precio, idioma y funcionalidades de facturación.",
  breadcrumbLabel: "Alternativa a Harvest",
  publishedISO: PUBLISHED_ISO,
  modifiedISO: UPDATED_ISO,
  faqs: FAQS,
});

/** Sección propia de esta página: el problema del precio por uso. */
const PRICING_SECTION = (
  <section className="mx-auto mt-16 max-w-3xl">
    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
      El problema del precio por uso
    </h2>
    <p className="mt-4 text-slate-600">
      Durante años Harvest cobró de la forma más simple posible: tanto por usuario, por mes. En 2026
      cambió el esquema y al costo por asiento —desde USD 9 por usuario por mes con pago anual— le
      sumó cargos por volumen: facturas enviadas, proyectos, clientes.
    </p>
    <p className="mt-4 text-slate-600">
      Para una agencia con administración, esto es un renglón más de la planilla. Para un freelance
      es otra cosa: significa que el mes que más facturás es el mes que más pagás, y que no podés
      saber de antemano cuánto te va a costar la herramienta el año que viene. Justo lo contrario de
      lo que querés cuando tu ingreso ya es variable.
    </p>
    <p className="mt-4 text-slate-600">
      Registruti va por el otro lado: el plan gratis alcanza para trabajar, y el desbloqueo total es
      un pago único de por vida. Pagás una vez y se terminó — no hay suscripción que crezca con tu
      facturación.
    </p>
  </section>
);

export default function AlternativaHarvestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <AlternativePage
        competitor="Harvest"
        badge="Comparación actualizada · julio 2026"
        h1Lead="La alternativa a Harvest"
        h1Highlight="para freelancers que facturan por hora"
        subtitle="Harvest es una gran herramienta para agencias: casi veinte años puliendo tiempo, gastos y facturación por proyecto. Si sos una sola persona, estás pagando en dólares —y navegando en inglés— una complejidad que no usás."
        verdict={
          <>
            <strong>Elegí Registruti</strong> si sos freelancer o consultor independiente, facturás
            horas a varios clientes y querés un costo previsible en tu idioma.{" "}
            <strong>Quedate en Harvest</strong> si manejás una agencia con presupuestos y márgenes
            por proyecto, necesitás cobro online integrado o llevás gastos con comprobantes. Abajo
            está el detalle, incluido dónde gana Harvest.
          </>
        }
        reasonsTitle="¿Por qué buscar una alternativa a Harvest?"
        reasonsIntro="Harvest hace bien lo que promete, pero lo promete para otro público. Para un freelancer hispanohablante hay tres fricciones difíciles de ignorar:"
        reasons={[
          {
            icon: "🚪",
            title: "El free es una demo",
            body: "1 usuario y 2 proyectos activos. Con tres clientes ya te quedaste afuera y pasás al plan pago.",
          },
          {
            icon: "🌎",
            title: "Solo en inglés",
            body: "Interfaz, documentación y facturas. Tus clientes reciben un PDF en un idioma que quizás no leen.",
          },
          {
            icon: "📈",
            title: "Cuanto más facturás, más pagás",
            body: "Al costo por asiento se le suman cargos por facturas, proyectos y clientes: el total deja de ser previsible.",
          },
        ]}
        comparisonTitle="Registruti vs. Harvest: la comparación completa"
        comparisonNote="Datos verificados a julio de 2026. Marcamos también dónde gana Harvest, que es en varias cosas — si te sirven, quedate ahí."
        comparison={COMPARISON}
        extra={PRICING_SECTION}
        whenCompetitorTitle="Cuándo Harvest sigue siendo tu mejor opción"
        whenCompetitorIntro="Nos interesa que elijas bien, no que elijas Registruti:"
        whenCompetitor={[
          {
            icon: "💳",
            title: "Necesitás que te paguen desde la factura.",
            body: "Harvest integra Stripe y PayPal: el cliente abre la factura y paga ahí mismo. En Registruti la factura sale en PDF con link público, pero el cobro lo gestionás por fuera.",
          },
          {
            icon: "🧮",
            title: "Trabajás con presupuestos por proyecto.",
            body: "Si necesitás saber cuánto llevás consumido de un presupuesto y cuál es el margen real de cada proyecto, los reportes de Harvest están años adelante.",
          },
          {
            icon: "🧾",
            title: "Llevás gastos con comprobantes.",
            body: "Harvest permite cargar gastos con foto del comprobante y refacturarlos al cliente. Registruti no hace seguimiento de gastos.",
          },
        ]}
        migrationTitle="Cómo pasarte de Harvest a Registruti en 15 minutos"
        migration={[
          {
            title: "Exportá tu histórico de Harvest",
            body: "Desde Reports, exportá el rango completo a CSV y guardalo. Es tu respaldo de horas y facturas históricas: por ahora Registruti no importa CSV automáticamente.",
          },
          {
            title: "Creá tu cuenta gratis en Registruti",
            body: "Con email o Google, sin tarjeta. Elegí tu país y la moneda y el ID fiscal (CUIT, RUT, RFC…) quedan configurados solos.",
          },
          {
            title: "Cargá tus clientes con tarifa y moneda",
            body: "Cada cliente con su tarifa por hora y su moneda entre las 9 disponibles, incluidas las de Latinoamérica que Harvest no prioriza.",
          },
          {
            title: "Trackeá la semana en curso y facturá",
            body: "Cargá las horas de esta semana en la vista semanal. Con una semana completa ya generás tu primera factura en PDF con link público para el cliente.",
          },
        ]}
        faqTitle="Preguntas frecuentes sobre dejar Harvest"
        faqs={FAQS}
        related={[
          {
            href: "/alternativa-toggl-track",
            label: "La alternativa a Toggl Track gratis y en español",
          },
          { href: "/alternativa-clockify", label: "La alternativa a Clockify en español" },
          {
            href: "/blog/mejores-alternativas-toggl-track",
            label: "Las 6 mejores alternativas a Toggl Track en 2026 (gratis y pagas)",
          },
          {
            href: "/cuanto-cobrar-por-hora",
            label: "Calculadora: ¿cuánto cobrar por hora como freelance?",
          },
        ]}
        ctaTitle="Probala con tu semana real"
        ctaBody="Creá tu cuenta, cargá tus clientes con su tarifa y trackeá esta semana. Si el viernes la factura no sale en un clic, volvé a Harvest — el CSV exportado te espera."
      />
    </>
  );
}
