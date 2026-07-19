# Kit de prueba — voces sintéticas

> Ítem 0 del Sprint 003 (deuda comprometida en el S2). Estos WAV son **voces falsas generadas por
> código** — cero grabaciones reales, cero voz de nadie. Existen para que tú (o cualquiera) pueda
> probar los juegos de voz **sin usar la voz del niño ni la tuya**, y para alimentar el micrófono
> falso de la CI.

## Qué hay aquí

| Archivo             | Qué simula                                                                                                              | Para qué juego sirve                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `voz-sintetica.wav` | Silencio → voz sostenida → silencio (8 s). Ejercita la calibración del ruido y la histéresis de "hay voz / no hay voz". | **El globo** (duración sostenida) y **palabra y dibujo** (cualquier voz enciende el dibujo). |
| `barrido-tono.wav`  | Un tono que sube y baja como una sirena (11 s), con 2 armónicos para que parezca voz de verdad.                         | **El cohete** (sigue el tono; cuenta 3 inversiones).                                         |

Ambos son PCM 16-bit mono a 48 kHz — el formato que "oye" el motor de la app.

## Cómo usarlos

- **Para probar sin hablar:** en Chrome de escritorio, abre `chrome://settings/content/microphone`
  y no hay forma directa de inyectar un archivo desde el navegador normal; estos WAV están pensados
  sobre todo para la **CI** (Playwright los reproduce con `--use-file-for-fake-audio-capture`).
- **Para verlos/oírlos:** ábrelos con cualquier reproductor. `barrido-tono.wav` suena como una
  sirena de juguete; `voz-sintetica.wav` como una vocal larga entre dos silencios.
- **Se generan con** los scripts del repo: `scripts/gen-voz-sintetica.mjs` y
  `scripts/gen-barrido-tono.mjs` (Node puro, sin dependencias). Si cambias el motor de voz y
  necesitas otra señal, edita esos scripts y regénralos.

## Qué NO son

- **No** son la voz de la familia. El banco de voz familiar (S3) se graba desde la app, vive **solo
  en tu dispositivo** y nunca entra a este repo. Estos WAV son utilería de prueba, públicos a
  propósito.
- **No** son la voz del niño. Su voz **jamás** se graba (regla dura de la app).
