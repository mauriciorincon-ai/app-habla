# Sprint 002 — "Cada día más" · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_002-orden.md` (planeadora, RO) · Plan aprobado por el
> usuario 2026-07-12 (plan mode). Branch `sprint-002/cada-dia-mas` desde `main` (post-merge PR #1).
> Gate: escritorio (la tablet sigue de viaje — lista diferida ACUMULADA S1+S2 en la guía).

## Estado por fase

- [x] F0 — Setup (branch, kit-check, bitácora, ADRs propuestos)
- [x] F1a — Motor de etapas (schema + storage v2 + migración + filtro) con units
- [x] F1b — Spike pitch (YIN worklet + pitch-tracker + WAV barrido + /spike/audio) → PR draft
- [x] F1c — Biblioteca **50 cápsulas** por etapa (8 sonidos · 35 palabras sueltas · 7 frases)
- [x] F1d — Lote ARASAAC (42 pictos) + manifest con units
- [x] F2 — UI (selector, cohete, palabra↔objeto, etapa en Ajustes/Hoy, atribución)
- [x] F3 — Integración + e2e (**104 unit + 69 e2e**)
- [x] F4 — Calidad y cierre (diseño, performance, manual, guía viva, summary)
- [ ] **Gate del usuario** (escritorio) → merge → `/cierre-sprint habla`

## Desviación del plan (cierre)

- **La biblioteca quedó en 50 cápsulas, no 45** (8/35/7 vs. los mínimos 8/30/7). No fue por
  rellenar: al escribir las rutinas reales (carro, mercado, parque, calle, vestirse, dormir)
  salieron 5 cápsulas más que valían la pena. La regla "mejor 45 buenas que 60 de relleno" se
  respetó — cada una tiene su técnica citada y su guion accionable.
- **`session-flow` SÍ se tocó** (el plan decía "el globo no se toca"): las fases se generalizaron a
  una **métrica de unión discriminada** para que los tres juegos compartan un solo flujo y una sola
  celebración honesta. El comportamiento del globo no cambió (sus e2e siguen verdes sin tocarlos);
  lo que cambió es el tipo que viaja por el reducer. Se declara aquí porque es un refactor
  compartido, no un rediseño del juego aprobado.

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

## Gate de diseño (checklist del skill `diseno-ui`, corrido de verdad sobre el código y la preview)

- ✅ Cero emojis como iconografía · cero valores mágicos de color · cero inglés residual · los 5
  estados existen en los tres juegos · responsive real (móvil + desktop) · `prefers-reduced-motion`
  cubre las transiciones nuevas.
- ❌→✅ **Dos incumplimientos propios cazados por el checklist** (como en el S1: correrlo en serio
  paga): `rounded-[2rem]` y `duration-300` en el escenario de pictogramas — ambos **fuera de la
  escala del design-system** (radios 8/12/16/24; duraciones 120/220/380). Corregidos a
  `rounded-3xl` + `duration-[--dur-lenta] ease-suave`. El `design-system.md` se amplió con los
  patrones del sprint (personajes vs iconos vs pictogramas-contenido; el vuelo interpolado; la
  regla de "el selector es la pantalla más predecible de la app").

## Gate de performance — defectos REALES corregidos, budgets intactos

El gate de Lighthouse falló primero: **script 408 KB** (budget 350) y **LCP hasta 4.5 s**. A
diferencia del S1, esta vez **no se renegoció ningún budget**: los dos eran defectos de verdad.

1. **El selector descargaba los TRES juegos de golpe** (prefetch por defecto de `next/link`): el
   niño abre uno, no tres. → `prefetch={false}` en las tarjetas.
2. **El cohete y palabra↔objeto arrastraban la biblioteca ENTERA de cápsulas** (50 cápsulas ≈
   65 KB de JS) solo por importar `estado-local` (que importaba `@content/capsulas` para la cápsula
   del día). Ninguno de los dos muestra cápsulas. → La cápsula del día se extrajo a
   `src/components/estado-capsulas.ts`; `estado-local` se queda con los stores. Ahora la biblioteca
   la cargan únicamente "Hoy" y el globo (que marca el día como hecho).

**Resultado:** JS de 408 KB → **281 KB** (−127 KB) y LCP máximo 4.5 s → 3.7 s. Los 5 URLs pasan el
budget sin tocarlo: **Perf 90–95 · A11y 100 · Best Practices 100 · SEO 100.**

_(Fricción menor de herramienta, no del kit: `npx lhci` resuelve a un paquete impostor del registry
que imprime "Hello, this is AnupamAS01!". El correcto es `npx @lhci/cli`. El CI del kit ya usa el
paquete bueno; queda anotado por si alguien lo corre a mano.)_

## Regla nueva del usuario: la guía de prueba es ACUMULATIVA (bola de nieve) — 2026-07-12

Antes del gate, el usuario preguntó si la guía se construye como bola de nieve. **No lo era**: la
primera versión del S2 traía lo nuevo y **resumía** el S1 (el globo entero —calibración, histéresis
de la pausa al respirar, micrófono negado, ruido alto, "ya jugamos" sin culpa— quedó en una línea
que decía "todo como antes"; del spike se cayeron los settings del motor, el piso de ruido y la
estabilidad de 2–3 min). Comprimir la guía **borra la regresión**: si el S2 rompe algo del S1, nadie
lo prueba.

**Regla adoptada (ya en el CLAUDE.md, regla 9→10):** la última guía contiene **todas** las pruebas
vigentes de la app; el sprint N **hereda enteras** las del N-1. Cada línea lleva su **origen
visible**: `Nuevo · SN` · `Mejorado en SN` · `SN` (heredada ⇒ regresión). Una prueba solo se
elimina cuando su feature deja de existir, y se declara en el historial del pie.

- Guía reconstruida: **78 pruebas** — 31 heredadas del S1, 37 nuevas del S2, 10 mejoradas.
- Se agregó **filtro por origen** (Ver todo / Solo lo nuevo / Solo lo mejorado / Solo regresión) y
  botón "Empezar de cero"; el contador y la barra se ajustan al filtro. Las etiquetas de origen
  **no comunican solo con color** (llevan el texto del sprint).
- Prefijo de localStorage nuevo (`guia-habla-v2:`): las casillas del S1 no se heredan marcadas —
  una regresión sin probar no puede aparecer como hecha.
- **Ampliación 1 (mismo día): las tres preguntas.** Toda prueba responde qué/cómo/**QUÉ ESPERAR**
  — el resultado correcto explícito con el microcopy LITERAL de la app, y la señal de defecto
  ("Mal") cuando hay una forma clara de fallar. Las 78 pruebas lo cumplen (36 con "Mal").
- **Ampliación 2 (mismo día): el ⭐ gate mínimo.** El usuario no siempre puede correr 78 pruebas.
  La guía marca 14 (~25 min) elegidas por un criterio, no por gusto: **lo que ninguna máquina
  puede verificar** — su voz real en su micrófono, su juicio de padre sobre el contenido, la
  aprobación visual. El resto está respaldado por los 104 unit + 69 e2e verdes.
- **Al marcar el gate mínimo se cazó una expectativa ERRADA de la propia guía:** decía que la voz
  de hombre adulto (90–160 Hz) daría un F0 en el spike — falso: el oído del tono es infantil a
  propósito (worklet 150–500 Hz, cohete 200–450), así que la voz grave de un adulto muestra "—"
  y eso es lo correcto. Sin la corrección, el usuario habría medido la cobertura con su voz de
  pecho y el dato que decide el ADR 007 habría salido contaminado (falso negativo → fallback RMS
  sin necesidad). La guía ahora ordena medir la cobertura CON VOZ AGUDA, dentro del oído infantil.
- **Nota a la planeadora:** estas reglas son de método y aplican a TODO el pipeline (la guía viva
  es entregable estándar de todas las apps). El usuario lleva la instrucción; aquí solo se registra.

## Hallazgo del gate del usuario: el "rango infantil" fijo era un DEFECTO (2026-07-12)

Corriendo el bloque A en su computador, el usuario reportó que su falsete llega a **160–170 Hz**
(cobertura >70 %, todo lo demás en orden). El `pitch-tracker` clamaba a **200–450 Hz fijos** ("F0
de 4–6 años ≈ 250–400, §B.1"). Dos defectos, y el segundo es el grave:

1. **Co-uso roto (regla dura 5):** el guion del cohete le pide al PADRE que demuestre primero
   ("hazlo tú primero, exagerado y riéndote") — y con piso de 200 Hz su demostración **no movía
   nada**. La app le pedía algo que ella misma ignoraba.
2. **Afirmábamos un número que nunca medimos:** el F0 real del niño no lo conocemos (la tablet
   está de viaje). Hard-codear el rango de un paper, para un niño neurodivergente concreto, es
   justo el tipo de afirmación sin verificar que esta app prohíbe en todo lo demás.

**Arreglo (no ensanchar el supuesto, sino eliminarlo):** el vuelo es **relativo a la voz que está
jugando**. La base se ancla al primer tono confiable del intento y baja si esa voz baja; la altura
es `log2(f/base)/0.7` octavas. Padre (base ~165 Hz) e hijo (base ~280 Hz) vuelan igual. Las
**inversiones** —la métrica que celebramos— ya eran relativas (histéresis de 50 cents): no
cambiaron. `SPAN_OCTAVAS = 0.7` no es gusto sino techo duro: el oído llega a 500 Hz, así que un
niño que empieza en 300 solo puede subir 0,74 octavas — un vuelo más largo le pondría al cohete
**un techo al que su voz no puede llegar**, y una meta inalcanzable es una mentira.

- **2 unit nuevos que blindan el hallazgo** (106 unit verdes): el falsete del padre vuela tan alto
  como la voz del niño; bajar por debajo del tono inicial re-ancla en vez de quedarse pegado al
  piso. Los 3 e2e del cohete/spike siguen verdes sin tocarlos.
- ADR 007 enmendado (sección _Amendment_). El spike ahora muestra "oído: 150–500 Hz · el cohete se
  ancla a la voz que juega".
- **Fricción de la guía, no del producto:** el filtro ⭐ escondía la prueba C1 (la que dice DÓNDE
  está el selector de etapa: Ajustes, primera sección) y dejaba C2 pidiendo "cambia a Sonidos e
  intentos" sin decir dónde. El usuario se perdió ahí. Corregido: **cada prueba del gate mínimo es
  autosuficiente** — no depende de una prueba que el filtro pueda ocultar.

## Segundo hallazgo del gate: Ajustes era INENCONTRABLE (2026-07-12)

El usuario no halló el selector de etapa. No era la guía: **era la app**. La única puerta a
`/ajustes` era un texto gris al **pie** de "Hoy", debajo de la tarjeta de juegos — fuera de
pantalla sin scroll. **No lo encontró en dos sprints seguidos** (ya le había pasado en el S1, y
entonces lo despaché como un deploy viejo). Dos veces no es casualidad: es un defecto de diseño.
Y ahí adentro vive ahora la **etapa del habla**, un outcome entero del S2.

- **Arreglo:** entrada visible en el encabezado de "Hoy" (icono + "Ajustes", ≥44 px, contra el
  borde), sin quitar el enlace del pie. La sección de etapa ya era la primera de Ajustes.
- **Por qué ningún test lo cazó (la lección):** los **e2e entraban por URL** (`goto("/ajustes")`),
  saltándose justo el camino que le falló al humano. Un test que navega por URL prueba la página,
  **no la manera de llegar a ella**. Test nuevo: desde "Hoy", `toBeInViewport()` + clic real hasta
  el encabezado de la etapa — sin saberse la URL y sin bajar la página.
- Regla que queda: **toda feature nueva necesita un e2e que llegue a ella como llega un humano**,
  no por su ruta. Si no se puede, es que no es alcanzable.

## Tercer hallazgo del gate: la celebración del globo MENTÍA (2026-07-12) — regla dura 3

El usuario jugó en modo calma, sostuvo la voz, cambió a modo normal y la celebración le contó
**7,3 segundos sumando los dos modos**. Preguntó si eso era adecuado. Al revisar el motor apareció
algo peor que el cruce de modos: **`sostenidoMs` es el TOTAL de voz del intento y nunca se
reinicia con el silencio** — pero la celebración decía _"¡La **sostuviste** 7,3 segundos!"_.

Un niño que dice "aaah" 1 s, se distrae 10 s y vuelve a decir "aaah" 2 s recibía un
**"la sostuviste 3 segundos"**. Nunca sostuvo 3 segundos. Es exactamente el elogio desacoplado del
desempeño que el brief le reprocha a la competencia, y estaba dentro de nuestra propia app.

**Arreglo — dos números, porque son dos cosas distintas:**

- `sostenidoMs` (total de voz del intento): **mueve al globo**. No se reinicia con el silencio —
  eso sería castigo, y el globo nunca castiga (regla del S1: se detiene y espera, no cae).
- `mejorRachaMs` (**racha continua más larga**): es lo ÚNICO que autoriza a afirmar continuidad.
  La pausa de respirar (gracia de 300 ms) NO la parte — respirar no es dejar de sostener.

**Microcopy:** el titular pasa de _"¡La sostuviste X segundos!"_ a _"**¡Su voz sonó X segundos!**"_
(total, verdadero) y debajo, solo si la racha llega a 1 s: _"Y la vez más larga la sostuvo N
segundos seguidos, sin cortarse."_ Ahora cada número dice lo que de verdad se midió.

- **3 unit nuevos** (109 verdes): tres soplidos sueltos suman en el total pero la racha es la del
  más largo · la pausa de respirar no parte la racha · la racha en curso ya cuenta (no hay que
  callarse para que la app la reconozca).
- **El modo calma no era el defecto** (funciona como se diseñó: sin meta, sin presión, se cierra
  con "Ya jugamos"): fue el síntoma que destapó la mentira del contador.

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
