# ADR 019 — Stories at home, code first (S9)

- **Status:** accepted (2026-11-12, Sprint 009). Touches hard rule 1 (generative AI) and 2-bis (the adult's voice bank).
- **Sprint:** 009 «Cuentos de casa». Owner's decision in the G-Plan: «1a».

## Context

The VISION lists «stories made for him»: short picture-free stories built around what the child likes and the words
the family is practising. Generative AI is the obvious way to write them, and every hard rule pulls against doing it
carelessly: rule 1 forbids a paid API at runtime and makes AI an accent over a complete deterministic fallback, rule 7
asks for single words first, rule 4 bans deadlines, scores and condition names, and rule 8 keeps the family out of
the public repo.

## Decision

1. **Deterministic library first.** `content/cuentos.ts` ships a written `{es, en}` library (`CuentoSchema` in
   `content/schema.ts`): 3–6 short pages, one target word per page, at most 12 words per page, no digits. Templates
   carry two holes, `{interes}` and `{palabra}`, filled on the device from what the adult typed; with nothing typed
   they use their own defaults. The app is complete with the library alone.
2. **AI is a monthly batch, outside the runtime.** The adult downloads a request (`pedido-<date>.json`) and saves it
   in `privado/bandeja/` (git-ignored, with a test that fails if anything there is versioned). Claude Code processes
   it with `/bandeja` (`.claude/skills/bandeja.md`, contract `bandeja-ia` v0.1.0 pinned in `src/lib/bandeja/CONTRATO.lock`)
   under the owner's subscription. No SDK, no key, no network call from the app.
3. **The request carries only two things** (decision «1a»): the child's interests in generic words and the target
   words. `PedidoCuentosSchema` is `.strict()`; its `entrada` has exactly `intereses` and `palabrasMeta`, and a test
   fails if any other field appears. Name, age, voice and anything about a condition do not exist in the type.
   Interests reject digits, so an age cannot travel as an interest.
4. **Code decides.** `validarLote` (shared by the browser import and `scripts/validar-lote-cuentos.mjs`) checks the
   batch envelope, then each story: schema, page length, the target word on its page, banned deadline and score
   words, and the sensitivity hashes (SHA-256 n-grams, the same gate as the repo). A failing story is rejected with
   its reason; the rest of the batch still enters. Carnadas C01–C06 of the contract are unit tests.
5. **Nothing reaches the child without the adult.** Every imported story enters `pendiente`; only `aprobado` stories
   (plus the library) appear on the child side. The state machine is `pendiente → aprobado | rechazado`, stored in
   `habla:v1:cuentos` and cleared by «delete all my data».
6. **Narration is the adult's.** Either the adult records each page into the local voice bank (ids
   `cuento:<id>:<page>` and `cuento-en:<id>:<page>`, IndexedDB only, rule 2-bis) or reads it live with large text on
   screen. Never a synthetic voice. ADR-011 rejected a voice-bank export, so these clips have no way out of the device.

## Honest limits

- The validator cannot judge whether a story is good or kind; the adult's reading before approving is the real gate.
- Interests are typed in one language and fill holes in whichever language the app is in.
- Generated batches and requests live in `privado/` and are never committed; the e2e uses a fixed batch written for an
  invented profile.
