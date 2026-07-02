/* eslint-disable @next/next/no-img-element */
/**
 * Isotipo de Registruti: reloj de arena que se transforma en un signo $.
 * Sirve /brand/isotipo.png (asset oficial de marca; reemplazable 1:1 en public/brand/).
 */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/brand/isotipo.png"
      alt=""
      aria-hidden
      style={{ height: size, width: "auto" }}
    />
  );
}
