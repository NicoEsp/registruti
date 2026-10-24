/* eslint-disable @next/next/no-img-element */
/**
 * Isotipo de Registruti: reloj de arena que se transforma en un signo $.
 * Sirve /brand/isotipo.png (asset oficial de marca; reemplazable 1:1 en public/brand/).
 *
 * Lleva texto alternativo siempre: la imagen aparece en todas las páginas
 * (header, footer, tablas comparativas) y sin `alt` los rastreadores la
 * reportan como imagen sin descripción. Donde va al lado del wordmark, el
 * nombre se lee dos veces; es el costo de que la imagen más repetida del sitio
 * diga qué es.
 */
export default function Logo({ size = 32, alt = "Registruti" }: { size?: number; alt?: string }) {
  return <img src="/brand/isotipo.png" alt={alt} style={{ height: size, width: "auto" }} />;
}
