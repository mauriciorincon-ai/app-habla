import type { Catalogo } from "../index";

// Lo que comparten varias pantallas: la salida a Hoy y los nombres de las secciones del adulto.
export const comunes = {
  volverAHoy: { es: "← Hoy", en: "← Today" },
  secciones: {
    rumbo: { es: "El rumbo", en: "The route" },
    objetivo: { es: "Objetivo", en: "Goal" },
    ajustes: { es: "Ajustes", en: "Settings" },
  },
} satisfies Catalogo;
