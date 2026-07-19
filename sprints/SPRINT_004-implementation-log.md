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
- [ ] F5 — CIERRE DE CICLO (BLUEPRINT.html · /design-sync · guía v4 · manual · summary · PR)
- [ ] **Gate ⭐ ACUMULADO S1+S2+S3+S4 del usuario** (desktop + teléfono) → merge → `/cierre-sprint habla` (H1 COMPLETO)

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

_(Se irá completando por fase.)_
