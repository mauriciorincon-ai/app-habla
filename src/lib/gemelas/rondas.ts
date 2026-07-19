// Motor de PALABRAS GEMELAS (Outcome 3) — PURO: sin DOM, sin audio, sin storage.
//
// El juego NO usa micrófono: el niño dice una de las dos palabras y el PADRE marca cuál oyó
// (ADR-009). Aquí no se juzga "correcto/incorrecto" — solo se arma la secuencia de rondas y se
// cuenta la participación honesta. Lo que el padre marcó se registra aparte (ver storage/schemas).

import { barajar } from "@/lib/barajar";
import {
  PARES_GEMELOS,
  parJugableEn,
  type ParGemelo,
} from "@content/pares-gemelos";
import type { Etapa } from "@content/schema";
import type { Metrica } from "@/lib/session-flow";

/** Cuál lado del par marcó el padre en una ronda (o `null` si la saltó: el niño no intentó). */
export type Marca = "a" | "b" | null;

/** Los pares jugables en la etapa activa (gemelas exige palabras → nunca en sonidos-e-intentos). */
export function paresParaEtapa(
  etapa: Etapa,
  pares: readonly ParGemelo[] = PARES_GEMELOS,
): ParGemelo[] {
  return pares.filter((p) => parJugableEn(p, etapa));
}

/**
 * La secuencia de rondas de una sesión: los pares jugables, barajados por semilla (orden variado
 * pero reproducible), acotados a `cantidad`. Si no hay pares para la etapa, arreglo vacío (la UI
 * lo dice honesto: "las gemelas llegan cuando empiece a decir palabras").
 */
export function secuenciaDeRondas(
  etapa: Etapa,
  semilla: number,
  cantidad = 6,
  pares: readonly ParGemelo[] = PARES_GEMELOS,
): ParGemelo[] {
  const jugables = paresParaEtapa(etapa, pares);
  return barajar(jugables, semilla).slice(0, Math.max(0, cantidad));
}

/**
 * La métrica HONESTA de la sesión (regla dura 3): cuántas rondas se jugaron y en cuántas el niño
 * intentó una palabra (el padre marcó algo). Nunca dice "acertó" — no existe acierto para el niño.
 */
export function metricaGemelas(marcas: readonly Marca[]): Metrica {
  return {
    tipo: "gemelas",
    rondas: marcas.length,
    participadas: marcas.filter((m) => m !== null).length,
  };
}
