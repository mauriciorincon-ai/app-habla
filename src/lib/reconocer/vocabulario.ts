// The words each game lets the recognizer answer with (S11, ADR-023). PURE: content in, words out.

import { PICTOGRAMAS } from "../../../content/pictogramas";
import { paresDe } from "../../../content/pares-gemelos";
import type { Idioma } from "@/lib/idioma";
import { gramatica } from "./gramatica";

export function palabrasDelJuego(
  juego: "palabras" | "gemelas",
  idioma: Idioma,
): string[] {
  if (juego === "palabras")
    return PICTOGRAMAS.map((p) => (idioma === "en" ? p.en : p.palabra));
  return paresDe(idioma).flatMap((p) => [p.a.palabra, p.b.palabra]);
}

export const gramaticaDelJuego = (
  juego: "palabras" | "gemelas",
  idioma: Idioma,
) => gramatica(palabrasDelJuego(juego, idioma));
