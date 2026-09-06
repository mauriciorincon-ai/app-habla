import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El indicador de desarrollo de Next (esquina inferior) tapa la navegación inferior
  // móvil e intercepta taps en los e2e (visto en nutri-kids S1) — apagado por default.
  devIndicators: false,

  // Documentos canónicos de docs/, copiados a public/ por build:documentos
  // (scripts/copiar-documentos.mjs) y servidos en URL limpia — el link que recibe la
  // familia no dice ".html":
  //   /conoce → el brochure (docs/BROCHURE.html)
  //   /mirada → el documento de contacto visual de la mamá (docs/CATALOGO-CONTACTO-VISUAL.html)
  async rewrites() {
    return [
      { source: "/conoce", destination: "/conoce.html" },
      { source: "/mirada", destination: "/mirada.html" },
    ];
  },
};

export default nextConfig;
