// CATÁLOGO DE GRABACIÓN del banco de voz (Outcome 1) — PURO: sin audio, sin storage, sin DOM.
//
// Deriva del contenido REAL de la app la lista de cosas que un padre puede grabar con su voz para
// que suenen luego en los juegos: las PALABRAS de los pictogramas y de las gemelas, un puñado de
// CONSIGNAS fijas de juego, y las CELEBRACIONES honestas que NO llevan números (las que sí llevan
// cifras — "¡su voz sonó 7,3 segundos!" — no se pueden grabar: el número cambia cada vez).
//
// Cada ítem tiene un `id` estable: es la clave con la que su grabación vive en el banco (ADR-010).

import { PICTOGRAMAS } from "@content/pictogramas";
import { palabrasDeGemelos } from "@content/pares-gemelos";
import type { Idioma } from "@/lib/idioma";
import type { Tema } from "@/lib/storage/temas";

export type CategoriaGrabable = "palabra" | "consigna" | "celebracion";

export type ItemGrabable = {
  /** Clave estable de almacenamiento (ADR-010). */
  id: string;
  categoria: CategoriaGrabable;
  /** Lo que el padre dice al grabar (y lo que el niño oirá). */
  texto: string;
  /** Solo las palabras llevan tema (para priorizar el lote por los intereses del niño). */
  tema?: Tema;
};

/** Slug estable sin tildes: la palabra "camión" → "camion" (la clave no cambia por un acento). */
function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Las claves del español NO cambian (lo grabado antes sigue sonando). Las del inglés llevan su propio
 * prefijo (`palabra-en:`, `consigna-en:`, `celebracion-en:`): «bus» o «piano» se dicen distinto, y una
 * grabación de la familia en español no debe sonar cuando el niño practica en inglés.
 */
const SUFIJO: Record<Idioma, string> = { es: "", en: "-en" };

export const idPalabra = (palabra: string, idioma: Idioma = "es"): string =>
  `palabra${SUFIJO[idioma]}:${slug(palabra)}`;
/** ¿Esta clave del banco es de este idioma? Las del inglés llevan `-en` antes de los dos puntos. */
export const esDelIdioma = (id: string, idioma: Idioma): boolean =>
  /^[a-z]+-en:/.test(id) === (idioma === "en");
export const idConsigna = (clave: string, idioma: Idioma = "es"): string =>
  `consigna${SUFIJO[idioma]}:${clave}`;
export const idCelebracion = (clave: string, idioma: Idioma = "es"): string =>
  `celebracion${SUFIJO[idioma]}:${clave}`;

/**
 * Consignas fijas de juego (el mismo texto siempre → grabable). Regla del remate S3: SOLO entra
 * al catálogo lo que tiene un sitio real de reproducción — pedir grabar algo que jamás sonará
 * es deshonesto con el padre. "Nómbralo tú y espera" se retiró por eso: es una instrucción AL
 * padre, no una invitación al niño, y no tiene dónde sonar.
 */
const CONSIGNAS: { clave: string; texto: Record<Idioma, string> }[] = [
  // suena en el cohete
  { clave: "sirena", texto: { es: "Haz la voz de sirena: aaaAAAaaa", en: "Make a siren voice: aaaAAAaaa" } },
  // suena en el globo
  { clave: "aaah", texto: { es: "Haz sonar tu voz: aaaaah", en: "Make your voice sound: aaaaah" } },
];

/** Celebraciones honestas SIN cifras (las que sí las llevan no son grabables — ADR/​manual). */
const CELEBRACIONES: { clave: string; texto: Record<Idioma, string> }[] = [
  { clave: "le-salio", texto: { es: "¡Le salió la voz! Lo intentó.", en: "Their voice came out! They tried." } },
  { clave: "dijo-palabra", texto: { es: "¡Dijo la palabra! Lo oíste tú.", en: "They said the word! You heard it." } },
  {
    clave: "casi",
    texto: { es: "Hoy casi no salió. No pasa nada: mañana seguimos.", en: "Hardly anything came out today. That's fine: we go on tomorrow." },
  },
];

/**
 * El catálogo completo, DETERMINISTA (mismo orden siempre). Las palabras se deduplican por slug:
 * "pato"/"gato"/"luna" aparecen una sola vez aunque estén en pictos y en gemelas.
 */
export function catalogoGrabable(idioma: Idioma = "es"): ItemGrabable[] {
  const palabras = new Map<string, ItemGrabable>();

  for (const p of PICTOGRAMAS) {
    const texto = idioma === "en" ? p.en : p.palabra;
    const id = idPalabra(texto, idioma);
    if (!palabras.has(id)) {
      palabras.set(id, { id, categoria: "palabra", texto, tema: p.tema });
    }
  }
  for (const g of palabrasDeGemelos(idioma)) {
    const id = idPalabra(g.palabra, idioma);
    if (!palabras.has(id)) {
      palabras.set(id, { id, categoria: "palabra", texto: g.palabra });
    }
  }

  const consignas: ItemGrabable[] = CONSIGNAS.map((c) => ({
    id: idConsigna(c.clave, idioma),
    categoria: "consigna",
    texto: c.texto[idioma],
  }));
  const celebraciones: ItemGrabable[] = CELEBRACIONES.map((c) => ({
    id: idCelebracion(c.clave, idioma),
    categoria: "celebracion",
    texto: c.texto[idioma],
  }));

  return [...palabras.values(), ...consignas, ...celebraciones];
}
