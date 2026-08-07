// SUGERENCIAS EN VIVO del objetivo (gate S4, O1) — motor PURO, sin IA: prefijos y distancia de
// edición sobre el vocabulario REAL del contenido. El hallazgo del gate: mientras el padre
// escribe, la pantalla lo regañaba a medio teclazo ("«ani» no está en el contenido") — la gente
// empieza escribiendo incompleto o con errores. Esto propone términos que SÍ existen: si va por
// buen camino (prefijo), lo acompaña; si parece un error de ortografía (distancia ≤ 2), le
// ofrece "¿quisiste decir…?"; solo cuando está completamente lejos, el mensaje honesto de antes.

import { normalizar, normalizarConForma } from "./alinear";
import { NOMBRE_TEMA } from "@/lib/storage/temas";

export type Sugerencia = {
  termino: string;
  /** "prefijo": lo que escribe es el comienzo de un término real (va bien, sigue).
   *  "parecido": está a ≤ 2 letras de un término real (probable error de ortografía). */
  tipo: "prefijo" | "parecido";
};

/** Distancia de Levenshtein clásica — pequeña y determinista (los términos miden ≤ ~20). */
export function distancia(a: string, b: string): number {
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
    // El nombre VISIBLE del tema también es vocabulario: el padre ve "Transporte" en Ajustes,
    // no la clave "carros" — lo que la pantalla muestra se puede escribir (y alinear.ts lo
    // expande a su clave al alinear). El cast: aquí `tema` es string genérico, no Tema.
    const nombre = (NOMBRE_TEMA as Record<string, string>)[p.tema];
    if (nombre) terminos.add(nombre);
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
 * (alfabético por clave), sin repetir, tope `max`. La comparación es SIN tildes ni eñes, pero la
 * sugerencia se muestra CON ellas (hallazgo del gate S4: "bañ" sugería «bano» — era «baño»
 * mutilado e irreconocible). Los parecidos solo entran cuando ningún término empieza por lo
 * escrito: con prefijos a la vista el padre va bien encaminado, y ofrecerle además palabras a
 * 2 letras de distancia (rana, lana…) es ruido, no ayuda.
 */
export function sugerir(
  texto: string,
  vocabulario: readonly string[],
  max = 4,
): Sugerencia[] {
  const tokens = normalizar(texto);
  if (tokens.length === 0) return [];
  const token = tokens[tokens.length - 1];

  // clave normalizada → forma real. Primera forma vista gana: el vocabulario pone las etiquetas
  // curadas («música») antes que las claves crudas de tema ("musica"), así el empate va bien.
  const prefijos = new Map<string, string>();
  const parecidos = new Map<string, { forma: string; d: number }>();
  for (const crudo of vocabulario) {
    for (const { forma, clave } of normalizarConForma(crudo)) {
      if (clave === token) continue; // ya lo escribió exacto: nada que sugerir
      if (clave.startsWith(token)) {
        if (!prefijos.has(clave)) prefijos.set(clave, forma);
      } else if (token.length >= 4 && clave.length >= 4) {
        // Con 3 letras escritas, distancia 2 matchea medio catálogo ("ban" → rana, lana, mano):
        // eso no es corregir ortografía, es otra palabra. El parecido exige ≥4 letras escritas.
        const d = distancia(token, clave);
        if (d <= 2 && !parecidos.has(clave)) parecidos.set(clave, { forma, d });
      }
    }
  }

  const resultado: Sugerencia[] = [];
  for (const [, forma] of [...prefijos].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (resultado.length >= max) break;
    resultado.push({ termino: forma, tipo: "prefijo" });
  }
  if (resultado.length === 0) {
    for (const [, p] of [...parecidos].sort(
      (x, y) => x[1].d - y[1].d || (x[0] < y[0] ? -1 : 1),
    )) {
      if (resultado.length >= max) break;
      resultado.push({ termino: p.forma, tipo: "parecido" });
    }
  }
  return resultado;
}
