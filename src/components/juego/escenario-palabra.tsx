"use client";

// El escenario de palabra↔objeto: el dibujo grande + su palabra escrita.
//
// LA GARANTÍA (ADR 005): el dibujo se enciende con CUALQUIER vocalización sostenida ~250 ms.
// No se compara con nada, no se reconoce nada, no se evalúa nada. La app mide que hubo voz —
// punto. Si el niño dijo la palabra, quien lo sabe es el padre.
//
// El pictograma se sirve desde el repo (ARASAAC, CC BY-NC-SA) con lazy-loading: cero red en
// runtime (el e2e de tráfico lo vigila).

import Image from "next/image";
import { useEffect, useRef } from "react";
import { rutaPictograma, type Pictograma } from "@content/pictogramas";
import type { MedidasVivas } from "./use-voice-session";

/** Voz sostenida mínima para encender el dibujo. Corto a propósito: un intento basta. */
const MS_PARA_ENCENDER = 250;

type Props = {
  picto: Pictograma;
  medidas: MedidasVivas;
  encendido: boolean;
  invitando: boolean;
  onVocalizar: () => void;
};

export function EscenarioPalabra({
  picto,
  medidas,
  encendido,
  invitando,
  onVocalizar,
}: Props) {
  const auraRef = useRef<HTMLDivElement | null>(null);
  const avisarRef = useRef(onVocalizar);
  useEffect(() => {
    avisarRef.current = onVocalizar;
  }, [onVocalizar]);

  useEffect(() => {
    let id = 0;
    const pintar = () => {
      // El aura crece con la voz: feedback inmediato, aunque todavía no alcance a "encender".
      if (auraRef.current) {
        const escala = 1 + medidas.nivel() * 0.12;
        auraRef.current.style.transform = `scale(${escala})`;
      }
      // Cualquier vocalización sostenida cuenta — sin importar QUÉ dijo.
      if (medidas.sostenidoMs() >= MS_PARA_ENCENDER) {
        avisarRef.current();
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [medidas]);

  return (
    <div
      className="flex flex-col items-center gap-4"
      data-testid="escenario"
      data-encendido={encendido}
    >
      <div className="relative flex items-center justify-center">
        {/* El aura responde a su voz en tiempo real (y se queda encendida al lograrlo). */}
        <div
          ref={auraRef}
          className={[
            "absolute inset-0 rounded-[2rem] transition-colors duration-300",
            encendido ? "bg-celebracion/40" : "bg-acento-suave/60",
          ].join(" ")}
          aria-hidden="true"
        />
        <div
          className={[
            "bg-superficie relative rounded-[2rem] border-4 p-4 transition-colors duration-300 sm:p-6",
            encendido ? "border-celebracion-fuerte" : "border-borde",
          ].join(" ")}
          data-testid="picto"
        >
          <Image
            src={rutaPictograma(picto)}
            alt={picto.palabra}
            width={500}
            height={500}
            loading="lazy"
            className="h-40 w-40 object-contain sm:h-56 sm:w-56"
          />
        </div>
      </div>

      {/* La palabra escrita, grande: el nombre vive CON la cosa (asociación palabra↔objeto). */}
      <p
        className="font-display text-5xl sm:text-6xl"
        data-testid="palabra-del-picto"
      >
        {picto.palabra}
      </p>

      {encendido ? (
        <p
          className="text-celebracion-fuerte text-lg font-medium"
          role="status"
        >
          ¡Le salió la voz! Lo intentó.
        </p>
      ) : invitando ? (
        <p
          className="bg-fondo/90 text-tinta rounded-2xl p-3 text-center text-lg"
          data-testid="invitacion"
        >
          El dibujo espera su voz… nómbralo tú otra vez y espera.
        </p>
      ) : (
        <p className="text-tinta-suave text-lg">
          Cualquier sonido lo enciende. Nómbralo tú y espera.
        </p>
      )}
    </div>
  );
}
