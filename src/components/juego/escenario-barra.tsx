"use client";

// El escenario de «Fuerte y suave» (S12, ADR-024): una columna que sube con la voz fuerte y baja con
// la suave, medida contra el ruido del cuarto. NUNCA señala un volumen «correcto»: no hay zona verde,
// ni meta, ni línea que se deba alcanzar. Debajo, la palabra «suave», «fuerte» o «en silencio» y un
// símbolo de forma distinta por nivel: el color nunca va solo.
//
// Se pinta a 60 fps desde los refs del medidor; el texto del nivel es lo único que pasa por React
// (cambia pocas veces por segundo y lo lee el lector de pantalla con `aria-live="polite"`).
//
// «Reducir animaciones»: la columna salta de una altura a otra sin deslizarse. Modo calma: sin el
// conteo de cambios ni confeti (lo decide el juego); la columna sigue la voz.

import { useEffect, useRef } from "react";
import { useT } from "@/lib/idioma/estado";
import { fuerteSuave } from "@/lib/idioma/textos/voz-juegos";
import { ConfetiVuelta } from "./confeti-vuelta";
import type { MedidasVivas } from "./use-voice-session";

const SUAVIZADO_MS = 160;

type Props = {
  medidas: MedidasVivas;
  /** Cambios contados: cada nuevo estalla su confeti. */
  hito: number;
  modoCalma: boolean;
  invitando: boolean;
};

function sinMovimiento(): boolean {
  return document.documentElement.dataset.reducirAnimacion === "true";
}

/** Un símbolo por nivel (forma distinta, sin color): punto, onda baja, onda alta. */
function Simbolo({ nivel }: { nivel: "silencio" | "suave" | "fuerte" }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" focusable="false">
      {nivel === "silencio" ? (
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      ) : nivel === "suave" ? (
        <path d="M4 12c2-3 4-3 8 0s6 3 8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M4 18c3-12 5-12 8 0s5 12 8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function EscenarioBarra({ medidas, hito, modoCalma, invitando }: Props) {
  const tx = useT();
  const columnaRef = useRef<HTMLDivElement | null>(null);
  const alturaRef = useRef({ y: 0, t: 0 });
  // Se lee en cada render (el juego re-renderiza con cada TICK, ~10/s).
  const nivel = medidas.nivelVoz();
  const palabra =
    nivel === "fuerte" ? fuerteSuave.fuerte : nivel === "suave" ? fuerteSuave.suave : fuerteSuave.silencio;

  useEffect(() => {
    let id = 0;
    const pintar = (t: number) => {
      const a = alturaRef.current;
      const deltaMs = a.t === 0 ? 16 : Math.min(100, t - a.t);
      a.t = t;
      const objetivo = medidas.alturaVoz();
      if (sinMovimiento()) a.y = objetivo;
      else a.y += (objetivo - a.y) * (1 - Math.exp(-deltaMs / SUAVIZADO_MS));
      if (columnaRef.current) {
        columnaRef.current.style.transform = `scaleY(${Math.max(0.06, a.y)})`;
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [medidas]);

  return (
    <div className="flex w-full flex-col gap-3" data-testid="escenario">
      <div
        className="bg-superficie relative flex h-64 items-end justify-center overflow-hidden rounded-3xl sm:h-80"
        role="img"
        aria-label={tx(fuerteSuave.barraEtiqueta)}
      >
        <div className="bg-kid-sage/30 absolute inset-x-0 bottom-0 h-8" aria-hidden="true" />
        {!modoCalma && hito > 0 ? <ConfetiVuelta key={`confeti-${hito}`} centrado /> : null}
        <div
          ref={columnaRef}
          className="bg-kid-sky border-kid-ink relative mb-8 h-[78%] w-28 origin-bottom rounded-3xl border-2 will-change-transform sm:w-36"
          style={{ transform: "scaleY(0.06)" }}
          data-testid="columna-voz"
        />
        {invitando ? (
          <p
            className="bg-fondo/90 text-tinta absolute inset-x-4 top-4 rounded-2xl p-3 text-center text-lg"
            data-testid="invitacion"
          >
            {tx(fuerteSuave.invitacion)}
          </p>
        ) : null}
      </div>
      <p
        className="text-tinta flex items-center justify-center gap-2 text-xl font-medium"
        data-testid="nivel-voz"
        data-nivel={nivel}
        aria-live="polite"
      >
        <Simbolo nivel={nivel} />
        {tx(palabra)}
      </p>
    </div>
  );
}
