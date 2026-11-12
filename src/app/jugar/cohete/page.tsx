import type { Metadata } from "next";
import { Cohete } from "@/components/iconos";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { juegos } from "@/lib/idioma/textos/juegos";
import { CoheteTono } from "@/components/juego/cohete-tono";

export const metadata: Metadata = {
  title: "El cohete del tono · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del
// servidor; el juego (cliente) llega después sin mover el layout.

export default function JugarCohetePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={juegos.cohete.tituloPestana} />
      {/* El icono del juego —el MISMO del selector— dice dónde estás sin leer (gate S4). */}
      <h1 className="font-display flex items-center justify-center gap-3 text-center text-4xl sm:text-5xl">
        <span aria-hidden="true">
          <Cohete className="h-12 w-8" />
        </span>
        <Tx t={juegos.cohete.titulo} />
      </h1>
      <p
        data-intro-padre
        className="text-tinta-suave mx-auto max-w-prose text-center"
      >
        <Tx t={juegos.cohete.intro.antes} />{" "}
        <strong>
          <Tx t={juegos.cohete.intro.enfasis} />
        </strong>{" "}
        <Tx t={juegos.cohete.intro.despues} />
      </p>
      <CoheteTono />
    </main>
  );
}
