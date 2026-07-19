import { describe, expect, it } from "vitest";
import { claveFechaLocal, lunesDeLaSemana } from "@/lib/fecha";

/** Reconstruye un Date local desde una clave YYYY-MM-DD (para inspeccionar el día de la semana). */
function comoFecha(clave: string): Date {
  const [a, m, d] = clave.split("-").map(Number);
  return new Date(a, m - 1, d);
}

describe("fecha local (nunca UTC)", () => {
  it("las 8 p. m. en Colombia siguen siendo el mismo día (no salta a UTC)", () => {
    const nocheEnColombia = new Date(2026, 6, 11, 20, 0, 0);
    expect(claveFechaLocal(nocheEnColombia)).toBe("2026-07-11");
  });
});

describe("lunesDeLaSemana: agrupa por semana (lunes a domingo)", () => {
  const lunes = lunesDeLaSemana("2026-07-15");

  it("devuelve un lunes de verdad", () => {
    expect(comoFecha(lunes).getDay()).toBe(1); // 1 = lunes
  });

  it("el lunes mapea a sí mismo", () => {
    expect(lunesDeLaSemana(lunes)).toBe(lunes);
  });

  it("los 7 días de esa semana caen en el mismo lunes; el 8.º ya es la semana siguiente", () => {
    const base = comoFecha(lunes);
    for (let i = 0; i < 7; i++) {
      const dia = new Date(base);
      dia.setDate(base.getDate() + i);
      expect(lunesDeLaSemana(claveFechaLocal(dia))).toBe(lunes);
    }
    const octavo = new Date(base);
    octavo.setDate(base.getDate() + 7);
    expect(lunesDeLaSemana(claveFechaLocal(octavo))).not.toBe(lunes);
  });
});
