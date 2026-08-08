import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El indicador de desarrollo de Next (esquina inferior) tapa la navegación inferior
  // móvil e intercepta taps en los e2e (visto en nutri-kids S1) — apagado por default.
  devIndicators: false,

  // /conoce sirve el brochure (docs/BROCHURE.html, copiado a public/ por build:brochure).
  // Es una URL limpia para compartir: el link que recibe la familia no dice ".html".
  async rewrites() {
    return [{ source: "/conoce", destination: "/conoce.html" }];
  },
};

export default nextConfig;
