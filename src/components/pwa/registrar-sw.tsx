"use client";

import { useEffect } from "react";

// Registra el service worker (solo en producción: en desarrollo estorbaría al recargar).
// El worker únicamente cachea archivos públicos de la app — jamás audio (ver public/sw.js).
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch(() => {
        // Sin service worker la app funciona igual: solo pierde el modo sin conexión.
      });
  }, []);

  return null;
}
