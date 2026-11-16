import { describe, expect, it } from "vitest";
import { claveCelebracion } from "@/lib/banco-voz/celebracion";

// LA CELEBRACIÓN CON LA VOZ DE LA FAMILIA (S15, ADR-027): la frase grabada sale SOLO de lo medido en su
// turno; «dijo la palabra» solo cuando el adulto lo marcó; «casi» por fin suena cuando no hubo voz.

describe("qué frase grabada dice la celebración", () => {
  it("sin voz medida, «casi» (sin drama, sin culpa)", () => {
    expect(claveCelebracion({ tipo: "sostenido", ms: 100, rachaMs: 100 })).toBe("casi");
    expect(claveCelebracion({ tipo: "soplos", soplos: 0, soploMs: 0 })).toBe("casi");
    expect(claveCelebracion({ tipo: "gemelas", rondas: 0, participadas: 0 })).toBe("casi");
  });

  it("con voz medida, «le salió»", () => {
    expect(claveCelebracion({ tipo: "sostenido", ms: 2000, rachaMs: 900 })).toBe("le-salio");
    expect(claveCelebracion({ tipo: "inversiones", veces: 2 })).toBe("le-salio");
    expect(claveCelebracion({ tipo: "activaciones", veces: 3, reconocidas: 0 })).toBe("le-salio");
    expect(claveCelebracion({ tipo: "vocales", zonas: 2, cambios: 1 })).toBe("le-salio");
    expect(claveCelebracion({ tipo: "intensidad", cambios: 1 })).toBe("le-salio");
  });

  it("«dijo la palabra» solo cuando el ADULTO la marcó", () => {
    expect(claveCelebracion({ tipo: "activaciones", veces: 3, reconocidas: 1 })).toBe("dijo-palabra");
    expect(claveCelebracion({ tipo: "gemelas", rondas: 4, participadas: 2 })).toBe("dijo-palabra");
  });

  it("gemelas sin marcas no afirma nada: no hubo voz medida", () => {
    expect(claveCelebracion({ tipo: "gemelas", rondas: 3, participadas: 0 })).toBeNull();
  });
});
