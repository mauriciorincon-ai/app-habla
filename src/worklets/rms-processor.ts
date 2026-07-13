// AudioWorkletProcessor: RMS acumulado por bloques de 128 muestras + F0 (pitch) por YIN,
// emitidos throttled (~31 mensajes/s).
//
// Regla dura 2 (privacidad): este archivo es AUTOCONTENIDO — sin imports, sin storage, sin red,
// sin logs. Las muestras de audio viven en el buffer de análisis y mueren aquí; lo único que
// sale del hilo de audio son escalares (RMS y, cuando hay voz, F0 en Hz). El pitch es dato
// DERIVADO de la voz del niño: se trata con la misma regla que el audio (ADR 007).

/** 12 bloques × 128 muestras ≈ 32 ms a 48 kHz (~31 mensajes/s; la UI interpola a 60 fps). */
const BLOCKS_PER_MESSAGE = 12;

/** Ventana de análisis de YIN: 2048 muestras ≈ 43 ms a 48 kHz (≥2 periodos incluso a 150 Hz). */
const WINDOW_SIZE = 2048;

/**
 * Búsqueda acotada al rango plausible de una voz infantil con margen (ADR 007). Acotar el rango
 * es la primera línea contra los errores de octava clásicos de YIN — y ahorra CPU en el hilo
 * de audio. El rango de PRODUCTO (200–450 Hz) lo aplica el motor puro; aquí se busca un poco
 * más ancho para no cortar la señal en los bordes.
 */
const MIN_HZ = 150;
const MAX_HZ = 500;

/** Umbral de la CMND: por debajo de esto el periodo se considera confiable (valor clásico). */
const YIN_THRESHOLD = 0.15;

/** Bajo este RMS no se intenta pitch: el ruido de fondo NO debe producir F0 fantasma. */
const RMS_MINIMO_PARA_PITCH = 0.01;

/**
 * YIN (cumulative mean normalized difference) sobre la ventana. Devuelve F0 en Hz, o null si
 * no hay un periodo confiable (silencio, ruido, o consonante sorda).
 */
function detectarPitch(
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

class RmsProcessor extends AudioWorkletProcessor {
  private sumSquares = 0;
  private sampleCount = 0;
  private blockCount = 0;
  /** Ring buffer con las últimas WINDOW_SIZE muestras — la ventana que ve YIN. */
  private readonly ventana = new Float32Array(WINDOW_SIZE);
  private escritura = 0;
  private readonly ordenada = new Float32Array(WINDOW_SIZE);

  process(inputs: Float32Array[][]): boolean {
    const channel = inputs[0]?.[0];
    if (!channel || channel.length === 0) {
      // Sin entrada conectada todavía: mantener vivo el processor.
      return true;
    }

    let sum = 0;
    for (let i = 0; i < channel.length; i++) {
      const muestra = channel[i];
      sum += muestra * muestra;
      this.ventana[this.escritura] = muestra;
      this.escritura = (this.escritura + 1) % WINDOW_SIZE;
    }
    this.sumSquares += sum;
    this.sampleCount += channel.length;
    this.blockCount += 1;

    if (this.blockCount >= BLOCKS_PER_MESSAGE) {
      const rms = Math.sqrt(this.sumSquares / this.sampleCount);

      // Gating por energía: sin voz no se calcula pitch (ni se emite uno fantasma).
      let pitchHz: number | null = null;
      if (rms >= RMS_MINIMO_PARA_PITCH) {
        // Desenrolla el ring buffer a orden cronológico antes de analizarlo.
        for (let i = 0; i < WINDOW_SIZE; i++) {
          this.ordenada[i] = this.ventana[(this.escritura + i) % WINDOW_SIZE];
        }
        pitchHz = detectarPitch(this.ordenada, sampleRate);
      }

      this.port.postMessage({ rms, pitchHz, tMs: currentTime * 1000 });
      this.sumSquares = 0;
      this.sampleCount = 0;
      this.blockCount = 0;
    }

    return true;
  }
}

registerProcessor("rms-processor", RmsProcessor);
