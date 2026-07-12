// Globals del AudioWorkletGlobalScope que el lib DOM de TypeScript no incluye.
// El puerto se tipa estructuralmente (sin MessagePort) para no depender del lib DOM:
// tsconfig.worklet.json compila con lib ES2022 puro.

declare abstract class AudioWorkletProcessor {
  readonly port: {
    postMessage(message: unknown): void;
    onmessage: ((event: { data: unknown }) => void) | null;
  };
  abstract process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean;
}

declare function registerProcessor(
  name: string,
  processorCtor: new () => AudioWorkletProcessor,
): void;

/** Sample rate del AudioContext dueño del worklet (Hz). */
declare const sampleRate: number;

/** Reloj del contexto de audio, en segundos. */
declare const currentTime: number;
