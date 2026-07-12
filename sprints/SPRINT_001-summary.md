---
sprint: 001
app: habla
feature: hoy-hablamos
estado: listo-para-merge (pendiente validación del usuario en la tablet real)
fecha: 2026-07-11
---

# Sprint 001 — "Hoy hablamos" · Summary

> Primer corte de **Hablemos San**. Lo que la planeadora necesita para la retro.

## Qué se entregó (contra los 2 outcomes)

**Outcome 1 — La respuesta de HOY (la estrella ⭐⭐⭐):** ✅
La pantalla "Hoy" abre con **la cápsula del día**: técnica con evidencia explicada en 30 s + **el
guion de una línea** + la actividad concreta + la fuente citada. Biblioteca de **14 cápsulas es-CO**
(`content/capsulas.ts`) cubriendo las 5 técnicas (§A.3): modelado, expansion-recast,
espera-estructurada, seguir-interés, estimulación-focalizada. Selector determinista por **fecha
local**: la cápsula no cambia al recargar ni al completarla, no se repite hasta agotar la
biblioteca, y al agotarla arranca un ciclo nuevo sin borrar el historial. Completarla persiste sin
conexión. Historial **sin rachas punitivas** ("lo que cuenta es volver, no la racha").
Onboarding local mínimo (apodo opcional + temas), sin cuentas.

**Outcome 2 — Su voz mueve el mundo (el primer juego):** ✅
Guion del padre → permiso de micrófono con explicación honesta → calibración lúdica de 2 s →
**el globo avanza SOLO mientras el niño sostiene la voz** → **celebración honesta con la métrica
real** ("¡la sostuviste 3,1 segundos!"). RMS por AudioWorklet, umbral relativo al ruido de la casa
con **histéresis + tiempo de gracia** (sobrevive el micro-silencio de respirar sin parpadear).
Estados completos: mic denegado (pasos honestos), ruido alto (avisa y deja decidir), silencio largo
(invitación amable, jamás castigo), **modo calma en 1 toque** (sin medidor, sin meta, sin
celebración automática). Sin límite de tiempo, sin game-over.

## Definition of Done — los 6+1

| Gate                   | Estado         | Evidencia                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Testing**         | ✅             | 64 unit (motores con señales sintéticas) + 22 e2e ×2 dispositivos. Cobertura global 90 %; motores puros ≥80 %. Incluye e2e con **micrófono falso real** (WAV sintético), e2e de **cero-red** y axe.                                                                                                                                                                                                                                        |
| **2. CI/CD**           | ✅ verde local | typecheck + lint + test + build + e2e + lighthouse pasan. **Falta: importar el repo en Vercel** (acción del usuario) y validar la preview en la tablet.                                                                                                                                                                                                                                                                                    |
| **3. Observabilidad**  | ✅             | Sentry inerte sin DSN, metadata-only (`beforeSend` borra request y breadcrumbs). Cero audio, cero contenido. Defer aceptado.                                                                                                                                                                                                                                                                                                               |
| **4. Seguridad**       | ✅             | gitleaks vivo desde el commit 1 (hook 100755 + `core.hooksPath`). Cero secrets. **El audio del niño no toca storage, red ni logs**: doble candado (regla ESLint scoped + test que escanea el código y prohíbe `eslint-disable`), verificado inyectando una fuga real —ambos candados la bloquearon—.                                                                                                                                       |
| **5. Performance**     | ⚠️ con deuda   | LCP real **24 ms** y CLS **0** en las 3 rutas; con throttling real, LCP 1524 ms y **Performance 100/100**. **Budget de LCP renegociado 3000→3800 ms** (ver deuda técnica). 60 fps del juego: **pendiente de validar en la tablet**.                                                                                                                                                                                                        |
| **6. UX/A11y**         | ✅             | axe limpio en las 3 rutas × **2 temas (claro y oscuro)** × 2 dispositivos **y dentro del juego** (paleta del niño + modo calma). Lighthouse A11y **100** en las 3 rutas. Touch del niño ≥64 px (verificado por e2e), adulto ≥44 px. Teclado verificado (foco visible; interruptores operables con Enter). `prefers-reduced-motion` + ajuste propio. COGA: sin límite de tiempo, sin game-over, errores sin castigo. Microcopy 100 % es-CO. |
| **7. IA embebida**     | N/A            | Cero LLM, cero SDK de IA, como mandaba la orden.                                                                                                                                                                                                                                                                                                                                                                                           |
| **Manual de uso**      | ✅             | `docs/MANUAL-DE-USO.md`: cómo usar "Hoy", cómo dirigir el juego, **qué mide y qué NO mide**, privacidad, modo calma, FAQs.                                                                                                                                                                                                                                                                                                                 |
| **Revisión de diseño** | ⏳             | `design-system.md` redactado desde los tokens del prototipo (paleta dual). **Falta la aprobación visual del usuario sobre la preview, en la tablet** (idealmente con el niño observando).                                                                                                                                                                                                                                                  |

## ADRs

