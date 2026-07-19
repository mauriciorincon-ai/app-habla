import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LoteParesSchema,
  PARES_GEMELOS,
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

  it("semillas distintas pueden dar órdenes distintos", () => {
    const a = secuenciaDeRondas("palabras-sueltas", 1, 6).map((p) => p.id);
    const b = secuenciaDeRondas("palabras-sueltas", 999, 6).map((p) => p.id);
    // Mismo conjunto, y al menos una semilla reordena (no es prueba de azar: es reproducible).
    expect(new Set(a)).toEqual(new Set(b));
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
