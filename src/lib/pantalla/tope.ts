// Short sessions (S12, ADR-024): the daily play cap, as pure functions of the state and the date.
//
// What it is: a counter of the minutes of play on THIS device today, and a cap the adult chooses
// (5–10 minutes, 10 by default). Reaching the cap shows the adult one gentle notice and the game closes
// calmly, like «Salir». It never blocks (the adult can start again; the game is not cut a second time),
// never punishes and never says «se acabó» to the child.
//
// Privacy (hard rule 2 and 2-bis): it keeps only the date and a number of milliseconds. It is local,
// it is not part of the other-home file (src/lib/otra-casa/paquete.ts is strict) and «Borrar todo» removes it.
// The date is a parameter, never the clock (rule 23): the caller passes today.

import { z } from "zod";

export const TOPE_MINIMO_MIN = 5;
export const TOPE_MAXIMO_MIN = 10;
export const TOPE_DEFECTO_MIN = 10;

/** One tick is never credited with more than this: a frozen tab or a clock jump cannot fill the day. */
export const DELTA_MAX_MS = 2000;

const FechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const PantallaSchema = z.object({
  /** The local day (YYYY-MM-DD) these milliseconds belong to. */
  fecha: FechaSchema,
  /** Milliseconds of play on this device that day. */
  ms: z.number().int().min(0),
  /** The adult has already seen today's notice: the game is not cut a second time. */
  avisado: z.boolean(),
});
export type EstadoPantalla = z.infer<typeof PantallaSchema>;

export const PANTALLA_VACIA: EstadoPantalla = { fecha: "1970-01-01", ms: 0, avisado: false };

/** The cap, forced into its range (an out-of-range stored value never widens it). */
export function topeValido(minutos: unknown): number {
  const n = typeof minutos === "number" && Number.isFinite(minutos) ? Math.round(minutos) : TOPE_DEFECTO_MIN;
  return Math.min(TOPE_MAXIMO_MIN, Math.max(TOPE_MINIMO_MIN, n));
}

/** A new day starts from zero; the same day keeps what it had. */
export function delDia(estado: EstadoPantalla, hoy: string): EstadoPantalla {
  return estado.fecha === hoy ? estado : { fecha: hoy, ms: 0, avisado: false };
}

/** Adds play time to today. Negative or absurd deltas are clamped; a new date resets first. */
export function acumular(estado: EstadoPantalla, hoy: string, deltaMs: number): EstadoPantalla {
  const base = delDia(estado, hoy);
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return base;
  return { ...base, ms: base.ms + Math.round(Math.min(deltaMs, DELTA_MAX_MS)) };
}

export function topeMs(topeMinutos: number): number {
  return topeValido(topeMinutos) * 60_000;
}

/** Whole minutes played today (rounded down, so «hoy ya jugaron N min» never overstates). */
export function minutosJugados(estado: EstadoPantalla, hoy: string): number {
  return Math.floor(delDia(estado, hoy).ms / 60_000);
}

export function alcanzado(estado: EstadoPantalla, hoy: string, topeMinutos: number): boolean {
  return delDia(estado, hoy).ms >= topeMs(topeMinutos);
}

/** True exactly once a day: when the cap is reached and the adult has not seen the notice yet. */
export function debeAvisar(estado: EstadoPantalla, hoy: string, topeMinutos: number): boolean {
  const e = delDia(estado, hoy);
  return !e.avisado && e.ms >= topeMs(topeMinutos);
}

export function marcarAvisado(estado: EstadoPantalla, hoy: string): EstadoPantalla {
  return { ...delDia(estado, hoy), avisado: true };
}

/** The calm line «hoy ya jugaron N min»: only after the notice was seen today and while the cap stays reached. */
export function lineaHoyVisible(estado: EstadoPantalla, hoy: string, topeMinutos: number): boolean {
  const e = delDia(estado, hoy);
  return e.avisado && e.ms >= topeMs(topeMinutos);
}

/**
 * Stories and the video library (S15, ADR-027): when the cap arrives mid-page or mid-clip the notice
 * WAITS for the page or the clip to end — never cuts a story in half. `pendiente` marks the wait;
 * `minutos` is set when the unit ends and the adult sees the notice.
 */
export type EsperaAviso = { pendiente: boolean; minutos: number | null };
export const SIN_ESPERA: EsperaAviso = { pendiente: false, minutos: null };

export function topeLlego(espera: EsperaAviso): EsperaAviso {
  return { ...espera, pendiente: true };
}

/** The page turned or the clip ended: a pending notice is shown now; otherwise nothing changes. */
export function unidadTerminada(espera: EsperaAviso, minutos: number): EsperaAviso {
  return espera.pendiente ? { pendiente: false, minutos } : espera;
}
