// SUGERENCIAS EN VIVO del objetivo (gate S4, O1) — motor PURO, sin IA: prefijos y distancia de
// edición sobre el vocabulario REAL del contenido. El hallazgo del gate: mientras el padre
// escribe, la pantalla lo regañaba a medio teclazo ("«ani» no está en el contenido") — la gente
// empieza escribiendo incompleto o con errores. Esto propone términos que SÍ existen: si va por
// buen camino (prefijo), lo acompaña; si parece un error de ortografía (distancia ≤ 2), le
// ofrece "¿quisiste decir…?"; solo cuando está completamente lejos, el mensaje honesto de antes.

import { normalizar } from "./alinear";

export type Sugerencia = {
  termino: string;
  /** "prefijo": lo que escribe es el comienzo de un término real (va bien, sigue).
   *  "parecido": está a ≤ 2 letras de un término real (probable error de ortografía). */
  tipo: "prefijo" | "parecido";
};

/** Distancia de Levenshtein clásica — pequeña y determinista (los términos miden ≤ ~20). */
function distancia(a: string, b: string): number {
  if (a === b) return 0;
  const fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previa = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const guardada = fila[j];
      fila[j] = Math.min(
        fila[j] + 1,
        fila[j - 1] + 1,
        previa + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previa = guardada;
    }
  }
  return fila[b.length];
}

/**
 * El vocabulario alineable del contenido: etiquetas de cápsulas, palabras de pictogramas y de
 * pares, y claves de tema. Únicos y en orden estable (el orden del contenido, que es fijo).
 */
export function vocabularioDe(contenido: {
  capsulas: readonly { etiquetas: readonly string[] }[];
  pictos: readonly { palabra: string; tema: string }[];
  pares: readonly { a: { palabra: string }; b: { palabra: string } }[];
}): string[] {
  const terminos = new Set<string>();
  for (const c of contenido.capsulas)
    for (const e of c.etiquetas) terminos.add(e);
  for (const p of contenido.pictos) {
    terminos.add(p.palabra);
    terminos.add(p.tema);
  }
  for (const p of contenido.pares) {
    terminos.add(p.a.palabra);
    terminos.add(p.b.palabra);
  }
  return [...terminos];
}

/**
 * Sugerencias para lo que el padre lleva escrito, contra el vocabulario real. Se sugiere sobre el
 * ÚLTIMO token significativo (lo que está tecleando ahora). Determinista: prefijos primero
 * (alfabético), luego parecidos (por distancia y alfabético), sin repetir, tope `max`.
 */
export function sugerir(
  texto: string,
  vocabulario: readonly string[],
  max = 4,
): Sugerencia[] {
  const tokens = normalizar(texto);
  if (tokens.length === 0) return [];
  const token = tokens[tokens.length - 1];

  const prefijos: string[] = [];
  const parecidos: { termino: string; d: number }[] = [];
  for (const crudo of vocabulario) {
    for (const term of normalizar(crudo)) {
      if (term === token) continue; // ya lo escribió exacto: nada que sugerir
      if (term.startsWith(token)) {
        prefijos.push(term);
      } else if (term.length >= 4) {
        const d = distancia(token, term);
        if (d <= 2) parecidos.push({ termino: term, d });
      }
    }
  }

  const vistos = new Set<string>();
  const resultado: Sugerencia[] = [];
  for (const t of prefijos.sort()) {
    if (resultado.length >= max) break;
    if (vistos.has(t)) continue;
    vistos.add(t);
    resultado.push({ termino: t, tipo: "prefijo" });
  }
  for (const p of parecidos.sort(
    (a, b) => a.d - b.d || (a.termino < b.termino ? -1 : 1),
  )) {
    if (resultado.length >= max) break;
    if (vistos.has(p.termino)) continue;
    vistos.add(p.termino);
    resultado.push({ termino: p.termino, tipo: "parecido" });
  }
  return resultado;
}
