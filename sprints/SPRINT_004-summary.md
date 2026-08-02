---
sprint: 004
app: habla
feature: el-rumbo-cierre-de-ciclo
estado: listo para cierre — auditoría final en 2 fases EJECUTADA (0 críticos; 2 altos + 6 medios corregidos) · CI verde local (214 unit · 133 e2e · build · typecheck · lint) · deploy-check MERGE OK · CIERRE DE CICLO H1 (BLUEPRINT + design-sync + gate ⭐ ACUMULADO). Falta: gate ⭐ ACUMULADO del usuario (desktop+teléfono) → merge → /cierre-sprint.
fecha: 2026-07-19
ciclo: H1 (sprint 4 de 4 — ÚLTIMO: este cierra el ciclo H1 de Hablemos San)
---

# Sprint 004 — "El rumbo" + CIERRE DE CICLO H1 · Summary

> Cuarto y ÚLTIMO corte del ciclo H1 de **Hablemos San**. Lo que la planeadora necesita para la
> retro. Este sprint **cierra el ciclo**: además de las dos features del padre y el endurecimiento,
> entrega `docs/BLUEPRINT.html`, publica el design system (`/design-sync`) y ejecuta —vía el gate
> del usuario— el **gate ⭐ ACUMULADO S1+S2+S3+S4**, única vía de cierre. Quinto sprint con cero IA.

## Qué se entregó (contra los 3 outcomes)

