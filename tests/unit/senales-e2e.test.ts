// The two e2e microphone files of S12 (scripts/gen-senales-soplo.mjs) are made from these sequences. Here the
// detectors count what each file contains, exactly, so an e2e failure can never be «the WAV is wrong».

import { describe, expect, it } from "vitest";
import { crearDetectorSoplo } from "@/lib/voice/soplo";
import { crearLectorIntensidad } from "@/lib/voice/intensidad";
import { framesDe, pisoDe } from "../fixtures/frames-worklet";
import {
  TASA,
  secuenciaFuerteSuave,
  secuenciaSoplo,
} from "../fixtures/senales-soplo";

/** As the app does: calibrate on the first 2 s of the file, then play the rest. */
function correr<T>(senal: Float32Array, crear: (piso: number) => { procesar: (f: never) => T }): T {
  const frames = framesDe(senal);
  const calibracion = frames.filter((f) => f.tMs <= 2000);
  const piso = pisoDe(calibracion);
  const d = crear(piso);
  let e!: T;
  for (const f of frames.filter((f) => f.tMs > 2000)) e = d.procesar(f as never);
  return e;
}

describe("the e2e microphone files", () => {
  it("soplo.wav: three blows per pass — the vowel and the «sh» do not add", () => {
    const e = correr(secuenciaSoplo(), (piso) => crearDetectorSoplo({ pisoRuido: piso }));
    expect(e.soplos).toBe(3);
  });

  it("fuerte-suave.wav: four changes per pass, soft↔loud", () => {
    const e = correr(secuenciaFuerteSuave(), (piso) => crearLectorIntensidad({ pisoRuido: piso }));
    expect(e.cambios).toBe(4);
  });

  it("both are longer than the 2.8 s of quiet the calibration needs, and under 20 s", () => {
    for (const s of [secuenciaSoplo(), secuenciaFuerteSuave()]) {
      expect(s.length / TASA).toBeGreaterThan(2.8);
      expect(s.length / TASA).toBeLessThan(20);
    }
  });
});
