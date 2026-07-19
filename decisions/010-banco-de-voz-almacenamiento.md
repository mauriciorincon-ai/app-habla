# ADR 010 — Local storage for the family voice bank

- **Status:** proposed (skeleton — completed after the F1 spike)
- **Sprint:** 003 "La voz de la familia"
- **Extends:** ADR-002 (local-first, no server), ADR-003 (audio engine matrix). Bound by regla
  dura 2 (child audio never persists) and its S3 sibling regla dura 2-bis (family voice bank lives
  ONLY in local storage, never network, never repo).

## Context

Sprint 003 records the **parents'** voice (consented adult audio) so the app can play words,
consignas and honest celebrations in a familiar voice — the emotional anchor no robotic voice
gives (VISION § 3). This is the first time the app both **records** (MediaRecorder — new) and
**persists audio** (new). Two questions must be decided and are pending the F1 spike:

1. **Where** the blobs live: OPFS (`navigator.storage.getDirectory()`) vs IndexedDB.
2. **What format** to record in, given the device matrix (webm/opus on Chrome/Android vs mp4/aac
   or absent MediaRecorder on iOS Safari) — ADR-003 covers analysis engines, NOT recording codecs.

## Decision (to be finalized after the spike)

- **Leaning: IndexedDB with Blobs.** Rationale to confirm: OPFS Safari support is partial and its
  API is newer with no real gain for small blobs (~50-200 KB/item); IndexedDB is universal and
  already the persistence the app is allowed to use. A thin typed wrapper, no runtime dependency
  (`fake-indexeddb` as a devDep for the adapter's unit tests). DB `habla-banco-voz`, store
  `grabaciones`, key = `itemId`, value `{blob, mimeType, duracionMs, fecha}`.
- **Record in the device's native format** (`MediaRecorder.isTypeSupported`), store as-is, no
  transcoding — the bank is LOCAL and plays back where it was recorded. Cross-device portability is
  a non-goal (documented here).
- **`navigator.storage.persist()`** requested on first save; honest notice if denied.
- **Feedback-loop guard (risk #1):** while a bank clip plays through the speakers, the live meter
  discards frames (+300 ms tail) so the recorded voice never counts as the child's voice (regla
  dura 3). Belongs here because it's a consequence of persisting+replaying audio.
- **`borrarTodo` MUST be extended** to clear this IndexedDB, or "Borrar mis datos" would lie.
- **Export/backup:** deferred (evaluate a local .zip download in S4; never cloud).

## Spike evidence (F0, 2026-07-18 — `tests/e2e/spike-grabacion.spec.ts`, desktop-chromium)

- **Native record format: `audio/webm;codecs=opus`** (also `audio/webm`, `audio/mp4` supported).
- **MediaRecorder captures the Playwright fake mic in headless:** 10,922 bytes in 700 ms — the
  e2e strategy for the studio is viable (no need for a test-only blob-injection fallback).
- **IndexedDB Blob round-trip: byte-exact** (10,922 → 10,922). **Storage decision firmed: IndexedDB.**
- `navigator.storage.persist()` returned **false** in headless (no engagement / not installed as
  PWA). Not a blocker: the bank works regardless; eviction risk is mitigated with visible coverage
  - an honest notice. May be granted on a real installed PWA — re-checked at the tablet gate. OPFS
    is available (`getDirectory`) but not chosen (no gain for small blobs).

## Consequences

- Still open until F1: the **feedback-loop guard** (meter pause during playback) must be measured
  and validated with a unit + e2e before this ADR moves to `accepted`.
