# ADR 005 — Single words first: every feature starts at the single-word stage

- **Status:** accepted — **ratified by the user during the Sprint 001 visual gate (2026-07-12)**
- **Sprint:** 001

## Context

The app exists for one real child, who today communicates in **single words** — he does not
combine words yet. What the family needs first is to awaken the **word↔object/activity
association** and elicit more single words. During the first real use of the preview, the father
found that several capsules (notably the expansion/recast ones) assumed a child who already forms
two-word phrases — unreachable examples for this family today. His directive, verbatim in spirit:
_everything we develop must start with single words; an advanced level later is fine, but the app
centers on words for now._

## Decision

**Every piece of content and every feature ships calibrated to the single-word stage by
default.** Concretely:

1. **Content:** all capsules target single words and word↔object association. Examples use
   one-word utterances, word attempts ("aba" → "¡agua!") and gestures — never assume the child
   combines words. This was applied retroactively to the full seed library in this sprint.
2. **Mechanics:** games never require words. The voice game measures sustained vocal energy —
   any sound counts. Future mechanics follow the same principle: the child's _current_ abilities
   are always enough to play.
3. **Future levels:** a "short phrases" level may arrive in a later sprint as an **opt-in
   setting** — never as the default, and never replacing the single-word content. "Single words"
   is the permanent default of this app.
4. **Sprint planning:** any future order or feature proposal touching content or game mechanics
   is evaluated against this rule first. If it assumes word combinations, it is either
   recalibrated or explicitly gated behind the future level setting.

## Consequences

- The seed library (14 capsules) was fully rewritten at this level; the capsule schema did not
  change. A `nivel` field on capsules/profile is anticipated for the future level system (S2+),
  and will default to single words.
- The honest-celebration mechanic already aligns: the app measures voice, never vocabulary.
- The planner house should carry this rule into future build orders for this app (it reads the
  sprint summary, where this is recorded).
