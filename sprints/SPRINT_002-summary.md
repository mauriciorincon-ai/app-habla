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
tres juegos leen el mismo frame. El motor puro `pitch-tracker` (**vuelo anclado a la voz que
juega** — 0,7 octavas desde su propio tono, tras el hallazgo del gate; rechazo de saltos de
octava, mediana+EMA, histéresis direccional de 50 cents) cuenta **inversiones**: la
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
| **1. Testing**          | ✅                     | **110 unit** (motores con señales sintéticas: 12 del `pitch-tracker` con sweeps/tonos/ruido/octavas; etapas; migración v1→v2 con la forma exacta del S1) + **77 e2e** (cohete con un **micrófono falso que CANTA**, palabra↔objeto, etapas, selector, cero-red ×3 juegos, axe). Cobertura de motores **93,6 % stmts / 88,8 % branches**. Todo en CI. **6 tests nacieron del gate del usuario** — uno por cada defecto que encontró. |
| **2. CI/CD**            | ✅                     | Actions verde (quality · e2e · lighthouse). Preview Vercel por rama. **Gate de escritorio del usuario: CORRIDO** (ver abajo) — falta solo su visto bueno visual final.                                                                                                                                                                          |
| **3. Observabilidad**   | ✅ (sin cambios)       | Sentry inerte metadata-only; defer vigente.                                                                                                                                                                                                                                                                                                      |
| **4. Seguridad**        | ✅                     | `pnpm audit` sin high/critical · cero secrets (gitleaks en cada commit) · **candados de privacidad extendidos al PITCH y verificados con una fuga inyectada**: ambos (ESLint scoped + test de escaneo) la bloquearon · cero llamadas a ARASAAC en runtime · el audio y el tono del niño no tocan storage/red/logs (e2e).                         |
| **5. Performance**      | ✅ **sin deuda nueva** | **Budgets intactos** (350 KB / 3800 ms): el gate destapó **defectos reales** y se corrigieron en vez de renegociar (ver abajo). JS **408 → 281 KB**; LCP máx **4.5 → 3.7 s**. Lighthouse en las 6 rutas: **Perf 90–95 · A11y 100 · Best Practices 100 · SEO 100**. **Re-verificado tras el gate** (con el tema, los globos y la entrada a Ajustes dentro): LCP mediana **3,5 s** en "/" — dentro del budget, pero con **margen estrecho** (una pasada suelta llegó a 3,83 s: sesgo Lantern conocido, K-habla-3). Vigilar en el S3. |                                                                               |
| **6. UX/A11y**          | ✅                     | axe limpio en **6 rutas × 2 temas × 2 dispositivos** y **dentro de los 3 juegos** · touch del niño ≥64 px (e2e) · teclado en el selector (e2e) · sin límite de tiempo, sin game-over · `prefers-reduced-motion` · microcopy 100 % es-CO.                                                                                                         |
| **7. IA embebida**      | **N/A**                | Cero LLM, cero SDK — **tercera vez consecutiva**. La magia salió del DSP y del contenido.                                                                                                                                                                                                                                                        |
| **Manual de uso**       | ✅                     | Los 3 juegos, las etapas (qué son y cómo elegirlas), qué mide y qué NO mide cada uno, el tono como dato de su voz, créditos ARASAAC.                                                                                                                                                                                                             |
| **Guía de prueba viva** | ✅                     | `docs/GUIA-DE-PRUEBA.html` reescrita: **agrega** (tono en el spike, etapas, selector, cohete, pictogramas), **elimina** (el listado de las 14 cápsulas: ya son 50 → se revisan **por bloques**) y **acumula** la lista de tablet S1+S2.                                                                                                          |
| **Revisión de diseño**  | ✅                     | Checklist `diseno-ui` corrido de verdad: cazó 2 incumplimientos propios (radio y duración fuera de la escala) — y **en el gate se descubrió que uno seguía vivo** en el escenario de pictogramas pese a estar declarado corregido en la bitácora (corregido de verdad ahora: **declarar un arreglo no es hacerlo**). Usuario aprobó explícitamente el cohete, el modo calma, las etapas y los globos de la celebración. |

## ADRs de este sprint

