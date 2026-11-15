// SU MUNDO EN TODO (S14, ADR-026) — selector PURO: sin DOM, sin storage, sin red, sin reloj.
//
// Dos cosas que la familia ya escribió en la app, sus temas (el perfil) y la meta de la semana (lo que
// trabajan en terapia), visten y orientan TODO: el protagonista de cada juego de voz, las palabras que el
// adulto modela en su turno, los pares de gemelas, los dibujos de palabra↔objeto, los cuentos del mes y
// las hojas. Un solo lugar decide; cada pantalla solo pregunta.
//
// · El protagonista se elige entre SUS temas y rota por la FECHA (regla 23: la fecha es una perilla, no
//   el reloj) y por el juego, para que dos juegos del mismo día no lleven siempre el mismo. Viste la
//   escena; jamás cambia la mecánica ni lo que se mide.
// · Las palabras a modelar salen de la meta con `alinear()` (mismo motor que el resto de la app), en el
//   idioma de la pantalla, y nunca son más de cuatro: son para el ADULTO, que las dice en su turno.
// · Sin meta, o con una meta sin contenido detrás, no hay palabras: no se finge alinear nada (regla
//   dura 3). Si la meta se parece mucho a una etiqueta real («colres»), se dice cuál, para que la UI
//   lo sugiera; si no se parece a nada, `etiquetaCercana` es null y la UI calla.

import {
  PARES_GEMELOS,
  PARES_GEMELOS_EN,
  type ParGemelo,
} from "@content/pares-gemelos";
import {
  PICTOGRAMAS,
  PICTOGRAMAS_DE_ETIQUETA,
  type PictogramaDeEtiqueta,
} from "@content/pictogramas";
import { ETIQUETAS_CAPSULA, type EtiquetaCapsula } from "@content/schema";
import type { Idioma } from "@/lib/idioma";
import { alinear, normalizar } from "@/lib/objetivo/alinear";
import { ETIQUETA_EN } from "@/lib/objetivo/etiquetas-en";
import { distancia } from "@/lib/objetivo/sugerir";
import type { Tema } from "@/lib/storage/temas";

/** Los siete juegos que su mundo viste u orienta. */
export const JUEGOS_SU_MUNDO = [
  "globo",
  "soplar",
  "fuerte-suave",
  "cohete",
  "vocales",
  "palabras",
  "gemelas",
] as const;
export type JuegoSuMundo = (typeof JUEGOS_SU_MUNDO)[number];

/** Cuántas palabras le propone al adulto, como mucho: más, y deja de ser una ayuda en su turno. */
export const MAX_PALABRAS_A_MODELAR = 4;

export type EntradaSuMundo = {
  temas: readonly Tema[];
  /** El texto de la meta de la semana, o null. */
  objetivo: string | null;
  idioma: Idioma;
  /** YYYY-MM-DD (local). La perilla de la rotación. */
  fecha: string;
};

export type SuMundo = {
  /** El tema que viste la escena de hoy, o null sin temas (sin perfil la escena es la de siempre). */
  protagonista: Tema | null;
  /** Las palabras que el adulto puede modelar en su turno (≤ 4, en el idioma de la pantalla). */
  palabrasAModelar: string[];
  /** Ids de los pares de gemelas que prefiere: los de su meta primero, luego los de sus temas. */
  paresPreferidos: string[];
  /** Con una meta sin contenido: la etiqueta real más parecida (≤ 2 letras), o null. */
  etiquetaCercana: EtiquetaCapsula | null;
};

/** Días desde el 1970-01-01 de una fecha YYYY-MM-DD (aritmética de calendario, sin zona horaria). */
function diaDe(fecha: string): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return Math.floor(Date.UTC(a, (m ?? 1) - 1, d ?? 1) / 86_400_000);
}

/** El protagonista del juego para esa fecha: rota entre sus temas, desfasado por juego. */
export function protagonistaDe(
  temas: readonly Tema[],
  juego: JuegoSuMundo,
  fecha: string,
): Tema | null {
  if (temas.length === 0) return null;
  const desfase = JUEGOS_SU_MUNDO.indexOf(juego);
  const i =
    (((diaDe(fecha) + desfase) % temas.length) + temas.length) % temas.length;
  return temas[i] ?? null;
}

/** El archivo de cada dibujo con tema → su tema (así un par de gemelas «es» de animales sin etiquetarlo). */
const TEMA_DEL_ARCHIVO = new Map<string, Tema>(
  PICTOGRAMAS.map((p) => [p.archivo, p.tema]),
);

/** Los temas de un par, por sus dibujos. */
export function temasDelPar(par: ParGemelo): Tema[] {
  const out = new Set<Tema>();
  for (const { archivo } of [par.a, par.b]) {
    const t = TEMA_DEL_ARCHIVO.get(archivo);
    if (t) out.add(t);
  }
  return [...out];
}

