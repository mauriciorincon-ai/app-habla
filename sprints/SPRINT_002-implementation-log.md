# Sprint 002 — "Cada día más" · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_002-orden.md` (planeadora, RO) · Plan aprobado por el
> usuario 2026-07-12 (plan mode). Branch `sprint-002/cada-dia-mas` desde `main` (post-merge PR #1).
> Gate: escritorio (la tablet sigue de viaje — lista diferida ACUMULADA S1+S2 en la guía).

## Estado por fase

- [x] F0 — Setup (branch, kit-check, bitácora, ADRs propuestos)
- [ ] F1a — Motor de etapas (schema + storage v2 + migración + filtro) con units
- [ ] F1b — Spike pitch (YIN worklet + pitch-tracker + WAV barrido + /spike/audio) → PR draft
- [ ] F1c — Biblioteca ≥45 cápsulas por etapa
- [ ] F1d — Lote ARASAAC + manifest con units
- [ ] F2 — UI (selector, cohete, palabra↔objeto, etapa en Ajustes/Hoy, atribución)
- [ ] F3 — Integración + e2e
- [ ] F4 — Calidad y cierre (manual, guía viva, /deploy-check, summary)

## Verificación de supuestos del kit (orden: v1.5.1 vigente)

- `githooks/pre-commit` **ejecutable** ✅ · `core.hooksPath=githooks` ✅ (gitleaks vivo).
- Budgets ya pagados del S1 presentes: script **350 KB** ✅ · LCP **3800 ms** ✅.
- `vitest.config.ts` coverage sobre `src/lib/**/*.ts` ✅ (el `pitch-tracker` nuevo cae dentro).
- `lighthouse-urls.json` = 3 rutas → se amplía a 6 en F3 (rutas de juego nuevas).
- Candados ESLint scoped a `src/lib/voice/**` + `src/worklets/**` ✅ (el pitch cae DENTRO).

## Fricción de kit (K#) — separada del producto

- **K-habla-5 (menor, de la planeadora más que del kit):** la orden cita "estándares v2.1" pero
  el header de `estandares/estandares.md` dice `version: 2.0.0` (fecha 2026-07-02). El contenido
  que la DoD exige está en la orden misma (autoritativa), así que no bloquea; se registra para
  que la planeadora alinee el header al publicar la próxima versión.

## Desviación del plan

- (ninguna todavía)

## Hallazgos del spike de pitch (para el ADR 007)

- **YIN en el worklet funciona de punta a punta en CI (2026-07-12).** Implementado como CMND con
  interpolación parabólica, ventana de 2048 muestras (~43 ms), búsqueda acotada a 150–500 Hz y
  **gating por energía** (bajo RMS 0.01 no se calcula pitch: el ruido no produce F0 fantasma).
  El contrato del meter **creció** a `{rms, pitchHz|null, tMs}` — uno solo para los tres juegos.
- **Fixture nuevo que CANTA:** `barrido-tono.wav` (fase integrada, 230↔420 Hz, sube·baja·sube·baja
  = 3 inversiones, con 2 armónicos débiles para que YIN vea una señal con forma de voz). Va en un
  **proyecto Playwright dedicado** (`desktop-chromium-tono`) para no tocar el WAV compartido: los
  32 e2e del S1 siguen verdes sin cambios (33/33 con el spike nuevo).
- **Medida clave de estabilidad:** cobertura de pitch (frames con voz que traen F0 confiable)
  **>70 %** en CI. Es el número que decide tono vs. fallback por energía. El panel de pitch del
  `/spike/audio` la muestra en vivo para la prueba con voz real.
- El **fallback honesto** (AnalyserSource) emite `pitchHz: null` siempre: correr YIN en el hilo
  principal a 60 fps castigaría la fluidez. Si el dispositivo no tiene worklet, el cohete degrada
  a energía — documentado, no silencioso.
- **12 unit del `pitch-tracker`** con señales sintéticas, verdes a la primera: sweeps suben/bajan,
  tono plano no cuenta inversiones, temblor <50 cents tampoco, ruido no mueve NI hace caer el
  cohete, salto de octava rechazado, F0 fuera de rango ignorado, olvido tras silencio largo.

## Candados de privacidad extendidos al pitch — verificados con FUGA INYECTADA (2026-07-12)

El `pitch-tracker` vive en `src/lib/voice/`, así que cae **dentro** del scope de los dos candados
del S1 sin tocar su configuración. Pero "debería estar cubierto" no es evidencia: se repitió el
patrón del S1 e **se inyectó una fuga real** en `pitch-tracker.ts` (`localStorage.setItem` con el
pitch del niño + `fetch` a un endpoint de analytics). Resultado:

- **Candado 1 (ESLint scoped):** 2 errores, citando la regla dura 2 por nombre
  (`no-restricted-globals` sobre `localStorage` y `fetch`).
- **Candado 2 (test de escaneo):** `× src/lib/voice/pitch-tracker.ts no toca storage, red ni logs`
  — "usa fetch (red)".

La fuga se revirtió; ambos candados quedan verdes. **El pitch es dato derivado de la voz del niño
y se trata con la misma regla que el audio.**

## Decisiones tomadas durante la construcción

- **Los temas del onboarding por fin HACEN algo** (deuda honesta declarada en el S1): se
  extrajeron a `src/lib/storage/temas.ts` porque ahora los comparten dos mundos — el perfil y la
  **curaduría de pictogramas** (el juego palabra↔objeto filtra por los temas que el padre eligió).
- **Las palabras de los pictogramas son NUESTRAS, en es-CO** (ADR 001): el dibujo de ARASAAC
  `coche.png` se muestra como **"carro"**, y `autobus.png` como **"bus"**. La curaduría humana
  incluye la palabra, no solo la selección del dibujo; hay un unit que lo verifica.
- **Lote ARASAAC: 42 pictogramas** (≥5 por cada uno de los 6 temas), descargados una vez con
  `scripts/descargar-pictos.mjs`, commiteados con `LICENCIA.md` (CC BY-NC-SA, atribución a Sergio
  Palao / ARASAAC / Gobierno de Aragón) y `lote.json` (trazabilidad del id original). Verificados
  visualmente durante la construcción. En runtime **no hay ninguna llamada a ARASAAC**.
