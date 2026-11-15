import type { Metadata } from "next";
import { Molino } from "@/components/iconos";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { Soplar } from "@/components/juego/soplar";
import { soplar } from "@/lib/idioma/textos/voz-juegos";

export const metadata: Metadata = {
  title: "Soplar · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del servidor.

export default function JugarSoplarPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={soplar.tituloPestana} />
      <h1 className="font-display flex items-center justify-center gap-3 text-center text-4xl sm:text-5xl">
        <span aria-hidden="true">
          <Molino className="h-12 w-8" />
        </span>
        <Tx t={soplar.titulo} />
      </h1>
      <p
        data-intro-padre
        className="text-tinta-suave mx-auto max-w-prose text-center"
      >
        <Tx t={soplar.intro.antes} />{" "}
        <strong>
          <Tx t={soplar.intro.enfasis} />
        </strong>
        <Tx t={soplar.intro.despues} />
      </p>
      <Soplar />
    </main>
  );
}
