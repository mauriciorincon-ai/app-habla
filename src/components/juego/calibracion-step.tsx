"use client";

// Calibración lúdica: 2 segundos de silencio para medir cómo suena ESTA casa.
// El umbral del juego será relativo a ese ruido — por eso el ventilador o la TV no mueven al
// personaje. La barra se pinta desde un ref a 60 fps (sin re-render).

import { useEffect, useRef } from "react";
import { IconoSilencio } from "@/components/iconos";
import type { MedidasVivas } from "./use-voice-session";

type Props = {
  medidas: MedidasVivas;
};

export function CalibracionStep({ medidas }: Props) {
  const barraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let id = 0;
    const pintar = () => {
      if (barraRef.current) {
        barraRef.current.style.transform = `scaleX(${medidas.progresoCalibracion()})`;
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [medidas]);

  return (
    <section
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center"
      data-testid="calibrando"
      aria-live="polite"
    >
      <IconoSilencio className="text-acento h-16 w-16" />
      <h2 className="font-display text-4xl">Shhh… un momentico de silencio</h2>
      <p className="text-tinta-suave max-w-sm">
        Estoy escuchando cómo suena su casa (el ventilador, la tele, la calle)
        para no confundir ese ruido con su voz. Dos segundos y ya.
      </p>

      <div className="bg-acento-suave h-4 w-full max-w-sm overflow-hidden rounded-full">
        <div
          ref={barraRef}
          className="bg-acento h-full w-full origin-left rounded-full"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </section>
  );
}
