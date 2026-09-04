/**
 * Navegación de las páginas públicas (landing, comparativas, calculadora, blog).
 *
 * Fuente única para header y footer: si un link no está acá, no está en la
 * navegación. El header se queda con lo mínimo (tres destinos + un CTA) y el
 * footer absorbe el resto, que es donde viven los links internos que necesita
 * el crawleo.
 *
 * Los anchors van con `/` adelante a propósito: los mismos componentes se
 * renderizan en la landing y fuera de ella, así que `/#precios` tiene que
 * funcionar desde cualquier página.
 */

export type NavLink = { href: string; label: string };

/** Header. Tres links: cualquier cosa extra vuelve a romper el layout. */
export const PRIMARY_NAV: NavLink[] = [
  { href: "/#precios", label: "Precios" },
  { href: "/cuanto-cobrar-por-hora", label: "Calculadora" },
  { href: "/blog", label: "Blog" },
];

/**
 * CTA único de la navegación. `/login` resuelve alta y reingreso con el mismo
 * botón de Google, así que tener "Iniciar sesión" al lado era el mismo link
 * dos veces; el acceso para quien ya tiene cuenta queda en el footer.
 */
export const NAV_CTA: NavLink = { href: "/login", label: "Empezá gratis" };

export const FOOTER_NAV: { title: string; links: NavLink[] }[] = [
  {
    title: "Producto",
    links: [
      { href: "/#funcionalidades", label: "Funcionalidades" },
      { href: "/#como-funciona", label: "Cómo funciona" },
      { href: "/#precios", label: "Precios" },
      { href: "/login", label: "Iniciar sesión" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/cuanto-cobrar-por-hora", label: "Cuánto cobrar por hora" },
      { href: "/blog", label: "Blog" },
      { href: "/#faq", label: "Preguntas frecuentes" },
    ],
  },
  {
    title: "Comparativas",
    links: [
      { href: "/alternativa-toggl-track", label: "Alternativa a Toggl Track" },
      { href: "/alternativa-clockify", label: "Alternativa a Clockify" },
      { href: "/alternativa-harvest", label: "Alternativa a Harvest" },
    ],
  },
];

export const LEGAL_NAV: NavLink[] = [
  { href: "/terms", label: "Términos" },
  { href: "/privacy", label: "Privacidad" },
];
