// Fallback documentado (ADR 003): AnalyserNode + rAF cuando el AudioWorklet no está disponible.
// Misma interfaz MeterSource; el resto de la app no distingue cuál fuente corre.
// Regla dura 2 (privacidad): igual que MicSession — nada se persiste, transmite ni registra.

import { MIC_CONSTRAINTS, type MeterFrame, type MeterSource } from "./types";

export class AnalyserSource implements MeterSource {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;
  private rafId: number | null = null;
  private readonly subscribers = new Set<(frame: MeterFrame) => void>();

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS);
    this.audioContext = new AudioContext();
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.audioContext
      .createMediaStreamSource(this.stream)
      .connect(this.analyser);
    this.buffer = new Float32Array(this.analyser.fftSize);

    const tick = () => {
      if (!this.analyser || !this.audioContext || !this.buffer) return;
      this.analyser.getFloatTimeDomainData(this.buffer);
      let sum = 0;
      for (let i = 0; i < this.buffer.length; i++) {
        sum += this.buffer[i] * this.buffer[i];
      }
      const frame: MeterFrame = {
        rms: Math.sqrt(sum / this.buffer.length),
        tMs: this.audioContext.currentTime * 1000,
      };
      for (const cb of this.subscribers) {
        cb(frame);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.analyser?.disconnect();
    this.analyser = null;
    this.buffer = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close();
    }
    this.audioContext = null;
  }

  subscribe(cb: (frame: MeterFrame) => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }
}
