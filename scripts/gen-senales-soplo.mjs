// Writes the two e2e fake-microphone files of Sprint 12 (ADR-024):
//   tests/e2e/fixtures/soplo.wav         three blows, a vowel and a «sh» between them (3 blows per pass)
//   tests/e2e/fixtures/fuerte-suave.wav  soft, loud, soft, loud, soft (4 changes per pass)
// Both are PCM16 mono 48 kHz made from numbers (tests/fixtures/senales-soplo.ts, seeded noise): never a
// recording of anyone. Chromium loops each file. The signals are shared with tests/unit/senales-e2e.test.ts,
// which counts what the detectors make of them, so a change here that breaks the e2e breaks that test first.
// Usage: node scripts/gen-senales-soplo.mjs   (the resulting files are committed)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TASA,
  secuenciaFuerteSuave,
  secuenciaSoplo,
} from "../tests/fixtures/senales-soplo.ts";

function wav(x) {
  const pcm = new Int16Array(x.length);
  for (let i = 0; i < x.length; i++) {
    pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767)));
  }
  const bytes = pcm.length * 2;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + bytes, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(TASA, 24);
  h.writeUInt32LE(TASA * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(bytes, 40);
  return Buffer.concat([h, Buffer.from(pcm.buffer)]);
}

const carpeta = resolve(dirname(fileURLToPath(import.meta.url)), "../tests/e2e/fixtures");
mkdirSync(carpeta, { recursive: true });
for (const [nombre, senal] of [
  ["soplo.wav", secuenciaSoplo()],
  ["fuerte-suave.wav", secuenciaFuerteSuave()],
]) {
  const out = resolve(carpeta, nombre);
  const datos = wav(senal);
  writeFileSync(out, datos);
  console.log(`OK → ${out} (${(datos.length / 1024).toFixed(0)} KB, ${(senal.length / TASA).toFixed(1)} s)`);
}
