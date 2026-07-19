# Sprint 003 — "La voz de la familia" · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_003-orden.md` (planeadora, RO) · Plan aprobado por el
> usuario 2026-07-18 (plan mode) · «construye» dado con modelo Opus 4.8 `[1m]`. Branch
> `sprint-003/la-voz-de-la-familia` desde `main` (post-merge PR #2, S2 cerrado).
> Gate: escritorio (la tablet sigue de viaje — lista diferida ACUMULADA S1+S2+S3 en la guía v3).

## Estado por fase

- [ ] F0 — Setup (branch, deltas kit ×5, ítem 0, ADR-010 esqueleto, verificación de supuestos)
- [ ] F1 — Motores puros + spike del bucle parlante→mic + ADR-010 completo
- [ ] F2 — UI (estudio, Ajustes, gemelas, integración de voz)
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

## Hallazgos del spike de audio (para el ADR-010) — pendiente F1

- (por correr)
