---
paths:
  - "src/lib/voice/**"
  - "src/lib/audio/**"
  - "src/worklets/**"
---

# Voz y audio (reglas duras 1, 2, 3 y 25)

- La voz del niño no sale del aparato: ni `localStorage`, IndexedDB ni OPFS, ni red, ni logs, ni Sentry. `lib/voice/` no importa APIs de persistencia ni de red; `tests/unit/privacidad-voice.test.ts` lo vigila.
- La app no abre la cámara.
- Los motores son puros y se prueban con señales sintéticas; la UI no habla Web Audio crudo.
- El worklet cruza mensajes tipados (`tsconfig.worklet.json`); no se tocan umbrales ni histéresis sin decisión del dueño.
- Pruebas siempre con micrófono falso y WAV sintéticos (`tests/fixtures`); jamás una voz real ni el micrófono real fuera del ensayo.
- La app afirma solo lo que el DSP midió; el acierto de la palabra lo juzga el adulto.
