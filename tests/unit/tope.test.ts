import { beforeEach, describe, expect, it } from "vitest";
import { AjustesSchema } from "@/lib/storage/schemas";
import { borrarTodo, CLAVES, guardarPantalla, leerPantalla } from "@/lib/storage/local";
import {
  DELTA_MAX_MS,
  PANTALLA_VACIA,
  PantallaSchema,
  TOPE_DEFECTO_MIN,
  acumular,
  alcanzado,
  debeAvisar,
  delDia,
  lineaHoyVisible,
  marcarAvisado,
  minutosJugados,
  topeValido,
} from "@/lib/pantalla/tope";

const HOY = "2026-11-14";
const MANANA = "2026-11-15";
const MIN = 60_000;

/** Plays `ms` in ticks of 100 ms, as the games do. */
function jugar(ms: number, fecha = HOY, desde = PANTALLA_VACIA) {
  let e = desde;
  for (let t = 0; t < ms; t += 100) e = acumular(e, fecha, 100);
  return e;
}

describe("daily play cap (S12)", () => {
  it("the cap is 5–10 minutes, 10 by default, and an out-of-range value never widens it", () => {
    expect(TOPE_DEFECTO_MIN).toBe(10);
    expect(topeValido(5)).toBe(5);
    expect(topeValido(7)).toBe(7);
    expect(topeValido(10)).toBe(10);
    expect(topeValido(30)).toBe(10);
    expect(topeValido(1)).toBe(5);
    expect(topeValido(Number.NaN)).toBe(10);
    expect(topeValido("8")).toBe(10);
    expect(topeValido(undefined)).toBe(10);
  });

  it("counts the minutes of today and is not reached before the cap", () => {
    const e = jugar(4 * MIN + 59_000);
    expect(minutosJugados(e, HOY)).toBe(4);
    expect(alcanzado(e, HOY, 5)).toBe(false);
    expect(debeAvisar(e, HOY, 5)).toBe(false);
  });

  it("is reached exactly at the cap, whatever cap the adult chose", () => {
    for (const tope of [5, 6, 7, 8, 9, 10]) {
      const justo = jugar(tope * MIN);
      expect(alcanzado(justo, HOY, tope), `tope ${tope}`).toBe(true);
      const antes = jugar(tope * MIN - 100);
      expect(alcanzado(antes, HOY, tope), `tope ${tope} - 100 ms`).toBe(false);
    }
  });

  it("the notice is due once a day: after the adult sees it, the game is not cut again", () => {
    const e = jugar(5 * MIN);
    expect(debeAvisar(e, HOY, 5)).toBe(true);
    const visto = marcarAvisado(e, HOY);
    expect(debeAvisar(visto, HOY, 5)).toBe(false);
    // Still reached (the adult keeps playing) but never «due» again that day, however long.
    const sigue = jugar(3 * MIN, HOY, visto);
    expect(alcanzado(sigue, HOY, 5)).toBe(true);
    expect(debeAvisar(sigue, HOY, 5)).toBe(false);
    expect(minutosJugados(sigue, HOY)).toBe(8);
  });

  it("the calm «hoy ya jugaron» line shows only after today's notice, never from yesterday's", () => {
    const sinVer = jugar(5 * MIN);
    expect(lineaHoyVisible(sinVer, HOY, 5)).toBe(false);
    const visto = marcarAvisado(sinVer, HOY);
    expect(lineaHoyVisible(visto, HOY, 5)).toBe(true);
    expect(lineaHoyVisible(visto, MANANA, 5)).toBe(false);
    expect(lineaHoyVisible(visto, HOY, 10)).toBe(false);
  });

  it("a new day starts from zero, notice included", () => {
    const ayer = marcarAvisado(jugar(6 * MIN), HOY);
    expect(minutosJugados(ayer, MANANA)).toBe(0);
    expect(alcanzado(ayer, MANANA, 5)).toBe(false);
    expect(debeAvisar(ayer, MANANA, 5)).toBe(false);
    expect(delDia(ayer, MANANA)).toEqual({ fecha: MANANA, ms: 0, avisado: false });
    const hoyDeNuevo = acumular(ayer, MANANA, 100);
    expect(hoyDeNuevo).toEqual({ fecha: MANANA, ms: 100, avisado: false });
  });

  it("a frozen tab or a clock jump cannot fill the day, and bad deltas add nothing", () => {
    const e = acumular(PANTALLA_VACIA, HOY, 10 * MIN);
    expect(e.ms).toBe(DELTA_MAX_MS);
    expect(acumular(e, HOY, -500).ms).toBe(DELTA_MAX_MS);
    expect(acumular(e, HOY, Number.NaN).ms).toBe(DELTA_MAX_MS);
    expect(acumular(e, HOY, Number.POSITIVE_INFINITY).ms).toBe(DELTA_MAX_MS);
    expect(acumular(e, HOY, 0).ms).toBe(DELTA_MAX_MS);
  });

  it("is a function of its inputs: it never reads the clock and never mutates", () => {
    const e = jugar(MIN);
    const copia = structuredClone(e);
    acumular(e, HOY, 100);
    marcarAvisado(e, HOY);
    expect(e).toEqual(copia);
  });

  it("the stored shape is validated: only a date, a number of ms and a flag", () => {
    expect(PantallaSchema.safeParse({ fecha: HOY, ms: 1200, avisado: false }).success).toBe(true);
    for (const malo of [
      { fecha: "hoy", ms: 1, avisado: false },
      { fecha: HOY, ms: -1, avisado: false },
      { fecha: HOY, ms: 1.5, avisado: false },
      { fecha: HOY, ms: 1 },
      null,
    ]) {
      expect(PantallaSchema.safeParse(malo).success, JSON.stringify(malo)).toBe(false);
    }
  });
});

describe("the cap's counter in storage (S12)", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps only a date, ms and a flag; a corrupt value starts again from zero", () => {
    expect(leerPantalla()).toEqual(PANTALLA_VACIA);
    guardarPantalla({ fecha: HOY, ms: 90_000, avisado: true });
    expect(leerPantalla()).toEqual({ fecha: HOY, ms: 90_000, avisado: true });
    expect(Object.keys(JSON.parse(window.localStorage.getItem(CLAVES.pantalla)!)).sort()).toEqual([
      "avisado",
      "fecha",
      "ms",
    ]);
    window.localStorage.setItem(CLAVES.pantalla, "{mal");
    expect(leerPantalla()).toEqual(PANTALLA_VACIA);
  });

  it("«Borrar mis datos» lo borra", async () => {
    guardarPantalla({ fecha: HOY, ms: 1000, avisado: false });
    await borrarTodo();
    expect(window.localStorage.getItem(CLAVES.pantalla)).toBeNull();
  });

  it("the cap setting migrates old settings to 10 and clamps nonsense to its range", () => {
    expect(AjustesSchema.parse({}).topeMinutos).toBe(10);
    expect(AjustesSchema.parse({ topeMinutos: 7 }).topeMinutos).toBe(7);
    expect(AjustesSchema.parse({ topeMinutos: 60 }).topeMinutos).toBe(10);
    expect(AjustesSchema.parse({ topeMinutos: 2 }).topeMinutos).toBe(10);
    expect(AjustesSchema.parse({ topeMinutos: "5" }).topeMinutos).toBe(10);
  });
});
