// «¿Dijo la palabra?» — the listening half (S11, ADR-023). Talks to the on-device recognizer (a vosk
// Worker the caller already created, network removed by its prelude) and hands back ONLY a word and a
// confidence. Nothing else crosses back: not text, not timings, not audio.
//
// Hard rule 2: this module has no storage, no network and no logs (tests/unit/privacidad-voice.test.ts).
// Audio blocks arrive by transfer from the pcm-tap worklet, go to the Worker by transfer, and die there.

import {
  esCargaVosk,
  esErrorVosk,
  esResultadoVosk,
  type MensajeAlMotor,
} from "./protocolo-vosk";

/** What the page learns from the recognizer: one word of the grammar and how sure it is (0–1). */
export type Oido = { palabra: string; conf: number };

/** The minimum of a Worker this module needs (a fake one in unit tests). */
export interface PuertoMotor {
  postMessage(message: MensajeAlMotor, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent) => void) | null;
  terminate(): void;
}

export type OpcionesEscucha = {
  motor: PuertoMotor;
  /** Stable model address (it names the Worker's cache of the unpacked model). */
  modelUrl: string;
  /** Address of the wasm the Worker loads (a blob: URL of the verified file). */
  wasmUrl: string;
  /** Closed vocabulary: the game's words plus "[unk]" (src/lib/reconocer/gramatica.ts). */
  gramatica: readonly string[];
  /** Rate the recognizer is created with (the model's own: 16 kHz). */
  sampleRate: number;
  /** Rate of the incoming blocks, if it differs (the page's AudioContext often runs at 44.1/48 kHz). */
  tasaEntrada?: number;
  alOir: (oido: Oido) => void;
};

export type Escucha = {
  /** Resolves when the model is ready; rejects if the Worker reports an error first. */
  lista: Promise<void>;
  /** One block of microphone samples (moved, not copied). Ignored until the model is ready. */
  oir(muestras: Float32Array): void;
  /** Closes the current utterance (end of round): the recognizer says what it has, if anything. */
  cerrarFrase(): void;
  terminar(): void;
};

const ID = "habla";
const ESCALA_PCM16 = 32768;
/** Vosk's log level that prints nothing. */
const LOG_SILENCIO = -2;

/** Linear-interpolation resample from `de` Hz to `a` Hz (pure; the same array when the rates match). */
export function remuestrear(x: Float32Array, de: number, a: number): Float32Array {
  if (de === a || x.length === 0) return x;
  const n = Math.max(1, Math.floor((x.length * a) / de));
  const y = new Float32Array(n);
  const paso = de / a;
  for (let i = 0; i < n; i++) {
    const t = i * paso;
    const k = Math.floor(t);
    const f = t - k;
    y[i] = x[k] * (1 - f) + x[Math.min(k + 1, x.length - 1)] * f;
  }
  return y;
}

export function crearEscucha(o: OpcionesEscucha): Escucha {
  let lista = false;
  let terminada = false;
  // The page only ever receives words of the closed grammar (anything else the engine says is dropped).
  const palabrasGramatica = new Set(o.gramatica);
  let aceptar: () => void = () => undefined;
  let rechazar: (e: Error) => void = () => undefined;
  const promesa = new Promise<void>((res, rej) => {
    aceptar = res;
    rechazar = rej;
  });

  o.motor.onmessage = (event: MessageEvent) => {
    const m: unknown = event.data;
    if (esCargaVosk(m)) {
      if (!m.result) {
        rechazar(new Error("reconocedor-no-cargo"));
        return;
      }
      o.motor.postMessage({ action: "set", key: "logLevel", value: LOG_SILENCIO });
      o.motor.postMessage({
        action: "create",
        recognizerId: ID,
        sampleRate: o.sampleRate,
        grammar: JSON.stringify(o.gramatica),
      });
      o.motor.postMessage({
        action: "set",
        recognizerId: ID,
        key: "words",
        value: true,
      });
      lista = true;
      aceptar();
      return;
    }
    if (esErrorVosk(m)) {
      if (!lista) rechazar(new Error("reconocedor-error"));
      return;
    }
    if (esResultadoVosk(m) && !terminada) {
      for (const w of m.result.result) {
        if (w.word === "[unk]" || !palabrasGramatica.has(w.word)) continue;
        o.alOir({ palabra: w.word, conf: w.conf });
      }
    }
  };

  // Silence the worker's own console before it loads anything (the engine's logger), and the wasm module's
  // once it exists (the same message is repeated when the engine is ready, below).
  o.motor.postMessage({ action: "set", key: "logLevel", value: LOG_SILENCIO });
  o.motor.postMessage({
    action: "load",
    modelUrl: o.modelUrl,
    wasmUrl: o.wasmUrl,
  });

  return {
    lista: promesa,
    oir(entrada) {
      if (!lista || terminada) return;
      const muestras = remuestrear(entrada, o.tasaEntrada ?? o.sampleRate, o.sampleRate);
      // Vosk's float input is on the 16-bit scale (±32768), Web Audio's on ±1: scale in place.
      for (let i = 0; i < muestras.length; i++) muestras[i] *= ESCALA_PCM16;
      o.motor.postMessage(
        {
          action: "audioChunk",
          recognizerId: ID,
          data: muestras,
          sampleRate: o.sampleRate,
        },
        [muestras.buffer],
      );
    },
    cerrarFrase() {
      if (!lista || terminada) return;
      o.motor.postMessage({ action: "retrieveFinalResult", recognizerId: ID });
    },
    terminar() {
      if (terminada) return;
      terminada = true;
      o.motor.onmessage = null;
      o.motor.postMessage({ action: "terminate" });
      o.motor.terminate();
    },
  };
}
