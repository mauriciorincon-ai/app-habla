# ADR 001 — Spanish-only (es-CO), no bilingual i18n

- **Status:** accepted (ratified in G-Plan, 2026-07-11)
- **Sprint:** 001

## Context

The pipeline's method defaults to bilingual apps (es/en). Hablemos San is a 100% personal app
for one Spanish-speaking child (4–6 years old, Colombia) practicing speech at home with a
parent. Every string the child or parent sees is part of the therapeutic-adjacent practice
material; an English surface has zero users and doubles the microcopy review burden (each
capsule's wording must pass the anti-claims checklist and the warm es-CO tone gate).

## Decision

The app ships **Spanish (es-CO) only**. No i18n framework, no locale routing, no message
catalogs. Microcopy is written directly in components/content in warm, direct es-CO. The HTML
root declares `lang="es-CO"`. Code, commits, symbol names and ADRs remain in English.

## Consequences

- Simpler components (no translation indirection); microcopy is reviewable in place against the
  anti-claims checklist (§D of the research).
- A future bilingual need would require retrofitting i18n — accepted: the product is personal by
  vision (H2 does not exist).
- Content (`content/capsulas.ts`) encodes es-CO wording as data; a locale layer, if ever needed,
  would wrap the capsule schema, not the UI.
