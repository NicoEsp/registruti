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

const AUTHOR_SITE = "https://nicoproducto.work";
const AUTHOR_X = "https://x.com/nicoproducto";
const AUTHOR_LINKEDIN = "https://www.linkedin.com/in/nicolas-espindola/";

/**
 * Quien firma el contenido y construye el producto: Nico Espindola, con
 * NicoProducto como marca personal. Google evalúa E-E-A-T: un post firmado
 * por alguien identificable, con sitio y perfiles públicos, pesa más que uno
 * firmado por "la organización".
 *
 * La misma identidad vive en tres sitios (nicoproducto.work, productprepa.com
 * y este). Para que Google y las IAs entiendan que es la misma persona, los
 * tres tienen que declarar el mismo nombre, el mismo sitio y, en los datos
 * estructurados, el mismo `@id` (`id` acá abajo). Se usa en el byline visible,
 * en el `author` de los BlogPosting, en el `founder` de la Organization, en el
 * `creator` de la SoftwareApplication y en el badge del footer: nombre, sitio
 * y perfiles no pueden divergir entre páginas ni entre productos.
 */
export const SITE_AUTHOR = {
  name: "Nico Espindola",
  /** Marca personal bajo la que salen los productos. */
  alias: "NicoProducto",
  /** Destino de todo enlace al autor: su sitio, no una red social. */
  url: AUTHOR_SITE,
  /** Identificador del Person en JSON-LD. Idéntico en los tres sitios. */
  id: `${AUTHOR_SITE}/#person`,
  x: AUTHOR_X,
  linkedin: AUTHOR_LINKEDIN,
  sameAs: [AUTHOR_SITE, AUTHOR_X, AUTHOR_LINKEDIN],
};

/**
 * Nodo `Person` completo para sumar al `@graph` de una página. Las demás
 * entidades (Organization, SoftwareApplication, BlogPosting) lo referencian
 * con `{ "@id": SITE_AUTHOR.id }` en vez de repetir los datos.
 */
export function authorPersonJsonLd() {
  return {
    "@type": "Person",
    "@id": SITE_AUTHOR.id,
    name: SITE_AUTHOR.name,
    alternateName: SITE_AUTHOR.alias,
    url: SITE_AUTHOR.url,
    jobTitle: "Product Builder & Advisor",
    sameAs: SITE_AUTHOR.sameAs,
  };
}
