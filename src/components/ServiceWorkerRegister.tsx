"use client";

import { useEffect } from "react";

/**
 * Registra el service worker (public/sw.js) que hace instalable la PWA y da
 * respaldo offline. Solo en producción: en desarrollo un SW cacheando páginas
 * vuelve loco a cualquiera.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin SW la app sigue funcionando igual; no molestamos al usuario.
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