| #   | Tema                                                                                        |
| --- | ------------------------------------------------------------------------------------------- |
| 001 | Solo español (es-CO), sin i18n bilingüe                                                     |
| 002 | Persistencia local-first, sin cuentas ni backend (privacidad de menor)                      |
| 003 | Matriz de audio: AudioWorklet + fallback AnalyserNode — **propuesto**, cierra con la tablet |
| 004 | Carga del AudioWorklet en Next 16 / Turbopack (compilación aparte a `public/worklets/`)     |

## Deuda técnica explícita

1. **Budget de LCP renegociado (3000 → 3800 ms).** El gate mide con Lantern (simulado, sobre
   localhost) y reporta ~3.38 s con un 86 % de "render delay", mientras el LCP **real** de las tres
   rutas es de ~24 ms (= FCP) y con throttling real 1524 ms con score 100/100. Antes de tocar el
   budget se corrigieron los defectos reales que Lighthouse sí destapó: el candidato LCP de
   `/jugar` y `/ajustes` nacía en el cliente, y `/ajustes` tenía CLS 0.156 por un esqueleto vacío.
   Ambos arreglados. **Propuesta al kit:** evaluar `throttlingMethod: devtools` en el job de
   Lighthouse, o calibrar el budget para el sesgo conocido de Lantern en localhost.
2. **`/spike/audio` sigue en el repo** (a propósito): el usuario la necesita en la preview para
   validar el audio en la tablet Android real. **Se elimina antes del merge final**, junto con
   cerrar el ADR 003.
3. **Iconos de la PWA son un placeholder generado** (globo crema sobre sage). Se refinan en el
   gate visual.

## Fricción del kit (para la retro — separada del producto)

- **K-habla-1:** `vitest.config.ts` traía el umbral del 80 % apuntando a `src/engine/**`, que esta
  app no usa (su estructura es `src/lib/**`, según su CLAUDE.md). Reapuntado. Sugerencia:
  parametrizar el glob de motores en el estampado.
- **K-habla-2:** la orden dice "kit v1.3.1" pero el estampado real fue **v1.4.0**. Sin impacto
  (v1.4.0 trae lo que la orden verificaba), pero conviene alinear el texto de las órdenes.
- **K-habla-3:** el sesgo de Lantern en el gate de Lighthouse (ver deuda 1). Ya visto en otras
  apps del pipeline; aquí queda medido con números.
- **K12 validado:** hooks **ejecutables y activos** desde el commit 1 (`githooks/pre-commit` 100755,
  `core.hooksPath=githooks`, script `prepare`). gitleaks corrió en los 4 commits. ✅

## Aprendizajes técnicos

- **Turbopack no carga worklets con `new URL(...)`:** el processor se compila aparte con `tsc` a
  `public/worklets/` y se carga por URL. Mantiene TS strict y —clave— deja el archivo visible para
  la guardia de privacidad estática.
- **Carrera de hidratación:** un clic puede llegar antes de que React hidrate y perderse en
  silencio (rompía el e2e de forma intermitente). Patrón adoptado: los botones que abren el
  micrófono nacen `disabled` hasta hidratar (`useHidratado`, con `useSyncExternalStore`).
- **El estado local no debe entrar por `useState` + `useEffect`:** con `useSyncExternalStore` el
  snapshot del servidor es `null`, no hay mismatch de hidratación y el lint de React 19 (que
  prohíbe `setState` dentro de efectos) queda contento.
- **La paleta dual tenía una trampa de contraste:** el sage claro del niño con texto crema daba
  1.9:1 (falla AA). Se resolvió con un token semántico `--sobre-acento` que cambia con la paleta.
  Lo detectó la revisión visual; ahora lo vigila axe dentro del juego.
- **La honestidad se puede testear:** `sostenidoMs` solo acumula tiempo con energía real por
  encima del umbral (durante el tiempo de gracia el globo sigue volando, pero el contador no
  corre). La app nunca reporta más segundos de los que el niño de verdad sostuvo.
- **Un gate que solo mira un tema es medio gate:** el axe del e2e auditaba solo el tema claro y
  dejó pasar un contraste de 3.1:1 en modo oscuro (lo cazó Lighthouse en el `/deploy-check`).
  Ahora axe corre las 3 rutas en claro **y** oscuro. Vale para el pipeline: si la app tiene dos
  paletas, el gate tiene que recorrer las dos.

## Lo que falta para cerrar (acciones del usuario)

1. **Importar el repo en Vercel** (~3 min) → preview del PR.
2. **Probar `/spike/audio` en la tablet Android real**: latencia, estabilidad, `getSettings()`
   (¿Android respeta las constraints?), piso de ruido de la casa, 60 fps → cierra el **ADR 003**.
3. **Gate visual sobre la preview, en la tablet** (idealmente con el niño observando) y
   **validación de las 14 cápsulas**: si alguna no le sirve a ESTA familia, se reemplaza antes del
   merge.
4. Sentry: defer aceptado (no hace falta nada).

## Aprovisionamiento

| Servicio                          | Estado                                 |
| --------------------------------- | -------------------------------------- |
| GitHub repo `app-habla` + ruleset | ✅ (estampado)                         |
| Vercel                            | ⏳ **pendiente: importar el repo**     |
| Sentry                            | ⏳ defer aceptado (kit inerte sin DSN) |
| API LLM                           | N/A — cero IA en este sprint           |
