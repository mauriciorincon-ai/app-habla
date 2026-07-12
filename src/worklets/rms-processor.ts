// AudioWorkletProcessor: RMS acumulado por bloques de 128 muestras, emitido throttled.
// Regla dura 2 (privacidad): este archivo es AUTOCONTENIDO — sin imports, sin storage, sin red,
// sin logs. Las muestras de audio viven en el buffer de análisis y mueren aquí; lo único que
// sale del hilo de audio es un escalar (RMS) con su timestamp.

/** 12 bloques × 128 muestras ≈ 32 ms a 48 kHz (~31 mensajes/s; la UI interpola a 60 fps). */
const BLOCKS_PER_MESSAGE = 12;

class RmsProcessor extends AudioWorkletProcessor {
  private sumSquares = 0;
  private sampleCount = 0;
  private blockCount = 0;

  process(inputs: Float32Array[][]): boolean {
    const channel = inputs[0]?.[0];
    if (!channel || channel.length === 0) {
      // Sin entrada conectada todavía: mantener vivo el processor.
      return true;
    }

    let sum = 0;
    for (let i = 0; i < channel.length; i++) {
      sum += channel[i] * channel[i];
    }
    this.sumSquares += sum;
    this.sampleCount += channel.length;
    this.blockCount += 1;

    if (this.blockCount >= BLOCKS_PER_MESSAGE) {
      const rms = Math.sqrt(this.sumSquares / this.sampleCount);
      this.port.postMessage({ rms, tMs: currentTime * 1000 });
      this.sumSquares = 0;
      this.sampleCount = 0;
      this.blockCount = 0;
    }

    return true;
  }
}

registerProcessor("rms-processor", RmsProcessor);
