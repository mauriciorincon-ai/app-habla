import type { Metadata } from "next";
import { FormaVocal } from "@/components/juego/forma-vocal";
import { MapaVocales } from "@/components/juego/mapa-vocales";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { vocales } from "@/lib/idioma/textos/vocales";

export const metadata: Metadata = {
  title: "El mapa de las vocales · Hablemos San",
};

// LCP estático: titular, etiqueta «Experimental» y aviso nacen en el HTML del servidor.

export default function JugarVocalesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={vocales.tituloPestana} />
      <h1 className="font-display flex items-center justify-center gap-3 text-center text-4xl sm:text-5xl">
        <FormaVocal vocal="a" letra="A" className="size-12" encendida />
        <Tx t={vocales.titulo} />
      </h1>
      <p className="text-center">
        <span
          className="border-borde text-tinta inline-block rounded-full border px-3 py-1 font-mono text-xs tracking-[0.08em] uppercase"
          data-testid="etiqueta-experimental"
        >
          <Tx t={vocales.experimental} />
        </span>
      </p>
      <p
        data-intro-padre
        className="text-tinta-suave mx-auto max-w-prose text-center"
      >
        <Tx t={vocales.intro.antes} />{" "}
        <strong>
          <Tx t={vocales.intro.enfasis} />
        </strong>
        <Tx t={vocales.intro.despues} />
      </p>
      <p
        className="bg-superficie shadow-tarjeta mx-auto max-w-prose rounded-2xl p-4 text-center text-sm"
        data-testid="aviso-experimental"
      >
        <Tx t={vocales.avisoExperimental} />
      </p>
      <MapaVocales />
    </main>
  );
}
