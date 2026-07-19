# ADR 011 — Export/backup of the family voice bank (local `.zip`)

- **Status:** accepted — **REJECT the export for now** (2026-07-19, Sprint 004; the user validated
  this at the plan gate and may reopen it if real use demands a backup).
- **Sprint:** 004 "El rumbo" + cierre de ciclo H1
- **Extends:** ADR-010 (family voice bank in IndexedDB, local-only). Bound by regla dura 2-bis
  (the bank lives ONLY in local storage — never network, never repo).

## Context

The family voice bank (parents' consented voice, ADR-010) lives in IndexedDB on ONE device. If the
device is lost, reset, or the browser storage is evicted, the bank is gone and the parent has to
re-record. The S3 remate left this as an open question: should the app offer a **local export**
(a `.zip` of the recordings the parent can save to their files) as a backup — strictly local, no
cloud, ever?

The blueprint of the ciclo names the device itself as the single point of failure precisely because
of this: the data lives only there.

## Decision — REJECT (por ahora)

**We do NOT ship a `.zip` export in H1.** Reasons:

1. **A backup that may not restore is a false promise.** ADR-010 records in the device's _native_
   codec (webm/opus on Chrome/Android, mp4/aac elsewhere) and explicitly declares cross-device
   portability a **non-goal**. A `.zip` restored on a different device/browser could contain audio
   that device can't decode — the parent would trust a backup that silently fails. Offering it
   would contradict the app's core rule (honestidad como mecánica): don't claim what you can't
   guarantee.
2. **The cost of losing the bank is low and bounded.** Re-recording a full lote is <10 min (the
   estudio's guided lote is designed for exactly that), and the app already shows coverage so the
   parent sees what's missing. The failure mode is mild and self-healing.
3. **Export widens the privacy surface.** The most sacred promise is that adult voice never leaves
   the device without intent. A file the OS then syncs to a cloud backup (iCloud/Google) by default
   would quietly break regla dura 2-bis's spirit. Keeping the bank inside IndexedDB keeps that
   surface as small as possible.
4. **Scope discipline for the cierre de ciclo.** H1's job is the honest daily loop, not device
   fleet management. This is a real future feature, not a debt we're hiding.

## Consequences

- The estudio keeps its current honest framing: "estas grabaciones viven SOLO en este dispositivo".
  No export button, no import, no `.zip`.
- `docs/BLUEPRINT.html` names **the device** as the single point of failure and cites this ADR as
  the conscious reason there is no backup path yet.
- The manual documents plainly: if you change devices or clear the browser, you re-record — it
  takes a few minutes, and the app shows you what's left.

## Cuándo reabrir

Reopen if real use shows the loss actually hurts (the user asked for it, or a device change lost a
large bank). If reopened, the export MUST: (a) verify on import that the codec is decodable on the
target device and warn honestly when it isn't; (b) be a manual, local, user-initiated file — never
an automatic or networked sync. Cross-device robustness would likely require transcoding to a
universal codec (e.g. WAV/PCM) at export time, which is the real work this defers.
