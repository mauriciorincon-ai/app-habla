# Recognizer — licenses (S11, ADR-023)

The files of «¿Dijo la palabra?» are **not the work of this app**. They are fetched at build time by
`scripts/traer-modelos.mjs`, checked against the SHA-256 pinned in `scripts/modelos.json`, and are **not
committed** to this repository. The device downloads them from the app itself, only when the adult turns
the recognizer on in Ajustes, and checks the same hash again.

| Served at                                 | What                                                                                                          | Author                                                     | License            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------ |
| `/modelos/es.zip`                         | `vosk-model-small-es-0.42` (Spanish small model)                                                              | Alpha Cephei Inc. — https://alphacephei.com/vosk/models    | Apache License 2.0 |
| `/modelos/en.zip`                         | `vosk-model-small-en-us-0.15` (US English small model)                                                        | Alpha Cephei Inc. — https://alphacephei.com/vosk/models    | Apache License 2.0 |
| `/vosk/vosk.worker.js`, `/vosk/vosk.wasm` | `@lichess-org/vosk-browser@0.0.3` (Vosk compiled to WebAssembly, a fork of `vosk-browser` by Ciaran O'Reilly) | lichess.org contributors; Vosk by Alpha Cephei Inc.; Kaldi | Apache License 2.0 |

Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0 — use, copy and redistribution are allowed
with this notice; the files are served unmodified.
