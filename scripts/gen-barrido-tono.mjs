// Genera tests/e2e/fixtures/barrido-tono.wav — el "micrófono que canta" de CI (ADR 007).
// PCM16 mono 48 kHz, 11 s. Ejercita el pipeline de PITCH completo (YIN en el worklet →
// pitch-tracker → cohete):
//   0.0–2.8 s   "silencio": ruido blanco a 0.002 (nunca cero digital — la calibración necesita
//               un piso real, igual que en voz-sintetica.wav)
//   2.8–10.0 s  "voz que canta": barrido de tono continuo (fase integrada, sin clics) entre
//               230 Hz y 420 Hz — dentro del rango de voz infantil (200–450 Hz):
//                 sube · baja · sube · baja  →  3 inversiones (la meta del cohete)
//               Amplitud 0.35 + 2 armónicos débiles: una voz real no es un seno puro, y con
//               armónicos YIN trabaja como trabajará de verdad.
//   10.0–11.0 s silencio (0.002) — el cohete debe quedarse quieto, jamás caer.
// Chromium loopea el archivo: los asserts de e2e trabajan por ventanas de tiempo.
// Uso: node scripts/gen-barrido-tono.mjs   (el fixture resultante se commitea)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 48_000;
const DURATION_S = 11;
const NOISE_AMP = 0.002;
const VOICE_AMP = 0.35;

const GRAVE_HZ = 230;
const AGUDO_HZ = 420;

/** Tramos del canto: [inicio_s, fin_s, hz_inicio, hz_fin] — cada cambio de sentido es una inversión. */
const TRAMOS = [
  [2.8, 4.6, GRAVE_HZ, AGUDO_HZ], // sube
  [4.6, 6.4, AGUDO_HZ, GRAVE_HZ], // baja  → inversión 1
  [6.4, 8.2, GRAVE_HZ, AGUDO_HZ], // sube  → inversión 2
  [8.2, 10.0, AGUDO_HZ, GRAVE_HZ], // baja → inversión 3
];

/** Frecuencia instantánea en el segundo t (null = no hay voz). */
function frecuenciaEn(t) {
  for (const [inicio, fin, desde, hasta] of TRAMOS) {
    if (t >= inicio && t < fin) {
      const avance = (t - inicio) / (fin - inicio);
      return desde + (hasta - desde) * avance;
    }
  }
  return null;
}

const totalSamples = SAMPLE_RATE * DURATION_S;
const pcm = new Int16Array(totalSamples);

// La fase se INTEGRA (no se calcula como 2π·f·t): así el barrido no tiene saltos audibles ni
// discontinuidades que confundirían al detector de periodo.
let fase = 0;

for (let i = 0; i < totalSamples; i++) {
  const t = i / SAMPLE_RATE;
  const hz = frecuenciaEn(t);

  let sample;
  if (hz === null) {
    sample = NOISE_AMP * (Math.random() * 2 - 1);
  } else {
    fase += (2 * Math.PI * hz) / SAMPLE_RATE;
    sample =
      VOICE_AMP *
      (Math.sin(fase) + 0.3 * Math.sin(2 * fase) + 0.15 * Math.sin(3 * fase));
  }

  pcm[i] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
}

// Cabecera WAV (RIFF/PCM16 mono).
const dataBytes = pcm.length * 2;
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + dataBytes, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16); // tamaño del bloque fmt
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
header.writeUInt16LE(2, 32); // block align
header.writeUInt16LE(16, 34); // bits por muestra
header.write("data", 36);
header.writeUInt32LE(dataBytes, 40);

const out = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../tests/e2e/fixtures/barrido-tono.wav",
);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, Buffer.from(pcm.buffer)]));
console.log(`OK → ${out} (${((44 + dataBytes) / 1024).toFixed(0)} KB)`);
