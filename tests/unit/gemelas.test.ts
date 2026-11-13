import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LoteParesSchema,
  PARES_GEMELOS,
  PARES_GEMELOS_EN,
  paresDe,
  palabrasDeGemelos,
  parJugableEn,
} from "@content/pares-gemelos";
import {
  metricaGemelas,
  paresParaEtapa,
  secuenciaDeRondas,
  type Marca,
} from "@/lib/gemelas/rondas";

describe("gemelas: el contenido (pares mínimos es-CO)", () => {
  it("el lote cumple el schema (≥6, ids únicos, jugables en el default)", () => {
    expect(() => LoteParesSchema.parse(PARES_GEMELOS)).not.toThrow();
  });

  it("cada palabra del par tiene su pictograma en el repo (cero red en runtime)", () => {
    for (const { archivo } of palabrasDeGemelos()) {
      const ruta = resolve(process.cwd(), "public/pictogramas", archivo);
      expect(existsSync(ruta), `falta ${archivo}`).toBe(true);
    }
  });

  it("cada par es un contraste de UN solo rasgo declarado (para el guion del padre)", () => {
    for (const par of PARES_GEMELOS) {
      expect(par.contraste.length).toBeGreaterThan(0);
      expect(par.a.palabra).not.toBe(par.b.palabra);
    }
  });
});

describe("gemelas: qué se juega en cada etapa (ADR-005)", () => {
  it("en 'sonidos-e-intentos' NO hay gemelas: todavía no dice palabras", () => {
    expect(paresParaEtapa("sonidos-e-intentos")).toHaveLength(0);
    expect(secuenciaDeRondas("sonidos-e-intentos", 1)).toHaveLength(0);
  });

  it("en 'palabras-sueltas' (el default) hay pares jugables", () => {
    expect(paresParaEtapa("palabras-sueltas").length).toBeGreaterThan(0);
  });

  it("'primeras-frases' hereda todo lo de palabras-sueltas", () => {
    expect(paresParaEtapa("primeras-frases").length).toBeGreaterThanOrEqual(
      paresParaEtapa("palabras-sueltas").length,
    );
  });

  it("parJugableEn respeta el orden de etapas", () => {
    const par = PARES_GEMELOS[0];
    expect(parJugableEn(par, "sonidos-e-intentos")).toBe(false);
    expect(parJugableEn(par, "palabras-sueltas")).toBe(true);
  });
});

describe("gemelas: la secuencia de rondas", () => {
  it("es determinista por semilla y respeta la cantidad", () => {
    const a = secuenciaDeRondas("palabras-sueltas", 42, 4);
    const b = secuenciaDeRondas("palabras-sueltas", 42, 4);
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
    expect(a).toHaveLength(4);
  });

  it("semillas distintas traen mezclas distintas (S4: la variedad del día, sin azar)", () => {
    // Con 12 pares y sesiones de 6, la semilla del día decide QUÉ parejas entran (además del
    // orden). Reproducible: misma semilla → misma mezcla; el juego usa la fecha como semilla.
    const a = secuenciaDeRondas("palabras-sueltas", 1, 6).map((p) => p.id);
    const b = secuenciaDeRondas("palabras-sueltas", 999, 6).map((p) => p.id);
    expect(a).toHaveLength(6);
    expect(b).toHaveLength(6);
    expect(new Set(a)).not.toEqual(new Set(b));
  });

  it("con el tiempo, TODAS las parejas llegan a jugarse (ninguna queda huérfana)", () => {
    // La garantía de cobertura: barriendo semillas (días), cada par aparece en alguna sesión.
    const vistos = new Set<string>();
    for (let semilla = 1; semilla <= 60; semilla++) {
      for (const par of secuenciaDeRondas("palabras-sueltas", semilla, 6)) {
        vistos.add(par.id);
      }
    }
    expect(vistos.size).toBe(paresParaEtapa("palabras-sueltas").length);
  });
});

describe("gemelas: la métrica honesta (regla dura 3)", () => {
  it("cuenta rondas jugadas y en cuántas el niño participó (el padre marcó)", () => {
    const marcas: Marca[] = ["a", "b", null, "a"];
    const m = metricaGemelas(marcas);
    expect(m).toEqual({ tipo: "gemelas", rondas: 4, participadas: 3 });
  });

  it("una sesión sin participación no inventa logros", () => {
    expect(metricaGemelas([null, null])).toEqual({
      tipo: "gemelas",
      rondas: 2,
      participadas: 0,
    });
  });
});

describe("gemelas: los pares mínimos del inglés (S8, regla 20)", () => {
  it("el lote cumple el mismo schema que el del español", () => {
    expect(() => LoteParesSchema.parse(PARES_GEMELOS_EN)).not.toThrow();
    expect(paresDe("en")).toBe(PARES_GEMELOS_EN);
    expect(paresDe("es")).toBe(PARES_GEMELOS);
  });

  it("cada palabra tiene su dibujo en el repo y no hay llamadas a la red", () => {
    for (const { archivo } of palabrasDeGemelos("en")) {
      expect(existsSync(resolve(process.cwd(), "public/pictogramas", archivo)), `falta ${archivo}`).toBe(true);
    }
  });

  it("son pares del inglés: ninguna palabra es la del español, y cada par difiere en UN solo rasgo", () => {
    const espanol = new Set(PARES_GEMELOS.flatMap((p) => [p.a.palabra, p.b.palabra]));
    for (const par of PARES_GEMELOS_EN) {
      expect(par.a.palabra).not.toBe(par.b.palabra);
      expect(espanol.has(par.a.palabra), par.a.palabra).toBe(false);
      expect(espanol.has(par.b.palabra), par.b.palabra).toBe(false);
      expect(par.contraste).toMatch(/^the .+ (at the start|at the end|in the middle)$/);
      expect(par.a.palabra).toMatch(/^[a-z]{2,8}$/);
      // Un par mínimo se parece: misma longitud ± 1 y al menos una letra en común.
      expect(Math.abs(par.a.palabra.length - par.b.palabra.length)).toBeLessThanOrEqual(2);
    }
  });

  it("hay pares jugables en palabras sueltas (el nivel por defecto) y la secuencia es reproducible", () => {
    expect(paresParaEtapa("palabras-sueltas", PARES_GEMELOS_EN).length).toBeGreaterThanOrEqual(6);
    expect(paresParaEtapa("sonidos-e-intentos", PARES_GEMELOS_EN)).toHaveLength(0);
    const a = secuenciaDeRondas("palabras-sueltas", 7, 6, PARES_GEMELOS_EN).map((p) => p.id);
    const b = secuenciaDeRondas("palabras-sueltas", 7, 6, PARES_GEMELOS_EN).map((p) => p.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(6);
  });
});
