# ADR 008 — ARASAAC pictograms: curated offline batch, CC BY-NC-SA, attribution

- **Status:** proposed — Sprint 002

## Context

Outcome 3 needs ≥40 pictograms for the word↔object game (the visual scaffold that invites the
voice — any vocalization counts, ADR 005). ARASAAC (Gobierno de Aragón) offers a public API and
open downloads under **CC BY-NC-SA**.

## Decision

- **Offline batch, downloaded once in development** by `scripts/descargar-pictos.mjs` (plain
  Node, dev-only): a curated keyword list covering the app's 6 interest themes (animales,
  carros, espacio, dinosaurios, música, mar) → PNG files committed to `public/pictogramas/`.
  **Zero ARASAAC calls at runtime** (the zero-network e2e watches the game).
- A hand-curated typed manifest (`content/pictogramas.ts`, zod-validated) is the single source
  the game reads: `{ id, palabra, tema, archivo }`. Unit tests enforce ≥40 pictos, all 6 themes
  covered, and that every referenced file exists in the batch.
- **License compliance (CC BY-NC-SA):** this is a personal, non-commercial app (H1; H2 does not
  exist). Attribution is mandatory and lives in TWO places: `public/pictogramas/LICENCIA.md`
  (inside the batch) and the visible "Acerca de" section in Ajustes. Official attribution:
  pictograms author **Sergio Palao**, origin **ARASAAC (https://arasaac.org)**, property of
  **Gobierno de Aragón (España)**, license **CC BY-NC-SA**.
- **Replacement plan:** if the app ever became commercial, the ARASAAC batch must be replaced
  (or relicensed) before that change — recorded here so the constraint survives.

## Consequences

- The game filters pictos by the child's declared interest themes (the S1 onboarding themes
  finally do something); with no profile, all themes are available.
- Static PNGs weigh on the repo, not on the JS bundle; they lazy-load in the game.
