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

/**
 * Quien firma el contenido (landing, blog). Google evalúa E-E-A-T: un post
 * firmado por una persona identificable, con perfiles públicos, pesa más que
 * uno firmado por "la organización". Se usa en el byline visible y en el
 * `author` de los BlogPosting.
 */
export const SITE_AUTHOR = {
  name: "Nicolás Espíndola",
  url: "https://x.com/nicoproducto",
  sameAs: ["https://x.com/nicoproducto", "https://www.linkedin.com/in/nicolas-espindola/"],
};
