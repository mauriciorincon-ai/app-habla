import { describe, expect, it } from "vitest";
import { estimarFormantes } from "../../src/worklets/formantes";
import { clasificarVocal, vocalEstable, type Lectura } from "@/lib/voice/vocales";
import {
  F0,
  FORMANTES_ADULTO,
  FORMANTES_NINO,
  sintetizarVocal,
  VOCALES,
  type Voz,
} from "../fixtures/vocales-sinteticas";

// El spike de formantes (S10, ADR-021): se mide con vocales SINTÉTICAS (cero voces reales), por las
// mismas ventanas que ve el worklet (2048 muestras cada 1536, a 48 kHz). La tabla va al ADR-021; los
// pisos de abajo son los que se midieron, con un margen. Si el DSP cambia y la medida baja, este test
// lo dice: la cifra no se ajusta para que pase.

const SR = 48_000;
const VENTANA = 2048;
const PASO = 1536;

type Fila = { voz: Voz; vocal: string; f1: number; f2: number; errF1: number; errF2: number; acierto: number };

function medir(voz: Voz): Fila[] {
  return VOCALES.map((vocal) => {
    const x = sintetizarVocal(vocal, voz, SR, 0.6);
    const f1s: number[] = [];
    const f2s: number[] = [];
    let aciertos = 0;
    let ventanas = 0;
    for (let i = 0; i + VENTANA <= x.length; i += PASO) {
      ventanas++;
      const r = estimarFormantes(x.subarray(i, i + VENTANA), SR);
      if (!r) continue;
      f1s.push(r.f1);
      f2s.push(r.f2);
      if (clasificarVocal(r, F0[voz])?.vocal === vocal) aciertos++;
    }
    const mediana = (a: number[]) => [...a].sort((p, q) => p - q)[Math.floor(a.length / 2)] ?? 0;
    const ref = (voz === "adulto" ? FORMANTES_ADULTO : FORMANTES_NINO)[vocal];
    const f1 = mediana(f1s);
    const f2 = mediana(f2s);
    return {
      voz,
      vocal,
      f1: Math.round(f1),
      f2: Math.round(f2),
      errF1: Math.abs(f1 - ref[0]) / ref[0],
      errF2: Math.abs(f2 - ref[1]) / ref[1],
      acierto: aciertos / ventanas,
    };
  });
}

describe("spike de formantes: la tabla de medida (ADR-021)", () => {
  const filas = [...medir("adulto"), ...medir("nino")];

  it("imprime la tabla", () => {
    const tabla = filas.map((f) => ({
      voz: f.voz,
      vocal: f.vocal,
      F1: f.f1,
      F2: f.f2,
      "err F1 %": +(f.errF1 * 100).toFixed(1),
      "err F2 %": +(f.errF2 * 100).toFixed(1),
      "acierto %": Math.round(f.acierto * 100),
    }));
    console.table(tabla);
    expect(tabla).toHaveLength(10);
  });

  it("voz adulta (F0 120 Hz): error de F1 y F2 ≤ 12 %, acierto ≥ 90 % por vocal", () => {
    for (const f of filas.filter((x) => x.voz === "adulto")) {
      expect(f.errF1, `${f.vocal} F1`).toBeLessThanOrEqual(0.12);
      expect(f.errF2, `${f.vocal} F2`).toBeLessThanOrEqual(0.12);
      expect(f.acierto, `${f.vocal}`).toBeGreaterThanOrEqual(0.9);
    }
  });

  it("voz infantil (F0 300 Hz): error ≤ 15 %, acierto ≥ 80 % por vocal", () => {
    for (const f of filas.filter((x) => x.voz === "nino")) {
      expect(f.errF1, `${f.vocal} F1`).toBeLessThanOrEqual(0.15);
      expect(f.errF2, `${f.vocal} F2`).toBeLessThanOrEqual(0.15);
      expect(f.acierto, `${f.vocal}`).toBeGreaterThanOrEqual(0.8);
    }
  });
});

describe("spike de formantes: la voz infantil más aguda (barrido de F0)", () => {
  // Con F0 alto los armónicos quedan lejos entre sí y la LPC los confunde con formantes: la medida
  // empeora. Se imprime tal cual para el ADR-021; el piso solo vigila que no se derrumbe más.
  it("acierto por vocal a F0 250 · 350 · 400 · 450 Hz", () => {
    const filas = [250, 350, 400, 450].map((f0) => {
      const fila: Record<string, number> = { F0: f0 };
      for (const vocal of VOCALES) {
        const x = sintetizarVocal(vocal, "nino", SR, 0.6, 0.3, 7, f0);
        let ok = 0;
        let n = 0;
        for (let i = 0; i + VENTANA <= x.length; i += PASO) {
          n++;
          if (clasificarVocal(estimarFormantes(x.subarray(i, i + VENTANA), SR), f0)?.vocal === vocal) ok++;
        }
        fila[vocal] = Math.round((ok / n) * 100);
      }
      return fila;
    });
    console.table(filas);
    const promedio =
      filas.flatMap((f) => VOCALES.map((v) => f[v])).reduce((a, b) => a + b, 0) / (filas.length * VOCALES.length);
    expect(promedio).toBeGreaterThanOrEqual(85);
  });
});

describe("lo que el spike NO inventa", () => {
  it("silencio digital: sin formantes", () => {
    expect(estimarFormantes(new Float32Array(VENTANA), SR)).toBeNull();
  });

  it("una ventana demasiado corta: sin formantes", () => {
    expect(estimarFormantes(new Float32Array(40).fill(0.1), SR)).toBeNull();
  });

  it("sin formantes medidos, no se nombra ninguna vocal", () => {
    expect(clasificarVocal(null, 300)).toBeNull();
    expect(clasificarVocal(undefined, null)).toBeNull();
  });

  it("dos números lejos de toda vocal: no se nombra ninguna", () => {
    expect(clasificarVocal({ f1: 2000, f2: 2100 }, 300)).toBeNull();
  });

  it("la vocal se oye solo si se sostiene (tres lecturas iguales)", () => {
    const a: Lectura = { vocal: "a", distancia: 0.1 };
    const e: Lectura = { vocal: "e", distancia: 0.1 };
    expect(vocalEstable([a, a])).toBeNull();
    expect(vocalEstable([a, a, a])).toBe("a");
    expect(vocalEstable([a, e, a])).toBeNull();
    expect(vocalEstable([a, a, null])).toBeNull();
    expect(vocalEstable([null, null, null])).toBeNull();
  });

  it("el F0 elige el mapa: la misma pareja es «o» en un niño y «a» en un adulto", () => {
    expect(clasificarVocal({ f1: 680, f2: 1220 }, 300)?.vocal).toBe("o");
    expect(clasificarVocal({ f1: 720, f2: 1280 }, null)?.vocal).toBe("a");
  });
});
