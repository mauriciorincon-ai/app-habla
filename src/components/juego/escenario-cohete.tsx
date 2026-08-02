"use client";

// El escenario del cohete: sube cuando la voz del niño SUBE de tono, baja cuando baja.
// Se pinta a 60 fps desde los refs del medidor (cero re-renders de React aquí dentro).
//
// No exige ninguna palabra (ADR 005): una vocal estirada como una sirena basta. Y el ruido de la
// casa no lo mueve — sin voz confiable no hay tono, y sin tono el cohete se queda quieto (jamás
// cae por silencio: no hay castigo).
//
// HITOS (gate S4, ADR-013): el cohete ya no tiene meta que cierre el juego — cada subida-y-bajada
// real de la voz es un HITO: estalla el confeti y una CAPA DE CIELO pasa hacia abajo (el mundo
// corre: se siente el ascenso, como por la ventanilla). La posición del cohete sigue siendo el
// TONO EN VIVO — jamás acumula altura que no está sonando: la posición no miente.
//
// Modo calma: sin medidor, sin hitos ni confeti; el cohete simplemente flota con su voz.

import { useEffect, useRef } from "react";
import { Cohete } from "@/components/iconos";
import { ConfetiVuelta } from "./confeti-vuelta";
import type { MedidasVivas } from "./use-voice-session";

/**
 * Constantes del planeo (gate S4, hallazgo F8): el tono llega a saltos (~31 estimaciones/s y la
 * voz brinca de nota), así que la persecución con voz es más larga que la del globo (200 vs
 * 140 ms) para absorberlos sin sentirse "con retraso". En pausa el cohete no cae (el objetivo se
 * congela), pero si el tono reaparece lejos, re-engancha suave en vez de saltar.
 */
const PERSECUCION_CON_VOZ_MS = 200;
const PERSECUCION_EN_PAUSA_MS = 480;

type Props = {
  medidas: MedidasVivas;
  /** Subidas-y-bajadas completadas: cada una nueva estalla su confeti y pasa su capa de cielo. */
  hito: number;
  modoCalma: boolean;
  invitando: boolean;
};

/**
 * La capa de cielo que pasa (ADR-013): nubes y estrellas FIJAS que cruzan hacia abajo UNA vez
 * (~1,4 s) cuando el cohete gana un hito. Determinista (el azar no se puede testear), sin bucle
 * ni parpadeo; con "reducir animaciones" no se muestra (globals.css) y el contador sigue
 * contando el logro.
 */
function CapaDeCielo() {
  return (
    <div
      className="capa-cielo pointer-events-none absolute inset-0"
      aria-hidden="true"
      data-testid="capa-cielo"
    >
      <span className="bg-kid-sky absolute top-[-18%] left-[8%] h-5 w-24 rounded-full opacity-80" />
      <span className="bg-kid-sky absolute top-[-26%] left-[55%] h-4 w-20 rounded-full opacity-60" />
      <span className="bg-kid-sky absolute top-[-10%] left-[30%] h-3.5 w-14 rounded-full opacity-70" />
      <span className="bg-kid-yellow absolute top-[-22%] left-[78%] h-2 w-2 rounded-full opacity-70" />
      <span className="bg-kid-yellow absolute top-[-8%] left-[68%] h-1.5 w-1.5 rounded-full opacity-60" />
    </div>
  );
}

export function EscenarioCohete({
  medidas,
  hito,
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
        // La altura del cohete ES el tono (escala musical, 0..1 desde la voz de quien juega).
        const objetivo = -medidas.alturaPitch() * (alto - cohete.offsetHeight);
        // Persecución del objetivo (F8): mismo patrón de planeo del globo. Solo persigue, nunca
        // se adelanta — la posición jamás miente.
        const persecucionMs = medidas.vozActiva()
          ? PERSECUCION_CON_VOZ_MS
          : PERSECUCION_EN_PAUSA_MS;
        const suavizado = 1 - Math.exp(-deltaMs / persecucionMs);
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

        {/* El hito: `key` re-monta el confeti y la capa con cada subida-y-bajada nueva — corren
            UNA vez por logro y quedan quietos hasta el siguiente (en calma no hay hitos). */}
        {!modoCalma && hito > 0 ? <CapaDeCielo key={`capa-${hito}`} /> : null}
        {!modoCalma && hito > 0 ? (
          <ConfetiVuelta key={`confeti-${hito}`} centrado />
        ) : null}

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
        </div>
      ) : null}
    </div>
  );
}
