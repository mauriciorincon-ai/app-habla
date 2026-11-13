import type { Metadata } from "next";
import { IconoGemelas } from "@/components/iconos";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { Gemelas } from "@/components/juego/gemelas";
import { palabras } from "@/lib/idioma/textos/palabras";

export const metadata: Metadata = {
  title: "Palabras gemelas · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del
// servidor; los pictogramas cargan perezosos dentro del juego. Sin micrófono: gemelas no captura
// ni analiza voz — el padre marca lo que oye (ADR-009). En inglés se juega con los pares mínimos
// del inglés (S8), no con los del español traducidos.

export default function JugarGemelasPage() {
  const g = palabras.gemelas;
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={g.tituloPestana} />
      {/* El icono del juego —el MISMO del selector— dice dónde estás sin leer (gate S4). */}
      <h1 className="font-display flex items-center justify-center gap-3 text-center text-4xl sm:text-5xl">
        <span aria-hidden="true">
          <IconoGemelas className="text-acento h-10 w-12" />
        </span>
        <Tx t={g.titulo} />
      </h1>
      <p data-intro-padre className="text-tinta-suave mx-auto max-w-prose text-center">
        <Tx t={g.intro.antes} /> <strong><Tx t={g.intro.pide} /></strong> <Tx t={g.intro.medio} />{" "}
        <strong><Tx t={g.intro.noOye} /></strong> <Tx t={g.intro.despues} />
      </p>
      <Gemelas />
    </main>
  );
}
