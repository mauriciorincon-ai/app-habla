# ADR 018 — The family video shelf (S8)

- **Status:** accepted (2026-11-12, Sprint 008). Touches hard rule 2 and 2-bis; the rule itself is formally amended in S11.
- **Sprint:** 008 «Practice in English too».

## Context
The VISION lists a «family video library»: short clips of people the child knows, shown with the adult beside them
as a prop for asking, greeting and playing. Video is the most sensitive thing the app could hold, and rule 2 says
the app never opens the camera and the child's audio and video never persist or leave the device.

## Decision
1. **No camera, ever.** Clips enter only through `<input type="file" accept="video/*">` WITHOUT `capture`: the
   system picker opens the gallery. No `getUserMedia`, `MediaRecorder` or `mediaDevices` in `src/`.
2. **Own store.** IndexedDB `habla-videoteca` (stores `meta` and `datos`), separate from the voice bank. Asking
   about the shelf never creates the database; only saving a clip does.
3. **Caps.** 60 s (when the browser can read the duration), 50 MB per clip, 12 clips. A failed write saves nothing
   and the adult is told.
4. **Local only.** No network, no Sentry, no export, no sharing. `borrarTodo` (Settings → Delete my data) deletes
   the database and waits for it. Delete is two taps, per clip or all.
5. **Locks.** ESLint bans observability imports under the videoteca paths; `tests/unit/privacidad-videoteca.test.ts`
   bans camera and network APIs and requires `controlsList="nodownload noremoteplayback"`; `.gitignore` blocks video
   formats; e2e clips are synthesized inside the test.
6. **Free text «who is in it»** is optional, local, short (40 chars), and the copy asks for a role, never a name.

## Honest limits
- The app offers no download or send button, but a person who owns the device can still reach their own gallery
  file. The copy says «the app has no button», not «there is no way».
- Nothing stops an adult from picking a clip of their own child. The copy says the shelf is meant for other people
  the child knows; rule 2 is amended in S11 to say so explicitly.

## Relation to 2-bis
Clips are what the family keeps of itself: they live only in local storage and never travel, like the voice bank
(ADR-010), and nothing derived from them is written anywhere.
