import type { NextConfig } from "next";
import { cabecerasSeguridad } from "./src/lib/seguridad/csp";

const nextConfig: NextConfig = {
  // El indicador de desarrollo de Next (esquina inferior) tapa la navegación inferior
  // móvil e intercepta taps en los e2e (visto en nutri-kids S1) — apagado por default.
  devIndicators: false,

  // The pictograms are small PNGs already sized for the screen: serve them as they are, so the offline
  // precache (scripts/gen-precache.mjs) holds the very URL the game asks for. Through /_next/image the
  // browser would ask a variant nobody cached and the games would open without their pictures.
  images: { unoptimized: true },

  // Documentos canónicos de docs/, copiados a public/ por build:documentos
  // (scripts/copiar-documentos.mjs) y servidos en URL limpia — el link que recibe la
  // familia no dice ".html":
  //   /conoce → el brochure (docs/BROCHURE.html)
  //   /mirada → el documento de la mamá, «La pirámide, en casa» (docs/LA-PIRAMIDE.html)
  async rewrites() {
    return [
      { source: "/conoce", destination: "/conoce.html" },
      { source: "/mirada", destination: "/mirada.html" },
    ];
  },

  // CSP and friends only in production (src/lib/seguridad/csp.ts): `connect-src 'self' blob:` backs the
  // recognizer Worker's offline guard with the browser's own enforcement.
  async headers() {
    return cabecerasSeguridad(process.env.NODE_ENV);
  },
};

export default nextConfig;
