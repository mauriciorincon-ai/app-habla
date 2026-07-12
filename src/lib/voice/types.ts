// Contratos del medidor de voz. La UI y los motores puros hablan SOLO este lenguaje;
// nadie fuera de lib/voice toca Web Audio crudo.

/** Un frame del medidor: RMS del bloque analizado + timestamp del reloj de audio (ms). */
export type MeterFrame = {
  rms: number;
  tMs: number;
};

/**
 * Fuente de frames del medidor. Implementaciones: MicSession (AudioWorklet, la real),
 * AnalyserSource (fallback documentado) y ScriptedSource (solo builds de e2e).
 */
export interface MeterSource {
  /** Debe llamarse dentro del gesto del usuario (autoplay policy). */
  start(): Promise<void>;
  /** Detiene tracks, cierra el AudioContext y libera todo. Idempotente. */
  stop(): void;
  /** Devuelve la función de desuscripción. */
  subscribe(cb: (frame: MeterFrame) => void): () => void;
}

/** Constraints fijas del producto: sin procesamiento del navegador que ensucie el RMS. */
export const MIC_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
};
