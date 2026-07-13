# ADR 006 — Speech stages as an engine ("palabras sueltas" as the permanent default)

- **Status:** proposed — Sprint 002
- **Extends:** ADR 005 (single words first — product rule ratified by the user)

## Context

ADR 005 fixed the product rule: all content is born at the single-word level. Sprint 002 turns
the rule into an engine: the library grows to ≥45 capsules organized by **speech stage**
(`sonidos-e-intentos` · `palabras-sueltas` · `primeras-frases`), and the parent selects the
active stage in Ajustes, described by observable behavior (no clinical jargon).

## Decision

- `etapa` becomes a required field of every capsule (zod enum, `content/schema.ts`), with
  per-stage minimums enforced by the library schema (≥8 / ≥30 / ≥7, total ≥45).
- The active stage lives in `AjustesGuardados.etapa` with `.catch("palabras-sueltas")`: it is
  always defined, and **"palabras-sueltas" is the permanent default**. "primeras-frases" only
  activates by explicit parent choice — never automatically (ADR 005).
- `Progreso` becomes per-stage (`porEtapa: Record<Etapa, {ciclo, cicloCompletadas}>`):
  exhausting one stage never resets another; the global `historial` never resets.
- **Migration v1→v2 is mandatory:** existing device data (the user's real progress) is
  transformed — v1 completions belong to `palabras-sueltas` — never discarded. Unit-tested
  against the exact v1 shape.
- The daily selector filters by active stage, does not repeat until the stage is exhausted, and
  reassigns today's capsule when the stage changes (assignment stability is per stage+date).

## Consequences

- Changing stage in Ajustes changes today's capsule but deletes nothing (honest copy says so).
- The "Hoy" card shows the capsule's stage discreetly (parent view).
- Future stages/levels plug into the same engine without touching history.
