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

/** Whole days since the epoch for a «YYYY-MM-DD» date (a date that does not parse still gives a number). */
function diaDeLaFecha(fecha: string): number {
  const [a, m, d] = fecha.split("-").map(Number);
  const ms = Date.UTC(a, (m ?? 1) - 1, d ?? 1);
  return Number.isFinite(ms) ? Math.floor(ms / 86_400_000) : fnv1a(fecha);
}

/**
 * The day's surprise. It rotates by DAY NUMBER (offset by the game), so two consecutive days never give the
 * same phrase of a theme, and different games differ the same day. The date is a knob (rule 23).
 */
export function sorpresaDelDia(
  tema: Tema | null,
  fecha: string,
  juego: string,
  idioma: Idioma,
): { tema: Tema; texto: string } {
  const paso = diaDeLaFecha(fecha) + fnv1a(juego);
  const elegido = tema ?? TEMAS[paso % TEMAS.length];
  const frases = SORPRESAS[elegido];
  return { tema: elegido, texto: frases[Math.floor(paso / (tema ? 1 : TEMAS.length)) % frases.length][idioma] };
}

/** ¿Se abre ahora? Solo al ALCANZAR el umbral (no al pasarlo), así sale una vez por partida. */
export function abreSorpresa(antes: number, ahora: number): boolean {
  return antes < TURNOS_PARA_SORPRESA && ahora >= TURNOS_PARA_SORPRESA;
}
