# ADR 002 — Local-first persistence, no accounts, no backend

- **Status:** accepted
- **Sprint:** 001

## Context

The app serves one family on their own devices. The child is a minor (Colombian Ley 1581 data
protection applies) and the hard product rule is that **the child's audio never persists and
never leaves the device** — it lives only in the in-memory analysis buffer. The only state worth
keeping is small and non-sensitive: capsule progress, session settings, and the minimal local
onboarding (optional nickname + 2–3 interest themes).

## Decision

- **No backend, no server routes, no auth, no database.** The app is fully client-side.
- Persistence uses **`localStorage` only** in Sprint 1, behind a typed module
  (`src/lib/storage/`): zod-validated schemas, versioned keys (`habla:v1:*`), corrupt values are
  deleted and treated as absent, and a `borrarTodo()` wipes every `habla:`-prefixed key (plus
  best-effort cache cleanup). IndexedDB is reconsidered only when batch content arrives
  (storyteller sprint).
- **Audio is ephemeral by construction:** `src/lib/voice/` and `src/worklets/` are barred from
  storage/network/log APIs by a scoped ESLint guard plus a unit test that scans their sources
  (and rejects `eslint-disable`). Sentry stays metadata-only and inert without DSN.

## Consequences

- Privacy promise is enforceable by CI, not just by review.
- Progress is per-device/per-browser: clearing site data resets the app. Accepted for a personal
  app; the manual documents it honestly.
- All payloads are tiny JSON (<2 KB); synchronous reads keep the first client render simple.
