# Sprint 004 — "El rumbo" + CIERRE DE CICLO H1 · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_004-orden.md` (planeadora, RO) · Plan aprobado por el
> usuario 2026-07-19 (plan mode) · «construye» dado con modelo Opus 4.8 `[1m]`. Branch
> `sprint-004/el-rumbo` desde `main` (post-merge PR #4, S3 + remate cerrados — `610622b`).
> **ÚLTIMO sprint del ciclo H1 (4 de 4).** Gate: escritorio + teléfono (la tablet NO gatea el
> cierre — lista post-ciclo ACUMULADA en la guía v4). Quinto sprint consecutivo con cero IA.

## Estado por fase

- [x] F0 — Setup (branch, deltas kit v1.7.3 ×3, verificación de supuestos + riesgos de integración R1-R9)
- [x] F1 — Motores puros (sesiones · rumbo · etiquetas · objetivo · daily con objetivo · lote-por-etapa · dedup) — 193 unit verdes, cobertura 92 %/86 %
- [x] F2 — UI (/rumbo · /objetivo · header Hoy · CelebracionHonesta registra · alineaciones; suites enteras, regla 9)
- [x] F3 — Integración + e2e (rumbo frase-vs-métrica · objetivo animales/colores/borrar · privacidad · axe) — **127 e2e verdes** (lighthouse en F5)
- [x] F4 — Endurecimiento (5 deudas del remate + iconos PWA reales + ADR-011) — 200 unit verdes
- [x] F5 — CIERRE DE CICLO (BLUEPRINT.html · guía v4 · manual · design-system · summary · deploy-check · PR) — 200 unit · 127 e2e · build verdes
- [ ] **Gate ⭐ ACUMULADO S1+S2+S3+S4 del usuario** (desktop + teléfono) + `/design-sync` push → merge → `/cierre-sprint habla` (H1 COMPLETO)

## Los tres outcomes

- **O1 — Rumbo (progreso honesto del padre):** tendencias por semana + hitos funcionales, de lo
  que DE VERDAD se midió o el padre marcó. CERO puntajes clínicos, CERO %, CERO plazos, CERO culpa
  (semana floja = dato sin adjetivo). VISION § 5.
- **O2 — Objetivo de la semana (sintonía fonoaudióloga):** texto libre → alineación DETERMINISTA
  de Hoy + juegos + lote del estudio. Paga la deuda lote-por-etapa. "colores" = sin-matches
  honesto; borrarlo restaura el comportamiento por etapa.
- **O3 — CIERRE DE CICLO:** endurecimiento (5 deudas del remate + iconos reales + ADR-011) +
  `docs/BLUEPRINT.html` + design system publicado (`/design-sync`) + gate ⭐ ACUMULADO.

## Verificación de supuestos del kit y del sprint (F0)

- `githooks/pre-commit` **ejecutable (100755)** ✅ · `core.hooksPath=githooks` ✅ (K12 sigue vivo).
- **Carnada canónica partida** (regla 6 de CLAUDE.md): `AKIA` + `Q7RTZ4PXKM2WNB3S`. Habla es el
  ORIGEN de la regla "carnada partida" del kit (v1.7.3) — el full key (`AKIA` + los 16 base32 de
  la regla 6) nunca aparece contiguo en el repo, así que el hook no bloquea el commit del propio
  CLAUDE.md, y la carnada sigue íntegra y reconstruible. La plantilla del kit generalizó esta forma
  con otro punto de corte; ambas garantizan lo mismo. Verificado equivalente ✅ (delta #3 = solo
  verificación, no cambio). _(El gate lo comprobó en vivo: un borrador de esta bitácora escribió el
  key contiguo por descuido y el pre-commit lo bloqueó — el candado de secrets está armado.)_
- `/design-sync` disponible como herramienta de sesión ✅ (se ejerce en F5, al cierre).
- **Registros existentes** (supuesto 2 de la orden): `habla:v1:progreso` (historial de cápsulas,
  fecha+id) y `habla:v1:gemelas` (juicios por par) existen; los juegos de voz NO persisten nada
  (ver R1). Se crea el registro versionado nuevo `habla:v1:sesiones`, no un esquema paralelo.

## Deltas del kit aplicados (F0) — kit v1.7.3

| Delta                                                                                | Archivo(s)                                                                          | Estado    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------- |
| v1.7.3 — testing-patterns **regla 9** (suite entera por pantalla tocada, en su fase) | `.claude/skills/testing-patterns.md` (regla 9 + corolario de identidad por semilla) | ✅        |
| v1.7.3 — plan-sprint **§ Riesgos de integración con lo existente**                   | `.claude/commands/plan-sprint.md` (paso 7 nuevo)                                    | ✅        |
| v1.7.3 — **carnada partida** (verificar vs. plantilla final)                         | `CLAUDE.md` regla 6 (ya partida, origen de la regla)                                | ✅ verif. |

## ⚠️ Riesgos de integración con lo existente (kit v1.7.3) — examinados EN EL CÓDIGO

La sección que la orden exige que estrene el plan. Cada riesgo se verificó con archivo:línea:

- **R1 🔴 EL SUPUESTO ROTO — los juegos de voz NO persisten ninguna métrica.** La orden asume
  "los insumos del progreso YA existen"; la realidad: `sostenidoMs/rachaMs` (globo),
  `inversiones` (cohete) y `activaciones/reconocidas` (palabra↔objeto) **mueren en la
  celebración** — cero escrituras en `voice-game.tsx`, `cohete-tono.tsx`, `palabra-objeto.tsx`.
  Solo existen `historial` de cápsulas (sin números) y `habla:v1:gemelas` (juicios).
  **Mitigación:** registro NUEVO versionado `habla:v1:sesiones` (cap 500), escrito UNA vez por
  intento al montar `CelebracionHonesta` (compartida por los 4 juegos → un solo punto de
  escritura). Guarda SOLO los números que la celebración ya muestra + las palabras encendidas de
  palabra↔objeto. **Jamás audio ni pitch crudo (Hz)** — el conteo de inversiones/activaciones es
  la clase de dato que VISION § 5 sanciona ("registro de intentos y logros"), igual que los
  juicios de gemelas del S3; el sello de la regla dura 2 sigue sobre audio y Hz.
- **R2 — El e2e de privacidad asevera la lista EXACTA de claves** (`privacidad-cero-red.spec.ts`
  L190: `^habla:v1:(perfil|ajustes|progreso)$`). Las claves nuevas `sesiones` y `objetivo` (y la
  `gemelas` del S3) entran a la lista permitida **conscientemente** en F3, con el candado de
  contenido (`/audio|rms|pcm|wav|pitch|hz|blob:/`) intacto. (Nota: los nombres de campo elegidos
  —`vozMs`, `rachaMs`— no contienen la subcadena `rms`, verificado.)
- **R3 — Los e2e del S3 dependen del orden del mazo por semilla** (`voz-familiar.spec.ts` — el más
  frágil: mismo 1.er picto entre montajes). El objetivo re-prioriza mazos → **sin objetivo escrito,
  el orden queda BYTE-IDÉNTICO al de hoy** (unit de identidad lo clava); esos e2e corren con
  storage limpio → intactos. La alineación se prueba con e2e nuevos que escriben el objetivo POR
  LA UI. Regla 9 estrenada.
- **R4 — La asignación del día está CONGELADA por diseño** (invariante del S2, nacida de un
  defecto real: `daily.ts:57-68` — la cápsula de hoy no cambia al recargar/completar/volver).
  "Escribir el objetivo alinea Hoy" (acceptance) choca con ella. **Decisión:** escribir/borrar el
  objetivo re-evalúa la asignación de HOY **solo si la cápsula de hoy NO está completada** (el
  trabajo hecho jamás se toca); unit para ambas ramas. El congelamiento por-etapa queda intacto.
- **R5 — El estudio recién auditado:** `siguienteLote` crece a `{etapa, objetivo, …}` (paga
  lote-por-etapa DENTRO de O2). El lote se fija al montar (`useMemo([])`,
  `estudio-cliente.tsx:227`) → un objetivo escrito a mitad de lote aplica al SIGUIENTE lote
  (correcto, se documenta). Sin objetivo → orden idéntico al actual.
- **R6 — `CelebracionHonesta` es compartida por los 4 juegos:** escribir la sesión ahí hace que
  "otra vez" registre CADA intento (correcto: un intento = una sesión). El spec de
  rastro-en-storage corta a mitad de juego (no llega a celebración): sin impacto; se verifica con
  la suite entera.
- **R7 — El refactor de `barajar` (deuda) NO puede cambiar la semilla ni el orden:** la copia
  local de `palabra-objeto.tsx:33-43` es idéntica a `lib/barajar.ts` → sustitución 1:1;
  `voz-familiar.spec` es la evidencia de regresión.
- **R8 — El contenido NO tiene etiquetas** (`CapsulaSchema` solo `tecnica+etapa`; pictos solo
  `palabra+tema`; **cero palabras de color en el contenido** → "colores" es literalmente el caso
  sin-matches honesto de la orden). O2 exige etiquetar: campo `etiquetas: string[]` (default `[]`)
  en cápsulas + etiquetado curado es-CO de las 50; pictos matchean por `palabra`+`tema`; pares por
  sus dos palabras.
- **R9 — Iconos PWA:** `manifest.ts:16-25` referencia `icon-192/512.png` placeholders. `sw.js` NO
  fija hashes de esos assets (los sirve por URL con refresco, no por hash) → sustituir archivos con
  MISMOS nombres es seguro; el manifest no cambia. Verificado ✅.

## Desviación del plan

- **Iconos PWA (F4):** el plan proponía renderizar un SVG del globo con Playwright → PNG. Al abrir
  `scripts/gen-iconos.mjs` resultó que YA existe un generador **sin dependencias** (encoder PNG
  puro con `node:zlib`) que dibuja el globo de la paleta. Introducir Playwright para rasterizar es
  más pesado y flakier que refinar el script existente. **Decisión:** refino `gen-iconos.mjs`
  (paleta del design system + variante maskable con zona segura) en vez de añadir Playwright —
  cero dependencias nuevas, determinista, más en el espíritu de la app. (Anotado aquí al construir,
  no después — método v1.9.1.)

## F1 — Motores puros (hecho)

- **Sesiones (`habla:v1:sesiones`):** `SesionSchema` unión discriminada por juego + `registrarSesion`
  (cap 500). `lib/rumbo/sesion.ts` mapea Metrica→Sesion (puente puro testeable). Unit: cap,
  versionado, y candado "sin audio/pitch" sobre lo guardado.
- **Rumbo:** `lib/rumbo/tendencias.ts` (agrega por semana: días con práctica —juego o cápsula—,
  palabras distintas, dibujos, inversiones, racha máx, marcadas por el padre; más reciente primero,
  semana floja = número sin adjetivo) + `lib/rumbo/hitos.ts` (primer día, primera palabra que TÚ
  oíste, voz > 5 s, 10/25 palabras distintas, constancia 3/5 días). Cero clínica.
- **Objetivo:** `lib/objetivo/alinear.ts` (`normalizar` + predicados + `contarAlineacion` con el
  caso honesto `vacio`) + `lib/objetivo/prioridad.ts` (`priorizarEstable`, identidad sin objetivo).
- **Etiquetas (R8):** `ETIQUETAS_CAPSULA` (vocabulario controlado, sin colores) + `etiquetas` en
  `CapsulaSchema` (≥1) + curaduría de las 50 en `ETIQUETAS_POR_CAPSULA` (mapa al final de
  capsulas.ts, no inline). Unit: cobertura total, cero huérfanas, "animales" alinea, "colores" vacío.
- **daily con objetivo (R4):** `seleccionarCapsula` gana predicado opcional `coincide` (sin él =
  identidad); `realinearObjetivo` re-evalúa HOY solo si NO está completada (unit doble).
- **Lote por etapa (R5):** `siguienteLote` gana `objetivo` + `etapa` (sin objetivo = orden idéntico;
  en sonidos-e-intentos las palabras solo-de-gemelas bajan). Paga la deuda lote-por-etapa dentro de O2.
- **Dedup (deudas del remate):** `barajar` (copia local de palabra-objeto → `@/lib/barajar`),
  `fechaHoy` (copias de gemelas + estudio → `@/lib/fecha`, que además trae `lunesDeLaSemana`).

## F2 + F3 — UI y e2e (hecho)

- **Registro de sesiones (R1):** `CelebracionHonesta` escribe la sesión al montar (ref-guard vs.
  doble-efecto de StrictMode); palabra↔objeto aporta las palabras encendidas por **estado** (no
  ref-en-render, que el linter de React 19 prohíbe).
- **`/rumbo`:** tendencias por semana + hitos + vacío honesto. Microcopy SIN vocabulario clínico
  (ni negado: el design system dice "jamás diagnóstico/puntaje" — se quitó "sin puntajes/notas").
- **`/objetivo`:** editor con preview honesto + caso sin-matches + guardar/quitar; store reactivo
  `useObjetivo` (idiomático `useSyncExternalStore`, sin `setState`-en-efecto).
- **Alineaciones:** mazo palabra↔objeto, rondas de gemelas y lote del estudio priorizan el objetivo
  (identidad sin objetivo). Header de Hoy + línea del objetivo activo. Iconos brújula + diana.
- **e2e nuevos:** `rumbo.spec` (vacío · frase-vs-métrica con números inyectados · write-path por la
  UI · grep anti-clínico) · `objetivo.spec` (animales alinea Hoy+mazo+lote · colores honesto ·
  quitar restaura identidad).
- **Regla 9 (kit v1.7.3, estrenada):** corrida la suite e2e ENTERA de las pantallas tocadas en esta
  fase. Un solo rojo real: `etapas.spec` — el header más alto (2 filas) empujó el botón del
  onboarding bajo el pliegue y el auto-scroll del tap dejó Ajustes fuera de vista; se corrigió
  mirando desde el tope (sigue cazando "enterrado al pie"). **127 e2e verdes en todos los proyectos.**
- **Privacidad (R2):** lista blanca de claves ampliada conscientemente (`sesiones`, `objetivo`,
  `gemelas`) con el candado de contenido (audio/pitch) intacto. axe + lighthouse ganan `/rumbo` y
  `/objetivo`.

## F4 — Endurecimiento (lista CERRADA — hecho)

Las 5 deudas del remate S3, pagadas con evidencia:

1. **Tests de componente del estudio:** `tests/unit/estudio-cliente.test.tsx` (Testing Library) —
   cobertura, lista de grabados, escuchar (reproduce el blob), borrar, banco vacío, IndexedDB roto.
   De paso arregló un hueco del setup: faltaba `afterEach(cleanup)` de RTL (los renders se
   acumulaban) — se añadió a `tests/setup.ts` (beneficia a todo test de componente).
2. **Dedup `reproducir`:** `src/lib/audio/reproducir.ts` (`reproducirBlob`, con cancelación) +
   `useReproductor` (revoca al desmontar). Sustituye la copia del estudio y la de la voz familiar.
   (barajar y fechaHoy ya se dedup-earon en F1.)
3. **Revoke al navegar a mitad de clip:** `reproducirBlob` libera la URL al terminar, al fallar o
   al cancelar; `useReproductor` y `use-voz-familiar` cancelan en el desmontaje. e2e de voz-familiar
   (×3) y de privacidad (banco 100 % local) siguen verdes.
4. **Unit del cap-500 de gemelas:** `agregarJuiciosGemelas` acota a 500, conservando los más
   recientes (test en storage.test.ts).
5. **Lote-por-etapa:** pagado en F1 dentro de O2 (`siguienteLote({etapa, objetivo})`).

Más los cierres de deuda del sprint:

- **Iconos PWA reales:** `scripts/gen-iconos.mjs` refinado (globo del design system, sage/cream,
  con brillo y cuerdita) — genera `icon-192`, `icon-512` y **`icon-512-maskable`** (globo en la zona
  segura, fondo sólido). Manifest apunta la entrada maskable a la variante. Cero dependencias nuevas
  (encoder PNG con `node:zlib`) — **desviación del plan declarada en F0** (se descartó Playwright).
- **ADR-011 — export .zip:** escrito con decisión **RECHAZAR por ahora** (un backup que puede no
  restaurar en otro dispositivo es una promesa falsa; el costo de re-grabar es <10 min; ensancha la
  superficie de privacidad). Validado por el usuario en el gate del plan; reabrible.

## F5 — Cierre de ciclo (hecho)

- **`docs/BLUEPRINT.html`** — as-built del ciclo H1: SVG embebido (cero CDNs), tabla por pieza,
  costo real US$0, punto único de falla = el dispositivo (ADR-011 citado), historial iniciado.
- **Guía v4 acumulativa** — hereda ENTERAS las v3 (S3 pasa a regresión), bloques N (rumbo) y O
  (objetivo), 2 ítems de tablet, recorrido del gate ⭐ ACUMULADO con tiempos (25 pruebas, ~40 min).
- **Manual** — secciones "El rumbo" y "El objetivo de la semana"; **design-system.md** — sección
  "Pantallas del padre (Sprint 4)".
- **`/design-sync`** — el repo es una app (sin Storybook/dist), así que se publicó una **referencia
  de marca** (decisión del usuario): tokens + 8 tarjetas de preview + README de convenciones →
  proyecto "Hablemos San — Design System"; pin en `.design-sync/config.json`.
- **`/deploy-check`** → MERGE OK local (200 unit · 127 e2e · build · typecheck · lint) → summary →
  PR #5.

## Auditoría de cierre (2 fases, 2026-07-19) — pedida por el usuario antes del gate

**Fase 1 (solo lectura):** alcance contrastado ítem a ítem contra la orden, motores leídos línea a
línea, 3 revisores paralelos (tests · privacidad · UI) + verificación en código de cada hallazgo.
Resultado: **0 Críticos · 2 Altos · 6 Medios · 11 Bajos** → "requiere ajustes". La promesa de
privacidad salió BLINDADA (cero fugas; flujos, sellos y revokes verificados). **El gate de
Lighthouse del PR cazó en vivo el Alto A1** — la CI hizo su trabajo.

**Fase 2 (ajustes, aprobados por el usuario — alcance completo: Altos + Medios + doc):**

- **A1 (CI rojo — budget):** `/objetivo` cargaba los 3 bancos de contenido en su bundle inicial
  (383 KB > 350 KB): los importaba el preview Y `aplicarObjetivoAHoy` (vía estado-capsulas, que
  arrastra la biblioteca — la MISMA trampa que el S2 cazó en los juegos). Arreglo: los bancos se
  cargan con `import()` dinámico al primer teclazo y estado-capsulas se importa al guardar/quitar.
  Medido en prod local: **383,0 → 331,3 KB gzip** (~27 KB bajo el budget, al nivel de /rumbo).
- **A2 (preview deshonesto):** contaba contra los bancos COMPLETOS, pero la priorización real está
  acotada (cápsulas por etapa, mazo por temas, pares jugables) — prometía "poner primero" dibujos
  que el mazo del niño no trae. Arreglo: `lib/objetivo/alcance.ts` (motor puro que ESPEJA el mazo
  real) + conteo acotado + **tercer estado honesto** "existe pero fuera de su alcance" (con la
  línea del estudio solo cuando es verdad — predicado compartido `coincideConObjetivo` exportado
  de lotes.ts, no duplicado). Unit ×5 + e2e nuevo (dinosaurios sin su tema) + prueba O6 en la guía.
- **M1:** el candado e2e de privacidad corría ANTES de que la app escribiera — ahora corre también
  tras la celebración y tras guardar un objetivo por la UI, y asevera que `sesiones`/`objetivo`
  EXISTEN (la lista blanca ya no puede pasar en vacío).
- **M2:** cada dato del rumbo tiene testid y el e2e ata número↔frase (un intercambio de etiquetas
  ya no pasa verde). **M3:** grep anti-clínico igualado al vocabulario vetado de las cápsulas
  (+puntuación, atraso, nivel, déficit, trastorno, "en N semanas"). **M4:** singular/plural en los
  6 datos del rumbo ("1 palabra distinta", no "1 palabras"). **M5:** al guardar el objetivo el foco
  vuelve al input y la confirmación vive en una región `aria-live` permanente (el lector la
  anuncia). **M6:** units de `pares>0`, orden EXACTO de hitos y semanas que cruzan mes/año.
- **De regalo (Bajos B3/B8/B9):** el hito dice "5 segundos seguidos" (el "más de" mentía en el
  borde exacto de 5000 ms) · `role="group"` en las sugerencias · esta sección F5 que faltaba.
- **Bajos restantes → deuda explícita** declarada en el summary (lib/audio fuera del test-sello,
  candado por substring, umbrales 25/5 solo en ausencia, `toBe(8)` acoplado al contenido, borde
  80 chars, cap-200 sin test, dedup de `segundos()`, blob del test "Escuchar").

**Tras los ajustes:** typecheck · lint · **209 unit** (90,6 % stmts / 86,6 % branches) · **129
e2e** · build verdes. Guía v4, manual y summary actualizados con el microcopy literal nuevo.

## Gate ⭐ ACUMULADO — en curso (por bloques, decisión del usuario)

- **Bloque A (el oído: energía y tono) — 2026-07-19 · APROBADO (11/11).** rms responde al instante
  (0,1–0,2 al hablar), ~30 fps estables por 4.909 frames, tono "—" en silencio y con voz grave
  (correcto: el oído arranca en 150 Hz), 195–210 Hz en voz aguda, la barra sigue sin retraso, 4
  inversiones bien contadas, la imitación de voz infantil entró al rango (188→210+ Hz). A10
  (temblor) quedó parcial por limitación humana del probador — cubierto por `spike-pitch.spec`
  (audio sintético). **Hallazgos → a la guía, no a la app:** (1) el "piso (mín. sesión)" del spike
  es un mínimo corrido — 0,0000 es sano y NUNCA sube dentro de la sesión; A6 pedía un imposible
  (verificado: con Detener→Empezar con música sonando, el piso nuevo sí arranca alto). El juego no
  usa ese mínimo (calibra P75 + piso 0,002, `calibration.ts:70`). A2/A6 reescritas. (2) El gate se
  corrió en Safari, que no reporta `noiseSuppression`/`autoGainControl` (la app los pide en false,
  `types.ts:32-34`) — A5 gana la nota Safari-vs-Chrome. El spike NO se tocó (congelado por la
  orden, lista de tablet).
- **Mejora general pedida por el usuario durante el gate (2026-07-19):** cada bloque de la guía
  ahora abre con **"Empieza en:"** (la ruta exacta de su primera prueba) + la convención explicada
  una vez en la caja del recorrido. Registrada en el summary como **propuesta al kit para todas
  las apps** — la planeadora la recoge en el cierre.

- **Bloque B ("Hoy": la respuesta del día) — 2026-07-19 · APROBADO 9/9 de lo ejecutable.** (B8,
  "entra mañana", queda para el día siguiente por naturaleza.) Sin apodo entra igual; los temas
  quedaron elegidos (animales · dinosaurios · carros) para verificarse en el bloque G; la cápsula
  se lee sin jerga ni culpa y con su fuente real; la etapa arranca en "palabras sueltas" (ADR-005);
  "Ya lo hicimos" persiste tras recargar y cerrar el navegador. **Cero defectos funcionales.** El
  bloque dejó un **lote de pulido de UI**, pedido por el usuario y aplicado en el acto:
  1. **Tarjeta de juegos:** anunciaba **tres** juegos y mostraba dos iconos — las gemelas del S3
     nunca se agregaron. Ahora los **cuatro** iconos, y **a la izquierda** del texto.
  2. **Regla nueva del design system (del usuario): el icono va SIEMPRE a la izquierda** del texto
     que acompaña, en toda la app (la excepción es el chevron de "sigue por aquí"). Añadida
     también la regla hermana: **los estados existen en pareja visible** (pendiente ⭕ / hecho ✓).
  3. **Contador de días:** se muda del pie de la página a **dentro de la tarjeta**, pegado al
     estado del día, con la cifra grande en sans tabular (antes iba en mono, violando el
     design-system: cifra dentro de frase jamás monoespaciada).
  4. **`IconoPorHacer`** en el botón de marcar (el estado pendiente ya no se comunica solo por
     ausencia del check). **Y el microcopy dejó de mentir sobre su propio estado** (tercera pasada
     del usuario): el botón decía **"Ya lo hicimos"** a secas — una afirmación que se lee como
     hecho ya cierto, cuando es la acción pendiente. Ahora, mientras está pendiente, encima
     aparece la **pregunta** "¿Ya hicieron la actividad de hoy?" y el botón es su **respuesta**:
     "Sí, ya lo hicimos". El estado no-marcado se afirma con palabras, no solo con un icono.
  5. **Jerarquía de la cápsula:** "La actividad de hoy" pasa de texto suelto al pie a **caja
     hermana** del guion (mismo borde acentuado, texto `text-lg`), cada una con su icono
     (`IconoBurbuja` · `IconoChispa`) — se leía como una introducción, siendo la acción del día.
  6. **La fuente se ve como cita:** `IconoCita` + cursiva.
     6-bis. **🔴 La chispa de IA, vetada (segunda pasada del usuario sobre el lote).** El icono que
     puse para "La actividad de hoy" era un **destello de cuatro puntas** — hoy el símbolo
     universal de la **IA generativa**. En una app cuya regla dura 1 es "determinista primero,
     cero IA" (quinto sprint sin un solo LLM) y cuyo contenido es biblioteca curada con evidencia
     citada, ese icono **insinúa que el contenido lo generó una máquina**: contradice el producto,
     no el estilo. Reemplazado por **`IconoJuntos`** (un adulto y un niño lado a lado = co-uso, la
     tesis del producto) y **prohibida la chispa en el design system**, en cualquier variante.
     Además, los iconos de "Tu línea de hoy" y "La actividad de hoy" pasan de 16 a **32 px** (el
     tamaño de los del juego) y encabezan el bloque entero desde la izquierda: a 16 px junto a un
     rótulo mono de 11 px no se leían como señal. Regla de tamaño añadida al design system.
  7. **Etiqueta de la cápsula:** `Hoy practicamos · X · Y` → **`Técnica: X · Etapa: Y`** (no se
     sabía cuál era cuál). El e2e de etapas es indiferente: asevera el `<span>` interno.
  8. **Ajustes:** el "← Hoy" sube al **encabezado** con la misma forma que en Rumbo y Objetivo
     (era un enlace suelto al pie); prueba **H6** nueva en la guía.
     4 iconos nuevos (trazo 1.5, viewBox 24, `currentColor`). Verificado: typecheck · lint · 209
     unit · **129 e2e** (incluido axe) · build. Guía v4: B3/B4/B5/B6/B9 → "Mejorado en S4" + H6 nueva.
- **Bloque C (la etapa del habla) — 2026-07-19 · APROBADO 5/5, SIN AJUSTES.** El bloque más limpio
  del gate: las tres etapas se describen por comportamiento observable, sin jerga ni diagnóstico;
  "palabras sueltas" aparece elegida y recomendada sin haber tocado nada (ADR-005); "primeras
  frases" existe pero **jamás se activó sola** — hubo que elegirla a mano; la etapa y la cápsula
  sobreviven a la recarga.
  **Lo valioso para este sprint:** C2 y C3 validan **en uso real** la invariante que el S4 tocó al
  construir el objetivo (R4). El padre marcó la cápsula como hecha, cambió a "sonidos e intentos"
  (cápsula nueva de esa etapa, **contador intacto**) y al volver a "palabras sueltas" **reapareció
  LA MISMA cápsula, todavía marcada como hecha**. Es decir: la asignación congelada por etapa y el
  historial que nunca se borra siguen sanos después de que `realinearObjetivo` aprendió a
  re-evaluar el día. El trabajo hecho es intocable, como prometía el diseño.
- **Bloque D (el selector de juegos) — 2026-07-19 · APROBADO 3/3.** Las 4 tarjetas (las gemelas
  incluidas), lo que declara cada una ("mide que hubo voz — nunca qué palabra dijo") y su tamaño
  quedaron aprobados sin reparos; el usuario lo destacó como una de las mejores visuales de la app.
  **Un pulido, y destapó un descuido mío:** al subir el "← Hoy" de Ajustes en el bloque B **no
  barrí el resto de pantallas**; el selector seguía con el enlace suelto al pie. Corregido — ahora
  **las cuatro pantallas del padre salen igual** (rumbo · objetivo · ajustes · juegos) y la regla
  quedó escrita en el design system, con su **excepción declarada**: en una pantalla de error o
  decisión (micrófono denegado en `MarcoJuego`), "Volver a Hoy" sigue siendo un **botón grande
  emparejado** con "Intentar de nuevo" — ahí no es navegación de encabezado sino una de las dos
  salidas del problema, y ambas deben pesar igual.
- **Bloque E (el globo) — 2026-08-01 · 10 limpias, 2 explicadas, 3 hallazgos de producto → el
  remate más grande del gate.**
  - **E6 🔴 (ADR-012): el globo se cerraba solo a los 3 segundos** — justo mientras el padre le
    enseñaba al niño ("eso va a hacer que mi hijo pierda interés"). La mecánica sin-fin ya existía
    (`meta: null`, la usan palabra↔objeto y el modo calma): el globo la adopta. **La meta se
    volvió HITO** (`HITO_VUELTA_MS`): cada 3 s de voz acumulada = una VUELTA — celebrada en vivo
    ("¡Ya dio N vueltas!", testid `vueltas`), el globo reaparece por la izquierda (jamás en
    reversa) y sigue; infinitas. Cierra solo con "Ya jugamos". El reducer conserva la meta (el
    cohete la sigue usando; su bloque dirá). Unit de regresión: "NO celebra solo, ni tras muchas
    vueltas". El e2e del camino feliz ahora verifica la vuelta en vivo y cierra por el padre.
  - **E1 + Otras #3 (navegación):** el guion de los 4 juegos gana su **"← Juegos"** (chip
    estándar, en la GuionCard compartida) y **"Salir" dentro del juego vuelve al GUION**, no al
    selector (evento `VOLVER_AL_GUION` + `volverAlGuion` en el hook, que **apaga el micrófono**
    antes de pisar la pantalla del padre — regla dura 2). e2e nuevo del flujo completo.
  - **E5 (planeo):** el globo ya no frena en seco en las pausas — la persecución del objetivo se
    alarga (140→480 ms) y desacelera suave. Solo persigue, nunca se adelanta: **la posición no
    puede mentir** (la métrica sigue contando únicamente voz real). Se descartó la segunda parte
    de la propuesta (bajar a posición inicial tras 1 s): es retroceso, vetado por COGA (E4).
  - **E13 (calma):** el globo flota **en el centro** del cielo (estaba pegado al borde izquierdo
    y parecía que el juego no había empezado). El resto del modo queda igual (deliberado).
  - **E11 explicado (no defecto):** el aviso de ruido dispara sobre 0,05 RMS ("tan ruidoso que se
    jugaría a medias"); su música quedó por debajo Y el juego funcionó bien — avisar habría sido
    falso alarmismo. El propio usuario notó que distinguía su voz del ambiente (el umbral relativo
    trabajando). **E12 diferido a Chrome** (Safari no revoca mic por sitio); cubierto por e2e.
  - **Al backlog:** obstáculos/cajas que saltar (mecánica nueva de verdad) · efecto de despegue
    inicial (E3, cosmético).
  - Tras el remate: **214 unit · 131 e2e** (+5 units del reducer, +2 e2e de navegación y vueltas).
  - **Re-mirada del usuario (2026-08-01): aprobó vueltas y navegación, y pidió que cada vuelta se
    SIENTA como logro** → nace el **confeti de la vuelta** (`confeti-vuelta.tsx`): estallido
    determinista de confeti + serpentinas sobre la línea (14 piezas fijas — el azar no se puede
    testear, patrón de `globos-celebracion`), colores `fiesta-*` (segundo uso sancionado en el
    design system), corre UNA vez ~1,6 s vía CSS (`confeti-cae`), re-montado por `key={vuelta}`;
    apagado doble con movimiento reducido (media query + `data-reducir-animacion`) — el contador
    aria-live sigue contando el logro. En calma no hay vueltas ni confeti. e2e: `toBeAttached` en
    el camino feliz (el estallido queda en el DOM hasta la vuelta siguiente — sin flake).
    **Obstáculos re-preguntados:** siguen en backlog — no por complejidad técnica sino porque un
    obstáculo implica poder FALLAR y las reglas COGA (sin game-over, sin castigo, sin retroceso)
    exigen diseñarlo primero (¿la caja espera? ¿se flota por encima?); mecánica para el ciclo H2.
  - **Segunda re-mirada (2026-08-01): confeti aprobado + tres ajustes.** (1) La celebración final
    gana su tercer número — "Con esa voz el globo dio N vueltas completas" (testid
    `celebracion-vueltas`, prop `vueltas` de `CelebracionHonesta`): derivado del MISMO
    `sostenidoMs` (floor(ms/hito), nada nuevo que medir ni persistir), **0 en calma** — allí no
    hay línea de vuelta y la celebración no afirma lo que el juego no mostró. e2e en el camino
    feliz. (2) **E3 de la guía corregido** (precedente A6: la guía prometía algo que la app no
    hace): decía que el globo "despega" y el despegue desde el suelo nunca existió — el globo
    arranca flotando en su reposo; el efecto sigue en backlog como cosmético. De paso, defecto de
    la guía cazado y corregido: E5 tenía insignia "Mejorado en S4" pero `data-origen="s1"` — el
    filtro "Solo lo mejorado" no lo mostraba. (3) **Obstáculos: dirección de diseño del usuario
    registrada** — "que la caja se quede ahí sin drama y ya" — viaja con el ítem del backlog al
    informe de la planeadora.
- **Bloque F (el cohete) — 2026-08-01 · 6 limpias, 1 diferida (F7→Chrome, junto a E12), 2
  frentes construidos tras AskUserQuestion (hito por subida-y-bajada · confeti+cielo · lote
  completo — las 3 recomendadas).**
  - **Propuesta ⭐ (ADR-013): el cohete tampoco termina solo.** `meta: null` (muere el cierre a
    las 3 inversiones — mismo defecto del E6); cada **subida-y-bajada real** es un HITO: confeti
    compartido (`ConfetiVuelta` gana prop `centrado`: corrimiento -38 sobre las mismas 14 piezas
    deterministas), **capa de cielo que pasa** (`CapaDeCielo` en escenario-cohete: 3 nubes + 2
    estrellas fijas cruzan hacia abajo UNA vez, ~1,4 s, keyframes `cielo-pasa`, doble apagado con
    movimiento reducido) y contador vivo `subidas` ("¡Ya subió y bajó N veces!") — **el MISMO
    número de la celebración final** (misma métrica, cero semántica nueva). El matiz honesto que
    el globo no tenía: la posición del cohete ES el tono en vivo — el ascenso lo cuenta el MUNDO
    (cielo que pasa + contador), jamás la posición. Vocabulario: nada de "niveles" (escalera
    vetada); se celebran "subidas y bajadas", lo medido. La mecánica de meta del reducer queda
    SIN usuarios — retirarla es deuda declarada (no se toca el motor probado en pleno cierre).
  - **F8 (fluidez):** el cohete gana el patrón de planeo del globo — persecución 200 ms con voz
    (mayor que los 140 del globo: el tono llega a ~31 estimaciones/s y a saltos de nota) / 480 ms
    en pausa, con `medidas.vozActiva()`. Antes: τ fija de 120 ms que dejaba pasar el jitter.
  - **F5 (matiz honesto, precedente A6):** la guía decía "no se mueve solo" a secas; el usuario
    encontró que cantantes agudos a alto volumen SÍ lo mueven — correcto: una voz cantada ES una
    voz con tono en el cuarto y el medidor no adivina quién canta. El "Esperado" lo dice ahora.
  - **e2e reescrito:** el camino feliz verifica el hito EN VIVO (contador + confeti + capa
    `toBeAttached` — quedan en el DOM hasta el hito siguiente, sin flake) y que la celebración
    jamás diga MENOS que lo celebrado en vivo (`veces >= contadas`); el de calma verifica que
    allí no hay contador ni confeti. El medidor del tono pierde la rayita de meta (ya no existe).
  - Guía: F3/F5/F6/F8 → Mejorado en S4; F7 gana la nota Safari→Chrome. Manual reescrito (hitos +
    el detalle honesto de la altura). ADR-013.
  - **Re-mirada F (2026-08-01) — defecto de percepción cazado por el usuario: "si baja igual
    parece que sube".** Causa: el hito se registra en el PICO de la voz (la inversión es el
    cambio de dirección), así que la capa de cielo arrancaba a correr hacia abajo EXACTAMENTE
    cuando la voz empezaba a bajar — y un mundo corriendo hacia abajo se lee como ascenso
    (ilusión de vección). Fix: **la capa espera la siguiente subida** — queda pendiente
    (`capaPendienteRef`) y se lanza desde el rAF solo tras ~65 ms sostenidos de ascenso real
    (`vuelo.y` bajando 4 frames seguidos con `vozActiva`); el confeti y el contador siguen
    celebrando en el instante del hito (no insinúan dirección). ADR-013 corregido, F3 de la guía
    describe el orden real (y su "Mal" caza la capa en plena bajada), manual ajustado.
  - **Pre-F — orientación en las pantallas de entrada (pedido del usuario, transversal a los 4
    juegos):** evaluó dos opciones (icono junto al titular vs. reemplazar el titular por el
    nombre del juego). **Ganó conservar el titular poético + icono a la izquierda** — el titular
    enseña la mecánica ("Su voz sube el cohete") y reemplazarlo por el nombre sería redundante
    (el padre acaba de tocar la tarjeta con ese nombre); la orientación la da el **símbolo
    repetido** selector→pantalla (wayfinding), cumpliendo las reglas del gate (icono a la
    izquierda, jerarquía de tamaño). Implementación: `<h1>` de las 4 páginas de `/jugar/*` con el
    MISMO icono de su tarjeta del selector, envuelto en `aria-hidden` (Globo/Cohete anuncian
    `aria-label` propio que en el titular sería ruido doble). Regla nueva en `design-system.md`;
    F1 de la guía lo describe (Mejorado en S4).
- **Backlog del bloque B (NO entra al S4 — alcance cerrado; va al informe de cierre):** histórico
  navegable de cápsulas con "reforzar esta" · qué pasa al agotar la etapa (hoy: ciclo nuevo
  determinista, sin control del padre) · pantalla que explique las 5 técnicas · numerar las etapas
  como niveles ordinales (propuesta del usuario; mi contra-razón: un ordinal invita a "subir de
  nivel" y esta app promete lo contrario — ADR-005; **decisión del usuario pendiente**).
