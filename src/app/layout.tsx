import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ActualizarLang } from "@/components/idioma/tx";
import { RegistrarSW } from "@/components/pwa/registrar-sw";
import { juntos, metadatos } from "@/lib/idioma/textos/metadatos";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // No se usa en el contenido principal (solo en etiquetas y métricas): no compite por ancho de
  // banda con la pintura del texto grande.
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hablemos San",
  description: juntos(metadatos.descripcionFicha),
  applicationName: "Hablemos San",
};

export const viewport: Viewport = {
  themeColor: "#FBF8F2",
};

/**
 * El tema elegido por el padre se aplica ANTES de la primera pintura: si esperáramos a que React
 * hidrate, la pantalla parpadearía del tema del sistema al elegido. Va inline a propósito (un
 * archivo aparte llegaría tarde). Si no hay elección guardada, no hace nada y manda el sistema.
 * Solo lee su propia clave de ajustes; nada de audio, nada de red (regla dura 2).
 */
const APLICAR_TEMA = `try{var a=localStorage.getItem("habla:v1:ajustes");if(a){var t=JSON.parse(a).apariencia;if(t==="claro"||t==="oscuro")document.documentElement.dataset.tema=t;}}catch(e){}`;

/**
 * El idioma (S7) se fija en el mismo sitio y por la misma razón: antes de la primera pintura. Primero
 * manda lo que el adulto eligió (`idioma` en los ajustes); si no hay elección, la primera preferencia
 * del navegador que sea español o inglés. Repite `detectarIdioma` (src/lib/idioma/index.ts) y
 * `tests/unit/idioma.test.ts` los mantiene de acuerdo.
 */
const APLICAR_IDIOMA = `try{var i=null;var a=localStorage.getItem("habla:v1:ajustes");if(a){i=JSON.parse(a).idioma;}if(i!=="es"&&i!=="en"){i="es";var p=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var k=0;k<p.length;k++){var b=String(p[k]).toLowerCase().split("-")[0];if(b==="en"||b==="es"){i=b;break;}}}document.documentElement.lang=i==="en"?"en":"es-CO";}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CO"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: APLICAR_TEMA + APLICAR_IDIOMA }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ActualizarLang />
        <RegistrarSW />
      </body>
    </html>
  );
}
