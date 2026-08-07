import type { MetadataRoute } from "next";

// PWA instalable en la tablet. Sin dependencias: Next genera y enlaza este manifest solo.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hablemos San",
    short_name: "Hablemos San",
    description:
      "Su voz mueve el mundo. Práctica diaria de estimulación del habla, para jugar juntos en casa.",
    lang: "es-CO",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#FBF8F2",
    theme_color: "#FBF8F2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        // Variante con el globo dentro de la zona segura: el recorte del sistema no lo corta.
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
