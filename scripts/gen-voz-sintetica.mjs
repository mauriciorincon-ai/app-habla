// Genera tests/e2e/fixtures/voz-sintetica.wav — el "micrófono" de CI.
// PCM16 mono 48 kHz, 8 s, diseñado para ejercitar calibración + histéresis del pipeline RMS:
//   0.0–2.8 s  "silencio": ruido blanco a amplitud 0.002 (NUNCA cero digital — la calibración
//              necesita un piso real)
//   2.8–7.0 s  "voz": seno 220 Hz a amplitud 0.35 con modulación AM de 6 Hz (±20%) — el RMS
//              fluctúa cerca del umbral de salida y ejercita la histéresis de verdad; incluye
//              un micro-silencio de 150 ms en t=4.5 s que la histéresis debe sobrevivir
//   7.0–8.0 s  silencio (0.002) — el personaje debe detenerse
// Chromium loopea el archivo por defecto: los asserts de e2e trabajan por ventanas de tiempo.
// Uso: node scripts/gen-voz-sintetica.mjs   (el fixture resultante se commitea)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 48_000;
const DURATION_S = 8;
const NOISE_AMP = 0.002;
const VOICE_AMP = 0.35;
const VOICE_HZ = 220;
const AM_HZ = 6;
const AM_DEPTH = 0.2;
const VOICE_START_S = 2.8;
const VOICE_END_S = 7.0;
const GAP_START_S = 4.5;
const GAP_END_S = 4.65;

const totalSamples = SAMPLE_RATE * DURATION_S;
const pcm = new Int16Array(totalSamples);

for (let i = 0; i < totalSamples; i++) {
  const t = i / SAMPLE_RATE;
  const enVoz = t >= VOICE_START_S && t < VOICE_END_S && !(t >= GAP_START_S && t < GAP_END_S);
  let sample;
  if (enVoz) {
    const am = 1 + AM_DEPTH * Math.sin(2 * Math.PI * AM_HZ * t);
    sample = VOICE_AMP * am * Math.sin(2 * Math.PI * VOICE_HZ * t);
  } else {
    sample = NOISE_AMP * (Math.random() * 2 - 1);
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
  "../tests/e2e/fixtures/voz-sintetica.wav",
);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, Buffer.from(pcm.buffer)]));
console.log(`OK → ${out} (${((44 + dataBytes) / 1024).toFixed(0)} KB)`);
