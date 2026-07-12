# ADR 007 — Child-voice pitch: YIN in the AudioWorklet, energy-gated, with an honest RMS fallback

- **Status:** proposed — Sprint 002 (closes with the desktop pitch spike, validated by the user)

## Context

Outcome 2 of Sprint 002 is the tone rocket: it rises when the child's voice rises in pitch and
falls when it falls. Child F0 is high (~250–400 Hz) and noisy; classic F0 pitfalls are octave
errors and noise-driven ghost pitch (§B.1 of the research: YIN/MPM run comfortably in realtime
in the browser).

## Decision

- **Method: YIN (cumulative mean normalized difference, CMND)** computed inside the existing
  AudioWorklet processor (`src/worklets/rms-processor.ts`, compiled separately — ADR 004) over a
  ring buffer of the latest ~1024–2048 samples per throttled message (~31/s). Chosen over MPM
  for simplicity and abundant reference material; both are deterministic — if the spike shows
  instability, MPM is a drop-in candidate before falling back.
- **Search range limited to 150–500 Hz** (efficiency + first line against octave errors);
  product range clamps to **200–450 Hz** in the pure tracker.
- **Energy gating:** frames with negligible energy, or whose CMND minimum exceeds the confidence
  threshold (~0.15), emit `pitchHz: null` — background noise produces NO pitch. The meter
  contract grows to `{ rms, pitchHz: number | null, tMs }` (one contract, not two).
- **Pure tracker** (`src/lib/voice/pitch-tracker.ts`): octave-jump rejection (>45% vs smoothed),
  median-of-3 + EMA smoothing, directional hysteresis (~50 cents from the last extremum before a
  direction change counts), inversion counting for the honest celebration. Unit-tested with
  synthetic sweeps/tones/noise.
- **Privacy:** pitch is data derived from the child's voice — it lives and dies in memory like
  the RMS (same ESLint + scan-test locks; zero-network e2e covers the game).
- **Declared fallback:** if pitch proves unstable on the real desktop mic during the spike, the
  rocket degrades honestly to "rises with loud voice, falls with soft" (proven RMS) — the
  mechanic never lies and never dies. The spike decides; this ADR records the outcome.

## Evidence

- (pending — desktop spike with the user's real voice, Fase 1b)
