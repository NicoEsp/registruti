import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Canonicalización de host. Google trata http://, https://, con y sin www
  // como cuatro URLs distintas hasta que le demostrás cuál es la buena: si las
  // cuatro responden 200, la home queda repartida en variantes duplicadas y
  // ninguna termina de consolidarse.
  //
  // Vercel ya resuelve http → https en el edge; lo que depende de la config del
  // dominio en el panel es el www → apex. Este redirect lo garantiza desde la
  // app hacia https://registruti.app, que es lo que declaran SITE_URL, los
  // canonical y el sitemap. Solo matchea ese host exacto, así que los deploys
  // de preview (*.vercel.app) no se ven afectados.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.registruti.app" }],
        destination: "https://registruti.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
