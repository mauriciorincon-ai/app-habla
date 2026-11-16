// EL PICTOGRAMA SIEMPRE SUENA (S15, ADR-027, G-Plan «1 a») — PURO. Decide con qué suena una palabra:
//
//   1. la grabación de la familia, si existe y la voz familiar está activa (siempre gana);
//   2. si no, el audio base: la voz del APARATO, solo si corre en el propio aparato (`localService`),
//      habla ese idioma y «Sonidos de la app» no está apagado;
//   3. si no hay ninguna de las dos, nada: el Estudio le dice al adulto qué grabar.
//
// Jamás una voz de red: una voz que no declara `localService === true` no existe para esta app.

import type { Sonidos } from "@/lib/storage/schemas";
import { resolverFuente } from "./resolver";

/** Lo que la app necesita saber de una voz del sistema (sin depender de la API del navegador). */
export type VozAparato = { name: string; lang: string; localService: boolean };

export type FuenteSonido = "grabacion" | "base" | "nada";

/** Volumen del audio propio de la app según «Sonidos de la app». */
export function volumenDe(sonidos: Sonidos): number {
  return sonidos === "normal" ? 1 : sonidos === "suave" ? 0.5 : 0;
}

/** La primera voz LOCAL del idioma (es-*, en-*). Las voces de red se descartan siempre. */
export function vozLocalPara(
  voces: readonly VozAparato[],
  idioma: "es" | "en",
): VozAparato | null {
  return (
    voces.find(
      (v) =>
        v.localService === true &&
        v.lang.toLowerCase().replace("_", "-").split("-")[0] === idioma,
    ) ?? null
  );
}

export function sonidoDePalabra(opts: {
  tieneGrabacion: boolean;
  vozFamiliarActiva: boolean;
  voces: readonly VozAparato[];
  idioma: "es" | "en";
  sonidos: Sonidos;
}): FuenteSonido {
  if (resolverFuente(opts) === "familiar") return "grabacion";
  if (opts.sonidos === "apagado") return "nada";
  return vozLocalPara(opts.voces, opts.idioma) ? "base" : "nada";
}

/** Cuánto suele durar decir una palabra suelta (la guarda del medidor, ADR-010). */
export function duracionEstimadaMs(texto: string): number {
  return 600 + 90 * texto.length;
}
