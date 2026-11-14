// Vocales SINTÉTICAS para el spike de formantes (S10, ADR-021): cero voces reales. Una fuente glotal
// (tren de pulsos con un leve temblor) pasa por resonadores en cascada (Klatt) puestos en los
// formantes de cada vocal. Determinista (semilla fija): la tabla de medida sale igual cada vez.
// La usan tests/unit/formantes.test.ts (en memoria) y scripts/gen-vocales.mjs (los WAV del kit).
// Sin imports a propósito: Node la carga como .ts sin compilar.

export type Vocal = "a" | "e" | "i" | "o" | "u";
export const VOCALES: readonly Vocal[] = ["a", "e", "i", "o", "u"];

/** Formantes de referencia (Hz): F1, F2, F3, F4. Valores de manual para el español. */
export const FORMANTES_ADULTO: Record<Vocal, readonly number[]> = {
  a: [750, 1300, 2500, 3500],
  e: [460, 1850, 2550, 3500],
  i: [290, 2250, 2900, 3600],
  o: [480, 900, 2450, 3400],
  u: [310, 750, 2400, 3400],
};

/** Una voz infantil tiene el tracto más corto: los formantes suben ≈ 35 %. */
export const FORMANTES_NINO: Record<Vocal, readonly number[]> = {
  a: [1000, 1750, 3300, 4300],
  e: [620, 2500, 3400, 4300],
  i: [390, 3000, 3700, 4500],
  o: [650, 1200, 3300, 4300],
  u: [420, 1000, 3200, 4200],
};

const BANDAS = [80, 100, 140, 200];

export type Voz = "adulto" | "nino";
export const F0: Record<Voz, number> = { adulto: 120, nino: 300 };

function semilla(n: number): () => number {
  let s = n >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** `duracionS` de la vocal a `sampleRate`, amplitud pico ≈ `amplitud`. */
export function sintetizarVocal(
  vocal: Vocal,
  voz: Voz,
  sampleRate: number,
  duracionS: number,
  amplitud = 0.3,
  semillaN = 7,
  f0Hz: number = F0[voz],
): Float32Array {
  const azar = semilla(semillaN);
  const n = Math.round(sampleRate * duracionS);
  const fuente = new Float64Array(n);
  const f0 = f0Hz;
  let siguiente = 0;
  for (let i = 0; i < n; i++) {
    if (i >= siguiente) {
      fuente[i] = 1;
      const temblor = 1 + (azar() - 0.5) * 0.02; // ±1 %
      siguiente = i + sampleRate / (f0 * temblor);
    }
  }
  // Inclinación glotal (−6 dB/oct) y un soplo de aire muy bajo.
  let y = new Float64Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    prev = fuente[i] + 0.97 * prev + (azar() - 0.5) * 0.002;
    y[i] = prev;
  }
  const formantes =
    voz === "adulto" ? FORMANTES_ADULTO[vocal] : FORMANTES_NINO[vocal];
  formantes.forEach((f, k) => {
    if (f >= sampleRate / 2) return;
    const t = 1 / sampleRate;
    const c = -Math.exp(-2 * Math.PI * BANDAS[k] * t);
    const b =
      2 * Math.exp(-Math.PI * BANDAS[k] * t) * Math.cos(2 * Math.PI * f * t);
    const a = 1 - b - c;
    const salida = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      salida[i] =
        a * y[i] +
        b * (i > 0 ? salida[i - 1] : 0) +
        c * (i > 1 ? salida[i - 2] : 0);
    }
    y = salida;
  });
  let pico = 0;
  for (let i = 0; i < n; i++) pico = Math.max(pico, Math.abs(y[i]));
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = (y[i] / (pico || 1)) * amplitud;
  return out;
}
