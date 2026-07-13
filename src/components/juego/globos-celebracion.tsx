// LA CELEBRACIÓN DE LA PALABRA: una bandada de globos que sube y se va.
//
// La dispara SIEMPRE el padre (ADR 009) — la app no oye palabras. Es distinta de la de "hubo voz"
// a propósito: decir la palabra merece más que un brillo.
//
// Diseñada para él (COGA, regla dura 6): sube UNA vez y termina (~1,6 s), no hay bucle, no hay
// parpadeo, no hay estridencia. Con "reducir animaciones" no se muestra (globals.css) y el borde
// verde + el texto siguen contando la buena noticia: la celebración nunca depende del movimiento.

import { Globo } from "@/components/iconos";

/** Bandada determinista: mismos globos siempre. Nada de aleatorio (el azar no se puede testear). */
const GLOBOS = [
  { izquierda: 6, deriva: -18, giro: -8, vuelo: 1500, espera: 0, alto: 44 },
  { izquierda: 22, deriva: 14, giro: 6, vuelo: 1700, espera: 120, alto: 56 },
  { izquierda: 38, deriva: -10, giro: -5, vuelo: 1400, espera: 60, alto: 38 },
  { izquierda: 54, deriva: 20, giro: 9, vuelo: 1800, espera: 200, alto: 52 },
  { izquierda: 70, deriva: -14, giro: -7, vuelo: 1550, espera: 90, alto: 42 },
  { izquierda: 86, deriva: 12, giro: 5, vuelo: 1650, espera: 30, alto: 48 },
] as const;

const COLORES = [
  "var(--color-kid-peach)",
  "var(--color-kid-sage)",
  "var(--color-kid-sky)",
  "var(--color-kid-yellow)",
];

export function GlobosCelebracion() {
  return (
    <div
      className="globos-celebracion pointer-events-none absolute inset-0 z-10 overflow-visible"
      aria-hidden="true"
      data-testid="globos-celebracion"
    >
      {GLOBOS.map((globo, i) => (
        <span
          key={globo.izquierda}
          className="globo-sube absolute bottom-4"
          style={
            {
              left: `${globo.izquierda}%`,
              "--deriva": `${globo.deriva}px`,
              "--giro": `${globo.giro}deg`,
              "--vuelo": `${globo.vuelo}ms`,
              "--espera": `${globo.espera}ms`,
            } as React.CSSProperties
          }
        >
          <Globo
            className="w-auto"
            style={{ height: `${globo.alto}px` }}
            relleno={COLORES[i % COLORES.length]}
          />
        </span>
      ))}
    </div>
  );
}