| #   | Tema                                                                                                                                                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 006 | **Las etapas del habla como motor** (extiende ADR 005): `etapa` en cada cápsula, etapa activa en ajustes con default **permanente** `palabras-sueltas`, progreso y **asignación del día POR ETAPA**, migración v1→v2 obligatoria.                                                                                                              |
| 007 | **Pitch infantil por YIN** en el worklet: gating por energía, rechazo de octavas, histéresis direccional. **ENMENDADO en el gate:** el rango fijo "infantil" (200–450 Hz) era un defecto — el **vuelo se ancla a la voz de quien juega** (0,7 octavas desde su propio tono). Cobertura de tono con voz real del usuario: **>70 % ⇒ el cohete se queda con el tono, el fallback por energía NO se activa.** Cierra definitivamente con la voz del niño. |
| 009 | **El padre juzga la palabra; la app jamás** (nuevo, nacido del gate): por qué el reconocimiento automático está cerrado (privacidad + falsos negativos justo con este niño + honestidad) y por qué el botón es suyo. Registra además la **posición del usuario** (él no ve mal mandar la voz a Google) como **decisión abierta** para un sprint futuro. |
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

## EL GATE DEL USUARIO (2026-07-12) — lo más valioso del sprint

Corrió el gate mínimo completo en su computador y **encontró cuatro defectos reales que la CI no
vio**. Los cuatro están arreglados, y cada uno dejó un test que lo caza si vuelve.

| # | Lo que encontró | Por qué se nos pasó |
| - | --------------- | ------------------- |
| 1 | **El cohete no oía su voz.** Su falsete llega a 160–170 Hz; el tracker clamaba a 200–450 Hz fijos ("F0 infantil de manual"). Pero el guion del juego le pide **al padre** demostrar primero: **co-uso roto** (regla dura 5). Y peor: afirmábamos el F0 del niño **sin haberlo medido nunca**. → El vuelo se ancla ahora a **la voz que juega**. | Los tests usaban un WAV sintético dentro del rango asumido. **El supuesto estaba en el test tanto como en el código.** |
| 2 | **Ajustes era inencontrable** — un texto gris al PIE de "Hoy", bajo la tarjeta de juegos. **No lo encontró en dos sprints seguidos**, y ahí adentro vive la etapa del habla (un outcome entero). → Entrada visible en el encabezado. | **Todos los e2e entraban por URL** (`goto("/ajustes")`). Un test que navega por URL prueba la página, **no la manera de llegar a ella**. |
| 3 | **La celebración del globo MENTÍA** (regla dura 3). `sostenidoMs` suma todos los ratos de voz y no se reinicia con el silencio, pero el titular decía _"¡La **sostuviste** 7,3 segundos!"_. Un niño que dice "aaah" 1 s, se distrae 10 s y dice "aaah" 2 s recibía "la sostuviste 3 segundos". → Dos números: **total** (mueve al globo) y **mejor racha continua** (lo único que autoriza a decir "sostuvo"). | El unit medía el número, **no lo que la frase afirmaba sobre él**. Nadie había leído el titular contra la definición de la métrica. |
| 4 | **No había modo claro** (la app seguía solo a `prefers-color-scheme`). → Ajuste `apariencia` (sistema/claro/oscuro) sin parpadeo; la pantalla del niño sigue clara SIEMPRE. | No era un defecto sino una carencia: nadie con el sistema en oscuro había usado la app. |

**Y pidió una feature que se convirtió en el ADR 009:** una celebración distinta cuando el niño
dice la palabra correcta. La app **no puede** saberlo (mandar el audio a Google viola la regla dura
2; un reconocedor local le diría "no" a un niño que **sí** dijo la palabra). Solución fiel a la
tesis del producto: **el juez es el padre** — botón de adulto, y al tocarlo sube una bandada de
globos. Dos números con dos dueños que nunca se mezclan: los dibujos que **la app midió** y las
palabras que **él oyó**.

**Lección para el pipeline:** los cuatro defectos son de la misma familia — **la CI verificaba el
comportamiento, no la experiencia**. El test entraba por la URL en vez de por la pantalla, medía el
número en vez de leer la frase, y cantaba dentro del rango que el código ya suponía. Un gate humano
no es un trámite al final: es el único que ve la app como la ve el usuario.

## Lo que falta para cerrar (acciones del usuario)

> **Contexto sin cambios:** la tablet sigue de viaje. El gate es de **escritorio**, con
> `docs/GUIA-DE-PRUEBA.html`. La lista diferida ahora **acumula S1 + S2**.

1. ~~Correr la guía de prueba~~ **HECHO (2026-07-12).** Gate mínimo completo. Cobertura de tono
   **>70 %** con su voz real ⇒ **el ADR 007 se queda con el tono** (el fallback por energía no se
   activa). Los tres juegos, las etapas y la privacidad, verificados por él.
2. **Veredicto de la biblioteca por bloques** (bloque I): qué sirve, qué cambiaría, qué rutina de
   su casa falta. **No bloquea el merge** — si después quiere cambiar cápsulas, se cambian.
3. **Gate visual de escritorio** sobre la preview (aprobó explícitamente los globos y el cohete).
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
