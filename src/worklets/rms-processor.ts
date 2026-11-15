// AudioWorkletProcessor: RMS acumulado por bloques de 128 muestras + F0 (pitch) por YIN,
// emitidos throttled (~31 mensajes/s). Desde el S10 también F1/F2 (spike de formantes, ADR-021).
//
// Regla dura 2 (privacidad): este archivo no tiene storage, ni red, ni logs; sus imports son los
// módulos puros de formantes (S10, ADR-021) y de análisis (YIN y cruces por cero, S12, ADR-024), hermanos en esta carpeta sellada. Las muestras de audio viven en el buffer de análisis y mueren aquí; lo único que
// sale del hilo de audio son escalares (RMS, cruces por cero y, cuando hay voz, F0 en Hz). El pitch es dato
// DERIVADO de la voz del niño: se trata con la misma regla que el audio (ADR 007).

/** 12 bloques × 128 muestras ≈ 32 ms a 48 kHz (~31 mensajes/s; la UI interpola a 60 fps). */
const BLOCKS_PER_MESSAGE = 12;

/** Ventana de análisis de YIN: 2048 muestras ≈ 43 ms a 48 kHz (≥2 periodos incluso a 150 Hz). */
const WINDOW_SIZE = 2048;

/** Bajo este RMS no se intenta pitch: el ruido de fondo NO debe producir F0 fantasma. */
const RMS_MINIMO_PARA_PITCH = 0.01;

import { estimarFormantes, type Formantes } from "./formantes.js";
import { detectarPitch, tasaCruces } from "./analisis.js";

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
      // Zero crossings over the samples of THIS message (S12, ADR-024): a scalar, like the RMS.
      for (let i = 0; i < WINDOW_SIZE; i++) {
        this.ordenada[i] = this.ventana[(this.escritura + i) % WINDOW_SIZE];
      }
      const zcr = tasaCruces(this.ordenada, Math.min(this.sampleCount, WINDOW_SIZE));

      // Gating por energía: sin voz no se calcula pitch (ni se emite uno fantasma).
      let pitchHz: number | null = null;
      let formantes: Formantes | null = null;
      if (rms >= RMS_MINIMO_PARA_PITCH) {
        // The ring buffer is already unrolled in chronological order (above).
        pitchHz = detectarPitch(this.ordenada, sampleRate);
        // El mismo gate de energía: bajo el umbral no hay formantes (ni fantasmas del ruido).
        formantes = estimarFormantes(this.ordenada, sampleRate);
      }

      this.port.postMessage({ rms, pitchHz, tMs: currentTime * 1000, formantes, zcr });
      this.sumSquares = 0;
      this.sampleCount = 0;
      this.blockCount = 0;
    }

    return true;
  }
}

registerProcessor("rms-processor", RmsProcessor);
