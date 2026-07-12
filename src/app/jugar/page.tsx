import type { Metadata } from "next";
import { VoiceGame } from "@/components/juego/voice-game";

export const metadata: Metadata = {
  title: "A jugar con tu voz · Hablemos San",
};

// LCP estático: el titular nace visible desde el HTML del servidor. El juego (que necesita
// micrófono y almacenamiento local) hidrata dentro de un espacio ya reservado.

export default function JugarPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-center text-4xl sm:text-5xl">
        Su voz mueve el mundo
      </h1>
      <VoiceGame />
    </main>
  );
}
