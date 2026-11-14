// When does the adult see «maybe they said X»? (S11, ADR-023). PURE.
//
// Only when the recognizer heard THE ROUND'S word with enough confidence. Any other word, "[unk]" or
// low confidence shows nothing: the app never says «no» and never shows a different word (hard rule 3:
// automatic recognition is shown as «maybe», never as a verdict; the adult judges).

import { normalizar } from "./gramatica";

/**
 * Minimum confidence for a «maybe». Starting value, written in ADR-023 next to the measurement; the
 * owner decides it in the rehearsal (it is not tuned silently).
 */
export const UMBRAL_QUIZAS = 0.6;

export type Oido = { palabra: string; conf: number };

export function quizasDijo(
  oido: Oido | null,
  palabraDeLaRonda: string,
  umbral: number = UMBRAL_QUIZAS,
): boolean {
  if (!oido) return false;
  if (!Number.isFinite(oido.conf) || oido.conf < umbral) return false;
  return normalizar(oido.palabra) === normalizar(palabraDeLaRonda);
}

/** For a pair of twin words: the side the recognizer probably heard, or null. */
export function quizasLado(
  oido: Oido | null,
  par: { a: string; b: string },
  umbral: number = UMBRAL_QUIZAS,
): "a" | "b" | null {
  if (quizasDijo(oido, par.a, umbral)) return "a";
  if (quizasDijo(oido, par.b, umbral)) return "b";
  return null;
}
