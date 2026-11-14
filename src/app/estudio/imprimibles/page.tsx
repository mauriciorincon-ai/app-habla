import type { Metadata } from "next";
import { ImprimiblesCliente } from "@/components/imprimibles/imprimibles-cliente";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { imprimibles } from "@/lib/idioma/textos/imprimibles";

export const metadata: Metadata = {
  title: "Hojas para imprimir · Hablemos San",
};

// «Hojas para imprimir» (S10): tarjetas y tablero para jugar lejos de la pantalla.
export default function ImprimiblesPage() {
  return (
    <main className="zona-imprimible mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <TituloDePagina t={imprimibles.tituloPestana} />
      <h1 className="no-imprimir font-display text-center text-4xl">
        <Tx t={imprimibles.titulo} />
      </h1>
      <ImprimiblesCliente />
    </main>
  );
}
