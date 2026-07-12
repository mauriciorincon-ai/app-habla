import type { Metadata } from "next";
import { VoiceGame } from "@/components/juego/voice-game";

export const metadata: Metadata = {
  title: "A jugar con tu voz · Hablemos San",
};

// LCP estático (patrón lcp-nace-estatico): el titular Y el bloque de texto grande de la mitad
// superior —el rol del padre— se sirven en el HTML del servidor. Antes el candidato LCP era el
// guion, que nace en el cliente (depende del progreso guardado): eso empujaba el LCP hasta
// después de la hidratación.

export default function JugarPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-center text-4xl sm:text-5xl">
        Su voz mueve el mundo
      </h1>
      <p className="text-tinta-suave mx-auto max-w-prose text-center">
        Siéntese al lado de su hijo: usted dirige el juego. Le vamos a mostrar
        la línea que puede decirle, después medimos el ruido de la casa y
        entonces el globo empieza a volar mientras él sostiene la voz. Nada de
        lo que él diga se graba ni sale de este dispositivo.
      </p>
      <VoiceGame />
    </main>
  );
}
