// Synthetic signals for the blow and loudness detectors (S12, ADR-024). Never a recording: every sound
// is made here from numbers, with a seeded generator so the tests are repeatable. Also used by
// scripts/gen-senales-soplo.mjs to write the e2e microphone files.
// Only erasable TypeScript syntax: Node runs this file directly (type stripping).

export const TASA = 48_000;

/** Mulberry32: tiny seeded PRNG (deterministic noise). */
export function azar(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (segundos: number) => Math.round(segundos * TASA);

function rmsDe(x: Float32Array): number {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  return Math.sqrt(s / Math.max(1, x.length));
}

/** Scales a signal to a target RMS. */
export function aRms(x: Float32Array, objetivo: number): Float32Array {
  const r = rmsDe(x);
  if (r === 0) return x;
  const k = objetivo / r;
  for (let i = 0; i < x.length; i++) x[i] *= k;
  return x;
}

export function ruidoBlanco(
  segundos: number,
  amplitud: number,
  semilla = 1,
): Float32Array {
  const r = azar(semilla);
  const x = new Float32Array(n(segundos));
  for (let i = 0; i < x.length; i++) x[i] = amplitud * (r() * 2 - 1);
  return x;
}

/** One-pole low-pass, applied `polos` times (a steeper rumble). */
export function pasaBajos(
  x: Float32Array,
  corteHz: number,
  polos = 2,
): Float32Array {
  const a = Math.exp((-2 * Math.PI * corteHz) / TASA);
  const y = Float32Array.from(x);
  for (let p = 0; p < polos; p++) {
    let previo = 0;
    for (let i = 0; i < y.length; i++) {
      previo = (1 - a) * y[i] + a * previo;
      y[i] = previo;
    }
  }
  return y;
}

/** High-pass as the input minus its low-pass. */
export function pasaAltos(x: Float32Array, corteHz: number): Float32Array {
  const bajos = pasaBajos(x, corteHz, 1);
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) y[i] = x[i] - bajos[i];
  return y;
}

/** A voiced sound: F0 with a few harmonics (a vowel, a hum, a voice). */
export function vocal(segundos: number, f0: number, rms: number): Float32Array {
  const x = new Float32Array(n(segundos));
  for (let i = 0; i < x.length; i++) {
    const t = i / TASA;
    x[i] =
      Math.sin(2 * Math.PI * f0 * t) +
      0.5 * Math.sin(2 * Math.PI * 2 * f0 * t) +
      0.25 * Math.sin(2 * Math.PI * 3 * f0 * t);
  }
  return aRms(x, rms);
}

/** Air on the microphone: low turbulent rumble plus a little wide-band breath. */
export function soplo(
  segundos: number,
  rms: number,
  semilla = 7,
): Float32Array {
  const rumor = pasaBajos(ruidoBlanco(segundos, 1, semilla), 350, 2);
  aRms(rumor, 1);
  const aliento = pasaBajos(ruidoBlanco(segundos, 1, semilla + 1), 2500, 1);
  aRms(aliento, 0.15);
  const x = new Float32Array(rumor.length);
  for (let i = 0; i < x.length; i++) x[i] = rumor[i] + aliento[i];
  return aRms(x, rms);
}

/** «sh»: hiss centred around 2–5 kHz. */
export function sh(segundos: number, rms: number, semilla = 11): Float32Array {
  return aRms(
    pasaBajos(pasaAltos(ruidoBlanco(segundos, 1, semilla), 2000), 5000, 1),
    rms,
  );
}

/** «s»: higher hiss, over 4 kHz. */
export function ese(segundos: number, rms: number, semilla = 13): Float32Array {
  return aRms(pasaAltos(ruidoBlanco(segundos, 1, semilla), 4500), rms);
}

/** A fan: steady low noise (it is what the calibration measures as the floor). */
export function ventilador(
  segundos: number,
  rms: number,
  semilla = 17,
): Float32Array {
  return aRms(pasaBajos(ruidoBlanco(segundos, 1, semilla), 600, 1), rms);
}

/** A TV in the room: a voice over noise. */
export function tele(
  segundos: number,
  rms: number,
  semilla = 19,
): Float32Array {
  const voz = vocal(segundos, 180, rms * 0.9);
  const fondo = aRms(
    pasaBajos(ruidoBlanco(segundos, 1, semilla), 3000, 1),
    rms * 0.35,
  );
  for (let i = 0; i < voz.length; i++) voz[i] += fondo[i];
  return voz;
}

/** Joins pieces, adding a quiet floor everywhere (a real room is never digital zero). */
export function unir(
  piezas: Float32Array[],
  piso = 0.002,
  semilla = 23,
): Float32Array {
  const total = piezas.reduce((s, p) => s + p.length, 0);
  const x = ruidoBlanco(total / TASA, piso, semilla);
  let o = 0;
  for (const p of piezas) {
    for (let i = 0; i < p.length; i++) x[o + i] += p[i];
    o += p.length;
  }
  return x;
}

export const silencio = (segundos: number): Float32Array =>
  new Float32Array(n(segundos));

/** The quiet the app calibrates on at the start of every e2e microphone file (≥ 2.8 s, never digital zero). */
const ARRANQUE_S = 2.8;

/**
 * The e2e microphone for «Soplar» (S12): room quiet, then three blows with a vowel and a «sh» between them
 * (neither must count). One pass = 3 blows. Chromium loops the file, so the e2e asserts «at least one»
 * and shows only that the vowel and the hiss do not add (the unit test below counts exactly 3 per pass).
 */
export function secuenciaSoplo(): Float32Array {
  return unir([
    silencio(ARRANQUE_S),
    soplo(0.7, 0.09, 31),
    silencio(0.7),
    vocal(0.8, 300, 0.09),
    silencio(0.7),
    soplo(0.7, 0.09, 32),
    silencio(0.7),
    sh(0.6, 0.09, 33),
    silencio(0.7),
    soplo(0.7, 0.09, 34),
    silencio(1.2),
  ]);
}

/**
 * The e2e microphone for «Fuerte y suave» (S12): room quiet, then a soft voice, a loud one, soft, loud, soft.
 * One pass = 4 changes. The levels are far from the thresholds so the e2e is not a coin flip.
 */
export function secuenciaFuerteSuave(): Float32Array {
  return unir([
    silencio(ARRANQUE_S),
    vocal(1.0, 300, 0.015),
    vocal(1.0, 300, 0.25),
    vocal(1.0, 300, 0.015),
    vocal(1.0, 300, 0.25),
    vocal(1.0, 300, 0.015),
    silencio(1.2),
  ]);
}
