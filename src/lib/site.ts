export const SITE_URL = "https://registruti.app";
export const SITE_NAME = "Registruti";
export const SITE_TITLE = "Control de horas y facturación para freelancers | Registruti";
export const SITE_DESCRIPTION =
  "Trackeá tus horas, asigná tarifas por cliente y generá facturas en PDF gratis. La alternativa a Toggl Track en español para freelancers de Latinoamérica.";

/**
 * Imagen para compartir en redes (src/app/opengraph-image.jpg, que Next sirve
 * en esa ruta).
 *
 * Hay que declararla en TODA página que defina su propio `openGraph`: ese
 * objeto reemplaza entero al del layout raíz, imagen incluida. Sin esto, la
 * página se comparte en WhatsApp, X o LinkedIn como un link pelado sin preview
 * —que es lo que pasaba con el blog y con la comparación contra Toggl—.
 */
export const SITE_OG_IMAGE = "/opengraph-image.jpg";

const AUTHOR_X = "https://x.com/nicoproducto";
const AUTHOR_LINKEDIN = "https://www.linkedin.com/in/nicolas-espindola/";

/**
 * Quien firma el contenido: NicoProducto, la marca personal bajo la que salen
 * todos los productos (es el mismo nombre del badge "Un producto por
 * NicoProducto"). Google evalúa E-E-A-T: un post firmado por alguien
 * identificable, con perfiles públicos, pesa más que uno firmado por "la
 * organización". Se usa en el byline visible, en el `author` de los
 * BlogPosting, en el `founder` de la Organization y en el badge, así que el
 * nombre y los perfiles no pueden divergir entre productos ni entre páginas.
 */
export const SITE_AUTHOR = {
  name: "NicoProducto",
  url: AUTHOR_X,
  x: AUTHOR_X,
  linkedin: AUTHOR_LINKEDIN,
  sameAs: [AUTHOR_X, AUTHOR_LINKEDIN],
};
