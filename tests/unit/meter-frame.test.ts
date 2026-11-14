import { describe, expect, it } from "vitest";
import { esMeterFrame } from "@/lib/voice/types";

// Contrato worklet → página (regla 19): el frame se valida antes de entrar; con formantes o sin ellos.
describe("esMeterFrame", () => {
  it("acepta los frames de antes del S10 (sin formantes) y los nuevos", () => {
    expect(esMeterFrame({ rms: 0.1, pitchHz: null, tMs: 5 })).toBe(true);
    expect(esMeterFrame({ rms: 0.1, pitchHz: 300, tMs: 5, formantes: null })).toBe(true);
    expect(esMeterFrame({ rms: 0.1, pitchHz: 300, tMs: 5, formantes: { f1: 700, f2: 1200 } })).toBe(true);
  });

  it("rechaza lo que no tiene la forma", () => {
    for (const malo of [
      null,
      "hola",
      { rms: "0.1", pitchHz: null, tMs: 5 },
      { rms: 0.1, pitchHz: "300", tMs: 5 },
      { rms: Number.NaN, pitchHz: null, tMs: 5 },
      { rms: 0.1, pitchHz: null },
      { rms: 0.1, pitchHz: null, tMs: 5, formantes: { f1: 700 } },
      { rms: 0.1, pitchHz: null, tMs: 5, formantes: 3 },
    ]) {
      expect(esMeterFrame(malo), JSON.stringify(malo)).toBe(false);
    }
  });
});
