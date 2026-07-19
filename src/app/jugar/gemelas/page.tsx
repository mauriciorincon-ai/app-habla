import type { Metadata } from "next";
import { Gemelas } from "@/components/juego/gemelas";

export const metadata: Metadata = {
  title: "Palabras gemelas · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): titular + intro del padre nacen en el HTML del
// servidor; los pictogramas cargan perezosos dentro del juego. Sin micrófono: gemelas no captura
// ni analiza voz — el padre marca lo que oye (ADR-009).

export default function JugarGemelasPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-center text-4xl sm:text-5xl">
        Dos palabras que suenan casi igual
      </h1>
      <p
        data-intro-padre
        className="text-tinta-suave mx-auto max-w-prose text-center"
      >
        Salen dos dibujos parecidos (foca y boca, pato y gato).{" "}
        <strong>Usted le pide que diga uno</strong> y marca el que oyó. No hay
        respuesta correcta ni incorrecta para él: cualquier intento vale.{" "}
        <strong>La app no oye la palabra</strong> —no usa micrófono aquí—, el
        que la oye es usted.
      </p>
      <Gemelas />
    </main>
  );
}
