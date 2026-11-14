// Message contract between the page and the vosk-browser Worker (S11, ADR-023; rule 19: every bridge
// has its contract). Only the messages this app uses are typed here; anything else the Worker says is
// dropped by the guards below instead of entering through a blind cast.

export type MensajeAlMotor =
  | { action: "load"; modelUrl: string; wasmUrl: string }
  | {
      action: "create";
      recognizerId: string;
      sampleRate: number;
      grammar: string;
    }
  | { action: "set"; recognizerId: string; key: "words"; value: boolean }
  | {
      action: "audioChunk";
      recognizerId: string;
      data: Float32Array;
      sampleRate: number;
    }
  | { action: "retrieveFinalResult"; recognizerId: string }
  | { action: "remove"; recognizerId: string }
  | { action: "set"; key: "logLevel"; value: number }
  | { action: "terminate" };

export type PalabraVosk = { word: string; conf: number };

export type MensajeDelMotor =
  | { event: "load"; result: boolean }
  | { event: "error"; error: string }
  | {
      event: "result";
      recognizerId: string;
      result: { result: PalabraVosk[] };
    };

const objeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const esPalabraVosk = (v: unknown): v is PalabraVosk =>
  objeto(v) &&
  typeof v.word === "string" &&
  typeof v.conf === "number" &&
  Number.isFinite(v.conf);

/** A final result with words. Partial results and results without words are not used. */
export function esResultadoVosk(
  v: unknown,
): v is Extract<MensajeDelMotor, { event: "result" }> {
  if (!objeto(v) || v.event !== "result" || typeof v.recognizerId !== "string")
    return false;
  if (!objeto(v.result) || !Array.isArray(v.result.result)) return false;
  return v.result.result.every(esPalabraVosk);
}

export function esCargaVosk(
  v: unknown,
): v is Extract<MensajeDelMotor, { event: "load" }> {
  return objeto(v) && v.event === "load" && typeof v.result === "boolean";
}

export function esErrorVosk(
  v: unknown,
): v is Extract<MensajeDelMotor, { event: "error" }> {
  return objeto(v) && v.event === "error" && typeof v.error === "string";
}
