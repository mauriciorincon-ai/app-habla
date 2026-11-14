# ADR 022 — Shared conventions with Nutri-Kids: a v0.1.0 proposal, checked by a test

- **Status:** proposed (2026-11-13, Sprint 010). It binds nothing until the owner ratifies it (owner
  default (ii): the convention ships as a v0.1.0 proposal).
- **Bound by:** the roadmap item «convenciones con Nutri-Kids» of the VISION; rule 8 (nothing about the family
  travels); ADR-008 (ARASAAC credit).

## Context

Habla and Nutri-Kids are two apps for families, used by an adult with a child next to them. Each grew its own
design system. The roadmap asks for shared conventions, but the two repos have different owners of their own
text: Habla may read Nutri-Kids' `design-system.md` and must never write there.

## Decision

1. The conventions live in Habla, `docs/convenciones-familia/README.md`, versioned (**0.1.0**), in Spanish and
   English. Six rules: state never color alone, one-tap calm mode, touch sizes (64 px child / 44 px adult),
   microcopy without deadlines, scores or guilt, ARASAAC credit on every sheet, nothing about the family
   travels.
2. Each rule states where Habla meets it as `path:line`, and what Nutri-Kids lacks. Today the only gap is the
   calm mode (its design system has none).
3. `tests/unit/convenciones.test.ts` checks what is checkable: the version line, both languages per rule,
   every `path:line` reference points inside an existing file, the calm-mode setting exists and defaults off,
   and the ARASAAC credit is on the printable sheets.
4. Nothing is written in Nutri-Kids. Adopting `1.0.0` there is the owner's call, in that repo.

## Consequences

- A rule Habla stops meeting breaks a test, not a review.
- `0.x` is a proposal: it does not change either app by itself.
- The calm-mode gap stays visible in the document until the owner decides.
