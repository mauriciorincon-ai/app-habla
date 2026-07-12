import type { Metadata } from "next";
import { PalabraObjeto } from "@/components/juego/palabra-objeto";

export const metadata: Metadata = {
  title: "Palabra y dibujo · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del
// servidor; los pictogramas cargan perezosos dentro del juego.

export default function JugarPalabrasPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-center text-4xl sm:text-5xl">
        Cada dibujo tiene su palabra
      </h1>
      <p
        data-intro-padre
        className="text-tinta-suave mx-auto max-w-prose text-center"
      >
        Aparece un dibujo con su nombre. <strong>Usted lo nombra</strong> —una
        sola palabra— y espera. El dibujo se enciende con{" "}
        <strong>cualquier sonido</strong> que él haga: la app no le exige la
        palabra ni juzga si la dijo bien. Eso lo sabe usted. Nada de lo que él
        diga se graba ni sale de este dispositivo.
      </p>
      <PalabraObjeto />
    </main>
  );
}
