# ADR-017 · Bilingual ES/EN (supersedes ADR-001)

- Status: accepted (Sprint 007, opens H-2)
- Supersedes: ADR-001 (Spanish only)

## Context
Habla was born Spanish-only (ADR-001, `lang="es-CO"` fixed). H-2 requires a complete ES/EN product, and
whatever H-2 still builds (family video library, made-for-him stories, …) must be born in both languages.
The adult reads all the text; the child does not read. Hard rules 2, 4 and 8 must hold in both languages.

## Decision
1. **Text is born `{ es, en }`**, written (not translated) side by side, in catalogs per screen under
   `src/lib/idioma/textos/`. Pure layer in `src/lib/idioma/index.ts` (`Idioma`, `Texto`, `t()`); state in
   `estado.ts` (`useIdioma`, `useT`, `elegirIdioma`).
2. **The language is a local setting**: `idioma` in `AjustesSchema` (`"es" | "en" | null`, `.catch(null)`,
   so older saved settings migrate on their own). `null` follows the browser (`navigator.languages`).
   The choice never leaves the device (no cookie, no URL, no network). The switcher lives in Ajustes.
3. **`lang` is set before first paint** by the inline script in `layout.tsx` (the saved choice, else the
   browser), and kept in sync by `ActualizarLang`. Static metadata and the PWA manifest carry both languages.
4. **Daily capsule**: the text fields (`titulo`, `explicacion`, `guion`, `actividad.texto`) become `{ es, en }`.
   English lives in `content/capsulas-en/` keyed by id. The selection (`coach/daily.ts`) depends only on id,
   stage, order and date, so the same capsule is chosen in both languages.
5. **In English you practice in English.** *(Superseded by S8, see the amendment below: the first cut left the word games and the dictionary in Spanish.)*
6. **Gate**: the sensitivity gate covers `src/lib/idioma/**` and `content/capsulas-en/**` (hashes regenerated
   before writing English), the age guard also catches the English forms, and a banned-copy list in English
   (deadlines, scores, consultancy language and the construction-jargon word) fails the build.
7. **Tests** — parity of keys and placeholders in every catalog, same daily id in both languages, the
   `idioma` setting, zero traffic. e2e and screenshots in ONE language per sprint (this one: Spanish);
   the other one at the milestone close.

## Consequences
- Every new screen or content brings its `{ es, en }` pair in the same PR.
- The catalog and the brochure carry both languages as sibling `data-l` blocks (amended in S8).
- ADR-001 stays in the repo, marked superseded.
- The server-rendered HTML always reads in Spanish (settings live only on the device). On an English device the pre-paint script sets `lang` first, and React repaints the text once after hydration, so a reader may see a brief flash of Spanish. The language components skip writing `lang` and the title until the settings have loaded, so they never undo the script.
- *(Superseded by S8.)* The goal helper and its dictionary were Spanish-only in S7.

## Amendment — Sprint 008 «Practice in English too»
- Words, Twins and the Goal are practiced in English: pictograms carry an English label, the twin pairs are
  English minimal pairs (not translations), the voice-bank cues have English ids, and the Goal aligner and
  spelling dictionary run per language (`palabras-es.ts`, `palabras-en.ts`, ADR-014). The «Spanish only» card is gone.
- `/mirada` («La pirámide, en casa»), the contact-eye content and the capsule catalog are `{ es, en }` data and
  print in both languages with a two-button switch (sibling `data-l` blocks, as in `/conoce`).
- The English prose was drafted in six parallel Haiku batches against a fixed glossary and sampled by the builder.
