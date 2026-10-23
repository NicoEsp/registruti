import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import SampleInvoicePreview from "@/components/SampleInvoicePreview";

// Es una muestra, no contenido: no se indexa ni va en el sitemap. Lo que
// importa es que desde la landing se pueda ver (y bajar) la factura antes de
// registrarse.
export const metadata: Metadata = {
  title: "Ejemplo de factura",
  description:
    "Así se ve una factura generada con Registruti a partir de las horas trackeadas: detalle por día, tarifa, total, datos de pago y link público para el cliente.",
  robots: { index: false, follow: true },
};

export default function SampleInvoicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Así se ve una factura de Registruti
        </h1>
        <p className="mt-3 text-slate-600">
          Se arma sola con las horas que cargaste: una línea por día de trabajo, la tarifa del
          cliente y el total en su moneda. Tu cliente la recibe como PDF o la abre desde un link
          público, sin crear cuenta.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Es un documento comercial (lo que en inglés se llama <em>invoice</em>): sirve para que
          el cliente revise y apruebe el monto. No reemplaza la factura electrónica de tu país,
          que la seguís emitiendo como siempre.
        </p>

        <div className="mt-8">
          <SampleInvoicePreview />
        </div>

        <div className="mt-10 rounded-2xl border border-indigo-100 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold">Tu próxima factura empieza con tu próxima hora</p>
          <p className="mt-1 text-sm text-slate-600">
            Cargá lo que hiciste hoy y la factura del mes sale de ahí. Gratis, sin tarjeta.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-indigo-700 hover:to-indigo-600"
          >
            Empezá gratis hoy
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
