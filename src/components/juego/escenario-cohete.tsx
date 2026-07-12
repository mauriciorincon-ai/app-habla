"use client";

// El escenario del cohete: sube cuando la voz del niño SUBE de tono, baja cuando baja.
// Se pinta a 60 fps desde los refs del medidor (cero re-renders de React aquí dentro).
//
// No exige ninguna palabra (ADR 005): una vocal estirada como una sirena basta. Y el ruido de la
// casa no lo mueve — sin voz confiable no hay tono, y sin tono el cohete se queda quieto (jamás
// cae por silencio: no hay castigo).
//
// Modo calma: sin medidor y sin meta; el cohete simplemente flota con su voz.

import { useEffect, useRef } from "react";
import { Cohete } from "@/components/iconos";
import type { MedidasVivas } from "./use-voice-session";

type Props = {
  medidas: MedidasVivas;
  /** Inversiones necesarias para celebrar (null en modo calma: sin meta). */
  meta: number | null;
  modoCalma: boolean;
  invitando: boolean;
};

export function EscenarioCohete({
  medidas,
  meta,
  modoCalma,
  invitando,
}: Props) {
  const cieloRef = useRef<HTMLDivElement | null>(null);
  const coheteRef = useRef<HTMLDivElement | null>(null);
  const medidorRef = useRef<HTMLDivElement | null>(null);
  const vueloRef = useRef({ y: 0, t: 0 });

  useEffect(() => {
    let id = 0;
    const pintar = (t: number) => {
      const vuelo = vueloRef.current;
      const deltaMs = vuelo.t === 0 ? 16 : Math.min(100, t - vuelo.t);
      vuelo.t = t;

      const cielo = cieloRef.current;
      const cohete = coheteRef.current;
      if (cielo && cohete) {
        const alto = cielo.clientHeight;
        // La altura del cohete ES el tono (escala musical, 0..1 dentro del rango infantil).
        const objetivo = -medidas.alturaPitch() * (alto - cohete.offsetHeight);
        // Interpolación: el vuelo es continuo a 60 fps aunque el tono llegue a ~31 frames/s.
        const suavizado = 1 - Math.exp(-deltaMs / 120);
        vuelo.y += (objetivo - vuelo.y) * suavizado;
        cohete.style.transform = `translateY(${vuelo.y}px)`;
      }

      if (medidorRef.current) {
        medidorRef.current.style.transform = `scaleY(${Math.max(
          0.02,
          medidas.alturaPitch(),
        )})`;
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [medidas]);

  return (
    <div className="flex w-full items-stretch gap-4" data-testid="escenario">
      <div
        ref={cieloRef}
        className="bg-superficie relative h-64 flex-1 overflow-hidden rounded-3xl sm:h-80"
      >
        {/* Suelo */}
        <div
          className="bg-kid-sage/30 absolute inset-x-0 bottom-0 h-10"
          aria-hidden="true"
        />

        {/* Estrellas: quietas y discretas (COGA — nada que distraiga del juego). */}
        <div aria-hidden="true">
          <span className="bg-kid-yellow absolute top-[12%] left-[18%] h-2 w-2 rounded-full opacity-70" />
          <span className="bg-kid-yellow absolute top-[24%] right-[22%] h-1.5 w-1.5 rounded-full opacity-60" />
          <span className="bg-kid-yellow absolute top-[8%] right-[38%] h-1.5 w-1.5 rounded-full opacity-50" />
        </div>

        <div className="absolute bottom-10 left-1/2 h-32 w-20 -translate-x-1/2">
          <div
            ref={coheteRef}
            className="h-full w-full will-change-transform"
            data-testid="cohete"
          >
            <Cohete className="h-full w-full" />
          </div>
        </div>

        {invitando ? (
          <p
            className="bg-fondo/90 text-tinta absolute inset-x-4 bottom-14 rounded-2xl p-3 text-center text-lg"
            data-testid="invitacion"
          >
            El cohete espera tu voz… ¿hacemos{" "}
            <span className="font-display italic">aaaAAAaaa</span> juntos?
          </p>
        ) : null}
      </div>

      {/* Medidor de TONO (no de volumen): visible siempre… menos en modo calma. */}
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
          {meta !== null ? (
            <span className="bg-celebracion absolute inset-x-0 top-[10%] h-0.5" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
