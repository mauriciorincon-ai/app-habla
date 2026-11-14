---
sprint: 009
app: habla
hito: H-2
opened: 2026-11-12
closed: 2026-11-13
branch: sprint-009/cuentos-de-casa
pr: 20
---

# Sprint 009 «Cuentos de casa» — cierre ejecutivo

- **Objetivo / resultado:** cuentos hechos para él (biblioteca `{es,en}` + lotes por la bandeja de IA con aprobación del adulto, narración con su voz o «leer yo»), contacto visual en «Hoy» y deuda del S8 pagada. **Completo.** Las 17 del MVP quedan construidas.
- **Tiempo:** estimado 3,75 h · real (`node scripts/horas-sprint.mjs`, 12 commits, 2 sesiones): **1,8 h activas** (F1 0,6 · F2 0,6 · F3 0,6; este cierre suma un commit) · diferencia **−1,95 h**; ninguna fase pasó el +50 %.
- **Modelo por fase:** F1 Sonnet 5.5 · F2 Opus 5.5 (reglas 1 y 2-bis) · F3 Sonnet 5.5; auditor Sonnet 5.5 high. Sin desvío. **Relevos: 0.**
- **Tokens:** 3 subagentes: Explore (Haiku) F1 ≈144 k, Explore (Haiku) F2 ≈93 k, auditor Sonnet ≈159 k. `/compact` pedidos y hechos: 2 (F1→F2, F2→F3), más `/model` por fase.
- **Entregables:** ADR-019 · `content/cuentos.ts` (6 cuentos) · `src/lib/{cuentos,bandeja}` con `CONTRATO.lock` y carnadas C01–C06 · skill `/bandeja` · `/estudio/cuentos` y `/cuentos` · «Hoy» con dos dominios · pares EN 9→12 · manual ES/EN, guía «Nuevo · S9», brochure 26 y BLUEPRINT. `privado/` ignorado y con test.
- **Decisión «1a»:** el pedido lleva solo `intereses` y `palabrasMeta` (esquema `.strict()`, sin cifras, y ahora con el gate de sensibilidad); un test falla ante cualquier campo más.
- **Corrida de `/bandeja`** con un perfil inventado, todo en `privado/` (no versionado): pedido «tomado», lote de 4, validador **4 de 4**.
- **Fichas EN (56):** 48 OK; 8 corregidas: a.ts:30, a.ts:158, b.ts:115, c.ts:168, d.ts:114, d.ts:248, d.ts:266, d.ts:314.
- **Skills del kit con texto cambiado (para el checkpoint):** `diseno-ui`, `ia-embebida`, `security-owasp`.
- **Desviaciones:** (1) pares EN: la orden decía 10, el código tenía 9 → +3 para 12+12; (2) id de narración EN `cuento-en:` y, tras la auditoría, con huella del texto de la página (`cuento:<id>:<n>:<huella>`); (3) las huellas del gate viajan en un chunk perezoso (datos ya públicos); (4) la narración no cuenta en la cobertura de Estudio ni en Ajustes; (5) los gustos se escriben en un solo idioma.
- **Auditoría** (Sonnet 5.5 · high, una pasada; veredicto inicial «requiere ajustes», 9 hallazgos, todos pagados):
  - Alcance: A-1 manual EN sin S9 — pagado · ef31163.
  - Calidad: M-1 grabación desfasada del texto — pagado · 3645324 · M-2 retirar/quitar y aviso de lista llena — pagado · 3645324 · M-3 pedido sin gate — pagado · 3645324 · B-1 «points» — pagado · 3645324 · B-2 gate sin huellas — pagado · 3645324 · B-3 import sin `.catch` — pagado · 3645324 · B-4 «cuatro páginas» — pagado · ef31163.
  - Seguridad y privacidad: sin hallazgos (sin secretos; cero enlaces; sin red en cuentos).
  - Frases caducadas: B-5 README «no hay IA en la app» — pagado · ef31163.
- **Verificación:** unit 708/708 · lint y typecheck limpios · e2e cuentos + axe + cero red + contacto visual 74/74 (móvil y escritorio) · `pnpm build` ok · capturas leídas como imagen (Hoy, Ajustes, Cuentos adulto y niño; claro y oscuro; móvil y escritorio).
- **CI:** el primer `e2e` falló 2 pruebas de `conoce.spec.ts` (el pie esperaba «25 funcionalidades»; el brochure ya dice 26): causa mía, test y comentarios actualizados — pagado · ver el último commit.
- **Servidores:** `lsof` LISTEN en este repo: 0 (solo el test-server de Playwright de VS Code); planlang en 3200 es de otra app, no se tocó.
- **Sensibilidad:** 0 coincidencias en lo que vigila el gate (30 en 8 bitácoras de `sprints/`, fuera del alcance).
- **Deuda (solo lo imposible):** `CLAUDE.md:85` y `CLAUDE.md:130` dicen «cuando lleguen los cuentos por lotes»: es copia de la orden de la planeadora y no se edita aquí. Decisión del dueño: **pendiente de su respuesta (ver STOP, pregunta 1)**.
- **Aprendizajes:** el conteo de la orden no era el del código; atar la narración al texto evita que una voz vieja lea otra frase; «una-estrofa-mas» usa canciones en inglés.
- **Recomendación:** ensayo general del dueño con la guía; después, S10 (`roadmap: [dijo-la-palabra, la-voz-dibujada-con-mas-detalle]`).
- **Para mergear:** squash y borrar la rama; después `/cierre-sprint habla`. Tras el merge, re-vaciar el homepage del repo (regla 17).
