// S13 (ADR-025): lo que queda de los turnos fuera del juego — la sesión guardada, el resumen, el Rumbo y el
// hito «Juntos». Solo cuentan los turnos DE ÉL.

import { describe, expect, it } from "vitest";
import { construirSesion } from "@/lib/rumbo/sesion";
import { hitosAlcanzados } from "@/lib/rumbo/hitos";
import { tendenciasPorSemana } from "@/lib/rumbo/tendencias";
import {
  AJUSTES_DEFECTO,
  AjustesSchema,
  SesionSchema,
} from "@/lib/storage/schemas";

const globo = { tipo: "sostenido", ms: 4000, rachaMs: 3000 } as const;

describe("turnos: lo guardado y lo que se resume", () => {
  it("la sesión guarda los turnos de él solo si hubo alguno", () => {
    expect(construirSesion(globo, "2026-11-10")).not.toHaveProperty(
      "turnosNino",
    );
    expect(construirSesion(globo, "2026-11-10", [], 4)).toMatchObject({
      juego: "globo",
      turnosNino: 4,
    });
  });

  it("el esquema acepta los turnos, y una sesión vieja sin ellos sigue valiendo", () => {
    const nueva = construirSesion(globo, "2026-11-10", [], 3);
    expect(SesionSchema.parse(nueva)).toEqual(nueva);
    expect(
      SesionSchema.safeParse({
        juego: "globo",
        fecha: "2026-11-10",
        vozMs: 1,
        rachaMs: 1,
      }).success,
    ).toBe(true);
  });

  it("el Rumbo suma por semana solo los turnos de él", () => {
    const semanas = tendenciasPorSemana([
      construirSesion(globo, "2026-11-10", [], 3),
      construirSesion(globo, "2026-11-11", [], 2),
      construirSesion(globo, "2026-11-12"),
    ]);
    expect(semanas[0].turnosNino).toBe(5);
  });

  it("«Juntos» exige tres turnos suyos en un mismo juego: dos no bastan", () => {
    const ids = (n: number) =>
      hitosAlcanzados([construirSesion(globo, "2026-11-10", [], n)]).map(
        (h) => h.id,
      );
    expect(ids(2)).not.toContain("juntos-por-turnos");
    expect(ids(3)).toContain("juntos-por-turnos");
  });

  it("el apuntador viene encendido, y un ajuste guardado antes lo recibe encendido", () => {
    expect(AJUSTES_DEFECTO.apuntador).toBe(true);
    const viejo: Record<string, unknown> = { ...AJUSTES_DEFECTO };
    delete viejo.apuntador;
    expect(AjustesSchema.parse(viejo).apuntador).toBe(true);
    expect(AjustesSchema.parse({ ...viejo, apuntador: false }).apuntador).toBe(
      false,
    );
  });
});
