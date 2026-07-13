# ADR 009 — The parent judges the word; the app never does

- **Status:** accepted (2026-07-12)
- **Sprint:** 002, during the user's desktop gate
- **Supersedes nothing. Extends:** ADR 005 (single words first), regla dura 2 (privacy), regla dura 3 (honesty)

## Context

While gating the word↔object game, the user asked for a **different animation when the child says
the correct word**. It is the right instinct — the correct word deserves more than a generic glow —
but the obvious implementation is closed to us on three independent grounds.

## Why automatic word recognition is not an option

1. **Privacy (regla dura 2 — non-negotiable).** The browser's `webkitSpeechRecognition` **streams
   audio to Google's servers**. The child's voice leaving the device is the one thing this app
   promises never happens. This alone ends the discussion.
2. **It would punish exactly this child.** An on-device recognizer (Whisper-wasm et al.) is trained
   on adult, fluent speech. On a 4–6-year-old with a speech delay, half-formed words, and
   atypical prosody, it produces **false negatives**: the child says "perro", the app says nothing.
   That silent "no" is the cruelest possible feedback, and the whole app is built to never give it.
   The research is explicit (§D): no consumer ASR is reliable for this population.
3. **Honesty (regla dura 3).** Guessing from the shape of the sound would be inventing a verdict.
   The app asserts only what its DSP measured.

## Decision

**The parent is the judge — and the app gives him the button.** This is not a workaround; it _is_
the product thesis (the app orchestrates the parent, it does not replace him). He is sitting right
there, he knows whether "peo" was an attempt at "perro", and no model will ever know that better.

- A discreet **adult** control in the game (≥44 px, never the child's ≥64 px kid-sized target):
  _"¿Dijo «perro»? Tócalo tú"_.
- It triggers a **visibly different celebration**: green success border + a short, contained double
  pulse (`latido-palabra`) — distinct from the coral "there was voice" glow. Contained on purpose:
  COGA, no sensory overload. Under reduced motion the green border still carries the meaning.
- **Two numbers, two owners, never merged:** `veces` (drawings his voice lit — _the app measured
  this_) and `reconocidas` (words the parent heard — _the parent judged this_). The celebration
  attributes each to its owner: _"Y **tú** oíste 3 palabras. Eso lo sabes tú, que estabas ahí."_
  The app never takes credit for a judgement it did not make.

## Open question, raised by the user (2026-07-12) — deferred to a future sprint

The user disagrees with premise (1). His position, verbatim: sending the child's **voice** to
Google is not what worries him — what must never leave are "los datos personales, sus exámenes, su
historia clínica, incluso su solo nombre". He asked to revisit this in a later sprint. **Nothing
changed in the code**: the rule stands until he decides otherwise, and this is his app.

The one fact he should weigh before deciding, because it is the crux and it is not obvious:

> **For a child in speech therapy, the voice IS the clinical record.** It is not a neutral carrier
> of words — it is the raw signal from which his condition can be inferred: the articulation, the
> prosody, the delay. Under Ley 1581 (art. 5 and art. 7) voice is a personal datum, health data is
> **sensitive** data, and sensitive data **of a minor** carries the strictest regime in Colombian
> law. Uploading it is closer to uploading the exam than to uploading a photo of the living room.
> The receiving end matters too: the Web Speech API gives no contract, no retention limit, no
> deletion, and no promise about training.

There is also a cheaper path that does not require this trade at all: an **on-device** model
(nothing leaves), surfaced as a _"quizás"_ hint to the parent — never a verdict to the child. If we
ever want machine help with the word, that is the door to open first. **Decision belongs to the
user; revisit when he calls it.**

## Consequences

- The game gains the richer feedback the user wanted, with **zero** new privacy surface, zero
  network, zero model, and no risk of telling a child he failed when he did not.
- A future "maybe" hint (on-device, shown as a suggestion and never as a verdict — see the brief)
  could _inform_ the parent's button, never replace it. That is the only door left open.
- **e2e guards it:** with the fake mic speaking a wordless tone, the drawing lights up but
  `data-reconocida` stays **false** — the app cannot reach that state on its own. The test falls if
  anyone ever wires a recognizer to it.
