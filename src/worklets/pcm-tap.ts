// AudioWorkletProcessor «pcm-tap» (S11, ADR-023): the second branch of the microphone graph, only
// mounted while the adult has turned the recognizer on. It hands the page short blocks of samples so
// the on-device recognizer (a Worker) can listen for the round's word.
//
// Hard rule 2 (privacy): no storage, no network, no logs, no imports. Samples travel by transfer
// (the block moves, it is not copied) to the page, the page hands them to the recognizer Worker, and
// they die there; nothing is kept in a ring that outlives the block.

/** 32 blocks × 128 samples ≈ 85 ms at 48 kHz: short enough for a quick «maybe», few messages. */
const BLOCKS_PER_CHUNK = 32;
const CHUNK = 128 * BLOCKS_PER_CHUNK;

class PcmTap extends AudioWorkletProcessor {
  private chunk = new Float32Array(CHUNK);
  private filled = 0;
  private open = true;

  constructor() {
    super();
    this.port.onmessage = (event) => {
      if (event.data === "close") this.open = false;
    };
  }

  process(inputs: Float32Array[][]): boolean {
    if (!this.open) return false;
    const channel = inputs[0]?.[0];
    if (!channel || channel.length === 0) return true;
    let i = 0;
    while (i < channel.length) {
      const n = Math.min(channel.length - i, CHUNK - this.filled);
      this.chunk.set(channel.subarray(i, i + n), this.filled);
      this.filled += n;
      i += n;
      if (this.filled === CHUNK) {
        const lleno = this.chunk;
        this.port.postMessage({ tipo: "pcm", muestras: lleno, sampleRate }, [
          lleno.buffer,
        ]);
        this.chunk = new Float32Array(CHUNK);
        this.filled = 0;
      }
    }
    return true;
  }
}

registerProcessor("pcm-tap", PcmTap);
