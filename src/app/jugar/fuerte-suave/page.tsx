import type { Metadata } from "next";
import { BarrasVoz } from "@/components/iconos";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { FuerteSuave } from "@/components/juego/fuerte-suave";
import { fuerteSuave } from "@/lib/idioma/textos/voz-juegos";

export const metadata: Metadata = {
  title: "Fuerte y suave · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del servidor.

export default function JugarFuerteSuavePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={fuerteSuave.tituloPestana} />
      <h1 className="font-display flex items-center justify-center gap-3 text-center text-4xl sm:text-5xl">
        <span aria-hidden="true">
          <BarrasVoz className="size-12" />
        </span>
        <Tx t={fuerteSuave.titulo} />
      </h1>
      <p
        data-intro-padre
        className="text-tinta-suave mx-auto max-w-prose text-center"
      >
        <Tx t={fuerteSuave.intro.antes} />{" "}
        <strong>
          <Tx t={fuerteSuave.intro.enfasis} />
        </strong>
        <Tx t={fuerteSuave.intro.despues} />
      </p>
      <FuerteSuave />
    </main>
  );
}
