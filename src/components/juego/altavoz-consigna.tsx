"use client";

// ALTAVOZ DE CONSIGNA (Outcome 2, remate de auditoría S3): la invitación fija del juego ("Haz
// sonar tu voz: aaaaah" / "Haz la voz de sirena…") suena en la voz de la familia si está grabada.
// Mismo principio que el picto: la voz dice EXACTAMENTE el texto fijo que está en pantalla.
// Solo aparece si hay grabación y el toggle está activo — si no, el juego suena como antes.
//
// Quien lo monta DEBE pasarle el `silenciar` del juego vía useVozFamiliar({alSonar}): estos
// juegos miden el micrófono en vivo y la guarda del bucle no es opcional (regla dura 3).

import { IconoAltavoz } from "@/components/iconos";
import type { VozFamiliar } from "./use-voz-familiar";

export function AltavozConsigna({
  voz,
  id,
  etiqueta,
}: {
  voz: VozFamiliar;
  /** Id del catálogo grabable (p. ej. "consigna:aaah"). */
  id: string;
  /** Para el lector de pantalla: qué se va a oír. */
  etiqueta: string;
}) {
  if (!voz.disponible(id)) return null;

  return (
    <button
      type="button"
      onClick={() => void voz.reproducir(id)}
      data-testid="altavoz-consigna"
      data-fuente-voz="familiar"
      aria-label={etiqueta}
      className="border-acento text-acento bg-superficie ease-suave mx-auto flex min-h-16 min-w-16 items-center justify-center rounded-full border-2 transition-transform duration-[--dur-rapida] active:scale-95 motion-reduce:transition-none"
    >
      <IconoAltavoz className="h-8 w-8" />
    </button>
  );
}
