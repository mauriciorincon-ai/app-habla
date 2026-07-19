# Sprint 003 — "La voz de la familia" · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_003-orden.md` (planeadora, RO) · Plan aprobado por el
> usuario 2026-07-18 (plan mode) · «construye» dado con modelo Opus 4.8 `[1m]`. Branch
> `sprint-003/la-voz-de-la-familia` desde `main` (post-merge PR #2, S2 cerrado).
> Gate: escritorio (la tablet sigue de viaje — lista diferida ACUMULADA S1+S2+S3 en la guía v3).

## Estado por fase

- [x] F0 — Setup (branch, deltas kit ×5, ítem 0, ADR-010 esqueleto, verificación de supuestos)
- [x] F1 — Motores puros + candados + gemelas + banco de voz (139 unit verdes)
- [x] F2 — UI (estudio, Ajustes, gemelas, integración de voz) — a: selector+gemelas · b: estudio · c: voz en los juegos
- [x] F3 — Integración + e2e (mic fake, cero-red, axe) — 103 e2e verdes en todos los proyectos
- [x] F4 — Calidad y cierre (guía v3, manual, summary, deploy-check) — falta solo el gate del usuario
- [x] **Gate del usuario** — DIFERIDO al S4 (método v1.9.0, decisión del usuario 2026-07-19; 4
      condiciones cumplidas, ver summary) → merge a `main` → `/cierre-sprint habla` en la planeadora

## Los tres outcomes

- **O1 — Banco de voz familiar ⭐:** estudio de grabación por lotes (MediaRecorder), banco 100 %
  local (IndexedDB), gestión con cobertura.
- **O2 — Toda la app prefiere la voz familiar:** pictos + celebraciones + consignas con fallback
  limpio; el cohete intacto (ADR-007).
- **O3 — Palabras gemelas:** pares mínimos es-CO, el padre juzga (ADR-009 como motor), registro
  local. + Ítem 0: kit de prueba WAV.

## Verificación de supuestos del kit y del sprint (F0)

- `githooks/pre-commit` **ejecutable (100755)** ✅ · `core.hooksPath=githooks` ✅ · gitleaks
  **8.30.1** vivo ✅.
- **Carnada canónica v1.6.3 VERIFICADA contra el gitleaks vigente:** `AKIA…Q7RTZ4PXKM2WNB3S`
  dispara `aws-access-token` (probada en sandbox el 2026-07-18). Escrita en CLAUDE.md regla 6
  **partida tipográficamente** (`AKIA` + el resto) para documentarla sin que el hook bloquee el
  commit del propio CLAUDE.md — decisión de implementación, no desviación del delta (la carnada
  queda íntegra y reconstruible; el hook sigue 100 % armado sin allowlist).
- Budgets del S2 presentes: script **350 KB** ✅ · LCP **3800 ms** ✅ (margen estrecho en "/",
  vigilar — deuda del S2).

### Supuestos técnicos del banco de voz — spike `tests/e2e/spike-grabacion.spec.ts` (F0) ✅

Corrido en desktop-chromium (el mismo motor de la CI), 2026-07-18:

- [x] **MediaRecorder graba en Chrome desktop:** formato nativo `audio/webm;codecs=opus` (+ webm,
      mp4). `isTypeSupported` confirma 3 formatos.
- [x] **MediaRecorder captura el micrófono fake de Playwright en headless:** 10.922 bytes grabados
      en 700 ms — **crítico: la estrategia e2e del estudio es viable.**
- [x] **IndexedDB round-trip de un Blob:** 10.922 bytes preservados ida y vuelta → **decisión de
      almacenamiento firmada: IndexedDB** (ADR-010).
- [~] `navigator.storage.persist()` devolvió **false** en headless (sin engagement/PWA instalada).
  No bloquea: el banco funciona igual; riesgo de evicción se mitiga con cobertura visible +
  aviso honesto. En PWA instalada real puede concederse — se revalida en el gate de tablet.
  OPFS disponible (`getDirectory`) pero descartado (sin ganancia para blobs pequeños).
- [ ] Bucle de retroalimentación parlante→mic: **spike de F1 (1a)** — pausa del meter durante
      playback (aún por medir/validar).

## Deltas del kit aplicados (F0)

| Delta                                         | Archivo(s)                                                            | Estado             |
| --------------------------------------------- | --------------------------------------------------------------------- | ------------------ |
| v1.6.2 gate de arranque                       | `.claude/commands/plan-sprint.md` (paso 7+8) + `CLAUDE.md` § Apertura | ✅                 |
| v1.6.3 carnada canónica                       | `CLAUDE.md` regla 6 (partida, verificada)                             | ✅                 |
| v1.6.4 e2e con BD real                        | `.claude/skills/testing-patterns.md` (documental — habla no tiene BD) | ✅                 |
| v1.7.1 Cierre de CICLO + publicación regla 10 | `CLAUDE.md` § Workflow + regla 9 (design gate)                        | ✅ (listo para S4) |
| v1.7.2 reglas 6-8 + Lighthouse solo públicas  | `.claude/skills/testing-patterns.md` + `README.md`                    | ✅                 |

## Desviación del plan

- **`src/lib/` en vez de `src/engine/`:** la orden lista `src/engine/{banco-voz,gemelas}/…`; el
  repo usa `src/lib/` por convención (CLAUDE.md § Estructura). Se sigue la convención del repo
  (`src/lib/banco-voz/`, `src/lib/gemelas/`, `src/lib/audio/`). Desviación de forma, no de fondo.
- **(Declaradas en el remate de auditoría, 2026-07-19 — debieron declararse al construir):**
  - **El catálogo grabable NO incluye los guiones de GuionCard ni las invitaciones** (el plan los
    listaba): son texto dirigido AL PADRE — grabarlos no le modela nada al niño. La regla que
    quedó: al catálogo solo entra texto FIJO con un sitio real de reproducción dirigido al niño.
  - **La "cápsula de Hoy" no tiene altavoz** (el plan lo proponía): la línea del día cambia entre
    50 cápsulas → texto VARIABLE → no grabable, la misma regla de honestidad que las
    celebraciones con cifras.
  - **6 pares gemelos, no ~8-10** (estimación del plan): 6 contrastes con valor fonológico real
    superan el mínimo del schema (≥6); calidad sobre relleno. El gate de contenido del usuario
    puede pedir más.
  - **El lote guiado prioriza por TEMAS pero no filtra por etapa** (el plan decía "por etapa
    activa"): hoy es cosmético — el catálogo es casi todo palabras y los pares gemelos son todos
    de "palabras-sueltas" (el default permanente). Se paga en el S4 junto al progreso honesto.

## Fricción de kit / entorno (K#) — separada del producto

- **K-habla-6 (entorno, no kit): desync harness ↔ disco en la sesión larga.** Esta sesión abarca
  S2 entero + S3; el repo evolucionó bajo el harness. Durante F0, la herramienta Read/tail mostró
  versiones **fantasma** de CLAUDE.md / command / skill / README (con deltas que el disco no tenía,
  o con line-numbers desalineados), mientras `git status` y `gitleaks` (que leen disco) mostraban
  otra cosa. Se resolvió tratando **Bash/git como única verdad**: re-Read fresco + `grep` de disco
  antes y después de cada edición. Lección para sprints largos: no confiar en la caché de archivos
  del harness tras muchos turnos; verificar en disco. Sin impacto en el producto (todo quedó
  correcto en disco: 5 deltas presentes, gitleaks limpio).

## Hallazgos de F1 (motores)

- **Almacén: se guarda ArrayBuffer, no Blob.** El primer diseño guardaba el `Blob` directo en
  IndexedDB y fallaba en los tests: el `Blob` de jsdom NO sobrevive el structured-clone de forma
  portable. Se guarda el `ArrayBuffer` (universal) + el `mimeType`, y el `Blob` se reconstruye al
  leer. Patrón estándar para audio en IndexedDB; robusto en todo entorno. Conexión IndexedDB
  cacheada (una viva por sesión): abrir/cerrar por operación carreaba con las transacciones.
- **El bucle de retroalimentación NO es medible con el mic fake** (hallazgo importante): el
  micrófono falso de Playwright es un ARCHIVO, no el micrófono del sistema — reproducir audio por
  los parlantes NO retroalimenta la captura. Por eso el e2e solo puede verificar que la **guarda
  está cableada** (el meter ignora frames mientras suena el banco), no medir el eco real. La
  medición real del bucle es **ítem de gate de tablet** (acumulado). La guarda se implementa en
  `use-voice-session` (F2) y se prueba su cableado en e2e (F3).
- **Candados de privacidad del banco — fuga inyectada VERIFICADA (3ª vez):** se metió un
  `fetch("https://analytics…/voz")` real en `almacen.ts`. Candado 1 (ESLint scoped a
  `banco-voz/**` + `audio/**`): `error Unexpected use of 'fetch'. Regla dura 2-bis…`. Candado 2
  (`privacidad-banco.test.ts`): `× almacen.ts usa fetch (red)`. Revertida; ambos verdes.
  **Diferencia con el motor de voz:** aquí storage SÍ se permite (es el banco); lo prohibido es la
  RED. `borrarTodo` extendido a IndexedDB (o "borrar mis datos" mentiría — unit lo cubrirá en F3).
- **Gemelas:** 6 pares mínimos es-CO con valor terapéutico (p/g · vocal a/o · f/b · k/t · l/k ·
  g/b). 9 pictos nuevos ARASAAC bajados con `scripts/descargar-gemelas.mjs` (no destructivo, no
  toca los 41 del lote principal). **Su calidad visual es parte del gate de contenido del usuario.**
- **139 unit verdes** (de 110): gemelas (11) + banco-voz (12) + privacidad-banco (6).

## Hallazgos de F2 (UI)

- **F2a — gemelas + selector:** juego sin micrófono (`/jugar/gemelas`), 4ª tarjeta en el selector
  (grid `sm:grid-cols-2`, comentario COGA 3→4 actualizado), `CelebracionHonesta` extendida con el
  caso `gemelas`. La cáscara visual NO reusó `MarcoJuego` (asume fases de mic): gemelas es co-uso
  puro, guion→ronda→celebración propio.
- **F2b — estudio `/estudio`:** shell server estático + cliente con dos vistas (gestión con
  cobertura por categoría / lote guiado 5 estados). `useGrabadora` encapsula MediaRecorder
  (estados inactivo→pidiendo-permiso→grabando→denegado/error). Fix React 19: el lote se fija con
  `useMemo(…, [])` (no `useRef` leído en render — "Cannot access refs during render"). Copy
  explícito: **"La voz de tu hijo nunca se graba."**
- **F2c — la voz de la familia suena en los juegos (O2):**
  - **Guarda del bucle** cableada en `use-voice-session` (`silenciar(ms)` → el meter descarta
    frames `performance.now() < silenciarHastaRef` + 300 ms de cola). Dormante hasta que algo la
    llama; la reproducción de voz familiar la dispara con la duración de la grabación.
  - **Hook compartido `use-voz-familiar`**: resuelve con el `resolverFuente` PURO
    (toggle `vozFamiliar` × ¿hay grabación?), reproduce con `new Audio(URL.createObjectURL)` +
    revoke, avisa a `silenciar` ANTES de sonar, y emite el evento `voz-familiar:sono` (id, sin
    audio) como sonda para el e2e de F3. Fallback silencioso siempre: sin grabación, no-op.
  - **palabra↔objeto:** autoplay de la palabra al aparecer un dibujo nuevo + **botón altavoz
    ≥64 px** (el niño lo puede tocar). Las frases honestas que ya estaban en pantalla ("¡Le salió
    la voz!" / "¡Dijo la palabra!") ahora TAMBIÉN suenan en la voz familiar — son exactamente las
    celebraciones del catálogo, así que la app solo dice en voz alta lo que de verdad pasó.
  - **gemelas:** altavoz ≥64 px en cada picto del par (modela la pareja mínima). Sin micrófono →
    sin guarda del bucle que hacer.
  - **Decisión honesta:** la pantalla final de celebración (`CelebracionHonesta`) NO reproduce voz
    — sus titulares llevan cifras ("¡Su voz sonó 7,3 s!") y NO son grabables (el número cambia). La
    voz familiar suena solo donde hay una frase FIJA grabable. Se documenta en el manual (F4).
  - Limpieza: eliminado el import `type Etapa` sin usar en `schemas.ts` → **lint 0 warnings**.
  - 139 unit verdes intactos; typecheck y build limpios. La integración (que el picto suene, que
    la voz NO encienda el dibujo) se prueba POR LA UI en F3 (e2e `voz-familiar.spec.ts`).

## Hallazgos de F3 (integración + e2e) — 103 e2e verdes (de 89)

- **`estudio.spec.ts` (2):** grabar con el mic falso → escuchar → aceptar → la cobertura sube y lo
  grabado aparece en "lo que ya grabaste" (aserción al resultado OBSERVABLE, regla 8). Estado
  mic-denegado forzado sobrescribiendo `getUserMedia` (con `--use-fake-ui-for-media-stream` no hay
  diálogo real que rechazar → único camino honesto).
- **`voz-familiar.spec.ts` (3):** el picto ofrece y dispara la voz (autoplay + altavoz ≥64 px,
  `data-fuente-voz=familiar`, evento `voz-familiar:sono`) · el toggle de Ajustes la silencia POR LA
  UI · sin grabación, fallback limpio (sin altavoz). Se inyecta la grabación directo en IndexedDB
  con la forma real (`{datos:ArrayBuffer, mimeType, duracionMs, fecha}`) y se apoya en que el mazo
  de pictos es DETERMINISTA por semilla (misma palabra tras recargar — se asevera). **El eco
  parlante→mic sigue sin ser medible con el mic falso** (ítem de gate de tablet). ~~El e2e prueba
  el CABLEADO~~ — **corrección del remate (2026-07-19): esta línea sobre-afirmaba.** En F3 NINGÚN
  test tocaba la guarda (ni unit ni e2e); el cableado quedó blindado recién en el remate
  (`use-voice-session.test.tsx` + e2e del WAV real). Declarar cobertura que no existe es
  exactamente lo que la auditoría existe para cazar.
- **`gemelas.spec.ts` (2):** partida completa (padre marca 6 rondas → celebración honesta "6
  rondas" → registro `habla:v1:gemelas` con 6 juicios) y saltar sin castigo. **Sonda de
  `getUserMedia` = 0**: gemelas jamás abre el micrófono (regla dura 2).
- **`privacidad-cero-red` (+1):** grabar Y reproducir en el estudio = cero tráfico cross-origin
  (banco 100 % local, regla dura 2-bis).
- **`a11y` (+2 rutas × 2 temas):** `/estudio` y `/jugar/gemelas` con axe limpio en claro y oscuro.
- **Regresión cazada (lección):** `selector-juegos.spec.ts` seguía aseverando "exactamente 3
  juegos" — F2a metió la 4ª tarjeta (gemelas) pero NO corrió la suite entera, así que el e2e quedó
  mintiendo hasta F3. Corregido a 4 (+ que gemelas dice "no usa micrófono"). **Lección: toda UI que
  toca una pantalla ya cubierta por e2e corre la suite ENTERA en su fase, no al cierre.**
- **Reglas 6-8 de testing aplicadas:** sin `import.meta.url` en specs · sondas de eventos/estado
  vía `page.evaluate`/`addInitScript` (no `getByRole("alert")` desnudo) · el interruptor
  `toggle-voz-familiar` se opera con `.click()` y la aserción va al resultado (el altavoz que
  desaparece), no al `aria-checked`.

## Hallazgos de F4 (calidad y cierre)

- **Guía v3 (bola de nieve) — transform verificado.** El v2 tenía **79 chips** (la orden decía 81;
  se hereda lo que existe, entero). Se transformó con un script Python con **aserciones de conteo**
  (falla ruidoso si un ancla no existe) en vez de ediciones a mano sobre 714 líneas: hereda los 79
  ENTEROS re-etiquetados como regresión (o-s2 pasa de verde a apagado; ya no "Nuevo · S2"), agrega
  20 pruebas nuevas (bloques J/K/L/M + 3 de tablet) y marca D1 como "Mejorado en S3" (selector 3→4).
  Validado: tags balanceados (14 section, 116 li), 0 errores de parseo, **ningún v2 perdido** (diff
  vacío contra el backup), gate ⭐ = 17. localStorage v2→v3 (arranca en limpio para el gate del S3).
- **diseno-ui auto-review:** ajuste de cumplimiento — el press del altavoz animaba un `scale`; se
  guardó con `motion-reduce:transition-none` en los dos altavoces (regla 4). Touch ≥64 px (e2e lo
  mide), paleta dual, 5 estados del estudio, es-CO. Falta la aprobación visual del usuario.
- **`/deploy-check` — verdicto MERGE OK (con el gate del usuario pendiente):**
  - Tests: 139 unit + 103 e2e verdes · cobertura motores 90 %/83 %.
  - Type safety: `tsc` limpio · sin `@ts-ignore` nuevos.
  - Lint: **0 warnings** (se quitó el `type Etapa` sin usar heredado del S2).
  - Build: compila · rutas nuevas `/estudio` y `/jugar/gemelas` estáticas · "/" sin tocar.
  - Seguridad: `pnpm audit --audit-level high` limpio (1 moderate transitivo `postcss` vía
    next/sentry — dep de build, bajo el umbral, no explotable aquí) · cero secrets (gitleaks cada
    commit) · candado triple con fuga inyectada (3.ª vez).
  - A11y: axe 8 rutas × 2 temas × 2 dispositivos · teclado · reduced-motion.
  - Docs: manual + guía v3 al día · ADR-010 · bitácora · summary generado.
  - Lighthouse: lo corre la CI contra `perf-budget.json` (8 rutas) — no bloquea local.

## Remate de auditoría final (2026-07-19) — branch `fix/s3-remate`

Auditoría de dos fases pedida por el usuario ANTES del cierre formal (Fase 1 solo-lectura →
aprobada → Fase 2 con plan validado). Hallazgos Alto pagados + Medios aprobados. **150 unit +
107 e2e verdes** tras el remate.

- **A-1 · Las consignas suenan de verdad (O2 completo y honesto):** altavoz ≥64 px en el globo
  (`consigna:aaah`) y el cohete (`consigna:sirena`) vía `AltavozConsigna` compartido, SIEMPRE con
  la guarda (`useVozFamiliar({alSonar: silenciar})`). `consigna:nombra` RETIRADA del catálogo
  (dirigida al padre, sin sitio de reproducción — pedir grabar lo que jamás sonará es deshonesto).
  Cortes del plan declarados arriba (§ Desviación).
- **A-2 · La guarda del bucle, blindada tres veces:** motor puro `lib/voice/guarda-bucle.ts`
  (solapes acumulan, `silenciar(0)` cancela) + **test de integración** del hook con mic mockeado
  (se cae si alguien borra la línea que descarta frames) + **e2e con WAV real** (el clip suena al
  cambiar de dibujo y el dibujo NO se enciende hasta que llega voz NUEVA del micrófono).
  **ADR-010 → accepted** (su condición era exactamente esto).
- **A-3 · "Borrar mis datos" garantizado:** `eliminarBanco()` y `borrarTodo()` awaitables; la
  navegación espera el borrado real (tope de gracia 2 s). Unit: guardar → borrar → el banco
  reabre VACÍO. Antes, la recarga podía ganarle la carrera al `deleteDatabase` encolado.
- **A-4 · HALLAZGO NUEVO en la implementación del remate (defecto S2 latente, regla dura 3):**
  `sostenidoMs` acumula TODO el intento y el escenario lo comparaba crudo contra los 250 ms →
  tras la primera vocalización, **cada dibujo siguiente se encendía SOLO** (con la voz del
  anterior) e inflaba el contador de activaciones. Arreglo: **ancla de voz NUEVA por dibujo**
  (baseline de sostenido al aparecer cada picto, re-anclada si el intento se reinicia). El e2e
  del WAV real lo cubre; sin este arreglo, el e2e de la guarda era inescribible (el dibujo se
  encendía por la voz vieja, no por el eco).
- **El candado del S1 cazó al remate:** montar `useVozFamiliar` en globo/cohete hacía que
  `listarIds()` CREARA la base `habla-banco-voz` vacía solo por preguntar — y el e2e "cero rastro
  en el almacenamiento durante el juego" (S1) falló. Arreglo: `bancoExiste()` con
  `indexedDB.databases()` — las operaciones de lectura jamás crean la base; solo
  `guardarGrabacion` puede. **El candado viejo protegiendo al código nuevo: así deben funcionar.**
- **M-1 · Resiliencia IDB:** `.catch` en las tres cargas (`/estudio` ya no se queda en esqueleto
  eterno si IndexedDB no abre; juega/gestiona como banco vacío) + `abrir()` no cachea promesas
  rechazadas (unit del reintento).
- **M-2 · play() fallido cancela la guarda** (`silenciar(0)`): un autoplay bloqueado ya no deja
  al juego sordo a la voz real del niño.
- **Deuda que el remate NO paga (declarada, S4):** tests de componente del estudio (Testing
  Library) — el de integración del hook paga la parte crítica de la DoD; duplicaciones
  `barajar`/`fechaHoy`/`reproducir`; unit del cap-500 de gemelas; revoke de ObjectURL al navegar
  a mitad de clip; lote-por-etapa (arriba). El eco ACÚSTICO real sigue siendo ítem de tablet.
