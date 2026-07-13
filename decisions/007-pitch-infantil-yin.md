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
- **Search range limited to 150–500 Hz** (efficiency + first line against octave errors). The pure
  tracker uses that same window as a _plausibility_ gate (below/above it is a hum, a harmonic or a
  detector error), **not** as "the child's range".
- **The flight is anchored to whoever is singing** (amended 2026-07-12 — see below): the rocket's
  altitude maps **0.7 octaves above the base**, where the base is the session's first confident
  pitch and lowers if that voice goes lower. No F0 range is assumed for anyone.
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

## Amendment (2026-07-12) — the fixed "child range" was a defect, found by the user's real voice

The first implementation clamped the tracker to a **fixed 200–450 Hz** ("children aged 4–6 are
250–400 Hz, per §B.1"). Running the desktop gate, the user reported his falsetto topping out at
**160–170 Hz** — below the 200 Hz floor. Two defects follow, and the second is the serious one:

1. **Co-use was broken (regla dura 5).** The rocket's own script tells the _parent_ to demo first
   ("hazlo tú primero, exagerado y riéndote"). With a 200 Hz floor, the parent's demonstration
   moved nothing on screen: the app asked him for something it then ignored.
2. **We were asserting a number we have never measured.** The child's real F0 is unknown (the
   tablet is travelling). Hard-coding a range from a paper, for a specific neurodivergent child,
   is exactly the kind of unverified claim this app forbids elsewhere.

The fix removes the assumption instead of widening it: **the flight is relative to the voice that
is playing.** The base anchors on the first confident pitch of the attempt and adapts downward;
altitude is `log2(f / base) / 0.7` octaves, clamped to 0..1. Parent (base ~165 Hz) and child (base
~280 Hz) both get a full, reachable flight. The **inversions** metric — the one we celebrate — was
already relative (50-cent hysteresis), so it needed no change.

`SPAN_OCTAVAS = 0.7` is set by a hard ceiling, not taste: the ear tops out at 500 Hz, so a child
starting at 300 Hz can only climb 0.74 octaves. A longer flight would give the rocket a **ceiling
the child's voice cannot reach** — a goal that can't be met is a lie, and this app doesn't ship
those. Two new unit tests blind the finding: the parent's falsetto sweep flies the rocket as high
as the child's, and dipping below the starting pitch re-anchors instead of sticking at the floor.

## Evidence

**CI / headless Chromium with a fake mic that SINGS (2026-07-12):** a dedicated Playwright
project (`desktop-chromium-tono`) feeds a synthetic WAV whose voiced window is a continuous
phase-integrated sweep between 230 Hz and 420 Hz (up·down·up·down = 3 inversions), with two weak
harmonics so YIN sees a signal shaped like a real voice rather than a pure sine. The full
pipeline (getUserMedia → AudioWorklet/YIN → pitch-tracker → screen) reports: smoothed F0 inside
the plausibility window, **>70 % pitch coverage over voiced frames** (the stability measure
this ADR hinges on), and the inversions counted correctly. The 32 Sprint-1 e2e tests stayed green
with the grown meter contract. The pure tracker passes 12 unit tests on synthetic signals: rising
sweep raises, falling sweep lowers, flat tone counts zero inversions, tremor below 50 cents counts
zero, noise/`null` frames never move the rocket (and never make it fall), octave jumps rejected,
out-of-range F0 ignored.

**Pending — real desktop microphone (the user's voice):** does the meter follow a real "aaah"
sirena? Is coverage high with a real (noisy) room? This is what decides pitch vs. the honest RMS
fallback. Page: `/spike/audio` (pitch panel).

**Pending — the child's real voice on the Android tablet (deferred with the device):** his F0 is
higher and breathier than an adult's; the range and the confidence threshold may need tuning with
his data. Listed in the deferred section of `docs/GUIA-DE-PRUEBA.html`.
