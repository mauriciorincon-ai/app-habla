"use client";

// El protagonista de la escena (S14, ADR-026): UNO de SUS temas (el selector `suMundo` decide cuál,
// rotando por fecha y por juego) dibujado como compañía de la escena. VISTE, jamás cambia la mecánica:
// no se mueve con la voz, no puntúa y no esconde el objeto que sí responde.
//
// El dibujo se carga con import() dinámico, uno por tema: solo viaja el del tema activo y el
// presupuesto de script (≤ 354 KB, Lighthouse) no se mueve. Sin perfil no hay protagonista y la escena
// es la de siempre. Nombre accesible en los dos idiomas; el color nunca va solo (forma propia por tema).

import { lazy, Suspense, type ComponentType } from "react";
import { useT } from "@/lib/idioma/estado";
import { protagonistaNombre } from "@/lib/idioma/textos/su-mundo";
import type { JuegoSuMundo } from "@/lib/su-mundo/su-mundo";
import type { Tema } from "@/lib/storage/temas";
import { useSuMundo } from "./use-su-mundo";

type Dibujo = ComponentType<{ className?: string }>;

const DIBUJOS: Record<Tema, React.LazyExoticComponent<Dibujo>> = {
  animales: lazy(() => import("./protagonistas/animales")),
  carros: lazy(() => import("./protagonistas/carros")),
  espacio: lazy(() => import("./protagonistas/espacio")),
  dinosaurios: lazy(() => import("./protagonistas/dinosaurios")),
  musica: lazy(() => import("./protagonistas/musica")),
  mar: lazy(() => import("./protagonistas/mar")),
};

export function Protagonista({
  juego,
  className,
}: {
  juego: JuegoSuMundo;
  /** Posición y tamaño dentro de la escena (el padre decide dónde cabe). */
  className?: string;
}) {
  const tx = useT();
  const { protagonista } = useSuMundo(juego);
  if (!protagonista) return null;
  const Dibujo = DIBUJOS[protagonista];
  return (
    <div
      className={className}
      role="img"
      aria-label={tx(protagonistaNombre[protagonista])}
      data-testid="protagonista"
      data-tema={protagonista}
    >
      <Suspense fallback={null}>
        <Dibujo className="h-full w-full" />
      </Suspense>
    </div>
  );
}
