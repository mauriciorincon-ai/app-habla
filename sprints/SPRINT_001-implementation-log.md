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
- **K-habla-3 (confirma K del kit):** el LCP **simulado** de Lighthouse (Lantern, método por
  defecto de `lhci autorun`) sobre localhost castiga a esta app sana. Evidencia medida en el
  build de producción: **LCP real 24 ms** (= FCP, elemento estático) y, con **throttling real**
  (`throttlingMethod=devtools`, 4G lenta + CPU 4×): **LCP 1524 ms, CLS 0.006, TBT 24 ms,
  Performance 100/100**. El simulado, en cambio, reporta ~3.38 s uniformes en las 3 rutas, con
  86 % de "render delay" atribuido. Sugerencia al kit: considerar `throttlingMethod: devtools`
  o un budget de LCP calibrado para el sesgo de Lantern en localhost.

## Desviación del plan

- **Budget de LCP renegociado: 3000 ms → 3800 ms** (deuda técnica explícita, permitida por el
  estándar 5). Motivo: el gate mide con Lantern (simulado), que reporta ~3.38 s mientras el LCP
  real de las tres rutas es de ~24 ms y con throttling real 1.5 s (score 100). Antes de tocar el
  budget se corrigieron los defectos REALES que sí existían: el candidato LCP de `/jugar` y
  `/ajustes` nacía en el cliente (dependía del almacenamiento local) y `/ajustes` tenía CLS 0.156
  por un esqueleto vacío. Ambos arreglados: hoy las tres rutas pintan su LCP en el HTML del
  servidor y el CLS es 0. El nuevo budget deja ~12 % de margen sobre el valor simulado, como pide
  `wiki/patterns/lcp-nace-estatico.md` (no clavar el budget en el valor medido).

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

## Hallazgos del `/deploy-check`

- **Contraste en modo OSCURO (defecto real, encontrado por Lighthouse, no por axe):** el botón
  "Borrar mis datos" usaba el rojo del tema claro (`#B14B3D`) sobre la superficie oscura →
  **3.11:1**, falla AA. La causa de fondo: el e2e de axe solo auditaba el tema claro. Arreglado
  en dos frentes: (a) los colores de estado (éxito/aviso/peligro/info) tienen ahora variante
  clara para el tema oscuro; (b) **el e2e de axe corre las 3 rutas en `light` Y `dark`** — el
  gate ahora sí puede cazar esto. Scores finales: A11y **100** en las 3 rutas.
- **Navegación por teclado verificada** (no solo axe): las 3 rutas se recorren con Tab con el
  foco visible en todos los elementos, y los interruptores se operan con Enter.
- Lighthouse (móvil, las 3 rutas): Performance 90–93 · A11y 100 · Best Practices 100 · SEO 100.

## Gate de revisión de diseño (checklist del skill `diseno-ui`)

Corrido por el builder sobre la app real (móvil 412 px + desktop 1280 px, con micrófono falso).
**La aprobación visual del usuario sigue PENDIENTE** — se hace sobre la preview, en la tablet.

| Ítem                                            | Estado                                                                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fiel a `design-system.md`, cero valores mágicos | ✅ toda la UI consume tokens semánticos                                                                                                                                  |
| Jerarquía clara en <3 s                         | ✅ Hoy: la cápsula · Juego: el globo                                                                                                                                     |
| Los 5 estados diseñados                         | ✅ documentados en `design-system.md` (vacío = onboarding, no un placeholder gris)                                                                                       |
| Densidad y ritmo de espaciado                   | ✅ escala base 4; vista del niño aireada                                                                                                                                 |
| Motion sutil y desactivable                     | ✅ el único movimiento es el globo (que ES el feedback); `prefers-reduced-motion` + ajuste propio                                                                        |
| Microcopy es-CO, sin inglés residual            | ✅                                                                                                                                                                       |
| **Cero anti-patrones**                          | ❌→✅ **incumplía "emojis como iconografía"** (🎤🔇📢🤫🎈). Corregido: iconos SVG propios (`src/components/iconos.tsx`) y el globo como personaje con la paleta del niño |
| Responsive 360–420 y ≥1024 revisados a mano     | ✅ ambos capturados y revisados                                                                                                                                          |
| Aprobación visual del usuario                   | ⏳ **pendiente (en la tablet)**                                                                                                                                          |

**Otro hallazgo del gate:** el texto dirigido al padre se filtraba a la vista del niño durante el
juego, contra la regla "la vista del niño es soberana". Se retira al arrancar el juego, sin tocar
el LCP (el párrafo sigue naciendo visible en el HTML).
**Lección técnica:** la primera versión usaba `main:has([data-fase]…)`; **Lightning CSS —el
compilador de Tailwind v4— descarta esa regla en silencio** (estaba en `globals.css` pero no en el
CSS servido). Se detectó verificando en el navegador, no confiando en el código. Sustituida por un
`data-attribute` en el `<html>`.

## Decisiones tomadas durante la construcción

- 2026-07-11 — Carga del AudioWorklet: compilación separada con `tsc` a `public/worklets/`
  (Turbopack no soporta `new URL(...)` para worklets) → ADR 004 (se escribe con el spike).
- 2026-07-11 — PWA sin dependencias (manifest.ts nativo + sw.js a mano ~80 líneas, network-first
  en navegaciones): serwist/next-pwa integran vía webpack y este repo compila con Turbopack.
