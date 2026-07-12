---
sprint: 002
app: habla
feature: cada-dia-mas
estado: listo-para-gate-de-escritorio (CI verde; falta el veredicto del usuario)
fecha: 2026-07-12
---

# Sprint 002 — "Cada día más" · Summary

> Segundo corte de **Hablemos San**. Lo que la planeadora necesita para la retro.

## Qué se entregó (contra los 3 outcomes)

**Outcome 1 — La biblioteca crece y aprende etapas:** ✅
La biblioteca pasa de 14 a **50 cápsulas es-CO** organizadas por **etapa del habla** (ADR 006):
**8 sonidos e intentos · 35 palabras sueltas · 7 primeras frases**. Supera los mínimos pedidos
(8/30/7) y **"palabras sueltas" es —a propósito— la etapa más grande**: es el default permanente
(ADR 005), y hay un unit que falla si alguna vez deja de serlo. La novedad no vino de rellenar,
sino de **rutinas reales**: el carro, el mercado, el parque, la calle, vestirse, la hora de dormir,
turnos con sonidos, canciones con pausa, cuentos con huecos. Cada cápsula conserva el contrato del
S1 (técnica citada §A.3 + explicación de 30 s + guion de una línea + actividad + fuente) y los
anti-claims §D siguen bajo test.

