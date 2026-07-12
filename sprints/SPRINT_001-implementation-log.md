# Sprint 001 — Bitácora de implementación ("Hoy hablamos")

> Orden: `portafolio/habla/ordenes/SPRINT_001-orden.md` (planeadora, read-only).
> Plan aprobado: 2026-07-11 (plan mode). Branch: `sprint-001/hoy-hablamos`.

## Estado por fase

| Fase                          | Estado        | Notas                                                                                                     |
| ----------------------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| 0 — Setup                     | ✅ 2026-07-11 | branch + bitácora + ADRs 001/002 + tokens + design-system + worklet build; typecheck/lint/build verdes    |
| 1a — Spike audio              | 🔨 en curso   | spike fake-mic en CI ✅ (e2e verde ×2 proyectos); FALTA la tablet Android real (preview Vercel) → ADR 003 |
| 1b — Motores puros            | ⏳            |                                                                                                           |
| 1c — Contenido (≥14 cápsulas) | ⏳            |                                                                                                           |
| 2 — UI                        | ⏳            |                                                                                                           |
| 3 — e2e                       | ⏳            |                                                                                                           |
| 4 — Cierre                    | ⏳            |                                                                                                           |

## Verificación de supuestos del kit (v1.4.0 — batch K12)

Hecha 2026-07-11 durante el plan:

- ✅ Hooks ejecutables y ACTIVOS: `githooks/pre-commit` 100755, `git config core.hooksPath` ⇒
  `githooks`, script `prepare` presente (K12 validado).
- ✅ Configs de test presentes (vitest jsdom + playwright Pixel 7/desktop), `perf-budget.json`,
  `lighthouse-urls.json`, CI 3 jobs, tsconfig strict, Sentry inerte sin DSN.
- ✅ Deps de testing completas (vitest, playwright, @axe-core/playwright, testing-library).

## Fricción de kit (K#) — separada del producto

- **K-habla-1:** `vitest.config.ts` trae umbral 80% apuntando a `src/engine/**`, pero esta app
  usa `src/lib/**` (CLAUDE.md estructura). Se reapunta en Fase 0. Sugerencia al kit:
  parametrizar el glob de motores en el estampado.
- **K-habla-2:** la orden de construcción dice "kit v1.3.1" pero el estampado real fue
  **v1.4.0** (commit `c986c26`). Sin impacto: v1.4.0 incluye lo que la orden verifica de v1.3.1
  (hooks vivos, `prepare`, ruleset). Registrado para la retro de la planeadora.
- (K7 heredado, documentado en el propio vitest.config.ts): `--coverage` se añade al script
  `test` junto con los primeros tests — se hace en Fase 1b.

## Desviación del plan

- (ninguna por ahora)

## Hallazgos del spike (para el ADR 003)

- **Fake-mic headless (macOS, Chromium Playwright):** pipeline completo
  getUserMedia → AudioContext → AudioWorklet fluye sin fricción. `AudioContext.state` nace
  `running` en headless con los flags fake (sin necesidad de `--autoplay-policy`); primer frame
  a ~35 ms de reloj de audio; RMS máx. 0.294 en la ventana de voz del WAV (esperado ≈0.25–0.3) y
  ~0.0008 en el silencio. El e2e del spike pasa en mobile-chromium y desktop-chromium (3.4 s).
- **Carrera de hidratación (lección e2e):** el clic de Playwright puede llegar antes de que
  React hidrate el handler → el clic se pierde en silencio. Fix de patrón: los botones que
  disparan audio nacen `disabled` hasta el primer `useEffect` (Playwright espera botones
  habilitados). Aplicar el mismo patrón en la UI del juego.
- Pendiente en la tablet real: latencia percibida, estabilidad, `getSettings()` (¿Android
  respeta echoCancellation/noiseSuppression/autoGainControl en false?), piso de ruido de casa.

## Decisiones tomadas durante la construcción

- 2026-07-11 — Carga del AudioWorklet: compilación separada con `tsc` a `public/worklets/`
  (Turbopack no soporta `new URL(...)` para worklets) → ADR 004 (se escribe con el spike).
- 2026-07-11 — PWA sin dependencias (manifest.ts nativo + sw.js a mano ~80 líneas, network-first
  en navegaciones): serwist/next-pwa integran vía webpack y este repo compila con Turbopack.
