# ADR 021 — Formants spike (F1/F2 in the AudioWorklet) and «el mapa de las vocales»

- **Status:** accepted as a **spike** (2026-11-13, Sprint 010). The result is decided by the owner in the
  ensayo general: keep the game, keep it labeled experimental, or discard it by name. The builder does not
  decide it (constitution, H-2).
- **Amends:** ADR-004 (the worklet is no longer import-free: it imports the pure `formantes.js`).
- **Extends:** ADR-003 (audio matrix), ADR-007 (pitch by YIN). Bound by regla dura 2 (the child's voice
  never leaves memory) and regla dura 3 (the app only claims what its DSP measured).

## Context

VISION's roadmap item «juegos de tono avanzados» is conditioned on a spike: can the browser tell vowels
apart from the first two formants (F1, F2), with a child's voice, in real time and without a server? The
classic difficulty is a high fundamental: at F0 300–450 Hz the harmonics are far apart and linear
prediction tends to lock onto a harmonic instead of the formant.

## Decision

1. **Where.** `src/worklets/formantes.ts`, a pure module with no globals and no imports, imported by
   `rms-processor.ts` (`./formantes.js`) and tested offline by Vitest. The worklet publishes
   `formantes: { f1, f2 } | null` in the same frame as RMS and F0, behind the same energy gate
   (`RMS_MINIMO_PARA_PITCH`). The page validates every frame with `esMeterFrame` (rule 19) instead of a
   blind cast. Cache bust `rms-processor.js?v=3`.
2. **How.** Decimate to ≈ 12 kHz (box filter) → pre-emphasis 0.97 → Hamming → autocorrelation → order-12
   Levinson-Durbin → polynomial roots (Durand-Kerner) → poles with bandwidth < 500 Hz above 200 Hz;
   F1, F2 are the two lowest. Window: the same 2048-sample ring YIN already uses (≈ 43 ms at 48 kHz).
3. **Classifier.** `src/lib/voice/vocales.ts`: nearest centre in log-frequency, with an adult map and a
   child map (formants ≈ 35 % higher) chosen by F0 (≥ 200 Hz → child; YIN does not see voices under
   150 Hz, so «no pitch» means an adult voice). Farther than 0.35 from every centre → no vowel named.
   A vowel is «heard» only after three equal readings in a row (`vocalEstable`).
4. **Honesty.** The game says «suena como la a», never «bien dicha». It is labeled «Experimental».
5. **Privacy.** Only two numbers leave the analysis; nothing is stored, logged or sent. The test kit is
   synthetic: `scripts/gen-vocales.mjs` builds `vocales-{adulto,nino}.wav` from pulses and Klatt
   resonators (`tests/fixtures/vocales-sinteticas.ts`).

## Measurement (synthetic kit, `tests/unit/formantes.test.ts`, 2048-sample windows every 1536)

| Voice        | Vowel | F1 measured / ref (Hz) | F2 measured / ref (Hz) | err F1 | err F2 | Windows right |
| ------------ | ----- | ---------------------- | ---------------------- | ------ | ------ | ------------- |
| adult F0 120 | a     | 733 / 750              | 1304 / 1300            | 2.3 %  | 0.3 %  | 100 %         |
| adult        | e     | 474 / 460              | 1854 / 1850            | 3.1 %  | 0.2 %  | 100 %         |
| adult        | i     | 310 / 290              | 2252 / 2250            | 7.0 %  | 0.1 %  | 100 %         |
| adult        | o     | 489 / 480              | 908 / 900              | 1.8 %  | 0.9 %  | 100 %         |
| adult        | u     | 340 / 310              | 745 / 750              | 9.7 %  | 0.7 %  | 100 %         |
| child F0 300 | a     | 918 / 1000             | 1799 / 1750            | 8.2 %  | 2.8 %  | 100 %         |
| child        | e     | 600 / 620              | 2458 / 2500            | 3.3 %  | 1.7 %  | 100 %         |
| child        | i     | 367 / 390              | 2989 / 3000            | 5.9 %  | 0.4 %  | 100 %         |
| child        | o     | 603 / 650              | 1190 / 1200            | 7.2 %  | 0.8 %  | 100 %         |
| child        | u     | 393 / 420              | 909 / 1000             | 6.5 %  | 9.1 %  | 100 %         |

Higher child voices (same kit, windows classified right):

| F0     | a     | e     | i     | o        | u     |
| ------ | ----- | ----- | ----- | -------- | ----- |
| 250 Hz | 100 % | 100 % | 100 % | 100 %    | 100 % |
| 350 Hz | 100 % | 100 % | 100 % | 100 %    | 100 % |
| 400 Hz | 83 %  | 78 %  | 100 % | 100 %    | 100 % |
| 450 Hz | 100 % | 94 %  | 100 % | **33 %** | 100 % |

**Reading.** On synthetic vowels the method works at adult and mid child pitch, and degrades at the high
end (F0 ≥ 400 Hz), worst on «o». The table is **optimistic by construction**: the kit uses the same
textbook formants as the classifier's centres, a clean source and no room noise. A real child varies far
more (co-articulation, nasality, breath, the room). Only the ensayo, with the real voice and the game,
says whether it is useful; the floors in the test only stop the measurement from silently getting worse.

## Consequences

- `MeterFrame` grows an optional field; the balloon, the rocket and the other sources ignore it.
- Every DSP change that moves this table must update this ADR with the new numbers.
- If the owner discards the spike, the game route, the classifier and the `formantes` field go out
  together; YIN and RMS stay as they are.
