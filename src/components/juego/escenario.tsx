"use client";

// El escenario del niño: el globo avanza SOLO mientras su voz se sostiene.
// Se pinta a 60 fps desde los refs del medidor (cero re-renders de React aquí dentro).
//
// VUELTAS (gate S4, hallazgo E6): el globo ya no tiene meta que cierre el juego — cada
// `hitoMs` de voz acumulada es UNA VUELTA: cruza la línea, reaparece entrando por la izquierda
// y sigue volando, las veces que sean. El intento termina cuando el padre toca "Ya jugamos".
//
// Modo calma: sin medidor, sin línea de vuelta — pero el globo NUNCA se apaga: flota EN EL
// CENTRO (gate S4: pegado al borde izquierdo parecía que el juego no había empezado), sube
// mientras hay voz real y baja despacio en el silencio, como un globo de verdad.

import { useEffect, useRef } from "react";
import { Globo } from "@/components/iconos";
import type { MedidasVivas } from "./use-voice-session";

/** En calma: ms de voz sostenida para que el globo llegue a su altura máxima. */
const SUBIDA_CALMA_MS = 3500;
/** En calma: ms de silencio para que baje del todo — mucho más lento que la subida. */
const BAJADA_CALMA_MS = 9000;

/**
 * Constantes del planeo (gate S4, hallazgo E5): con voz, el globo persigue su objetivo rápido;
 * en la pausa NO frena en seco — la persecución se vuelve lenta y el globo desacelera suave,
 * como algo que de verdad flota. Solo movimiento: la métrica sigue contando únicamente voz real.
 */
const PERSECUCION_CON_VOZ_MS = 140;
const PERSECUCION_EN_PAUSA_MS = 480;

type Props = {
  medidas: MedidasVivas;
  /** ms de voz acumulada que completan UNA vuelta (no cierran nada: se da la vuelta y se sigue). */
  hitoMs: number;
  modoCalma: boolean;
  /** Invitación amable tras un rato en silencio (jamás un regaño). */
  invitando: boolean;
};

export function Escenario({ medidas, hitoMs, modoCalma, invitando }: Props) {
  const escenarioRef = useRef<HTMLDivElement | null>(null);
  const globoRef = useRef<HTMLDivElement | null>(null);
  const medidorRef = useRef<HTMLDivElement | null>(null);
  // Estado del vuelo que sobrevive a los cambios de modo: alternar calma no teletransporta
  // el globo, lo deja planear hacia su nuevo objetivo. `vuelta` detecta el cruce de la línea.
  const vueloRef = useRef({ x: 0, y: 0, altura: 0, t: 0, vuelta: 0 });

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
          // Sin vueltas: el globo no viaja — flota en el CENTRO del cielo (gate S4). La voz lo
          // sube, el silencio lo baja suave.
          vuelo.altura = medidas.vozActiva()
            ? Math.min(1, vuelo.altura + deltaMs / SUBIDA_CALMA_MS)
            : Math.max(0, vuelo.altura - deltaMs / BAJADA_CALMA_MS);
          xObjetivo = ancho * 0.44 - globo.offsetWidth / 2;
          yObjetivo = -(vuelo.altura * alto * 0.42 + nivel * alto * 0.08);
        } else {
          vuelo.altura = 0;
          const total = medidas.sostenidoMs();
          const vuelta = Math.floor(total / hitoMs);
          const progreso = (total % hitoMs) / hitoMs;
          const recorrido = Math.max(0, ancho * 0.82 - globo.offsetWidth);

          if (vuelta > vuelo.vuelta) {
            // Cruzó la línea: se descuenta el recorrido para que el globo "reaparezca" entrando
            // desde fuera del borde izquierdo y siga volando hacia adelante — jamás en reversa.
            vuelo.x -= recorrido + globo.offsetWidth;
            vuelo.vuelta = vuelta;
          } else if (vuelta < vuelo.vuelta) {
            // Intento nuevo (otra vez / recalibrar): el vuelo arranca de cero, sin arrastres.
            vuelo.x = 0;
            vuelo.vuelta = vuelta;
          }

          xObjetivo = progreso * recorrido;
          yObjetivo = -nivel * alto * 0.35;
        }

        // Persecución del objetivo: vuelo continuo a 60 fps aunque el medidor emita a ~31/s.
        // En pausa la persecución se alarga (E5): el globo desacelera suave en vez de frenar en
        // seco — y como solo persigue (nunca se adelanta), la posición jamás miente.
        const persecucionMs = medidas.vozActiva()
          ? PERSECUCION_CON_VOZ_MS
          : PERSECUCION_EN_PAUSA_MS;
        const suavizado = 1 - Math.exp(-deltaMs / persecucionMs);
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
  }, [medidas, hitoMs, modoCalma]);

  return (
    <div className="flex w-full items-stretch gap-4" data-testid="escenario">
      <div
        ref={escenarioRef}
        className="bg-superficie relative h-64 flex-1 overflow-hidden rounded-3xl sm:h-80"
      >
        {/* Línea de vuelta: cruzarla completa una vuelta y el globo sigue (en calma no existe). */}
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
