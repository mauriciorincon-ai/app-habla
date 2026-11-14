// Sesión de micrófono real: getUserMedia → AudioContext → AudioWorklet (rms-processor).
// Regla dura 2 (privacidad): el audio vive en el grafo de análisis y muere ahí — este módulo
// no persiste, no transmite y no registra nada; del hilo de audio solo llegan escalares (RMS, F0 y, desde el S10, F1/F2).
// El grafo JAMÁS se conecta a destination: no hay playback.

import {
  esMeterFrame,
  MIC_CONSTRAINTS,
  type MeterFrame,
  type MeterSource,
} from "./types";

// Sufijo de versión manual: el archivo estático no lleva hash de contenido (ADR 004).
// Súbelo si cambia src/worklets/rms-processor.ts o src/worklets/formantes.ts
// (el import interno `./formantes.js` no lleva sufijo: el módulo principal manda la caché).
const WORKLET_URL = "/worklets/rms-processor.js?v=3";
/** Second branch, only while the recognizer is on (S11, ADR-023). Bump `v` when pcm-tap.ts changes. */
const TAP_URL = "/worklets/pcm-tap.js?v=1";

/** A block of samples from the pcm-tap worklet (rule 19: typed, guarded). */
type BloquePcm = { tipo: "pcm"; muestras: Float32Array; sampleRate: number };
const esBloquePcm = (v: unknown): v is BloquePcm =>
  typeof v === "object" &&
  v !== null &&
  (v as Record<string, unknown>).tipo === "pcm" &&
  (v as Record<string, unknown>).muestras instanceof Float32Array;

export class MicSession implements MeterSource {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private tapNode: AudioWorkletNode | null = null;
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
      const frame: unknown = event.data;
      if (!esMeterFrame(frame)) return; // regla 19: lo que no es un frame no entra
      for (const cb of this.subscribers) {
        cb(frame);
      }
    };
  }

  /**
   * Opens the recognizer's branch of the graph (S11, ADR-023): blocks of samples go to `alMuestras`
   * and nowhere else. Returns the function that closes the branch. The meter branch is untouched.
   */
  async abrirTapPcm(alMuestras: (muestras: Float32Array) => void): Promise<() => void> {
    if (!this.audioContext || !this.sourceNode) throw new Error("mic-no-iniciado");
    if (this.tapNode) this.cerrarTap();
    await this.audioContext.audioWorklet.addModule(TAP_URL);
    const nodo = new AudioWorkletNode(this.audioContext, "pcm-tap");
    nodo.port.onmessage = (event: MessageEvent) => {
      const bloque: unknown = event.data;
      if (esBloquePcm(bloque)) alMuestras(bloque.muestras);
    };
    this.sourceNode.connect(nodo);
    this.tapNode = nodo;
    return () => this.cerrarTap();
  }

  private cerrarTap(): void {
    if (!this.tapNode) return;
    try {
      this.sourceNode?.disconnect(this.tapNode);
    } catch {
      // already disconnected: nothing to undo
    }
    this.tapNode.port.postMessage("close");
    this.tapNode.port.onmessage = null;
    this.tapNode.disconnect();
    this.tapNode = null;
  }

  stop(): void {
    this.cerrarTap();
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
