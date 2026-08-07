// ORTOGRAFÍA GENERAL del objetivo (gate S4, bloque O) — motor PURO, sin IA, sin red.
//
// El pedido del usuario en el gate: al escribir "medi" la app debe poder sugerir «medio» o
// «medios» AUNQUE no estén en su contenido — en un color distinto de los términos que sí
// alinean juegos. Para eso viaja un diccionario embebido (palabras-es.ts: las 10 000 palabras
// más frecuentes del español, curadas — ver scripts/gen-diccionario.mjs), cargado bajo demanda.
//
// Mismas reglas del sugeridor de la app (sugerir.ts): prefijos primero (aquí ordenados por
// FRECUENCIA real de uso, no alfabético: «medio» antes que «mediar»), parecidos (distancia ≤ 2,
// token ≥ 4) solo cuando no hay prefijos. Y una regla propia: si lo escrito YA es una palabra
// del diccionario, no hay nada que corregir — eso es lo que permite guardar «medios» sin que
// el paso de ortografía pregunte por gusto.

import { normalizar, normalizarConForma } from "./alinear";
import { distancia, type Sugerencia } from "./sugerir";

export type IndiceDiccionario = {
  /** clave normalizada → forma real y rango de frecuencia (menor = más común). */
  porClave: Map<string, { forma: string; rango: number }>;
};

/** Se construye UNA vez por visita (useMemo en la pantalla); 10 000 entradas, ~20 ms. */
export function indexarDiccionario(
  palabras: readonly string[],
): IndiceDiccionario {
  const porClave = new Map<string, { forma: string; rango: number }>();
  palabras.forEach((palabra, rango) => {
    for (const { forma, clave } of normalizarConForma(palabra)) {
      if (!porClave.has(clave)) porClave.set(clave, { forma, rango });
    }
  });
  return { porClave };
}

/** La clave normalizada del ÚLTIMO token significativo (lo que se está tecleando), o null. */
export function ultimaClave(texto: string): string | null {
  const tokens = normalizar(texto);
  return tokens.length > 0 ? tokens[tokens.length - 1] : null;
}

/**
 * ¿El último token es una palabra bien escrita según el diccionario? Con esto el paso de
 * ortografía se calla ante «medios» o «colores»: existir en el idioma ES estar bien escrito,
 * aunque no alinee nada en la app (ese caso lo cuenta el mensaje honesto, no una pregunta).
 */
export function conoceElDiccionario(
  indice: IndiceDiccionario,
  texto: string,
): boolean {
  const clave = ultimaClave(texto);
  return clave !== null && indice.porClave.has(clave);
}

/**
 * Sugerencias de ortografía para el último token, EXCLUYENDO las claves del vocabulario de la
 * app (esas ya las sugiere sugerir.ts en su propio color — aquí solo va "la palabra bien
 * escrita que la app no tiene"). Determinista: prefijos por frecuencia; sin prefijos, parecidos
 * por distancia y frecuencia. Tope `max`. Los PREFIJOS se ofrecen aunque el token ya sea una
 * palabra bien escrita («medio» ofrece «medios» — así se llega tecleando a la palabra completa);
 * los PARECIDOS solo cuando no lo es (a una palabra bien escrita no se le corrige nada).
 */
export function sugerirOrtografia(
  texto: string,
  indice: IndiceDiccionario,
  excluirClaves: ReadonlySet<string>,
  max = 4,
): Sugerencia[] {
  const token = ultimaClave(texto);
  if (token === null) return [];
  const bienEscrita = indice.porClave.has(token);

  const prefijos: { forma: string; rango: number }[] = [];
  const parecidos: { forma: string; rango: number; d: number }[] = [];
  for (const [clave, { forma, rango }] of indice.porClave) {
    if (excluirClaves.has(clave) || clave === token) continue;
    if (clave.startsWith(token)) {
      prefijos.push({ forma, rango });
    } else if (!bienEscrita && token.length >= 4 && clave.length >= 4) {
      const d = distancia(token, clave);
      if (d <= 2) parecidos.push({ forma, rango, d });
    }
  }

  if (prefijos.length > 0) {
    return prefijos
      .sort((a, b) => a.rango - b.rango)
      .slice(0, max)
      .map((p) => ({ termino: p.forma, tipo: "prefijo" as const }));
  }
  return parecidos
    .sort((a, b) => a.d - b.d || a.rango - b.rango)
    .slice(0, max)
    .map((p) => ({ termino: p.forma, tipo: "parecido" as const }));
}