/** Las palabras de la meta, en el idioma de la pantalla: dibujos de etiqueta primero, luego los de tema. */
export function palabrasDeLaMeta(
  objetivo: string | null,
  idioma: Idioma,
): string[] {
  const a = alinear(objetivo);
  if (!a.activo) return [];
  const palabra = (p: { palabra: string; en: string }) =>
    idioma === "en" ? p.en : p.palabra;
  const out: string[] = [];
  const sumar = (w: string) => {
    if (!out.includes(w)) out.push(w);
  };
  for (const p of PICTOGRAMAS_DE_ETIQUETA) {
    if (
      a.coincideEtiquetas(p.etiquetas) ||
      a.coincidePalabra(p.palabra) ||
      a.coincidePalabra(p.en)
    ) {
      sumar(palabra(p));
    }
  }
  for (const p of PICTOGRAMAS) {
    if (
      a.coincidePalabra(p.palabra) ||
      a.coincidePalabra(p.en) ||
      a.coincideTema(p.tema) ||
      (p.etiquetas ? a.coincideEtiquetas(p.etiquetas) : false)
    ) {
      sumar(palabra(p));
    }
  }
  return out.slice(0, MAX_PALABRAS_A_MODELAR);
}

/**
 * Los dibujos de ETIQUETA (colores, acciones) que pide la meta, en el orden del lote. Entran al mazo de
 * palabra↔objeto delante de los de sus temas: la meta de la terapia llega a los dibujos aunque no sea
 * un interés suyo. Sin meta, o con una meta que no los pide, la lista es vacía (el mazo de siempre).
 */
export function dibujosDeLaMeta(objetivo: string | null): PictogramaDeEtiqueta[] {
  const a = alinear(objetivo);
  if (!a.activo) return [];
  return PICTOGRAMAS_DE_ETIQUETA.filter(
    (p) => a.coincideEtiquetas(p.etiquetas) || a.coincidePalabra(p.palabra) || a.coincidePalabra(p.en),
  );
}

/** Pares preferidos: los de la meta (por palabra o etiqueta), luego los de sus temas; orden del lote. */
export function paresPreferidosDe(
  temas: readonly Tema[],
  objetivo: string | null,
  idioma: Idioma,
): string[] {
  const pares = idioma === "en" ? PARES_GEMELOS_EN : PARES_GEMELOS;
  const a = alinear(objetivo);
  const deLaMeta = pares.filter(
    (p) =>
      a.coincidePalabra(p.a.palabra) ||
      a.coincidePalabra(p.b.palabra) ||
      (p.etiquetas ? a.coincideEtiquetas(p.etiquetas) : false) ||
      temasDelPar(p).some((t) => a.coincideTema(t)),
  );
  const deSusTemas = pares.filter(
    (p) =>
      !deLaMeta.includes(p) && temasDelPar(p).some((t) => temas.includes(t)),
  );
  return [...deLaMeta, ...deSusTemas].map((p) => p.id);
}

/** La etiqueta real más parecida a una meta que no alineó nada (≤ 2 letras de distancia), o null. */
export function etiquetaCercanaDe(
  objetivo: string | null,
): EtiquetaCapsula | null {
  const tokens = objetivo ? normalizar(objetivo) : [];
  let mejor: { etiqueta: EtiquetaCapsula; d: number } | null = null;
  for (const etiqueta of ETIQUETAS_CAPSULA) {
    const formas = [etiqueta, ...ETIQUETA_EN[etiqueta]].flatMap(normalizar);
    for (const t of tokens) {
      for (const f of formas) {
        const d = distancia(t, f);
        if (d <= 2 && (!mejor || d < mejor.d)) mejor = { etiqueta, d };
      }
    }
  }
  return mejor?.etiqueta ?? null;
}

/** Su mundo para un juego: lo que viste la escena y lo que el adulto puede decir en su turno. */
export function suMundo(entrada: EntradaSuMundo, juego: JuegoSuMundo): SuMundo {
  const palabrasAModelar = palabrasDeLaMeta(entrada.objetivo, entrada.idioma);
  const paresPreferidos = paresPreferidosDe(
    entrada.temas,
    entrada.objetivo,
    entrada.idioma,
  );
  // «Sin contenido» = la meta no toca NADA: ni una etiqueta de cápsula, ni un dibujo, ni un par.
  const a = alinear(entrada.objetivo);
  const sinContenido =
    a.activo &&
    palabrasAModelar.length === 0 &&
    paresPreferidosDe([], entrada.objetivo, entrada.idioma).length === 0 &&
    !ETIQUETAS_CAPSULA.some((e) => a.coincideEtiquetas([e]));
  return {
    protagonista: protagonistaDe(entrada.temas, juego, entrada.fecha),
    palabrasAModelar,
    paresPreferidos,
    etiquetaCercana: sinContenido ? etiquetaCercanaDe(entrada.objetivo) : null,
  };
}
