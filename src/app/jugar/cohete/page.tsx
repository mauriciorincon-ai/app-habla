import type { Metadata } from "next";
import { CoheteTono } from "@/components/juego/cohete-tono";

export const metadata: Metadata = {
  title: "El cohete del tono · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del
// servidor; el juego (cliente) llega después sin mover el layout.

export default function JugarCohetePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-center text-4xl sm:text-5xl">
        Su voz sube el cohete
      </h1>
      <p
        data-intro-padre
        className="text-tinta-suave mx-auto max-w-prose text-center"
      >
        Este juego escucha el <strong>tono</strong> de su voz: cuando sube, el
        cohete sube; cuando baja, baja. No hay que decir ninguna palabra — una
        vocal estirada como una sirena es justo lo que buscamos. Hágalo usted
        primero, exagerado. Nada de lo que él diga se graba ni sale de este
        dispositivo.
      </p>
      <CoheteTono />
    </main>
  );
}
