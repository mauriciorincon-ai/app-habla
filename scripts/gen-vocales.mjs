// Genera el kit de VOCALES SINTÉTICAS del spike de formantes (S10, ADR-021): cero voces reales.
//   vocales-adulto.wav  F0 120 Hz · vocales-nino.wav  F0 300 Hz
// PCM16 mono 48 kHz, 11,1 s:
//   0.0–2.5 s  piso de ruido (0.002): la calibración necesita un piso real, nunca cero digital
//   2.5–10.1 s a · e · i · o · u, 1,2 s cada una con 0,4 s de silencio entre ellas
//   10.1–11.1 s silencio
// Escribe en tests/e2e/fixtures/ (micrófono falso de la CI) y en docs/kit-de-prueba/ (para el dueño).
// Uso: node scripts/gen-vocales.mjs   (los WAV resultantes se commitean)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sintetizarVocal, VOCALES } from "../tests/fixtures/vocales-sinteticas.ts";

const SR = 48_000;
const RUIDO = 0.002;
const INICIO_S = 2.5;
const VOCAL_S = 1.2;
const PAUSA_S = 0.4;
const FIN_S = 1;

function semilla(n) {
  let s = n >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function wav(muestras) {
  const pcm = new Int16Array(muestras.length);
  for (let i = 0; i < muestras.length; i++) {
    pcm[i] = Math.max(-32768, Math.min(32767, Math.round(muestras[i] * 32767)));
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
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(bytes, 40);
  return Buffer.concat([h, Buffer.from(pcm.buffer)]);
}

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const voz of ["adulto", "nino"]) {
  const total = Math.round(SR * (INICIO_S + VOCALES.length * (VOCAL_S + PAUSA_S) - PAUSA_S + FIN_S));
  const x = new Float32Array(total);
  const azar = semilla(11);
  for (let i = 0; i < total; i++) x[i] = RUIDO * (azar() * 2 - 1);
  VOCALES.forEach((v, k) => {
    const vocal = sintetizarVocal(v, voz, SR, VOCAL_S, 0.3, 7 + k);
    const desde = Math.round(SR * (INICIO_S + k * (VOCAL_S + PAUSA_S)));
    const rampa = Math.round(SR * 0.02); // 20 ms de entrada y salida: sin clics
    for (let i = 0; i < vocal.length; i++) {
      const g = Math.min(1, i / rampa, (vocal.length - 1 - i) / rampa);
      x[desde + i] += vocal[i] * g;
    }
  });
  const archivo = wav(x);
  for (const carpeta of ["tests/e2e/fixtures", "docs/kit-de-prueba"]) {
    const out = resolve(raiz, carpeta, `vocales-${voz}.wav`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, archivo);
    console.log(`OK → ${carpeta}/vocales-${voz}.wav (${(archivo.length / 1024).toFixed(0)} KB)`);
  }
}
