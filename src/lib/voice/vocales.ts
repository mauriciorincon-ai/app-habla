// «El mapa de las vocales» (S10, ADR-021): de dos números medidos (F1, F2) a la vocal más cercana.
// Motor PURO: sin Web Audio, sin persistencia, sin red (regla dura 2). EXPERIMENTAL: los centros son
// valores de manual del español, no medidas de niños reales; el resultado del spike lo decide el dueño
// en el ensayo. La app muestra «suena como», nunca «bien dicha» (regla dura 3).

import type { Formantes } from "./types";

export type Vocal = "a" | "e" | "i" | "o" | "u";
export const VOCALES: readonly Vocal[] = ["a", "e", "i", "o", "u"];

/** Centro de cada vocal [F1, F2] en Hz. */
const CENTROS_ADULTO: Record<Vocal, readonly [number, number]> = {
  a: [750, 1300],
  e: [460, 1850],
  i: [290, 2250],
  o: [480, 900],
  u: [310, 750],
};
/** En una voz infantil el tracto es más corto: los formantes suben ≈ 35 %. */
const CENTROS_NINO: Record<Vocal, readonly [number, number]> = {
  a: [1000, 1750],
  e: [620, 2500],
  i: [390, 3000],
  o: [650, 1200],
  u: [420, 1000],
};

/** Por encima de este F0 la voz se trata como infantil (YIN no ve voces bajo 150 Hz: esas son adultas). */
export const F0_VOZ_INFANTIL_HZ = 200;

/** Distancia máxima (en log-frecuencia) para decir «suena como»; más lejos, no se nombra ninguna. */
export const DISTANCIA_MAXIMA = 0.35;

export type Lectura = { vocal: Vocal; distancia: number } | null;

export function centrosPara(
  pitchHz: number | null,
): Record<Vocal, readonly [number, number]> {
  return pitchHz !== null && pitchHz >= F0_VOZ_INFANTIL_HZ
    ? CENTROS_NINO
    : CENTROS_ADULTO;
}

/** La vocal cuyo centro queda más cerca, o null si ninguna está lo bastante cerca. */
export function clasificarVocal(
  formantes: Formantes | null | undefined,
  pitchHz: number | null,
): Lectura {
  if (!formantes) return null;
  const centros = centrosPara(pitchHz);
  let mejor: Lectura = null;
  for (const v of VOCALES) {
    const [c1, c2] = centros[v];
    const d = Math.hypot(
      Math.log(formantes.f1 / c1),
      Math.log(formantes.f2 / c2),
    );
    if (!mejor || d < mejor.distancia) mejor = { vocal: v, distancia: d };
  }
  return mejor && mejor.distancia <= DISTANCIA_MAXIMA ? mejor : null;
}

/**
 * Estabilizador: una vocal se «oye» solo si las últimas `n` lecturas coinciden. Evita que una
 * transición (a→e) pinte zonas fantasma. Puro: recibe la ventana y devuelve la vocal o null.
 */
export function vocalEstable(ultimas: readonly Lectura[], n = 3): Vocal | null {
  if (ultimas.length < n) return null;
  const tramo = ultimas.slice(-n);
  const primera = tramo[0]?.vocal;
  if (!primera) return null;
  return tramo.every((l) => l?.vocal === primera) ? primera : null;
}

export type SeguimientoVocales = {
  /** Un frame medido. Sin voz, la ventana se vacía: el silencio no «sostiene» ninguna vocal. */
  empujar: (
    formantes: Formantes | null | undefined,
    pitchHz: number | null,
    vozActiva: boolean,
  ) => void;
  /** La vocal que suena AHORA (estable), o null. */
  actual: () => Vocal | null;
  /** Cuántas vocales distintas sonaron estables en el intento (0..5). */
  zonas: () => number;
  /** Cuántas veces pasó de una vocal estable a otra distinta. */
  cambios: () => number;
  reiniciar: () => void;
};

/** Ventana de lecturas, conteo de zonas y de cambios: lo único que el juego puede afirmar (regla 3). */
export function crearSeguimientoVocales(ventana = 3): SeguimientoVocales {
  let ultimas: Lectura[] = [];
  let actual: Vocal | null = null;
  let previa: Vocal | null = null;
  let vistas = new Set<Vocal>();
  let cambios = 0;
  return {
    empujar(formantes, pitchHz, vozActiva) {
      ultimas.push(vozActiva ? clasificarVocal(formantes, pitchHz) : null);
      if (ultimas.length > ventana) ultimas = ultimas.slice(-ventana);
      actual = vocalEstable(ultimas, ventana);
      if (actual) {
        vistas.add(actual);
        if (previa && previa !== actual) cambios++;
        previa = actual;
      }
    },
    actual: () => actual,
    zonas: () => vistas.size,
    cambios: () => cambios,
    reiniciar() {
      ultimas = [];
      actual = null;
      previa = null;
      vistas = new Set();
      cambios = 0;
    },
  };
}
