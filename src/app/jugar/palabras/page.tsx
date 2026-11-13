import type { Metadata } from "next";
import { IconoPictograma } from "@/components/iconos";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { PalabraObjeto } from "@/components/juego/palabra-objeto";
import { palabras } from "@/lib/idioma/textos/palabras";

export const metadata: Metadata = {
  title: "Palabra y dibujo · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del
// servidor; los pictogramas cargan perezosos dentro del juego. En inglés se juega con las palabras
// inglesas de los mismos dibujos (S8).

export default function JugarPalabrasPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={palabras.tituloPestana} />
      {/* El icono del juego —el MISMO del selector— dice dónde estás sin leer (gate S4). */}
      <h1 className="font-display flex items-center justify-center gap-3 text-center text-4xl sm:text-5xl">
        <span aria-hidden="true">
          <IconoPictograma className="text-acento h-10 w-10" />
        </span>
        <Tx t={palabras.titulo} />
      </h1>
      <p data-intro-padre className="text-tinta-suave mx-auto max-w-prose text-center">
        <Tx t={palabras.intro.antes} /> <strong><Tx t={palabras.intro.usted} /></strong>{" "}
        <Tx t={palabras.intro.medio} /> <strong><Tx t={palabras.intro.cualquier} /></strong>{" "}
        <Tx t={palabras.intro.despues} />
      </p>
      <PalabraObjeto />
    </main>
  );
}
