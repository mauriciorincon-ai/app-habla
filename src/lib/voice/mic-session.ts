// Sesión de micrófono real: getUserMedia → AudioContext → AudioWorklet (rms-processor).
// Regla dura 2 (privacidad): el audio vive en el grafo de análisis y muere ahí — este módulo
// no persiste, no transmite y no registra nada; del hilo de audio solo llegan escalares (RMS).
// El grafo JAMÁS se conecta a destination: no hay playback.

import { MIC_CONSTRAINTS, type MeterFrame, type MeterSource } from "./types";

// Sufijo de versión manual: el archivo estático no lleva hash de contenido (ADR 004).
// Súbelo si cambia src/worklets/rms-processor.ts.
const WORKLET_URL = "/worklets/rms-processor.js?v=1";

export class MicSession implements MeterSource {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private readonly subscribers = new Set<(frame: MeterFrame) => void>();

  async start(): Promise<void> {
    // Dentro del gesto del usuario: primero el permiso, luego el contexto.
    this.stream = await navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS);
    this.audioContext = new AudioContext();
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    try {
      await this.audioContext.audioWorklet.addModule(WORKLET_URL);
      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        "rms-processor",
      );
    } catch (cause) {
      // El caller decide el fallback (AnalyserSource) — ADR 003.
      this.stop();
      throw new Error("audio-worklet-no-disponible", { cause });
    }
    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    this.sourceNode.connect(this.workletNode);
    this.workletNode.port.onmessage = (event: MessageEvent) => {
      const frame = event.data as MeterFrame;
      for (const cb of this.subscribers) {
        cb(frame);
      }
    };
  }

  stop(): void {
    if (this.workletNode) {
      this.workletNode.port.onmessage = null;
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    this.sourceNode?.disconnect();
    this.sourceNode = null;
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

  /** Settings reales del track — Android puede ignorar constraints; el spike los muestra. */
  getTrackSettings(): MediaTrackSettings | null {
    return this.stream?.getAudioTracks()[0]?.getSettings() ?? null;
  }

  /** Datos del contexto para la matriz de audio del ADR 003. */
  getContextInfo(): { sampleRate: number; baseLatency: number } | null {
    if (!this.audioContext) return null;
    return {
      sampleRate: this.audioContext.sampleRate,
      baseLatency: this.audioContext.baseLatency,
    };
  }
}