El padre elige la etapa en **Ajustes**, descrita por comportamiento observable ("dice palabras de
a una"), nunca con jerga clínica. **"Primeras frases" jamás se activa sola** (e2e lo verifica).
Cambiar de etapa **no borra nada**: el ciclo de cada etapa es independiente y el historial es uno
solo. El progreso del S1 se **migra** (v1→v2), no se descarta.

**Outcome 2 — El cohete del tono:** ✅
Segunda mecánica de voz, **100 % determinista y local**: **YIN** (CMND + interpolación parabólica)
dentro del AudioWorklet existente, con **gating por energía** — el ruido de la casa no produce F0
fantasma. El contrato del meter **creció** (`{rms, pitchHz|null, tMs}`) en vez de duplicarse: los
tres juegos leen el mismo frame. El motor puro `pitch-tracker` (rango infantil 200–450 Hz, rechazo
de saltos de octava, mediana+EMA, histéresis direccional de 50 cents) cuenta **inversiones**: la
métrica honesta de la celebración ("¡tu voz subió y bajó 3 veces!"). Sin palabras, sin meta en modo
calma, sin game-over.

**Outcome 3 — Palabra↔objeto con pictogramas:** ✅
**42 pictogramas ARASAAC** curados por los 6 temas de interés, **descargados una vez en desarrollo
y commiteados** con su `LICENCIA.md` (CC BY-NC-SA; atribución a Sergio Palao / ARASAAC / Gobierno
de Aragón, visible en Ajustes → Acerca de). **Cero llamadas a ARASAAC en runtime** (e2e de tráfico).
Las palabras son **nuestras, en es-CO**: el dibujo `coche.png` se muestra como **"carro"** (unit lo
verifica). **La garantía del juego, bajo e2e: cualquier vocalización enciende el dibujo — jamás se
exige la palabra** (ADR 005); el acierto lo juzga el padre, y la app no finge saberlo. Los **temas
del onboarding por fin hacen algo**: filtran los dibujos (deuda honesta declarada en el S1, pagada).

**Selector de juegos (COGA):** 3 tarjetas grandes, iconografía propia, mismo orden siempre; cada
una dice qué mide — incluida la frase incómoda: _"mide que hubo voz, nunca qué palabra dijo"_.

## Definition of Done — los 6+1

| Gate                    | Estado                 | Evidencia                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Testing**          | ✅                     | **104 unit** (motores con señales sintéticas: 12 del `pitch-tracker` con sweeps/tonos/ruido/octavas; etapas; migración v1→v2 con la forma exacta del S1) + **69 e2e** (cohete con un **micrófono falso que CANTA**, palabra↔objeto, etapas, selector, cero-red ×3 juegos, axe). Cobertura de motores **93 % stmts / 88 % branches**. Todo en CI. |
| **2. CI/CD**            | ✅                     | Actions verde (quality · e2e · lighthouse). Preview Vercel por rama. **Falta el gate manual del usuario** (escritorio).                                                                                                                                                                                                                          |
| **3. Observabilidad**   | ✅ (sin cambios)       | Sentry inerte metadata-only; defer vigente.                                                                                                                                                                                                                                                                                                      |
| **4. Seguridad**        | ✅                     | `pnpm audit` sin high/critical · cero secrets (gitleaks en cada commit) · **candados de privacidad extendidos al PITCH y verificados con una fuga inyectada**: ambos (ESLint scoped + test de escaneo) la bloquearon · cero llamadas a ARASAAC en runtime · el audio y el tono del niño no tocan storage/red/logs (e2e).                         |
| **5. Performance**      | ✅ **sin deuda nueva** | **Budgets intactos** (350 KB / 3800 ms): el gate destapó **defectos reales** y se corrigieron en vez de renegociar (ver abajo). JS **408 → 281 KB**; LCP máx **4.5 → 3.7 s**. Lighthouse en las 5 rutas: **Perf 90–95 · A11y 100 · Best Practices 100 · SEO 100**.                                                                               |
| **6. UX/A11y**          | ✅                     | axe limpio en **6 rutas × 2 temas × 2 dispositivos** y **dentro de los 3 juegos** · touch del niño ≥64 px (e2e) · teclado en el selector (e2e) · sin límite de tiempo, sin game-over · `prefers-reduced-motion` · microcopy 100 % es-CO.                                                                                                         |
| **7. IA embebida**      | **N/A**                | Cero LLM, cero SDK — **tercera vez consecutiva**. La magia salió del DSP y del contenido.                                                                                                                                                                                                                                                        |
| **Manual de uso**       | ✅                     | Los 3 juegos, las etapas (qué son y cómo elegirlas), qué mide y qué NO mide cada uno, el tono como dato de su voz, créditos ARASAAC.                                                                                                                                                                                                             |
| **Guía de prueba viva** | ✅                     | `docs/GUIA-DE-PRUEBA.html` reescrita: **agrega** (tono en el spike, etapas, selector, cohete, pictogramas), **elimina** (el listado de las 14 cápsulas: ya son 50 → se revisan **por bloques**) y **acumula** la lista de tablet S1+S2.                                                                                                          |
| **Revisión de diseño**  | ✅ / ⏳                | Checklist `diseno-ui` corrido de verdad: cazó 2 incumplimientos propios (radio y duración fuera de la escala) — corregidos. **Falta la aprobación visual del usuario** sobre la preview.                                                                                                                                                         |

## ADRs de este sprint

| #   | Tema                                                                                                                                                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 006 | **Las etapas del habla como motor** (extiende ADR 005): `etapa` en cada cápsula, etapa activa en ajustes con default **permanente** `palabras-sueltas`, progreso y **asignación del día POR ETAPA**, migración v1→v2 obligatoria.                                                                                                              |
| 007 | **Pitch infantil por YIN** en el worklet: rango 200–450 Hz, gating por energía, rechazo de octavas, histéresis direccional. **Fallback honesto declarado** (si el pitch no fuera estable con voz real, el cohete degrada a energía). Estado: **propuesto** — cierra con la prueba de voz real del usuario y, definitivamente, con la del niño. |
| 008 | **Pictogramas ARASAAC**: lote offline curado, CC BY-NC-SA, atribución en la app y en el lote, **plan de reemplazo** si la app dejara de ser personal/no comercial.                                                                                                                                                                             |

## Deuda técnica explícita

1. **`/spike/audio` sigue en el repo** (decisión heredada del S1 y reforzada aquí): ahora también
   es la herramienta que valida el **tono** con voz real. Se elimina cuando cierren los ADR 003 y
   007 con la tablet.
2. **El fallback `AnalyserSource` no calcula pitch** (emite `pitchHz: null`): correr YIN en el hilo
   principal a 60 fps castigaría la fluidez. Si un dispositivo no soporta AudioWorklet, el cohete
   no se mueve por tono. Documentado en el ADR 007; sin impacto conocido (el worklet corre en todos
   los navegadores objetivo).
3. **Iconos de la PWA siguen siendo placeholder** (heredado del S1): esperan el gate de tablet.

## Fricción del kit (para la retro)

- **K-habla-5 (menor):** la orden cita "estándares v2.1" pero el header de `estandares.md` dice
  `version: 2.0.0`. Sin impacto (la DoD de la orden es autoritativa); conviene alinear el header.
- **Herramienta, no kit:** `npx lhci` resuelve a un **paquete impostor** del registry (imprime
  "Hello, this is AnupamAS01!"). El correcto es `npx @lhci/cli`, que es el que usa el CI del kit.
  Vale la pena mencionarlo en el skill de deploy-check para quien lo corra a mano.
- El budget de script de **350 KB** (renegociado en el S1) **aguantó**: esta vez el problema no era
  el budget, era el bundle. Ver abajo.

## Aprendizajes técnicos

- **El gate de performance encontró un defecto de producto, no de números.** El selector
  descargaba el JS de los **tres** juegos al abrirse (prefetch de `next/link`), y **dos juegos que
  no muestran ninguna cápsula arrastraban la biblioteca entera** (50 cápsulas ≈ 65 KB) solo por
  importar el módulo de estado. Separar la cápsula del día (`estado-capsulas.ts`) y quitar el
  prefetch bajó el JS de **408 a 281 KB** sin tocar un solo budget. **Lección para el pipeline:
  antes de renegociar un budget, mirar QUÉ pesa** — en el S1 el budget estaba mal calibrado; en el
  S2 el bundle estaba mal armado. No es lo mismo.
- **El contrato del meter creció en vez de duplicarse.** `{rms, pitchHz|null, tMs}` sirve a los tres
  juegos; `session-flow` se generalizó a una **métrica de unión discriminada**
  (`sostenido | inversiones | activaciones`), así que la celebración honesta es una sola y cada
  juego afirma exactamente lo que midió. Añadir un cuarto juego no toca el flujo.
- **Un e2e cazó un defecto que un unit no vio.** El test "cambiar de etapa no borra nada" falló:
  la asignación del día era **global**, así que si el padre completaba la cápsula, cambiaba de etapa
  y volvía, la app le daba **otra** cápsula y su trabajo del día desaparecía. La asignación pasó a
  vivir **por etapa** (y ahora hay unit que lo blinda). El unit original pasaba porque no marcaba
  la cápsula como completada: **el escenario real tenía un paso más que el escenario de prueba.**
- **La privacidad se extiende con el DSP, no se asume.** El pitch es dato derivado de la voz del
  niño: cae dentro de las carpetas selladas, pero eso se **verificó inyectando una fuga real**
  (localStorage + fetch con el pitch) — ambos candados gritaron. "Debería estar cubierto" no es
  evidencia.
- **La honestidad, otra vez, como mecánica testeable:** el e2e de palabra↔objeto usa un WAV que
  **no dice ninguna palabra** y exige que el dibujo se encienda igual. Si alguien metiera un
  reconocimiento de palabras como condición para avanzar, ese test se cae.

## Lo que falta para cerrar (acciones del usuario)

> **Contexto sin cambios:** la tablet sigue de viaje. El gate es de **escritorio**, con
> `docs/GUIA-DE-PRUEBA.html`. La lista diferida ahora **acumula S1 + S2**.

1. **Correr la guía de prueba en el computador** (bloques A–G). El dato más importante del sprint:
   **la cobertura de tono y el rango de F0 con su voz real** en `/spike/audio` — es lo que cierra
   (o activa el fallback de) el ADR 007.
2. **Veredicto de la biblioteca por bloques** (bloque G): qué sirve, qué cambiaría, qué rutina de
   su casa falta.
3. **Gate visual de escritorio** sobre la preview.
4. Mergear el PR y correr `/cierre-sprint habla` en la planeadora.
5. **Al regreso de la tablet:** la lista diferida acumulada (spike en dispositivo, 60 fps de los
   tres juegos, PWA + offline, **el tono con la voz DEL NIÑO**, sesión real con él, gate visual)
   → cierra los ADR 003 y 007 definitivamente.

## Aprovisionamiento

| Servicio                    | Estado                                       |
| --------------------------- | -------------------------------------------- |
| GitHub + Vercel             | ✅ operando (preview por rama)               |
| Sentry                      | ⏳ defer aceptado (kit inerte sin DSN)       |
| ARASAAC                     | ✅ sin cuenta: lote offline con atribución   |
| API LLM                     | N/A — cero IA en este sprint (3ª vez)        |
| _(hardware)_ Tablet Android | ⏳ de viaje — lista diferida acumulada S1+S2 |
