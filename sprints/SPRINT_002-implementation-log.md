# Sprint 002 — "Cada día más" · Bitácora de implementación

> Orden: `portafolio/habla/ordenes/SPRINT_002-orden.md` (planeadora, RO) · Plan aprobado por el
> usuario 2026-07-12 (plan mode). Branch `sprint-002/cada-dia-mas` desde `main` (post-merge PR #1).
> Gate: escritorio (la tablet sigue de viaje — lista diferida ACUMULADA S1+S2 en la guía).

## Estado por fase

- [x] F0 — Setup (branch, kit-check, bitácora, ADRs propuestos)
- [ ] F1a — Motor de etapas (schema + storage v2 + migración + filtro) con units
- [ ] F1b — Spike pitch (YIN worklet + pitch-tracker + WAV barrido + /spike/audio) → PR draft
- [ ] F1c — Biblioteca ≥45 cápsulas por etapa
- [ ] F1d — Lote ARASAAC + manifest con units
- [ ] F2 — UI (selector, cohete, palabra↔objeto, etapa en Ajustes/Hoy, atribución)
- [ ] F3 — Integración + e2e
- [ ] F4 — Calidad y cierre (manual, guía viva, /deploy-check, summary)

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

- (pendiente F1b)

## Decisiones tomadas durante la construcción

- (se registran aquí conforme aparezcan)
