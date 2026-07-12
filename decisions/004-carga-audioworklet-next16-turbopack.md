# ADR 004 — Loading the AudioWorklet under Next 16 / Turbopack

- **Status:** accepted
- **Sprint:** 001

## Context

`AudioWorkletProcessor` code runs in a separate global scope (no DOM, no bundler runtime) and is
loaded by URL via `audioWorklet.addModule(url)`. We want the processor written in TypeScript
under `src/worklets/`, type-checked with the same `strict` settings as the app, and scannable by
the privacy guard. Next 16 in this repo compiles with **Turbopack** (`next dev` / `next build`,
no webpack config).

## Options considered

1. **`addModule(new URL("./rms-processor.ts", import.meta.url))`** — webpack 5 recognises this
   pattern for worklets. Turbopack has no documented, stable support for it, so this would make
   the _loading mechanism_ the sprint's biggest unknown, on top of the audio risk itself.
2. **Blob URL from an inlined source string** — zero build step, but the processor would live in
   a template literal: no typecheck, no lint, and the ESLint privacy guard (which is scoped by
   file path) could not see it.
3. **Separate `tsc` compilation to a static file** — chosen.

## Decision

Compile `src/worklets/*.ts` with a dedicated `tsconfig.worklet.json`
(`lib: ES2022`, `types: []`, `outDir: public/worklets`) and load it with
`audioWorklet.addModule("/worklets/rms-processor.js?v=1")`.

- The processor is **import-free and self-contained**; worklet globals
  (`AudioWorkletProcessor`, `registerProcessor`, `sampleRate`, `currentTime`) are declared in
  `src/worklets/audio-worklet.d.ts`, so `strict` holds with no `any`.
- `package.json` chains the step explicitly — `"dev"` and `"build"` run
  `pnpm build:worklet && next …` — rather than relying on a `prebuild` hook, whose behaviour has
  changed across pnpm majors.
- `public/worklets/` is **gitignored**: it is a build artifact. Vercel and Playwright's webServer
  both regenerate it because both run `pnpm build`/`pnpm dev`.

## Consequences

- The emitted file carries no content hash, so it is cached by URL. Mitigation: the manual
  version suffix `?v=1` in `MicSession.WORKLET_URL` — **bump it whenever the processor changes**
  (the service worker precaches that exact URL).
- The processor is not bundled with the app: it cannot import shared code. That is a feature
  here — it keeps the audio hot path free of anything that could reach storage or network
  (hard rule 2).
