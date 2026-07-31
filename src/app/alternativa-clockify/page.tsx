import type { Metadata } from "next";
import AlternativePage from "@/components/marketing/AlternativePage";
import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "@/lib/site";
import { buildComparisonJsonLd } from "@/lib/comparisonJsonLd";

const PAGE_URL = `${SITE_URL}/alternativa-clockify`;
const PUBLISHED_ISO = "2026-07-31";
const UPDATED_ISO = "2026-07-31";

export const metadata: Metadata = {
  title: "Alternativa a Clockify en español y con facturación (2026)",
  description:
    "Clockify es gratis para medir tiempo, pero facturar cuesta USD 6,99/mes y el español está a medias. Registruti incluye tarifas por cliente y facturas en PDF gratis.",
  keywords: [
    "alternativa a Clockify",
    "Clockify en español",
    "Clockify precio",
    "app como Clockify",
    "Clockify facturación",
  ],
  alternates: { canonical: "/alternativa-clockify" },
  openGraph: {
    images: [SITE_OG_IMAGE],
    type: "website",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    title: "La alternativa a Clockify para freelancers que facturan | Registruti",
    description:
      "Comparación honesta Registruti vs Clockify: qué incluye cada plan gratis, cuánto cuesta facturar en Clockify y para quién conviene cada una.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alternativa a Clockify en español y con facturación",
    description:
      "Clockify mide tiempo gratis; cobrar es plan pago. Comparación completa para freelancers que facturan por hora.",
  },
};

const COMPARISON = [
  {
    criterio: "Precio para facturar tus horas",
    registruti: "Gratis",
    competitor: "Plan Standard: USD 6,99/usuario/mes (USD 5,49 anual)",
    wins: true,
  },
  {
    criterio: "Idioma de la interfaz",
    registruti: "100% en español",
    competitor: "Traducción parcial al español",
    wins: true,
  },
  {
    criterio: "Generación de facturas",
    registruti: "Sí, en el plan gratis: PDF y link público",
    competitor: "Sí, desde el plan Standard",
    wins: true,
  },
  {
    criterio: "Tarifa y moneda por cliente",
    registruti: "Sí, 9 monedas (ARS, USD, EUR, UYU, BRL, CLP, COP, MXN, GBP)",
    competitor: "Sí, en planes pagos",
    wins: true,
  },
  {
    criterio: "Link público para que tu cliente vea el detalle",
    registruti: "Sí, por factura, sin que tu cliente cree cuenta",
    competitor: "Reportes compartibles, no factura con detalle",
    wins: true,
  },
  {
    criterio: "Modelo de cobro",
    registruti: "Freemium + lifetime access (pago único, sin suscripción)",
    competitor: "Suscripción mensual/anual por usuario",
    wins: true,
  },
  {
    criterio: "Enfoque del producto",
    registruti: "Freelancers y consultores independientes",
    competitor: "Equipos: aprobaciones, GPS, capturas de pantalla",
    wins: true,
  },
  {
    criterio: "Plan gratis para medir tiempo",
    registruti: "Sin límite de horas; hasta 3 clientes activos y 4 facturas",
    competitor: "Usuarios y proyectos ilimitados, sin límite de tiempo",
    wins: false,
  },
  {
    criterio: "Cronómetro en tiempo real",
    registruti: "No: carga manual en bloques de 15 min a 8 hs",
    competitor: "Sí, con detección de inactividad y Pomodoro",
    wins: false,
  },
  {
    criterio: "Apps nativas iOS / Android / escritorio",
    registruti: "No (web responsive, instalable como PWA)",
    competitor: "Sí, todas las plataformas",
    wins: false,
  },
];

const FAQS = [
  {
    q: "¿Clockify está en español?",
    a: "Parcialmente. Clockify ofrece traducción al español, pero es incompleta: buena parte de los reportes, la configuración y la documentación siguen en inglés, y conviven partes traducidas con partes que no lo están. Registruti está escrita 100% en español desde cero, incluidos los reportes y las facturas que ve tu cliente.",
  },
  {
    q: "¿Cuánto cuesta Clockify si quiero facturar mis horas?",
    a: "El plan gratis de Clockify es muy generoso para medir tiempo —usuarios y proyectos ilimitados— pero la facturación llega con el plan Standard: USD 6,99 por usuario por mes, o USD 5,49 con pago anual. Para un freelancer solo, eso son entre USD 66 y USD 84 por año únicamente para poder emitir facturas.",
  },
  {
    q: "¿Por qué buscar una alternativa a Clockify si el plan gratis es tan bueno?",
    a: "Porque el plan gratis resuelve medir, no cobrar. Si tu problema es saber cuántas horas trabajaste, Clockify gratis es difícil de superar. Si tu problema es pasar de esas horas a una factura que puedas mandar, ahí empieza el plan pago — y además el producto se orienta cada vez más a control de equipos (GPS, capturas de pantalla, aprobaciones), funciones que un freelancer no necesita pero igual tiene que navegar.",
  },
  {
    q: "¿Registruti reemplaza al cronómetro de Clockify?",
    a: "No de la misma manera. Registruti no tiene un timer corriendo en segundo plano: cargás bloques de 15 minutos a 8 horas, normalmente al cerrar el día o la semana. Si tu flujo de trabajo es play/stop constante, el cronómetro de Clockify es mejor. Si anotás tus horas al final del día, la carga manual es más rápida.",
  },
  {
    q: "¿Puedo migrar mis datos de Clockify a Registruti?",
    a: "Todavía no hay importación automática. Lo recomendable es exportar tu histórico desde Clockify (Reports → Export → CSV) para conservarlo, crear tus clientes en Registruti con su tarifa y su moneda, y arrancar a trackear la semana en curso. La migración lleva unos 15 minutos.",
  },
  {
    q: "¿Necesito tarjeta de crédito para probar Registruti?",
    a: "No. Creás la cuenta con email o con Google y empezás a trackear al instante. El plan gratis incluye tarifas por cliente, reportes con montos facturables y facturas en PDF, sin límite de tiempo ni medio de pago.",
  },
];

