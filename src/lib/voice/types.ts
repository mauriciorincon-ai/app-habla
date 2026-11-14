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
  /**
   * F1/F2 (Hz) del spike de formantes (S10, ADR-021). Opcional: solo lo publica el worklet, y es null
   * bajo el gate de energía o cuando la ventana no tiene dos formantes claros. Dato DERIVADO de la voz:
   * vive en memoria como el pitch.
   */
  formantes?: Formantes | null;
};

export type Formantes = { f1: number; f2: number };

const numeroFinito = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * Guardia del contrato worklet → página (regla 19): un mensaje que no tiene la forma del frame se
 * descarta en vez de entrar con un cast ciego.
 */
export function esMeterFrame(v: unknown): v is MeterFrame {
  if (!v || typeof v !== "object") return false;
  const f = v as Record<string, unknown>;
  if (!numeroFinito(f.rms) || !numeroFinito(f.tMs)) return false;
  if (f.pitchHz !== null && !numeroFinito(f.pitchHz)) return false;
  if (f.formantes === undefined || f.formantes === null) return true;
  if (typeof f.formantes !== "object") return false;
  const fo = f.formantes as Record<string, unknown>;
  return numeroFinito(fo.f1) && numeroFinito(fo.f2);
}

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
