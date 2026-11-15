"use client";

// El escenario de «Soplar» (S12, ADR-024): el molino gira SOLO mientras el detector oye aire sin voz.
// Se pinta a 60 fps desde los refs del medidor (cero re-renders aquí dentro). La posición no miente:
// el molino no gira por el ruido de la casa ni por una vocal —el detector no los cuenta—, y al dejar
// de soplar frena con calma (sin caída, sin castigo).
//
// «Reducir animaciones»: el molino no gira continuo; avanza un cuarto de vuelta, de golpe, por cada
// soplo contado. Cambia la propiedad, no la forma del árbol.
//
// Modo calma: sin medidor de fuerza ni confeti; el molino simplemente gira con el aire.

import { useEffect, useRef } from "react";
import { Molino } from "@/components/iconos";
import { useT } from "@/lib/idioma/estado";
import { soplar } from "@/lib/idioma/textos/voz-juegos";
import { ConfetiVuelta } from "./confeti-vuelta";
import type { MedidasVivas } from "./use-voice-session";

/** Grados por segundo a fuerza completa; y lo que tarda en frenar o arrancar (suavizado). */
const GRADOS_POR_S = 540;
const INERCIA_MS = 260;

type Props = {
  medidas: MedidasVivas;
  /** Soplos contados: cada nuevo estalla su confeti. */
  hito: number;
  modoCalma: boolean;
  invitando: boolean;
};

function sinMovimiento(): boolean {
  return document.documentElement.dataset.reducirAnimacion === "true";
}

export function EscenarioMolino({ medidas, hito, modoCalma, invitando }: Props) {
  const tx = useT();
  const aspasRef = useRef<SVGGElement | null>(null);
  const medidorRef = useRef<HTMLDivElement | null>(null);
  const giroRef = useRef({ angulo: 0, velocidad: 0, t: 0 });

  useEffect(() => {
    let id = 0;
    const pintar = (t: number) => {
      const giro = giroRef.current;
      const deltaMs = giro.t === 0 ? 16 : Math.min(100, t - giro.t);
      giro.t = t;

      const fuerza = medidas.soplando() ? Math.max(0.25, medidas.fuerzaSoplo()) : 0;
      if (sinMovimiento()) {
        // Un cuarto de vuelta por soplo contado, sin continuidad.
        giro.angulo = medidas.soplos() * 90;
        giro.velocidad = 0;
      } else {
        const suavizado = 1 - Math.exp(-deltaMs / INERCIA_MS);
        giro.velocidad += (fuerza * GRADOS_POR_S - giro.velocidad) * suavizado;
        giro.angulo = (giro.angulo + (giro.velocidad * deltaMs) / 1000) % 360;
      }
      aspasRef.current?.style.setProperty("transform", `rotate(${giro.angulo}deg)`);

      if (medidorRef.current) {
        medidorRef.current.style.transform = `scaleY(${Math.max(0.02, medidas.soplando() ? medidas.fuerzaSoplo() : 0)})`;
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [medidas]);

  return (
    <div className="flex w-full items-stretch gap-4" data-testid="escenario">
      <div
        className="bg-superficie relative h-64 flex-1 overflow-hidden rounded-3xl sm:h-80"
        role="img"
        aria-label={tx(soplar.molinoEtiqueta)}
      >
        <div
          className="bg-kid-sage/30 absolute inset-x-0 bottom-0 h-10"
          aria-hidden="true"
        />
        {!modoCalma && hito > 0 ? (
          <ConfetiVuelta key={`confeti-${hito}`} centrado />
        ) : null}

        <div className="absolute bottom-6 left-1/2 h-44 w-28 -translate-x-1/2 sm:h-56 sm:w-36">
          <Molino
            className="h-full w-full"
            aspasRef={aspasRef}
          />
        </div>
        {/* El atributo de prueba vive en un nodo propio: el SVG es decorativo. */}
        <span className="sr-only" data-testid="molino" data-soplando={medidas.soplando()} />

        {invitando ? (
          <p
            className="bg-fondo/90 text-tinta absolute inset-x-4 top-4 rounded-2xl p-3 text-center text-lg"
            data-testid="invitacion"
          >
            {tx(soplar.invitacion)}
          </p>
        ) : null}
      </div>

      {/* Fuerza del aire sobre el piso del cuarto — visible siempre… menos en modo calma. */}
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
