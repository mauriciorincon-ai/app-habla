// LA SORPRESA DEL DÍA (S15) — PURO. Qué escena sale hoy en un juego: el tema (el de su mundo, o uno
// elegido por fecha si no hay perfil) y la frase del día. Determinista con la fecha (regla 23: la fecha es
// una perilla); nada de Math.random. Jamás depende de si el niño «acertó»: solo de cuántos turnos suyos hubo.

import { SORPRESAS } from "@content/sorpresas";
import { fnv1a } from "@/lib/coach/daily";
import type { Idioma } from "@/lib/idioma";
import { TEMAS, type Tema } from "@/lib/storage/temas";

/** Turnos de él (con su voz) que abren la sorpresa, una vez por partida. */
export const TURNOS_PARA_SORPRESA = 3;

/** Cuánto se queda en pantalla antes de irse sola. */
export const MS_SORPRESA_VISIBLE = 6000;

export function sorpresaDelDia(
  tema: Tema | null,
  fecha: string,
  juego: string,
  idioma: Idioma,
): { tema: Tema; texto: string } {
  const h = fnv1a(`${fecha}|${juego}`);
  const elegido = tema ?? TEMAS[h % TEMAS.length];
  const frases = SORPRESAS[elegido];
  return { tema: elegido, texto: frases[Math.floor(h / TEMAS.length) % frases.length][idioma] };
}

/** ¿Se abre ahora? Solo al ALCANZAR el umbral (no al pasarlo), así sale una vez por partida. */
export function abreSorpresa(antes: number, ahora: number): boolean {
  return antes < TURNOS_PARA_SORPRESA && ahora >= TURNOS_PARA_SORPRESA;
}
