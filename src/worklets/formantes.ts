// Formantes F1/F2 por LPC (spike del S10, ADR-021). Módulo PURO: sin globals del worklet, sin
// imports, sin estado. Lo importa `rms-processor.ts` (hilo de audio) y lo prueba Vitest con vocales
// sintéticas (tests/unit/formantes.test.ts). Regla dura 2: recibe muestras en memoria y devuelve dos
// números; nada se guarda ni sale de aquí.
//
// Pasos: diezmado a ≈ 12 kHz (los dos primeros formantes viven bajo 4 kHz, también en la voz de un
// niño) → pre-énfasis → ventana de Hamming → autocorrelación → Levinson-Durbin → raíces del polinomio
// (Durand-Kerner) → los polos con banda angosta son los formantes.

export type Formantes = { f1: number; f2: number };

/** Frecuencia de trabajo tras el diezmado. */
const FS_OBJETIVO = 12_000;
/** Orden del predictor: ≈ fs/1000 + 2 en kHz, un poco menos para no seguir armónicos agudos. */
const ORDEN = 12;
/** Un polo con banda más ancha que esto no es un formante (es la inclinación del espectro). */
const BANDA_MAXIMA_HZ = 500;
const F_MINIMA_HZ = 200;

type Complejo = { re: number; im: number };

/** Promedia de a `factor` muestras (filtro de caja) y se queda con una: anti-alias barato y suficiente. */
export function diezmar(x: Float32Array, factor: number): Float32Array {
  const n = Math.floor(x.length / factor);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < factor; k++) s += x[i * factor + k];
    y[i] = s / factor;
  }
  return y;
}

/** Coeficientes LPC a[0..p] (a[0] = 1) por Levinson-Durbin; null si la señal es degenerada. */
export function lpc(x: Float32Array, orden: number): Float64Array | null {
  const n = x.length;
  const r = new Float64Array(orden + 1);
  for (let lag = 0; lag <= orden; lag++) {
    let s = 0;
    for (let i = lag; i < n; i++) s += x[i] * x[i - lag];
    r[lag] = s;
  }
  if (r[0] <= 0) return null;
  r[0] *= 1 + 1e-9; // un respiro numérico (ruido blanco de -90 dB)
  const a = new Float64Array(orden + 1);
  a[0] = 1;
  let error = r[0];
  const previo = new Float64Array(orden + 1);
  for (let i = 1; i <= orden; i++) {
    let acc = r[i];
    for (let j = 1; j < i; j++) acc += a[j] * r[i - j];
    const k = -acc / error;
    previo.set(a);
    a[i] = k;
    for (let j = 1; j < i; j++) a[j] = previo[j] + k * previo[i - j];
    error *= 1 - k * k;
    if (error <= 0) return null;
  }
  return a;
}

const mul = (a: Complejo, b: Complejo): Complejo => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const div = (a: Complejo, b: Complejo): Complejo => {
  const d = b.re * b.re + b.im * b.im || 1e-30;
  return {
    re: (a.re * b.re + a.im * b.im) / d,
    im: (a.im * b.re - a.re * b.im) / d,
  };
};

/** Raíces de z^p + a1 z^(p-1) + … + ap por Durand-Kerner (Weierstrass). */
export function raices(a: Float64Array): Complejo[] {
  const p = a.length - 1;
  const z: Complejo[] = [];
  // Arranque clásico: puntos en espiral, que no son simétricos respecto del eje real.
  for (let i = 0; i < p; i++) {
    const ang = (2 * Math.PI * i) / p + 0.4;
    z.push({ re: 0.9 * Math.cos(ang), im: 0.9 * Math.sin(ang) });
  }
  const evaluar = (x: Complejo): Complejo => {
    let v: Complejo = { re: 1, im: 0 };
    for (let k = 1; k <= p; k++)
      v = {
        re: v.re * x.re - v.im * x.im + a[k],
        im: v.re * x.im + v.im * x.re,
      };
    return v;
  };
  for (let iter = 0; iter < 80; iter++) {
    let mayor = 0;
    for (let i = 0; i < p; i++) {
      let den: Complejo = { re: 1, im: 0 };
      for (let j = 0; j < p; j++) {
        if (j !== i)
          den = mul(den, { re: z[i].re - z[j].re, im: z[i].im - z[j].im });
      }
      const paso = div(evaluar(z[i]), den);
      z[i] = { re: z[i].re - paso.re, im: z[i].im - paso.im };
      mayor = Math.max(mayor, Math.abs(paso.re) + Math.abs(paso.im));
    }
    if (mayor < 1e-10) break;
  }
  return z;
}

/**
 * F1 y F2 de una ventana con voz. `null` si no hay dos polos que parezcan formantes (silencio,
 * ruido, consonante): el juego no inventa una vocal donde no la midió (regla dura 3).
 */
export function estimarFormantes(
  muestras: Float32Array,
  sampleRateHz: number,
): Formantes | null {
  const factor = Math.max(1, Math.round(sampleRateHz / FS_OBJETIVO));
  const fs = sampleRateHz / factor;
  const d = diezmar(muestras, factor);
  if (d.length < ORDEN * 4) return null;
  // Pre-énfasis y Hamming.
  const w = new Float32Array(d.length);
  for (let i = d.length - 1; i >= 0; i--) {
    const pre = i > 0 ? d[i] - 0.97 * d[i - 1] : d[i];
    w[i] = pre * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (d.length - 1)));
  }
  const a = lpc(w, ORDEN);
  if (!a) return null;
  const candidatos: number[] = [];
  for (const r of raices(a)) {
    if (r.im <= 0) continue;
    const modulo = Math.hypot(r.re, r.im);
    if (!(modulo > 0 && modulo < 1)) continue;
    const hz = (Math.atan2(r.im, r.re) * fs) / (2 * Math.PI);
    const banda = (-Math.log(modulo) * fs) / Math.PI;
    if (hz > F_MINIMA_HZ && hz < fs / 2 - 100 && banda < BANDA_MAXIMA_HZ)
      candidatos.push(hz);
  }
  candidatos.sort((x, y) => x - y);
  if (candidatos.length < 2) return null;
  return { f1: candidatos[0], f2: candidatos[1] };
}
