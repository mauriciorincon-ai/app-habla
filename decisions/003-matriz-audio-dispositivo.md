# ADR 003 — Audio engine matrix: AudioWorklet with AnalyserNode fallback

- **Status:** proposed — CI leg confirmed; **awaiting validation on the family's real Android tablet**
- **Sprint:** 001

## Context

Risk #1 of the sprint is the audio pipeline on the real device: a 4–6 year old's voice must move
a character with no perceptible lag, on a mid-range Android tablet, in a real (noisy) home. The
research (§B.1) says an AudioWorklet processes 128-sample blocks (~2.9 ms at 44.1 kHz) with a
30–100 ms round-trip on mobile — well under the 200 ms ceiling for visual feedback — but it does
not measure our device, and browsers may silently ignore capture constraints.

## Decision

- **Primary engine: `AudioWorklet`** (`src/worklets/rms-processor.ts` → `MicSession`). RMS is
  accumulated over 12 blocks (~32 ms, ~31 messages/s) and posted as a scalar; the UI interpolates
  to 60 fps with rAF and mutates `transform` directly (no React re-render per frame).
- **Documented fallback: `AnalyserNode` + rAF** (`AnalyserSource`, fftSize 2048). Same
  `MeterSource` interface, so the app cannot tell them apart; `MicSession` throwing
  `audio-worklet-no-disponible` is what selects it.
- Capture constraints are fixed by the product: `echoCancellation`, `noiseSuppression` and
  `autoGainControl` **off** — browser DSP would corrupt the RMS the game reads.
- Engines are **sample-rate agnostic**: they consume `{rms, tMs}` frames, never raw samples, so
  a 44.1 kHz vs 48 kHz device changes nothing.

## Evidence so far

**CI / headless Chromium (macOS, Playwright fake-mic) — confirmed 2026-07-11:**
`getUserMedia → AudioContext → addModule → AudioWorkletNode` completes with no friction.
`AudioContext.state` is already `running` under the fake-device flags (no `--autoplay-policy`
needed). First frame at ~35 ms of audio-clock time; RMS ≈ 0.294 during the WAV's voiced window
and ≈ 0.0008 during its noise floor — a ~350× separation, so a relative threshold above the
calibrated floor is comfortably discriminative. The spike e2e passes on both mobile-chromium and
desktop-chromium.

**Pending — real Android tablet (Chrome), on the Vercel preview of `/spike/audio`:**
perceived latency while sustaining a vowel · worklet stability over minutes · `track.getSettings()`
(does Android actually honour the three constraints set to `false`?) · the home's real noise
floor · 60 fps of the character. These results complete this ADR and may promote the fallback.

## Consequences

- The game's UI depends only on `MeterSource`; swapping engines is a one-line decision.
- The e2e suite can drive the full real pipeline via Chromium's fake mic, so audio is covered in
  CI and not only by manual testing.
- **Hydration hazard found while wiring the spike:** a click can land before React hydrates and be
  lost silently. Buttons that open the microphone are `disabled` until hydration
  (`useHidratado`, `src/components/use-hidratado.ts`). This is now a UI pattern for the sprint.
