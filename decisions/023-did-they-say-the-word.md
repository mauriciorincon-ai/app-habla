# ADR 023 — «¿Dijo la palabra?»: an on-device recognizer that only ever says «maybe»

- **Status:** accepted for construction (2026-11-14, Sprint 011). **What the measurement means is the owner's
  call in the rehearsal** (sprint order, default v); the threshold below is a starting value, not a tuned one.
- **Amends:** ADR-009 (the adult still judges; the app may now _suggest_). **Bound by:** hard rule 2 as
  amended by the order (the recognizer listens in a Worker on the device and returns only word and
  confidence), hard rule 3 (automatic recognition is shown as «maybe», never as a verdict), rule 20 (both
  languages), rule 8 (test recordings are never the family's).

## Context

ADR-009 closed the cloud recognizer (it streams audio to a third party) and left one door open: an
on-device model surfaced as a «maybe» to the adult. The VISION's last roadmap item is exactly that. The
order (G-Plan «1 a, with b as an option · 2 a · 3 a») asks for: a local Vosk recognizer in a Worker with a
closed grammar, ES/EN, in Palabras and Gemelas; the «maybe» only for the adult; an optional, off-by-default
soft animation for the child (no text, no verdict, never counts, never a «no»); the recognizer off by
default, ≈ 40 MB downloaded on the adult's tap and erasable; a 2×2 count of recognizer-vs-adult outside
the other-home file; and an honest measurement on Lingua Libre recordings.

## Decision

1. **Engine.** `@lichess-org/vosk-browser@0.0.3` (Apache-2.0, pinned exactly) and the upstream small models
   `vosk-model-small-es-0.42` and `vosk-model-small-en-us-0.15` (Apache-2.0). `scripts/traer-modelos.mjs`
   fetches them at build time and checks the SHA-256 pinned in `scripts/modelos.json`; nothing enters the
   repo. The models are served as the upstream `.zip` (the wasm extracts them with libarchive), so the pin
   is upstream's own file — no repacking. Licenses: `public/modelos/LICENCIA.md`.
2. **On the device.** Ajustes downloads the three files (engine, wasm, the active language's model) from the
   app's own origin, only on the adult's tap, checks each hash and keeps them in the Cache API
   (`habla-reconocedor-v1`); the other language downloads on demand. In a game the files are read back from
   that cache, checked again, and handed to the Worker as `blob:` URLs: **no network during play**.
3. **The Worker has no network.** A prelude (`src/lib/reconocer/preludio.ts`) runs before the vosk code:
   `fetch` answers only the verified blobs; `XMLHttpRequest`, `WebSocket`, `EventSource`, `WebTransport`,
   `importScripts` and `sendBeacon` are removed. Its console is silenced: `set logLevel -2` goes to the engine before it loads and again when it is ready (`src/lib/voice/escucha.ts`, checked in `tests/unit/reconocer.test.ts`). `Worker` and `SharedWorker` are removed as well.
4. **The audio path.** A second worklet branch (`src/worklets/pcm-tap.ts`), mounted only while the
   recognizer is on, moves ≈ 85 ms blocks by transfer to `src/lib/voice/escucha.ts`, which moves them on to
   the Worker. The listener hands the page **only `{palabra, conf}`** for words of the grammar; text,
   timings and `[unk]` stay out. Both files live in the sealed voice folders (`privacidad-voice.test.ts`);
   `src/lib/reconocer/` (download and cache) may not import the voice engine nor name an audio type.
5. **Closed grammar.** The game's words in the active language plus `[unk]` (`gramaticaDelJuego`): the
   recognizer cannot transcribe anything else.
6. **«Maybe», never «no».** `quizasDijo` shows «quizás dijo X» only when the recognizer heard the round's
   word with `conf ≥ 0.6`. Anything else shows nothing. The adult's button stays the only way to a
   recognized word (ADR-009 stands: two numbers, two owners).
7. **The child's animation (option b), against hard rule 3.** Rule 3 forbids showing automatic recognition as a verdict and a «well done» that cheers whatever the child says. The glow is neither: it is a soft light with no text, no word and no verdict, it appears only when the recognizer is on, the adult switched the second option on, and the recognizer itself thinks it heard the round's word; it never counts, never triggers or replaces the celebration the adult fires (hard rule 3's «the adult judges»), and it is smaller than it. A miss shows nothing, so the child never sees a «no». The owner decides in the rehearsal whether it stays.
    A second switch, off by default and only present while the
   recognizer is on, shows a soft halo on the drawing: `aria-hidden`, no text, no verdict, does not count,
   smaller than the celebration the adult triggers, and under reduced motion only its opacity changes.
8. **The count.** «Matched» means the recognizer showed a «maybe» for the round (in Gemelas: for a side); «judged yes» means the adult marked THAT word or side (a «maybe» for one side while the adult marked the other is matched · judged no). Four local numbers (recognizer matched yes/no × adult judged yes/no) in
   `habla:v1:coincidencias`, outside the other-home package; with fewer than 20 rounds Ajustes says «todavía
   no se puede decir».
9. **Storage the Worker adds.** vosk-browser unpacks the model into its own IndexedDB database (`/vosk`,
   Emscripten IDBFS). It holds the **model**, never audio. «Borrar el reconocedor» and «Borrar mis datos»
   delete it together with the cache.

## Measurement (Lingua Libre, licensed per file)

Recordings: adult volunteers of Lingua Libre (Wikimedia Commons), one per word, words of the game, each
with its author and license in `tests/e2e/fixtures/palabras/LICENCIA.md` (CC0, CC BY 4.0 or CC BY-SA 4.0;
converted to 16 kHz mono). Never the family. Run: `tests/e2e/reconocedor-medida.spec.ts` over the real
engine in Chromium (closed grammar of the whole game, 1 s of silence after each word); it writes the result to
`tests/e2e/fixtures/palabras/medida-es.json` and `medida-en.json`, versioned, so this table can be checked.

Measured 2026-11-14 on the real engine (small models, closed grammar of the whole game, `conf ≥ 0.6`
for the «maybe»), 10 recordings per language, one speaker per word.

| Language | Right word heard | «Maybe» shown | Lowest confidence | Wordless controls answered with a word |
| -------- | ---------------- | ------------- | ----------------- | -------------------------------------- |
| es       | 10 / 10          | 10 / 10       | 0.67 (perro)      | 2 / 3                                  |
| en       | 10 / 10          | 10 / 10       | 1.00              | 1 / 3                                  |

Wordless controls (the synthetic sounds of the other e2e tests): `voz-sintetica.wav` → nothing in both
languages; `barrido-tono.wav` → «huevo» at 0.65 (es) and «moon» at **1.00** (en); `vocales-nino.wav` →
«huevo» at 0.77 (es), nothing in en.

**Finding.** With a closed grammar the recognizer must pick *something* of the grammar, so a sound with no
word can still come out as one, with a confidence **above the threshold** (even 1.00). Confidence does not
separate a real word from a noise; the threshold is a starting value, and a smaller grammar (Gemelas: two
words per round pair) makes a false «maybe» more likely, not less. Consequence by design: a «maybe» is a
hint for the adult, who judges, and never reaches the child as a verdict.

**Reading it honestly.** These are adult, fluent, studio-ish recordings: the result is the **upper bound**
of what the recognizer can do, not what it will do with a child who is starting to speak (ADR-009 §2:
expect many silent misses). A miss shows nothing, so a miss never reaches the child as a «no». What the
numbers are worth for this child is learned in the rehearsal and from the 2×2 count, and decided by the
owner.

## Consequences

- The VISION's last roadmap item is built up to its measurement; whether it stays on is the owner's call.
- The device stores ≈ 40 MB per language twice (the zip in the cache, the unpacked model in IDBFS) while the
  recognizer is on; both go with one tap.
- **Build dependency.** `pnpm build` and `pnpm dev` download the two model zips from the Vosk project's host
  (`alphacephei.com`) and stop if a SHA-256 differs from `scripts/modelos.json`; the engine and wasm are only
  _copied_ from `node_modules/@lichess-org/vosk-browser` into `public/vosk/`. At run time the app never talks to that host.
- A false «maybe» is possible; it is worded as a suggestion and the adult's button decides.
- Tests: `tests/unit/reconocer.test.ts` (grammar, matcher, guards, listener, prelude sandbox, hashes,
  download/verify/delete), `tests/unit/privacidad-voice.test.ts` (sealed folders + the new split), the
  measurement spec, and the game e2e with the recognizer on (`tests/e2e/reconocedor.spec.ts`, zero network
  during play).
