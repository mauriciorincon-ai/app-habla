# ADR 025 — Turns inside every game, and a prompter that speaks to the adult at the right moment

- **Status:** accepted (2026-11-15, Sprint 013). Owner's G-Plan answers «1 a 2 a» rule as written: (1) the
  prompter is a thin line of text at the top, in the adult's palette, still, outside the child's touch zone,
  shown for a few seconds and gone, and calm mode turns it off; (2) the adult marks the turn with one tap on
  that strip.
- **Bound by:** hard rule 3 (the celebration only states what was measured, now: **in the child's turn**),
  hard rule 4 (no biometrics: nothing identifies whose voice is sounding), hard rule 5 (co-use always), hard
  rule 6 (no time limit, no game-over, calm mode), the design-system rule «the child's view is sovereign»
  (relaxed here for one line of adult text, and only for it).

## Context

The two promises at the heart of the VISION, «sessions designed for two» and «your invisible prompter»,
lived only in the card before the game: once play started the script left the screen, and the session
counted **every** voice. When the adult modelled a long «aaa», the balloon flew and the achievement was
recorded as the child's. The coaching came before the moment it was useful, never at it.

## Decision

1. **The turn is session state.** `Sesion.turno: "adulto" | "nino"` with the event `CAMBIAR_TURNO`
   (`src/lib/session-flow.ts`). The adult sets it with a tap; the app never guesses whose voice it hears
   (that would be speaker recognition, i.e. biometrics). A session **starts in the child's turn**, so a game
   played without touching the strip counts exactly as before this sprint. A new try (again, recalibrate,
   back to the script) returns to the child's turn and to zero.
2. **Two engine packs per game** (`src/lib/voice/motores.ts`). The **live** pack receives every frame and
   moves the drawing: when the adult models, the child _sees_ the model. The **child's** pack receives the
   frame only in the child's turn; in the adult's turn it receives the same instant **in silence**
   (`frameEnSilencio`: RMS 0, no pitch, no formants, same clock). Every counter that is shown, recorded or
   celebrated (seconds and best run, rocket turns, vowels, blows, loud/soft changes, the picture lighting up
   in «Palabras») reads the child's pack (`use-voice-session.ts`). Silence — rather than not feeding the
   engines — closes runs cleanly: the meter releases after its grace, the blow ends, the pitch is forgotten,
   so nothing from the adult's turn leaks into his next run. The adult's own judgement in «Palabras» (the
   «they said the word» tap) stays the adult's, as ADR-009 says.
3. **«N turns of his».** `turnosNino` counts the child's turns in which his voice was measured, once per
   turn. The celebration says it; Rumbo keeps it.
4. **The prompter** (`src/lib/coach/apuntador.ts`) is pure: from two snapshots of the session it detects one
   of four moments — the adult's turn begins (model slowly, once), his voice sounded in his turn (expand:
   say it back plus one word), a long silence in his turn (wait three seconds, expectant face), the close
   (name what you did together) — and picks a line: never repeated within the session, at least 12 s
   between lines (the close does not wait), the day's technique first when the moment has a line of it.
   Every line carries its technique and the same sources the daily capsules cite. Lines speak in the
   positive about what he did or what the adult can do now; a test forbids negations and corrections in
   both languages. The silence line comes at 8 s; the gentle invitation stays at 20 s and, in the adult's
   turn, never shows (the silence is the adult's).
5. **The strip on screen** (F2) belongs to the adult: text in the adult's palette, still, no sound (the mic
   games emit none), outside the child's ≥ 64 px touch zone, shown about seven seconds; calm mode and the
   «Your prompter» setting (on by default) turn it off. It is the **only** adult text allowed on the
   child's view; `design-system.md` records the exception.

## Consequences

- Honest by construction: in the adult's turn the child's counters cannot move; `tests/unit/turnos.test.ts`
  drives one synthetic play that moves the six mic games' counters and proves that, fed in the adult's turn,
  none of them moves, while the live pack does.
- Twice the engine work per frame: the engines are scalar arithmetic on ~31 frames/s, well inside budget.
- In the adult's turn the balloon rises with the voice but does not travel (travel is the child's seconds);
  the picture in «Palabras» glows but does not light up. Movement shows the model; achievement stays his.
- Gemelas already alternate (he says, the adult marks): they only gain the same turn indicator.
- Nothing new is stored but `turnosNino` in the session record; it does not travel in the other-home
  package beyond what sessions already carry, and «Delete my data» erases it with them.
