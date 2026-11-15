# ADR 024 — «Soplar» and «Fuerte y suave»: a blow is energy without pitch and without hiss; loudness counts changes

- **Status:** accepted (2026-11-15, Sprint 012). The thresholds are starting values tuned on synthetic
  signals; what they are worth with this child is learned in the rehearsal.
- **Bound by:** hard rule 2 (the detectors read scalars in memory: no samples leave the worklet, nothing is
  kept), hard rule 3 (the game celebrates what it measured: blows counted, changes counted), hard rule 6
  (no time limit, no game-over), ADR-007 (YIN in the worklet, energy-gated), ADR-012/013 (no automatic end).

## Context

The VISION promises four ways for the child's voice to move the world. Two existed (sustain: the balloon;
pitch: the rocket). Blowing and loud/soft did not. Blowing is the first step when there is still no word,
and the hard case is honesty: a blow, a «sh» and a «s» are all **energy without pitch**, so energy and the
absence of pitch alone would celebrate a «sh» as a blow.

## Decision

1. **A new scalar in the frame.** The worklet publishes `zcr`, the zero crossings per sample of the samples
   behind the frame (`src/worklets/analisis.ts`, which also holds YIN, moved there unchanged so the unit
   tests run the very same code). It is a number, like `rms`: no sample leaves the worklet. The contract
   grows (`MeterFrame.zcr?`, guarded by `esMeterFrame`); the worklet goes to `?v=4` and the service worker
   cache to `habla-v4`.
2. **A blow** (`src/lib/voice/soplo.ts`) needs, at once and for 150 ms: RMS ≥ 4 × the calibrated floor
   (kept while ≥ 2.5 ×), **no pitch**, and **`zcr` ≤ 0.1**. Air on a microphone is low turbulent rumble (few
   crossings); a «sh» or a «s» is high hiss (many); a vowel, a hum or a voice on the TV has pitch; a fan is
   what the calibration measured as the floor. A vowel ends a blow at once. One blow counts once, at its
   onset; the drawing reads a capped strength.
3. **The fallback source has no pitch**, so without `zcr` a voice would look like air: frames without `zcr`
   are never a blow (the game simply does not move; it never celebrates something it cannot tell).
4. **Loudness** (`src/lib/voice/intensidad.ts`): dB over the same voice threshold as the balloon (3.5 × the
   floor). «Loud» from 14 dB, back to «soft» under 9 dB (the hysteresis band), each state confirmed after
   200 ms. It counts **changes** between soft and loud, both ways; silence in between does not hide a
   change. The height of the character is capped at 24 dB: a shout is not higher than a firm voice, and a
   shout held for any time is **zero changes**. The game never names a «right» volume.
5. **A deep adult voice is not air.** Below the YIN range of the child (150 Hz) a low male voice can read
   as «no pitch». The worklet runs a second YIN pass over 70–150 Hz only when the main one found nothing
   and publishes `grave` (a boolean, `MIN_HZ_GRAVE = 70`, `hayPeriodoGrave`). `grave === true` is never air
   and ends an active blow. It is a new cue: no existing threshold or hysteresis changed.

## Short sessions (daily cap)

- The adult picks a daily cap of 5–10 minutes in Ajustes (10 by default, `AjustesSchema.topeMinutos`).
- `src/lib/pantalla/tope.ts` holds pure functions of state and date. A one-second tick credits at most
  2 s (`DELTA_MAX_MS`), so a sleeping tab or a clock jump cannot spend the day.
- At the cap the adult gets ONE gentle notice per day (`avisado`) and the game closes calmly like «Salir»
  (Gemelas goes to its start). It never blocks: playing again is possible and is not cut a second time.
  No «se acabó», no punishment, nothing on the child's screen.
- The counter lives in the key `habla:v1:pantalla` with only `{fecha, ms, avisado}`. It is outside
  `PaqueteSchema` (it never travels to the other home) and `borrarTodo` wipes it.
- Demo in red: breaking `alcanzado` in `tope.ts` turned the cap tests red; restored, green.

## Measurement (synthetic signals, `tests/fixtures/senales-soplo.ts`, frames as the worklet makes them)

| Signal                              | `zcr` per frame | Frames with pitch | Blow?                            |
| ----------------------------------- | --------------- | ----------------- | -------------------------------- |
| Blow (low rumble + a little breath) | 0.015 – 0.061   | 0                 | yes (also soft, also over a fan) |
| Vowel 280 Hz                        | 0.011 – 0.012   | all               | no (pitch)                       |
| Voice on the TV (180 Hz + noise)    | 0.064 – 0.096   | all               | no (pitch)                       |
| «sh» (2–5 kHz)                      | 0.38 – 0.44     | 0                 | no (hiss)                        |
| «s» (> 4.5 kHz)                     | 0.56 – 0.60     | 0                 | no (hiss)                        |
| Fan (steady low noise)              | 0.11 – 0.19     | 0                 | no (it is the floor)             |
| Room silence                        | ≈ 0.5           | 0                 | no (under the floor)             |

`tests/unit/soplo.test.ts` and `tests/unit/intensidad.test.ts` hold these cases; both gates were shown
failing with `scripts/demo-rojo.sh` (rule 15).

**Reading it honestly.** These are synthetic sounds: a real microphone adds its own rumble, and a breathy
whisper may come out as air (it is air). A false blow is possible, a missed one too; neither reaches the
child as a «no», and the adult still drives the game.

## Consequences

- Seven games in a fixed order: the four voice ways together (balloon, blow, loud/soft, rocket), then words,
  twins, and the experimental vowels last.
- New session kinds (`soplar`, `fuerte-suave`) travel in the other-home file like every session; the daily
  screen counter of the same sprint does not.
- Changing the thresholds is a code change with its table here.
