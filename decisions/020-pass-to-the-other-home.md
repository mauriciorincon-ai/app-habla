# ADR 020 — «Pasar a la otra casa»: an encrypted, local file between two devices

- **Status:** accepted (2026-11-13, Sprint 010). Owner decisions: «2b» (S7: the child practices in two
  homes, so the progress must travel) and «1a» of this sprint's G-Plan (the file is encrypted with a
  phrase the adult types when creating it and when opening it).
- **Amends:** ADR-011 **for this case only** (the voice bank may travel inside this file, when the adult
  ticks it). ADR-011 still rejects a standalone export or backup of the bank.
- **Bound by:** ADR-002 (no backend, no accounts), regla dura 2 (the child's voice is never stored or
  sent), 2-bis (the adult's voice bank leaves only by explicit action), regla 8 (nothing that identifies
  the family travels), regla 17-bis (a derivative is never less private than its source).

## Context

The family practices in two homes. Each device keeps its own local data (ADR-002), so what the child
did in one home is invisible in the other. A server or an account would break ADR-002, and so would a
networked sync. The adult can already move files between devices on their own (messages, a cable, a
memory card); the app only has to make that file safe and honest.

## Decision

1. **What travels** (`src/lib/otra-casa/paquete.ts`, `.strict()`, schema version 1): the goal of the week,
   the progress (capsule history and cycles), the «logros» — the game-session registry the Rumbo already
   reads — and the twin-word judgements. The adult's voice bank, **only if ticked**, as base64 with its
   MIME type. **Never**: the child's voice (it is never stored, regla dura 2), the video shelf, the profile
   (the nickname could identify the child), this device's settings, or the stories. One extra field
   rejects the whole file; a unit test pins the exact field list.
2. **How it is protected** (decision «1a», `cifrado.ts`): Web Crypto only, no dependency. PBKDF2-SHA-256
   with 600 000 iterations and a fresh 16-byte salt derives an AES-GCM-256 key; a fresh 12-byte IV per
   file. The phrase has at least ten characters, is typed twice when creating, is **never stored and never
   in the file**. AES-GCM authenticates: a wrong phrase or one changed byte makes decryption fail, and the
   app reads nothing. The clear envelope says only format, version, KDF parameters, salt and IV. A file
   asking for fewer than 100 000 or more than 2 000 000 iterations is rejected as foreign. The GCM tag is
   the integrity check; no separate fingerprint is added (the plan's SHA-256 was redundant with it).
3. **How it comes in** (`fusion.ts`, pure): the adult sees **what will change** before anything is
   written — goal before → after, sessions, rounds and capsules added, recordings in, already here, and
   recordings this device cannot play. Nothing on the receiving device is deleted: registries are unioned
   (an identical record is not duplicated, so a file that comes back home does not count twice), the most
   advanced cycle per stage wins, today's capsule of this device stays, the goal is replaced only by one
   as recent or newer, and only new recordings that this browser can play (`canPlayType`) enter. This
   fulfils ADR-011's reopening conditions: (a) the codec is checked on import and the adult is told,
   (b) the file is manual, local and user-initiated.
4. **Where:** Ajustes → «Pasar a la otra casa». File name `habla-otra-casa-<date>.habla` (date only).
   The `otra-casa/` folder is under the same no-network locks as the voice bank (ESLint and
   `tests/unit/privacidad-banco.test.ts`).

## Consequences

- If the phrase is forgotten, the file cannot be opened. The app says so before creating it.
- A file is a snapshot: the homes exchange it again when they want to catch up. No automatic sync.
- Two identical sessions on the same day in both homes count once (multiset union by the larger side).
- The file may end up in a cloud the operating system syncs; it is encrypted, which is why «1a» exists.
