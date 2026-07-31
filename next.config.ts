import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Canonicalización de host (www vs apex): NO agregar redirects por host acá.
  //
  // Eso lo decide la config de Domains en el panel de Vercel, y tiene que ser
  // el único dueño. Un redirect a nivel app no puede ver cómo está configurado
  // el dominio en el edge: si el panel apunta en el sentido contrario, cada
  // capa deshace a la otra y el sitio entero cae con ERR_TOO_MANY_REDIRECTS
  // (pasó en producción: el panel mandaba apex → www y la app www → apex).
  //
  // Para canonicalizar en https://registruti.app (lo que declaran SITE_URL,
  // los canonical y el sitemap): Vercel → Settings → Domains → registruti.app
  // como dominio primario, y www.registruti.app en "Redirect to" hacia él.
};

export default nextConfig;
