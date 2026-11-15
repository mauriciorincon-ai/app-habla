// Turns a synthetic signal into the frames the AudioWorklet would publish (same block size, same window,
// same YIN and zero-crossing code: src/worklets/analisis.ts). Unit tests only.

import { detectarPitch, tasaCruces } from "../../src/worklets/analisis";
import type { MeterFrame } from "@/lib/voice/types";
import { TASA } from "./senales-soplo";

const BLOQUE = 128 * 12;
const VENTANA = 2048;
const RMS_MINIMO_PARA_PITCH = 0.01;

export function framesDe(x: Float32Array): MeterFrame[] {
  const frames: MeterFrame[] = [];
  for (let fin = BLOQUE; fin <= x.length; fin += BLOQUE) {
    let s = 0;
    for (let i = fin - BLOQUE; i < fin; i++) s += x[i] * x[i];
    const rms = Math.sqrt(s / BLOQUE);
    const ventana = new Float32Array(VENTANA);
    const desde = fin - VENTANA;
    for (let i = 0; i < VENTANA; i++)
      ventana[i] = desde + i >= 0 ? x[desde + i] : 0;
    const pitchHz =
      rms >= RMS_MINIMO_PARA_PITCH ? detectarPitch(ventana, TASA) : null;
    const zcr = tasaCruces(ventana, BLOQUE);
    frames.push({ rms, pitchHz, tMs: (fin / TASA) * 1000, zcr });
  }
  return frames;
}

/** The calibration floor as the app computes it (75th percentile of 2 s of the room). */
export function pisoDe(frames: MeterFrame[]): number {
  const v = frames.map((f) => f.rms).sort((a, b) => a - b);
  return v[Math.floor(0.75 * (v.length - 1))] ?? 0;
}
