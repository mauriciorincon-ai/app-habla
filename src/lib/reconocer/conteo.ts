// The 2×2 of the recognizer against the adult (S11, ADR-023): four local numbers, nothing else.
//
// «Matched» = the recognizer said «maybe they said X» for the round; «judged» = the adult pressed the
// button. Four counters, no words, no times, no audio. They live under their own key and never travel in
// the other-home package (tests/unit/otra-casa.test.ts); «Borrar mis datos» removes them (`habla:` prefix).

import { z } from "zod";
import { CLAVES, guardar, leer } from "@/lib/storage/local";

const N = z.number().int().min(0).catch(0);
export const ConteoSchema = z.object({
  /** Recognizer matched · adult judged yes. */
  siSi: N,
  /** Recognizer matched · adult judged no. */
  siNo: N,
  /** Recognizer did not match · adult judged yes. */
  noSi: N,
  /** Recognizer did not match · adult judged no. */
  noNo: N,
});
export type Conteo = z.infer<typeof ConteoSchema>;

export const CONTEO_VACIO: Conteo = { siSi: 0, siNo: 0, noSi: 0, noNo: 0 };
/** Below this many rounds the count says nothing yet. */
export const MINIMO_PARA_DECIR = 20;

export const totalConteo = (c: Conteo): number =>
  c.siSi + c.siNo + c.noSi + c.noNo;

export const leerConteo = (): Conteo =>
  leer(CLAVES.coincidencias, ConteoSchema) ?? CONTEO_VACIO;

export function registrarRonda(coincidio: boolean, adultoSi: boolean): Conteo {
  const c = { ...leerConteo() };
  const campo = coincidio
    ? adultoSi
      ? "siSi"
      : "siNo"
    : adultoSi
      ? "noSi"
      : "noNo";
  c[campo] += 1;
  guardar(CLAVES.coincidencias, ConteoSchema, c);
  return c;
}

/** How often the recognizer's «maybe» matched the adult's judgement, or null if it is too early. */
export function acuerdo(c: Conteo): number | null {
  const t = totalConteo(c);
  if (t < MINIMO_PARA_DECIR) return null;
  return (c.siSi + c.noNo) / t;
}