const JSON_LD = buildComparisonJsonLd({
  pageUrl: PAGE_URL,
  name: "Alternativa a Clockify en español y con facturación (2026)",
  description:
    "Comparación entre Registruti y Clockify para freelancers: precios 2026, facturación, idioma y enfoque del producto.",
  breadcrumbLabel: "Alternativa a Clockify",
  publishedISO: PUBLISHED_ISO,
  modifiedISO: UPDATED_ISO,
  faqs: FAQS,
});

export default function AlternativaClockifyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <AlternativePage
        competitor="Clockify"
        badge="Comparación actualizada · julio 2026"
        h1Lead="La alternativa a Clockify"
        h1Highlight="en español y con facturas incluidas"
        subtitle="Clockify mide tiempo gratis mejor que casi nadie. El problema aparece cuando querés cobrar: ahí empieza el plan pago. Acá las tarifas por cliente y las facturas en PDF están en el plan gratis, y todo está en español de verdad."
        verdict={
          <>
            <strong>Elegí Registruti</strong> si sos freelancer, facturás por hora y querés pasar de
            las horas a la factura sin pagar una suscripción ni pelearte con una interfaz a medio
            traducir. <strong>Quedate en Clockify</strong> si lo tuyo es medir tiempo con un
            cronómetro siempre corriendo, necesitás apps nativas o coordinás un equipo. Abajo está
            el detalle, incluido dónde gana Clockify.
          </>
        }
        reasonsTitle="¿Por qué buscar una alternativa a Clockify?"
        reasonsIntro="Clockify es una herramienta sólida y su plan gratis es de los más generosos del mercado. Pero para un freelancer hispanohablante que factura por hora, hay tres fricciones concretas:"
        reasons={[
          {
            icon: "🧾",
            title: "Facturar es plan pago",
            body: "Medir tiempo es gratis e ilimitado, pero emitir facturas arranca en el plan Standard: USD 6,99 por usuario por mes.",
          },
          {
            icon: "🌎",
            title: "El español está a medias",
            body: "Hay traducción, pero incompleta: partes de los reportes y de la configuración siguen en inglés.",
          },
          {
            icon: "👀",
            title: "Cada vez más para equipos",
            body: "GPS, capturas de pantalla, aprobaciones: el producto va hacia el control de empleados, no hacia el freelance que factura.",
          },
        ]}
        comparisonTitle="Registruti vs. Clockify: la comparación completa"
        comparisonNote="Datos verificados a julio de 2026. Marcamos también dónde gana Clockify — una comparación que esconde eso no te sirve para decidir."
        comparison={COMPARISON}
        whenCompetitorTitle="Cuándo Clockify sigue siendo tu mejor opción"
        whenCompetitorIntro="Nos interesa que elijas bien, no que elijas Registruti:"
        whenCompetitor={[
          {
            icon: "⏲️",
            title: "Vivís del cronómetro.",
            body: "Si tu día es play/stop con detección de inactividad y Pomodoro, el timer de Clockify es excelente y Registruti no tiene equivalente: acá se cargan bloques de 15 minutos a 8 horas.",
          },
          {
            icon: "👥",
            title: "Sos más de uno.",
            body: "El plan gratis de Clockify no limita usuarios ni proyectos. Para un equipo que solo necesita medir tiempo sin pagar nada, es imbatible. Registruti es deliberadamente individual.",
          },
          {
            icon: "📱",
            title: "Necesitás apps nativas.",
            body: "Clockify tiene aplicaciones para iOS, Android, Windows, macOS y Linux, además de extensiones de navegador. Registruti es web e instalable como PWA.",
          },
        ]}
        migrationTitle="Cómo pasarte de Clockify a Registruti en 15 minutos"
        migration={[
          {
            title: "Exportá tu histórico de Clockify",
            body: "En Clockify: Reports → elegí el rango → Export → CSV. Guardá el archivo como respaldo de tus horas históricas (por ahora Registruti no importa CSV automáticamente).",
          },
          {
            title: "Creá tu cuenta gratis en Registruti",
            body: "Con email o Google, sin tarjeta. Elegí tu país y la moneda y el ID fiscal (CUIT, RUT, RFC…) quedan configurados solos.",
          },
          {
            title: "Cargá tus clientes con tarifa y moneda",
            body: "Cada cliente con su tarifa por hora y su moneda entre las 9 disponibles. Esto es lo que en Clockify vive en los planes pagos.",
          },
          {
            title: "Trackeá la semana en curso y facturá",
            body: "Cargá las horas de esta semana en la vista semanal. Con una semana completa ya podés generar tu primera factura en PDF con link público para el cliente.",
          },
        ]}
        faqTitle="Preguntas frecuentes sobre dejar Clockify"
        faqs={FAQS}
        related={[
          {
            href: "/alternativa-toggl-track",
            label: "La alternativa a Toggl Track gratis y en español",
          },
          { href: "/alternativa-harvest", label: "La alternativa a Harvest para freelancers" },
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
        ctaBody="Creá tu cuenta, cargá tus clientes con su tarifa y trackeá esta semana. Si el viernes la factura no sale en un clic, volvé a Clockify — el CSV exportado te espera."
      />
    </>
  );
}
