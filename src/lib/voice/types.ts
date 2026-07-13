// Contratos del medidor de voz. La UI y los motores puros hablan SOLO este lenguaje;
// nadie fuera de lib/voice toca Web Audio crudo.

/**
 * Un frame del medidor: RMS del bloque analizado + F0 (pitch) cuando hay voz + timestamp del
 * reloj de audio (ms). El contrato CRECE (no se duplica): los dos juegos de voz leen el mismo
 * frame. `pitchHz` es null cuando no hay voz o el periodo no es confiable (ADR 007) — el ruido
 * de la casa jamás produce un pitch fantasma.
 */
export type MeterFrame = {
  rms: number;
  pitchHz: number | null;
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
