---
sprint: 017
app: habla
hito: H-2
opened: 2026-11-16
closed: 2026-11-16
branch: sprint-017/al-dia
pr: (se llena al abrir el PR)
---

- **Nombre / objetivo:** «Al día» — mantenimiento sin funcionalidad: CLAUDE.md del núcleo al día, Next y su lint en 16.4.6, auditoría de dependencias en 0 con solo parches y menores.
- **Resultado / estado:** construido y auditado, PR listo; el merge es del dueño.
- **Tiempo:** estimado 1,5 h · real **0,5 h** (`horas-sprint.mjs`, antes del commit de este cierre; salida abajo) · diferencia −1,0 h (−67 %). La heurística cuenta solo commits; el trabajo de sesión fue mayor (verificación completa de F1).

```
### Horas del sprint (`scripts/horas-sprint.mjs`, rango `origin/main..HEAD`)
| Commits | Sesiones | Horas activas | Span |
| 2 | 1 | 0,5 h | 2026-11-16 18:32 → 2026-11-16 18:32 (0,0 h) |
| Fase | Commits | Horas activas |
| F1 | 2 | 0,5 h |
```

- **Fases y horas:** F1 (núcleo + deps + verificación) 0,5 h por script; F2 (auditoría, cierre, PR) sin commits de código antes del cierre.
- **Entregables:**
  - `CLAUDE.md` = la orden de la planeadora (`cmp` = 0).
  - `next` y `eslint-config-next` 16.4.6.
  - Candados: `fast-uri@3` → 3.1.9, `uuid@11` → 11.1.1 (`pnpm-workspace.yaml`, con comentario fechado).
  - Ramas locales: borradas las 5 de §1, cada una con PR MERGED (#18, #21, #22, #24, #29).
- **No completado:** nada del alcance. Lo que el sprint no toca, no se toca: motores, detectores, umbrales, reconocedor, CSP, la otra casa, VISION, lista de términos.
- **Desviaciones y causas:** ninguna de alcance. Dos tropiezos de herramienta sin efecto en el repo: zsh no separa variables en lhci/loops (se reejecutó con `bash -c`), y `timeout` no existe en macOS (e2e en background).
- **Decisiones (mías, con default):**
  - Glob y minimatch (moderadas) vienen de `@sentry/bundler-plugins`, build-time. Solo se corrigen con mayor (`glob` ≥ 14.0.2, `minimatch` ≥ 11.0.1; `@sentry/nextjs` 11.x). **Default: no subir.** Pregunta al dueño en el STOP.
- **Deuda:** glob y minimatch, `pnpm-workspace.yaml` (candados existentes) · decisión del dueño: subir a mayor o aceptar la moderada de build-time.
- **Verificación:**
  - `typecheck`, `lint`, unit (statements 93,64 %) en verde; `pnpm build` sin avisos.
  - e2e `CI=1`: 406 de 406 (4,5 min).
  - Lighthouse: 14 URLs × 3 corridas, presupuesto de script 354 KB, exit 0.
  - `sensibilidad-informe`: «Sin coincidencias ni edades en 494 archivo(s)»; `sensibilidad.test` 996 passed.
  - `cero-enlaces`: «árbol limpio (9 dominios) · homepage limpia (propio repo)».
- **Auditoría (un auditor Sonnet, solo lectura):**
  - Alcance: Completo.
  - Calidad: sin hallazgos.
  - Seguridad y privacidad: sin hallazgos.
  - Frases caducadas: ninguna; la única «16.4.3» del repo es el comentario histórico fechado de `pnpm-workspace.yaml:34`.
  - Veredicto: **listo para cierre**. Hallazgos a pagar: 0.
- **Audit de dependencias:** antes 9 (7 moderate + 2 low) · después 2 (moderate: glob, minimatch vía `@sentry/bundler-plugins`, pendientes de mayor).
- **Modelo por fase y desvío:**
  - F1: Sonnet 5.5 · medium (modelo que corrió F1 según el registro de la sesión).
  - F2: Sonnet 5.5 para la auditoría; el cierre con Haiku 5.5 · low (`/model haiku`, confirmado).
- **Relevos:** ninguno.
- **Gate de modelo y compact:** se pidió 1 `/compact` (F1 → F2), confirmado por el dueño.
- **Checklist de despliegue (`/deploy-check`):** 1 preview n/a hasta abrir PR (se verifica en CI/Vercel); 2 n/a (sin flujos visibles); 3 n/a (sin features); 4 este cierre; 5 cero enlaces OK; 6 auditoría pagada (0 hallazgos); 7 n/a (sin aprovisionamiento); 8 checks leídos al final; 9 n/a; 10 n/a.
- **Servidores al STOP:** `lsof` LISTEN en este repo: 0.
- **Gate de sensibilidad:** 0 coincidencias en lo que vigila (494 archivos).
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla` en la planeadora.
