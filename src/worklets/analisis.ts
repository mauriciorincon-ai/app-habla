// Pure analysis of one window, shared by the AudioWorklet and the unit tests (S12, ADR-024).
// Regla dura 2: no storage, no network, no logs; it receives samples and returns SCALARS only.

/**
 * Búsqueda acotada al rango plausible de una voz infantil con margen (ADR 007). Acotar el rango
 * es la primera línea contra los errores de octava clásicos de YIN — y ahorra CPU en el hilo
 * de audio. El rango de PRODUCTO (200–450 Hz) lo aplica el motor puro; aquí se busca un poco
 * más ancho para no cortar la señal en los bordes.
 */
export const MIN_HZ = 150;
export const MAX_HZ = 500;

/** Umbral de la CMND: por debajo de esto el periodo se considera confiable (valor clásico). */
const YIN_THRESHOLD = 0.15;

/**
 * YIN (cumulative mean normalized difference) sobre la ventana. Devuelve F0 en Hz, o null si
 * no hay un periodo confiable (silencio, ruido, o consonante sorda).
 */
export function detectarPitch(
  buffer: Float32Array,
  sampleRateHz: number,
): number | null {
  const tauMin = Math.floor(sampleRateHz / MAX_HZ);
  const tauMax = Math.min(
    Math.floor(sampleRateHz / MIN_HZ),
    Math.floor(buffer.length / 2),
  );
  if (tauMax <= tauMin) return null;

  // 1. Función de diferencia.
  const diff = new Float32Array(tauMax + 1);
  for (let tau = tauMin; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < buffer.length - tauMax; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    diff[tau] = sum;
  }

  // 2. Diferencia media normalizada acumulada (lo que hace a YIN robusto vs autocorrelación).
  const cmnd = new Float32Array(tauMax + 1);
  cmnd[tauMin] = 1;
  let acumulado = 0;
  for (let tau = tauMin + 1; tau <= tauMax; tau++) {
    acumulado += diff[tau];
    cmnd[tau] = acumulado === 0 ? 1 : (diff[tau] * (tau - tauMin)) / acumulado;
  }

  // 3. Primer mínimo local bajo el umbral (el PRIMERO, no el global: así se evita la octava baja).
  let tauElegido = -1;
  for (let tau = tauMin + 1; tau < tauMax; tau++) {
    if (cmnd[tau] < YIN_THRESHOLD) {
      while (tau + 1 <= tauMax && cmnd[tau + 1] < cmnd[tau]) tau++;
      tauElegido = tau;
      break;
    }
  }
  if (tauElegido === -1) return null;

  // 4. Interpolación parabólica: precisión sub-muestra (sin ella el pitch salta en escalones).
  const x0 = tauElegido > tauMin ? tauElegido - 1 : tauElegido;
  const x2 = tauElegido + 1 <= tauMax ? tauElegido + 1 : tauElegido;
  let tauFinal = tauElegido;
  if (x0 !== tauElegido && x2 !== tauElegido) {
    const s0 = cmnd[x0];
    const s1 = cmnd[tauElegido];
    const s2 = cmnd[x2];
    const denominador = 2 * (2 * s1 - s2 - s0);
    if (denominador !== 0) {
      tauFinal = tauElegido + (s2 - s0) / denominador;
    }
  }

  const hz = sampleRateHz / tauFinal;
  return hz >= MIN_HZ && hz <= MAX_HZ ? hz : null;
}

/**
 * Zero-crossing rate: sign changes per sample (0..1) over `n` samples ending at the ring position.
 * Blowing on a microphone is low, wide-band turbulence (few crossings); a «s» or «sh» is high-pitched
 * hiss (many). Together with energy and the absence of pitch it tells a blow from a fricative (ADR-024).
 */
export function tasaCruces(
  muestras: Float32Array,
  n = muestras.length,
): number {
  const total = Math.min(n, muestras.length);
  if (total < 2) return 0;
  let cruces = 0;
  let previo = muestras[muestras.length - total] >= 0;
  for (let i = muestras.length - total + 1; i < muestras.length; i++) {
    const ahora = muestras[i] >= 0;
    if (ahora !== previo) cruces++;
    previo = ahora;
  }
  return cruces / (total - 1);
}
