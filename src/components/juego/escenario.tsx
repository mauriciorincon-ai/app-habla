"use client";

// El escenario del niño: el globo avanza SOLO mientras su voz se sostiene.
// Se pinta a 60 fps desde los refs del medidor (cero re-renders de React aquí dentro).
//
// Modo calma: sin medidor, sin meta ni línea de llegada — pero el globo NUNCA se apaga:
// sube mientras hay voz real (el mismo veredicto con histéresis del juego) y baja despacio
// en el silencio, como un globo de verdad. Hallazgo del gate (2026-07-12): la versión
// anterior congelaba el avance en 0 y se sentía como pausar el juego.

import { useEffect, useRef } from "react";
import { Globo } from "@/components/iconos";
import type { MedidasVivas } from "./use-voice-session";

/** En calma: ms de voz sostenida para que el globo llegue a su altura máxima. */
const SUBIDA_CALMA_MS = 3500;
/** En calma: ms de silencio para que baje del todo — mucho más lento que la subida. */
const BAJADA_CALMA_MS = 9000;

type Props = {
  medidas: MedidasVivas;
  metaMs: number;
  modoCalma: boolean;
  /** Invitación amable tras un rato en silencio (jamás un regaño). */
  invitando: boolean;
};

export function Escenario({ medidas, metaMs, modoCalma, invitando }: Props) {
  const escenarioRef = useRef<HTMLDivElement | null>(null);
  const globoRef = useRef<HTMLDivElement | null>(null);
  const medidorRef = useRef<HTMLDivElement | null>(null);
  // Estado del vuelo que sobrevive a los cambios de modo: alternar calma no teletransporta
  // el globo, lo deja planear hacia su nuevo objetivo.
  const vueloRef = useRef({ x: 0, y: 0, altura: 0, t: 0 });

  useEffect(() => {
    let id = 0;
    const pintar = (t: number) => {
      const vuelo = vueloRef.current;
      const deltaMs = vuelo.t === 0 ? 16 : Math.min(100, t - vuelo.t);
      vuelo.t = t;

      const nivel = medidas.nivel();
      const escenario = escenarioRef.current;
      const globo = globoRef.current;
      if (escenario && globo) {
        // En píxeles del ESCENARIO (translate con % sería relativo al globo, no al cielo).
        const ancho = escenario.clientWidth;
        const alto = escenario.clientHeight;
        let xObjetivo = 0;
        let yObjetivo = 0;

        if (modoCalma) {
          // Sin meta: el globo no viaja — flota. La voz lo sube, el silencio lo baja suave.
          vuelo.altura = medidas.vozActiva()
            ? Math.min(1, vuelo.altura + deltaMs / SUBIDA_CALMA_MS)
            : Math.max(0, vuelo.altura - deltaMs / BAJADA_CALMA_MS);
          yObjetivo = -(vuelo.altura * alto * 0.42 + nivel * alto * 0.08);
        } else {
          vuelo.altura = 0;
          const avance = Math.min(1, medidas.sostenidoMs() / metaMs);
          // Con avance completo, el globo alcanza la línea de llegada (right 12%).
          xObjetivo = avance * Math.max(0, ancho * 0.82 - globo.offsetWidth);
          yObjetivo = -nivel * alto * 0.35;
        }

        // Interpolación hacia el objetivo: vuelo continuo a 60 fps aunque el medidor emita
        // a ~31/s, y sin saltos al alternar el modo calma o al reiniciar el intento.
        const suavizado = 1 - Math.exp(-deltaMs / 140);
        vuelo.x += (xObjetivo - vuelo.x) * suavizado;
        vuelo.y += (yObjetivo - vuelo.y) * suavizado;
        globo.style.transform = `translate(${vuelo.x}px, ${vuelo.y}px)`;
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
      <div
        ref={escenarioRef}
        className="bg-superficie relative h-64 flex-1 overflow-hidden rounded-3xl sm:h-80"
      >
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

        <div className="absolute bottom-10 left-[6%] h-32 w-24">
          <div
            ref={globoRef}
            className="h-full w-full will-change-transform"
            data-testid="globo"
          >
            <Globo className="h-full w-full" />
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
