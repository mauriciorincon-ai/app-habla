"use client";

// El escenario del niño: el globo avanza SOLO mientras su voz se sostiene.
// Se pinta a 60 fps desde los refs del medidor (cero re-renders de React aquí dentro).
//
// Modo calma: sin medidor, sin meta, sin línea de llegada — el globo solo flota con su voz.

import { useEffect, useRef } from "react";
import type { MedidasVivas } from "./use-voice-session";

type Props = {
  medidas: MedidasVivas;
  metaMs: number;
  modoCalma: boolean;
  /** Invitación amable tras un rato en silencio (jamás un regaño). */
  invitando: boolean;
};

export function Escenario({ medidas, metaMs, modoCalma, invitando }: Props) {
  const globoRef = useRef<HTMLDivElement | null>(null);
  const medidorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let id = 0;
    const pintar = () => {
      const nivel = medidas.nivel();
      const avance = modoCalma
        ? 0
        : Math.min(1, medidas.sostenidoMs() / metaMs);

      if (globoRef.current) {
        // Avanza con el tiempo sostenido; flota con el volumen de la voz.
        const x = avance * 78; // % del ancho del escenario
        const y = -nivel * 38; // % de la altura: la voz lo eleva
        globoRef.current.style.transform = `translate(${x}%, ${y}%)`;
      }
      if (medidorRef.current) {
        medidorRef.current.style.transform = `scaleY(${Math.max(0.02, nivel)})`;
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [medidas, metaMs, modoCalma]);

  return (
    <div className="flex w-full items-stretch gap-4" data-testid="escenario">
      <div className="bg-superficie relative h-64 flex-1 overflow-hidden rounded-3xl sm:h-80">
        {/* Línea de llegada: solo cuando hay meta (en modo calma no existe). */}
        {!modoCalma ? (
          <div
            className="bg-kid-sage/40 absolute top-0 bottom-0 right-[12%] w-1 rounded-full"
            aria-hidden="true"
          />
        ) : null}

        {/* Suelo */}
        <div
          className="bg-kid-sage/30 absolute inset-x-0 bottom-0 h-10"
          aria-hidden="true"
        />

        <div className="absolute bottom-10 left-[6%] h-32 w-32">
          <div ref={globoRef} className="h-full w-full will-change-transform">
            <span className="text-7xl" role="img" aria-label="globo">
              🎈
            </span>
          </div>
        </div>

        {invitando ? (
          <p
            className="bg-fondo/90 text-tinta absolute inset-x-4 bottom-14 rounded-2xl p-3 text-center text-lg"
            data-testid="invitacion"
          >
            El globo espera tu voz… ¿le hacemos{" "}
            <span className="font-display italic">aaaah</span> juntos?
          </p>
        ) : null}
      </div>

      {/* Medidor de voz: visible siempre… menos en modo calma (carga sensorial). */}
      {!modoCalma ? (
        <div
          className="bg-acento-suave relative w-6 overflow-hidden rounded-full"
          data-testid="medidor"
          aria-hidden="true"
        >
          <div
            ref={medidorRef}
            className="bg-acento absolute inset-x-0 bottom-0 h-full origin-bottom rounded-full"
            style={{ transform: "scaleY(0.02)" }}
          />
        </div>
      ) : null}
    </div>
  );
}
