import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: `Términos y Condiciones de uso de ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const UPDATED = "2 de julio de 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Volver
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Términos y Condiciones</h1>
      <p className="mt-2 text-sm text-slate-500">Última actualización: {UPDATED}</p>

      <div className="prose prose-slate mt-8 max-w-none text-sm leading-relaxed text-slate-700 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_p]:mt-3">
        <p>
          Estos Términos y Condiciones regulan el uso de {SITE_NAME} (el “Servicio”), una
          aplicación web de registro de horas y generación de documentos de facturación para
          profesionales independientes. Al crear una cuenta o usar el Servicio, aceptás estos
          términos.
        </p>

        <h2>1. Descripción del Servicio</h2>
        <p>
          {SITE_NAME} permite registrar horas trabajadas por cliente, definir tarifas y generar
          documentos en PDF con el detalle de esas horas y sus montos. El Servicio se ofrece “tal
          cual” y puede modificarse o discontinuarse.
        </p>

        <h2>2. No es facturación fiscal</h2>
        <p>
          <strong>
            Los documentos generados por {SITE_NAME} no constituyen comprobantes fiscales
            (facturas electrónicas) válidos ante AFIP/ARCA ni ante ninguna autoridad tributaria.
          </strong>{" "}
          Son documentos internos o proforma para respaldar tu propia facturación. Sos vos el
          único responsable de emitir los comprobantes fiscales correspondientes y de cumplir con
          tus obligaciones impositivas.
        </p>

        <h2>3. Cuentas</h2>
        <p>
          Sos responsable de la confidencialidad de tus credenciales y de toda la actividad de tu
          cuenta. Debés proporcionar información veraz y mantenerla actualizada.
        </p>

        <h2>4. Uso aceptable</h2>
        <p>
          No podés usar el Servicio para fines ilícitos, ni intentar vulnerar su seguridad, acceder
          a datos de otros usuarios o interrumpir su funcionamiento.
        </p>

        <h2>5. Tus datos y contenidos</h2>
        <p>
          Conservás la titularidad de la información que cargás (clientes, horas, facturas). Nos
          otorgás una licencia limitada para procesarla con el único fin de prestarte el Servicio.
          El tratamiento de datos personales se rige por nuestra{" "}
          <Link href="/privacy" className="text-indigo-600 hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>

        <h2>6. Disponibilidad y garantías</h2>
        <p>
          El Servicio se brinda “tal cual” y “según disponibilidad”, sin garantías de ningún tipo.
          No garantizamos que esté libre de errores ni que esté disponible de forma ininterrumpida.
        </p>

        <h2>7. Limitación de responsabilidad</h2>
        <p>
          En la máxima medida permitida por la ley, {SITE_NAME} no será responsable por daños
          indirectos, lucro cesante ni pérdida de datos derivados del uso o la imposibilidad de uso
          del Servicio.
        </p>

        <h2>8. Cambios</h2>
        <p>
          Podemos actualizar estos términos. Si los cambios son sustanciales, lo notificaremos por
          medios razonables. El uso continuado del Servicio implica la aceptación de la versión
          vigente.
        </p>

        <h2>9. Contacto</h2>
        <p>
          Ante cualquier consulta sobre estos términos, escribinos a través de los canales de
          contacto del Servicio.
        </p>

        <p className="mt-8 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">
          Este documento es una plantilla inicial y no constituye asesoramiento legal. Antes de
          operar comercialmente, hacelo revisar por un profesional del derecho de tu jurisdicción.
        </p>
      </div>
    </main>
  );
}
