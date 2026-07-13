// LA CELEBRACIÓN DE LA PALABRA: una bandada de globos que sube y se va.
//
// La dispara SIEMPRE el padre (ADR 009) — la app no oye palabras. Es distinta de la de "hubo voz"
// a propósito: decir la palabra merece más que un brillo.
//
// Diseñada para él (COGA, regla dura 6): sube UNA vez y termina (~1,6 s), no hay bucle, no hay
// parpadeo, no hay estridencia. Con "reducir animaciones" no se muestra (globals.css) y el borde
// verde + el texto siguen contando la buena noticia: la celebración nunca depende del movimiento.

import { Globo } from "@/components/iconos";

/**
 * Bandada determinista: mismos globos siempre. Nada de aleatorio (el azar no se puede testear).
 * Grandes y saturados por pedido del usuario en el gate (2026-07-12): la celebración de la palabra
 * tiene que SENTIRSE, no insinuarse. El sosiego se cuida por otro lado — sube una sola vez y se va.
 */
const GLOBOS = [
  { izquierda: -4, deriva: -26, giro: -9, vuelo: 1700, espera: 0, alto: 96 },
  { izquierda: 16, deriva: 18, giro: 7, vuelo: 2000, espera: 140, alto: 118 },
  { izquierda: 36, deriva: -14, giro: -6, vuelo: 1600, espera: 60, alto: 84 },
  { izquierda: 56, deriva: 26, giro: 10, vuelo: 2100, espera: 220, alto: 110 },
  { izquierda: 74, deriva: -20, giro: -8, vuelo: 1800, espera: 100, alto: 92 },
  { izquierda: 90, deriva: 16, giro: 6, vuelo: 1900, espera: 40, alto: 104 },
] as const;

const COLORES = [
  "var(--color-fiesta-coral)",
  "var(--color-fiesta-verde)",
  "var(--color-fiesta-cielo)",
  "var(--color-fiesta-sol)",
  "var(--color-fiesta-uva)",
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
