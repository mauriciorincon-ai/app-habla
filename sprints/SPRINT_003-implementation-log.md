# Sprint 003 — "La voz de la familia" · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_003-orden.md` (planeadora, RO) · Plan aprobado por el
> usuario 2026-07-18 (plan mode) · «construye» dado con modelo Opus 4.8 `[1m]`. Branch
> `sprint-003/la-voz-de-la-familia` desde `main` (post-merge PR #2, S2 cerrado).
> Gate: escritorio (la tablet sigue de viaje — lista diferida ACUMULADA S1+S2+S3 en la guía v3).

## Estado por fase

- [x] F0 — Setup (branch, deltas kit ×5, ítem 0, ADR-010 esqueleto, verificación de supuestos)
- [x] F1 — Motores puros + candados + gemelas + banco de voz (139 unit verdes)
- [x] F2 — UI (estudio, Ajustes, gemelas, integración de voz) — a: selector+gemelas · b: estudio · c: voz en los juegos
- [ ] F3 — Integración + e2e (mic fake, cero-red, axe)
- [ ] F4 — Calidad y cierre (guía v3, manual, summary, deploy-check, PR)
- [ ] **Gate del usuario** (escritorio) → merge → `/cierre-sprint habla` (o difiere según F0 #6)

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
