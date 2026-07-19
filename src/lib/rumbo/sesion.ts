// Puente Metrica → Sesion (S4). La celebración ya calculó los números del intento (Metrica); esto
// los pasa a la forma que se persiste (Sesion). PURO y testeable: no toca storage. `palabras` solo
// aplica a palabra↔objeto (los dibujos que su voz encendió) — el resto de juegos lo ignora.

import type { Metrica } from "@/lib/session-flow";
import type { Sesion } from "@/lib/storage/schemas";

export function construirSesion(
  metrica: Metrica,
  fecha: string,
  palabras: readonly string[] = [],
): Sesion {
  switch (metrica.tipo) {
    case "sostenido":
      return {
        juego: "globo",
        fecha,
        vozMs: metrica.ms,
        rachaMs: metrica.rachaMs,
      };
    case "inversiones":
      return { juego: "cohete", fecha, inversiones: metrica.veces };
    case "activaciones":
      return {
        juego: "palabras",
        fecha,
        encendidos: metrica.veces,
        reconocidas: metrica.reconocidas,
        // Dedup + tope defensivo: solo palabras distintas, y nunca más de 200 (el schema las acota).
        palabras: [...new Set(palabras)].slice(0, 200),
      };
    case "gemelas":
      return {
        juego: "gemelas",
        fecha,
        rondas: metrica.rondas,
        participadas: metrica.participadas,
      };
  }
}