**Outcome 1 — El rumbo (progreso honesto del padre):** ✅
Una pantalla nueva `/rumbo` (cuarto del padre, acceso en el encabezado de "Hoy") que muestra
**SOLO lo medido o lo marcado**: tendencias **por semana** (días con práctica, palabras distintas
practicadas, dibujos encendidos, inversiones, la racha de voz más larga, lo que el padre marcó
haber oído) + **hitos funcionales** ("su primer rato juntos", "la primera palabra que TÚ le oíste",
"su voz sonó 5 segundos seguidos"). **Cero puntajes clínicos, cero %, cero plazos, cero culpa** — una semana
floja es un número pequeño sin adjetivo; no hay rachas que castiguen. El microcopy se blindó contra
TODO vocabulario clínico, ni siquiera negado (el design system dice "jamás diagnóstico/puntaje"),
verificado por e2e (grep) y revisión. Vacío honesto: "todavía no hay nada que contar".
**El riesgo R1 que cazó el plan:** los juegos de voz **no persistían ninguna métrica** — morían en
la celebración. Se creó el registro versionado `habla:v1:sesiones` (cap 500), escrito UNA vez por
intento en `CelebracionHonesta` (el único punto de escritura, compartido por los 4 juegos). Guarda
**solo los números que la celebración ya muestra** (VISION § 5 lo sanciona: "registro de intentos y
logros") — **jamás audio ni pitch crudo**; el sello de la regla dura 2 sigue intacto.

**Outcome 2 — Objetivo de la semana (sintonía con la fonoaudióloga):** ✅
Una pantalla `/objetivo` donde el padre escribe en **texto libre** qué trabajar; la app lo alinea de
forma **DETERMINISTA** (sin IA) sobre tres bancos de contenido: la **cápsula de hoy** (por
etiquetas), el **mazo de palabra↔objeto** y las **rondas de gemelas** (por palabra/tema), y el
**lote del estudio** (que además **paga la deuda lote-por-etapa**). Preview honesto en vivo que
cuenta **contra lo que el niño DE VERDAD verá** —su etapa y sus temas, espejando el mazo real
(ajuste de la auditoría de cierre)—: "con «animales», la app pone primero N cápsulas · M dibujos".
**Dos casos honestos:** "colores" no existe en el contenido → lo dice de frente, no finge; y
"existe pero fuera de su alcance" (un tema no elegido) → lo dice claro, sin prometer dibujos que
el mazo no trae (la línea del estudio solo aparece cuando es verdad). Sin expiración automática
(predictibilidad COGA: solo el padre lo cambia/quita). Alinea **dentro de la etapa** (ADR-005),
jamás la salta.
**Sin objetivo, el orden del contenido es IDÉNTICO al de antes** (partición estable) — así los e2e
por semilla del S3 no se movieron. La re-alineación de "Hoy" respeta el trabajo ya hecho: solo
re-evalúa la cápsula del día si **no** está completada (R4, invariante congelada del S2 intacta).

**Outcome 3 — CIERRE DE CICLO H1:** ✅ (producido) / ⏳ (gate del usuario)
Endurecimiento (las 5 deudas del remate S3 pagadas con evidencia) + iconos PWA reales + ADR-011 +
`docs/BLUEPRINT.html` + design system publicado (`/design-sync`) + **guía v4 con el gate ⭐
ACUMULADO** como recorrido ordenado. Detalle en las secciones de abajo.

## Definition of Done — los 6+1

| Gate                    | Estado           | Evidencia                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Testing**          | ✅               | **214 unit** (motores nuevos: rumbo tendencias/hitos, objetivo alinear/prioridad/**alcance**, sesión, daily con objetivo + realinear, lote por etapa/objetivo, fecha con cruces de mes/año; + tests de componente del estudio con Testing Library; + cap-500 de gemelas) — cobertura **90,6 % stmts / 86,6 % branches**. **133 e2e** (rumbo frase-vs-métrica ATADA por testid, reset-al-salir de palabra↔objeto, objetivo animales/colores/fuera-de-alcance/borrar, privacidad post-escritura, + suites enteras de las pantallas tocadas, regla 9). Todo en CI.               |
| **2. CI/CD**            | ✅               | typecheck · lint · unit+cobertura · build · e2e verdes localmente. Actions (quality · e2e · lighthouse) esperado verde en el PR. Preview Vercel por rama.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **3. Observabilidad**   | ✅ (sin cambios) | Sentry inerte metadata-only. Las sesiones del Rumbo **nunca** llevan audio ni pitch — solo conteos (candado de contenido del e2e de privacidad lo verifica).                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **4. Seguridad**        | ✅               | `pnpm audit --audit-level high` **limpio** (1 moderate transitivo conocido: `postcss` vía build, no explotable). Cero secrets (gitleaks en cada commit — **verificado en vivo**: un borrador de bitácora escribió la carnada contigua y el hook lo bloqueó). Lista blanca de claves de storage ampliada conscientemente (`sesiones`, `objetivo`) con el candado de contenido intacto.                                                                                                                                                                                         |
| **5. Performance**      | ✅ (tras ajuste) | `/rumbo` y `/objetivo` son **estáticas** (prerender): **"/" no se toca**. **El gate de Lighthouse del PR cazó a `/objetivo` sobre el budget** (383 KB > 350 KB: el preview y `aplicarObjetivoAHoy` arrastraban los 3 bancos de contenido al bundle — la trampa que el S2 ya había cazado en los juegos). Corregido en la auditoría de cierre: contenido por `import()` dinámico al primer teclazo → **331 KB gzip** medido en prod local (~27 KB bajo el budget, al nivel de `/rumbo`). Budgets en **10 rutas**; `reproducirBlob` con revoke; cero dependencia runtime nueva. |
| **6. UX/A11y**          | ✅               | axe limpio en **10 rutas × 2 temas × 2 dispositivos** (+`/rumbo` +`/objetivo`) · toques del padre ≥44 px · sin límite de tiempo, sin game-over · microcopy 100 % es-CO, sin jerga clínica · el objetivo alinea dentro de la etapa (COGA: predecible, no salta).                                                                                                                                                                                                                                                                                                               |
| **7. IA embebida**      | **N/A**          | Cero LLM, cero SDK — **quinta vez consecutiva**. La alineación objetivo→contenido es **mapeo determinista**, no un modelo.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Manual de uso**       | ✅               | Secciones nuevas "El rumbo — cómo van, sin notas" y "Objetivo de la semana — la sintonía con la fonoaudióloga"; historial 004.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Guía de prueba viva** | ✅               | `docs/GUIA-DE-PRUEBA.html` **v4 acumulativa**: hereda las v3 ENTERAS (S3 pasa a regresión), agrega bloques N (rumbo) y O (objetivo) + 2 ítems de tablet, **recorrido del gate ⭐ ACUMULADO con tiempos**. Gate ⭐ = **25** (~40 min). Elimina: nada.                                                                                                                                                                                                                                                                                                                          |
| **Revisión de diseño**  | ⏳               | Checklist `diseno-ui` auto-corrido sobre `/rumbo` y `/objetivo` (paleta operador, 5 estados del objetivo, sin jerga). **Aprobación visual del usuario = parte del gate ⭐ ACUMULADO** (abajo).                                                                                                                                                                                                                                                                                                                                                                                |
| **BLUEPRINT (ciclo)**   | ✅               | `docs/BLUEPRINT.html` — as-built autocontenido con SVG embebido. Topología local-first honesta: sin BD, costo **US$0**, punto único de falla = **el dispositivo**.                                                                                                                                                                                                                                                                                                                                                                                                            |
| **design-sync (ciclo)** | ✅               | Publicado en Claude Design → **"Hablemos San — Design System"** (`915209fb…`). El repo es una app, no una librería de componentes → se autoró una **referencia de marca** (decisión del usuario): `styles.css` con los tokens + 8 tarjetas de preview (paleta, tipografía, personajes, Hoy/Rumbo/Objetivo, escenario, celebración honesta) + README de convenciones. Pin en `.design-sync/config.json`.                                                                                                                                                                       |

## ADRs de este sprint

| #   | Tema                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 011 | **[ACCEPTED 2026-07-19] Export/backup del banco de voz: RECHAZAR el `.zip` por ahora.** Un backup que puede no restaurar en otro dispositivo (ADR-010 graba en códec nativo, portabilidad cross-device es no-meta) sería una **promesa falsa**; re-grabar toma <10 min; el export ensancha la superficie de privacidad. Validado por el usuario en el gate del plan; reabrible con condiciones (verificar códec al importar, manual y local jamás en red). |
| 012 | **[ACCEPTED 2026-08-01] El globo no termina solo: la meta se vuelve HITO (vueltas infinitas).** Decidido por el usuario EN el gate ⭐ (bloque E): el cierre automático a los 3 s cortaba el juego mientras le enseñaba al niño. Cada 3 s de voz = una vuelta celebrada en vivo; el intento cierra con "Ya jugamos". El cohete conserva su meta (su bloque del gate dirá).                                                                                  |

## Endurecimiento — las 5 deudas del remate S3 (lista CERRADA, pagadas con evidencia)

1. **Tests de componente del estudio** (`tests/unit/estudio-cliente.test.tsx`, Testing Library):
   cobertura, escuchar, borrar, banco vacío, IndexedDB roto. De paso destapó un hueco del setup:
   faltaba `afterEach(cleanup)` de RTL (los renders se acumulaban) — añadido a `tests/setup.ts`.
2. **Dedup `reproducir`** → `lib/audio/reproducir.ts` (`reproducirBlob`) + `useReproductor`.
   (`barajar` y `fechaHoy` ya se dedup-earon en F1: copias locales → `lib/barajar` y `lib/fecha`.)
3. **Revoke al navegar a mitad de clip:** `reproducirBlob` libera la URL al terminar, fallar o
   cancelar; los consumidores cancelan al desmontar. La fuga de ObjectURL queda cerrada.
4. **Unit del cap-500 de gemelas** (`agregarJuiciosGemelas` conserva los últimos 500).
5. **Lote-por-etapa** pagado DENTRO de O2 (`siguienteLote({etapa, objetivo})`).

**Además:** iconos PWA **reales** desde el design system (`gen-iconos.mjs` refinado, zero-dep con
`node:zlib`: `icon-192/512` + `icon-512-maskable` con zona segura; el manifest usa la maskable).
**Desviación del plan declarada en F0:** se descartó Playwright para rasterizar (más pesado y
flakier que el encoder que ya existía).

## Riesgos de integración (kit v1.7.3, sección estrenada) — cómo salieron

R1 🔴 (juegos no persistían nada) → registro `sesiones` versionado, un solo punto de escritura ·
R2 (lista de claves de privacidad) → ampliada conscientemente, candado de contenido intacto ·
R3 (mazos por semilla del S3) → identidad sin objetivo, unit + e2e lo claван · R4 (asignación de
Hoy congelada) → `realinearObjetivo` solo si no está completada, unit doble · R5 (estudio) →
`siguienteLote` crece sin romper · R7 (`barajar` semilla) → sustitución 1:1 · R8 (contenido sin
etiquetas) → vocabulario controlado sin colores + curaduría de las 50 · R9 (iconos) → mismos
nombres, `sw.js` no fija hashes. **Todos verificados en el código y anotados en la bitácora.**

## Auditoría final de cierre (2 fases, 2026-07-19 — pedida por el usuario antes del gate)

**Fase 1 (solo lectura):** alcance ítem a ítem vs. la orden + 3 revisores paralelos (tests ·
privacidad · UI) con cada hallazgo verificado en código. **0 Críticos · 2 Altos · 6 Medios · 11
Bajos.** La privacidad salió **blindada** (cero fugas; flujo Metrica→Sesion, sellos de lib/voice,
XSS/ReDoS, revoke de ObjectURLs y secretos, todos verificados). **Fase 2 (aprobada con alcance
completo):** los 2 Altos —`/objetivo` rompía el budget de script (el gate de Lighthouse del PR lo
cazó: los bancos de contenido iban en el bundle; ahora cargan por `import()` al primer teclazo,
383→331 KB) y el preview contaba contra los bancos completos (ahora cuenta **lo que el niño verá**
con `lib/objetivo/alcance.ts` + tercer estado honesto "fuera de su alcance", prueba O6)— y los 6
Medios (privacidad e2e post-escritura, número↔frase atado por testid, grep anti-clínico ampliado,
singular/plural del rumbo, foco+aria-live al guardar, units de pares/orden-de-hitos/cruce-de-año).
Detalle completo con archivo:línea en la bitácora.

**Remate del gate ⭐ (ajustes en vivo, por bloques — pedidos y validados por el usuario):** A
(guía A2/A5/A6 corregidas — el "piso" es un mínimo de sesión) · B (lote de pulido de "Hoy": 4
juegos en la tarjeta, iconos a la izquierda, estados en pareja, pregunta antes de marcar, contador
adentro; chispa de IA VETADA en el design system → `IconoJuntos`) · C (limpio, 5/5) · D (la salida
"← Hoy" estandarizada en las 4 pantallas del padre) · E (**ADR-012**: el globo sin fin automático
— vueltas infinitas celebradas en vivo; "Salir" vuelve al guion apagando el micrófono; planeo en
pausas; calma centrada; en la re-mirada del usuario, **confeti determinista por vuelta** — colores
fiesta, corre una vez, apagado con movimiento reducido — y la celebración final gana su tercer
número: "Con esa voz el globo dio N vueltas completas", derivado del mismo total medido) ·
transversal pre-F (el titular de cada juego lleva **el icono de su tarjeta del selector** a la
izquierda — orientación por símbolo repetido, sin tocar el titular que enseña la mecánica; regla
en el design system) · F (**ADR-013**: el cohete tampoco termina solo — cada subida-y-bajada es
un hito con confeti, **capa de cielo que pasa en la siguiente SUBIDA de la voz** (el ascenso lo
cuenta el mundo, no la posición: el cohete ES el tono en vivo; en la re-mirada el usuario cazó
que pasarla en el pico hacía parecer subida la bajada) y contador que coincide con la celebración
final; planeo del globo
llevado al cohete (F8) y matiz honesto de F5: una voz cantada aguda sí lo mueve — es una voz con
tono en el cuarto) · G (dos defectos reales: **"Salir" ahora reinicia el juego por completo**
—regla general de los 4 juegos, prueba G9 nueva— y los **globos fantasma** del primer ingreso
ganan defensa doble —guarda del primer segundo + botón del juez reubicado—; el botón del juez
baja al final, discreto; el encendido gana pop + halo de una corrida; el tema "Carros" pasa a
llamarse **"Transporte"**; el filtro por tono niño/adulto NO se construyó — va al backlog H2 con
diseño, decisión del usuario tras evaluación honesta) · H (8/8 limpio; cambio de lenguaje pedido
por el usuario: **"fonoaudiología" → "terapias integrales del lenguaje"** en toda la app, manual
y CLAUDE.md — al niño lo atiende un equipo completo; **la VISION de la planeadora aún dice
"fonoaudiología" y debe alinearse en la retro**; regla dura 4 intacta: complementaria, jamás
sustituta) · pre-I (nace **`docs/CATALOGO-CAPSULAS.html`** — las 50 cápsulas completas generadas
del contenido real por `scripts/gen-catalogo-capsulas.mjs`, para que el veredicto de contenido no
tenga que esperar 50 días; el histórico navegable EN la app sigue en el backlog) · I (**aprobado:
las 50 leídas en el catálogo** — "muy buenas; algunas parecen repetidas pero con matices que las
diferencian, válido"; cero reemplazos pedidos).

## Deuda técnica explícita

- **Portabilidad cross-device del banco de voz:** consciente (ADR-010/011). Sin backup por ahora.
- **`audit` 1 moderate** (`postcss` transitivo vía build): sin fix upstream aún, no explotable en
  esta app (sin server). Heredada del S2/S3.
- **Nivel "frases" del objetivo:** el objetivo alinea por palabra/etiqueta; combinaciones de dos
  palabras (etapa primeras-frases) alinean por sus palabras sueltas — suficiente para H1.
- **Tablet:** toda la lista de tablet sigue diferida (ADRs 003/007/010) — **NO gatea el cierre**.
- **Mecánica de meta del reducer SIN usuarios (ADR-013):** el globo (ADR-012) y el cohete
  (ADR-013) migraron a hitos infinitos; nadie pasa ya `meta !== null`. El motor conserva la
  mecánica (probada por unit) — retirarla completa va al próximo ciclo, no en pleno cierre de H1.
- **Bajos de la auditoría de cierre (declarados, no corregidos):** `lib/audio` fuera de las
  carpetas selladas del test de privacidad (la prohibición de red ahí depende solo de ESLint) ·
  candado de contenido por substring (posible falso positivo si el padre escribe "audio") ·
  umbrales 25-palabras/5-días solo probados en ausencia · `toBe(8)` acoplado al conteo de pictos ·
  borde 79/80/81 del objetivo y cap-200 de palabras sin test · `segundos()` duplicado
  (rumbo/celebración) · el test "Escuchar" no verifica que el blob reproducido sea el devuelto.

## Backlog de producto que nació en el gate ⭐ (para la planeadora — NO entró al S4)

El gate por bloques del usuario destapó pedidos de producto reales que **exceden el alcance
cerrado del S4** y merecen su propio sprint (o su ADR):

1. **Histórico navegable de cápsulas + "reforzar esta".** Hoy el padre ve la del día y un
   contador; no puede volver a una que le sirvió. Pedido textual: "quisiera saber cuáles
   actividades llevo, como un registro histórico" y poder elegir cuáles reforzar.
2. **Qué pasa al agotar la etapa.** Hoy: ciclo nuevo determinista (se repiten en otro orden), sin
   control del padre. Pregunta abierta del usuario: ¿se repiten, elige él, o la app crea nuevas?
   Riesgo declarado por él: "puede llegar a ser molesto si se repite las que no quiero".
3. **Pantalla que explique las 5 técnicas** (hoy la etiqueta las nombra y nada las explica) —
   posiblemente en Ajustes, junto a la etapa.
4. **Numerar las etapas como niveles ordinales** ("Sonidos e intentos = 1, Palabras sueltas = 2,
   Primeras frases = 3"). **Propuesta del usuario; recomiendo NO hacerlo** y él decide: un ordinal
   invita a "subir de nivel" y esta app promete exactamente lo contrario (ADR-005: palabras
   sueltas es el default **permanente**; la etapa se elige por lo que el niño hace hoy, no es una
   escalera). Alternativa si se quiere orden visible: ordenarlas de menor a mayor exigencia con su
   descripción, sin número.
5. **Obstáculos/cajas que saltar en el globo** (pedido del bloque E, re-preguntado en la
   re-mirada): una mecánica nueva de verdad — no por complejidad técnica, sino porque un
   obstáculo implica poder FALLAR y las reglas COGA de la app (sin game-over, sin castigo, sin
   retroceso) exigen diseñar primero qué pasa cuando NO se pasa. **Dirección de diseño del
   usuario (re-mirada):** "que la caja se quede ahí sin drama y ya" — el obstáculo espera, sin
   derrota ni retroceso; queda registrada para que la planeadora la evalúe con el ítem. Las
   vueltas del ADR-012 cubren la duración; esto cubriría la variedad. Candidata para el ciclo H2.
6. **Efecto de despegue inicial del globo** (E3, cosmético).
7. **Filtro por tono niño/adulto en palabra↔dibujo** (pedido del bloque G, decidido a backlog
   por el usuario tras evaluación honesta): quiere que el dibujo se encienda con la voz del
   NIÑO, no con la del adulto que lo nombra. No se hizo a ciegas porque (a) los pedacitos sin
   tono medible ("pe", "mmm" corto) son justo el esfuerzo a premiar y exigir tono infantil los
   castigaría (ADR-005); (b) no existe umbral universal — la voz del propio padre mide 195–210
   Hz, en plena zona de solapamiento; (c) encender es veredicto y la regla exige "quizás".
   **Diseño esbozado para H2:** derivar el rango REAL del adulto de su banco de voz (la app ya
   tiene sus grabaciones — calibración por familia) y **descartar solo lo confiablemente
   adulto**, jamás exigir tono de niño. Necesita spike de fiabilidad de pitch en fragmentos.

## Sugerencias de mejora al método

- **La guía de prueba debe dar el "Empieza en:" de cada bloque (nació en el gate ⭐ del S4,
  pedida por el usuario).** Cada bloque de la guía abre con la ruta exacta donde arranca su
  primera prueba (`/spike/audio`, `/jugar`, `/estudio`…), y la convención se explica una vez en
  la caja del recorrido; donde la prueba empieza navegando desde otra pantalla, el "Empieza en"
  lo dice ("se llega por X — eso es parte de la prueba"). **Aplicado ya en la guía v4 de habla;
  se propone como regla de la plantilla de guía del kit para TODAS las apps del pipeline.**
- **Las pruebas de la guía no deben pedir imposibles del instrumento:** el gate S4 cazó que A6
  pedía ver subir un MÍNIMO corrido dentro de la misma sesión (imposible por definición). Regla
  propuesta para la plantilla: cuando una prueba observa un acumulado (mín/máx/contador), su
  "Esperado" debe decir desde qué estado se parte (p. ej. "reinicia la sesión y…").

## Fricción del kit (para la retro)

- **Regla 9 (v1.7.3) estrenada y útil:** correr la suite e2e entera de las pantallas tocadas cazó
  el único rojo real del sprint (`etapas.spec`: el header de 2 filas + el auto-scroll del onboarding
  dejaban Ajustes fuera de vista). Sin la regla, habría llegado al PR.
- **`set-state-in-effect` (React 19 linter):** cargar storage en un `useEffect`+`setState` lo
  marca; la app ya tenía el patrón idiomático (`useSyncExternalStore`) — se siguió (store de objetivo).
- **`ref-en-render` (React 19 linter):** leer/escribir `ref.current` en el render está prohibido;
  las palabras encendidas pasaron de ref a **estado**, y el "latest ref" del picto a un efecto.

## Aprendizajes técnicos

- **La sección «Riesgos de integración» del plan valió el sprint:** el supuesto de la orden ("los
  insumos del progreso ya existen") era falso — los juegos no persistían nada. Cazarlo EN EL CÓDIGO
  antes de construir evitó descubrir el hueco a mitad de F2.
- **Honestidad como microcopy, hasta en la negación:** el grep anti-clínico cazó "sin puntajes" y
  "no es un diagnóstico" — mencionar la palabra, aun para negarla, planta el marco. Se reescribió a
  positivo. El test de vocabulario vetado es más estricto que el humano.
- **Identidad sin objetivo = la clave de no romper el pasado:** `priorizarEstable` con predicado
  falso devuelve la entrada intacta; por eso los e2e por semilla del S3 siguen verdes tal cual.

## Cierre de CICLO H1 — lo que este sprint SÍ produce (a diferencia del S3)

- **`docs/BLUEPRINT.html`** ✅ — as-built real del ciclo H1. Diagrama SVG embebido, tabla por pieza
  completa, costo US$0, punto único de falla = el dispositivo (con ADR-011 citado).
- **Design system publicado (`/design-sync`)** ⏳ acción externa — `design-system.md` consolidado
  y listo; la publicación en Claude Design usa el login de diseño del usuario (ver abajo).
- **Gate ⭐ ACUMULADO S1+S2+S3+S4** — la guía v4 lo ordena como recorrido con tiempos (25 pruebas,
  ~40 min, desktop + teléfono). Es la **única vía de cierre** (jamás diferible — condición 4 del
  método v1.9.0 que el S3 dejó pendiente). La lista de tablet es post-ciclo y **no gatea**.

## El gate ⭐ ACUMULADO — pendiente del usuario (OBLIGATORIO, no diferible)

Este es el cierre del ciclo: el S3 difirió su gate aquí, así que el gate del S4 es **acumulado
S1+S2+S3+S4** y es la única vía. Se ejecuta con `docs/GUIA-DE-PRUEBA.html` v4:

1. **Desktop + teléfono** (la tablet no gatea). Recorrido ordenado con tiempos en la guía.
2. 25 pruebas ⭐ (~40 min): el oído (tono real) · Hoy + etapas · los 4 juegos con voz real · la voz
   de la familia · **el rumbo** · **el objetivo**. Si excede una sesión, se parte en dos del MISMO gate.
3. Incluye la **aprobación visual** de `/rumbo` y `/objetivo` (idealmente con el niño observando).

## Lo que falta para cerrar (acciones del usuario)

1. **Ejecutar el gate ⭐ ACUMULADO** (desktop + teléfono, guía v4) — única vía de cierre.
2. ~~Publicar el design system~~ ✅ **hecho** — referencia de marca en Claude Design
   ("Hablemos San — Design System"). Revísalo si quieres (link en el reporte del chat).
3. **Merge del PR** con CI verde + tu OK del gate.
4. **Correr `/cierre-sprint habla`** en la planeadora — cierra el sprint **y el ciclo H1** (H1 de
   Hablemos San COMPLETO).

## Aprovisionamiento

| Servicio                    | Estado                                               |
| --------------------------- | ---------------------------------------------------- |
| GitHub + Vercel             | ✅ operando (preview por rama)                       |
| Sentry                      | ⏳ defer aceptado (kit inerte sin DSN)               |
| ARASAAC                     | ✅ sin cuenta: lote offline con atribución           |
| Claude Design               | ✅ proyecto "Hablemos San — Design System" publicado |
| API LLM                     | N/A — cero IA (**5.ª vez consecutiva**)              |
| _(hardware)_ Tablet Android | ⏳ de viaje — lista post-ciclo (no gatea)            |
