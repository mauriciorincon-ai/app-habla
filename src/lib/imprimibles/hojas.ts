// Tarjetas y tableros para imprimir (S10). Motor PURO: dado lo que el adulto ya escribió en «Cuentos
// de casa» (palabras meta e intereses), elige pictogramas del lote de la app. Solo el pictograma y
// SU palabra salen en la hoja —nunca el texto libre de la familia, ni el perfil, ni el apodo (regla
// dura 8)—: el texto escrito se usa únicamente para ENCONTRAR el dibujo.

import { PICTOGRAMAS, type Pictograma } from "@content/pictogramas";
import type { Idioma } from "@/lib/idioma";

export const TARJETAS_POR_HOJA = 8;
export const MAX_TARJETAS = 24;

const norm = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** La palabra del pictograma en el idioma de la hoja. */
export const palabraDe = (p: Pictograma, idioma: Idioma): string =>
  idioma === "en" ? p.en : p.palabra;

/**
 * Pictogramas cuyo nombre aparece entre las palabras meta o los intereses (coincidencia de palabra
 * completa, sin acentos). Si hay menos de las que caben en una hoja, completa con el lote base (los
 * primeros del catálogo, orden fijo): la hoja nunca sale vacía. Determinista: sin azar.
 */
export function elegirPictogramas(
  palabrasMeta: readonly string[],
  intereses: readonly string[],
  idioma: Idioma,
  max = MAX_TARJETAS,
): { pictos: Pictograma[]; delLoteBase: number } {
  const claves = new Set(
    [...palabrasMeta, ...intereses].flatMap((t) => norm(t).split(/[^a-z0-9]+/).filter(Boolean)),
  );
  const coinciden = PICTOGRAMAS.filter((p) => claves.has(norm(palabraDe(p, idioma))));
  const pictos = coinciden.slice(0, max);
  let delLoteBase = 0;
  for (const p of PICTOGRAMAS) {
    if (pictos.length >= TARJETAS_POR_HOJA) break;
    if (!pictos.includes(p)) {
      pictos.push(p);
      delLoteBase++;
    }
  }
  return { pictos, delLoteBase };
}

/** Parte la lista en hojas de `porHoja` tarjetas. */
export function paginar<T>(items: readonly T[], porHoja = TARJETAS_POR_HOJA): T[][] {
  const hojas: T[][] = [];
  for (let i = 0; i < items.length; i += porHoja) hojas.push(items.slice(i, i + porHoja));
  return hojas;
}
