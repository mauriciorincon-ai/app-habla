"use client";

// «Intensidad de colores» (S15): el ajuste se refleja en el <html> de TODA la app (juegos incluidos),
// no solo en Ajustes. `data-intensidad="suave"` apaga la paleta con tokens (globals.css).

import { useEffect } from "react";
import { useAjustes } from "@/components/estado-local";

export function AplicarIntensidad() {
  const ajustes = useAjustes();
  const suave = ajustes?.intensidad === "suave";
  useEffect(() => {
    if (suave) document.documentElement.dataset.intensidad = "suave";
    else delete document.documentElement.dataset.intensidad;
  }, [suave]);
  return null;
}
