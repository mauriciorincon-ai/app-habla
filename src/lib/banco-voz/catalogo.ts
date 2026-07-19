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

export const idPalabra = (palabra: string): string =>
  `palabra:${slug(palabra)}`;

/** Consignas fijas de juego (el mismo texto siempre → grabable). */
const CONSIGNAS: { clave: string; texto: string }[] = [
  { clave: "sirena", texto: "Haz la voz de sirena: aaaAAAaaa" },
  { clave: "aaah", texto: "Haz sonar tu voz: aaaaah" },
  { clave: "nombra", texto: "Nómbralo tú y espera" },
];

/** Celebraciones honestas SIN cifras (las que sí las llevan no son grabables — ADR/​manual). */
const CELEBRACIONES: { clave: string; texto: string }[] = [
  { clave: "le-salio", texto: "¡Le salió la voz! Lo intentó." },
  { clave: "dijo-palabra", texto: "¡Dijo la palabra! Lo oíste tú." },
  { clave: "casi", texto: "Hoy casi no salió. No pasa nada: mañana seguimos." },
];

/**
 * El catálogo completo, DETERMINISTA (mismo orden siempre). Las palabras se deduplican por slug:
 * "pato"/"gato"/"luna" aparecen una sola vez aunque estén en pictos y en gemelas.
 */
export function catalogoGrabable(): ItemGrabable[] {
  const palabras = new Map<string, ItemGrabable>();

  for (const p of PICTOGRAMAS) {
    const id = idPalabra(p.palabra);
    if (!palabras.has(id)) {
      palabras.set(id, {
        id,
        categoria: "palabra",
        texto: p.palabra,
        tema: p.tema,
      });
    }
  }
  for (const g of palabrasDeGemelos()) {
    const id = idPalabra(g.palabra);
    if (!palabras.has(id)) {
      palabras.set(id, { id, categoria: "palabra", texto: g.palabra });
    }
  }

  const consignas: ItemGrabable[] = CONSIGNAS.map((c) => ({
    id: `consigna:${c.clave}`,
    categoria: "consigna",
    texto: c.texto,
  }));
  const celebraciones: ItemGrabable[] = CELEBRACIONES.map((c) => ({
    id: `celebracion:${c.clave}`,
    categoria: "celebracion",
    texto: c.texto,
  }));

  return [...palabras.values(), ...consignas, ...celebraciones];
}
